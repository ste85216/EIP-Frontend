<template>
  <v-container
    max-width="880"
  >
    <v-row
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <!-- 標題區塊 -->
      <v-col 
        cols="12"
        class="ps-3 pb-3 d-flex align-center"
      >
        <h3
          class="d-inline"
        >
          硬體類型管理
        </h3>
        <div
          style="width: 260px;"
          class="ms-auto d-flex align-center"
        >
          <v-icon
            v-tooltip:start="'可搜尋各類型名稱'"
            icon="mdi-information"
            size="small"
            color="blue-grey-darken-2"
            class="me-2"
          />
          <v-text-field
            v-model="quickSearchText"
            label="搜尋"
            append-inner-icon="mdi-magnify"
            :loading="isLoading"
            base-color="#666"
            color="blue-grey-darken-3"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </v-col>

      <!-- 表格區塊 -->
      <v-col
        cols="12"
        class="mt-4"
      >
        <v-row class="d-flex justify-space-between">
          <!-- 硬體設備清單類型 -->
          <v-col
            cols="12"
            md="5"
            class="custom-col"
          >
            <v-card
              class="hardware-category-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                硬體類型 (設備)
                <v-btn
                  v-tooltip:start="'新增硬體設備清單類型'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(0)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="equipmentCategories.length > 0">
                  <v-list-item
                    v-for="item in equipmentCategories"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯類型'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[0] > 1">
                <v-pagination
                  v-model="pages[0]"
                  :length="totalPages[0]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(0, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 硬體維修紀錄類型 -->
          <v-col
            cols="12"
            md="5"
            class="custom-col"
          >
            <v-card
              class="hardware-category-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                硬體類型 (維修)
                <v-btn
                  v-tooltip:start="'新增硬體維修紀錄類型'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(1)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="maintenanceCategories.length > 0">
                  <v-list-item
                    v-for="item in maintenanceCategories"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯類型'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[1] > 1">
                <v-pagination
                  v-model="pages[1]"
                  :length="totalPages[1]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(1, page)"
                />
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
    >
      <v-form
        ref="form"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg px-4 pt-7 pb-6">
          <div class="card-title px-4 pb-2 d-flex align-center justify-space-between">
            <span>{{ dialog.id ? '編輯類型' : getDialogTitle }}</span>
            <div
              v-if="!dialog.id"
              class="d-flex align-center"
            >
              <v-btn
                v-tooltip:start="'批量新增項目'"
                icon
                color="grey-darken-1"
                size="22"
                class="me-2"
                @click="openBatchDialog"
              >
                <v-icon 
                  size="14"
                >
                  mdi-plus-box-multiple-outline
                </v-icon>
              </v-btn>
              <v-btn
                v-tooltip:start="'新增項目'"
                icon
                color="grey-darken-1"
                size="22"
                @click="addNewItem"
              >
                <v-icon 
                  size="14"
                >
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </div>
          <v-card-text class="mt-3 pa-3">
            <v-row>
              <template v-if="!dialog.id">
                <!-- 新增模式：支援多個項目 -->
                <v-col 
                  v-for="(item, index) in newItems"
                  :key="index"
                  cols="12"
                >
                  <div class="d-flex align-center item-container">
                    <v-text-field
                      v-model="item.name"
                      :error-messages="item.error"
                      label="*名稱"
                      type="text"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                    />
                    <v-btn
                      v-if="newItems.length > 1"
                      icon="mdi-delete"
                      variant="text"
                      color="red-lighten-1"
                      size="small"
                      class="ms-2"
                      @click="removeItem(index)"
                    />
                  </div>
                </v-col>
              </template>
              <template v-else>
                <!-- 編輯模式：單個項目 -->
                <v-col cols="12">
                  <v-text-field
                    v-model="nameValue"
                    :error-messages="nameError"
                    label="*名稱"
                    type="text"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="orderValue"
                    :error-messages="orderError"
                    label="*排序"
                    variant="outlined"
                    density="compact"
                    hint="輸入想要的順序位置，其他項目會自動調整"
                    persistent-hint
                  />
                </v-col>
              </template>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-3 pt-4">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="dialog.id"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  :size="buttonSize"
                  prepend-icon="mdi-delete"
                  @click="confirmDeleteDialog = true"
                >
                  刪除
                </v-btn>
              </template>
            </v-hover>
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
              :disabled="(dialog.id && !hasChanges) || isSubmitting"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除類型"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || ''"
      input-label="類型名稱"
      @confirm="deleteCategory"
    />

    <!-- 批量新增對話框 -->
    <v-dialog
      v-model="batchDialog.open"
      persistent
      width="300"
    >
      <v-card class="rounded-lg px-4 pt-7 pb-6">
        <v-form @submit.prevent="handleBatchAdd">
          <div class="card-title px-4 pb-2">
            批量新增項目
          </div>
          <v-card-text class="mt-3 pa-3">
            <v-text-field
              v-model="batchDialog.count"
              label="請輸入要總共需要多少項目"
              type="number"
              min="1"
              max="50"
              variant="outlined"
              density="compact"
              :error-messages="batchDialog.error"
              hide-details="auto"
              @keyup.enter="handleBatchAdd"
            />
          </v-card-text>
          <v-card-actions class="px-3 pt-4">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              size="small"
              @click="closeBatchDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-1"
              size="small"
              type="submit"
            >
              確定
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { debounce } from 'lodash'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '硬體類別管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.IT]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const newItems = ref([{ name: '', error: '' }])
const form = ref(null)

// ===== 表單驗證架構 =====
const editSchema = yup.object({
  name: yup.string().required('請輸入名稱'),
  order: yup.string()
    .required('請輸入排序')
    .test('is-number', '排序必須大於0', value => {
      if (!value) return true
      const num = Number(value)
      return !isNaN(num) && num >= 1
    })
})

// ===== 表單初始化 =====
const { handleSubmit: handleEditSubmit } = useForm({
  validationSchema: editSchema
})

// ===== 表單欄位 =====
const { value: nameValue, errorMessage: nameError } = useField('name')
const { value: orderValue, errorMessage: orderError } = useField('order')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: '',
  type: 0
})

const dialogWidth = computed(() => {
  return smAndUp.value ? '360' : '100%'
})

// ===== 資料狀態 =====
const equipmentCategories = ref([])
const maintenanceCategories = ref([])

// ===== 計算屬性 =====
const getDialogTitle = computed(() => {
  const titles = ['新增硬體設備清單類型', '新增硬體維修紀錄類型']
  return titles[dialog.value.type]
})

const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false
  
  return originalData.value.name !== nameValue.value ||
         originalData.value.order !== parseInt(orderValue.value)
})

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')
const isLoading = ref(false)

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  loadData()
}, 300)

// 監聽搜尋文字變化
watch(quickSearchText, () => {
  isLoading.value = true
  // 重置所有分頁到第一頁
  pages.value = {
    0: 1,
    1: 1
  }
  debouncedSearch()
})

// ===== 方法 =====
const loadData = async (type = null) => {
  try {
    isLoading.value = true
    
    // 構建查詢參數
    const params = {
      page0: pages.value[0],
      page1: pages.value[1]
    }
    
    if (quickSearchText.value) {
      params.quickSearch = quickSearchText.value
    }

    const { data } = await apiAuth.get('/hardware/categories/all', { params })
    
    if (data.success) {
      // 根據 type 分類數據
      const typeData = data.result.data.reduce((acc, item) => {
        if (item.type === 0) {
          acc.equipment.push(item)
        } else {
          acc.maintenance.push(item)
        }
        return acc
      }, { equipment: [], maintenance: [] })

      // 如果指定了類型，只更新該類型的數據
      if (type === 0) {
        equipmentCategories.value = typeData.equipment
      } else if (type === 1) {
        maintenanceCategories.value = typeData.maintenance
      } else {
        equipmentCategories.value = typeData.equipment
        maintenanceCategories.value = typeData.maintenance
      }

      // 更新分頁資訊
      totalPages.value = data.result.totalPages
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const openDialog = async (type) => {
  dialog.value = {
    open: true,
    id: '',
    type
  }
  // 重置表單
  if (form.value) {
    form.value.reset()
  }
  nameValue.value = ''
  orderValue.value = ''
  // 重置新增項目列表
  newItems.value = [{ name: '', error: '' }]
}

const editItem = async (item) => {
  try {
    dialog.value = {
      open: true,
      id: item._id,
      type: item.type
    }
    
    nameValue.value = item.name
    orderValue.value = item.order
    originalData.value = { ...item }
  } catch (error) {
    console.error('編輯項目時發生錯誤:', error)
    handleError(error)
  }
}

const closeDialog = () => {
  dialog.value = {
    open: false,
    id: '',
    type: dialog.value.type
  }
  originalData.value = null
  // 重置表單
  if (form.value) {
    form.value.reset()
  }
  nameValue.value = ''
  orderValue.value = ''
  // 重置新增項目列表
  newItems.value = [{ name: '', error: '' }]
}

const validateNewItems = () => {
  let hasError = false
  newItems.value.forEach(item => {
    item.error = ''
    if (!item.name.trim()) {
      item.error = '請輸入名稱'
      hasError = true
    }
  })
  return !hasError
}

const submit = async (e) => {
  e.preventDefault()
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true

    if (dialog.value.id) {
      // 編輯模式
      await handleEditSubmit(async (values) => {
        const submitData = {
          name: values.name,
          type: dialog.value.type,
          order: parseInt(values.order)
        }

        const { data } = await apiAuth.patch(`/hardware/categories/${dialog.value.id}`, submitData)
        if (!data.success) {
          throw new Error(data.message || '更新失敗')
        }

        createSnackbar({
          text: '類型更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })

        closeDialog()
        loadData(dialog.value.type)
      })()
    } else {
      // 新增模式：批量新增
      if (!validateNewItems()) {
        isSubmitting.value = false
        return
      }

      const validItems = newItems.value.filter(item => item.name.trim())
      if (validItems.length === 0) {
        isSubmitting.value = false
        return
      }

      // 獲取最大排序
      const { data: maxOrderData } = await apiAuth.get('/hardware/categories/max-order', {
        params: { type: dialog.value.type }
      })

      if (!maxOrderData.success) {
        throw new Error('獲取排序失敗')
      }

      let currentOrder = maxOrderData.result

      // 批量新增
      for (const item of validItems) {
        const { data } = await apiAuth.post('/hardware/categories', {
          name: item.name.trim(),
          type: dialog.value.type,
          order: currentOrder++
        })

        if (!data.success) {
          throw new Error(data.message || '新增失敗')
        }
      }

      createSnackbar({
        text: '類型新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      closeDialog()
      loadData(dialog.value.type)
    }
  } catch (error) {
    console.error('提交時發生錯誤:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  if (!dialog.value.id) return
  
  try {
    const type = dialog.value.type
    await apiAuth.delete(`/hardware/categories/${dialog.value.id}`)
    createSnackbar({
      text: '類型刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    loadData(type)
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
}

const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    user.logout()
    router.push('/login')
    createSnackbar({
      text: '登入已過期，請重新登入',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } else {
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 分頁相關 =====
const pages = ref({
  0: 1, // 硬體設備清單類型的當前頁碼
  1: 1  // 硬體維修紀錄類型的當前頁碼
})

const totalPages = ref({
  0: 1,
  1: 1
})

const handlePageChange = (type, newPage) => {
  pages.value[type] = newPage
  loadData(type)
}

// ===== 批量新增相關 =====
const batchDialog = ref({
  open: false,
  count: '',
  error: ''
})

const openBatchDialog = () => {
  batchDialog.value = {
    open: true,
    count: '',
    error: ''
  }
}

const closeBatchDialog = () => {
  batchDialog.value.open = false
}

const handleBatchAdd = () => {
  const count = parseInt(batchDialog.value.count)
  if (!count || count < 1 || count > 10) {
    batchDialog.value.error = '請輸入1-10之間的數字'
    return
  }

  batchDialog.value.error = ''
  newItems.value = Array(count).fill(null).map(() => ({
    name: '',
    error: ''
  }))

  closeBatchDialog()
}

// ===== 新增/移除項目 =====
const addNewItem = () => {
  newItems.value.push({ name: '', error: '' })
}

const removeItem = (index) => {
  newItems.value.splice(index, 1)
}

// ===== 監聽器 =====
watch(newItems, (items) => {
  items.forEach(item => {
    if (item.name.trim()) {
      item.error = ''
    }
  })
}, { deep: true })

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped>
.custom-col {
  min-width: 45%;
}

.hardware-category-card {
  border: 1px solid #999;
  .v-list-item {
    padding: 6px 24px;
    transition: background 0.2s;
    &:hover {
      background: #e0e0e0 !important;
    }
  }
  .v-list-item:nth-child(odd) {
    background: #f8fcff;
  }
  .v-list-item:nth-child(even) {
    background: #fffef2;
  }
  .text-grey {
    color: #999;
    font-size: 14px;
  }
  :deep(.v-pagination) {
    .v-pagination__item {
      color: #666;
      &--active {
        background: #4c0079 !important;
        color: white;
      }
    }
  }
  .order-number {
    min-width: 16px;
    height: 16px;
    border-radius: 12px;
    background-color: #666;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
}

.item-container {
  padding: 10px; 
  background: #f9f9f9;
  border: 1px solid #a9a9a9;
  border-radius: 4px;
  :deep(.v-field) {
    background-color: #fff;
  }
}
</style>
