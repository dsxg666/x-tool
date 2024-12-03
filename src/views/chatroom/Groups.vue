<script setup>
import {computed, onMounted, reactive, ref} from "vue"
import axiosUtilObj from "@/utils/axios.js";
import {infoStore} from '@/store/store.js'
import {useRouter} from 'vue-router'
import localStoreUtilObj from '@/utils/localstore.js'
import {ElIcon, ElMessage, ElMessageBox} from "element-plus";

const store = infoStore()
const router = useRouter()

const data = reactive({
  groupDetailList: [],
  groupMember: [],
  memberDetailList: [],
  groupOwnerMap: new Map(),
  groupList: [],
})

const search = ref('')
const search2 = ref('')

const filterTableData = computed(() =>
    data.groupDetailList.filter(
        (data) =>
            !search.value ||
            data.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const filterTableData2 = computed(() =>
    data.memberDetailList.filter(
        (data) =>
            !search2.value ||
            data.username.toLowerCase().includes(search2.value.toLowerCase())
    )
)

onMounted(async () => {
  let res1 = await axiosUtilObj.postToken("/api/auth/chatroom/belongUserGroupList", store.data.token, null)
  data.groupList = res1.data
  for (let i = 0; i < res1.data.length; i++) {
    let groupId = res1.data[i].groupId
    let temp = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupById", store.data.token, {id: groupId})
    let temp2 = await axiosUtilObj.postToken("/api/auth/chatroom/belongGroupUserList", store.data.token, {id: groupId})
    temp.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/${temp.data.avatar}`
    data.groupDetailList.push(temp.data)
    let tempList = []
    for (let j = 0; j < temp2.data.length; j++) {
      if (temp2.data[j].status === '1') {
        data.groupOwnerMap.set(temp2.data[j].groupId, temp2.data[j].userId)
      }
      tempList.push(temp2.data[j].userId)
    }
    data.groupMember[i] = tempList
  }
})

const enterMessage = async (row) => {
  let id = 'group' + row.id

  let res = await axiosUtilObj.postToken("/api/auth/chatroom/isGroupExist", store.data.token, {id: row.id})
  if (res.data === '1') {
    let res2 = await axiosUtilObj.postToken("/api/auth/chatroom/isInGroup", store.data.token, {groupId: row.id, userId: store.data.userId})
    if (res2.data === '1') {
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
    } else if (res2.data === '0') {
      ElMessage.error("You're not in the group chat")
      await delay(1000); // 等待 1 秒
      location.reload()
    }
  } else if (res.data === '0') {
    ElMessage.error('Group have deleted')
    await delay(1000); // 等待 1 秒
    location.reload()
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const addBoxVisible = ref(false)

const updateBoxVisible = ref(false)

const memberBoxVisible = ref(false)

const avatarBoxVisible = ref(false)

const toUpdateGroupId = ref('')

const groupMemberData = reactive({
  id: ''
})

const openMemberBox = async (row) => {
  groupMemberData.id = row.id
  memberBoxVisible.value = true

  let arr = data.groupMember[data.groupDetailList.indexOf(row)]
  let list = []
  for (let i = 0; i < arr.length; i++) {
    let res = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: arr[i]})
    res.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${arr[i]}?t=${new Date().getTime()}`
    list.push(res.data)
  }
  data.memberDetailList = list
}


const openUpdateBox = (row) => {
  toUpdateGroupId.value = row.id
  updateBoxVisible.value = true
  uploadPath.value = `${import.meta.env.VITE_API_URL}/api/auth/chatroom/uploadAvatar?id=${row.id}`
}

const groupUpdateData = reactive({
  list: [
    {property: 'Member'},
    {property: 'Name'},
    {property: 'Avatar'},
  ]
})

const formRef = ref()

const formData = reactive({
  name: '',
  avatar: '',
})

const rules = {
  name: [
    {required: true, message: 'Please input the name', trigger: 'blur'},
    {min: 1, max: 8, message: 'Name must be 1~8 character', trigger: 'blur'},
  ]
}

const onSubmit = () => {
  if (!formRef) return
  formRef.value.validate(async (valid) => {
    if (valid) {
      formData.avatar = "1.jpg"
      await axiosUtilObj.postToken("/api/auth/chatroom/addGroup", store.data.token, formData)
      location.reload()
    } else {
      console.log('error submit!')
    }
  })
}

const deleteGroup = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to delete the group chat?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/chatroom/deleteGroup", store.data.token, {id: row.id})

        location.reload()
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Delete canceled',
        })
      })
}

const openInviteBox = () => {
  ElMessageBox.prompt('Please input UserId', 'Invite member', {
    confirmButtonText: 'Invite',
    cancelButtonText: 'Cancel',
    inputPattern: /\S+/,
    inputErrorMessage: "UserId can't be empty.",
  })
      .then( async ({value}) => {
        let res = await axiosUtilObj.postToken("/api/auth/chatroom/enterGroupRequest", store.data.token, {
          groupId: toUpdateGroupId.value,
          receiverId: value,
        })
        if (res.code === '100') {
          ElMessage({
            message: "Your invite request was successfully sent.",
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

const openNameBox = () => {
  ElMessageBox.prompt('Please input your new name', 'Modify name', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern: /^.{1,8}$/,
    inputErrorMessage: 'Name must be 1~8 character',
  })
      .then( async ({value}) => {
        await axiosUtilObj.postToken('/api/auth/chatroom/modifyGroupName', store.data.token, {
          id: toUpdateGroupId.value,
          name: value
        })
        location.reload()
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success('Modify successfully!')
}

const handleUploadError = (err, file) => {
  console.error('File upload failed:', err)
}

const beforeUpload = (file) => {
  const isLt500K = file.size / 1024 < 500
  if (!isLt500K) {
    ElMessage.error('File size cannot exceed 500KB!')
  }
  return isLt500K
}

const uploadPath = ref('')

const uploadHeaders = {
  JwtToken: store.data.token,
}

const quitGroup = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to leave the member?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/chatroom/deleteMember", store.data.token, {
          groupId: row.id,
          userId: store.data.userId,
        })
        location.reload()
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Quit canceled',
        })
      })
}

const deleteMember = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to delete the member?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/chatroom/deleteMember", store.data.token, {
          groupId: groupMemberData.id,
          userId: row.id,
        })
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
    <el-button type="primary" @click="addBoxVisible = true">
      <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;Create Group Chat
    </el-button>
  </div>
  <el-dialog
      v-model="addBoxVisible"
      width="500"
      :show-close="false"
      align-center
      style="border-radius: 10px;"
  >
    <template #header="{ close }">
      <div class="header-container">
        <span style="font-weight: bold">Create</span>
        <span
            @click="close"
            style="cursor: pointer"
        >
          <font-awesome-icon :icon="['fas', 'xmark']"/>
        </span>
      </div>
    </template>
    <div class="formContainer">
      <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
      >
        <el-form-item
            prop="name"
        >
          <el-input
              class="addGroupWidth"
              v-model="formData.name"
              type="text"
              placeholder="Please input group name"
              maxlength="8"
              show-word-limit
              clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
              class="addGroupWidth"
              type="primary"
              @click="onSubmit()"
          >
            Create
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
  <el-dialog
      v-model="memberBoxVisible"
      width="600"
      :show-close="false"
      align-center
      style="border-radius: 10px;"
  >
    <template #header="{ close }">
      <div class="header-container">
        <span style="font-weight: bold">Group Member Detail</span>
        <span
            @click="close"
            style="cursor: pointer"
        >
          <font-awesome-icon :icon="['fas', 'xmark']"/>
        </span>
      </div>
    </template>
    <div style="padding: 0 10px">
      <el-table :data="filterTableData2" style="width: 100%;height: 500px">
        <el-table-column fixed="left" min-width="120">
          <template #header>
            <el-input v-model="search2" size="small" placeholder="Type to search"/>
          </template>
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
        <el-table-column label="Name">
          <template #default="scope">
            <el-text v-if="data.groupOwnerMap.get(groupMemberData.id) !== scope.row.id">{{scope.row.username}}</el-text>
            <el-text tag="mark" v-if="data.groupOwnerMap.get(groupMemberData.id) === scope.row.id">{{scope.row.username}}</el-text>
          </template>
        </el-table-column>
        <el-table-column v-if="data.groupOwnerMap.get(groupMemberData.id) === store.data.userId" label="Operation">
          <template #default="scope">
            <el-button v-if="data.groupOwnerMap.get(groupMemberData.id) !== scope.row.id" type="primary" link size="small" @click="deleteMember(scope.row)">Remove</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
  <el-dialog
      v-model="updateBoxVisible"
      width="500"
      :show-close="false"
      align-center
      style="border-radius: 10px;"
  >
    <template #header="{ close }">
      <div class="header-container">
        <span style="font-weight: bold">Manage</span>
        <span
            @click="close"
            style="cursor: pointer"
        >
          <font-awesome-icon :icon="['fas', 'xmark']"/>
        </span>
      </div>
    </template>
    <div style="padding: 0 10px">
      <el-table :data="groupUpdateData.list" style="width: 100%">
        <el-table-column prop="property" label="Property"/>
        <el-table-column label="Operation">
          <template #default="scope">
            <el-button v-if="scope.row.property === 'Member'" type="primary" link size="small" @click="openInviteBox()">Invite</el-button>
            <el-button v-if="scope.row.property === 'Name'" type="primary" link size="small" @click="openNameBox()">Modify</el-button>
            <el-button v-if="scope.row.property === 'Avatar'" type="primary" link size="small" @click="avatarBoxVisible = true">Modify</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
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
        <el-avatar style="vertical-align: middle" shape="square" :src="scope.row.avatar"/>
      </template>
    </el-table-column>
    <el-table-column prop="id" label="GroupId"/>
    <el-table-column prop="name" label="Name" show-overflow-tooltip/>
    <el-table-column label="Member">
      <template #default="scope">
        {{ data.groupMember[data.groupDetailList.indexOf(scope.row)].length }}&nbsp;&nbsp;
        <el-button v-if="scope.row.id !== '1'" size="small" @click="openMemberBox(scope.row)">Detail</el-button>
      </template>
    </el-table-column>
    <el-table-column label="IsOwner">
      <template #default="scope">
        <font-awesome-icon v-if="data.groupList[data.groupDetailList.indexOf(scope.row)].status === '1'"
                           :icon="['fas', 'check']"/>
        <font-awesome-icon v-if="data.groupList[data.groupDetailList.indexOf(scope.row)].status === '0'"
                           :icon="['fas', 'xmark']"/>
      </template>
    </el-table-column>
    <el-table-column fixed="right" min-width="120">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search"/>
      </template>
      <template #default="scope">
        <el-button link type="primary" size="small" @click="enterMessage(scope.row)">Messages</el-button>
        <el-button v-if="scope.row.id !== '1' && data.groupList[data.groupDetailList.indexOf(scope.row)].status === '0'"
                   link type="danger" size="small" @click="quitGroup(scope.row)">Quit
        </el-button>
        <el-button v-if="scope.row.id !== '1' && data.groupList[data.groupDetailList.indexOf(scope.row)].status === '1'"
                   link type="primary" size="small" @click="openUpdateBox(scope.row)">Manage
        </el-button>
        <el-button v-if="scope.row.id !== '1' && data.groupList[data.groupDetailList.indexOf(scope.row)].status === '1'"
                   link type="danger" size="small" @click="deleteGroup(scope.row)">Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog v-model="avatarBoxVisible" title="Modify avatar" width="800" style="border-radius: 10px;">
    <el-upload
        drag
        :action="uploadPath"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :headers="uploadHeaders"
        accept="image/png"
    >
      <el-icon>
        <font-awesome-icon style="font-size: 15px" :icon="['fas', 'upload']"/>
      </el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          png files with a size less than 500kb
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
}

.addGroupWidth {
  width: 220px;
}

.formContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30vh;
}
</style>