<template>
  <div class="rich-text-editor">
    <div
      ref="editorContainer"
      class="editor-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

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
  }
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let quill = null

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

// 圖片上傳處理器
function imageHandler() {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()

  input.onchange = async () => {
    const file = input.files[0]
    if (file) {
      try {
        // 這裡可以上傳到你的後端 API
        // 暫時使用 base64 編碼
        const base64 = await fileToBase64(file)
        const range = quill.getSelection()
        quill.insertEmbed(range.index, 'image', base64)
        quill.setSelection(range.index + 1)
      } catch (error) {
        console.error('圖片上傳失敗:', error)
      }
    }
  }
}

// 將檔案轉換為 base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
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
    quill = null
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
  min-height: 150px;
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
