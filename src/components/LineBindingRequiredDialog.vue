<template>
  <v-dialog
    :model-value="show"
    persistent
    max-width="500"
    :scrim="true"
    :close-on-back="false"
    :close-on-content-click="false"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-3 bg-blue-darken-1">
        <v-icon
          icon="mdi-chat"
          :size="smAndUp ? '20' : '18'"
          color="white"
          class="me-2"
        />
        <span class="card-title text-white">綁定 LINE 帳號</span>
      </v-card-title>
      <v-card-text class="px-6 pt-5 pb-6">
        <div>
          <!-- 強制綁定說明 -->
          <div class="mb-4 px-4 py-2 bg-amber-lighten-5 rounded">
            <div class="d-flex align-center">
              <v-icon
                color="amber-darken-4"
                :size="smAndUp ? '18' : '16'"
                class="me-2"
              >
                mdi-alert-circle
              </v-icon>
              <span class="notify-title text-amber-darken-4 font-weight-bold">
                請先綁定 LINE 帳號再繼續使用系統功能
              </span>
            </div>
          </div>
          <p class="mb-3 card-content">
            請先在 LINE 中點擊「綁定帳號」按鈕，或是輸入「綁定」取得認證碼後，在此輸入 8 位數認證碼完成綁定。
          </p>
          <div class="mb-4">
            <v-otp-input
              v-model="bindingTokenInput"
              length="8"
              :min-width="smAndUp ? '360' : '280'"
              :disabled="isVerifyingToken"
              @finish="handleTokenInput"
            />
          </div>
          <div
            v-if="bindingTokenError"
            class="notify-box-error mb-6 mt-0"
          >
            <div class="d-flex align-center pe-4 d-flex align-center justify-center">
              <v-icon
                color="red-lighten-1"
                :size="smAndUp ? '18' : '16'"
                class="me-2"
              >
                mdi-alpha-x-circle
              </v-icon>
              <span class="notify-title text-red font-weight-bold">
                {{ bindingTokenError }}
              </span>
            </div>
          </div>
          <div class="notify-box">
            <div class="d-flex align-center">
              <v-icon
                color="blue-darken-1"
                :size="smAndUp ? '18' : '16'"
                class="me-2"
              >
                mdi-information-variant-circle
              </v-icon>
              <span class="font-weight-bold notify-title">
                步驟說明
              </span>
            </div>
            <ol class="mt-2 px-5">
              <li class="sub-title-1 mb-2">
                在 LINE 中搜尋 @730ulmjq 或點擊下方連結加入官方帳號
                <div class="text-center mt-3 mb-3">
                  <v-btn
                    href="https://line.me/R/ti/p/@730ulmjq"
                    target="_blank"
                    color="blue"
                    variant="outlined"
                    :size="smAndUp ? 'default' : 'small'"
                    prepend-icon="mdi-link"
                    style="background-color: #fff;"
                  >
                    Ystravel EIP 通知
                  </v-btn>
                </div>
              </li>
              <li class="sub-title-1 mb-2">
                在 LINE 中點擊「綁定帳號」按鈕，或是輸入「綁定」
              </li>
              <li class="sub-title-1 mb-2">
                系統會回傳 8 位數認證碼
              </li>
              <li class="sub-title-1 mb-2">
                在此輸入認證碼完成綁定
              </li>
            </ol>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-5 pt-0">
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          :size="smAndUp ? 'default' : 'small'"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          不綁定登出
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/stores/user'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'bound'])

const router = useRouter()
const userStore = useUserStore()

const { smAndUp } = useDisplay()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()

const bindingTokenInput = ref('')
const bindingTokenError = ref('')
const isVerifyingToken = ref(false)

// 處理登出
const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const handleTokenInput = async () => {
  if (bindingTokenInput.value.length !== 8) {
    bindingTokenError.value = '請輸入完整的 8 位數認證碼'
    return
  }

  try {
    isVerifyingToken.value = true
    bindingTokenError.value = ''
    const { data } = await apiAuth.post('/line/binding/verify', {
      bindingToken: bindingTokenInput.value
    })
    if (data.success) {
      createSnackbar({
        text: '綁定成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      bindingTokenInput.value = ''
      bindingTokenError.value = ''
      emit('bound')
      // 觸發綁定狀態變化事件，讓 profile 頁面即時更新
      window.dispatchEvent(new CustomEvent('line-binding-status-changed'))
      // 跳轉到個人資料頁面
      router.push('/profile')
    }
  } catch (error) {
    console.error('驗證認證碼失敗:', error)
    bindingTokenError.value = error.response?.data?.message || '認證碼錯誤或已過期'
  } finally {
    isVerifyingToken.value = false
  }
}
</script>

<style scoped>
.notify-title {
  font-size: 13px !important;
}

.notify-box {
  background-color: #edf7ff;
  color: #1E88E5;
  border-radius: 4px;
  padding: 8px 16px;
}

.card-content {
  font-size: 14px;
}

.sub-title-1 {
  font-size: 13px;
}

:deep(.v-otp-input__content .v-otp-input__field) {
  height: 48px !important;
}

@media (min-width: 600px) {
  .notify-title {
    font-size: 15px !important;
  }

  .card-content {
    font-size: 16px;
  }

  .sub-title-1 {
    font-size: 15px;
  }
}
</style>
