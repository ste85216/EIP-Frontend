<template>
  <v-container max-width="1920">
    <!-- 統計資料區塊 -->
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <div class="d-flex justify-space-between align-center">
          <h3>硬體維修記錄</h3>
        </div>
      </v-col>

      <!-- 統計卡片 -->
      <v-col
        cols="12"
        class="mb-4"
      >
        <v-row>
          <!-- 各類型統計卡片 -->
          <template
            v-for="category in categories"
            :key="category._id"
          >
            <v-col
              cols="12"
              sm="3"
              lg="1"
              class="px-3"
            >
              <v-card
                class="rounded-lg border"
                elevation="0"
                min-height="80"
              >
                <v-card-text class="text-center pb-3 px-2">
                  <div class="sub-title mb-2">
                    {{ category.name }}
                  </div>
                  <div
                    v-if="!statsLoading"
                    :class="[
                      'sub-title',
                      getCategoryCount(category._id) > 0 ? 'text-red-darken-3' : 'text-grey'
                    ]"
                  >
                    {{ getCategoryCount(category._id) }}
                  </div>
                  <div
                    v-else
                    class="d-flex justify-center align-center"
                    style="min-height: 21.38px"
                  >
                    <v-progress-circular
                      indeterminate
                      size="20"
                      width="2"
                      color="deep-purple-darken-2"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
          <!-- Total 統計卡片 -->
          <v-col
            cols="12"
            sm="3"
            lg="1"
            class="px-3"
          >
            <v-card
              class="rounded-lg border border-error border-opacity-50"
              elevation="0"
              min-height="80"
            >
              <v-card-text class="text-center pb-3 px-2">
                <div class="sub-title mb-2">
                  Total
                </div>
                <div
                  v-if="!statsLoading"
                  :class="[
                    'sub-title',
                    getTotalCount > 0 ? 'text-red-darken-3' : 'text-grey'
                  ]"
                >
                  {{ getTotalCount }}
                </div>
                <div
                  v-else
                  class="d-flex justify-center align-center"
                  style="min-height: 21.38px"
                >
                  <v-progress-circular
                    indeterminate
                    size="20"
                    width="2"
                    color="deep-purple-darken-2"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>



      <!-- 表格區塊 -->
      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col cols="2">
                <v-btn
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  color="blue-grey-darken-1"
                  @click="openDialog(null)"
                >
                  新增維修記錄
                </v-btn>
              </v-col>
              <!-- 篩選區塊 -->
              <v-col
                cols="8"
                class="pe-16"
              >
                <v-row>
                  <v-col cols="4">
                    <v-date-input
                      v-model="filters.maintenanceDateRange"
                      label="維修日期區間"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      @click:clear="clearStartDate"
                    />
                  </v-col>

                  <v-col cols="4">
                    <v-select
                      v-model="filters.hardwareCategory"
                      :items="categories"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      hide-details
                      label="硬體類型"
                      clearable
                      density="compact"
                    />
                  </v-col>

                  <v-col
                    cols="4"
                    class="d-flex align-center"
                  >
                    <v-btn
                      color="grey"
                      :size="buttonSize"
                      :loading="isSearching"
                      class="me-4"
                      @click="handleReset"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                    <v-btn
                      color="cyan-darken-2"
                      :size="buttonSize"
                      :loading="isSearching"
                      prepend-icon="mdi-magnify"
                      class="me-4"
                      @click="handleSearch"
                    >
                      搜尋
                    </v-btn>
                    <v-btn
                      prepend-icon="mdi-file-pdf-box"
                      color="red-lighten-1"
                      class="me-4"
                      :size="buttonSize"
                      @click="openExportDialog"
                    >
                      匯出
                    </v-btn>
                    <v-btn
                      prepend-icon="mdi-file-excel"
                      color="teal-darken-1"
                      :size="buttonSize"
                      @click="openExportExcelDialog"
                    >
                      匯出
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                cols="12"
                md="2"
                class="d-flex align-center"
              >
                <v-icon
                  v-if="mdAndUp"
                  v-tooltip:top="'可搜尋維修單號、問題內容、處理結果、報修人、備註'"
                  icon="mdi-information"
                  size="small"
                  color="blue-grey-darken-2"
                  class="me-4"
                />
                <v-text-field
                  v-model="quickSearchText"
                  label="快速搜尋"
                  append-inner-icon="mdi-magnify"
                  :loading="isSearching"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleQuickSearch"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :page="tablePage"
              density="compact"
              class="rounded-ts-lg rounded-te-lg py-3"
              :items-per-page-options="[10, 20, 50]"
              :items="tableItems"
              :headers="tableHeaders"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              hover
              @update:items-per-page="tableLoadItems(false)"
              @update:sort-by="tableLoadItems(false)"
              @update:page="onUpdatePage"
            >
              <template #item="{ item }">
                <tr>
                  <td>{{ item.maintenanceRecordId }}</td>
                  <td>{{ formatDate(item.maintenanceDate) }}</td>
                  <td>{{ getCategoryName(item.hardwareCategory) }}</td>
                  <td>{{ item.maintenanceContent }}</td>
                  <td>{{ item.maintenanceResult }}</td>
                  <td>{{ item.reportUserEmployee?.name || item.reportUser }}</td>
                  <td>{{ item.note }}</td>
                  <td class="text-center">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      width="28"
                      :size="buttonSize"
                      :ripple="false"
                      class="me-2"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-lighten-1"
                      variant="plain"
                      width="28"
                      :size="buttonSize"
                      :ripple="false"
                      @click="openDeleteDialog(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :no-click-animation="isSubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-wrench
          </v-icon>
          {{ dialog.id ? '編輯維修記錄' : '新增維修記錄' }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 mb-0 px-6 pb-4">
          <v-form
            ref="maintenanceFormRef"
            :disabled="isSubmitting"
            @submit.prevent="submitMaintenance"
          >
            <v-row>
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="hardwareCategory.value.value"
                  :error-messages="hardwareCategory.errorMessage.value"
                  :items="categories"
                  item-title="name"
                  item-value="_id"
                  label="*硬體類型"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>

              <v-col
                cols="12"
                sm="4"
              >
                <v-date-input
                  v-model="maintenanceDate.value.value"
                  :error-messages="maintenanceDate.errorMessage.value"
                  label="*維修日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :cancel-text="'取消'"
                  :ok-text="'確認'"
                />
              </v-col>

              <v-col
                cols="12"
                sm="4"
              >
                <v-autocomplete
                  v-model="reportUserId.value.value"
                  :items="employees"
                  item-title="label"
                  item-value="value"
                  label="報修人"
                  variant="outlined"
                  density="compact"
                  clearable
                  :error-messages="reportUserId.errorMessage.value"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="maintenanceContent.value.value"
                  :error-messages="maintenanceContent.errorMessage.value"
                  label="*問題內容"
                  variant="outlined"
                  density="compact"
                  rows="4"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="maintenanceResult.value.value"
                  :error-messages="maintenanceResult.errorMessage.value"
                  label="*處理結果"
                  variant="outlined"
                  density="compact"
                  rows="4"
                />
              </v-col>



              <v-col cols="12">
                <v-textarea
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rows="4"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                :loading="isSubmitting"
                @click="closeDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-1"
                :size="buttonSize"
                :loading="isSubmitting"
              >
                送出
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteDialog.open"
      :dialog-width="'320'"
      title="確認刪除維修記錄"
      :message="'確定要刪除此維修記錄嗎？此操作無法復原。'"
      @confirm="deleteRecord"
    />

    <!-- 匯出 PDF 對話框 -->
    <v-dialog
      v-model="exportDialog.open"
      persistent
      max-width="320"
      :no-click-animation="isExporting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-red-lighten-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-file-pdf-box
          </v-icon>
          匯出PDF報表
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeExportDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-form @submit.prevent="handleExportPDF">
            <v-date-input
              v-model="exportDialog.dateRange"
              label="維修日期區間"
              variant="outlined"
              density="compact"
              multiple="range"
              prepend-icon
              clearable
              class="mb-4"
              :cancel-text="'取消'"
              :ok-text="'確認'"
              :error-messages="exportDialog.error"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="closeExportDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="red-lighten-1"
            variant="outlined"
            :size="buttonSize"
            :loading="isExporting"
            @click="handleExportPDF"
          >
            匯出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯出 Excel 對話框 -->
    <v-dialog
      v-model="exportExcelDialog.open"
      persistent
      max-width="360"
      :no-click-animation="isExportingExcel"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-teal-darken-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-file-excel
          </v-icon>
          匯出Excel報表
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeExportExcelDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-form @submit.prevent="handleExportExcel">
            <v-date-input
              v-model="exportExcelDialog.dateRange"
              label="*維修日期區間"
              variant="outlined"
              density="compact"
              multiple="range"
              prepend-icon
              clearable
              class="mb-4"
              :cancel-text="'取消'"
              :ok-text="'確認'"
              :error-messages="exportExcelDialog.dateError"
            />
            <v-select
              v-model="exportExcelDialog.hardwareCategories"
              :items="categories"
              item-title="name"
              item-value="_id"
              variant="outlined"
              density="compact"
              label="*硬體類型"
              clearable
              multiple
              class="mb-4"
              :error-messages="exportExcelDialog.categoryError"
            >
              <template #selection="{ item, index }">
                <span v-if="index === 0">{{ item.raw.name }}</span>
                <span v-else-if="index === 1">...</span>
              </template>
              <template #prepend-item>
                <v-list-item
                  title="全選"
                  color="deep-purple-darken-2"
                  prepend-icon="mdi-checkbox-multiple-marked"
                  :active="exportExcelDialog.hardwareCategories.length === categories.length"
                  @click="selectAllHardwareCategories"
                />
                <v-divider class="mt-2" />
              </template>
            </v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="closeExportExcelDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :size="buttonSize"
            :loading="isExportingExcel"
            @click="handleExportExcel"
          >
            匯出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { debounce } from 'lodash'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import UserRole from '@/enums/UserRole.js'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import html2pdf from 'html2pdf.js'


// ===== 頁面設定 =====
definePage({
  meta: {
    title: '硬體維修記錄 | Ystravel',
    login: true,
    roles: [UserRole.ADMIN, UserRole.IT]
  }
})

// ===== API 與工具初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp } = useDisplay()

// ===== 響應式變數 =====
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => {
  if (mdAndUp.value) return '900'
  if (smAndUp.value) return '600'
  return '100%'
})

// ===== 表單驗證 Schema =====
const maintenanceSchema = yup.object({
  hardwareCategory: yup.string().required('請選擇硬體類型'),
  maintenanceDate: yup.date().required('請選擇維修日期'),
  maintenanceContent: yup.string().required('請輸入問題內容'),
  maintenanceResult: yup.string().required('請輸入處理結果'),
  reportUser: yup.string().nullable(),
  note: yup.string().nullable()
})

// ===== 表單欄位 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: maintenanceSchema,
  initialValues: {
    hardwareCategory: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceContent: '',
    maintenanceResult: '',
    reportUser: '',
    reportUserId: '', // 新增
    note: ''
  },
  validateOnMount: false
})

const hardwareCategory = useField('hardwareCategory')
const maintenanceDate = useField('maintenanceDate', undefined, {
  format: (value) => {
    if (!value) return ''
    return value instanceof Date ? value.toISOString().split('T')[0] : value
  },
  parse: (value) => {
    if (!value) return null
    return new Date(value)
  }
})
const maintenanceContent = useField('maintenanceContent')
const maintenanceResult = useField('maintenanceResult')
const reportUserId = useField('reportUserId') // 新增
const note = useField('note')

// ===== 報修人員工選單 =====
// 員工列表
const employees = ref([])

// 取得所有在職員工列表（用於報修人）
const fetchEmployees = async () => {
  try {
    const { data } = await apiAuth.get('/employees/active')
    if (data.success) {
      // 轉換資料格式以符合 v-autocomplete 的需求
      employees.value = data.result.map(employee => ({
        label: `${employee.name} (${employee.employeeId})`,
        value: employee._id
      }))
    }
  } catch (error) {
    console.error('取得員工列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得員工列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 表格相關設定 =====
const tableHeaders = [
  { title: '維修單號', align: 'start', sortable: true, key: 'maintenanceRecordId' },
  { title: '維修日期', align: 'start', sortable: true, key: 'maintenanceDate' },
  { title: '硬體類型', align: 'start', sortable: true, key: 'hardwareCategory' },
  { title: '問題內容', align: 'start', sortable: true, width: '300', key: 'maintenanceContent' },
  { title: '處理結果', align: 'start', sortable: true, width: '300', key: 'maintenanceResult' },
  { title: '報修人', align: 'start', sortable: true, key: 'reportUser' },
  { title: '備註', align: 'start', sortable: true, key: 'note' },
  { title: '操作', align: 'center', sortable: false, key: 'actions' }
]

const tableItemsPerPage = ref(10)
const tableSortBy = ref([{ key: 'maintenanceRecordId', order: 'desc' }])
const tablePage = ref(1)
const tableItems = ref([])
const tableLoading = ref(true)
const tableItemsLength = ref(0)

// ===== 篩選相關設定 =====
const filters = ref({
  maintenanceDateRange: [],
  hardwareCategory: null
})
const quickSearchText = ref('')

// ===== 對話框相關設定 =====
const dialog = ref({
  open: false,
  id: ''
})

const confirmDeleteDialog = ref({
  open: false,
  item: null
})

// ===== 硬體類別相關 =====
const categories = ref([])
const categoryStats = ref({})

// ===== 硬體類型管理相關 =====
const categoryForm = ref({
  name: '',
  order: ''
})

const categoryErrors = ref({
  name: '',
  order: ''
})

// ===== 表單初始化 =====
const isSubmitting = ref(false)

// ===== 資料載入與更新方法 =====
const statsLoading = ref(true)

const loadStats = async () => {
  statsLoading.value = true
  try {
    const params = {}

    // 處理維修日期範圍
    if (filters.value.maintenanceDateRange && filters.value.maintenanceDateRange.length > 0) {
      const startDate = new Date(filters.value.maintenanceDateRange[0])
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(filters.value.maintenanceDateRange[filters.value.maintenanceDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)

      params.maintenanceDateStart = startDate.toISOString()
      params.maintenanceDateEnd = endDate.toISOString()
    }

    // 處理硬體類型
    if (filters.value.hardwareCategory) {
      params.hardwareCategory = filters.value.hardwareCategory
    }

    const { data } = await apiAuth.get('/hardware/maintenance-records/stats', { params })
    if (data.success) {
      const stats = {}
      data.result.forEach(item => {
        stats[item._id] = item.count
      })
      categoryStats.value = stats
    }
  } catch (error) {
    console.error('載入統計資料失敗:', error)
    createSnackbar({
      text: '載入統計資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    statsLoading.value = false
  }
}

const getCategoryCount = (categoryId) => {
  return categoryStats.value[categoryId] || 0
}

const tableLoadItems = async (loading = true) => {
  if (loading) {
    tableLoading.value = true
  }

  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'maintenanceDate',
      sortOrder: tableSortBy.value[0]?.order || 'desc',
      search: quickSearchText.value
    }

    // 處理維修日期範圍
    if (filters.value.maintenanceDateRange && filters.value.maintenanceDateRange.length > 0) {
      const startDate = new Date(filters.value.maintenanceDateRange[0])
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(filters.value.maintenanceDateRange[filters.value.maintenanceDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)

      params.maintenanceDateStart = startDate.toISOString()
      params.maintenanceDateEnd = endDate.toISOString()
    }

    // 處理硬體類型
    if (filters.value.hardwareCategory) {
      params.hardwareCategory = filters.value.hardwareCategory
    }

    const { data } = await apiAuth.get('/hardware/maintenance-records', { params })
    if (data.success) {
      if (categories.value.length === 0) {
        await loadCategories()
      }
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('載入資料失敗:', error)
    createSnackbar({
      text: '載入資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

const refreshData = async () => {
  try {
    isSearching.value = true
    await Promise.all([
      tableLoadItems(true),
      loadStats()
    ])
  } catch (error) {
    console.error('刷新資料失敗:', error)
  } finally {
    isSearching.value = false
  }
}

// ===== 硬體類型管理方法 =====
const loadCategories = async () => {
  try {
    const { data } = await apiAuth.get('/hardware/categories/search', {
      params: { type: 1 }
    })
    if (data.success) {
      categories.value = data.result
    }
  } catch (error) {
    console.error('載入硬體類型失敗:', error)
    createSnackbar({
      text: '載入硬體類型失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 監聽器 =====
const debouncedSearch = debounce(async () => {
  try {
    isSearching.value = true
    tablePage.value = 1
    await refreshData()
  } catch (error) {
    console.error('快速搜尋失敗:', error)
    createSnackbar({
      text: '搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSearching.value = false
  }
}, 300)

// 新增快速搜尋處理方法
const handleQuickSearch = () => {
  isSearching.value = true
  debouncedSearch()
}

// 修改 watch
watch(quickSearchText, () => {
  handleQuickSearch()
})

// 監聽表單值的變化
watch(() => categoryForm.value.name, (newVal) => {
  if (newVal) {
    categoryErrors.value.name = ''
  }
})

watch(() => categoryForm.value.order, (newVal) => {
  if (newVal) {
    categoryErrors.value.order = ''
  }
})

// 或者使用一個組合的 watch
watch(categoryForm, (newVal) => {
  if (newVal.name) {
    categoryErrors.value.name = ''
  }
  if (newVal.order) {
    categoryErrors.value.order = ''
  }
}, { deep: true })

// ===== 生命週期鉤子 =====
onMounted(async () => {
  try {
    await loadCategories()
    await Promise.all([
      loadStats(),
      tableLoadItems(true),
      fetchEmployees() // 新增這行
    ])
  } catch (error) {
    console.error('初始化資料載入失敗:', error)
  }
})

// ===== 工具方法 =====
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCategoryName = (id) => {
  // 如果 id 是物件（已經被 populate），直接使用其 name 屬性
  if (typeof id === 'object' && id !== null) {
    return id.name || '未知'
  }
  // 如果是 ID，則從 categories 中查找
  const category = categories.value.find(c => c._id === id)
  return category ? category.name : '未知'
}

const clearStartDate = () => {
  filters.value.maintenanceDateRange = []
  refreshData()
}

// ===== 維修記錄相關方法 =====
const openDialog = (item) => {
  dialog.value.open = true
  if (item) {
    dialog.value.id = item._id
    resetForm({
      values: {
        hardwareCategory: typeof item.hardwareCategory === 'object' ? item.hardwareCategory._id : item.hardwareCategory,
        maintenanceDate: new Date(item.maintenanceDate),
        maintenanceContent: item.maintenanceContent,
        maintenanceResult: item.maintenanceResult,
        reportUser: item.reportUser || '',
        reportUserId: item.reportUserEmployee?._id || '', // 新增
        note: item.note || ''
      }
    })
  } else {
    dialog.value.id = ''
    resetForm({
      values: {
        hardwareCategory: '',
        maintenanceDate: new Date(),
        maintenanceContent: '',
        maintenanceResult: '',
        reportUser: '',
        reportUserId: '',
        note: ''
      }
    })
  }
}

const closeDialog = () => {
  dialog.value.open = false
  resetForm()
}

const submitMaintenance = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true

    const submitData = {
      ...values,
      maintenanceDate: values.maintenanceDate instanceof Date
        ? formatDate(values.maintenanceDate)
        : values.maintenanceDate
    }

    if (dialog.value.id) {
      const { data } = await apiAuth.patch(`/hardware/maintenance-records/${dialog.value.id}`, submitData)
      if (data.success) {
        createSnackbar({
          text: '維修記錄更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeDialog()
        refreshData()
      }
    } else {
      const { data } = await apiAuth.post('/hardware/maintenance-records', submitData)
      if (data.success) {
        createSnackbar({
          text: '維修記錄新增成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeDialog()
        refreshData()
      }
    }
  } catch (error) {
    console.error('儲存維修記錄失敗:', error.response?.data || error)
    createSnackbar({
      text: error.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmitting.value = false
  }
})

const openDeleteDialog = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    item
  }
}

const deleteRecord = async () => {
  if (!confirmDeleteDialog.value.item) return

  try {
    await apiAuth.delete(`/hardware/maintenance-records/${confirmDeleteDialog.value.item._id}`)
    createSnackbar({
      text: '維修記錄刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    refreshData()
  } catch (error) {
    console.error('刪除維修記錄失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    confirmDeleteDialog.value.open = false
    confirmDeleteDialog.value.item = null
  }
}

const onUpdatePage = (page) => {
  if (page < 1) page = 1
  const maxPage = Math.ceil(tableItemsLength.value / tableItemsPerPage.value)
  if (page > maxPage) page = maxPage

  if (tablePage.value !== page) {
    tablePage.value = page
    tableLoadItems(false)
  }
}

const maintenanceFormRef = ref(null)

// 添加搜尋和重置方法
const handleSearch = async () => {
  try {
    isSearching.value = true
    await refreshData()
  } catch (error) {
    console.error('搜尋時發生錯誤:', error)
    createSnackbar({
      text: '搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSearching.value = false
  }
}

const handleReset = async () => {
  filters.value.maintenanceDateRange = []
  filters.value.hardwareCategory = null
  quickSearchText.value = ''
  try {
    isSearching.value = true
    await refreshData()
  } catch (error) {
    console.error('重置搜尋失敗:', error)
    createSnackbar({
      text: '重置搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSearching.value = false
  }
}

// 在 script setup 區塊中新增 isSearching 狀態
const isSearching = ref(false)

// 匯出相關
const exportDialog = ref({
  open: false,
  dateRange: [],
  error: ''  // 添加錯誤訊息欄位
})

// 將exportExcelDialog的search屬性移除
const exportExcelDialog = ref({
  open: false,
  dateRange: [],
  hardwareCategories: [],
  dateError: '',
  categoryError: ''
})

const isExporting = ref(false)
const isExportingExcel = ref(false)

// 監聽日期區間變化
watch(() => exportDialog.value.dateRange, (newVal) => {
  if (newVal && newVal.length > 0) {
    exportDialog.value.error = ''
  }
})

// 監聽Excel匯出對話框的變化
watch(() => exportExcelDialog.value.dateRange, (newVal) => {
  if (newVal && newVal.length > 0) {
    exportExcelDialog.value.dateError = ''
  }
})

watch(() => exportExcelDialog.value.hardwareCategories, (newVal) => {
  if (newVal && newVal.length > 0) {
    exportExcelDialog.value.categoryError = ''
  }
})

// handleExportExcel方法中移除search參數
const handleExportPDF = async () => {
  // 驗證日期區間
  if (!exportDialog.value.dateRange || exportDialog.value.dateRange.length === 0) {
    exportDialog.value.error = '請選擇日期區間'
    return
  }

  try {
    isExporting.value = true

    // 獲取統計數據
    const params = {}

    if (exportDialog.value.dateRange && exportDialog.value.dateRange.length > 0) {
      const startDate = new Date(exportDialog.value.dateRange[0])
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)

      params.maintenanceDateStart = startDate.toISOString()
      params.maintenanceDateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/hardware/maintenance-records/export-stats', { params })

    if (data.success) {
      // 計算總維修次數
      const totalCount = data.result.reduce((acc, curr) => acc + curr.count, 0)

      // 創建 PDF 內容
      const content = document.createElement('div')
      content.innerHTML = `
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; font-size: 17px; font-weight: bold;">硬體維修記錄統計報表</div>
          <p style="margin-bottom: 16px; font-size: 14px;">統計期間：${formatDate(exportDialog.value.dateRange[0])} ~ ${formatDate(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: center;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 8px; background-color: #f5f5f5;">硬體類型</th>
                <th style="border: 1px solid #ddd; border-bottom: none; padding: 8px; background-color: #f5f5f5;">維修次數</th>
              </tr>
            </thead>
            <tbody>
              ${categories.value.map(category => {
                const statsItem = data.result.find(item => item.name === category.name)
                return `
                  <tr>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 8px;">${category.name}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; padding: 8px; text-align: center;">${statsItem ? statsItem.count : 0}</td>
                  </tr>
                `
              }).join('')}
              <tr>
                <td style="border: 1px solid #ddd; border-right: none; padding: 8px; font-weight: bold; background-color: #f5f5f5;">Total</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; background-color: #f5f5f5;">${totalCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      // 配置 PDF 選項
      const options = {
        margin: 10,
        filename: '硬體維修記錄統計報表.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 6,
          logging: false,
          useCORS: true,
          allowTaint: true,
          removeContainer: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      }

      // 生成 PDF
      const pdf = html2pdf().set(options)
      await pdf.from(content).save()

      closeExportDialog()
      createSnackbar({
        text: 'PDF 匯出成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('匯出 PDF 失敗:', error)
    createSnackbar({
      text: '匯出 PDF 失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isExporting.value = false
  }
}

// 在 script setup 中添加 getTotalCount 計算屬性
const getTotalCount = computed(() => {
  return Object.values(categoryStats.value).reduce((total, count) => total + count, 0)
})

// 處理匯出 Excel
const handleExportExcel = async () => {
  try {
    // 驗證
    let hasError = false
    exportExcelDialog.value.dateError = ''
    exportExcelDialog.value.categoryError = ''

    // 檢查日期區間（必填）
    if (!exportExcelDialog.value.dateRange || exportExcelDialog.value.dateRange.length === 0) {
      exportExcelDialog.value.dateError = '請選擇日期區間'
      hasError = true
    }

    // 檢查硬體類型（必填）
    if (!exportExcelDialog.value.hardwareCategories || exportExcelDialog.value.hardwareCategories.length === 0) {
      exportExcelDialog.value.categoryError = '請選擇至少一個硬體類型'
      hasError = true
    }

    if (hasError) return

    isExportingExcel.value = true

    // 準備查詢參數
    const params = {
      sortBy: 'maintenanceDate',
      sortOrder: 'desc'
    }

    // 處理維修日期範圍
    if (exportExcelDialog.value.dateRange && exportExcelDialog.value.dateRange.length > 0) {
      const startDate = new Date(exportExcelDialog.value.dateRange[0])
      startDate.setHours(0, 0, 0, 0)

      // 如果只有一個日期，結束日期等於開始日期
      const endDate = exportExcelDialog.value.dateRange.length > 1
        ? new Date(exportExcelDialog.value.dateRange[exportExcelDialog.value.dateRange.length - 1])
        : new Date(exportExcelDialog.value.dateRange[0])
      endDate.setHours(23, 59, 59, 999)

      params.maintenanceDateStart = startDate.toISOString()
      params.maintenanceDateEnd = endDate.toISOString()
    }

    // 處理硬體類型
    if (exportExcelDialog.value.hardwareCategories && exportExcelDialog.value.hardwareCategories.length > 0) {
      params.hardwareCategories = exportExcelDialog.value.hardwareCategories
    }

    // 呼叫 API 取得資料
    const { data } = await apiAuth.get('/hardware/maintenance-records/export-excel', { params })

    if (data.success) {
      // 載入 XLSX
      const XLSX = await import('xlsx')

      // 準備 Excel 資料
      const excelData = data.result.map(record => ({
        '維修單號': record.maintenanceRecordId || '',
        '維修日期': formatDate(record.maintenanceDate),
        '硬體類型': record.hardwareCategory?.name || '',
        '問題內容': record.maintenanceContent || '',
        '處理結果': record.maintenanceResult || '',
        '報修人': record.reportUserEmployee?.name || record.reportUser || '',
        '備註': record.note || ''
      }))

      // 創建工作表
      const ws = XLSX.utils.json_to_sheet(excelData)

      // 設定欄寬
      const colWidths = {
        '維修單號': 15,
        '維修日期': 15,
        '硬體類型': 15,
        '問題內容': 40,
        '處理結果': 40,
        '報修人': 15,
        '備註': 30
      }

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }))

      // 創建工作簿
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '硬體維修記錄')

      // 生成檔案名稱
      const fileName = `硬體維修記錄_${new Date().toISOString().split('T')[0]}.xlsx`

      // 下載檔案
      XLSX.writeFile(wb, fileName)

      // 關閉對話框
      closeExportExcelDialog()

      createSnackbar({
        text: 'Excel 匯出成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('匯出Excel失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '匯出Excel失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isExportingExcel.value = false
  }
}

const closeExportDialog = () => {
  exportDialog.value.open = false
  exportDialog.value.dateRange = []
  exportDialog.value.error = ''
}

const closeExportExcelDialog = () => {
  exportExcelDialog.value.open = false
  exportExcelDialog.value.dateRange = []
  exportExcelDialog.value.hardwareCategories = []
  exportExcelDialog.value.dateError = ''
  exportExcelDialog.value.categoryError = ''
}

const openExportDialog = () => {
  exportDialog.value.open = true
  exportDialog.value.dateRange = []
  exportDialog.value.error = ''
}

const openExportExcelDialog = () => {
  exportExcelDialog.value.open = true
  exportExcelDialog.value.dateRange = []
  exportExcelDialog.value.hardwareCategories = []
  exportExcelDialog.value.dateError = ''
  exportExcelDialog.value.categoryError = ''
}

const selectAllHardwareCategories = () => {
  if (exportExcelDialog.value.hardwareCategories.length === categories.value.length) {
    // 已全選，則清空
    exportExcelDialog.value.hardwareCategories = []
  } else {
    // 否則全選
    exportExcelDialog.value.hardwareCategories = categories.value.map(category => category._id)
  }
  exportExcelDialog.value.categoryError = ''
}
</script>

<style lang="scss" scoped>
.v-data-table {
  :deep(thead) {
    background-color: #455A64;
    color: white;
    height: 48px;
  }
  :deep(tbody) {
    tr:nth-child(even) {
      background-color: #fffaf0;
    }
    tr:nth-child(odd) {
      background-color: #f6f8fa;
    }
  }
}

</style>
