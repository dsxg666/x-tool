<script setup>
import {infoStore} from '@/store/store.js'
import localStoreUtilObj from '@/utils/localstore.js'
import axiosUtilObj from '@/utils/axios.js'
import timeUtilObj from '@/utils/time.js'
import {useRouter, useRoute} from 'vue-router'
import {reactive, ref, onMounted, computed} from 'vue'
import {ElIcon, ElMessage, ElMessageBox} from 'element-plus'

const store = infoStore()
const router = useRouter()
const route = useRoute();

const logout = () => {
  localStoreUtilObj.remove('info')
  router.push('/login')
}

const logoVar = '/' + store.data.path

const showChatroom = ref(store.asideShowData.chatroom)
const showTodolist = ref(store.asideShowData.todolist)
const showGame = ref(store.asideShowData.game)
const showBlog = ref(store.asideShowData.blog)
const showMusic = ref(store.asideShowData.music)
const showEnglish = ref(store.asideShowData.english)

const handleChatroomSwitchChange = (value) => {
  store.updateChatroomShow(value)
}
const handleTodolistSwitchChange = (value) => {
  store.updateTodolistShow(value)
}
const handleGameSwitchChange = (value) => {
  store.updateGameShow(value)
}
const handleBlogSwitchChange = (value) => {
  store.updateBlogShow(value)
}
const handleMusicSwitchChange = (value) => {
  store.updateMusicShow(value)
}
const handleEnglishSwitchChange = (value) => {
  store.updateEnglishShow(value)
}


const avatarUrl = ref(`${import.meta.env.VITE_API_URL}/api/base/getAvatar/${store.data.userId}`)

const avatarUrlWithTimestamp = computed(() => {
  return `${avatarUrl.value}?t=${new Date().getTime()}`
})

const settingsData = reactive({
  tabPosition: 'left'
})

const settingsVisible = ref(false)
const avatarBoxVisible = ref(false)

const generalData = reactive({
  list: [
    {property: 'UserId', content: ''},
    {property: 'Username', content: ''},
    {property: 'Email', content: ''},
    {property: 'Password', content: ''},
    {property: 'Avatar', content: ''},
    {property: 'Path', content: ''},
  ]
})

const showData = reactive({
  list: [
    {sidebar: 'Chatroom'},
    {sidebar: 'Todolist'},
    {sidebar: 'Game'},
    {sidebar: 'Blog'},
    {sidebar: 'Music'},
    {sidebar: 'English'},
  ]
})

let emailLastUpdateDate = ''

const openPasswordBox = () => {
  ElMessageBox.prompt('Please input your new password', 'Modify password', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputType: 'password',
    inputPattern: /^(?!\s*$).+/,
    inputErrorMessage: "Password can't be empty",
  })
      .then(({value}) => {
        axiosUtilObj.postToken('/api/auth/user/modifyPassword', store.data.token, {
          id: store.data.userId,
          password: value
        }).then(result => {
          if (result.code === '100') {
            ElMessage.success('Modify successfully!')
          } else {
            ElMessage.error(result.message)
          }
        }).catch(error => {
          console.log(error)
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

function replaceFirstSegment(path, newSegment) {
  // 使用正则表达式匹配路径的第一部分
  return path.replace(/^\/[^\/]+/, `/${newSegment}`);
}

const openPathBox = () => {
  ElMessageBox.prompt('Please input your new path', 'Modify path', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern: /^[a-zA-Z0-9]{1,20}$/,
    inputErrorMessage: 'Path must be contain 1~20 letters and numbers',
  })
      .then(({value}) => {
        axiosUtilObj.postToken('/api/auth/user/modifyPath', store.data.token, {
          id: store.data.userId,
          path: value
        }).then(result => {
          if (result.code === '100') {
            generalData.list[5].content = value
            store.updatePath(value)
            logout()
          } else {
            ElMessage.error(result.message)
          }
        }).catch(error => {
          console.log(error)
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

const openUsernameBox = () => {
  ElMessageBox.prompt('Please input your new username', 'Modify username', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern: /^.{1,8}$/,
    inputErrorMessage: 'Username must be 1~8 character',
  })
      .then(({value}) => {
        axiosUtilObj.postToken('/api/auth/user/modifyUsername', store.data.token, {
          id: store.data.userId,
          username: value
        }).then(result => {
          if (result.code === '100') {
            generalData.list[1].content = value
            store.updateUsername(value)
            ElMessage.success('Modify successfully!')
          }
        }).catch(error => {
          console.log(error)
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

const openEmailBox = () => {
  ElMessageBox.prompt('Please input your new email', 'Modify email', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputPattern:
        /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
    inputErrorMessage: 'Invalid Email',
  })
      .then(({value}) => {
        let startTime = timeUtilObj.getNowFormatDate()
        let endTime = emailLastUpdateDate
        if (specialDateSubRes(startTime, endTime)) {
          axiosUtilObj.postToken('/api/auth/user/modifyEmail', store.data.token, {
            id: store.data.userId,
            email: value,
            emailUpdateAt: startTime,
          }).then(result => {
            if (result.code === '100') {
              emailLastUpdateDate = startTime
              generalData.list[2].content = value
              ElMessage.success('Modify successfully!')
            } else {
              ElMessage.error(result.message)
            }
          }).catch(error => {
            console.log(error)
          })
        } else {
          let notice = specialDateSubStr(startTime, endTime)
          ElMessage.error(notice)
        }
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Canceled',
        })
      })
}

const specialDateSubRes = (startTime, endTime) => {
  let startDate = new Date(startTime)
  let endDate = new Date(endTime)
  endDate.setDate(endDate.getDate() + 30)
  let duration = endDate - startDate
  return duration < 0
}

const specialDateSubStr = (startTime, endTime) => {
  let startDate = new Date(startTime)
  let endDate = new Date(endTime)
  endDate.setDate(endDate.getDate() + 30)
  let duration = endDate - startDate

  let day = Math.floor(duration / (24 * 60 * 60 * 1000))
  let hour = Math.floor((duration / (60 * 60 * 1000)) % 24)
  let minute = Math.floor((duration / (60 * 1000)) % 60)

  return `We have ${day} days ${hour} hours ${minute} minutes left to modify.`
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success('Modify successfully!')
}

const handleUploadError = (err, file) => {
  console.error('File upload failed:', err)
}

const uploadHeaders = {
  JwtToken: store.data.token,
}

const beforeUpload = (file) => {
  const isLt500K = file.size / 1024 < 500
  if (!isLt500K) {
    ElMessage.error('File size cannot exceed 500KB!')
  }
  return isLt500K
}

onMounted(() => {
  axiosUtilObj.postToken('/api/auth/user/getUserById', store.data.token, {id: store.data.userId}).then(result => {
    generalData.list[0].content = result.data.id
    generalData.list[1].content = result.data.username
    generalData.list[2].content = result.data.email
    generalData.list[5].content = result.data.path
    emailLastUpdateDate = timeUtilObj.StrToFormatDate(result.data.emailUpdateAt)
  }).catch(err => {
    console.log(err)
  })
})

const uploadPath = ref(`${import.meta.env.VITE_API_URL}/api/auth/user/uploadAvatar`)
</script>

<template>
  <el-menu
      mode="horizontal"
      :ellipsis="false"
  >
    <el-menu-item class="custom-menu-item">
      <a :href="logoVar">
        <img
            style="width: 100px;vertical-align: middle"
            src="/logo-color.png"
            alt="lanKaiYun logo"
        />
      </a>
    </el-menu-item>
    <el-menu-item class="custom-menu-item">
      <el-avatar :src="avatarUrlWithTimestamp" shape="square"/>
    </el-menu-item>
    <el-menu-item class="custom-menu-item">
      <font-awesome-icon :icon="['fas', 'user']"/>
      &nbsp;&nbsp;{{ store.data.username }}
    </el-menu-item>
    <el-menu-item @click="settingsVisible = true">
      <font-awesome-icon :icon="['fas', 'gear']"/>
      &nbsp;&nbsp;Settings
    </el-menu-item>

    <el-menu-item @click="logout()">
      <font-awesome-icon :icon="['fas', 'right-from-bracket']"/>
      &nbsp;&nbsp;Log out
    </el-menu-item>
  </el-menu>

  <el-dialog
      v-model="settingsVisible"
      width="700"
      :show-close="false"
      align-center
      style="border-radius: 10px;"
  >
    <template #header="{ close }">
      <div class="header-container">
        <span style="font-weight: bold">Settings</span>
        <span
            @click="close"
            style="cursor: pointer"
        >
          <font-awesome-icon :icon="['fas', 'xmark']"/>
        </span>
      </div>
    </template>
    <el-tabs :tab-position="settingsData.tabPosition" style="height: 400px">
      <el-tab-pane>
        <template #label>
        <span>
          <el-icon><font-awesome-icon :icon="['fas', 'gear']"/></el-icon>
          <span>&nbsp;&nbsp;General</span>
        </span>
        </template>
        <div style="padding: 0 10px">
          <el-table :data="generalData.list" style="width: 100%">
            <el-table-column prop="property" label="Property"/>
            <el-table-column prop="content" label="Content"/>
            <el-table-column label="Operation">
              <template #default="scope">
                <el-button v-if="scope.row.property === 'Username'" link type="primary" size="small"
                           @click="openUsernameBox">Modify
                </el-button>
                <el-button v-else-if="scope.row.property === 'Email'" link type="primary" size="small"
                           @click="openEmailBox">Modify
                </el-button>
                <el-tooltip
                    v-else-if="scope.row.property === 'Email'"
                    effect="dark"
                    content="Attention! It can only be modified once a month."
                    placement="top"
                >
                  <el-text style="margin-left: 10px; user-select: none" type="warning" size="small">hint</el-text>
                </el-tooltip>
                <el-button v-else-if="scope.row.property === 'Password'" link type="primary" size="small"
                           @click="openPasswordBox">Modify
                </el-button>
                <el-button v-else-if="scope.row.property === 'Avatar'" link type="primary" size="small"
                           @click="avatarBoxVisible = true">Modify
                </el-button>
                <el-button v-else-if="scope.row.property === 'Path'" link type="primary" size="small"
                           @click="openPathBox">Modify
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <template #label>
        <span>
          <el-icon><font-awesome-icon :icon="['fas', 'eye']"/></el-icon>
          <span>&nbsp;&nbsp;Show&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </span>
        </template>
        <div style="padding: 0 10px">
          <el-table :data="showData.list" style="width: 100%">
            <el-table-column prop="sidebar" label="Application"/>
            <el-table-column label="Operation">
              <template #default="scope">
                <el-switch v-if="scope.row.sidebar === 'Chatroom'" v-model="showChatroom"
                           @change="handleChatroomSwitchChange"/>
                <el-switch v-else-if="scope.row.sidebar === 'Todolist'" v-model="showTodolist"
                           @change="handleTodolistSwitchChange"/>
                <el-switch v-else-if="scope.row.sidebar === 'Game'" v-model="showGame"
                           @change="handleGameSwitchChange"/>
                <el-switch v-else-if="scope.row.sidebar === 'Blog'" v-model="showBlog"
                           @change="handleBlogSwitchChange"/>
                <el-switch v-else-if="scope.row.sidebar === 'Music'" v-model="showMusic"
                           @change="handleMusicSwitchChange"/>
                <el-switch v-else-if="scope.row.sidebar === 'English'" v-model="showEnglish"
                           @change="handleEnglishSwitchChange"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

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
@import '@/assets/css/header.css';
</style>