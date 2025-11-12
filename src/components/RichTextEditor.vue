<template>
  <div
    class="rich-text-editor"
    :style="{ '--editor-height': editorHeight }"
  >
    <div
      ref="editorContainer"
      class="editor-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '請輸入內容...'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  height: {
    type: [Number, String],
    default: 150
  }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let quill = null
let dropHandler = null
let dragOverHandler = null
let pasteHandler = null

// 計算編輯器高度
const editorHeight = computed(() => {
  const height = props.height
  return typeof height === 'number' ? `${height}px` : height
})

// Quill 配置
const quillOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  readOnly: props.readonly,
  modules: {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }
}

// 佔位符圖片 URL
const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// 生成唯一 ID
function generateUniqueId() {
  return `placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 查找並替換佔位符圖片
function replacePlaceholderImage(uniqueId, imageUrl) {
  if (!quill) return false

  try {
    const editor = quill.root
    const images = editor.querySelectorAll('img')

    // 查找對應的佔位符（使用 data 屬性）
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      // 優先使用 data-placeholder-id 匹配
      if (img.dataset.placeholderId === uniqueId) {
        // 直接修改 DOM
        img.src = imageUrl
        delete img.dataset.placeholderId
        delete img.dataset.uploading

        // 觸發內容更新，確保 Quill 知道內容已改變
        const html = quill.root.innerHTML
        emit('update:modelValue', html)
        return true
      }
    }

    // 如果找不到對應的佔位符，嘗試查找所有未替換的佔位符
    // 這是一個備用方案，用於處理 ID 設置失敗的情況
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if (img.src === PLACEHOLDER_IMAGE && (img.dataset.uploading === 'true' || !img.dataset.placeholderId)) {
        // 直接修改 DOM
        img.src = imageUrl
        delete img.dataset.placeholderId
        delete img.dataset.uploading
        const html = quill.root.innerHTML
        emit('update:modelValue', html)
        return true
      }
    }

    return false
  } catch (error) {
    console.error('替換佔位符失敗:', error)
    return false
  }
}

// 移除佔位符圖片
function removePlaceholderImage(uniqueId) {
  if (!quill) return false

  try {
    const editor = quill.root
    const images = editor.querySelectorAll('img')

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if ((img.dataset.placeholderId === uniqueId || img.dataset.uploading === 'true') && img.src === PLACEHOLDER_IMAGE) {
        img.parentNode?.removeChild(img)
        const html = quill.root.innerHTML
        emit('update:modelValue', html)
        return true
      }
    }

    return false
  } catch (error) {
    console.error('移除佔位符失敗:', error)
    return false
  }
}

// 上傳單張圖片
async function uploadImage(file, uniqueId) {
  if (!quill) return

  // 檢查檔案大小（5MB 限制）
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    createSnackbar({
      text: '圖片檔案太大，請選擇小於 5MB 的圖片',
      snackbarProps: { color: 'error' }
    })
    removePlaceholderImage(uniqueId)
    return
  }

  // 檢查檔案類型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    createSnackbar({
      text: '圖片格式錯誤，僅支援 JPG、PNG、GIF、WEBP 格式',
      snackbarProps: { color: 'error' }
    })
    removePlaceholderImage(uniqueId)
    return
  }

  try {
    // 上傳圖片到伺服器
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await apiAuth.post('/tasks/description-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success && data.data?.url) {
      // 構建完整的圖片 URL
      let imageUrl = data.data.url
      // 如果是相對路徑，轉換為完整 URL
      if (imageUrl.startsWith('/')) {
        const baseURL = import.meta.env.VITE_API || 'http://localhost:4002'
        imageUrl = `${baseURL}${imageUrl}`
      }
      // 替換佔位符為實際圖片 URL
      const replaced = replacePlaceholderImage(uniqueId, imageUrl)
      if (!replaced) {
        // 如果替換失敗，嘗試直接插入並移除佔位符
        const editor = quill.root
        const images = editor.querySelectorAll('img')
        // 查找並移除對應的佔位符
        for (let i = images.length - 1; i >= 0; i--) {
          const img = images[i]
          if (img.dataset.placeholderId === uniqueId || (img.src === PLACEHOLDER_IMAGE && img.dataset.uploading === 'true')) {
            const range = quill.getSelection()
            const index = range ? range.index : quill.getLength()
            quill.insertEmbed(index, 'image', imageUrl)
            quill.setSelection(index + 1)
            img.parentNode?.removeChild(img)
            const html = quill.root.innerHTML
            emit('update:modelValue', html)
            break
          }
        }
      }
    } else {
      // 移除佔位符
      removePlaceholderImage(uniqueId)
      createSnackbar({
        text: data.message || '圖片上傳失敗',
        snackbarProps: { color: 'error' }
      })
    }
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    // 移除佔位符
    removePlaceholderImage(uniqueId)
    createSnackbar({
      text: error?.response?.data?.message || '圖片上傳失敗',
      snackbarProps: { color: 'error' }
    })
  }
}

// 圖片上傳處理器
function imageHandler() {
  if (!quill) {
    console.error('Quill 編輯器尚未初始化')
    return
  }

  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()

  input.onchange = async () => {
    const file = input.files[0]
    if (!file) return

    const range = quill.getSelection()
    const index = range ? range.index : quill.getLength()

    // 生成唯一 ID
    const uniqueId = generateUniqueId()

    // 插入載入中的佔位符
    quill.insertEmbed(index, 'image', PLACEHOLDER_IMAGE)
    quill.setSelection(index + 1)

    // 為佔位符設置 data 屬性（等待 DOM 更新）
    await nextTick()
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        const editor = quill.root
        const images = editor.querySelectorAll('img')
        // 從最後一個開始查找，找到第一個沒有 placeholderId 的佔位符
        for (let i = images.length - 1; i >= 0; i--) {
          const img = images[i]
          if (img.src === PLACEHOLDER_IMAGE && !img.dataset.placeholderId) {
            img.dataset.placeholderId = uniqueId
            // 添加一個標記，確保這個佔位符是我們剛插入的
            img.dataset.uploading = 'true'
            break
          }
        }
        resolve()
      })
    })

    await uploadImage(file, uniqueId)
  }
}

// 初始化編輯器
const initEditor = async () => {
  await nextTick()

  if (editorContainer.value && !quill) {
    quill = new Quill(editorContainer.value, quillOptions)

    // 設定初始內容
    if (props.modelValue) {
      quill.root.innerHTML = props.modelValue
    }

    // 監聽內容變化
    quill.on('text-change', () => {
      const html = quill.root.innerHTML
      emit('update:modelValue', html)
    })

    // 檢查編輯器是否有內容（包括文字、圖片等）
    const hasContent = () => {
      const editor = quill.root
      // 檢查是否有文字內容
      const text = quill.getText().trim()
      // 檢查是否有 HTML 內容（如圖片、格式化文字等）
      const html = editor.innerHTML.trim()
      // 如果 HTML 只包含空的段落標籤，視為無內容
      return text !== '' || (html !== '' && html !== '<p><br></p>' && html !== '<p></p>')
    }

    // 監聽 focus 事件，當編輯器獲得焦點時隱藏 placeholder
    quill.root.addEventListener('focus', () => {
      const editor = quill.root
      if (editor.classList.contains('ql-blank')) {
        editor.classList.remove('ql-blank')
      }
    })

    // 監聽 blur 事件，當編輯器失去焦點時檢查是否需要顯示 placeholder
    quill.root.addEventListener('blur', () => {
      const editor = quill.root
      // 如果編輯器是空的，重新添加 ql-blank 類
      if (!hasContent()) {
        editor.classList.add('ql-blank')
      }
    })

    // 監聽 compositionstart 事件，開始中文輸入時隱藏 placeholder
    quill.root.addEventListener('compositionstart', () => {
      const editor = quill.root
      if (editor.classList.contains('ql-blank')) {
        editor.classList.remove('ql-blank')
      }
    })

    // 監聽 compositionend 事件，結束中文輸入時檢查是否需要顯示 placeholder
    quill.root.addEventListener('compositionend', () => {
      const editor = quill.root
      // 如果編輯器是空的，重新添加 ql-blank 類
      if (!hasContent()) {
        editor.classList.add('ql-blank')
      }
    })

    // 監聽 keydown 事件，只在真正輸入內容時隱藏 placeholder
    quill.root.addEventListener('keydown', (e) => {
      // 只處理會產生內容的按鍵
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const editor = quill.root
        if (editor.classList.contains('ql-blank')) {
          editor.classList.remove('ql-blank')
        }
      }
    })

    // 監聽 text-change 事件，確保內容變化時正確處理 placeholder
    quill.on('text-change', () => {
      const editor = quill.root

      if (!hasContent()) {
        // 如果內容為空，添加 ql-blank 類
        if (!editor.classList.contains('ql-blank')) {
          editor.classList.add('ql-blank')
        }
      } else {
        // 如果有內容，移除 ql-blank 類
        if (editor.classList.contains('ql-blank')) {
          editor.classList.remove('ql-blank')
        }
      }
    })

    // 處理貼上事件，攔截圖片並上傳到伺服器（使用捕獲階段，確保在 Quill 處理之前執行）
    pasteHandler = async (e) => {
      const clipboardData = e.clipboardData || window.clipboardData
      if (!clipboardData) return

      const items = clipboardData.items
      if (!items) return

      // 檢查是否有圖片
      let hasImage = false
      const imageItems = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          hasImage = true
          imageItems.push(item)
        }
      }

      // 如果有圖片文件，阻止默認行為和事件冒泡，避免 Quill 重複處理
      if (hasImage) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation() // 阻止同一元素上的其他監聽器執行

        // 記錄處理前的圖片數量，用於後續檢查重複
        const beforeImageCount = quill.root.querySelectorAll('img').length

        // 處理所有圖片文件
        for (let i = 0; i < imageItems.length; i++) {
          const item = imageItems[i]
          const file = item.getAsFile()
          if (!file) continue

          const range = quill.getSelection()
          const index = range ? range.index : quill.getLength()

          // 生成唯一 ID
          const uniqueId = generateUniqueId()

          // 插入載入中的佔位符
          quill.insertEmbed(index, 'image', PLACEHOLDER_IMAGE)
          quill.setSelection(index + 1)

          // 為佔位符設置 data 屬性（等待 DOM 更新）
          await nextTick()
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              const editor = quill.root
              const images = editor.querySelectorAll('img')
              // 從最後一個開始查找，找到第一個沒有 placeholderId 的佔位符
              for (let j = images.length - 1; j >= 0; j--) {
                const img = images[j]
                if (img.src === PLACEHOLDER_IMAGE && !img.dataset.placeholderId) {
                  img.dataset.placeholderId = uniqueId
                  // 添加一個標記，確保這個佔位符是我們剛插入的
                  img.dataset.uploading = 'true'
                  break
                }
              }
              resolve()
            })
          })

          await uploadImage(file, uniqueId)
        }

        // 處理完成後，檢查是否有 Quill 插入的重複圖片並移除
        await nextTick()
        await new Promise(resolve => {
          setTimeout(() => {
            const editor = quill.root
            const images = editor.querySelectorAll('img')
            const afterImageCount = images.length
            const expectedCount = beforeImageCount + imageItems.length

            // 如果圖片數量超過預期，說明有重複插入
            if (afterImageCount > expectedCount) {
              // 找出重複的圖片（沒有 placeholderId 且不是佔位符的圖片）
              for (let i = images.length - 1; i >= 0; i--) {
                const img = images[i]
                // 如果是佔位符或已處理的圖片，跳過
                if (img.src === PLACEHOLDER_IMAGE || img.dataset.placeholderId || img.dataset.uploading) {
                  continue
                }
                // 如果是 data URL 或 blob URL（可能是 Quill 插入的），移除
                if (img.src.startsWith('data:') || img.src.startsWith('blob:')) {
                  img.parentNode?.removeChild(img)
                }
              }
              // 更新內容
              const html = quill.root.innerHTML
              emit('update:modelValue', html)
            }
            resolve()
          }, 100) // 給 Quill 一點時間處理，然後檢查
        })
      }
    }

    // 使用捕獲階段添加事件監聽器到 editorContainer，確保在 Quill 處理之前執行
    if (editorContainer.value) {
      editorContainer.value.addEventListener('paste', pasteHandler, true)
    }

    // 處理拖放圖片事件（使用捕獲階段，確保在 Quill 處理之前執行）
    dropHandler = async (e) => {
      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      // 檢查是否有圖片文件
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      // 如果有圖片文件，阻止默認行為和事件冒泡，避免 Quill 重複處理
      if (imageFiles.length > 0) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation() // 阻止同一元素上的其他監聽器執行

        // 處理所有圖片文件
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const range = quill.getSelection()
          const index = range ? range.index : quill.getLength()

          // 生成唯一 ID
          const uniqueId = generateUniqueId()

          // 插入載入中的佔位符
          quill.insertEmbed(index, 'image', PLACEHOLDER_IMAGE)
          quill.setSelection(index + 1)

          // 為佔位符設置 data 屬性（等待 DOM 更新）
          await nextTick()
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              const editor = quill.root
              const images = editor.querySelectorAll('img')
              // 從最後一個開始查找，找到第一個沒有 placeholderId 的佔位符
              for (let j = images.length - 1; j >= 0; j--) {
                const img = images[j]
                if (img.src === PLACEHOLDER_IMAGE && !img.dataset.placeholderId) {
                  img.dataset.placeholderId = uniqueId
                  // 添加一個標記，確保這個佔位符是我們剛插入的
                  img.dataset.uploading = 'true'
                  break
                }
              }
              resolve()
            })
          })

          await uploadImage(file, uniqueId)
        }
      }
    }

    // 使用捕獲階段添加事件監聽器，確保在 Quill 處理之前執行
    quill.root.addEventListener('drop', dropHandler, true)

    // 阻止默認的拖放行為，避免瀏覽器直接打開圖片
    dragOverHandler = (e) => {
      // 檢查是否有圖片文件
      const items = e.dataTransfer?.items
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            // 如果有圖片文件，阻止默認行為
            e.preventDefault()
            e.stopPropagation()
            return
          }
        }
      }
    }
    quill.root.addEventListener('dragover', dragOverHandler, true)
  }
}

// 監聽 modelValue 變化
watch(() => props.modelValue, (newValue) => {
  if (quill && quill.root.innerHTML !== newValue) {
    quill.root.innerHTML = newValue || ''
  }
})

// 監聽 readonly 變化
watch(() => props.readonly, (newValue) => {
  if (quill) {
    quill.enable(!newValue)
  }
})

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  if (quill) {
    // 清理事件監聽器
    if (dropHandler) {
      quill.root.removeEventListener('drop', dropHandler, true)
      dropHandler = null
    }
    if (dragOverHandler) {
      quill.root.removeEventListener('dragover', dragOverHandler, true)
      dragOverHandler = null
    }
    quill = null
  }
  // 清理貼上事件監聽器
  if (pasteHandler && editorContainer.value) {
    editorContainer.value.removeEventListener('paste', pasteHandler, true)
    pasteHandler = null
  }
})

// 暴露方法給父組件
defineExpose({
  getContent: () => quill ? quill.root.innerHTML : '',
  setContent: (content) => {
    if (quill) {
      quill.root.innerHTML = content || ''
    }
  },
  focus: () => {
    if (quill) {
      quill.focus()
    }
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.editor-container {
  min-height: 200px;
}

/* 覆蓋 Quill 預設樣式 */

:deep(.ql-container) {
  border: none;
  font-size: 14px;
}

:deep(.ql-editor) {
  border: 1px solid #ccc;
  border-top: none;
  min-height: var(--editor-height, 150px);
  padding: 16px;
}

:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
}

/* 響應式設計 */
@media (max-width: 768px) {
  :deep(.ql-toolbar) {
    padding: 8px;
  }

  :deep(.ql-toolbar .ql-formats) {
    margin-right: 8px;
  }

  :deep(.ql-editor) {
    padding: 12px;
    min-height: 120px;
  }
}
</style>
