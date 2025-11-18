/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior (to, from) {
    // 只有當路徑發生變化時，才滾動到頂部
    if (to.path !== from.path) {
      return { top: 0 }
    }
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

router.beforeEach(async (to, from, next) => {
  const user = useUserStore()
  const permissionStore = usePermissionStore()

  if (from === START_LOCATION) {
    // 只有在用戶已登入時才載入用戶資料和權限
    if (user.isLogin) {
      try {
        await user.profile()
        await permissionStore.loadUserPermissions()
      } catch (error) {
        console.error('載入用戶資料失敗:', error)
        // 如果載入失敗，清除登入狀態
        user.logout()
      }
    }
  }

  // 如果已登入且要訪問登入頁面，重導向到首頁
  if (user.isLogin && ['/login'].includes(to.path)) {
    next('/')
  }
  // 如果未登入且要訪問需要登入的頁面，重導向到登入頁面
  else if (to.meta.login && !user.isLogin) {
    next('/login')
  }
  // 如果未登入且要訪問首頁，重導向到登入頁面
  else if (to.path === '/' && !user.isLogin) {
    next('/login')
  }
  // 檢查權限（新系統）
  else if (to.meta.permission || to.meta.permissions) {
    let hasPermission = false
    
    if (to.meta.permission) {
      // 單一權限檢查
      hasPermission = permissionStore.hasPermission(to.meta.permission)
    } else if (to.meta.permissions) {
      // 多權限檢查
      hasPermission = to.meta.requireAll
        ? permissionStore.hasAllPermissions(to.meta.permissions)
        : permissionStore.hasAnyPermission(to.meta.permissions)
    }

    if (!hasPermission) {
      next('/') // 重導向到首頁或無權限頁面
      return
    } else {
      next() // 有權限，繼續導航
    }
  }
  // 檢查使用者角色是否匹配路由的角色要求（舊系統，向後相容）
  else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    next('/')
  }
  else {
    next()
  }
})

router.afterEach((to) => {
  document.title = to.meta.title
}) // 設定網頁標題
export default router
