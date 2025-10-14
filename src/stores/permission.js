import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/axios'

export const usePermissionStore = defineStore('permission', () => {
  const { apiAuth } = useApi()

  // 基本狀態
  const permissions = ref([])
  const roles = ref([])
  const userRoles = ref([])
  const loading = ref(false)

  // 計算屬性
  const permissionMap = computed(() => {
    const map = {}
    permissions.value.forEach(permission => {
      map[permission.code] = permission
    })
    return map
  })

  const roleMap = computed(() => {
    const map = {}
    roles.value.forEach(role => {
      map[role.code] = role
    })
    return map
  })

  // 權限檢查函數
  const hasPermission = (permission) => {
    if (!permission) return true
    return permissions.value.includes(permission) || permissions.value.includes('*')
  }

  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true
    return permissionList.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true
    return permissionList.every(permission => hasPermission(permission))
  }

  const hasRole = (roleCode) => {
    return roles.value.includes(roleCode)
  }

  // 載入用戶權限
  const loadUserPermissions = async () => {
    try {
      loading.value = true
      const { data } = await apiAuth.get('/permissions/user-permissions')

      if (data.success) {
        permissions.value = data.result.permissions
        roles.value = data.result.roles
      }
    } catch (error) {
      console.error('載入用戶權限失敗:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 獲取所有權限
  const getAllPermissions = async (params = {}) => {
    try {
      loading.value = true
      // 設定每頁顯示 1000 個項目來獲取所有權限
      const requestParams = {
        itemsPerPage: 1000,
        page: 1,
        ...params
      }
      const { data } = await apiAuth.get('/permissions/permissions', { params: requestParams })

      if (data.success) {
        const list = data.result.data || data.result || []
        // 以 _id 去重，避免 UI 元件報 duplicate id 警告
        const seen = new Set()
        const deduped = []
        list.forEach(item => {
          const id = item && item._id
          if (!id) return
          if (seen.has(id)) return
          seen.add(id)
          deduped.push(item)
        })
        return deduped
      }
      throw new Error(data.message || '獲取權限失敗')
    } catch (error) {
      console.error('獲取權限失敗:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 新增權限
  const createPermission = async (permissionData) => {
    try {
      const { data } = await apiAuth.post('/permissions/permissions', permissionData)

      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '新增權限失敗')
    } catch (error) {
      console.error('新增權限失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '新增權限失敗'
      throw new Error(errorMessage)
    }
  }

  // 更新權限
  const updatePermission = async (id, permissionData) => {
    try {
      const { data } = await apiAuth.patch(`/permissions/permissions/${id}`, permissionData)

      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '更新權限失敗')
    } catch (error) {
      console.error('更新權限失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '更新權限失敗'
      throw new Error(errorMessage)
    }
  }

  // 將指定權限套用到所有角色（批次）
  const applyPermissionToAllRoles = async (permissionId) => {
    try {
      const { data } = await apiAuth.post(`/permissions/permissions/${permissionId}/apply-to-all-roles`)
      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '批次套用權限失敗')
    } catch (error) {
      console.error('批次套用權限失敗:', error)
      const errorMessage = error.response?.data?.message || error.message || '批次套用權限失敗'
      throw new Error(errorMessage)
    }
  }

  // 刪除權限
  const deletePermission = async (id) => {
    try {
      const { data } = await apiAuth.delete(`/permissions/permissions/${id}`)

      if (data.success) {
        return true
      }
      throw new Error(data.message || '刪除權限失敗')
    } catch (error) {
      console.error('刪除權限失敗:', error)
      throw error
    }
  }

  // 獲取所有角色
  const getAllRoles = async (params = {}) => {
    try {
      loading.value = true
      // 設定每頁顯示 1000 個項目來獲取所有角色
      const requestParams = {
        itemsPerPage: 1000,
        page: 1,
        ...params
      }
      const { data } = await apiAuth.get('/permissions/roles', { params: requestParams })

      if (data.success) {
        return data.result.data || data.result
      }
      throw new Error(data.message || '獲取角色失敗')
    } catch (error) {
      console.error('獲取角色失敗:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 新增角色
  const createRole = async (roleData) => {
    try {
      const { data } = await apiAuth.post('/permissions/roles', roleData)

      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '新增角色失敗')
    } catch (error) {
      console.error('新增角色失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '新增角色失敗'
      throw new Error(errorMessage)
    }
  }

  // 更新角色
  const updateRole = async (id, roleData) => {
    try {
      const { data } = await apiAuth.patch(`/permissions/roles/${id}`, roleData)

      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '更新角色失敗')
    } catch (error) {
      console.error('更新角色失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '更新角色失敗'
      throw new Error(errorMessage)
    }
  }

  // 刪除角色
  const deleteRole = async (id) => {
    try {
      const { data } = await apiAuth.delete(`/permissions/roles/${id}`)

      if (data.success) {
        return true
      }
      throw new Error(data.message || '刪除角色失敗')
    } catch (error) {
      console.error('刪除角色失敗:', error)
      throw error
    }
  }

  // 獲取用戶角色
  const getUserRoles = async (userId = null) => {
    try {
      const url = userId ? `/permissions/user-roles/${userId}` : '/permissions/user-roles'
      const { data } = await apiAuth.get(url)

      if (data.success) {
        // 如果沒有 userId，返回 data.result.data，否則返回 data.result
        return userId ? data.result : data.result.data
      }
      throw new Error(data.message || '獲取用戶角色失敗')
    } catch (error) {
      console.error('獲取用戶角色失敗:', error)
      throw error
    }
  }

  // 分配角色給用戶
  const assignRoleToUser = async (userId, roleId, expiresAt, note) => {
    try {
      const { data } = await apiAuth.post('/permissions/assign-role', {
        userId,
        roleId,
        expiresAt,
        note
      })

      if (data.success) {
        return data.result
      }
      throw new Error(data.message || '分配角色失敗')
    } catch (error) {
      console.error('分配角色失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '分配角色失敗'
      throw new Error(errorMessage)
    }
  }

  // 移除用戶角色
  const removeRoleFromUser = async (userRoleId) => {
    try {
      const { data } = await apiAuth.delete(`/permissions/remove-role/${userRoleId}`)

      if (data.success) {
        return true
      }
      throw new Error(data.message || '移除角色失敗')
    } catch (error) {
      console.error('移除角色失敗:', error)
      // 提取後端返回的具體錯誤訊息
      const errorMessage = error.response?.data?.message || error.message || '移除角色失敗'
      throw new Error(errorMessage)
    }
  }

  // 獲取所有用戶
  const getAllUsers = async () => {
    try {
      const { data } = await apiAuth.get('/users/all')

      if (data.success) {
        return data.result.data || data.result
      }
      throw new Error(data.message || '獲取用戶失敗')
    } catch (error) {
      console.error('獲取用戶失敗:', error)
      throw error
    }
  }

  // 權限分組
  const getPermissionsByModule = computed(() => {
    const grouped = {}
    permissions.value.forEach(permission => {
      const permissionInfo = permissionMap.value[permission]
      if (permissionInfo) {
        const module = permissionInfo.module
        if (!grouped[module]) {
          grouped[module] = []
        }
        grouped[module].push(permissionInfo)
      }
    })
    return grouped
  })

  // 模組名稱對照
  const moduleNames = {
    system: '系統管理',
    employee: '員工管理',
    marketing: '行銷管理',
    hardware: '硬體管理',
    project: '專案管理',
    audit: '審計管理'
  }

  // 操作名稱對照
  const actionNames = {
    create: '新增',
    read: '查看',
    update: '修改',
    delete: '刪除',
    export: '匯出',
    import: '匯入',
    manage: '管理',
    tag: '標註'
  }


  return {
    // 狀態
    permissions,
    roles,
    userRoles,
    loading,

    // 計算屬性
    permissionMap,
    roleMap,
    getPermissionsByModule,
    moduleNames,
    actionNames,

    // 權限檢查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,

    // 權限管理
    loadUserPermissions,
    getAllPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    applyPermissionToAllRoles,

    // 角色管理
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,

    // 用戶角色管理
    getUserRoles,
    assignRoleToUser,
    removeRoleFromUser,
    getAllUsers
  }
}, {
  persist: {
    key: 'ginternational-permissions',
    paths: ['permissions', 'roles']
  }
})
