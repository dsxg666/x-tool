<script setup>
import {reactive, computed, ref, onMounted} from "vue"
import axiosUtilObj from '@/utils/axios.js'
import timeUtilObj from '@/utils/time.js'
import localStoreUtilObj from '@/utils/localstore.js'
import {infoStore} from '@/store/store.js'
import {ElMessage, ElMessageBox} from "element-plus"
import {useRouter} from 'vue-router'

const router = useRouter()

const store = infoStore()

const data = reactive({
  list: []
})

const priorityOrder = {
  'High': 1,
  'Medium': 2,
  'Low': 3
};

const sortedList = computed(() => {
  return data.list.slice().sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1
    if (b.status === 'Completed' && a.status !== 'Completed') return -1

    if (priorityOrder[a.priority] < priorityOrder[b.priority]) return -1
    if (priorityOrder[a.priority] > priorityOrder[b.priority]) return 1

    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

const tableRowClassName = ({row, rowIndex}) => {
  if (row.status === 'Completed') {
    return 'success-row'
  } else if (row.priority === 'High') {
    return 'danger-row'
  } else if (row.priority === 'Medium') {
    return 'warning-row'
  }
  return ''
}

const tableRef = ref(null)

const clearFilter = () => {
  tableRef.value.clearFilter()
}

const filterPriority = (value, row) => {
  return row.priority === value
}

const filterStatus = (value, row) => {
  return row.status === value
}

const showBorder = ref(false)
if (localStoreUtilObj.get('showBorder') != null) {
  showBorder.value = localStoreUtilObj.get('showBorder') === 'true'
}

const selectDay = ref('')
if (localStoreUtilObj.get('selectDay') != null) {
  selectDay.value = localStoreUtilObj.get('selectDay')
}

const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

const delTodo = async (row) => {
  try {
    await ElMessageBox.confirm('Are you sure want to delete?', 'Warning', {
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
      type: 'warning'
    })

    await axiosUtilObj.postToken('/api/auth/todolist/delete', store.data.token, {id: row.id})

    if (selectDay.value === '') {
      let result = await axiosUtilObj.postToken('/api/auth/todolist/list', store.data.token, {date: timeUtilObj.getNowFormatYMD()})
      if (result.data !== undefined) {
        data.list = result.data
      } else {
        data.list = []
      }
    } else {
      let result = await axiosUtilObj.postToken('/api/auth/todolist/list', store.data.token, {date: timeUtilObj.StrToFormatYMD(selectDay.value)})
      if (result.data !== undefined) {
        data.list = result.data
      } else {
        data.list = []
      }
    }

    ElMessage({
      type: 'success',
      message: 'Delete completed',
    })
  } catch (err) {
    ElMessage({
      type: 'info',
      message: 'Delete canceled',
    })
  }
}

const editTodo = (row) => {
  router.push({path: '/todolist/edit', query: {id: row.id}})
}

const handleDateChange = (date) => {
  localStoreUtilObj.set('selectDay', timeUtilObj.formatYMD(date))
  axiosUtilObj.postToken('/api/auth/todolist/list', store.data.token, {date: timeUtilObj.formatYMD(date)}).then(result => {
    if (result.data !== undefined) {
      data.list = result.data
    } else {
      data.list = []
    }
  })
}

const handleSwitchChange = (value) => {
  localStoreUtilObj.set('showBorder', value)
}

onMounted(() => {
  if (selectDay.value === '') {
    axiosUtilObj.postToken('/api/auth/todolist/list', store.data.token, {date: timeUtilObj.getNowFormatYMD()}).then(result => {
      if (result.data !== undefined) {
        data.list = result.data
      } else {
        data.list = []
      }
    }).catch(error => {
      console.log(error)
    })
  } else {
    axiosUtilObj.postToken('/api/auth/todolist/list', store.data.token, {date: timeUtilObj.StrToFormatYMD(selectDay.value)}).then(result => {
      if (result.data !== undefined) {
        data.list = result.data
      } else {
        data.list = []
      }
    }).catch(error => {
      console.log(error)
    })
  }
})
</script>

<template>
  <div style="margin-bottom: 20px">
    <el-date-picker
        v-model="selectDay"
        type="date"
        placeholder="pick a day"
        :disabled-date="disabledDate"
        @change="handleDateChange"
    />
    <el-button style="margin: 0 20px" @click="clearFilter">reset all filters</el-button>
    <el-text>show border:&nbsp;&nbsp;</el-text>
    <el-switch style="--el-switch-on-color: #13ce66; --el-switch-off-color: #aaa"
               v-model="showBorder"
               @change="handleSwitchChange"/>
  </div>
  <el-table
      ref="tableRef"
      :data="sortedList"
      style="width: 100%"
      height="520"
      :row-class-name="tableRowClassName"
      :border="showBorder"
  >
    <el-table-column label="No" width="60">
      <template #default="scope">
        {{ scope.$index }}
      </template>
    </el-table-column>
    <el-table-column prop="title" label="Title" width="120" show-overflow-tooltip/>
    <el-table-column
        prop="priority"
        label="Priority"
        width="100"
        :filters="[
        { text: 'High', value: 'High' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Low', value: 'Low' },
      ]"
        :filter-method="filterPriority"
    >
      <template #default="scope">
        <el-tag
            :type="(() => {
    switch (scope.row.priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      default:
        return 'info';
    }
  })()"
            disable-transitions
        >
          {{ scope.row.priority }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
        prop="status"
        label="Status"
        width="120"
        :filters="[
        { text: 'Todo', value: 'Todo' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
      ]"
        :filter-method="filterStatus"
    >
      <template #default="scope">
        <el-tag
            :type="(() => {
    switch (scope.row.status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      default:
        return 'info';
    }
  })()"
            disable-transitions
        >
          {{ scope.row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Date" width="160">
      <template #default="scope">
        {{ timeUtilObj.StrToFormatDate(scope.row.createdAt) }}
      </template>
    </el-table-column>

    <el-table-column label="Due Date" width="1010">
      <template #default="scope">
        {{ timeUtilObj.StrToFormatDate(scope.row.dueDate) }}
      </template>
    </el-table-column>

    <el-table-column fixed="right" label="Operations" min-width="140">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editTodo(scope.row)">Edit</el-button>
        <el-button link type="danger" size="small" @click="delTodo(scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.el-table:deep(.danger-row) {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

.el-table:deep(.success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.el-table:deep(.warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
</style>