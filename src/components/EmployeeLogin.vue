<template>
  <div>
    <!-- Employee 登入按鈕 -->
    <v-btn
      v-if="!isEmployeeLoggedIn"
      color="blue-darken-3"
      prepend-icon="mdi-login-variant"
      variant="outlined"
      :loading="isLoggingIn"
      :disabled="isLoggingIn"
      @click="showLoginDialog = true"
    >
      登入
    </v-btn>

    <!-- 已登入顯示 -->
    <div
      v-else
      class="d-flex align-center"
    >
      <div class="employee-badge">
        <v-icon
          icon="mdi-account"
          size="16"
          class="me-2"
          color="blue-darken-2"
        />
        <span class="employee-name">{{ currentEmployee.name }} <span class="employee-code">({{ currentEmployee.employeeCode }})</span></span>
      </div>
      <v-btn
        icon
        size="small"
        color="grey-darken-1"
        variant="plain"
        :ripple="false"
        class="logout-btn"
        @click="handleLogout"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </div>

    <!-- 登入對話框 -->
    <v-dialog
      v-model="showLoginDialog"
      max-width="340"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 bg-blue-darken-3">
          <v-icon
            size="20"
            class="me-3"
            color="white"
          >
            mdi-login-variant
          </v-icon>
          <span class="text-white font-weight-bold card-title">登入</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeLoginDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 pt-6 pb-8">
          <div class="text-center mb-6">
            <p class="card-title mb-2">
              請使用公司 Google 帳號登入
            </p>
          </div>

          <div class="text-center">
            <GoogleLogin
              :callback="googleLoginCallback"
              :client-id="googleClientId"
              :auto-login="false"
              :ux_mode="'popup'"
              :redirect_uri="'postmessage'"
            >
              <template #default="{ signIn }">
                <v-btn
                  block
                  size="large"
                  color="blue-darken-2"
                  :loading="isLoggingIn"
                  :disabled="isLoggingIn"
                  @click="signIn"
                >
                  <v-icon
                    icon="mdi-google"
                    size="24"
                    class="me-2"
                  />
                  使用 Google 登入
                </v-btn>
              </template>
            </GoogleLogin>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'



// Emits
const emit = defineEmits(['login-success', 'logout'])

// API 與工具初始化
const { api } = useApi()
const createSnackbar = useSnackbar()

// Props
const props = defineProps({
  required: {
    type: Boolean,
    default: false
  },
  loginEndpoint: {
    type: String,
    default: '/employees/google-login'
  }
})

// Google Client ID
const googleClientId = '276416380558-pgfrsn7bb9fot96r8s3kbeu9cqghind3.apps.googleusercontent.com'

// 響應式變數
const showLoginDialog = ref(false)
const isLoggingIn = ref(false)
const currentEmployee = ref(null)

// 計算屬性
const isEmployeeLoggedIn = computed(() => {
  return !!currentEmployee.value
})

// Google 登入回調
const googleLoginCallback = async (response) => {
  try {
    isLoggingIn.value = true

    if (!response.code) {
      throw new Error('未收到 Google 授權碼')
    }

    const { data } = await api.post(props.loginEndpoint, {
      code: response.code
    })

    if (data.success) {
      // 儲存 employee 資訊到 localStorage
      localStorage.setItem('employeeAuth', JSON.stringify({
        token: data.result.token,
        employee: data.result.employee,
        timestamp: new Date().getTime()
      }))

      currentEmployee.value = data.result.employee

      // 設定 API 的 Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.result.token}`

      showLoginDialog.value = false

      createSnackbar({
        text: '登入成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      emit('login-success', data.result.employee)
    } else {
      // 登入失敗時清除localStorage
      localStorage.removeItem('employeeAuth')
      currentEmployee.value = null
      createSnackbar({
        text: data.message || '登入失敗',
        snackbarProps: { color: 'red-light-1' }
      })
    }
  } catch (error) {
    console.error('Google 登入錯誤:', error)
    // 登入失敗時清除localStorage
    localStorage.removeItem('employeeAuth')
    currentEmployee.value = null
    createSnackbar({
      text: error?.response?.data?.message || 'Google 登入失敗，請稍後再試',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoggingIn.value = false
  }
}

// 關閉登入對話框
const closeLoginDialog = () => {
  if (!isLoggingIn.value) {
    showLoginDialog.value = false
  }
}

// 登出處理
const handleLogout = () => {
  localStorage.removeItem('employeeAuth')
  currentEmployee.value = null

  createSnackbar({
    text: '已登出員工帳號',
    snackbarProps: { color: 'teal-lighten-1' }
  })

  emit('logout')
}

// 檢查登入狀態
const checkLoginStatus = () => {
  const authData = localStorage.getItem('employeeAuth')
  if (authData) {
    try {
      const { token, employee, timestamp } = JSON.parse(authData)
      const now = new Date().getTime()
      const expiryTime = timestamp + (1 * 60 * 60 * 1000) // 1小時過期

      if (now <= expiryTime) {
        currentEmployee.value = employee
        // 更新 API 的預設 headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // 通知父組件登入狀態
        emit('login-success', employee)
      } else {
        localStorage.removeItem('employeeAuth')
        currentEmployee.value = null
        emit('logout')
      }
    } catch (error) {
      console.error('解析登入資料失敗:', error)
      localStorage.removeItem('employeeAuth')
      currentEmployee.value = null
      emit('logout')
    }
  }
}

// 初始化
onMounted(() => {
  checkLoginStatus()
})

// 暴露方法給父組件
defineExpose({
  currentEmployee,
  isEmployeeLoggedIn,
  handleLogout
})
</script>

<style lang="scss" scoped>
.employee-badge {
  display: flex;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 5px 10px;
  margin-right: 4px;

  .employee-name {
    font-size: 15px;
    font-weight: 600;
    color: #495057;
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
  }
}

.employee-code {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  letter-spacing: 0.2px;
  margin-left: 4px;
}

.logout-btn {
  &:hover {
    color: #dc3545 !important;
  }
}
</style>
