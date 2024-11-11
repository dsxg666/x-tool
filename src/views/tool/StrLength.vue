<script setup>
import {reactive, ref} from "vue";

const data = reactive({
  input: '',
})

const removeAllSpaces = () => {
  data.input = data.input.replace(/\s+/g, '')
}

const trimSpaces = () => {
  data.input = data.input.trim()
}
</script>

<template>
  <div class="strLength-container">
    <el-input v-model="data.input" style="width: 666px" placeholder="Please input string"/>
    <br>
    <el-button
        style="width: 666px"
        type="primary"
        @click="removeAllSpaces"
    >
      Remove All Spaces
    </el-button>
    <br>
    <el-button
        style="width: 666px"
        type="primary"
        @click="trimSpaces"
    >
      Trim Spaces
    </el-button>
    <el-text style="margin-top: 10px" size="large" type="info" tag="mark">The string contains {{ data.input.length }}
      characters.
    </el-text>
  </div>
</template>

<style scoped>
.strLength-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 60vh;
}
</style>