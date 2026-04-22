<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card class="rounded-lg comment-dialog-card">
      <v-card-title class="d-flex align-center px-6 py-2 bg-primary">
        <v-icon
          icon="mdi-comment-text-outline"
          size="20"
          color="white"
          class="me-2"
        />
        <span class="card-title text-white">員工評論</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          class="opacity-100"
          :ripple="false"
          color="white"
          size="36"
          @click="closeDialog"
        >
          <v-icon size="22">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 py-4 overflow-y-auto">
        <div v-if="!schedule">
          <v-progress-circular indeterminate />
        </div>

        <div v-else>
          <!-- 規則說明 -->
          <div class="mb-4">
            <div class="font-weight-bold mb-2 mt-1">
              評論規則
            </div>
            <v-divider class="mb-2" />
            <div class="card-content text-grey-darken-1 rule-c  ">
              <p>1. 請公司指定同仁在<span class="text-red font-weight-bold">指定日期</span>當天於<span class="font-weight-bold text-grey-darken-3">永信旅行社Google</span>撰寫<span class="text-red font-weight-bold">五星評論</span> </p>
              <p>2. 完成評論後請截圖保存</p>
              <p>3. 請在指定日期當天晚上12:00之前上傳截圖</p>
              <p>4. <span class="text-grey-darken-3 font-weight-bold">遲交及審核未通過的人</span>系統會另外為您安排<span class="text-red font-weight-bold">兩次評論</span>，會重新指定兩次日期</p>
            </div>
          </div>

          <!-- 填寫規則 -->
          <div class="mb-4">
            <div class="font-weight-bold mb-2 mt-1">
              填寫規則
            </div>
            <v-divider class="mb-2" />
            <div class="card-content text-grey-darken-1 rule-c">
              <p>1. 可使用自己的 Google 帳號，前提是自己的 Google 帳號<span class="text-red font-weight-bold">不得有在永信旅遊工作過的紀錄</span>，也可以使用自己的親朋好友（父母親、兄弟姊妹、男女朋友）的帳號填寫，若本身為領隊，可以找自己帶過的客人來寫評論更佳。</p>
              <p>2. <span class="text-red font-weight-bold">評論字數須寫滿 25 字（不含標點符號）</span>，<span class="font-weight-bold text-grey-darken-3">可以填寫出發月份（※不要特別填寫出發日期)</span>，以<span class="font-weight-bold text-grey-darken-3">客人的角度</span>敘述永信旅遊之優點，從接待客人、買賣行程、行程出發到後續慰問，評論上皆可敘寫。</p>
              <p>3. 若已經使用自己帳號評論過，請使用<span class="font-weight-bold text-grey-darken-3">其他帳號</span>再提供一篇評論。</p>
              <p>4. 若全體新進同仁皆已輪值完畢，將由已寫過評論的同仁重新輪值（依排程表），需使用<span class="font-weight-bold text-red">另一個 Google 帳號</span>再撰寫一篇新的評論。</p>
            </div>
          </div>

          <!-- 指定日期資訊 -->
          <div class="mb-4">
            <v-alert
              :type="alertType"
              variant="tonal"
            >
              <div class="text-subtitle-2">
                指定日期：<span class="font-weight-bold card-title">{{ formatDate(schedule.assignedDate) }}</span>
              </div>
              <div
                v-if="isToday"
                class="text-body-2 mt-1"
              >
                今天是您的指定日期，請於晚上12:00之前準時上傳截圖
              </div>
              <div
                v-else-if="isBeforeToday"
                class="text-body-2 mt-1"
              >
                提醒：請您先仔細閱讀上述規則，並於指定日期當天準時上傳截圖
              </div>
              <div
                v-else-if="isAfterToday"
                class="text-body-2 mt-1 text-error"
              >
                已過期：您未能在指定日期完成評論
              </div>
            </v-alert>
          </div>

          <!-- 上傳截圖區域（僅在指定日期當天顯示） -->
          <div v-if="isToday && !schedule.submittedAt">
            <div class="text-subtitle-1 mb-2">
              上傳截圖
            </div>
            <v-divider class="mb-4" />

            <v-file-input
              ref="fileInputRef"
              v-model="screenshotFile"
              label="選擇截圖檔案"
              accept="image/*"
              variant="outlined"
              density="compact"
              prepend-icon="mdi-image"
              :rules="fileRules"
              show-size
              hide-details
              clearable
            />

            <v-btn
              v-if="screenshotFile"
              color="primary"
              block
              class="mt-4"
              :loading="uploading"
              @click="uploadScreenshot"
            >
              上傳截圖
            </v-btn>
          </div>

          <!-- 已提交狀態 -->
          <div v-if="schedule.submittedAt">
            <v-alert
              type="success"
              variant="tonal"
            >
              <div class="text-subtitle-2">
                已提交
              </div>
              <div class="text-body-2 mt-1">
                提交時間：{{ formatDateTime(schedule.submittedAt) }}
              </div>
              <div
                v-if="schedule.screenshot"
                class="mt-2"
              >
                <v-img
                  :src="getImageUrl(schedule.screenshot)"
                  max-height="200"
                  contain
                />
              </div>
            </v-alert>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 pt-1">
        <v-btn
          v-if="isReminderDay"
          variant="outlined"
          color="grey-darken-1"
          class="me-2"
          @click="pauseAnimation"
        >
          暫停閃爍
        </v-btn>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  schedule: {
    type: Object,
    default: null
  },
  isReminderDay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submitted', 'pause-animation'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const dialog = ref(false)
const screenshotFile = ref(null)
const uploading = ref(false)
const fileInputRef = ref(null)

const fileRules = computed(() => [
  (v) => {
    if (!v) return true // 允許空值
    // v-file-input 可能返回 File 物件或 FileList
    const file = v instanceof FileList ? v[0] : v
    if (!(file instanceof File)) return true // 如果不是 File 物件，允許（可能是清空操作）
    if (file.size > 5 * 1024 * 1024) {
      return '檔案大小不能超過 5MB'
    }
    if (!file.type || !file.type.startsWith('image/')) {
      return '請上傳圖片檔案'
    }
    return true
  }
])

const isToday = computed(() => {
  if (!props.schedule) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const assignedDate = new Date(props.schedule.assignedDate)
  assignedDate.setHours(0, 0, 0, 0)
  return assignedDate.getTime() === today.getTime()
})

const isBeforeToday = computed(() => {
  if (!props.schedule) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const assignedDate = new Date(props.schedule.assignedDate)
  assignedDate.setHours(0, 0, 0, 0)
  return assignedDate.getTime() > today.getTime()
})

const isAfterToday = computed(() => {
  if (!props.schedule) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const assignedDate = new Date(props.schedule.assignedDate)
  assignedDate.setHours(0, 0, 0, 0)
  return assignedDate.getTime() < today.getTime()
})

const alertType = computed(() => {
  if (isToday.value) return 'info'
  if (isBeforeToday.value) return 'warning'
  if (isAfterToday.value) return 'error'
  return 'info'
})

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const dateStr = d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[d.getDay()]
  return `${dateStr} (${weekday})`
}

const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  const baseURL = import.meta.env.VITE_API || 'http://localhost:4002'
  return imagePath.startsWith('http') ? imagePath : `${baseURL}${imagePath}`
}

const uploadScreenshot = async () => {
  if (!screenshotFile.value || !props.schedule) {
    createSnackbar({
      text: '請選擇截圖檔案',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 確保是 File 物件
  const file = screenshotFile.value instanceof FileList
    ? screenshotFile.value[0]
    : screenshotFile.value

  if (!(file instanceof File)) {
    createSnackbar({
      text: '請選擇有效的檔案',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 驗證檔案大小和類型
  if (file.size > 5 * 1024 * 1024) {
    createSnackbar({
      text: '檔案大小不能超過 5MB',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  if (!file.type || !file.type.startsWith('image/')) {
    createSnackbar({
      text: '請上傳圖片檔案',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  uploading.value = true
  try {
    // 先上傳圖片
    const formData = new FormData()
    formData.append('image', file)

    const uploadResponse = await apiAuth.post('/screenshot/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!uploadResponse.data.success || !uploadResponse.data.result) {
      throw new Error('上傳圖片失敗')
    }

    const imagePath = uploadResponse.data.result

    // 提交評論
    const { data } = await apiAuth.post(`/employee-comments/schedules/${props.schedule._id}/submit`, {
      screenshot: imagePath
    })

    if (data.success) {
      createSnackbar({
        text: '評論提交成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('submitted')
      closeDialog()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '上傳失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    uploading.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  screenshotFile.value = null
}

const pauseAnimation = () => {
  emit('pause-animation')
}

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style lang="scss" scoped>
.comment-dialog-card {
  display: flex;
  flex-direction: column;

  .v-card-title {
    flex-shrink: 0;
  }

  .v-card-text {
    flex: 1 1 auto;
    overflow-y: auto;
    min-height: 0;
  }

  .v-card-actions {
    flex-shrink: 0;
  }
}

.v-alert :deep(.v-icon) {
  font-size: 20px !important;
}
</style>
