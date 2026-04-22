<template>
  <v-dialog
    v-model="dialog"
    persistent
    :width="dialogWidth"
    :fullscreen="!smAndUp"
    :no-click-animation="submitting"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-2 bg-light-blue-darken-2">
        <v-icon
          :size="smAndUp ? '20' : '18'"
          color="white"
          class="me-2"
        >
          mdi-clipboard-check-outline
        </v-icon>
        <span class="card-title text-white">審核評論</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          class="opacity-100"
          :ripple="false"
          color="white"
          :size="smAndUp ? '36' : '32'"
          @click="closeDialog"
        >
          <v-icon :size="smAndUp ? '22' : '18'">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 py-4 mt-4">
        <v-form
          ref="formRef"
          v-model="formValid"
          @submit.prevent="submitReview"
        >
          <v-row>
            <!-- 員工資訊分區標題 -->
            <v-col
              cols="12"
              class="sub-title text-blue-darken-2 d-flex align-center justify-center"
            >
              <v-row>
                <v-col
                  cols="3"
                  sm="5"
                  class="d-flex align-center justify-center"
                >
                  <v-divider
                    class="border-opacity-25"
                    color="blue-darken-2"
                  />
                </v-col>
                <v-col
                  cols="6"
                  sm="2"
                  class="d-flex align-center justify-center"
                >
                  <v-icon
                    size="18"
                    class="me-2"
                  >
                    mdi-account-outline
                  </v-icon> 員工資訊
                </v-col>
                <v-col
                  cols="3"
                  sm="5"
                  class="d-flex align-center justify-center"
                >
                  <v-divider
                    class="border-opacity-25"
                    color="blue-darken-2"
                  />
                </v-col>
              </v-row>
            </v-col>

            <!-- 員工資訊欄位 -->
            <v-col
              cols="12"
              lg="4"
            >
              <v-text-field
                :model-value="schedule?.employee?.name || '-'"
                label="* 姓名"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col
              cols="12"
              lg="4"
            >
              <v-text-field
                :model-value="schedule?.employee?.company?.name || '-'"
                label="* 公司"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col
              cols="12"
              lg="4"
            >
              <v-text-field
                :model-value="schedule?.employee?.department?.name || '-'"
                label="* 部門"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col
              cols="12"
              lg="6"
            >
              <v-text-field
                :model-value="formatDate(schedule?.assignedDate)"
                label="* 指定日期"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col
              cols="12"
              lg="6"
            >
              <v-text-field
                :model-value="schedule?.submittedAt ? formatDateTime(schedule.submittedAt) : '-'"
                label="提交時間"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col
              v-if="schedule?.screenshot"
              cols="12"
            >
              <v-btn
                color="blue-darken-1"
                variant="outlined"
                size="small"
                prepend-icon="mdi-image"
                @click="openImageLightbox"
              >
                查看截圖
              </v-btn>
            </v-col>

            <!-- 審核資訊分區標題 -->
            <v-col
              cols="12"
              class="sub-title text-blue-darken-2 d-flex align-center justify-center"
            >
              <v-row>
                <v-col
                  cols="3"
                  sm="5"
                  class="d-flex align-center justify-center"
                >
                  <v-divider
                    class="border-opacity-25"
                    color="blue-darken-2"
                  />
                </v-col>
                <v-col
                  cols="6"
                  sm="2"
                  class="d-flex align-center justify-center"
                >
                  <v-icon
                    size="18"
                    class="me-2"
                  >
                    mdi-clipboard-check-outline
                  </v-icon> 審核資訊
                </v-col>
                <v-col
                  cols="3"
                  sm="5"
                  class="d-flex align-center justify-center"
                >
                  <v-divider
                    class="border-opacity-25"
                    color="blue-darken-2"
                  />
                </v-col>
              </v-row>
            </v-col>

            <!-- 審核資訊欄位 -->
            <v-col cols="4">
              <v-select
                v-model="formData.reviewStatus"
                :items="reviewStatusOptions"
                item-title="text"
                item-value="value"
                label="* 審核狀態"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || '請選擇審核狀態']"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.reviewNote"
                label="審核備註"
                variant="outlined"
                density="compact"
                rows="3"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 pt-1">
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          :size="smAndUp ? 'default' : 'small'"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="light-blue-darken-2"
          variant="outlined"
          class="ms-2"
          :size="smAndUp ? 'default' : 'small'"
          :loading="submitting"
          :disabled="!formValid"
          @click="submitReview"
        >
          儲存
        </v-btn>
      </v-card-actions>
    </v-card>

    <ImageLightbox ref="imageLightboxRef" />
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ImageLightbox from '@/components/ImageLightbox.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  schedule: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'reviewed'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const dialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)
const imageLightboxRef = ref(null)

const dialogWidth = computed(() => smAndUp.value ? '800' : '100%')

const formData = reactive({
  reviewStatus: null,
  reviewNote: ''
})

// 審核狀態：預設待審核，可改為完成（不需拒絕選項）
const reviewStatusOptions = [
  { text: '待審核', value: 'pending' },
  { text: '完成', value: 'approved' }
]

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
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

const openImageLightbox = () => {
  if (!imageLightboxRef.value || !props.schedule?.screenshot) return
  const imageUrl = getImageUrl(props.schedule.screenshot)
  imageLightboxRef.value.open([imageUrl], 0)
}

const submitReview = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    const { data } = await apiAuth.post(`/employee-comments/schedules/${props.schedule._id}/review`, {
      reviewStatus: formData.reviewStatus,
      reviewNote: formData.reviewNote || ''
    })

    if (data.success) {
      createSnackbar({
        text: '審核完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('reviewed')
      closeDialog()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '審核失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  formData.reviewStatus = null
  formData.reviewNote = ''
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal && props.schedule) {
    formData.reviewStatus = props.schedule.reviewStatus || 'pending'
    formData.reviewNote = props.schedule.reviewNote || ''
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style lang="scss" scoped>
.card-title {
  font-size: 18px;
  font-weight: 600;
}

.sub-title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>
