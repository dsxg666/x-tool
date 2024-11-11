<script setup>
import {ref} from "vue"
import {ElMessage} from "element-plus"
import timeUtilObj from '@/utils/time.js'

const startDate = ref(null)
const endDate = ref(null)
const dateDiff = ref(null)

const calculateDateDiff = () => {
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    const diffTime = end.getTime() - start.getTime()
    if (diffTime === 0) {
      ElMessage.warning('boring')
    }
    dateDiff.value = diffTime / (1000 * 60 * 60 * 24)
  } else {
    ElMessage.warning('Please select two dates first')
  }
}

const baseDate = ref(null)
const daysToAdd = ref(0)
const futureDate = ref(null)

const calculateFutureDate = () => {
  if (baseDate.value) {
    const date = new Date(baseDate.value);
    date.setDate(date.getDate() + daysToAdd.value)
    futureDate.value = timeUtilObj.formatYMD(date)
  } else {
    ElMessage.warning('Please select a start date')
  }
}

const shortcuts = [
  {
    text: 'Today',
    value: new Date(),
  }
]
</script>

<template>
  <el-card class="main-box">
    <div class="input-row">
      <el-date-picker style="width: 100%;margin-bottom: 10px" :shortcuts="shortcuts" v-model="startDate" type="date"
                      placeholder="Pick a day"/>
      <el-date-picker style="width: 100%;margin-bottom: 10px" :shortcuts="shortcuts" v-model="endDate" type="date"
                      placeholder="Pick a day"/>
      <el-button style="width: 100%" type="primary" @click="calculateDateDiff">Calculating The Difference</el-button>
      <p>Result: &nbsp;&nbsp;<el-text v-if="dateDiff">Difference of {{dateDiff}} days</el-text></p>
    </div>

    <div class="input-row">
      <el-date-picker style="width: 100%;margin-bottom: 10px" :shortcuts="shortcuts" v-model="baseDate" type="date"
                      placeholder="Pick a day"></el-date-picker>
      <el-input-number style="width: 100%;margin-bottom: 10px" v-model="daysToAdd" placeholder="Added days"
                       :min="0"></el-input-number>
      <el-button style="width: 100%" type="primary" @click="calculateFutureDate">Calculating Future Date</el-button>
      <p>Result: &nbsp;&nbsp;<el-text v-if="futureDate">{{ futureDate }}</el-text></p>
    </div>
  </el-card>
</template>

<style scoped>
.main-box {
  display: flex;
  justify-content: center;
}

.input-row {
  width: 300px;
}
</style>