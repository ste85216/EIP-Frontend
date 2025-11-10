<!-- eslint-disable vue/no-v-html -->
<template>
  <v-dialog
    v-model="isOpen"
    :max-width="dialogWidth"
    @click:outside="() => emit('update:modelValue', false)"
    @keydown.esc="() => emit('update:modelValue', false)"
  >
    <v-card class="rounded-lg">
      <div
        class="card-title px-6 py-3 d-flex align-center"
        :class="headerColor"
      >
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          {{ headerIcon }}
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
        <div
          class="card-content"
          v-html="message"
        />
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
    default: '確認操作'
  },
  message: {
    type: String,
    default: '你確定要執行這個操作嗎？'
  },
  modelValue: Boolean,
  confirmButtonColor: {
    type: String,
    default: 'teal-lighten-1' // 確認按鈕預設顏色
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
  headerColor: {
    type: String,
    default: 'bg-teal-lighten-1' // 標題欄預設顏色
  },
  headerIcon: {
    type: String,
    default: 'mdi-check-circle' // 標題欄預設圖示
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
