<template>
  <div class="budget-table">
    <v-table
      density="compact"
      :class="{ 'mini-table': isMini }"
    >
      <thead>
        <tr>
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
  if (!props.data?.items) return {}
  
  return props.data.items.reduce((acc, item) => {
    const channelId = item.channel._id || item.channel.$oid || item.channel
    if (!acc[channelId]) {
      acc[channelId] = []
    }
    acc[channelId].push(item)
    return acc
  }, {})
})

const formatNumber = (value) => {
  if (value === undefined || value === null || value === '') return '-'
  return new Intl.NumberFormat('zh-TW').format(value)
}

const isFieldChanged = (item, monthKey) => {
  if (!props.changedFields?.length) return false
  
  const channelId = item.channel._id || item.channel.$oid || item.channel
  const platformId = item.platform._id || item.platform.$oid || item.platform
  
  // 如果是檢查渠道名稱欄位
  if (monthKey === 'channel') {
    return props.changedFields.includes(`items.${channelId}.${platformId}.channel`)
  }
  
  // 如果是檢查平台名稱欄位
  if (monthKey === 'platform') {
    return props.changedFields.includes(`items.${channelId}.${platformId}.platform`)
  }
  
  // 檢查月份預算變更
  const fieldPath = `items.${channelId}.${platformId}.monthlyBudget.${monthKey}`
  return props.changedFields.includes(fieldPath)
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
      font-size: 12px !important;
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
      font-size: 12px !important;
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

:deep(.changed-field) {
  color: #d32f2f !important;
  font-weight: 600 !important;
  background-color: #ffebee !important;
}
</style> 