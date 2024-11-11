<script setup>
import {infoStore} from '@/store/store.js'
import {onMounted, reactive} from "vue"
import axiosUtilObj from "@/utils/axios.js"
import timeUtilObj from '@/utils/time.js'
import {ElMessage} from "element-plus";

const store = infoStore()

const data = reactive({
  hasDoRequestList: [],
  toDoRequestList: [],
  senderNameMap: new Map(),
})

onMounted(async () => {
  let requestList = await axiosUtilObj.postToken("/api/auth/chatroom/getRequestList", store.data.token, null)
  if (requestList.data !== undefined) {
    for (let i = 0; i < requestList.data.length; i++) {
      let obj = {
        name: '',
        avatarPath: '',
      }
      if (requestList.data[i].type === '1' && requestList.data[i].finish === '0') {
        let group = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupById", store.data.token, {id: requestList.data[i].groupId})
        if (group.data.name === '') {
          obj.name = 'have deleted'
        } else {
          obj.name = group.data.name
        }
        if (group.data.avatar === '') {
          obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/0.png}`
        } else {
          obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/${group.data.avatar}`
        }
        data.toDoRequestList.push(requestList.data[i])
        data.senderNameMap.set(requestList.data[i].id, obj)
      } else if (requestList.data[i].type === '1' && requestList.data[i].finish === '1') {
        let group = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupById", store.data.token, {id: requestList.data[i].groupId})
        if (group.data.name === '') {
          obj.name = 'have deleted'
        } else {
          obj.name = group.data.name
        }
        if (group.data.avatar === '') {
          obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/0.png`
        } else {
          obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/${group.data.avatar}`
        }
        data.hasDoRequestList.push(requestList.data[i])
        data.senderNameMap.set(requestList.data[i].id, obj)
      } else if (requestList.data[i].type === '0' && requestList.data[i].finish === '0') {
        let user = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: requestList.data[i].userId})
        obj.name = user.data.username
        obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${user.data.id}`
        data.toDoRequestList.push(requestList.data[i])
        data.senderNameMap.set(requestList.data[i].id, obj)
      } else if (requestList.data[i].type === '0' && requestList.data[i].finish === '1') {
        let user = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: requestList.data[i].userId})
        obj.name = user.data.username
        obj.avatarPath = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${user.data.id}`
        data.hasDoRequestList.push(requestList.data[i])
        data.senderNameMap.set(requestList.data[i].id, obj)
      }
    }
  }
})

const acceptReq = async (row) => {
  if (row.type === '0') {
    let res = await axiosUtilObj.postToken("/api/auth/chatroom/addFriend", store.data.token, {
      id: row.userId,
    })
    if (res.code === '100') {
      ElMessage({
        message: "You're friends now. Let's go chat!",
        type: 'success',
      })
    }
  } else if (row.type === '1') {
    let res = await axiosUtilObj.postToken("/api/auth/chatroom/enterGroup", store.data.token, {
      id: row.groupId,
    })
    if (res.code === '100') {
      ElMessage({
        message: "You have entered group. Let's go chat!",
        type: 'success',
      })
    }
  }
  await axiosUtilObj.postToken("/api/auth/chatroom/handleRequest", store.data.token, {
    id: row.id,
    result: '1',
  })
  let index = data.toDoRequestList.indexOf(row)
  data.toDoRequestList.splice(index, 1)
  row.finish = '1'
  row.result = '1'
  data.hasDoRequestList.push(row)
}

const rejectReq = async (row) => {
  await axiosUtilObj.postToken("/api/auth/chatroom/handleRequest", store.data.token, {
    id: row.id,
    result: '0',
  })
  let index = data.toDoRequestList.indexOf(row)
  data.toDoRequestList.splice(index, 1)
  row.finish = '1'
  row.result = '0'
  data.hasDoRequestList.push(row)
}
</script>

<template>
  <el-tabs type="border-card">
    <el-tab-pane label="Pending">
      <el-table :data="data.toDoRequestList" style="width: 100%;height: 520px;">
        <el-table-column label="No">
          <template #default="scope">
            {{ scope.$index }}
          </template>
        </el-table-column>
        <el-table-column label="Type">
          <template #default="scope">
            <el-text v-if="scope.row.type === '1'">Group</el-text>
            <el-text v-if="scope.row.type === '0'">Friend</el-text>
          </template>
        </el-table-column>
        <el-table-column label="SenderAvatar">
          <template #default="scope">
            <el-avatar style="vertical-align: middle" shape="square"
                       :src="data.senderNameMap.get(scope.row.id).avatarPath"/>
          </template>
        </el-table-column>
        <el-table-column label="SenderId">
          <template #default="scope">
            <el-text v-if="scope.row.type === '1'">{{scope.row.groupId}}</el-text>
            <el-text v-if="scope.row.type === '0'">{{scope.row.userId}}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="SenderName">
          <template #default="scope">
            <el-text>{{ data.senderNameMap.get(scope.row.id).name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="Remark" max-width="100">
          <template #default="scope">
            <el-tooltip
                effect="dark"
                :content="scope.row.remark"
                placement="top"
            >
              <el-text truncated>{{scope.row.remark}}</el-text>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="Time" min-width="100">
          <template #default="scope">
            <el-text>{{timeUtilObj.StrToFormatDate(scope.row.createdAt)}}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="Operation" min-width="100">
          <template #default="scope">
            <el-button type="success" size="small" @click="acceptReq(scope.row)">Accept</el-button>
            <el-button type="danger" size="small" @click="rejectReq(scope.row)">Reject</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane label="Processed">
      <el-table :data="data.hasDoRequestList" style="width: 100%;height: 520px;">
        <el-table-column label="No">
          <template #default="scope">
            {{ scope.$index }}
          </template>
        </el-table-column>
        <el-table-column label="Type">
          <template #default="scope">
            <el-text v-if="scope.row.type === '1'">Group</el-text>
            <el-text v-if="scope.row.type === '0'">Friend</el-text>
          </template>
        </el-table-column>
        <el-table-column label="SenderAvatar">
          <template #default="scope">
            <el-avatar style="vertical-align: middle" shape="square"
                       :src="data.senderNameMap.get(scope.row.id).avatarPath"/>
          </template>
        </el-table-column>
        <el-table-column label="SenderId">
          <template #default="scope">
            <el-text v-if="scope.row.type === '1'">{{scope.row.groupId}}</el-text>
            <el-text v-if="scope.row.type === '0'">{{scope.row.userId}}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="SenderName">
          <template #default="scope">
            <el-text>{{ data.senderNameMap.get(scope.row.id).name }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="Remark" max-width="100">
          <template #default="scope">
            <el-tooltip
                effect="dark"
                :content="scope.row.remark"
                placement="top"
            >
              <el-text truncated>{{scope.row.remark}}</el-text>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="Time" min-width="100">
          <template #default="scope">
            <el-text>{{timeUtilObj.StrToFormatDate(scope.row.createdAt)}}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="Result">
          <template #default="scope">
            <el-text type="success" v-if="scope.row.result === '1'">Acceptance</el-text>
            <el-text type="danger" v-if="scope.row.result === '0'">Rejection</el-text>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>

</style>