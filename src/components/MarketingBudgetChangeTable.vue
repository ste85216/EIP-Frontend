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
      <div class="tables-container">
        <div class="table-wrapper">
          <div class="table-title mb-2">
            修改前
          </div>
          <budget-table
            :data="changes.before"
            :is-mini="true"
          />
        </div>
        
        <div class="arrow-wrapper">
          <v-icon
            size="40"
            color="primary"
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
            :is-mini="true"
          />
        </div>
      </div>
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

const changedFields = computed(() => {
  if (!props.changes?.before?.items || !props.changes?.after?.items) return []
  
  const fields = []
  const beforeItems = props.changes.before.items
  const afterItems = props.changes.after.items
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  afterItems.forEach(afterItem => {
    const afterChannelId = afterItem.channel.$oid || afterItem.channel._id || afterItem.channel
    const afterPlatformId = afterItem.platform.$oid || afterItem.platform._id || afterItem.platform

    // 尋找相同位置的項目（基於陣列索引）
    const afterIndex = afterItems.indexOf(afterItem)
    const beforeItemAtSameIndex = beforeItems[afterIndex]

    if (beforeItemAtSameIndex) {
      // 檢查渠道是否變更
      const beforeChannelId = beforeItemAtSameIndex.channel.$oid || beforeItemAtSameIndex.channel._id || beforeItemAtSameIndex.channel
      if (beforeChannelId !== afterChannelId) {
        fields.push(`items.${afterChannelId}.${afterPlatformId}.channel`)
      }

      // 檢查平台是否變更
      const beforePlatformId = beforeItemAtSameIndex.platform.$oid || beforeItemAtSameIndex.platform._id || beforeItemAtSameIndex.platform
      if (beforePlatformId !== afterPlatformId) {
        fields.push(`items.${afterChannelId}.${afterPlatformId}.platform`)
      }

      // 檢查預算值是否變更
      months.forEach(month => {
        const beforeValue = Number(beforeItemAtSameIndex.monthlyBudget[month])
        const afterValue = Number(afterItem.monthlyBudget[month])
        if (beforeValue !== afterValue) {
          fields.push(`items.${afterChannelId}.${afterPlatformId}.monthlyBudget.${month}`)
        }
      })
    } else {
      // 如果是新增的項目，標記所有欄位
      fields.push(`items.${afterChannelId}.${afterPlatformId}.channel`)
      fields.push(`items.${afterChannelId}.${afterPlatformId}.platform`)
      months.forEach(month => {
        if (afterItem.monthlyBudget[month] !== 0) {
          fields.push(`items.${afterChannelId}.${afterPlatformId}.monthlyBudget.${month}`)
        }
      })
    }
  })

  console.log('Generated Changed Fields:', fields)
  return fields
})
</script>

<style lang="scss" scoped>
.budget-change-table {
  width: 100%;
  padding: 16px;
}

.single-table {
  max-width: 1200px;
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
  padding: 8px;
  flex-shrink: 0;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

:deep(.changed-field) {
  color: #ff5252;
  font-weight: 600;
}
</style>