<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題和操作按鈕區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>共享資源管理</h3>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  prepend-icon="mdi-folder-plus-outline"
                  variant="outlined"
                  color="teal-darken-1"
                  class="me-4"
                  @click="openCreateDialog"
                >
                  新增共享資源
                </v-btn>
                <v-btn
                  prepend-icon="mdi-sort"
                  color="blue-grey-darken-2"
                  variant="outlined"
                  @click="openSortDialog"
                >
                  排序
                </v-btn>
              </v-col>
              <v-col
                sm="3"
                lg="2"
                xl="2"
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
                sm="3"
                lg="2"
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
              >
                <v-row class="d-flex align-center">
                  <v-col class="d-flex align-center">
                    <v-icon
                      v-if="mdAndUp"
                      v-tooltip:top="'可搜尋名稱或描述'"
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
              :items="resources"
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
                    <div class="d-flex align-center">
                      <div
                        class="text-truncate"
                        style="max-width: 200px;"
                      >
                        {{ item.name }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getFileTypeColor(item.type)"
                      size="small"
                    >
                      {{ getTypeText(item.type) }}
                    </v-chip>
                  </td>
                  <td>
                    <div
                      class="text-truncate"
                      style="max-width: 150px;"
                    >
                      {{ item.description || '-' }}
                    </div>
                  </td>
                  <td>{{ formatFileSize(item.file?.size) }}</td>
                  <td>{{ item.downloadCount || 0 }}</td>
                  <td>
                    <v-chip
                      :color="item.isActive ? 'green-darken-1' : 'grey-darken-1'"
                      size="small"
                    >
                      {{ item.isActive ? '啟用' : '停用' }}
                    </v-chip>
                  </td>
                  <td>{{ item.creator?.name || '未知' }}</td>
                  <td>
                    <div class="d-flex align-center gap-1">
                      <v-btn
                        icon
                        size="small"
                        color="blue"
                        variant="text"
                        @click="editResource(item)"
                      >
                        <v-icon size="18">
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                      <v-btn
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
                        icon
                        size="small"
                        color="red"
                        variant="text"
                        @click="deleteResource(item)"
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
          <span class="card-title text-white">共享資源排序</span>
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
            拖拽調整共享資源顯示順序
          </div>
          <draggable
            v-model="sortableResources"
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
                <v-list-item-title>{{ element.name }}</v-list-item-title>
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

    <!-- 新增/編輯共享資源對話框 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="800"
      persistent
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-folder-plus-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ isEditing ? '編輯共享資源' : '新增共享資源' }}</span>
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
              <!-- 檔案名稱 -->
              <v-col
                cols="12"
                md="8"
              >
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.meta.touched ? name.errorMessage.value : []"
                  label="檔案名稱 *"
                  variant="outlined"
                  density="compact"
                  counter="200"
                  clearable
                />
              </v-col>

              <!-- 排序順序 -->
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="order.value.value"
                  :error-messages="order.meta.touched ? order.errorMessage.value : []"
                  label="排序順序"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hint="數字越小越靠前"
                />
              </v-col>

              <!-- 描述 -->
              <v-col cols="12">
                <v-textarea
                  v-model="description.value.value"
                  label="描述"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  counter="500"
                  clearable
                />
              </v-col>

              <!-- 是否啟用 -->
              <v-col
                cols="12"
                md="6"
                class="ms-3"
              >
                <v-switch
                  v-model="isActive.value.value"
                  label="啟用狀態"
                  color="green"
                  density="compact"
                  hide-details
                />
              </v-col>

              <!-- 檔案上傳 -->
              <v-col cols="12">
                <v-file-input
                  v-model="file.value.value"
                  :label="isEditing ? '更換檔案（選填）' : '檔案 *'"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-paperclip"
                  show-size
                  :error-messages="file.meta.touched && !isEditing && !file.value.value ? ['請選擇檔案'] : []"
                />
              </v-col>

              <!-- 現有檔案資訊（編輯模式） -->
              <v-col
                v-if="isEditing && existingFile"
                cols="12"
              >
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-0"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :color="getFileTypeColor(existingFile.type)"
                      size="24"
                      class="me-3"
                    >
                      {{ getFileTypeIcon(existingFile.type) }}
                    </v-icon>
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        目前檔案
                      </div>
                      <div class="text-caption">
                        {{ existingFile.originalName }} ({{ formatFileSize(existingFile.size) }})
                      </div>
                    </div>
                  </div>
                </v-alert>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
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

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除共享資源`"
      :message="`確定要刪除「${selectedResource?.name || ''}」嗎？此操作無法復原。`"
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
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import draggable from 'vuedraggable'

definePage({
  meta: {
    title: '共享資源管理 | TEST',
    login: true,
    permission: 'SHARED_RESOURCE_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()

// 響應式資料
const resources = ref([])
const tableLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)

// 搜尋條件
const searchCriteria = ref({
  type: null,
  isActive: null,
  quickSearch: ''
})

// 檔案類型選項
const typeOptions = [
  { title: '全部', value: null },
  { title: 'PDF', value: 'pdf' },
  { title: 'Word', value: 'word' },
  { title: 'Excel', value: 'excel' },
  { title: 'PowerPoint', value: 'powerpoint' },
  { title: '圖片', value: 'image' },
  { title: '壓縮檔', value: 'zip' },
  { title: '其他', value: 'other' }
]

// 狀態選項
const statusOptions = [
  { title: '全部', value: null },
  { title: '啟用', value: true },
  { title: '停用', value: false }
]

// 表格標題
const headers = [
  { title: '排序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '檔案名稱', key: 'name', sortable: true },
  { title: '類型', key: 'type', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '大小', key: 'file.size', sortable: true },
  { title: '下載次數', key: 'downloadCount', sortable: true },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: '120px', align: 'center' }
]

// 對話框狀態
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showSortDialog = ref(false)
const sortableResources = ref([])
const isUpdatingOrder = ref(false)

// 表單驗證
const schema = yup.object({
  name: yup.string().required('請輸入檔案名稱').max(200, '名稱不能超過200字'),
  description: yup.string().max(500, '描述不能超過500字'),
  order: yup.number().min(0, '排序順序不能小於0'),
  file: yup.mixed().nullable()
})

const { handleSubmit: validateForm, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    name: '',
    description: '',
    order: 0,
    isActive: true,
    file: null
  }
})

// 表單欄位
const name = useField('name')
const description = useField('description')
const order = useField('order')
const isActive = useField('isActive')
const file = useField('file')

// 現有檔案（編輯模式）
const existingFile = ref(null)

// 表單資料
const formData = ref({
  _id: null
})

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedResource = ref(null)

// 表單引用
const formRef = ref(null)

// 載入共享資源列表
const loadResources = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (searchCriteria.value.type) {
      params.type = searchCriteria.value.type
    }
    if (searchCriteria.value.isActive !== null) {
      params.isActive = searchCriteria.value.isActive
    }
    if (searchCriteria.value.quickSearch) {
      params.search = searchCriteria.value.quickSearch
    }

    const response = await apiAuth.get('/sharedResources', { params })
    resources.value = response.data.result.data
    totalItems.value = response.data.result.totalItems
  } catch (error) {
    console.error('載入共享資源錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入共享資源失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadResources()
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
  loadResources()
}

// 開啟新增對話框
const openCreateDialog = async () => {
  await showCreateForm()
  showCreateDialog.value = true
}

// 新增共享資源
const showCreateForm = async () => {
  isEditing.value = false

  // 重置表單
  resetForm()

  // 取得目前最大的排序值
  try {
    const response = await apiAuth.get('/sharedResources/max-order')
    const maxOrder = response.data.result || 0
    order.value.value = maxOrder + 1
  } catch (error) {
    console.error('取得最大排序值錯誤:', error)
    // 如果取得失敗，使用現有列表計算
    const maxOrder = resources.value.length > 0
      ? Math.max(...resources.value.map(r => r.order || 0))
      : 0
    order.value.value = maxOrder + 1
  }

  // 設定預設值
  name.value.value = ''
  description.value.value = ''
  isActive.value.value = true
  file.value.value = null
  existingFile.value = null
}

// 編輯共享資源
const editResource = (resource) => {
  isEditing.value = true

  // 設定表單欄位值
  name.value.value = resource.name
  description.value.value = resource.description || ''
  order.value.value = resource.order
  isActive.value.value = resource.isActive
  file.value.value = null

  // 設定現有檔案
  existingFile.value = {
    ...resource.file,
    type: resource.type
  }

  formData.value = {
    _id: resource._id
  }
  showCreateDialog.value = true
}

// 提交表單
const handleSubmit = validateForm(async (values) => {
  try {
    isSubmitting.value = true

    const formDataToSend = new FormData()

    // 加入基本資料
    formDataToSend.append('name', values.name)
    formDataToSend.append('description', values.description || '')
    formDataToSend.append('order', values.order)
    formDataToSend.append('isActive', isActive.value.value)

    // 加入檔案（只有當有選擇新檔案時）
    // v-file-input 返回的是數組，需要檢查並取第一個檔案
    const fileToUpload = Array.isArray(values.file) ? values.file[0] : values.file

    console.log('檔案資料:', values.file)
    console.log('要上傳的檔案:', fileToUpload)

    if (fileToUpload && fileToUpload instanceof File) {
      formDataToSend.append('file', fileToUpload)
    } else if (!isEditing.value) {
      // 新增模式下必須上傳檔案
      createSnackbar({
        text: '請選擇要上傳的檔案',
        snackbarProps: { color: 'orange-darken-1' }
      })
      isSubmitting.value = false
      return
    }

    let response
    if (isEditing.value) {
      const resourceId = formData.value._id
      response = await apiAuth.patch(`/sharedResources/${resourceId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await apiAuth.post('/sharedResources', formDataToSend, {
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
    loadResources()
  } catch (error) {
    console.error('提交錯誤:', error)
    console.error('錯誤詳情:', error.response?.data)
    console.error('請求配置:', error.config)
    createSnackbar({
      text: error.response?.data?.message || error.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmitting.value = false
  }
})

// 載入所有共享資源用於排序
const loadAllResourcesForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }
    const response = await apiAuth.get('/sharedResources', { params })
    return response.data.result.data || []
  } catch (error) {
    console.error('載入共享資源錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入共享資源失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return []
  }
}

// 排序管理
const openSortDialog = async () => {
  const allResources = await loadAllResourcesForSort()
  sortableResources.value = [...allResources].sort((a, b) => (a.order || 0) - (b.order || 0))
  showSortDialog.value = true
}

const updateOrder = async () => {
  try {
    isUpdatingOrder.value = true

    const sharedResourcesData = sortableResources.value.map((item, index) => ({
      id: item._id,
      order: index + 1
    }))

    const response = await apiAuth.patch('/sharedResources/order/update', { sharedResources: sharedResourcesData })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showSortDialog.value = false
    await loadResources()
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

// 切換啟用狀態
const toggleActive = async (resource) => {
  try {
    const response = await apiAuth.patch(`/sharedResources/${resource._id}`, {
      isActive: !resource.isActive
    })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    loadResources()
  } catch (error) {
    console.error('切換狀態錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '切換狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 刪除共享資源
const deleteResource = (resource) => {
  selectedResource.value = resource
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true

    const response = await apiAuth.delete(`/sharedResources/${selectedResource.value._id}`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showDeleteDialog.value = false
    loadResources()
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
  existingFile.value = null
  isActive.value.value = true
  order.value.value = 0
  formData.value = {
    _id: null
  }
}

// 取得檔案類型文字
const getTypeText = (type) => {
  const typeMap = {
    pdf: 'PDF',
    word: 'Word',
    excel: 'Excel',
    powerpoint: 'PowerPoint',
    image: '圖片',
    zip: '壓縮檔',
    other: '其他'
  }
  return typeMap[type] || type
}

// 取得檔案類型圖標
const getFileTypeIcon = (type) => {
  switch (type) {
    case 'pdf': return 'mdi-file-pdf-box'
    case 'word': return 'mdi-file-word-box'
    case 'excel': return 'mdi-file-excel-box'
    case 'powerpoint': return 'mdi-file-powerpoint-box'
    case 'image': return 'mdi-file-image'
    case 'zip': return 'mdi-folder-zip'
    default: return 'mdi-file-document'
  }
}

// 取得檔案類型顏色
const getFileTypeColor = (type) => {
  switch (type) {
    case 'pdf': return 'red'
    case 'word': return 'blue'
    case 'excel': return 'green'
    case 'powerpoint': return 'orange'
    case 'image': return 'purple'
    case 'zip': return 'amber'
    default: return 'grey'
  }
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 監聽搜尋條件變化
watch(() => searchCriteria.value.quickSearch, (newVal) => {
  debouncedQuickSearch(newVal)
})

watch(() => searchCriteria.value.type, () => {
  currentPage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
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
  loadResources()
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

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 排序對話框樣式
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

