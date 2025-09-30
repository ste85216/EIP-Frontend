import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const { apiAuth } = useApi()

  // 取得通知列表
  const fetchNotifications = async (params = {}) => {
    try {
      isLoading.value = true
      const { data } = await apiAuth.get('/notifications', { params })

      if (data.success) {
        notifications.value = data.data.notifications
        unreadCount.value = data.data.unreadCount
        return data.data
      }
    } catch (error) {
      console.error('取得通知失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 取得未讀通知數量
  const fetchUnreadCount = async () => {
    try {
      const { data } = await apiAuth.get('/notifications/unread-count')

      if (data.success) {
        unreadCount.value = data.data.unreadCount
        return data.data.unreadCount
      }
    } catch (error) {
      console.error('取得未讀數量失敗:', error)
      throw error
    }
  }

  // 標記通知為已讀
  const markAsRead = async (notificationId) => {
    try {
      const { data } = await apiAuth.put(`/notifications/${notificationId}/read`)

      if (data.success) {
        // 更新本地狀態
        const notification = notifications.value.find(n => n._id === notificationId)
        if (notification) {
          notification.isRead = true
          notification.readAt = new Date()
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        return data.data
      }
    } catch (error) {
      console.error('標記通知為已讀失敗:', error)
      throw error
    }
  }

  // 標記所有通知為已讀
  const markAllAsRead = async () => {
    try {
      const { data } = await apiAuth.put('/notifications/mark-all-read')

      if (data.success) {
        // 更新本地狀態
        notifications.value.forEach(notification => {
          notification.isRead = true
          notification.readAt = new Date()
        })
        unreadCount.value = 0
        return data
      }
    } catch (error) {
      console.error('標記所有通知為已讀失敗:', error)
      throw error
    }
  }

  // 刪除通知
  const deleteNotification = async (notificationId) => {
    try {
      const { data } = await apiAuth.delete(`/notifications/${notificationId}`)

      if (data.success) {
        // 更新本地狀態
        const index = notifications.value.findIndex(n => n._id === notificationId)
        if (index > -1) {
          const notification = notifications.value[index]
          notifications.value.splice(index, 1)

          // 如果刪除的是未讀通知，減少未讀數量
          if (!notification.isRead) {
            unreadCount.value = Math.max(0, unreadCount.value - 1)
          }
        }
        return data
      }
    } catch (error) {
      console.error('刪除通知失敗:', error)
      throw error
    }
  }

  // 新增通知到本地狀態（用於即時更新）
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.isRead) {
      unreadCount.value++
    }
  }

  // 更新通知狀態
  const updateNotification = (notificationId, updates) => {
    const notification = notifications.value.find(n => n._id === notificationId)
    if (notification) {
      Object.assign(notification, updates)
    }
  }

  // 清除所有通知
  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  // 計算屬性
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.isRead)
  )

  // 根據類型分組通知
  const notificationsByType = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  return {
    // 狀態
    notifications,
    unreadCount,
    isLoading,

    // 計算屬性
    unreadNotifications,
    readNotifications,
    notificationsByType,

    // 方法
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    updateNotification,
    clearNotifications
  }
})
