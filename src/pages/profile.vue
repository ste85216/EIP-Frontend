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
                <v-avatar
                  size="100"
                >
                  <v-skeleton-loader
                    v-if="!isProfileAvatarLoaded"
                    width="100"
                    height="100"
                  />
                  <v-img
                    v-show="isProfileAvatarLoaded"
                    :src="user.avatar"
                    @load="handleProfileAvatarLoad"
                  />
                </v-avatar>
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
                  {{ getRoleTitle(user.role) }}
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
        <v-row class="elevation-4 rounded-lg pt-3 pt-sm-6 pb-6 px-2 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 me-xl-12 mb-4 bg-white">
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
                    身分別 :
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
                      :model-value="getRoleTitle(user.role)"
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

  <!-- 預設密碼修改提示對話框 -->
  <v-dialog
    v-model="showDefaultPasswordDialog"
    persistent
    max-width="380"
  >
    <v-card class="rounded-lg px-7 pt-7 pb-5">
      <div class="card-title mb-4">
        請立即修改密碼
      </div>
      <v-card-text class="px-0">
        <v-alert
          type="warning"
          color="red-darken-1"
          variant="tonal"
          class="mb-0 font-weight-bold"
        >
          為了您的帳戶安全，建議修改預設密碼。<br>
          是否要立即修改密碼？
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn
          color="grey"
          variant="outlined"
          @click="showDefaultPasswordDialog = false"
        >
          稍後修改
        </v-btn>
        <v-btn
          color="red-darken-1"
          variant="flat"
          class="elevation-2 ms-2"
          @click="handleDefaultPasswordPrompt"
        >
          立即修改
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
                <v-avatar
                  size="40"
                  class="me-3"
                >
                  <v-img :src="users.avatar" />
                </v-avatar>
                <div class="text-truncate">
                  <div class="font-weight-medium">
                    {{ users.name }} <span class="text-subtitle-2 font-weight-regular text-grey">( {{ getRoleTitle(users.role) }} )</span>
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
  <v-dialog
    v-model="showBackgroundDialog"
    max-width="900"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-image
        </v-icon>
        <span class="card-title text-white">變更背景圖片</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="showBackgroundDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-5 pb-0 pt-6">
        <v-row>
          <v-col
            v-for="(bg, index) in paginatedBackgrounds"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            class="text-center"
          >
            <v-card
              class="cursor-pointer border rounded-lg"
              elevation="0"
              @click="selectedBackground = bg.url"
            >
              <v-img
                :src="bg.url"
                height="180"
                cover
              >
                <div class="d-flex align-center justify-center h-100">
                  <v-icon
                    v-if="selectedBackground === bg.url"
                    color="white"
                    size="40"
                    class="pt-5"
                  >
                    mdi-check-circle
                  </v-icon>
                </div>
              </v-img>
              <v-card-text class="pa-2">
                <div class="sub-title">
                  {{ bg.name }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 分頁組件 -->
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          :total-visible="3"
          class="mt-4"
          size="x-small"
          variant="flat"
          color="blue-grey-darken-2"
        />
      </v-card-text>
      <v-card-actions class="px-5 mb-3">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="showBackgroundDialog = false"
        >
          取消
        </v-btn>
        <v-btn
          color="blue-grey-darken-2"
          variant="outlined"
          class="ms-1"
          :loading="isUpdatingBackground"
          @click="handleBackgroundChange"
        >
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'
import FileUploadButton from '@/components/FileUploadButton.vue'
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
const selectedBackground = ref('')
const isUpdatingBackground = ref(false)

// 分頁相關
const currentPage = ref(1)
const itemsPerPage = 6

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const user = useUserStore()
const createSnackbar = useSnackbar()

// 背景圖片選項
const backgroundOptions = ref([
  {
    name: '野火燎原',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_flame.png'
  },
  {
    name: '迷幻星空',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_purplesky.png'
  },
  {
    name: '小木屋',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_cabin.png'
  },
  {
    name: '機器人',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_robot.png'
  },
  {
    name: '靜謐之森',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_snowforest.png'
  },
  {
    name: '日出',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_sunrise.png'
  },
  {
    name: '龍貓',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_totoro.png'
  },
  {
    name: '移動城堡',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_castle.png'
  },
  {
    name: '霍格華茲',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_hogwarts.png'
  },
  {
    name: '咖波',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_capoo.png'
  },
  {
    name: '水晶球',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_pokemon.png'
  },
  {
    name: 'Pingu',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_pingu.png'
  },
  {
    name: '史迪奇',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_stitch.png'
  },
  {
    name: '鳥居',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_shrine.png'
  },
  {
    name: '胡蝶忍',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_kochoshinobu.png'
  },
  {
    name: 'Chiikawa',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_chiikawa.png'
  },
  {
    name: '紫月',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_purplemoon.png'
  },
  {
    name: '小新',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_shinchan.png'
  }
])

const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}

// 分頁計算屬性
const totalPages = computed(() => {
  return Math.ceil(backgroundOptions.value.length / itemsPerPage)
})

const paginatedBackgrounds = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return backgroundOptions.value.slice(start, end)
})

const fetchUserList = async () => {
    try {
      isLoadingUsers.value = true
      const { data } = await apiAuth.get('/users/public/all')
      // 定義角色優先順序（1.經理 2.行銷人員 3.美編人員 4.總管 5.人資 6.IT 7.一般使用者 8.管理者）
      const roleOrder = {
        1: 0, // MANAGER 經理
        5: 1, // MARKETING 行銷人員
        4: 2, // DESIGNER 美編人員
        7: 3, // SUPERVISOR 總管
        6: 4, // HR 人資
        3: 5, // IT IT人員
        0: 6, // USER 一般使用者
        2: 7  // ADMIN 管理者
      }

      // 根據角色排序
      userList.value = data.result.data.sort((a, b) => {
        return roleOrder[a.role] - roleOrder[b.role]
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

  // 監聽背景選擇對話框開啟
  watch(showBackgroundDialog, (newVal) => {
    if (newVal) {
      selectedBackground.value = user.backgroundImage || ''
      currentPage.value = 1 // 重置到第一頁
    }
  })

  // 處理背景圖片變更
  const handleBackgroundChange = async () => {
    try {
      isUpdatingBackground.value = true
      await user.updateBackgroundImage(selectedBackground.value)

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

const showDefaultPasswordDialog = ref(false)

// 處理預設密碼提示對話框
const handleDefaultPasswordPrompt = () => {
  showDefaultPasswordDialog.value = false
  nextTick(() => {
    setTimeout(() => {
      showPasswordDialog.value = true
    }, 150 )
  })
}

// 在組件掛載時檢查是否需要顯示預設密碼提示
onMounted(() => {
  if (!user.isDefaultPasswordChanged) {
    showDefaultPasswordDialog.value = true
  }
})

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
    img.src = newAvatar
  }
}, { immediate: true })
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
