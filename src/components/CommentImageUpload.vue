<template>
  <div class="comment-image-upload">
    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- 圖片預覽區域 -->
    <div
      v-if="selectedImages.length > 0"
      class="image-preview-container mb-3"
    >
      <div class="image-preview-grid">
        <div
          v-for="(image, index) in selectedImages"
          :key="index"
          class="image-preview-item"
        >
          <div class="position-relative">
            <img
              :src="image.preview"
              :alt="image.file.name"
              class="preview-image"
            >
            <v-btn
              icon
              size="24"
              class="remove-image-btn"
              @click="removeImage(index)"
            >
              <v-icon
                size="14"
                color="blue-grey-darken-2"
              >
                mdi-close
              </v-icon>
            </v-btn>
            <!-- 檔案資訊 -->
            <div class="image-info">
              <div class="text-caption text-truncate">
                {{ image.file.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatFileSize(image.file.size) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上傳按鈕和拖拽區域 -->
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @click="openFileDialog"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
    >
      <div class="upload-content">
        <v-icon
          size="24"
          color="grey-darken-1"
          class="mb-2"
        >
          mdi-camera-plus
        </v-icon>
        <div class="text-body-2 text-medium-emphasis mb-1">
          點擊或拖曳上傳圖片
        </div>
        <div class="text-caption text-medium-emphasis">
          支援 JPG、PNG、WEBP，最大 2MB，最多 3 張
        </div>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-if="errorMessage"
      class="text-caption text-red mt-2"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: 3
  },
  maxFileSize: {
    type: Number,
    default: 2 * 1024 * 1024 // 2MB
  }
})

const emit = defineEmits(['update:modelValue', 'files-selected'])

// 響應式變數
const fileInputRef = ref(null)
const selectedImages = ref([])
const isDragOver = ref(false)
const errorMessage = ref('')

// 計算屬性
const canAddMore = computed(() => {
  return selectedImages.value.length < props.maxFiles
})

// 開啟檔案選擇對話框
const openFileDialog = () => {
  if (!canAddMore.value) {
    errorMessage.value = `最多只能上傳 ${props.maxFiles} 張圖片`
    return
  }
  fileInputRef.value?.click()
}

// 處理檔案選擇
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  // 清空輸入框
  event.target.value = ''
}

// 處理拖拽上傳
const handleDrop = (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

// 處理檔案
const processFiles = (files) => {
  errorMessage.value = ''

  // 過濾圖片檔案
  const imageFiles = files.filter(file => {
    const isImage = file.type.startsWith('image/')
    const isSupportedFormat = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    return isImage && isSupportedFormat
  })

  if (imageFiles.length !== files.length) {
    errorMessage.value = '只能上傳 JPG、PNG、WEBP 格式的圖片'
    return
  }

  // 檢查檔案數量限制
  const totalFiles = selectedImages.value.length + imageFiles.length
  if (totalFiles > props.maxFiles) {
    errorMessage.value = `最多只能上傳 ${props.maxFiles} 張圖片`
    return
  }

  // 檢查檔案大小
  const oversizedFiles = imageFiles.filter(file => file.size > props.maxFileSize)
  if (oversizedFiles.length > 0) {
    errorMessage.value = `圖片大小不能超過 ${formatFileSize(props.maxFileSize)}`
    return
  }

  // 建立預覽
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        file,
        preview: e.target.result,
        id: Date.now() + Math.random()
      }
      selectedImages.value.push(imageData)
      updateModelValue()
    }
    reader.readAsDataURL(file)
  })
}

// 移除圖片
const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
  updateModelValue()
  errorMessage.value = ''
}

// 更新 modelValue
const updateModelValue = () => {
  const files = selectedImages.value.map(img => img.file)
  emit('update:modelValue', files)
  emit('files-selected', files)
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 清空選擇的圖片
const clearImages = () => {
  selectedImages.value = []
  updateModelValue()
  errorMessage.value = ''
}

// 暴露方法給父組件
defineExpose({
  clearImages
})
</script>

<style lang="scss" scoped>
.comment-image-upload {
  .image-preview-container {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    background-color: #eee;
  }

  .image-preview-grid {
    display: flex;
    gap: 8px;
  }

  .image-preview-item {
    position: relative;
    flex: 1;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    max-width: 178px; // 每個圖片最大寬度
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-image-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background-color: rgba(255, 255, 255, 0.9) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  .image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    padding: 4px 6px 2px;
    font-size: 10px;
    line-height: 1.2;
  }

  .upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #eee;
    }

    &.drag-over {
      border-color: #ddd;
      background-color: #eee;
    }
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
