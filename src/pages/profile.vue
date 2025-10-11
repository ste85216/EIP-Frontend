<template>
  <v-container max-width="2100">
    <v-row>
      <v-col
        v-if="isLgmUp"
        md="3"
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
                  <span v-tooltip:end="user.isAdmin ? '管理者編號' : '使用者編號'">
                    {{ user.isAdmin ? user.adminId : user.userId }}
                  </span>
                </div>
                <div
                  style="font-size: 15px; font-weight: 600;"
                  class="opacity-90 mb-10"
                >
                  {{ getDisplayRole() }}
                </div>
                <v-row class="justify-center">
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
        <v-row class="elevation-4 rounded-lg pt-3 pt-sm-6 pb-6 px-2 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-0 me-xl-12 mb-4 bg-white">
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
                <v-col>
                  <v-btn
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
                    v-if="mdAndUp"
                    :size="buttonSize"
                    class="me-4"
                    color="blue-grey-darken-2"
                    prepend-icon="mdi-account"
                    variant="outlined"
                    @click="showUserListDialog = true"
                  >
                    使用者清單
                  </v-btn>
                  <v-btn
                    color="light-blue-darken-4"
                    prepend-icon="mdi-pencil"
                    variant="outlined"
                    :size="buttonSize"
                    @click="showPasswordDialog = true"
                  >
                    修改密碼
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
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.name"
                    />
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
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="user.email"
                    />
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
                    {{ user.isAdmin ? '管理者編號' : '使用者編號' }} :
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
                      :model-value="user.isAdmin ? user.adminId : user.userId"
                    />
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
                    <v-text-field
                      variant="outlined"
                      density="compact"
                      hide-details
                      readonly
                      :model-value="getDisplayRole()"
                    />
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
        </v-row>
      </v-col>
    </v-row>
  </v-container>

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

  <v-dialog
    v-model="showUserListDialog"
    max-width="900"
  >
    <v-card class=" rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-account-group
        </v-icon>
        <span class="card-title text-white">使用者清單</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          :size="buttonSize"
          :ripple="false"
          @click="showUserListDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-5 pb-2">
        <div
          v-if="isLoadingUsers"
          class="d-flex justify-center align-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="blue-grey-darken-2"
            :size="52"
            :width="4"
          />
        </div>
        <v-row v-else>
          <v-col
            v-for="users in userList"
            :key="users.id"
            cols="12"
            sm="6"
            md="4"
            class="mb-2"
          >
            <v-card
              class="py-2 px-3 border rounded-lg"
              elevation="0"
            >
              <div class="d-flex align-center">
                <UserAvatar
                  :user="users"
                  size="40"
                  avatar-class="me-3"
                />
                <div class="text-truncate">
                  <div class="font-weight-medium">
                    {{ users.name }} <span class="text-subtitle-2 font-weight-regular text-grey">( {{ getUserDisplayRole(users) }} )</span>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ users.email }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-5 mb-2">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="showUserListDialog = false"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 背景圖片選擇對話框 -->
  <BackgroundImageDialog
    v-model="showBackgroundDialog"
    :current-background="user.backgroundImage"
    :is-updating="isUpdatingBackground"
    @confirm="handleBackgroundChange"
  />
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { computed, ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'
import FileUploadButton from '@/components/FileUploadButton.vue'
import BackgroundImageDialog from '@/components/BackgroundImageDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useApi } from '@/composables/axios'

const { apiAuth } = useApi()

const { mdAndUp, width } = useDisplay()
const isLgmUp = computed(() => width.value >= 1500)

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

definePage({
  meta: {
    title: '個人資料管理 | Ystravel',
    login: true
  }
})

const showPasswordDialog = ref(false)
const isChangingPassword = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const showUserListDialog = ref(false)
const userList = ref([])
const isLoadingUsers = ref(false)

const showBackgroundDialog = ref(false)
const isUpdatingBackground = ref(false)

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
const createSnackbar = useSnackbar()

// RBAC 角色相關
const userRbacRoles = ref([])


const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}

// 獲取用戶顯示角色的函數（用於使用者清單）
const getUserDisplayRole = (user) => {
  // 如果有 RBAC 角色，使用 RBAC 角色
  if (user.rbacRoles && user.rbacRoles.length > 0) {
    return user.rbacRoles[0].role?.name || '未知角色'
  }
  
  // 如果沒有 RBAC 角色，回退到舊的 role 系統
  return getRoleTitle(user.role) || '未知'
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


const fetchUserList = async () => {
    try {
      isLoadingUsers.value = true
      const { data } = await apiAuth.get('/users/public/all')
      
      // 根據 RBAC 角色的名稱排序
      userList.value = data.result.data.sort((a, b) => {
        // 獲取用戶的主要角色名稱
        const getPrimaryRoleName = (user) => {
          if (user.rbacRoles && user.rbacRoles.length > 0) {
            // 如果有 RBAC 角色，取最高 level 的角色名稱
            const sortedRoles = user.rbacRoles.sort((x, y) => {
              const levelX = x.role?.level || 0
              const levelY = y.role?.level || 0
              if (levelX !== levelY) {
                return levelY - levelX // 降序
              }
              const nameX = x.role?.name || ''
              const nameY = y.role?.name || ''
              return nameX.localeCompare(nameY)
            })
            return sortedRoles[0].role?.name || '未知角色'
          }
          // 如果沒有 RBAC 角色，回退到舊的 role 系統
          const roleNames = {
            0: '一般用戶',
            1: '經理',
            2: '管理者',
            3: 'IT人員',
            4: '美編人員',
            5: '行銷人員',
            6: '人資',
            7: '總管'
          }
          return roleNames[user.role] || '未知角色'
        }

        const roleNameA = getPrimaryRoleName(a)
        const roleNameB = getPrimaryRoleName(b)
        
        // 先按角色名稱排序（升序）
        if (roleNameA !== roleNameB) {
          return roleNameA.localeCompare(roleNameB)
        }
        
        // 如果角色名稱相同，按姓名排序（升序）
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB)
      })
    } catch (error) {
      console.error('Failed to fetch user list:', error)
      createSnackbar({
        text: '獲取用戶列表失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    } finally {
      isLoadingUsers.value = false
    }
  }

  watch(showUserListDialog, (newVal) => {
    if (newVal) fetchUserList()
  })

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

// 組件掛載時載入 RBAC 角色
onMounted(async () => {
  await loadUserRbacRoles()
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

.v-col-sm-12 {
  font-size: 13px;
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
}
</style>
