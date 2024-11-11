<script setup>
import {
  CaretBottom,
  CaretTop,
  Warning,
  MoreFilled,
  Check,
} from '@element-plus/icons-vue'
import {onBeforeMount, reactive, ref, provide} from "vue"
import axiosUtilObj from "@/utils/axios.js";
import {infoStore} from "@/store/store.js";

import {use} from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'
import {BarChart} from 'echarts/charts'
import {TitleComponent, TooltipComponent, GridComponent, LegendComponent} from 'echarts/components'
import VChart, {THEME_KEY} from "vue-echarts"

import {useTransition} from '@vueuse/core'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

provide(THEME_KEY, "dark")

const store = infoStore()

const sayings = [
  'No pain, no gain.',
  'Sunshine comes after rain.',
  'That which does not kill us makes us stronger.',
  'Actions speak louder than words.',
]

const homeData = reactive({
  dauNum: 0,
  dauRate: '',
  dauRes: '',
  messagesNum: 0,
  messagesRate: '',
  messagesRes: '',
  todolistNum: 0,
  todolistRate: '',
  todolistRes: '',

  dauChartDates: [],
  dauChartNum: [],
  messagesChartDates: [],
  messagesChartNum: [],
  todolistChartDates: [],
  todolistChartNum: [],
})

const source = ref(0)

const outputValue = useTransition(source, {
  duration: 1500,
})

const getData = async () => {
  let dau = await axiosUtilObj.postToken('/api/auth/statistic/getDailyDauData', store.data.token, null)
  homeData.dauNum = dau.data.num
  homeData.dauRate = dau.data.rate
  homeData.dauRes = dau.data.res
  let messages = await axiosUtilObj.postToken('/api/auth/statistic/getDailyMessageData', store.data.token, null)
  homeData.messagesNum = messages.data.num
  homeData.messagesRate = messages.data.rate
  homeData.messagesRes = messages.data.res
  let todolist = await axiosUtilObj.postToken('/api/auth/statistic/getDailyTodolistData', store.data.token, null)
  homeData.todolistNum = todolist.data.num
  homeData.todolistRate = todolist.data.rate
  homeData.todolistRes = todolist.data.res

  let dauChart = await axiosUtilObj.postToken("/api/auth/statistic/getChartDauData", store.data.token, null)
  for (let i = 0; i < 7; i++) {
    homeData.dauChartDates.push(dauChart.data[i].date)
    homeData.dauChartNum.push(dauChart.data[i].num)
  }
  let messageChart = await axiosUtilObj.postToken("/api/auth/statistic/getChartMessageData", store.data.token, null)
  for (let i = 0; i < 7; i++) {
    homeData.messagesChartDates.push(messageChart.data[i].date)
    homeData.messagesChartNum.push(messageChart.data[i].num)
  }
  let todolistChart = await axiosUtilObj.postToken("/api/auth/statistic/getChartTodolistData", store.data.token, null)
  for (let i = 0; i < 7; i++) {
    homeData.todolistChartDates.push(todolistChart.data[i].date)
    homeData.todolistChartNum.push(todolistChart.data[i].num)
  }
}

onBeforeMount(async () => {
  await getData()
  source.value = homeData.messagesNum
})

const todolistChart = ref({
  title: {
    text: 'Daily todolist number in the last 7 days',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: homeData.todolistChartDates,
    axisLabel: {
      rotate: 45,
      formatter: value => value.slice(5)
    }
  },
  yAxis: {
    type: 'value',
    name: 'Daily todolist num'
  },
  series: [
    {
      name: 'Daily todolist num',
      type: 'bar',
      data: homeData.todolistChartNum,
      itemStyle: {
        color: '#3863d6'
      },
      label: {
        show: true,
        position: 'top'
      }
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  }
})

const messageChart = ref({
  title: {
    text: 'Daily message number in the last 7 days',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: homeData.messagesChartDates,
    axisLabel: {
      rotate: 45,
      formatter: value => value.slice(5)
    }
  },
  yAxis: {
    type: 'value',
    name: 'Daily message num'
  },
  series: [
    {
      name: 'Daily message num',
      type: 'bar',
      data: homeData.messagesChartNum,
      itemStyle: {
        color: '#3863d6'
      },
      label: {
        show: true,
        position: 'top'
      }
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  }
})

const dauChart = ref({
  title: {
    text: 'Daily active users in the last 7 days',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: homeData.dauChartDates,
    axisLabel: {
      rotate: 45,
      formatter: value => value.slice(5)
    }
  },
  yAxis: {
    type: 'value',
    name: 'Daily Active Users'
  },
  series: [
    {
      name: 'Daily Active Users',
      type: 'bar',
      data: homeData.dauChartNum,
      itemStyle: {
        color: '#3863d6'
      },
      label: {
        show: true,
        position: 'top'
      }
    }
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  }
})

</script>

<template>
  <el-backtop :right="100" :bottom="100"/>
  <el-container>
    <el-main>
      <div class="outer-content">
        <h2 id="Carousel">Carousel</h2>

        <el-carousel height="200px" :interval="10000" motion-blur>
          <el-carousel-item v-for="(value, index) in sayings" :key="index">
            <div
                style="background-image: url('/img/svg/waves-light.svg');background-color: #333;width: 100%;height: 100%">
              <h3>{{ value }}</h3>
            </div>
          </el-carousel-item>
        </el-carousel>

      </div>
      <div class="outer-content">
        <h2 id="Statistic">Statistic</h2>

        <el-row :gutter="16">
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic :value="homeData.dauNum">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    Daily active users
                    <el-tooltip
                        effect="dark"
                        content="The number of users who log in to the site in today."
                        placement="top"
                    >
                      <el-icon style="margin-left: 4px" :size="12">
                        <Warning/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-statistic>
              <div class="statistic-footer">
                <div class="footer-item">
                  <span>than yesterday</span>
                  <span :class="{'red': homeData.dauRes === '1', 'green': homeData.dauRes === '-1'}">
                    {{ homeData.dauRate }}
                     <el-icon>
                       <CaretTop v-if="homeData.dauRes === '1'"/>
                       <CaretBottom v-if="homeData.dauRes === '-1'"/>
                     </el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic :value="outputValue">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    Daily message number
                    <el-tooltip
                        effect="dark"
                        content="The number of all chat messages sent in Chatroom today"
                        placement="top"
                    >
                      <el-icon style="margin-left: 4px" :size="12">
                        <Warning/>
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>
              </el-statistic>
              <div class="statistic-footer">
                <div class="footer-item">
                  <span>than yesterday</span>
                  <span :class="{'red': homeData.messagesRes === '1', 'green': homeData.messagesRes === '-1'}">
                  {{ homeData.messagesRate }}
                    <el-icon>
                      <CaretTop v-if="homeData.messagesRes === '1'"/>
                      <CaretBottom v-if="homeData.messagesRes === '-1'"/>
                    </el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="statistic-card">
              <el-statistic :value="homeData.todolistNum">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    Daily todolist number
                  </div>
                </template>
              </el-statistic>
              <div class="statistic-footer">
                <div class="footer-item">
                  <span>than yesterday</span>
                  <span :class="{'red': homeData.todolistRes === '1', 'green': homeData.todolistRes === '-1'}">
                    {{ homeData.todolistRate }}
                    <el-icon>
                      <CaretTop v-if="homeData.todolistRes === '1'"/>
                      <CaretBottom v-if="homeData.todolistRes === '-1'"/>
                    </el-icon>
                  </span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="outer-content">
        <h2 id="Charts">Charts</h2>
        <v-chart :option="dauChart" style="width: 100%; height: 400px;margin-bottom: 25px"/>
        <v-chart :option="messageChart" style="width: 100%; height: 400px;margin-bottom: 25px"/>
        <v-chart :option="todolistChart" style="width: 100%; height: 400px"/>
      </div>
      <div class="outer-content">
        <h2 id="DevelopmentHistory">Development History</h2>
        <el-timeline>
          <el-timeline-item timestamp="2024-08-10" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>Project startup</h4>
              <p>I decided to develop my first front end separation project. No pain, no gain.</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2024-08-12" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>The Strings Length function under Tool has been developed</h4>
              <p>This feature is designed to allow people to quickly measure the length of special strings, such as
                hashes.</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="2024-08-27" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>Todolist development completed</h4>
              <p>This feature is developed to improve people's productivity, TodoList can set the priority of the task,
                progress, etc., to help you intuitively understand the completion of the task and the urgency.</p>
            </el-card>
          </el-timeline-item>

          <el-timeline-item timestamp="2024-09-19" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>Chatroom development completed</h4>
              <p>The development of Chatroom is to make it easy for everyone to communicate, which is an important step
                in my planning.</p>
            </el-card>
          </el-timeline-item>

          <el-timeline-item timestamp="2024-09-21" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>The Tool category updates tools for timestamps and dates</h4>
              <p>The Timestamp feature helps developers quickly understand the formatted representation of the timestamp
                and Date feature can help you figure out how many days you have lived since birth, how many days are
                left from festivals, college entrance examinations, postgraduate exams, anniversaries and so on.</p>
            </el-card>
          </el-timeline-item>

          <el-timeline-item timestamp="2024-09-25" :size="'large'" :color="'#0bbd87'" :icon="Check" placement="top">
            <el-card>
              <h4>Blog function development completed.</h4>
              <p>Blog is a good tool to record and learn knowledge, blog platform can help you record knowledge can also provide knowledge for others!</p>
            </el-card>
          </el-timeline-item>

          <el-timeline-item timestamp="In development" :size="'large'" :type="'primary'" :icon="MoreFilled"
                            placement="top">
            <el-card>
              <h4>...</h4>
              <p>coming soon...</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-main>
    <el-aside width="20%">
      <el-affix :offset="120">
        <h3>Contents</h3>
        <el-anchor type="underline">
          <el-anchor-link href="#Carousel" title="Carousel"/>
          <el-anchor-link href="#Statistic" title="Statistic"/>
          <el-anchor-link href="#Charts" title="Charts"/>
          <el-anchor-link href="#DevelopmentHistory" title="Development History"/>
        </el-anchor>
      </el-affix>
    </el-aside>
  </el-container>
</template>

<style scoped>
@import '@/assets/css/home.css';
</style>