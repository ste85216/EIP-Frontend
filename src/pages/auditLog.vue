<template>
  <v-container max-width="2500">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5">
      <v-col
        cols="12"
        lg="4"
        xl="3"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 px-lg-10"
          >
            <v-card class="elevation-4 rounded-lg py-4 py-sm-8 px-4 px-sm-4 px-xl-8">
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
        lg="8"
        xl="9"
        class="px-6 ps-lg-4 pe-lg-12 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-4 px-md-10 mt-1 bg-white">
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
                  <td
                    class="text-center"
                  >
                    <v-icon
                      icon="mdi-book-open-variant-outline"
                      color="blue-grey-darken-3"
                      size="small"
                      class="my-4"
                      @click="showDetail(item)"
                    />
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
    <v-card class="pa-4">
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
                  v-else-if="selectedItem?.targetModel === 'forms'"
                  class="list-content"
                >
                  <ul class="change-list">
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
      <v-card-actions>
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
  { title: '硬體類型', value: 'hardwareCategories' }
]

// 表格標頭
const tableHeaders = [
  { title: '操作時間', align: 'start', sortable: true, key: 'createdAt' },
  { title: '操作人員', align: 'start', sortable: true, key: 'operator.name' },
  { title: '資料類型', align: 'start', sortable: true, key: 'targetModel' },
  { title: '操作類型', align: 'start', sortable: true, key: 'action' },
  { title: '操作對象', align: 'start', sortable: true, key: 'targetInfo.name' },
  { title: '異動內容', align: 'start', sortable: false, key: 'changes' },
  { title: '查看', align: 'center', sortable: false, key: 'actions' }
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
  adminId: '管理員編號',
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
}

// 行銷分類類型對應
const marketingCategoryTypes = {
  0: '行銷主題',
  1: '廣告渠道',
  2: '平台',
  3: '線別'
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
    0: '一般用戶',
    1: '經理',
    2: '管理者'
  }
  return roleMap[role] || role
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
    hardwareCategories: '硬體類型'
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
      const { year } = item.changes.before
      const theme = item.changes.before.theme?.name || '(無)'
      return `${year}年度 - ${theme}`
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
    return name || '-'
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
    Object.entries(after).forEach(([key, value]) => {
      if (!excludeFields.includes(key) && fieldTranslations[key]) {
        if (key === 'role') {
          changes.push(`${fieldTranslations[key]}: ${formatRole(value)}`)
        } else if (typeof value === 'boolean') {
          changes.push(`${fieldTranslations[key]}: ${formatBoolean(value)}`)
        } else if (key === 'type' && item.targetModel === 'marketingCategories') {
          changes.push(`${fieldTranslations[key]}: ${marketingCategoryTypes[value] || '(無)'}`)
        } else if (key === 'maintenanceDate') {
          changes.push(`${fieldTranslations[key]}: ${formatDate(value)}`)
        } else {
          changes.push(`${fieldTranslations[key]}: ${value || '(無)'}`)
        }
      }
    })
    return changes
  }

  // 處理修改操作
  const { before = {}, after = {}, changedFields = [] } = item.changes
  
  changedFields.forEach(key => {
    if (fieldTranslations[key]) {
      const oldValue = before[key]
      const newValue = after[key]
      
      if (key === 'role') {
        changes.push(`${fieldTranslations[key]}: ${formatRole(oldValue)} → ${formatRole(newValue)}`)
      } else if (typeof oldValue === 'boolean' || typeof newValue === 'boolean') {
        changes.push(`${fieldTranslations[key]}: ${formatBoolean(oldValue)} → ${formatBoolean(newValue)}`)
      } else if (key === 'type' && item.targetModel === 'marketingCategories') {
        changes.push(`${fieldTranslations[key]}: ${marketingCategoryTypes[oldValue] || '(無)'} → ${marketingCategoryTypes[newValue] || '(無)'}`)
      } else if (key === 'maintenanceDate') {
        changes.push(`${fieldTranslations[key]}: ${formatDate(oldValue)} → ${formatDate(newValue)}`)
      } else {
        changes.push(`${fieldTranslations[key]}: ${oldValue || '(無)'} → ${newValue || '(無)'}`)
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

// 添加載入所有使用者的函數
const loadAllUsers = async () => {
  operatorLoading.value = true
  try {
    const { data } = await apiAuth.get('/user/suggestions', {
      params: { search: '' }
    })
    if (data.success) {
      operatorSuggestions.value = data.result
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
    const { data } = await apiAuth.get('/user/suggestions', {
      params: { search: text }
    })
    if (data.success) {
      operatorSuggestions.value = data.result
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
  performSearch()
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
  // 重置表格分頁到第一頁
  tablePage.value = 1
  debouncedSearch()
})

const performSearch = async () => {
  // console.log('開始執行搜尋，搜尋條件:', searchCriteria.value)
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
  tablePage.value = options.page
  tableItemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }
  await performSearch()
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

// 修改 formatTargetDisplay 函數
// const formatTargetDisplay = (item) => {
//   if (!item) return ''
  
//   let date
  
//   switch (targetType.value) {
//     case 'users':
//       if (item.adminId) {
//         return `${item.name} (${item.adminId})`
//       }
//       return `${item.name}${item.userId ? ` (${item.userId})` : ''}`
//     case 'forms':
//       return `${item.formNumber}${item.clientName ? ` - ${item.clientName}` : ''}`
//     case 'formTemplates':
//       return item.name || ''
//     case 'marketingCategories':
//       return `${item.name} (${marketingCategoryTypes[item.type]})`
//     case 'marketingExpenses':
//       date = formatDateTime(item.invoiceDate).split(' ')[0] // 只取日期部分
//       return `${date} - ${item.theme?.name || ''}`
//     default:
//       return ''
//   }
// }

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
</style>
