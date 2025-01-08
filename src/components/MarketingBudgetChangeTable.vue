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