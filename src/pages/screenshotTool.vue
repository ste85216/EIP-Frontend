<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>網頁截圖工具</h3>
      </v-col>

      <!-- 輸入區域 -->
      <v-col cols="12">
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <v-text-field
              v-model="url"
              label="網址"
              placeholder="https://example.com"
              prepend-inner-icon="mdi-web"
              variant="outlined"
              density="comfortable"
              :rules="urlRules"
              :disabled="isCapturing"
              hide-details="auto"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-camera"
              :loading="isCapturing"
              :disabled="!isValidUrl || isCapturing"
              block
              @click="captureScreenshot"
            >
              截圖
            </v-btn>
          </v-col>
        </v-row>
      </v-col>

      <!-- 元素選擇設定 -->
      <v-col cols="12">
        <v-expansion-panels v-model="panel">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="me-2">
                mdi-code-tags
              </v-icon>
              元素選擇設定（選填）
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="elementSelector"
                    label="CSS 選擇器"
                    placeholder="例如: #tripFeatures 或 section#tripFeatures"
                    prepend-inner-icon="mdi-tag"
                    variant="outlined"
                    density="comfortable"
                    hint="輸入 CSS 選擇器來選擇特定元素，例如: #tripFeatures, .my-class, section#tripFeatures"
                    persistent-hint
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                  >
                    <div class="mb-2">
                      <strong>提示：</strong>
                    </div>
                    <ul class="mb-0 ps-4">
                      <li>如果輸入選擇器，將只截取該元素的內容</li>
                      <li>留空則截取整個頁面</li>
                      <li>範例：<code>#tripFeatures</code>、<code>section#tripFeatures</code>、<code>.my-class</code></li>
                    </ul>
                  </v-alert>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <!-- 截圖選項 -->
      <v-col cols="12">
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model.number="viewportWidth"
              label="視窗寬度（像素）"
              type="number"
              variant="outlined"
              density="compact"
              hint="預設：1920"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model.number="viewportHeight"
              label="視窗高度（像素）"
              type="number"
              variant="outlined"
              density="compact"
              hint="預設：1080"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model.number="waitTime"
              label="等待時間（毫秒）"
              type="number"
              variant="outlined"
              density="compact"
              hint="頁面載入後等待時間，預設：2000"
              persistent-hint
              hide-details="auto"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-select
              v-model="imageFormat"
              :items="imageFormatOptions"
              label="圖片格式"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 截圖結果 -->
      <v-col
        v-if="screenshotData"
        cols="12"
      >
        <v-card
          variant="outlined"
          class="pa-4"
        >
          <v-card-title class="pb-4">
            <v-icon class="me-2">
              mdi-image
            </v-icon>
            截圖結果
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <img
                :src="screenshotData"
                alt="截圖結果"
                class="screenshot-preview"
                style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;"
              >
            </div>
            <v-row class="mt-4">
              <v-col cols="12">
                <v-btn
                  color="success"
                  prepend-icon="mdi-download"
                  @click="downloadScreenshot"
                >
                  下載截圖
                </v-btn>
                <v-btn
                  color="info"
                  prepend-icon="mdi-content-copy"
                  class="ms-2"
                  @click="copyImageToClipboard"
                >
                  複製圖片
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 錯誤訊息 -->
      <v-col
        v-if="errorMessage"
        cols="12"
      >
        <v-alert
          type="error"
          variant="tonal"
          dismissible
          @update:model-value="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 頁面標題
defineOptions({
  meta: {
    title: '網頁截圖工具'
  }
})

// 資料
const url = ref('')
const isCapturing = ref(false)
const screenshotData = ref('')
const errorMessage = ref('')
const panel = ref(null)

// 元素選擇器
const elementSelector = ref('')

// 截圖選項
const viewportWidth = ref(1920)
const viewportHeight = ref(1080)
const waitTime = ref(2000)
const imageFormat = ref('png')

const imageFormatOptions = [
  { title: 'PNG', value: 'png' },
  { title: 'JPEG', value: 'jpeg' }
]

// URL 驗證規則
const urlRules = [
  (v) => {
    if (!v) return '請輸入網址'
    try {
      new URL(v)
      return true
    } catch {
      return '請輸入有效的網址（需包含 http:// 或 https://）'
    }
  }
]

// 驗證 URL
const isValidUrl = computed(() => {
  if (!url.value) return false
  try {
    new URL(url.value)
    return true
  } catch {
    return false
  }
})

// 截圖功能
const captureScreenshot = async () => {
  if (!isValidUrl.value) {
    errorMessage.value = '請輸入有效的網址'
    return
  }

  try {
    isCapturing.value = true
    errorMessage.value = ''
    screenshotData.value = ''

    const params = {
      url: url.value,
      viewportWidth: viewportWidth.value || 1920,
      viewportHeight: viewportHeight.value || 1080,
      waitTime: waitTime.value || 2000,
      format: imageFormat.value || 'png'
    }

    // 如果有設定元素選擇器，加入選擇器參數
    if (elementSelector.value && elementSelector.value.trim()) {
      params.elementSelector = elementSelector.value.trim()
    }

    const { data } = await apiAuth.post('/screenshot/capture', params)

    if (data.success && data.result) {
      screenshotData.value = `data:image/${imageFormat.value};base64,${data.result}`
      createSnackbar({
        text: '截圖成功',
        snackbarProps: { color: 'success' }
      })
    } else {
      throw new Error(data.message || '截圖失敗')
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || '截圖失敗，請檢查網址是否可訪問'
    createSnackbar({
      text: errorMessage.value,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isCapturing.value = false
  }
}

// 下載截圖
const downloadScreenshot = () => {
  if (!screenshotData.value) return

  const link = document.createElement('a')
  link.href = screenshotData.value
  link.download = `screenshot-${Date.now()}.${imageFormat.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  createSnackbar({
    text: '下載成功',
    snackbarProps: { color: 'success' }
  })
}

// 複製圖片到剪貼簿
const copyImageToClipboard = async () => {
  if (!screenshotData.value) return

  try {
    const response = await fetch(screenshotData.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    createSnackbar({
      text: '已複製到剪貼簿',
      snackbarProps: { color: 'success' }
    })
  } catch (err) {
    createSnackbar({
      text: '複製失敗：' + err.message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

.screenshot-preview {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

