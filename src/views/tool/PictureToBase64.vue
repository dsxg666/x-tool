<script setup>
import {ref} from 'vue'
import {ElMessage} from "element-plus";

const base64String = ref('')

const handleImageUpload = (file) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    base64String.value = reader.result
  }
  return false
}

const base64String2 = ref('')
const imageSrc = ref('')

const convertToImage = () => {
  imageSrc.value = base64String2.value
}

const clean = () => {
  base64String2.value = ''
}

const copyFunc = async () => {
  try {
    await navigator.clipboard.writeText(base64String.value)
    ElMessage({
      message: 'copied',
      type: 'success',
      duration: 2000,
    })
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage({
      message: 'Copy failure',
      type: 'error',
      duration: 2000,
    })
  }
}
</script>

<template>
  <el-upload
      action=""
      :before-upload="handleImageUpload"
      list-type="picture"
  >
    <el-button style="width: 200px">Upload Picture</el-button>
  </el-upload>

  <el-button style="width: 200px;margin-bottom: 10px" @click="copyFunc">Copy</el-button>

  <el-input
      v-model="base64String"
      placeholder="base64 encoding"
      type="textarea"
      :rows="10"
      readonly
      style="margin-bottom: 10px"
  ></el-input>

  <el-input
      v-model="base64String2"
      placeholder="Please enter Base64 encoding"
      type="textarea"
      :rows="10"
      style="margin-bottom: 10px"
  ></el-input>

  <el-button @click="convertToImage" style="width: 200px">Convert To Picture</el-button>

  <el-button @click="clean" style="width: 200px">Empty</el-button>

  <div class="img-box">
    <img v-if="imageSrc" :src="imageSrc" style="max-height: 100%" alt="image"/>
  </div>
</template>

<style scoped>
.img-box{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #eee;
  margin-top: 10px;
}
</style>