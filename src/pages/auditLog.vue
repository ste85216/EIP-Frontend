<template>
  <v-container max-width="2500">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5">
      <v-col
        cols="12"
        lg="2"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 ps-lg-6 pe-lg-0"
          >
            <v-card class="elevation-4 rounded-lg py-6 px-4 px-sm-4 px-xl-4">
              <v-card-title class="font-weight-bold d-flex align-center">
                搜尋條件
              </v-card-title>
              <v-card-text class="pa-2">
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <!-- 操作人員自動完成 -->
                    <v-autocomplete
                      v-model="searchCriteria.operatorId"
                      v-model:search-input="operatorSearchInput"
                      :items="operatorSuggestions"
                      :loading="operatorLoading"
                      label="操作人員"
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
                      @update:search="handleOperatorSearch"
                      @click:clear="clearOperatorSearch"
                      @click:input="loadAllUsers"
                    >
                      <template #selection="{ item }">
                        {{ formatUserDisplay(item.raw) }}
                      </template>
                      <template
                        v-if="smAndUp"
                        #append-inner
                      >
                        <v-tooltip
                          location="top"
                          close-delay="200"
                        >
                          <template #activator="{ props }">
                            <v-icon
                              v-bind="props"
                              icon="mdi-information"
                              size="18"
                            />
                          </template>
                          輸入使用者編號、管理者編號或姓名查詢
                        </v-tooltip>
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.targetModel"
                      :items="modelOptions"
                      label="資料類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                  <!-- <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-autocomplete
                      v-model="searchCriteria.targetId"
                      v-model:search-input="targetSearchInput"
                      :items="targetSuggestions"
                      :loading="targetLoading"
                      :label="targetType ? '操作對象' : '操作對象(請先選擇資料類型)'"
                      :disabled="!targetType"
                      return-object
                      :item-props="item => ({
                        key: item._id || item.name,
                        title: formatTargetDisplay(item),
                        value: item
                      })"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:search="handleTargetSearch"
                      @click:clear="clearTargetSearch"
                    >
                      <template #selection="{ item }">
                        {{ formatTargetDisplay(item.raw) }}
                      </template>
                      <template
                        v-if="smAndUp"
                        #append-inner
                      >
                        <v-tooltip
                          location="top"
                          close-delay="200"
                        >
                          <template #activator="{ props }">
                            <v-icon
                              v-bind="props"
                              icon="mdi-information"
                              size="18"
                            />
                          </template>
                          輸入使用者編號、表單編號或姓名查詢
                        </v-tooltip>
                      </template>
                    </v-autocomplete>
                  </v-col> -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.action"
                      :items="actionOptions"
                      label="操作類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-date-input
                      v-model="searchCriteria.dateRange"
                      label="日期區間"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="12"
                    class="d-flex justify-end gap-2"
                  >
                    <v-row class="d-flex justify-space-between">
                      <v-col cols="3">
                        <v-btn
                          color="grey"
                          width="40"
                          block
                          @click="resetSearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="9"
                        class="ps-0"
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
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- 表格區 -->
      <v-col
        cols="12"
        lg="10"
        class="px-6 ps-lg-4 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-1 mx-0 mx-sm-4 ms-md-4 me-md-0 mb-4 bg-white">
          <v-col
            cols="12"
            class="ps-4 pb-sm-6"
          >
            <v-row>
              <v-col>
                <h3>異動紀錄</h3>
              </v-col>
              <v-col
                cols="3"
                class="ms-auto d-flex align-center"
              >
                <v-icon
                  v-tooltip:start="'可搜尋操作對象'"
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
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @input="debouncedSearch"
                />
                <!-- 添加刪除按鈕 -->
                <v-btn
                  v-tooltip:top="'刪除異動紀錄'"
                  icon="mdi-delete-clock-outline"
                  :color="isHovered ? 'red-lighten-1' : 'grey'"
                  variant="plain"
                  size="36"
                  class="mx-2"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                  @click="showDeleteDialog"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :items="tableItems"
              :headers="filteredHeaders"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :items-per-page-options="[10, 20, 50, 100]"
              :page="tablePage"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
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
            </v-data-table-server>
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
  >
    <v-card class="rounded-lg px-8 pt-7 pb-4">
      <div class="card-title mb-2">
        刪除異動紀錄
      </div>
      <v-card-text class="pt-6 px-0">
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
          variant="tonal"
          density="compact"
          class="mt-4 custom-alert"
        >
          注意：此操作將刪除該操作人員的所有異動紀錄，且不可恢復。
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-0">
        <v-spacer />
        <v-btn
          color="grey"
          variant="outlined"
          class="me-2"
          @click="closeDeleteDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="red-darken-1"
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
import { debounce } from 'lodash'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import { useSnackbar } from 'vuetify-use-dialog'
import MarketingBudgetChangeTable from '@/components/MarketingBudgetChangeTable.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

definePage({
  meta: {
    title: '異動紀錄 | GInternational',
    login: true,
    roles: [UserRole.ADMIN]
  }
})

const { smAndUp, mdAndUp, lgAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

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
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'createdAt', order: 'desc' }])

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
  { title: '使用者', value: 'users' },
  { title: '表單', value: 'forms' },
  { title: '表單模板', value: 'formTemplates' },
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
  { title: '通知 EMAIL', value: 'notificationEmails' }
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

// 欄位名稱翻譯
const fieldTranslations = {
  name: '資料名稱',
  email: '電子郵件',
  role: '權限',
  userId: '使用者編號',
  adminId: '管理者編號',
  formNumber: '表單編號',
  clientName: '客戶名稱',
  projectName: '專案名稱',
  type: '類型',
  componentName: '組件名稱',
  note: '備註',
  isActive: '啟用狀態',
  employmentStatus: '任職狀態',
  marketingExpenses: '行銷實際支出',
  marketingBudgets: '行銷預算',
  expense: '花費金額',
  invoiceDate: '發票日期',
  theme: '行銷主題',
  channel: '廣告渠道',
  platform: '平台',
  detail: '線別',
  relatedBudget: '關聯預算表',
  year: '年度',
  order: '排序',
  maintenanceDate: '維修日期',
  maintenanceContent: '維修內容',
  maintenanceResult: '維修結果',
  reportUser: '報修人',
  annualTotalBudget: '年度總預算',
  employeeCode: '科威員編',
  extNumber: '分機號碼',
  printNumber: '列印機編號',
  emailPassword: 'Email密碼',
  company: '公司',
  department: '部門',
  employeeId: '系統員編',
  departmentId: '部門編號',
  hireDate: '到職日期',
  resignationDate: '離職日期',
  unpaidLeaveStartDate: '留職停薪開始日期',
  reinstatementDate: '復職日期',
  purchaseDate: '進貨日期',
  serialNumber: '序號',
  loginName: '登入名稱',
  deviceName: '裝置名稱',
  stockStatus: '庫存狀態',
  expenseStatus: '報帳狀態',
  office2021Account: 'office2021帳號',
  office365Account: 'office365帳號',
  office2021InstallDate: 'office2021安裝日期',
  user: '使用者',
  macAddress: 'MAC',
  IPAddress: 'IP',
  VPNAccount: 'VPN帳號',
  VPNApplyReason: 'VPN申請原因',
  location: '地點',
  expenseObject: '報帳對象',
  expenseDate: '報帳日期',
  companyId: '公司編號',
  employmentType: '聘僱類型',
  jobTitle: '職稱',
  nickname: '暱稱',
  inquiryDate: '詢問日期',
  inquiryContent: '詢問內容',
  inquiryResult: '詢問結果',
  inquiryPlace: '詢問地點',
  source: '來源',
  customerName: '客戶姓名',
  customerPhone: '客戶電話',
  customerEmail: '客戶Email',
  salesPerson: '業務',
  progress: '進度',
  inquiryResultAndNote: '詢問結果 / 備註',
  showInB2C: 'B2C業務',
  customerTitle: '稱謂',
  lineLink: 'Line 連結',
  lineID: 'Line ID',
  progressNotes: '進度 / 備註',
  // 行銷美編需求申請欄位翻譯
  designRequestNumber: '申請編號',
  productType: '申請類型',
  applicant: '申請人',
  status: '狀態',
  applicationDate: '申請日期',
  assignedDesigner: '處理人員',
  title: '標題',
  style: '風格',
  imageSubject: '圖片主題',
  content: '內容',
  requestedByDate: '希望交付日',
  quantity: '數量',
  useInfoBookletCover: '使用說資封面',
  otherNote: '其他備註',
  files: '檔案',
  referenceImage: '參考圖片',
  images: '圖片',
  groupId: '團號',
  useQuickTemplate: '使用快速版型',
  quickTemplateNumber: '快速版型編號',
  subtitle: '副標',
  departureDate: '出發日期',
  tripHighlights: '行程特色',
  attractionImage: '指定景點圖片',
  agentPrice: '同業價',
  retailPrice: '直客價',
  promotions: '優惠',
  airlineHighlightNote: '航空公司特色備註',
  useLogo: '使用Logo',
  subtitleAndHighlights: '副標/特色',
  itinerary: '行程',
  groupName: '團體名稱',
  printingTypes: '印刷類型',
  infoBookletCover: '說資封面',
  banner: '布條',
  coachSign: '車頭牌',
  other: '其他',
  categories: '大分類',
  reportUserId: '報修人'
}

// 行銷分類類型對應
const marketingCategoryTypes = {
  0: '行銷主題',
  1: '廣告渠道',
  2: '平台',
  3: '線別',
  4: '平台細項'
}

// 硬體類別類型對應
const hardwareCategoryTypes = {
  0: '設備',
  1: '維修'
}

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
  const roleMap = {
    0: '一般使用者',
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

// 申請類型轉換
const getProductTypeText = (productType) => {
  const productTypeMap = {
    printing: '印刷相關',
    infoBookletCover: '說資封面',
    banner: '布條',
    coachSign: '車頭牌',
    seriesMap: 'Series地圖',
    seriesMapModify: '修改Series地圖',
    SPMap: 'SP地圖',
    newDMSingle: '新DM(單支)',
    newDMMultiple: '新DM(多支)',
    modifyDM: '修改DM'
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
    users: '使用者',
    forms: '表單',
    formTemplates: '表單模板',
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
    notificationEmails: '通知 EMAIL'
  }
  return modelMap[model] || model
}

const formatOperator = (item) => {
  if (!item?.operatorInfo) return '-'
  const { name, userId, adminId, employeeCode } = item.operatorInfo

  // 優先使用 employeeCode
  if (employeeCode) {
    return `${name} (${employeeCode})`
  }
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
      const { year } = item.changes.before
      const theme = item.changes.before.theme?.name || '(無)'
      return `${year}年度 - ${theme}`
    }
    if (item.targetModel === 'hardwareCategories') {
      const { name, type } = item.changes.before
      return `${name} (${hardwareCategoryTypes[type]})`
    }
    if (item.targetModel === 'designRequests') {
      // 先從 targetInfo 取，沒有就從 changes.after 裡面取
      const info = item.targetInfo || {}
      const after = item.changes?.after || {}
      const name = info.name || after.designRequestNumber || '-'
      const productType = info.productType || after.productType
      const applicant = (info.applicant && info.applicant.name) || (after.applicant && after.applicant.name) || (typeof info.applicant === 'string' ? info.applicant : undefined) || '-'
      const status = info.status || after.status
      const productTypeText = getProductTypeText(productType)
      const statusText = getStatusText(status)
      return `${name} - ${productTypeText} (${applicant}) - ${statusText}`
    }
    if (item.targetModel === 'notificationEmails') {
      const info = item.targetInfo || {}
      const after = item.changes?.after || {}
      const userName = info.name || (after.user && after.user.name) || '(無)'
      const userId = info.userId || (after.user && (after.user.userId || after.user.adminId)) || ''
      return `${userName}${userId ? ` (${userId})` : ''}`
    }
  }

  if (item.targetModel === 'marketingBudgets') {
    const { year, theme } = item.targetInfo || {}
    return `${year}年度 - ${theme}`
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
  return `${name}${userId ? ` (${userId})` : ''}`
}

// 格式化布林值
const formatBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  return value
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
        if (!excludeFields.includes(key) && fieldTranslations[key]) {
          if (key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate') {
            changes.push(`${fieldTranslations[key]}: ${formatDate(value)}`)
          } else if (key === 'type') {
            changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
          } else if (key === 'user') {
            changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
          } else if (key === 'company') {
            changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
          } else if (key === 'location') {
            changes.push(`${fieldTranslations[key]}: ${value?.locationName || '(無)'}`)
          } else if (key === 'expenseObject') {
            changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
          } else if (typeof value === 'boolean') {
            changes.push(`${fieldTranslations[key]}: ${formatBoolean(value)}`)
          } else {
            changes.push(`${fieldTranslations[key]}: ${value || '(無)'}`)
          }
        }
      })
      return changes
    }

    // 針對硬體維修記錄的特殊處理
    if (item.targetModel === 'hardwareMaintenanceRecords') {
      Object.entries(after).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && fieldTranslations[key]) {
          if (key === 'maintenanceDate') {
            changes.push(`${fieldTranslations[key]}: ${formatDate(value)}`)
          } else if (key === 'hardwareCategory') {
            changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
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
            changes.push(`${fieldTranslations[key]}: ${reportUserName}`)
          } else if (key === 'maintenanceContent' || key === 'maintenanceResult' || key === 'note') {
            changes.push(`${fieldTranslations[key]}: ${value || '(無)'}`)
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
      changes.push(`申請類型: ${getProductTypeText(data.productType)}`)
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
      // 檔案資訊
      const fileFields = ['files', 'referenceImage', 'images']
      fileFields.forEach(field => {
        if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
          const fileNames = data[field].map(f => typeof f === 'string' ? f.split('/').pop() : '').filter(Boolean)
          changes.push(`${fieldTranslations[field]}: ${fileNames.join('、')}`)
        }
      })
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
            dm: 'DM'
          }
          return categoryMap[cat] || cat
        })
        changes.push(`大分類: ${categoryTexts.join('、')}`)
      }
      if (data.note) changes.push(`備註: ${data.note}`)
      return changes
    }

    Object.entries(after).forEach(([key, value]) => {
      if (!excludeFields.includes(key) && fieldTranslations[key]) {
        if (key === 'role') {
          changes.push(`${fieldTranslations[key]}: ${formatRole(value)}`)
        } else if (key === 'salesPerson') {
          const name = value?.name || value?.nickname || '(無)'
          changes.push(`${fieldTranslations[key]}: ${name}`)
        } else if (typeof value === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(value)}`)
        } else if (key === 'type') {
          if (item.targetModel === 'marketingCategories') {
            changes.push(`${fieldTranslations[key]}: ${marketingCategoryTypes[value] || '(無)'}`)
          } else if (item.targetModel === 'hardwareCategories') {
            changes.push(`${fieldTranslations[key]}: ${hardwareCategoryTypes[value] || '(無)'}`)
          }
        } else if (key === 'inquiryDate' || key === 'maintenanceDate' || key === 'hireDate' || key === 'resignationDate' || key === 'unpaidLeaveStartDate' || key === 'reinstatementDate' || key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate') {
          changes.push(`${fieldTranslations[key]}: ${formatDate(value)}`)
        } else if (key === 'company' && (item.targetModel === 'employees' || item.targetModel === 'departments' || item.targetModel === 'customerInquiries')) {
          changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
        } else if (key === 'department') {
          changes.push(`${fieldTranslations[key]}: ${value?.name || '(無)'}`)
        } else {
          changes.push(`${fieldTranslations[key]}: ${value || '(無)'}`)
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
      if (fieldTranslations[key]) {
        const oldValue = before[key]
        const newValue = after[key]

        if (key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate') {
          changes.push(`${fieldTranslations[key]}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
        } else if (key === 'type') {
          changes.push(`${fieldTranslations[key]}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'user') {
          changes.push(`${fieldTranslations[key]}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'company') {
          changes.push(`${fieldTranslations[key]}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (key === 'location') {
          const oldLocationName = oldValue === null ? '(無)' : (oldValue?.locationName || '2F')
          const newLocationName = newValue === null ? '(無)' : (newValue?.locationName || '2F')
          changes.push(`${fieldTranslations[key]}: ${oldLocationName} → ${newLocationName}`)
        } else if (key === 'expenseObject') {
          changes.push(`${fieldTranslations[key]}: ${oldValue?.name || '(無)'} → ${newValue?.name || '(無)'}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${fieldTranslations[key]}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理行銷美編需求申請的修改操作（優先處理）
  if (item.targetModel === 'designRequests' && item.action === '修改') {
    changedFields.forEach(key => {
      if (fieldTranslations[key]) {
        const oldValue = before[key]
        const newValue = after[key]
        if (key === 'status') {
          changes.push(`${fieldTranslations[key]}: ${getStatusText(oldValue)} → ${getStatusText(newValue)}`)
        } else if (key === 'productType') {
          changes.push(`${fieldTranslations[key]}: ${getProductTypeText(oldValue)} → ${getProductTypeText(newValue)}`)
        } else if (key === 'applicationDate' || key === 'requestedByDate') {
          changes.push(`${fieldTranslations[key]}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
        } else if (key === 'applicant' || key === 'assignedDesigner') {
          // 處理申請人和處理人員的顯示
          let oldName = '(無)'
          let newName = '(無)'

          // 處理舊值
          if (oldValue) {
            if (typeof oldValue === 'object' && oldValue.name) {
              oldName = oldValue.name
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
              newName = newValue.name
            } else if (typeof newValue === 'string' && newValue.length === 24) {
              // 如果是 ObjectId 格式的字串，顯示為 (無)
              newName = '(無)'
            } else if (typeof newValue === 'string') {
              newName = newValue
            }
          }

          changes.push(`${fieldTranslations[key]}: ${oldName} → ${newName}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else if (key === 'agentPrice' || key === 'retailPrice' || key === 'quantity') {
          changes.push(`${fieldTranslations[key]}: ${oldValue?.toLocaleString() || '(無)'} → ${newValue?.toLocaleString() || '(無)'}`)
        } else if (key === 'printingTypes') {
          // 顯示印刷類型異動
          const oldTypes = oldValue ? Object.entries(oldValue).filter(([, v]) => v).map(([k]) => getProductTypeText(k)) : []
          const newTypes = newValue ? Object.entries(newValue).filter(([, v]) => v).map(([k]) => getProductTypeText(k)) : []
          changes.push(`${fieldTranslations[key]}: ${oldTypes.join('、') || '(無)'} → ${newTypes.join('、') || '(無)'}`)
        } else if (key === 'files' || key === 'referenceImage' || key === 'images') {
          // 顯示檔案異動
          const oldFiles = Array.isArray(oldValue) ? oldValue.map(f => typeof f === 'string' ? f.split('/').pop() : '').filter(Boolean) : []
          const newFiles = Array.isArray(newValue) ? newValue.map(f => typeof f === 'string' ? f.split('/').pop() : '').filter(Boolean) : []
          changes.push(`${fieldTranslations[key]}: ${oldFiles.join('、') || '(無)'} → ${newFiles.join('、') || '(無)'}`)
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
                    const subKeyLabel = fieldTranslations[subKey] || subKey
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
            const oldText = Array.isArray(oldValue) ? `${oldValue.length} 筆行程` : '(無)'
            const newText = Array.isArray(newValue) ? `${newValue.length} 筆行程` : '(無)'
            changes.push(`${fieldTranslations[key]}: ${oldText} → ${newText}`)
          }
        } else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue && newValue) {
          // 巢狀物件（如 infoBookletCover、banner、coachSign）
          const subKeys = Object.keys({ ...oldValue, ...newValue })
          let hasChanges = false
          subKeys.forEach(subKey => {
            const oldSub = oldValue[subKey]
            const newSub = newValue[subKey]
            if (oldSub !== newSub) {
              hasChanges = true
              const subKeyLabel = fieldTranslations[subKey] || subKey
              const parentKeyLabel = fieldTranslations[key] || key
              if (subKey === 'requestedByDate') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${formatDate(oldSub)} → ${formatDate(newSub)}`)
              } else if (subKey === 'quantity' || subKey === 'agentPrice' || subKey === 'retailPrice') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${oldSub?.toLocaleString() || '(無)'} → ${newSub?.toLocaleString() || '(無)'}`)
              } else if (typeof oldSub === 'boolean' || typeof newSub === 'boolean') {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${formatBoolean(oldSub)} → ${formatBoolean(newSub)}`)
              } else {
                changes.push(`${parentKeyLabel}-${subKeyLabel}: ${oldSub || '(無)'} → ${newSub || '(無)'}`)
              }
            }
          })

          // 如果沒有具體的子欄位變更，但有整體物件變更，顯示為新增或移除
          if (!hasChanges && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            const parentKeyLabel = fieldTranslations[key] || key
            const oldText = Object.keys(oldValue).length > 0 ? '有資料' : '(無)'
            const newText = Object.keys(newValue).length > 0 ? '有資料' : '(無)'
            changes.push(`${parentKeyLabel}: ${oldText} → ${newText}`)
          }
        } else if ((oldValue && typeof oldValue === 'object') || (newValue && typeof newValue === 'object')) {
          // 處理一個是物件，另一個不是物件的情況
          const parentKeyLabel = fieldTranslations[key] || key
          const oldText = oldValue && typeof oldValue === 'object' ? '有資料' : (oldValue || '(無)')
          const newText = newValue && typeof newValue === 'object' ? '有資料' : (newValue || '(無)')
          changes.push(`${parentKeyLabel}: ${oldText} → ${newText}`)
        } else {
          changes.push(`${fieldTranslations[key]}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理通知 EMAIL 的修改操作
  if (item.targetModel === 'notificationEmails' && item.action === '修改') {
    changedFields.forEach(key => {
      if (fieldTranslations[key]) {
        const oldValue = before[key]
        const newValue = after[key]

        if (key === 'user') {
          const oldUserName = oldValue?.name || '(無)'
          const newUserName = newValue?.name || '(無)'
          changes.push(`${fieldTranslations[key]}: ${oldUserName} → ${newUserName}`)
        } else if (key === 'categories') {
          const categoryMap = {
            printing: '印刷相關',
            map: '地圖',
            dm: 'DM'
          }
          const oldCategories = Array.isArray(oldValue) ? oldValue.map(cat => categoryMap[cat] || cat) : []
          const newCategories = Array.isArray(newValue) ? newValue.map(cat => categoryMap[cat] || cat) : []
          changes.push(`${fieldTranslations[key]}: ${oldCategories.join('、') || '(無)'} → ${newCategories.join('、') || '(無)'}`)
        } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
        } else {
          changes.push(`${fieldTranslations[key]}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 通用修改處理（排除已特殊處理的類型）
  changedFields.forEach(key => {
    if (fieldTranslations[key]) {
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

        changes.push(`${fieldTranslations[key]}: ${oldName} → ${newName}`)
        return
      }

      // 處理 progressNotes 欄位
      if (key === 'progressNotes' && Array.isArray(newValue)) {
        const newLast = newValue[newValue.length - 1]
        changes.push(
          `${fieldTranslations[key]}: ` +
          (newLast ? newLast.content : '無')
        )
        return
      }

      if (key === 'role') {
        changes.push(`${fieldTranslations[key]}: ${formatRole(oldValue)} → ${formatRole(newValue)}`)
      } else if (key === 'salesPerson') {
        const name = newValue?.name || newValue?.nickname || '(無)'
        changes.push(`${fieldTranslations[key]}: ${name}`)
      } else if (key === 'inquiryDate' || key === 'maintenanceDate' || key === 'hireDate' || key === 'resignationDate' || key === 'unpaidLeaveStartDate' || key === 'reinstatementDate' || key === 'purchaseDate' || key === 'office2021InstallDate' || key === 'expenseDate') {
        changes.push(`${fieldTranslations[key]}: ${formatDate(newValue)}`)
      } else if (key === 'company' && (item.targetModel === 'employees' || item.targetModel === 'departments' || item.targetModel === 'customerInquiries')) {
        changes.push(`${fieldTranslations[key]}: ${newValue?.name || '(無)'}`)
      } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
        changes.push(`${fieldTranslations[key]}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
      } else if (key === 'type') {
        if (item.targetModel === 'marketingCategories') {
          changes.push(`${fieldTranslations[key]}: ${marketingCategoryTypes[oldValue] || '(無)'} → ${marketingCategoryTypes[newValue] || '(無)'}`)
        } else if (item.targetModel === 'hardwareCategories') {
          changes.push(`${fieldTranslations[key]}: ${hardwareCategoryTypes[oldValue] || '(無)'} → ${hardwareCategoryTypes[newValue] || '(無)'}`)
        }
      } else if (key === 'department') {
        changes.push(`${fieldTranslations[key]}: ${newValue?.name || '(無)'}`)
      } else if (['hireDate', 'resignationDate', 'unpaidLeaveStartDate', 'reinstatementDate'].includes(key)) {
        changes.push(`${fieldTranslations[key]}: ${formatDate(newValue)}`)
      } else {
        changes.push(`${fieldTranslations[key]}: ${newValue || '(無)'}`)
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

// 修改 loadAllUsers 函數
const loadAllUsers = async () => {
  operatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/users/suggestions', {
      params: {
        search: '',
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      // 添加 SYSTEM 用戶到建議列表
      operatorSuggestions.value = [
        {
          _id: '000000000000000000000000',
          name: 'SYSTEM',
          userId: 'SYSTEM'
        },
        ...data.result
      ]
    }
  } catch (error) {
    console.error('載入使用者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入使用者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    operatorSuggestions.value = []
  } finally {
    operatorLoading.value = false
  }
}

// 修改 handleOperatorSearch 函數
const handleOperatorSearch = debounce(async (text) => {
  if (!text) {
    await loadAllUsers()
    return
  }
  operatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/users/suggestions', {
      params: {
        search: text,
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      // 如果搜尋文字包含 SYSTEM（不分大小寫），則加入 SYSTEM 用戶
      const systemUser = {
        _id: '000000000000000000000000',
        name: 'SYSTEM',
        userId: 'SYSTEM'
      }

      operatorSuggestions.value = text.toUpperCase().includes('SYSTEM')
        ? [systemUser, ...data.result]
        : data.result
    }
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

const resetSearch = () => {
  searchCriteria.value = {
    operatorId: null,
    targetId: null,
    action: '',
    targetModel: '',
    dateRange: []
  }
  clearOperatorSearch()
  clearTargetSearch()
  performSearch(true)
}

// 新增 quickSearchText 和 isLoading
const quickSearchText = ref('')
const isLoading = ref(false)

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  performSearch(true)
}, 300)

// 監聽 quickSearchText 的變化
watch(quickSearchText, () => {
  isLoading.value = true
  // 重置表格分頁到第一頁
  tablePage.value = 1
  debouncedSearch()
})

const performSearch = async (resetPage = true) => {
  if (resetPage) {
    tablePage.value = 1
  }
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value
    }

    // 處理排序
    if (tableSortBy.value.length > 0) {
      const sortItem = tableSortBy.value[0]
      params.sortBy = sortItem.key
      params.sortOrder = sortItem.order === 'desc' ? -1 : 1
    }

    // 處理搜尋條件
    if (searchCriteria.value.operatorId?._id) {
      params.operatorId = searchCriteria.value.operatorId._id
    }
    if (searchCriteria.value.action) {
      params.action = searchCriteria.value.action
    }
    if (searchCriteria.value.targetModel) {
      params.targetModel = searchCriteria.value.targetModel
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

    // 處理操作對象
    if (searchCriteria.value.targetId) {
      // console.log('處理操作對象:', searchCriteria.value.targetId)
      if (searchCriteria.value.targetModel === 'formTemplates') {
        // 如果是表單模板，使用 _id
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

const handleTableOptionsChange = async (options) => {
  const isPageChange = tablePage.value !== options.page
  tablePage.value = options.page
  tableItemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }

  // 如果是改變每頁筆數或排序，需要重置到第一頁
  await performSearch(!isPageChange)
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

// 初始載入
onMounted(async () => {
  await Promise.all([
    performSearch(),
    loadAllUsers()
  ])
})

// 修改 formatUserDisplay 函數
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

// 新增刪除相關變數
const deleteDialog = ref(false)
const isDeleting = ref(false)
const selectedOperatorForDelete = ref(null)
const deleteOperatorSuggestions = ref([])
const deleteOperatorLoading = ref(false)
const confirmOperatorName = ref('')
const confirmNameError = ref('')

// 初始化時載入所有使用者
const loadAllUsersForDelete = async () => {
  deleteOperatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/users/suggestions', {
      params: {
        search: '',
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      deleteOperatorSuggestions.value = data.result
    }
  } catch (error) {
    console.error('載入使用者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入使用者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteOperatorLoading.value = false
  }
}

// 搜尋操作人員
const searchOperatorsForDelete = debounce(async (search) => {
  deleteOperatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/users/suggestions', {
      params: {
        search,
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      deleteOperatorSuggestions.value = data.result
    }
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

// 添加確認刪除函數
const confirmDeleteLog = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    item
  }
}

// 添加刪除函數
const deleteLog = async () => {
  try {
    const { data } = await apiAuth.delete(`/auditLogs/${confirmDeleteDialog.value.item._id}`)
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
  }
}

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
