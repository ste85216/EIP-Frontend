<template>
  <v-container
    class="px-6"
    max-width="2280px"
  >
    <!-- 整體布局：左側（時間+天氣+輪播+最新消息） + 右側（尚未決定+共享資源） -->
    <v-row class="mt-md-3">
      <!-- 左側大區塊 -->
      <v-col
        cols="12"
        lg="9"
      >
        <!-- 第一排：時間+天氣+輪播圖 -->
        <v-row>
          <!-- 左側：時間和天氣 -->
          <v-col
            cols="12"
            sm="3"
            class="pb-2 d-none d-md-block"
          >
            <v-row>
              <!-- 時間卡片 -->
              <v-col
                cols="12"
                sm="6"
                lg="12"
                class="pb-2 d-none d-lg-block"
              >
                <v-card
                  class="dashboard-card time-card"
                  elevation="2"
                >
                  <v-card-text class="d-flex flex-column align-center justify-center h-100">
                    <div class="time-display">
                      {{ currentTime }}
                    </div>
                    <div class="date-display text-grey-darken-2">
                      {{ currentDate }} {{ currentDay }}
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
                  :class="{ 'weather-card-loading': weatherLoading }"
                  elevation="2"
                  :style="weatherLoading ? {} : { backgroundImage: `url(${weatherBackground})` }"
                >
                  <v-card-text class="d-flex flex-column align-center justify-center h-100 px-4 pt-2 pb-4">
                    <v-skeleton-loader
                      v-if="weatherLoading"
                      type="image, text, text"
                      class="w-100"
                    />
                    <template v-else>
                      <div class="temperature-display mb-1">
                        {{ weatherData.temperature }}°C
                      </div>
                      <div class="feels-like  mb-1">
                        體感 {{ weatherData.feelsLike }}°C
                      </div>
                      <div class="location-display  mb-2">
                        {{ weatherData.location }}
                      </div>
                      <div class="weather-description mb-2">
                        {{ weatherData.description }}
                      </div>
                      <div class="weather-details">
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            size="16"
                            color="white"
                            class="me-2"
                          >
                            mdi-water
                          </v-icon>
                          <span class="humidity-display">濕度 {{ weatherData.humidity }}%</span>
                        </div>
                        <div class="d-flex align-center">
                          <v-icon
                            size="16"
                            color="white"
                            class="me-2"
                          >
                            mdi-weather-windy
                          </v-icon>
                          <span class="wind-speed-display">風速 {{ weatherData.windSpeed }} km/h</span>
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
            md="9"
            class="pb-md-0"
          >
            <v-card
              class="dashboard-card swiper-card"
              elevation="2"
            >
              <v-skeleton-loader
                v-if="carouselLoading"
                type="image"
              />
              <v-carousel
                v-else
                v-model="currentSlide"
                cycle
                color="#999"
                interval="6000"
                show-arrows="hover"
                hide-delimiter-background
                :height="carouselHeight"
                touch
              >
                <template #prev="{ props }">
                  <v-btn
                    v-bind="props"
                    class="custom-carousel-btn"
                    :size="buttonSize"
                    variant="text"
                  >
                    <v-icon
                      size="28"
                      color="amber-darken-1"
                    >
                      mdi-chevron-left
                    </v-icon>
                  </v-btn>
                </template>

                <template #next="{ props }">
                  <v-btn
                    v-bind="props"
                    class="custom-carousel-btn"
                    :size="buttonSize"
                    variant="text"
                  >
                    <v-icon
                      size="28"
                      color="amber-darken-1"
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
                  :class="{ 'has-link': slide.link }"
                  @click="handleCarouselClick(slide)"
                />
              </v-carousel>
            </v-card>
          </v-col>
        </v-row>

        <!-- 第二排：最新消息 -->
        <v-row>
          <v-col cols="12">
            <v-card
              class="dashboard-card news-card pa-0"
              elevation="2"
            >
              <v-card-title class="d-flex align-center bg-blue-grey-darken-2">
                <v-icon
                  size="18"
                  color="white"
                  class="me-2"
                >
                  mdi-newspaper-variant
                </v-icon>
                <span class="home-card-title">最新消息</span>
                <v-spacer />
                <v-chip
                  label
                  size="small"
                  color="white"
                  variant="outlined"
                >
                  {{ newsItems.length }} 則消息
                </v-chip>
              </v-card-title>
              <v-card-text class="pa-4">
                <v-skeleton-loader
                  v-if="newsLoading"
                  type="list-item@3"
                />
                <v-list
                  v-else
                  class="pa-0"
                >
                  <v-list-item
                    v-for="item in newsItems"
                    :key="item._id"
                    class="px-3 mb-2 news-item"
                    @click="viewAnnouncement(item)"
                  >
                    <v-list-item-title class="d-flex align-center flex-wrap gap-2">
                      <v-chip
                        v-if="item.isPinned"
                        label
                        color="red-darken-1"
                        size="small"
                        class="me-1"
                      >
                        <v-icon
                          icon="mdi-pin"
                          size="10"
                          class="me-1"
                        />
                        置頂
                      </v-chip>
                      <v-chip
                        :color="getAnnouncementTypeColor(item.type)"
                        label
                        size="small"
                        class="me-4"
                      >
                        {{ getAnnouncementTypeText(item.type) }}
                      </v-chip>
                      <span class="sub-title-1">{{ item.title }}</span>
                      <v-spacer />
                      <div class="d-flex align-center">
                        <div
                          class="me-4 info-item-tag"
                        >
                          <v-icon
                            icon="mdi-account"
                            size="12"
                            class="me-1"
                          />
                          <span class="sub-title-2">{{ item.creator?.name || '未知' }}</span>
                        </div>
                        <div class="info-item-tag">
                          <v-icon
                            icon="mdi-clock-outline"
                            size="12"
                            class="me-1 "
                          />
                          <span class="sub-title-2">{{ formatAnnouncementDate(item.createdAt) }}</span>
                        </div>
                      </div>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="newsItems.length === 0"
                    class="text-center text-grey"
                  >
                    暫無公告
                  </v-list-item>
                </v-list>
                <div class="text-center">
                  <v-btn
                    variant="text"
                    color="blue-grey-darken-2"
                    size="small"
                    @click="$router.push('/announcement')"
                  >
                    查看更多
                    <v-icon
                      icon="mdi-chevron-right"
                      size="18"
                      class="ms-1"
                    />
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- 右側區塊 -->
      <v-col
        cols="12"
        lg="3"
      >
        <!-- 分機表 -->
        <v-card
          class="dashboard-card extension-card pb-4 mb-4"
          elevation="2"
        >
          <v-card-title class="d-flex align-center bg-blue-grey-darken-2">
            <v-icon
              size="18"
              color="white"
              class="me-2"
            >
              mdi-phone
            </v-icon>
            <span class="home-card-title">分機查詢</span>
            <v-spacer />
            <v-chip
              label
              size="small"
              color="white"
              variant="outlined"
            >
              {{ filteredExtensions.length }} 人
            </v-chip>
          </v-card-title>
          <!-- 搜尋欄位 -->
          <v-text-field
            v-model="extensionSearch"
            density="compact"
            variant="outlined"
            placeholder="搜尋姓名或分機"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="mb-3 px-3 pt-2"
          />
          <v-card-text
            class="me-2 ps-3 pe-2 pt-0 pb-2 overflow-y-auto"
            style="height: 230px;"
          >
            <!-- 分機列表 -->
            <div
              v-if="extensionLoading"
              class="text-center py-4"
            >
              <v-progress-circular
                indeterminate
                color="blue-grey-darken-1"
                size="32"
                width="3"
              />
            </div>

            <v-list
              v-else
              class="pa-0 extension-list-scroll"
            >
              <v-list-item
                v-for="ext in filteredExtensions"
                :key="ext._id"
                class="px-3 py-1 mb-1 rounded extension-item"
                density="compact"
              >
                <v-list-item-title class="text-body-2 font-weight-medium d-flex align-center">
                  <v-chip
                    size="x-small"
                    :color="ext.companyColor"
                    class="me-2"
                  >
                    {{ ext.companyName }}
                  </v-chip>
                  <span class="sub-title-1">{{ ext.name }}</span>
                  <span class="ms-2 sub-title-2">({{ ext.jobTitle }})</span>
                </v-list-item-title>
                <template #append>
                  <v-chip
                    label
                    size="small"
                    color="blue-darken-1"
                    style="border: 1px solid #1E88E5;"
                  >
                    <v-icon
                      size="12"
                      class="me-1"
                    >
                      mdi-phone
                    </v-icon>
                    {{ ext.extNumber }}
                  </v-chip>
                </template>
              </v-list-item>

              <div
                v-if="filteredExtensions.length === 0"
                class="text-center py-4 text-grey"
              >
                查無資料
              </div>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- 共享資源 -->
        <v-card
          class="dashboard-card shared-resources-card pa-0"
          elevation="2"
        >
          <v-card-title class="d-flex align-center bg-blue-grey-darken-2">
            <v-icon
              size="18"
              color="white"
              class="me-2"
            >
              mdi-folder-outline
            </v-icon>
            <span class="home-card-title">共享資源</span>
            <v-spacer />
            <v-chip
              label
              size="small"
              color="white"
              variant="outlined"
            >
              {{ sharedResources.length }} 個檔案
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-skeleton-loader
              v-if="sharedResourcesLoading"
              type="list-item@4"
            />
            <v-list
              v-else
              class="pa-0"
            >
              <v-list-item
                v-for="resource in sharedResources"
                :key="resource.id"
                class="px-2 mb-2 resource-item"
                @click="handleResourceDownload(resource)"
              >
                <template #prepend>
                  <v-avatar
                    :color="getFileTypeColor(resource.type)"
                    size="36"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      {{ getFileTypeIcon(resource.type) }}
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ resource.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey-darken-1">
                  {{ resource.size }}
                </v-list-item-subtitle>
                <template #append>
                  <v-icon
                    size="20"
                    color="grey-darken-1"
                  >
                    mdi-download
                  </v-icon>
                </template>
              </v-list-item>
              <div
                v-if="sharedResources.length === 0"
                class="text-center py-4 text-grey"
              >
                暫無共享資源
              </div>
            </v-list>
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
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

// 頁面定義
definePage({
  meta: {
    title: '首頁 | Ystravel',
    login: true,
    permission: 'HOME_READ'
  }
})

const { mdAndUp, smAndUp, lgAndUp } = useDisplay()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

const carouselHeight = computed(() => {
  if (lgAndUp.value) return '360px'
  if (smAndUp.value) return '240px'
  return '200px'
})
const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()

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

// 根據天氣狀況返回背景圖片
const getWeatherBackgroundUrl = (condition) => {
  try {
    switch (condition) {
      case 'sunny':
      case 'clear':
        return new URL('@/assets/image/sunny.jpg', import.meta.url).href
      case 'cloudy':
      case 'clouds':
        return new URL('@/assets/image/cloudy.jpg', import.meta.url).href
      case 'rainy':
      case 'rain':
        return new URL('@/assets/image/rainy.jpg', import.meta.url).href
      case 'snowy':
      case 'snow':
        return new URL('@/assets/image/snowy.jpg', import.meta.url).href
      case 'stormy':
      case 'thunderstorm':
        return new URL('@/assets/image/stormy.jpg', import.meta.url).href
      case 'foggy':
      case 'mist':
        return new URL('@/assets/image/foggy.jpg', import.meta.url).href
      default:
        return new URL('@/assets/image/rainy.jpg', import.meta.url).href
    }
  } catch (error) {
    console.error('載入天氣背景圖片失敗:', error)
    // 如果圖片不存在，返回 rainy.jpg
    return new URL('@/assets/image/rainy.jpg', import.meta.url).href
  }
}

const weatherBackground = computed(() => {
  return getWeatherBackgroundUrl(weatherData.value.condition)
})

// 輪播圖相關
const currentSlide = ref(0)
const slides = ref([])
const carouselLoading = ref(false)

// 最新消息相關
const newsItems = ref([])
const newsLoading = ref(false)

// 分機表相關
const extensions = ref([])
const extensionLoading = ref(false)
const extensionSearch = ref('')

// 過濾後的分機列表
const filteredExtensions = computed(() => {
  if (!extensionSearch.value) {
    return extensions.value
  }

  const searchTerm = extensionSearch.value.toLowerCase()
  return extensions.value.filter(ext =>
    ext.name.toLowerCase().includes(searchTerm) ||
    ext.extNumber.includes(searchTerm) ||
    ext.jobTitle?.toLowerCase().includes(searchTerm)
  )
})

// 共享資源相關
const sharedResources = ref([])
const sharedResourcesLoading = ref(false)

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

// 處理輪播圖點擊
const handleCarouselClick = (slide) => {
  if (slide.link) {
    window.open(slide.link, '_blank')
  }
}

// 共享資源相關函數
const handleResourceDownload = async (resource) => {
  try {
    createSnackbar({
      text: `正在下載 ${resource.name}...`,
      snackbarProps: { color: 'blue-lighten-1' }
    })

    // 使用 API 下載檔案
    const response = await apiAuth.get(`/sharedResources/${resource.url}/download`, {
      responseType: 'blob'
    })

    // 創建下載連結
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', resource.name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    createSnackbar({
      text: `${resource.name} 下載成功`,
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('下載檔案失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '下載檔案失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const getFileTypeIcon = (type) => {
  switch (type) {
    case 'pdf': return 'mdi-file-pdf-box'
    case 'word': return 'mdi-file-word-box'
    case 'excel': return 'mdi-file-excel-box'
    case 'powerpoint': return 'mdi-file-powerpoint-box'
    case 'image': return 'mdi-file-image-box'
    case 'zip': return 'mdi-folder-zip'
    default: return 'mdi-file-document'
  }
}

const getFileTypeColor = (type) => {
  switch (type) {
    case 'pdf': return 'red'
    case 'word': return 'blue'
    case 'excel': return 'green'
    case 'powerpoint': return 'orange'
    case 'image': return 'purple'
    case 'zip': return 'amber'
    default: return 'grey'
  }
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 天氣 API 配置 (已移除 OpenWeatherMap，優先使用台灣官方 API)

// 中央氣象署開放資料 API (台灣官方，最準確)
const CWA_API_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore'
const CWA_API_KEY = 'CWA-75827C23-971A-4752-A41C-30CFB98F9FB1' // 需要申請

// 備用天氣 API (免費，無需註冊)
const BACKUP_WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'

// 只使用中央氣象署官方 API

// 獲取共享資源數據
const fetchSharedResources = async () => {
  try {
    sharedResourcesLoading.value = true
    const { data } = await apiAuth.get('/sharedResources/active', {
      params: {
        limit: 10
      }
    })

    if (data.success) {
      sharedResources.value = data.result.map(item => ({
        id: item._id,
        name: item.name,
        type: item.type,
        size: formatFileSize(item.file?.size || 0),
        url: item._id,
        description: item.description
      }))
    }
  } catch (error) {
    console.error('獲取共享資源數據失敗:', error)
    // 如果 API 失敗，使用空陣列
    sharedResources.value = []
  } finally {
    sharedResourcesLoading.value = false
  }
}

// 獲取分機表數據
const fetchExtensions = async () => {
  try {
    extensionLoading.value = true
    const { data } = await apiAuth.get('/employees/all', {
      params: {
        status: '在職',
        itemsPerPage: -1
      }
    })

    if (data.success) {
      // 處理不同的資料結構
      let employeeData = []
      if (Array.isArray(data.result)) {
        employeeData = data.result
      } else if (data.result && Array.isArray(data.result.data)) {
        employeeData = data.result.data
      }

      // 公司顏色對應
      const companyColors = {
        '永信台北': 'cyan-darken-2',
        '永信高雄': 'orange-darken-2',
        '永信台中': 'pink-darken-1',
        '永信桃園': 'indigo-darken-2',
        default: 'grey-darken-1'
      }

      // 只保留有分機號碼的員工，並按姓名排序
      extensions.value = employeeData
        .filter(emp => emp.extNumber)
        .map(emp => {
          const companyName = emp.company?.name || '其他'
          const companyColor = companyColors[companyName] || companyColors.default

          return {
            _id: emp._id,
            name: emp.name,
            extNumber: emp.extNumber,
            jobTitle: emp.jobTitle || '職員',
            department: emp.department?.name || '',
            companyName: companyName,
            companyColor: companyColor
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    }
  } catch (error) {
    console.error('獲取分機表數據失敗:', error)
    // 如果 API 失敗，使用空陣列
    extensions.value = []
  } finally {
    extensionLoading.value = false
  }
}

// 獲取輪播圖數據
const fetchCarouselData = async () => {
  try {
    carouselLoading.value = true
    const { data } = await apiAuth.get('/carousels/active')

    if (data.success) {
      slides.value = data.result.map(item => ({
        id: item._id,
        image: item.image,
        title: item.title,
        description: item.description,
        link: item.link
      }))
    }
  } catch (error) {
    console.error('獲取輪播圖數據失敗:', error)
    // 如果 API 失敗，使用預設數據
    slides.value = [
      { id: 1, image: 'https://picsum.photos/800/400?random=1', title: '輪播項目 1' },
      { id: 2, image: 'https://picsum.photos/800/400?random=2', title: '輪播項目 2' },
      { id: 3, image: 'https://picsum.photos/800/400?random=3', title: '輪播項目 3' },
      { id: 4, image: 'https://picsum.photos/800/400?random=4', title: '輪播項目 4' },
      { id: 5, image: 'https://picsum.photos/800/400?random=5', title: '輪播項目 5' }
    ]
  } finally {
    carouselLoading.value = false
  }
}

// 載入公告數據
const fetchAnnouncements = async () => {
  try {
    newsLoading.value = true
    const { data } = await apiAuth.get('/announcements', {
      params: {
        isActive: true,
        page: 1,
        itemsPerPage: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    })

    if (data.success) {
      // 將置頂公告排在前面
      newsItems.value = data.result.data.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
    }
  } catch (error) {
    console.error('載入公告錯誤:', error)
  } finally {
    newsLoading.value = false
  }
}

// 獲取天氣數據
const fetchWeatherData = async () => {
  try {
    weatherLoading.value = true
    weatherError.value = ''

    console.log('正在獲取天氣數據...')

    // 優先嘗試中央氣象署 API (台灣官方，最準確)
    try {
      console.log('嘗試中央氣象署 API...')
      const cwaResponse = await fetch(
        `${CWA_API_URL}/O-A0003-001?Authorization=${CWA_API_KEY}&format=JSON&locationName=臺北市`
      )

      if (cwaResponse.ok) {
        const cwaData = await cwaResponse.json()
        console.log('中央氣象署 API 成功:', cwaData)

        if (cwaData.success && cwaData.records && cwaData.records.Station) {
          // 找到台北市的觀測站數據
          const taipeiStation = cwaData.records.Station.find(station =>
            station.CountyName === '臺北市' || station.CountyName === '台北市'
          )

          if (taipeiStation) {
            console.log('找到台北市觀測站數據:', taipeiStation)

            weatherData.value = {
              temperature: Math.round(parseFloat(taipeiStation.AirTemperature || 0)),
              condition: getTaiwanWeatherConditionFromStation(taipeiStation),
              humidity: Math.round(parseFloat(taipeiStation.RelativeHumidity || 0)),
              windSpeed: Math.round(parseFloat(taipeiStation.WindSpeed || 0)),
              location: taipeiStation.StationName || '台北市',
              description: getTaiwanWeatherDescriptionFromStation(taipeiStation),
              feelsLike: Math.round(parseFloat(taipeiStation.AirTemperature || 0)),
              pressure: Math.round(parseFloat(taipeiStation.AirPressure || 0)),
              visibility: 10
            }
            console.log('中央氣象署天氣數據更新成功:', weatherData.value)
            return
          }
        }
      }
    } catch (error) {
      console.log('中央氣象署 API 失敗，嘗試其他 API...', error.message)
    }

    // 只使用中央氣象署官方 API，跳過其他服務

    // 跳過 OpenWeatherMap API，直接使用備用 API
    console.log('跳過國際 API，直接使用備用 API...')

    // 如果所有 API 都失敗，使用備用 API
    console.log('使用備用天氣 API...')
    const backupResponse = await fetch(
      `${BACKUP_WEATHER_API_URL}?latitude=25.0478&longitude=121.5319&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FTaipei`
    )

    if (!backupResponse.ok) {
      throw new Error('所有 API 都失敗了')
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

// 只使用中央氣象署官方 API

// 中央氣象署觀測站數據專用函數
const getTaiwanWeatherConditionFromStation = (station) => {
  const weather = station.Weather
  const precipitation = parseFloat(station.Precipitation || 0)

  // 如果有降雨量，判斷為雨天
  if (precipitation > 0) {
    return 'rainy'
  }

  // 根據天氣描述判斷
  if (weather) {
    const weatherLower = weather.toLowerCase()
    if (weatherLower.includes('雨') || weatherLower.includes('rain')) return 'rainy'
    if (weatherLower.includes('雷') || weatherLower.includes('thunder')) return 'stormy'
    if (weatherLower.includes('霧') || weatherLower.includes('fog')) return 'foggy'
    if (weatherLower.includes('雲') || weatherLower.includes('cloud')) return 'cloudy'
    if (weatherLower.includes('晴') || weatherLower.includes('sunny')) return 'sunny'
  }

  return 'sunny'
}

const getTaiwanWeatherDescriptionFromStation = (station) => {
  const weather = station.Weather
  const precipitation = parseFloat(station.Precipitation || 0)

  // 如果有降雨量，顯示降雨
  if (precipitation > 0) {
    return `降雨 ${precipitation}mm`
  }

  // 使用觀測站的天氣描述
  if (weather) {
    return weather
  }

  return '晴朗'
}

// 已移除 OpenWeatherMap 相關函數，優先使用台灣官方 API

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

// 已移除 OpenWeatherMap 相關函數，優先使用台灣官方 API

// 已移除 OpenWeatherMap 相關函數，優先使用台灣官方 API

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

// 公告類型顏色
const getAnnouncementTypeColor = (type) => {
  const colorMap = {
    system: 'red-darken-1',
    update: 'blue-darken-1',
    announcement: 'green-darken-1',
    maintenance: 'orange-darken-1',
    event: 'purple-darken-1'
  }
  return colorMap[type] || 'grey-darken-1'
}

// 公告類型文字
const getAnnouncementTypeText = (type) => {
  const typeMap = {
    system: '系統',
    update: '更新',
    announcement: '一般',
    maintenance: '維護',
    event: '活動'
  }
  return typeMap[type] || '一般'
}

// 格式化公告日期
const formatAnnouncementDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  // 如果是今天
  if (diff < 86400000 && now.getDate() === d.getDate()) {
    const hours = Math.floor(diff / 3600000)
    if (hours === 0) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}分鐘前`
    }
    return `${hours}小時前`
  }

  // 如果是昨天
  if (diff < 172800000 && now.getDate() - d.getDate() === 1) {
    return '昨天'
  }

  // 顯示完整日期
  return d.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit'
  })
}

// 查看公告詳情
const viewAnnouncement = (announcement) => {
  router.push(`/announcement/${announcement._id}`)
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

  // 獲取天氣數據、輪播圖數據、公告數據、分機表數據和共享資源數據
  await Promise.all([
    fetchWeatherData(),
    fetchCarouselData(),
    fetchAnnouncements(),
    fetchExtensions(),
    fetchSharedResources()
  ])

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
@use '@/styles/_rwd' as *;
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
  background: url('/src/assets/image/bg_monster_2.png');
  background-position: center;
  background-size: cover;
  .time-display {
    text-align: center;
    width: 126px;
    font-size: 36px;
    font-weight: 100;
    letter-spacing: 4px;
    color: #0097A7;
    font-family: 'Spicy Rice', sans-serif;
    background: rgba(255, 255, 255, 0.98);
    padding: 0px 8px;
    margin-top: 4px;
    margin-bottom: 6px;
    border-radius: 4px;
  }

  .date-display,
  .day-display {
    text-align: center;
    background: rgba(255, 255, 255, 0.98);
    margin-bottom: 2px;
    padding: 1px 6px;
    border-radius: 4px;
    font-family: 'Noto Sans TC', sans-serif;
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.4px;
  }
}

// 輪播圖卡片樣式
.swiper-card {
  height: 200px;

  .v-carousel {
    overflow: hidden;
  }

  // 有連結的輪播項目顯示 pointer
  :deep(.v-carousel-item.has-link) {
    cursor: pointer;
  }

  // 調整分頁指示器 (dots) 的大小和間距
  :deep(.v-carousel__controls) {
    .v-btn {
      width: 10px !important;   // 調整寬度
      height: 10px !important;  // 調整高度
      margin: 0 6px !important;  // 調整間距 (預設是 0 8px)
      opacity: 0.8 !important;  // 未選中的透明度
      color: #000 !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      transition: all 0.3s ease !important;

      .v-icon {
        font-size: 12px !important;
      }

      // 選中狀態（active）
      &.v-btn--active {
        opacity: 1 !important;
        width: 13px !important;
        height: 13px !important;
        color: transparent !important;
        .v-icon {
          font-size: 13px !important;  // 圖標稍微大一點
          color: orange !important;
          opacity: 1 !important;
        }
      }

      // hover 效果
      &:hover:not(.v-btn--active) {
        opacity: 0.7 !important;
      }
    }
  }
}

// 客製化 carousel 按鈕樣式
.custom-carousel-btn {
  background-color: rgba(0,0,0,0.2) !important;
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
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  height: 240px;
  position: relative;
  transition: none !important; // 移除 transition 避免背景圖滑動效果

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1;
    border-radius: 8px;
  }

  :deep(.v-card-text) {
    position: relative;
    z-index: 2;
  }

  // 載入中狀態：白色背景，移除遮罩
  &.weather-card-loading {
    background: #fff !important;

    &::before {
      display: none !important;
    }
  }

  .temperature-display {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    font-family: 'Quantico', sans-serif;
  }

  .feels-like {
    font-size: 13px;
    font-weight: 300;
    color: #fff;
    font-family:'Noto Sans TC', sans-serif;
  }

  .location-display {
    font-size: 13px;
    font-weight: 300;
    color: #fff;
    font-family:'Noto Sans TC', sans-serif;

  }

  .weather-description {
    font-weight: 400;
    color: #fff;
    text-transform: capitalize;
    font-family:'Noto Sans TC', sans-serif;

  }

  .weather-details {
    line-height: 1.4;
  }
}

.humidity-display {
  color: #fff;
  font-size: 11px;
  font-weight: 300;
  font-family:'Noto Sans TC', sans-serif;
}

.wind-speed-display {
  color: #fff;
  font-size: 11px;
  font-weight: 300;
  font-family:'Noto Sans TC', sans-serif;
}

// 最新消息卡片樣式
.news-card {
  height: auto;
  min-height: 300px;

  .news-item {
    border-radius: 4px !important;
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: all 0.1s ease;

    &:hover {
      background-color: rgba(139, 139, 139, 0.08);
      border-color: rgba(114, 114, 114, 0.3);
    }
  }
  .info-item-tag {
    width: 80px;
  }
}

// 分機表卡片樣式
.extension-card {
  height: 360px;
  .extension-list-scroll {
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;

      &:hover {
        background: #555;
      }
    }
  }

  .extension-item {
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(96, 125, 139, 0.08);
      border-color: rgba(96, 125, 139, 0.3);
    }
  }
}

// 共享資源卡片樣式
.shared-resources-card {
  .resource-item {
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: rgba(33, 150, 243, 0.08);
      border-color: rgba(33, 150, 243, 0.3);
      transform: translateX(4px);
    }
  }
}

.home-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

@include sm {
  .time-card {
    height: 240px;
  }
  .swiper-card {
    height: 240px;
  }
}

@include lg {
  .swiper-card {
    height: 360px;
  }
  .time-card {
    height: 109px;
  }
  .weather-card {
    height: 230px;
    .temperature-display {
      font-size: 36px;
    }
    .feels-like {
      font-size: 14px;
    }
    .location-display {
      font-size: 13px;
    }
    .weather-description {
      font-size: 15px;
    }
    .humidity-display {
      font-size: 13px;
    }
    .wind-speed-display {
      font-size: 13px;
    }
  }

  .news-card {
    height: 400px;
  }

  .home-card-title {
  font-size: 16px;
  font-weight: 700;
  }

  .v-card-title {
  padding: 10px 16px;
  }
}



</style>
