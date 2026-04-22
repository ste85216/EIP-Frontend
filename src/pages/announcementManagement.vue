<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題和操作按鈕區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>公告管理</h3>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  prepend-icon="mdi-bullhorn-outline"
                  variant="outlined"
                  color="teal-darken-1"
                  class="me-4"
                  @click="openCreateDialog"
                >
                  新增公告
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
                <v-text-field
                  v-model="searchCriteria.quickSearch"
                  :loading="isSearching"
                  placeholder="搜尋標題或內容"
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
            <!-- 表格 -->
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:sort-by="sortBy"
              :headers="headers"
              :items="announcements"
              :loading="tableLoading"
              :items-per-page-options="itemsPerPageOptions"
              :page="currentPage"
              :items-length="totalItems"
              class="elevation-0 rounded"
              @update:options="handleTableOptions"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>
                    <div
                      class="text-truncate"
                      style="max-width: 200px;"
                    >
                      {{ item.title }}
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getTypeColor(item.type)"
                      size="small"
                    >
                      {{ getTypeText(item.type) }}
                    </v-chip>
                  </td>
                  <td>
                    <v-chip
                      :color="item.isPinned ? 'orange-darken-1' : 'grey-lighten-1'"
                      size="small"
                    >
                      {{ item.isPinned ? '已置頂' : '一般' }}
                    </v-chip>
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
                  <td>{{ item.creator?.name || '未知' }}</td>
                  <td>
                    <div class="d-flex align-center gap-1">
                      <v-btn
                        icon
                        size="small"
                        color="blue"
                        variant="text"
                        :loading="editingLoadingId === item._id"
                        :disabled="editingLoadingId === item._id"
                        @click="editAnnouncement(item)"
                      >
                        <v-icon size="18">
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                      <v-btn
                        v-if="canSendAnnouncementNotification && canSendNotification(item)"
                        icon
                        size="small"
                        color="teal-darken-1"
                        variant="text"
                        :loading="sendNotifyLoadingId === item._id"
                        :disabled="sendNotifyLoadingId === item._id"
                        @click="openSendNotificationDialog(item)"
                      >
                        <v-icon size="18">
                          mdi-bell-ring-outline
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
                        @click="deleteAnnouncement(item)"
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

    <!-- 新增/編輯公告對話框 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="1000"
      persistent
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-bullhorn-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ isEditing ? '編輯公告' : '新增公告' }}</span>
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
              <!-- 標題 -->
              <v-col
                cols="12"
                md="8"
              >
                <v-text-field
                  v-model="title.value.value"
                  :error-messages="title.meta.touched ? title.errorMessage.value : []"
                  label="公告標題 *"
                  variant="outlined"
                  density="compact"
                  counter="30"
                  maxlength="30"
                  clearable
                />
              </v-col>

              <!-- 公告類型 -->
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="type.value.value"
                  :error-messages="type.meta.touched ? type.errorMessage.value : []"
                  :items="typeOptions.filter(t => t.value !== null)"
                  item-title="title"
                  item-value="value"
                  label="公告類型 *"
                  variant="outlined"
                  density="compact"
                />
              </v-col>



              <!-- 開始時間 -->
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="startDate.value.value"
                  :error-messages="startDate.meta.touched ? startDate.errorMessage.value : []"
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
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="endDate.value.value"
                  :error-messages="endDate.meta.touched ? endDate.errorMessage.value : []"
                  label="結束時間"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-calendar-clock"
                  hide-details
                  clearable
                />
              </v-col>

              <!-- 是否置頂 -->
              <v-col
                cols="12"
                md="3"
                class="ms-3"
              >
                <v-switch
                  v-model="isPinned.value.value"
                  label="置頂公告"
                  color="orange"
                  density="compact"
                  hide-details
                />
              </v-col>

              <!-- 是否啟用 -->
              <v-col
                cols="12"
                md="3"
              >
                <v-switch
                  v-model="isActive.value.value"
                  label="啟用狀態"
                  color="green"
                  density="compact"
                  hide-details
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-switch
                  v-model="notifyAtStart.value.value"
                  label="自動發送通知"
                  color="teal-darken-1"
                  density="compact"
                  hide-details
                  :disabled="!isStartDateInFuture"
                />
                <div
                  v-if="!isStartDateInFuture"
                  class="text-caption text-medium-emphasis ms-1"
                >
                  請設定「晚於現在」的開始時間以啟用排程通知
                </div>
              </v-col>

              <!-- 公告內容（富文本編輯器） -->
              <v-col cols="12">
                <label class="field-label mb-2 d-block">公告內容 *</label>
                <RichTextEditor
                  v-model="announcementContent"
                  placeholder="輸入公告內容..."
                  :height="400"
                  upload-endpoint="/announcements/content-image"
                />
              </v-col>

              <!-- 附件上傳 -->
              <v-col
                cols="12"
                class=" pb-0"
              >
                <v-file-input
                  v-model="attachments.value.value"
                  label="附件"
                  variant="outlined"
                  density="compact"
                  multiple
                  prepend-icon="mdi-paperclip"
                  chips
                  counter
                  show-size
                  :rules="[
                    v => !v || v.length <= 10 || '最多只能上傳 10 個檔案'
                  ]"
                >
                  <template #selection="{ fileNames }">
                    <div
                      class="d-flex flex-wrap align-center"
                      style="gap: 4px;"
                    >
                      <template
                        v-for="(fileName, index) in fileNames"
                        :key="fileName"
                      >
                        <v-chip
                          v-if="index < 3"
                          color="blue-darken-1"
                          size="small"
                          label
                          class="mb-1"
                        >
                          {{ truncateFileName(fileName, 30) }}
                        </v-chip>
                        <span
                          v-if="index === 3"
                          class="text-overline text-grey-darken-3 ms-1"
                        >
                          +{{ fileNames.length - 3 }} 個檔案
                        </span>
                      </template>
                    </div>
                  </template>
                </v-file-input>
              </v-col>

              <!-- 現有附件列表（編輯模式） -->
              <v-col
                v-if="isEditing && existingAttachments.length > 0"
                cols="12"
              >
                <div class="existing-attachments">
                  <div class="text-subtitle-2 mb-2">
                    現有附件
                  </div>
                  <div
                    v-for="attachment in existingAttachments"
                    :key="attachment.filename"
                    class="attachment-item d-flex align-center mb-2 pa-2 border rounded"
                  >
                    <v-icon
                      :color="getFileTypeColor(attachment.mimetype)"
                      size="20"
                      class="me-2"
                    >
                      {{ getFileTypeIcon(attachment.mimetype) }}
                    </v-icon>
                    <span class="flex-grow-1 text-body-2">
                      {{ attachment.originalName }}
                    </span>
                    <span class="text-caption text-grey me-2">
                      {{ formatFileSize(attachment.size) }}
                    </span>
                    <v-btn
                      icon
                      size="x-small"
                      color="red"
                      variant="text"
                      @click="removeExistingAttachment(attachment.filename)"
                    >
                      <v-icon size="16">
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </div>
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

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除公告`"
      :message="`確定要刪除「${selectedAnnouncement?.title || ''}」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="confirmDelete"
    />

    <ConfirmDialog
      v-model="showPostCreateNotifyDialog"
      dialog-width="360"
      title="發送通知"
      :message="postCreateNotifyMessageHtml"
      header-icon="mdi-bell-ring-outline"
      confirm-button-text="立即發送"
      cancel-button-text="稍後再說"
      :close-on-confirm="false"
      :confirm-loading="postCreateSendLoading"
      @confirm="confirmPostCreateSendNotification"
    />

    <ConfirmDialog
      v-model="showSendNotificationDialog"
      dialog-width="360"
      title="發送通知"
      :message="resendNotifyMessageHtml"
      header-icon="mdi-bell-ring-outline"
      confirm-button-text="發送"
      cancel-button-text="取消"
      :close-on-confirm="false"
      :confirm-loading="sendNotifyDialogLoading"
      @confirm="confirmSendNotification"
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
import { usePermissionStore } from '@/stores/permission'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

definePage({
    meta: {
    title: '公告管理 | Ystravel',
    login: true,
    permission: 'ANNOUNCEMENT_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()
const permissionStore = usePermissionStore()

const canSendAnnouncementNotification = computed(() =>
  permissionStore.hasPermission('ANNOUNCEMENT_UPDATE') ||
  permissionStore.hasPermission('ANNOUNCEMENT_CREATE')
)

// 響應式資料
const announcements = ref([])
const tableLoading = ref(false)
const isSearching = ref(false)
const itemsPerPage = ref(20)
const currentPage = ref(1)
const totalItems = ref(0)
const sortBy = ref([{ key: 'createdAt', order: 'desc' }])

// 搜尋條件
const searchCriteria = ref({
  type: null,
  isActive: null,
  quickSearch: ''
})

// 公告類型選項
const typeOptions = [
  { title: '系統公告', value: 'system' },
  { title: '更新公告', value: 'update' },
  { title: '一般公告', value: 'announcement' },
  { title: '維護公告', value: 'maintenance' },
  { title: '活動公告', value: 'event' }
]

// 狀態選項
const statusOptions = [
  { title: '啟用', value: true },
  { title: '停用', value: false }
]

// 每頁選項（含全部）
const itemsPerPageOptions = [10, 20, 50, 100, { value: -1, title: '全部' }]

// 表格標題
const headers = [
  { title: '標題', key: 'title', sortable: true },
  { title: '類型', key: 'type', sortable: true },
  { title: '置頂', key: 'isPinned', sortable: true },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '開始時間', key: 'startDate', sortable: true },
  { title: '結束時間', key: 'endDate', sortable: true },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: '156px', align: 'center' }
]

// 對話框狀態
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showPostCreateNotifyDialog = ref(false)
const pendingPostCreateAnnouncementId = ref(null)
const postCreateSendLoading = ref(false)
const showSendNotificationDialog = ref(false)
const sendNotificationTarget = ref(null)
const sendNotifyLoadingId = ref(null)
const sendNotifyDialogLoading = ref(false)

const escapeHtml = (text) => {
  if (text == null || text === '') return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const postCreateNotifyMessageHtml =
  '公告已建立。是否<span class="font-weight-medium">現在</span>發送 Email、LINE 與站內通知給所有使用者？'

const resendNotifyMessageHtml = computed(() => {
  const safe = escapeHtml(sendNotificationTarget.value?.title || '')
  return `確定要對「<span class="text-teal-darken-1 font-weight-bold">${safe}</span>」發送 Email、LINE 與站內通知嗎？`
})

watch(showPostCreateNotifyDialog, (open) => {
  if (!open) {
    pendingPostCreateAnnouncementId.value = null
    postCreateSendLoading.value = false
  }
})

watch(showSendNotificationDialog, (open) => {
  if (!open) {
    sendNotificationTarget.value = null
    sendNotifyDialogLoading.value = false
    sendNotifyLoadingId.value = null
  }
})

// 表單驗證
const schema = yup.object({
  title: yup.string().required('請輸入公告標題').max(30, '標題不能超過30字'),
  type: yup.string().required('請選擇公告類型'),
  startDate: yup.string()
    .transform((value) => value === '' ? null : value)
    .nullable(),
  endDate: yup.string()
    .transform((value) => value === '' ? null : value)
    .nullable()
    .test('is-after-start', '結束時間必須晚於開始時間', function(value) {
      const { startDate } = this.parent
      if (!startDate || !value) return true
      return new Date(value) > new Date(startDate)
    }),
  notifyAtStart: yup.boolean(),
  attachments: yup.mixed().nullable()
})

const { handleSubmit: validateForm, resetForm } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    title: '',
    type: 'announcement',
    startDate: '',
    endDate: '',
    isPinned: false,
    isActive: true,
    notifyAtStart: false,
    attachments: null
  }
})

// 表單欄位
const title = useField('title')
const type = useField('type')
const startDate = useField('startDate')
const endDate = useField('endDate')
const isPinned = useField('isPinned')
const isActive = useField('isActive')
const notifyAtStart = useField('notifyAtStart')
const attachments = useField('attachments')

const isStartDateInFuture = computed(() => {
  const val = startDate.value.value
  if (!val) return false
  return new Date(val) > new Date()
})

// 富文本內容
const announcementContent = ref('')

// 現有附件（編輯模式）
const existingAttachments = ref([])
const attachmentsToRemove = ref([])

// 表單資料
const formData = ref({
  _id: null
})

const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const selectedAnnouncement = ref(null)
const editingLoadingId = ref(null)
const dialogLoading = ref(false)

// 表單引用
const formRef = ref(null)

// 載入公告列表
const loadAnnouncements = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value === -1 ? (totalItems.value > 0 ? totalItems.value : 999999) : itemsPerPage.value
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

    // 處理排序參數
    if (sortBy.value && sortBy.value.length > 0 && sortBy.value[0].key) {
      params.sortBy = sortBy.value[0].key
      params.sortOrder = sortBy.value[0].order || 'desc'
    } else {
      // 預設按照 createdAt 降序排序（最新的在前）
      params.sortBy = 'createdAt'
      params.sortOrder = 'desc'
    }

    // 後台管理需要看到所有公告（包括未發布和已過期的），所以加上 skipTimeCheck 參數
    params.skipTimeCheck = 'true'
    const response = await apiAuth.get('/announcements', { params })
    // 將置頂公告排在前面
    const data = response.data.result.data || []
    announcements.value = data.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
    totalItems.value = response.data.result.totalItems
  } catch (error) {
    console.error('載入公告錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入公告失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 搜尋功能
const performSearch = async () => {
  currentPage.value = 1
  await loadAnnouncements()
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
  loadAnnouncements()
}

// 開啟新增對話框
const openCreateDialog = () => {
  showCreateForm()
  showCreateDialog.value = true
}

// 新增公告
const showCreateForm = () => {
  isEditing.value = false

  // 重置表單
  resetForm()

  // 設定預設值
  title.value.value = ''
  type.value.value = 'announcement'
  isPinned.value.value = false
  isActive.value.value = true
  notifyAtStart.value.value = false
  attachments.value.value = null
  announcementContent.value = ''
  existingAttachments.value = []
  attachmentsToRemove.value = []

  // 設定預設的開始時間為當下（台灣時間）
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const localTime = new Date(now.getTime() - offset)
  const nowString = localTime.toISOString().slice(0, 16)
  startDate.value.value = nowString

  // 結束時間不自動填寫，由使用者自行選擇
  endDate.value.value = ''

  // 確保新增模式無載入狀態
  dialogLoading.value = false
}

// 編輯公告
const editAnnouncement = async (announcement) => {
  try {
    editingLoadingId.value = announcement._id
    isEditing.value = true
    showCreateDialog.value = true
    dialogLoading.value = true

    // 以 ID 取得完整資料（含 content 與 attachments）
    // 後台管理需要看到所有公告（包括未發布和已過期的），所以加上 skipTimeCheck 參數
    const response = await apiAuth.get(`/announcements/${announcement._id}?skipTimeCheck=true`)
    const full = response.data.result

    // 處理開始時間（轉換為本地時間）
    let startDateValue = ''
    if (full.startDate) {
      const start = new Date(full.startDate)
      const offset = start.getTimezoneOffset() * 60000
      const localStart = new Date(start.getTime() - offset)
      startDateValue = localStart.toISOString().slice(0, 16)
    }

    // 處理結束時間（轉換為本地時間）
    let endDateValue = ''
    if (full.endDate) {
      const end = new Date(full.endDate)
      const offset = end.getTimezoneOffset() * 60000
      const localEnd = new Date(end.getTime() - offset)
      endDateValue = localEnd.toISOString().slice(0, 16)
    }

    // 設定表單欄位值
    title.value.value = full.title
    type.value.value = full.type
    startDate.value.value = startDateValue
    endDate.value.value = endDateValue
    isPinned.value.value = full.isPinned
    isActive.value.value = full.isActive
    notifyAtStart.value.value = full.notifyAtStart === true
    attachments.value.value = null
    announcementContent.value = full.content || ''

    // 設定現有附件
    existingAttachments.value = full.attachments || []
    attachmentsToRemove.value = []

    formData.value = {
      _id: full._id
    }
    dialogLoading.value = false
    editingLoadingId.value = null
  } catch (error) {
    console.error('載入公告內容失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入公告內容失敗',
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

    const formDataToSend = new FormData()

    // 加入基本資料
    formDataToSend.append('title', values.title)
    formDataToSend.append('content', announcementContent.value)
    formDataToSend.append('type', values.type)
    formDataToSend.append('isPinned', isPinned.value.value)
    formDataToSend.append('isActive', isActive.value.value)
    formDataToSend.append('notifyAtStart', notifyAtStart.value.value && isStartDateInFuture.value)

    // 處理開始時間
    if (values.startDate) {
      formDataToSend.append('startDate', new Date(values.startDate).toISOString())
    } else {
      formDataToSend.append('startDate', '') // 使用空字串代替 null
    }

    // 處理結束時間
    if (values.endDate) {
      formDataToSend.append('endDate', new Date(values.endDate).toISOString())
    } else {
      formDataToSend.append('endDate', '') // 使用空字串代替 null
    }

    // 加入附件檔案（只有當有選擇新檔案時）
    if (values.attachments && values.attachments.length > 0) {
      values.attachments.forEach(file => {
        formDataToSend.append('attachments', file)
      })
    }

    // 編輯模式：加入要刪除的附件列表
    if (isEditing.value && attachmentsToRemove.value.length > 0) {
      formDataToSend.append('removeAttachments', JSON.stringify(attachmentsToRemove.value))
    }

    const wasCreate = !isEditing.value
    let createdId = null
    let response
    if (isEditing.value) {
      const announcementId = formData.value._id
      response = await apiAuth.patch(`/announcements/${announcementId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await apiAuth.post('/announcements', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      createdId = response.data.result?._id || null
    }

    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closeCreateDialog()
    await loadAnnouncements()

    if (wasCreate && createdId && canSendAnnouncementNotification.value) {
      pendingPostCreateAnnouncementId.value = createdId
      showPostCreateNotifyDialog.value = true
    }
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

watch(
  () => startDate.value.value,
  (val) => {
    if (!val || new Date(val) <= new Date()) {
      notifyAtStart.value.value = false
    }
  }
)

const confirmPostCreateSendNotification = async () => {
  const id = pendingPostCreateAnnouncementId.value
  if (!id) return
  try {
    postCreateSendLoading.value = true
    const res = await apiAuth.post(`/announcements/${id}/send-notification`)
    createSnackbar({
      text: res.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    showPostCreateNotifyDialog.value = false
    pendingPostCreateAnnouncementId.value = null
    loadAnnouncements()
  } catch (error) {
    console.error('發送通知錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '發送失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    postCreateSendLoading.value = false
  }
}

const openSendNotificationDialog = (item) => {
  sendNotificationTarget.value = item
  showSendNotificationDialog.value = true
}

const confirmSendNotification = async () => {
  const item = sendNotificationTarget.value
  if (!item?._id) return
  try {
    sendNotifyDialogLoading.value = true
    sendNotifyLoadingId.value = item._id
    const res = await apiAuth.post(`/announcements/${item._id}/send-notification`)
    createSnackbar({
      text: res.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    showSendNotificationDialog.value = false
    loadAnnouncements()
  } catch (error) {
    console.error('發送通知錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '發送失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    sendNotifyDialogLoading.value = false
    sendNotifyLoadingId.value = null
  }
}

const canSendNotification = (item) => {
  if (!item) return false
  if (!item.isActive) return false
  const now = new Date()
  if (item.startDate && new Date(item.startDate) > now) return false
  if (item.endDate && new Date(item.endDate) < now) return false
  return true
}

// 切換啟用狀態
const toggleActive = async (announcement) => {
  try {
    const response = await apiAuth.patch(`/announcements/${announcement._id}`, {
      isActive: !announcement.isActive
    })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    loadAnnouncements()
  } catch (error) {
    console.error('切換狀態錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '切換狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 刪除公告
const deleteAnnouncement = (announcement) => {
  selectedAnnouncement.value = announcement
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true

    const response = await apiAuth.delete(`/announcements/${selectedAnnouncement.value._id}`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showDeleteDialog.value = false
    loadAnnouncements()
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
  announcementContent.value = ''
  existingAttachments.value = []
  attachmentsToRemove.value = []
  isPinned.value.value = false
  isActive.value.value = true
  notifyAtStart.value.value = false
  startDate.value.value = ''
  endDate.value.value = ''
  formData.value = {
    _id: null
  }
}

// 移除現有附件
const removeExistingAttachment = (filename) => {
  attachmentsToRemove.value.push(filename)
  existingAttachments.value = existingAttachments.value.filter(
    att => att.filename !== filename
  )
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

// 取得公告類型文字
const getTypeText = (type) => {
  const typeMap = {
    system: '系統公告',
    update: '更新公告',
    announcement: '一般公告',
    maintenance: '維護公告',
    event: '活動公告'
  }
  return typeMap[type] || type
}

// 取得公告類型顏色
const getTypeColor = (type) => {
  const colorMap = {
    system: 'blue-darken-2',
    update: 'green-darken-2',
    announcement: 'grey-darken-2',
    maintenance: 'orange-darken-2',
    event: 'purple-darken-1'
  }
  return colorMap[type] || 'grey'
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

// 取得檔案類型圖標
const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'mdi-file'
  if (mimeType.startsWith('image/')) return 'mdi-file-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'mdi-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'mdi-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'mdi-folder-zip'
  if (mimeType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

// 取得檔案類型顏色
const getFileTypeColor = (mimeType) => {
  if (!mimeType) return 'grey'
  if (mimeType.startsWith('image/')) return 'green'
  if (mimeType.includes('pdf')) return 'red'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'blue'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'green'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'orange'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'purple'
  return 'grey'
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 截斷檔案名稱
const truncateFileName = (fileName, maxLength = 30) => {
  if (!fileName || fileName.length <= maxLength) return fileName
  return fileName.substring(0, maxLength) + '...'
}

// 監聽搜尋條件變化
watch(() => searchCriteria.value.quickSearch, (newVal) => {
  if (newVal !== undefined) {
    isSearching.value = true
    debouncedQuickSearch(newVal)
  }
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
  loadAnnouncements()
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

.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.existing-attachments {
  .attachment-item {
    background: #fafafa;
    transition: all 0.2s ease;

    &:hover {
      border-color: #1976d2 !important;
      background: #f5f5f5;
    }
  }
}
</style>

