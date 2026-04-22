<template>
  <div class="budget-change-table">
    <template v-if="action === '創建'">
      <div class="single-table">
        <div class="table-title mb-2">
          新增預算表
        </div>
        <budget-table
          :data="changes.after"
          :is-mini="true"
        />
      </div>
    </template>

    <template v-else-if="action === '修改'">
      <!-- 只修改基本資料時，不顯示表格 -->
      <template v-if="isBasicInfoChangeOnly">
        <ul class="change-list">
          <li v-if="hasYearChanged">
            年度：{{ changes.before.year }} → {{ changes.after.year }}
          </li>
          <li v-if="hasThemeChanged">
            行銷主題：{{ changes.before.theme?.name || '(無)' }} → {{ changes.after.theme?.name || '(無)' }}
          </li>
          <li v-if="hasNoteChanged">
            備註：{{ changes.before.note || '(無)' }} → {{ changes.after.note || '(無)' }}
          </li>
        </ul>
      </template>

      <!-- 修改預算項目時才顯示表格 -->
      <template v-else>
        <div class="tables-container">
          <div class="table-wrapper">
            <div class="table-title mb-2">
              修改前
            </div>
            <budget-table
              :data="changes.before"
              :changed-fields="changedFields"
              :change-map="changeMap"
              :is-mini="true"
            />
          </div>
          
          <div class="arrow-wrapper">
            <v-icon
              size="40"
              color="light-blue-lighten-1"
            >
              mdi-arrow-right-bold
            </v-icon>
          </div>

          <div class="table-wrapper">
            <div class="table-title mb-2">
              修改後
            </div>
            <budget-table
              :data="changes.after"
              :changed-fields="changedFields"
              :change-map="changeMap"
              :is-mini="true"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import BudgetTable from './BudgetTable.vue'
import { computed } from 'vue'

const props = defineProps({
  action: {
    type: String,
    required: true
  },
  changes: {
    type: Object,
    required: true
  }
})

// 判斷是否只修改基本資料
const isBasicInfoChangeOnly = computed(() => {
  if (!props.changes?.changedFields) return false
  return !props.changes.changedFields.some(field => field.startsWith('items'))
})

// 檢查各基本欄位是否有變更
const hasYearChanged = computed(() => {
  return props.changes?.before?.year !== props.changes?.after?.year
})

const hasThemeChanged = computed(() => {
  const beforeTheme = props.changes?.before?.theme?.$oid || props.changes?.before?.theme
  const afterTheme = props.changes?.after?.theme?.$oid || props.changes?.after?.theme
  return beforeTheme !== afterTheme
})

const hasNoteChanged = computed(() => {
  return props.changes?.before?.note !== props.changes?.after?.note
})

// 取得 changedFields
const changedFields = computed(() => {
  return props.changes?.changedFields || []
})

// 輔助函數：取得項目的唯一鍵值
const getItemKey = (item) => {
  if (!item) return ''
  const channelId = item?.channel?._id?.$oid || item?.channel?._id || item?.channel?.name || ''
  const platformId = item?.platform?._id?.$oid || item?.platform?._id || item?.platform?.name || ''
  return `${channelId}-${platformId}`
}

// 建立變更對應表，記錄每個項目哪些月份有變更
const changeMap = computed(() => {
  if (!props.changes?.before?.items || !props.changes?.after?.items) {
    return {}
  }

  const map = {}
  const beforeItems = props.changes.before.items || []
  const afterItems = props.changes.after.items || []

  // 建立 before 項目的索引
  const beforeIndex = {}
  beforeItems.forEach((item, index) => {
    const channelId = item?.channel?._id?.$oid || item?.channel?._id || item?.channel?.name
    const platformId = item?.platform?._id?.$oid || item?.platform?._id || item?.platform?.name
    const key = `${channelId}-${platformId}`
    if (!beforeIndex[key]) {
      beforeIndex[key] = []
    }
    beforeIndex[key].push({ item, index })
  })

  // 建立 after 項目的索引
  const afterIndex = {}
  afterItems.forEach((item, index) => {
    const channelId = item?.channel?._id?.$oid || item?.channel?._id || item?.channel?.name
    const platformId = item?.platform?._id?.$oid || item?.platform?._id || item?.platform?.name
    const key = `${channelId}-${platformId}`
    if (!afterIndex[key]) {
      afterIndex[key] = []
    }
    afterIndex[key].push({ item, index })
  })

  // 檢查每個項目的變更
  const allKeys = new Set([...Object.keys(beforeIndex), ...Object.keys(afterIndex)])
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  
  allKeys.forEach(key => {
    const beforeList = beforeIndex[key] || []
    const afterList = afterIndex[key] || []
    
    // 處理新增的項目（在 after 中存在但在 before 中不存在）
    if (beforeList.length === 0 && afterList.length > 0) {
      afterList.forEach(({ item }) => {
        const itemKey = getItemKey(item)
        if (!map[itemKey]) {
          map[itemKey] = new Set()
        }
        // 新增的項目，標記所有月份
        months.forEach(month => map[itemKey].add(month))
      })
      return
    }
    
    // 處理刪除的項目（在 before 中存在但在 after 中不存在）
    if (beforeList.length > 0 && afterList.length === 0) {
      // 刪除的項目不需要在修改後的表格中標記
      return
    }
    
    // 如果項目數量不同，標記所有月份為變更
    if (beforeList.length !== afterList.length) {
      afterList.forEach(({ item }) => {
        const itemKey = getItemKey(item)
        if (!map[itemKey]) {
          map[itemKey] = new Set()
        }
        // 標記所有月份
        months.forEach(month => map[itemKey].add(month))
      })
      return
    }

    // 配對比較相同位置的項目
    const maxLength = Math.max(beforeList.length, afterList.length)
    for (let i = 0; i < maxLength; i++) {
      const beforeItem = beforeList[i]?.item
      const afterItem = afterList[i]?.item
      
      if (!beforeItem || !afterItem) {
        // 如果其中一個不存在，標記所有月份
        const itemKey = getItemKey(afterItem || beforeItem)
        if (!map[itemKey]) {
          map[itemKey] = new Set()
        }
        months.forEach(month => map[itemKey].add(month))
        continue
      }

      const itemKey = getItemKey(afterItem)
      if (!map[itemKey]) {
        map[itemKey] = new Set()
      }

      // 比較每個月份的預算
      months.forEach(month => {
        const beforeValue = beforeItem?.monthlyBudget?.[month]
        const afterValue = afterItem?.monthlyBudget?.[month]
        
        // 處理 null、undefined、空字串的情況
        const beforeVal = beforeValue === null || beforeValue === undefined || beforeValue === '' ? null : beforeValue
        const afterVal = afterValue === null || afterValue === undefined || afterValue === '' ? null : afterValue
        
        if (beforeVal !== afterVal) {
          map[itemKey].add(month)
        }
      })
    }
  })

  // 將 Set 轉換為陣列，方便傳遞
  const result = {}
  Object.keys(map).forEach(key => {
    result[key] = Array.from(map[key])
  })
  
  return result
})
</script>

<style lang="scss" scoped>
.budget-change-table {
  width: 100%;
}

.single-table {
  max-width: 1240px;
  margin: 0 auto;
}

.tables-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.table-wrapper {
  flex: 1;
  min-width: 800px;
}

.arrow-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  flex-shrink: 0;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.change-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
  
  li {
    padding: 4px 0;
    color: #d32f2f;
    font-weight: 500;
    line-height: 1.5;
  }
}
</style>