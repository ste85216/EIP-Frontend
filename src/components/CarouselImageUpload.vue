<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      style="display: none"
      @change="handleFileChange"
    >

    <!-- 圖片預覽區域 -->
    <div class="image-upload-container">
      <!-- 現有圖片或新上傳的圖片 -->
      <div
        v-if="displayImage"
        class="image-preview"
      >
        <v-img
          :src="displayImage"
          :alt="'輪播圖預覽'"
          cover
          height="200"
          class="rounded-lg border"
          @error="handleImageError"
        />
        <div class="image-overlay">
          <v-btn
            icon
            color="white"
            size="small"
            variant="elevated"
            @click="$refs.fileInput.click()"
          >
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- 沒有圖片時的佔位符 -->
      <div
        v-else
        class="image-placeholder"
        @click="$refs.fileInput.click()"
      >
        <v-icon
          size="48"
          color="grey-lighten-1"
        >
          mdi-image-plus
        </v-icon>
        <div class="text-grey-lighten-1 mt-2">
          點擊上傳輪播圖片
        </div>
        <div class="text-caption text-grey-lighten-2 mt-1">
          支援 JPG、PNG、WebP、GIF 格式，最大 5MB
        </div>
      </div>

      <!-- 上傳進度 -->
      <v-progress-linear
        v-if="isUploading"
        indeterminate
        color="cyan-darken-2"
        class="mt-2"
      />
    </div>

    <!-- 圖片資訊 -->
    <div
      v-if="displayImage"
      class="image-info mt-3"
    >
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        <div class="d-flex align-center">
          <v-icon
            size="16"
            class="me-2"
          >
            mdi-information
          </v-icon>
          <span class="text-caption">
            圖片已上傳，點擊圖片可重新選擇
          </span>
        </div>
      </v-alert>
    </div>

    <!-- 重新選擇按鈕 -->
    <div
      v-if="displayImage"
      class="d-flex justify-center mt-2"
    >
      <v-btn
        color="cyan-darken-2"
        variant="outlined"
        size="small"
        prepend-icon="mdi-camera"
        :loading="isUploading"
        @click="$refs.fileInput.click()"
      >
        重新選擇圖片
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'

const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null
  },
  existingImage: {
    type: String,
    default: null
  },
  isUploading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'upload-start', 'upload-end'])

const fileInput = ref(null)
const createSnackbar = useSnackbar()
const isUploading = ref(false)

// 顯示的圖片
const displayImage = computed(() => {
  if (props.modelValue instanceof File) {
    return URL.createObjectURL(props.modelValue)
  }
  if (props.modelValue) {
    return props.modelValue
  }
  if (props.existingImage) {
    return props.existingImage
  }
  return null
})

// 處理檔案選擇
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 驗證檔案類型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    createSnackbar({
      text: '圖片格式錯誤，僅支援 JPEG、PNG、WebP、GIF',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 驗證檔案大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    createSnackbar({
      text: '圖片大小不能超過 5MB',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  try {
    isUploading.value = true
    emit('upload-start')

    // 模擬上傳延遲
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新 modelValue
    emit('update:modelValue', file)
    emit('upload-end')

    createSnackbar({
      text: '圖片選擇成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('上傳錯誤:', error)
    createSnackbar({
      text: '圖片上傳失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUploading.value = false
    event.target.value = ''
  }
}

// 圖片錯誤處理
const handleImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.src = '/image/placeholder.png'
}

// 監聽外部上傳狀態
watch(() => props.isUploading, (newVal) => {
  isUploading.value = newVal
})
</script>

<style lang="scss" scoped>
.image-upload-container {
  position: relative;
  width: 100%;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px dashed #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #26a69a;

    .image-overlay {
      opacity: 1;
    }
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;

  &:hover {
    border-color: #26a69a;
    background: #f0f0f0;
  }
}

.image-info {
  .v-alert {
    font-size: 0.875rem;
  }
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}
</style>
