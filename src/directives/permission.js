import { usePermissionStore } from '@/stores/permission'

// 權限指令
export const vPermission = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },

  updated(el, binding) {
    checkPermission(el, binding)
  }
}

// 任一權限指令
export const vAnyPermission = {
  mounted(el, binding) {
    checkAnyPermission(el, binding)
  },

  updated(el, binding) {
    checkAnyPermission(el, binding)
  }
}

// 所有權限指令
export const vAllPermissions = {
  mounted(el, binding) {
    checkAllPermissions(el, binding)
  },

  updated(el, binding) {
    checkAllPermissions(el, binding)
  }
}

// 角色指令
export const vRole = {
  mounted(el, binding) {
    checkRole(el, binding)
  },

  updated(el, binding) {
    checkRole(el, binding)
  }
}

// 檢查單一權限
const checkPermission = (el, binding) => {
  const { value } = binding
  const permissionStore = usePermissionStore()

  if (!permissionStore.hasPermission(value)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

// 檢查任一權限
const checkAnyPermission = (el, binding) => {
  const { value } = binding
  const permissionStore = usePermissionStore()

  if (!permissionStore.hasAnyPermission(value)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

// 檢查所有權限
const checkAllPermissions = (el, binding) => {
  const { value } = binding
  const permissionStore = usePermissionStore()

  if (!permissionStore.hasAllPermissions(value)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

// 檢查角色
const checkRole = (el, binding) => {
  const { value } = binding
  const permissionStore = usePermissionStore()

  if (!permissionStore.hasRole(value)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

