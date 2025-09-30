<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
    width="400"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        color="white"
        :size="buttonSize"
        class="me-2"
        :ripple="false"
        flat
      >
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="red-lighten-1"
          :max="99"
          class="notification-badge"
        >
          <v-icon>
            mdi-email
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <!-- 標題列 -->
      <v-card-title class="d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center">
          <v-icon
            class="me-2"
            size="24"
            color="grey-darken-3"
          >
            mdi-email
          </v-icon>
          <span class="card-title text-grey-darken-3">收件匣</span>
          <v-chip
            v-if="unreadCount > 0"
            color="red"
            size="small"
            class="ms-2"
          >
            {{ unreadCount }} 未讀
          </v-chip>
        </div>
        <div class="d-flex align-center">
          <!-- <v-btn
            v-if="unreadCount > 0"
            icon="mdi-check-all"
            size="small"
            variant="text"
            @click="handleMarkAllAsRead"
          /> -->
          <v-btn
            icon="mdi-refresh"
            size="small"
            color="grey-darken-3"
            variant="text"
            :loading="isLoading"
            @click="handleRefresh"
          />
        </div>
      </v-card-title>

      <v-divider />

      <!-- 通知列表 -->
      <v-card-text class="pa-0">
        <div
          v-if="isLoading && notifications.length === 0"
          class="pa-4 text-center"
        >
          <v-progress-circular indeterminate />
          <div class="mt-2">
            載入中...
          </div>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="pa-4 text-center text-grey"
        >
          <v-icon
            size="48"
            class="mb-2"
          >
            mdi-email-outline
          </v-icon>
          <div>目前沒有通知</div>
        </div>

        <div
          v-else
          class="notification-list"
        >
          <div
            v-for="notification in notifications"
            :key="notification._id"
            class="notification-item"
            :class="{ 'unread': !notification.isRead, 'read': notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="d-flex align-start pa-3">
              <!-- 通知圖示 -->
              <div class="notification-icon me-3">
                <v-icon
                  :color="getNotificationIconColor(notification.type)"
                  size="20"
                >
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </div>

              <!-- 通知內容 -->
              <div class="notification-content flex-grow-1">
                <!-- 通知標題 -->
                <div class="notification-title  mb-3">
                  {{ notification.title }}
                  <!-- 專案名稱 -->
                  <div
                    v-if="notification.project"
                    class="project-name"
                    @click.stop="handleProjectClick(notification.project)"
                  >
                    {{ notification.project.name }}
                  </div>
                </div>

                <!-- 通知內容 -->
                <div class="notification-text text-grey-darken-1 mb-3">
                  {{ notification.content }}
                </div>

                <!-- 底部資訊：專案名稱 + 時間 + 操作按鈕 -->
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <!-- 時間 -->
                    <span class="text-caption text-grey">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                  </div>

                  <!-- 操作按鈕 -->
                  <div class="notification-actions d-flex align-center">
                    <v-btn
                      icon
                      color="red-lighten-1"
                      class="me-1"
                      size="24"
                      variant="text"
                      @click.stop="handleDelete(notification._id)"
                    >
                      <v-icon size="18">
                        mdi-trash-can-outline
                      </v-icon>
                    </v-btn>
                    <v-btn
                      v-if="!notification.isRead"
                      icon
                      color="teal-lighten-1"
                      size="24"
                      variant="text"
                      @click.stop="handleMarkAsRead(notification._id)"
                    >
                      <v-icon size="18">
                        mdi-check
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- 底部操作 -->
      <v-divider />
      <v-card-actions class="px-3">
        <v-btn
          variant="text"
          size="small"
          color="red-lighten-1"
          @click="handleDeleteAll"
        >
          全部刪除
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          color="grey-darken-2"
          size="small"
          @click="handleMarkAllAsRead"
        >
          全部已讀
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useDisplay } from 'vuetify'

const router = useRouter()
const notificationStore = useNotificationStore()
const { smAndUp } = useDisplay()

const menu = ref(false)

// 從 store 取得狀態
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const isLoading = computed(() => notificationStore.isLoading)


const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

// 取得通知圖示
const getNotificationIcon = (type) => {
  const iconMap = {
    'task_due_reminder': 'mdi-clock-alert',
    'task_mention': 'mdi-at',
    'task_assignment': 'mdi-account-plus',
    'task_unassignment': 'mdi-account-minus',
    'task_collaborator_added': 'mdi-account-multiple-plus',
    'task_collaborator_removed': 'mdi-account-multiple-minus',
    'task_completion': 'mdi-check-circle',
    'task_reopen': 'mdi-restart'
  }
  return iconMap[type] || 'mdi-bell'
}

// 取得通知圖示顏色
const getNotificationIconColor = (type) => {
  const colorMap = {
    'task_due_reminder': 'orange-darken-1',
    'task_mention': 'blue',
    'task_assignment': 'teal-darken-1',
    'task_unassignment': 'red',
    'task_collaborator_added': 'teal-darken-1',
    'task_collaborator_removed': 'red-darken-1',
    'task_completion': 'teal-darken-1',
    'task_reopen': 'blue-darken-1'
  }
  return colorMap[type] || 'grey'
}

// 格式化時間
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-TW')
}

// 處理通知點擊
const handleNotificationClick = async (notification) => {
  // 標記為已讀
  if (!notification.isRead) {
    await handleMarkAsRead(notification._id)
  }

  // 如果有相關任務，導航到任務頁面
  if (notification.task) {
    router.push(`/projectAndTaskManagement/projects/${notification.project._id}`)
  } else if (notification.project) {
    // 否則導航到專案頁面
    router.push(`/projectAndTaskManagement/projects/${notification.project._id}`)
  }

  // 關閉選單
  menu.value = false
}

// 處理專案點擊
const handleProjectClick = (project) => {
  router.push(`/projectAndTaskManagement/projects/${project._id}`)
  menu.value = false
}

// 標記為已讀
const handleMarkAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    console.error('標記通知為已讀失敗:', error)
  }
}

// 標記所有為已讀
const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('標記所有通知為已讀失敗:', error)
  }
}


// 刪除通知
const handleDelete = async (notificationId) => {
  try {
    await notificationStore.deleteNotification(notificationId)
  } catch (error) {
    console.error('刪除通知失敗:', error)
  }
}

// 全部刪除
const handleDeleteAll = async () => {
  try {
    // 使用 Promise.all 並行刪除所有通知，提高效率
    const deletePromises = notifications.value.map(notification =>
      notificationStore.deleteNotification(notification._id)
    )

    await Promise.all(deletePromises)
  } catch (error) {
    console.error('全部刪除通知失敗:', error)
  }
}

// 重新整理
const handleRefresh = async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('重新整理通知失敗:', error)
  }
}


// 監聽選單開啟狀態
watch(menu, async (isOpen) => {
  if (isOpen) {
    // 選單開啟時載入通知
    try {
      await notificationStore.fetchNotifications()
    } catch (error) {
      console.error('載入通知失敗:', error)
    }
  }
})

// 組件掛載時載入未讀數量
onMounted(async () => {
  try {
    await notificationStore.fetchUnreadCount()
  } catch (error) {
    console.error('載入未讀數量失敗:', error)
  }
})
</script>

<style scoped lang="scss">
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.unread {
    background-color: #eceff163;
    border-left: 4px solid #8fadcf;
    &:hover {
      background-color: #00000010;
    }
  }


}

/* 移除最後一個項目的底線 */
.notification-list > .notification-item:last-child {
  border-bottom: none;
}

.project-name {
  font-size: 11px;
  border: 1px solid #455A64;
  padding: 2px 6px;
  border-radius: 4px;
  color: #455A64;
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  line-height: 1.4;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-text {
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-project {
  .v-chip {
    font-size: 11px;
    height: 20px;
  }
}

.notification-operator {
  font-size: 11px;
}

.notification-time {
  font-size: 11px;
}

.notification-actions {
  padding-left: 8px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

/* 自定義 badge 大小 */
.notification-badge :deep(.v-badge__badge) {
  font-size: 10px !important;
  height: 18px !important;
  min-width: 18px !important;
}
</style>
