<template>
  <v-dialog
    v-model="dialog"
    max-width="840px"
    persistent
  >
    <v-card class="rounded-lg">
      <!-- 標題列 -->
      <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-chart-box
        </v-icon>
        任務統計
        <v-spacer />
        <v-btn
          icon
          color="white"
          variant="plain"
          class="opacity-100"
          :ripple="false"
          size="20"
          @click="closeDialog"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <v-card-text class="px-6 pt-8">
        <!-- 日期區間選擇 -->
        <div class="mb-6">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-date-input
                v-model="dateRange"
                label="日期區間"
                variant="outlined"
                density="compact"
                multiple="range"
                prepend-icon="mdi-calendar"
                clearable
                hide-details
                :cancel-text="'取消'"
                :ok-text="'確認'"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="d-flex align-center"
            >
              <v-btn
                color="cyan-darken-2"
                :loading="loading"
                elevation="1"
                @click="fetchStatistics"
              >
                查詢
              </v-btn>
              <v-btn
                label
                class="ms-3"
                size="36"
                color="grey"
                elevation="1"
                :loading="loading"
                @click="handleReset"
              >
                <v-icon size="18">
                  mdi-refresh
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- 載入中 -->
        <div
          v-if="loading"
          class="d-flex justify-center py-8"
        >
          <v-progress-circular
            indeterminate
            color="grey"
            size="48"
          />
        </div>

        <!-- 統計結果 -->
        <div v-else>
          <!-- 總計統計 -->
          <div class="mb-6">
            <v-row>
              <v-col
                cols="12"
                md="4"
              >
                <v-card
                  class="rounded-lg border"
                  elevation="0"
                  color="orange-lighten-5"
                >
                  <v-card-text class="text-center py-4">
                    <div class="card-title text-orange-darken-2 mb-1">
                      待處理
                    </div>
                    <div class="text-h4 font-weight-bold text-orange-darken-1">
                      {{ totalPendingTasks }}
                    </div>
                    <div class="sub-title text-medium-emphasis">
                      任務數量
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-card
                  class="rounded-lg border"
                  elevation="0"
                  color="blue-lighten-5"
                >
                  <v-card-text class="text-center py-4">
                    <div class="card-title text-blue-darken-2 mb-1">
                      進行中
                    </div>
                    <div class="text-h4 font-weight-bold text-blue-darken-1">
                      {{ totalInProgressTasks }}
                    </div>
                    <div class="sub-title text-medium-emphasis">
                      任務數量
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-card
                  class="rounded-lg border"
                  elevation="0"
                  color="green-lighten-5"
                >
                  <v-card-text class="text-center py-4">
                    <div class="card-title text-green-darken-2 mb-1">
                      已完成
                    </div>
                    <div class="text-h4 font-weight-bold text-green-darken-1">
                      {{ totalCompletedTasks }}
                    </div>
                    <div class="sub-title text-medium-emphasis">
                      任務數量
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- 各分類統計表格 -->
          <div class="mb-4">
            <h4 class="card-title mb-3">
              各分類任務統計表
            </h4>
            <v-data-table
              :headers="tableHeaders"
              :items="tableData"
              :items-per-page="-1"
              class="statistics-table border rounded-lg"
              hide-default-footer
            >
              <template #[`item.category`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    v-if="item.isUncategorized"
                    color="grey-darken-1"
                    size="20"
                    class="me-2"
                  >
                    mdi-folder-question
                  </v-icon>
                  <span
                    class="font-weight-medium"
                    :class="item.isUncategorized ? 'text-grey-darken-1' : 'text-grey-darken-3'"
                  >
                    {{ item.category }}
                  </span>
                </div>
              </template>

              <template #[`item.pending`]="{ item }">
                <span
                  class="font-weight-bold"
                  :class="item.pending > 0 ? 'text-orange-darken-1' : 'text-medium-emphasis'"
                >
                  {{ item.pending }}
                </span>
              </template>

              <template #[`item.inProgress`]="{ item }">
                <span
                  class="font-weight-bold"
                  :class="item.inProgress > 0 ? 'text-blue-darken-1' : 'text-medium-emphasis'"
                >
                  {{ item.inProgress }}
                </span>
              </template>

              <template #[`item.completed`]="{ item }">
                <span
                  class="font-weight-bold"
                  :class="item.completed > 0 ? 'text-green-darken-1' : 'text-medium-emphasis'"
                >
                  {{ item.completed }}
                </span>
              </template>

              <template #[`item.total`]="{ item }">
                <span
                  class="font-weight-bold text-grey-darken-2"
                >
                  {{ item.total }}
                </span>
              </template>
            </v-data-table>
          </div>

          <!-- 無資料狀態 -->
          <div
            v-if="tableData.length === 0"
            class="text-center py-8"
          >
            <v-icon
              size="48"
              color="grey-lighten-1"
              class="mb-3"
            >
              mdi-chart-line-variant
            </v-icon>
            <h4 class="text-h6 text-medium-emphasis mb-2">
              此專案暫無任務
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              請先建立任務或檢查專案設定
            </p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 響應式變數
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dateRange = ref([])
// 只用來顯示「已套用的查詢區間」
const appliedDateRange = ref([])
const loading = ref(false)
const categoryStatistics = ref([])
const uncategorizedStats = ref({ pending: 0, inProgress: 0, completed: 0 })
const totalPendingTasks = ref(0)
const totalInProgressTasks = ref(0)
const totalCompletedTasks = ref(0)

// 表格標頭
const tableHeaders = [
  { title: '分類', key: 'category', sortable: true },
  { title: '待處理', key: 'pending', sortable: true, align: 'center' },
  { title: '進行中', key: 'inProgress', sortable: true, align: 'center' },
  { title: '已完成', key: 'completed', sortable: true, align: 'center' },
  { title: '總計', key: 'total', sortable: true, align: 'center' }
]

// 計算表格資料
const tableData = computed(() => {
  const data = []

  // 添加各分類資料
  categoryStatistics.value.forEach(category => {
    const total = (category.pending || 0) + (category.inProgress || 0) + (category.completed || 0)
    data.push({
      category: category.name,
      pending: category.pending || 0,
      inProgress: category.inProgress || 0,
      completed: category.completed || 0,
      total,
      isUncategorized: false
    })
  })

  // 添加未分類資料（如果有）
  if (uncategorizedStats.value && (uncategorizedStats.value.pending > 0 || uncategorizedStats.value.inProgress > 0 || uncategorizedStats.value.completed > 0)) {
    const total = (uncategorizedStats.value.pending || 0) + (uncategorizedStats.value.inProgress || 0) + (uncategorizedStats.value.completed || 0)
    data.push({
      category: '未分類',
      pending: uncategorizedStats.value.pending || 0,
      inProgress: uncategorizedStats.value.inProgress || 0,
      completed: uncategorizedStats.value.completed || 0,
      total,
      isUncategorized: true
    })
  }

  return data
})




// 取得統計資料
const fetchStatistics = async () => {
  if (!props.project?._id) return

  loading.value = true

  try {
    const params = {
      projectId: props.project._id
    }

    // 如果有選擇日期區間，加入查詢參數
    if (dateRange.value && dateRange.value.length > 0) {
      // 處理日期範圍：取第一個日期作為開始，最後一個日期作為結束
      const startDate = new Date(dateRange.value[0])
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(dateRange.value[dateRange.value.length - 1])
      endDate.setHours(23, 59, 59, 999)

      params.startDate = startDate.toISOString()
      params.endDate = endDate.toISOString()
      // 更新已套用的查詢區間（僅在按查詢時）
      appliedDateRange.value = [params.startDate, params.endDate]
    }

    const { data } = await apiAuth.get('/tasks/statistics', { params })

    if (data.success) {
      const stats = data.data
      categoryStatistics.value = stats.categoryStatistics || []
      uncategorizedStats.value = stats.uncategorizedStats || { pending: 0, inProgress: 0, completed: 0 }
      totalPendingTasks.value = stats.totalPendingTasks || 0
      totalInProgressTasks.value = stats.totalInProgressTasks || 0
      totalCompletedTasks.value = stats.totalCompletedTasks || 0

      createSnackbar({
        text: '統計資料載入完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('取得統計資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得統計資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 重置：清空日期並查詢全部
const handleReset = async () => {
  if (loading.value) return
  dateRange.value = []
  appliedDateRange.value = []
  await fetchStatistics()
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
}

// 監聽對話框開啟和關閉
watch(dialog, (newValue) => {
  if (newValue && props.project) {
    // 對話框開啟時自動載入統計資料
    fetchStatistics()
  } else if (!newValue) {
    // 對話框關閉時重置日期選擇
    dateRange.value = []
    appliedDateRange.value = []
  }
})
</script>

<style scoped>
.statistics-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.statistics-table :deep(.v-data-table__td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.statistics-table :deep(.v-data-table__th) {
  padding: 12px 16px;
  font-weight: 600;
}

.statistics-table :deep(.v-data-table__tr) {
  transition: background-color 0.2s ease;
}

.statistics-table :deep(tbody tr:nth-child(odd)) {
  background-color: #f9f9f9;
}

.statistics-table :deep(.v-data-table__tr:hover) {
  background-color: #eee;
}
</style>
