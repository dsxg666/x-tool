<script setup>
import {infoStore} from "@/store/store.js";

const store = infoStore()

const toolGetStrLengthVar = '/' + store.data.path + '/tool/getStrLength'
const toolTimestampVar = '/' + store.data.path + '/tool/timestamp'
const toolNumberConversionVar = '/' + store.data.path + '/tool/numberConversion'
const toolJsonBeautifyVar = '/' + store.data.path + '/tool/jsonBeautify'
const toolPictureToBase64Var = '/' + store.data.path + '/tool/pictureToBase64'
const toolDateVar = '/' + store.data.path + '/tool/date'

const chatConversationsVar = '/' + store.data.path + '/chatroom/conversations'
const chatContactsVar = '/' + store.data.path + '/chatroom/contacts'
const chatGroupsVar = '/' + store.data.path + '/chatroom/groups'
const chatRequestVar = '/' + store.data.path + '/chatroom/requests'

const todoListVar = '/' + store.data.path + '/todolist/list'
const todoAddVar = '/' + store.data.path + '/todolist/add'

const gameSnakeInfiniteVar = '/' + store.data.path + '/game/gluttonousSnake/infiniteMode'

const blogPublicVar = '/' + store.data.path + '/blog/public'
const blogListVar = '/' + store.data.path + '/blog/list'
const blogAddVar = '/' + store.data.path + '/blog/add'
const blogFavoritesVar = '/' + store.data.path + '/blog/favorites'

const musicHomeVar = '/' + store.data.path + '/music/home'
const musicFavoritesVar = '/' + store.data.path + '/music/favorites'

const englishPkVar = '/' + store.data.path + '/english/pk'

</script>

<template>
  <el-aside width="200px">
    <el-scrollbar>
      <el-menu router>
        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'toolbox']"/>
            </el-icon>
            Tool
          </template>
          <el-menu-item-group title="development">
            <el-menu-item :index="toolGetStrLengthVar">String Length</el-menu-item>
            <el-menu-item :index="toolTimestampVar">Timestamp</el-menu-item>
            <el-menu-item :index="toolNumberConversionVar">Number Conversion</el-menu-item>
            <el-menu-item :index="toolJsonBeautifyVar">Json Beautify</el-menu-item>
            <el-menu-item :index="toolPictureToBase64Var">Picture To Base64</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="life">
            <el-menu-item :index="toolDateVar">Date Calculation</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="2" v-show="store.asideShowData.chatroom">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'comment-dots']"/>
            </el-icon>
            Chatroom
          </template>
          <el-menu-item-group>
            <el-menu-item :index="chatConversationsVar">Conversations</el-menu-item>
            <el-menu-item :index="chatContactsVar">Contacts</el-menu-item>
            <el-menu-item :index="chatGroupsVar">Groups</el-menu-item>
            <el-menu-item :index="chatRequestVar">Requests</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="3" v-show="store.asideShowData.todolist">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'clipboard-list']"/>
            </el-icon>
            Todolist
          </template>
          <el-menu-item-group>
            <el-menu-item :index="todoListVar">List</el-menu-item>
            <el-menu-item :index="todoAddVar">Add</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="4" v-show="store.asideShowData.game">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'gamepad']"/>
            </el-icon>
            Game
          </template>
          <el-sub-menu index="4-1">
            <template #title>Gluttonous Snake</template>
            <el-menu-item :index="gameSnakeInfiniteVar">Infinite Mode</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-sub-menu index="5" v-show="store.asideShowData.blog">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'book']"/>
            </el-icon>
            Blog
          </template>
          <el-menu-item-group>
            <el-menu-item :index="blogPublicVar">Public</el-menu-item>
            <el-menu-item :index="blogListVar">My List</el-menu-item>
            <el-menu-item :index="blogAddVar">Add</el-menu-item>
            <el-menu-item :index="blogFavoritesVar">Favorites</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="6" v-show="store.asideShowData.music">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'music']"/>
            </el-icon>
            Music
          </template>
          <el-menu-item-group>
            <el-menu-item :index="musicHomeVar">Home</el-menu-item>
            <el-menu-item :index="musicFavoritesVar">Favorites</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="7" v-show="store.asideShowData.english">
          <template #title>
            <el-icon>
              <font-awesome-icon :icon="['fas', 'globe']"/>
            </el-icon>
            English
          </template>
          <el-menu-item-group>
            <el-menu-item :index="englishPkVar">PK</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style scoped>

</style>