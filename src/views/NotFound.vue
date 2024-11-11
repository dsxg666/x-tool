<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/') // 跳转到首页
}
</script>

<template>
  <div class="not-found-container">
    <el-result title="404" sub-title="Sorry, request error.">
      <template #icon>
        <el-image
            style="width: 404px"
            src="/404.png"
            alt="404.png"
        />
      </template>
      <template #extra>
        <el-button type="primary" @click="goHome()">Back</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
@import '@/assets/css/normalize.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>