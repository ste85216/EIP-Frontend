<template>
  <v-dialog
    v-model="isOpen"
    max-width="1000"
    persistent
    scrollable
    @click:outside="closeDialog"
    @keydown.esc="closeDialog"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
        <v-icon
          icon="mdi-tag-multiple"
          :size="smAndUp ? '20' : '18'"
          color="white"
          class="me-2"
        />
        <span class="card-title text-white">管理影片分類</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          class="opacity-100"
          :ripple="false"
          color="white"
          :size="smAndUp ? '36' : '32'"
          @click="closeDialog"
        >
          <v-icon :size="smAndUp ? '22' : '18'">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <v-progress-linear
        v-if="loading"
        color="blue-grey-darken-2"
        indeterminate
      />
      <v-card-text class="px-6 py-4 mt-3 mb-2">
        <v-row>
          <!-- 左邊：分類列表 -->
          <v-col
            cols="12"
            md="8"
          >
            <div class="mb-3">
              <div class="card-title text-blue-grey-darken-4">
                分類列表
              </div>
            </div>
            <div
              v-if="categoriesLoading"
              class="text-center py-8"
            >
              <v-progress-circular
                indeterminate
                color="blue-grey-darken-2"
                size="48"
                width="6"
              />
            </div>
            <div
              v-else-if="categories.length === 0"
              class="text-center py-8 text-grey-darken-1"
            >
              尚無分類
            </div>
            <draggable
              v-model="sortableCategories"
              item-key="_id"
              handle=".drag-handle"
              animation="200"
              ghost-class="ghost-item"
              chosen-class="chosen-item"
              :disabled="editingId !== null || sorting"
              @end="onDragEnd"
            >
              <template #item="{ element: category, index }">
                <v-list-item
                  :key="category._id"
                  class="px-2 border rounded mb-2"
                >
                  <template #prepend>
                    <div class="drag-handle cursor-move me-2">
                      <v-icon
                        color="grey-darken-1"
                        size="20"
                      >
                        mdi-drag-vertical
                      </v-icon>
                    </div>
                  </template>
                  <v-list-item-title>
                    <v-text-field
                      v-if="editingId === category._id"
                      v-model="editingName"
                      variant="outlined"
                      density="compact"
                      hide-details
                      autofocus
                      @blur="saveEdit(category)"
                      @keydown.enter="saveEdit(category)"
                      @keydown.esc="cancelEdit"
                    />
                    <div
                      v-else
                      class="d-flex align-center"
                    >
                      <v-chip
                        size="small"
                        color="blue-grey"
                        variant="tonal"
                        class="me-2"
                      >
                        {{ index + 1 }}
                      </v-chip>
                      <span>{{ category.name }}</span>
                    </div>
                  </v-list-item-title>
                  <template #append>
                    <div class="ms-4 d-flex align-center">
                      <v-btn
                        icon
                        size="small"
                        color="blue"
                        variant="text"
                        :disabled="editingId !== null || sorting"
                        class="me-1"
                        @click="startEdit(category)"
                      >
                        <v-icon size="18">
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        :color="category.isActive ? 'orange' : 'green'"
                        variant="text"
                        :disabled="editingId !== null || sorting || togglingId === category._id"
                        :loading="togglingId === category._id"
                        class="me-1"
                        @click="toggleActive(category, !category.isActive)"
                      >
                        <v-icon size="18">
                          {{ category.isActive ? 'mdi-pause' : 'mdi-play' }}
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="red"
                        variant="text"
                        :disabled="editingId !== null || sorting"
                        :loading="deletingId === category._id"
                        @click="deleteCategory(category)"
                      >
                        <v-icon size="18">
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </template>
            </draggable>
          </v-col>

          <!-- 右邊：新增分類區域 -->
          <v-col
            cols="12"
            md="4"
          >
            <v-divider
              vertical
              class="d-none d-md-block"
            />
            <div class="border rounded px-4 py-4">
              <div class="mb-3">
                <div class="sub-title text-blue-grey-darken-4">
                  新增分類
                </div>
              </div>
              <v-form
                ref="formRef"
                @submit.prevent="handleAddCategory"
              >
                <v-text-field
                  v-model="newCategoryName"
                  :error-messages="nameError"
                  label="分類名稱 *"
                  variant="outlined"
                  density="compact"
                  class="mt-5"
                  clearable
                />
                <div class="d-flex justify-end">
                  <v-btn
                    color="blue-grey-darken-2"
                    variant="outlined"
                    :loading="adding"
                    size="small"
                    @click="handleAddCategory"
                  >
                    新增
                  </v-btn>
                </div>
              </v-form>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-6 pb-5 pt-0">
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          :size="smAndUp ? 'default' : 'small'"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除分類`"
      :message="`確定要刪除「${selectedCategory?.name || ''}」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="confirmDelete"
    />
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import draggable from 'vuedraggable'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()

const isOpen = ref(props.modelValue)
const categories = ref([])
const loading = ref(false)
const categoriesLoading = ref(false)
const adding = ref(false)
const sorting = ref(false)
const deletingId = ref(null)
const togglingId = ref(null)
const newCategoryName = ref('')
const nameError = ref('')
const editingId = ref(null)
const editingName = ref('')
const showDeleteDialog = ref(false)
const selectedCategory = ref(null)

// 可拖動的分類列表
const sortableCategories = ref([])

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    loadCategories()
  }
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
})

// 載入分類列表
const loadCategories = async () => {
  try {
    categoriesLoading.value = true
    const response = await apiAuth.get('/education-training-video-categories')
    categories.value = response.data.result || []
    // 更新可拖動列表
    sortableCategories.value = [...categories.value].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  } catch (error) {
    console.error('載入分類錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '載入分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    categoriesLoading.value = false
  }
}

// 新增分類
const handleAddCategory = async () => {
  // 清除之前的錯誤
  nameError.value = ''

  // 驗證
  if (!newCategoryName.value || newCategoryName.value.trim() === '') {
    nameError.value = '請輸入分類名稱'
    return
  }

  try {
    adding.value = true
    const response = await apiAuth.post('/education-training-video-categories', {
      name: newCategoryName.value.trim()
    })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    newCategoryName.value = ''
    nameError.value = ''
    await loadCategories()
    emit('updated')
  } catch (error) {
    console.error('新增分類錯誤:', error)
    // 如果是名稱相關的錯誤，顯示在輸入框下方
    if (error.response?.data?.message?.includes('名稱')) {
      nameError.value = error.response.data.message
    } else {
      createSnackbar({
        text: error.response?.data?.message || error.message || '新增分類失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    adding.value = false
  }
}

// 開始編輯
const startEdit = (category) => {
  editingId.value = category._id
  editingName.value = category.name
}

// 取消編輯
const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

// 儲存編輯
const saveEdit = async (category) => {
  if (!editingName.value || editingName.value.trim() === '') {
    // 如果名稱為空，取消編輯
    cancelEdit()
    return
  }

  if (editingName.value.trim() === category.name) {
    cancelEdit()
    return
  }

  try {
    const response = await apiAuth.patch(`/education-training-video-categories/${category._id}`, {
      name: editingName.value.trim()
    })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    cancelEdit()
    await loadCategories()
    emit('updated')
  } catch (error) {
    console.error('更新分類錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '更新分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    // 如果更新失敗，保持編輯狀態
  }
}

// 切換啟用/停用
const toggleActive = async (category, newValue) => {
  // 先更新本地狀態，提供即時反饋
  const originalValue = category.isActive
  category.isActive = newValue
  const categoryIndex = sortableCategories.value.findIndex(c => c._id === category._id)
  if (categoryIndex !== -1) {
    sortableCategories.value[categoryIndex].isActive = newValue
  }
  const categoriesIndex = categories.value.findIndex(c => c._id === category._id)
  if (categoriesIndex !== -1) {
    categories.value[categoriesIndex].isActive = newValue
  }

  try {
    togglingId.value = category._id
    const response = await apiAuth.patch(`/education-training-video-categories/${category._id}`, {
      isActive: newValue
    })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    emit('updated')
  } catch (error) {
    console.error('切換狀態錯誤:', error)
    // 恢復原始狀態
    category.isActive = originalValue
    if (categoryIndex !== -1) {
      sortableCategories.value[categoryIndex].isActive = originalValue
    }
    if (categoriesIndex !== -1) {
      categories.value[categoriesIndex].isActive = originalValue
    }
    createSnackbar({
      text: error.response?.data?.message || error.message || '切換狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    togglingId.value = null
  }
}

// 刪除分類
const deleteCategory = (category) => {
  selectedCategory.value = category
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    deletingId.value = selectedCategory.value._id
    const response = await apiAuth.delete(`/education-training-video-categories/${selectedCategory.value._id}`)
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })
    showDeleteDialog.value = false
    await loadCategories()
    emit('updated')
  } catch (error) {
    console.error('刪除分類錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '刪除分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingId.value = null
  }
}

// 拖拉結束時更新排序
const onDragEnd = async () => {
  await updateOrderFromDrag()
}

// 從拖拉排序更新順序
const updateOrderFromDrag = async () => {
  // 保存原始順序，以便失敗時恢復
  const originalOrder = [...sortableCategories.value]

  // 更新本地排序（根據拖拉後的位置更新 order）
  sortableCategories.value.forEach((cat, index) => {
    cat.order = index + 1
  })

  // 同步更新 categories
  categories.value.forEach((cat) => {
    const sortedCat = sortableCategories.value.find(sc => sc._id === cat._id)
    if (sortedCat) {
      cat.order = sortedCat.order
    }
  })

  try {
    sorting.value = true
    const categoriesToUpdate = sortableCategories.value.map((cat) => ({ id: cat._id }))
    await apiAuth.patch('/education-training-video-categories/order/update', {
      categories: categoriesToUpdate
    })
    emit('updated')
  } catch (error) {
    console.error('更新排序錯誤:', error)
    // 恢復原始順序
    sortableCategories.value = originalOrder
    // 重新載入以確保同步
    await loadCategories()
    createSnackbar({
      text: error.response?.data?.message || error.message || '更新排序失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    sorting.value = false
  }
}

// 關閉對話框
const closeDialog = () => {
  isOpen.value = false
  newCategoryName.value = ''
  nameError.value = ''
  cancelEdit()
}

onMounted(() => {
  if (isOpen.value) {
    loadCategories()
  }
})
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

/* 拖拉排序樣式 */
.sortable-list {
  min-height: 100px;
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
}

.drag-handle:hover {
  background-color: #e0e0e0;
}

.ghost-item {
  opacity: 0.5;
  background-color: #e3f2fd;
  border: 2px dashed #2196f3;
}

.chosen-item {
  background-color: #c9c9c9;
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cursor-move {
  cursor: move;
}
</style>

