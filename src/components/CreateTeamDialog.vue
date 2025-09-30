<template>
  <v-dialog
    v-model="dialog"
    max-width="480px"
    persistent
  >
    <v-card class="rounded-lg">
      <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-account-group
        </v-icon>
        建立新團隊
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
            <!-- 團隊名稱 -->
            <v-col
              cols="12"
            >
              <v-text-field
                v-model="form.name"
                label="*團隊名稱"
                :rules="nameRules"
                required
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>

            <!-- 團隊描述 -->
            <v-col
              cols="12"
            >
              <v-textarea
                v-model="form.description"
                label="團隊描述"
                variant="outlined"
                density="compact"
                rows="3"
                hide-details
                clearable
              />
            </v-col>



            <!-- 選擇成員 -->
            <v-col cols="12">
              <v-combobox
                v-model="selectedMembers"
                :items="userOptions"
                item-title="name"
                item-value="_id"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="compact"
                placeholder="搜尋並選擇團隊成員"
                :loading="loadingUsers"
                hide-details
                clearable
              >
                <template #chip="{ props: chipProps, item }">
                  <v-chip
                    v-bind="chipProps"
                    :prepend-avatar="item.raw.avatar"
                    color="primary"
                    variant="tonal"
                  >
                    {{ item.raw.name }}
                  </v-chip>
                </template>
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-avatar size="32">
                        <v-img
                          v-if="item.raw.avatar"
                          :src="item.raw.avatar"
                          :alt="item.raw.name"
                        />
                        <v-icon v-else>
                          mdi-account
                        </v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-combobox>
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
              確認
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
import { useUserStore } from '@/stores/user'
import { useDisplay } from 'vuetify'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'team-created'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()
const { smAndUp } = useDisplay()
const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

// 表單相關
const formRef = ref(null)
const formValid = ref(false)
const loading = ref(false)
const loadingUsers = ref(false)

// 表單資料
const form = ref({
  name: '',
  description: ''
})

// 選中的成員
const selectedMembers = ref([])

// 使用者選項
const userOptions = ref([])

// 驗證規則
const nameRules = [
  v => !!v || '請輸入團隊名稱',
  v => (v && v.length >= 2) || '團隊名稱至少需要2個字元',
  v => (v && v.length <= 50) || '團隊名稱不能超過50個字元'
]

// 監聽對話框狀態
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 取得使用者列表
const fetchUsers = async () => {
  try {
    loadingUsers.value = true
    const { data } = await apiAuth.get('/teams/users/list')
    if (data.success) {
      // 過濾掉當前用戶，因為建立者會自動被加入團隊
      userOptions.value = data.data.filter(user => user._id !== userStore._id)
    }
    } catch (error) {
      console.error('取得使用者列表失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || '取得使用者列表失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    } finally {
      loadingUsers.value = false
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formValid.value) return

  try {
    loading.value = true

    const teamData = {
      name: form.value.name,
      description: form.value.description,
      members: selectedMembers.value.map(member =>
        typeof member === 'object' ? member._id : member
      )
    }

    const { data } = await apiAuth.post('/teams', teamData)

    if (data.success) {
      createSnackbar({
        text: '團隊建立成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('team-created', data.data)
      handleCancel()
    }
  } catch (error) {
    console.error('建立團隊失敗:', error)
    const message = error.response?.data?.message || '建立團隊失敗'
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
  form.value = {
    name: '',
    description: ''
  }
  selectedMembers.value = []

  // 關閉對話框
  dialog.value = false
}

// 監聽對話框開啟，載入使用者列表
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchUsers()
  }
})

// 組件掛載時載入使用者列表
onMounted(() => {
  fetchUsers()
})
</script>

<style lang="scss" scoped>

</style>

