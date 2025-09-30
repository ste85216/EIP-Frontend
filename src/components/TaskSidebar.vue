<!-- eslint-disable vue/no-v-html -->
<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    location="right"
    width="640"
    temporary
    class="task-sidebar"
  >
    <div class="task-sidebar-content">
      <!-- 標題區域 -->
      <div class="sidebar-header">
        <div class="d-flex align-center justify-space-between">
          <div class="block-title font-weight-bold">
            {{ task?.name || '任務詳情' }}
          </div>
          <div class="d-flex align-center">
            <v-btn
              icon
              variant="plain"
              size="small"
              @click="closeSidebar"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- 任務內容 -->
      <div
        v-if="task"
        class="sidebar-body"
      >
        <!-- 可編輯欄位 -->
        <div class="editable-fields">
          <!-- 指派對象 -->
          <div class="field-section">
            <label class="field-label">指派對象</label>
            <div class="field-content">
              <!-- 編輯模式 -->
              <div
                v-if="editingField === 'assignee'"
                class="edit-mode d-flex align-center"
              >
                <v-select
                  v-model="editingAssignee"
                  :items="availableUsers"
                  item-title="name"
                  item-value="_id"
                  placeholder="選擇指派對象"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  class="flex-grow-1 me-2"
                  @update:model-value="saveAssignee"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <UserAvatar
                          v-if="item.raw && typeof item.raw === 'object'"
                          :user="item.raw"
                          size="24"
                        />
                      </template>
                      <v-list-item-subtitle>{{ item.raw?.email || '' }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <div class="d-flex align-center">
                      <UserAvatar
                        v-if="item.raw && typeof item.raw === 'object'"
                        :user="item.raw"
                        size="24"
                        class="me-2"
                      />
                      {{ item.raw?.name || '' }}
                    </div>
                  </template>
                </v-select>
                <v-icon
                  size="16"
                  color="grey"
                  class="edit-icon"
                  @click="cancelEditing"
                >
                  mdi-close
                </v-icon>
              </div>
              <!-- 顯示模式 -->
              <div
                v-else
                class="display-mode d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center">
                  <UserAvatar
                    v-if="task.assignee"
                    :user="task.assignee"
                    size="24"
                    class="me-2"
                  />
                  <span
                    v-if="task.assignee"
                    class="text-body-2"
                  >
                    {{ task.assignee.name }}
                  </span>
                  <span
                    v-else
                    class="text-body-2 text-medium-emphasis"
                  >
                    無指派對象
                  </span>
                </div>
                <v-icon
                  size="16"
                  color="grey"
                  class="edit-icon"
                  @click="startEditingAssignee"
                >
                  mdi-pencil
                </v-icon>
              </div>
            </div>
          </div>

          <!-- 截止日期 -->
          <div class="field-section">
            <label class="field-label">截止日期</label>
            <div class="field-content">
              <!-- 編輯模式 -->
              <div
                v-if="editingField === 'dueDate'"
                class="edit-mode d-flex align-center"
              >
                <v-date-input
                  :model-value="editingDueDate ? new Date(editingDueDate) : null"
                  placeholder="選擇截止日期"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  prepend-icon
                  ok-text="確認"
                  cancel-text="取消"
                  class="flex-grow-1 me-2"
                  @update:model-value="handleDueDateChange"
                  @click:clear="clearDueDate"
                  @click.stop
                />
                <v-icon
                  size="16"
                  color="grey"
                  class="edit-icon"
                  @click="cancelEditing"
                >
                  mdi-close
                </v-icon>
              </div>
              <!-- 顯示模式 -->
              <div
                v-else
                class="display-mode d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center">
                  <v-icon
                    v-if="task.dueDate"
                    size="16"
                    class="me-2"
                    :color="getDueDateColor(task.dueDate)"
                  >
                    mdi-calendar
                  </v-icon>
                  <span
                    v-if="task.dueDate"
                    class="text-body-2"
                    :class="getDueDateColor(task.dueDate)"
                  >
                    {{ formatDate(task.dueDate) }}
                  </span>
                  <span
                    v-else
                    class="text-body-2 text-medium-emphasis"
                  >
                    無截止日期
                  </span>
                </div>
                <v-icon
                  size="16"
                  color="grey"
                  class="edit-icon"
                  @click="startEditingDueDate"
                >
                  mdi-pencil
                </v-icon>
              </div>
            </div>
          </div>

          <!-- 專案 -->
          <div class="field-section">
            <label class="field-label">專案</label>
            <div class="field-content">
              <!-- 只顯示模式，不允許編輯 -->
              <div class="display-mode d-flex align-center">
                <v-icon
                  size="18"
                  class="me-2"
                  :color="project?.iconColor === 'white' ? 'grey-lighten-1' : project?.iconColor"
                >
                  mdi-square-rounded
                </v-icon>
                <span
                  v-if="project?.name"
                  class="text-body-2 project-name-link"
                  @click="navigateToProject"
                >
                  {{ project.name }}
                </span>
                <span
                  v-else
                  class="text-body-2 text-medium-emphasis"
                >
                  無專案
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件區域 -->
        <div class="field-section full-width">
          <div class="d-flex align-center justify-space-between mb-3">
            <label class="attachment-label">附件</label>
            <v-icon
              size="16"
              color="grey"
              class="me-2 edit-icon"
              @click="toggleAttachmentSection"
            >
              {{ showAttachmentUpload ? 'mdi-minus' : 'mdi-plus' }}
            </v-icon>
          </div>

          <!-- 附件上傳區域 (可展開/收合) -->
          <div
            v-if="showAttachmentUpload"
            class="mb-3 d-flex"
          >
            <v-file-input
              ref="fileInputRef"
              v-model="selectedFiles"
              label="選擇檔案"
              variant="outlined"
              density="compact"
              multiple
              prepend-icon="mdi-paperclip"
              chips
              counter
              :rules="[
                v => !v || v.length <= 10 || '最多只能上傳 10 個檔案'
              ]"
              @update:model-value="handleFileSelect"
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
                      {{ truncateFileName(fileName, 15) }}
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

            <!-- 上傳按鈕 -->
            <v-btn
              v-if="selectedFiles && selectedFiles.length > 0"
              color="teal-darken-1"
              size="small"
              class="ms-3 mt-2"
              variant="outlined"
              :loading="uploadingAttachments"
              @click="uploadAttachments"
            >
              上傳
            </v-btn>
          </div>

          <!-- 現有附件列表 -->
          <div
            v-if="task?.attachments && task.attachments.length > 0"
            class="attachment-list"
          >
            <div class="text-caption text-grey mb-2">
              已上傳的附件 ({{ task.attachments.length }})
            </div>
            <div
              v-for="attachment in task.attachments"
              :key="attachment._id"
              class="attachment-item d-flex align-center mb-2"
            >
              <v-icon
                :color="getFileTypeColor(attachment.mimeType)"
                size="20"
                class="me-2"
              >
                {{ getFileTypeIcon(attachment.mimeType) }}
              </v-icon>

              <!-- 只顯示檔名，不可點擊 -->
              <span
                class="attachment-name flex-grow-1 text-body-2"
                :title="attachment.originalName"
              >
                {{ attachment.originalName }}
              </span>

              <!-- 下載按鈕 -->
              <v-btn
                icon
                size="x-small"
                color="blue-grey-lighten-1"
                variant="text"
                :title="'下載 ' + attachment.originalName"
                @click="downloadAttachment(attachment)"
              >
                <v-icon size="16">
                  mdi-download
                </v-icon>
              </v-btn>

              <!-- 刪除按鈕 -->
              <v-btn
                v-if="canDeleteAttachment()"
                icon
                size="x-small"
                color="red-lighten-1"
                variant="text"
                :title="'刪除 ' + attachment.originalName"
                @click="showDeleteAttachmentDialog(attachment)"
              >
                <v-icon size="16">
                  mdi-delete
                </v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- 描述區域 -->
        <div class="field-section full-width">
          <label class="field-label">描述</label>
          <div>
            <RichTextEditor
              v-model="taskDescription"
              placeholder="輸入任務描述..."
              :height="200"
              @update:model-value="updateDescription"
            />
          </div>
        </div>
      </div>

      <!-- 評論區域 -->
      <div
        class="comments-section"
        :class="{ 'expanded': isCommentsExpanded }"
      >
        <div class="comments-header d-flex align-center justify-space-between">
          <h3 class="text-h6">
            評論
          </h3>
          <v-btn
            v-if="task?.comments && task.comments.length > 0"
            icon
            variant="plain"
            size="32"
            color="grey-darken-1"
            :title="isCommentsExpanded ? '收縮評論列表' : '展開評論列表'"
            @click="toggleCommentsHeight"
          >
            <v-icon size="22">
              {{ isCommentsExpanded ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
            </v-icon>
          </v-btn>
        </div>

        <!-- 評論列表 -->
        <div
          v-if="task?.comments && task.comments.length > 0"
          ref="commentsListRef"
          class="comments-list"
          :class="{ 'comments-expanded': isCommentsExpanded }"
          @scroll="handleCommentsScroll"
        >
          <div
            v-for="comment in task.comments"
            :key="comment._id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-author">
                <UserAvatar
                  v-if="comment.author"
                  :user="comment.author"
                  size="24"
                  class="me-2"
                />
                <span class="text-body-2 font-weight-medium">
                  {{ comment.author?.name || '未知用戶' }}
                </span>
                <span class="text-caption text-medium-emphasis ms-2">
                  {{ formatDateTime(comment.createdAt) }}
                </span>
              </div>
            </div>
            <div class="comment-content">
              <div
                class="text-body-2 comment-text"
                v-html="formatCommentWithMentions(comment)"
              />
              <!-- 圖片附件 -->
              <CommentImagePreview
                v-if="comment.attachments && comment.attachments.length > 0"
                :images="comment.attachments"
              />
            </div>
          </div>
        </div>

        <!-- 無評論狀態 -->
        <div
          v-else
          class="no-comments"
        >
          <v-icon
            size="48"
            color="grey-lighten-1"
            class="mb-4"
          >
            mdi-comment-outline
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">
            尚無評論
          </p>
        </div>

        <!-- 新增評論 -->
        <div class="add-comment">
          <div class="d-flex align-start mb-3">
            <UserAvatar
              v-if="userStore.user"
              :user="userStore.user"
              size="32"
              class="me-3"
            />
            <div class="flex-grow-1">
              <MentionTextarea
                ref="mentionTextareaRef"
                v-model="newComment"
                placeholder="新增評論..."
                variant="outlined"
                density="compact"
                rows="3"
                hide-details
                auto-grow
                :available-users="availableUsers"
                @keydown.enter="handleCommentKeydown"
                @mention-added="handleMentionAdded"
              />

              <!-- 圖片上傳區域 -->
              <div
                v-if="showImageUpload"
                class="mt-3"
              >
                <CommentImageUpload
                  ref="commentImageUploadRef"
                  v-model="selectedImages"
                  @files-selected="handleImagesSelected"
                />
              </div>
            </div>
          </div>

          <!-- 工具列和發送按鈕 -->
          <div class="comment-toolbar">
            <!-- 工具列 -->
            <div class="d-flex align-center">
              <!-- 相機圖示按鈕 -->
              <v-btn
                icon
                variant="plain"
                size="24"
                color="grey-darken-1"
                :ripple="false"
                @click="toggleImageUpload"
              >
                <v-icon size="20">
                  mdi-camera
                </v-icon>
              </v-btn>

              <!-- 提示文字 -->
              <span class="hint-text flex-grow-1 ms-2">
                按 Enter 發送評論，按 Shift + Enter 換行
              </span>
            </div>
          </div>
          <!-- 協作者區域 -->
          <div class="collaborators-section mt-0">
            <div class="text-body-2 text-medium-emphasis mb-2">
              協作者
            </div>
            <div class="d-flex align-center">
              <v-tooltip
                v-for="(collaborator, index) in validCollaborators.slice(0, 3)"
                :key="collaborator._id"
                :text="collaborator.name"
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <UserAvatar
                    v-bind="tooltipProps"
                    :user="collaborator"
                    size="24"
                    class="collaborator-avatar"
                    :style="{
                      marginLeft: index > 0 ? '-8px' : '0',
                      zIndex: 10 - index
                    }"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="validCollaborators.length > 3"
                :text="getExtraCollaboratorsText()"
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <span
                    v-bind="tooltipProps"
                    class="text-caption ms-1"
                  >
                    +{{ validCollaborators.length - 3 }}
                  </span>
                </template>
              </v-tooltip>
              <span
                v-if="!validCollaborators.length"
                class="text-body-2 text-medium-emphasis"
              >
                無協作者
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-navigation-drawer>

  <!-- 刪除附件確認對話框 -->
  <ConfirmDeleteDialog
    v-model="showDeleteDialog"
    title="刪除附件"
    :message="`確定要刪除附件「${attachmentToDelete?.originalName || ''}」嗎？<br>此操作無法恢復。`"
    @confirm="confirmDeleteAttachment"
  />
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/UserAvatar.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import MentionTextarea from '@/components/MentionTextarea.vue'
import CommentImageUpload from '@/components/CommentImageUpload.vue'
import CommentImagePreview from '@/components/CommentImagePreview.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  },
  project: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'task-updated', 'task-deleted'])

const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()

// 響應式變數
const newComment = ref('')
const taskDescription = ref('')
const editingField = ref(null)
const editingAssignee = ref(null)
const editingDueDate = ref(null)
// const editingProject = ref(null) // 已移除，專案不允許修改
const availableUsers = ref([])
// const availableProjects = ref([]) // 已移除，專案不允許修改
const isAddingComment = ref(false)
const commentsListRef = ref(null)
const mentionTextareaRef = ref(null)
const commentImageUploadRef = ref(null)
const currentMentions = ref([])
const selectedImages = ref([])
const showImageUpload = ref(false)
const isCommentsExpanded = ref(false)
const lastCommentsCount = ref(0)
const shouldAutoScroll = ref(true)
// 附件相關變數
const selectedFiles = ref([])
const uploadingAttachments = ref(false)
const showAttachmentUpload = ref(false) // 預設收合

// 刪除確認對話框
const showDeleteDialog = ref(false)
const attachmentToDelete = ref(null)

// 計算屬性
const drawerOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 有效的協作者列表（去重）
const validCollaborators = computed(() => {
  const collaborators = props.task?.collaborators || []
  const seen = new Set()
  return collaborators.filter(collaborator => {
    if (!collaborator || !collaborator._id) return false
    if (seen.has(collaborator._id)) return false
    seen.add(collaborator._id)
    return true
  })
})

// 滾動評論列表到底部
const scrollCommentsToBottom = () => {
  if (commentsListRef.value && shouldAutoScroll.value) {
    // 使用 nextTick 確保 DOM 更新完成後再滾動
    nextTick(() => {
      // 增加額外的延遲，確保所有內容都已渲染
      setTimeout(() => {
        if (commentsListRef.value) {
          commentsListRef.value.scrollTop = commentsListRef.value.scrollHeight
        }
      }, 100)
    })
  }
}

// 檢查是否有新評論並決定是否自動滾動
const checkForNewComments = (newTask) => {
  if (!newTask || !newTask.comments) {
    lastCommentsCount.value = 0
    return false
  }

  const currentCount = newTask.comments.length
  const hasNewComments = currentCount > lastCommentsCount.value
  lastCommentsCount.value = currentCount

  return hasNewComments
}

// 關閉側邊欄
const closeSidebar = () => {
  drawerOpen.value = false
}

// 更新描述
// 防抖動計時器
let descriptionUpdateTimer = null

const updateDescription = async (newDescription) => {
  if (!props.task || !props.task._id) return

  // 清除之前的計時器
  if (descriptionUpdateTimer) {
    clearTimeout(descriptionUpdateTimer)
  }

  // 設定新的計時器，延遲 1 秒後保存
  descriptionUpdateTimer = setTimeout(async () => {
    try {
      const { data } = await apiAuth.put(`/tasks/${props.task._id}`, {
        description: newDescription
      })

      if (data.success) {
        emit('task-updated', data.data)
        // 移除成功訊息，避免頻繁提示
        // createSnackbar({
        //   text: '描述更新成功',
        //   snackbarProps: { color: 'teal-lighten-1' }
        // })
      }
    } catch (error) {
      console.error('更新描述失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || '更新描述失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  }, 1000) // 1 秒延遲
}

// 新增評論
const addComment = async () => {
  if ((!newComment.value.trim() && selectedImages.value.length === 0) || !props.task || isAddingComment.value) return

  try {
    isAddingComment.value = true

    // 取得當前的標記
    const mentions = mentionTextareaRef.value ? mentionTextareaRef.value.getMentions() : []

    // 建立 FormData 以支援檔案上傳
    const formData = new FormData()
    formData.append('content', newComment.value.trim())
    formData.append('mentions', JSON.stringify(mentions))

    // 添加選擇的圖片
    selectedImages.value.forEach(file => {
      formData.append('images', file)
    })

    console.log('發送評論請求:', {
      content: newComment.value.trim(),
      mentionsCount: mentions.length,
      imagesCount: selectedImages.value.length
    })

    const { data } = await apiAuth.post(`/tasks/${props.task._id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success) {
      emit('task-updated', data.data)
      newComment.value = ''
      selectedImages.value = []
      showImageUpload.value = false
      currentMentions.value = []
      // 清空 MentionTextarea 的標記列表
      if (mentionTextareaRef.value) {
        mentionTextareaRef.value.clearMentions()
      }
      // 清空圖片上傳組件
      if (commentImageUploadRef.value) {
        commentImageUploadRef.value.clearImages()
      }
      // 新增評論後總是滾動到底部
      shouldAutoScroll.value = true
      scrollCommentsToBottom()
      createSnackbar({
        text: '評論新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('新增評論失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '新增評論失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isAddingComment.value = false
  }
}

// 處理評論輸入框的 Enter 鍵事件
const handleCommentKeydown = (event) => {
  // 如果按的是 Enter 鍵（沒有 Shift）
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 防止換行
    addComment() // 發送評論
  }
  // 如果按的是 Shift + Enter，允許換行（預設行為）
}

// 獲取額外協作者的文本（用於 +N 的 tooltip）
const getExtraCollaboratorsText = () => {
  if (!validCollaborators.value || validCollaborators.value.length <= 3) {
    return ''
  }
  const extraCollaborators = validCollaborators.value.slice(3)
  return extraCollaborators.map(c => c.name).join('、')
}

// 處理標記添加
const handleMentionAdded = (mention) => {
  currentMentions.value.push(mention)
}

// 處理圖片選擇
const handleImagesSelected = (files) => {
  selectedImages.value = files
  console.log('選擇了圖片:', files.length, '張')
}

// 切換圖片上傳區域
const toggleImageUpload = () => {
  showImageUpload.value = !showImageUpload.value
  if (!showImageUpload.value) {
    // 關閉時清空已選擇的圖片
    selectedImages.value = []
    if (commentImageUploadRef.value) {
      commentImageUploadRef.value.clearImages()
    }
  }
}

// 切換評論列表高度
const toggleCommentsHeight = () => {
  isCommentsExpanded.value = !isCommentsExpanded.value
}

// 處理評論列表滾動
const handleCommentsScroll = () => {
  if (!commentsListRef.value) return

  const container = commentsListRef.value
  const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10

  // 如果用戶滾動到底部，恢復自動滾動
  // 如果用戶向上滾動，暫停自動滾動
  shouldAutoScroll.value = isAtBottom
}

// 切換附件上傳區域
const toggleAttachmentSection = () => {
  showAttachmentUpload.value = !showAttachmentUpload.value
}

// 處理檔案選擇
const handleFileSelect = (files) => {
  console.log('選擇了檔案:', files?.length || 0, '個')
}

// 上傳附件
const uploadAttachments = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return
  if (!props.task?._id) return

  uploadingAttachments.value = true

  try {
    const formData = new FormData()
    selectedFiles.value.forEach(file => {
      formData.append('attachments', file)
    })

    const { data } = await apiAuth.post(`/tasks/${props.task._id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success) {
      createSnackbar({
        text: `成功上傳 ${selectedFiles.value.length} 個附件`,
        snackbarProps: { color: 'success' }
      })

      // 清空選擇的檔案
      selectedFiles.value = []

      // 上傳完成後收合上傳區域
      showAttachmentUpload.value = false

      // 更新任務資料
      emit('task-updated', data.data)
    }
  } catch (error) {
    console.error('上傳附件失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '上傳附件失敗',
      snackbarProps: { color: 'error' }
    })
  } finally {
    uploadingAttachments.value = false
  }
}

// 下載附件
const downloadAttachment = (attachment) => {
  try {
    // 構建下載 URL
    const downloadUrl = `${import.meta.env.VITE_API}/uploads/tasks/${attachment.filename}`

    // 創建臨時連結進行下載
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = attachment.originalName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('開始下載附件:', attachment.originalName)
  } catch (error) {
    console.error('下載附件失敗:', error)
    createSnackbar({
      text: '下載附件失敗',
      snackbarProps: { color: 'error' }
    })
  }
}

// 顯示刪除確認對話框
const showDeleteAttachmentDialog = (attachment) => {
  attachmentToDelete.value = attachment
  showDeleteDialog.value = true
}

// 確認刪除附件
const confirmDeleteAttachment = async () => {
  try {
    const attachment = attachmentToDelete.value
    if (!attachment) return

    const { data } = await apiAuth.delete(`/tasks/${props.task._id}/attachments/${attachment._id}`)

    if (data.success) {
      createSnackbar({
        text: '附件刪除成功',
        snackbarProps: { color: 'success' }
      })

      // 更新任務資料
      emit('task-updated', data.data)
    }
  } catch (error) {
    console.error('刪除附件失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除附件失敗',
      snackbarProps: { color: 'error' }
    })
  } finally {
    // 重置對話框狀態
    attachmentToDelete.value = null
    showDeleteDialog.value = false
  }
}

// 檢查是否可以刪除附件
const canDeleteAttachment = () => {
  // 暫時直接返回 true，不檢查任何權限
  return true
}

// 取得檔案類型圖標
const getFileTypeIcon = (mimeType) => {
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
  if (mimeType.startsWith('image/')) return 'green'
  if (mimeType.includes('pdf')) return 'red'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'blue'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'green'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'orange'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'purple'
  return 'grey'
}

// 截斷檔案名稱
const truncateFileName = (fileName, maxLength = 15) => {
  if (fileName.length <= maxLength) return fileName
  return fileName.substring(0, maxLength) + '...'
}

// 開始編輯指派對象
const startEditingAssignee = async () => {
  editingField.value = 'assignee'
  editingAssignee.value = props.task?.assignee?._id || null
  if (availableUsers.value.length === 0) {
    await fetchAvailableUsers()
  }
}

// 開始編輯截止日期
const startEditingDueDate = () => {
  editingField.value = 'dueDate'
  editingDueDate.value = props.task?.dueDate || null
}

// 處理日期變更
const handleDueDateChange = (newDate) => {
  const dueDate = newDate ? (newDate instanceof Date ? newDate.toISOString() : newDate) : null
  editingDueDate.value = dueDate
  saveDueDate()
}

// 清除截止日期
const clearDueDate = () => {
  editingDueDate.value = null
  saveDueDate()
}

// 開始編輯專案 - 已移除，專案不允許修改
// const startEditingProject = async () => {
//   editingField.value = 'project'
//   editingProject.value = props.project?._id || null
//   await fetchAvailableProjects()
// }

// 保存指派對象
const saveAssignee = async () => {
  if (!props.task?._id) return

  try {
    const { data } = await apiAuth.put(`/tasks/${props.task._id}`, {
      assignee: editingAssignee.value
    })

    if (data.success) {
      emit('task-updated', data.data)
      editingField.value = null
      createSnackbar({
        text: '指派對象更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新指派對象失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新指派對象失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 保存截止日期
const saveDueDate = async () => {
  if (!props.task?._id) return

  try {
    const { data } = await apiAuth.put(`/tasks/${props.task._id}`, {
      dueDate: editingDueDate.value
    })

    if (data.success) {
      emit('task-updated', data.data)
      editingField.value = null
      createSnackbar({
        text: '截止日期更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新截止日期失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新截止日期失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 保存專案 - 已移除，專案不允許修改
// const saveProject = async () => {
//   if (!props.task?._id) return
//
//   try {
//     const { data } = await apiAuth.put(`/tasks/${props.task._id}`, {
//       project: editingProject.value
//     })
//
//     if (data.success) {
//       emit('task-updated', data.data)
//       editingField.value = null
//       createSnackbar({
//         text: '專案更新成功',
//         snackbarProps: { color: 'teal-lighten-1' }
//       })
//     }
//   } catch (error) {
//     console.error('更新專案失敗:', error)
//     createSnackbar({
//       text: error?.response?.data?.message || '更新專案失敗',
//       snackbarProps: { color: 'red-lighten-1' }
//     })
//   }
// }

// 取得可用用戶列表（專案團隊成員）
const fetchAvailableUsers = async () => {
  try {
    // 直接從專案的團隊成員中獲取
    if (props.project?.team?.members) {
      availableUsers.value = props.project.team.members
    } else {
      // 如果沒有團隊成員，使用空陣列
      availableUsers.value = []
    }
  } catch (error) {
    console.error('取得用戶列表失敗:', error)
    availableUsers.value = []
  }
}

// 取得可用專案列表 - 已移除，專案不允許修改
// const fetchAvailableProjects = async () => {
//   try {
//     const { data } = await apiAuth.get('/projects/my-projects')
//     if (data.success) {
//       availableProjects.value = data.data
//     }
//   } catch (error) {
//     console.error('取得專案列表失敗:', error)
//   }
// }

// 取得頭像顏色 - 已移除，改用 UserAvatar 組件
// const getAvatarColor = (name) => {
//   if (!name) return 'grey'
//   const colors = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green-darken-1', 'amber-darken-1', 'orange', 'deep-orange', 'brown', 'blue-grey']
//   let hash = 0
//   for (let i = 0; i < name.length; i++) {
//     hash = name.charCodeAt(i) + ((hash << 5) - hash)
//   }
//   const colorIndex = Math.abs(hash) % colors.length
//   return colors[colorIndex]
// }

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化日期時間
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取得截止日期顏色
const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'text-medium-emphasis'

  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 已逾期 - 紅色
  if (diffDays < 0) return 'text-red-darken-1'

  // 當天、1天、3天內 - 紫色
  if (diffDays <= 3) return 'text-purple-darken-1'

  // 5天、10天內 - 淺藍色
  if (diffDays <= 10) return 'text-light-blue-accent-4'

  // 超過10天 - 灰色
  return 'text-medium-emphasis'
}

// 格式化評論中的標記
const formatCommentWithMentions = (comment) => {
  if (!comment || !comment.content) return ''

  let formattedContent = comment.content

  // 如果評論有標記資訊，則高亮顯示
  if (comment.mentions && comment.mentions.length > 0) {
    comment.mentions.forEach(mention => {
      // 使用更安全的字符串替換，避免正則表達式的特殊字符問題
      const mentionText = `@${mention.name}`
      // 轉義特殊字符以用於正則表達式
      const escapedMentionText = mentionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const mentionRegex = new RegExp(escapedMentionText, 'g')
      formattedContent = formattedContent.replace(
        mentionRegex,
        `<span class="mention-tag">${mentionText}</span>`
      )
    })
  }

  // 保持換行格式
  formattedContent = formattedContent.replace(/\n/g, '<br>')

  return formattedContent
}


// 監聽側邊欄開關，清空評論輸入或滾動到底部
watch(drawerOpen, (newValue) => {
  if (!newValue) {
    newComment.value = ''
    selectedImages.value = []
    showImageUpload.value = false
    isCommentsExpanded.value = false
    // 清空圖片上傳組件
    if (commentImageUploadRef.value) {
      commentImageUploadRef.value.clearImages()
    }
  } else {
    // 側邊欄開啟時，重置自動滾動狀態並滾動到底部
    shouldAutoScroll.value = true
    // 等待側邊欄動畫完成
    setTimeout(() => {
      scrollCommentsToBottom()
    }, 50)
  }
})

// 跳轉到專案詳情頁面
const navigateToProject = () => {
  if (props.project?._id) {
    router.push(`/projectAndTaskManagement/projects/${props.project._id}`)
  }
}

// 取消編輯
const cancelEditing = () => {
  editingField.value = null
  editingAssignee.value = null
  editingDueDate.value = null
}

// 監聽任務變化，更新描述
watch(() => props.task, (newTask, oldTask) => {
  if (newTask) {
    taskDescription.value = newTask.description || ''
    console.log('TaskSidebar 接收到的任務資料:', newTask)

    // 檢查是否有新評論
    const hasNewComments = checkForNewComments(newTask)

    // 如果是初次載入（oldTask 為空）或有新評論，則滾動到底部
    if (!oldTask || hasNewComments) {
      shouldAutoScroll.value = true
      scrollCommentsToBottom()
    }
  }
}, { immediate: true })

// 監聽專案變化，更新可用用戶列表
watch(() => props.project, (newProject) => {
  if (newProject) {
    fetchAvailableUsers()
  }
}, { immediate: true })

// 組件卸載時清理計時器
onUnmounted(() => {
  if (descriptionUpdateTimer) {
    clearTimeout(descriptionUpdateTimer)
  }
})
</script>

<style lang="scss" scoped>
/* 全域樣式用於 v-html 插入的內容 */
:global(.mention-tag) {
  color: rgb(var(--v-theme-secondary-darken-1)) !important;
  font-weight: 500 !important;
}

.task-sidebar {
  border-left: 1px solid rgb(var(--v-theme-outline-variant));
  position: fixed !important;
  top: 101px !important;
  height: 100vh !important;
}

.task-sidebar-content {
  height: calc(100% - 101px);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.sidebar-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
}

/* 可編輯欄位 */
.editable-fields {
  margin-bottom: 16px;
}

.field-section {
  margin-bottom: 16px;
}

.field-section.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.attachment-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}


.display-mode {
  padding: 8px;
}



.edit-mode {
  padding: 4px 0;
}

.edit-icon {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
}



.comments-section {
  // border-top: 3px solid #ccc;
  border-radius: 12px 12px 0 0;
  padding: 16px;
  background-color: #f1f1f1;
  z-index: 1000;
  transition: box-shadow 0.3s ease;
}

.comments-section.expanded {
  box-shadow: 0 -4px 4px 0px rgba(0, 0, 0, 0.15);
}

.comments-header {
  margin-bottom: 16px;
}

.comments-list {
  max-height: 160px; /* 預設高度，大約可以顯示2個評論 */
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px; /* 為滾動條留出空間 */
  transition: max-height 0.3s ease;

  &.comments-expanded {
    max-height: calc(100vh - 640px); /* 展開時的高度，幾乎佔滿整個側邊欄 */
  }
}

/* 自定義滾動條樣式 */
.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  border-radius: 3px;
  background-color: #ddd;
}

.comments-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #999;
}

.comment-item {
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
}

.comment-content {
  padding-left: 32px;
}

.no-comments {
  text-align: center;
  padding: 32px 16px;
}

.add-comment {
  background-color: rgb(var(--v-theme-surface));
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.collaborators-section {
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

.collaborator-avatar {
  border: 2px solid white;
}

.project-name-link:hover {
  cursor: pointer;
  color: #546E7A;
  text-decoration: underline;
}

.hint-text {
  text-align: right;
  font-size: 11px;
  color: #666;
}

.comment-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comment-toolbar {
  padding-top: 4px;
  padding-bottom: 8px;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

.comment-toolbar .v-btn--icon {
  transition: all 0.2s ease;
}

.comment-toolbar .v-btn--icon.text-primary {
  background-color: rgb(var(--v-theme-primary-container));
}

/* 附件相關樣式 */
.attachments-section {
  .attachment-list {
    .attachment-item {
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
      transition: all 0.2s ease;

      &:hover {
        border-color: #1976d2;
        background: #f5f5f5;
      }

      .attachment-name {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

</style>
