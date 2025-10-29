<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 pt-sm-7 pb-sm-4 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題 -->
      <v-col cols="12">
        <v-row>
          <!-- 篩選和搜尋區 -->
          <v-col class="mb-4">
            <v-row class="d-flex align-center">
              <v-col
                cols="2"
                class="ps-3 pb-6"
              >
                <h3>所有公告</h3>
              </v-col>
              <v-spacer />
              <v-col
                sm="3"
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
            <v-data-table
              :headers="headers"
              :items="announcements"
              :loading="tableLoading"
              :items-per-page="itemsPerPage"
              :page="currentPage"
              :server-items-length="totalItems"
              class="elevation-0 rounded"
              @update:options="handleTableOptions"
            >
              <template #item="{ item, index }">
                <tr
                  :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  class="cursor-pointer"
                  @click="viewAnnouncement(item)"
                >
                  <td>
                    <div class="d-flex align-center">
                      <span
                        v-if="item.isPinned"
                        class=" me-2"
                      >📌</span>
                      <div
                        class="text-truncate"
                        style="max-width: 400px;"
                      >
                        {{ item.title }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getTypeColor(item.type)"
                      size="small"
                    >
                      {{ getTypeText(item.type) }}
                    </v-chip>
                  </td>
                  <td>{{ item.creator?.name || '未知' }}</td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>
                    <v-chip
                      size="small"
                      color="blue-grey-lighten-2"
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
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, watch } from 'vue'
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
const { mdAndUp } = useDisplay()

// 響應式資料
const announcements = ref([])
const tableLoading = ref(false)
const itemsPerPage = ref(10)
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

// 表格標題
const headers = [
  { title: '標題', key: 'title', sortable: false },
  { title: '類型', key: 'type', sortable: false, minWidth: '120px' },
  { title: '建立者', key: 'creator', sortable: false, minWidth: '120px' },
  { title: '發布時間', key: 'createdAt', sortable: true},
  { title: '瀏覽次數', key: 'viewCount', sortable: true, minWidth: '120px' }
]

// 載入公告列表
const loadAnnouncements = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
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

// 表格選項變更
const handleTableOptions = (options) => {
  if (options.page !== undefined) {
    currentPage.value = options.page
  }
  if (options.itemsPerPage !== undefined) {
    itemsPerPage.value = options.itemsPerPage
  }
  loadAnnouncements()
}

// 查看公告詳情
const viewAnnouncement = (announcement) => {
  router.push(`/announcement/${announcement._id}`)
}

// 類型文字
const getTypeText = (type) => {
  const typeMap = {
    system: '系統公告',
    update: '更新公告',
    announcement: '一般公告',
    maintenance: '維護公告',
    event: '活動公告'
  }
  return typeMap[type] || '一般公告'
}

// 類型顏色
const getTypeColor = (type) => {
  const colorMap = {
    system: 'blue-darken-2',
    update: 'green-darken-2',
    announcement: 'grey-darken-2',
    maintenance: 'orange-darken-2',
    event: 'purple-darken-1'
  }
  return colorMap[type] || 'grey'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
    height: 48px;
    background-color: #455a64 !important;
    color: #fff !important;
    th {
      font-size: 13px !important;
    }
  }
  tbody tr {
    min-height: 48px;
  }
  td {
    height: 48px !important;
    div {
      line-height: 1.6;
    }
  }
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e3f2fd !important;
  }
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

