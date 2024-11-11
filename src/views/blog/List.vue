<script setup>
import {computed, onMounted, reactive, ref} from "vue"
import axiosUtilObj from '@/utils/axios.js'
import {infoStore} from "@/store/store.js"
import {Warning} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import timeUtilObj from "@/utils/time.js";

const router = useRouter()
const store = infoStore()

const currentPage = ref(1)
const totalItem = ref(0)

const data = reactive({
  list: [],
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

  let total = await axiosUtilObj.postToken("/api/auth/blog/getMyListTotalCount", store.data.token, null)
  totalItem.value = total.data

  let myList = await axiosUtilObj.postToken("/api/auth/blog/myList", store.data.token, {currentPage: currentPage.value})
  if (myList.data !== undefined) {
    data.list = myList.data

    for (let i = 0; i < myList.data.length; i++) {
      data.list[i].createdAt = timeUtilObj.StrToFormatDate(myList.data[i].createdAt)

      let id = myList.data[i].id
      let likes = await axiosUtilObj.postToken("/api/auth/blog/getLikesCount", store.data.token, {id: id})
      data.likes.push(likes.data)
      let favorites = await axiosUtilObj.postToken("/api/auth/blog/getFavoritesCount", store.data.token, {id: id})
      data.favorites.push(favorites.data)
    }
  } else {
    data.list = []
  }
})

const toPublic = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to make this post public?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/blog/toPublic", store.data.token, {id: row.id})
        row.isPublic = '1'
        ElMessage({
          type: 'success',
          message: 'Switchover successful',
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Operate canceled',
        })
      })
}

const toPrivate = (row) => {
  ElMessageBox.confirm(
      'Are you sure you want to make this post private?',
      'Warning',
      {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
  )
      .then(async () => {
        await axiosUtilObj.postToken("/api/auth/blog/toPrivate", store.data.token, {id: row.id})
        row.isPublic = '0'
        ElMessage({
          type: 'success',
          message: 'Switchover successful',
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Operate canceled',
        })
      })
}

const editPost = (row) => {
  router.push({path: '/blog/edit', query: {id: row.id}})
}

const delPost = async (row) => {
  try {
    await ElMessageBox.confirm('Are you sure want to delete this post?', 'Warning', {
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
      type: 'warning'
    })

    await axiosUtilObj.postToken('/api/auth/blog/delete', store.data.token, {id: row.id})

    // let index = data.list.indexOf(row)
    // data.list.splice(index, 1)
    location.reload()
  } catch (err) {
    ElMessage({
      type: 'info',
      message: 'Delete canceled',
    })
  }
}

const filterCategory = (value, row) => {
  return row.category === value
}


const handleCurrentChange = async (val) => {
  let myList = await axiosUtilObj.postToken("/api/auth/blog/myList", store.data.token, {currentPage: val})
  if (myList.data !== undefined) {
    data.list = myList.data

    for (let i = 0; i < myList.data.length; i++) {
      data.list[i].createdAt = timeUtilObj.StrToFormatDate(myList.data[i].createdAt)

      let id = myList.data[i].id
      let likes = await axiosUtilObj.postToken("/api/auth/blog/getLikesCount", store.data.token, {id: id})
      data.likes.push(likes.data)
      let favorites = await axiosUtilObj.postToken("/api/auth/blog/getFavoritesCount", store.data.token, {id: id})
      data.favorites.push(favorites.data)
    }
  } else {
    data.list = []
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
    <el-table-column prop="id" label="Id" width="80"/>

    <el-table-column label="Title" min-width="120">
      <template #default="scope">
        <el-tooltip
            effect="dark"
            :content="scope.row.title"
            placement="top"
        >
          <router-link :to="{path: '/blog/post', query: {id:scope.row.id}}"><el-text truncated type="primary">{{ scope.row.title }}</el-text></router-link>
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

    <el-table-column>
      <template #header>
        Is Public
        <el-tooltip
            effect="dark"
            content="Whether to publish your post on public platform."
            placement="top"
        >
          <el-icon style="margin-left: 4px;vertical-align: middle" :size="12">
            <Warning/>
          </el-icon>
        </el-tooltip>
      </template>
      <template #default="scope">
        <el-button style="width: 66px" size="small" type="success" @click="toPrivate(scope.row)" v-if="scope.row.isPublic === '1'">public
        </el-button>
        <el-button style="width: 66px" size="small" type="warning" @click="toPublic(scope.row)" v-if="scope.row.isPublic === '0'">private
        </el-button>
      </template>
    </el-table-column>

    <el-table-column label="Likes">
      <template #default="scope">
        {{data.likes[data.list.indexOf(scope.row)]}}
      </template>
    </el-table-column>

    <el-table-column label="Favorites">
      <template #default="scope">
        {{data.favorites[data.list.indexOf(scope.row)]}}
      </template>
    </el-table-column>

    <el-table-column prop="viewCount" label="Views"/>

    <el-table-column prop="createdAt" label="Created At" width="160" sortable/>

    <el-table-column fixed="right" min-width="140">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search"/>
      </template>
      <template #default="scope">
        <el-button type="primary" size="small" @click="editPost(scope.row)">Edit</el-button>
        <el-button type="danger" size="small" @click="delPost(scope.row)">Delete</el-button>
      </template>
    </el-table-column>
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
