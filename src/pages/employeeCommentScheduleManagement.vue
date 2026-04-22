<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <h3>評論排程管理</h3>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="teal-darken-1"
          align-tabs="start"
        >
          <v-tab value="pending">
            <v-icon start>
              mdi-clock-outline
            </v-icon>
            待排程
          </v-tab>
          <v-tab value="submitted">
            <v-badge
              :content="pendingReviewCount"
              :model-value="pendingReviewCount > 0"
              color="red-lighten-1"
              overlap
              class="pending-review-badge"
            >
              <span class="d-inline-flex align-center">
                <v-icon start>
                  mdi-file-clock-outline
                </v-icon>
                待審核
              </span>
            </v-badge>
          </v-tab>
          <v-tab value="completed">
            <v-icon start>
              mdi-check-circle-outline
            </v-icon>
            已完成
          </v-tab>
          <v-tab value="overdue">
            <v-icon start>
              mdi-alert-circle-outline
            </v-icon>
            已過期
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 待排程標籤頁 -->
          <v-window-item value="pending">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <v-row class="pb-2">
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <!-- 插入排程（不需要權限） -->
                    <v-btn
                      prepend-icon="mdi-plus-circle"
                      color="teal-darken-1"
                      variant="outlined"
                      :size="buttonSize"
                      @click="openInsertDialog"
                    >
                      插入排程
                    </v-btn>
                    <!-- 建立排程（需要權限） -->
                    <v-btn
                      v-if="hasManagePermission"
                      prepend-icon="mdi-plus"
                      color="teal-darken-1"
                      variant="outlined"
                      :size="buttonSize"
                      class="ms-3"
                      @click="openCreateScheduleDialog"
                    >
                      建立排程
                    </v-btn>
                    <!-- 清除所有排程（需要權限） -->
                    <v-btn
                      v-if="hasManagePermission"
                      prepend-icon="mdi-delete-sweep"
                      color="red-lighten-1"
                      variant="outlined"
                      :size="buttonSize"
                      class="ms-3"
                      @click="openClearAllDialog"
                    >
                      清除所有排程
                    </v-btn>
                    <!-- 清除循環記憶（需要權限） -->
                    <v-btn
                      v-if="hasManagePermission"
                      prepend-icon="mdi-restore"
                      color="red-lighten-1"
                      variant="outlined"
                      :size="buttonSize"
                      class="ms-3"
                      @click="openResetCycleMemoryDialog"
                    >
                      清除循環記憶
                    </v-btn>
                  </v-col>
                  <v-spacer />
                  <v-col
                    cols="12"
                    md="3"
                  >
                    <v-text-field
                      v-model="searchKeyword"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋姓名"
                      placeholder="輸入姓名關鍵字搜尋"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>

                <!-- 待排程表格（含懲罰排程 penalty） -->
                <ScheduleTable
                  ref="pendingTableRef"
                  :status="['pending', 'today', 'penalty']"
                  :loading="loading"
                  :search-keyword="searchKeyword"
                  @refresh="fetchTableData"
                  @edit="openEditDialog"
                  @delete="openDeleteDialog"
                  @insert="openInsertDialog"
                />
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 待審核標籤頁 -->
          <v-window-item value="submitted">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <!-- 待審核表格 -->
                <ScheduleTable
                  ref="submittedTableRef"
                  status="submitted"
                  :loading="loading"
                  :search-keyword="searchKeyword"
                  @refresh="fetchTableData"
                  @review="openReviewDialog"
                />
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 已完成標籤頁 -->
          <v-window-item value="completed">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <!-- 已完成表格 -->
                <ScheduleTable
                  ref="completedTableRef"
                  status="completed"
                  :loading="loading"
                  :search-keyword="searchKeyword"
                  @refresh="fetchTableData"
                  @review="openReviewDialog"
                />
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 已過期標籤頁 -->
          <v-window-item value="overdue">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <!-- 已過期表格 -->
                <ScheduleTable
                  ref="overdueTableRef"
                  status="overdue"
                  :loading="loading"
                  :search-keyword="searchKeyword"
                  @refresh="fetchTableData"
                />
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- 建立排程對話框 -->
    <CreateScheduleDialog
      v-model="createScheduleDialog"
      @created="handleScheduleCreated"
    />

    <!-- 審核對話框 -->
    <ReviewDialog
      v-model="reviewDialog.show"
      :schedule="reviewDialog.schedule"
      @reviewed="handleReviewed"
    />

    <!-- 編輯排程對話框 -->
    <EditScheduleDialog
      v-model="editDialog.show"
      :schedule="editDialog.schedule"
      @updated="handleScheduleUpdated"
    />

    <!-- 插入排程對話框 -->
    <InsertScheduleDialog
      v-model="insertDialog.show"
      @inserted="handleScheduleInserted"
    />

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteDialog.show"
      dialog-width="320"
      title="確認刪除排程"
      :message="`確定要刪除員工「<span class='text-red'>${deleteDialog.employeeName}</span>」的排程嗎？`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="handleDeleteSchedule"
    />

    <!-- 清除所有排程確認對話框（需輸入「確認」） -->
    <ConfirmDeleteDialogWithTextField
      v-model="clearAllDialog.show"
      title="確認清除所有排程"
      :message="`確定要清除所有<strong>待排程</strong>項目嗎？此操作無法復原。<br><span class='text-red font-weight-bold'>請在下方輸入「所有排程」以繼續。</span>`"
      expected-name="所有排程"
      input-label="項目"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="清除"
      cancel-button-text="取消"
      @confirm="handleClearAllSchedules"
    />

    <!-- 清除循環記憶確認對話框 -->
    <ConfirmDeleteDialog
      v-model="resetCycleMemoryDialog.show"
      dialog-width="360"
      title="確認清除循環記憶"
      message="確定要清除循環記憶嗎？清除後，下次自動加5人時將從候選名單開頭重新開始。"
      confirm-button-text="確認"
      cancel-button-text="取消"
      @confirm="handleResetCycleMemory"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { usePermissionStore } from '@/stores/permission'
import ScheduleTable from '@/components/EmployeeCommentScheduleTable.vue'
import CreateScheduleDialog from '@/components/CreateEmployeeCommentScheduleDialog.vue'
import ReviewDialog from '@/components/ReviewEmployeeCommentDialog.vue'
import EditScheduleDialog from '@/components/EditEmployeeCommentScheduleDialog.vue'
import InsertScheduleDialog from '@/components/InsertEmployeeCommentScheduleDialog.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '評論排程管理 | Ystravel',
    login: true,
    permission: 'EMPLOYEE_COMMENT_SCHEDULE_MANAGEMENT_READ'
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const permissionStore = usePermissionStore()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 權限檢查 =====
const hasManagePermission = computed(() => {
  return permissionStore.hasPermission('EMPLOYEE_COMMENT_SCHEDULE_MANAGE')
})

// ===== Tab 管理 =====
const activeTab = ref('pending')
const loading = ref(false)
const pendingReviewCount = ref(0)
const searchKeyword = ref('')
const createScheduleDialog = ref(false)
const reviewDialog = ref({
  show: false,
  schedule: null
})

const editDialog = ref({
  show: false,
  schedule: null
})

const insertDialog = ref({
  show: false
})

const deleteDialog = ref({
  show: false,
  schedule: null,
  employeeName: ''
})

const clearAllDialog = ref({
  show: false
})

const resetCycleMemoryDialog = ref({
  show: false
})

const pendingTableRef = ref(null)
const submittedTableRef = ref(null)
const completedTableRef = ref(null)
const overdueTableRef = ref(null)

const fetchPendingReviewCount = async () => {
  try {
    const { data } = await apiAuth.get('/employee-comments/schedules', {
      params: {
        status: 'submitted',
        page: 1,
        itemsPerPage: 1
      }
    })
    pendingReviewCount.value = data?.result?.totalItems ?? 0
  } catch {
    pendingReviewCount.value = 0
  }
}

const fetchTableData = () => {
  // 觸發當前標籤頁的表格刷新
  if (activeTab.value === 'pending' && pendingTableRef.value) {
    pendingTableRef.value.fetchTableData()
  } else if (activeTab.value === 'submitted' && submittedTableRef.value) {
    submittedTableRef.value.fetchTableData()
  } else if (activeTab.value === 'completed' && completedTableRef.value) {
    completedTableRef.value.fetchTableData()
  } else if (activeTab.value === 'overdue' && overdueTableRef.value) {
    overdueTableRef.value.fetchTableData()
  }
  fetchPendingReviewCount()
}

// 當搜尋關鍵字改變時，重新載入當前標籤頁的資料
watch(searchKeyword, () => {
  fetchTableData()
})

const openCreateScheduleDialog = () => {
  createScheduleDialog.value = true
}

const handleScheduleCreated = () => {
  createScheduleDialog.value = false
  fetchTableData()
}

const openReviewDialog = (schedule) => {
  reviewDialog.value = {
    show: true,
    schedule
  }
}

const handleReviewed = () => {
  reviewDialog.value.show = false
  reviewDialog.value.schedule = null
  fetchTableData()
  // 審核可能讓資料在「待審核」與「已完成」間移動，兩邊都刷新
  if (submittedTableRef.value) submittedTableRef.value.fetchTableData()
  if (completedTableRef.value) completedTableRef.value.fetchTableData()
  fetchPendingReviewCount()
  // 通知側邊欄更新待審核數量 badge
  window.dispatchEvent(new Event('employee-comment-reviewed'))
}

const openEditDialog = (schedule) => {
  editDialog.value = {
    show: true,
    schedule
  }
}

const handleScheduleUpdated = () => {
  editDialog.value.show = false
  editDialog.value.schedule = null
  fetchTableData()
}

const openInsertDialog = () => {
  insertDialog.value.show = true
}

const handleScheduleInserted = () => {
  insertDialog.value.show = false
  fetchTableData()
}

const openDeleteDialog = (schedule) => {
  deleteDialog.value = {
    show: true,
    schedule,
    employeeName: schedule.employee?.name || '未知員工'
  }
}

const handleDeleteSchedule = async () => {
  if (!deleteDialog.value.schedule?._id) return

  try {
    const { data } = await apiAuth.delete(`/employee-comments/schedules/${deleteDialog.value.schedule._id}`)
    if (data.success) {
      createSnackbar({
        text: '排程刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      deleteDialog.value = {
        show: false,
        schedule: null,
        employeeName: ''
      }
      fetchTableData()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除排程失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const openClearAllDialog = () => {
  clearAllDialog.value.show = true
}

const handleClearAllSchedules = async () => {
  try {
    const { data } = await apiAuth.delete('/employee-comments/schedules/all', {
      params: {
        onlyPending: true
      }
    })
    if (data.success) {
      createSnackbar({
        text: `已清除 ${data.result.deletedCount} 個待排程項目`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      clearAllDialog.value.show = false
      // 刷新所有表格（因為清除的是 pending，主要影響待排程標籤頁）
      if (pendingTableRef.value) {
        pendingTableRef.value.fetchTableData()
      }
      // 也刷新其他標籤頁，以防有狀態變化
      if (submittedTableRef.value) {
        submittedTableRef.value.fetchTableData()
      }
      if (completedTableRef.value) {
        completedTableRef.value.fetchTableData()
      }
      if (overdueTableRef.value) {
        overdueTableRef.value.fetchTableData()
      }
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '清除排程失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const openResetCycleMemoryDialog = () => {
  resetCycleMemoryDialog.value.show = true
}

const handleResetCycleMemory = async () => {
  try {
    const { data } = await apiAuth.delete('/employee-comments/schedules/reset-cycle-memory')
    if (data.success) {
      createSnackbar({
        text: '循環記憶已清除，下次自動加5人時將從候選名單開頭重新開始',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      resetCycleMemoryDialog.value.show = false
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '清除循環記憶失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

onMounted(() => {
  fetchPendingReviewCount()
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

/* 待審核 tab badge 大小（參考 default 收件匣） */
.pending-review-badge :deep(.v-badge__badge) {
  top: -10px !important;
  left: 68px !important;
  font-size: 8px !important;
  height: 14px !important;
  min-width: 14px !important;
  padding: 4px !important;
}
</style>
