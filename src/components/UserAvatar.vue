<template>
  <v-avatar
    :size="size"
    :color="avatarInfo.color"
    :class="avatarClass"
  >
    <v-img
      v-if="avatarInfo.avatar"
      :src="avatarInfo.avatar"
      :alt="user.name"
    />
    <span
      v-else-if="avatarInfo.isDefault"
      class="text-white font-weight-bold"
      :style="{ fontSize: fontSize }"
    >
      {{ avatarInfo.initials }}
    </span>
    <v-icon
      v-else
      :size="iconSize"
    >
      mdi-account
    </v-icon>
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  size: {
    type: [String, Number],
    default: 40
  },
  avatarClass: {
    type: String,
    default: ''
  }
})

const userStore = useUserStore()

// 計算字體大小
const fontSize = computed(() => {
  const size = typeof props.size === 'string' ? parseInt(props.size) : props.size
  return `${Math.max(8, size * 0.4)}px`
})

// 計算圖示大小
const iconSize = computed(() => {
  const size = typeof props.size === 'string' ? parseInt(props.size) : props.size
  return Math.max(16, size * 0.6)
})

// 取得頭像資訊
const avatarInfo = computed(() => {
  return userStore.getUserAvatarInfo(props.user)
})
</script>
