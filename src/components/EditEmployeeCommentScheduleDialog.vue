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
          mdi-pencil
        </v-icon>
        <span class="card-title text-white">編輯排程</span>
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
          @submit.prevent="updateSchedule"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                :model-value="schedule?.employee?.name || '-'"
                label="員工"
                variant="outlined"
                density="compact"
                disabled
              />
            </v-col>

            <v-col cols="12">
              <v-date-input
                v-model="formData.assignedDate"
                label="* 指定日期"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || '請選擇指定日期']"
                prepend-icon=""
                :ok-text="'確認'"
                :cancel-text="'取消'"
                required
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
          @click="updateSchedule"
        >
          更新
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
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
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const dialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)

const dialogWidth = computed(() => smAndUp.value ? '360' : '100%')

const formData = reactive({
  assignedDate: null
})

const updateSchedule = async () => {
  if (!formRef.value || !props.schedule?._id) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    // 將 Date 對象轉換為 ISO 字串
    const assignedDateValue = formData.assignedDate instanceof Date
      ? formData.assignedDate.toISOString()
      : (formData.assignedDate || null)

    const { data } = await apiAuth.patch(`/employee-comments/schedules/${props.schedule._id}`, {
      assignedDate: assignedDateValue
    })

    if (data.success) {
      createSnackbar({
        text: '排程更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('updated')
      closeDialog()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新排程失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  formData.assignedDate = null
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal && props.schedule) {
    // 將 ISO 字串轉換為 Date 對象
    if (props.schedule.assignedDate) {
      formData.assignedDate = typeof props.schedule.assignedDate === 'string'
        ? new Date(props.schedule.assignedDate)
        : props.schedule.assignedDate
    } else {
      formData.assignedDate = null
    }
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
</style>
