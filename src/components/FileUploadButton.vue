<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      style="display: none"
      @change="handleFileChange"
    >
    <!-- 大螢幕版本 -->
    <v-btn
      v-if="isLgmUp"
      v-tooltip:top="'檔案不超過 2MB，格式僅限 JPG、PNG、WEBP。'"
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
        color="deep-purple-darken-2"
        class="me-2"
      />
      更換大頭貼
    </v-btn>

    <!-- 小螢幕版本 -->
    <v-btn
      v-else
      color="blue-grey-darken-2"
      size="24"
      elevation="0"
      rounded="xl"
      :loading="isUploading"
      @click="$refs.fileInput.click()"
    >
      <v-icon
        icon="mdi-camera-outline"
        size="14"
      />
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
const { width } = useDisplay()
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
