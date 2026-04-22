<!-- eslint-disable vue/no-v-html -->
<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
    scrollable
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-history
        </v-icon>
        <span class="card-title text-white">描述變更歷史</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          class="opacity-100"
          :ripple="false"
          color="white"
          size="36"
          @click="closeDialog"
        >
          <v-icon size="22">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <!-- 載入中 -->
      <div
        v-if="loading"
        class="d-flex justify-center align-center py-12"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        />
      </div>

      <!-- 歷史紀錄列表 -->
      <v-card-text
        v-else-if="history.length > 0"
        class="px-6 pt-6 pb-4"
      >
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item mb-4"
        >
          <div class="d-flex align-center mb-3">
            <UserAvatar
              v-if="item.changedBy"
              :user="item.changedBy"
              size="32"
              class="me-3"
            />
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-medium">
                {{ item.changedBy?.name || '未知用戶' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDateTime(item.changedAt) }}
              </div>
            </div>
          </div>

          <!-- 變更前 -->
          <div class="mb-3">
            <div class="text-caption text-medium-emphasis mb-1">
              變更前：
            </div>
            <div
              class="text-body-2 pa-3 rounded description-content"
              style="background-color: #ffebee; border-left: 3px solid #f44336;"
            >
              <div
                v-if="item.oldDescription && !isEmptyHtml(item.oldDescription)"
                v-html="sanitizeHtml(item.oldDescription)"
              />
              <span
                v-else
                class="text-medium-emphasis"
              >（空白）</span>
            </div>
          </div>

          <!-- 變更後 -->
          <div>
            <div class="text-caption text-medium-emphasis mb-1">
              變更後：
            </div>
            <div
              class="text-body-2 pa-3 rounded description-content"
              style="background-color: #e8f5e9; border-left: 3px solid #4caf50;"
            >
              <div
                v-if="item.newDescription && !isEmptyHtml(item.newDescription)"
                v-html="sanitizeHtml(item.newDescription)"
              />
              <span
                v-else
                class="text-medium-emphasis"
              >（空白）</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- 無歷史紀錄 -->
      <v-card-text
        v-else
        class="d-flex flex-column align-center justify-center pt-12 pb-6 px-6"
      >
        <v-icon
          size="58"
          color="grey-lighten-1"
          class="mb-4"
        >
          mdi-history
        </v-icon>
        <p class="sub-title text-grey">
          尚無描述變更歷史
        </p>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 pt-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          :size="smAndUp ? 'default' : 'small'"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import UserAvatar from '@/components/UserAvatar.vue'
import DOMPurify from 'dompurify'

const { smAndUp } = useDisplay()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  taskId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const dialog = ref(false)
const loading = ref(false)
const history = ref([])

watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue
  if (newValue && props.taskId) {
    fetchHistory()
  }
})

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue)
})

const closeDialog = () => {
  dialog.value = false
}

const fetchHistory = async () => {
  if (!props.taskId) return

  try {
    loading.value = true
    const { data } = await apiAuth.get(`/tasks/${props.taskId}/description-history`)
    if (data.success) {
      history.value = data.data || []
    }
  } catch (error) {
    console.error('載入描述歷史失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入描述歷史失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 檢查 HTML 是否為空（只包含空的段落標籤）
const isEmptyHtml = (html) => {
  if (!html || !html.trim()) return true

  // 移除所有空白字符
  const trimmed = html.trim()

  // 檢查是否為 Quill 的空內容格式
  if (trimmed === '<p><br></p>' || trimmed === '<p></p>' || trimmed === '<br>') {
    return true
  }

  // 檢查是否包含圖片標籤（有圖片就不應該視為空白）
  const hasImage = /<img[^>]*>/i.test(trimmed)
  if (hasImage) {
    return false
  }

  // 檢查是否只包含空白字符和空的 HTML 標籤
  // 移除所有 HTML 標籤後檢查是否還有內容
  const textOnly = trimmed.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

  return textOnly === ''
}

// 清理 HTML 內容，防止 XSS 攻擊，並將圖片轉換為網址顯示
const sanitizeHtml = (html) => {
  if (!html) return ''

  // 先清理 HTML
  let cleanedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  })

  // 將圖片標籤轉換為網址顯示
  // 匹配 <img> 標籤並提取 src 屬性
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  cleanedHtml = cleanedHtml.replace(imgRegex, (match, src) => {
    // 提取檔名（從 URL 中）
    const urlParts = src.split('/')
    const filename = urlParts[urlParts.length - 1]
    // 返回可點擊的網址連結
    return `<a href="${src}" target="_blank" rel="noopener noreferrer" class="image-url-link">📷 ${filename}</a>`
  })

  return cleanedHtml
}
</script>

<style scoped>
.history-item {
  border: 2px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

.history-item:last-child {
  margin-bottom: 0;
}

/* 限制描述內容區域的寬度，防止內容溢出 */
.description-content {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  overflow-x: auto;
}

/* 圖片網址連結樣式 */
.description-content :deep(.image-url-link) {
  display: inline-block;
  color: #1976d2;
  text-decoration: underline;
  margin: 4px 8px 4px 0;
  padding: 4px 8px;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.875rem;
  word-break: break-all;
}

.description-content :deep(.image-url-link:hover) {
  background-color: #bbdefb;
  color: #1565c0;
}

/* 確保所有內容都不會超出容器 */
.description-content :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

/* 確保表格也不會超出容器 */
.description-content :deep(table) {
  max-width: 100%;
  table-layout: auto;
  word-wrap: break-word;
}
</style>

