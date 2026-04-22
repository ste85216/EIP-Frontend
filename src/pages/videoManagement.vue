<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題 -->
      <v-col
        cols="12"
        class="ps-3 pb-3"
      >
        <h3>影片管理</h3>
      </v-col>

      <!-- 操作按鈕和搜尋區塊 -->
      <v-col cols="12">
        <v-row class="d-flex align-center">
          <!-- 左邊：操作按鈕 -->
          <v-col
            cols="12"
            sm="auto"
          >
            <v-btn
              v-if="hasCreatePermission"
              prepend-icon="mdi-video-plus"
              variant="outlined"
              color="teal-darken-1"
              class="me-3"
              @click="openCreateDialog"
            >
              新增影片
            </v-btn>
            <v-btn
              v-if="hasUpdatePermission"
              prepend-icon="mdi-sort"
              variant="outlined"
              color="blue-grey-darken-2"
              class="me-3"
              @click="openSortDialog"
            >
              排序
            </v-btn>
            <v-btn
              v-if="hasCategoryManagePermission"
              prepend-icon="mdi-tag-multiple"
              variant="outlined"
              color="blue-grey-darken-2"
              @click="openCategoryDialog"
            >
              管理分類
            </v-btn>
          </v-col>
          <v-spacer />
          <!-- 右邊：分類篩選和快速搜尋 -->
          <v-col
            cols="12"
            sm="auto"
            class="pe-3 ps-2"
          >
            <v-row class="d-flex align-center">
              <v-col
                cols="12"
                sm="auto"
                class="pe-1"
              >
                <v-select
                  v-model="searchCriteria.categories"
                  :items="categoryOptions"
                  item-title="name"
                  item-value="_id"
                  label="分類篩選"
                  variant="outlined"
                  density="compact"
                  hide-details
                  multiple
                  chips
                  closable-chips
                  clearable
                  style="min-width: 200px;"
                />
              </v-col>
              <v-col
                cols="12"
                sm="auto"
              >
                <v-text-field
                  v-model="searchCriteria.quickSearch"
                  :loading="isSearching"
                  placeholder="搜尋影片標題"
                  append-inner-icon="mdi-magnify"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  style="min-width: 200px;"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>

      <!-- 表格區 -->
      <v-col cols="12">
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="videos"
          :loading="tableLoading"
          :items-per-page-options="itemsPerPageOptions"
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
                <div
                  class="text-truncate"
                  style="max-width: 200px;"
                >
                  {{ item.title }}
                </div>
              </td>
              <td>
                <div
                  v-if="item.categories && item.categories.length > 0"
                  class="d-flex flex-wrap gap-1"
                >
                  <v-chip
                    v-for="category in item.categories"
                    :key="category._id || category"
                    size="small"
                    class="me-1"
                    color="blue-grey-darken-1"
                  >
                    {{ category.name || category }}
                  </v-chip>
                </div>
                <span v-else>未分類</span>
              </td>
              <td>{{ item.creator?.name || '未知' }}</td>
              <td>{{ formatDateOnly(item.createdAt) }}</td>
              <td>
                <div class="d-flex align-center gap-1">
                  <v-btn
                    v-if="hasUpdatePermission"
                    icon
                    size="small"
                    color="blue"
                    variant="text"
                    :loading="editingLoadingId === item._id"
                    :disabled="editingLoadingId === item._id"
                    @click="editVideo(item)"
                  >
                    <v-icon size="18">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-if="hasDeletePermission"
                    icon
                    size="small"
                    color="red"
                    variant="text"
                    @click="deleteVideo(item)"
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

    <!-- 新增/編輯影片對話框 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="480"
      persistent
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-video-plus"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ isEditing ? '編輯影片' : '新增影片' }}</span>
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

        <v-progress-linear
          v-if="dialogLoading"
          color="teal-darken-1"
          indeterminate
        />
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="formRef"
            @submit.prevent="handleSubmit"
          >
            <v-row>
              <!-- 影片標題 -->
              <v-col cols="12">
                <v-text-field
                  v-model="title.value.value"
                  :error-messages="title.meta.touched ? title.errorMessage.value : []"
                  label="影片標題 *"
                  variant="outlined"
                  density="compact"
                  counter="200"
                  maxlength="200"
                  clearable
                />
              </v-col>

              <!-- 影片連結 -->
              <v-col cols="12">
                <v-text-field
                  v-model="videoUrl.value.value"
                  :error-messages="videoUrl.meta.touched ? videoUrl.errorMessage.value : []"
                  label="影片連結 *"
                  variant="outlined"
                  density="compact"
                  hint="*重要 : 使用非影片連結的網址，請'使用自訂封面'。"
                  persistent-hint
                  clearable
                />
              </v-col>

              <!-- 分類（多選） -->
              <v-col cols="12">
                <v-select
                  v-model="categories.value.value"
                  :error-messages="categories.meta.touched ? categories.errorMessage.value : []"
                  :items="categoryOptions.filter(c => c._id !== null)"
                  item-title="name"
                  item-value="_id"
                  label="分類 *"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  closable-chips
                  clearable
                  hint="可選擇多個分類"
                  persistent-hint
                />
              </v-col>

              <!-- 影片封面 -->
              <v-col
                cols="12"
                class="pt-1"
              >
                <div class="d-flex flex-column gap-2">
                  <!-- Switch 控制是否使用自訂封面 -->
                  <div
                    class="d-flex align-center mb-3"
                    style="margin-left: 6px;"
                  >
                    <v-switch
                      v-model="useCustomThumbnail"
                      color="teal-darken-1"
                      hide-details
                      density="compact"
                      @update:model-value="handleThumbnailSwitchChange"
                    >
                      <template #label>
                        <span class="sub-title ms-1">使用自訂封面</span>
                      </template>
                    </v-switch>
                  </div>
                  <!-- 顯示當前封面預覽（編輯時） -->
                  <div
                    v-if="useCustomThumbnail && (thumbnailPreview || (currentThumbnailUrl && !thumbnailFile))"
                    class="d-flex align-center px-4 py-2 mb-6 border rounded"
                  >
                    <img
                      :src="thumbnailPreview || currentThumbnailUrl"
                      alt="封面預覽"
                      class="thumbnail-preview-image me-2"
                    >
                    <div class="flex-grow-1">
                      <div class="card-content text-grey-darken-1 ms-4">
                        <template
                          v-if="thumbnailPreview"
                        >
                          {{ currentThumbnailUrl ? '新選擇的封面（ 將覆蓋舊的封面 ）' : '選擇的封面' }}
                        </template>
                        <template v-else>
                          當前封面圖片
                        </template>
                      </div>
                    </div>
                    <v-btn
                      v-if="thumbnailPreview"
                      icon
                      size="small"
                      variant="text"
                      color="grey-darken-1"
                      @click="clearThumbnailFile"
                    >
                      <v-icon size="18">
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </div>
                  <!-- 上傳按鈕 -->
                  <v-file-input
                    ref="thumbnailInputRef"
                    v-model="thumbnailFile"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    label="選擇封面圖片"
                    variant="outlined"
                    density="compact"
                    prepend-icon=""
                    prepend-inner-icon="mdi-image"
                    show-size
                    :disabled="!useCustomThumbnail"
                    @update:model-value="handleThumbnailChange"
                  />
                </div>
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

    <!-- 排序管理對話框 -->
    <v-dialog
      v-model="showSortDialog"
      max-width="900"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-sort"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">影片排序</span>
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
            拖拽調整影片顯示順序
          </div>
          <draggable
            v-model="sortableVideos"
            item-key="_id"
            class="sortable-grid"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element, index }">
              <div class="sortable-item">
                <v-card
                  :key="element._id"
                  class="border rounded px-3 py-2 d-flex align-center"
                  elevation="0"
                >
                  <div class="drag-handle cursor-move me-3 d-flex align-center">
                    <v-icon color="grey-darken-1">
                      mdi-drag-vertical
                    </v-icon>
                  </div>
                  <div class="flex-grow-1 text-truncate">
                    {{ element.title }}
                  </div>
                  <v-chip
                    size="small"
                    color="blue-grey"
                    class="ms-2"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </v-card>
              </div>
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

    <!-- 分類管理對話框 -->
    <CategoryManagementDialog
      v-model="showCategoryDialog"
      @updated="loadCategories"
    />

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除影片`"
      :message="`確定要刪除「${selectedVideo?.title || ''}」嗎？此操作無法復原。`"
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
import { ref, onMounted, watch, computed } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import debounce from 'lodash/debounce'
import { useApi } from '@/composables/axios'
import draggable from 'vuedraggable'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import CategoryManagementDialog from '@/components/VideoCategoryManagementDialog.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { usePermissionStore } from '@/stores/permission'

definePage({
  meta: {
    title: '影片管理 | Ystravel',
    login: true,
    permission: 'EDUCATION_TRAINING_VIDEO_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()
const permissionStore = usePermissionStore()

// 檢查權限
const hasCreatePermission = computed(() => {
  return permissionStore.hasPermission('EDUCATION_TRAINING_VIDEO_CREATE')
})

const hasUpdatePermission = computed(() => {
  return permissionStore.hasPermission('EDUCATION_TRAINING_VIDEO_UPDATE')
})

const hasDeletePermission = computed(() => {
  return permissionStore.hasPermission('EDUCATION_TRAINING_VIDEO_DELETE')
})

const hasCategoryManagePermission = computed(() => {
  return permissionStore.hasPermission('EDUCATION_TRAINING_VIDEO_CATEGORY_MANAGE')
})

// 響應式資料
const videos = ref([])
const categoriesList = ref([])
const tableLoading = ref(false)
const isSearching = ref(false)
const itemsPerPage = ref(20)
const currentPage = ref(1)
const totalItems = ref(0)
const sortBy = ref([{ key: 'order', order: 'asc' }])

// 搜尋條件
const searchCriteria = ref({
  categories: [],
  quickSearch: ''
})

// 分類選項
const categoryOptions = computed(() => {
  return [
    { _id: null, name: '全部' },
    ...categoriesList.value.filter(c => c.isActive)
  ]
})

// 每頁選項（含全部）
const itemsPerPageOptions = [10, 20, 50, 100, { value: -1, title: '全部' }]

// 表格標題
const headers = [
  { title: '排序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '標題', key: 'title', sortable: true },
  { title: '分類', key: 'category', sortable: false },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '建立時間', key: 'createdAt', sortable: true },
  { title: '操作', key: 'actions', sortable: false, width: '120px', align: 'center' }
]

// 對話框狀態
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showCategoryDialog = ref(false)
const showSortDialog = ref(false)
const sortableVideos = ref([])
const isUpdatingOrder = ref(false)

// 表單驗證
const schema = yup.object({
  title: yup.string().required('請輸入影片標題').max(200, '標題不能超過200字'),
  videoUrl: yup.string().required('請輸入影片連結').url('請輸入有效的連結'),
  categories: yup.array().of(yup.string()).min(1, '請至少選擇一個分類').required('請選擇分類'),
  order: yup.number().nullable()
})

const { handleSubmit: validateForm, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    title: '',
    videoUrl: '',
    categories: [],
    order: 0
  }
})

// 表單欄位
const title = useField('title')
const videoUrl = useField('videoUrl')
const categories = useField('categories')

// 表單資料
const formData = ref({
  _id: null
})

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedVideo = ref(null)
const editingLoadingId = ref(null)
const dialogLoading = ref(false)

// 封面相關
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const currentThumbnailUrl = ref(null)
const thumbnailInputRef = ref(null)
const useCustomThumbnail = ref(false) // Switch 控制是否使用自訂封面

// 表單引用
const formRef = ref(null)

// 載入影片列表
const loadVideos = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value === -1 ? (totalItems.value > 0 ? totalItems.value : 999999) : itemsPerPage.value
    }

    // 多分類篩選
    if (searchCriteria.value.categories && searchCriteria.value.categories.length > 0) {
      params.categories = searchCriteria.value.categories.join(',')
    }
    if (searchCriteria.value.quickSearch) {
      params.search = searchCriteria.value.quickSearch
    }

    // 處理排序參數
    if (sortBy.value && sortBy.value.length > 0 && sortBy.value[0].key) {
      params.sortBy = sortBy.value[0].key
      params.sortOrder = sortBy.value[0].order || 'asc'
    } else {
      params.sortBy = 'order'
      params.sortOrder = 'asc'
    }

    const response = await apiAuth.get('/education-training-videos', { params })
    videos.value = response.data.result.data || []
    totalItems.value = response.data.result.totalItems
  } catch (error) {
    console.error('載入影片錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入影片失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 載入分類列表
const loadCategories = async () => {
  try {
    const response = await apiAuth.get('/education-training-video-categories')
    categoriesList.value = response.data.result || []
  } catch (error) {
    console.error('載入分類錯誤:', error)
  }
}

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadVideos()
}

// debounce 搜尋
const debouncedQuickSearch = debounce(async () => {
  currentPage.value = 1
  tableLoading.value = true
  await performSearch()
  tableLoading.value = false
  isSearching.value = false
}, 300)

// 表格選項變更
const handleTableOptions = (options) => {
  if (options.itemsPerPage !== undefined) {
    itemsPerPage.value = options.itemsPerPage
    if (options.itemsPerPage === -1) {
      currentPage.value = 1
    }
  }
  if (options.page !== undefined && options.itemsPerPage !== -1) {
    currentPage.value = options.page
  }
  if (options.sortBy !== undefined) {
    sortBy.value = options.sortBy
  }
  loadVideos()
}

// 開啟新增對話框
const openCreateDialog = async () => {
  await showCreateForm()
  showCreateDialog.value = true
}

// 開啟分類管理對話框
const openCategoryDialog = () => {
  showCategoryDialog.value = true
}

// 載入所有影片用於排序
const loadAllVideosForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }
    const response = await apiAuth.get('/education-training-videos', { params })
    return response.data.result.data || []
  } catch (error) {
    console.error('載入影片錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入影片失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return []
  }
}

// 排序管理
const openSortDialog = async () => {
  const allVideos = await loadAllVideosForSort()
  sortableVideos.value = [...allVideos].sort((a, b) => (a.order || 0) - (b.order || 0))
  showSortDialog.value = true
}

const updateOrder = async () => {
  try {
    isUpdatingOrder.value = true

    const videos = sortableVideos.value.map((item, index) => ({
      id: item._id,
      order: index + 1
    }))

    const response = await apiAuth.patch('/education-training-videos/order/update', { videos })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showSortDialog.value = false
    await loadVideos()
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

// 清除選擇的檔案（保留當前封面）
const clearThumbnailFile = () => {
  thumbnailFile.value = null
  thumbnailPreview.value = null
  if (thumbnailInputRef.value) {
    thumbnailInputRef.value.reset()
  }
}

// 處理 Switch 變更
const handleThumbnailSwitchChange = (value) => {
  if (!value) {
    // Switch 關閉時，清除封面相關狀態
    thumbnailFile.value = null
    thumbnailPreview.value = null
    if (thumbnailInputRef.value) {
      thumbnailInputRef.value.reset()
    }
  }
}

// 處理封面圖片變更
const handleThumbnailChange = (file) => {
  if (file) {
    // v-file-input 返回的可能是數組或單一 File 物件
    const selectedFile = Array.isArray(file) ? file[0] : file

    // 確保是 File 物件
    if (!(selectedFile instanceof File)) {
      thumbnailFile.value = null
      thumbnailPreview.value = null
      return
    }

    // 檢查檔案大小（5MB 限制）
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      createSnackbar({
        text: '圖片檔案太大，請選擇小於 5MB 的圖片',
        snackbarProps: { color: 'red-lighten-1' }
      })
      thumbnailFile.value = null
      thumbnailPreview.value = null
      return
    }
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      createSnackbar({
        text: '圖片格式錯誤，僅支援 JPG、PNG、GIF、WEBP 格式',
        snackbarProps: { color: 'red-lighten-1' }
      })
      thumbnailFile.value = null
      thumbnailPreview.value = null
      return
    }
    // 建立預覽（新圖片會自動覆蓋舊的預覽）
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
      // 當上傳新圖片時，清除舊的 currentThumbnailUrl，因為新圖片會覆蓋
      // 但我們保留它以便在沒有選擇新圖片時顯示
    }
    reader.readAsDataURL(selectedFile)
  } else {
    // 清除檔案時，清除預覽，但保留 currentThumbnailUrl（如果是編輯模式）
    thumbnailPreview.value = null
  }
}

// 移除封面（重置所有封面相關狀態）
const removeThumbnail = () => {
  thumbnailFile.value = null
  thumbnailPreview.value = null
  currentThumbnailUrl.value = null
  useCustomThumbnail.value = false
  if (thumbnailInputRef.value) {
    thumbnailInputRef.value.reset()
  }
}

// 新增影片
const showCreateForm = async () => {
  isEditing.value = false
  resetForm()

  // 設定預設值
  title.value.value = ''
  videoUrl.value.value = ''
  categories.value.value = []
  formData.value = {
    _id: null
  }
  dialogLoading.value = false
  // 清除封面
  removeThumbnail()
}

// 編輯影片
const editVideo = async (video) => {
  try {
    editingLoadingId.value = video._id
    isEditing.value = true
    showCreateDialog.value = true
    dialogLoading.value = true

    const response = await apiAuth.get(`/education-training-videos/${video._id}`)
    const full = response.data.result

    title.value.value = full.title
    videoUrl.value.value = full.videoUrl
    // 處理多分類
    if (full.categories && Array.isArray(full.categories)) {
      categories.value.value = full.categories.map(cat => cat._id || cat)
    } else if (full.category) {
      // 向後相容：如果還有舊的單一分類資料
      categories.value.value = [full.category._id || full.category]
    } else {
      categories.value.value = []
    }

    // 處理封面
    if (full.thumbnailUrl) {
      currentThumbnailUrl.value = full.thumbnailUrl
      thumbnailPreview.value = null
      useCustomThumbnail.value = true // 如果有封面，開啟 switch
    } else {
      currentThumbnailUrl.value = null
      thumbnailPreview.value = null
      useCustomThumbnail.value = false // 如果沒有封面，關閉 switch
    }
    thumbnailFile.value = null

    formData.value = {
      _id: full._id
    }
    dialogLoading.value = false
    editingLoadingId.value = null
  } catch (error) {
    console.error('載入影片內容失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入影片內容失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    dialogLoading.value = false
    editingLoadingId.value = null
  }
}

// 提交表單
const handleSubmit = validateForm(async (values) => {
  try {
    isSubmitting.value = true

    // 建立 FormData 用於上傳檔案
    const formDataToSend = new FormData()
    formDataToSend.append('title', values.title)
    formDataToSend.append('videoUrl', values.videoUrl)

    // 處理分類陣列 - 使用 JSON 字串或直接附加陣列
    if (values.categories && values.categories.length > 0) {
      // 後端會解析 JSON 字串
      formDataToSend.append('categories', JSON.stringify(values.categories))
    }

    // 處理封面圖片
    if (useCustomThumbnail.value) {
      // Switch 開啟時，如果有選擇新的封面圖片，添加上傳（會自動覆蓋舊的）
      if (thumbnailFile.value) {
        const fileToUpload = Array.isArray(thumbnailFile.value) ? thumbnailFile.value[0] : thumbnailFile.value
        if (fileToUpload) {
          formDataToSend.append('thumbnail', fileToUpload)
        }
      }
      // 如果沒有選擇新檔案，但原本有封面（currentThumbnailUrl），保持不變
      // 後端會保留原有的 thumbnailUrl
    } else {
      // Switch 關閉時，清除封面（改回自動截圖）
      formDataToSend.append('thumbnailUrl', '')
    }

    let response
    if (isEditing.value) {
      const videoId = formData.value._id
      response = await apiAuth.patch(`/education-training-videos/${videoId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await apiAuth.post('/education-training-videos', formDataToSend, {
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
    loadVideos()
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

// 刪除影片
const deleteVideo = (video) => {
  selectedVideo.value = video
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true

    const response = await apiAuth.delete(`/education-training-videos/${selectedVideo.value._id}`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showDeleteDialog.value = false
    loadVideos()
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
  resetForm()
  title.value.value = ''
  videoUrl.value.value = ''
  categories.value.value = []
  formData.value = {
    _id: null
  }
  // 清除封面
  removeThumbnail()
}

// 格式化日期（僅日期）
const formatDateOnly = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 監聽搜尋條件變化
watch(() => searchCriteria.value.quickSearch, (newValue) => {
  if (newValue !== undefined) {
    isSearching.value = true
    debouncedQuickSearch()
  }
})

watch(() => searchCriteria.value.categories, () => {
  currentPage.value = 1
  tableLoading.value = true
  performSearch()
    .finally(() => {
      tableLoading.value = false
    })
}, { deep: true })

// 組件掛載時載入資料
onMounted(() => {
  loadCategories()
  loadVideos()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

:deep(.v-data-table) {
  thead { height: 48px !important; background-color: #455a64 !important; color: #fff !important; tr { height: 48px !important; } th { height: 48px !important; font-size: 13px !important; } }
  tbody tr { min-height: 48px; }
  td { height: 48px !important; div { line-height: 1.6; } }
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

.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

/* 拖拉排序樣式 */
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

/* 影片排序對話框：四個一排的排序卡片 */
.sortable-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  min-height: 100px;
}

.sortable-item {
  width: 100%;
}

@media (max-width: 960px) {
  .sortable-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .sortable-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

/* 封面預覽圖片樣式 */
.thumbnail-preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

/* v-file-input 檔案名稱溢出處理 */
:deep(.v-file-input .v-field__input) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.v-file-input .v-field__input > div) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

:deep(.v-file-input .v-field__input .v-file-input__text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: block;
}
</style>

