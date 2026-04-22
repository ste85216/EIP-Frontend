<template>
  <div id="app-scale-wrapper">
    <v-app>
      <v-main>
        <router-view />
      </v-main>
      <ScrollToTop />
      <LineBindingRequiredDialog
        :show="showBindingDialog"
        @bound="handleLineBound"
      />
    </v-app>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import ScrollToTop from '@/components/ScrollToTop.vue'
import LineBindingRequiredDialog from '@/components/LineBindingRequiredDialog.vue'
import { useApi } from '@/composables/axios'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const { apiAuth } = useApi()

const showBindingDialog = ref(false)
const lineBindingStatus = ref({
  isBound: false
})

// 檢查是否啟用強制 LINE 綁定（開發環境可通過環境變數關閉）
const isLineBindingRequired = () => {
  // 檢查環境變數
  const envRequire = import.meta.env.VITE_REQUIRE_LINE_BINDING
  if (envRequire === 'false' || envRequire === false) {
    return false
  }

  // 預設為 true（生產環境必須綁定）
  return true
}

// 檢查 LINE 綁定狀態
const checkLineBinding = async () => {
  if (!userStore.isLogin) {
    showBindingDialog.value = false
    return
  }

  // 系統帳號不需要綁定 LINE
  if (userStore.isSystemAccount) {
    showBindingDialog.value = false
    return
  }

  // 排除不需要登入的頁面（如 B2CStatisticsSales）
  const excludedPaths = ['/B2CStatisticsSales']
  if (excludedPaths.includes(route.path)) {
    showBindingDialog.value = false
    return
  }

  // 如果開發模式關閉了強制綁定，則跳過檢查
  if (!isLineBindingRequired()) {
    showBindingDialog.value = false
    return
  }

  try {
    const { data } = await apiAuth.get('/line/binding/status')
    if (data.success) {
      lineBindingStatus.value = data.data
      // 如果未綁定，顯示強制綁定對話框
      showBindingDialog.value = !lineBindingStatus.value.isBound
    }
  } catch (error) {
    console.error('載入 LINE 綁定狀態失敗:', error)
    showBindingDialog.value = false
  }
}

// 處理綁定成功
const handleLineBound = async () => {
  // 綁定成功後關閉對話框
  showBindingDialog.value = false
  await checkLineBinding()
}

// 監聽登入狀態變化
watch(() => userStore.isLogin, (isLogin) => {
  if (isLogin) {
    checkLineBinding()
  } else {
    showBindingDialog.value = false
  }
})

// 監聽路由變化
watch(() => route.path, () => {
  if (userStore.isLogin) {
    checkLineBinding()
  }
})

// 監聽 LINE 綁定狀態變化事件（用於解除綁定後立即檢查）
onMounted(async () => {
  appStore.applyScale(appStore.uiScale)
  if (userStore.isLogin) {
    // 確保用戶資料已載入（包含 isSystemAccount）
    try {
      await userStore.profile()
    } catch (error) {
      console.error('載入用戶資料失敗:', error)
    }
    // 載入完成後再檢查綁定狀態
    checkLineBinding()
  }

  // 監聽自定義事件，當綁定狀態改變時重新檢查
  window.addEventListener('line-binding-status-changed', checkLineBinding)
})

// 組件卸載時移除事件監聽
onUnmounted(() => {
  window.removeEventListener('line-binding-status-changed', checkLineBinding)
})

// 監聽縮放變化並套用到全域
watch(() => appStore.uiScale, (newScale) => {
  appStore.applyScale(newScale)
}, { immediate: true })

</script>
