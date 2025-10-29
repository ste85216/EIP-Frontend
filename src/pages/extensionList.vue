<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6">
            <h3>
              分機表
            </h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 公司選擇 -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="text-label">公司 :</span>
                  <v-select
                    v-model="searchCriteria.company"
                    :items="companies"
                    :item-title="item => item && item.name ? item.name : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇公司"
                    hide-details
                    :disabled="false"
                    @update:model-value="handleCompanyChange"
                  />
                </div>
              </v-col>

              <!-- 部門選擇 -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="text-label">部門 :</span>
                  <v-select
                    v-model="searchCriteria.department"
                    :items="departments"
                    :item-title="item => item && item.name ? item.name : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    :placeholder="!searchCriteria.company ? '請先選擇公司' : '請選擇部門'"
                    hide-details
                    :disabled="!searchCriteria.company"
                  />
                </div>
              </v-col>

              <!-- 重置按鈕 -->

              <!-- 快速搜尋 -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="text-label">快速搜尋 :</span>
                  <v-text-field
                    v-model="quickSearch"
                    :loading="isSearching"
                    density="compact"
                    variant="outlined"
                    label="搜尋姓名、分機號碼"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                    :disabled="false"
                  />
                </div>
              </v-col>
              <!-- 重置按鈕 -->
              <div class="d-flex align-end pt-3 pb-2 ms-auto ms-sm-1 me-1">
                <v-btn
                  color="grey"
                  elevation="1"
                  :disabled="false"
                  @click="resetSearch"
                >
                  <v-icon>
                    mdi-refresh
                  </v-icon>
                </v-btn>
              </div>
            </v-row>
          </v-card-text>
          <v-divider class="my-0" />

          <!-- 客製化表格區塊 -->
          <v-card-text class="px-sm-6 px-md-7">
            <div
              v-if="loading"
              class="text-center py-8"
            >
              <v-progress-circular
                indeterminate
                color="blue-grey-darken-1"
                size="64"
                width="6"
              />
              <div class="mt-4 text-grey-darken-1">
                載入中...
              </div>
            </div>

            <div
              v-else-if="filteredEmployees.length === 0"
              class="text-center py-8"
            >
              <v-icon
                icon="mdi-phone-off"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <div class="text-grey-lighten-1">
                找不到符合條件的員工
              </div>
            </div>

            <div
              v-else
              class="extension-list"
            >
              <!-- 按公司分組顯示 -->
              <div
                v-for="company in groupedEmployees"
                :key="company._id"
                class="company-section mb-8"
              >
                <div class="company-title-section">
                  <v-card-title class="company-title">
                    <v-icon
                      icon="mdi-domain"
                      size="20"
                      class="me-2"
                    />
                    {{ company.name }}
                  </v-card-title>
                </div>
                <!-- 公司內容容器 -->
                <v-card class="company-content-card elevation-0 px-4 py-5">
                  <!-- 公司標題 -->


                  <!-- 部門列表 - 四個一橫排 -->
                  <div class="departments-grid">
                    <div
                      v-for="department in company.departments"
                      :key="department._id"
                      class="department-section"
                    >
                      <!-- 部門內容容器 -->
                      <v-card
                        class="department-content-card elevation-0 pa-3"
                        variant="outlined"
                      >
                        <v-card-title class="department-title ps-1 pt-1 pb-3">
                          <v-icon
                            icon="mdi-office-building"
                            size="18"
                            class="me-2"
                          />
                          {{ department.name }}
                        </v-card-title>
                        <!-- 員工列表 - 兩個一橫排 -->
                        <div class="employees-grid px-1">
                          <v-card
                            v-for="employee in department.employees"
                            :key="employee._id"
                            class="employee-card elevation-1"
                            variant="outlined"
                            elevation="0"
                          >
                            <v-card-text class="employee-content">
                              <div class="employee-info">
                                <div class="employee-name">
                                  {{ employee.name }}
                                </div>
                                <div class="employee-details">
                                  <div class="employee-job-title">
                                    {{ employee.jobTitle }}
                                  </div>
                                </div>
                                <div class="employee-extension pe-4">
                                  <v-icon
                                    icon="mdi-phone"
                                    size="14"
                                    class="me-1"
                                  />
                                  {{ employee.extNumber }}
                                </div>
                              </div>
                            </v-card-text>
                          </v-card>
                        </div>
                      </v-card>
                    </div>
                  </div>
                </v-card>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { debounce } from 'lodash'
// 移除未使用的 useDisplay

// 頁面定義
definePage({
  meta: {
    title: '分機表 | Ystravel',
    login: true,
    permission: 'EXTENSION_LIST_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 移除未使用的 smAndUp

// 載入狀態
const loading = ref(false)
const isSearching = ref(false)

// 資料
const employees = ref([])
const companies = ref([])
const departments = ref([])

// 搜尋條件
const searchCriteria = reactive({
  company: null,
  department: null
})

// 快速搜尋
const quickSearch = ref('')

// 移除 filteredDepartments 計算屬性，直接使用 departments

// 計算屬性：過濾後的員工列表
const filteredEmployees = computed(() => {
  let result = employees.value

  // 公司篩選
  if (searchCriteria.company) {
    result = result.filter(emp => emp.company._id === searchCriteria.company)
  }

  // 部門篩選
  if (searchCriteria.department) {
    result = result.filter(emp => emp.department._id === searchCriteria.department)
  }

  // 快速搜尋
  if (quickSearch.value) {
    const searchTerm = quickSearch.value.toLowerCase()
    result = result.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.extNumber.includes(searchTerm) ||
      emp.employeeCode.toLowerCase().includes(searchTerm)
    )
  }

  return result
})

// 計算屬性：按公司和部門分組的員工
const groupedEmployees = computed(() => {
  const groups = {}

  filteredEmployees.value.forEach(employee => {
    // 檢查員工資料結構
    if (!employee.company || !employee.department) {
      return
    }

    const companyId = employee.company._id
    const companyName = employee.company.name
    const departmentId = employee.department._id
    const departmentName = employee.department.name

    // 初始化公司
    if (!groups[companyId]) {
      groups[companyId] = {
        _id: companyId,
        name: companyName,
        departments: {}
      }
    }

    // 初始化部門
    if (!groups[companyId].departments[departmentId]) {
      groups[companyId].departments[departmentId] = {
        _id: departmentId,
        name: departmentName,
        employees: []
      }
    }

    // 添加員工
    groups[companyId].departments[departmentId].employees.push(employee)
  })

  // 轉換為陣列格式，並按部門員工數量排序
  const result = Object.values(groups).map(company => ({
    ...company,
    departments: Object.values(company.departments).sort((a, b) => {
      // 按員工數量升序排序（員工少的部門排在前面）
      return a.employees.length - b.employees.length
    })
  }))

  return result
})

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.company = null
  searchCriteria.department = null
  quickSearch.value = ''
  fetchEmployees()
}

// 公司變更處理
const handleCompanyChange = async () => {
  // 當公司變更時，清空部門選擇
  searchCriteria.department = null

  if (!searchCriteria.company) {
    departments.value = []
    return
  }

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: searchCriteria.company }
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

// 取得員工資料
const fetchEmployees = async () => {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    // 使用 /employees/all 端點，並加上查詢參數只取得在職員工
    const { data } = await apiAuth.get('/employees/all', {
      params: {
        status: '在職',
        itemsPerPage: -1  // 取得所有資料，不分頁
      }
    })

    if (data.success) {
      // 處理不同的資料結構
      if (Array.isArray(data.result)) {
        employees.value = data.result
      } else if (data.result && Array.isArray(data.result.data)) {
        employees.value = data.result.data
      } else {
        employees.value = []
      }
    } else {
      employees.value = []
    }
  } catch (error) {
    console.error('取得員工資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得員工資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    employees.value = []
  } finally {
    loading.value = false
    isSearching.value = false
  }
}

// 取得公司列表
const fetchCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      // 處理不同的資料結構
      if (Array.isArray(data.result)) {
        companies.value = data.result
      } else if (data.result && Array.isArray(data.result.data)) {
        companies.value = data.result.data
      } else {
        companies.value = []
      }
    } else {
      companies.value = []
    }
  } catch (error) {
    console.error('取得公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    companies.value = []
  }
}

// 移除 fetchDepartments 函數，改為動態載入部門

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  // 觸發重新計算 filteredEmployees
  isSearching.value = false
}, 300)

// 監聽快速搜尋變更
watch(quickSearch, (newValue) => {
  if (newValue !== undefined) {
    isSearching.value = true
    debouncedSearch()
  }
})

// 頁面載入時初始化
onMounted(async () => {
  try {
    // 載入基本資料（移除 fetchDepartments，改為動態載入）
    // 分別執行，避免 Promise.all 中的錯誤被忽略
    await fetchCompanies()
    await fetchEmployees()
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

/* 搜尋區域樣式 */
.text-label {
  color: #455a64;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  margin-bottom: 8px;
  @include sm {
    font-size: 14px;
  }
}

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

/* 分機表樣式 */
.extension-list {
  .company-section {
    .company-title-section {
      position: relative;
      background: #637781;
      width: 150px;
      border-radius: 8px 8px 0 0;
      &::before {
        content: "";
        width: 100px;
        height: 52px;
        position: absolute;
        border-radius: 0 4px 0 0;
        transform: translateX(64px) skew(30deg);

        background-color: #637781;
        z-index: -1;
      }
      .company-title {
        color: #FFF;
        border-radius: 6px;
        font-size: 18px;
        font-weight: 600;
        padding: 12px 16px;
        position: relative;
        z-index: 3;
      }
    }
    .company-content-card {
      position: relative;
      z-index:5 ;
      background: #ECEFF1;
      border-radius: 0 8px 8px 8px;
    }
    .departments-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 12px;

      @include sm {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      @include md {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      @include lg {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }

      @include xl {
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .department-section {

        .department-title {
            display: flex;
            align-items: center;
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }

        .department-content-card {
          background: #ffffff;
          border: 1px solid #e8f5e8;
          border-radius: 6px;
        }

        .employees-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;

          @include sm {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }

          @include md {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          @include lg {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .employee-card {
            color: #333;
            border-radius: 6px;
            transition: all 0.1s ease;
            border: 1px solid #e0e0e0;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-color: #78909C;
            }

            .employee-content {
              padding: 12px;

              .employee-info {
                display: flex;
                flex-direction: column;
                gap: 6px;
                text-align: center;

                .employee-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #2c3e50;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .employee-extension {
                  font-size: 14px;
                  font-weight: 600;
                  color: #1976d2;
                  display: flex;
                  align-items: center;
                  background: #e3f2fd;
                  padding: 4px 8px;
                  border-radius: 4px;
                  border: 1px solid #bbdefb;
                  justify-content: center;
                }
              }

              .employee-details {
                .employee-job-title {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 2px;
                }

                .employee-code {
                  font-size: 10px;
                  color: #999;
                }
              }
            }
          }
        }
      }
    }
  }
}

/* 響應式設計 */
/* 手機版 (預設) */
.departments-grid {
  grid-template-columns: 1fr !important;
  gap: 10px !important;
}

.employees-grid {
  grid-template-columns: 1fr !important;
}

@include sm {
  .departments-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }

  .employees-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@include md {
  .departments-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .employees-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@include lg {
  .departments-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 12px !important;
  }

  .employees-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@include xl {
  .departments-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 12px !important;
  }

  .employees-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
</style>
