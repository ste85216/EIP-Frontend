import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole.js'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { api, apiAuth } = useApi()

  // 基本狀態
  const token = ref('')
  const name = ref('')
  const email = ref('')
  const role = ref(UserRole.USER)
  const userId = ref('')
  const adminId = ref('')
  const note = ref('')
  const avatar = ref('')
  const backgroundImage = ref('')
  const isDefaultPasswordChanged = ref(true)
  const _id = ref('')

  // 計算屬性
  const isLogin = computed(() => token.value.length > 0)
  const isUser = computed(() => role.value === UserRole.USER)
  const isManager = computed(() => role.value === UserRole.MANAGER)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)
  const isIT = computed(() => role.value === UserRole.IT)
  const isDesigner = computed(() => role.value === UserRole.DESIGNER)
  const isMarketing = computed(() => role.value === UserRole.MARKETING)
  const isHR = computed(() => role.value === UserRole.HR)
  const isSupervisor = computed(() => role.value === UserRole.SUPERVISOR)

  // 頭像相關工具函數
  const isDefaultAvatar = (avatarUrl) => {
    if (!avatarUrl) return false
    const lower = String(avatarUrl).toLowerCase()
    return (
      lower.includes('avatar_purple_robot') ||
      lower.includes('avatar_robot') ||
      lower.includes('orange_robot')
    )
  }

  const getInitials = (name) => {
    if (!name) return '??'
    // 移除空格並取前兩個字
    const cleanName = name.replace(/\s/g, '')
    return cleanName.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (name) => {
    if (!name) return 'grey'

    // 顏色列表
    const colors = [
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green-darken-1',
      'amber-darken-1',
      'orange',
      'deep-orange',
      'brown',
      'blue-grey'
    ]

    // 根據姓名的字符碼總和來選擇顏色
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  // 取得用戶頭像資訊（統一處理）
  const getUserAvatarInfo = (user) => {
    if (!user) return { isDefault: true, color: 'grey', initials: '??', avatar: null }

    const isDefault = isDefaultAvatar(user.avatar)
    return {
      isDefault,
      color: isDefault ? getAvatarColor(user.name) : undefined,
      initials: isDefault ? getInitials(user.name) : null,
      avatar: !isDefault ? user.avatar : null
    }
  }

  // 登入
  const login = async (values) => {
    try {
      const { data } = await api.post('/users/login', values)

      if (data.success && data.result.token) {
        token.value = data.result.token
        name.value = data.result.name
        email.value = data.result.email
        role.value = data.result.role
        userId.value = data.result.userId
        adminId.value = data.result.adminId
        note.value = data.result.note
        avatar.value = data.result.avatar
        backgroundImage.value = data.result.backgroundImage || ''
        isDefaultPasswordChanged.value = data.result.isDefaultPasswordChanged
        _id.value = data.result._id
        await profile()
        return '登入成功'
      } else {
        throw new Error(data.message || '登入失敗')
      }
    } catch (error) {
      console.error('Login error:', error)
      return error?.response?.data?.message || '登入失敗，請稍後再試'
    }
  }

  // Google 登入
  const googleLogin = async (code) => {
    try {
      const response = await api.post('/users/google-login', { code })

      if (response.data.success) {
        token.value = response.data.result.token
        name.value = response.data.result.name
        email.value = response.data.result.email
        role.value = response.data.result.role
        userId.value = response.data.result.userId
        adminId.value = response.data.result.adminId
        note.value = response.data.result.note
        avatar.value = response.data.result.avatar
        backgroundImage.value = response.data.result.backgroundImage || ''
        isDefaultPasswordChanged.value = response.data.result.isDefaultPasswordChanged
        _id.value = response.data.result._id
        return '登入成功'
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.log('Google登入失敗:', error.message)
      return error?.response?.data?.message || 'Google登入失敗，請稍後再試'
    }
  }

  // 取得個人資料
  const profile = async () => {
    if (!isLogin.value) return

    try {
      const { data } = await apiAuth.get('/users/profile')
      email.value = data.result.email
      name.value = data.result.name
      role.value = data.result.role
      userId.value = data.result.userId
      adminId.value = data.result.adminId
      note.value = data.result.note
      avatar.value = data.result.avatar
      backgroundImage.value = data.result.backgroundImage || ''
      isDefaultPasswordChanged.value = data.result.isDefaultPasswordChanged
      _id.value = data.result._id
    } catch (error) {
      console.log(error)
      logout()
    }
  }

  // 修改密碼
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await apiAuth.patch('/users/change-password', {
        currentPassword,
        newPassword
      })

      if (!data.success) {
        throw new Error(data.message || '密碼更新失敗')
      }

      return {
        success: true,
        message: data.message || '密碼更新成功'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '密碼更新失敗'
      throw new Error(errorMessage)
    }
  }

  // 忘記密碼
  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/users/forgot-password', { email })

      if (!data.success) {
        throw new Error(data.message || '發送重設密碼郵件失敗')
      }

      return {
        success: true,
        message: data.message || '重設密碼郵件已發送，請檢查您的信箱'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '發送重設密碼郵件失敗'
      throw new Error(errorMessage)
    }
  }

  // 重設密碼
  const resetPassword = async (token, newPassword) => {
    try {
      const { data } = await api.post('/users/reset-password', {
        resetPasswordToken: token,
        password: newPassword
      })

      if (!data.success) {
        throw new Error(data.message || '重設密碼失敗')
      }

      return {
        success: true,
        message: data.message || '密碼重設成功'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '重設密碼失敗'
      throw new Error(errorMessage)
    }
  }

    // 添加更新頭像的方法
    const updateAvatar = async (formData) => {
      try {
        const { data } = await apiAuth.patch('/users/avatar', formData)
        if (!data.success) {
          throw new Error(data.message || '頭像更新失敗')
        }
        avatar.value = `${data.result}?t=${new Date().getTime()}`
        return {
          success: true,
          message: '頭像更新成功'
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '頭像更新失敗'
        throw new Error(errorMessage)
      }
    }

    // 添加更新背景圖片的方法
    const updateBackgroundImage = async (imageUrl) => {
      try {
        const { data } = await apiAuth.patch('/users/background-image', { backgroundImage: imageUrl })
        if (!data.success) {
          throw new Error(data.message || '背景圖片更新失敗')
        }
        backgroundImage.value = imageUrl
        return {
          success: true,
          message: '背景圖片更新成功'
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '背景圖片更新失敗'
        throw new Error(errorMessage)
      }
    }

  // 登出
  const logout = async () => {
    try {
      await apiAuth.delete('/users/logout')
    } catch (error) {
      console.log(error)
    }
    token.value = ''
    email.value = ''
    name.value = ''
    role.value = UserRole.USER
    userId.value = ''
    adminId.value = ''
    note.value = ''
    avatar.value = ''
    backgroundImage.value = ''
    _id.value = ''
  }

  return {
    // 狀態
    token,
    email,
    name,
    role,
    userId,
    adminId,
    note,
    avatar,
    backgroundImage,
    isDefaultPasswordChanged,
    _id,

    // 計算屬性
    isLogin,
    isUser,
    isManager,
    isAdmin,
    isIT,
    isDesigner,
    isMarketing,
    isHR,
    isSupervisor,

    // 頭像相關工具函數
    isDefaultAvatar,
    getInitials,
    getAvatarColor,
    getUserAvatarInfo,

    // 方法
    login,
    logout,
    profile,
    googleLogin,
    changePassword,
    forgotPassword,
    resetPassword,
    updateAvatar,
    updateBackgroundImage
  }
}, {
  persist: {
    key: 'ginternational',
    paths: ['token']
  }
})
