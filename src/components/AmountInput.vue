<template>
  <v-text-field
    ref="inputRef"
    :model-value="displayValue"
    :rules="rules"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="persistentHint"
    :density="density"
    :variant="variant"
    :error="error"
    :error-messages="errorMessages"
    :clearable="clearable"
    class="amount-input"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
    @keydown="handleKeyDown"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    @update:model-value="handleModelValueUpdate"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  persistentHint: {
    type: Boolean,
    default: false
  },
  density: {
    type: String,
    default: 'comfortable'
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessages: {
    type: [String, Array],
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const inputRef = ref(null)
const isComposing = ref(false)

// 保存原始輸入值（不帶格式的數字字符串）
const rawValue = ref(props.modelValue ? props.modelValue.toString() : '')

// 監聽 modelValue 的變化
watch(() => props.modelValue, (newValue) => {
  if (newValue === null || newValue === undefined) {
    rawValue.value = ''
    return
  }
  const strValue = newValue.toString()
  if (strValue !== rawValue.value) {
    rawValue.value = strValue
  }
})

// 用於顯示的格式化值
const displayValue = computed(() => {
  if (!rawValue.value) return ''
  return formatNumber(rawValue.value)
})

// 格式化數字（添加千分位）
const formatNumber = (value) => {
  // 移除所有非數字字符
  const cleanValue = value.toString().replace(/[^\d]/g, '')
  if (!cleanValue) return ''

  // 將數字轉換為帶千分位的格式
  return new Intl.NumberFormat('zh-TW', {
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(Number(cleanValue))
}

// 移除格式化（移除所有非數字字符）
const unformatNumber = (value) => {
  return value.toString().replace(/[^\d]/g, '')
}

// 處理中文輸入開始
const handleCompositionStart = () => {
  isComposing.value = true
}

// 處理中文輸入結束
const handleCompositionEnd = (event) => {
  isComposing.value = false
  handleInput(event)
}

// 處理輸入事件
const handleInput = (event) => {
  // 如果正在輸入中文，不處理輸入事件
  if (isComposing.value) return

  const currentValue = event.target.value
  const unformattedCurrent = unformatNumber(currentValue)

  // 更新原始值
  rawValue.value = unformattedCurrent

  // 發出更新事件
  emit('update:modelValue', unformattedCurrent ? Number(unformattedCurrent) : '')
}

// 處理按鍵事件
const handleKeyDown = (event) => {
  // 允許的按鍵：數字、刪除、退格、方向鍵
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ]

  // 如果不是允許的按鍵，則阻止輸入
  if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
  }
}

// 處理失焦事件
const handleBlur = () => {
  // 在失焦時，如果值為空字符串，保持為空
  if (rawValue.value === '') {
    emit('update:modelValue', '')
    return
  }

  // 否則確保值為數字
  const numValue = Number(rawValue.value)
  if (!isNaN(numValue)) {
    rawValue.value = numValue.toString()
    emit('update:modelValue', numValue)
  }
}

// 處理聚焦事件
const handleFocus = (event) => {
  // 選中所有文字
  event.target.select()
}

// 處理 model-value 更新事件（主要用於處理 clearable 功能）
const handleModelValueUpdate = (value) => {
  // 如果值為空或 null，清空原始值並發出更新事件
  if (!value || value === '') {
    rawValue.value = ''
    emit('update:modelValue', '')
  }
}
</script>

<style lang="scss" scoped>
.amount-input {
  font-variant-numeric: tabular-nums;
  min-width: 106px;
}
</style>
