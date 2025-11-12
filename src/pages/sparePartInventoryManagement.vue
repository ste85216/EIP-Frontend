<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="5"
        class="ps-3 d-flex align-center"
      >
        <h3>備品庫存管理</h3>
      </v-col>
      <v-spacer />
      <!-- 快速搜尋區塊 -->
      <v-col
        cols="7"
        sm="5"
        md="4"
        lg="3"
        xl="2"
        class="ps-3"
      >
        <v-text-field
          v-model="quickSearchText"
          label="快速搜尋"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
      </v-col>

      <!-- 表格區塊 -->
      <v-col cols="12">
        <v-data-table
          :items="groupedInventoryList"
          :headers="headers"
          :loading="loading"
          density="compact"
          class="inventory-table mt-4 rounded-ts-lg rounded-te-lg"
          :items-per-page="itemsPerPage"
          :page="page"
          @update:page="page = $event"
        >
          <template #item="{ item }">
            <template v-if="item.isGroup">
              <!-- 備品分組標題行 -->
              <tr
                :class="{
                  'group-header-odd': item.index % 2 === 0,
                  'group-header-even': item.index % 2 !== 0,
                  'is-last-group': item.index === groupedInventoryList.length - 1
                }"
              >
                <td
                  :rowspan="item.warehouseCount"
                  class="spare-part-col left-group align-top pa-4 text-center"
                >
                  <span class="sub-title">{{ item.sparePartName }}</span>
                </td>
                <td
                  :rowspan="item.warehouseCount"
                  class="total-quantity-col left-group align-top pa-4 text-center"
                >
                  <span class="sub-title">{{ formatNumber(item.totalQuantity) }}</span>
                </td>
                <td :class="['warehouse-col right-group pa-2 text-center', item.globalStartIndex % 2 === 0 ? 'warehouse-row-odd' : 'warehouse-row-even']">
                  {{ item.warehouses[0]?.warehouseName || '-' }}
                </td>
                <td :class="['quantity-col right-group text-center pa-2', item.globalStartIndex % 2 === 0 ? 'warehouse-row-odd' : 'warehouse-row-even']">
                  <span class="font-weight-bold">{{ formatNumber(item.warehouses[0]?.quantity || 0) }}</span>
                </td>
                <td :class="['actions-col right-group text-center pa-2', item.globalStartIndex % 2 === 0 ? 'warehouse-row-odd' : 'warehouse-row-even']">
                  <v-btn
                    v-if="item.warehouses[0]?.inventoryId"
                    icon
                    color="blue-grey-darken-2"
                    variant="plain"
                    size="22"
                    class="mx-1"
                    :ripple="false"
                    @click="viewHistory(item, item.warehouses[0])"
                  >
                    <v-icon>mdi-history</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="teal-darken-1"
                    variant="plain"
                    size="22"
                    class="mx-1"
                    :ripple="false"
                    @click="openAdjustDialog(item, item.warehouses[0])"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </td>
              </tr>
              <!-- 其他倉庫行 -->
              <tr
                v-for="(warehouse, index) in item.warehouses.slice(1)"
                :key="warehouse.inventoryId || index"
                :class="{ 'warehouse-row-odd': (item.globalStartIndex + index + 1) % 2 === 0, 'warehouse-row-even': (item.globalStartIndex + index + 1) % 2 !== 0 }"
              >
                <td class="warehouse-col right-group pa-2 text-center">
                  {{ warehouse.warehouseName || '-' }}
                </td>
                <td class="quantity-col right-group text-center pa-2">
                  <span class="font-weight-bold">{{ formatNumber(warehouse.quantity || 0) }}</span>
                </td>
                <td class="actions-col right-group text-center pa-2">
                  <v-btn
                    v-if="warehouse.inventoryId"
                    icon
                    color="blue-grey-darken-2"
                    variant="plain"
                    size="22"
                    class="mx-1"
                    :ripple="false"
                    @click="viewHistory(item, warehouse)"
                  >
                    <v-icon>mdi-history</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="teal-darken-1"
                    variant="plain"
                    size="22"
                    class="mx-1"
                    :ripple="false"
                    @click="openAdjustDialog(item, warehouse)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 調整庫存對話框 -->
    <v-dialog
      v-model="adjustDialog.open"
      persistent
      width="600"
      :fullscreen="!smAndUp"
      :no-click-animation="adjustSubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-teal-darken-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-pencil
          </v-icon>
          {{ adjustDialog.inventoryId ? '調整庫存' : '新增庫存' }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeAdjustDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-0 mb-0 px-6">
          <!-- 資訊提示 -->
          <div class="mb-6 mt-3 rounded">
            <div class="card-title">
              <span class="font-weight-bold me-3 text-grey-darken-3 ">備品 : <span class="text-teal-darken-1">{{ adjustDialog.sparePartName || '-' }} </span></span>
              <span class="font-weight-bold me-3 text-grey-darken-3 ">倉庫 : <span class="text-teal-darken-1">{{ adjustDialog.warehouseName || '-' }}</span></span>
              <span class="font-weight-bold me-3 text-grey-darken-3 ">目前數量 : <span class="text-teal-darken-1">{{ formatNumber(adjustDialog.currentQuantity || 0) }}</span></span>
            </div>
          </div>

          <v-form
            ref="adjustForm"
            v-model="adjustFormValid"
            :disabled="adjustSubmitting"
            @submit.prevent="submitAdjust"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="adjustFormData.quantityChange"
                  label="*數量變更"
                  variant="outlined"
                  density="compact"
                  type="number"
                  :rules="[
                    v => (v !== null && v !== undefined && v !== '') || '請輸入數量變更',
                    v => (v !== 0) || '數量變更不能為0'
                  ]"
                  hint="正數為增加，負數為減少"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="adjustFormData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rows="3"
                  clearable
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                @click="closeAdjustDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :size="buttonSize"
                :loading="adjustSubmitting"
              >
                確認
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 歷史紀錄對話框 -->
    <v-dialog
      v-model="historyDialog.open"
      persistent
      width="820"
      :fullscreen="!smAndUp"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-history
          </v-icon>
          歷史紀錄 - {{ historyDialog.sparePartName }} - {{ historyDialog.warehouseName }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeHistoryDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-4 mb-0 px-6">
          <v-data-table
            :items="historyList"
            :headers="historyHeaders"
            :loading="historyLoading"
            density="compact"
            class="history-table border rounded-lg"
            :items-per-page="historyItemsPerPage"
            :page="historyPage"
            @update:page="historyPage = $event"
          >
            <template #[`item.operator`]="{ item }">
              {{ item.operator?.name || item.operatorId?.name || '-' }}
            </template>
            <template #[`item.action`]="{ item }">
              <template v-if="item.action === '創建'">
                <template v-if="item.changes?.after?.quantityChange > 0">
                  入庫
                </template>
                <template v-else-if="item.changes?.after?.quantityChange < 0">
                  出庫
                </template>
                <template v-else>
                  新增
                </template>
              </template>
              <template v-else-if="item.action === '修改'">
                <template v-if="item.changes?.after?.quantityChange > 0">
                  入庫
                </template>
                <template v-else-if="item.changes?.after?.quantityChange < 0">
                  出庫
                </template>
                <template v-else>
                  調整
                </template>
              </template>
              <template v-else>
                {{ item.action }}
              </template>
            </template>
            <template #[`item.quantityChange`]="{ item }">
              <span :class="item.changes?.after?.quantityChange >= 0 ? 'text-success' : 'text-error'">
                {{ item.changes?.after?.quantityChange >= 0 ? '+' : '' }}{{ formatNumber(item.changes?.after?.quantityChange || 0) }}
              </span>
            </template>
            <template #[`item.quantity`]="{ item }">
              {{ formatNumber(item.changes?.after?.quantity || 0) }}
            </template>
            <template #[`item.note`]="{ item }">
              {{ item.changes?.after?.note || '-' }}
            </template>
            <template #[`item.createdAt`]="{ item }">
              {{ formatDateTime(item.createdAt) }}
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            :size="buttonSize"
            @click="closeHistoryDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

const { apiAuth } = useApi()

definePage({
  meta: {
    title: '備品庫存管理 | Ystravel',
    login: true,
    permission: 'SPARE_PART_INVENTORY_MANAGEMENT_READ'
  }
})

const { smAndUp } = useDisplay()
const createSnackbar = useSnackbar()

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 狀態 =====
const loading = ref(false)
const inventoryData = ref([]) // 存儲所有庫存資料
const page = ref(1)
const itemsPerPage = ref(10)
const quickSearchText = ref('')

// ===== 表格標題 =====
const headers = [
  { title: '備品名稱', key: 'sparePartName', sortable: false, align: 'center' },
  { title: '總數量', key: 'totalQuantity', sortable: false, align: 'center' },
  { title: '倉庫', key: 'warehouse', sortable: false, align: 'center' },
  { title: '倉庫數量', key: 'quantity', sortable: false, align: 'center' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

// ===== 分組庫存列表 =====
const groupedInventoryList = computed(() => {
  const groups = {}
  let index = 0

  // 建立 active 備品的 ID 集合
  const activeSparePartIds = new Set(
    spareParts.value
      .filter(sp => sp.isActive !== false)
      .map(sp => sp._id.toString())
  )

  inventoryData.value.forEach(inv => {
    const sparePartId = inv.sparePart?._id
    if (!sparePartId) return

    // 只處理 active 的備品
    if (!activeSparePartIds.has(sparePartId.toString())) return

    if (!groups[sparePartId]) {
      groups[sparePartId] = {
        sparePartId,
        sparePartName: inv.sparePart?.name || '',
        warehouses: [],
        totalQuantity: 0,
        isGroup: true,
        index: index++,
        order: inv.sparePart?.order || 0,
        createdAt: inv.sparePart?.createdAt || null
      }
    }

    const warehouse = {
      warehouseId: inv.warehouse?._id || '',
      warehouseName: inv.warehouse?.name || '',
      inventoryId: inv._id,
      quantity: inv.quantity || 0,
      warehouse: inv.warehouse // 保留完整的 warehouse 物件以便排序
    }

    groups[sparePartId].warehouses.push(warehouse)
    groups[sparePartId].totalQuantity += warehouse.quantity
  })

  // 對每個備品的倉庫按照 order 排序
  Object.values(groups).forEach(group => {
    group.warehouses.sort((a, b) => {
      const orderA = a.warehouse?.order || 0
      const orderB = b.warehouse?.order || 0
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // 如果 order 相同，按照名稱排序
      const nameA = a.warehouseName || ''
      const nameB = b.warehouseName || ''
      return nameA.localeCompare(nameB)
    })
  })

  const groupsArray = Object.values(groups)

  // 按照 order 排序
  groupsArray.sort((a, b) => {
    const orderA = a.order || 0
    const orderB = b.order || 0
    if (orderA !== orderB) {
      return orderA - orderB
    }
    // 如果 order 相同，按照建立時間排序
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  })

  // 計算每個備品的全局起始行索引
  let globalRowIndex = 0
  let result = groupsArray.map(group => {
    const resultItem = {
      ...group,
      warehouseCount: group.warehouses.length,
      globalStartIndex: globalRowIndex
    }
    globalRowIndex += group.warehouses.length
    return resultItem
  })

  // 如果有搜尋文字，過濾結果
  if (quickSearchText.value && quickSearchText.value.trim()) {
    const searchText = quickSearchText.value.trim().toLowerCase()
    result = result.filter(group =>
      group.sparePartName.toLowerCase().includes(searchText)
    )
    // 重新計算全局起始行索引
    globalRowIndex = 0
    result = result.map(group => {
      const resultItem = {
        ...group,
        globalStartIndex: globalRowIndex
      }
      globalRowIndex += group.warehouses.length
      return resultItem
    })
  }

  return result
})

// ===== 備品列表（用於檢查 active 狀態） =====
const spareParts = ref([])

// ===== 調整庫存對話框 =====
const adjustDialog = ref({
  open: false,
  sparePartId: '',
  sparePartName: '',
  warehouseId: '',
  warehouseName: '',
  inventoryId: null,
  currentQuantity: 0
})

const adjustForm = ref(null)
const adjustFormValid = ref(false)
const adjustSubmitting = ref(false)
const adjustFormData = ref({
  quantityChange: null,
  note: ''
})

// ===== 歷史紀錄對話框 =====
const historyDialog = ref({
  open: false,
  inventoryId: '',
  sparePartName: '',
  warehouseName: ''
})

const historyList = ref([])
const historyLoading = ref(false)
const historyPage = ref(1)
const historyItemsPerPage = ref(25)

const historyHeaders = [
  { title: '操作者', key: 'operator', sortable: false },
  { title: '操作', key: 'action', sortable: false },
  { title: '數量變更', key: 'quantityChange', sortable: false, align: 'center' },
  { title: '調整後數量', key: 'quantity', sortable: false, align: 'center' },
  { title: '備註', key: 'note', sortable: false, align: 'center' },
  { title: '時間', key: 'createdAt', sortable: false, align: 'center' }
]

// ===== 方法 =====
const loadInventory = async () => {
  try {
    loading.value = true

    // 先載入所有 active 的備品
    const { data: sparePartsData } = await apiAuth.get('/spareParts', {
      params: {
        activeOnly: 'true',
        page: 1,
        itemsPerPage: 9999
      }
    })

    if (!sparePartsData.success) {
      throw new Error('載入備品列表失敗')
    }

    spareParts.value = sparePartsData.result.data || []

    // 為每個 active 備品載入其庫存資料
    const allInventoryData = []

    for (const sparePart of spareParts.value) {
      // 獲取該備品在各倉庫的庫存
      const { data: inventoryData } = await apiAuth.get(`/sparePartInventories/spare-part/${sparePart._id}`)

      if (inventoryData.success && inventoryData.result.data && inventoryData.result.data.length > 0) {
        // 將庫存資料添加到列表
        allInventoryData.push(...inventoryData.result.data.map(inv => ({
          _id: inv._id,
          sparePart: {
            _id: sparePart._id,
            name: sparePart.name,
            order: sparePart.order || 0,
            createdAt: sparePart.createdAt
          },
          warehouse: inv.warehouse ? {
            ...inv.warehouse,
            order: inv.warehouse.order || 0
          } : null,
          quantity: inv.quantity || 0,
          lastModifier: inv.lastModifier
        })))
      } else {
        // 如果沒有庫存記錄，但備品有倉庫設定，則為每個倉庫建立初始庫存記錄
        if (sparePart.warehouses && sparePart.warehouses.length > 0) {
          for (const warehouse of sparePart.warehouses) {
            const warehouseId = warehouse._id || warehouse
            try {
              const { data: adjustData } = await apiAuth.post('/sparePartInventories/adjust', {
                sparePart: sparePart._id,
                warehouse: warehouseId,
                quantityChange: 0,
                note: '初始化庫存記錄'
              })
              if (adjustData.success) {
                allInventoryData.push({
                  _id: adjustData.result._id,
                  sparePart: {
                    _id: sparePart._id,
                    name: sparePart.name,
                    order: sparePart.order || 0,
                    createdAt: sparePart.createdAt
                  },
                  warehouse: adjustData.result.warehouse ? {
                    ...adjustData.result.warehouse,
                    order: adjustData.result.warehouse.order || 0
                  } : null,
                  quantity: adjustData.result.quantity || 0,
                  lastModifier: adjustData.result.lastModifier
                })
              }
            } catch (error) {
              console.error(`為備品 ${sparePart.name} 在倉庫 ${warehouse.name || warehouseId} 建立庫存記錄失敗:`, error)
            }
          }
        }
      }
    }

    inventoryData.value = allInventoryData
  } catch (error) {
    console.error('載入庫存資料失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '載入庫存資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}


const openAdjustDialog = (sparePart, warehouse) => {
  adjustDialog.value = {
    open: true,
    sparePartId: sparePart.sparePartId || sparePart._id || '',
    sparePartName: sparePart.sparePartName || sparePart.name || '',
    warehouseId: warehouse.warehouseId || warehouse._id || '',
    warehouseName: warehouse.warehouseName || warehouse.name || '',
    inventoryId: warehouse.inventoryId || null,
    currentQuantity: warehouse.quantity || 0
  }
  adjustFormData.value = {
    quantityChange: null,
    note: ''
  }
  if (adjustForm.value) {
    adjustForm.value.reset()
  }
}

const closeAdjustDialog = () => {
  adjustDialog.value = {
    open: false,
    sparePartId: '',
    sparePartName: '',
    warehouseId: '',
    warehouseName: '',
    inventoryId: null,
    currentQuantity: 0
  }
  adjustFormData.value = {
    quantityChange: null,
    note: ''
  }
  if (adjustForm.value) {
    adjustForm.value.reset()
  }
}

const submitAdjust = async () => {
  const { valid } = await adjustForm.value.validate()
  if (!valid) return

  try {
    adjustSubmitting.value = true

    const { data } = await apiAuth.post('/sparePartInventories/adjust', {
      sparePart: adjustDialog.value.sparePartId,
      warehouse: adjustDialog.value.warehouseId,
      quantityChange: adjustFormData.value.quantityChange,
      note: adjustFormData.value.note || ''
    })

    if (data.success) {
      // 更新本地資料
      const inventoryIndex = inventoryData.value.findIndex(inv =>
        inv._id === data.result._id ||
        (inv.sparePart?._id?.toString() === adjustDialog.value.sparePartId.toString() &&
         inv.warehouse?._id?.toString() === adjustDialog.value.warehouseId.toString())
      )

      if (inventoryIndex >= 0) {
        // 保留原有的備品和倉庫完整資訊（包含 order）
        const existingInv = inventoryData.value[inventoryIndex]
        inventoryData.value[inventoryIndex] = {
          _id: data.result._id,
          sparePart: existingInv.sparePart || {
            _id: adjustDialog.value.sparePartId,
            name: adjustDialog.value.sparePartName
          },
          warehouse: data.result.warehouse || existingInv.warehouse,
          quantity: data.result.quantity || 0,
          lastModifier: data.result.lastModifier
        }
      } else {
        inventoryData.value.push({
          _id: data.result._id,
          sparePart: {
            _id: adjustDialog.value.sparePartId,
            name: adjustDialog.value.sparePartName
          },
          warehouse: data.result.warehouse,
          quantity: data.result.quantity || 0,
          lastModifier: data.result.lastModifier
        })
      }

      createSnackbar({
        text: '庫存調整成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeAdjustDialog()
      // 重新載入庫存資料以確保資料同步
      await loadInventory()
    }
  } catch (error) {
    console.error('調整庫存失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '調整庫存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    adjustSubmitting.value = false
  }
}

const viewHistory = async (sparePart, warehouse) => {
  if (!warehouse.inventoryId) {
    createSnackbar({
      text: '該倉庫尚未有庫存記錄',
      snackbarProps: { color: 'orange-darken-1' }
    })
    return
  }

  historyDialog.value = {
    open: true,
    inventoryId: warehouse.inventoryId,
    sparePartName: sparePart.sparePartName || sparePart.name || '',
    warehouseName: warehouse.warehouseName || warehouse.name || ''
  }

  await loadHistory()
}

const loadHistory = async () => {
  try {
    historyLoading.value = true
    // 獲取該庫存記錄的所有異動紀錄（使用新的 API endpoint，只需要 SPARE_PART_READ 權限）
    const { data } = await apiAuth.get('/auditLogs/spare-part-inventories', {
      params: {
        targetId: historyDialog.value.inventoryId,
        page: 1,
        itemsPerPage: 9999
      }
    })

    if (data.success) {
      historyList.value = data.result.data || []
      // 調試：檢查第一筆資料的結構
      if (historyList.value.length > 0) {
        console.log('歷史紀錄資料範例:', historyList.value[0])
        console.log('操作者資訊:', {
          operator: historyList.value[0].operator,
          operatorId: historyList.value[0].operatorId
        })
        console.log('操作類型:', historyList.value[0].action)
        console.log('數量變更:', historyList.value[0].changes?.after?.quantityChange)
        console.log('完整 changes:', historyList.value[0].changes)
      }
    }
  } catch (error) {
    console.error('載入歷史紀錄失敗:', error)
    createSnackbar({
      text: error.response?.data?.message || '載入歷史紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    historyLoading.value = false
  }
}

const closeHistoryDialog = () => {
  historyDialog.value = {
    open: false,
    inventoryId: '',
    sparePartName: '',
    warehouseName: ''
  }
  historyList.value = []
  historyPage.value = 1
}

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'
  return new Intl.NumberFormat('zh-TW').format(value)
}

const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 監聽搜尋文字變化，重置頁碼
watch(quickSearchText, () => {
  page.value = 1
})

onMounted(async () => {
  await loadInventory()
})
</script>

<style lang="scss" scoped>

// 主表格樣式
.inventory-table {
  :deep(thead) {
    height: 48px;
    background-color: #455a64 !important;
    color: #fff !important;
    th {
      font-size: 13px !important;
    }
  }
  tbody tr {
    min-height: 48px;
  }
  td {
    height: 48px !important;
    div {
      line-height: 1.6;
    }
  }
}

.inventory-table :deep(tbody) {
  td {
    font-size: 13px !important;
    transition: none !important;
  }
}

.spare-part-col {
  border-right: 1px solid #e0e0e0;
}

.group-header-odd .spare-part-col {
  background-color: #e9f3f3;
}

.group-header-even .spare-part-col {
  background-color: #e4f3fa;
}

// 移除最後一個備品分組的下邊框
.is-last-group .spare-part-col,
.is-last-group .total-quantity-col {
  border-bottom: none !important;
}

.total-quantity-col {
  border-right: 1px solid #e0e0e0;
}

.group-header-odd .total-quantity-col {
  background-color: #e9f3f3;
}

.group-header-even .total-quantity-col {
  background-color: #e4f3fa;
}

// 倉庫行交錯顏色
.warehouse-row-odd {
  background-color: #ffffff;
}

.warehouse-row-even {
  background-color: #f5f5f5;
}

// Hover 效果 - 左右分組
.inventory-table :deep(tbody) {
  // 左邊組 hover：當滑鼠移到左邊任一欄位時，兩個左邊欄位一起變色
  // 直接 hover 到左邊欄位時變色（立即變色，無 transition）
  .left-group:hover {
    background-color: #eee !important;
    transition: none !important;
  }

  // 當 hover 到左邊第一個欄位時，讓第二個欄位也變色（使用相鄰選擇器）
  .spare-part-col.left-group:hover ~ .total-quantity-col.left-group {
    background-color: #eee !important;
    transition: none !important;
  }

  // 當 hover 到左邊第二個欄位時，讓第一個欄位也變色
  // 使用 :has() 選擇器選擇包含 hover 左邊第二個欄位的行，但只影響左邊欄位
  tr:has(.total-quantity-col.left-group:hover) .spare-part-col.left-group {
    background-color: #eee !important;
    transition: none !important;
  }

  // 當 hover 到左邊第一個欄位時，確保第二個欄位也變色（使用 :has() 選擇器）
  tr:has(.spare-part-col.left-group:hover) .total-quantity-col.left-group {
    background-color: #eee !important;
    transition: none !important;
  }

  // 右邊組 hover：當滑鼠移到右邊任一欄位時，同一行的三個右邊欄位一起變色
  // 直接 hover 到右邊欄位時變色（立即變色，無 transition）
  .right-group:hover {
    background-color: #fff3e0 !important;
    transition: none !important;
  }

  // 當 hover 到右邊任一欄位時，讓同一行的所有右邊欄位都變色
  // 只選擇右邊欄位，不影響左邊欄位
  tr:has(.warehouse-col.right-group:hover) .warehouse-col.right-group,
  tr:has(.warehouse-col.right-group:hover) .quantity-col.right-group,
  tr:has(.warehouse-col.right-group:hover) .actions-col.right-group,
  tr:has(.quantity-col.right-group:hover) .warehouse-col.right-group,
  tr:has(.quantity-col.right-group:hover) .quantity-col.right-group,
  tr:has(.quantity-col.right-group:hover) .actions-col.right-group,
  tr:has(.actions-col.right-group:hover) .warehouse-col.right-group,
  tr:has(.actions-col.right-group:hover) .quantity-col.right-group,
  tr:has(.actions-col.right-group:hover) .actions-col.right-group {
    background-color: #eee !important;
    transition: none !important;
  }
}

// 歷史紀錄對話框表格樣式
.history-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.history-table :deep(.v-data-table__td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.history-table :deep(.v-data-table__th) {
  padding: 12px 16px;
  font-weight: 600;
  background-color: #fff !important;
  color: #333 !important;
}

.history-table :deep(.v-data-table__tr) {
  transition: background-color 0.2s ease;
}

.history-table :deep(tbody tr:nth-child(odd)) {
  background-color: #f9f9f9;
}

.history-table :deep(.v-data-table__tr:hover) {
  background-color: #eee;
}
</style>

