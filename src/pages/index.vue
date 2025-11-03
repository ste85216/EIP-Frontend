<template>
  <v-container
    class="px-3 px-sm-6"
    max-width="1620px"
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
                      class="w-100 mt-5"
                    />
                    <template v-else>
                      <div class="temperature-display mb-1">
                        {{ weatherData.temperature }}°C
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
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            size="16"
                            color="white"
                            class="me-2"
                          >
                            mdi-thermometer
                          </v-icon>
                          <span class="humidity-display">體感溫度 {{ weatherData.feelsLike }}°C</span>
                        </div>
                        <div class="d-flex align-center">
                          <v-icon
                            size="16"
                            color="white"
                            class="me-2"
                          >
                            mdi-weather-rainy
                          </v-icon>
                          <span class="humidity-display">降雨機率 {{ weatherData.precipitationProbability }}%</span>
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
                  :size="smAndUp ? '18' : '16'"
                  color="white"
                  class="me-2"
                >
                  mdi-newspaper-variant
                </v-icon>
                <span class="home-card-title">最新消息</span>
                <v-spacer />
                <v-chip
                  label
                  :size="smAndUp ? 'small' : 'x-small'"
                  color="white"
                  variant="outlined"
                >
                  {{ newsItems.length }} 則消息
                </v-chip>
              </v-card-title>
              <v-card-text class="px-0 ">
                <v-skeleton-loader
                  v-if="newsLoading"
                  type="list-item@3"
                />
                <template v-else>
                  <!-- 表頭 -->
                  <div class="news-header d-flex align-center px-5 py-2">
                    <div class="news-header-type">
                      類型
                    </div>
                    <div class="news-header-title">
                      標題
                    </div>
                    <div class="news-header-creator d-none d-md-block">
                      發布人
                    </div>
                    <div class="news-header-time">
                      發布時間
                    </div>
                    <div class="news-header-views d-none d-sm-block">
                      瀏覽
                    </div>
                  </div>

                  <!-- 列表內容 -->
                  <v-list class="pa-0">
                    <v-list-item
                      v-for="(item, index) in newsItems"
                      :key="item._id"
                      class="ps-5 pe-5 news-item"
                      :class="index % 2 === 0 ? 'odd-row' : 'even-row'"
                      @click="viewAnnouncement(item)"
                    >
                      <v-list-item-title class="d-flex align-center">
                        <div class="news-item-type">
                          <v-chip
                            :color="getAnnouncementTypeColor(item.type)"
                            label
                            :size="smAndUp ? 'small' : 'x-small'"
                          >
                            <v-icon
                              :icon="getAnnouncementTypeIcon(item.type)"
                              :size="smAndUp ? '14' : '12'"
                              class="me-1"
                            />
                            {{ getAnnouncementTypeText(item.type) }}
                          </v-chip>
                        </div>
                        <div class="news-item-title">
                          <span class="sub-title-1">{{ item.title }}</span>
                        </div>
                        <div class="news-item-creator d-none d-md-flex">
                          <v-icon
                            icon="mdi-account"
                            size="12"
                            class="me-1"
                          />
                          <span class="sub-title-2">{{ item.creator?.name || '未知' }}</span>
                        </div>
                        <div class="news-item-time">
                          <v-icon
                            icon="mdi-clock-outline"
                            size="12"
                            class="me-1"
                          />
                          <span class="sub-title-2">{{ smAndUp ? formatAnnouncementDate(item.createdAt) : formatAnnouncementDateCompact(item.createdAt) }}</span>
                        </div>
                        <div class="news-item-views d-none d-sm-flex">
                          <v-icon
                            icon="mdi-eye"
                            size="12"
                            class="me-1"
                          />
                          <span class="sub-title-2">{{ item.viewCount || 0 }}</span>
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="newsItems.length === 0"
                      class="text-center text-grey pt-4"
                    >
                      暫無公告
                    </v-list-item>
                  </v-list>
                </template>
                <div
                  v-if="newsItems.length >= 6"
                  class="text-center"
                >
                  <v-btn
                    variant="plain"
                    color="blue-grey-darken-2"
                    size="small"
                    :ripple="false"
                    class="mt-3 opacity-75"
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
          class="dashboard-card extension-card pb-4"
          elevation="2"
        >
          <v-card-title class="d-flex align-center bg-blue-grey-darken-2">
            <v-icon
              :size="smAndUp ? '18' : '16'"
              color="white"
              class="me-2"
            >
              mdi-phone
            </v-icon>
            <span class="home-card-title">分機查詢</span>
            <v-spacer />
            <v-chip
              label
              :size="smAndUp ? 'small' : 'x-small'"
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
              class="pa-0 list-scroll"
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
                    class="me-2 ext-company-chip"
                  >
                    {{ ext.companyName }}
                  </v-chip>
                  <span class="sub-title-1">{{ ext.name }}</span>
                  <span class="ms-2 sub-title-2 ext-job-title">({{ ext.jobTitle }})</span>
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
          class="dashboard-card shared-resources-card"
          elevation="2"
        >
          <v-card-title class="d-flex align-center bg-blue-grey-darken-2">
            <v-icon
              :size="smAndUp ? '18' : '16'"
              color="white"
              class="me-2"
            >
              mdi-folder-outline
            </v-icon>
            <span class="home-card-title">共享資源</span>
            <v-spacer />
            <v-chip
              label
              :size="smAndUp ? 'small' : 'x-small'"
              color="white"
              variant="outlined"
            >
              {{ filteredSharedResources.length }} 個檔案
            </v-chip>
          </v-card-title>
          <!-- 搜尋欄位 -->
          <v-text-field
            v-model="sharedResourceSearch"
            density="compact"
            variant="outlined"
            placeholder="搜尋檔案名稱"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="px-3 pt-2"
          />
          <v-card-text class="px-0 pt-3">
            <v-skeleton-loader
              v-if="sharedResourcesLoading"
              type="list-item@4"
            />
            <v-list
              v-else
              class="pa-0 list-scroll"
            >
              <v-list-item
                v-for="(resource, index) in filteredSharedResources"
                :key="resource.id"
                class="px-5 resource-item"
                :class="index % 2 === 0 ? 'odd-row' : 'even-row'"
              >
                <template #prepend>
                  <v-avatar
                    :color="getFileTypeColor(resource.type)"
                    size="24"
                  >
                    <v-icon
                      size="14"
                      color="white"
                    >
                      {{ getFileTypeIcon(resource.type) }}
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="sub-title-1 font-weight-medium">
                  {{ resource.name }} <span class="sub-title-2 text-grey-darken-1">( {{ resource.size }} )</span>
                </v-list-item-title>
                <template #append>
                  <v-btn
                    icon
                    size="32"
                    variant="text"
                    color="blue-grey-darken-1"
                    @click.stop="handleResourceDownload(resource)"
                  >
                    <v-icon size="16">
                      mdi-download
                    </v-icon>
                  </v-btn>
                </template>
              </v-list-item>
              <div
                v-if="filteredSharedResources.length === 0"
                class="text-center pt-6 pb-2 text-grey"
              >
                {{ sharedResourceSearch ? '查無符合條件的檔案' : '暫無共享資源' }}
              </div>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
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
  // if (xlAndUp.value) return '600px'
  if (lgAndUp.value) return '360px'
  if (smAndUp.value) return '240px'
  return '200px'
})
const router = useRouter()
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
  feelsLike: 0,
  precipitationProbability: 0,
  location: '台北市',
  description: '',
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
const sharedResourceSearch = ref('')

// 過濾後的共享資源列表
const filteredSharedResources = computed(() => {
  if (!sharedResourceSearch.value) {
    return sharedResources.value
  }

  const searchTerm = sharedResourceSearch.value.toLowerCase()
  return sharedResources.value.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm) ||
    resource.description?.toLowerCase().includes(searchTerm)
  )
})

// 已移除預設密碼提醒與修改密碼相關狀態

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

    // 從回應標頭取得檔名與 MIME 類型（優先使用伺服器提供）
    const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']
    const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] || resource.mimetype || 'application/octet-stream'

    const fallbackName = resource.fileOriginalName || resource.name || 'download'

    // 解析 filename 與 filename*
    let filename = fallbackName
    if (typeof contentDisposition === 'string') {
      const matchStar = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
      const matchStd = /filename="?([^";]+)"?/i.exec(contentDisposition)
      if (matchStar && matchStar[1]) {
        try {
          filename = decodeURIComponent(matchStar[1])
        } catch {
          filename = matchStar[1]
        }
      } else if (matchStd && matchStd[1]) {
        filename = matchStd[1]
      }
    }

    // 還原加號為空白與基本清洗
    if (filename && filename.includes('+') && !filename.includes('%2B')) {
      filename = filename.replace(/\+/g, ' ')
    }
    filename = String(filename).replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!filename || filename.replace(/[_\s]/g, '') === '') {
      filename = fallbackName
    }

    // 若無副檔名，依據 MIME 類型補齊
    const hasExt = /\.[A-Za-z0-9]{2,5}$/.test(filename)
    if (!hasExt) {
      const mimeToExt = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
      }
      let ext = mimeToExt[contentType]
      if (!ext && contentType?.startsWith('image/')) {
        ext = `.${contentType.split('/')[1]}`
      }
      if (!ext && /\.[A-Za-z0-9]{2,5}$/.test(fallbackName)) {
        ext = fallbackName.slice(fallbackName.lastIndexOf('.'))
      }
      if (ext) filename += ext
    }

    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    createSnackbar({
      text: `${filename} 下載成功`,
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
    case 'image': return 'mdi-file-image'
    case 'zip': return 'mdi-folder-zip'
    default: return 'mdi-file-document'
  }
}

const getFileTypeColor = (type) => {
  switch (type) {
    case 'pdf': return 'red-lighten-1'
    case 'word': return 'blue'
    case 'excel': return 'green-darken-1'
    case 'powerpoint': return 'orange-darken-1'
    case 'image': return 'purple-lighten-1'
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

// 天氣 API 配置 - 只使用中央氣象署官方 API
const CWA_API_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore'
const CWA_API_KEY = 'CWA-75827C23-971A-4752-A41C-30CFB98F9FB1'

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
        description: item.description,
        fileOriginalName: item.file?.originalName || '',
        mimetype: item.file?.mimetype || ''
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
        itemsPerPage: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    })

    if (data.success) {
      newsItems.value = data.result.data
    }
  } catch (error) {
    console.error('載入公告錯誤:', error)
  } finally {
    newsLoading.value = false
  }
}

// 獲取 IP 定位（返回城市和座標）
const getLocationByIP = async () => {
  // 嘗試多個 IP 定位服務
  const ipServices = [
    {
      url: 'https://ipinfo.io/json',
      handler: (data) => {
        const loc = data.loc?.split(',')
        return {
          countryCode: data.country,
          city: data.city,
          region: data.region,
          latitude: loc?.[0],
          longitude: loc?.[1]
        }
      }
    },
    {
      url: 'https://ipapi.co/json/',
      handler: (data) => ({
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude
      })
    }
  ]

  for (const service of ipServices) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(service.url, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const locationInfo = service.handler(data)

        // 檢查是否在台灣
        if (locationInfo.countryCode === 'TW' || locationInfo.countryCode === 'Taiwan') {
          // 使用座標進行反向地理編碼獲取更精確的位置
          if (locationInfo.latitude && locationInfo.longitude) {
            try {
              const reverseGeocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${locationInfo.latitude}&lon=${locationInfo.longitude}&format=json&addressdetails=1&accept-language=zh-TW`,
                {
                  headers: {
                    'User-Agent': 'WeatherApp/1.0'
                  }
                }
              )

              if (reverseGeocodeResponse.ok) {
                const geocodeData = await reverseGeocodeResponse.json()
                const address = geocodeData.address || {}
                const city = address.city || address.county || address.city_district || locationInfo.city
                const district = address.suburb || address.district || address.borough || address.neighbourhood

                // 轉換為中央氣象署使用的格式
                let cityName = city
                if (city === 'Taipei' || city === '台北' || city === '臺北') {
                  cityName = '臺北市'
                } else if (city === 'New Taipei' || city === '新北') {
                  cityName = '新北市'
                } else if (city === 'Taoyuan' || city === '桃園') {
                  cityName = '桃園市'
                } else if (city === 'Taichung' || city === '台中' || city === '臺中') {
                  cityName = '臺中市'
                } else if (city === 'Tainan' || city === '台南' || city === '臺南') {
                  cityName = '臺南市'
                } else if (city === 'Kaohsiung' || city === '高雄') {
                  cityName = '高雄市'
                } else if (city === 'Keelung' || city === '基隆') {
                  cityName = '基隆市'
                }

                return { cityName, district, latitude: locationInfo.latitude, longitude: locationInfo.longitude }
              }
            } catch (geocodeError) {
              console.warn('反向地理編碼失敗:', geocodeError)
            }
          }

          // 如果反向地理編碼失敗，使用原始城市名稱
          const city = locationInfo.city
          if (city === 'Taipei') {
            return { cityName: '臺北市', district: null, latitude: locationInfo.latitude, longitude: locationInfo.longitude }
          }
          if (city) {
            return { cityName: city, district: null, latitude: locationInfo.latitude, longitude: locationInfo.longitude }
          }
        }
      }
    } catch (error) {
      console.warn(`IP 定位服務失敗 (${service.url}):`, error?.message)
    }
  }

  // 所有服務都失敗，返回預設值
  console.warn('所有 IP 定位服務都失敗，使用預設位置: 臺北市')
  return { cityName: '臺北市', district: null, latitude: null, longitude: null }
}

// 獲取天氣數據
const fetchWeatherData = async () => {
  try {
    weatherLoading.value = true
    weatherError.value = ''

    // 使用 IP 定位獲取位置
    const locationInfo = await getLocationByIP()
    const cityName = locationInfo.cityName || '臺北市'

    // 只使用中央氣象署 API
    const cwaResponse = await fetch(
      `${CWA_API_URL}/O-A0003-001?Authorization=${CWA_API_KEY}&format=JSON&locationName=${encodeURIComponent(cityName)}`
    )

    if (cwaResponse.ok) {
      const cwaData = await cwaResponse.json()

      if (cwaData.success && cwaData.records && cwaData.records.Station) {

        let station = null

        // 優先使用座標距離找最近的觀測站（最準確）
        if (locationInfo.latitude && locationInfo.longitude) {
          const userLat = parseFloat(locationInfo.latitude)
          const userLon = parseFloat(locationInfo.longitude)

          // 計算所有觀測站的距離，找最近的
          const stationsWithDistance = cwaData.records.Station.map(s => {
            const geoInfo = s.GeoInfo || {}
            const coordinates = geoInfo.Coordinates || []
            const stationAltitude = parseFloat(geoInfo.StationAltitude || 0)

            // Coordinates 可能是物件陣列 [{CoordinateName: '緯度', CoordinateValue: '25.0'}, ...]
            let stationLat = 0
            let stationLon = 0

            if (Array.isArray(coordinates) && coordinates.length > 0) {
              // 檢查是否是物件陣列
              if (typeof coordinates[0] === 'object' && coordinates[0] !== null) {
                // 中央氣象署的座標格式：每個元素有 StationLatitude 和 StationLongitude
                // 優先使用 WGS84（現代標準），否則使用 TWD67
                let wgs84Coord = null
                let twd67Coord = null

                for (const coord of coordinates) {
                  if (coord.CoordinateName === 'WGS84' || coord.coordinateName === 'WGS84') {
                    wgs84Coord = coord
                  } else if (coord.CoordinateName === 'TWD67' || coord.coordinateName === 'TWD67') {
                    twd67Coord = coord
                  }
                }

                // 優先使用 WGS84，如果沒有則使用 TWD67
                const selectedCoord = wgs84Coord || twd67Coord || coordinates[0]

                if (selectedCoord) {
                  const lat = parseFloat(selectedCoord.StationLatitude || selectedCoord.stationLatitude || 0)
                  const lon = parseFloat(selectedCoord.StationLongitude || selectedCoord.stationLongitude || 0)

                  if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
                    stationLat = lat
                    stationLon = lon
                  }
                }
              } else if (typeof coordinates[0] === 'number' || typeof coordinates[0] === 'string') {
                // 簡單陣列格式：[緯度, 經度]
                const lat = parseFloat(coordinates[0])
                const lon = parseFloat(coordinates[1])
                if (!isNaN(lat) && !isNaN(lon)) {
                  stationLat = lat
                  stationLon = lon
                }
              }
            }

            if (stationLat !== 0 && stationLon !== 0) {
              // 使用 Haversine 公式計算距離
              const R = 6371 // 地球半徑（公里）
              const dLat = (stationLat - userLat) * Math.PI / 180
              const dLon = (stationLon - userLon) * Math.PI / 180
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(userLat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              const distance = R * c

              return { station: s, distance, lat: stationLat, lon: stationLon, altitude: stationAltitude }
            }

            return { station: s, distance: Infinity, altitude: stationAltitude }
          })

          // 過濾掉距離為無限大的，然後排序找出最近的
          const validStations = stationsWithDistance.filter(s => s.distance !== Infinity)
          if (validStations.length > 0) {
            // 優先選擇同一城市且海拔較低的觀測站（避免選擇山上觀測站）
            const sameCityStations = validStations.filter(item => {
              const geoInfo = item.station.GeoInfo || {}
              return geoInfo.CountyName === cityName && item.altitude < 200 // 優先選擇海拔低於200m的
            })

            let stationsToSort = sameCityStations.length > 0 ? sameCityStations : validStations

            // 排序：先按距離，再按海拔（優先選擇低海拔）
            stationsToSort.sort((a, b) => {
              if (Math.abs(a.distance - b.distance) < 5) {
                // 距離相近時，優先選擇海拔低的
                return a.altitude - b.altitude
              }
              return a.distance - b.distance
            })

            station = stationsToSort[0]?.station
          }
        }

        // 如果座標匹配失敗，使用城市名稱匹配作為備用
        if (!station) {
          // 找到同一城市的所有觀測站
          const sameCityStations = cwaData.records.Station.filter(s => {
            const geoInfo = s.GeoInfo || {}
            const countyName = geoInfo.CountyName || ''
            return countyName === cityName ||
                   countyName === cityName.replace('臺', '台') ||
                   countyName === cityName.replace('台', '臺')
          })

          if (sameCityStations.length > 0) {
            // 優先選擇平地觀測站（海拔低於200m）
            const flatStations = sameCityStations.filter(s => {
              const geoInfo = s.GeoInfo || {}
              const altitude = parseFloat(geoInfo.StationAltitude || 0)
              return altitude < 200
            })

            if (flatStations.length > 0) {
              // 在平地觀測站中，優先選擇名稱為城市名稱的（如「臺北」）
              station = flatStations.find(s => {
                const name = s.StationName || ''
                return name === cityName.replace('市', '') ||
                       name === cityName.replace('臺北市', '臺北') ||
                       name === cityName.replace('台北市', '台北')
              })

              // 如果沒找到，選擇第一個平地觀測站
              if (!station) {
                station = flatStations[0]
              }
            } else {
              // 如果沒有平地觀測站，至少選擇海拔最低的
              sameCityStations.sort((a, b) => {
                const altA = parseFloat(a.GeoInfo?.StationAltitude || 0)
                const altB = parseFloat(b.GeoInfo?.StationAltitude || 0)
                return altA - altB
              })
              station = sameCityStations[0]
            }
          }
        }

        // 如果還是找不到，使用第一個
        if (!station) {
          station = cwaData.records.Station[0]
          console.warn('未找到匹配的觀測站，使用第一個:', station?.StationName)
        }

        if (station) {
          // 從 WeatherElement 讀取資料（中央氣象署 API 的實際結構）
          const weatherElement = station.WeatherElement || {}
          const geoInfo = station.GeoInfo || {}
          const nowData = weatherElement.Now || {}

          // 讀取溫度（嘗試多種可能的欄位名稱）
          let temperatureValue =
            weatherElement.AirTemperature ||
            weatherElement.Temperature ||
            nowData.AirTemperature ||
            nowData.Temperature ||
            weatherElement.T ||
            0

          const temperature = Math.round(parseFloat(temperatureValue))

          // 讀取濕度
          let humidityValue =
            weatherElement.RelativeHumidity ||
            weatherElement.Humidity ||
            nowData.RelativeHumidity ||
            nowData.Humidity ||
            weatherElement.RH ||
            0

          const humidity = Math.round(parseFloat(humidityValue))

          // 讀取風速（用於計算體感溫度）
          const windSpeed = parseFloat(
            weatherElement.WindSpeed ||
            weatherElement.WS ||
            nowData.WindSpeed ||
            nowData.WS ||
            0
          )

          // 計算體感溫度（考慮溫度、濕度、風速）
          // 使用更完整的公式
          let feelsLike = temperature

          if (temperature >= 27 && humidity >= 40) {
            // 高溫高濕：使用 Heat Index (體感溫度)
            const T = temperature
            const H = humidity
            const HI = -8.78469475556 +
              1.61139411 * T +
              2.33854883889 * H +
              -0.14611605 * T * H +
              -0.012308094 * Math.pow(T, 2) +
              -0.0164248277778 * Math.pow(H, 2) +
              0.002211732 * Math.pow(T, 2) * H +
              0.00072546 * T * Math.pow(H, 2) +
              -0.000003582 * Math.pow(T, 2) * Math.pow(H, 2)
            feelsLike = Math.round(HI)
          } else if (temperature <= 10 && windSpeed > 4.8) {
            // 低溫有風：使用 Wind Chill (風寒指數)
            // 轉換風速從 m/s 到 km/h: windSpeed * 3.6
            const windKmh = windSpeed * 3.6
            const WC = 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temperature * Math.pow(windKmh, 0.16)
            feelsLike = Math.round(WC)
          } else {
            // 一般情況：考慮濕度和風速的影響
            let adjustment = 0

            // 濕度影響（高濕度會讓人感覺更熱或更冷）
            if (temperature > 20) {
              // 高溫時，高濕度增加體感溫度
              adjustment += (humidity - 50) * 0.05
            } else if (temperature < 15) {
              // 低溫時，高濕度降低體感溫度
              adjustment -= (humidity - 50) * 0.03
            }

            // 風速影響（風會帶走熱量）
            if (windSpeed > 2) {
              adjustment -= windSpeed * 0.3
            }

            feelsLike = Math.round(temperature + adjustment)
          }

          // 確保體感溫度不會太極端
          if (feelsLike > temperature + 5) feelsLike = temperature + 5
          if (feelsLike < temperature - 8) feelsLike = temperature - 8

          // 從中央氣象署獲取降雨機率
          let precipitationProbability = 0

          // 總是嘗試從預報 API 獲取降雨機率（更準確）
          try {
            const countyName = geoInfo.CountyName || cityName
            const forecastResponse = await fetch(
              `${CWA_API_URL}/F-C0032-001?Authorization=${CWA_API_KEY}&locationName=${encodeURIComponent(countyName)}`
            )
            if (forecastResponse.ok) {
              const forecastData = await forecastResponse.json()

              // 檢查資料結構
              if (forecastData.success === 'true' && forecastData.records?.location) {
                const locations = Array.isArray(forecastData.records.location)
                  ? forecastData.records.location
                  : [forecastData.records.location]

                if (locations.length > 0) {
                  const locationData = locations[0]
                  const weatherElements = locationData.weatherElement || []
                  const popElement = weatherElements.find(e => e.elementName === 'PoP')

                  if (popElement && popElement.time && popElement.time.length > 0) {
                    // 找到最接近當前時間的預報
                    const now = new Date()
                    const currentForecast = popElement.time.find(t => {
                      const startTime = new Date(t.startTime)
                      const endTime = new Date(t.endTime)
                      return now >= startTime && now <= endTime
                    }) || popElement.time[0] // 如果找不到，使用第一個

                    if (currentForecast && currentForecast.parameter) {
                      precipitationProbability = parseInt(currentForecast.parameter.parameterName || currentForecast.parameter.parameterValue || '0')
                    }
                  }
                }
              }
            }
          } catch (forecastError) {
            console.warn('無法獲取降雨機率:', forecastError)
          }

          // 組合顯示位置：優先使用用戶實際位置（城市 + 區），而不是觀測站位置
          let displayLocation = cityName
          if (locationInfo.district) {
            displayLocation = `${cityName} ${locationInfo.district}`
          } else if (geoInfo.CountyName && geoInfo.TownName && geoInfo.CountyName === cityName) {
            // 如果觀測站位置與用戶位置匹配，顯示觀測站的區
            displayLocation = `${geoInfo.CountyName} ${geoInfo.TownName}`
          } else if (geoInfo.CountyName === cityName) {
            displayLocation = geoInfo.CountyName
          }

          weatherData.value = {
            temperature: temperature || 0,
            condition: getTaiwanWeatherConditionFromStation(station),
            humidity: humidity || 0,
            feelsLike: feelsLike || temperature || 0,
            precipitationProbability: precipitationProbability || 0,
            location: displayLocation,
            description: getTaiwanWeatherDescriptionFromStation(station),
            pressure: Math.round(parseFloat(
              weatherElement.AirPressure ||
              weatherElement.Now?.Pressure ||
              0
            )),
            visibility: 10
          }

          return
        }
      }
    }

    throw new Error('無法從中央氣象署獲取天氣資料')

  } catch (error) {
    console.error('天氣 API 失敗:', error)
    weatherError.value = '無法獲取天氣數據，使用預設資料'

    // 使用備用假資料
    weatherData.value = {
      temperature: 28,
      condition: 'sunny',
      humidity: 65,
      feelsLike: 30,
      precipitationProbability: 20,
      location: '台北市',
      description: '晴朗',
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
  const weatherElement = station.WeatherElement || {}
  const weather = weatherElement.Weather || weatherElement.Now?.Weather || ''
  const precipitation = parseFloat(
    weatherElement.Precipitation ||
    weatherElement.Now?.Precipitation ||
    0
  )

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
    if (weatherLower.includes('雲') || weatherLower.includes('cloud') || weatherLower.includes('陰')) return 'cloudy'
    if (weatherLower.includes('晴') || weatherLower.includes('sunny')) return 'sunny'
  }

  return 'sunny'
}

const getTaiwanWeatherDescriptionFromStation = (station) => {
  const weatherElement = station.WeatherElement || {}
  const weather = weatherElement.Weather || weatherElement.Now?.Weather || ''

  // 優先顯示天氣狀態（Weather），這是中央氣象署提供的主要天氣描述
  if (weather) {
    return weather
  }

  // 如果沒有天氣描述，才顯示降雨量
  const precipitation = parseFloat(
    weatherElement.Precipitation ||
    weatherElement.Now?.Precipitation ||
    0
  )

  if (precipitation > 0) {
    return `降雨 ${precipitation.toFixed(1)}mm`
  }

  return '晴朗'
}


// 公告類型顏色
const getAnnouncementTypeColor = (type) => {
  const colorMap = {
    system: 'blue-darken-2',
    update: 'cyan-darken-3',
    announcement: 'grey-darken-2',
    maintenance: 'red-darken-1',
    event: 'indigo-darken-1'
  }
  return colorMap[type] || 'grey'
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

// 公告類型圖示
const getAnnouncementTypeIcon = (type) => {
  const iconMap = {
    system: 'mdi-cog-outline',
    update: 'mdi-refresh',
    announcement: 'mdi-bullhorn-outline',
    maintenance: 'mdi-wrench-outline',
    event: 'mdi-calendar-star'
  }
  return iconMap[type] || 'mdi-file-document-outline'
}

// 格式化公告日期
const formatAnnouncementDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 簡易日期（MM/DD），用於 sm 以下
const formatAnnouncementDateCompact = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}/${day}`
}

// 查看公告詳情
const viewAnnouncement = (announcement) => {
  router.push(`/announcement/${announcement._id}`)
}

// 已移除密碼驗證與變更相關函數

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
    width: 136px;
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
    letter-spacing: 0.6px;
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


// 最新消息卡片樣式
.news-card {
  min-height: 300px;
  max-height: 430px;

  // 表頭樣式
  .news-header {
    font-family: 'Noto Sans TC', sans-serif;
    font-weight: 400;
    font-size: 13px;
    color: #37474F;
    border-bottom: 1px solid #eee;
    text-align: center;

    .news-header-type {
      width: 56px;
      flex-shrink: 0;
    }

    .news-header-title {
      flex: 1;
      min-width: 0;
    }

    .news-header-creator {
      width: 120px;
      flex-shrink: 0;
      text-align: center;
    }

    .news-header-time {
      width: 80px;
      flex-shrink: 0;
      text-align: center;
    }

    .news-header-views {
      width: 100px;
      flex-shrink: 0;
      text-align: center;
    }
  }

  .news-item {
    border-bottom: 1px solid #eee;
    transition: all 0.1s ease;
    cursor: pointer;

    &:hover {
      background-color: rgba(96, 125, 139, 0.05) !important;
    }

    .news-item-type {
      width: 56px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .news-item-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .news-item-creator {
      width: 120px;
      flex-shrink: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .news-item-time {
      width: 80px;
      flex-shrink: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .news-item-views {
      color: #333;
      width: 100px;
      flex-shrink: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 奇偶行底色
.odd-row {
  background-color: #f2f6f8;
}

.even-row {
  background-color: #fefefe;
}

// 分機表卡片樣式
.extension-card {
  height: 360px;
  margin-bottom: 18px !important;
  .extension-item {
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(96, 125, 139, 0.08);
    }
  }
}

// 在 1280px~1700px 之間隱藏 jobTitle
@media (min-width: 1280px) and (max-width: 1700px) {
  .ext-job-title {
    display: none !important;
  }
}

// 在 1280px~1450px 之間隱藏公司名稱
@media (min-width: 1280px) and (max-width: 1450px) {
  .ext-company-chip {
    display: none !important;
  }
}

.list-scroll {
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

// 共享資源卡片樣式
.shared-resources-card {
  min-height: 300px;
  max-height: 430px;

  .list-scroll {
    max-height: 280px;
  }

  .resource-item {
    border-bottom: 1px solid #e0e0e0;

    &:hover {
      background-color: #eee;
    }
  }
}

.home-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

@include sm {
  .home-card-title {
    font-size: 16px;
  }
  .time-card {
    height: 240px;
  }
  .swiper-card {
    height: 240px;
  }
  .news-card {

    .news-header {
      font-size: 14px;
      .news-header-type {
        width: 80px;
      }
      .news-header-time {
        width: 140px;
      }
    }
    .news-item {
      .news-item-type {
        width: 80px;
      }
      .news-item-time {
        width: 140px;
      }
    }
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
  }

  .news-card {
    max-height: 480px;
  }

  .home-card-title {
  font-size: 16px;
  font-weight: 700;
  }

  .v-card-title {
  padding: 10px 16px;
  }

}

// @include xl {
//   .swiper-card {
//     height: 600px;
//   }
//   .time-card {
//     height: 200px;
//     .time-display{
//       font-size: 44px;
//       width: 160px;
//     }
//     .date-display{
//       font-size: 16px;
//       width: 160px;
//     }
//   }
//   .weather-card {
//     height: 380px;
//     .temperature-display {
//       font-size: 50px;
//     }
//     .feels-like {
//       font-size: 18px;
//     }
//     .location-display {
//       font-size: 18px;
//     }
//     .weather-description {
//       font-size: 20px;
//     }
//     .humidity-display {
//       font-size: 18px;
//     }
//   }
// }


</style>

