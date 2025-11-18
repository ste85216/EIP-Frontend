<template>
  <v-container fluid>
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-3"
      >
        <v-row>
          <v-col
            cols="12"
            lg="9"
            xl="10"
          >
            <v-row>
              <v-col
                cols="12"
                sm="4"
                lg="12"
                class="d-flex align-center"
              >
                <h3>
                  線別分類管理
                </h3>
                <v-btn
                  v-if="!isOrderingMode&&lgAndUp"
                  color="blue-grey-darken-2"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  class="ms-6"
                  :size="buttonSize"
                  @click="openDialog('大分類')"
                >
                  新增大分類
                </v-btn>
                <v-btn
                  v-if="!isOrderingMode&&lgAndUp"
                  color="red-lighten-1"
                  variant="outlined"
                  class="ms-4"
                  prepend-icon="mdi-sort"
                  :size="buttonSize"
                  @click="isOrderingMode = true"
                >
                  變更順序
                </v-btn>
                <!-- 排序模式的按鈕 -->
                <div
                  v-if="isOrderingMode&&lgAndUp"
                >
                  <v-btn
                    color="red-darken-2"
                    variant="outlined"
                    class="ms-6"
                    :size="buttonSize"
                    prepend-icon="mdi-close"
                    :disabled="isSaving"
                    @click="cancelOrdering"
                  >
                    取消
                  </v-btn>
                  <v-btn
                    v-if="hasUnsavedChanges&&lgAndUp"
                    color="teal-darken-1"
                    variant="outlined"
                    :size="buttonSize"
                    prepend-icon="mdi-content-save"
                    class="ms-4"
                    :loading="isSaving"
                    :disabled="isSaving"
                    @click="saveChanges"
                  >
                    保存變更
                  </v-btn>
                </div>
              </v-col>
              <v-col
                v-if="!lgAndUp"
                cols="12"
                sm="8"
                lg="10"
                class="d-flex justify-sm-end justify-lg-start"
              >
                <v-btn
                  v-if="!isOrderingMode"
                  color="blue-grey-darken-2"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  :size="buttonSize"
                  @click="openDialog('大分類')"
                >
                  新增大分類
                </v-btn>
                <v-btn
                  v-if="!isOrderingMode"
                  color="red-lighten-1"
                  variant="outlined"
                  class="ms-4"
                  prepend-icon="mdi-sort"
                  :size="buttonSize"
                  @click="isOrderingMode = true"
                >
                  變更順序
                </v-btn>
                <!-- 排序模式的按鈕 -->
                <div
                  v-if="isOrderingMode"
                >
                  <v-btn
                    color="red-darken-2"
                    variant="outlined"
                    class="me-2"
                    :size="buttonSize"
                    prepend-icon="mdi-close"
                    :disabled="isSaving"
                    @click="cancelOrdering"
                  >
                    取消
                  </v-btn>
                  <v-btn
                    v-if="hasUnsavedChanges"
                    color="teal-darken-1"
                    variant="outlined"
                    :size="buttonSize"
                    prepend-icon="mdi-content-save"
                    :loading="isSaving"
                    :disabled="isSaving"
                    @click="saveChanges"
                  >
                    保存變更
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            lg="3"
            xl="2"
            class="pb-0 pb-sm-4"
          >
            <div
              class="ms-sm-auto d-flex align-center"
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
        </v-row>
      </v-col>

      <!-- 分類顯示區塊 -->
      <v-col
        cols="12"
        class="mt-4"
      >
        <template v-if="filteredMainCategories.length > 0">
          <v-row>
            <v-col
              v-for="mainCategory in filteredMainCategories"
              :key="mainCategory._id"
              cols="12"
              md="6"
              lg="3"
              xxl="2"
              class="mb-4"
            >
              <v-card
                class="category-display-card"
                elevation="0"
              >
                <!-- 大分類標題 -->
                <div class="card-title-main mt-2 d-flex align-center justify-space-between">
                  <span class="main-category-name ps-5">{{ mainCategory.大分類 }}</span>
                  <div class="px-4">
                    <template v-if="isOrderingMode">
                      <v-btn
                        v-tooltip:start="'上移'"
                        icon="mdi-arrow-up"
                        variant="text"
                        color="blue-darken-1"
                        :disabled="!canMoveUp(mainCategory)"
                        @click="moveItem(mainCategory, '大分類', 'up')"
                      />
                      <v-btn
                        v-tooltip:start="'下移'"
                        icon="mdi-arrow-down"
                        variant="text"
                        color="blue-darken-1"
                        class="me-1"
                        :disabled="!canMoveDown(mainCategory)"
                        @click="moveItem(mainCategory, '大分類', 'down')"
                      />
                    </template>
                    <v-btn
                      v-if="!isOrderingMode"
                      v-tooltip:start="'新增第一層分類'"
                      icon="mdi-plus"
                      variant="text"
                      color="teal-darken-1"
                      @click="openDialog('第一層分類', mainCategory.大分類)"
                    />
                    <v-btn
                      v-if="!isOrderingMode"
                      v-tooltip:start="'編輯大分類'"
                      icon="mdi-pencil"
                      variant="plain"
                      color="light-blue-darken-4"
                      @click="editItem(mainCategory, '大分類')"
                    />
                  </div>
                </div>
                <!-- 第一層和第二層列表 -->
                <v-list
                  dense
                  class="category-list"
                >
                  <template v-if="mainCategory.第一層分類?.length > 0">
                    <div
                      v-for="firstLevel in mainCategory.第一層分類"
                      :key="firstLevel._id"
                      class="first-level-group"
                    >
                      <v-list-item class="first-level-item">
                        <template #prepend>
                          <v-icon
                            size="x-small"
                            color="red-darken-2"
                          >
                            mdi-circle-medium
                          </v-icon>
                        </template>
                        <v-list-item-title class="first-level-title">
                          {{ firstLevel.name }}
                        </v-list-item-title>
                        <template #append>
                          <template v-if="isOrderingMode">
                            <v-btn
                              v-tooltip:start="'上移'"
                              icon="mdi-arrow-up"
                              size="x-small"
                              variant="text"
                              color="red-lighten-1"
                              class="me-1"
                              :disabled="!canMoveUp(firstLevel, mainCategory.第一層分類)"
                              @click="moveItem(firstLevel, '第一層分類', 'up')"
                            />
                            <v-btn
                              v-tooltip:start="'下移'"
                              icon="mdi-arrow-down"
                              size="x-small"
                              variant="text"
                              color="red-lighten-1"
                              class="me-1"
                              :disabled="!canMoveDown(firstLevel, mainCategory.第一層分類)"
                              @click="moveItem(firstLevel, '第一層分類', 'down')"
                            />
                          </template>
                          <template v-else>
                            <v-btn
                              v-tooltip:start="'新增第二層分類'"
                              icon="mdi-plus"
                              size="x-small"
                              variant="text"
                              color="teal-darken-1"
                              class="me-1"
                              @click="openDialog('第二層分類', mainCategory.大分類, firstLevel.name)"
                            />
                            <v-btn
                              v-tooltip:start="'編輯第一層分類'"
                              icon="mdi-pencil"
                              size="x-small"
                              variant="plain"
                              color="light-blue-darken-4"
                              @click="editItem(firstLevel, '第一層分類')"
                            />
                          </template>
                        </template>
                      </v-list-item>
                      <!-- 第二層列表 -->
                      <v-list
                        dense
                        class="second-level-list py-0"
                      >
                        <template v-if="firstLevel.第二層分類?.length > 0">
                          <v-list-item
                            v-for="secondLevel in firstLevel.第二層分類"
                            :key="secondLevel._id"
                            class="second-level-item"
                            density="compact"
                          >
                            <template #prepend>
                              <v-icon
                                size="large"
                                color="teal-darken-1"
                                class="ms-8"
                              >
                                mdi-circle-medium
                              </v-icon>
                            </template>
                            <v-list-item-title class="second-level-title">
                              {{ secondLevel.name }}
                            </v-list-item-title>
                            <template #append>
                              <template v-if="isOrderingMode">
                                <v-btn
                                  v-tooltip:start="'上移'"
                                  icon="mdi-arrow-up"
                                  size="x-small"
                                  variant="text"
                                  color="teal-lighten-1"
                                  class="me-1"
                                  :disabled="!canMoveUp(secondLevel, firstLevel.第二層分類)"
                                  @click="moveItem(secondLevel, '第二層分類', 'up')"
                                />
                                <v-btn
                                  v-tooltip:start="'下移'"
                                  icon="mdi-arrow-down"
                                  size="x-small"
                                  variant="text"
                                  color="teal-lighten-1"
                                  class="me-1"
                                  :disabled="!canMoveDown(secondLevel, firstLevel.第二層分類)"
                                  @click="moveItem(secondLevel, '第二層分類', 'down')"
                                />
                              </template>
                              <v-btn
                                v-else
                                v-tooltip:start="'編輯第二層分類'"
                                icon="mdi-pencil"
                                size="x-small"
                                variant="plain"
                                color="light-blue-darken-4"
                                @click="editItem(secondLevel, '第二層分類')"
                              />
                            </template>
                          </v-list-item>
                        </template>
                        <v-list-item
                          v-else
                          density="compact"
                          class="no-data-item"
                        >
                          <span class="no-data-text">尚無第二層分類</span>
                        </v-list-item>
                      </v-list>
                    </div>
                  </template>
                  <v-list-item
                    v-else
                    class="no-data-item"
                  >
                    <span class="no-data-text">尚無第一層分類</span>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <v-col
          v-else
          cols="12"
          class="pa-0"
        >
          <v-alert
            type="info"
            color="grey"
            variant="outlined"
            text="尚無任何分類資料或找不到符合搜尋的結果"
          />
        </v-col>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
    >
      <v-card class="rounded-lg">
        <v-form
          ref="form"
          :disabled="isSubmitting"
          @submit.prevent="submit"
        >
          <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
            <v-icon
              size="20"
              color="white"
              class="me-2"
            >
              mdi-folder-multiple-outline
            </v-icon>
            {{ dialog.id ? '編輯分類' : `新增${dialog.type}` }}
            <v-spacer />
            <!-- 新增模式下的批量操作按鈕 -->
            <div
              v-if="!dialog.id"
              class="d-flex align-center me-4"
            >
              <v-btn
                v-tooltip:start="'批量新增項目'"
                icon
                color="white"
                variant="plain"
                size="20"
                class="me-2 opacity-100"
                :ripple="false"
                @click="openBatchDialog"
              >
                <v-icon
                  size="16"
                >
                  mdi-plus-box-multiple-outline
                </v-icon>
              </v-btn>
              <v-btn
                v-tooltip:start="'新增項目'"
                icon
                color="white"
                variant="plain"
                size="20"
                class="opacity-100"
                :ripple="false"
                @click="addNewItem"
              >
                <v-icon
                  size="16"
                >
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
            <v-btn
              icon
              color="white"
              variant="plain"
              class="opacity-100"
              :ripple="false"
              size="20"
              @click="closeDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-card-text class="mt-6 mb-4 px-6">
            <v-row>
              <!-- 父級分類選擇器 -->
              <v-col
                v-if="dialog.type === '第一層分類' || dialog.type === '第二層分類'"
                cols="12"
              >
                <v-select
                  v-model="selectedMainCategory"
                  :items="mainCategories"
                  item-title="大分類"
                  item-value="大分類"
                  label="*所屬大分類"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :disabled="!!dialog.id || (dialog.type === '第一層分類' || dialog.type === '第二層分類')"
                  :readonly="!!dialog.id || (dialog.type === '第一層分類' || dialog.type === '第二層分類')"
                  :rules="[v => !!v || '請選擇大分類']"
                />
              </v-col>
              <v-col
                v-if="dialog.type === '第二層分類'"
                cols="12"
              >
                <v-select
                  v-model="selectedFirstLevelCategory"
                  :items="firstLevelCategories"
                  item-title="name"
                  item-value="name"
                  label="*所屬第一層分類"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :disabled="!!dialog.id || dialog.type === '第二層分類' || !selectedMainCategory"
                  :readonly="!!dialog.id || dialog.type === '第二層分類'"
                  :rules="[v => !!v || '請選擇第一層分類']"
                />
              </v-col>

              <!-- 分類名稱輸入 -->
              <template v-if="!dialog.id">
                <!-- 新增模式：多個項目 -->
                <v-col
                  v-for="(item, index) in newItems"
                  :key="index"
                  cols="12"
                >
                  <div class="d-flex align-center item-container">
                    <v-text-field
                      v-model="item.name"
                      :error-messages="item.error"
                      :label="`*${dialog.type}名稱`"
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
                <v-col cols="12">
                  <v-text-field
                    v-model="nameValue"
                    :error-messages="nameError"
                    :label="`*${dialog.type}名稱`"
                    type="text"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details="auto"
                  />
                </v-col>
              </template>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-6 mb-4">
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
              class="me-1"
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
              :disabled="isSubmitting"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 (保持不變) -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除分類"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || originalData?.大分類 || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || originalData?.大分類 || ''"
      input-label="分類名稱"
      @confirm="deleteCategory"
    />

    <!-- 批量新增對話框 -->
    <v-dialog
      v-model="batchDialog.open"
      persistent
      max-width="340"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-grey-darken-3">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-plus-box-multiple-outline
            </v-icon>批量新增項目
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="closeBatchDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-form @submit.prevent="handleBatchAdd">
          <v-card-text class="px-6 py-3">
            <div class="text-grey-darken-2 mb-4">
              請輸入要總共需要多少項目，系統會自動新增指定數量的空白項目。
            </div>
            <v-text-field
              v-model="batchDialog.count"
              label="項目數量"
              type="number"
              min="1"
              max="10"
              variant="outlined"
              density="compact"
              :error-messages="batchDialog.error"
              hide-details="auto"
              @keyup.enter="handleBatchAdd"
            />
          </v-card-text>
          <v-card-actions class="px-6 py-4 mb-2">
            <v-spacer />
            <v-btn
              color="grey"
              variant="outlined"
              class="me-1"
              :size="buttonSize"
              @click="closeBatchDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              :size="buttonSize"
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
    title: '線別分類管理 | TEST',
    login: true,
    permission: 'LINE_CATEGORY_MANAGEMENT_READ'
  }
})

// ===== API 與 Store 始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp, lgAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const form = ref(null)
const newItems = ref([{ name: '', error: '' }]) // 用於新增模式
const isLoading = ref(false) // <--- 在這裡添加 isLoading 狀態

// ===== 資料狀態 =====
const mainCategories = ref([])
const firstLevelCategories = ref([]) // 對話框選項
const selectedMainCategory = ref(null)
const selectedFirstLevelCategory = ref(null)

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: '',
  type: ''
})

const dialogWidth = computed(() => {
  return smAndUp.value ? '360' : '100%'
})

// ===== 批量新增對話框 =====
const batchDialog = ref({
  open: false,
  count: '',
  error: ''
})

// ===== 表單驗證架構 =====
const editSchema = yup.object({
  name: yup.string().required('請輸入名稱')
})

// ===== 表單初始化 =====
const { handleSubmit: handleEditSubmit } = useForm({
  validationSchema: editSchema,
  initialValues: {
    name: ''
  }
})

// ===== 表單欄位 =====
const { value: nameValue, errorMessage: nameError, resetField: resetNameField } = useField('name')

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')

// 過濾後的大分類，用於顯示
const filteredMainCategories = computed(() => {
  const categories = localMainCategories.value || []
  if (!quickSearchText.value) {
    return categories
  }
  const searchTerm = quickSearchText.value.toLowerCase()
  return categories.filter(main => {
    if (main.大分類.toLowerCase().includes(searchTerm)) {
      return true
    }
    if (main.第一層分類?.some(first => first.name.toLowerCase().includes(searchTerm))) {
      return true
    }
    if (main.第一層分類?.some(first => first.第二層分類?.some(second => second.name.toLowerCase().includes(searchTerm)))) {
      return true
    }
    return false
  })
})

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  // 由於過濾是在前端完成的，所以 debounce 只是為了防止過於頻繁的計算
  // 不需要調用 loadData
  isLoading.value = false // 模擬加載結束
}, 300)

// 監聽搜尋文字變化
watch(quickSearchText, () => {
  isLoading.value = true // <--- 確保可以訪問 isLoading
  debouncedSearch()
})

// ===== 方法 =====
const loadData = async () => {
  try {
    isLoading.value = true
    const { data } = await apiAuth.get('/lineCategories/all')
    if (data.success) {
      mainCategories.value = data.result
      if (!hasUnsavedChanges.value) {
        localMainCategories.value = JSON.parse(JSON.stringify(data.result))
      }
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const openDialog = async (type, mainCategory, firstLevel) => {
  dialog.value = {
    open: true,
    id: '',
    type
  }

  // 重置表單和狀態
  newItems.value = [{ name: '', error: '' }] // 重置批量新增列表
  resetNameField() // 清空編輯模式的 name
  if (form.value) {
    form.value.resetValidation()
  }

  // 根據不同層級設置預設父級分類
  if (type === '第一層分類') {
    selectedMainCategory.value = mainCategory
    selectedFirstLevelCategory.value = null
  } else if (type === '第二層分類') {
    // 確保先設置大分類
    selectedMainCategory.value = mainCategory
    // 等待第一層分類選項載入完成
    if (mainCategory) {
      await loadFirstLevelOptions(mainCategory)
      // 設置第一層分類
      selectedFirstLevelCategory.value = firstLevel
    }
  } else {
    selectedMainCategory.value = null
    selectedFirstLevelCategory.value = null
  }

  // 添加調試日誌
  console.log('打開對話框時的狀態:', {
    type,
    mainCategory,
    firstLevel,
    selectedMainCategory: selectedMainCategory.value,
    selectedFirstLevelCategory: selectedFirstLevelCategory.value,
    firstLevelCategories: firstLevelCategories.value
  })
}

// 新增函數：載入第一層分類選項 (用於對話框)
const loadFirstLevelOptions = async (mainCategory) => {
  if (!mainCategory) {
    firstLevelCategories.value = []
    return
  }

  try {
    // 查找已加載的大分類數據
    const targetMainCategory = mainCategories.value.find(cat => cat.大分類 === mainCategory)
    if (targetMainCategory && targetMainCategory.第一層分類) {
      firstLevelCategories.value = targetMainCategory.第一層分類
    } else {
      // 如果找不到，可以選擇從 API 重新獲取，但通常不需要
      // 因為 openDialog 時 mainCategory 應該存在於 mainCategories.value 中
       const { data } = await apiAuth.get('/lineCategories/first-level', {
        params: { 大分類: mainCategory }
      })
      if (data.success) {
        firstLevelCategories.value = data.result || []
      } else {
         firstLevelCategories.value = []
      }
    }
  } catch (error) {
    handleError(error)
    firstLevelCategories.value = []
  }
}

const editItem = async (item, type) => {
  dialog.value = {
    open: true,
    id: item._id,
    type
  }
  nameValue.value = type === '大分類' ? item.大分類 : item.name
  originalData.value = { ...item }
  newItems.value = [{ name: '', error: '' }] // 清空批量列表

  // 找到對應的大分類和第一層分類，並加載選項
  if (type === '第一層分類') {
    const mainCategory = mainCategories.value.find(main =>
      main.第一層分類?.some(first => first._id === item._id)
    )
    selectedMainCategory.value = mainCategory?.大分類 || null
    selectedFirstLevelCategory.value = null
     if (selectedMainCategory.value) {
       await loadFirstLevelOptions(selectedMainCategory.value) // 載入選項
    }
  } else if (type === '第二層分類') {
    let found = false
    for (const main of mainCategories.value) {
      if (found) break
      for (const first of main.第一層分類 || []) {
        if (first.第二層分類?.some(second => second._id === item._id)) {
          selectedMainCategory.value = main.大分類
          selectedFirstLevelCategory.value = first.name
          await loadFirstLevelOptions(main.大分類) // 載入選項以便顯示
          found = true
          break
        }
      }
    }
    if (!found) {
      selectedMainCategory.value = null
      selectedFirstLevelCategory.value = null
    }
  } else {
    selectedMainCategory.value = null
    selectedFirstLevelCategory.value = null
  }
}


const closeDialog = () => {
  dialog.value.open = false
  originalData.value = null
  newItems.value = [{ name: '', error: '' }]
  resetNameField()
  // 延遲清空選擇，避免 watch 觸發不必要的 API 調用
  setTimeout(() => {
    selectedMainCategory.value = null
    selectedFirstLevelCategory.value = null
    firstLevelCategories.value = [] // 清空對話框選項
  }, 100)
}

// 新增：驗證批量新增項目
const validateNewItems = () => {
  let hasError = false
  newItems.value.forEach(item => {
    item.error = ''
    if (!item.name.trim()) {
      item.error = '請輸入名稱'
      hasError = true
    }
  })
  return !hasError
}

const submit = async (e) => {
  e.preventDefault()
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 添加調試日誌
    console.log('提交時的狀態:', {
      type: dialog.value.type,
      mainCategory: selectedMainCategory.value,
      firstLevelCategory: selectedFirstLevelCategory.value,
      dialog: dialog.value
    })

    if (dialog.value.id) {
      // ========== 編輯模式 ==========
      await handleEditSubmit(async (values) => {
        const submitData = {
          name: values.name,
          type: dialog.value.type
        }

        const { data } = await apiAuth.patch(`/lineCategories/${dialog.value.id}`, submitData)
        if (!data.success) {
          throw new Error(data.message || '更新失敗')
        }

        createSnackbar({
          text: '分類更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })

        closeDialog()
        await loadData()
      })()
    } else {
      // ========== 新增模式（批量） ==========
      if (!validateNewItems()) {
        isSubmitting.value = false
        return
      }

      const validItems = newItems.value.filter(item => item.name.trim())
      if (validItems.length === 0) {
        createSnackbar({
          text: '請至少輸入一個有效的分類名稱',
          snackbarProps: { color: 'red-lighten-1' }
        })
        isSubmitting.value = false
        return
      }

      // 檢查父級分類是否選擇 (如果需要)
      if (dialog.value.type === '第一層分類' && !selectedMainCategory.value) {
        throw new Error('請選擇大分類')
      }
      if (dialog.value.type === '第二層分類') {
        if (!selectedMainCategory.value) {
          throw new Error('請選擇大分類')
        }
        if (!selectedFirstLevelCategory.value) {
          console.error('第一層分類未選擇:', {
            selectedFirstLevelCategory: selectedFirstLevelCategory.value,
            firstLevelCategories: firstLevelCategories.value
          })
          throw new Error('請選擇第一層分類')
        }
      }

      let successCount = 0
      const totalItems = validItems.length
      const errorMessages = []

      for (const item of validItems) {
        let submitData = {}
        if (dialog.value.type === '大分類') {
          submitData = { 大分類: item.name.trim() }
        } else if (dialog.value.type === '第一層分類') {
          submitData = {
            大分類: selectedMainCategory.value,
            第一層分類名稱: item.name.trim()
          }
        } else if (dialog.value.type === '第二層分類') {
          submitData = {
            大分類: selectedMainCategory.value,
            第一層分類名稱: selectedFirstLevelCategory.value,
            第二層分類名稱: item.name.trim()
          }
        }

        try {
          const { data } = await apiAuth.post('/lineCategories', submitData)
          if (data.success) {
            successCount++
          } else {
            errorMessages.push(`${item.name}: ${data.message || '新增失敗'}`)
          }
        } catch (error) {
          errorMessages.push(`${item.name}: ${error?.response?.data?.message || '請求失敗'}`)
        }
      }

      if (successCount === totalItems) {
        createSnackbar({
          text: `成功新增 ${successCount} 個分類`,
          snackbarProps: { color: 'teal-lighten-1' }
        })
      } else {
        createSnackbar({
          text: `新增完成：成功 ${successCount} 個，失敗 ${totalItems - successCount} 個。錯誤：${errorMessages.join('; ')}`,
          snackbarProps: { color: 'orange-darken-2', timeout: 6000 }
        })
      }

      closeDialog()
      await loadData()
    }
  } catch (error) {
    console.error('提交失敗:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  if (!originalData.value) return
  const idToDelete = originalData.value._id
  const type = dialog.value.type // 獲取當前類型

  if (!idToDelete) return

  try {
    const { data } = await apiAuth.delete(`/lineCategories/${idToDelete}`, {
      params: { type }
    })
    if (!data.success) {
      throw new Error(data.message || '刪除失敗')
    }

    createSnackbar({
      text: '分類刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    loadData()
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

// ===== 批量新增相關 =====
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
  const count = parseInt(batchDialog.value.count)
  if (!count || count < 1 || count > 10) { // 限制一次最多10個
    batchDialog.value.error = '請輸入1-10之間的數字'
    return
  }

  batchDialog.value.error = ''
  newItems.value = Array(count).fill(null).map(() => ({
    name: '',
    error: ''
  }))

  closeBatchDialog()
}

// ===== 新增/移除項目 =====
const addNewItem = () => {
  if (newItems.value.length < 10) { // 限制最多10個
     newItems.value.push({ name: '', error: '' })
  } else {
     createSnackbar({
      text: '一次最多新增10個項目',
      snackbarProps: { color: 'orange-darken-2' }
    })
  }
}

const removeItem = (index) => {
  newItems.value.splice(index, 1)
}

// 監聽批量新增列表變化，用於即時清除錯誤
watch(newItems, (items) => {
  items.forEach(item => {
    if (item.name.trim()) {
      item.error = ''
    }
  })
}, { deep: true })

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await loadData()
  localMainCategories.value = JSON.parse(JSON.stringify(mainCategories.value))
})

// 監聽大分類選擇 (用於對話框)
watch(selectedMainCategory, async (newValue) => {
  // 清空第一層選項和已選值
  firstLevelCategories.value = []
  if (dialog.value.type === '第二層分類' && !dialog.value.id) {
     selectedFirstLevelCategory.value = null
  }


  if (!newValue) {
    // 如果大分類被清空，則不需要做任何事
    return
  }

  // 只在第二層分類的新增或編輯模式下，根據大分類選擇載入第一層選項
  if (dialog.value.type === '第二層分類') {
     await loadFirstLevelOptions(newValue)
  }
})

// 在 script setup 部分添加排序相關的方法
const canMoveUp = (item, items) => {
  if (!items) {
    // 大分類的情況
    const index = localMainCategories.value.findIndex(cat => cat._id === item._id)
    return index > 0
  } else {
    // 第一層或第二層分類的情況
    const index = items.findIndex(i => i._id === item._id)
    return index > 0
  }
}

const canMoveDown = (item, items) => {
  if (!items) {
    // 大分類的情況
    const index = localMainCategories.value.findIndex(cat => cat._id === item._id)
    return index < localMainCategories.value.length - 1
  } else {
    // 第一層或第二層分類的情況
    const index = items.findIndex(i => i._id === item._id)
    return index < items.length - 1
  }
}

const moveItem = (item, type, direction) => {
  let targetArray
  let currentIndex
  let parentItem

  if (type === '大分類') {
    targetArray = localMainCategories.value
    currentIndex = targetArray.findIndex(cat => cat._id === item._id)
  } else if (type === '第一層分類') {
    parentItem = localMainCategories.value.find(main =>
      main.第一層分類.some(first => first._id === item._id)
    )
    if (!parentItem) return
    targetArray = parentItem.第一層分類
    currentIndex = targetArray.findIndex(cat => cat._id === item._id)
  } else if (type === '第二層分類') {
    for (const main of localMainCategories.value) {
      for (const first of main.第一層分類) {
        if (first.第二層分類.some(second => second._id === item._id)) {
          parentItem = first
          targetArray = first.第二層分類
          currentIndex = targetArray.findIndex(cat => cat._id === item._id)
          break
        }
      }
      if (parentItem) break
    }
  }

  if (!targetArray || currentIndex === -1) return

  // 檢查是否可以移動
  if (direction === 'up' && !canMoveUp(item, targetArray)) return
  if (direction === 'down' && !canMoveDown(item, targetArray)) return

  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

  // 交換位置
  const temp = targetArray[currentIndex]
  targetArray[currentIndex] = targetArray[newIndex]
  targetArray[newIndex] = temp

  // 更新 order 值
  targetArray.forEach((item, index) => {
    item.order = index
  })

  hasUnsavedChanges.value = true
}

// 在 script setup 中添加新的狀態
const hasUnsavedChanges = ref(false)
const localMainCategories = ref([])

// 添加保存變更函數
const isSaving = ref(false)
const saveChanges = async () => {
  if (!hasUnsavedChanges.value || isSaving.value) return

  try {
    isSaving.value = true
    isLoading.value = true
    const promises = []

    // 保存大分類順序
    localMainCategories.value.forEach((mainCategory, i) => {
      promises.push(
        apiAuth.patch(`/lineCategories/${mainCategory._id}/order`, {
          type: '大分類',
          newOrder: i
        })
      )

      // 保存第一層分類順序
      mainCategory.第一層分類.forEach((firstLevel, j) => {
        promises.push(
          apiAuth.patch(`/lineCategories/${firstLevel._id}/order`, {
            type: '第一層分類',
            newOrder: j
          })
        )

        // 保存第二層分類順序
        firstLevel.第二層分類.forEach((secondLevel, k) => {
          promises.push(
            apiAuth.patch(`/lineCategories/${secondLevel._id}/order`, {
              type: '第二層分類',
              newOrder: k
            })
          )
        })
      })
    })

    await Promise.all(promises)
    mainCategories.value = JSON.parse(JSON.stringify(localMainCategories.value))
    hasUnsavedChanges.value = false
    isOrderingMode.value = false

    createSnackbar({
      text: '排序更新成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    handleError(error)
    // 如果保存失敗，重置本地數據
    localMainCategories.value = JSON.parse(JSON.stringify(mainCategories.value))
    hasUnsavedChanges.value = false
  } finally {
    isSaving.value = false
    isLoading.value = false
  }
}

// 添加取消排序模式的函數
const cancelOrdering = () => {
  if (isSaving.value) return
  isOrderingMode.value = false
  if (hasUnsavedChanges.value) {
    localMainCategories.value = JSON.parse(JSON.stringify(mainCategories.value))
    hasUnsavedChanges.value = false
  }
}

// 在 script setup 中添加新的狀態
const isOrderingMode = ref(false)

</script>

<style lang="scss" scoped>
.category-display-card {
  border: 1px solid #ccc;
  background-color: #fcfcfc; // 淺背景色
  height: 100%; // 確保卡片高度一致
  display: flex;
  flex-direction: column; // 垂直佈局

  .card-title-main {
    font-size: 1.15rem;
    font-weight: 600;
    border-bottom: 1px solid #eee; // 分隔線
    padding-bottom: 8px;
  }

  .main-category-name {
    color: #1976D2; // 主分類用藍色
  }

  .category-list {
    flex-grow: 1; // 佔滿剩餘空間
    padding: 0; // 移除列表內邊距
    background-color: transparent; // 列表背景透明
  }

  .first-level-group {
    border-bottom: 1px dashed #e0e0e0; // 第一層之間用虛線分隔
    &:last-child {
      border-bottom: none;
    }
  }

  .first-level-item {
    background-color: #fff; // 第一層背景白色
    min-height: 40px;
    padding: 4px 16px;
    &:hover {
      background-color: #f5f5f5;
    }
  }

  .first-level-title {
    font-weight: 500;
    color: #D32F2F; // 第一層用紅色
    font-size: 0.95rem;
  }

   .second-level-list {
      background-color: #fafafa; // 第二層列表背景稍深
      padding-bottom: 4px;
      padding-top: 4px;
   }

  .second-level-item {
     min-height: 32px;
     padding: 2px 16px 2px 0; // 調整內邊距
     &:hover {
      background-color: #f0f0f0;
    }
  }

  .second-level-title {
     color: #199c80; // 第二層用深藍色
     font-size: 0.9rem;
  }

  .no-data-item {
     min-height: 32px;
     padding-left: 16px;
     background-color: transparent;
      &:hover {
       background-color: transparent;
     }
  }

  .no-data-text {
    color: #9e9e9e;
    font-size: 0.85rem;
    text-align: center;
    width: 100%;
    font-style: italic;
  }
}


.max-width-300 {
  max-width: 300px;
}

.item-container {
  padding: 8px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  &:last-child {
    margin-bottom: 0;
  }
  :deep(.v-field) {
    background-color: #fff;
  }
}
</style>


