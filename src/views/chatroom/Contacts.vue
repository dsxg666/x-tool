<script setup>
import {infoStore} from '@/store/store.js'
import {reactive, onMounted, ref, computed} from "vue";
import axiosUtilObj from "@/utils/axios.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from 'vue-router'
import localStoreUtilObj from "@/utils/localstore.js";
import {InfoFilled} from '@element-plus/icons-vue'

const store = infoStore()
const router = useRouter()

const data = reactive({
  friendDetailList: [],
  friendStatusList: [],
})

const search = ref('')

const filterTableData = computed(() =>
    data.friendDetailList.filter(
        (data) =>
            !search.value ||
            data.username.toLowerCase().includes(search.value.toLowerCase())
    )
)


onMounted(async () => {
  let friendList = await axiosUtilObj.postToken("/api/auth/chatroom/getFriendList", store.data.token, null)

  if (friendList.data !== undefined) {
    for (let i = 0; i < friendList.data.length; i++) {
      let friendId = friendList.data[i].friendId
      let status = await axiosUtilObj.postToken("/api/auth/chatroom/isOnline", store.data.token, {id: friendId})
      data.friendStatusList.push(status.data)
    }
  }

  if (friendList.data !== undefined) {
    for (let i = 0; i < friendList.data.length; i++) {
      let friendId = friendList.data[i].friendId
      let friendDetail = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: friendId})
      friendDetail.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${friendId}`
      data.friendDetailList.push(friendDetail.data)
    }
  }
})

const toAddFriendId = ref('')

const addFriend = async (remark) => {
  let friendId = toAddFriendId.value
  if (friendId === '') {
    ElMessage({
      message: "Warning, UserId can't be empty.",
      type: 'warning',
    })
  } else {
    openAddBox()
  }
}

const openAddBox = () => {
  ElMessageBox.prompt('Please input your remark', 'Remark', {
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
    inputPattern: /^.{1,50}$/,
    inputErrorMessage: 'Remark must be 1~50 character',
    inputType: 'textarea',
    inputValue: "Hello, I'm " + store.data.username,
  })
      .then(async ({value}) => {
        let res = await axiosUtilObj.postToken("/api/auth/chatroom/addFriendRequest", store.data.token, {
          id: toAddFriendId.value,
          remark: value
        })
        if (res.code === '100') {
          ElMessage({
            message: "Your friend request was successfully sent.",
            type: 'success',
          })
        } else {
          ElMessage({
            message: res.message,
            type: 'error',
          })
        }
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

const enterMessage = async (row) => {
  let id = 'user' + row.id

  let res = await axiosUtilObj.postToken("/api/auth/chatroom/isFriend", store.data.token, {
    friendId: row.id,
    selfId: store.data.userId
  })
  if (res.data === '1') {
    localStoreUtilObj.set('showConversation', id)

    if (localStoreUtilObj.get('conversations') == null) {
      let arr = []
      arr.push(id)
      localStoreUtilObj.set('conversations', JSON.stringify(arr))
    } else {
      let conversations = JSON.parse(localStoreUtilObj.get('conversations'))

      if (!conversations.includes(id)) {
        conversations.push(id)
        localStorage.setItem('conversations', JSON.stringify(conversations))
      }
    }

    await router.push({path: '/' + store.data.path + '/chatroom/conversations'})
  } else if (res.data === '0') {
    ElMessage.error("You're not friends anymore")
    await delay(1000); // 等待 1 秒
    location.reload()
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const deleteFriend = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to delete the friend?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/chatroom/deleteFriend", store.data.token, {id: row.id})

        location.reload()
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Delete canceled',
        })
      })
}
</script>

<template>
  <div style="margin-bottom: 20px">
    <el-input
        v-model="toAddFriendId"
        style="max-width: 250px"
        placeholder="Please input UserId"
    >
      <template #append>
        <el-button @click="addFriend">
          <font-awesome-icon :icon="['fas', 'user-plus']"/>
        </el-button>
      </template>
    </el-input>
  </div>
  <el-table
      :data="filterTableData"
      style="width: 100%;height: 520px"
  >
    <el-table-column label="No">
      <template #default="scope">
        {{ scope.$index }}
      </template>
    </el-table-column>
    <el-table-column label="Avatar">
      <template #default="scope">
        <el-avatar style="vertical-align: middle" shape="square"
                   :src="scope.row.avatar"/>
      </template>
    </el-table-column>
    <el-table-column prop="id" label="UserId"/>
    <el-table-column prop="username" label="Name"/>
    <el-table-column label="Status">
      <template #default="scope">
        <el-text v-if="data.friendStatusList[data.friendDetailList.indexOf(scope.row)] === '1'" type="success">Online
        </el-text>
        <el-text v-else-if="data.friendStatusList[data.friendDetailList.indexOf(scope.row)] === '0'" type="info">Offline
        </el-text>
      </template>
    </el-table-column>
    <el-table-column fixed="right" min-width="120">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search"/>
      </template>
      <template #default="scope">
        <el-button link type="primary" size="small" @click="enterMessage(scope.row)">Messages</el-button>
        <el-button link type="danger" size="small" @click="deleteFriend(scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>

</style>