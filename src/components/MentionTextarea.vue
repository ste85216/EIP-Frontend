<template>
  <div class="mention-textarea-container">
    <v-textarea
      ref="textareaRef"
      v-model="localValue"
      :placeholder="placeholder"
      :variant="variant"
      :density="density"
      :rows="rows"
      :hide-details="hideDetails"
      :auto-grow="autoGrow"
      class="mention-textarea"
      @keydown="handleKeydown"
      @input="handleInput"
      @click="handleClick"
    />

    <!-- 標記建議下拉選單 -->
    <teleport to="body">
      <div
        v-if="showSuggestions"
        class="mention-suggestions"
        :style="{
          position: 'fixed',
          top: mentionPosition.top + 'px',
          left: mentionPosition.left + 'px',
          zIndex: 9999
        }"
      >
        <v-card
          v-if="filteredSuggestions.length > 0"
          max-height="200"
          min-width="250"
          class="mention-card"
        >
          <v-list density="compact">
            <v-list-item
              v-for="(user, index) in filteredSuggestions"
              :key="user._id"
              :class="{ 'v-list-item--active': index === selectedIndex }"
              @click="selectMention(user)"
              @mouseenter="selectedIndex = index"
            >
              <template #prepend>
                <UserAvatar
                  :user="user"
                  size="24"
                  class="me-2"
                />
              </template>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card
          v-else-if="mentionQuery.length > 0"
          max-height="200"
          min-width="250"
          class="mention-card"
        >
          <v-list>
            <v-list-item>
              <v-list-item-title class="text-medium-emphasis">
                無符合的成員
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '輸入評論...'
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  density: {
    type: String,
    default: 'compact'
  },
  rows: {
    type: [Number, String],
    default: 3
  },
  hideDetails: {
    type: Boolean,
    default: false
  },
  autoGrow: {
    type: Boolean,
    default: false
  },
  availableUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'mention-added'])

// 響應式變數
const textareaRef = ref(null)
const localValue = ref(props.modelValue)
const showSuggestions = ref(false)
const selectedIndex = ref(0)
const mentionPosition = ref({ left: 0, top: 0 })
const mentionStart = ref(-1)
const mentionQuery = ref('')
const mentions = ref([]) // 儲存所有標記的用戶

// 計算屬性
const filteredSuggestions = computed(() => {
  if (!props.availableUsers || props.availableUsers.length === 0) return []

  // 如果沒有查詢字串，顯示所有用戶
  if (!mentionQuery.value || mentionQuery.value.trim() === '') {
    return props.availableUsers
  }

  const query = mentionQuery.value.toLowerCase()
  return props.availableUsers.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// 監聽 modelValue 變化
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

// 監聽 localValue 變化並發送給父組件
// 但跳過在 selectMention 中手動觸發的更新，避免雙重觸發
let skipNextEmit = false
watch(localValue, (newValue) => {
  if (skipNextEmit) {
    skipNextEmit = false
    return
  }
  emit('update:modelValue', newValue)
})

// 處理輸入事件
const handleInput = (event) => {
  const value = event.target.value
  const cursorPosition = event.target.selectionStart

  // 只有在實際輸入內容時才檢查標記
  if (value.length > 0) {
    checkForMention(value, cursorPosition)
  } else {
    hideSuggestions()
  }
}

// 處理點擊事件
const handleClick = () => {
  // 點擊時不自動檢查標記，只有輸入時才檢查
  return
}

// 檢查是否需要顯示標記建議
const checkForMention = (value, cursorPosition) => {
  // 找到游標前最近的 @ 符號
  const textBeforeCursor = value.substring(0, cursorPosition)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex === -1) {
    hideSuggestions()
    return
  }

  // 檢查 @ 符號後面是否有空格或換行
  const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
  if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
    hideSuggestions()
    return
  }

  // 檢查 @ 符號前面是否為空格、換行或字串開頭
  const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
  if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
    hideSuggestions()
    return
  }

  // 顯示建議並設定查詢字串
  mentionStart.value = lastAtIndex
  mentionQuery.value = textAfterAt
  selectedIndex.value = 0

  // 只有在有 @ 符號且有可用用戶時才顯示建議
  if (props.availableUsers && props.availableUsers.length > 0) {
    // 計算建議選單的位置
    nextTick(() => {
      calculateMentionPosition()
      showSuggestions.value = true
    })
  } else {
    hideSuggestions()
  }
}

// 計算標記建議選單的位置
const calculateMentionPosition = () => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value.$el.querySelector('textarea')
  if (!textarea) return

  const rect = textarea.getBoundingClientRect()
  const textareaStyle = window.getComputedStyle(textarea)

  // 取得字體相關資訊
  const fontSize = parseFloat(textareaStyle.fontSize) || 14
  const lineHeight = parseFloat(textareaStyle.lineHeight) || fontSize * 1.2
  const paddingLeft = parseFloat(textareaStyle.paddingLeft) || 12
  const paddingTop = parseFloat(textareaStyle.paddingTop) || 8

  // 估算 @ 符號的位置
  const textBeforeMention = localValue.value.substring(0, mentionStart.value)
  const lines = textBeforeMention.split('\n')
  const currentLine = lines.length - 1
  const currentLineText = lines[currentLine] || ''

  // 簡單的字符寬度估算（實際應該使用 canvas measureText，但這裡用簡化版本）
  const charWidth = fontSize * 0.6 // 大概的字符寬度
  const atPositionX = currentLineText.length * charWidth

  // 根據實際建議數量計算選單高度
  const suggestionCount = filteredSuggestions.value.length
  const itemHeight = 58 // 每個選項的大概高度
  const menuPadding = 16 // 選單內邊距

  // 如果沒有符合的成員，使用固定的「無符合成員」提示高度
  const actualMenuHeight = suggestionCount === 0
    ? 76  // 「無符合成員」提示的固定高度
    : Math.min(suggestionCount * itemHeight + menuPadding, 210) // 最大高度限制為210

  // 計算建議選單位置（在 @ 符號上方，根據實際高度調整）
  const menuLeft = rect.left + paddingLeft + atPositionX // @ 符號位置
  const menuTop = rect.top + paddingTop + (currentLine * lineHeight) - actualMenuHeight // 在當前行上方

  // 視窗邊界檢查
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth
  const menuWidth = 260

  // 確保不超出視窗邊界
  const clampedLeft = Math.min(menuLeft, Math.max(0, viewportWidth - menuWidth - 8))
  // 如果上方空間不足，至少保持在視窗頂部
  const clampedTop = Math.max(8, menuTop)

  mentionPosition.value = {
    left: clampedLeft,
    top: clampedTop
  }
}

// 隱藏建議選單
const hideSuggestions = () => {
  showSuggestions.value = false
  mentionStart.value = -1
  mentionQuery.value = ''
  selectedIndex.value = 0
}

// 選擇標記用戶
const selectMention = (user) => {
  if (mentionStart.value === -1) return

  // 保存當前的 mentionStart 位置，因為 hideSuggestions() 會重置它
  const currentMentionStart = mentionStart.value
  const currentMentionQuery = mentionQuery.value

  const beforeMention = localValue.value.substring(0, currentMentionStart)
  const afterMention = localValue.value.substring(currentMentionStart + 1 + currentMentionQuery.length)

  // 插入標記（在人名後加空格）
  const mentionText = `@${user.name} `
  const newValue = beforeMention + mentionText + afterMention

  // 計算新的游標位置（在插入的標記文本之後）
  const newCursorPosition = currentMentionStart + mentionText.length

  // 更新值
  localValue.value = newValue

  // 記錄標記的用戶（不包含空格）
  const mention = {
    user: user._id,
    name: user.name,
    start: currentMentionStart,
    end: currentMentionStart + mentionText.length - 1 // 不包含空格
  }

  // 更新標記列表
  mentions.value.push(mention)
  emit('mention-added', mention)

  // 更新父組件的值，並標記跳過下一次 watch 觸發
  skipNextEmit = true
  emit('update:modelValue', newValue)

  hideSuggestions()

  // 設定游標位置（在空格後面）
  nextTick(() => {
    if (textareaRef.value) {
      const textarea = textareaRef.value.$el.querySelector('textarea')
      if (textarea) {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }
    }
  })
}

// 處理鍵盤事件
const handleKeydown = (event) => {
  if (!showSuggestions.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredSuggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      if (filteredSuggestions.value.length > 0) {
        event.preventDefault()
        selectMention(filteredSuggestions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      hideSuggestions()
      break
  }
}

// 取得所有標記的用戶
const getMentions = () => {
  // 使用存儲的標記列表，而不是重新解析文本
  return mentions.value.map(mention => ({
    user: mention.user,
    name: mention.name
  }))
}

// 清空標記列表
const clearMentions = () => {
  mentions.value = []
}

// 點擊外部關閉建議選單
const handleClickOutside = (event) => {
  if (showSuggestions.value && !event.target.closest('.mention-textarea-container')) {
    hideSuggestions()
  }
}

// 組件掛載和卸載時添加/移除事件監聽器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法給父組件
defineExpose({
  getMentions,
  clearMentions,
  focus: () => {
    if (textareaRef.value) {
      const textarea = textareaRef.value.$el.querySelector('textarea')
      if (textarea) textarea.focus()
    }
  }
})
</script>

<style scoped>
.mention-textarea-container {
  position: relative;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white;
}

.v-list-item--active .v-list-item-title,
.v-list-item--active .v-list-item-subtitle {
  color: white !important;
}

.mention-suggestions {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
}

.mention-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

</style>
