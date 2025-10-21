<template>
  <v-container
    max-width="1920"
    class="px-6"
  >
    <!-- 上方區域：時間+天氣 和 輪播圖 -->
    <v-row class="mt-3">
      <!-- 左側：時間和天氣 -->
      <v-col
        cols="12"
        md="2"
        class="pb-2"
      >
        <v-row>
          <!-- 時間卡片 -->
          <v-col
            cols="12"
            class="pb-2"
          >
            <v-card
              class="dashboard-card time-card"
              elevation="2"
              height="110"
            >
              <v-card-text class="d-flex flex-column align-center justify-center h-100 pa-4">
                <div class="time-display">
                  {{ currentTime }}
                </div>
                <div class="date-display text-body-2 text-grey-darken-1">
                  {{ currentDate }}
                </div>
                <div class="day-display text-body-2 text-grey-darken-1">
                  {{ currentDay }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 天氣卡片 -->
          <v-col
            cols="12"
          >
            <v-card
              class="dashboard-card weather-card"
              elevation="2"
              height="269"
            >
              <v-card-text class="d-flex flex-column align-center justify-center h-100 pa-4">
                <v-skeleton-loader
                  v-if="weatherLoading"
                  type="image, text, text"
                  class="w-100"
                />
                <template v-else>
                  <v-icon
                    size="44"
                    :color="getWeatherIconColor(weatherData.condition)"
                    class="mb-0"
                  >
                    {{ getWeatherIcon(weatherData.condition) }}
                  </v-icon>
                  <div class="temperature-display mb-1">
                    {{ weatherData.temperature }}°C
                  </div>
                  <div class="feels-like text-body-2 text-grey-darken-1 mb-1">
                    體感 {{ weatherData.feelsLike }}°C
                  </div>
                  <div class="location-display text-body-2 text-grey-darken-1 mb-1">
                    {{ weatherData.location }}
                  </div>
                  <div class="weather-description text-body-2 text-grey-darken-1 mb-1">
                    {{ weatherData.description }}
                  </div>
                  <div class="weather-details">
                    <div class="d-flex align-center mb-1">
                      <v-icon
                        size="16"
                        color="blue-grey"
                        class="me-2"
                      >
                        mdi-water
                      </v-icon>
                      <span class="text-body-2">濕度 {{ weatherData.humidity }}%</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon
                        size="16"
                        color="blue-grey"
                        class="me-2"
                      >
                        mdi-weather-windy
                      </v-icon>
                      <span class="text-body-2">風速 {{ weatherData.windSpeed }} km/h</span>
                    </div>
                  </div>
                  <v-alert
                    v-if="weatherError"
                    type="warning"
                    variant="tonal"
                    size="small"
                    class="mt-2"
                  >
                    {{ weatherError }}
                  </v-alert>
                </template>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- 右側：輪播圖 -->
      <v-col
        cols="12"
        md="10"
        class="pb-0"
      >
        <v-card
          class="dashboard-card swiper-card"
          elevation="2"
          height="400"
        >
          <v-carousel
            v-model="currentSlide"
            height="400"
            cycle
            interval="5000"
            show-arrows="hover"
            hide-delimiter-background
            delimiter-icon="mdi-circle"
            touch
          >
            <template #prev="{ props }">
              <v-btn
                v-bind="props"
                class="custom-carousel-btn"
                variant="text"
              >
                <v-icon
                  size="28"
                  color="white"
                >
                  mdi-chevron-left
                </v-icon>
              </v-btn>
            </template>

            <template #next="{ props }">
              <v-btn
                v-bind="props"
                class="custom-carousel-btn"
                variant="text"
              >
                <v-icon
                  size="28"
                  color="white"
                >
                  mdi-chevron-right
                </v-icon>
              </v-btn>
            </template>

            <v-carousel-item
              v-for="slide in slides"
              :key="slide.id"
              :src="slide.image"
              cover
              draggable="true"
            >
              <div class="carousel-overlay">
                <div class="carousel-content">
                  <h3 class="carousel-title">
                    {{ slide.title }}
                  </h3>
                </div>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </v-col>
    </v-row>

    <!-- 下方區域：代辦事項、最新消息、快速連結 -->
    <v-row>
      <!-- 代辦事項 -->
      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          class="dashboard-card todo-card pt-4 px-3"
          elevation="2"
          height="400"
        >
          <v-card-title class="d-flex align-center">
            <span class="block-title">代辦事項</span>
            <v-spacer />
            <v-chip
              size="small"
              color="grey-darken-1"
              variant="outlined"
            >
              {{ todoItems.filter(item => !item.completed).length }} 項待辦
            </v-chip>
          </v-card-title>
          <v-card-text class="ps-2 pe-6">
            <v-list
              class="pa-0"
            >
              <v-list-item
                v-for="item in todoItems"
                :key="item.id"
                class="px-0"
                @click="toggleTodo(item.id)"
              >
                <template #prepend>
                  <v-checkbox
                    :model-value="item.completed"
                    color="orange"
                    hide-details
                  />
                </template>
                <v-list-item-title
                  :class="{ 'text-decoration-line-through text-grey': item.completed }"
                >
                  {{ item.title }}
                </v-list-item-title>
                <template #append>
                  <v-chip
                    :color="getPriorityColor(item.priority)"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 最新消息 -->
      <v-col
        cols="12"
        sm="6"
      >
        <v-card
          class="dashboard-card news-card pt-4 px-3"
          elevation="2"
          height="400"
        >
          <v-card-title class="d-flex align-center">
            <!-- <v-icon
              size="24"
              color="green-darken-2"
              class="me-2"
            >
              mdi-newspaper-variant
            </v-icon> -->
            <span class="block-title">最新消息</span>
            <v-spacer />
            <v-chip
              size="small"
              color="grey-darken-1"
              variant="outlined"
            >
              {{ newsItems.length }} 則消息
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list class="pa-0">
              <v-list-item
                v-for="item in newsItems"
                :key="item.id"
                class="px-0 mb-2"
              >
                <template #prepend>
                  <v-avatar
                    :color="getNewsTypeColor(item.type)"
                    size="32"
                  >
                    <v-icon
                      size="16"
                      color="white"
                    >
                      {{ item.type === 'system' ? 'mdi-cog' : item.type === 'update' ? 'mdi-update' : 'mdi-bullhorn' }}
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-1 font-weight-medium">
                  {{ item.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 text-grey-darken-1">
                  {{ item.content }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="text-caption text-grey">
                    {{ item.time }}
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 快速連結 -->
      <v-col
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          class="dashboard-card quick-links-card pt-4 px-3"
          elevation="2"
          height="400"
        >
          <v-card-title class="d-flex align-center">
            <!-- <v-icon
              size="24"
              color="purple-darken-2"
              class="me-2"
            >
              mdi-link-variant
            </v-icon> -->
            <span class="block-title">快速連結</span>
            <v-spacer />
            <v-chip
              size="small"
              color="grey-darken-1"
              variant="outlined"
            >
              {{ quickLinks.length }} 個連結
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col
                v-for="link in quickLinks"
                :key="link.id"
                cols="6"
                class="pa-1"
              >
                <v-card
                  class="quick-link-item"
                  elevation="1"
                  hover
                  @click="router.push(link.to)"
                >
                  <v-card-text class="text-center pa-3">
                    <v-avatar
                      :color="link.color"
                      size="40"
                      class="mb-2"
                    >
                      <v-icon
                        size="20"
                        color="white"
                      >
                        {{ link.icon }}
                      </v-icon>
                    </v-avatar>
                    <div class="text-body-2 font-weight-medium">
                      {{ link.title }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- 預設密碼修改提示對話框 -->
  <v-dialog
    v-model="showDefaultPasswordDialog"
    persistent
    max-width="380"
  >
    <v-card class="rounded-lg pb-1">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-red-darken-1 mb-4">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-alert-circle
        </v-icon>
        <span
          class="card-title text-white"
          style="padding: 10px 0;"
        >請立即修改密碼</span>
        <v-spacer />
      </v-card-title>
      <v-card-text class="pb-0">
        <v-alert
          type="warning"
          color="red-darken-1"
          variant="tonal"
          class="mb-0 font-weight-bold"
        >
          為了您的帳戶安全，請立即修改系統密碼。
        </v-alert>
      </v-card-text>
      <v-card-actions class="me-4 mb-3 mt-4">
        <v-spacer />
        <v-btn
          color="red-darken-1"
          variant="flat"
          :size="buttonSize"
          @click="handleDefaultPasswordPrompt"
        >
          立即修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 修改密碼對話框 -->
  <v-dialog
    v-model="showPasswordDialog"
    persistent
    max-width="320"
  >
    <v-card class="rounded-lg pb-1">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-darken-2 mb-4">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-lock
        </v-icon>
        <span
          class="card-title text-white"
          style="padding: 10px 0;"
        >修改密碼</span>
        <v-spacer />
      </v-card-title>
      <v-card-text class="pb-0">
        <v-form @submit.prevent="handlePasswordChange">
          <v-text-field
            v-model="passwordForm.currentPassword"
            :error-messages="currentPasswordError"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="當前密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="currentPasswordError = ''"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />
          <v-text-field
            v-model="passwordForm.newPassword"
            :error-messages="newPasswordError"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="newPasswordError = ''"
            @click:append-inner="showNewPassword = !showNewPassword"
          />
          <v-text-field
            v-model="passwordForm.confirmPassword"
            :error-messages="confirmPasswordError"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="確認新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="confirmPasswordError = ''"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />
          <v-btn
            type="submit"
            style="display: none"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="me-4 mb-3">
        <v-spacer />
        <v-btn
          color="blue-darken-2"
          variant="outlined"
          :size="buttonSize"
          :loading="isChangingPassword"
          @click="handlePasswordChange"
        >
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useRouter } from 'vue-router'
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'

// 頁面定義
definePage({
  meta: {
    title: '首頁 | Ystravel',
    login: true,
    permission: 'HOME_READ'
  }
})

const { mdAndUp } = useDisplay()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()

// 時間顯示相關
const currentTime = ref('')
const currentDate = ref('')
const currentDay = ref('')
let timeInterval = null

// 天氣相關
const weatherData = ref({
  temperature: 0,
  condition: 'sunny',
  humidity: 0,
  windSpeed: 0,
  location: '台北市',
  description: '',
  feelsLike: 0,
  pressure: 0,
  visibility: 0
})

const weatherLoading = ref(false)
const weatherError = ref('')

// 輪播圖相關
const currentSlide = ref(0)
const slides = ref([
  { id: 1, image: 'https://picsum.photos/800/400?random=1', title: '輪播項目 1' },
  { id: 2, image: 'https://picsum.photos/800/400?random=2', title: '輪播項目 2' },
  { id: 3, image: 'https://picsum.photos/800/400?random=3', title: '輪播項目 3' },
  { id: 4, image: 'https://picsum.photos/800/400?random=4', title: '輪播項目 4' },
  { id: 5, image: 'https://picsum.photos/800/400?random=5', title: '輪播項目 5' }
])

// 代辦事項相關
const todoItems = ref([
  { id: 1, title: '完成專案報告', completed: false, priority: 'high' },
  { id: 2, title: '回覆客戶郵件', completed: false, priority: 'medium' },
  { id: 3, title: '準備會議資料', completed: true, priority: 'low' },
  { id: 4, title: '更新系統文檔', completed: false, priority: 'medium' }
])

// 最新消息相關
const newsItems = ref([
  { id: 1, title: '系統維護通知', content: '系統將於本週末進行例行維護', time: '2小時前', type: 'system' },
  { id: 2, title: '新功能發布', content: '最新版本已上線，包含多項改進', time: '1天前', type: 'update' },
  { id: 3, title: '重要公告', content: '請注意新的安全政策更新', time: '3天前', type: 'announcement' }
])

// 快速連結相關
const quickLinks = ref([
  { id: 1, title: '專案管理', icon: 'mdi-chart-box-outline', color: 'teal', to: '/projectAndTaskManagement' },
  { id: 2, title: '員工列表', icon: 'mdi-account-group', color: 'blue', to: '/employeeList' },
  { id: 3, title: '統計報表', icon: 'mdi-chart-line', color: 'green', to: '/B2CStatistics' },
  { id: 4, title: '系統設定', icon: 'mdi-cog', color: 'purple', to: '/user' }
])

// 預設密碼提醒相關
const showDefaultPasswordDialog = ref(false)
const showPasswordDialog = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

// 時間更新函數
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`

  // 更新日期
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  currentDate.value = `${year}/${month}/${day}`

  // 更新星期
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentDay.value = weekdays[now.getDay()]
}

// 輪播圖現在由 v-carousel 自動控制

// 代辦事項相關函數
const toggleTodo = (id) => {
  const item = todoItems.value.find(item => item.id === id)
  if (item) {
    item.completed = !item.completed
  }
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'orange'
    case 'low': return 'green'
    default: return 'grey'
  }
}

// 天氣 API 配置
const WEATHER_API_KEY = 'ac54897d6fc1bd290b2c8c57757e8bb2' // 請替換為您的 API Key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 備用天氣 API (免費，無需註冊)
const BACKUP_WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'

// 獲取天氣數據
const fetchWeatherData = async () => {
  try {
    weatherLoading.value = true
    weatherError.value = ''

    console.log('正在獲取天氣數據...')

    // 首先嘗試 OpenWeatherMap API
    try {
      console.log('嘗試 OpenWeatherMap API...')
      const response = await fetch(
        `${WEATHER_API_URL}?q=Taipei,TW&appid=${WEATHER_API_KEY}&units=metric&lang=zh_tw`
      )

      if (response.ok) {
        const data = await response.json()
        console.log('OpenWeatherMap API 成功:', data)

        // 使用坐標獲取詳細地址
        const detailedLocation = await getDetailedLocationFromCoords(data.coord.lat, data.coord.lon)

        weatherData.value = {
          temperature: Math.round(data.main.temp),
          condition: getWeatherCondition(data.weather[0].main),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
          location: detailedLocation || getFormattedLocation(data),
          description: data.weather[0].description,
          feelsLike: Math.round(data.main.feels_like),
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000)
        }
        return
      }
    } catch (error) {
      console.log('OpenWeatherMap API 失敗，嘗試備用 API...', error.message)
    }

    // 如果 OpenWeatherMap 失敗，使用備用 API
    console.log('使用備用天氣 API...')
    const backupResponse = await fetch(
      `${BACKUP_WEATHER_API_URL}?latitude=25.0478&longitude=121.5319&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FTaipei`
    )

    if (!backupResponse.ok) {
      throw new Error('備用 API 也失敗了')
    }

    const backupData = await backupResponse.json()
    console.log('備用 API 響應:', backupData)

    // 轉換備用 API 數據格式
    const weatherCode = backupData.current.weather_code
    weatherData.value = {
      temperature: Math.round(backupData.current.temperature_2m),
      condition: getWeatherConditionFromCode(weatherCode),
      humidity: backupData.current.relative_humidity_2m,
      windSpeed: Math.round(backupData.current.wind_speed_10m * 3.6),
      location: await getCurrentLocation(),
      description: getWeatherDescriptionFromCode(weatherCode),
      feelsLike: Math.round(backupData.current.temperature_2m),
      pressure: 1013,
      visibility: 10
    }

    console.log('天氣數據更新成功:', weatherData.value)
  } catch (error) {
    console.error('所有天氣 API 都失敗:', error)
    weatherError.value = '無法獲取天氣數據，使用預設資料'

    // 使用備用假資料
    weatherData.value = {
      temperature: 28,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 12,
      location: '台北市',
      description: '晴朗',
      feelsLike: 30,
      pressure: 1013,
      visibility: 10
    }
  } finally {
    weatherLoading.value = false
  }
}

// 根據天氣狀況獲取圖標
const getWeatherIcon = (condition) => {
  switch (condition) {
    case 'sunny':
    case 'clear': return 'mdi-weather-sunny'
    case 'cloudy':
    case 'clouds': return 'mdi-weather-cloudy'
    case 'rainy':
    case 'rain': return 'mdi-weather-rainy'
    case 'snowy':
    case 'snow': return 'mdi-weather-snowy'
    case 'stormy':
    case 'thunderstorm': return 'mdi-weather-lightning'
    case 'foggy':
    case 'mist': return 'mdi-weather-fog'
    default: return 'mdi-weather-sunny'
  }
}

// 將 API 天氣狀況轉換為本地條件
const getWeatherCondition = (apiCondition) => {
  const condition = apiCondition.toLowerCase()
  if (condition.includes('clear')) return 'sunny'
  if (condition.includes('cloud')) return 'cloudy'
  if (condition.includes('rain')) return 'rainy'
  if (condition.includes('snow')) return 'snowy'
  if (condition.includes('storm')) return 'stormy'
  if (condition.includes('fog') || condition.includes('mist')) return 'foggy'
  return 'sunny'
}

// 根據天氣代碼獲取天氣狀況 (Open-Meteo API)
const getWeatherConditionFromCode = (code) => {
  if (code === 0) return 'sunny'
  if (code >= 1 && code <= 3) return 'cloudy'
  if (code >= 45 && code <= 48) return 'foggy'
  if (code >= 51 && code <= 67) return 'rainy'
  if (code >= 71 && code <= 77) return 'snowy'
  if (code >= 80 && code <= 86) return 'rainy'
  if (code >= 95 && code <= 99) return 'stormy'
  return 'sunny'
}

// 根據天氣代碼獲取天氣描述
const getWeatherDescriptionFromCode = (code) => {
  if (code === 0) return '晴朗'
  if (code >= 1 && code <= 3) return '多雲'
  if (code >= 45 && code <= 48) return '霧'
  if (code >= 51 && code <= 67) return '雨'
  if (code >= 71 && code <= 77) return '雪'
  if (code >= 80 && code <= 86) return '陣雨'
  if (code >= 95 && code <= 99) return '雷暴'
  return '晴朗'
}

// 格式化位置信息
const getFormattedLocation = (data) => {
  console.log('OpenWeatherMap 位置數據:', data)

  // 將英文城市名轉換為中文
  const cityName = data.name
  const countryCode = data.sys?.country

  console.log('城市名:', cityName)
  console.log('國家代碼:', countryCode)

  // 轉換常見的英文城市名為中文
  const cityTranslations = {
    'Taipei': '台北市',
    'New Taipei': '新北市',
    'Kaohsiung': '高雄市',
    'Taichung': '台中市',
    'Tainan': '台南市',
    'Taoyuan': '桃園市',
    'Hsinchu': '新竹市',
    'Chiayi': '嘉義市',
    'Keelung': '基隆市',
    'Yilan': '宜蘭縣'
  }

  // 如果 API 返回的地名包含地區信息，直接使用
  if (data.name && data.name.includes('區')) {
    return data.name
  }

  // 如果找到對應的中文名稱，使用中文
  if (cityTranslations[cityName]) {
    return cityTranslations[cityName]
  }

  // 如果有國家代碼，組合顯示
  if (countryCode) {
    return `${cityName}, ${countryCode}`
  }

  // 否則使用預設的台北市
  return '台北市'
}

// 根據坐標獲取詳細地址
const getDetailedLocationFromCoords = async (lat, lon) => {
  try {
    console.log('使用坐標獲取詳細地址:', lat, lon)

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    )

    if (response.ok) {
      const data = await response.json()
      console.log('詳細地址數據:', data)

      // 檢查並組合地址信息
      const city = data.city || data.locality
      const country = data.countryName || data.principalSubdivision

      console.log('城市:', city)
      console.log('國家:', country)
      console.log('行政區信息:', data.localityInfo?.administrative)

      // 嘗試從行政區信息中獲取區級信息
      const administrative = data.localityInfo?.administrative
      if (administrative && administrative.length > 0) {
        // 尋找區級信息（通常是 administrative[1] 或 administrative[2]）
        for (let i = 1; i < administrative.length; i++) {
          const admin = administrative[i]
          if (admin && admin.name && admin.name.includes('區')) {
            console.log('找到區級信息:', admin.name)
            return `${city}, ${admin.name}`
          }
        }
      }

      // 如果沒有找到區級信息，只顯示城市
      if (city && city !== country) {
        return city
      } else if (city) {
        return city
      }
    }
  } catch (error) {
    console.log('無法獲取詳細地址:', error.message)
  }

  return null
}

// 獲取當前位置
const getCurrentLocation = async () => {
  try {
    // 使用瀏覽器地理位置 API
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: false
      })
    })

    const { latitude, longitude } = position.coords

    // 使用反向地理編碼獲取地址
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
    )

    if (response.ok) {
      const data = await response.json()
      console.log('地理位置數據:', data)

      // 檢查並組合地址信息
      const city = data.city || data.locality
      const country = data.countryName || data.principalSubdivision

      console.log('完整地理位置數據:', data)
      console.log('城市:', city)
      console.log('國家:', country)
      console.log('行政區信息:', data.localityInfo?.administrative)

      // 嘗試從行政區信息中獲取區級信息
      const administrative = data.localityInfo?.administrative
      if (administrative && administrative.length > 0) {
        // 尋找區級信息（通常是 administrative[1] 或 administrative[2]）
        for (let i = 1; i < administrative.length; i++) {
          const admin = administrative[i]
          if (admin && admin.name && admin.name.includes('區')) {
            console.log('找到區級信息:', admin.name)
            return `${city}, ${admin.name}`
          }
        }
      }

      // 如果沒有找到區級信息，只顯示城市
      if (city && city !== country) {
        return city
      } else if (city) {
        return city
      }
    }
  } catch (error) {
    console.log('無法獲取地理位置:', error.message)
  }

  // 如果無法獲取位置，返回預設值
  return '台北市'
}

// 根據天氣狀況獲取圖標顏色
const getWeatherIconColor = (condition) => {
  switch (condition) {
    case 'sunny':
    case 'clear': return 'orange'
    case 'cloudy':
    case 'clouds': return 'blue-grey'
    case 'rainy':
    case 'rain': return 'blue'
    case 'snowy':
    case 'snow': return 'blue-lighten-3'
    case 'stormy':
    case 'thunderstorm': return 'purple'
    case 'foggy':
    case 'mist': return 'grey'
    default: return 'orange'
  }
}

// 消息類型顏色
const getNewsTypeColor = (type) => {
  switch (type) {
    case 'system': return 'blue'
    case 'update': return 'green'
    case 'announcement': return 'orange'
    default: return 'grey'
  }
}

// 密碼驗證函數
const validatePasswordForm = () => {
  let isValid = true

  if (!passwordForm.value.currentPassword) {
    currentPasswordError.value = '請輸入當前密碼'
    isValid = false
  }

  if (!passwordForm.value.newPassword) {
    newPasswordError.value = '請輸入新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 8) {
    newPasswordError.value = '新密碼長度至少需要8個字元'
    isValid = false
  }

  if (!passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '請確認新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '兩次輸入的密碼不相符'
    isValid = false
  }

  return isValid
}

// 處理預設密碼提示對話框
const handleDefaultPasswordPrompt = () => {
  showDefaultPasswordDialog.value = false
  nextTick(() => {
    setTimeout(() => {
      showPasswordDialog.value = true
    }, 150)
  })
}

// 修改密碼成功後更新狀態
const handlePasswordChange = async () => {
  if (!validatePasswordForm()) return

  try {
    isChangingPassword.value = true
    const result = await user.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    createSnackbar({
      text: result.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    user.isDefaultPasswordChanged = true
    closePasswordDialog()
  } catch (error) {
    createSnackbar({
      text: error.message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isChangingPassword.value = false
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// 在組件掛載時檢查是否需要顯示預設密碼提示
onMounted(async () => {
  // 初始化時間顯示
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 獲取天氣數據
  await fetchWeatherData()

  if (user.isLogin && !user.isDefaultPasswordChanged) {
    showDefaultPasswordDialog.value = true
  }
})

// 組件卸載時清理定時器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style lang="scss" scoped>
// 卡片通用樣式
.dashboard-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.block-title {
  font-weight: 600;
  color: #333;
}
// 時間卡片樣式
.time-card {
  .time-display {
    font-size: 2.2rem;
    font-weight: 700;
    color: #333;
    font-family: 'Roboto Mono', monospace;
  }

  .date-display,
  .day-display {
    font-weight: 500;
  }
}

// 輪播圖卡片樣式
.swiper-card {
  .v-carousel {
    overflow: hidden;
  }

  .carousel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
  display: flex;
  align-items: center;
  justify-content: center;
    padding: 20px;
  }

  .carousel-content {
    text-align: center;
  }

  .carousel-title {
    color: white;
    font-size: 1.8rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    margin: 0;
  }
}

// 客製化 carousel 按鈕樣式
.custom-carousel-btn {
  background-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  color: white !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  }
}

// 天氣卡片樣式
.weather-card {
  .temperature-display {
  font-size: 2rem;
    font-weight: 700;
    color: #333;
  }

  .feels-like {
    font-weight: 500;
  }

  .location-display {
    font-weight: 500;
  }

  .weather-description {
    font-weight: 500;
    text-transform: capitalize;
  }

  .weather-details {
    font-size: 0.85rem;
    line-height: 1.4;
  }
}

// 代辦事項卡片樣式
.todo-card {
  .v-list-item {
    border-radius: 8px;
    margin-bottom: 4px;

    &:hover {
      background-color: rgba(255, 152, 0, 0.1);
    }
  }
}

// 最新消息卡片樣式
.news-card {
  .v-list-item {
    border-radius: 8px;
    margin-bottom: 8px;
  border: 1px solid #f0f0f0;

    &:hover {
      background-color: rgba(76, 175, 80, 0.1);
    }
  }
}

// 快速連結卡片樣式
.quick-links-card {
  .quick-link-item {
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

// 響應式設計
@media (max-width: 960px) {
  .dashboard-grid {
    gap: 12px;
  }

  .dashboard-card {
    height: 100px !important;
  }

  .time-display {
    font-size: 2rem !important;
  }

  .swiper-label,
  .weather-label,
  .todo-label,
  .news-label,
  .quick-links-label {
    font-size: 1rem !important;
  }
}

@media (max-width: 600px) {
  .dashboard-grid {
    gap: 8px;
  }

  .dashboard-card {
    height: 80px !important;
  }

  .time-display {
    font-size: 1.5rem !important;
  }

  .swiper-label,
  .weather-label,
  .todo-label,
  .news-label,
  .quick-links-label {
    font-size: 0.9rem !important;
  }
}
</style>
