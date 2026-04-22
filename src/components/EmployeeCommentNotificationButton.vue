<template>
  <span
    v-if="visible"
    class="reminder-btn-wrapper me-0 me-sm-2"
    :class="{
      'blink': shouldBlink,
      'animation-paused': animationPaused && isReminderDay
    }"
  >
    <v-btn
      icon
      :color="buttonColor"
      :size="buttonSize"
      class="reminder-btn"
      :ripple="false"
      flat
      @click="openDialog"
    >
      <v-icon>
        mdi-comment-alert-outline
      </v-icon>
    </v-btn>
  </span>

  <EmployeeCommentDialog
    v-model="dialog"
    :schedule="currentSchedule"
    :is-reminder-day="isReminderDay"
    @submitted="handleSubmitted"
    @pause-animation="handlePauseAnimation"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/stores/user'
import { useDisplay } from 'vuetify'
import EmployeeCommentDialog from './EmployeeCommentDialog.vue'

defineProps({
  buttonColor: {
    type: String,
    default: '#333'
  }
})

const PAUSED_STORAGE_KEY = 'employeeCommentAnimationPaused'

const { apiAuth } = useApi()
const userStore = useUserStore()
const { smAndUp } = useDisplay()

const visible = ref(false)
const shouldBlink = ref(false)
const dialog = ref(false)
const currentSchedule = ref(null)
const checkInterval = ref(null)
const animationPaused = ref(false)
const isReminderDay = ref(false)

const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

const checkNotification = async () => {
  if (!userStore.isLogin) {
    visible.value = false
    return
  }

  try {
    // 後端依「提醒日 = 指定日期的前一個工作日」回傳今日應顯示的排程，並帶 showBlink
    const { data } = await apiAuth.get('/employee-comments/schedules/my-notification-schedules')

    if (data.success && data.result.data && data.result.data.length > 0) {
      const schedule = data.result.data[0]
      visible.value = true
      shouldBlink.value = !!schedule.showBlink
      isReminderDay.value = !!schedule.isReminderDay
      if (currentSchedule.value?._id !== schedule._id) {
        animationPaused.value = false
      }
      if (schedule.isReminderDay) {
        const pausedId = localStorage.getItem(PAUSED_STORAGE_KEY)
        if (pausedId === schedule._id) {
          animationPaused.value = true
        }
      }
      currentSchedule.value = schedule
    } else {
      visible.value = false
      shouldBlink.value = false
      currentSchedule.value = null
      isReminderDay.value = false
      animationPaused.value = false
    }
  } catch (error) {
    console.error('檢查員工評論通知失敗:', error)
    visible.value = false
  }
}

const openDialog = () => {
  if (currentSchedule.value) {
    dialog.value = true
  }
}

/** 由 inbox 點擊通知時呼叫：依 scheduleId 取得排程並開啟對話框 */
const openWithScheduleId = async (scheduleId) => {
  if (!scheduleId) return
  try {
    const { data } = await apiAuth.get(`/employee-comments/schedules/my-schedule/${scheduleId}`)
    if (data.success && data.result) {
      currentSchedule.value = data.result
      visible.value = true
      dialog.value = true
      const assigned = new Date(data.result.assignedDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      assigned.setHours(0, 0, 0, 0)
      isReminderDay.value = assigned.getTime() > today.getTime()
    }
  } catch (error) {
    console.error('取得排程失敗:', error)
  }
}

defineExpose({ openWithScheduleId })

const handlePauseAnimation = () => {
  animationPaused.value = true
  if (currentSchedule.value?._id) {
    localStorage.setItem(PAUSED_STORAGE_KEY, currentSchedule.value._id)
  }
}

const handleSubmitted = () => {
  if (currentSchedule.value?._id === localStorage.getItem(PAUSED_STORAGE_KEY)) {
    localStorage.removeItem(PAUSED_STORAGE_KEY)
  }
  visible.value = false
  shouldBlink.value = false
  currentSchedule.value = null
  checkNotification()
}

onMounted(() => {
  checkNotification()
  // 每分鐘檢查一次
  checkInterval.value = setInterval(checkNotification, 60000)
})

onUnmounted(() => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
  }
})
</script>

<style scoped lang="scss">
.reminder-btn-wrapper {
  display: inline-flex;
  transform-origin: center center;
  animation: scale-pulse 8s infinite;
}

.reminder-btn-wrapper.blink {
  animation: scale-pulse 8s infinite, blink 3s infinite;
}

.reminder-btn-wrapper.animation-paused {
  animation: none !important;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.5;
  }
}

/* 每 5 秒放大 1.2 倍（約 0.5 秒過渡），維持 2 秒帶微扇形來回旋轉兩次，再約 0.5 秒縮小（週期 8 秒） */
@keyframes scale-pulse {
  0%, 62.5% {
    transform: scale(1) rotate(0deg);
  }
  68.75% {
    transform: scale(1.2) rotate(-4deg);
  }
  75% {
    transform: scale(1.2) rotate(4deg);
  }
  81.25% {
    transform: scale(1.2) rotate(-4deg);
  }
  87.5% {
    transform: scale(1.2) rotate(4deg);
  }
  93.75% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
