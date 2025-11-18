<template>
  <v-container
    max-width="2000"
  >
    <v-row
      class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white"
    >
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-3 d-flex align-center"
      >
        <h3
          class="d-inline"
        >
          行銷分類管理
        </h3>
        <div
          style="width: 260px;"
          class="ms-auto d-flex align-center"
        >
          <v-icon
            v-tooltip:start="'可搜尋各分類名稱'"
            icon="mdi-information"
            size="small"
            color="blue-grey-darken-2"
            class="me-2"
          />
          <v-text-field
            v-model="quickSearchText"
            label="快速搜尋"
            append-inner-icon="mdi-magnify"
            :loading="isLoading"
            base-color="#666"
            color="blue-grey-darken-3"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </v-col>

      <!-- 表格區塊 -->
      <v-col
        cols="12"
        class="mt-4"
      >
        <v-row class="d-flex justify-space-between">
          <!-- 行銷主題列 -->
          <v-col
            cols="12"
            class="custom-col"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                行銷主題
                <v-btn
                  v-tooltip:start="'新增行銷主題'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(0)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="marketingThemes.length > 0">
                  <v-list-item
                    v-for="item in marketingThemes"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯行銷主題'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[0] > 1">
                <v-pagination
                  v-model="pages[0]"
                  :length="totalPages[0]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(0, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 廣告渠道列 -->
          <v-col
            cols="12"
            class="custom-col"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                廣告渠道
                <v-btn
                  v-tooltip:start="'新增廣告渠道'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(1)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="advertisingChannels.length > 0">
                  <v-list-item
                    v-for="item in advertisingChannels"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯廣告渠道'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[1] > 1">
                <v-pagination
                  v-model="pages[1]"
                  :length="totalPages[1]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(1, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 平台列 -->
          <v-col
            cols="12"
            class="custom-col-big"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                平台
                <v-btn
                  v-tooltip:start="'新增平台'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(2)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="platforms.length > 0">
                  <v-list-item
                    v-for="item in platforms"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div
                        class="channel-name"
                        :style="getChannelTypeStyle(item.parentId?.name)"
                      >
                        {{ item.parentId?.name || '無' }}
                      </div>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯平台'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[2] > 1">
                <v-pagination
                  v-model="pages[2]"
                  :length="totalPages[2]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(2, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 平台細項列 -->
          <v-col
            cols="12"
            class="custom-col-big"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                平台細項
                <v-btn
                  v-tooltip:start="'新增平台細項'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(4)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="platformDetails.length > 0">
                  <v-list-item
                    v-for="item in platformDetails"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div
                        class="channel-name"
                        :style="getChannelTypeStyle(item.parentId?.parentId?.name)"
                      >
                        {{ item.parentId?.parentId?.name || '無' }}
                      </div>
                      <div
                        class="platform-name"
                        :style="getPlatformStyle(item.parentId?.name)"
                      >
                        {{ item.parentId?.name || '無' }}
                      </div>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯平台細項'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[4] > 1">
                <v-pagination
                  v-model="pages[4]"
                  :length="totalPages[4]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(4, page)"
                />
              </template>
            </v-card>
          </v-col>

          <!-- 線別列 -->
          <v-col
            cols="12"
            class="custom-col"
          >
            <v-card
              class="marketing-theme-card"
              elevation="0"
            >
              <div class="card-title mt-3 mb-2 mx-6 d-flex align-center justify-space-between">
                線別
                <v-btn
                  v-tooltip:start="'新增線別'"
                  icon
                  size="small"
                  variant="plain"
                  color="teal-darken-1"
                  @click="openDialog(3)"
                >
                  <v-icon
                    icon="mdi-plus"
                    size="24"
                  />
                </v-btn>
              </div>
              <v-list>
                <template v-if="details.length > 0">
                  <v-list-item
                    v-for="item in details"
                    :key="item._id"
                  >
                    <template #prepend>
                      <div class="order-number">
                        {{ item.order }}
                      </div>
                    </template>
                    <v-list-item-title class="ms-2">
                      {{ item.name }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        v-tooltip:start="'編輯線別'"
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        size="small"
                        @click="editItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item class="bg-white">
                    <div class="text-center w-100 text-grey">
                      沒有資料
                    </div>
                  </v-list-item>
                </template>
              </v-list>
              <template v-if="totalPages[3] > 1">
                <v-pagination
                  v-model="pages[3]"
                  :length="totalPages[3]"
                  :total-visible="5"
                  density="compact"
                  class="mt-2 pb-2 px-2"
                  @update:model-value="(page) => handlePageChange(3, page)"
                />
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
    >
      <v-form
        ref="form"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg px-4 pt-7 pb-6">
          <div class="card-title px-4 pb-2 d-flex align-center justify-space-between">
            <span>{{ dialog.id ? '編輯分類' : getDialogTitle }}</span>
            <div
              v-if="!dialog.id"
              class="d-flex align-center"
            >
              <v-btn
                v-tooltip:start="'批量新增項目'"
                icon
                color="grey-darken-1"
                size="22"
                class="me-2"
                @click="openBatchDialog"
              >
                <v-icon
                  size="14"
                >
                  mdi-plus-box-multiple-outline
                </v-icon>
              </v-btn>
              <v-btn
                v-tooltip:start="'新增項目'"
                icon
                color="grey-darken-1"
                size="22"
                @click="addNewItem"
              >
                <v-icon
                  size="14"
                >
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </div>
          <v-card-text class="mt-3 pa-3">
            <template v-if="isLoadingOptions">
              <div
                class="d-flex justify-center align-center"
                style="min-height: 270px;"
              >
                <v-progress-circular
                  indeterminate
                  color="deep-purple-darken-2"
                  size="40"
                />
              </div>
            </template>
            <v-row v-else>
              <template v-if="!dialog.id">
                <!-- 新增模式：支援多個項目 -->
                <template v-if="dialog.type === 2">
                  <!-- 平台新增時的父層選擇 -->
                  <v-col cols="12">
                    <v-select
                      v-model="selectedChannel"
                      :items="channelOptions"
                      item-title="name"
                      item-value="_id"
                      label="*廣告渠道"
                      :error-messages="channelError"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    />
                  </v-col>
                </template>
                <template v-if="dialog.type === 4">
                  <!-- 平台細項新增時的父層選擇 -->
                  <v-col cols="12">
                    <v-select
                      v-model="selectedChannel"
                      :items="channelOptions"
                      item-title="name"
                      item-value="_id"
                      label="*廣告渠道"
                      :error-messages="channelError"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="handleChannelChange"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="selectedPlatform"
                      :items="platformOptions"
                      item-title="name"
                      item-value="_id"
                      label="*平台"
                      :error-messages="platformError"
                      variant="outlined"
                      density="compact"
                      :disabled="!selectedChannel"
                      hide-details="auto"
                    />
                  </v-col>
                </template>
                <v-col
                  v-for="(item, index) in newItems"
                  :key="index"
                  cols="12"
                >
                  <div class="d-flex align-center item-container">
                    <v-text-field
                      v-model="item.name"
                      :error-messages="item.error"
                      label="*名稱"
                      type="text"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                    />
                    <v-btn
                      v-if="newItems.length > 1"
                      icon="mdi-delete"
                      variant="text"
                      color="red-lighten-1"
                      size="small"
                      class="ms-2"
                      @click="removeItem(index)"
                    />
                  </div>
                </v-col>
              </template>
              <template v-else>
                <!-- 編輯模式：單個項目 -->
                <template v-if="dialog.type === 2">
                  <!-- 平台編輯時的父層選擇 -->
                  <v-col cols="12">
                    <v-select
                      v-model="selectedChannel"
                      :items="channelOptions"
                      item-title="name"
                      item-value="_id"
                      label="*廣告渠道"
                      :error-messages="channelError"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    />
                  </v-col>
                </template>
                <template v-if="dialog.type === 4">
                  <!-- 平台細項編輯時的父層選擇 -->
                  <v-col cols="12">
                    <v-select
                      v-model="selectedChannel"
                      :items="channelOptions"
                      item-title="name"
                      item-value="_id"
                      label="*廣告渠道"
                      :error-messages="channelError"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="handleChannelChange"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="selectedPlatform"
                      :items="platformOptions"
                      item-title="name"
                      item-value="_id"
                      label="*平台"
                      :error-messages="platformError"
                      variant="outlined"
                      density="compact"
                      :disabled="!selectedChannel"
                      hide-details="auto"
                    />
                  </v-col>
                </template>
                <v-col cols="12">
                  <v-text-field
                    v-model="nameValue"
                    :error-messages="nameError"
                    label="*名稱"
                    type="text"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="orderValue"
                    :error-messages="orderError"
                    label="*排序"
                    variant="outlined"
                    density="compact"
                    hint="輸入想要的順序位置，其他項目會自動調整"
                    persistent-hint
                  />
                </v-col>
              </template>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-3 pt-4">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="dialog.id"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  :size="buttonSize"
                  prepend-icon="mdi-delete"
                  @click="confirmDeleteDialog = true"
                >
                  刪除
                </v-btn>
              </template>
            </v-hover>
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              :size="buttonSize"
              :loading="isSubmitting"
              @click="closeDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              type="submit"
              class="ms-1"
              :size="buttonSize"
              :loading="isSubmitting"
              :disabled="(dialog.id && !hasChanges) || isSubmitting"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除分類"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || ''"
      input-label="分類名稱"
      @confirm="deleteCategory"
    />

    <!-- 批量新增對話框 -->
    <v-dialog
      v-model="batchDialog.open"
      persistent
      width="300"
    >
      <v-card class="rounded-lg px-3 pt-6 pb-4">
        <v-form @submit.prevent="handleBatchAdd">
          <div class="card-title px-4 pb-2">
            批量新增項目
          </div>
          <v-card-text class="mt-3 pa-3">
            <v-text-field
              v-model="batchDialog.count"
              label="請輸入要總共需要多少項目"
              type="number"
              min="1"
              max="50"
              variant="outlined"
              density="compact"
              :error-messages="batchDialog.error"
              hide-details="auto"
              @keyup.enter="handleBatchAdd"
            />
          </v-card-text>
          <v-card-actions class="px-3 pt-4">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              @click="closeBatchDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-1"
              type="submit"
            >
              確定
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { debounce } from 'lodash'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷分類管理 | TEST',
    login: true,
    permission: 'MARKETING_CATEGORY_MANAGEMENT_READ'
  }
})

// ===== API 與 Store 始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const newItems = ref([{ name: '', error: '' }])
const form = ref(null)

// ===== 表單驗證架構 =====
const editSchema = yup.object({
  name: yup.string().required('請輸入名稱'),
  order: yup.string()
    .required('請輸入排序')
    .test('is-number', '排序必須大於0', value => {
      if (!value) return true // 如果是空值，讓 required 去處理錯誤訊息
      const num = Number(value)
      return !isNaN(num) && num >= 1
    })
})

// ===== 表單初始化 =====
const { handleSubmit: handleEditSubmit } = useForm({
  validationSchema: editSchema
})

// ===== 表單欄位 =====
const { value: nameValue, errorMessage: nameError } = useField('name')
const { value: orderValue, errorMessage: orderError } = useField('order')

// 驗證新增項目
const validateNewItems = () => {
  let hasError = false

  // 驗證父層選擇
  if (dialog.value.type === 2 && !selectedChannel.value) {
    channelError.value = '請選擇廣告渠道'
    hasError = true
  }

  if (dialog.value.type === 4) {
    if (!selectedChannel.value) {
      channelError.value = '請選擇廣告渠道'
      hasError = true
    }
    if (!selectedPlatform.value) {
      platformError.value = '請選擇平台'
      hasError = true
    }
  }

  // 驗證名稱
  newItems.value.forEach(item => {
    item.error = ''
    if (!item.name.trim()) {
      item.error = '請輸入名稱'
      hasError = true
    }
  })

  return !hasError
}

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: '',
  type: 0
})

const dialogWidth = computed(() => {
  return smAndUp.value ? '360' : '100%'
})

// ===== 資料狀態 =====
const marketingThemes = ref([])
const advertisingChannels = ref([])
const platforms = ref([])
const details = ref([])
const platformDetails = ref([])

// ===== 父層選擇相關的狀態 =====
const selectedChannel = ref(null)
const selectedPlatform = ref(null)
const channelOptions = ref([])
const platformOptions = ref([])
const channelError = ref('')
const platformError = ref('')

// ===== 父層選擇處理函數 =====
const loadChannelOptions = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/categories/options', {
      params: { type: 1 }
    })
    if (data.success) {
      channelOptions.value = data.result
    }
  } catch (error) {
    handleError(error)
  }
}

const handleChannelChange = async () => {
  try {
    selectedPlatform.value = null
    platformOptions.value = []
    if (!selectedChannel.value) return

    const { data } = await apiAuth.get('/marketing/categories/options', {
      params: {
        type: 2,
        parentId: selectedChannel.value
      }
    })
    if (data.success) {
      platformOptions.value = data.result
    }
  } catch (error) {
    handleError(error)
  }
}

// ===== 計算屬性 =====
const getDialogTitle = computed(() => {
  const titles = ['新增行銷主題', '新增廣告渠道', '新增平台', '新增線別', '新增平台細項']
  return titles[dialog.value.type]
})

const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  if (!originalData.value) return false

  // 基本變更檢查
  const basicChanges = originalData.value.name !== nameValue.value ||
                      originalData.value.order !== parseInt(orderValue.value)

  // 父層關係變更檢查
  let parentChanges = false
  if (dialog.value.type === 2) {
    const originalParentId = originalData.value.parentId?._id || originalData.value.parentId
    parentChanges = originalParentId !== selectedChannel.value
  } else if (dialog.value.type === 4) {
    const originalParentId = originalData.value.parentId?._id || originalData.value.parentId
    parentChanges = originalParentId !== selectedPlatform.value
  }

  return basicChanges || parentChanges
})

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')
const isLoading = ref(false)

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  loadData()
}, 300)

// 監聽搜尋文字變化
watch(quickSearchText, () => {
  isLoading.value = true
  // 重置所有分頁到第一頁
  pages.value = {
    0: 1,
    1: 1,
    2: 1,
    3: 1,
    4: 1
  }
  debouncedSearch()
})

// ===== 方法 =====
const loadData = async (type = null) => {
  try {
    isLoading.value = true
    // 如果定了類型，只加載該類型的數據
    if (type !== null) {
      const params = {
        [`page${type}`]: pages.value[type]
      }

      if (quickSearchText.value) {
        params.quickSearch = quickSearchText.value
      }

      const { data } = await apiAuth.get('/marketing/categories/all', { params })
      if (data.success) {
        // 只更新指定類型的數據
        switch (type) {
          case 0:
            marketingThemes.value = data.result.marketingThemes.data
            totalPages.value[0] = data.result.marketingThemes.totalPages
            break
          case 1:
            advertisingChannels.value = data.result.advertisingChannels.data
            totalPages.value[1] = data.result.advertisingChannels.totalPages
            break
          case 2:
            platforms.value = data.result.platforms.data
            totalPages.value[2] = data.result.platforms.totalPages
            break
          case 3:
            details.value = data.result.details.data
            totalPages.value[3] = data.result.details.totalPages
            break
          case 4:
            platformDetails.value = data.result.platformDetails.data
            totalPages.value[4] = data.result.platformDetails.totalPages
            break
        }
      }
    } else {
      // 如果沒有指定類型，加載所有數據（初始加載或搜索時）
      const params = {
        page0: pages.value[0],
        page1: pages.value[1],
        page2: pages.value[2],
        page3: pages.value[3],
        page4: pages.value[4]
      }

      if (quickSearchText.value) {
        params.quickSearch = quickSearchText.value
      }

      const { data } = await apiAuth.get('/marketing/categories/all', { params })
      if (data.success) {
        marketingThemes.value = data.result.marketingThemes.data
        advertisingChannels.value = data.result.advertisingChannels.data
        platforms.value = data.result.platforms.data
        details.value = data.result.details.data
        platformDetails.value = data.result.platformDetails.data

        totalPages.value = {
          0: data.result.marketingThemes.totalPages,
          1: data.result.advertisingChannels.totalPages,
          2: data.result.platforms.totalPages,
          3: data.result.details.totalPages,
          4: data.result.platformDetails.totalPages
        }
      }
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const openDialog = async (type) => {
  try {
    dialog.value = {
      open: true,
      id: '',
      type
    }
    // 重置表單
    if (form.value) {
      form.value.reset()
    }
    nameValue.value = ''
    orderValue.value = ''
    selectedChannel.value = null
    selectedPlatform.value = null
    channelError.value = ''
    platformError.value = ''
    // 重置新增項目列表
    newItems.value = [{ name: '', error: '' }]

    // 如果是平台或平台細項，載入廣告渠道選項
    if (type === 2 || type === 4) {
      isLoadingOptions.value = true
      try {
        await loadChannelOptions()
      } finally {
        isLoadingOptions.value = false
      }
    }
  } catch (error) {
    handleError(error)
  }
}

const editItem = async (item) => {
  try {
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }

    // 先打開對話框
    dialog.value = {
      open: true,
      id: item._id,
      type: item.type
    }

    // 設置基本資料
    nameValue.value = item.name || ''
    orderValue.value = item.order || 1
    originalData.value = { ...item }

    // 如果是平台或平台細項，載入並設置父層選項
    if (item.type === 2 || item.type === 4) {
      isLoadingOptions.value = true
      try {
        if (item.type === 2) {
          await loadChannelOptions()
          // 設置廣告渠道
          const parentId = item.parentId?._id || item.parentId
          selectedChannel.value = parentId
        } else if (item.type === 4) {
          // 獲取平台 ID
          const platformId = item.parentId?._id || item.parentId

          // 並行載入廣告渠道選項和平台資訊
          const [channelResponse, platformResponse] = await Promise.all([
            apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
            apiAuth.get('/marketing/categories/options', { params: { type: 2, id: platformId } })
          ])

          // 設置廣告渠道選項
          if (channelResponse.data.success) {
            channelOptions.value = channelResponse.data.result
          }

          // 設置平台相關資訊
          if (platformResponse.data.success && platformResponse.data.result.length > 0) {
            const platform = platformResponse.data.result[0]
            selectedChannel.value = platform.parentId?._id || platform.parentId

            // 直接載入平台選項
            const platformOptionsResponse = await apiAuth.get('/marketing/categories/options', {
              params: {
                type: 2,
                parentId: selectedChannel.value
              }
            })

            if (platformOptionsResponse.data.success) {
              platformOptions.value = platformOptionsResponse.data.result
              selectedPlatform.value = platformId
            }
          }
        }
      } finally {
        isLoadingOptions.value = false
      }
    }
  } catch (error) {
    console.error('編輯項目時發生錯誤:', error)
    handleError(error)
  }
}

const closeDialog = () => {
  try {
    const currentType = dialog.value.type
    dialog.value = {
      open: false,
      id: '',
      type: currentType
    }
    originalData.value = null
    // 重置表單
    if (form.value) {
      form.value.reset()
    }
    nameValue.value = ''
    orderValue.value = ''
    selectedChannel.value = null
    selectedPlatform.value = null
    channelError.value = ''
    platformError.value = ''
    // 重置新增項目列表
    newItems.value = [{ name: '', error: '' }]
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = async (e) => {
  e.preventDefault()
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    if (dialog.value.id) {
      // 編輯模式使用 yup 驗證
      await handleEditSubmit(async (values) => {
        const submitData = {
          name: values.name,
          type: dialog.value.type,
          order: parseInt(values.order)
        }

        // 添加父層 ID
        if (dialog.value.type === 2) {
          if (!selectedChannel.value) {
            channelError.value = '請選擇廣告渠道'
            return
          }
          submitData.parentId = selectedChannel.value
        } else if (dialog.value.type === 4) {
          if (!selectedPlatform.value) {
            platformError.value = '請選擇平台'
            return
          }
          submitData.parentId = selectedPlatform.value
        }

        const { data } = await apiAuth.patch(`/marketing/categories/${dialog.value.id}`, submitData)
        if (!data.success) {
          throw new Error(data.message || '更新失敗')
        }

        createSnackbar({
          text: '分類更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })

        closeDialog()
        loadData(dialog.value.type)
      })()
    } else {
      // 新增模式：批量新增
      // 驗證所有項目
      if (!validateNewItems()) {
        isSubmitting.value = false
        return
      }

      // 過濾掉空白項目
      const validItems = newItems.value.filter(item => item.name.trim())

      if (validItems.length === 0) {
        isSubmitting.value = false
        return
      }

      // 批量新增
      const { data } = await apiAuth.post('/marketing/categories/batch', {
        items: validItems.map(item => ({
          name: item.name.trim(),
          type: dialog.value.type,
          parentId: dialog.value.type === 2 ? selectedChannel.value :
                   dialog.value.type === 4 ? selectedPlatform.value : null
        }))
      })

      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }

      createSnackbar({
        text: '分類新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      closeDialog()
      loadData(dialog.value.type)
    }
  } catch (error) {
    console.error('提交時發生錯誤:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  if (!dialog.value.id) return

  try {
    const type = dialog.value.type
    await apiAuth.delete(`/marketing/categories/${dialog.value.id}`)
    createSnackbar({
      text: '分類刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    // 只重新加載被刪除的類型
    loadData(type)
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
}

const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    user.logout()
    router.push('/login')
    createSnackbar({
      text: '登入已過期，請重新登入',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } else {
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await loadData()
})

// 在 script setup 中添加分頁相關的狀態
const pages = ref({
  0: 1, // 行銷主題的當前頁碼
  1: 1, // 廣告渠道的當前頁碼
  2: 1, // 平台的當前頁碼
  3: 1, // 線別的當前頁碼
  4: 1  // 平台細項的當前頁碼
})

const totalPages = ref({
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1
})

// 添加分頁處理函數
const handlePageChange = (type, newPage) => {
  pages.value[type] = newPage
  loadData(type)
}

// 新增項目
const addNewItem = () => {
  newItems.value.push({ name: '', error: '' })
}

// 移除項目
const removeItem = (index) => {
  newItems.value.splice(index, 1)
}

// 新增即時驗證
watch(newItems, (items) => {
  items.forEach(item => {
    if (item.name.trim()) {
      item.error = ''
    }
  })
}, { deep: true })

// 在 script setup 部分添加
const isLoadingOptions = ref(false)

// 在 script setup 部分添加新的 watch
watch(selectedPlatform, (newValue, oldValue) => {
  if (dialog.value.type === 4 && // 確保是平台細項類型
      dialog.value.id && // 確保是編輯模式
      oldValue && // 確保有舊值
      newValue !== oldValue) { // 確保有變更
    // 自動將排序設為 1
    orderValue.value = '1'

    // 顯示提示訊息
    createSnackbar({
      text: '更換平台，排序將自動設為 1，以確保資料正確性',
      snackbarProps: {
        color: 'info',
        timeout: 5000
      }
    })
  }
})

watch(selectedChannel, (newValue, oldValue) => {
  if ((dialog.value.type === 2 || dialog.value.type === 4) && // 確保是平台或平台細項類型
      dialog.value.id && // 確保是編輯模式
      oldValue && // 確保有舊值
      newValue !== oldValue) { // 確保有變更
    // 自動將排序設為 1
    orderValue.value = '1'

    // 顯示提示訊息
    createSnackbar({
      text: '更換廣告渠道，排序將自動設為 1，以確保資料正確性',
      snackbarProps: {
        color: 'info',
        timeout: 5000
      }
    })
  }
})

// 在 script setup 部分添加 batchDialog
const batchDialog = ref({
  open: false,
  count: '',
  error: ''
})

const openBatchDialog = () => {
  batchDialog.value = {
    open: true,
    count: '',
    error: ''
  }
}

const closeBatchDialog = () => {
  batchDialog.value.open = false
}

const handleBatchAdd = () => {
  // 驗證輸入
  const count = parseInt(batchDialog.value.count)
  if (!count || count < 1 || count > 10) {
    batchDialog.value.error = '請輸入1-10之間的數字'
    return
  }

  // 清除錯誤訊息
  batchDialog.value.error = ''

  // 批量新增項目
  newItems.value = Array(count).fill(null).map(() => ({
    name: '',
    error: ''
  }))

  // 關閉批量新增對話框
  closeBatchDialog()
}

// 添加顏色陣列
const channelColors = [
  '#F06292', // 粉紅色
  '#FF5722', // 橙色
  '#F9A825', // 黃色
  '#009688', // 青色
  '#795548', // 棕色
  '#0097A7', // 藍綠色
  '#283593', // 深藍色
  '#2196F3', // 藍色
  '#607D8B', // 藍灰色
  '#388E3C', // 淺綠色
  '#00695C', // 深綠色
]

// 儲存廣告渠道名稱與顏色的映射
const channelColorMap = ref(new Map())

// 修改 getChannelTypeStyle 函數
const getChannelTypeStyle = (channelName) => {
  if (!channelName) return { backgroundColor: '#757575' }

  // 如果這個渠道還沒有對應的顏色，分配一個新的顏色
  if (!channelColorMap.value.has(channelName)) {
    const index = channelColorMap.value.size % channelColors.length
    channelColorMap.value.set(channelName, channelColors[index])
  }

  return { backgroundColor: channelColorMap.value.get(channelName) }
}

// 在 script setup 部分添加
const platformColors = [
  '#4CAF50', // 綠色
  '#00BCD4', // 青色
  '#3F51B5', // 靛藍色
  '#9C27B0', // 紫色
  '#E91E63', // 粉紅色
  '#FFC107', // 琥珀色
  '#FF5722', // 深橙色
  '#795548', // 棕色
  '#607D8B', // 藍灰色
  '#009688'  // 藍綠色
]

// 儲存平台名稱與顏色的映射
const platformColorMap = ref(new Map())

// 添加 getPlatformStyle 函數
const getPlatformStyle = (platformName) => {
  if (!platformName) return { backgroundColor: '#757575' }

  // 如果這個平台還沒有對應的顏色，分配一個新的顏色
  if (!platformColorMap.value.has(platformName)) {
    const index = platformColorMap.value.size % platformColors.length
    platformColorMap.value.set(platformName, platformColors[index])
  }

  return { backgroundColor: platformColorMap.value.get(platformName) }
}
</script>

<style lang="scss" scoped>
.custom-col {
  max-width: 18%;
}

.custom-col-big {
  max-width: 23%;
}

.marketing-theme-card {
  border: 1px solid #999;
  .v-list-item {
    padding: 6px 24px;
    transition: background 0.2s;
    &:hover {
      background: #e0e0e0 !important;
    }
  }
  .v-list-item:nth-child(odd) {
    background: #f6f8fa;
  }
  .v-list-item:nth-child(even) {
    background: #fffaf0;
  }
  .text-grey {
    color: #999;
    font-size: 14px;
  }
  :deep(.v-pagination) {
    .v-pagination__item {
      color: #666;
      &--active {
        background: #4c0079 !important;
        color: white;
      }
    }
  }
  .order-number {
    min-width: 16px;
    height: 16px;
    border-radius: 12px;
    background-color: #666;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
  .channel-name {
    min-width: 16px;
    padding: 0 4px;
    height: 16px;
    border-radius: 4px;
    background-color: #e049ba;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
  .platform-name {
    min-width: 16px;
    padding: 0 4px;
    height: 16px;
    border-radius: 4px;
    background-color: #6962be;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
}

.item-container {
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #a9a9a9;
  border-radius: 4px;
  :deep(.v-field) {
    background-color: #fff;
  }
}
</style>
