<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const jsonInput = ref('')
const beautifiedJson = ref('')
const num = ref(2)

const beautifyJson = () => {
  try {
    const parsed = JSON.parse(jsonInput.value)
    beautifiedJson.value = JSON.stringify(parsed, null, num.value)
  } catch (e) {
    ElMessage.error('Invalid json string!')
  }
}

const clear = () => {
  jsonInput.value = ''
  beautifiedJson.value = ''
}

const copyFunc = async () => {
  try {
    await navigator.clipboard.writeText(beautifiedJson.value)
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
  <el-row :gutter="20">
    <el-col :span="12">
      <el-input
          type="textarea"
          v-model="jsonInput"
          placeholder="Please enter a JSON string"
          :rows="15"
      />
      <el-button type="primary" @click="beautifyJson" style="width: 100%;margin: 10px 0">Beautify</el-button><br>
      <el-input-number v-model="num" :min="1" :max="10" style="width: 100%"/><br>
      <el-button type="danger" @click="clear" style="width: 100%;margin-top: 10px">Empty</el-button>
    </el-col>

    <el-col :span="12">
      <el-input
          type="textarea"
          :value="beautifiedJson"
          readonly
          :rows="15"
          placeholder="The result after beautification"
      />
      <el-button type="success" @click="copyFunc" style="width: 100%;margin-top: 10px">Copy</el-button>
    </el-col>
  </el-row>
</template>

<style scoped>
</style>