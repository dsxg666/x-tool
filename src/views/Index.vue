<script setup>
import Aside from '@/components/Aside.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <el-container>
    <el-header>
      <Header/>
    </el-header>
    <el-container>
      <Aside/>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
@import '@/assets/css/normalize.css';

@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
</style>