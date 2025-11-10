<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
    width="400"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon
        :color="buttonColor"
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
            {{ outlineIcon ? 'mdi-email-outline' : 'mdi-email' }}
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
                  <!-- 直客詢問資訊 -->
                  <div
                    v-if="notification.customerInquiry"
                    class="project-name"
                  >
                    直客詢問
                  </div>
                  <!-- 行銷美編需求申請資訊 -->
                  <div
                    v-if="notification.designRequest"
                    class="project-name"
                  >
                    行銷美編需求申請
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

const props = defineProps({
  // 'task' 只顯示任務相關通知, 'non-task' 只顯示非任務相關通知, null 顯示所有通知
  filterType: {
    type: String,
    default: null,
    validator: (value) => value === null || value === 'task' || value === 'non-task'
  },
  // 按鈕顏色
  buttonColor: {
    type: String,
    default: 'white'
  },
  // 是否使用 outline 圖示
  outlineIcon: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const notificationStore = useNotificationStore()
const { smAndUp } = useDisplay()

const menu = ref(false)

// 任務相關的通知類型
const taskNotificationTypes = [
  'task_due_reminder',
  'task_mention',
  'task_assignment',
  'task_unassignment',
  'task_collaborator_added',
  'task_collaborator_removed',
  'task_completion',
  'task_reopen'
]

// 從 store 取得狀態並過濾
const allNotifications = computed(() => notificationStore.notifications)
const notifications = computed(() => {
  if (!props.filterType) {
    return allNotifications.value
  }
  
  if (props.filterType === 'task') {
    // 只顯示任務相關的通知
    return allNotifications.value.filter(n => {
      // 確保通知有 type 屬性
      if (!n || !n.type) {
        return false
      }
      // 確保 type 是字符串並轉換為小寫進行比較
      const notificationType = String(n.type).trim()
      return taskNotificationTypes.includes(notificationType)
    })
  } else if (props.filterType === 'non-task') {
    // 只顯示非任務相關的通知
    return allNotifications.value.filter(n => {
      // 確保通知有 type 屬性
      if (!n || !n.type) {
        return false
      }
      // 確保 type 是字符串並轉換為小寫進行比較
      const notificationType = String(n.type).trim()
      return !taskNotificationTypes.includes(notificationType)
    })
  }
  
  return allNotifications.value
})

// 計算過濾後的未讀數量
// 如果通知列表已載入，使用過濾後的通知計算未讀數量
// 如果通知列表未載入，使用 store 的 unreadCount（但這不考慮 filterType）
// 為了準確性，我們需要載入通知列表後才能正確計算過濾後的未讀數量
const unreadCount = computed(() => {
  // 如果通知列表已載入，使用過濾後的通知計算未讀數量
  if (notifications.value.length > 0 || allNotifications.value.length > 0) {
    return notifications.value.filter(n => !n.isRead).length
  }
  // 如果通知列表未載入，但我們有 filterType，需要載入通知才能準確計算
  // 暫時返回 store 的未讀數量（這可能不準確，因為沒有考慮 filterType）
  // 但至少會顯示有未讀通知
  return notificationStore.unreadCount
})

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
    'task_reopen': 'mdi-restart',
    'sales_person_assignment': 'mdi-account-arrow-right',
    'marketing_design_request': 'mdi-palette'
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
    'task_reopen': 'blue-darken-1',
    'sales_person_assignment': 'orange-darken-2',
    'marketing_design_request': 'purple-darken-2'
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

  // 根據通知類型導航
  if (notification.task || notification.project) {
    // 任務相關通知，導航到專案與任務管理
    router.push(`/projectAndTaskManagement/projects/${notification.project._id}`)
  } else if (notification.customerInquiry) {
    // 直客詢問相關通知，導航到直客詢問管理
    router.push('/B2CStatisticsManagement')
  } else if (notification.designRequest) {
    // 行銷美編需求申請相關通知，導航到行銷美編需求申請管理
    router.push('/marketingDesignRequestManagement')
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

// 標記所有為已讀（只標記當前過濾後的通知）
const handleMarkAllAsRead = async () => {
  try {
    // 只標記當前顯示的通知為已讀
    const unreadNotifications = notifications.value.filter(n => !n.isRead)
    const markPromises = unreadNotifications.map(n => notificationStore.markAsRead(n._id))
    await Promise.all(markPromises)
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

// 全部刪除（只刪除當前過濾後的通知）
const handleDeleteAll = async () => {
  try {
    // 使用 Promise.all 並行刪除當前顯示的所有通知
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

// 組件掛載時載入未讀數量和通知列表（用於計算過濾後的未讀數量）
onMounted(async () => {
  try {
    // 先載入未讀數量
    await notificationStore.fetchUnreadCount()
    // 然後載入通知列表（這樣才能正確計算過濾後的未讀數量）
    // 根據 filterType 載入對應的通知
    const params = {}
    if (props.filterType === 'task') {
      // 在後端過濾，只取得任務相關的通知
      params.types = taskNotificationTypes.join(',')
    } else if (props.filterType === 'non-task') {
      // 非任務相關的通知，需要排除任務類型
      // 由於後端不支援排除查詢，我們仍在前端過濾
    }
    await notificationStore.fetchNotifications(params)
  } catch (error) {
    console.error('載入通知失敗:', error)
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
  font-size: 8px !important;
  height: 16px !important;
  min-width: 16px !important;
}
</style>
