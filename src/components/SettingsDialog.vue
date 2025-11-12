<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    @click:outside="close"
    @keydown.esc="close"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-cog
        </v-icon>
        <span class="card-title text-white">設定</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="close"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- 通知偏好設定區塊 -->
        <div class="mb-6">
          <div class="d-flex align-center mb-4">
            <v-icon
              class="me-2"
              color="blue-grey-darken-2"
              :size="smAndUp ? '20' : '18'"
            >
              mdi-bell
            </v-icon>
            <span class="settings-section-title">通知偏好設定</span>
          </div>
          <v-checkbox
            v-model="localNotificationPrefs.email"
            label="&nbsp;EMAIL 通知"
            density="compact"
            hide-details
            class="mb-2"
            color="blue-grey-darken-2"
            @update:model-value="updateNotificationPreferences"
          />
          <v-checkbox
            v-model="localNotificationPrefs.line"
            label="&nbsp;LINE 通知"
            :disabled="!isLineBound"
            density="compact"
            hide-details
            class="mb-2"
            color="blue-grey-darken-2"
            @update:model-value="updateNotificationPreferences"
          />
          <v-checkbox
            v-model="localNotificationPrefs.inbox"
            label="&nbsp;內部收件匣通知"
            density="compact"
            hide-details
            color="blue-grey-darken-2"
            @update:model-value="updateNotificationPreferences"
          />
        </div>

        <v-divider class="my-6" />

        <!-- 顯示設定區塊 -->
        <div>
          <div class="d-flex align-center mb-4">
            <v-icon
              class="me-2"
              color="blue-grey-darken-2"
              :size="smAndUp ? '20' : '18'"
            >
              mdi-monitor
            </v-icon>
            <span class="settings-section-title">顯示設定</span>
          </div>
          <div class="mb-3">
            <div class="mb-2 sub-title-1 text-blue-grey-darken-2">
              介面縮放：
            </div>
            <v-radio-group
              v-model="localSelectedScale"
              inline
              density="compact"
              hide-details
              @update:model-value="handleScaleChange"
            >
              <v-radio
                label="100%"
                :value="100"
                color="blue-grey-darken-2"
                class="me-2"
              />
              <v-radio
                label="125%"
                :value="125"
                color="blue-grey-darken-2"
                class="me-2"
              />
              <v-radio
                label="150%"
                :value="150"
                color="blue-grey-darken-2"
              />
            </v-radio-group>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="me-4 mb-3">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="close"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'
import { useAppStore } from '@/stores/app'

const { smAndUp } = useDisplay()
const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const appStore = useAppStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  notificationPrefs: {
    type: Object,
    default: () => ({
      email: true,
      line: false,
      inbox: true
    })
  },
  selectedScale: {
    type: Number,
    default: 100
  },
  isLineBound: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:notification-prefs', 'update:scale'])

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

const isOpen = ref(props.modelValue)
const localNotificationPrefs = ref({ ...props.notificationPrefs })
const localSelectedScale = ref(props.selectedScale)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    localNotificationPrefs.value = { ...props.notificationPrefs }
    localSelectedScale.value = props.selectedScale
  }
})

watch(() => props.notificationPrefs, (newValue) => {
  localNotificationPrefs.value = { ...newValue }
}, { deep: true })

watch(() => props.selectedScale, (newValue) => {
  localSelectedScale.value = newValue
})

// 更新通知偏好設定
const updateNotificationPreferences = async () => {
  try {
    const { data } = await apiAuth.put('/line/notification-preferences', {
      email: localNotificationPrefs.value.email,
      line: localNotificationPrefs.value.line,
      inbox: localNotificationPrefs.value.inbox
    })
    if (data.success) {
      emit('update:notification-prefs', { ...localNotificationPrefs.value })
      createSnackbar({
        text: '通知偏好設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新通知偏好設定失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '更新通知偏好設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    // 恢復原值
    localNotificationPrefs.value = { ...props.notificationPrefs }
  }
}

// 處理縮放變更
const handleScaleChange = (size) => {
  appStore.setScale(size)
  emit('update:scale', size)
  createSnackbar({
    text: `介面縮放已設定為 ${size}%`,
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.settings-section-title {
  font-size: 14px !important;
  font-weight: 600;
  color: #424242;
}

.v-checkbox {
  font-size: 11px !important;
}

.v-checkbox:deep(.v-label) {
  font-size: 13px !important;
}

@media (min-width: 600px) {
  .settings-section-title {
    font-size: 16px !important;
  }

  .v-checkbox {
    font-size: 13px !important;
  }

  .v-checkbox:deep(.v-label) {
    font-size: 15px !important;
  }
}
</style>

