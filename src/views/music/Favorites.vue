<script setup>
import {computed, onBeforeMount, onMounted, onUnmounted, reactive, ref} from "vue"
import axiosUtilObj from '@/utils/axios.js'
import {infoStore} from "@/store/store.js"

const store = infoStore()

const audio = new Audio()
const isPlaying = ref(false)
const isOffVolume = ref(false)
const progress = ref(0)
const duration = ref(0)
const isDragging = ref(false)
const currentSongIndex = ref(0)
const currentSongTitle = ref('')
const currentSongArtist = ref('')
const currentSongCover = ref('')
const volume = ref(50)
const playMode = ref(0)// 0 Loop 1 Random 2 Single
const playModeTooltipArr = ['Loop play', 'Random play', 'Single play']
const lyrics = ref([])
const currentSongLyric = ref('Let\'s enjoy the music!')

const setVolume = (value) => {
  isOffVolume.value = false
  audio.volume = value / 100
}

const data = reactive({
  list: [],
  listFavoriteMap: new Map(),
})

const search = ref('')
const search2 = ref('')
const filterTableData = computed(() =>
    data.list.filter(
        (data) =>
            (!search.value ||
                data.title.toLowerCase().includes(search.value.toLowerCase())) &&
            (!search2.value ||
                data.artist.toLowerCase().includes(search2.value.toLowerCase()))
    )
)

const formatTooltip = (val) => {
  return formatTime(val) + ' / ' + formatTime(duration.value)
}

const switchVolume = () => {
  isOffVolume.value = !isOffVolume.value
  if (isOffVolume.value) {
    audio.volume = 0
  } else {
    audio.volume = volume.value / 100
  }
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    audio.play()
  } else {
    audio.pause()
  }
}

function getRandomExcluding(num1, num2) {
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * num1);
  } while (randomNum === num2);

  return randomNum;
}

const loadSong = (index) => {
  audio.src = getSongFilePath(data.list[index].title, data.list[index].artist)
  progress.value = 0
  duration.value = timeToSeconds(data.list[index].time)
  currentSongArtist.value = data.list[index].artist
  currentSongTitle.value = data.list[index].title
  currentSongCover.value = getSongCoverPath(data.list[index].title, data.list[index].artist)
  isPlaying.value = true
  audio.play()
}

const loadLyricSource = (index) => {
  loadLyrics(getSongLrcPath(data.list[index].title, data.list[index].artist))
}

const prevSong = () => {
  if (playMode.value === 0 || playMode.value === 2) {
    currentSongIndex.value = (currentSongIndex.value - 1 + data.list.length) % data.list.length
    let index = currentSongIndex.value
    loadSong(index)
    loadLyricSource(index)
  } else if (playMode.value === 1) {
    let index = getRandomExcluding(data.list.length, currentSongIndex)
    loadSong(index)
    loadLyricSource(index)
  }
}

const nextSong = () => {
  if (playMode.value === 0 || playMode.value === 2) {
    currentSongIndex.value = (currentSongIndex.value + 1) % data.list.length
    let index = currentSongIndex.value
    loadSong(index)
    loadLyricSource(index)
  } else if (playMode.value === 1) {
    let index = getRandomExcluding(data.list.length, currentSongIndex)
    loadSong(index)
    loadLyricSource(index)
  }
}

const endedNextSong = () => {
  if (playMode.value === 0) {
    currentSongIndex.value = (currentSongIndex.value + 1) % data.list.length
    let index = currentSongIndex.value
    loadSong(index)
    loadLyricSource(index)
  } else if (playMode.value === 1) {
    let index = getRandomExcluding(data.list.length, currentSongIndex)
    loadSong(index)
    loadLyricSource(index)
  } else if (playMode.value === 2) {
    audio.currentTime = 0
    isPlaying.value = true
    audio.play()
  }
}

const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0')
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

const timeToSeconds = (time) => {
  const [minutes, seconds] = time.split(':').map(Number)
  return minutes * 60 + seconds
}

const changePlayMode = () => {
  playMode.value++
  if (playMode.value === 3) {
    playMode.value = 0
  }
}

const getSongFilePath = (title, artist) => {
  return '/music/song/' + title + '-' + artist + '.mp3'
}

const getSongCoverPath = (title, artist) => {
  return '/music/cover/' + title + '-' + artist + '.jpg'
}

const getSongLrcPath = (title, artist) => {
  return '/music/lyric/' + title + '-' + artist + '.lrc'
}

const seek = (value) => {
  isDragging.value = false
  audio.currentTime = value
}

const handleSliderChangeStart = () => {
  isDragging.value = true
}

const handleKeydown = (event) => {
  if (event.code === 'Space') {
    event.preventDefault() // 防止页面滚动
    togglePlay()
  }
}

const loadLyrics = async (url) => {
  const response = await fetch(url)
  const text = await response.text()
  lyrics.value = await parseLRC(text)
}

// .lrc 文件解析函数
const parseLRC = async (lrc) => {
  const timeRegEx = /\[(\d{2}):(\d{2}\.\d{2})\]/
  const timeRegEx2 = /\[\d{2}:\d{2}\.\d{2}\]/

  return lrc.split('\n').map(line => {

    const timeMatch = timeRegEx.exec(line);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10)
      const seconds = parseFloat(timeMatch[2])
      const time = minutes * 60 + seconds;
      const text = line.replace(timeRegEx2, '').trim()
      return {time, text}
    }
    return null
  }).filter(line => line !== null)
}

// 根据当前时间更新歌词
const updateLyrics = () => {
  for (let i = 0; i < lyrics.value.length; i++) {
    if (audio.currentTime < lyrics.value[i].time) {
      if (i - 1 > 0) {
        currentSongLyric.value = lyrics.value[i - 1].text
      } else {
        currentSongLyric.value = lyrics.value[0].text
      }
      break
    } else if (i === lyrics.value.length - 1) {
      currentSongLyric.value = lyrics.value[i].text
    }
  }
}

const tableRowClassName = ({row, rowIndex}) => {
  if (rowIndex === currentSongIndex.value) {
    return 'success-row'
  }
  return ''
}

const handlerSongClick = (row) => {
  let index = row.id - 1
  currentSongIndex.value = index
  loadSong(index)
  loadLyricSource(index)
}

const favorite = async (row) => {
  await axiosUtilObj.postToken("/api/auth/music/favorite", store.data.token, {id: row.id})
  data.listFavoriteMap.set(row.id, true)
}

const cancelFavorite = async (row) => {
  await axiosUtilObj.postToken("/api/auth/music/cancelFavorite", store.data.token, {id: row.id})
  data.listFavoriteMap.set(row.id, false)
}

onBeforeMount(async () => {
  let songList = await axiosUtilObj.postToken("/api/auth/music/listByFavorite", store.data.token, null)
  if (songList.data !== undefined) {
    data.list = songList.data

    audio.src = getSongFilePath(data.list[0].title, data.list[0].artist)
    audio.volume = 0.5
    audio.addEventListener('timeupdate', () => {
      if (!isDragging.value) {
        progress.value = audio.currentTime
        updateLyrics()
      }
    })
    audio.addEventListener('ended', endedNextSong)

    duration.value = timeToSeconds(data.list[0].time)
    currentSongArtist.value = data.list[0].artist
    currentSongTitle.value = data.list[0].title
    currentSongCover.value = getSongCoverPath(data.list[0].title, data.list[0].artist)

    await loadLyrics(getSongLrcPath(data.list[0].title, data.list[0].artist))

    for (let i = 0; i < songList.data.length; i++) {
      data.listFavoriteMap.set(songList.data[i].id, true)
    }
  }
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  audio.pause()
  audio.src = ''

  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div>
    <div style="text-align: center;padding-bottom: 10px;">
      <el-text style="color: #5cbf91">{{ currentSongLyric }}</el-text>
    </div>

    <el-table
        :data="filterTableData"
        style="width: 100%"
        height="450"
        :row-class-name="tableRowClassName"
        @cell-dblclick="handlerSongClick"
    >
      <el-table-column prop="id" label="Id"/>
      <el-table-column prop="title">
        <template #header>
          <el-input v-model="search" size="small" placeholder="Search songs"/>
        </template>
      </el-table-column>
      <el-table-column label="Favorite">
        <template #default="scope">
          <el-text v-show="!data.listFavoriteMap.get(scope.row.id)" @click="favorite(scope.row)" size="large"
                   style="color: grey;cursor: pointer">
            <font-awesome-icon :icon="['fas', 'heart']"/>
          </el-text>
          <el-text v-show="data.listFavoriteMap.get(scope.row.id)" @click="cancelFavorite(scope.row)" size="large"
                   style="color: orangered;cursor: pointer">
            <font-awesome-icon :icon="['fas', 'heart']"/>
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="Time"/>
      <el-table-column prop="artist">
        <template #header>
          <el-input v-model="search2" size="small" placeholder="Search artist"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="music-player">
    <el-row>
      <el-col :span="4">
        <div class="song-info">
          <el-avatar :src="currentSongCover" size="large" shape="square"/>
          <div class="song-details">
            <p class="song-name">{{ currentSongTitle }}</p>
            <p class="song-artist">{{ currentSongArtist }}</p>
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="controls">
          <el-button style="font-size: 20px" link @click="prevSong">
            <font-awesome-icon :icon="['fas', 'backward-step']"/>
          </el-button>
          <el-button style="font-size: 30px" link @click="togglePlay">
            <font-awesome-icon v-show="isPlaying" :icon="['fas', 'pause']"/>
            <font-awesome-icon v-show="!isPlaying" :icon="['fas', 'play']"/>
          </el-button>
          <el-button style="font-size: 20px" link @click="nextSong">
            <font-awesome-icon :icon="['fas', 'forward-step']"/>
          </el-button>
        </div>
        <div class="progress-container">
          <el-text style="margin: 0 20px">{{ formatTime(progress) }}</el-text>
          <el-slider
              v-model="progress"
              @change="seek"
              :format-tooltip="formatTooltip"
              :max="duration"
              @mousedown="handleSliderChangeStart"
          />
          <el-text style="margin: 0 20px">{{ formatTime(duration) }}</el-text>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="song-setting">
          <el-tooltip
              effect="dark"
              :content="playModeTooltipArr[playMode]"
              placement="top"
          >
            <el-button style="font-size: 20px" link @click="changePlayMode">
              <font-awesome-icon v-show="playMode === 0" :icon="['fas', 'repeat']"/>
              <font-awesome-icon v-show="playMode === 1" :icon="['fas', 'shuffle']"/>
              <font-awesome-icon v-show="playMode === 2" :icon="['fas', 'arrow-rotate-right']"/>
            </el-button>
          </el-tooltip>
          <el-button style="font-size: 20px;margin: 0 10px" link @click="switchVolume">
            <font-awesome-icon v-show="!isOffVolume" :icon="['fas', 'volume-high']"/>
            <font-awesome-icon v-show="isOffVolume" :icon="['fas', 'volume-xmark']"/>
          </el-button>
          <el-slider
              v-model="volume"
              @change="setVolume"
              :min="0"
              :max="100"
              step="1"
              style="width: 50%"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.music-player {
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  position: fixed;
  bottom: 0;
  left: 0;
}

.song-info {
  display: flex;
  align-items: center;
  margin: 10px 20px;
}

.song-setting {
  display: flex;
  align-items: center;
  height: 100%;
}

.song-name {
  font-weight: bold;
  margin: 10px;
}

.song-artist {
  color: #666;
  font-size: 12px;
  margin: 10px;
}

.controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.progress-container {
  display: flex;
  align-items: center;
  margin: 0 200px;
}

.el-table:deep(.success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>