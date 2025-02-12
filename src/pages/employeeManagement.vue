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
            class="mt-1 px-lg-10"
          >
            <v-card class="elevation-4 rounded-lg py-4 py-sm-8 px-4 px-sm-4 px-xl-6">
              <v-card-title class="font-weight-bold d-flex align-center">
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

                  <!-- 在職狀態 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.status"
                      :items="statusOptions"
                      label="在職狀態"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
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
        class="px-6 ps-lg-4 pe-lg-12 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-4 px-md-10 mt-1 bg-white">
          <!-- 標題和功能按鈕區 -->
          <v-col
            cols="12"
            class="ps-4 pb-sm-4"
          >
            <v-row>
              <v-col>
                <h3>員工管理</h3>
              </v-col>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-row class="d-flex justify-space-between">
                  <v-col cols="2">
                    <v-btn
                      prepend-icon="mdi-account-plus"
                      variant="outlined"
                      color="blue-grey-darken-2"
                      class="me-4"
                      @click="openDialog(null)"
                    >
                      新增員工
                    </v-btn>
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
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.employeeId }}</td>
                  <td>{{ item.name }}</td>
                  <td v-if="smAndUp">
                    {{ item.company?.name }}
                  </td>
                  <td v-if="smAndUp">
                    {{ item.department?.name }}
                  </td>
                  <td v-if="lgAndUp">
                    {{ item.employeeCode }}
                  </td>
                  <td v-if="smAndUp">
                    {{ item.extNumber }}
                  </td>
                  <td v-if="smAndUp">
                    {{ item.printNumber }}
                  </td>
                  <td v-if="lgAndUp">
                    {{ item.email }}
                  </td>
                  <td>
                    <v-chip
                      :color="item.employmentStatus === '在職' ? 'teal-lighten-1' : 'grey'"
                      size="small"
                      variant="outlined"
                      class="text-white"
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
                  <td class="text-center">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      :size="buttonSize"
                      :ripple="false"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-lighten-1"
                      variant="plain"
                      :size="buttonSize"
                      :ripple="false"
                      @click="confirmDelete(item)"
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
    >
      <v-card class="rounded-lg px-4 py-6">
        <div class="card-title px-4 py-3">
          {{ dialog.id ? '編輯員工資料' : '新增員工' }}
        </div>
        <v-card-text class="mt-3 pa-3">
          <!-- 加入載入中動畫 -->
          <div
            v-if="isDialogLoading"
            class="d-flex justify-center align-center"
            style="min-height: 458px;"
          >
            <v-progress-circular
              indeterminate
              color="purple-darken-2"
              size="64"
              width="8"
            />
          </div>
          
          <!-- 表單內容 -->
          <v-form
            v-else
            @submit.prevent="submitEmployee"
          >
            <v-row>
              <!-- 系統員工編號 (只在編輯時顯示) -->
              <v-col
                v-if="dialog.id"
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="employeeId.value.value"
                  :error-messages="employeeId.errorMessage.value"
                  label="系統員工編號"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <!-- 姓名 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.errorMessage.value"
                  label="*姓名"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 公司選擇 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="company.value.value"
                  :error-messages="company.errorMessage.value"
                  :items="companies"
                  :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                  item-value="_id"
                  label="*公司"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleFormCompanyChange"
                />
              </v-col>

              <!-- 部門選擇 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="department.value.value"
                  :error-messages="department.errorMessage.value"
                  :items="formDepartments"
                  :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                  item-value="_id"
                  label="*部門"
                  variant="outlined"
                  density="compact"
                  :disabled="!company.value.value"
                />
              </v-col>

              <!-- 在職狀態 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="employmentStatus.value.value"
                  :error-messages="employmentStatus.errorMessage.value"
                  :items="statusOptions"
                  label="*在職狀態"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- Email -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="email.value.value"
                  :error-messages="email.errorMessage.value"
                  label="*Email"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- Email 密碼 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="emailPassword.value.value"
                  :error-messages="emailPassword.errorMessage.value"
                  label="*Email密碼"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 科威員工編號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="employeeCode.value.value"
                  :error-messages="employeeCode.errorMessage.value"
                  label="*科威員工編號"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 分機號碼 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="extNumber.value.value"
                  :error-messages="extNumber.errorMessage.value"
                  label="*分機號碼"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 列印編號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="printNumber.value.value"
                  :error-messages="printNumber.errorMessage.value"
                  label="*列印編號"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 備註 -->
              <v-col cols="12">
                <v-text-field
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-3 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                @click="closeDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :size="buttonSize"
                :loading="isSubmitting"
              >
                {{ dialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog.open"
      title="確認刪除員工"
      :message="`確定要刪除員工「<span class='text-pink-lighten-1' style='font-weight: 800;'>${confirmDeleteDialog.name}</span>」嗎？此操作無法復原。`"
      :expected-name="confirmDeleteDialog.name"
      input-label="員工姓名"
      @confirm="deleteEmployee"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

// 頁面定義
definePage({
  meta: {
    title: '員工管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

// 響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => mdAndUp.value ? '1200' : '100%')

// 表格相關
const tableHeaders = [
  { title: '系統員編', key: 'employeeId', align: 'start', sortable: true },
  { title: '姓名', key: 'name', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', align: 'start', sortable: true },
  { title: '部門', key: 'department.name', align: 'start', sortable: true },
  { title: '科威員編', key: 'employeeCode', align: 'start', sortable: true },
  { title: '分機號碼', key: 'extNumber', align: 'start', sortable: true },
  { title: '列印編號', key: 'printNumber', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: '狀態', key: 'employmentStatus', align: 'start', sortable: true },
  { title: '備註', key: 'note', align: 'start', sortable: true, width: '160px' },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'employeeId', order: 'asc' }])

// 搜尋相關響應式變數
const quickSearchText = ref('')
const companies = ref([])
const departments = ref([])
const searchCriteria = ref({
  company: '',
  department: '',
  status: '',
})

// 對話框相關響應式變數
const dialog = ref({
  open: false,
  id: null
})

const confirmDeleteDialog = ref({
  open: false,
  id: '',
  name: ''
})

// 狀態選項
const statusOptions = [
  { title: '在職', value: '在職' },
  { title: '離職', value: '離職' }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    return tableHeaders.filter(header => 
      ['employeeId', 'name', 'employmentStatus', 'actions'].includes(header.key)
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

// 搜尋相關函數
const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'employeeId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: quickSearchText.value,
      ...searchCriteria.value
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

// 刪除相關函數
const confirmDelete = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    id: item._id,
    name: item.name
  }
}

const deleteEmployee = async () => {
  try {
    await apiAuth.delete(`/employees/${confirmDeleteDialog.value.id}`)
    await performSearch()
    confirmDeleteDialog.value.open = false
    createSnackbar({
      text: '刪除員工成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 表單相關響應式變數
const formDepartments = ref([])

// 表單相關函數
const handleFormCompanyChange = async () => {
  department.value.value = ''
  formDepartments.value = []
  if (!company.value.value) return

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: company.value.value }
    })
    if (data.success) {
      formDepartments.value = data.result
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 新增載入狀態
const isDialogLoading = ref(false)

// 在 script setup 中添加表單驗證架構
const employeeSchema = computed(() => {
  const schema = {
    company: yup
      .string()
      .required('請選擇公司'),
    department: yup
      .string()
      .required('請選擇部門'),
    name: yup
      .string()
      .required('請輸入姓名')
      .trim(),
    email: yup
      .string()
      .required('請輸入 Email')
      .email('請輸入正確的 Email 格式')
      .matches(/@ystravel\.com\.tw$/, 'Email 必須使用 @ystravel.com.tw 網域'),
    emailPassword: yup
      .string()
      .required('請輸入 Email 密碼'),
    employeeCode: yup
      .string()
      .required('請輸入科威員工編號'),
    extNumber: yup
      .string()
      .required('請輸入分機號碼'),
    printNumber: yup
      .string()
      .required('請輸入列印編號'),
    employmentStatus: yup
      .string()
      .required('請選擇在職狀態'),
    note: yup
      .string()
      .nullable()
  }

  if (dialog.value.id) {
    schema.employeeId = yup
      .string()
      .required('請輸入系統員工編號')
  }

  return yup.object(schema)
})

// 初始化表單
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: employeeSchema,
  initialValues: {
    company: '',
    department: '',
    name: '',
    email: '@ystravel.com.tw',
    emailPassword: '',
    employeeCode: '',
    extNumber: '',
    printNumber: '',
    employmentStatus: '在職',
    note: ''
  }
})

// 定義表單欄位
const company = useField('company')
const department = useField('department')
const name = useField('name')
const email = useField('email')
const emailPassword = useField('emailPassword')
const employeeCode = useField('employeeCode')
const extNumber = useField('extNumber')
const printNumber = useField('printNumber')
const employmentStatus = useField('employmentStatus')
const note = useField('note')
const employeeId = useField('employeeId')

// 修改 openDialog 函數
const openDialog = async (item) => {
  dialog.value.open = true
  dialog.value.id = item?._id || null
  isDialogLoading.value = true

  try {
    if (item) {
      // 編輯模式
      // 先設定公司並載入部門列表
      company.value.value = item.company?._id || ''
      if (item.company?._id) {
        await handleFormCompanyChange()
      }

      // 設定其他欄位值
      department.value.value = item.department?._id || ''
      name.value.value = item.name || ''
      email.value.value = item.email || '@ystravel.com.tw'
      emailPassword.value.value = item.emailPassword || ''
      employeeCode.value.value = item.employeeCode || ''
      extNumber.value.value = item.extNumber || ''
      printNumber.value.value = item.printNumber || ''
      employmentStatus.value.value = item.employmentStatus || '在職'
      note.value.value = item.note || ''
      if (employeeId.value) {
        employeeId.value.value = item.employeeId || ''
      }
    } else {
      // 新增模式
      resetForm()
    }
  } catch (error) {
    console.error('載入員工資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入員工資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeDialog()
  } finally {
    isDialogLoading.value = false
  }
}

// 修改 closeDialog 函數
const closeDialog = () => {
  dialog.value.open = false
  dialog.value.id = null
  isDialogLoading.value = false
  resetForm()
  formDepartments.value = []
}

// 修改 submitEmployee 函數
const submitEmployee = handleSubmit(async (values) => {
  try {
    if (dialog.value.id) {
      // 編輯
      const { data } = await apiAuth.patch(`/employees/${dialog.value.id}`, values)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '員工資料更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增
      const { data } = await apiAuth.post('/employees', values)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '新增員工成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message
    const errorField = error?.response?.data?.field
    
    // 如果有特定欄位錯誤，更新對應欄位的錯誤訊息
    if (errorField) {
      switch (errorField) {
        case 'email':
          email.setErrors([errorMessage])
          break
        case 'employeeId':
          employeeId.setErrors([errorMessage])
          break
        case 'employeeCode':
          employeeCode.setErrors([errorMessage])
          break
        case 'extNumber':
          extNumber.setErrors([errorMessage])
          break
        case 'printNumber':
          printNumber.setErrors([errorMessage])
          break
      }
    }
    
    createSnackbar({
      text: errorMessage || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})
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
</style>
