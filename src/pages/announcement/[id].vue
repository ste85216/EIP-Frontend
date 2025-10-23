<template>
  <v-container max-width="1200">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 返回按鈕 -->
      <v-col
        cols="12"
        class="py-0"
      >
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="blue-grey-darken-2"
          class="px-0"
          @click="goBack"
        >
          返回列表
        </v-btn>
      </v-col>

      <!-- 載入中 -->
      <v-col
        v-if="loading"
        cols="12"
        class="text-center py-10"
      >
        <v-progress-circular
          indeterminate
          color="blue-grey-darken-2"
          size="64"
        />
      </v-col>

      <!-- 公告內容 -->
      <template v-else-if="announcement">
        <!-- 標題區 -->
        <v-col cols="12">
          <div class="mb-2 announcement-title">
            {{ announcement.title }}
          </div>

          <!-- 類型和狀態標籤 -->
          <div class="d-flex align-center gap-2">
            <v-chip
              v-if="announcement.isPinned"
              label
              color="red-darken-1"
              size="small"
              class="me-2"
            >
              <v-icon
                icon="mdi-pin"
                size="12"
                class="me-1"
              />
              置頂
            </v-chip>
            <v-chip
              :color="getTypeColor(announcement.type)"
              label
              size="small"
            >
              {{ getTypeText(announcement.type) }}
            </v-chip>
          </div>
        </v-col>

        <!-- 資訊區 -->
        <v-col cols="12">
          <v-card
            class="info-card elevation-0"
          >
            <v-card-text class="px-4 py-3">
              <v-row dense>
                <v-col
                  cols="12"
                  sm="6"
                  md="2"
                >
                  <div class="info-label">
                    建立者
                  </div>
                  <div class="info-value">
                    {{ announcement.creator?.name || '未知' }} ( {{ announcement.creator?.userId || '' }} )
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="info-label">
                    發布時間
                  </div>
                  <div class="info-value">
                    {{ formatDate(announcement.createdAt) }}
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="info-label">
                    更新時間
                  </div>
                  <div class="info-value">
                    {{ formatDate(announcement.updatedAt) }}
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="2"
                >
                  <div class="info-label">
                    瀏覽次數
                  </div>
                  <div class="info-value">
                    <v-icon
                      icon="mdi-eye"
                      color="grey-darken-1"
                      size="16"
                      class="me-1"
                    />
                    {{ announcement.viewCount || 0 }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 公告內容 -->
        <v-col cols="12">
          <v-card
            class="mb-4 elevation-0 info-card"
          >
            <v-card-title class="bg-blue-grey-lighten-5 py-3 ps-5">
              <v-icon
                icon="mdi-text-box-outline"
                size="20"
                class="me-2"
              />
              <span class="card-title">公告內容</span>
            </v-card-title>
            <v-card-text class="pa-6">
              <div
                class="announcement-content"
                v-html="announcement.content"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 附件區 -->
        <v-col
          v-if="announcement.attachments && announcement.attachments.length > 0"
          cols="12"
        >
          <v-card
            class="elevation-0 info-card"
          >
            <v-card-title class="bg-blue-grey-lighten-5 d-flex align-center py-3 ps-5">
              <v-icon
                icon="mdi-paperclip"
                size="20"
                class="me-2"
              />
              <span class="card-title">附件</span><span class="text-grey-darken-2 sub-title-1 font-weight-bold ms-1">({{ announcement.attachments.length }})</span>
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(attachment, index) in announcement.attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <v-list-item-title>
                    <v-icon
                      :icon="getFileIcon(attachment.mimetype)"
                      size="20"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <span class="text-blue-grey-darken-2 sub-title-1 font-weight-bold me-1">{{ attachment.originalName }}</span>
                    <span class="text-grey-darken-2 sub-title-2 font-weight-bold ms-1">({{ formatFileSize(attachment.size) }})</span>
                  </v-list-item-title>
                  <template #append>
                    <v-btn
                      icon
                      variant="text"
                      color="blue-darken-1"
                      size="small"
                      @click="downloadAttachment(attachment)"
                    >
                      <v-icon size="20">
                        mdi-download
                      </v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </template>

      <!-- 未找到公告 -->
      <v-col
        v-else
        cols="12"
        class="text-center py-10"
      >
        <v-icon
          icon="mdi-alert-circle"
          size="64"
          color="grey-darken-1"
          class="mb-4"
        />
        <h3 class="text-grey-darken-1">
          找不到此公告
        </h3>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

definePage({
  meta: {
    title: '公告詳情 | Ystravel',
    login: true
  }
})

const route = useRoute()
const router = useRouter()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()

// 響應式資料
const announcement = ref(null)
const loading = ref(true)

// 載入公告詳情
const loadAnnouncement = async () => {
  try {
    loading.value = true
    const response = await apiAuth.get(`/announcements/${route.params.id}`)
    announcement.value = response.data.result
  } catch (error) {
    console.error('載入公告詳情失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入公告詳情失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/announcement')
}

// 類型文字
const getTypeText = (type) => {
  const typeMap = {
    system: '系統公告',
    update: '更新公告',
    announcement: '一般公告',
    maintenance: '維護公告',
    event: '活動公告'
  }
  return typeMap[type] || '一般公告'
}

// 類型顏色
const getTypeColor = (type) => {
  const colorMap = {
    system: 'red-darken-1',
    update: 'blue-darken-1',
    announcement: 'green-darken-1',
    maintenance: 'orange-darken-1',
    event: 'purple-darken-1'
  }
  return colorMap[type] || 'grey-darken-1'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 取得檔案圖示
const getFileIcon = (mimetype) => {
  if (!mimetype) return 'mdi-file'

  if (mimetype.startsWith('image/')) return 'mdi-file-image'
  if (mimetype.startsWith('video/')) return 'mdi-file-video'
  if (mimetype.startsWith('audio/')) return 'mdi-file-music'
  if (mimetype.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimetype.includes('word')) return 'mdi-file-word'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'mdi-file-excel'
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'mdi-file-powerpoint'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return 'mdi-folder-zip'
  if (mimetype.includes('text')) return 'mdi-file-document'

  return 'mdi-file'
}

// 下載附件
const downloadAttachment = (attachment) => {
  window.open(attachment.path, '_blank')
}

// 組件掛載時載入資料
onMounted(() => {
  loadAnnouncement()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

.announcement-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.info-card {
  border: 1px solid #aaa;
  border-radius: 4px;
}

.announcement-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 12px 0;
  }

  :deep(p) {
    margin-bottom: 12px;
  }

  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  :deep(ul), :deep(ol) {
    margin-left: 24px;
    margin-bottom: 12px;
  }

  :deep(blockquote) {
    border-left: 4px solid #ddd;
    padding-left: 16px;
    margin: 12px 0;
    color: #666;
  }

  :deep(pre) {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 12px 0;
  }

  :deep(code) {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  }
}

.attachment-item {
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }
}
</style>

