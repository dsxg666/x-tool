<script setup>
import {reactive, ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from "element-plus"
import axiosUtilObj from '@/utils/axios.js'
import localStoreUtilObj from '@/utils/localstore.js'
import {infoStore} from '@/store/store.js'
import { User, Lock } from '@element-plus/icons-vue'

const store = infoStore()

const router = useRouter()

const activeTab = ref('passwordTab')

const passwordTabFormRef = ref()

const codeTabFormRef = ref()

const isRememberPass = ref(false)

const passwordTabFormData = reactive({
  email: '',
  password: '',
})

onMounted(() => {
  let e = localStoreUtilObj.get('email')
  let p = localStoreUtilObj.get('password')

  if (e && p) {
    passwordTabFormData.email = e
    passwordTabFormData.password = p
    isRememberPass.value = true
  }
})

const codeTabFormData = reactive({
  email: '',
  code: '',
})

const isPositiveIntegerString = (str) => {
  const num = Number(str);
  return Number.isInteger(num) && num > 0 && String(num) === str;
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

const passwordTabRules = {
  email: [{validator: validateEmail, trigger: ['blur', 'change']}],
  password: [
    {required: true, message: 'Must input password', trigger: 'blur'},
  ]
}

const codeTabRules = {
  email: [{validator: validateEmail, trigger: ['blur', 'change']}],
  code: [
    {required: true, message: 'Must input verification code', trigger: 'blur'},
  ]
}

const getVerificationCode = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (codeTabFormData.email.length > 0 && emailRegex.test(codeTabFormData.email)) {
    axiosUtilObj.get("/api/base/getVerificationCode?email=" + codeTabFormData.email).then(result => {
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

const passwordTabSubmit = () => {
  if (!passwordTabFormRef) return
  passwordTabFormRef.value.validate((valid) => {
    if (valid) {
      axiosUtilObj.post("/api/base/loginByPassword", passwordTabFormData).then(result => {
        if (result.code !== '100') {
          ElMessage.error(result.message)
        } else {
          let token = result.data['token']
          let [headerBase64, payloadBase64, signatureBase64] = token.split('.')
          let payload = atob(payloadBase64)
          let payloadObj = JSON.parse(payload)
          store.save(payloadObj.userId, payloadObj.username, payloadObj.exp, token, payloadObj.path)

          if (isRememberPass.value) {
            localStoreUtilObj.set('email', passwordTabFormData.email)
            localStoreUtilObj.set('password', passwordTabFormData.password)
          } else {
            localStoreUtilObj.remove('email')
            localStoreUtilObj.remove('password')
          }
          router.push('/' + payloadObj.path)
        }
      })
    } else {
      console.log('error submit!')
    }
  })
}

const codeTabSubmit = () => {
  if (!codeTabFormRef) return
  codeTabFormRef.value.validate((valid) => {
    if (valid) {
      axiosUtilObj.post("/api/base/loginByCode", codeTabFormData).then(result => {
        if (result.code !== '100') {
          ElMessage.error(result.message)
        } else {
          let token = result.data['token']
          let [headerBase64, payloadBase64, signatureBase64] = token.split('.')
          let payload = atob(payloadBase64)
          let payloadObj = JSON.parse(payload)
          store.save(payloadObj.userId, payloadObj.username, payloadObj.exp, token, payloadObj.path)
          router.push('/' + payloadObj.path)
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
      <div class="div-login">
        <el-tabs v-model="activeTab">
          <el-tab-pane
              label="Password"
              name="passwordTab"
          >
            <el-form
                ref="passwordTabFormRef"
                :model="passwordTabFormData"
                :rules="passwordTabRules"
            >
              <el-form-item
                  prop="email"
              >
                <el-input
                    class="login-width"
                    :prefix-icon="User"
                    v-model="passwordTabFormData.email"
                    type="text"
                    placeholder="Please input email"
                    clearable

                />
              </el-form-item>

              <el-form-item
                  prop="password"
              >
                <el-input
                    class="login-width"
                    :prefix-icon="Lock"
                    v-model="passwordTabFormData.password"
                    type="password"
                    placeholder="Please input password"
                    clearable
                    show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                    class="login-width"
                    type="primary"
                    @click="passwordTabSubmit()"
                >
                  Log In
                </el-button>
              </el-form-item>
              <div class="link-container">
                <el-checkbox v-model="isRememberPass" label="Remember" />
                <el-link href="/register" target="_blank">Sign Up</el-link>
              </div>
              <div class="icon-container">
                <font-awesome-icon class="github" :icon="['fab', 'github']"/>
              </div>
            </el-form>
          </el-tab-pane>
          <el-tab-pane
              label="Verification code"
              name="codeTab"
          >
            <el-form
                ref="codeTabFormRef"
                :model="codeTabFormData"
                :rules="codeTabRules"
            >
              <el-form-item
                  prop="email"
              >
                <el-input
                    class="login-width"
                    :prefix-icon="User"
                    v-model="codeTabFormData.email"
                    type="text"
                    placeholder="Please input email"
                    clearable
                />
              </el-form-item>

              <el-form-item
                  prop="code"
              >
                <div class="login-width">
                  <el-row :gutter="9">
                    <el-col :span="17">
                      <el-input
                          :prefix-icon="Lock"
                          v-model="codeTabFormData.code"
                          type="text"
                          placeholder="Input code here"
                          clearable
                      />
                    </el-col>
                    <el-col :span="7">
                      <el-button
                          type="primary"
                          @click="getVerificationCode()"
                      >
                        Get
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                    class="login-width"
                    type="primary"
                    @click="codeTabSubmit()"
                >
                  Log In
                </el-button>
              </el-form-item>
              <div class="icon-container">
                <font-awesome-icon class="github" :icon="['fab', 'github']"/>
              </div>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-watermark>
</template>

<style scoped>
@import '@/assets/css/normalize.css';
@import '@/assets/css/login.css';

@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
</style>