<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {ElMessage} from "element-plus"
import timeUtilObj from '@/utils/time.js'

const currentTimestamp = ref(Math.floor(Date.now() / 1000))
const isRunning = ref(true)
let intervalId = null

// 动态更新时间戳
const updateTimestamp = () => {
  if (isRunning.value) {
    currentTimestamp.value = Math.floor(Date.now() / 1000)
  }
}

const toggleTimestamp = () => {
  isRunning.value = !isRunning.value;
  if (isRunning.value) {
    intervalId = setInterval(updateTimestamp, 1000)
  } else {
    clearInterval(intervalId);
  }
}

onMounted(() => {
  intervalId = setInterval(updateTimestamp, 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})


const timestampInput = ref(Math.floor(Date.now() / 1000).toString())
const dateTime = ref('')

const convertTimestampToDateTime = () => {
  if (timestampInput.value) {
    dateTime.value = timeUtilObj.timestampToFormatDate(parseInt(timestampInput.value))
  }
};

const dateTimeInput = ref(timeUtilObj.getNowFormatDate())
const timestamp = ref('')

const convertDateTimeToTimestamp = () => {
  if (dateTimeInput.value) {
    timestamp.value = Math.floor(new Date(dateTimeInput.value).getTime() / 1000).toString()
  }
}

const copyFunc = async (val) => {
  try {
    await navigator.clipboard.writeText(val)
    ElMessage({
      message: 'DateTime copied',
      type: 'success',
      duration: 2000,
    })
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage({
      message: 'copy failure',
      type: 'error',
      duration: 2000,
    })
  }
}

const tableData = [
  {
    halfAnHour: '1800',
    anHour: '3600',
    sixHours: '21600',
    twelveHours: '43200',
    aDay: '86400',
    twoDays: '172800',
  },
]

</script>

<template>
  <div
      class="box"
      :style="{boxShadow: `var(--el-box-shadow-dark)`}"
  >
    <div class="timestamp-row">
      <div class="timestamp-text" style="user-select: none">
        <span>Real-time Timestamp:&nbsp;&nbsp;&nbsp;</span>
        <el-text size="small" type="success" @click="copyFunc(currentTimestamp.toString())" style="cursor: pointer;">
          {{ currentTimestamp }}
        </el-text>
      </div>
      <el-button v-if="isRunning" size="large" link type="danger" @click="toggleTimestamp">
        <font-awesome-icon :icon="['fas', 'pause']"/>&nbsp;pause
      </el-button>
      <el-button v-if="!isRunning" size="large" link type="success" @click="toggleTimestamp">
        <font-awesome-icon :icon="['fas', 'play']"/>&nbsp;resume
      </el-button>
    </div>

    <div style="margin-top: 20px;" class="input-row">
      <el-input v-model="timestampInput" style="width: 100%;margin-bottom: 5px" clearable></el-input>
      <el-button type="primary" @click="convertTimestampToDateTime" style="width: 100%">Convert To Datetime</el-button>
    </div>
    <div style="margin-top: 20px" class="timestamp-row">
      <div class="timestamp-text" style="user-select: none">
        <span>Result:&nbsp;&nbsp;&nbsp;</span>
        <el-text size="small" type="success" @click="copyFunc(dateTime)" style="cursor: pointer;">{{
            dateTime
          }}
        </el-text>
      </div>
    </div>
    <div style="margin-top: 20px;" class="input-row">
      <el-date-picker v-model="dateTimeInput" type="datetime" style="width: 100%;margin-bottom: 5px"></el-date-picker>
      <el-button type="primary" @click="convertDateTimeToTimestamp" style="width: 100%;">Convert To Timestamp</el-button>
    </div>
    <div style="margin-top: 20px" class="timestamp-row">
      <div class="timestamp-text" style="user-select: none">
        <span>Result:&nbsp;&nbsp;&nbsp;</span>
        <el-text size="small" type="success" @click="copyFunc(timestamp)" style="cursor: pointer;">{{
            timestamp
          }}
        </el-text>
      </div>
    </div>
    <el-table :data="tableData" border style="width: 66%;margin-top: 30px;user-select: none">
      <el-table-column label="Half An Hour">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.halfAnHour)" style="cursor: pointer;">
            {{scope.row.halfAnHour}}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="An Hour">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.anHour)" style="cursor: pointer;">
            {{scope.row.anHour}}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="Six Hours">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.sixHours)" style="cursor: pointer;">
            {{scope.row.sixHours}}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="Twelve Hours">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.twelveHours)" style="cursor: pointer;">
            {{scope.row.twelveHours}}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="A Day">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.aDay)" style="cursor: pointer;">
            {{scope.row.aDay}}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="Two Days">
        <template #default="scope">
          <el-text size="small" type="success" @click="copyFunc(scope.row.twoDays)" style="cursor: pointer;">
            {{scope.row.twoDays}}
          </el-text>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 70vh;
}

.timestamp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 35%;
}

.input-row {
  width: 35%;
}

.timestamp-text {
  display: flex;
  align-items: center;
}
</style>