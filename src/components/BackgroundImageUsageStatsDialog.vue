<template>
  <v-dialog
    v-model="dialog"
    max-width="1000"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-chart-bar
        </v-icon>
        <span class="card-title text-white">背景圖片使用統計</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-5 pb-0 pt-6">
        <div
          v-if="isLoading"
          class="d-flex justify-center align-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="blue-grey-darken-2"
            :size="52"
            :width="4"
          />
        </div>
        <div v-else>
          <!-- 統計摘要 -->
          <v-row class="mb-6">
            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                class="text-center pa-4 border rounded"
                elevation="0"
              >
                <div class="block-title font-weight-bold text-blue-grey-darken-2 mb-2">
                  {{ totalUsers }}
                </div>
                <div class="text-subtitle-2 text-grey">
                  總使用人數
                </div>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                class="text-center pa-4 border rounded"
                elevation="0"
              >
                <div class="block-title font-weight-bold text-blue-grey-darken-2 mb-2">
                  {{ totalBackgrounds }}
                </div>
                <div class="text-subtitle-2 text-grey">
                  背景圖片總數
                </div>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-card
                class="text-center pa-4 border rounded"
                elevation="0"
              >
                <div class="block-title font-weight-bold text-blue-grey-darken-2 mb-2">
                  {{ mostUsedBackground?.backgroundName || '無' }}
                </div>
                <div class="text-subtitle-2 text-grey">
                  最多人使用背景
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- 詳細統計表格 -->
          <v-data-table
            :headers="headers"
            :items="usageStats"
            :loading="isLoading"
            :items-per-page="10"
            :search="search"
            class="border py-2 mb-4 rounded"
          >
            <template #top>
              <v-toolbar
                flat
                class="mb-4 pe-4"
                color="white"
              >
                <v-toolbar-title class="card-title text-blue-grey-darken-2">
                  背景圖片使用詳情
                </v-toolbar-title>
                <v-spacer />
                <v-text-field
                  v-model="search"
                  append-inner-icon="mdi-magnify"
                  label="搜尋背景圖片"
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                  style="max-width: 300px"
                />
              </v-toolbar>
            </template>

            <template #[`item.backgroundImage`]="{ item }">
              <div>
                <v-img
                  :src="item.backgroundImage"
                  width="70"
                  height="40"
                  cover
                  class="rounded me-3 my-2"
                />
              </div>
            </template>

            <template #[`item.userCount`]="{ item }">
              <v-chip
                :color="getUserCountColor(item.userCount)"
                size="small"
              >
                {{ item.userCount }} 人
              </v-chip>
            </template>

            <template #[`item.users`]="{ item }">
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="user in item.users.slice(0, 3)"
                  :key="user._id"
                  label
                  size="x-small"
                  variant="outlined"
                  color="blue-grey-darken-2"
                  class="me-1"
                >
                  {{ user.name }}
                </v-chip>
                <v-chip
                  v-if="item.users.length > 3"
                  size="x-small"
                  label
                  variant="outlined"
                  color="grey"
                >
                  +{{ item.users.length - 3 }} 人
                </v-chip>
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn
                size="small"
                variant="outlined"
                color="blue-grey-darken-2"
                @click="showUserDetails(item)"
              >
                查看詳情
              </v-btn>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
      <v-card-actions class="px-5 mb-3">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 使用者詳情對話框 -->
    <v-dialog
      v-model="showUserDetailsDialog"
      max-width="760"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
          <v-icon
            class="me-2"
            size="20"
          >
            mdi-account-group
          </v-icon>
          <span class="card-title text-white">{{ selectedBackground?.backgroundName }} - 使用詳情</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            color="white"
            class="opacity-100"
            :size="buttonSize"
            :ripple="false"
            @click="showUserDetailsDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-5 pb-0 pt-6">
          <v-row>
            <v-col
              v-for="user in selectedBackground?.users || []"
              :key="user._id"
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
                  <div>
                    <div class="text-caption text-blue-grey-darken-1 font-weight-medium">
                      {{ user.name }}
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-5 mb-3">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="showUserDetailsDialog = false"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { mdAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 響應式數據
const isLoading = ref(false)
const usageStats = ref([])
const search = ref('')
const showUserDetailsDialog = ref(false)
const selectedBackground = ref(null)

// 計算屬性
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const totalUsers = computed(() => {
  const allUsers = new Set()
  usageStats.value.forEach(stat => {
    stat.users.forEach(user => allUsers.add(user._id))
  })
  return allUsers.size
})

const totalBackgrounds = computed(() => {
  return usageStats.value.length
})

const mostUsedBackground = computed(() => {
  if (usageStats.value.length === 0) return null
  
  // 只考慮有使用者的背景圖片
  const usedBackgrounds = usageStats.value.filter(stat => stat.userCount > 0)
  if (usedBackgrounds.length === 0) return null
  
  return usedBackgrounds.reduce((max, current) => 
    current.userCount > max.userCount ? current : max
  )
})

// 表格標題
const headers = [
  { title: '背景圖片', key: 'backgroundImage', sortable: false },
  { title: '背景名稱', key: 'backgroundName', sortable: true },
  { title: '使用人數', key: 'userCount', sortable: true },
  { title: '使用者', key: 'users', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
]

// 根據使用人數獲取顏色
const getUserCountColor = (count) => {
  if (count >= 10) return 'green'
  if (count >= 5) return 'orange'
  if (count >= 1) return 'blue'
  return 'grey'
}

// 載入使用統計
const loadUsageStats = async () => {
  try {
    isLoading.value = true
    const { data } = await apiAuth.get('/users/background-image-usage-stats')
    
    if (data.success) {
      usageStats.value = data.result
    } else {
      throw new Error(data.message || '載入統計資料失敗')
    }
  } catch (error) {
    console.error('載入使用統計失敗:', error)
    createSnackbar({
      text: error.message || '載入統計資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoading.value = false
  }
}

// 顯示使用者詳情
const showUserDetails = (background) => {
  selectedBackground.value = background
  showUserDetailsDialog.value = true
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
}

// 監聽對話框開啟
watch(dialog, (newVal) => {
  if (newVal) {
    loadUsageStats()
  }
})
</script>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
