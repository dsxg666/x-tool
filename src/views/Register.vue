<script setup>
import {reactive, ref} from 'vue'
import {ElMessage} from "element-plus"
import axiosUtilObj from '@/utils/axios.js'

const formRef = ref()

const formData = reactive({
  username: '',
  password: '',
  checkPass: '',
  email: '',
  code: '',
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  } else {
    if (formData.checkPass !== '') {
      if (!formRef.value) return
      formRef.value.validateField('checkPass')
    }
    callback()
  }
}

const validatePassword2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== formData.password) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (value === '') {
    return callback(new Error('Please input the email'))
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return callback(new Error('Please input a valid email address'))
  } else {
    return callback()
  }
}

const rules = {
  password: [{validator: validatePassword, trigger: "blur"}],
  checkPass: [{validator: validatePassword2, trigger: ['blur', 'change']}],
  email: [{validator: validateEmail, trigger: ['blur', 'change']}],
  username: [
    {required: true, message: 'Please input the username', trigger: 'blur'},
    {min: 1, max: 8, message: 'Username must be 1~8 character', trigger: 'blur'},
  ],
  code: [
    {required: true, message: 'Must input verification code', trigger: 'blur'},
  ]
}

const getRegisterCode = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (formData.email.length > 0 && emailRegex.test(formData.email)) {
    axiosUtilObj.get("/api/base/getRegisterCode?email=" + formData.email).then(result => {
      if (result.code !== '100') {
        ElMessage.error(result.message)
      } else {
        ElMessage.success(result.message)
      }
    })
  } else {
    ElMessage.error("Valid email address");
  }
}

const onSubmit = () => {
  if (!formRef) return
  formRef.value.validate((valid) => {
    if (valid) {
      axiosUtilObj.post("/api/base/register", formData).then(result => {
        if (result.code !== '100') {
          ElMessage.error(result.message)
        } else {
          ElMessage.success(result.message)
        }
      })
    } else {
      console.log('error submit!')
    }
  })
}

const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
})
</script>

<template>
  <el-watermark :font="font" content="lankaiyun">
    <div style="height: 100%">
      <div class="div-register">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
          <el-form-item
              prop="username"
          >
            <el-input
                class="register-width"
                v-model="formData.username"
                type="text"
                placeholder="Please input username"
                maxlength="10"
                show-word-limit
                clearable
            />
          </el-form-item>

          <el-form-item
              prop="email"
          >
            <el-input
                class="register-width"
                v-model="formData.email"
                type="text"
                placeholder="Please input email address"
                clearable
            />
          </el-form-item>

          <el-form-item
              prop="code"
          >
            <div class="register-width">
              <el-row :gutter="10">
                <el-col :span="18">
                  <el-input
                      v-model="formData.code"
                      type="text"
                      placeholder="Please input code"
                      maxlength="6"
                      show-word-limit
                      clearable
                  />
                </el-col>
                <el-col :span="6">
                  <el-button
                      type="primary"
                      @click="getRegisterCode()"
                  >
                    Get
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </el-form-item>

          <el-form-item
              prop="password"
          >
            <el-input
                class="register-width"
                v-model="formData.password"
                type="password"
                placeholder="Please input password"
                clearable
                show-password
            />
          </el-form-item>

          <el-form-item
              prop="checkPass"
          >
            <el-input
                class="register-width"
                v-model="formData.checkPass"
                type="password"
                placeholder="Please input password again"
                clearable
                show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
                class="register-width"
                type="primary"
                @click="onSubmit()"
            >
              Sign Up
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </el-watermark>
</template>

<style scoped>
@import '@/assets/css/normalize.css';
@import '@/assets/css/register.css';

@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
</style>