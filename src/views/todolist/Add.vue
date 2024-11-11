<script setup>
import {reactive, ref, onBeforeUnmount, shallowRef} from "vue"
import {infoStore} from '@/store/store.js'
import axiosUtilObj from "@/utils/axios.js"

import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { i18nChangeLanguage } from '@wangeditor/editor'
import { Boot } from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'
import {ElMessage} from "element-plus";
import timeUtilObj from '@/utils/time.js'
import editorConfigObj from '@/assets/js/editor.js'

Boot.registerModule(markdownModule)

i18nChangeLanguage('en')

const editorRef = shallowRef()

const mode = ref('simple')

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})

const handleCreated = (editor) => {
  editorRef.value = editor
}

const store = infoStore()

const formRef = ref()

const formData = reactive({
  userId: store.data.userId,
  title: '',
  description: '',
  priority: 'Low',
  status: 'Todo',
  dueDate: '',
})

const rules = {
  title: [
    {required: true, message: 'Must input the title', trigger: 'blur'},
    {min: 1, max: 20, message: 'Title should be 1~20!', trigger: 'blur'},
  ],
  dueDate: [
    {required: true, message: 'Must select due date', trigger: 'blur'},
  ]
}

const addTodo = () => {
  if (!formRef) return
  formRef.value.validate((valid) => {
    if (valid) {
      formData.dueDate = timeUtilObj.StrToFormatDate(formData.dueDate)

      axiosUtilObj.postToken("/api/auth/todolist/add", store.data.token, formData).then(result => {
        if (result.code === '100') {
          ElMessage.success('Add successfully!')
        }
      }).catch(error => {
        console.log(error)
      })
    } else {
      console.log('error submit!')
    }
  })
}

const shortcuts = [
  {
    text: 'An hour later',
    value: () => {
      let date = new Date()
      date.setHours(date.getHours() + 1)
      return date
    },
  },
  {
    text: '3 hours later',
    value: () => {
      let date = new Date()
      date.setHours(date.getHours() + 3)
      return date
    },
  },
  {
    text: '5 hours later',
    value: () => {
      let date = new Date()
      date.setHours(date.getHours() + 5)
      return date
    },
  },
  {
    text: '12 hours later',
    value: () => {
      let date = new Date()
      date.setHours(date.getHours() + 12)
      return date
    },
  },
  {
    text: 'Tomorrow',
    value: () => {
      let date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
  },
  {
    text: 'A week later',
    value: () => {
      let date = new Date()
      date.setDate(date.getDate() + 7)
      return date
    },
  },
]

const priorityOptions = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
]

const disabledDate = (time) => {
  let date = new Date()
  date.setDate(date.getDate() - 1)
  return time.getTime() < date
}

</script>

<template>
  <div>
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
    >
      <el-form-item
          prop="title"
      >
        <el-input
            class="add-width"
            v-model="formData.title"
            type="text"
            placeholder="Please input title"
            clearable
        />
      </el-form-item>

      <el-form-item>
        <el-select
            class="add-width"
            v-model="formData.priority"
            placeholder="Select priority"
        >
          <el-option
              v-for="item in priorityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="dueDate">
        <el-date-picker
            style="width: 100%"
            v-model="formData.dueDate"
            type="datetime"
            placeholder="Select due date"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
        />
      </el-form-item>

      <el-form-item>
        <el-button
            class="add-width"
            type="primary"
            @click="addTodo()"
        >
          Add
        </el-button>
      </el-form-item>

      <el-form-item>
        <div style="border: 1px solid #ddd;width: 100%">
          <Toolbar
              style="border-bottom: 1px solid #ddd"
              :editor="editorRef"
              :defaultConfig="editorConfigObj.toolbarConfig"
              :mode="mode"
          />
          <Editor
              style="min-height: 345px;overflow-y: hidden;"
              v-model="formData.description"
              :defaultConfig="editorConfigObj.editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
          />
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.add-width {
  width: 100%;
}
</style>