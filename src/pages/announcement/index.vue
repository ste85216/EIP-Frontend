<template>
  <v-container max-width="1400">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6">
            <h3>
              所有公告
            </h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 類型篩選 -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">類型 :</span>
                  <v-select
                    v-model="searchCriteria.type"
                    :items="typeOptions"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇類型"
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
                    placeholder="搜尋標題或內容"
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

          <!-- 表格區塊 -->
          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :sort-by="sortBy"
              :headers="headers"
              :items="announcements"
              :loading="tableLoading"
              :items-per-page-options="itemsPerPageOptions"
              :page="currentPage"
              :items-length="totalItems"
              class="elevation-0 rounded"
              density="compact"
              @update:items-per-page="handleItemsPerPageChange"
              @update:sort-by="handleSortByChange"
              @update:page="handlePageChange"
            >
              <!-- Loading 狀態 -->
              <template #loading>
                <div class="text-center py-8">
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
              </template>

              <!-- 無資料時的 loading -->
              <template #no-data>
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
                  v-else
                  class="text-center py-8 text-grey-darken-1"
                >
                  沒有找到符合條件的公告
                </div>
              </template>

              <template #item="{ item, index }">
                <tr
                  :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  class="announcement-table"
                  @click="viewAnnouncement(item)"
                >
                  <td>
                    <div class="d-flex align-center justify-center">
                      <v-chip
                        label
                        :color="getTypeColor(item.type)"
                        :size="smAndUp ? 'small' : 'x-small'"
                      >
                        <v-icon
                          :icon="getTypeIcon(item.type)"
                          :size="smAndUp ? '16' : '12'"
                          class="me-1"
                        />
                        {{ getTypeShortText(item.type) }}
                      </v-chip>
                    </div>
                  </td>
                  <td>
                    <div
                      class="text-truncate text-center d-flex align-center justify-center"
                    >
                      <span
                        v-if="item.isPinned"
                        class="me-3"
                      >
                        <div
                          v-if="smAndUp"
                          class="pinned-badge"
                        >
                          <v-icon
                            icon="mdi-arrow-up-bold"
                            size="10"
                            color="white"
                            style="margin-right: 1px;"
                          />
                          置頂
                        </div>
                        <v-icon
                          v-else
                          icon="mdi-arrow-up-bold-box"
                          size="15"
                          color="blue-grey-darken-1"
                        />
                      </span>
                      <span>{{ item.title }}</span>
                    </div>
                  </td>
                  <td
                    v-if="mdAndUp"
                    class="text-center"
                  >
                    {{ item.creator?.name || '未知' }}
                  </td>
                  <td
                    class="text-center"
                  >
                    {{ mdAndUp ? formatDate(item.createdAt) : (smAndUp ? formatDateOnly(item.createdAt) : formatDateCompact(item.createdAt)) }}
                  </td>
                  <td
                    v-if="lgAndUp"
                    class="text-center pe-9"
                  >
                    <v-chip
                      size="small"
                      color="blue-grey-lighten-1"
                    >
                      <v-icon
                        icon="mdi-eye"
                        size="14"
                        class="me-1"
                      />
                      {{ item.viewCount || 0 }}
                    </v-chip>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import debounce from 'lodash/debounce'
import { useApi } from '@/composables/axios'

definePage({
  meta: {
    title: '所有公告 | Ystravel',
    login: true
  }
})

const router = useRouter()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

// 響應式資料
const announcements = ref([])
const tableLoading = ref(false)
const isSearching = ref(false)
const itemsPerPage = ref(20)
const currentPage = ref(1)
const totalItems = ref(0)
const sortBy = ref([{ key: 'createdAt', order: 'desc' }])

// 搜尋條件
const searchCriteria = ref({
  type: null,
  search: ''
})

// 類型選項
const typeOptions = [
  { title: '全部', value: null },
  { title: '系統公告', value: 'system' },
  { title: '更新公告', value: 'update' },
  { title: '一般公告', value: 'announcement' },
  { title: '維護公告', value: 'maintenance' },
  { title: '活動公告', value: 'event' }
]

// 每頁選項（含全部）
const itemsPerPageOptions = [10, 20, 50, 100, { value: -1, title: '全部' }]

// 表格標題基礎定義
const baseHeaders = [
  { title: '類型', key: 'type', sortable: false, align: 'center', width: '145px' },
  { title: '標題', key: 'title', sortable: false, align: 'center' },
  { title: '建立者', key: 'creator', sortable: false, align: 'center', minWidth: '120px' },
  { title: '發布時間', key: 'createdAt', sortable: true, align: 'center', minWidth: '120px' },
  { title: '瀏覽次數', key: 'viewCount', sortable: true, align: 'center', minWidth: '120px' }
]

// 表格標題（響應式過濾）
const headers = computed(() => {
  const mdUp = mdAndUp.value
  const lgUp = lgAndUp.value

  return baseHeaders.filter(h => {
    if (h.key === 'creator' && !mdUp) return false // md 以下隱藏
    if (h.key === 'viewCount' && !lgUp) return false // lg 以下隱藏（僅 lg+ 顯示）
    return true
  })
})

// 載入公告列表
const loadAnnouncements = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value === -1 ? (totalItems.value > 0 ? totalItems.value : 999999) : itemsPerPage.value
    }

    if (searchCriteria.value.type) {
      params.type = searchCriteria.value.type
    }
    if (searchCriteria.value.search) {
      params.search = searchCriteria.value.search
    }

    // 只顯示有效的公告
    params.isActive = true

    // 處理排序參數
    if (sortBy.value && sortBy.value.length > 0 && sortBy.value[0].key) {
      params.sortBy = sortBy.value[0].key
      params.sortOrder = sortBy.value[0].order || 'desc'
    } else {
      // 預設按照 createdAt 降序排序（最新的在前）
      params.sortBy = 'createdAt'
      params.sortOrder = 'desc'
    }

    const response = await apiAuth.get('/announcements', { params })

    // 將置頂公告排在前面
    const data = response.data.result.data
    announcements.value = data.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

    totalItems.value = response.data.result.totalItems
  } catch (error) {
    console.error('載入公告錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入公告失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.value.type = null
  searchCriteria.value.search = ''
  currentPage.value = 1
  loadAnnouncements()
}

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadAnnouncements()
}

// debounce 搜尋
const debouncedSearch = debounce(async () => {
  await performSearch()
  isSearching.value = false
}, 300)

// 處理每頁項目數變更
const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  // 當選擇「全部」時，重置頁碼為 1
  if (newItemsPerPage === -1) {
    currentPage.value = 1
  }
  loadAnnouncements()
}

// 處理排序變更
const handleSortByChange = (newSortBy) => {
  sortBy.value = newSortBy
  loadAnnouncements()
}

// 處理頁碼變更
const handlePageChange = (newPage) => {
  // 當選擇「全部」時，不需要分頁
  if (itemsPerPage.value === -1) {
    return
  }
  if (newPage < 1) {
    currentPage.value = 1
  } else {
    const maxPage = Math.ceil(totalItems.value / itemsPerPage.value)
    currentPage.value = newPage > maxPage ? maxPage : newPage
  }
  loadAnnouncements()
}

// 查看公告詳情
const viewAnnouncement = (announcement) => {
  router.push(`/announcement/${announcement._id}`)
}


// 類型短文字（sm 以下顯示，移除「公告」字樣）
const getTypeShortText = (type) => {
  const shortMap = {
    system: '系統',
    update: '更新',
    announcement: '一般',
    maintenance: '維護',
    event: '活動'
  }
  return shortMap[type] || '一般'
}

// 類型顏色
const getTypeColor = (type) => {
  const colorMap = {
    system: 'blue-darken-2',
    update: 'cyan-darken-3',
    announcement: 'grey-darken-2',
    maintenance: 'red-darken-1',
    event: 'indigo-darken-1'
  }
  return colorMap[type] || 'grey'
}

// 類型圖示
const getTypeIcon = (type) => {
  const iconMap = {
    system: 'mdi-cog-outline',
    update: 'mdi-refresh',
    announcement: 'mdi-bullhorn-outline',
    maintenance: 'mdi-wrench-outline',
    event: 'mdi-calendar-star'
  }
  return iconMap[type] || 'mdi-file-document-outline'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 僅日期（YYYY/MM/DD），用於 sm（不含時間）
const formatDateOnly = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}/${month}/${day}`
}

// 簡易日期（MM/DD），用於 sm 以下
const formatDateCompact = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}/${day}`
}

// 監聽搜尋條件變化
watch(() => searchCriteria.value.search, (newVal, oldVal) => {
  // 避免初始化時觸發
  if (oldVal !== undefined) {
    if (newVal !== undefined) {
      isSearching.value = true
      debouncedSearch()
    }
  }
})

watch(() => searchCriteria.value.type, (newVal, oldVal) => {
  // 避免初始化時觸發
  if (oldVal !== undefined) {
    performSearch()
  }
})

// 組件掛載時載入資料
onMounted(() => {
  loadAnnouncements()
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

:deep(.v-data-table) {
  thead {
    background-color: #455a64 !important;
    color: #fff !important;
    th {
      font-size: 13px !important;
    }
  }

  td {
    height: 48px !important;
    div {
      line-height: 1.6;
    }
  }
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #ffffff;
}

.announcement-table {
  cursor: pointer;
  transition: background-color 0.2s ease;
  td {
    color: #555 !important;
    font-size: 13px !important;
  }

  &:hover {
    background-color: #eee !important;
  }
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pinned-badge {
  display: flex;
  align-items: center;
  font-size: 10px;
  background-color: #607D8B;
  color: #fff;
  padding: 2px 4px 2px 2px;
  border-radius: 4px;
}
</style>

