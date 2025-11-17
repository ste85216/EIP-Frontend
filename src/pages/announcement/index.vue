<template>
  <v-container max-width="1400">
    <v-row class="elevation-4 rounded-lg py-4 pt-sm-6 pb-sm-4 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題 -->
      <v-col cols="12">
        <v-row>
          <!-- 篩選和搜尋區 -->
          <v-col class="mb-sm-3">
            <v-row class="d-flex align-center">
              <v-col
                cols="12"
                sm="3"
                class="ps-3"
              >
                <h3>所有公告</h3>
              </v-col>
              <v-spacer />
              <v-col
                sm="4"
                md="3"
                lg="2"
                class="pe-1"
              >
                <v-select
                  v-model="searchCriteria.type"
                  :items="typeOptions"
                  item-title="title"
                  item-value="value"
                  label="類型篩選"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                sm="4"
                lg="3"
              >
                <v-row class="d-flex align-center">
                  <v-col class="d-flex align-center">
                    <v-icon
                      v-if="mdAndUp"
                      v-tooltip:top="'可搜尋標題或內容'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-4"
                    />
                    <v-text-field
                      v-model="searchCriteria.search"
                      label="快速搜尋"
                      append-inner-icon="mdi-magnify"
                      base-color="#666"
                      color="blue-grey-darken-3"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12">
            <!-- 表格 -->
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="announcements"
              :loading="tableLoading"
              :items-per-page-options="itemsPerPageOptions"
              :page="currentPage"
              :items-length="totalItems"
              class="elevation-0 rounded"
              density="compact"
              @update:items-per-page="handleItemsPerPageChange"
              @update:page="onUpdatePage"
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
          </v-col>
        </v-row>
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
import { debounce } from 'lodash'
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
const itemsPerPage = ref(20)
const currentPage = ref(1)
const totalItems = ref(0)

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

// 表格標題（將「類型」與「標題」交換順序）
const headers = computed(() => {
  const base = [
    { title: '類型', key: 'type', sortable: false, align: 'center', width: '145px' },
    { title: '標題', key: 'title', sortable: false, align: 'center' },
    { title: '建立者', key: 'creator', sortable: false, align: 'center', minWidth: '120px' },
    { title: '發布時間', key: 'createdAt', sortable: true, align: 'center', minWidth: '120px' },
    { title: '瀏覽次數', key: 'viewCount', sortable: true, align: 'center', minWidth: '120px' }
  ]

  return base.filter(h => {
    if (h.key === 'creator' && !mdAndUp.value) return false // md 以下隱藏
    if (h.key === 'viewCount' && !lgAndUp.value) return false // md 以下隱藏（僅 lg+ 顯示）
    return true
  })
})

// 載入公告列表
const loadAnnouncements = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value === -1 ? (totalItems.value > 0 ? totalItems.value : 999999) : itemsPerPage.value,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }

    if (searchCriteria.value.type) {
      params.type = searchCriteria.value.type
    }
    if (searchCriteria.value.search) {
      params.search = searchCriteria.value.search
    }

    // 只顯示有效的公告
    params.isActive = true

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

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadAnnouncements()
}

// debounce 搜尋
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
}, 300)

// 處理每頁筆數變更
const handleItemsPerPageChange = () => {
  // 當選擇「全部」時，重置頁碼為 1
  if (itemsPerPage.value === -1) {
    currentPage.value = 1
  }
  loadAnnouncements()
}

// 處理頁碼變更
const onUpdatePage = (page) => {
  // 當選擇「全部」時，不需要分頁
  if (itemsPerPage.value === -1) {
    return
  }

  if (page < 1) page = 1
  const maxPage = Math.ceil(totalItems.value / itemsPerPage.value)
  if (page > maxPage) page = maxPage

  if (currentPage.value !== page) {
    currentPage.value = page
    loadAnnouncements()
  }
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
watch(() => searchCriteria.value.search, () => {
  debouncedSearch()
})

watch(() => searchCriteria.value.type, () => {
  currentPage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
})

// 組件掛載時載入資料
onMounted(() => {
  loadAnnouncements()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

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

