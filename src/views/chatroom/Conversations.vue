<script setup>
import {nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import {ClickOutside as vClickOutside, ElMessage, ElNotification} from 'element-plus'
import localStoreUtilObj from '@/utils/localstore.js'
import axiosUtilObj from "@/utils/axios.js";
import {infoStore} from '@/store/store.js'
import {useRouter} from 'vue-router'
import timeUtilObj from '@/utils/time.js'

const store = infoStore()

const router = useRouter()

const data = reactive({
  groupDetailMap: new Map(),
  userDetailMap: new Map(),

  isShowDot: new Map(),

  groupChatMessageMap: new Map(),
  userChatMessageMap: new Map(),

  groupMessageCountMap: new Map(),
  userMessageCountMap: new Map(),

  chatMessageAvatarMap: new Map(),

  showMessageBox: false,
  showDetail: null,
  showMessages: [],
})

const getData = async () => {
  if (localStoreUtilObj.get('conversations') != null) {
    let conversations = JSON.parse(localStoreUtilObj.get('conversations'))
    for (let i = 0; i < conversations.length; i++) {
      data.isShowDot.set(conversations[i], false)
      if (conversations[i].startsWith('group')) {
        let groupId = conversations[i].slice('group'.length)
        data.groupMessageCountMap.set(conversations[i], 1)

        let groupDetail = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupById", store.data.token, {id: groupId})
        groupDetail.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getGroupAvatar/${groupDetail.data.avatar}`
        data.groupDetailMap.set(conversations[i], groupDetail.data)
        let groupMessage = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupMessage", store.data.token, {
          groupId: groupId,
          count: 1,
        })
        if (groupMessage.data !== undefined) {
          data.groupChatMessageMap.set(conversations[i], groupMessage.data)
          for (let j = 0; j < groupMessage.data.length; j++) {
            data.chatMessageAvatarMap.set("group" + groupMessage.data[j].id, {
              senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${groupMessage.data[j].senderId}`,
            })
          }
        }
      } else if (conversations[i].startsWith('user')) {
        let userId = conversations[i].slice('user'.length)
        data.userMessageCountMap.set(conversations[i], 1)

        let userDetail = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: userId})
        userDetail.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${userDetail.data.id}`
        data.userDetailMap.set(conversations[i], userDetail.data)

        let userMessage = await axiosUtilObj.postToken("/api/auth/chatroom/getMessage", store.data.token, {
          senderId: store.data.userId,
          receiverId: userId,
          count: 1,
        })
        if (userMessage.data !== undefined) {
          data.userChatMessageMap.set(conversations[i], userMessage.data)
          for (let j = 0; j < userMessage.data.length; j++) {
            data.chatMessageAvatarMap.set("user" + userMessage.data[j].id, {
              senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${userMessage.data[j].senderId}`,
            })
          }
        }
      }
    }
  }
}

const initBox = () => {
  let show = localStoreUtilObj.get('showConversation')
  if (show != null && show !== '') {
    if (show.startsWith('group')) {
      data.showDetail = data.groupDetailMap.get(show)
      data.showMessages = data.groupChatMessageMap.get(show)
    } else if (show.startsWith('user')) {
      data.showDetail = data.userDetailMap.get(show)
      data.showMessages = data.userChatMessageMap.get(show)
    }
  }
}

const init = () => {
  let show = localStoreUtilObj.get('showConversation')
  if (show != null && show !== '') {
    data.showMessageBox = true
    document.getElementById(show).classList.add('showConversationBgc')
  }
}

const buttonRef = ref()
const popoverRef = ref()

const onClickOutside = () => {
  popoverRef.value.hide();
}

const inputRef = ref(null);

const keepFocus = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

const handleGlobalClick = (event) => {
  if (inputRef.value && !inputRef.value.contains(event.target)) {
    keepFocus();
  }
}

onBeforeMount(async () => {
  await getData()
  initBox()
})

const audio = ref(null)

onMounted(() => {
  audio.value = new Audio('/audio/notice.mp3')
  init()

  connectWebSocket()

  nextTick(() => {
    keepFocus()
  })

  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
  conn.value.close()
})

const conn = ref(null)

const connectWebSocket = () => {
  if (window["WebSocket"]) {
    conn.value = new WebSocket(`ws://${import.meta.env.VITE_API_URL2}/ws?id=${store.data.userId}`)

    conn.value.onclose = function (evt) {
      console.log("Connection closed.")
      if (evt.code === 1006) {
        router.push("/")
      }
    }

    conn.value.onmessage = function (evt) {
      if (evt.data.startsWith('zyxwvu^%$@!')) {
        console.log(evt.data)
      } else {
        let obj = JSON.parse(evt.data)

        if (obj.groupId !== undefined) {
          data.chatMessageAvatarMap.set('group' + obj.id, {
            senderAvatar: obj.senderAvatar,
          })
        } else if (obj.receiverId !== undefined) {
          data.chatMessageAvatarMap.set('user' + obj.id, {
            senderAvatar: obj.senderAvatar,
          })
        }

        let conversations = JSON.parse(localStoreUtilObj.get('conversations'))

        let show = localStoreUtilObj.get('showConversation')
        if (obj.groupId !== undefined && show.startsWith('group')// receive group info in show box
            && show.slice('group'.length) === obj.groupId) {
          data.showMessages.push(obj)
        } else if (obj.receiverId !== undefined && show.startsWith('user')// send user info in show box
            && show.slice('user'.length) === obj.receiverId && obj.senderId === store.data.userId) {
          data.showMessages.push(obj)
        } else if (obj.receiverId !== undefined && show.startsWith('user')// receive user info in show box
            && show.slice('user'.length) === obj.senderId && obj.receiverId === store.data.userId) {
          data.showMessages.push(obj)
        }

        if (obj.receiverId !== undefined &&
            conversations.includes('user' + obj.senderId) && 'user' + obj.senderId !== show) {
          data.userChatMessageMap.get('user' + obj.senderId).push(obj)
          if (audio.value) {
            audio.value.play()
          }
          data.isShowDot.set('user' + obj.senderId, true)
        } else if (obj.groupId !== undefined &&
            conversations.includes('group' + obj.groupId) && 'group' + obj.groupId !== show) {
          data.groupChatMessageMap.get('group' + obj.groupId).push(obj)
          if (audio.value) {
            audio.value.play()
          }
          data.isShowDot.set('group' + obj.groupId, true)
        }
      }
    }
  } else {
    console.log("Your browser does not support WebSockets.")
  }
}

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      return;
    }
    event.preventDefault()
    sendMessage()
  }
}

const sendMessage = async () => {
  const value = document.getElementById('chat-input').innerHTML
  if (value === '') return
  let show = localStoreUtilObj.get('showConversation')

  if (show.startsWith('group')) {
    let res = await axiosUtilObj.postToken("/api/auth/chatroom/isGroupExist", store.data.token, {id: show.slice('group'.length)})
    if (res.data === '1') {
      let res2 = await axiosUtilObj.postToken("/api/auth/chatroom/isInGroup", store.data.token, {
        groupId: show.slice('group'.length),
        userId: store.data.userId,
      })
      if (res2.data === '1') {
        let obj = {
          id: '',
          senderId: store.data.userId,
          groupId: show.slice('group'.length),
          message: value,
          createdAt: timeUtilObj.getNowFormatDate(),
          senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${store.data.userId}`,
        }
        let resId = await axiosUtilObj.postToken("/api/auth/chatroom/sendGroupMessage", store.data.token, obj)
        obj.id = resId.data
        conn.value.send(JSON.stringify(obj))
      } else if (res2.data === '0') {
        ElMessage.error("You're not in the group chat")
        handleCloseConversation(show)
      }
    } else if (res.data === '0') {
      ElMessage.error('Group have deleted')
      handleCloseConversation(show)
    }
  } else if (show.startsWith('user')) {
    let res = await axiosUtilObj.postToken("/api/auth/chatroom/isFriend", store.data.token, {
      friendId: show.slice('user'.length),
      selfId: store.data.userId
    })
    if (res.data === '1') {
      let obj = {
        id: '',
        senderId: store.data.userId,
        receiverId: show.slice('user'.length),
        message: value,
        createdAt: timeUtilObj.getNowFormatDate(),
        senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${store.data.userId}`,
      }
      let resId = await axiosUtilObj.postToken("/api/auth/chatroom/sendMessage", store.data.token, obj)
      obj.id = resId.data
      conn.value.send(JSON.stringify(obj))
    } else if (res.data === '0') {
      ElMessage.error("You're not friends anymore")
      handleCloseConversation(show)
    }
  }

  document.getElementById('chat-input').innerHTML = ''
}

const onPaste = (event) => {
  event.preventDefault();  // 阻止默认粘贴行为

  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData('text/plain'); // 只获取纯文本内容

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents(); // 删除选中的内容（如果有的话）

  // 插入粘贴的纯文本内容
  range.insertNode(document.createTextNode(pastedData));

  // 光标移动到粘贴内容的末尾
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

const emojis = Array.from({length: 66}, (_, i) => `/img/emojis/${i + 1}.png`)

const onEmojiClick = (emojiUrl) => {
  // 获取当前的光标位置
  const selection = window.getSelection();
  if (!selection.rangeCount) return;  // 如果没有选区则返回

  const range = selection.getRangeAt(0); // 获取光标所在的range
  range.deleteContents(); // 删除选中的内容（如果有的话）

  // 创建图片节点
  const img = document.createElement('img');
  img.src = emojiUrl;
  img.className = 'emoji-img';

  // 插入图片到当前光标位置
  range.insertNode(img);

  // 光标移动到图片后面
  range.setStartAfter(img);
  range.setEndAfter(img);
  selection.removeAllRanges();
  selection.addRange(range);
}

const onEmojiHover = (event) => {
  event.target.style.backgroundColor = '#e0e0e0'
}

const onEmojiLeave = (event) => {
  event.target.style.backgroundColor = 'transparent'
}

const handleShowConversation = (val) => {
  let old = localStoreUtilObj.get('showConversation')

  if (old !== null && old !== '') {
    document.getElementById(old).classList.remove('showConversationBgc')
  }

  localStoreUtilObj.set('showConversation', val)

  data.isShowDot.set(val, false)

  document.getElementById(val).classList.add('showConversationBgc')

  if (val.startsWith('group')) {
    data.showDetail = data.groupDetailMap.get(val)
    data.showMessages = data.groupChatMessageMap.get(val)
  } else if (val.startsWith('user')) {
    data.showDetail = data.userDetailMap.get(val)
    data.showMessages = data.userChatMessageMap.get(val)
  }

  data.showMessageBox = true
}

const handleCloseConversation = (val) => {
  localStoreUtilObj.set('showConversation', '')

  data.showMessageBox = false

  let conversations = JSON.parse(localStoreUtilObj.get('conversations'))
  const index = conversations.indexOf(val)
  conversations.splice(index, 1)
  localStorage.setItem('conversations', JSON.stringify(conversations))

  const element = document.getElementById(val)
  element.remove()
}

const chatContainerRef = ref(null)

const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

watch(() => data.showMessages, async () => {
  await nextTick()
  scrollToBottom()
}, {deep: true})

const onScroll = async (conversation) => {
  if (chatContainerRef.value) {
    if (chatContainerRef.value.scrollTop === 0) {
      if (conversation.startsWith('group')) {
        let temp = data.groupMessageCountMap.get(conversation)
        data.groupMessageCountMap.set(conversation, temp + 1)
        let groupId = conversation.slice('group'.length)
        let groupMessage = await axiosUtilObj.postToken("/api/auth/chatroom/getGroupMessage", store.data.token, {
          groupId: groupId,
          count: temp + 1,
        })
        if (groupMessage.data !== undefined) {
          for (let j = 0; j < groupMessage.data.length; j++) {
            data.chatMessageAvatarMap.set("group" + groupMessage.data[j].id, {
              senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${groupMessage.data[j].senderId}`,
            })
          }
          if (groupMessage.data.length === data.groupChatMessageMap.get(conversation).length) {
            ElNotification({
              title: 'Info',
              message: 'All the chat messages have been loaded.',
              type: 'info',
            })
          } else {
            data.groupChatMessageMap.set(conversation, groupMessage.data)
            data.showMessages = data.groupChatMessageMap.get(conversation)
          }
        }
      } else if (conversation.startsWith('user')) {
        let temp = data.userMessageCountMap.get(conversation)
        data.userMessageCountMap.set(conversation, temp + 1)
        let userId = conversation.slice('user'.length)
        let userMessage = await axiosUtilObj.postToken("/api/auth/chatroom/getMessage", store.data.token, {
          senderId: store.data.userId,
          receiverId: userId,
          count: temp + 1,
        })
        if (userMessage.data !== undefined) {
          for (let j = 0; j < userMessage.data.length; j++) {
            data.chatMessageAvatarMap.set("user" + userMessage.data[j].id, {
              senderAvatar: `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${userMessage.data[j].senderId}`,
            })
          }
          if (userMessage.data.length === data.userChatMessageMap.get(conversation).length) {
            ElNotification({
              title: 'Info',
              message: 'All the chat messages have been loaded.',
              type: 'info',
            })
          } else {
            data.userChatMessageMap.set(conversation, userMessage.data)
            data.showMessages = data.userChatMessageMap.get(conversation)
          }
        }
      }
    }
  }
}

</script>

<template>
  <el-container style="height: 84vh;width: 82%;border: 1px solid #ddd; border-radius: 5px;position: fixed">
    <el-row style="width: 100%;">
      <el-col :span="6" style="border-right: 1px solid #ddd;height: 100%">
        <el-scrollbar>
          <el-row v-for="(value, index) in JSON.parse(localStoreUtilObj.get('conversations'))"
                  :key="index"
                  :id="value"
                  @click="handleShowConversation(value)"
                  @dblclick="handleCloseConversation(value)"
                  style="padding: 13px;">
            <el-col :span="5">
              <el-badge :is-dot="data.isShowDot.get(value)" :offset="[0, 5]">
                <el-avatar v-if="data.groupDetailMap.has(value)" shape="square" style="margin-top: 4px;margin-left: 4px"
                           :src="data.groupDetailMap.get(value).avatar"/>
                <el-avatar v-if="data.userDetailMap.has(value)" shape="square" style="margin-top: 4px;margin-left: 4px"
                           :src="data.userDetailMap.get(value).avatar"/>
              </el-badge>
            </el-col>
            <el-col :span="13">
              <el-row style="height: 100%;">
                <el-col :span="24" style="height: 60%;">
                  <div style="width: 100px;">
                    <el-text v-if="data.groupDetailMap.has(value)" truncated size="large">
                      {{ data.groupDetailMap.get(value).name }}
                    </el-text>
                    <el-text v-if="data.userDetailMap.has(value)" truncated size="large">
                      {{ data.userDetailMap.get(value).username }}
                    </el-text>
                  </div>
                </el-col>
                <el-col :span="24" style="height: 40%;">
                  <el-text v-if="data.groupChatMessageMap.has(value)" class="lastMessage" truncated type="info"
                           size="small"
                           v-html="data.groupChatMessageMap.get(value)[data.groupChatMessageMap.get(value).length - 1].message"/>
                  <el-text v-if="data.userChatMessageMap.has(value)" class="lastMessage" truncated type="info"
                           size="small"
                           v-html="data.userChatMessageMap.get(value)[data.userChatMessageMap.get(value).length - 1].message"/>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="6">
              <div style="text-align: right">
                <el-text v-if="data.groupChatMessageMap.has(value)" type="info" size="small" style="margin-right: 4px"
                         v-html="timeUtilObj.StrToFormatTime(data.groupChatMessageMap.get(value)[data.groupChatMessageMap.get(value).length - 1].createdAt)"/>
                <el-text v-if="data.userChatMessageMap.has(value)" type="info" size="small" style="margin-right: 4px"
                         v-html="timeUtilObj.StrToFormatTime(data.userChatMessageMap.get(value)[data.userChatMessageMap.get(value).length - 1].createdAt)"/>
              </div>
            </el-col>
          </el-row>
        </el-scrollbar>
      </el-col>
      <el-col :span="18" style="height: 100%;">
        <el-row v-show="data.showMessageBox" style="height: 100%;background-color: #f3f3f3;">
          <el-col :span="24" style="height: 75%;border-bottom: 1px solid #ddd;">
            <el-row style="height: 100%;">
              <el-col :span="24"
                      style="height: 12%;padding-left: 2%;display: flex; align-items: center;border-bottom: 1px solid #ddd;">
                <el-text
                    v-if="data.showDetail !== null && data.showDetail.name !== undefined"
                    size="large"
                    style="color: black">
                  {{ data.showDetail.name }}
                </el-text>
                <el-text
                    v-if="data.showDetail !== null && data.showDetail.username !== undefined"
                    size="large"
                    style="color: black">
                  {{ data.showDetail.username }}
                </el-text>
              </el-col>
              <el-col :span="24" style="height: 88%;padding: 20px 0">
                <div
                    v-if="data.showMessages !== null && localStoreUtilObj.get('showConversation').startsWith('group')"
                    class="chat-container"
                    ref="chatContainerRef"
                    @scroll="onScroll(localStoreUtilObj.get('showConversation'))"
                >
                  <div v-for="(message, index) in data.showMessages"
                       :key="index"
                       :class="{'message-self': message.senderId === store.data.userId, 'message-other': message.senderId !== store.data.userId}"
                       class="message">
                    <div style="position: relative;">
                      <div v-if="message.senderId === store.data.userId" class="message-content">
                        <div class="content" style="max-width: 400px">
                          <el-tooltip
                              :content="timeUtilObj.StrToFormatDate(message.createdAt)"
                              placement="top"
                          >
                            <div v-html="message.message" class="contentBox"></div>
                          </el-tooltip>
                        </div>
                        <el-tooltip
                            :content="message.senderId"
                            placement="top"
                        >
                          <el-avatar
                              v-if="data.chatMessageAvatarMap.get('group'+message.id) !== null"
                              shape="square"
                              :src="data.chatMessageAvatarMap.get('group'+message.id).senderAvatar"
                              style="margin-right: 20px;margin-left: 15px"
                          >
                          </el-avatar>
                        </el-tooltip>
                      </div>
                      <div v-if="message.senderId !== store.data.userId" class="message-content">
                        <el-tooltip
                            :content="message.senderId"
                            placement="top"
                        >
                          <el-avatar
                              v-if="data.chatMessageAvatarMap.get('group'+message.id) !== null"
                              shape="square"
                              :src="data.chatMessageAvatarMap.get('group'+message.id).senderAvatar"
                              style="margin-left: 20px;margin-right: 15px"
                          >
                          </el-avatar>
                        </el-tooltip>
                        <div class="content" style="max-width: 400px">
                          <el-tooltip
                              :content="timeUtilObj.StrToFormatDate(message.createdAt)"
                              placement="top"
                          >
                            <div v-html="message.message" class="contentBox"></div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                    v-if="data.showMessages !== null && localStoreUtilObj.get('showConversation').startsWith('user')"
                    class="chat-container"
                    ref="chatContainerRef"
                    @scroll="onScroll(localStoreUtilObj.get('showConversation'))"
                >
                  <div v-for="(message, index) in data.showMessages"
                       :key="index"
                       :class="{'message-self': message.senderId === store.data.userId, 'message-other': message.senderId !== store.data.userId}"
                       class="message">
                    <div style="position: relative;">
                      <div v-if="message.senderId === store.data.userId" class="message-content">
                        <div class="content" style="max-width: 400px">
                          <el-tooltip
                              :content="timeUtilObj.StrToFormatDate(message.createdAt)"
                              placement="top"
                          >
                            <div v-html="message.message" class="contentBox"></div>
                          </el-tooltip>
                        </div>
                        <el-tooltip
                            :content="message.senderId"
                            placement="top"
                        >
                          <el-avatar
                              v-if="data.chatMessageAvatarMap.get('user'+message.id) !== null"
                              shape="square"
                              :src="data.chatMessageAvatarMap.get('user'+message.id).senderAvatar"
                              style="margin-right: 20px;margin-left: 15px"
                          >
                          </el-avatar>
                        </el-tooltip>
                      </div>
                      <div v-if="message.senderId !== store.data.userId" class="message-content">
                        <el-tooltip
                            :content="message.senderId"
                            placement="top"
                        >
                          <el-avatar
                              v-if="data.chatMessageAvatarMap.get('user'+message.id) !== null"
                              shape="square"
                              :src="data.chatMessageAvatarMap.get('user'+message.id).senderAvatar"
                              style="margin-left: 20px;margin-right: 15px"
                          >
                          </el-avatar>
                        </el-tooltip>
                        <div class="content" style="max-width: 400px">
                          <el-tooltip
                              :content="timeUtilObj.StrToFormatDate(message.createdAt)"
                              placement="top"
                          >
                            <div v-html="message.message" class="contentBox"></div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24" style="height: 25%;">
            <el-row style="height: 100%;">
              <el-col :span="24" style="height: 35%;">
                <div style="display: flex; align-items: center;height: 100%;gap: 20px;padding-left: 15px">
                  <font-awesome-icon
                      ref="buttonRef"
                      v-click-outside="onClickOutside"
                      style="font-size: 25px; outline: none; user-select: none; cursor: pointer;"
                      :icon="['far', 'face-smile']"/>
                  <font-awesome-icon style="font-size: 25px" :icon="['far', 'folder-closed']"/>
                  <el-popover
                      width="300"
                      ref="popoverRef"
                      :virtual-ref="buttonRef"
                      trigger="click"
                      placement="top"
                      virtual-triggering
                  >
                    <div class="emoji-container">
                      <img
                          v-for="(emoji, index) in emojis"
                          :key="index"
                          :src="emoji"
                          class="emoji-item"
                          @click="onEmojiClick(emoji)"
                          @mouseover="onEmojiHover($event)"
                          @mouseleave="onEmojiLeave($event)"
                      />
                    </div>
                  </el-popover>
                </div>
              </el-col>
              <el-col :span="24" style="height: 65%;padding-bottom: 7px;padding-left: 15px;padding-right: 15px;">
                <div
                    id="chat-input"
                    ref="inputRef"
                    class="inputBox"
                    @paste="onPaste"
                    @keydown="handleKeyDown"
                    contenteditable="true">
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-container>
</template>

<style scoped>
@import '@/assets/css/conversations.css';
</style>