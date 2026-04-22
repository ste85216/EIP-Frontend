<template>
  <v-container max-width="2400">
    <v-row class="pt-md-5 px-lg-0 px-xxl-6">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="mt-1 px-lg-6 px-xl-4 px-xxl-2"
              >
                <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
                  <div class="d-flex align-center px-4 px-sm-6 py-1">
                    <h3>
                      異動紀錄
                    </h3>
                  </div>
                  <v-divider class="mt-5 mb-1 mb-sm-3" />
                  <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
                    <v-row class="mb-2">
                      <!-- 操作人員 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                        class="px-1 pe-sm-2 py-1"
                      >
                        <div class="d-flex flex-column">
                          <span class="search-label">操作人員 :</span>
                          <v-autocomplete
                            v-model="searchCriteria.operatorId"
                            v-model:search-input="operatorSearchInput"
                            :items="operatorSuggestions"
                            :loading="operatorLoading"
                            return-object
                            :item-props="item => ({
                              key: item._id,
                              title: formatUserDisplay(item),
                              value: item
                            })"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            placeholder="請選擇操作人員"
                            @update:search="handleOperatorSearch"
                            @click:clear="clearOperatorSearch"
                            @click:input="loadAllUsers"
                          >
                            <template #selection="{ item }">
                              {{ formatUserDisplay(item.raw) }}
                            </template>
                          </v-autocomplete>
                        </div>
                      </v-col>

                      <!-- 資料類型 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                        class="px-1 pe-sm-2 py-1"
                      >
                        <div class="d-flex flex-column">
                          <span class="search-label">資料類型 :</span>
                          <v-select
                            v-model="searchCriteria.targetModel"
                            :items="modelOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            placeholder="請選擇資料類型"
                          />
                        </div>
                      </v-col>

                      <!-- 操作類型 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                        class="px-1 pe-sm-2 py-1"
                      >
                        <div class="d-flex flex-column">
                          <span class="search-label">操作類型 :</span>
                          <v-select
                            v-model="searchCriteria.action"
                            :items="actionOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            hide-details
                            clearable
                            placeholder="請選擇操作類型"
                          />
                        </div>
                      </v-col>

                      <!-- 日期區間 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                        class="px-1 pe-sm-2 py-1"
                      >
                        <div class="d-flex flex-column">
                          <span class="search-label">日期區間 :</span>
                          <v-date-input
                            v-model="searchCriteria.dateRange"
                            variant="outlined"
                            density="compact"
                            hide-details
                            multiple="range"
                            prepend-icon
                            clearable
                            placeholder="請選擇日期"
                            :cancel-text="'取消'"
                            :ok-text="'確認'"
                          />
                        </div>
                      </v-col>

                      <!-- 搜尋按鈕 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                        class="pe-sm-4 d-flex"
                      >
                        <v-row>
                          <v-col
                            cols="8"
                            sm="8"
                            lg="8"
                            class="ps-1 pe-0 pb-2 d-flex align-end"
                          >
                            <v-btn
                              color="cyan-darken-2"
                              prepend-icon="mdi-magnify"
                              :loading="tableLoading"
                              block
                              @click="performSearch"
                            >
                              搜尋
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="4"
                            sm="4"
                            lg="4"
                            class="pe-1 pb-2 d-flex align-end"
                          >
                            <v-btn
                              color="grey"
                              width="40"
                              block
                              @click="resetSearch"
                            >
                              <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider class="my-0" />

                  <!-- 功能按鈕和快速搜尋區 -->
                  <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
                    <v-col
                      cols="12"
                      class="ps-4 pb-sm-4"
                    >
                      <v-row class="d-flex align-center px-5 px-md-2">
                        <v-btn
                          v-tooltip="'刪除異動紀錄'"
                          :color="isHovered ? 'red-lighten-1' : 'grey'"
                          variant="outlined"
                          prepend-icon="mdi-delete-clock-outline"
                          @mouseenter="isHovered = true"
                          @mouseleave="isHovered = false"
                          @click="showDeleteDialog"
                        >
                          刪除異動紀錄
                        </v-btn>
                        <v-spacer />
                        <v-col
                          cols="7"
                          sm="6"
                          md="4"
                          lg="2"
                          class="px-1 my-1"
                        >
                          <div class="d-flex align-center">
                            <v-text-field
                              v-model="quickSearchText"
                              :loading="isLoading"
                              density="compact"
                              variant="outlined"
                              placeholder="搜尋操作對象"
                              append-inner-icon="mdi-magnify"
                              hide-details
                              clearable
                              @input="debouncedSearch"
                            />
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- 表格區塊 -->
                  <v-card-text class="px-sm-6 px-md-7">
                    <v-data-table
                      :items="filteredTableItems"
                      :headers="filteredHeaders"
                      :loading="tableLoading"
                      :items-per-page-options="[10, 20, 50, 100]"
                      hover
                      density="compact"
                      class="rounded-ts-lg rounded-te-lg"
                    >
                      <template #item="{ item, index }">
                        <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                          <td>{{ formatDateTime(item.createdAt) }}</td>
                          <td v-if="smAndUp">
                            {{ formatOperator(item) }}
                          </td>
                          <td>{{ getModelDisplay(item.targetModel) }}</td>
                          <td v-if="smAndUp">
                            {{ item.action }}
                          </td>
                          <td v-if="mdAndUp">
                            {{ formatTarget(item) }}
                          </td>
                          <td
                            v-if="lgAndUp"
                            class="py-3"
                            style="max-width: 420px; overflow-wrap: break-word;"
                          >
                            <div
                              v-for="(change, idx) in formatChanges(item)"
                              :key="idx"
                            >
                              {{ change }}
                            </div>
                          </td>
                          <td class="text-center">
                            <div class="d-flex align-center justify-center">
                              <v-btn
                                icon
                                class="me-2"
                                color="light-blue-darken-4"
                                variant="plain"
                                size="24"
                                :ripple="false"
                                @click="showDetail(item)"
                              >
                                <v-icon>mdi-book-open-variant-outline</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                :color="hoveredItemId === item._id ? 'red-lighten-1' : 'grey'"
                                variant="plain"
                                size="24"
                                :ripple="false"
                                :loading="deletingLogId === item._id"
                                @mouseenter="hoveredItemId = item._id"
                                @mouseleave="hoveredItemId = null"
                                @click="confirmDeleteLog(item)"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <!-- 詳細資料 Dialog -->
  <v-dialog
    v-model="detailDialog"
    :class="{ 'budget-detail': selectedItem?.targetModel === 'marketingBudgets' && selectedItem?.action !== '刪除' && hasBudgetItemsChanged(selectedItem) }"
    :width="selectedItem?.targetModel === 'marketingBudgets' && selectedItem?.action === '創建' ? 1300 : (selectedItem?.targetModel === 'marketingBudgets' && selectedItem?.action !== '刪除' && hasBudgetItemsChanged(selectedItem) ? undefined : 600)"
    :data-action="selectedItem?.action"
  >
    <v-card class="pa-4 rounded-lg">
      <div class="ps-6 pt-4 pb-1 pb-sm-3 card-title">
        詳細異動內容
      </div>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作時間
                </div>
                <div class="list-content">
                  {{ formatDateTime(selectedItem?.createdAt) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作人員
                </div>
                <div class="list-content">
                  {{ formatOperator(selectedItem) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  資料類型
                </div>
                <div class="list-content">
                  {{ getModelDisplay(selectedItem?.targetModel) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作類型
                </div>
                <div class="list-content">
                  {{ selectedItem?.action }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  操作對象
                </div>
                <div class="list-content">
                  {{ formatTarget(selectedItem) }}
                </div>
              </div>
              <v-divider class="my-2" />
              <div>
                <div class="text-grey-darken-1 list-title">
                  異動內容
                </div>
                <div
                  v-if="selectedItem?.targetModel === 'marketingBudgets' && shouldShowBudgetTable && hasBudgetItemsChanged(selectedItem)"
                  class="list-content budget-content"
                >
                  <marketing-budget-change-table
                    :action="selectedItem.action"
                    :changes="selectedItem.changes"
                  />
                </div>
                <div
                  v-else-if="selectedItem?.targetModel === 'forms' && selectedItem?.action === '創建'"
                  class="list-content"
                >
                  <ul class="change-list">
                    <li>
                      {{ selectedItem?.changes?.after?.formNumber }}
                    </li>
                    <li
                      v-for="(value, key) in selectedItem?.changes?.after?.formData"
                      :key="key"
                    >
                      {{ key }}: {{ typeof value === 'object' ? JSON.stringify(value) : value }}
                    </li>
                  </ul>
                </div>
                <div
                  v-else-if="selectedItem?.targetModel === 'forms' && selectedItem?.action === '修改'"
                  class="list-content"
                >
                  <span class="text-grey-darken-2">( 修改前 )</span>
                  <ul class="change-list">
                    <li>
                      {{ selectedItem?.changes?.before?.formNumber }}
                    </li>
                    <li
                      v-for="(value, key) in selectedItem?.changes?.before?.formData"
                      :key="key"
                    >
                      {{ key }}: {{ typeof value === 'object' ? JSON.stringify(value) : value }}
                    </li>
                  </ul>
                  <v-divider class="my-2" />
                  <span class="text-grey-darken-2">( 修改後 )</span>
                  <ul class="change-list">
                    <li>
                      {{ selectedItem?.changes?.after?.formNumber }}
                    </li>
                    <li
                      v-for="(value, key) in selectedItem?.changes?.after?.formData"
                      :key="key"
                    >
                      {{ key }}: {{ typeof value === 'object' ? JSON.stringify(value) : value }}
                    </li>
                  </ul>
                </div>
                <div
                  v-else-if="formatChanges(selectedItem).length > 0"
                  class="list-content"
                >
                  <ul class="change-list">
                    <li
                      v-for="(change, index) in formatChanges(selectedItem)"
                      :key="index"
                      class="py-2"
                    >
                      {{ change }}
                    </li>
                  </ul>
                </div>
                <div v-else>
                  無異動內容
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-4">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="detailDialog = false"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 刪除確認對話框 -->
  <v-dialog
    v-model="deleteDialog"
    max-width="400"
    @click:outside="closeDeleteDialog"
    @keydown.esc="closeDeleteDialog"
  >
    <v-card class="rounded-lg">
      <div class="card-title px-6 py-3 bg-red-lighten-1 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-delete-alert
        </v-icon>
        刪除異動紀錄
        <v-spacer />
        <v-btn
          icon
          color="white"
          variant="plain"
          class="opacity-100"
          :ripple="false"
          size="20"
          @click="closeDeleteDialog"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
      <v-card-text class="px-6 pt-6 pb-3">
        <!-- 操作人員選擇 -->
        <v-autocomplete
          v-model="selectedOperatorForDelete"
          :items="deleteOperatorSuggestions"
          :loading="deleteOperatorLoading"
          label="選擇操作人員"
          return-object
          :item-props="item => ({
            key: item._id,
            title: formatUserDisplay(item),
            value: item
          })"
          variant="outlined"
          density="compact"
          clearable
          @update:search="searchOperatorsForDelete"
          @click:clear="onClearOperatorForDelete"
        >
          <template #selection="{ item }">
            {{ formatUserDisplay(item.raw) }}
          </template>
        </v-autocomplete>

        <!-- 新增確認輸入欄位 -->
        <v-text-field
          v-model="confirmOperatorName"
          label="請輸入操作人員名稱進行確認"
          :error-messages="confirmNameError"
          :disabled="!selectedOperatorForDelete"
          variant="outlined"
          density="compact"
          class="mt-4"
          clearable
          persistent-hint
          :hint="selectedOperatorForDelete ? `請輸入: ${selectedOperatorForDelete.name}` : '請先選擇操作人員'"
          @update:model-value="validateConfirmName"
        />

        <v-alert
          type="warning"
          color="red-lighten-1"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          注意：此操作將刪除該操作人員的所有異動紀錄，且不可恢復。
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn
          :size="buttonSize"
          color="grey-darken-1"
          variant="outlined"
          class="me-1"
          @click="closeDeleteDialog"
        >
          取消
        </v-btn>
        <v-btn
          :size="buttonSize"
          color="red-lighten-1"
          variant="outlined"
          :loading="isDeleting"
          :disabled="!selectedOperatorForDelete || confirmOperatorName !== selectedOperatorForDelete.name"
          @click="deleteMyLogs"
        >
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 在 template 最後添加 ConfirmDeleteDialog 組件 -->
  <ConfirmDeleteDialog
    v-model="confirmDeleteDialog.open"
    title="確認刪除異動紀錄"
    :message="`確定要刪除此筆異動紀錄嗎？此操作無法復原。<br><br>操作時間：${formatDateTime(confirmDeleteDialog.item?.createdAt)}<br>操作人員：${formatOperator(confirmDeleteDialog.item)}<br>資料類型：${getModelDisplay(confirmDeleteDialog.item?.targetModel)}`"
    :confirm-button-size="'default'"
    :cancel-button-size="'default'"
    @confirm="deleteLog"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import debounce from 'lodash/debounce'
import { definePage } from 'vue-router/auto'
import { useSnackbar } from 'vuetify-use-dialog'
import MarketingBudgetChangeTable from '@/components/MarketingBudgetChangeTable.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import {
  getFieldTranslation,
  marketingCategoryTypes,
  hardwareCategoryTypes,
  marqueeTypes,
  evaluationBatchStatusLabels,
  evaluationRecordStatusLabels,
  evaluationEvaluatorStatusLabels
} from '@/utils/auditLogTranslations'
import { usePermissionStore } from '@/stores/permission'

definePage({
  meta: {
    title: '異動紀錄 | Ystravel',
    login: true,
    permission: 'AUDIT_LOG_PAGE_READ'
  }
})

const { smAndUp, mdAndUp, lgAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const permissionStore = usePermissionStore()

// 權限映射（用於將 ObjectId 轉換為權限名稱）
const permissionMap = ref(new Map())

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// 自動完成相關
const operatorSuggestions = ref([])
const operatorLoading = ref(false)
const operatorSearchInput = ref('')

const targetSuggestions = ref([])
// const targetLoading = ref(false)
const targetSearchInput = ref('')

// 表格相關
const tableLoading = ref(false)
const tableItems = ref([])
const tableItemsLength = ref(0)

// 搜尋條件
const searchCriteria = ref({
  operatorId: null,
  targetId: null,
  action: '',
  targetModel: '',
  dateRange: [],
  quickSearch: ''
})

// Dialog 相關
const detailDialog = ref(false)
const selectedItem = ref(null)

// 選項定義
const actionOptions = [
  { title: '創建', value: '創建' },
  { title: '修改', value: '修改' },
  { title: '刪除', value: '刪除' }
]

const modelOptions = [
  { title: '全部', value: '' },
  { title: '用戶', value: 'users' },
  { title: '表單', value: 'forms' },
  { title: '表單模板', value: 'formTemplates' },
  { title: '考核表單模板', value: 'evaluationTemplates' },
  { title: '考核表單分類', value: 'evaluationTemplateCategories' },
  { title: '出勤表單模板', value: 'attendanceFormTemplates' },
  { title: '考核批次', value: 'evaluationBatches' },
  { title: '考核紀錄', value: 'evaluations' },
  { title: '出勤紀錄', value: 'attendances' },
  { title: '出勤員工紀錄', value: 'attendanceRecords' },
  { title: '行銷分類', value: 'marketingCategories' },
  { title: '行銷預算', value: 'marketingBudgets' },
  { title: '行銷實際支出', value: 'marketingExpenses' },
  { title: '硬體維修記錄', value: 'hardwareMaintenanceRecords' },
  { title: '硬體類型', value: 'hardwareCategories' },
  { title: '硬體設備', value: 'hardwareDevices' },
  { title: '員工', value: 'employees' },
  { title: '公司', value: 'companies' },
  { title: '部門', value: 'departments' },
  { title: '直客詢問紀錄', value: 'customerInquiries' },
  { title: '線別分類', value: 'lineCategories' },
  { title: '行銷美編需求申請', value: 'designRequests' },
  { title: '通知 EMAIL', value: 'notificationEmails' },
  { title: '權限', value: 'permissions' },
  { title: '角色', value: 'roles' },
  { title: '輪播圖', value: 'carousels' },
  { title: '跑馬燈', value: 'marquees' },
  { title: '公告', value: 'announcements' },
  { title: '共享資源', value: 'sharedResources' },
  { title: '廠商', value: 'manufacturers' },
  { title: '倉庫', value: 'warehouses' },
  { title: '備品', value: 'spareParts' },
  { title: '備品庫存', value: 'sparePartInventories' },
  { title: '教育訓練影片', value: 'educationTrainingVideos' },
  { title: '教育訓練影片分類', value: 'educationTrainingVideoCategories' }
]

// 表格標頭
const tableHeaders = [
  { title: '操作時間', align: 'start', sortable: true, key: 'createdAt' },
  { title: '操作人員', align: 'start', sortable: true, key: 'operator.name' },
  { title: '資料類型', align: 'start', sortable: true, key: 'targetModel' },
  { title: '操作類型', align: 'start', sortable: true, key: 'action' },
  { title: '操作對象', align: 'start', sortable: true, key: 'targetInfo.name' },
  { title: '異動內容', align: 'start', sortable: false, key: 'changes' },
  { title: '操作', align: 'center', sortable: false, key: 'actions' }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    return tableHeaders.filter(header =>
      ['createdAt', 'targetModel', 'actions'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    return tableHeaders.filter(header =>
      ['createdAt', 'operator.name', 'targetModel', 'action', 'actions'].includes(header.key)
    )
  }
  if (lgAndUp.value) {
    return tableHeaders
  }
  return tableHeaders.filter(header => header.key !== 'changes')
})

// 欄位翻譯已移至 @/utils/auditLogTranslations.js

// 格式化日期函數
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 只格式化日期部分
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

// 角色轉換
const formatRole = (role) => {
  // 如果是 null 或 undefined，表示角色已被移除
  if (role === null || role === undefined) {
    return '(無)'
  }

  // 如果是物件格式（新的 RBAC 角色）
  if (typeof role === 'object' && role !== null) {
    return role.name || role.code || '未知角色'
  }

  // 如果是數字格式（舊的角色系統）
  const roleMap = {
    0: '一般用戶',
    1: '經理',
    2: '管理者',
    3: 'IT人員',
    4: '美編人員',
    5: '行銷人員',
    6: '人資',
    7: '總管'
  }
  return roleMap[role] || role
}

// 角色陣列轉換
const formatRolesArray = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return '(無)'
  }

  return roles.map(role => formatRole(role)).join('、')
}


// 申請類型轉換
const getProductTypeText = (productType, item = null) => {
  const productTypeMap = {
    printing: '印刷相關',
    infoBookletCover: '說資封面',
    banner: '布條',
    coachSign: '車頭牌',
    seriesMap: 'Series地圖',
    seriesMapModify: '修改Series地圖',
    SPMap: 'SP地圖',
    newDMSingle: '新DM(單支)',
    newDMMultiple: '新DM(綜合)',
    modifyDM: '修改DM',
    newElectronicInfo: '電子說資',
    homepageBanner: '首頁大圖',
    coupon: '折價券/禮券',
    customerComment: '客戶評論',
    lectureEvent: '講座活動',
    hostedTour: '掛團',
    coSellingTour: '共賣掛團',
    galleryModifyRemove: '館格修改、下架'
  }

  // 如果是館格修改、下架，需要檢查具體申請的項目
  if (productType === 'galleryModifyRemove' && item && item.galleryTypes) {
    const selectedTypes = []
    const typeNameMap = {
      modify: '館格修改',
      removal: '館格下架'
    }

    if (item.galleryTypes.modify) {
      selectedTypes.push(typeNameMap.modify)
    }
    if (item.galleryTypes.removal) {
      selectedTypes.push(typeNameMap.removal)
    }

    // 如果有選擇具體項目，顯示具體項目；否則顯示「館格修改、下架」
    if (selectedTypes.length > 0) {
      return `【網站相關】 - ${selectedTypes.join('、')}`
    }
    return '【網站相關】 - 館格修改、下架'
  }

  return productTypeMap[productType] || productType
}

// 狀態轉換
const getStatusText = (status) => {
  const statusMap = {
    pending: '待處理',
    in_progress: '處理中',
    completed: '已完成',
    cancelled: '已取消',
    rejected: '已拒絕'
  }
  return statusMap[status] || status
}

const getModelDisplay = (model) => {
  const modelMap = {
    users: '用戶',
    forms: '表單',
    formTemplates: '表單模板',
    evaluationTemplates: '考核表單模板',
    evaluationTemplateCategories: '考核表單分類',
    attendanceFormTemplates: '出勤表單模板',
    evaluationBatches: '考核批次',
    evaluations: '考核紀錄',
    attendances: '出勤紀錄',
    attendanceRecords: '出勤員工紀錄',
    marketingCategories: '行銷分類',
    marketingExpenses: '行銷實際支出',
    marketingBudgets: '行銷預算',
    hardwareMaintenanceRecords: '硬體維修記錄',
    hardwareCategories: '硬體類型',
    hardwareDevices: '硬體設備',
    employees: '員工',
    companies: '公司',
    departments: '部門',
    customerInquiries: '直客詢問紀錄',
    lineCategories: '線別分類',
    designRequests: '行銷美編需求申請',
    notificationEmails: '通知 EMAIL',
    permissions: '權限',
    roles: '角色',
    carousels: '輪播圖',
    marquees: '跑馬燈',
    announcements: '公告',
    sharedResources: '共享資源',
    manufacturers: '廠商',
    warehouses: '倉庫',
    spareParts: '備品',
    sparePartInventories: '備品庫存',
    educationTrainingVideos: '教育訓練影片',
    educationTrainingVideoCategories: '教育訓練影片分類'
  }
  return modelMap[model] || model
}

const formatOperator = (item) => {
  if (!item?.operatorInfo) return '-'
  const { name, userId, adminId } = item.operatorInfo

  if (adminId) {
    return `${name} (${adminId})`
  }
  return `${name}${userId ? ` (${userId})` : ''}`
}

const formatTarget = (item) => {
  if (!item?.targetInfo && !item?.changes?.before) return '-'

  // 如果是刪除操作，從 changes.before 中獲取資料
  if (item.action === '刪除' && item.changes?.before) {
    if (item.targetModel === 'marketingBudgets') {
      const before = item.changes.before
      let year = before.year

      // 如果沒有年度，嘗試從 targetInfo.name 中解析
      if (!year && item.targetInfo?.name) {
        const yearMatch = item.targetInfo.name.match(/(\d{4})年度/)
        if (yearMatch) {
          year = yearMatch[1]
        }
      }

      const theme = before.theme?.name || item.targetInfo?.theme || '(無)'
      return `${year || '(無)'}年度 - ${theme}`
    }
    if (item.targetModel === 'hardwareCategories') {
      const { name, type } = item.changes.before
      return `${name} (${hardwareCategoryTypes[type]})`
    }
    if (item.targetModel === 'designRequests') {
      // 刪除操作時只顯示申請編號
      const info = item.targetInfo || {}
      const before = item.changes?.before || {}
      const after = item.changes?.after || {}
      const name = info.name || before.designRequestNumber || after.designRequestNumber || '-'
      // 刪除操作時只顯示申請編號
      return name
    }
    if (item.targetModel === 'notificationEmails') {
      const info = item.targetInfo || {}
      const after = item.changes?.after || {}
      const userName = info.name || (after.user && after.user.name) || '(無)'
      const userId = info.userId || (after.user && (after.user.userId || after.user.adminId)) || ''
      return `${userName}${userId ? ` (${userId})` : ''}`
    }
    if (item.targetModel === 'carousels') {
      const before = item.changes.before
      const title = before.title || '(無標題)'
      const order = before.order || 0
      const isActive = before.isActive !== undefined ? before.isActive : true
      const status = isActive ? '啟用' : '停用'
      return `${title} (排序: ${order}, ${status})`
    }
    if (item.targetModel === 'manufacturers') {
      const before = item.changes.before
      return before.name || '(無)'
    }
    if (item.targetModel === 'warehouses') {
      const before = item.changes.before
      const name = before.name || '(無)'
      const company = before.company?.name || ''
      return company ? `${name} (${company})` : name
    }
    if (item.targetModel === 'spareParts') {
      const before = item.changes.before
      const name = before.name || '(無)'
      const manufacturer = before.manufacturer?.name || ''
      return manufacturer ? `${name} (${manufacturer})` : name
    }
    if (item.targetModel === 'sparePartInventories') {
      const before = item.changes.before
      const sparePartName = before.sparePart?.name || '(無)'
      const warehouseName = before.warehouse?.name || '(無)'
      return `${sparePartName} - ${warehouseName}`
    }
    if (item.targetModel === 'educationTrainingVideos') {
      const before = item.changes.before
      const title = before.title || '(無標題)'
      return title
    }
    if (item.targetModel === 'educationTrainingVideoCategories') {
      const before = item.changes.before
      const name = before.name || '(無)'
      const isActive = before.isActive !== undefined ? before.isActive : true
      const status = isActive ? '啟用' : '停用'
      return `${name} (${status})`
    }
  }

  if (item.targetModel === 'marketingBudgets') {
    // 優先從 targetInfo 取得，如果沒有則從 changes.after 取得，最後從 changes.before 取得
    const targetInfo = item.targetInfo || {}
    const changesAfter = item.changes?.after || {}
    const changesBefore = item.changes?.before || {}

    // 嘗試從多個來源取得年度
    let year = targetInfo.year || changesAfter.year || changesBefore.year

    // 如果沒有年度，嘗試從 targetInfo.name 中解析（格式：YYYY年度 - XXX）
    if (!year && targetInfo.name) {
      const yearMatch = targetInfo.name.match(/(\d{4})年度/)
      if (yearMatch) {
        year = yearMatch[1]
      }
    }

    // 取得主題
    const theme = targetInfo.theme || changesAfter.theme?.name || changesAfter.theme || changesBefore.theme?.name || changesBefore.theme

    return `${year || '(無)'}年度 - ${theme || '(無)'}`
  }

  if (item.targetModel === 'marketingExpenses') {
    const { invoiceDate, theme } = item.targetInfo || {}
    if (invoiceDate) {
      return `${formatDate(invoiceDate)} - ${theme || '(無)'}`
    }
    return '-'
  }

  const { name, userId, formNumber } = item?.targetInfo || {}

  if (formNumber) return `${formNumber}`
  if (item.targetModel === 'marketingCategories') {
    return `${name} (${marketingCategoryTypes[item.targetInfo.type]})`
  }
  if (item.targetModel === 'hardwareCategories') {
    return `${name} (${hardwareCategoryTypes[item.targetInfo.type]})`
  }
  if (item.targetModel === 'hardwareDevices') {
    const { type } = item.targetInfo || {}
    return `${name} - ${type || '未知類型'}`
  }
  if (item.targetModel === 'designRequests') {
    // 只顯示申請編號
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    return info.name || after.designRequestNumber || '-'
  }
  if (item.targetModel === 'notificationEmails') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const userName = info.name || (after.user && after.user.name) || '(無)'
    const userId = info.userId || (after.user && (after.user.userId || after.user.adminId)) || ''
    return `${userName}${userId ? ` (${userId})` : ''}`
  }
  if (item.targetModel === 'carousels') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const title = info.name || after.title || '(無標題)'
    return title
  }
  if (item.targetModel === 'announcements') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const title = info.name || after.title || '(無標題)'
    const isPinned = (info.isPinned !== undefined ? info.isPinned : after.isPinned) ? '置頂' : '未置頂'
    const isActive = info.isActive !== undefined ? info.isActive : (after.isActive !== undefined ? after.isActive : true)
    const status = isActive ? '啟用' : '停用'
    return `${title} (${isPinned}, ${status})`
  }
  if (item.targetModel === 'sharedResources') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const name = info.name || after.name || '(未命名)'
    const type = info.type || after.type || '(類型不明)'
    const order = info.order || after.order || 0
    const isActive = info.isActive !== undefined ? info.isActive : (after.isActive !== undefined ? after.isActive : true)
    const status = isActive ? '啟用' : '停用'
    return `${name} [${type}] (排序: ${order}, ${status})`
  }
  if (item.targetModel === 'manufacturers') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const name = info.name || after.name || before.name || '(無)'
    return name
  }
  if (item.targetModel === 'warehouses') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const name = info.name || after.name || before.name || '(無)'
    const company = info.company || after.company?.name || before.company?.name || ''
    return company ? `${name} (${company})` : name
  }
  if (item.targetModel === 'spareParts') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const name = info.name || after.name || before.name || '(無)'
    const manufacturer = info.manufacturer || after.manufacturer?.name || before.manufacturer?.name || ''
    return manufacturer ? `${name} (${manufacturer})` : name
  }
  if (item.targetModel === 'sparePartInventories') {
    const info = item.targetInfo || {}
    // 優先使用 targetInfo.name（後端已經組合成完整名稱）
    if (info.name) {
      return info.name
    }
    // 如果沒有 name，則嘗試從其他欄位組合
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const sparePartName = info.sparePartName || after.sparePart?.name || before.sparePart?.name || '(無)'
    const warehouseName = info.warehouseName || after.warehouse?.name || before.warehouse?.name || '(無)'
    return `${sparePartName} - ${warehouseName}`
  }
  if (item.targetModel === 'educationTrainingVideos') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const title = info.name || after.title || '(無標題)'
    return title
  }
  if (item.targetModel === 'educationTrainingVideoCategories') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const name = info.name || after.name || before.name || '(無)'
    const isActive = info.isActive !== undefined ? info.isActive : (after.isActive !== undefined ? after.isActive : (before.isActive !== undefined ? before.isActive : true))
    const status = isActive ? '啟用' : '停用'
    return `${name} (${status})`
  }
  if (item.targetModel === 'evaluations') {
    const info = item.targetInfo || {}
    const after = item.changes?.after || {}
    const before = item.changes?.before || {}
    const yearVal = info.year ?? after.year ?? before.year
    const evaluationName = info.evaluationName
      || (typeof after.batch === 'object' && after.batch?.name)
      || (typeof before.batch === 'object' && before.batch?.name)
      || (yearVal != null ? `${yearVal}年度考核` : null)
    const evaluateeName = info.evaluateeName || after.evaluatee?.name || before.evaluatee?.name
    if (evaluationName || evaluateeName) {
      return `${evaluationName || '（未知考核）'} - ${evaluateeName || '（未知對象）'}`
    }
    if (info.name && info.name !== '考核') return info.name
    return '考核'
  }
  return `${name}${userId ? ` (${userId})` : ''}`
}

// 格式化布林值
const formatBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  return value
}

/** 考核表單「區塊」摘要（避免 [object Object]） */
const formatEvaluationPartsAuditLine = (parts) => {
  if (!Array.isArray(parts) || parts.length === 0) return '(無)'
  return parts.map((p, i) => {
    const title = p?.title || `區塊${i + 1}`
    const w = typeof p?.weight === 'number' ? `${Math.round(p.weight * 100)}%` : ''
    const qn = Array.isArray(p?.questions) ? p.questions.length : 0
    return `「${title}」加權${w}・${qn}題`
  }).join('；')
}

/** 考核表單「自評題目」摘要（避免 [] → 整段 JSON） */
/** 考核批次：自評送出紀錄（避免異動內容空白或整段 JSON） */
const formatBatchSelfAssessmentSubmissionsForAudit = (value) => {
  if (value == null) return '(無)'
  if (!Array.isArray(value)) return '(無法顯示)'
  if (value.length === 0) return '(無)'
  return value.map((sub) => {
    const scoreCount = Array.isArray(sub?.scores) ? sub.scores.length : 0
    const scorePreview = Array.isArray(sub?.scores) && sub.scores.length > 0
      ? sub.scores.map((x) => (x?.score != null ? String(x.score) : '—')).join('/')
      : '—'
    const u = sub?.user
    let who = '使用者'
    if (u && typeof u === 'object') {
      if (u.name) who = u.name
      else if (u.userId) who = String(u.userId)
      else if (u._id) who = `帳號(${String(u._id).slice(-6)})`
    } else if (u) {
      who = `帳號(${String(u).slice(-6)})`
    }
    const at = sub?.submittedAt ? formatDateTime(sub.submittedAt) : ''
    return `${who}·${scoreCount}題 [${scorePreview}]${at ? ` ·${at}` : ''}`
  }).join('；')
}

const formatSelfAssessmentQuestionsAuditLine = (questions) => {
  if (questions == null || questions === '') return '(無)'
  let arr = questions
  if (typeof questions === 'string') {
    const t = questions.trim()
    if (t === '' || t === '[]') return '(無)'
    try {
      arr = JSON.parse(questions)
    } catch {
      return t.length > 120 ? `${t.slice(0, 120)}…` : t
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) return '(無)'
  return arr.map((q, i) => {
    const title = (q?.title != null && String(q.title).trim() !== '') ? String(q.title).trim() : `題目${i + 1}`
    const nPts = Array.isArray(q?.scoringPoints)
      ? q.scoringPoints.filter((x) => x != null && String(x).trim() !== '').length
      : 0
    const crit = (q?.scoringCriteria != null ? String(q.scoringCriteria) : '').trim().replace(/\r\n/g, '\n')
    const firstLine = crit.includes('\n') ? crit.split('\n')[0] : crit
    const critShort = firstLine.length > 28 ? `${firstLine.slice(0, 28)}…` : firstLine
    let seg = `「${title}」`
    if (nPts > 0) seg += `・${nPts}個分數敘述`
    if (critShort) seg += `・標準:${critShort}`
    return seg
  }).join('；')
}

const formatEvaluationScoresAuditLine = (scores) => {
  if (!Array.isArray(scores) || scores.length === 0) return '(無)'
  const maxShow = 25
  const items = scores.slice(0, maxShow).map((s) => {
    const pi = typeof s?.partIndex === 'number' ? s.partIndex + 1 : '?'
    const qi = typeof s?.questionIndex === 'number' ? s.questionIndex + 1 : '?'
    const sc = s?.score != null ? String(s.score) : '—'
    return `區${pi}題${qi}:${sc}分`
  })
  let out = items.join('、')
  if (scores.length > maxShow) out += ` …等共${scores.length}筆`
  return out
}

const formatEvaluationEvaluatorsAuditLine = (evaluators) => {
  if (!Array.isArray(evaluators) || evaluators.length === 0) return '(無)'
  return evaluators.map((e) => {
    const un = typeof e?.user === 'object' && e.user?.name ? e.user.name : '(評核者)'
    const st = evaluationEvaluatorStatusLabels[e?.status] || e?.status || ''
    return `${un}[${st}]`
  }).join('；')
}

const formatEvaluationSpecialAchievementsAuditLine = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '(無)'
  return rows.map((r) => {
    const un = typeof r?.user === 'object' && r.user?.name ? r.user.name : '(使用者)'
    const ha = r?.hasAchievement === true ? '有' : r?.hasAchievement === false ? '無' : '—'
    const raw = r?.text ? String(r.text) : ''
    const tx = raw.length > 40 ? `${raw.slice(0, 40)}…` : raw
    return `${un}:特殊成就${ha}${tx ? `「${tx}」` : ''}`
  }).join('；')
}

/** 出勤表單模板：規則物件改為可讀中文（避免整段 JSON） */
const formatAttendanceRuleAuditSummary = (rule) => {
  if (rule == null || typeof rule !== 'object') return '(無)'
  const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v))
  // 遲到次數
  if ('pointsPerOccurrence' in rule && 'maxPoints' in rule && !('startMinutes' in rule) && !('tiers' in rule)) {
    return `每次扣${n(rule.pointsPerOccurrence)}分，上限${n(rule.maxPoints)}分`
  }
  // 遲到分鐘
  if ('startMinutes' in rule && 'minutesPerInterval' in rule) {
    return `逾${n(rule.startMinutes)}分起算，每${n(rule.minutesPerInterval)}分扣${n(rule.pointsPerInterval)}分，上限${n(rule.maxPoints)}分`
  }
  // 忘打卡
  if ('tiers' in rule && Array.isArray(rule.tiers) && rule.tiers.length > 0 && 'minCount' in rule.tiers[0]) {
    const tierStr = rule.tiers.map((t) =>
      `第${n(t.minCount)}–${n(t.maxCount)}次每次扣${n(t.pointsPerOccurrence)}分`
    ).join('；')
    const over = rule.overCount != null && rule.overCount !== ''
      ? `；超過${n(rule.overCount)}次每次扣${n(rule.overPointsPerOccurrence)}分`
      : ''
    return `${tierStr}${over}；扣分上限${n(rule.maxPoints)}分`
  }
  if ('tiers' in rule && Array.isArray(rule.tiers) && rule.tiers.length === 0) {
    const over = rule.overCount != null && rule.overCount !== ''
      ? `超過${n(rule.overCount)}次每次扣${n(rule.overPointsPerOccurrence)}分`
      : '（無級距）'
    return `${over}；扣分上限${n(rule.maxPoints)}分`
  }
  // 事假
  if ('tiers' in rule && Array.isArray(rule.tiers) && rule.tiers.length > 0 && 'minHours' in rule.tiers[0]) {
    const tierStr = rule.tiers.map((t) =>
      `${n(t.minHours)}–${n(t.maxHours)}小時扣${n(t.points)}分`
    ).join('；')
    const inc = rule.incrementalHours != null && rule.incrementalHours !== ''
      ? `；每滿${n(rule.incrementalHours)}小時加扣${n(rule.incrementalPoints)}分`
      : ''
    return `${tierStr}${inc}；扣分上限${n(rule.maxPoints)}分`
  }
  if ('tiers' in rule && Array.isArray(rule.tiers) && rule.tiers.length === 0 && 'incrementalHours' in rule) {
    const inc = rule.incrementalHours != null && rule.incrementalHours !== ''
      ? `每滿${n(rule.incrementalHours)}小時加扣${n(rule.incrementalPoints)}分`
      : '（無級距）'
    return `${inc}；扣分上限${n(rule.maxPoints)}分`
  }
  try {
    const s = JSON.stringify(rule)
    return s.length > 220 ? `${s.slice(0, 220)}…` : s
  } catch {
    return '(無法顯示)'
  }
}

const formatAttendanceFormWeightPercent = (val) => {
  if (val == null || val === '') return '(無)'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  return `${Math.round(num * 100)}%`
}

const auditLogModelKeysEvaluationAttendance = [
  'evaluationTemplates',
  'evaluations',
  'evaluationBatches',
  'attendances',
  'attendanceRecords',
  'attendanceFormTemplates',
  'evaluationTemplateCategories',
  'evaluationAttendanceWeights'
]

const formatAuditRefName = (value) => {
  if (value == null) return '(無)'
  if (typeof value === 'object' && value?.name) {
    const id = value.userId || value.adminId || ''
    return id ? `${value.name} (${id})` : value.name
  }
  return String(value)
}

/** 異動紀錄顯示視為「空白」不需列出行 */
const isAuditValueVisuallyEmpty = (value) => {
  if (value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true
  return false
}

/** 考核表單模板「創建」：只顯示實際有填的內容 */
const shouldOmitEvaluationTemplateCreateAuditField = (key, value) => {
  if (key === 'specialAchievementEnabled' && value === false) return true
  if (key === 'parts' && (!Array.isArray(value) || value.length === 0)) return true
  if (isAuditValueVisuallyEmpty(value)) return true
  return false
}

const hasBudgetItemsChanged = (item) => {
  if (!item?.changes) return false

  // 如果是創建操作，檢查是否有 items
  if (item.action === '創建') {
    return item.changes?.after?.items?.length > 0
  }

  // 檢查是否有修改預算項目
  if (!item?.changes?.changedFields) return false
  return item.changes.changedFields.some(field => field.startsWith('items'))
}

const formatChanges = (item) => {
  if (!item?.changes) return []

  // 如果是刪除操作，顯示資料已刪除
  if (item.action === '刪除') {
    return ['資料已刪除']
  }

  const changes = []

  // 處理公司地點的特殊顯示
  if (item.targetModel === 'companies' && item.changes.changedFields.includes('locations')) {
    const beforeLocations = item.changes.before.locations || []
    const afterLocations = item.changes.after.locations || []

    // 找出刪除的地點
    const deletedLocations = beforeLocations.filter(before =>
      !afterLocations.some(after => after.locationName === before.locationName)
    )
    if (deletedLocations.length > 0) {
      changes.push('刪除的地點:')
      deletedLocations.forEach(loc => {
        changes.push(` - ${loc.locationName}`)
      })
    }

    // 找出新增的地點
    const addedLocations = afterLocations.filter(after =>
      !beforeLocations.some(before => before.locationName === after.locationName)
    )
    if (addedLocations.length > 0) {
      changes.push('新增的地點:')
      addedLocations.forEach(loc => {
        changes.push(` - ${loc.locationName}`)
      })
    }

    // 找出順序變更的地點
    const commonLocations = afterLocations.filter(after =>
      beforeLocations.some(before => before.locationName === after.locationName)
    )
    const orderChanges = commonLocations.filter(after => {
      const before = beforeLocations.find(b => b.locationName === after.locationName)
      return before.order !== after.order
    })
    if (orderChanges.length > 0) {
      changes.push('順序變更:')
      orderChanges.forEach(loc => {
        const oldOrder = beforeLocations.find(b => b.locationName === loc.locationName).order + 1
        const newOrder = loc.order + 1
        changes.push(` - ${loc.locationName}: ${oldOrder} → ${newOrder}`)
      })
    }

    if (changes.length === 0) {
      changes.push('地點資料已更新')
    }

    return changes
  }

  // 處理行銷預算的特殊顯示
  if (item.targetModel === 'marketingBudgets') {
    const { changedFields = [], before = {}, after = {} } = item.changes

    // 查是否有修改預算項目
    const hasItemsChanged = changedFields.some(field => field.startsWith('items'))

    // 如果是創建操作且有項目，直接顯示查看詳細
    if (item.action === '創建' && after.items?.length > 0) {
      return ['( 請查看詳細異動內容 )']
    }

    // 檢查基本資料的修改
    if (changedFields.includes('year')) {
      changes.push(`年度: ${before.year || '(無)'} → ${after.year || '(無)'}`)
    }

    if (changedFields.includes('theme')) {
      const oldTheme = before.theme?.name || '(無)'
      const newTheme = after.theme?.name || '(無)'
      changes.push(`行銷主題: ${oldTheme} → ${newTheme}`)
    }

    if (changedFields.includes('annualTotalBudget')) {
      const oldBudget = before.annualTotalBudget?.toLocaleString() || '0'
      const newBudget = after.annualTotalBudget?.toLocaleString() || '0'
      changes.push(`年度總預算: ${oldBudget} → ${newBudget}`)
    }

    if (changedFields.includes('note')) {
      const oldNote = before.note || '(無)'
      const newNote = after.note || '(無)'
      changes.push(`備註: ${oldNote} → ${newNote}`)
    }

    // 如果有修改預算項目，在基本資料後添加提示
    if (hasItemsChanged) {
      changes.push('( 表格異動請查看詳細異動內容 )')
    }

    return changes
  }

  // 處理行銷實際支出的特殊顯示
  if (item.targetModel === 'marketingExpenses') {
    // 如果是創建操作
    if (item.action === '創建') {
      const data = item.changes.after

      // 基本資訊
      changes.push(`發票日期: ${formatDate(data.invoiceDate)}`)
      changes.push(`行銷主題: ${data.theme?.name || '(無)'}`)
      changes.push(`廣告渠道: ${data.channel?.name || '(無)'}`)
      changes.push(`平台: ${data.platform?.name || '(無)'}`)
      changes.push(`總金額: ${data.totalExpense?.toLocaleString() || 0}`)
      if (data.note) changes.push(`備註: ${data.note}`)

      // 線別資訊
      if (data.details && data.details.length > 0) {
        changes.push('線別資訊:')
        data.details.forEach(detail => {
          changes.push(` - ${detail.detail.name} : ${detail.amount?.toLocaleString() || 0}`)
        })
      }

      return changes
    }
    // 如果是修改操作
    else if (item.action === '修改') {
      const { before, after, changedFields } = item.changes

      // 建立線別對照表
      const beforeDetails = {}
      const afterDetails = {}

      if (before.details) {
        before.details.forEach(d => {
          beforeDetails[d.detail.name] = d.amount
        })
      }
      if (after.details) {
        after.details.forEach(d => {
          afterDetails[d.detail.name] = d.amount
        })
      }

      changedFields.forEach(field => {
        switch (field) {
          case 'invoiceDate':
            changes.push(`發票日期: ${formatDate(before.invoiceDate)} → ${formatDate(after.invoiceDate)}`)
            break
          case 'theme':
            changes.push(`行銷主題: ${before.theme?.name || '(無)'} → ${after.theme?.name || '(無)'}`)
            break
          case 'channel':
            changes.push(`廣告渠道: ${before.channel?.name || '(無)'} → ${after.channel?.name || '(無)'}`)
            break
          case 'platform':
            changes.push(`平台: ${before.platform?.name || '(無)'} → ${after.platform?.name || '(無)'}`)
            break
          case 'totalExpense':
            changes.push(`總金額: ${before.totalExpense?.toLocaleString() || 0} → ${after.totalExpense?.toLocaleString() || 0}`)
            break
          case 'note':
            changes.push(`備註: ${before.note || '(無)'} → ${after.note || '(無)'}`)
            break
          case 'details': {
            // 只顯示有變更的線別
            const changedLines = []
            Object.keys(beforeDetails).forEach(line => {
              if (beforeDetails[line] !== afterDetails[line]) {
                changedLines.push(`- ${line}: ${beforeDetails[line]?.toLocaleString() || 0} → ${afterDetails[line]?.toLocaleString() || 0}`)
              }
            })
            // 檢查新增的線別
            Object.keys(afterDetails).forEach(line => {
              if (!beforeDetails[line]) {
                changedLines.push(`-${line}: 0 → ${afterDetails[line]?.toLocaleString() || 0}`)
              }
            })
            if (changedLines.length > 0) {
              changes.push('線別資訊:')
              changes.push(...changedLines)
            }
            break
          }
        }
      })

      return changes
    }
  }

  // 處理創建操作
  if (item.action === '創建') {
    const after = item.changes.after || {}
    // 過濾掉不需要顯示的欄位
    const excludeFields = ['_id', 'createdAt', 'updatedAt', 'password', 'tokens', '__v']

    // 針對硬體設備的特殊處理
    if (item.targetModel === 'hardwareDevices') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate' || key === 'expiryDate') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(value)}`)
          } else if (key === 'type') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (key === 'user') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (key === 'company') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (key === 'location') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.locationName || '(無)'}`)
          } else if (key === 'expenseObject') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對硬體維修記錄的特殊處理
    if (item.targetModel === 'hardwareMaintenanceRecords') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'maintenanceDate') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(value)}`)
          } else if (key === 'hardwareCategory') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (key === 'reportUserId') {
            // 處理報修人顯示
            let reportUserName = '(無)'
            if (value) {
              if (typeof value === 'object' && value.name) {
                // 如果是 populate 後的物件
                reportUserName = value.name
              } else if (typeof value === 'string' && value.length === 24) {
                // 如果是 ObjectId 字串，顯示為 (無)
                reportUserName = '(無)'
              } else if (typeof value === 'string') {
                // 如果是字串，可能是員工姓名
                reportUserName = value
              }
            }
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${reportUserName}`)
          } else if (key === 'maintenanceContent' || key === 'maintenanceResult' || key === 'note') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對行銷美編需求申請的特殊處理
    if (item.targetModel === 'designRequests') {
      const data = after
      // 基本資訊
      changes.push(`申請編號: ${data.designRequestNumber}`)
      changes.push(`申請類型: ${getProductTypeText(data.productType, data)}`)
      changes.push(`申請人: ${data.applicant?.name || (typeof data.applicant === 'string' ? data.applicant : '(無)')}`)
      changes.push(`申請日期: ${formatDate(data.applicationDate)}`)
      changes.push(`狀態: ${getStatusText(data.status)}`)
      if (data.assignedDesigner) {
        changes.push(`處理人員: ${data.assignedDesigner.name || (typeof data.assignedDesigner === 'string' ? data.assignedDesigner : '(無)')}`)
      }
      // 印刷類型
      if (data.productType === 'printing' && data.printingTypes) {
        const selectedTypes = Object.entries(data.printingTypes)
          .filter(([, selected]) => selected)
          .map(([type]) => getProductTypeText(type))
        if (selectedTypes.length > 0) {
          changes.push(`選擇的印刷類型: ${selectedTypes.join('、')}`)
        }
        // 顯示共用欄位（行程簡稱和檔案）
        if (data.tripShortName) {
          changes.push(`行程簡稱: ${data.tripShortName}`)
        }
        // 處理檔案欄位
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          const fileNames = data.files.map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : f.originalName || '')).filter(Boolean)
          changes.push(`檔案: ${fileNames.join('、')}`)
        }
        // 展開各子類型
        if (data.infoBookletCover && data.printingTypes.infoBookletCover) {
          changes.push('說資封面資料:')
          if (data.infoBookletCover.title) changes.push(` - 標題: ${data.infoBookletCover.title}`)
          if (data.infoBookletCover.style) changes.push(` - 風格: ${data.infoBookletCover.style}`)
          if (data.infoBookletCover.imageSubject) changes.push(` - 圖片主題: ${data.infoBookletCover.imageSubject}`)
          if (data.infoBookletCover.content) changes.push(` - 內容: ${data.infoBookletCover.content}`)
          if (data.infoBookletCover.requestedByDate) changes.push(` - 希望交付日: ${formatDate(data.infoBookletCover.requestedByDate)}`)
        }
        if (data.banner && data.printingTypes.banner) {
          changes.push('布條資料:')
          if (data.banner.title) changes.push(` - 標題: ${data.banner.title}`)
          if (data.banner.style) changes.push(` - 風格: ${data.banner.style}`)
          if (data.banner.imageSubject) changes.push(` - 圖片主題: ${data.banner.imageSubject}`)
          if (data.banner.content) changes.push(` - 內容: ${data.banner.content}`)
          if (data.banner.quantity) changes.push(` - 數量: ${data.banner.quantity}`)
          if (data.banner.requestedByDate) changes.push(` - 希望交付日: ${formatDate(data.banner.requestedByDate)}`)
        }
        if (data.coachSign && data.printingTypes.coachSign) {
          changes.push('車頭牌資料:')
          if (data.coachSign.content) changes.push(` - 內容: ${data.coachSign.content}`)
          if (data.coachSign.quantity) changes.push(` - 數量: ${data.coachSign.quantity}`)
          if (typeof data.coachSign.useInfoBookletCover !== 'undefined') changes.push(` - 使用說資封面: ${formatBoolean(data.coachSign.useInfoBookletCover)}`)
        }
        if (data.otherNote && data.printingTypes.other) {
          changes.push(`其他備註: ${data.otherNote}`)
        }
      }
      // 館格修改、下架類型
      if (data.productType === 'galleryModifyRemove' && data.galleryTypes) {
        const selectedTypes = Object.entries(data.galleryTypes)
          .filter(([, selected]) => selected)
          .map(([type]) => {
            const typeNameMap = {
              modify: '館格修改',
              removal: '館格下架'
            }
            return typeNameMap[type] || type
          })
        if (selectedTypes.length > 0) {
          changes.push(`選擇的項目: ${selectedTypes.join('、')}`)
        }
        // 展開各子類型
        if (data.modify && data.galleryTypes.modify) {
          changes.push('修改資料:')
          if (data.modify.branch) changes.push(` - 館別: ${data.modify.branch}`)
          if (data.modify.groupId) changes.push(` - 團號: ${data.modify.groupId}`)
          if (data.modify.files && Array.isArray(data.modify.files) && data.modify.files.length > 0) {
            const fileNames = data.modify.files.map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : '')).filter(Boolean)
            changes.push(` - 附件: ${fileNames.join('、')}`)
          }
          if (data.modify.note) changes.push(` - 備註/說明: ${data.modify.note}`)
        }
        if (data.removal && data.galleryTypes.removal) {
          changes.push('下架資料:')
          if (data.removal.branch) changes.push(` - 館別: ${data.removal.branch}`)
          if (data.removal.groupId) changes.push(` - 團號: ${data.removal.groupId}`)
          if (data.removal.files && Array.isArray(data.removal.files) && data.removal.files.length > 0) {
            const fileNames = data.removal.files.map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : '')).filter(Boolean)
            changes.push(` - 附件: ${fileNames.join('、')}`)
          }
          if (data.removal.note) changes.push(` - 備註/說明: ${data.removal.note}`)
        }
      }
      // DM/地圖等其他類型
      if (data.productType === 'newDMSingle') {
        if (data.useQuickTemplate) changes.push(`使用快速版型: ${formatBoolean(data.useQuickTemplate)}`)
        if (data.quickTemplateNumber) changes.push(`快速版型編號: ${data.quickTemplateNumber}`)
        if (data.title) changes.push(`標題: ${data.title}`)
        if (data.subtitle) changes.push(`副標: ${data.subtitle}`)
        if (data.departureDate) changes.push(`出發日期: ${data.departureDate}`)
        if (data.tripHighlights) changes.push(`行程特色: ${data.tripHighlights}`)
        if (data.attractionImage) changes.push(`指定景點圖片: ${data.attractionImage}`)
        if (data.agentPrice) changes.push(`同業價: ${data.agentPrice.toLocaleString()}`)
        if (data.retailPrice) changes.push(`直客價: ${data.retailPrice.toLocaleString()}`)
        if (data.promotions) changes.push(`優惠: ${data.promotions}`)
        if (data.airlineHighlightNote) changes.push(`航空公司特色備註: ${data.airlineHighlightNote}`)
        if (data.useLogo) changes.push(`使用Logo: ${data.useLogo}`)
        if (data.note) changes.push(`備註: ${data.note}`)
      }
      if (data.productType === 'newDMMultiple') {
        if (data.useQuickTemplate) changes.push(`使用快速版型: ${formatBoolean(data.useQuickTemplate)}`)
        if (data.quickTemplateNumber) changes.push(`快速版型編號: ${data.quickTemplateNumber}`)
        if (data.title) changes.push(`標題: ${data.title}`)
        if (data.subtitleAndHighlights) changes.push(`副標/特色: ${data.subtitleAndHighlights}`)
        if (data.attractionImage) changes.push(`指定景點圖片: ${data.attractionImage}`)
        if (data.itinerary && data.itinerary.length > 0) {
          changes.push(`行程數量: ${data.itinerary.length} 筆`)
          // 顯示行程詳細資訊
          data.itinerary.forEach((item, index) => {
            changes.push(`行程 ${index + 1}:`)
            if (item.groupName) changes.push(` - 團體名稱: ${item.groupName}`)
            if (item.tripHighlights) changes.push(` - 行程特色: ${item.tripHighlights}`)
            if (item.departureDate) changes.push(` - 出發日期: ${item.departureDate}`)
            if (item.agentPrice) changes.push(` - 同業價: ${item.agentPrice.toLocaleString()}`)
            if (item.retailPrice) changes.push(` - 直客價: ${item.retailPrice.toLocaleString()}`)
          })
        }
        if (data.promotions) changes.push(`優惠: ${data.promotions}`)
        if (data.airlineHighlightNote) changes.push(`航空公司特色備註: ${data.airlineHighlightNote}`)
        if (data.useLogo) changes.push(`使用Logo: ${data.useLogo}`)
        if (data.note) changes.push(`備註: ${data.note}`)
      }
      if (data.productType === 'seriesMap' || data.productType === 'SPMap') {
        if (data.groupId) changes.push(`團號: ${data.groupId}`)
        if (data.requestedByDate) changes.push(`希望交付日: ${formatDate(data.requestedByDate)}`)
        if (data.note) changes.push(`備註: ${data.note}`)
      }
      // 客戶評論特殊欄位
      if (data.productType === 'customerComment') {
        if (data.customerName) changes.push(`客戶名稱: ${data.customerName}`)
        if (data.phone) changes.push(`電話: ${data.phone}`)
        if (data.address) changes.push(`地址: ${data.address}`)
        if (data.commentDate) changes.push(`評論日期: ${formatDate(data.commentDate)}`)
      }
      // 講座活動特殊欄位
      if (data.productType === 'lectureEvent') {
        if (data.lectureName) changes.push(`講座名稱: ${data.lectureName}`)
        if (data.eventDateTime) changes.push(`活動時間: ${formatDateTime(data.eventDateTime)}`)
        if (data.entryDateTime) changes.push(`入場時間: ${formatDateTime(data.entryDateTime)}`)
        if (data.location) changes.push(`地點: ${data.location}`)
        if (data.lectureDescription) changes.push(`講座敘述: ${data.lectureDescription}`)
        if (data.shortIntroduction) changes.push(`活動簡介(短): ${data.shortIntroduction}`)
        if (data.longIntroduction) changes.push(`活動簡介(長): ${data.longIntroduction}`)
        if (data.needDM !== undefined) changes.push(`是否需要做DM: ${formatBoolean(data.needDM)}`)
        if (data.dmImage) {
          const fileName = typeof data.dmImage === 'string' ? data.dmImage.split('/').pop() : ''
          changes.push(`DM圖片: ${fileName || '(無)'}`)
        }
      }
      // 掛團特殊欄位
      if (data.productType === 'hostedTour') {
        if (data.branch) changes.push(`館別: ${data.branch}`)
        if (data.groupId) changes.push(`團號: ${data.groupId}`)
        if (data.groupName) changes.push(`團名: ${data.groupName}`)
        if (data.redSubtitle) changes.push(`紅色小標: ${data.redSubtitle}`)
        if (data.specifiedImageUrl) changes.push(`指定圖片連結: ${data.specifiedImageUrl}`)
        if (data.note) changes.push(`備註: ${data.note}`)
      }
      // 共賣掛團特殊欄位
      if (data.productType === 'coSellingTour') {
        if (data.branch) changes.push(`館別: ${data.branch}`)
        if (data.travelAgency) changes.push(`旅行社: ${data.travelAgency}`)
        if (data.groupId) changes.push(`團號: ${data.groupId}`)
        if (data.groupName) changes.push(`團名: ${data.groupName}`)
        if (data.redSubtitle) changes.push(`紅色小標: ${data.redSubtitle}`)
        if (data.specifiedImageUrl) changes.push(`指定圖片連結: ${data.specifiedImageUrl}`)
        if (data.note) changes.push(`備註: ${data.note}`)
      }
      // 檔案資訊（排除印刷相關類型，因為已經在印刷相關區塊中處理了）
      if (data.productType !== 'printing') {
        const fileFields = ['files', 'referenceImage', 'images']
        fileFields.forEach(field => {
          if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
            const fileNames = data[field].map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : f.originalName || '')).filter(Boolean)
            changes.push(`${getFieldTranslation(field, item.targetModel)}: ${fileNames.join('、')}`)
          }
        })
      }
      return changes
    }

    // 針對通知 EMAIL 的特殊處理
    if (item.targetModel === 'notificationEmails') {
      const data = after
      // 基本資訊
      changes.push(`使用者: ${data.user?.name || (typeof data.user === 'string' ? data.user : '(無)')}`)
      if (data.user?.userId || data.user?.adminId) {
        changes.push(`使用者編號: ${data.user.userId || data.user.adminId}`)
      }
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        const categoryTexts = data.categories.map(cat => {
          const categoryMap = {
            printing: '印刷相關',
            map: '地圖',
            dm: 'DM',
            electronic: '電子說資',
            itRelated: 'IT相關',
            website: '網站相關'
          }
          return categoryMap[cat] || cat
        })
        changes.push(`${getFieldTranslation('categories', item.targetModel)}: ${categoryTexts.join('、')}`)
      }
      if (data.note) changes.push(`備註: ${data.note}`)
      return changes
    }

    // 針對廠商的特殊處理
    if (item.targetModel === 'manufacturers') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對倉庫的特殊處理
    if (item.targetModel === 'warehouses') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'company') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對備品的特殊處理
    if (item.targetModel === 'spareParts') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'manufacturer') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
          } else if (key === 'warehouses') {
            if (Array.isArray(value) && value.length > 0) {
              const warehouseNames = value.map(w => w?.name || w || '(無)').filter(Boolean)
              changes.push(`${getFieldTranslation(key, item.targetModel)}: ${warehouseNames.join('、') || '(無)'}`)
            } else {
              changes.push(`${getFieldTranslation(key, item.targetModel)}: (無)`)
            }
          } else if (key === 'cost' || key === 'price') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.toLocaleString() || 0}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對備品庫存的特殊處理
    if (item.targetModel === 'sparePartInventories') {
      const data = after
      if (data.sparePart?.name) {
        changes.push(`備品: ${data.sparePart.name}`)
      }
      if (data.warehouse?.name) {
        changes.push(`倉庫: ${data.warehouse.name}`)
      }
      if (data.quantity !== undefined) {
        changes.push(`數量: ${data.quantity.toLocaleString() || 0}`)
      }
      if (data.quantityChange !== undefined) {
        const changeText = data.quantityChange > 0 ? `+${data.quantityChange.toLocaleString()}` : data.quantityChange.toLocaleString()
        changes.push(`數量變更: ${changeText}`)
      }
      if (data.note) {
        changes.push(`備註: ${data.note}`)
      }
      return changes
    }

    // 考核、出勤相關（創建）
    if (auditLogModelKeysEvaluationAttendance.includes(item.targetModel)) {
      Object.entries(after).forEach(([key, value]) => {
        if (excludeFields.includes(key) || !getFieldTranslation(key, item.targetModel)) return
        if (item.targetModel === 'evaluationTemplates' && item.action === '創建' &&
          shouldOmitEvaluationTemplateCreateAuditField(key, value)) return
        if (key === 'dueDate' || key === 'startDate') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value ? formatDate(value) : '(無)'}`)
        } else if (key === 'filledAt') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value ? formatDateTime(value) : '(無)'}`)
        } else if (key === 'status' && item.targetModel === 'evaluationBatches') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${evaluationBatchStatusLabels[value] || value || '(無)'}`)
        } else if (key === 'status' && item.targetModel === 'evaluations') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${evaluationRecordStatusLabels[value] || value || '(無)'}`)
        } else if (key === 'parts' && item.targetModel === 'evaluationTemplates') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationPartsAuditLine(value)}`)
        } else if (key === 'selfAssessmentQuestions' && item.targetModel === 'evaluationTemplates') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatSelfAssessmentQuestionsAuditLine(value)}`)
        } else if (key === 'selfAssessmentSubmissions' && item.targetModel === 'evaluationBatches') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBatchSelfAssessmentSubmissionsForAudit(value)}`)
        } else if (key === 'scores' && item.targetModel === 'evaluations') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationScoresAuditLine(value)}`)
        } else if (key === 'evaluators' && item.targetModel === 'evaluations') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationEvaluatorsAuditLine(value)}`)
        } else if (key === 'specialAchievements' && item.targetModel === 'evaluations') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationSpecialAchievementsAuditLine(value)}`)
        } else if (['template', 'evaluatee', 'batch', 'category', 'attendance', 'employee', 'attendanceFormTemplate', 'createdBy'].includes(key)) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAuditRefName(value)}`)
        } else if (item.targetModel === 'attendanceFormTemplates' && key === 'weight') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAttendanceFormWeightPercent(value)}`)
        } else if (item.targetModel === 'attendanceFormTemplates' && ['tardyCount', 'tardyMinutes', 'forgotPunch', 'personalLeave'].includes(key)) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAttendanceRuleAuditSummary(value)}`)
        } else if (typeof value === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
        } else if (value !== null && typeof value === 'object') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAttendanceRuleAuditSummary(value)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value ?? '(無)'}`)
        }
      })
      return changes
    }

    // 針對教育訓練影片的特殊處理
    if (item.targetModel === 'educationTrainingVideos') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'category') {
            // 處理分類欄位
            let categoryName = '(無)'
            if (value) {
              if (typeof value === 'object' && value.name) {
                categoryName = value.name
              } else if (typeof value === 'string' && value.length === 24) {
                // ObjectId 格式，後端應該已經轉換，但如果沒有則顯示 (無)
                categoryName = '(無)'
              } else if (typeof value === 'string') {
                // 如果已經是字串（分類名稱），直接使用
                categoryName = value
              }
            }
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${categoryName}`)
          } else if (key === 'creator') {
            // 處理建立者欄位（物件類型）
            const creatorName = value?.name || '(無)'
            const creatorId = value?.userId || value?.adminId || value?.employeeCode || ''
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${creatorName}${creatorId ? ` (${creatorId})` : ''}`)
          } else if (key === 'order') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || 0}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對教育訓練影片分類的特殊處理
    if (item.targetModel === 'educationTrainingVideoCategories') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
          if (key === 'order') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || 0}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    Object.entries(after).forEach(([key, value]) => {
      if (!excludeFields.includes(key) && getFieldTranslation(key, item.targetModel)) {
        if (key === 'role') {
          // 處理新的角色格式（物件）或舊的角色格式（數字）
          const roleText = formatRole(value)
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${roleText}`)
        } else if (key === 'roles') {
          // 處理角色陣列
          const rolesText = formatRolesArray(value)
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${rolesText}`)
        } else if (key === 'extraPermissions' || key === 'deniedPermissions') {
          // 處理額外權限和拒絕權限陣列
          let perms = []
          if (value && Array.isArray(value)) {
            perms = value.map(perm => {
              // 優先處理已有名稱的物件
              if (typeof perm === 'object' && perm.name) {
                return perm.name
              } else if (typeof perm === 'object' && perm.code) {
                return perm.code
              } else {
                // 嘗試從權限映射中查找名稱
                const name = getPermissionName(perm)
                return name
              }
            }).filter(Boolean).sort()
          }
          const display = perms.length > 0 ? perms.join('、') : '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${display}`)
        } else if (key === 'salesPerson') {
          const name = value?.name || value?.nickname || '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${name}`)
        } else if (typeof value === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(value)}`)
        } else if (key === 'type') {
          if (item.targetModel === 'marketingCategories') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${marketingCategoryTypes[value] || '(無)'}`)
          } else if (item.targetModel === 'hardwareCategories') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${hardwareCategoryTypes[value] || '(無)'}`)
          } else if (item.targetModel === 'marquees') {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${marqueeTypes[value] || value || '(無)'}`)
          }
        } else if (key === 'progressNotes') {
          // 處理 progressNotes 欄位
          if (Array.isArray(value) && value.length > 0) {
            const lastNote = value[value.length - 1]
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${lastNote.content || '(無)'}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: 無`)
          }
        } else if (key === 'inquiryDate' || key === 'maintenanceDate' || key === 'hireDate' || key === 'resignationDate' || key === 'unpaidLeaveStartDate' || key === 'reinstatementDate' || key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate' || key === 'expiryDate') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(value)}`)
        } else if (key === 'company' && (item.targetModel === 'employees' || item.targetModel === 'departments' || item.targetModel === 'customerInquiries')) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
        } else if (key === 'department') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value?.name || '(無)'}`)
        } else if (key === 'creator') {
          // 處理建立者欄位（物件類型）
          const creatorName = value?.name || '(無)'
          const creatorId = value?.userId || value?.adminId || value?.employeeCode || ''
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${creatorName}${creatorId ? ` (${creatorId})` : ''}`)
        } else if (key === 'attachments' && item.targetModel === 'announcements') {
          // 處理公告附件欄位
          if (Array.isArray(value) && value.length > 0) {
            const fileNames = value.map(f => {
              if (typeof f === 'string') {
                return f.split('/').pop()
              } else if (typeof f === 'object' && f.originalName) {
                return f.originalName
              } else if (typeof f === 'object' && f.filename) {
                return f.filename
              }
              return ''
            }).filter(Boolean)
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${fileNames.join('、')}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: (無)`)
          }
        } else if ((key === 'startDate' || key === 'endDate') && item.targetModel === 'announcements') {
          // 處理公告的開始時間和結束時間（需要顯示日期+時間）
          const dateTimeStr = value ? formatDateTime(value) : '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${dateTimeStr}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${value || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理修改操作
  const { before = {}, after = {}, changedFields = [] } = item.changes

  // 針對硬體設備的特殊處理
  if (item.targetModel === 'hardwareDevices') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]

        if (key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate' || key === 'expiryDate') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
        } else if (key === 'type') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'user') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'company') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'location') {
          const oldLocationName = oldValue === null ? '(無)' : (oldValue?.locationName || '2F')
          const newLocationName = newValue === null ? '(無)' : (newValue?.locationName || '2F')
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldLocationName} → ${newLocationName}`)
        } else if (key === 'expenseObject') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理行銷美編需求申請的修改操作（優先處理）
  if (item.targetModel === 'designRequests' && item.action === '修改') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]
        if (key === 'status') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${getStatusText(oldValue)} → ${getStatusText(newValue)}`)
        } else if (key === 'productType') {
          const oldItem = { productType: oldValue, ...(oldValue === 'printing' ? { printingTypes: before.printingTypes } : {}), ...(oldValue === 'galleryModifyRemove' ? { galleryTypes: before.galleryTypes } : {}) }
          const newItem = { productType: newValue, ...(newValue === 'printing' ? { printingTypes: after.printingTypes } : {}), ...(newValue === 'galleryModifyRemove' ? { galleryTypes: after.galleryTypes } : {}) }
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${getProductTypeText(oldValue, oldItem)} → ${getProductTypeText(newValue, newItem)}`)
        } else if (key === 'applicationDate' || key === 'requestedByDate' || key === 'expiryDate' || key === 'commentDate' || key === 'giftSentDate') {
          const oldDateStr = formatDate(oldValue)
          const newDateStr = formatDate(newValue)
          // 只有當值實際改變時才記錄（避免 "- → -" 的情況）
          if (oldDateStr !== newDateStr) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDateStr} → ${newDateStr}`)
          }
        } else if (key === 'eventDateTime' || key === 'entryDateTime') {
          // 講座活動的日期時間欄位，使用 formatDateTime 顯示完整時間
          const oldDateTimeStr = oldValue ? formatDateTime(oldValue) : '(無)'
          const newDateTimeStr = newValue ? formatDateTime(newValue) : '(無)'
          // 只有當值實際改變時才記錄
          if (oldDateTimeStr !== newDateTimeStr) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDateTimeStr} → ${newDateTimeStr}`)
          }
        } else if (key === 'applicant' || key === 'assignedDesigner' || key === 'reviewer' || key === 'sender') {
          // 處理申請人、處理人員、審核者、寄出者的顯示
          let oldName = '(無)'
          let newName = '(無)'

          // 處理舊值
          if (oldValue) {
            if (typeof oldValue === 'object' && oldValue.name) {
              const userId = oldValue.userId || oldValue.adminId || ''
              oldName = userId ? `${oldValue.name} (${userId})` : oldValue.name
            } else if (typeof oldValue === 'string' && oldValue.length === 24) {
              // 如果是 ObjectId 格式的字串，顯示為 (無)
              oldName = '(無)'
            } else if (typeof oldValue === 'string') {
              oldName = oldValue
            }
          }

          // 處理新值
          if (newValue) {
            if (typeof newValue === 'object' && newValue.name) {
              const userId = newValue.userId || newValue.adminId || ''
              newName = userId ? `${newValue.name} (${userId})` : newValue.name
            } else if (typeof newValue === 'string' && newValue.length === 24) {
              // 如果是 ObjectId 格式的字串，顯示為 (無)
              newName = '(無)'
            } else if (typeof newValue === 'string') {
              newName = newValue
            }
          }

          // 只有當值實際改變時才記錄
          if (oldName !== newName) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldName} → ${newName}`)
          }
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          const oldBool = formatBoolean(oldValue)
          const newBool = formatBoolean(newValue)
          // 只有當值實際改變時才記錄
          if (oldBool !== newBool) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldBool} → ${newBool}`)
          }
        } else if (key === 'agentPrice' || key === 'retailPrice' || key === 'quantity' || key === 'cost') {
          const oldNum = oldValue?.toLocaleString() || '(無)'
          const newNum = newValue?.toLocaleString() || '(無)'
          // 只有當值實際改變時才記錄
          if (oldNum !== newNum) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldNum} → ${newNum}`)
          }
        } else if (key === 'printingTypes') {
          // 顯示印刷類型異動
          const oldTypes = oldValue ? Object.entries(oldValue).filter(([, v]) => v).map(([k]) => getProductTypeText(k)) : []
          const newTypes = newValue ? Object.entries(newValue).filter(([, v]) => v).map(([k]) => getProductTypeText(k)) : []
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldTypes.join('、') || '(無)'} → ${newTypes.join('、') || '(無)'}`)
        } else if (key === 'galleryTypes') {
          // 顯示館格類型異動
          const typeNameMap = {
            modify: '館格修改',
            removal: '館格下架'
          }
          const oldTypes = oldValue ? Object.entries(oldValue).filter(([, v]) => v).map(([k]) => typeNameMap[k] || k) : []
          const newTypes = newValue ? Object.entries(newValue).filter(([, v]) => v).map(([k]) => typeNameMap[k] || k) : []
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldTypes.join('、') || '(無)'} → ${newTypes.join('、') || '(無)'}`)
        } else if (key === 'files' || key === 'referenceImage' || key === 'images') {
          // 顯示檔案異動
          const oldFiles = Array.isArray(oldValue) ? oldValue.map(f => typeof f === 'string' ? f.split('/').pop() : '').filter(Boolean) : []
          const newFiles = Array.isArray(newValue) ? newValue.map(f => typeof f === 'string' ? f.split('/').pop() : '').filter(Boolean) : []
          const oldFilesStr = oldFiles.join('、') || '(無)'
          const newFilesStr = newFiles.join('、') || '(無)'
          // 只有當值實際改變時才記錄
          if (oldFilesStr !== newFilesStr) {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldFilesStr} → ${newFilesStr}`)
          }
        } else if (key === 'itinerary') {
          // 處理行程陣列異動
          if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            const maxLength = Math.max(oldValue.length, newValue.length)
            for (let i = 0; i < maxLength; i++) {
              const oldItem = oldValue[i] || {}
              const newItem = newValue[i] || {}

              // 檢查該行程項目是否有變更
              const itemChanged = Object.keys({ ...oldItem, ...newItem }).some(subKey => {
                if (subKey === '_id') return false // 忽略 _id 欄位
                return oldItem[subKey] !== newItem[subKey]
              })

              if (itemChanged) {
                // 顯示行程項目的變更
                const itemChanges = []
                Object.keys({ ...oldItem, ...newItem }).forEach(subKey => {
                  if (subKey === '_id') return // 忽略 _id 欄位
                  const oldSub = oldItem[subKey]
                  const newSub = newItem[subKey]
                  if (oldSub !== newSub) {
                    const subKeyLabel = getFieldTranslation(subKey, item.targetModel)
                    if (!subKeyLabel) return // 如果沒有翻譯，跳過此欄位
                    if (subKey === 'agentPrice' || subKey === 'retailPrice') {
                      itemChanges.push(`${subKeyLabel}: ${oldSub?.toLocaleString() || '(無)'} → ${newSub?.toLocaleString() || '(無)'}`)
                    } else {
                      itemChanges.push(`${subKeyLabel}: ${oldSub || '(無)'} → ${newSub || '(無)'}`)
                    }
                  }
                })

                if (itemChanges.length > 0) {
                  changes.push(`行程-${i + 1}: ${itemChanges.join(', ')}`)
                }
              }
            }
          } else {
            // 如果其中一個不是陣列，顯示整體變更
            const fieldLabel = getFieldTranslation(key, item.targetModel)
            if (fieldLabel) {
              const oldText = Array.isArray(oldValue) ? `${oldValue.length} 筆行程` : '(無)'
              const newText = Array.isArray(newValue) ? `${newValue.length} 筆行程` : '(無)'
              changes.push(`${fieldLabel}: ${oldText} → ${newText}`)
            }
          }
        } else if (key === 'progressHistory') {
          // 處理進度歷史陣列異動
          if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            // 只顯示新增的歷史記錄
            const newItems = newValue.slice(oldValue.length)
            if (newItems.length > 0) {
              changes.push(`${getFieldTranslation(key, item.targetModel)}: 新增 ${newItems.length} 筆記錄`)
              newItems.forEach((historyItem, index) => {
                const statusText = getStatusText(historyItem.status)
                let comment = historyItem.comment || '(無備註)'
                const updatedByName = historyItem.updatedBy?.name || '(無)'

                // 處理 comment 中的 ObjectId，將其替換為處理人員名稱
                // ObjectId 格式：24 個字元的十六進制字串
                const objectIdPattern = /[0-9a-fA-F]{24}/g
                const objectIds = comment.match(objectIdPattern)
                if (objectIds && objectIds.length > 0 && updatedByName !== '(無)') {
                  // 如果有 updatedBy 的名稱，使用它來替換 ObjectId
                  objectIds.forEach(id => {
                    comment = comment.replace(id, updatedByName)
                  })
                }

                // 處理 [object Object] 的情況
                if (comment.includes('[object Object]') && updatedByName !== '(無)') {
                  comment = comment.replace(/\[object Object\]/g, updatedByName)
                }

                // 如果 comment 中已經包含 updatedByName，就不需要在後面再加一次
                const shouldShowUpdatedBy = updatedByName !== '(無)' && !comment.includes(updatedByName)
                const displayText = shouldShowUpdatedBy
                  ? `  - 記錄 ${oldValue.length + index + 1}: ${statusText} - ${comment} (${updatedByName})`
                  : `  - 記錄 ${oldValue.length + index + 1}: ${statusText} - ${comment}`

                changes.push(displayText)
              })
            } else {
              // 如果沒有新增，顯示數量變更
              const oldCount = oldValue.length
              const newCount = newValue.length
              if (oldCount !== newCount) {
                changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldCount} 筆 → ${newCount} 筆`)
              }
            }
          } else {
            // 如果其中一個不是陣列，顯示整體變更
            const fieldLabel = getFieldTranslation(key, item.targetModel)
            if (fieldLabel) {
              const oldText = Array.isArray(oldValue) ? `${oldValue.length} 筆記錄` : '(無)'
              const newText = Array.isArray(newValue) ? `${newValue.length} 筆記錄` : '(無)'
              changes.push(`${fieldLabel}: ${oldText} → ${newText}`)
            }
          }
        } else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue && newValue) {
          // 巢狀物件（如 infoBookletCover、banner、coachSign、modify、removal）
          const subKeys = Object.keys({ ...oldValue, ...newValue })
          let hasChanges = false

          // 特殊處理：為 modify 和 removal 提供預設標籤
          const getParentLabel = (parentKey) => {
            const label = getFieldTranslation(parentKey, item.targetModel)
            if (label) return label
            // 如果沒有翻譯，使用預設標籤
            if (parentKey === 'modify') return '修改'
            if (parentKey === 'removal') return '下架'
            if (parentKey === 'infoBookletCover') return '說資封面'
            if (parentKey === 'banner') return '布條'
            if (parentKey === 'coachSign') return '車頭牌'
            return parentKey
          }

          subKeys.forEach(subKey => {
            const oldSub = oldValue[subKey]
            const newSub = newValue[subKey]

            // 深度比較物件和陣列
            let isDifferent = false
            if (Array.isArray(oldSub) && Array.isArray(newSub)) {
              isDifferent = JSON.stringify(oldSub) !== JSON.stringify(newSub)
            } else if (typeof oldSub === 'object' && typeof newSub === 'object' && oldSub && newSub) {
              isDifferent = JSON.stringify(oldSub) !== JSON.stringify(newSub)
            } else {
              isDifferent = oldSub !== newSub
            }

            if (isDifferent) {
              const subKeyLabel = getFieldTranslation(subKey, item.targetModel) || subKey
              const parentKeyLabel = getParentLabel(key)
              hasChanges = true
              if (subKey === 'requestedByDate') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${formatDate(oldSub)} → ${formatDate(newSub)}`)
              } else if (subKey === 'quantity' || subKey === 'agentPrice' || subKey === 'retailPrice') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${oldSub?.toLocaleString() || '(無)'} → ${newSub?.toLocaleString() || '(無)'}`)
              } else if (subKey === 'files') {
                // 處理檔案欄位（館格修改、下架的附件）
                const oldFiles = Array.isArray(oldSub) ? oldSub.map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : '')).filter(Boolean) : []
                const newFiles = Array.isArray(newSub) ? newSub.map(f => typeof f === 'string' ? f.split('/').pop() : (f.url ? f.url.split('/').pop() : '')).filter(Boolean) : []
                const oldFilesStr = oldFiles.join('、') || '(無)'
                const newFilesStr = newFiles.join('、') || '(無)'
                if (oldFilesStr !== newFilesStr) {
                  changes.push(`${parentKeyLabel}-${subKeyLabel}: ${oldFilesStr} → ${newFilesStr}`)
                }
              } else if (typeof oldSub === 'boolean' || typeof newSub === 'boolean') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${formatBoolean(oldSub)} → ${formatBoolean(newSub)}`)
              } else {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${oldSub || '(無)'} → ${newSub || '(無)'}`)
              }
            }
          })

          // 如果沒有具體的子欄位變更，但有整體物件變更，顯示為新增或移除
          // 但需要確認是否真的有實際變更（避免因為屬性順序不同而誤判）
          if (!hasChanges) {
            // 深度比較物件的實際內容
            const oldKeys = Object.keys(oldValue).sort()
            const newKeys = Object.keys(newValue).sort()
            let hasRealChanges = false

            if (oldKeys.length !== newKeys.length) {
              hasRealChanges = true
            } else {
              // 比較每個鍵的值
              for (const subKey of oldKeys) {
                const oldSub = oldValue[subKey]
                const newSub = newValue[subKey]

                // 處理日期
                if (subKey === 'requestedByDate') {
                  const oldDate = oldSub ? new Date(oldSub).getTime() : null
                  const newDate = newSub ? new Date(newSub).getTime() : null
                  if (oldDate !== newDate) {
                    hasRealChanges = true
                    break
                  }
                } else if (Array.isArray(oldSub) && Array.isArray(newSub)) {
                  if (JSON.stringify(oldSub) !== JSON.stringify(newSub)) {
                    hasRealChanges = true
                    break
                  }
                } else if (typeof oldSub === 'object' && typeof newSub === 'object' && oldSub && newSub) {
                  if (JSON.stringify(oldSub) !== JSON.stringify(newSub)) {
                    hasRealChanges = true
                    break
                  }
                } else {
                  if (oldSub !== newSub) {
                    hasRealChanges = true
                    break
                  }
                }
              }
            }

            // 只有在真的有實際變更時，才顯示
            if (hasRealChanges) {
              const parentKeyLabel = getParentLabel(key)
              if (parentKeyLabel) {
                const oldText = Object.keys(oldValue).length > 0 ? '有資料' : '(無)'
                const newText = Object.keys(newValue).length > 0 ? '有資料' : '(無)'
                changes.push(`${parentKeyLabel}: ${oldText} → ${newText}`)
              }
            }
          }
        } else if ((oldValue && typeof oldValue === 'object') || (newValue && typeof newValue === 'object')) {
          // 處理一個是物件，另一個不是物件的情況
          const parentKeyLabel = getFieldTranslation(key, item.targetModel)
          if (parentKeyLabel) {
            const oldText = oldValue && typeof oldValue === 'object' ? '有資料' : (oldValue || '(無)')
            const newText = newValue && typeof newValue === 'object' ? '有資料' : (newValue || '(無)')
            changes.push(`${parentKeyLabel}: ${oldText} → ${newText}`)
          }
        } else {
          // 處理一般欄位（包括 note）
          const fieldLabel = getFieldTranslation(key, item.targetModel)
          if (fieldLabel) {
            const oldDisplayValue = oldValue || '(無)'
            const newDisplayValue = newValue || '(無)'
            // 只有當值實際改變時才記錄
            if (oldDisplayValue !== newDisplayValue) {
              changes.push(`${fieldLabel}: ${oldDisplayValue} → ${newDisplayValue}`)
            }
          }
        }
      }
    })
    return changes
  }

  // 處理通知 EMAIL 的修改操作
  if (item.targetModel === 'notificationEmails' && item.action === '修改') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]

        if (key === 'user') {
          const oldUserName = oldValue?.name || '(無)'
          const newUserName = newValue?.name || '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldUserName} → ${newUserName}`)
        } else if (key === 'categories') {
          const categoryMap = {
            printing: '印刷相關',
            map: '地圖',
            dm: 'DM',
            electronic: '電子說資',
            itRelated: 'IT相關',
            website: '網站相關'
          }
          const oldCategories = Array.isArray(oldValue) ? oldValue.map(cat => categoryMap[cat] || cat) : []
          const newCategories = Array.isArray(newValue) ? newValue.map(cat => categoryMap[cat] || cat) : []
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldCategories.join('、') || '(無)'} → ${newCategories.join('、') || '(無)'}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理 customerInquiries 的修改操作
  if (item.targetModel === 'customerInquiries' && item.action === '修改') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]

        // 跳過 updatedAt，因為這是自動更新的時間戳
        if (key === 'updatedAt') {
          return
        }

        // 檢查值是否真的有意義的變更
        const oldDisplayValue = oldValue || '(無)'
        const newDisplayValue = newValue || '(無)'

        // 如果兩個值都是 '(無)' 或都是空字串，則跳過
        if ((oldDisplayValue === '(無)' && newDisplayValue === '(無)') ||
            (oldDisplayValue === '' && newDisplayValue === '')) {
          return
        }

        if (key === 'customerTitle') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplayValue} → ${newDisplayValue}`)
        } else if (key === 'inquiryResult') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplayValue} → ${newDisplayValue}`)
        } else if (key === 'inquiryDate') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
        } else if (key === 'salesPerson') {
          const oldName = oldValue?.name || oldValue?.nickname || '(無)'
          const newName = newValue?.name || newValue?.nickname || '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldName} → ${newName}`)
        } else if (key === 'company') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'progressNotes') {
          // 處理 progressNotes 欄位
          if (Array.isArray(newValue)) {
            const newLast = newValue[newValue.length - 1]
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${newLast ? newLast.content : '無'}`)
          } else {
            changes.push(`${getFieldTranslation(key, item.targetModel)}: ${newValue || '(無)'}`)
          }
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplayValue} → ${newDisplayValue}`)
        }
      }
    })
    return changes
  }

  // 針對廠商的修改操作處理
  if (item.targetModel === 'manufacturers') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]
        if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 針對倉庫的修改操作處理
  if (item.targetModel === 'warehouses') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]
        if (key === 'company') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 針對備品的修改操作處理
  if (item.targetModel === 'spareParts') {
    changedFields.forEach(key => {
      if (getFieldTranslation(key, item.targetModel)) {
        const oldValue = before[key]
        const newValue = after[key]
        if (key === 'manufacturer') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'warehouses') {
          const oldNames = Array.isArray(oldValue) ? oldValue.map(w => w?.name || w || '(無)').filter(Boolean).join('、') : '(無)'
          const newNames = Array.isArray(newValue) ? newValue.map(w => w?.name || w || '(無)').filter(Boolean).join('、') : '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldNames} → ${newNames}`)
        } else if (key === 'cost' || key === 'price') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.toLocaleString() || 0} → ${newValue?.toLocaleString() || 0}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 針對備品庫存的修改操作處理
  if (item.targetModel === 'sparePartInventories') {
    changedFields.forEach(key => {
      if (key === 'quantity') {
        const oldQty = before[key] || 0
        const newQty = after[key] || 0
        const quantityChange = newQty - oldQty
        changes.push(`數量: ${oldQty.toLocaleString()} → ${newQty.toLocaleString()}`)
        if (quantityChange !== 0) {
          const changeText = quantityChange > 0 ? `+${quantityChange.toLocaleString()}` : quantityChange.toLocaleString()
          changes.push(`數量變更: ${changeText}`)
        }
      } else if (key === 'sparePart') {
        const oldName = before[key]?.name || '(無)'
        const newName = after[key]?.name || '(無)'
        changes.push(`備品: ${oldName} → ${newName}`)
      } else if (key === 'warehouse') {
        const oldName = before[key]?.name || '(無)'
        const newName = after[key]?.name || '(無)'
        changes.push(`倉庫: ${oldName} → ${newName}`)
      } else if (key === 'note') {
        changes.push(`備註: ${before[key] || '(無)'} → ${after[key] || '(無)'}`)
      }
    })
    return changes
  }

  // 考核、出勤相關（修改）
  if (auditLogModelKeysEvaluationAttendance.includes(item.targetModel) && item.action === '修改') {
    changedFields.forEach(key => {
      if (!getFieldTranslation(key, item.targetModel)) return
      const oldValue = before[key]
      const newValue = after[key]
      if (key === 'updatedAt' || key === 'createdAt') {
        const o = oldValue ? formatDateTime(oldValue) : '(無)'
        const n = newValue ? formatDateTime(newValue) : '(無)'
        if (o !== n) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        }
        return
      }
      if (key === 'dueDate' || key === 'startDate') {
        const o = oldValue ? formatDate(oldValue) : '(無)'
        const n = newValue ? formatDate(newValue) : '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        return
      }
      if (key === 'filledAt') {
        const o = oldValue ? formatDateTime(oldValue) : '(無)'
        const n = newValue ? formatDateTime(newValue) : '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        return
      }
      if (item.targetModel === 'evaluationBatches' && key === 'status') {
        const o = evaluationBatchStatusLabels[oldValue] ?? oldValue ?? '(無)'
        const n = evaluationBatchStatusLabels[newValue] ?? newValue ?? '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        return
      }
      if (item.targetModel === 'evaluationBatches' && key === 'selfAssessmentSubmissions') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBatchSelfAssessmentSubmissionsForAudit(oldValue)} → ${formatBatchSelfAssessmentSubmissionsForAudit(newValue)}`)
        return
      }
      if (item.targetModel === 'evaluations' && key === 'status') {
        const o = evaluationRecordStatusLabels[oldValue] ?? oldValue ?? '(無)'
        const n = evaluationRecordStatusLabels[newValue] ?? newValue ?? '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        return
      }
      if (item.targetModel === 'evaluationTemplates' && key === 'parts') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationPartsAuditLine(oldValue)} → ${formatEvaluationPartsAuditLine(newValue)}`)
        return
      }
      if (item.targetModel === 'evaluationTemplates' && key === 'selfAssessmentQuestions') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatSelfAssessmentQuestionsAuditLine(oldValue)} → ${formatSelfAssessmentQuestionsAuditLine(newValue)}`)
        return
      }
      if (item.targetModel === 'evaluations' && key === 'scores') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationScoresAuditLine(oldValue)} → ${formatEvaluationScoresAuditLine(newValue)}`)
        return
      }
      if (item.targetModel === 'evaluations' && key === 'evaluators') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationEvaluatorsAuditLine(oldValue)} → ${formatEvaluationEvaluatorsAuditLine(newValue)}`)
        return
      }
      if (item.targetModel === 'evaluations' && key === 'specialAchievements') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatEvaluationSpecialAchievementsAuditLine(oldValue)} → ${formatEvaluationSpecialAchievementsAuditLine(newValue)}`)
        return
      }
      if (['template', 'evaluatee', 'batch', 'category', 'attendance', 'employee', 'attendanceFormTemplate', 'createdBy'].includes(key)) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAuditRefName(oldValue)} → ${formatAuditRefName(newValue)}`)
        return
      }
      if (item.targetModel === 'attendanceFormTemplates' && key === 'weight') {
        const o = formatAttendanceFormWeightPercent(oldValue)
        const n = formatAttendanceFormWeightPercent(newValue)
        if (o !== n) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${o} → ${n}`)
        }
        return
      }
      if (item.targetModel === 'attendanceFormTemplates' && ['tardyCount', 'tardyMinutes', 'forgotPunch', 'personalLeave'].includes(key)) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAttendanceRuleAuditSummary(oldValue)} → ${formatAttendanceRuleAuditSummary(newValue)}`)
        return
      }
      if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        return
      }
      if ((oldValue !== null && typeof oldValue === 'object') || (newValue !== null && typeof newValue === 'object') || Array.isArray(oldValue) || Array.isArray(newValue)) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatAttendanceRuleAuditSummary(oldValue)} → ${formatAttendanceRuleAuditSummary(newValue)}`)
        return
      }
      changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue ?? '(無)'} → ${newValue ?? '(無)'}`)
    })
    return changes
  }

  // 通用修改處理（排除已特殊處理的類型）
  changedFields.forEach(key => {
    if (getFieldTranslation(key, item.targetModel)) {
      const oldValue = before[key]
      const newValue = after[key]

      // 特殊處理報修人欄位
      if (key === 'reportUserId') {
        // 處理舊值
        let oldName = '(無)'
        if (oldValue) {
          if (typeof oldValue === 'object' && oldValue.name) {
            oldName = oldValue.name
          } else if (typeof oldValue === 'string' && oldValue.length === 24) {
            oldName = '(無)'
          } else if (typeof oldValue === 'string') {
            oldName = oldValue
          }
        }

        // 處理新值
        let newName = '(無)'
        if (newValue) {
          if (typeof newValue === 'object' && newValue.name) {
            newName = newValue.name
          } else if (typeof newValue === 'string' && newValue.length === 24) {
            newName = '(無)'
          } else if (typeof newValue === 'string') {
            newName = newValue
          }
        }

        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldName} → ${newName}`)
        return
      }

      // 特殊處理教育訓練影片的分類欄位（複數陣列）
      if (key === 'categories' && item.targetModel === 'educationTrainingVideos') {
        // 處理舊值陣列
        let oldCategories = []
        if (oldValue && Array.isArray(oldValue)) {
          oldCategories = oldValue.map(cat => {
            if (typeof cat === 'string') {
              return cat
            } else if (typeof cat === 'object' && cat.name) {
              return cat.name
            }
            return ''
          }).filter(Boolean).sort()
        } else if (oldValue && typeof oldValue === 'string') {
          oldCategories = [oldValue]
        }

        // 處理新值陣列
        let newCategories = []
        if (newValue && Array.isArray(newValue)) {
          newCategories = newValue.map(cat => {
            if (typeof cat === 'string') {
              return cat
            } else if (typeof cat === 'object' && cat.name) {
              return cat.name
            }
            return ''
          }).filter(Boolean).sort()
        } else if (newValue && typeof newValue === 'string') {
          newCategories = [newValue]
        }

        // 比較排序後的陣列字串，只有真的不同時才顯示
        const oldCategoriesStr = oldCategories.join('、')
        const newCategoriesStr = newCategories.join('、')
        if (oldCategoriesStr !== newCategoriesStr) {
          const oldDisplay = oldCategoriesStr || '(無)'
          const newDisplay = newCategoriesStr || '(無)'
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplay} → ${newDisplay}`)
        }
        return
      }

      // 特殊處理教育訓練影片的分類欄位（單數，向後相容）
      if (key === 'category' && item.targetModel === 'educationTrainingVideos') {
        // 處理舊值
        let oldCategoryName = '(無)'
        if (oldValue) {
          if (typeof oldValue === 'object' && oldValue.name) {
            oldCategoryName = oldValue.name
          } else if (typeof oldValue === 'string' && oldValue.length === 24) {
            // ObjectId 格式，後端應該已經轉換，但如果沒有則顯示 (無)
            oldCategoryName = '(無)'
          } else if (typeof oldValue === 'string') {
            // 如果已經是字串（分類名稱），直接使用
            oldCategoryName = oldValue
          }
        }

        // 處理新值
        let newCategoryName = '(無)'
        if (newValue) {
          if (typeof newValue === 'object' && newValue.name) {
            newCategoryName = newValue.name
          } else if (typeof newValue === 'string' && newValue.length === 24) {
            // ObjectId 格式，後端應該已經轉換，但如果沒有則顯示 (無)
            newCategoryName = '(無)'
          } else if (typeof newValue === 'string') {
            // 如果已經是字串（分類名稱），直接使用
            newCategoryName = newValue
          }
        }

        // 只有真的不同時才顯示
        if (oldCategoryName !== newCategoryName) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldCategoryName} → ${newCategoryName}`)
        }
        return
      }

      // 處理 progressNotes 欄位
      if (key === 'progressNotes') {
        // 處理陣列類型的 progressNotes
        if (Array.isArray(newValue)) {
          const newLast = newValue[newValue.length - 1]
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${newLast ? newLast.content : '無'}`)
        } else {
          // 其他情況，顯示為物件變更
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${newValue || '(無)'}`)
        }
        return
      }

      // 處理 attachments 欄位（公告附件）
      if (key === 'attachments' && item.targetModel === 'announcements') {
        // 處理舊值陣列
        const oldFiles = Array.isArray(oldValue)
          ? oldValue.map(f => {
              if (typeof f === 'string') {
                return f.split('/').pop()
              } else if (typeof f === 'object' && f.originalName) {
                return f.originalName
              } else if (typeof f === 'object' && f.filename) {
                return f.filename
              }
              return ''
            }).filter(Boolean)
          : []

        // 處理新值陣列
        const newFiles = Array.isArray(newValue)
          ? newValue.map(f => {
              if (typeof f === 'string') {
                return f.split('/').pop()
              } else if (typeof f === 'object' && f.originalName) {
                return f.originalName
              } else if (typeof f === 'object' && f.filename) {
                return f.filename
              }
              return ''
            }).filter(Boolean)
          : []

        const oldFilesStr = oldFiles.join('、') || '(無)'
        const newFilesStr = newFiles.join('、') || '(無)'

        // 只有當值實際改變時才記錄
        if (oldFilesStr !== newFilesStr) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldFilesStr} → ${newFilesStr}`)
        }
        return
      }

      // 處理公告的開始時間和結束時間（需要顯示日期+時間）
      if ((key === 'startDate' || key === 'endDate') && item.targetModel === 'announcements') {
        const oldDateTimeStr = oldValue ? formatDateTime(oldValue) : '(無)'
        const newDateTimeStr = newValue ? formatDateTime(newValue) : '(無)'
        // 只有當值實際改變時才記錄
        if (oldDateTimeStr !== newDateTimeStr) {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDateTimeStr} → ${newDateTimeStr}`)
        }
        return
      }

      if (key === 'role') {
        // 處理新的角色格式（物件）或舊的角色格式（數字）
        const oldRoleText = formatRole(oldValue)
        const newRoleText = formatRole(newValue)
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldRoleText} → ${newRoleText}`)
      } else if (key === 'roles') {
        // 處理角色陣列變更
        const oldRolesText = formatRolesArray(oldValue)
        const newRolesText = formatRolesArray(newValue)
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldRolesText} → ${newRolesText}`)
      } else if (key === 'extraPermissions' || key === 'deniedPermissions') {
        // 處理額外權限和拒絕權限陣列變更
        // 這些欄位可能是 ObjectId 陣列、物件陣列（包含 name 或 code）或字串陣列
        let oldPerms = []
        if (oldValue && Array.isArray(oldValue)) {
          oldPerms = oldValue.map(perm => {
            // 優先處理已有名稱的物件
            if (typeof perm === 'object' && perm.name) {
              return perm.name
            } else if (typeof perm === 'object' && perm.code) {
              return perm.code
            } else {
              // 嘗試從權限映射中查找名稱
              const name = getPermissionName(perm)
              return name
            }
          }).filter(Boolean).sort()
        }

        let newPerms = []
        if (newValue && Array.isArray(newValue)) {
          newPerms = newValue.map(perm => {
            // 優先處理已有名稱的物件
            if (typeof perm === 'object' && perm.name) {
              return perm.name
            } else if (typeof perm === 'object' && perm.code) {
              return perm.code
            } else {
              // 嘗試從權限映射中查找名稱
              const name = getPermissionName(perm)
              return name
            }
          }).filter(Boolean).sort()
        }

        const oldDisplay = oldPerms.length > 0 ? oldPerms.join('、') : '(無)'
        const newDisplay = newPerms.length > 0 ? newPerms.join('、') : '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplay} → ${newDisplay}`)
      } else if (key === 'permissions') {
        // 處理權限陣列變更，只顯示"權限變更"
        changes.push('權限變更')
      } else if (key === 'salesPerson') {
        const oldName = oldValue?.name || oldValue?.nickname || '(無)'
        const newName = newValue?.name || newValue?.nickname || '(無)'
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldName} → ${newName}`)
      } else if (key === 'creator') {
        // 處理建立者欄位（物件類型）
        const oldCreatorName = oldValue?.name || '(無)'
        const oldCreatorId = oldValue?.userId || oldValue?.adminId || oldValue?.employeeCode || ''
        const newCreatorName = newValue?.name || '(無)'
        const newCreatorId = newValue?.userId || newValue?.adminId || newValue?.employeeCode || ''
        const oldDisplay = `${oldCreatorName}${oldCreatorId ? ` (${oldCreatorId})` : ''}`
        const newDisplay = `${newCreatorName}${newCreatorId ? ` (${newCreatorId})` : ''}`
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldDisplay} → ${newDisplay}`)
      } else if (key === 'createdAt' || key === 'updatedAt') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue ? formatDateTime(oldValue) : '(無)'} → ${newValue ? formatDateTime(newValue) : '(無)'}`)
      } else if (key === 'inquiryDate' || key === 'maintenanceDate' || key === 'hireDate' || key === 'resignationDate' || key === 'unpaidLeaveStartDate' || key === 'reinstatementDate' || key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate' || key === 'expiryDate' || key === 'lineBoundAt' || key === 'dueDate' || (key === 'startDate' && item.targetModel !== 'announcements')) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
      } else if (key === 'company' && (item.targetModel === 'employees' || item.targetModel === 'departments' || item.targetModel === 'customerInquiries')) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
      } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
      } else if (key === 'type') {
        if (item.targetModel === 'marketingCategories') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${marketingCategoryTypes[oldValue] || '(無)'} → ${marketingCategoryTypes[newValue] || '(無)'}`)
        } else if (item.targetModel === 'hardwareCategories') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${hardwareCategoryTypes[oldValue] || '(無)'} → ${hardwareCategoryTypes[newValue] || '(無)'}`)
        } else if (item.targetModel === 'marquees') {
          changes.push(`${getFieldTranslation(key, item.targetModel)}: ${marqueeTypes[oldValue] || oldValue || '(無)'} → ${marqueeTypes[newValue] || newValue || '(無)'}`)
        }
      } else if (key === 'department') {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
      } else if (['hireDate', 'resignationDate', 'unpaidLeaveStartDate', 'reinstatementDate'].includes(key)) {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
      } else {
        changes.push(`${getFieldTranslation(key, item.targetModel)}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
      }
    }
  })

  // Update formatChanges function to handle 'forms' type for v-data-table
  if (item.targetModel === 'forms') {
    if (item.action === '創建' || item.action === '修改') {
      return ['( 請查看詳細異動內容 )'];
    }
  }



  return changes
}

// 只載入系統使用者（user）
const loadAllUsers = async () => {
  operatorLoading.value = true
  try {
    const usersResponse = await apiAuth.get('/users/suggestions', {
      params: {
        search: '',
        itemsPerPage: 9999
      }
    })

    const suggestions = []

    suggestions.push({
      _id: '000000000000000000000000',
      name: 'SYSTEM',
      userId: 'SYSTEM',
      type: 'system'
    })

    if (usersResponse.data.success) {
      usersResponse.data.result.forEach(user => {
        suggestions.push({
          ...user,
          type: 'system'
        })
      })
    }

    operatorSuggestions.value = suggestions
  } catch (error) {
    console.error('載入操作人員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入操作人員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    operatorSuggestions.value = []
  } finally {
    operatorLoading.value = false
  }
}

// 只搜尋系統使用者（user）
const handleOperatorSearch = debounce(async (text) => {
  if (!text) {
    await loadAllUsers()
    return
  }
  operatorLoading.value = true
  try {
    const usersResponse = await apiAuth.get('/users/suggestions', {
      params: {
        search: text,
        itemsPerPage: 9999
      }
    })

    const suggestions = []

    if (!text || text.toUpperCase().split('').some(char => 'SYSTEM'.includes(char))) {
      suggestions.push({
        _id: '000000000000000000000000',
        name: 'SYSTEM',
        userId: 'SYSTEM',
        type: 'system'
      })
    }

    if (usersResponse.data.success) {
      usersResponse.data.result.forEach(user => {
        suggestions.push({
          ...user,
          type: 'system'
        })
      })
    }

    operatorSuggestions.value = suggestions
  } catch (error) {
    console.error('搜尋操作人員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋操作人員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    operatorSuggestions.value = []
  } finally {
    operatorLoading.value = false
  }
}, 300)

const clearOperatorSearch = () => {
  operatorSearchInput.value = ''
  loadAllUsers()
  searchCriteria.value.operatorId = null
}

const clearTargetSearch = () => {
  targetSearchInput.value = ''
  targetSuggestions.value = []
  searchCriteria.value.targetId = null
}

const resetSearch = async () => {
  searchCriteria.value = {
    operatorId: null,
    targetId: null,
    action: '',
    targetModel: '',
    dateRange: []
  }
  clearOperatorSearch()
  clearTargetSearch()
  // 清空快速搜尋
  quickSearchText.value = ''
  // 清空表格資料
  tableItems.value = []
  tableItemsLength.value = 0
  hasSearched.value = false // 重置搜尋狀態

  // 重置後自動執行搜尋，顯示所有異動紀錄
  await performSearch()
}

// 新增 quickSearchText 和 isLoading
const quickSearchText = ref('')
const isLoading = ref(false)

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  performSearch()
}, 300)

// 監聽 quickSearchText 的變化
watch(quickSearchText, () => {
  isLoading.value = true
  debouncedSearch()
})

const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      itemsPerPage: 9999999999 // 載入所有資料，由前端過濾
    }

    // 處理搜尋條件
    if (searchCriteria.value.operatorId?._id) {
      params.operatorId = searchCriteria.value.operatorId._id
    }
    if (searchCriteria.value.action) {
      params.action = searchCriteria.value.action
    }

    // 處理日期範圍
    if (searchCriteria.value.dateRange && searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      startDate.setHours(0, 0, 0, 0)
      params.startDate = startDate.toISOString()

      const endDate = searchCriteria.value.dateRange.length > 1
        ? new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])
        : new Date(searchCriteria.value.dateRange[0])
      endDate.setHours(23, 59, 59, 999)
      params.endDate = endDate.toISOString()
    }

    // 處理快速搜尋
    if (quickSearchText.value) {
      params.quickSearch = quickSearchText.value
    }

    // 處理資料類型篩選 - 如果選擇「全部」則不傳送 targetModel 參數
    if (searchCriteria.value.targetModel && searchCriteria.value.targetModel !== '') {
      params.targetModel = searchCriteria.value.targetModel
    }

    // 處理操作對象
    if (searchCriteria.value.targetId) {
      if (searchCriteria.value.targetModel === 'formTemplates') {
        params.targetId = searchCriteria.value.targetId._id
      } else {
        params.targetId = searchCriteria.value.targetId._id
      }
    }

    // console.log('發送搜尋請求，參數:', params)
    const { data } = await apiAuth.get('/auditLogs', { params })
    // console.log('搜尋回應:', data)

    if (data.success) {
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
      hasSearched.value = true // 標記已經搜尋過
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    console.error('錯誤詳情:', {
      message: error?.message,
      response: error?.response?.data
    })
    createSnackbar({
      text: error?.response?.data?.message || '搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    tableItems.value = []
    tableItemsLength.value = 0
  } finally {
    tableLoading.value = false
    isLoading.value = false
  }
}



const showDetail = (item) => {
  // 如果資料已被刪除（不是刪除操作本身），且不是創建操作，顯示提示訊息
  if (item.isTargetDeleted && item.action !== '創建' && item.action !== '刪除') {
    createSnackbar({
      text: '此資資料已被刪除，無法查看詳細內容',
      snackbarProps: { color: 'warning' }
    })
    return
  }

  selectedItem.value = item
  detailDialog.value = true
}

// 修改 shouldShowBudgetTable 計算屬性
const shouldShowBudgetTable = computed(() => {
  if (!selectedItem.value) return false
  if (selectedItem.value.targetModel !== 'marketingBudgets') return false
  if (selectedItem.value.action === '刪除') return false

  // 如果是創建操作，檢查是否有 changes.after.items
  if (selectedItem.value.action === '創建') {
    return selectedItem.value.changes?.after?.items?.length > 0
  }

  // 如果是修改操作，且資料已被刪除，則不顯示
  if (selectedItem.value.isTargetDeleted) return false

  return hasBudgetItemsChanged(selectedItem.value)
})

// 載入權限映射
const loadPermissionMap = async () => {
  try {
    const permissions = await permissionStore.getAllPermissions()
    const map = new Map()
    permissions.forEach(perm => {
      if (perm._id) {
        const id = typeof perm._id === 'string' ? perm._id : perm._id.toString()
        map.set(id, perm.name || perm.code || id)
      }
    })
    permissionMap.value = map
  } catch (error) {
    console.error('載入權限映射失敗:', error)
  }
}

// 將 ObjectId 轉換為權限名稱的輔助函數
const getPermissionName = (permId) => {
  if (!permId) return null

  // 處理 MongoDB ObjectId 格式 {"$oid": "..."}
  let id = null
  if (typeof permId === 'object' && permId.$oid) {
    id = permId.$oid
  } else if (typeof permId === 'object' && permId._id) {
    id = typeof permId._id === 'string' ? permId._id : permId._id.toString()
  } else if (typeof permId === 'string') {
    id = permId
  } else {
    id = permId.toString()
  }

  return permissionMap.value.get(id) || null
}

// 初始載入
onMounted(async () => {
  await loadAllUsers()
  await loadPermissionMap()
  // 自動載入資料
  await performSearch()
})

const formatUserDisplay = (user) => {
  if (!user) return ''
  if (user.adminId) {
    return `${user.name} (${user.adminId})`
  }
  return `${user.name} (${user.userId || ''})`
}

// 監聽資料類型變更
watch(() => searchCriteria.value.targetModel, () => {
  // 當資料類型改變時，清空操作對象
  clearTargetSearch()
})

// 添加日期驗證監聽
watch(
  [
    () => searchCriteria.value.dateRange
  ],
  ([newDateRange]) => {
    if (newDateRange && newDateRange.length > 0) {
      const start = new Date(newDateRange[0])
      const end = new Date(newDateRange[newDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.dateRange = []
      }
    }
  }
)

const hasSearched = ref(false) // 追蹤是否已經搜尋過

// 新增刪除相關變數
const deleteDialog = ref(false)
const isDeleting = ref(false)
const selectedOperatorForDelete = ref(null)
const deleteOperatorSuggestions = ref([])
const deleteOperatorLoading = ref(false)
const confirmOperatorName = ref('')
const confirmNameError = ref('')

// 只載入系統使用者供刪除對話框選擇
const loadAllUsersForDelete = async () => {
  deleteOperatorLoading.value = true
  try {
    const usersResponse = await apiAuth.get('/users/suggestions', {
      params: {
        search: '',
        itemsPerPage: 9999
      }
    })

    const suggestions = []

    suggestions.push({
      _id: '000000000000000000000000',
      name: 'SYSTEM',
      userId: 'SYSTEM',
      type: 'system'
    })

    if (usersResponse.data.success) {
      usersResponse.data.result.forEach(user => {
        suggestions.push({
          ...user,
          type: 'system'
        })
      })
    }

    deleteOperatorSuggestions.value = suggestions
  } catch (error) {
    console.error('載入操作人員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入操作人員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteOperatorLoading.value = false
  }
}

// 只搜尋系統使用者供刪除對話框
const searchOperatorsForDelete = debounce(async (search) => {
  deleteOperatorLoading.value = true
  try {
    const usersResponse = await apiAuth.get('/users/suggestions', {
      params: {
        search,
        itemsPerPage: 9999
      }
    })

    const suggestions = []

    if (!search || search.toUpperCase().split('').some(char => 'SYSTEM'.includes(char))) {
      suggestions.push({
        _id: '000000000000000000000000',
        name: 'SYSTEM',
        userId: 'SYSTEM',
        type: 'system'
      })
    }

    if (usersResponse.data.success) {
      usersResponse.data.result.forEach(user => {
        suggestions.push({
          ...user,
          type: 'system'
        })
      })
    }

    deleteOperatorSuggestions.value = suggestions
  } catch (error) {
    console.error('搜尋操作人員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋操作人員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteOperatorLoading.value = false
  }
}, 300)

// 監聽對話框的開啟
watch(deleteDialog, async (newValue) => {
  if (newValue) {
    await loadAllUsersForDelete()
  } else {
    selectedOperatorForDelete.value = null
    confirmOperatorName.value = ''
  }
})

// 當清除操作人員選擇時，重新載入所有使用者
const onClearOperatorForDelete = async () => {
  selectedOperatorForDelete.value = null
  confirmOperatorName.value = ''
  await loadAllUsersForDelete()
}

// 刪除紀錄
const deleteMyLogs = async () => {
  if (!selectedOperatorForDelete.value?._id) {
    createSnackbar({
      text: '請選擇要刪除的操作人員',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  isDeleting.value = true
  try {
    const { data } = await apiAuth.delete('/auditLogs/my-logs', {
      params: {
        operatorId: selectedOperatorForDelete.value._id
      }
    })

    if (data.success) {
      createSnackbar({
        text: data.message,
        snackbarProps: { color: 'teal-lighten-1' }
      })
      deleteDialog.value = false
      selectedOperatorForDelete.value = null
      await performSearch()
    }
  } catch (error) {
    console.error('刪除異動紀錄失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除異動紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isDeleting.value = false
  }
}

// 顯示刪除對話框
const showDeleteDialog = () => {
  deleteDialog.value = true
}

// 在 script setup 區塊中添加
const isHovered = ref(false)

// 修改關閉對話框的函數
const closeDeleteDialog = () => {
  deleteDialog.value = false
  confirmOperatorName.value = ''
}

// 驗證確認名稱
const validateConfirmName = (value) => {
  if (!selectedOperatorForDelete.value) {
    confirmNameError.value = ''
    return
  }

  if (!value) {
    confirmNameError.value = '請輸入操作人員名稱'
    return
  }

  if (value !== selectedOperatorForDelete.value.name) {
    confirmNameError.value = '請輸入完全相符的操作人員名稱'
    return
  }

  confirmNameError.value = ''
}

// 修改監聽選擇的操作人員變更
watch(selectedOperatorForDelete, (newValue) => {
  confirmOperatorName.value = ''
  confirmNameError.value = ''
  if (!newValue) {
    confirmOperatorName.value = ''
  }
})

// 添加刪除相關變數
const confirmDeleteDialog = ref({
  open: false,
  item: null
})
const deletingLogId = ref(null)

// 添加確認刪除函數
const confirmDeleteLog = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    item
  }
}

// 添加刪除函數
const deleteLog = async () => {
  const itemId = confirmDeleteDialog.value.item._id
  deletingLogId.value = itemId
  try {
    const { data } = await apiAuth.delete(`/auditLogs/${itemId}`)
    if (data.success) {
      await performSearch()
      createSnackbar({
        text: '刪除異動紀錄成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('刪除異動紀錄失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingLogId.value = null
  }
}

// 處理 TAB 切換
// 只顯示系統操作紀錄
const filteredTableItems = computed(() => {
  return tableItems.value.filter(item => {
    const info = item.operatorInfo
    return info?.adminId ||
           info?.userId ||
           info?.type === 'system' ||
           info?.name === 'SYSTEM'
  })
})

// 在 script setup 部分添加
const hoveredItemId = ref(null)
</script>

<style lang="scss" scoped>
.odd-row {
  background-color: #fcfcfc;
}

.even-row {
  background-color: rgb(245, 255, 251);
}

.v-data-table {
  :deep(.text-wrap) {
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.change-list {
  padding-left: 16px;
  list-style-type: disc;

  li {
    line-height: 1.2;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

:deep(.v-data-table) {
  thead {
    background-color: #455A64;
    color: #fff;
    height: 48px;
  }
  td {
    white-space: pre-line;
  }
}

.list-title {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.list-content {
  font-size: 14px;
  line-height: 1.4;

  &.budget-content {
    min-width: 80%;
    margin: 0 -24px;
    padding: 16px 24px;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
}

// 添加行銷預算相關樣式
.budget-dialog {
  max-width: 1920px;
  margin: 0 auto;

  :deep(.v-card) {
    max-height: 90vh;
    overflow-y: auto;
  }
}

// 修改對話框樣式
:deep(.v-dialog) {
  &.budget-detail {
    max-width: 1920px !important;
    width: 90% !important;
    margin: 24px auto !important;

    .v-card {
      max-height: calc(100vh - 48px);
      overflow-y: auto;
    }
  }

  // 當不是修改預算表格時，使用較窄的寬度
  &:not(.budget-detail) {
    max-width: 600px !important;
  }
}

.v-alert {
  font-size: 14px;
  :deep(.v-icon) {
    font-size: 18px !important;
  }
}
</style>
