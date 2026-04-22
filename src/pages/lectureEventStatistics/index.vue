<template>
  <v-container max-width="2400">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>
              講座活動統計表
            </h3>
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-1">
              <!-- 申請時間 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請時間 :</span>
                  <v-date-input
                    v-model="searchCriteria.applicationDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    placeholder="請選擇申請時間"
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 活動時間 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">活動時間 :</span>
                  <v-date-input
                    v-model="searchCriteria.eventDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    placeholder="請選擇活動時間"
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 入場時間 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">入場時間 :</span>
                  <v-date-input
                    v-model="searchCriteria.entryDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    placeholder="請選擇入場時間"
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 申請人 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請人 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.applicant"
                    :items="employees"
                    :item-title="item => {
                      if (!item || !item.name) return ''
                      const extNumber = item.employeeLink?.extNumber
                      return extNumber ? `${item.name} (${extNumber})` : item.name
                    }"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇申請人"
                    hide-details
                    :filter="customFilter"
                    :disabled="false"
                  />
                </div>
              </v-col>
              <!-- 搜尋按鈕 -->
              <v-col
                cols="12"
                md="8"
                lg="2"
              >
                <v-row class="pt-5">
                  <v-col
                    cols="8"
                    sm="4"
                    lg="8"
                    class="ps-1 pe-0"
                  >
                    <v-btn
                      color="cyan-darken-2"
                      prepend-icon="mdi-magnify"
                      :loading="loading"
                      :disabled="false"
                      block
                      @click="fetchTableData"
                    >
                      搜尋
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="4"
                    sm="2"
                    lg="4"
                    class="pe-2"
                  >
                    <v-btn
                      color="grey"
                      width="40"
                      block
                      :disabled="false"
                      @click="resetSearch"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider class="my-0" />

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-spacer />
                <v-col
                  cols="7"
                  sm="6"
                  md="4"
                  lg="2"
                  class="px-1 my-1"
                >
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="quickSearch"
                      :loading="isSearching"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋申請編號、講座名稱、地點"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      clearable
                      :disabled="false"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 表格區塊 -->
          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              v-model:items-per-page="tableOptions.itemsPerPage"
              v-model:page="tableOptions.page"
              v-model:sort-by="tableOptions.sortBy"
              :headers="tableHeaders"
              :items="tableItems"
              :items-length="totalItems"
              :loading="loading"
              :items-per-page-options="[10, 20, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr
                  :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  style="cursor: pointer;"
                  @click="goToDetail(item._id)"
                >
                  <!-- 申請編號 -->
                  <td>{{ item.designRequestNumber }}</td>

                  <!-- 申請時間 -->
                  <td>
                    <div v-if="item.applicationDate">
                      <div>{{ formatDate(item.applicationDate) }}</div>
                      <div class="text-caption text-grey-darken-1">
                        <v-icon
                          size="14"
                          style="padding-bottom: 2px;"
                        >
                          mdi-clock-outline
                        </v-icon> {{ formatTime(item.applicationDate) }}
                      </div>
                    </div>
                  </td>

                  <!-- 申請人 -->
                  <td>{{ getApplicantName(item.applicant) || '-' }}</td>

                  <!-- 講座名稱 -->
                  <td>{{ item.lectureName }}</td>

                  <!-- 活動時間 -->
                  <td>
                    <div v-if="item.eventDateTime">
                      <div>{{ formatDate(item.eventDateTime) }}</div>
                      <div class="text-caption text-grey-darken-1">
                        <v-icon
                          size="14"
                          style="padding-bottom: 2px;"
                        >
                          mdi-clock-outline
                        </v-icon> {{ formatTime(item.eventDateTime) }}
                      </div>
                    </div>
                  </td>

                  <!-- 入場時間 -->
                  <td>
                    <div v-if="item.entryDateTime">
                      <div>{{ formatDate(item.entryDateTime) }}</div>
                      <div class="text-caption text-grey-darken-1">
                        <v-icon
                          size="14"
                          style="padding-bottom: 2px;"
                        >
                          mdi-clock-outline
                        </v-icon> {{ formatTime(item.entryDateTime) }}
                      </div>
                    </div>
                  </td>

                  <!-- 地點 -->
                  <td>{{ item.location }}</td>
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useRouter } from 'vue-router'
import debounce from 'lodash/debounce'
import { useDisplay } from 'vuetify'

// 頁面定義
definePage({
  meta: {
    title: '講座活動統計表 | Ystravel',
    login: true,
    permission: 'LECTURE_EVENT_STATISTICS_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const router = useRouter()
const { smAndUp, mdAndUp } = useDisplay()

// 表格相關
const loading = ref(false)
const tableItems = ref([])
const totalItems = ref(0)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'applicationDate', order: 'desc' }]
})

// 表格欄位定義
const allHeaders = [
  { title: '申請編號', key: 'designRequestNumber', sortable: true, show: 'all' },
  { title: '申請時間', key: 'applicationDate', sortable: true, show: 'all' },
  { title: '申請人', key: 'applicant', sortable: false, show: 'all' },
  { title: '講座名稱', key: 'lectureName', sortable: false, show: 'all' },
  { title: '活動時間', key: 'eventDateTime', sortable: true, show: 'all' },
  { title: '入場時間', key: 'entryDateTime', sortable: true, show: 'all' },
  { title: '地點', key: 'location', sortable: false, show: 'all' }
]

// 計算屬性：根據螢幕大小過濾欄位
const tableHeaders = computed(() => {
  return allHeaders.filter(header => {
    if (header.show === 'all') return true
    if (header.show === 'sm' && smAndUp.value) return true
    if (header.show === 'md' && mdAndUp.value) return true
    return false
  })
})

// 員工列表
const employees = ref([])

// 當前用戶的公司資訊
const currentUserCompany = ref(null)
// 標記是否已經初始化完成（載入用戶公司資訊）
const isInitialized = ref(false)

// 搜尋條件
const searchCriteria = reactive({
  applicationDate: [],
  eventDate: [],
  entryDate: [],
  applicant: null
})

// 快速搜尋
const quickSearch = ref('')
const isSearching = ref(false)

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.applicationDate = []
  searchCriteria.eventDate = []
  searchCriteria.entryDate = []
  searchCriteria.applicant = null
  quickSearch.value = ''
  fetchTableData()
}

// 載入當前用戶的員工資料
const loadCurrentUserEmployee = async () => {
  try {
    const { data } = await apiAuth.get('/users/profile')
    if (data.success && data.result.employeeLink) {
      // 檢查用戶資料中是否已經包含員工資訊
      if (data.result.employeeLink && typeof data.result.employeeLink === 'object') {
        currentUserCompany.value = data.result.employeeLink.company
        return data.result.employeeLink.company
      }
    }
    return null
  } catch (error) {
    console.error('載入用戶員工資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入用戶員工資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return null
  }
}

// 取得表格資料
const fetchTableData = async () => {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    // 構建查詢參數
    const params = {
      page: tableOptions.page,
      itemsPerPage: tableOptions.itemsPerPage,
      sortBy: tableOptions.sortBy[0]?.key,
      sortOrder: tableOptions.sortBy[0]?.order,
      search: quickSearch.value
    }

    // 如果有用戶公司資料，只查詢該公司的講座資料
    if (currentUserCompany.value) {
      params.company = currentUserCompany.value._id
    }

    // 添加搜尋條件
    if (searchCriteria.applicant) params.applicant = searchCriteria.applicant

    // 申請時間區間處理
    if (searchCriteria.applicationDate?.length > 0) {
      const dates = Array.from(searchCriteria.applicationDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.applicationDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.applicationDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.applicationDateEnd = endDate.toISOString()
      }
    }

    // 活動時間區間處理
    if (searchCriteria.eventDate?.length > 0) {
      const dates = Array.from(searchCriteria.eventDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.eventDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.eventDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.eventDateEnd = endDate.toISOString()
      }
    }

    // 入場時間區間處理
    if (searchCriteria.entryDate?.length > 0) {
      const dates = Array.from(searchCriteria.entryDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.entryDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.entryDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.entryDateEnd = endDate.toISOString()
      }
    }

    const endpoint = '/marketing/lecture-events'
    const { data } = await apiAuth.get(endpoint, { params })

    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
    } else {
      console.error('API 回應失敗:', data)
    }
  } catch (error) {
    console.error('取得表格資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得表格資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
    isSearching.value = false
  }
}

// 表格選項變更處理
const handleTableOptionsChange = () => {
  // 只有在初始化完成後才執行查詢，避免在載入用戶公司資訊前就查詢所有資料
  if (isInitialized.value) {
    fetchTableData()
  }
}

// 取得所有用戶列表（用於申請人）
const fetchEmployees = async () => {
  try {
    const { data } = await apiAuth.get('/users/public/all')
    if (data.success) {
      const users = Array.isArray(data.result?.data) ? data.result.data.slice() : []
      users.sort((a, b) => String(a?.userId ?? '').localeCompare(String(b?.userId ?? '')))
      employees.value = users
    }
  } catch (error) {
    console.error('取得用戶列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得用戶列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 格式化時間
const formatTime = (date) => {
  if (!date) return ''
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('Error formatting time:', e)
    return ''
  }
}

// 取得申請人顯示名稱
const getApplicantName = (applicant) => {
  if (!applicant) return ''
  const extNumber = applicant.employeeLink?.extNumber
  return extNumber ? `${applicant.name} (${extNumber})` : applicant.name
}

// 自定義搜尋過濾器
const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const raw = item.raw || item
  const extNumber = raw?.employeeLink?.extNumber
  const itemText = raw && raw.name
    ? extNumber
      ? `${raw.name} ${extNumber}`.toLowerCase()
      : raw.name.toLowerCase()
    : ''
  return itemText.includes(textToSearch)
}

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  tableOptions.page = 1
  fetchTableData()
}, 300)

// 監聽快速搜尋變更
watch(quickSearch, (newValue) => {
  if (newValue !== undefined) {
    isSearching.value = true
    debouncedSearch()
  }
})

// 前往詳細頁面
const goToDetail = (id) => {
  router.push(`/lectureEventStatistics/${id}`)
}

// 頁面載入時初始化
onMounted(async () => {
  try {
    loading.value = true

    // 先載入用戶員工資料
    await loadCurrentUserEmployee()

    // 載入基本資料
    await Promise.all([
      fetchEmployees()
    ])

    // 標記初始化完成
    isInitialized.value = true

    loading.value = false
    // 執行搜尋
    await fetchTableData()
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    // 即使失敗也標記為已初始化，避免永遠無法載入資料
    isInitialized.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

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

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

:deep(.v-field :not(.v-textarea .v-field)) {
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

</style>

