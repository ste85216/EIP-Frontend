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
              >
                <v-card-text class="text-center pb-3 px-2">
                  <div class="sub-title mb-2">
                    {{ category.name }}
                  </div>
                  <div class="sub-title text-red-darken-3">
                    {{ getCategoryCount(category._id) }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-col>



      <!-- 表格區塊 -->
      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  color="deep-purple-darken-4"
                  variant="outlined"
                  prepend-icon="mdi-cog"
                  class="me-4"
                  :size="buttonSize"
                  @click="openCategoryDialog"
                >
                  硬體類型管理
                </v-btn>

                <v-btn
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  color="deep-purple-darken-4"
                  @click="openDialog(null)"
                >
                  新增維修記錄
                </v-btn>
              </v-col>
              <!-- 篩選區塊 -->
              <v-col
                cols="6"
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
                    class="d-flex align-center"
                  >
                    <v-btn
                      color="cyan-darken-2"
                      :size="buttonSize"
                      class="me-4"
                      @click="handleSearch"
                    >
                      搜尋
                    </v-btn>
                    <v-btn
                      color="grey-darken-1"
                      :size="buttonSize"
                      @click="handleReset"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                md="3"
                xl="2"
                class="d-flex align-center"
              >
                <v-icon
                  v-if="mdAndUp"
                  v-tooltip:start="'可搜尋問題內容、處理結果、報修人、備註'"
                  icon="mdi-information"
                  size="small"
                  color="deep-purple-darken-4"
                  class="me-4"
                />
                <v-text-field
                  v-model="quickSearchText"
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
                  <td>{{ formatDate(item.maintenanceDate) }}</td>
                  <td>{{ getCategoryName(item.hardwareCategory) }}</td>
                  <td>{{ item.maintenanceContent }}</td>
                  <td>{{ item.maintenanceResult }}</td>
                  <td>{{ item.reportUser }}</td>
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
    >
      <v-form
        ref="maintenanceFormRef"
        :disabled="isSubmitting"
        @submit.prevent="submitMaintenance"
      >
        <v-card class="rounded-lg px-4 py-6">
          <div class="card-title px-4 py-3">
            {{ dialog.id ? '編輯維修記錄' : '新增維修記錄' }}
          </div>

          <v-card-text class="mt-3 pa-3">
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
                <v-text-field
                  v-model="reportUser.value.value"
                  :error-messages="reportUser.errorMessage.value"
                  label="報修人"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="maintenanceContent.value.value"
                  :error-messages="maintenanceContent.errorMessage.value"
                  label="*問題內容"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="maintenanceResult.value.value"
                  :error-messages="maintenanceResult.errorMessage.value"
                  label="*處理結果"
                  variant="outlined"
                  density="compact"
                  rows="3"
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
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-3 mt-4">
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
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteDialog.open"
      title="確認刪除維修記錄"
      :message="'確定要刪除此維修記錄嗎？此操作無法復原。'"
      @confirm="deleteRecord"
    />

    <!-- 硬體類型管理對話框 -->
    <v-dialog
      v-model="categoryDialog.open"
      persistent
      max-width="900"
    >
      <v-card class="rounded-lg px-8 pt-4 pb-6">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          硬體類型管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeCategoryDialog"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2">
                  現有硬體類型
                </v-col>
              </v-row>
              <div class="mb-8 mt-4">
                <v-chip
                  v-for="category in categories"
                  :key="category._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ category.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditCategory(category)"
                      >
                        <v-icon
                          icon="mdi-pencil"
                          size="16"
                          color="light-blue-darken-4"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >編輯</span>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        color="red-lighten-1"
                        @click="confirmDeleteCategory(category)"
                      >
                        <v-icon
                          icon="mdi-delete"
                          size="16"
                          color="red-lighten-1"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >刪除</span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增硬體類型
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitCategory">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="categoryForm.name"
                      :error-messages="categoryErrors.name"
                      label="類型名稱*"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>
                <v-card-actions class="pa-0 mt-2">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    size="small"
                    :loading="isSubmitting"
                    class="ms-2"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯硬體類型對話框 -->
    <v-dialog
      v-model="editCategoryDialog.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg py-3 px-2">
        <v-card-title class="card-title px-6 py-3">
          編輯硬體類型
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEditCategory">
            <v-text-field
              v-model="editCategoryDialog.name"
              :error-messages="editCategoryErrors.name"
              label="類型名稱*"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-text-field
              v-model="editCategoryDialog.order"
              :error-messages="editCategoryErrors.order"
              label="排序順序*"
              type="number"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey"
                variant="outlined"
                @click="closeEditCategoryDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="isSubmitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 硬體類型刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteCategoryDialog.open"
      title="確認刪除硬體類型"
      :message="`確定要刪除硬體類型「<span class='text-pink-lighten-1' style='font-weight: 800;'>${deleteCategoryDialog.name}</span>」嗎？此操作無法復原`"
      :expected-name="deleteCategoryDialog.name"
      input-label="硬體類型名稱"
      @confirm="deleteCategory"
    />
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
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import UserRole from '@/enums/UserRole.js'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '硬體維修記錄 | GInternational',
    login: true,
    roles: [UserRole.ADMIN]
  }
})

// ===== API 與工具初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp } = useDisplay()

// ===== 響應式變數 =====
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => {
  if (mdAndUp.value) return '600'
  if (smAndUp.value) return '400'
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
const reportUser = useField('reportUser')
const note = useField('note')

// ===== 表格相關設定 =====
const tableHeaders = [
  { title: '維修日期', align: 'start', sortable: true, key: 'maintenanceDate' },
  { title: '硬體類型', align: 'start', sortable: true, key: 'hardwareCategory' },
  { title: '問題內容', align: 'start', sortable: true, width: '300', key: 'maintenanceContent' },
  { title: '處理結果', align: 'start', sortable: true, width: '300', key: 'maintenanceResult' },
  { title: '報修人', align: 'start', sortable: true, key: 'reportUser' },
  { title: '備註', align: 'start', sortable: true, key: 'note' },
  { title: '操作', align: 'center', sortable: false, key: 'actions' }
]

const tableItemsPerPage = ref(10)
const tableSortBy = ref([{ key: 'maintenanceDate', order: 'desc' }])
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
const categoryDialog = ref({
  open: false
})

const editCategoryDialog = ref({
  open: false,
  id: '',
  name: '',
  order: 0
})

const deleteCategoryDialog = ref({
  open: false,
  id: '',
  name: ''
})

const categoryForm = ref({
  name: '',
  order: ''
})

const categoryErrors = ref({
  name: '',
  order: ''
})

const editCategoryErrors = ref({
  name: '',
  order: ''
})

// ===== 表單初始化 =====
const isSubmitting = ref(false)

// ===== 資料載入與更新方法 =====
const loadStats = async () => {
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
  await Promise.all([
    tableLoadItems(),
    loadStats()
  ])
}

// ===== 硬體類型管理方法 =====
const loadCategories = async () => {
  try {
    const { data } = await apiAuth.get('/hardware/categories/search')
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

const openCategoryDialog = async () => {
  try {
    categoryDialog.value.open = true
    // 重置表單
    resetCategoryForm()
    // 獲取最大順序
    const { data } = await apiAuth.get('/hardware/categories/max-order')
    if (data.success) {
      categoryForm.value.order = data.result
    }
    await loadCategories()
  } catch (error) {
    console.error('開啟類型管理對話框失敗:', error)
    createSnackbar({
      text: '載入類型資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const closeCategoryDialog = () => {
  categoryDialog.value.open = false
  // 重置所有表單狀態
  resetCategoryForm()
  categoryErrors.value = {
    name: '',
    order: ''
  }
  editCategoryErrors.value = {
    name: '',
    order: ''
  }
  editCategoryDialog.value = {
    open: false,
    id: '',
    name: '',
    order: 0
  }
}

const openEditCategory = (category) => {
  editCategoryDialog.value = {
    open: true,
    id: category._id,
    name: category.name,
    order: category.order
  }
  editCategoryErrors.value = {
    name: '',
    order: ''
  }
}

const closeEditCategoryDialog = () => {
  editCategoryDialog.value = {
    open: false,
    id: '',
    name: '',
    order: 0
  }
  editCategoryErrors.value = {
    name: '',
    order: ''
  }

}

const confirmDeleteCategory = (category) => {
  deleteCategoryDialog.value = {
    open: true,
    id: category._id,
    name: category.name
  }
}

const submitCategory = async () => {
  // 重置錯誤訊息
  categoryErrors.value = {
    name: '',
    order: ''
  }

  // 檢查名稱欄位
  let hasError = false
  if (!categoryForm.value.name) {
    categoryErrors.value.name = '請輸入類型名稱'
    hasError = true
  }

  if (hasError) return

  isSubmitting.value = true
  try {
    // 先獲取最大順序
    const { data: maxOrderData } = await apiAuth.get('/hardware/categories/max-order')
    if (!maxOrderData.success) {
      throw new Error('獲取最大順序失敗')
    }

    // 新增類別
    const { data } = await apiAuth.post('/hardware/categories', {
      name: categoryForm.value.name.trim(),
      order: maxOrderData.result
    })

    if (data.success) {
      createSnackbar({
        text: '新增硬體類型成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 重置表單
      categoryForm.value = {
        name: '',
        order: ''
      }
      categoryErrors.value = {
        name: '',
        order: ''
      }
      await loadCategories()
    }
  } catch (error) {
    console.error('新增失敗:', error.response?.data)
    // 如果是後端回傳的特定欄位錯誤
    if (error.response?.data?.validationError) {
      const validationErrors = error.response.data.validationError
      Object.keys(validationErrors).forEach(key => {
        categoryErrors.value[key] = validationErrors[key].message
      })
    } else {
      // 一般錯誤訊息
      createSnackbar({
        text: error.response?.data?.message || '新增失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const submitEditCategory = async () => {
  // 驗證所有必填欄位
  const errors = {
    name: '',
    order: ''
  }

  if (!editCategoryDialog.value.name) errors.name = '請輸入類型名稱'
  if (!editCategoryDialog.value.order) errors.order = '請輸入排序順序'

  // 如果有任何錯誤
  if (Object.values(errors).some(error => error)) {
    editCategoryErrors.value = errors
    return
  }

  isSubmitting.value = true
  try {
    const formData = {
      name: editCategoryDialog.value.name,
      order: parseInt(editCategoryDialog.value.order, 10)
    }

    const { data } = await apiAuth.patch(`/hardware/categories/${editCategoryDialog.value.id}`, formData)

    if (data.success) {
      createSnackbar({
        text: '修改硬體類型成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditCategoryDialog()
      // 重置新增表單的狀態
      resetCategoryForm()
      categoryErrors.value = {
        name: '',
        order: ''
      }
      await loadCategories()
    }
  } catch (error) {
    editCategoryErrors.value = {
      name: error.response?.data?.message || '修改失敗',
      order: ''
    }
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  try {
    // 先檢查是否有維修記錄使用此硬體類型
    const { data: checkData } = await apiAuth.get(`/hardware/maintenance-records/check-category/${deleteCategoryDialog.value.id}`)
    
    if (checkData.success && checkData.result.inUse) {
      createSnackbar({
        text: `此硬體類型已被 ${checkData.result.count} 筆維修記錄使用中，無法刪除`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      deleteCategoryDialog.value = {
        open: false,
        id: '',
        name: ''
      }
      return
    }

    // 如果沒有被使用，才執行刪除
    const { data } = await apiAuth.delete(`/hardware/categories/${deleteCategoryDialog.value.id}`)
    if (data.success) {
      createSnackbar({
        text: '刪除硬體類型成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 從本地列表中移除被刪除的類型
      categories.value = categories.value.filter(
        category => category._id !== deleteCategoryDialog.value.id
      )
      // 如果當前選中的類型被刪除，清空選擇
      if (filters.value.hardwareCategory === deleteCategoryDialog.value.id) {
        filters.value.hardwareCategory = null
      }
      // 關閉刪除對話框
      deleteCategoryDialog.value = {
        open: false,
        id: '',
        name: ''
      }
      // 重新載入類別列表
      await loadCategories()
    }
  } catch (error) {
    let errorMessage = '刪除失敗'
    // 處理特定的錯誤情況
    if (error.response?.status === 409) {
      errorMessage = '此硬體類型有維修記錄使用中，無法刪除'
    } else {
      errorMessage = error.response?.data?.message || '刪除失敗'
    }
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 監聽器 =====
const debouncedSearch = debounce(() => {
  refreshData()
}, 300)

watch(quickSearchText, () => {
  debouncedSearch()
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
  await loadCategories()
  await loadStats()
  await refreshData()
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
        note: ''
      }
    })
  }
}

const closeDialog = () => {
  dialog.value.open = false
  resetForm()
}

const resetCategoryForm = () => {
  categoryForm.value = {
    name: '',
    order: ''
  }
  categoryErrors.value = {
    name: '',
    order: ''
  }
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
const handleSearch = () => {
  refreshData()
}

const handleReset = () => {
  filters.value.maintenanceDateRange = []
  filters.value.hardwareCategory = null
  quickSearchText.value = ''
  refreshData()
}
</script>

<style lang="scss" scoped>
.v-data-table {
  :deep(thead) {
    background-color: #455A64;
    color: white;
  }
  :deep(tbody) {
    tr:nth-child(even) {
      background-color: #fafaf3;
    }
    tr:nth-child(odd) {
      background-color: #f2f8fc;
    }
  }
}

</style>