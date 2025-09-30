<template>
  <v-dialog
    v-model="dialog"
    max-width="520px"
    persistent
  >
    <v-card class="rounded-lg">
      <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-folder-plus
        </v-icon>
        建立新專案
        <v-spacer />
        <v-btn
          icon
          color="white"
          variant="plain"
          class="opacity-100"
          :ripple="false"
          size="20"
          @click="handleCancel"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <v-card-text class="mt-3 mb-2 px-6 pb-2">
        <v-form
          ref="formRef"
          v-model="formValid"
          @submit.prevent="handleSubmit"
        >
          <v-row>
            <!-- 專案名稱 -->
            <v-col
              cols="12"
            >
              <v-text-field
                v-model="form.name"
                label="*專案名稱"
                :rules="nameRules"
                required
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>

            <!-- 選擇團隊 -->
            <v-col
              cols="12"
            >
              <v-select
                v-model="form.team"
                :items="teamOptions"
                item-title="name"
                item-value="_id"
                label="*負責團隊"
                :rules="teamRules"
                required
                variant="outlined"
                density="compact"
                :loading="loadingTeams"
                :disabled="!!props.defaultTeamId"
                hide-details
                :clearable="!props.defaultTeamId"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon>mdi-account-group</v-icon>
                    </template>
                    <v-list-item-subtitle>
                      {{ item.raw.members?.length || 0 }} 位成員
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
              <!-- 當團隊被固定時顯示提示 -->
              <div
                v-if="props.defaultTeamId"
                class="text-caption text-medium-emphasis mt-1"
              >
                <v-icon
                  size="14"
                  class="me-1"
                >
                  mdi-information-outline
                </v-icon>
                此專案將建立在當前團隊下
              </div>
            </v-col>

            <!-- 專案描述 -->
            <v-col
              cols="12"
            >
              <v-textarea
                v-model="form.description"
                label="專案描述"
                variant="outlined"
                density="compact"
                rows="10"
                hide-details
                clearable
              />
            </v-col>



            <!-- 圖示顏色 -->
            <v-col
              cols="12"
            >
              <v-label
                class="text-body-2 mb-3 d-block"
              >
                專案圖示顏色
              </v-label>
              <div class="color-grid">
                <!-- 無顏色選項（與顏色一起進網格） -->
                <v-btn
                  :variant="form.iconColor === undefined ? 'flat' : 'outlined'"
                  color="grey"
                  :size="iconButtonSize"
                  icon
                  @click="form.iconColor = undefined"
                >
                  <v-icon :size="iconSize">
                    mdi-square-rounded-outline
                  </v-icon>
                </v-btn>
                <!-- 顏色選項（14色，7個一排） -->
                <v-btn
                  v-for="color in colorOptions"
                  :key="color.value"
                  :color="color.value"
                  :variant="form.iconColor === color.value ? 'flat' : 'outlined'"
                  :size="iconButtonSize"
                  icon
                  @click="form.iconColor = color.value"
                >
                  <v-icon :size="iconSize">
                    mdi-square-rounded
                  </v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <v-card-actions class="px-0 mt-4">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              class="me-1"
              :size="buttonSize"
              @click="handleCancel"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              type="submit"
              class="ms-1"
              :size="buttonSize"
              :loading="loading"
              :disabled="!formValid"
            >
              建立專案
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useTeamStore } from '@/stores/team'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  defaultTeamId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'project-created'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, lgAndUp } = useDisplay()
const userStore = useUserStore()
const teamStore = useTeamStore()
const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')
const iconButtonSize = computed(() => {
  if (!smAndUp.value) return 26
  if (!lgAndUp.value) return 36
  return 40
})
const iconSize = computed(() => {
  if (!smAndUp.value) return 14
  if (!lgAndUp.value) return 20
  return 24
})

// 表單相關
const formRef = ref(null)
const formValid = ref(false)
const loading = ref(false)
const loadingTeams = ref(false)

// 表單資料
const form = ref({
  name: '',
  team: '',
  description: '',
  iconColor: undefined
})

// 初始化表單，設定預設團隊
const initializeForm = () => {
  form.value = {
    name: '',
    team: props.defaultTeamId || '',
    description: '',
    iconColor: undefined
  }
}

// 團隊選項
const teamOptions = ref([])


// 顏色選項
const colorOptions = [
  { title: '紅色', value: 'red-accent-3' },
  { title: '粉色', value: 'pink-accent-2' },
  { title: '紫色', value: 'purple-accent-1' },
  { title: '深紫', value: 'deep-purple-accent-1' },
  { title: '靛藍', value: 'indigo-accent-2' },
  { title: '藍色', value: '#92a9d1' },
  { title: '淺藍', value: 'light-blue-accent-3' },
  { title: '青色', value: '#46b5ac' },
  { title: '青綠', value: 'teal-accent-2' },
  { title: '綠色', value: 'green-accent-3' },
  { title: '翠綠', value: '#009572' },
  { title: '黃色', value: '#efbf59' },
  { title: '深橙', value: 'deep-orange-accent-3' }
]


// 驗證規則
const nameRules = [
  v => !!v || '請輸入專案名稱',
  v => (v && v.length >= 1) || '專案名稱至少需要2個字元',
  v => (v && v.length <= 50) || '專案名稱不能超過50個字元'
]

const teamRules = [
  v => !!v || '請選擇負責團隊'
]

// 監聽對話框狀態
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 取得團隊列表
const fetchTeams = async () => {
  try {
    loadingTeams.value = true
    // 優先使用 store 中的團隊資料，否則向後端取得我的團隊（包含 managers）
    let allTeams = teamStore.teams && teamStore.teams.length > 0 ? teamStore.teams : []
    if (allTeams.length === 0) {
      const { data } = await apiAuth.get('/teams/my-teams')
      allTeams = data.success ? (data.data || []) : []
    }

    // 僅顯示我為該團隊管理者的團隊
    const managerTeams = allTeams.filter(team => team?.managers?.some(m => m._id === userStore._id))

    // 若有 defaultTeamId，但不在 managerTeams，仍需顯示（來自團隊詳情的固定負責團隊）
    let options = managerTeams
    if (props.defaultTeamId && !managerTeams.some(t => t._id === props.defaultTeamId)) {
      const fallbackTeam = allTeams.find(t => t._id === props.defaultTeamId)
      if (fallbackTeam) {
        options = [fallbackTeam, ...managerTeams]
      }
    }

    teamOptions.value = options
    } catch (error) {
      console.error('取得團隊列表失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || '取得團隊列表失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    } finally {
    loadingTeams.value = false
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formValid.value) return

  try {
    loading.value = true

    const projectData = {
      name: form.value.name,
      team: form.value.team,
      description: form.value.description,
      ...(form.value.iconColor ? { iconColor: form.value.iconColor } : { iconColor: null })
    }

    const { data } = await apiAuth.post('/projects', projectData)

    if (data.success) {
      createSnackbar({
        text: '專案建立成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('project-created', data.data)
      handleCancel()
    }
  } catch (error) {
    console.error('建立專案失敗:', error)
    const message = error.response?.data?.message || '建立專案失敗'
    createSnackbar({
      text: message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  // 重置表單
  initializeForm()

  // 關閉對話框
  dialog.value = false
}

// 監聽對話框開啟，載入團隊列表並初始化表單
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchTeams()
    initializeForm()
  }
})

// 組件掛載時載入團隊列表並初始化表單
onMounted(() => {
  fetchTeams()
  initializeForm()
})
</script>

<style lang="scss" scoped>
.color-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px 12px;
  justify-items: center;
}

.color-grid :deep(.v-btn) {
  margin: 0;
  width: 40px;
}

</style>

