<script setup>
import {reactive, ref, onBeforeUnmount, shallowRef} from "vue";
import {infoStore} from "@/store/store.js";
import axiosUtilObj from "@/utils/axios.js";
import {ElMessage} from "element-plus";

import '@wangeditor/editor/dist/css/style.css'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {i18nChangeLanguage} from '@wangeditor/editor'
import {Boot} from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'
import editorConfigObj from '@/assets/js/editor2.js'

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
  category: '',
  content: ''
})

const rules = {
  title: [
    {required: true, message: 'Must input the title', trigger: 'blur'},
    {min: 1, max: 20, message: 'Title should be 1~20!', trigger: 'blur'},
  ],
  category: [
    {required: true, message: 'Must select category', trigger: 'blur'},
  ]
}

const categoryOptions = [
  {label: 'Technology: Suitable for all technology-related content.', value: 'Technology'},
  {label: 'Life: Such as health, travel, food, family and more.', value: 'Life'},
  {label: 'Education: Such as career development, study skills, online education and more.', value: 'Education'},
  {label: 'Entertainment: Such as movies, music, games and more.', value: 'Entertainment'},
  {label: 'Creativity: Such as design, writing, photography and more.', value: 'Creativity'},
  {label: 'Business: Such as entrepreneurship, marketing, e-commerce and more.', value: 'Business'},
  {label: 'Finance: Such as personal finance, investing, cryptocurrencies and more.', value: 'Finance'},
  {label: 'Society: Such as news, culture, current affairs, environment and more.', value: 'Society'},
]

const addPost = () => {
  if (!formRef) return
  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.content !== '') {
        axiosUtilObj.postToken("/api/auth/blog/add", store.data.token, formData).then(result => {
          if (result.code === '100') {
            ElMessage.success('Add successfully!')
          }
        }).catch(error => {
          console.log(error)
        })
      } else {
        ElMessage.warning('Must input content!')
      }
    } else {
      console.log('error submit!')
    }
  })
}

</script>

<template>
  <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
  >

    <el-form-item prop="title">
      <el-input
          class="box-width"
          v-model="formData.title"
          type="text"
          placeholder="Please input title"
          clearable
      />
    </el-form-item>

    <el-form-item prop="category">
      <el-select
          class="box-width"
          v-model="formData.category"
          placeholder="Please select category">
        <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button
          class="box-width"
          type="primary"
          @click="addPost()"
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
            style="min-height: 1000px;overflow-y: hidden;"
            v-model="formData.content"
            :defaultConfig="editorConfigObj.editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
        />
      </div>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.box-width {
  width: 100%
}
</style>