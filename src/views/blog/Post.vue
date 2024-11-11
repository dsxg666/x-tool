<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, shallowRef} from "vue";
import {useRouter, useRoute} from "vue-router"
import axiosUtilObj from "@/utils/axios.js"
import {infoStore} from '@/store/store.js'

import '@wangeditor/editor/dist/css/style.css'
import {Editor} from '@wangeditor/editor-for-vue'

const editorRef = shallowRef()
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})

const handleCreated = (editor) => {
  editorRef.value = editor
}

const editorConfig = {
  readOnly: true,
}

const store = infoStore()
const router = useRouter()
const route = useRoute()

const id = route.query.id

const data = reactive({
  title: '',
  viewCount: '',
  likes: 0,
  favorites: 0,
  isLike: false,
  isFavorite: false,
})

const anchorLinks = ref([])

onMounted(async () => {
  const post = await axiosUtilObj.postToken('/api/auth/blog/getById', store.data.token, {id: id})
  const editor = editorRef.value
  if (post.code === '100') {
    await axiosUtilObj.postToken('/api/auth/blog/addView', store.data.token, {id: id})

    data.title = post.data.title
    data.viewCount = post.data.viewCount
    editor.setHtml(post.data.content)

    let likes = await axiosUtilObj.postToken("/api/auth/blog/getLikesCount", store.data.token, {id: id})
    data.likes = parseInt(likes.data)
    let isLike = await axiosUtilObj.postToken("/api/auth/blog/isLike", store.data.token, {id: id})
    data.isLike = isLike.data === '1';
    let favorites = await axiosUtilObj.postToken("/api/auth/blog/getFavoritesCount", store.data.token, {id: id})
    data.favorites = parseInt(favorites.data)
    let isFavorite = await axiosUtilObj.postToken("/api/auth/blog/isFavorite", store.data.token, {id: id})
    data.isFavorite = isFavorite.data === '1';
  } else {
    router.go(-1)
  }

  const headings = document.querySelectorAll('#post-content h2, #post-content h4')

  anchorLinks.value = Array.from(headings).map((heading) => {
    return {
      id: heading.id,
      title: heading.innerText,
      level: heading.tagName === 'H2' ? 2 : 4
    }
  })
})

const like = async () => {
  await axiosUtilObj.postToken("/api/auth/blog/like", store.data.token, {id: id})
  data.likes += 1
  data.isLike = true
}

const cancelLike = async () => {
  await axiosUtilObj.postToken("/api/auth/blog/cancelLike", store.data.token, {id: id})
  data.likes -= 1
  data.isLike = false
}

const favorite = async () => {
  await axiosUtilObj.postToken("/api/auth/blog/favorite", store.data.token, {id: id})
  data.favorites += 1
  data.isFavorite = true
}

const cancelFavorite = async () => {
  await axiosUtilObj.postToken("/api/auth/blog/cancelFavorite", store.data.token, {id: id})
  data.favorites -= 1
  data.isFavorite = false
}

const back = () => {
  router.go(-1)
}

</script>

<template>
  <el-backtop :right="100" :bottom="100"/>
  <el-container>
    <el-main>
      <el-button type="primary" style="width: 100%;margin-bottom: 10px" @click="back">back</el-button>
      <el-card>
        <Editor
            id="post-content"
            :defaultConfig="editorConfig"
            @onCreated="handleCreated"
        />
      </el-card>
    </el-main>
    <el-aside width="20%">
      <el-affix :offset="130">
        <div style="margin-bottom: 20px">
          <el-row :gutter="10" style="user-select: none">
            <el-col v-if="data.isLike" :span="8" @click="cancelLike" style="color: #2151d1;cursor: pointer">
              <font-awesome-icon :icon="['fas', 'thumbs-up']"/>
              {{data.likes}}
            </el-col>
            <el-col v-if="!data.isLike" :span="8" @click="like" style="color: grey;cursor: pointer">
              <font-awesome-icon :icon="['fas', 'thumbs-up']"/>
              {{data.likes}}
            </el-col>
            <el-col v-if="data.isFavorite" :span="8" @click="cancelFavorite" style="color: #2151d1;cursor: pointer">
              <font-awesome-icon :icon="['fas', 'star']"/>
              {{data.favorites}}
            </el-col>
            <el-col v-if="!data.isFavorite" :span="8" @click="favorite" style="color: grey;cursor: pointer">
              <font-awesome-icon :icon="['fas', 'star']"/>
              {{data.favorites}}
            </el-col>
            <el-col :span="8">
              <font-awesome-icon :icon="['fas', 'eye']"/>
              {{data.viewCount}}
            </el-col>
          </el-row>
        </div>
        <h3>{{data.title}}</h3>
        <el-anchor type="underline">
          <el-anchor-link
              v-for="(link, index) in anchorLinks"
              :key="index"
              :href="`#${link.id}`"
              :title="link.title"
              :class="{ 'sub-link': link.level === 4 }"
          />
        </el-anchor>
      </el-affix>
    </el-aside>
  </el-container>
</template>

<style scoped>
.sub-link {
  margin-left: 20px;
}
</style>