<template>
  <v-container
    max-width="1400"
    class="pa-8"
  >
    <!-- 歡迎標題 -->
    <v-row>
      <v-col cols="12">
        <div class="text-center hero-section">
          <h1 class="hero-title mb-4">
            永信生活旅遊事業 <br>
            <span class="gradient-text">綜合管理系統</span>
          </h1>



          <div class="hero-description">
            <div class="navigation-hint">
              <v-icon
                color="primary"
                size="20"
                class="me-2"
              >
                mdi-arrow-left-circle
              </v-icon>
              <span class="text-body-2 text-grey-darken-1">
                請點擊左側選單進入主系統各頁面
              </span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 重要子系統快速入口 -->
    <v-row class="justify-center">
      <v-col cols="12">
        <div class="text-center mb-2">
          <div class="section-badge mb-2">
            <v-chip
              size="small"
              color="secondary"
              variant="outlined"
              class="px-4"
            >
              <v-icon
                start
                size="16"
              >
                mdi-rocket-launch
              </v-icon>
              快速入口
            </v-chip>
          </div>
          <h2 class="section-title ">
            其他子系統
          </h2>
        </div>
      </v-col>
      <!-- 專案與任務管理卡片 -->
      <v-col
        cols="12"
        md="6"
        lg="4"
        class="mb-6 px-4"
      >
        <v-card
          class="feature-card h-100"
          elevation="3"
          hover
          @click="navigateToProjectTask"
        >
          <v-card-title class="d-flex align-center pa-6">
            <v-avatar
              color="teal-darken-2"
              size="48"
              class="me-4"
            >
              <v-icon
                size="24"
                color="white"
              >
                mdi-chart-box-outline
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="sub-system-title-card-title text-grey-darken-3">
                專案與任務管理
              </h3>
              <p class="sub-title text-grey-darken-1 mb-0">
                專案協作平台
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <div class="feature-description">
              <p class="text-grey-darken-2 mb-4">
                管理您的專案、任務和團隊協作，提供完整的專案管理解決方案。
              </p>

              <div class="feature-highlights">
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="teal-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">專案建立與管理</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="teal-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">任務分配與追蹤</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="teal-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">團隊協作功能</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    size="16"
                    color="teal-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">進度監控與報告</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn
              color="teal-darken-2"
              variant="elevated"
              size="large"
              block
              prepend-icon="mdi-arrow-right"
            >
              進入專案管理
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 直客詢問統計表卡片 -->
      <v-col
        cols="12"
        md="6"
        lg="4"
        class="mb-6 px-4"
      >
        <v-card
          class="feature-card h-100"
          elevation="3"
          hover
          @click="navigateToB2CStatistics"
        >
          <v-card-title class="d-flex align-center pa-6">
            <v-avatar
              color="blue-darken-2"
              size="48"
              class="me-4"
            >
              <v-icon
                size="24"
                color="white"
              >
                mdi-chart-line
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="sub-system-title-card-title text-grey-darken-3">
                直客詢問統計表
              </h3>
              <p class="sub-title text-grey-darken-1 mb-0">
                客戶詢問數據紀錄
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <div class="feature-description">
              <p class="text-grey-darken-2 mb-4">
                查看並記錄客戶詢問資料，追蹤各業務績效及客戶互動情況。
              </p>

              <div class="feature-highlights">
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="blue-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">客戶詢問追蹤</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="blue-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">業務績效分析</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="blue-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">數據統計報表</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    size="16"
                    color="blue-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">即時數據更新</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn
              color="blue-darken-2"
              variant="elevated"
              size="large"
              block
              prepend-icon="mdi-arrow-right"
            >
              查看統計表
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 行銷美編需求申請卡片 -->
      <v-col
        cols="12"
        md="6"
        lg="4"
        class="mb-6 px-4"
      >
        <v-card
          class="feature-card h-100"
          elevation="3"
          hover
          @click="navigateToMarketingDesign"
        >
          <v-card-title class="d-flex align-center pa-6">
            <v-avatar
              color="purple-darken-2"
              size="48"
              class="me-4"
            >
              <v-icon
                size="24"
                color="white"
              >
                mdi-file-document-edit-outline
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="sub-system-title-card-title text-grey-darken-3">
                行銷美編需求申請
              </h3>
              <p class="sub-title text-grey-darken-1 mb-0">
                美編設計產物申請
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <div class="feature-description">
              <p class="text-grey-darken-2 mb-4">
                申請行銷美編設計需求，包含印刷品、DM、地圖等各種設計需求。
              </p>

              <div class="feature-highlights">
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="purple-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">設計需求申請</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="purple-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">進度追蹤管理</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="16"
                    color="purple-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">檔案上傳下載</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    size="16"
                    color="purple-darken-2"
                    class="me-2"
                  >
                    mdi-check-circle
                  </v-icon>
                  <span class="text-body-2">多種設計類型</span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn
              color="purple-darken-2"
              variant="elevated"
              size="large"
              block
              prepend-icon="mdi-arrow-right"
            >
              申請美編需求
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- 預設密碼修改提示對話框 -->
  <v-dialog
    v-model="showDefaultPasswordDialog"
    persistent
    max-width="380"
  >
    <v-card class="rounded-lg pb-1">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-red-darken-1 mb-4">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-alert-circle
        </v-icon>
        <span
          class="card-title text-white"
          style="padding: 10px 0;"
        >請立即修改密碼</span>
        <v-spacer />
      </v-card-title>
      <v-card-text class="pb-0">
        <v-alert
          type="warning"
          color="red-darken-1"
          variant="tonal"
          class="mb-0 font-weight-bold"
        >
          為了您的帳戶安全，請立即修改系統密碼。
        </v-alert>
      </v-card-text>
      <v-card-actions class="me-4 mb-3 mt-4">
        <v-spacer />
        <v-btn
          color="red-darken-1"
          variant="flat"
          :size="buttonSize"
          @click="handleDefaultPasswordPrompt"
        >
          立即修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 修改密碼對話框 -->
  <v-dialog
    v-model="showPasswordDialog"
    persistent
    max-width="320"
  >
    <v-card class="rounded-lg pb-1">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-darken-2 mb-4">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-lock
        </v-icon>
        <span
          class="card-title text-white"
          style="padding: 10px 0;"
        >修改密碼</span>
        <v-spacer />
      </v-card-title>
      <v-card-text class="pb-0">
        <v-form @submit.prevent="handlePasswordChange">
          <v-text-field
            v-model="passwordForm.currentPassword"
            :error-messages="currentPasswordError"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="當前密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="currentPasswordError = ''"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />
          <v-text-field
            v-model="passwordForm.newPassword"
            :error-messages="newPasswordError"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="newPasswordError = ''"
            @click:append-inner="showNewPassword = !showNewPassword"
          />
          <v-text-field
            v-model="passwordForm.confirmPassword"
            :error-messages="confirmPasswordError"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            label="確認新密碼"
            variant="outlined"
            density="compact"
            class="mb-4"
            @update:model-value="confirmPasswordError = ''"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />
          <v-btn
            type="submit"
            style="display: none"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="me-4 mb-3">
        <v-spacer />
        <v-btn
          color="blue-darken-2"
          variant="outlined"
          :size="buttonSize"
          :loading="isChangingPassword"
          @click="handlePasswordChange"
        >
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { ref, onMounted, nextTick, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'

// 頁面定義
definePage({
  meta: {
    title: '首頁 | Ystravel',
    login: true,
    permission: 'HOME_READ'
  }
})

const { mdAndUp } = useDisplay()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()

// 預設密碼提醒相關
const showDefaultPasswordDialog = ref(false)
const showPasswordDialog = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

// 導航函數
const navigateToProjectTask = () => {
  router.push('/projectAndTaskManagement')
}

const navigateToB2CStatistics = () => {
  router.push('/B2CStatisticsSales')
}

const navigateToMarketingDesign = () => {
  router.push('/marketingDesignRequest')
}

// 密碼驗證函數
const validatePasswordForm = () => {
  let isValid = true

  if (!passwordForm.value.currentPassword) {
    currentPasswordError.value = '請輸入當前密碼'
    isValid = false
  }

  if (!passwordForm.value.newPassword) {
    newPasswordError.value = '請輸入新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 8) {
    newPasswordError.value = '新密碼長度至少需要8個字元'
    isValid = false
  }

  if (!passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '請確認新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    confirmPasswordError.value = '兩次輸入的密碼不相符'
    isValid = false
  }

  return isValid
}

// 處理預設密碼提示對話框
const handleDefaultPasswordPrompt = () => {
  showDefaultPasswordDialog.value = false
  nextTick(() => {
    setTimeout(() => {
      showPasswordDialog.value = true
    }, 150)
  })
}

// 修改密碼成功後更新狀態
const handlePasswordChange = async () => {
  if (!validatePasswordForm()) return

  try {
    isChangingPassword.value = true
    const result = await user.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )

    createSnackbar({
      text: result.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    user.isDefaultPasswordChanged = true
    closePasswordDialog()
  } catch (error) {
    createSnackbar({
      text: error.message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isChangingPassword.value = false
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// 在組件掛載時檢查是否需要顯示預設密碼提示
onMounted(() => {
  if (user.isLogin && !user.isDefaultPasswordChanged) {
    showDefaultPasswordDialog.value = true
  }
})
</script>

<style lang="scss" scoped>
// Hero Section Styles
.hero-section {
  padding: 2rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.gradient-text {
  font-size: 2.4rem;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  margin-top: 2rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
  font-weight: 400;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 1.5rem;
}

.navigation-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background: rgba(25, 118, 210, 0.08);
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid rgba(25, 118, 210, 0.15);

  .v-icon {
    color: #1976d2;
  }

  span {
    font-weight: 500;
    color: #555;
  }
}

// Section Styles
.section-badge {
  .v-chip {
    font-weight: 500;
    letter-spacing: 0.3px;
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  font-weight: 400;
  max-width: 500px;
  margin: 0 auto;
}

// Card Styles
.feature-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 20px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1) !important;
  }
}

.card-header {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-bottom: 1px solid #f0f0f0;
}

.sub-system-title-card-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
}


.card-subtitle {
  font-size: 1rem;
  color: #666;
  font-weight: 400;
}

.feature-description {
  p {
    font-size: 15px;
    line-height: 1.6;
    color: #555;
  }
}

.feature-highlights {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #f0f0f0;

  .v-icon {
    color: #1976d2;
  }

  span {
    font-weight: 500;
    color: #444;
  }
}


// Bottom Info Card
.v-card {
  border-radius: 16px;

  &.info-card {
    background: linear-gradient(135deg, #f8f9fa, #ffffff);
  }
}

// Responsive Design
@media (max-width: 960px) {
  .feature-card {
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2.8rem;
  }

  .section-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 600px) {
  .feature-card {
    margin-bottom: 16px;
  }

  .feature-description {
    min-height: auto;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }
}
</style>
