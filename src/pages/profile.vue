<template>
  <v-container max-width="2100">
    <v-row>
      <v-col
        v-if="isLgmUp"
        md="3"
        class="pe-0"
      >
        <v-row class="elevation-4 rounded-lg pt-10 pb-9 px-1 px-sm-10 mt-2 mt-sm-6 ms-4 me-2 mx-xl-12 bg-white">
          <v-card
            width="100%"
            elevation="0"
          >
            <v-row class="text-center">
              <v-col cols="12">
                <UserAvatar
                  :user="user"
                  size="100"
                />
              </v-col>
              <v-col>
                <div class="name mb-3 opacity-90">
                  {{ user.name }}
                </div>
                <div class="text-subtitle-2 mb-4 opacity-70">
                  {{ user.userId }}
                </div>
                <div
                  style="font-size: 15px; font-weight: 600;"
                  class="opacity-90 mb-10"
                >
                  {{ getDisplayRole() }}
                </div>
                <v-row
                  v-if="isLgmUp"
                  class="justify-center"
                >
                  <v-col class="py-3">
                    <FileUploadButton />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </v-col>
      <v-col xl="9">
        <v-row class="elevation-4 rounded-lg pt-3 pt-sm-6 pb-6 px-2 px-sm-4 mt-2 mt-sm-6 mx-0 mx-md-4 me-xl-12 mb-4 bg-white">
          <v-col
            cols="12"
            class="d-flex justify-space-between align-center"
          >
            <h3>
              個人資料管理&nbsp;&nbsp;&nbsp;
              <span
                v-if="mdAndUp"
                class="text-subtitle-2 opacity-80 font-weight-regular"
              >
                <span class="text-red-darken-2">* </span>若有需要修改 請聯絡管理者 ( 密碼可自行修改 )
              </span>
            </h3>

            <div>
              <v-row>
                <v-col class="d-flex justify-center">
                  <!-- 更換大頭貼按鈕 - 只在 1500px 以下顯示 -->
                  <FileUploadButton v-if="!isLgmUp" />

                  <!-- 更換背景圖片按鈕 -->
                  <v-btn
                    v-if="mdAndUp"
                    v-tooltip:top="'變更背景圖片'"
                    icon
                    color="blue-grey-darken-2"
                    size="32"
                    class="me-4"
                    elevation="2"
                    @click="showBackgroundDialog = true"
                  >
                    <v-icon size="18">
                      mdi-image
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-else
                    icon
                    color="blue-grey-darken-2"
                    size="32"
                    class="me-4"
                    elevation="2"
                    @click="showBackgroundDialog = true"
                  >
                    <v-icon size="18">
                      mdi-image
                    </v-icon>
                  </v-btn>

                  <!-- 修改密碼按鈕 -->
                  <v-btn
                    v-if="mdAndUp"
                    v-tooltip:top="'修改密碼'"
                    icon
                    color="light-blue-darken-3"
                    size="32"
                    elevation="2"
                    @click="showPasswordDialog = true"
                  >
                    <v-icon size="18">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-else
                    icon
                    color="light-blue-darken-3"
                    size="32"
                    elevation="2"
                    @click="showPasswordDialog = true"
                  >
                    <v-icon size="18">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <v-col>
            <v-divider class="mb-5" />
          </v-col>
          <!-- <v-col
            cols="12"
            class="mt-3 mb-6 text-center text-purple-darken-4"
          >
            <div class="info-title">
              《 基本資料 》
            </div>
          </v-col> -->
          <v-col cols="12">
            <v-row class="text-blue-grey-darken-2">
              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    姓名 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <div class="profile-text-field">
                      {{ user.name }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    Email :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <div class="profile-text-field">
                      {{ user.email }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0 pe-0 pe-sm-2"
                  >
                    用戶編號 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <div class="profile-text-field">
                      {{ user.isAdmin ? user.adminId : user.userId }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    權限 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <div class="profile-text-field">
                      {{ getDisplayRole() }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <!-- <v-col
                class="py-0 mb-6"
                cols="12"
                sm="6"
                md="4"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="12"
                    class="align-self-center py-0"
                  >
                    備註 :
                  </v-col>
                  <v-col
                    cols="9"
                    sm="12"
                  >
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.note"
                    />
                  </v-col>
                </v-row>
              </v-col> -->
            </v-row>
          </v-col>

          <!-- LINE 綁定區塊 -->
          <v-col cols="12">
            <v-divider />
          </v-col>
          <v-col
            cols="12"
            class="pa-0"
          >
            <v-card
              elevation="0"
            >
              <v-card-title class="d-flex align-center mb-2">
                <v-icon
                  class="me-2"
                  color="green-darken-1"
                  :size="smAndUp ? '20' : '16'"
                >
                  mdi-chat
                </v-icon>
                <span class="profile-sub-title">LINE 通知設定</span>
              </v-card-title>

              <v-card-text>
                <!-- 綁定狀態 -->
                <div
                  v-if="lineBindingStatus.isBound"
                >
                  <div
                    class="py-3 notify-box-success"
                  >
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon
                          color="green-darken-1"
                          :size="smAndUp ? '18' : '16'"
                          class="me-2 me-sm-3"
                        >
                          mdi-check-circle
                        </v-icon>
                        <div>
                          <div class="font-weight-bold notify-title">
                            已綁定 LINE 帳號
                          </div>
                          <div
                            v-if="lineBindingStatus.lineBoundAt"
                            class="notify-text"
                          >
                            綁定時間：{{ formatDate(lineBindingStatus.lineBoundAt) }}
                          </div>
                        </div>
                      </div>
                      <v-btn
                        color="grey"
                        elevation="1"
                        :size="smAndUp ? 'small' : 'x-small'"
                        :loading="isUnbinding"
                        class="ms-2"
                        @click="showUnbindConfirmDialog = true"
                      >
                        解除綁定
                      </v-btn>
                    </div>
                  </div>
                </div>

                <div v-else>
                  <div
                    class="py-3 notify-box"
                  >
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon
                          color="blue-darken-1"
                          :size="smAndUp ? '18' : '15'"
                          class="me-2"
                        >
                          mdi-information
                        </v-icon>
                        <span class="font-weight-bold notify-title">尚未綁定 LINE 帳號</span>
                      </div>
                      <v-btn
                        color="blue"
                        elevation="1"
                        :size="smAndUp ? 'small' : 'x-small'"
                        @click="showBindingDialog = true"
                      >
                        綁定 LINE 帳號
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 通知偏好設定區塊 -->
          <v-col
            cols="12"
            class="pa-0"
          >
            <v-card elevation="0">
              <v-card-title class="profile-sub-title">
                通知偏好設定
              </v-card-title>
              <v-card-text>
                <v-checkbox
                  v-model="notificationPrefs.email"
                  label="&nbsp;EMAIL 通知"
                  density="compact"
                  hide-details
                  class="mb-2"
                  color="blue-grey-darken-2"
                  @update:model-value="updateNotificationPreferences"
                />
                <v-checkbox
                  v-model="notificationPrefs.line"
                  label="&nbsp;LINE 通知"
                  :disabled="!lineBindingStatus.isBound"
                  density="compact"
                  hide-details
                  class="mb-2"
                  color="blue-grey-darken-2"
                  @update:model-value="updateNotificationPreferences"
                />
                <v-checkbox
                  v-model="notificationPrefs.inbox"
                  label="&nbsp;內部收件匣通知"
                  density="compact"
                  hide-details
                  color="blue-grey-darken-2"
                  @update:model-value="updateNotificationPreferences"
                />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 顯示設定區塊 -->
          <v-col
            cols="12"
            class="pa-0"
          >
            <v-card elevation="0">
              <v-card-title class="profile-sub-title">
                顯示設定
              </v-card-title>
              <v-card-text>
                <div class="mb-3">
                  <div class="mb-2 sub-title-1 text-blue-grey-darken-2">
                    介面縮放：
                  </div>
                  <v-radio-group
                    v-model="selectedScale"
                    inline
                    density="compact"
                    hide-details
                    @update:model-value="handleScaleChange"
                  >
                    <v-radio
                      label="100%"
                      :value="100"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-radio
                      label="125%"
                      :value="125"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-radio
                      label="150%"
                      :value="150"
                      color="blue-grey-darken-2"
                    />
                  </v-radio-group>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <!-- LINE 綁定對話框 -->
  <v-dialog
    v-model="showBindingDialog"
    max-width="480"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-darken-1 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-chat
        </v-icon>
        <span class="card-title text-white">綁定 LINE 帳號</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="closeBindingDialog"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pb-0">
        <div v-if="bindingToken">
          <p class="mb-3 card-content">
            請在 LINE 中輸入以下認證碼：
          </p>
          <v-text-field
            :model-value="bindingToken"
            readonly
            variant="outlined"
            density="compact"
            :append-inner-icon="'mdi-content-copy'"
            @click:append-inner="copyToken"
          />
          <div
            class="notify-box"
          >
            <div class="d-flex align-center">
              <v-icon
                color="blue-darken-1"
                :size="smAndUp ? '18' : '16'"
                class="me-2"
              >
                mdi-information
              </v-icon>
              <span class="font-weight-bold notify-title">
                認證碼將在 {{ formatExpiresAt(bindingExpiresAt) }} 過期
              </span>
            </div>
          </div>
          <ol class="mt-4 px-4">
            <li class="sub-title-1 mb-2">
              在 LINE 中搜尋 @310ikxxu 或點擊下方連結加入官方帳號
              <div class="text-center mt-5 mb-4">
                <v-btn
                  href="https://line.me/R/ti/p/@310ikxxu"
                  target="_blank"
                  color="blue-darken-1"
                  variant="outlined"
                  :size="buttonSize"
                  prepend-icon="mdi-link"
                >
                  Ystravel EIP 通知
                </v-btn>
              </div>
            </li>
            <li class="sub-title-1 mb-2">
              輸入「{{ bindingToken }}」
            </li>
            <li class="sub-title-1 mb-2">
              等待綁定成功訊息
            </li>
          </ol>
        </div>
        <div v-else>
          <p class="mb-4 card-content">
            點擊下方按鈕產生認證碼，並在 LINE 中輸入所產生之「 8位數認證碼 」來完成綁定。
          </p>
          <v-btn
            color="blue-darken-1"
            variant="outlined"
            :size="buttonSize"
            :loading="isGeneratingToken"
            @click="generateBindingToken"
          >
            產生認證碼
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions class="me-4 mb-3">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="closeBindingDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- 修改密碼對話框 -->
  <v-dialog
    v-model="showPasswordDialog"
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
        <span class="card-title text-white">修改密碼</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="closePasswordDialog"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
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
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          class="me-2"
          @click="closePasswordDialog"
        >
          取消
        </v-btn>
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

  <!-- 預設密碼提醒已移至首頁處理 -->


  <!-- 背景圖片選擇對話框 -->
  <BackgroundImageDialog
    v-model="showBackgroundDialog"
    :current-background="user.backgroundImage"
    :is-updating="isUpdatingBackground"
    @confirm="handleBackgroundChange"
    @show-usage-stats="showUsageStatsDialog = true"
  />

  <!-- 背景圖片使用統計對話框 -->
  <BackgroundImageUsageStatsDialog
    v-model="showUsageStatsDialog"
  />

  <!-- 解除綁定確認對話框 -->
  <ConfirmDialog
    v-model="showUnbindConfirmDialog"
    dialog-width="320"
    title="解除 LINE 綁定"
    message="您確定要解除 LINE 帳號綁定嗎？解除後將無法接收 LINE 通知。"
    confirm-button-color="red-darken-1"
    confirm-button-text="確認解除"
    cancel-button-text="取消"
    header-color="bg-red-lighten-1"
    header-icon="mdi-alert-circle"
    @confirm="executeUnbind"
  />
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { computed, ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'
import FileUploadButton from '@/components/FileUploadButton.vue'
import BackgroundImageDialog from '@/components/BackgroundImageDialog.vue'
import BackgroundImageUsageStatsDialog from '@/components/BackgroundImageUsageStatsDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useApi } from '@/composables/axios'

const { mdAndUp, width, smAndUp } = useDisplay()
const isLgmUp = computed(() => width.value >= 1500)

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

definePage({
  meta: {
    title: '個人資料管理 | Ystravel',
    login: true,
    permission: 'PROFILE_READ'
  }
})

const showPasswordDialog = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)


const showBackgroundDialog = ref(false)
const isUpdatingBackground = ref(false)
const showUsageStatsDialog = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const user = useUserStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()

// 介面縮放設定
const selectedScale = ref(appStore.uiScale)

// 處理縮放變更
const handleScaleChange = (size) => {
  appStore.setScale(size)
  createSnackbar({
    text: `介面縮放已設定為 ${size}%`,
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 監聽 store 中的縮放變化
watch(() => appStore.uiScale, (newSize) => {
  selectedScale.value = newSize
})

// RBAC 角色相關
const userRbacRoles = ref([])


const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}




// 獲取用戶 RBAC 角色
const loadUserRbacRoles = async () => {
  if (!user.isLogin) return

  try {
    const result = await permissionStore.getUserRoles(user._id)
    userRbacRoles.value = result || []
  } catch (error) {
    console.error('載入用戶角色失敗:', error)
    userRbacRoles.value = []
  }
}

// 顯示角色資訊的函數
const getDisplayRole = () => {
  if (userRbacRoles.value.length === 0) {
    // 如果沒有 RBAC 角色，回退到舊的 role 系統
    return getRoleTitle(user.role) || '未知'
  }

  if (userRbacRoles.value.length === 1) {
    return userRbacRoles.value[0].role?.name || '未知角色'
  }

  // 多個角色時，根據 level 排序，顯示權重最高的角色
  const sortedRoles = userRbacRoles.value.sort((a, b) => {
    const levelA = a.role?.level || 0
    const levelB = b.role?.level || 0

    // 先按 level 排序（降序）
    if (levelA !== levelB) {
      return levelB - levelA
    }

    // 如果 level 相同，按角色名稱排序（升序）
    const nameA = a.role?.name || ''
    const nameB = b.role?.name || ''
    return nameA.localeCompare(nameB)
  })

  return sortedRoles[0].role?.name || '未知角色'
}



  // 處理背景圖片變更
  const handleBackgroundChange = async (selectedBackground) => {
    try {
      isUpdatingBackground.value = true
      await user.updateBackgroundImage(selectedBackground)

      createSnackbar({
        text: '背景圖片更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      showBackgroundDialog.value = false
    } catch (error) {
      createSnackbar({
        text: error.message,
        snackbarProps: { color: 'red-lighten-1' }
      })
    } finally {
      isUpdatingBackground.value = false
    }
  }

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

// 預設密碼提醒已移至首頁處理

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

const isProfileAvatarLoaded = ref(false)

const handleProfileAvatarLoad = () => {
  setTimeout(() => {
    isProfileAvatarLoaded.value = true
  }, 100)
}

watch(() => user.avatar, (newAvatar) => {
  if (newAvatar) {
    isProfileAvatarLoaded.value = false
    const img = new Image()
    img.onload = () => {
      handleProfileAvatarLoad()
    }
    img.onerror = () => {
      handleProfileAvatarLoad()
    }
    img.src = newAvatar
  } else {
    // 沒有頭像時，直接設置為已載入
    isProfileAvatarLoaded.value = true
  }
}, { immediate: true })

// LINE 綁定相關
const lineBindingStatus = ref({
  isBound: false,
  lineUserId: null,
  lineDisplayName: null,
  linePictureUrl: null,
  lineBoundAt: null,
  notificationPreferences: {
    email: true,
    line: false,
    inbox: true
  }
})

const notificationPrefs = ref({
  email: true,
  line: false,
  inbox: true
})

const showBindingDialog = ref(false)
const bindingToken = ref('')
const bindingExpiresAt = ref(null)
const isGeneratingToken = ref(false)
const isUnbinding = ref(false)
const showUnbindConfirmDialog = ref(false)

// 載入綁定狀態
const loadBindingStatus = async () => {
  try {
    const { data } = await apiAuth.get('/line/binding/status')
    if (data.success) {
      lineBindingStatus.value = data.data
      notificationPrefs.value = {
        email: data.data.notificationPreferences?.email ?? true,
        line: data.data.notificationPreferences?.line ?? false,
        inbox: data.data.notificationPreferences?.inbox ?? true
      }
    }
  } catch (error) {
    console.error('載入綁定狀態失敗:', error)
  }
}

// 產生綁定 Token
const generateBindingToken = async () => {
  try {
    isGeneratingToken.value = true
    const { data } = await apiAuth.post('/line/binding/generate')
    if (data.success) {
      bindingToken.value = data.data.bindingToken
      bindingExpiresAt.value = data.data.expiresAt
      createSnackbar({
        text: '認證碼產生成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('產生認證碼失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '產生認證碼失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isGeneratingToken.value = false
  }
}

// 執行解除綁定
const executeUnbind = async () => {
  try {
    isUnbinding.value = true
    const { data } = await apiAuth.delete('/line/binding')
    if (data.success) {
      createSnackbar({
        text: '解除綁定成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await loadBindingStatus()
    }
  } catch (error) {
    console.error('解除綁定失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '解除綁定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUnbinding.value = false
  }
}

// 更新通知偏好設定
const updateNotificationPreferences = async () => {
  try {
    const { data } = await apiAuth.put('/line/notification-preferences', {
      email: notificationPrefs.value.email,
      line: notificationPrefs.value.line,
      inbox: notificationPrefs.value.inbox
    })
    if (data.success) {
      createSnackbar({
        text: '通知偏好設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新通知偏好設定失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '更新通知偏好設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 複製認證碼
const copyToken = async () => {
  try {
    await navigator.clipboard.writeText(bindingToken.value)
    createSnackbar({
      text: '認證碼已複製到剪貼簿',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('複製失敗:', error)
    createSnackbar({
      text: '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-TW')
}

const formatExpiresAt = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-TW')
}

// 關閉綁定對話框
const closeBindingDialog = () => {
  showBindingDialog.value = false
  bindingToken.value = ''
  bindingExpiresAt.value = null
}

// 組件掛載時載入 RBAC 角色和 LINE 綁定狀態
onMounted(async () => {
  await loadUserRbacRoles()
  await loadBindingStatus()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

.v-alert {
  font-size: 0.96rem;
  :deep(.v-icon) {
    font-size: 22px !important;
  }
}

.notify-title {
  font-size: 13px !important;
  font-weight: 600;
}

.notify-box {
  background-color: #E3F2FD;
  color: #1E88E5;
  border-radius: 4px;
  padding: 8px 16px;
}

.notify-box-success {
  background-color: #E8F5E9;
  color: #4CAF50;
  border-radius: 4px;
  padding: 8px 16px;
}

.notify-text {
  font-size: 10px !important;
}

.profile-text-field {
  border: 1px solid #90A4AE;
  border-radius: 4px;
  padding: 8px 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-col-sm-12 {
  font-size: 13px;
}

.profile-sub-title {
  font-size: 14px !important;
  font-weight: 600;
  color: #424242;
}

.v-checkbox{
    font-size: 11px !important;
  }
  .v-checkbox:deep(.v-label) {
    font-size: 13px !important;
  }

@media (min-width: 600px) {
  .v-col-sm-12 {
    font-size: 15px;
  }
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
}

.name {
  font-size: 15px;
  font-weight: 600;
}

@include rwd.sm {
  .name {
    font-size: 18px;
  }

  .notify-title {
    font-size: 15px !important;
    font-weight: 600;
  }

  .notify-text {
  font-size: 12px !important;
  }

  .profile-sub-title {
    font-size: 16px !important;
  }

  .v-checkbox{
    font-size: 13px !important;
  }
  .v-checkbox:deep(.v-label) {
    font-size: 15px !important;
  }
}
</style>
