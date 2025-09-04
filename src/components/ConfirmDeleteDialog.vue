<!-- eslint-disable vue/no-v-html -->
<template>
  <v-dialog
    v-model="isOpen"
    :max-width="dialogWidth"
    @click:outside="() => emit('update:modelValue', false)"
    @keydown.esc="() => emit('update:modelValue', false)"
  >
    <v-card class="rounded-lg">
      <div class="card-title px-6 py-3 bg-red-lighten-1 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-delete-alert
        </v-icon>
        {{ title }}
        <v-spacer />
        <v-btn
          icon
          color="white"
          variant="plain"
          class="opacity-100"
          :ripple="false"
          size="20"
          @click="cancel"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
      <v-card-text class="px-6 pt-6 pb-3">
        <div v-html="message" />
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn
          :size="buttonSize"
          :color="cancelButtonColor"
          variant="outlined"
          class="me-1"
          @click="cancel"
        >
          {{ cancelButtonText }}
        </v-btn>
        <v-btn
          :size="buttonSize"
          :color="confirmButtonColor"
          variant="outlined"
          @click="confirm"
        >
          {{ confirmButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'

const { smAndUp } = useDisplay()

const props = defineProps({
  dialogWidth: {
    type: String,
    default: '360'
  },
  title: {
    type: String,
    default: '確認刪除'
  },
  message: {
    type: String,
    default: '你確定要刪除這個項目嗎？此操作無法恢復。'
  },
  modelValue: Boolean,
  confirmButtonColor: {
    type: String,
    default: 'red-lighten-1' // 確認按鈕預設顏色
  },
  cancelButtonColor: {
    type: String,
    default: 'grey-darken-1' // 取消按鈕預設顏色
  },
  confirmButtonText: {
    type: String,
    default: '確認' // 確認按鈕預設文字
  },
  cancelButtonText: {
    type: String,
    default: '取消' // 取消按鈕預設文字
  },
  cancelButtonSize: {
    type: String,
    default: 'default' // 取消按紐預設大小
  },
  confirmButtonSize: {
    type: String,
    default: 'default' // 確認按紐預設大小
  }
})

// 計算按鈕大小，與其他頁面保持一致
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>

</style>
