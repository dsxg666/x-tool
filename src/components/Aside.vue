<script setup>

</script>

<template>
  <el-aside width="200px">
    <el-scrollbar>
      <el-menu router>
        <el-sub-menu index="1">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'toolbox']" /></el-icon>Tool
          </template>
          <el-menu-item-group title="development">
            <el-menu-item index="/tool/getStrLength">String Length</el-menu-item>
            <el-menu-item index="/tool/timestamp">Timestamp</el-menu-item>
            <el-menu-item index="/tool/numberConversion">Number Conversion</el-menu-item>
            <el-menu-item index="/tool/jsonBeautify">Json Beautify</el-menu-item>
            <el-menu-item index="/tool/pictureToBase64">Picture To Base64</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="life">
            <el-menu-item index="/tool/date">Date Calculation</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="2">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'comment-dots']" /></el-icon>Chatroom
          </template>
          <el-menu-item-group>
            <el-menu-item index="/chatroom/conversations">Conversations</el-menu-item>
            <el-menu-item index="/chatroom/contacts">Contacts</el-menu-item>
            <el-menu-item index="/chatroom/groups">Groups</el-menu-item>
            <el-menu-item index="/chatroom/requests">Requests</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'clipboard-list']" /></el-icon>Todolist
          </template>
          <el-menu-item-group>
            <el-menu-item index="/todolist/list">List</el-menu-item>
            <el-menu-item index="/todolist/add">Add</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'gamepad']" /></el-icon>Game
          </template>
          <el-sub-menu index="4-1">
            <template #title>Gluttonous Snake</template>
            <el-menu-item index="/game/gluttonousSnake/infiniteMode">Infinite Mode</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'book']" /></el-icon>Blog
          </template>
          <el-menu-item-group>
            <el-menu-item index="/blog/public">Public</el-menu-item>
            <el-menu-item index="/blog/list">My List</el-menu-item>
            <el-menu-item index="/blog/add">Add</el-menu-item>
            <el-menu-item index="/blog/favorites">Favorites</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon><font-awesome-icon :icon="['fas', 'music']" /></el-icon>Music
          </template>
          <el-menu-item-group>
            <el-menu-item index="/music/home">Home</el-menu-item>
            <el-menu-item index="/music/favorites">Favorites</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style scoped>

</style>