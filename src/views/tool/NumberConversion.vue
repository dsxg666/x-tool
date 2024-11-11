<script setup>
import {ref} from 'vue'

const decimal = ref('')
const binary = ref('')
const octal = ref('')
const hexadecimal = ref('')

// 验证输入是否合法，并允许复制、粘贴、全选等操作
const validateDecimal = (event) => {
  if (!isValidKey(event, /^[0-9]$/)) {
    event.preventDefault()
  }
}

const validateBinary = (event) => {
  if (!isValidKey(event, /^[01]$/)) {
    event.preventDefault()
  }
}

const validateOctal = (event) => {
  if (!isValidKey(event, /^[0-7]$/)) {
    event.preventDefault()
  }
}

const validateHexadecimal = (event) => {
  if (!isValidKey(event, /^[0-9a-fA-F]$/)) {
    event.preventDefault()
  }
}

// 验证粘贴内容是否合法
const validateDecimalPaste = (event) => {
  validatePaste(event, /^[0-9]+$/)
}

const validateBinaryPaste = (event) => {
  validatePaste(event, /^[01]+$/)
}

const validateOctalPaste = (event) => {
  validatePaste(event, /^[0-7]+$/)
}

const validateHexadecimalPaste = (event) => {
  validatePaste(event, /^[0-9a-fA-F]+$/)
}

// 处理键盘按键验证，允许常见组合键
const isValidKey = (event, regex) => {
  const key = event.key
  return (
      regex.test(key) || // 合法字符
      isControlKey(event) || // 控制键（删除、箭头等）
      (event.ctrlKey || event.metaKey) // 允许Ctrl/Cmd组合键（如复制、粘贴、全选）
  )
}

// 允许控制按键、复制粘贴和全选
const isControlKey = (event) => {
  const controlKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab']
  return controlKeys.includes(event.key)
}

// 验证粘贴的内容是否匹配特定的正则表达式
const validatePaste = (event, regex) => {
  const pasteData = (event.clipboardData || window.clipboardData).getData('text')
  if (!regex.test(pasteData)) {
    event.preventDefault()
  }
}

// 根据十进制转换其他进制
const convertFromDecimal = () => {
  if (decimal.value) {
    const num = parseInt(decimal.value, 10)
    binary.value = num.toString(2)
    octal.value = num.toString(8)
    hexadecimal.value = num.toString(16).toUpperCase()
  } else {
    clearValues()
  }
}

// 根据二进制转换其他进制
const convertFromBinary = () => {
  if (binary.value) {
    const num = parseInt(binary.value, 2)
    decimal.value = num.toString(10)
    octal.value = num.toString(8)
    hexadecimal.value = num.toString(16).toUpperCase()
  } else {
    clearValues()
  }
}

// 根据八进制转换其他进制
const convertFromOctal = () => {
  if (octal.value) {
    const num = parseInt(octal.value, 8)
    decimal.value = num.toString(10)
    binary.value = num.toString(2)
    hexadecimal.value = num.toString(16).toUpperCase()
  } else {
    clearValues()
  }
}

// 根据十六进制转换其他进制
const convertFromHexadecimal = () => {
  if (hexadecimal.value) {
    const num = parseInt(hexadecimal.value, 16)
    decimal.value = num.toString(10)
    binary.value = num.toString(2)
    octal.value = num.toString(8)
  } else {
    clearValues()
  }
}

// 清空所有值
const clearValues = () => {
  decimal.value = ''
  binary.value = ''
  octal.value = ''
  hexadecimal.value = ''
}
</script>

<template>
  <div class="main-box">
    <el-form label-width="80px" style="width: 50%">
      <el-form-item label="Decimal">
        <el-input
            v-model="decimal"
            placeholder="Please enter a decimal number"
            @keydown="validateDecimal"
            @paste="validateDecimalPaste"
            @input="convertFromDecimal"
            clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="Binary">
        <el-input
            v-model="binary"
            placeholder="Please enter a binary number"
            @keydown="validateBinary"
            @paste="validateBinaryPaste"
            @input="convertFromBinary"
            clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="Octal">
        <el-input
            v-model="octal"
            placeholder="Please enter a octal numbers"
            @keydown="validateOctal"
            @paste="validateOctalPaste"
            @input="convertFromOctal"
            clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="Hexadecimal">
        <el-input
            v-model="hexadecimal"
            placeholder="Please enter a hexadecimal number"
            @keydown="validateHexadecimal"
            @paste="validateHexadecimalPaste"
            @input="convertFromHexadecimal"
            clearable
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.main-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>