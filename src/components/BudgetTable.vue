<template>
  <div class="budget-table">
    <v-table
      density="compact"
      :class="{ 'mini-table': isMini }"
    >
      <thead>
        <tr>
          <th v-if="orderNumbers">
            #
          </th>
          <th>廣告渠道</th>
          <th>平台</th>
          <th
            v-for="(month, key) in monthList"
            :key="key"
            class="text-center"
          >
            {{ month }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="(channelGroup, channelId) in groupedItems"
          :key="channelId"
        >
          <template
            v-for="(item, index) in channelGroup"
            :key="`${item.channel._id}-${item.platform._id}`"
          >
            <tr>
              <td
                v-if="orderNumbers"
                class="text-center order-number"
                :class="{ 'order-changed': hasOrderChanged(item) }"
              >
                {{ index + 1 }}
                <template v-if="hasOrderChanged(item)">
                  <div class="order-change-indicator">
                    {{ getOrderChangeText(item) }}
                  </div>
                </template>
              </td>
              <td
                v-if="index === 0"
                :rowspan="channelGroup.length"
                class="text-center"
                :class="{ 'changed-field': isFieldChanged(item, 'channel') }"
              >
                {{ item.channel.name }}
              </td>
              <td 
                class="text-center"
                :class="{ 'changed-field': isFieldChanged(item, 'platform') }"
              >
                {{ item.platform.name }}
              </td>
              <td
                v-for="(month, key) in monthList"
                :key="key"
                class="text-center"
                :class="{ 'changed-field': isFieldChanged(item, key) }"
              >
                {{ formatNumber(item.monthlyBudget[key]) }}
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  changedFields: {
    type: Array,
    default: () => []
  },
  orderNumbers: {
    type: Boolean,
    default: false
  },
  orderChanges: {
    type: Object,
    default: () => ({})
  },
  isMini: {
    type: Boolean,
    default: false
  }
})

const monthList = {
  JAN: '一月',
  FEB: '二月',
  MAR: '三月',
  APR: '四月',
  MAY: '五月',
  JUN: '六月',
  JUL: '七月',
  AUG: '八月',
  SEP: '九月',
  OCT: '十月',
  NOV: '十一月',
  DEC: '十二月'
}

const groupedItems = computed(() => {
  // 檢查是否為異動紀錄資料
  const isAuditLog = props.data?.changes !== undefined
  
  // 根據不同情況選擇資料來源
  let sourceData = null
  if (isAuditLog) {
    // 如果是異動紀錄，根據操作類型選擇資料
    if (props.data.action === '創建') {
      sourceData = props.data.changes.after
    } else if (props.data.action === '刪除') {
      sourceData = props.data.changes.before
    } else {
      sourceData = props.data.changes.after || props.data.changes.before
    }
  } else {
    // 如果是直接的預算資料
    sourceData = props.data
  }

  // 如果沒有資料，返回空物件
  if (!sourceData?.items) return {}

  return sourceData.items.reduce((acc, item) => {
    // 確保 channel 和 platform 物件存在
    const channel = item?.channel || {}
    const platform = item?.platform || {}
    
    // 使用 name 作為主要識別符，如果沒有則使用 _id
    const channelId = channel.name || 
                     (channel._id?.$oid ? channel._id.$oid : channel._id) || 
                     '未知渠道'
    
    if (!acc[channelId]) {
      acc[channelId] = []
    }
    
    // 保持原始資料結構，但確保所有必要的屬性都存在
    acc[channelId].push({
      channel: {
        _id: channel._id?.$oid || channel._id || channelId,
        name: channel.name || channelId
      },
      platform: {
        _id: platform._id?.$oid || platform._id || '未知平台',
        name: platform.name || '未知平台'
      },
      monthlyBudget: item?.monthlyBudget || {}
    })
    
    return acc
  }, {})
})

const formatNumber = (value) => {
  if (value === undefined || value === null || value === '') return '-'
  return new Intl.NumberFormat('zh-TW').format(value)
}

const isFieldChanged = (item, monthKey) => {
  if (!props.changedFields?.length) return false
  
  // 檢查是否為異動紀錄資料
  const isAuditLog = props.data?.changes !== undefined
  if (!isAuditLog) return false

  // 如果 changedFields 包含 "items"，表示整個 items 陣列都有變更
  if (props.changedFields.includes('items')) {
    // 檢查 before 和 after 的值是否不同
    const beforeItem = findItemInChanges(props.data.changes.before?.items, item)
    const afterItem = findItemInChanges(props.data.changes.after?.items, item)

    if (monthKey === 'channel' || monthKey === 'platform') {
      return false // 因為渠道和平台沒有變更，只有預算變更
    }

    // 檢查特定月份的預算是否有變更
    const beforeValue = beforeItem?.monthlyBudget?.[monthKey]
    const afterValue = afterItem?.monthlyBudget?.[monthKey]
    return beforeValue !== afterValue
  }

  return false
}

// 新增一個輔助函數來在 changes 中找到對應的項目
const findItemInChanges = (items = [], targetItem) => {
  if (!items?.length) return null
  
  return items.find(item => {
    const sourceChannel = item?.channel || {}
    const targetChannel = targetItem?.channel || {}
    const sourcePlatform = item?.platform || {}
    const targetPlatform = targetItem?.platform || {}
    
    const sourceChannelId = sourceChannel._id?.$oid || sourceChannel._id
    const targetChannelId = targetChannel._id?.$oid || targetChannel._id
    const sourcePlatformId = sourcePlatform._id?.$oid || sourcePlatform._id
    const targetPlatformId = targetPlatform._id?.$oid || targetPlatform._id
    
    return sourceChannelId === targetChannelId && sourcePlatformId === targetPlatformId
  })
}

const hasOrderChanged = (item) => {
  if (!props.orderChanges) return false
  
  // 檢查是否為異動紀錄資料
  const isAuditLog = props.data?.changes !== undefined
  if (!isAuditLog) return false

  // 確保 channel 和 platform 物件存在
  const channelName = item?.channel?.name || '未知渠道'
  const platformName = item?.platform?.name || '未知平台'
  const key = `${channelName}-${platformName}`
  
  return props.orderChanges[key] !== undefined
}

const getOrderChangeText = (item) => {
  if (!hasOrderChanged(item)) return ''
  
  // 檢查是否為異動紀錄資料
  const isAuditLog = props.data?.changes !== undefined
  if (!isAuditLog) return ''

  // 確保 channel 和 platform 物件存在
  const channelName = item?.channel?.name || '未知渠道'
  const platformName = item?.platform?.name || '未知平台'
  const key = `${channelName}-${platformName}`
  
  const change = props.orderChanges[key]
  if (!change) return ''
  
  return `← ${change.oldIndex}`
}
</script>

<style lang="scss" scoped>
.budget-table {
  width: 100%;
  overflow-x: auto;
}

.mini-table {
  :deep(.v-table) {
    th, td {
      padding: 4px 8px !important;
    }
  }
}

:deep(.v-table) {
  thead {
    tr th {
      font-size: 11px !important;
      font-weight: 600;
      white-space: nowrap;
      background: #455A64;
      color: white;
      text-align: center !important;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  
  tbody {
    tr {
      font-size: 11px !important;
    }

    template:nth-child(odd) {
      tr {
        background: #f3f7f7;
      }
    }

    template:nth-child(even) {
      tr {
        background: #fff8e1;
      }
    }

    td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      
      &[rowspan] {
        background: #eceff1;
        border-right: 1px solid rgba(0, 0, 0, 0.2);
        font-weight: 500;
      }
    }
  }
}

.order-number {
  position: relative;
  font-weight: 500;
  
  &.order-changed {
    color: #d32f2f;
    background-color: #ffebee;
  }
}

.order-change-indicator {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  font-size: 10px;
  color: #d32f2f;
  white-space: nowrap;
}

:deep(.changed-field) {
  color: #ff5252;
  font-weight: 600;
  background-color: #ffebee;
}
</style> 