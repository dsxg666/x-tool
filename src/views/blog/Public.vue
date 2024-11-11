<script setup>
import {computed, onMounted, reactive, ref} from "vue"
import axiosUtilObj from '@/utils/axios.js'
import {infoStore} from "@/store/store.js"
import {Warning} from '@element-plus/icons-vue'
import timeUtilObj from "@/utils/time.js";

const store = infoStore()

const currentPage = ref(1)
const totalItem = ref(0)

const data = reactive({
  list: [],
  authorDetailList: [],
  likes: [],
  favorites: [],
  categoryMap: new Map(),
})

const search = ref('')

const filterTableData = computed(() =>
    data.list.filter(
        (data) =>
            !search.value ||
            data.title.toLowerCase().includes(search.value.toLowerCase())
    )
)

onMounted(async () => {
  data.categoryMap.set('Technology', 'Suitable for all technology-related content.')
  data.categoryMap.set('Life', 'Such as health, travel, food, family and more.')
  data.categoryMap.set('Education', 'Such as career development, study skills, online education and more.')
  data.categoryMap.set('Entertainment', 'Such as movies, music, games and more.')
  data.categoryMap.set('Creativity', 'Such as design, writing, photography and more.')
  data.categoryMap.set('Business', 'Such as entrepreneurship, marketing, e-commerce and more.')
  data.categoryMap.set('Finance', 'Such as personal finance, investing, cryptocurrencies and more.')
  data.categoryMap.set('Society', 'Such as news, culture, current affairs, environment and more.')

  let total = await axiosUtilObj.postToken("/api/auth/blog/getListTotalCount", store.data.token, null)
  totalItem.value = total.data

  let postList = await axiosUtilObj.postToken("/api/auth/blog/list", store.data.token, {currentPage: currentPage.value})
  if (postList.data !== undefined) {
    data.list = postList.data

    for (let i = 0; i < postList.data.length; i++) {
      data.list[i].publishedAt = timeUtilObj.StrToFormatDate(postList.data[i].publishedAt)

      let authorId = postList.data[i].userId
      let friendDetail = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: authorId})
      friendDetail.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${authorId}`
      data.authorDetailList.push(friendDetail.data)

      let id = postList.data[i].id
      let likes = await axiosUtilObj.postToken("/api/auth/blog/getLikesCount", store.data.token, {id: id})
      data.likes.push(likes.data)
      let favorites = await axiosUtilObj.postToken("/api/auth/blog/getFavoritesCount", store.data.token, {id: id})
      data.favorites.push(favorites.data)
    }
  }
})

const filterCategory = (value, row) => {
  return row.category === value
}

const handleCurrentChange = async (val) => {
  let postList = await axiosUtilObj.postToken("/api/auth/blog/list", store.data.token, {currentPage: val})
  if (postList.data !== undefined) {
    data.list = postList.data

    for (let i = 0; i < postList.data.length; i++) {
      data.list[i].publishedAt = timeUtilObj.StrToFormatDate(postList.data[i].publishedAt)

      let authorId = postList.data[i].userId
      let friendDetail = await axiosUtilObj.postToken("/api/auth/user/getUserById", store.data.token, {id: authorId})
      friendDetail.data.avatar = `${import.meta.env.VITE_API_URL}/api/base/getAvatar/${authorId}`
      data.authorDetailList.push(friendDetail.data)


      let id = postList.data[i].id
      let likes = await axiosUtilObj.postToken("/api/auth/blog/getLikesCount", store.data.token, {id: id})
      data.likes.push(likes.data)
      let favorites = await axiosUtilObj.postToken("/api/auth/blog/getFavoritesCount", store.data.token, {id: id})
      data.favorites.push(favorites.data)
    }
  }
}
</script>

<template>
  <el-table
      :data="filterTableData"
      stripe
      style="width: 100%"
      height="495"
  >
    <el-table-column prop="id" label="Post Id" width="80"/>

    <el-table-column label="Author Avatar">
      <template #default="scope">
        <el-tooltip
            effect="dark"
            :content="data.authorDetailList[data.list.indexOf(scope.row)].id"
            placement="top"
        >
          <el-avatar style="vertical-align: middle" shape="square"
                     :src="data.authorDetailList[data.list.indexOf(scope.row)].avatar"/>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="Author Name" mix-width="100">
      <template #default="scope">
        <el-tooltip
            effect="dark"
            :content="data.authorDetailList[data.list.indexOf(scope.row)].username"
            placement="top"
        >
          <el-text truncated>{{ data.authorDetailList[data.list.indexOf(scope.row)].username }}</el-text>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column min-width="120">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search"/>
      </template>
      <template #default="scope">
        <el-tooltip
            effect="dark"
            :content="scope.row.title"
            placement="top"
        >
          <router-link :to="{path: '/blog/publicPost', query: {id:scope.row.id}}"><el-text truncated type="primary">{{ scope.row.title }}</el-text></router-link>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column
        label="Category"
        min-width="120"
        :filters="[
          {text: 'Technology', value: 'Technology'},
          {text: 'Life', value: 'Life'},
          {text: 'Education', value: 'Education'},
          {text: 'Entertainment', value: 'Entertainment'},
          {text: 'Creativity', value: 'Creativity'},
          {text: 'Business', value: 'Business'},
          {text: 'Finance', value: 'Finance'},
          {text: 'Society', value: 'Society'},
      ]"
        :filter-method="filterCategory"
    >
      <template #default="scope">
        {{ scope.row.category }}
        <el-tooltip
            effect="dark"
            :content="data.categoryMap.get(scope.row.category)"
            placement="top"
        >
          <el-icon style="margin-left: 4px;vertical-align: middle" :size="12">
            <Warning/>
          </el-icon>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="Likes">
      <template #default="scope">
        {{ data.likes[data.list.indexOf(scope.row)] }}
      </template>
    </el-table-column>

    <el-table-column label="Favorites">
      <template #default="scope">
        {{ data.favorites[data.list.indexOf(scope.row)] }}
      </template>
    </el-table-column>

    <el-table-column prop="viewCount" label="Views"/>

    <el-table-column prop="publishedAt" label="Published At" width="160" sortable/>
  </el-table>
  <div style="display: flex; justify-content: center;margin-top: 20px">
    <el-pagination
        v-model:current-page="currentPage"
        layout="total, prev, pager, next, jumper"
        :page-size="100"
        :total="totalItem"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>

</style>
