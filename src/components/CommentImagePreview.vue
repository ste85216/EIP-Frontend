<template>
  <div class="comment-image-preview">
    <!-- 單張圖片 -->
    <div
      v-if="images.length === 1"
      class="single-image"
    >
      <img
        :src="getImageUrl(images[0])"
        :alt="images[0].originalName"
        class="preview-image clickable"
        @click="openImageDialog(0)"
        @error="handleImageError"
      >
    </div>

    <!-- 多張圖片網格 -->
    <div
      v-else-if="images.length > 1"
      class="image-grid"
      :class="`grid-${Math.min(images.length, 4)}`"
    >
      <div
        v-for="(image, index) in images.slice(0, 4)"
        :key="image.filename || index"
        class="grid-item"
        :class="{ 'has-more': index === 3 && images.length > 4 }"
        @click="openImageDialog(index)"
      >
        <img
          :src="getImageUrl(image)"
          :alt="image.originalName"
          class="grid-image"
          @error="handleImageError"
        >
        <!-- 更多圖片遮罩 -->
        <div
          v-if="index === 3 && images.length > 4"
          class="more-overlay"
        >
          <span class="more-text">+{{ images.length - 4 }}</span>
        </div>
      </div>
    </div>

    <!-- 燈箱圖片預覽對話框 -->
    <v-dialog
      v-model="showImageDialog"
      height="100vh"
      fullscreen
      transition="fade-transition"
      @keydown.esc="showImageDialog = false"
    >
      <v-card
        class="lightbox-card"
        color="rgba(0,0,0,0.8)"
      >
        <v-btn
          icon
          class="lightbox-download-btn me-2"
          style="position: absolute; top: 24px; right: 90px; z-index: 1001; background: rgba(0,0,0,0.5);"
          size="large"
          @click="downloadImage(currentImage)"
        >
          <v-icon
            size="28"
            color="white"
          >
            mdi-download
          </v-icon>
        </v-btn>
        <v-btn
          icon
          class="lightbox-close-btn"
          style="position: absolute; top: 24px; right: 32px; z-index: 1001; background: rgba(0,0,0,0.5);"
          color="white"
          size="large"
          @click="showImageDialog = false"
        >
          <v-icon
            size="32"
            color="white"
          >
            mdi-close
          </v-icon>
        </v-btn>
        <div
          class="lightbox-content"
          @click="closeOnBackgroundClick"
        >
          <v-btn
            v-if="images.length > 1"
            icon="mdi-chevron-left"
            size="large"
            color="white"
            class="lightbox-nav-btn lightbox-prev"
            :disabled="currentImageIndex === 0"
            @click="previousImage"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <img
            v-if="currentImage"
            :src="getImageUrl(currentImage)"
            class="lightbox-image"
            :alt="currentImage.originalName || '圖片預覽'"
            @error="handleImageError"
            @click.stop
          >
          <v-btn
            v-if="images.length > 1"
            icon="mdi-chevron-right"
            size="large"
            color="white"
            class="lightbox-nav-btn lightbox-next"
            :disabled="currentImageIndex === images.length - 1"
            @click="nextImage"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </div>
        <div
          class="text-center mt-2"
          style="color: #fff; opacity: 0.7;"
        >
          點擊背景區域、右上角關閉，或按 ESC 離開預覽
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
})

// 響應式變數
const showImageDialog = ref(false)
const currentImageIndex = ref(0)

// 計算屬性
const currentImage = computed(() => {
  return props.images[currentImageIndex.value]
})

// 取得圖片 URL
const getImageUrl = (image) => {
  // 如果是檔案物件（本地預覽）
  if (image.preview) {
    return image.preview
  }

  // 如果是伺服器上的圖片
  if (image.path) {
    // 確保路徑正確，從 path 中提取相對路徑
    const cleanPath = image.path.replace(/\\/g, '/')
    // 提取 uploads 之後的路徑
    const relativePath = cleanPath.includes('/uploads/')
      ? cleanPath.split('/uploads/')[1]
      : `comments/${image.filename}`
    const finalUrl = `${import.meta.env.VITE_API}/uploads/${relativePath}`
    console.log('圖片 URL 生成:', { image, cleanPath, relativePath, finalUrl, apiUrl: import.meta.env.VITE_API })
    return finalUrl
  }

  // 備用：使用 filename
  if (image.filename) {
    const backupUrl = `${import.meta.env.VITE_API}/uploads/comments/${image.filename}`
    console.log('使用備用圖片 URL:', { image, backupUrl, apiUrl: import.meta.env.VITE_API })
    return backupUrl
  }

  console.log('無法生成圖片 URL:', image)
  return ''
}

// 開啟圖片對話框
const openImageDialog = (index) => {
  currentImageIndex.value = index
  showImageDialog.value = true
}

// 上一張圖片
const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// 下一張圖片
const nextImage = () => {
  if (currentImageIndex.value < props.images.length - 1) {
    currentImageIndex.value++
  }
}

// 處理圖片載入錯誤
const handleImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.style.display = 'none'
}

// 點擊背景區域關閉燈箱
const closeOnBackgroundClick = (event) => {
  // 只有點擊背景區域時才關閉（不是圖片或按鈕）
  if (event.target === event.currentTarget) {
    showImageDialog.value = false
  }
}

// 鍵盤導航
const handleKeydown = (event) => {
  if (!showImageDialog.value) return

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousImage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextImage()
      break
    case 'Escape':
      event.preventDefault()
      showImageDialog.value = false
      break
  }
}

// 組件掛載時添加鍵盤監聽
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 組件卸載時移除鍵盤監聽
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 下載圖片
const downloadImage = async (image) => {
  if (!image) return

  try {
    const imageUrl = getImageUrl(image)
    const response = await fetch(imageUrl)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = image.originalName || image.filename || 'image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('下載圖片失敗:', error)
  }
}
</script>

<style lang="scss" scoped>
.comment-image-preview {
  margin-top: 8px;

  .single-image {
    max-width: 240px;
    max-height: 200px;
    border: 1px solid rgb(var(--v-theme-outline-variant));

    .preview-image {
      border-radius: 8px;
      max-height: 200px;
      max-width: 560px;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.02);
      }
    }
  }

  .image-grid {
    display: grid;
    gap: 4px;
    max-width: 300px;
    border-radius: 8px;
    overflow: hidden;

    &.grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    &.grid-3 {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr;
    }

    &.grid-4 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }

  .grid-item {
    position: relative;
    aspect-ratio: 1;
    cursor: pointer;
    overflow: hidden;

    .grid-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .more-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;

      .more-text {
        color: white;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

}

.clickable {
  cursor: pointer;
}
</style>

<!-- 全域燈箱樣式（不使用 scoped 避免樣式問題） -->
<style lang="scss">
/* 燈箱樣式 */
.lightbox-card {
  background: rgba(0, 0, 0, 0.8) !important;
}

.lightbox-close-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 1001;
  background: rgba(0,0,0,0.5) !important;
}

.lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  position: relative;
}

.lightbox-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5) !important;
  border-radius: 50%;
  z-index: 10;
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-nav-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}

.lightbox-close-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}

.lightbox-download-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}
</style>
