<template>
  <v-container max-width="2500">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5">
      <!-- 左側搜尋區塊 -->
      <v-col
        cols="12"
        lg="2"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 ps-lg-6"
          >
            <v-card class="elevation-4 rounded-lg py-4 py-sm-8 px-4 px-sm-2 px-xl-4">
              <v-card-title class="font-weight-bold d-flex align-center mb-2">
                搜尋條件
              </v-card-title>
              <v-card-text class="pa-2">
                <v-row>
                  <!-- 公司選擇 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.company"
                      :items="companies"
                      :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                      item-value="_id"
                      label="公司"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:model-value="handleCompanyChange"
                    />
                  </v-col>

                  <!-- 部門選擇 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.department"
                      :items="departments"
                      :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                      item-value="_id"
                      label="部門"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      :disabled="!searchCriteria.company"
                    />
                  </v-col>

                  <!-- 任職狀態 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.status"
                      :items="statusOptions"
                      label="任職狀態"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>

                <v-row class="border rounded-lg border border-opacity-25 mb-2 mx-0">
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.dateType"
                      :items="dateTypeOptions"
                      label="日期類型"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:model-value="handleDateTypeChange"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-date-input
                      v-model="searchCriteria.dateRange"
                      label="日期區間"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      hide-details
                      clearable
                      multiple="range"
                      :disabled="!searchCriteria.dateType"
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      @update:model-value="handleDateRangeChange"
                    />
                  </v-col>
                </v-row>

                <!-- 搜尋按鈕區 -->
                <v-row>
                  <v-col
                    cols="12"
                    class="d-flex justify-end gap-2"
                  >
                    <v-row class="d-flex justify-space-between">
                      <v-col
                        cols="3"
                        class="pe-0"
                      >
                        <v-btn
                          color="grey"
                          width="40"
                          block
                          @click="resetSearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="8"
                        class="ps-0"
                      >
                        <v-btn
                          color="cyan-darken-2"
                          prepend-icon="mdi-magnify"
                          :loading="tableLoading"
                          block
                          @click="performSearch"
                        >
                          搜尋
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- 右側表格區塊 -->
      <v-col
        cols="12"
        lg="10"
        class="px-6 ps-lg-8 pe-lg-12 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-7 px-1 px-sm-4 px-md-8 mt-1 bg-white">
          <!-- 標題和功能按鈕區 -->
          <v-col
            cols="12"
            class="ps-4 pb-sm-4"
          >
            <v-row>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-row class="d-flex justify-end">
                  <v-col class="d-flex align-center justify-space-between">
                    <h3 class="d-inline-block">
                      公司員工列表
                    </h3>
                  </v-col>
                  <v-col
                    cols="3"
                    class="d-flex align-center"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋系統員工編號、姓名、Email、科威員工編號、分機號碼、列印號碼、備註'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-text-field
                      v-model="quickSearchText"
                      label="快速搜尋"
                      append-inner-icon="mdi-magnify"
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

          <!-- 表格區 -->
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :items="tableItems"
              :headers="filteredHeaders"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :page="tablePage"
              :items-per-page-options="[15, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
<<<<<<< HEAD
<<<<<<< HEAD
                  <td>{{ item.employeeCode }}</td>
=======
                  <td>
                    {{ item.employeeCode }}
                  </td>
>>>>>>> 6c4051504fa95c831741f4c80aa9f6dc6210e602
=======
                  <td>
                    {{ item.employeeCode }}
                  </td>
>>>>>>> 6c4051504fa95c831741f4c80aa9f6dc6210e602
                  <td>{{ item.employeeId }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    {{ item.company?.name }}
                  </td>
                  <td>
                    {{ item.department?.name }}
                  </td>
                  <td>
                    {{ item.extNumber }}
                  </td>
                  <td>
                    {{ item.printNumber }}
                  </td>
                  <td>
                    {{ item.email }}
                  </td>
                  <td>
                    <v-chip
                      v-tooltip="getStatusDateTooltip(item)"
                      size="small"
                      variant="outlined"
                      :color="getStatusColor(item.employmentStatus)"
                    >
                      {{ item.employmentStatus }}
                    </v-chip>
                  </td>
                  <td>
                    <div 
                      v-tooltip="item.note"
                      class="note-cell"
                    >
                      {{ item.note }}
                    </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'

// 頁面定義
definePage({
  meta: {
    title: '公司員工列表 | GInternational',
    login: true
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp } = useDisplay()

// 表格相關
const tableHeaders = [
  { title: '科威員編', key: 'employeeCode', align: 'start', sortable: true },
  { title: '系統編號', key: 'employeeId', minWidth: '120px', align: 'start', sortable: true },
  { title: '姓名', key: 'name', minWidth: '90px', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', minWidth: '90px', align: 'start', sortable: true },
  { title: '部門', key: 'department.name', align: 'start', sortable: true },
  { title: '分機號碼', key: 'extNumber', align: 'start', sortable: true },
  { title: '列印編號', key: 'printNumber', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: '狀態', key: 'employmentStatus', align: 'start', sortable: true },
  { title: '備註', key: 'note', minWidth:'200px', align: 'start', sortable: true }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(15)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'employeeCode', order: 'asc' }])

// 搜尋相關響應式變數
const quickSearchText = ref('')
const companies = ref([])
const departments = ref([])
const searchCriteria = ref({
  company: '',
  department: '',
  status: '',
  dateType: '',
  dateRange: []
})

// 狀態選項
const statusOptions = [
  { title: '在職', value: '在職' },
  { title: '離職', value: '離職' },
  { title: '留職停薪', value: '留職停薪' },
  { title: '待入職', value: '待入職' }
]

// 日期類型選項
const dateTypeOptions = [
  { title: '到職日期', value: 'hireDate' },
  { title: '離職日期', value: 'resignationDate' },
  { title: '留停開始日期', value: 'unpaidLeaveStartDate' },
  { title: '留停復職日期', value: 'reinstatementDate' }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    return tableHeaders.filter(header => 
      ['employeeId', 'name', 'employmentStatus'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    return tableHeaders.filter(header => 
      !['employeeCode'].includes(header.key)
    )
  }
  return tableHeaders
})

// API 相關函數
const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = data.result.data
    }
  } catch (error) {
    console.error('載入公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const handleCompanyChange = async () => {
  searchCriteria.value.department = ''
  if (!searchCriteria.value.company) {
    departments.value = []
    return
  }

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: searchCriteria.value.company }
    })
    if (data.success) {
      departments.value = data.result
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    departments.value = []
  }
}

// 處理日期類型變更
const handleDateTypeChange = () => {
  searchCriteria.value.dateRange = []
}

// 修改日期區間變更處理函數
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 修改 performSearch 函數中的日期處理部分
const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'employeeId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: quickSearchText.value,
      company: searchCriteria.value.company,
      department: searchCriteria.value.department,
      status: searchCriteria.value.status
    }

    // 處理日期搜尋
    if (searchCriteria.value.dateType && 
        Array.isArray(searchCriteria.value.dateRange) && 
        searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      const endDate = new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])
      
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      
      params.dateType = searchCriteria.value.dateType
      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/employees/all', { params })
    if (data.success) {
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

const resetSearch = () => {
  searchCriteria.value = {
    company: '',
    department: '',
    status: '',
    dateType: '',
    dateRange: []
  }
  quickSearchText.value = ''
  departments.value = []
  performSearch()
}

// 表格操作函數
const handleTableOptionsChange = async (options) => {
  tablePage.value = options.page
  tableItemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }
  await performSearch()
}

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  tablePage.value = 1
  performSearch()
}, 300)

watch(quickSearchText, () => {
  debouncedSearch()
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadCompanies(),
    performSearch()
  ])
})

// 狀態顏色對應
const getStatusColor = (status) => {
  switch (status) {
    case '在職':
      return 'teal-lighten-1'
    case '離職':
      return 'grey'
    case '留職停薪':
      return 'amber-darken-2'
    case '待入職':
      return 'light-blue-darken-1'
    default:
      return 'grey'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 取得狀態對應的日期提示文字
const getStatusDateTooltip = (item) => {
  switch (item.employmentStatus) {
    case '在職':
      return `到職日期：${formatDate(item.hireDate)}`
    case '離職':
      return `離職日期：${formatDate(item.resignationDate)}`
    case '待入職':
      return `到職日期：${formatDate(item.hireDate)}`
    case '留職停薪':
      return `留停開始日期：${formatDate(item.unpaidLeaveStartDate)}`
    default:
      return ''
  }
}
</script>

<style lang="scss" scoped>
.v-table :deep(thead) {
  background-color: #455a64 !important;
  color: #fff !important;
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: rgb(255, 250, 240);
}

.note-cell {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-table :deep(tbody tr) {
  height: 48px !important;
}
</style>
