<template>
  <v-container max-width="2400">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6">
            <h3>
              影片專區
            </h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 分類篩選（多選） -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">分類 :</span>
                  <v-select
                    v-model="searchCriteria.categories"
                    :items="categoryOptions"
                    :item-title="item => item && item.name ? item.name : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    closable-chips
                    clearable
                    placeholder="請選擇分類"
                    hide-details
                  />
                </div>
              </v-col>

              <!-- 快速搜尋 -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">快速搜尋 :</span>
                  <v-text-field
                    v-model="searchCriteria.search"
                    :loading="isSearching"
                    density="compact"
                    variant="outlined"
                    placeholder="搜尋影片標題"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                  />
                </div>
              </v-col>

              <!-- 重置按鈕 -->
              <div class="d-flex align-end pt-3 pb-2 ms-auto ms-sm-1 me-1">
                <v-btn
                  color="grey"
                  elevation="1"
                  :size="smAndUp ? 'default' : 'small'"
                  @click="resetSearch"
                >
                  <v-icon>
                    mdi-refresh
                  </v-icon>
                </v-btn>
              </div>
            </v-row>
          </v-card-text>
          <v-divider class="mt-1 mb-2" />

          <!-- 影片卡片區 -->
          <v-card-text class="px-sm-6 px-md-7">
            <div
              v-if="tableLoading"
              class="text-center py-8"
            >
              <v-progress-circular
                indeterminate
                color="blue-grey-darken-2"
                size="48"
                width="6"
              />
              <div class="mt-4 text-grey-darken-1">
                載入中...
              </div>
            </div>
            <div
              v-else-if="filteredVideos.length === 0"
              class="text-center py-12"
            >
              <v-icon
                icon="mdi-video-off-outline"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <div class="text-body-1 text-grey mb-2">
                沒有找到符合條件的影片
              </div>
            </div>
            <template v-else>
              <v-row>
                <v-col
                  v-for="video in paginatedVideos"
                  :key="video._id"
                  cols="12"
                  xs="12"
                  sm="6"
                  md="4"
                  lg="3"
                  xl="2"
                >
                  <v-card
                    class="video-card"
                    elevation="0"
                    @click="openVideo(video.videoUrl)"
                  >
                    <div class="video-thumbnail-container">
                      <img
                        :src="getVideoThumbnail(video)"
                        :alt="video.title"
                        class="video-thumbnail"
                        @error="handleImageError"
                      >
                      <div class="play-overlay">
                        <v-icon
                          icon="mdi-play-circle"
                          size="64"
                          color="white"
                        />
                      </div>
                    </div>
                    <v-card-title class="card-title px-3 pt-3 pb-2">
                      {{ video.title }}
                    </v-card-title>
                    <div
                      v-if="video.categories && video.categories.length > 0"
                      class="px-3 pb-4 d-flex flex-wrap gap-1"
                    >
                      <v-chip
                        v-for="category in video.categories"
                        :key="category._id || category"
                        class="me-1"
                        size="small"
                        color="blue-grey-darken-1"
                        variant="outlined"
                      >
                        {{ category.name || category }}
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              <!-- 分頁 -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <div class="d-flex justify-center">
                    <v-pagination
                      v-model="currentPage"
                      :length="totalPages"
                      :total-visible="mdAndUp ? 7 : 5"
                      color="blue-grey-darken-2"
                      rounded="circle"
                      density="comfortable"
                    />
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, watch, computed } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import debounce from 'lodash/debounce'
import { useApi } from '@/composables/axios'

definePage({
  meta: {
    title: '影片專區 | Ystravel',
    login: true,
    permission: 'EDUCATION_TRAINING_VIDEO_PAGE_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp, mdAndUp } = useDisplay()

// 響應式資料
const videos = ref([])
const categories = ref([])
const tableLoading = ref(false)
const isSearching = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(24)

// 搜尋條件
const searchCriteria = ref({
  categories: [],
  search: ''
})

// 分類選項
const categoryOptions = computed(() => {
  return categories.value
})

// 過濾後的影片（所有符合條件的影片）
const filteredVideos = computed(() => {
  let result = [...videos.value]

  // 分類篩選（多選）
  if (searchCriteria.value.categories && searchCriteria.value.categories.length > 0) {
    const selectedCategoryIds = searchCriteria.value.categories.map(id => String(id))
    result = result.filter(video => {
      if (!video.categories || video.categories.length === 0) return false
      // 檢查影片是否包含任一選中的分類
      return video.categories.some(cat => {
        const categoryId = cat._id ? String(cat._id) : String(cat)
        return selectedCategoryIds.includes(categoryId)
      })
    })
  }

  // 搜尋篩選
  if (searchCriteria.value.search) {
    const searchLower = searchCriteria.value.search.toLowerCase()
    result = result.filter(video => {
      return video.title.toLowerCase().includes(searchLower)
    })
  }

  return result
})

// 分頁後的影片（當前頁顯示的影片）
const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredVideos.value.slice(start, end)
})

// 總頁數（至少為 1）
const totalPages = computed(() => {
  const pages = Math.ceil(filteredVideos.value.length / itemsPerPage.value)
  return pages > 0 ? pages : 1
})

// 載入影片列表
const loadVideos = async () => {
  try {
    tableLoading.value = true
    const response = await apiAuth.get('/education-training-videos/active')
    videos.value = response.data.result || []
  } catch (error) {
    console.error('載入影片錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入影片失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 載入分類列表
const loadCategories = async () => {
  try {
    // 使用公開路由取得啟用分類（不需要管理權限）
    const response = await apiAuth.get('/education-training-video-categories/active')
    categories.value = response.data.result || []
  } catch (error) {
    console.error('載入分類錯誤:', error)
    // 如果載入失敗，分類列表為空，不影響影片顯示
    categories.value = []
  }
}

// 取得影片縮圖
const getVideoThumbnail = (video) => {
  // 優先使用上傳的封面圖片
  if (video.thumbnailUrl) {
    return video.thumbnailUrl
  }

  // 如果沒有上傳的封面，使用影片 URL 自動截圖
  const url = video.videoUrl
  if (!url) {
    return '/images/default-video-thumbnail.jpg'
  }

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    // 使用 hqdefault 作為主要縮圖，如果不存在會回退到 mqdefault
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }

  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`
  }

  // 預設圖片
  return '/images/default-video-thumbnail.jpg'
}

// 處理圖片載入錯誤
const handleImageError = (event) => {
  const currentSrc = event.target.src

  // 如果是上傳的封面圖片失敗，不嘗試其他縮圖，直接使用預設圖片
  if (currentSrc.includes('/education-training-video-thumbnails/')) {
    event.target.src = '/images/default-video-thumbnail.jpg'
    return
  }

  // 如果是 YouTube 縮圖失敗，嘗試使用 mqdefault
  if (currentSrc.includes('youtube.com/vi/') && currentSrc.includes('/hqdefault.jpg')) {
    const videoIdMatch = currentSrc.match(/\/vi\/([^/]+)\//)
    if (videoIdMatch) {
      event.target.src = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`
      return
    }
  }

  // 其他情況使用預設圖片
  event.target.src = '/images/default-video-thumbnail.jpg'
}

// 開啟影片（另開分頁）
const openVideo = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.value.categories = []
  searchCriteria.value.search = ''
  currentPage.value = 1
}

// debounce 搜尋
const debouncedSearch = debounce(() => {
  // 搜尋在 computed 中處理，不需要額外操作
  isSearching.value = false
}, 300)

// 監聽搜尋條件變化
watch(() => searchCriteria.value.search, (newValue) => {
  if (newValue !== undefined) {
    isSearching.value = true
    currentPage.value = 1 // 重置到第一頁
    debouncedSearch()
  }
})

watch(() => searchCriteria.value.categories, () => {
  currentPage.value = 1 // 重置到第一頁
  // 分類篩選在 computed 中處理
}, { deep: true })

// 監聽分頁變化，確保頁碼不超過總頁數
watch(() => totalPages.value, (newTotalPages) => {
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages
  }
})

// 組件掛載時載入資料
onMounted(() => {
  loadCategories()
  loadVideos()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

:deep(.v-field :not(.v-textarea .v-field) :not(.v-select .v-field)) {
  .v-field__input {
    font-size: 13px;
    height: 36px !important;
    padding-top: 4px !important;
  }

  .v-field__field {
    height: 36px !important;
  }
  @include sm {
    .v-field__input {
      height: 40px !important;
      padding-top: 8px !important;
      font-size: 14px;
    }
    .v-field__field {
      height: 40px !important;
    }
  }
}

/* 調整 v-select 內的 chip 大小 */
:deep(.v-select .v-chip) {
  height: 20px !important;
  font-size: 11px !important;
  padding: 0 6px !important;
  min-width: auto !important;

  .v-chip__content {
    padding: 0 4px !important;
    line-height: 20px !important;
  }

  .v-chip__close {
    margin-left: 4px !important;
    margin-right: -2px !important;
    width: 16px !important;
    height: 16px !important;

    .v-icon {
      font-size: 14px !important;
    }
  }

  @include sm {
    height: 22px !important;
    font-size: 12px !important;

  }
}

.video-card {
  cursor: pointer;
  transition: 0.1s;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0px 12px rgba(0, 0, 0, 0.2) !important;
  }
}

.video-thumbnail-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 比例
  overflow: hidden;
  background-color: #000;

  .video-thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .play-overlay {
    opacity: 1;
  }
}

.video-card:hover .play-overlay {
  opacity: 1;
}
</style>
