<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題和操作按鈕區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>輪播圖管理</h3>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  prepend-icon="mdi-image-plus"
                  variant="outlined"
                  color="teal-darken-1"
                  class="me-4"
                  @click="openCreateDialog"
                >
                  新增輪播圖
                </v-btn>
                <v-btn
                  prepend-icon="mdi-sort"
                  variant="outlined"
                  color="blue-grey-darken-2"
                  @click="openSortDialog"
                >
                  排序
                </v-btn>
              </v-col>
              <v-col
                sm="3"
                lg="2"
                xl="1"
                class="pe-1"
              >
                <v-select
                  v-model="searchCriteria.isActive"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="狀態篩選"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                sm="4"
                lg="3"
                xl="2"
              >
                <v-row class="d-flex align-center">
                  <v-col class="d-flex align-center">
                    <v-icon
                      v-if="mdAndUp"
                      v-tooltip:top="'可搜尋標題或描述'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-4"
                    />
                    <v-text-field
                      v-model="searchCriteria.quickSearch"
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
              :items="carousels"
              :loading="tableLoading"
              :page="currentPage"
              :items-length="totalItems"
              class="elevation-0 rounded"
              @update:options="handleTableOptions"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td class="text-center">
                    <v-chip
                      size="small"
                      color="blue-grey"
                      variant="tonal"
                    >
                      {{ item.order || 0 }}
                    </v-chip>
                  </td>
                  <td>
                    <v-avatar

                      size="60"
                      class="rounded-lg my-2"
                    >
                      <v-img
                        :src="item.image"
                        :alt="item.title"
                        cover
                        @error="handleImageError"
                      />
                    </v-avatar>
                  </td>
                  <td>
                    <div
                      class="text-truncate"
                      style="max-width: 200px;"
                    >
                      {{ item.title }}
                    </div>
                  </td>
                  <td>
                    <div
                      class="text-truncate"
                      style="max-width: 200px;"
                    >
                      {{ item.description || '無' }}
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getStatusColor(item)"
                      size="small"
                    >
                      {{ getStatusText(item) }}
                    </v-chip>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ formatDateOnly(item.startDate) }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTimeOnly(item.startDate) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ formatDateOnly(item.endDate) }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTimeOnly(item.endDate) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center gap-1">
                      <v-btn
                        icon
                        size="small"
                        color="blue"
                        variant="text"
                        @click="editCarousel(item)"
                      >
                        <v-icon size="18">
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                      <v-btn
                        v-if="!isExpired(item)"
                        icon
                        size="small"
                        :color="item.isActive ? 'orange' : 'green'"
                        variant="text"
                        @click="toggleActive(item)"
                      >
                        <v-icon size="18">
                          {{ item.isActive ? 'mdi-pause' : 'mdi-play' }}
                        </v-icon>
                      </v-btn>
                      <v-btn
                        v-else
                        icon
                        size="small"
                        color="grey-darken-4"
                        variant="text"
                        disabled
                      >
                        <v-icon size="18">
                          mdi-clock-alert
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="red"
                        variant="text"
                        @click="deleteCarousel(item)"
                      >
                        <v-icon size="18">
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯輪播圖對話框 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-image-plus"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ isEditing ? '編輯輪播圖' : '新增輪播圖' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeCreateDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="formRef"
            @submit.prevent="handleSubmit"
          >
            <v-row>
              <!-- 圖片上傳 -->
              <v-col cols="12">
                <v-file-input
                  v-model="image.value.value"
                  :error-messages="image.meta.touched ? image.errorMessage.value : []"
                  label="輪播圖片 *"
                  variant="outlined"
                  density="compact"
                  accept="image/*"
                  prepend-icon="mdi-image"
                  show-size
                  counter
                />
              </v-col>

              <!-- 標題 -->
              <v-col cols="12">
                <v-text-field
                  v-model="title.value.value"
                  :error-messages="title.meta.touched ? title.errorMessage.value : []"
                  label="標題"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <!-- 描述 -->
              <v-col cols="12">
                <v-textarea
                  v-model="description.value.value"
                  :error-messages="description.meta.touched ? description.errorMessage.value : []"
                  label="描述"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  counter="200"
                />
              </v-col>

              <!-- 連結 -->
              <v-col cols="12">
                <v-text-field
                  v-model="link.value.value"
                  :error-messages="link.meta.touched ? link.errorMessage.value : []"
                  label="連結網址"
                  variant="outlined"
                  density="compact"
                  placeholder="https://example.com"
                />
              </v-col>

              <!-- 排序 -->
              <v-col cols="6">
                <v-text-field
                  v-model.number="order.value.value"
                  :error-messages="order.meta.touched ? order.errorMessage.value : []"
                  label="排序"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="1"
                />
              </v-col>

              <!-- 狀態 -->
              <v-col cols="6">
                <v-switch
                  v-model="isActive.value.value"
                  label="啟用狀態"
                  color="green"
                  hide-details
                />
              </v-col>

              <!-- 開始時間 -->
              <v-col cols="6">
                <v-text-field
                  v-model="startDateTime.value.value"
                  :error-messages="startDateTime.meta.touched ? startDateTime.errorMessage.value : []"
                  label="開始時間"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-calendar-clock"
                  hide-details
                  clearable
                />
              </v-col>

              <!-- 結束時間 -->
              <v-col cols="6">
                <v-text-field
                  v-model="endDateTime.value.value"
                  :error-messages="endDateTime.meta.touched ? endDateTime.errorMessage.value : []"
                  label="結束時間"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-calendar-clock"
                  hide-details
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-1">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeCreateDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            {{ isEditing ? '更新' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 排序管理對話框 -->
    <v-dialog
      v-model="showSortDialog"
      max-width="400"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-sort"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">輪播圖排序</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="showSortDialog = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <div class="text-subtitle-1 mb-4">
            拖拽調整輪播圖顯示順序
          </div>
          <draggable
            v-model="sortableCarousels"
            item-key="_id"
            class="sortable-list"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element, index }">
              <v-list-item
                :key="element._id"
                class="border rounded mb-2"
              >
                <template #prepend>
                  <div class="drag-handle cursor-move me-2">
                    <v-icon color="grey-darken-1">
                      mdi-drag-vertical
                    </v-icon>
                  </div>
                </template>
                <v-list-item-title>{{ element.title }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="small"
                    color="blue-grey"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="showSortDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-grey-darken-2"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isUpdatingOrder"
            @click="updateOrder"
          >
            更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除輪播圖`"
      :message="`確定要刪除「${selectedCarousel?.title || ''}」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, watch } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import draggable from 'vuedraggable'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

definePage({
  meta: {
    title: '輪播圖管理 | Ystravel',
    login: true,
    permission: 'CAROUSEL_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()

// 響應式資料
const carousels = ref([])
const tableLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)

// 搜尋條件
const searchCriteria = ref({
  isActive: null,
  quickSearch: ''
})

// 狀態選項
const statusOptions = [
  { title: '全部', value: null },
  { title: '啟用', value: true },
  { title: '停用', value: false },
  { title: '已過期', value: 'expired' }
]

// 表格標題
const headers = [
  { title: '排序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '圖片', key: 'image', sortable: false, width: '80px' },
  { title: '標題', key: 'title', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '開始時間', key: 'startDate', sortable: true, width: '120px' },
  { title: '結束時間', key: 'endDate', sortable: true, width: '120px' },
  { title: '操作', key: 'actions', sortable: false, width: '120px', align: 'center' }
]

// 對話框狀態
const showCreateDialog = ref(false)
const showSortDialog = ref(false)
const showDeleteDialog = ref(false)

// 表單驗證
const schema = yup.object({
  title: yup.string().required('請輸入標題'),
  description: yup.string().max(200, '描述不能超過200字'),
  link: yup.string()
    .transform((value) => value === '' ? null : value)
    .url('請輸入有效的網址')
    .nullable(),
  order: yup.number().min(1, '排序必須大於0').required('請輸入排序'),
  image: yup.mixed().when('$isEditing', {
    is: false, // 新增時才需要驗證圖片
    then: (schema) => schema.required('請上傳輪播圖片'),
    otherwise: (schema) => schema.nullable() // 編輯時不強制要求
  }),
  startDateTime: yup.string()
    .transform((value) => value === '' ? null : value)
    .nullable(),
  endDateTime: yup.string()
    .transform((value) => value === '' ? null : value)
    .nullable()
})

const { handleSubmit: validateForm, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    title: '',
    description: '',
    link: '',
    order: 1,
    image: null,
    isActive: true,
    startDateTime: '',
    endDateTime: ''
  }
})

// 表單欄位
const title = useField('title')
const description = useField('description')
const link = useField('link')
const image = useField('image')
const order = useField('order')
const isActive = useField('isActive')
const startDateTime = useField('startDateTime')
const endDateTime = useField('endDateTime')

// 表單資料
const formData = ref({
  _id: null
})

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isUpdatingOrder = ref(false)

// 移除不需要的時間選擇菜單狀態

// 排序相關
const sortableCarousels = ref([])
const selectedCarousel = ref(null)

// 表單引用
const formRef = ref(null)

// 載入輪播圖列表
const loadCarousels = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (searchCriteria.value.isActive !== null) {
      if (searchCriteria.value.isActive === 'expired') {
        params.expired = true
      } else {
        params.isActive = searchCriteria.value.isActive
      }
    }
    if (searchCriteria.value.quickSearch) {
      params.quickSearch = searchCriteria.value.quickSearch
    }

    const response = await apiAuth.get('/carousels', { params })
    carousels.value = response.data.result.data
    totalItems.value = response.data.result.totalItems
  } catch (error) {
    console.error('載入輪播圖錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入輪播圖失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadCarousels()
}

// debounce 搜尋
const debouncedQuickSearch = debounce(() => {
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
  loadCarousels()
}

// 開啟新增對話框
const openCreateDialog = async () => {
  await showCreateForm()
  showCreateDialog.value = true
}

// 新增輪播圖
const showCreateForm = async () => {
  isEditing.value = false

  // 重置表單
  resetForm()

  // 取得目前最大的排序值
  try {
    const response = await apiAuth.get('/carousels/max-order')
    const maxOrder = response.data.result || 0
    order.value.value = maxOrder + 1
  } catch (error) {
    console.error('取得最大排序值錯誤:', error)
    // 如果取得失敗，使用現有列表計算
    const maxOrder = carousels.value.length > 0
      ? Math.max(...carousels.value.map(c => c.order || 0))
      : 0
    order.value.value = maxOrder + 1
  }

  // 設定預設值
  title.value.value = ''
  description.value.value = ''
  link.value.value = ''
  image.value.value = null
  isActive.value.value = true

  // 設定預設的開始時間為當下（台灣時間）
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000 // 轉換為毫秒
  const localTime = new Date(now.getTime() - offset)
  const nowString = localTime.toISOString().slice(0, 16) // 格式: YYYY-MM-DDTHH:MM
  startDateTime.value.value = nowString

  endDateTime.value.value = ''
}

// 編輯輪播圖
const editCarousel = (carousel) => {
  isEditing.value = true

  // 處理開始時間（轉換為本地時間）
  let startDateTimeValue = ''
  if (carousel.startDate) {
    const startDate = new Date(carousel.startDate)
    const offset = startDate.getTimezoneOffset() * 60000 // 轉換為毫秒
    const localStartDate = new Date(startDate.getTime() - offset)
    startDateTimeValue = localStartDate.toISOString().slice(0, 16)
  }

  // 處理結束時間（轉換為本地時間）
  let endDateTimeValue = ''
  if (carousel.endDate) {
    const endDate = new Date(carousel.endDate)
    const offset = endDate.getTimezoneOffset() * 60000 // 轉換為毫秒
    const localEndDate = new Date(endDate.getTime() - offset)
    endDateTimeValue = localEndDate.toISOString().slice(0, 16)
  }

  // 設定表單欄位值
  title.value.value = carousel.title
  description.value.value = carousel.description || ''
  link.value.value = carousel.link || ''
  image.value.value = null // 編輯時不預設圖片，讓用戶重新選擇
  order.value.value = carousel.order
  isActive.value.value = carousel.isActive
  startDateTime.value.value = startDateTimeValue
  endDateTime.value.value = endDateTimeValue

  formData.value = {
    _id: carousel._id // 保存輪播圖 ID
  }
  showCreateDialog.value = true
}

// 提交表單
const handleSubmit = validateForm(async (values) => {
  try {
    isSubmitting.value = true

    const formDataToSend = new FormData()

    // 加入基本資料
    formDataToSend.append('title', values.title)
    formDataToSend.append('description', values.description || '')
    formDataToSend.append('link', values.link || '')
    formDataToSend.append('order', values.order)
    formDataToSend.append('isActive', isActive.value.value)

    // 處理開始時間
    if (values.startDateTime) {
      formDataToSend.append('startDate', new Date(values.startDateTime).toISOString())
    } else {
      formDataToSend.append('startDate', '') // 使用空字串代替 null
    }

    // 處理結束時間
    if (values.endDateTime) {
      formDataToSend.append('endDate', new Date(values.endDateTime).toISOString())
    } else {
      formDataToSend.append('endDate', '') // 使用空字串代替 null
    }

    // 加入圖片檔案（只有當有選擇新圖片時）
    if (values.image) {
      formDataToSend.append('image', values.image)
    }

    let response
    if (isEditing.value) {
      const carouselId = formData.value._id
      response = await apiAuth.patch(`/carousels/${carouselId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await apiAuth.post('/carousels', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closeCreateDialog()
    loadCarousels()
  } catch (error) {
    console.error('提交錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmitting.value = false
  }
})

// 切換啟用狀態
const toggleActive = async (carousel) => {
  try {
    const response = await apiAuth.patch(`/carousels/${carousel._id}/toggle`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    loadCarousels()
  } catch (error) {
    console.error('切換狀態錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '切換狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 刪除輪播圖
const deleteCarousel = (carousel) => {
  selectedCarousel.value = carousel
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true

    const response = await apiAuth.delete(`/carousels/${selectedCarousel.value._id}`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showDeleteDialog.value = false
    loadCarousels()
  } catch (error) {
    console.error('刪除錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isDeleting.value = false
  }
}

// 關閉新增/編輯對話框
const closeCreateDialog = () => {
  showCreateDialog.value = false
  isEditing.value = false

  // 重置表單
  resetForm()

  // 重置額外欄位
  isActive.value.value = true
  startDateTime.value.value = ''
  endDateTime.value.value = ''
  formData.value = {
    _id: null
  }
}

// 載入所有輪播圖用於排序
const loadAllCarouselsForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }
    const response = await apiAuth.get('/carousels', { params })
    return response.data.result.data || []
  } catch (error) {
    console.error('載入輪播圖錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入輪播圖失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return []
  }
}

// 排序管理
const openSortDialog = async () => {
  const allCarousels = await loadAllCarouselsForSort()
  sortableCarousels.value = [...allCarousels].sort((a, b) => a.order - b.order)
  showSortDialog.value = true
}

const updateOrder = async () => {
  try {
    isUpdatingOrder.value = true

    const carousels = sortableCarousels.value.map((item, index) => ({
      id: item._id,
      order: index + 1
    }))

    const response = await apiAuth.patch('/carousels/order/update', { carousels })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showSortDialog.value = false
    loadCarousels()
  } catch (error) {
    console.error('更新順序錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '更新順序失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingOrder.value = false
  }
}

// 圖片錯誤處理
const handleImageError = (event) => {
  event.target.src = '/image/placeholder.png'
}

// 狀態判斷函數
const isExpired = (item) => {
  if (!item.endDate) return false
  const now = new Date()
  const endDate = new Date(item.endDate)
  return endDate < now
}

const getStatusText = (item) => {
  if (isExpired(item)) {
    return '已過期'
  }
  return item.isActive ? '啟用' : '停用'
}

const getStatusColor = (item) => {
  if (isExpired(item)) {
    return 'orange-darken-1'
  }
  return item.isActive ? 'green-darken-1' : 'grey-darken-1'
}

// 格式化日期（僅日期）
const formatDateOnly = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 格式化時間（僅時間）
const formatTimeOnly = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 監聽搜尋條件變化
watch(() => searchCriteria.value.quickSearch, (newVal) => {
  debouncedQuickSearch(newVal)
})

watch(() => searchCriteria.value.isActive, () => {
  currentPage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
})


// 組件掛載時載入資料
onMounted(() => {
  loadCarousels()
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

.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 拖拉排序樣式 */
.sortable-list {
  min-height: 100px;
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
}

.drag-handle:hover {
  background-color: #e0e0e0;
}

.ghost-item {
  opacity: 0.5;
  background-color: #e3f2fd;
  border: 2px dashed #2196f3;
}

.chosen-item {
  background-color: #c9c9c9;
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cursor-move {
  cursor: move;
}

</style>
