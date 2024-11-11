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
import {useRouter, useRoute} from "vue-router"
import editorConfigObj from '@/assets/js/editor.js'

const router = useRouter()
const route = useRoute()

const id = route.query.id

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
  id: '',
  userId: '',
  title: '',
  description: '',
  priority: '',
  status: '',
  dueDate: '',
})

axiosUtilObj.getToken(`/api/auth/todolist/getById?id=${id}`, store.data.token).then(result => {
  if (result.code === '100') {
    formData.id = result.data.id
    formData.userId = result.data.userId
    formData.title = result.data.title
    formData.description = result.data.description
    formData.priority = result.data.priority
    formData.status = result.data.status
    formData.dueDate = result.data.dueDate
  } else {
    router.go(-1)
  }
}).catch(err => {
  console.log(err)
})

const rules = {
  title: [
    {required: true, message: 'Please input the username', trigger: 'blur'},
    {min: 1, max: 20, message: 'Title should be 1~20!', trigger: 'blur'},
  ],
  dueDate: [
    {required: true, message: 'Please select due date', trigger: 'blur'},
  ]
}

const editTodo = () => {
  if (!formRef) return
  formRef.value.validate((valid) => {
    if (valid) {
      formData.dueDate = timeUtilObj.StrToFormatDate(formData.dueDate)
      axiosUtilObj.postToken("/api/auth/todolist/edit", store.data.token, formData).then(result => {
        if (result.code === '100') {
          ElMessage.success('Edit successfully')
        }
      }).catch(error => {
        console.log(error)
      })
    } else {
      console.log('error submit!')
    }
  })
}

const back = () => {
  router.go(-1)
}

const shortcuts = [
  {
    text: 'Tomorrow',
    value: () => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
  },
  {
    text: 'A week later',
    value: () => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date
    },
  },
]

const priorityOptions = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
];

const statusOptions = [
  { label: 'Completed', value: 'Completed' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Todo', value: 'Todo' }
];
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
            class="edit-width"
            v-model="formData.title"
            type="text"
            placeholder="Please input title"
            clearable
        />
      </el-form-item>

      <el-form-item>
        <el-select
            class="edit-width"
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

      <el-form-item>
        <el-select
            class="edit-width"
            v-model="formData.status"
            placeholder="Select status"
        >
          <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="dueDate">
        <el-date-picker
            v-model="formData.dueDate"
            type="datetime"
            placeholder="Select due date"
            :shortcuts="shortcuts"
        />
      </el-form-item>

      <el-form-item>
        <el-button
            class="edit-width"
            type="primary"
            @click="editTodo"
        >
          Edit
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button
            class="edit-width"
            type="primary"
            @click="back"
        >
          Back
        </el-button>
      </el-form-item>

      <el-form-item>
        <div style="border: 1px solid #ddd">
          <Toolbar
              style="border-bottom: 1px solid #ddd"
              :editor="editorRef"
              :defaultConfig="editorConfigObj.toolbarConfig"
              :mode="mode"
          />
          <Editor
              style="height: 310px;  overflow-y: hidden;"
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
.edit-width {
  width: 220px;
}
</style>