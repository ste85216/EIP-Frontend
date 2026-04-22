<template>
  <v-dialog
    v-model="show"
    fullscreen
    transition="fade-transition"
  >
    <v-card class="lightbox-card">
      <v-btn
        icon
        class="lightbox-download-btn me-2"
        style="position: absolute; top: 24px; right: 90px; z-index: 1001; background: rgba(0,0,0,0.5);"
        size="large"
        @click="downloadCurrentImage"
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
        @click="close"
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
        @click="handleBackgroundClick"
      >
        <v-btn
          v-if="imageList.length > 1"
          icon="mdi-chevron-left"
          size="large"
          color="white"
          class="lightbox-nav-btn lightbox-prev"
          :disabled="imageList.length <= 1"
          @click.stop="previousImage"
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
          :src="currentImage"
          class="lightbox-image"
          alt="燈箱預覽圖片"
          @click.stop
          @error="handleImageError"
        >
        <v-btn
          v-if="imageList.length > 1"
          icon="mdi-chevron-right"
          size="large"
          color="white"
          class="lightbox-nav-btn lightbox-next"
          :disabled="imageList.length <= 1"
          @click.stop="nextImage"
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const show = ref(false)
const imageList = ref([])
const currentIndex = ref(0)

const currentImage = computed(() => {
  if (!imageList.value.length) return ''
  const index = currentIndex.value < 0 || currentIndex.value >= imageList.value.length
    ? 0
    : currentIndex.value
  return imageList.value[index]
})

const open = (images, startIndex = 0) => {
  if (!Array.isArray(images) || images.length === 0) return

  const safeImages = images
    .map((img) => (typeof img === 'string' ? img : ''))
    .filter((url) => typeof url === 'string' && url.trim() !== '')

  if (safeImages.length === 0) return

  imageList.value = safeImages
  const index = typeof startIndex === 'number' ? startIndex : 0
  currentIndex.value = index >= 0 && index < safeImages.length ? index : 0
  show.value = true
}

const close = () => {
  show.value = false
}

const previousImage = () => {
  if (imageList.value.length <= 1) return
  const length = imageList.value.length
  currentIndex.value = (currentIndex.value - 1 + length) % length
}

const nextImage = () => {
  if (imageList.value.length <= 1) return
  const length = imageList.value.length
  currentIndex.value = (currentIndex.value + 1) % length
}

const handleBackgroundClick = (event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const handleKeydown = (event) => {
  if (!show.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousImage()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextImage()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

const handleImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.style.display = 'none'
}

const downloadCurrentImage = async () => {
  if (!currentImage.value) return

  try {
    const response = await fetch(currentImage.value, { method: 'GET' })
    if (!response.ok) return

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下載圖片失敗:', error)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  open,
  close
})
</script>

<style lang="scss">
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

