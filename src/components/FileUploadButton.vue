<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      style="display: none"
      @change="handleFileChange"
    >
    <!-- 大螢幕版本 (≥1500px) -->
    <v-btn
      v-if="isLgmUp"
      prepend-icon="mdi-camera-outline"
      color="blue-grey-darken-2"
      variant="outlined"
      :loading="isUploading"
      @click="$refs.fileInput.click()"
    >
      <v-progress-circular
        v-if="isUploading"
        indeterminate
        size="20"
        width="2"
        color="deep-orange-darken-2"
        class="me-2"
      />
      更換大頭貼
    </v-btn>

    <!-- 中等螢幕版本 (≥768px 且 <1500px) -->
    <v-btn
      v-else-if="mdAndUp"
      v-tooltip:top="'更換大頭貼'"
      icon
      color="blue-grey-darken-2"
      size="32"
      class="me-4"
      elevation="2"
      :loading="isUploading"
      @click="$refs.fileInput.click()"
    >
      <v-icon size="18">
        mdi-camera-outline
      </v-icon>
    </v-btn>

    <!-- 小螢幕版本 (<768px) -->
    <v-btn
      v-else
      icon
      color="blue-grey-darken-2"
      size="28"
      class="me-4"
      elevation="2"
      :loading="isUploading"
      @click="$refs.fileInput.click()"
    >
      <v-icon size="14">
        mdi-camera-outline
      </v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'

const fileInput = ref(null)
const user = useUserStore()
const createSnackbar = useSnackbar()
const isUploading = ref(false)
const { mdAndUp, width } = useDisplay()
const isLgmUp = computed(() => width.value >= 1500)

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    createSnackbar({
      text: '只能上傳 JPG、PNG、WEBP 格式的圖片',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    createSnackbar({
      text: '圖片大小不能超過 2MB',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    isUploading.value = true
    await user.updateAvatar(formData)

    // 添加時間戳強制更新圖片
    const timestamp = new Date().getTime()
    user.avatar = `${user.avatar}?t=${timestamp}`

    createSnackbar({
      text: '大頭貼更新成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('Upload error:', error)
    createSnackbar({
      text: error.message || '上傳失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUploading.value = false
    event.target.value = ''
  }
}
</script>
