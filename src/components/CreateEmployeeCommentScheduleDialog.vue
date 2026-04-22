<template>
  <v-dialog
    v-model="dialog"
    persistent
    :width="dialogWidth"
    :fullscreen="!smAndUp"
    :no-click-animation="submitting"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
        <v-icon
          :size="smAndUp ? '20' : '18'"
          color="white"
          class="me-2"
        >
          mdi-calendar-plus
        </v-icon>
        <span class="card-title text-white">建立排程</span>
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

      <v-card-text class="px-6 py-4">
        <v-alert
          v-if="hasExistingSchedules"
          variant="tonal"
          color="warning"
          class="mb-4"
        >
          <div class="text-body-2">
            <div class="d-flex align-center">
              <div style="line-height: 24px;">
                <span class="font-weight-bold"> *注意 : </span>目前已有待排程項目。
              </div>
            </div>
            建立新排程將會<strong>覆蓋所有待排程項目</strong> !
          </div>
        </v-alert>

        <v-form
          ref="formRef"
          v-model="formValid"
          @submit.prevent="createSchedule"
        >
          <v-row>
            <v-col
              cols="12"
              class="pb-0 mt-2"
            >
              <v-autocomplete
                v-model="formData.startEmployeeId"
                :items="candidates"
                :item-title="getEmployeeTitle"
                item-value="_id"
                label="* 起始員工"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || '請選擇起始員工']"
                required
                :loading="loadingCandidates"
              />
            </v-col>

            <v-col
              cols="12"
              class="pb-0"
            >
              <v-date-input
                v-model="formData.startDate"
                label="* 起始日期"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || '請選擇起始日期']"
                prepend-icon=""
                :ok-text="'確認'"
                :cancel-text="'取消'"
                clearable
                :allowed-dates="isAllowedDate"
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
          color="teal-darken-1"
          variant="outlined"
          class="ms-2"
          :size="smAndUp ? 'default' : 'small'"
          :loading="submitting"
          :disabled="!formValid"
          @click="createSchedule"
        >
          建立
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
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const dialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)
const loadingCandidates = ref(false)
const candidates = ref([])
const existingScheduleCount = ref(0)
const hasExistingSchedules = ref(false)
const taiwanHolidays = ref(new Set())

const dialogWidth = computed(() => smAndUp.value ? '360' : '100%')

const fetchTaiwanHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    const [currentYearData, nextYearData] = await Promise.all([
      apiAuth.get('/taiwan-holidays', { params: { year: currentYear } }),
      apiAuth.get('/taiwan-holidays', { params: { year: nextYear } })
    ])
    const holidays = new Set()
    if (currentYearData.data.success && currentYearData.data.result) {
      currentYearData.data.result.forEach(holiday => {
        const date = new Date(holiday.date)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        holidays.add(dateStr)
      })
    }
    if (nextYearData.data.success && nextYearData.data.result) {
      nextYearData.data.result.forEach(holiday => {
        const date = new Date(holiday.date)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        holidays.add(dateStr)
      })
    }
    taiwanHolidays.value = holidays
  } catch {
    taiwanHolidays.value = new Set()
  }
}

const isAllowedDate = (dateValue) => {
  if (!dateValue) return false
  let dateStr = dateValue
  let date
  if (typeof dateValue === 'string' && dateValue.includes('-')) {
    const parts = dateValue.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      date = new Date(year, month, day)
      dateStr = dateValue
    } else {
      return false
    }
  } else {
    date = new Date(dateValue)
    if (isNaN(date.getTime())) return false
    dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  if (isNaN(date.getTime())) return false
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return false
  if (taiwanHolidays.value.has(dateStr)) return false
  return true
}

const formData = reactive({
  startEmployeeId: null,
  startDate: null
})

const getEmployeeTitle = (item) => {
  if (!item) return ''
  // v-autocomplete 有時會傳入選中的 id（字串），需從候選列表解析
  const obj = typeof item === 'object' && item !== null
    ? item
    : candidates.value.find(c => c._id === item || String(c._id) === String(item))
  if (!obj) return typeof item === 'string' ? item : ''
  return `${obj.name || ''} (${obj.employeeCode ?? ''})`
}

const fetchCandidates = async () => {
  loadingCandidates.value = true
  try {
    const { data } = await apiAuth.get('/employee-comments/candidates')
    if (data.success) {
      candidates.value = data.result
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得候選名單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingCandidates.value = false
  }
}

const checkExistingSchedules = async () => {
  try {
    const { data } = await apiAuth.get('/employee-comments/schedules', {
      params: {
        status: 'pending',
        itemsPerPage: 1,
        page: 1
      }
    })
    if (data.success) {
      existingScheduleCount.value = data.result.totalItems || 0
      hasExistingSchedules.value = existingScheduleCount.value > 0
    }
  } catch {
    // 忽略錯誤，不影響建立流程
    hasExistingSchedules.value = false
  }
}

const createSchedule = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    // 將 Date 對象轉換為 ISO 字串
    const startDateValue = formData.startDate instanceof Date
      ? formData.startDate.toISOString()
      : (formData.startDate || null)

    const { data } = await apiAuth.post('/employee-comments/schedules', {
      startEmployeeId: formData.startEmployeeId,
      startDate: startDateValue
    })

    if (data.success) {
      createSnackbar({
        text: `排程建立成功，共建立 ${data.result.count} 個排程`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      emit('created')
      closeDialog()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '建立排程失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  formData.startEmployeeId = null
  formData.startDate = null
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal) {
    fetchCandidates()
    fetchTaiwanHolidays()
    checkExistingSchedules()
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style lang="scss" scoped>

</style>
