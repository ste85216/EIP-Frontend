<template>
  <div>
    <v-data-table-server
      v-model:items-per-page="tableOptions.itemsPerPage"
      v-model:page="tableOptions.page"
      v-model:sort-by="tableOptions.sortBy"
      :headers="tableHeaders"
      :items="tableItems"
      :items-length="totalItems"
      :loading="false"
      :items-per-page-options="[10, 20, 50, 100]"
      hover
      density="compact"
      class="mt-4 rounded-ts-lg rounded-te-lg"
      @update:options="handleTableOptionsChange"
    >
      <template #no-data>
        <div class="text-center py-8 text-grey-darken-1">
          沒有找到符合條件的排程
        </div>
      </template>
      <template #item="{ item, index }">
        <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
          <td>{{ formatDate(item.assignedDate) }}</td>
          <td>{{ item.employee?.name || '-' }}</td>
          <td v-if="smAndUp">
            {{ item.employee?.company?.name || '-' }}
          </td>
          <td v-if="smAndUp">
            {{ item.employee?.department?.name || '-' }}
          </td>
          <td>
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              label
              class="font-weight-medium"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </td>
          <td v-if="smAndUp && !isPendingTab && !isOverdueTab">
            <div v-if="item.submittedAt">
              <div>{{ formatDateOnly(item.submittedAt) }}</div>
              <div class="text-caption text-grey-darken-1">
                <v-icon
                  size="14"
                  style="padding-bottom: 2px;"
                >
                  mdi-clock-outline
                </v-icon>
                {{ formatTime(item.submittedAt) }}
              </div>
            </div>
            <span v-else>-</span>
          </td>
          <td v-if="smAndUp && !isPendingTab && !isOverdueTab">
            <v-chip
              :color="getReviewStatusColor(item.reviewStatus)"
              size="small"
              label
              class="font-weight-medium"
            >
              {{ getReviewStatusText(item.reviewStatus) }}
            </v-chip>
          </td>
          <td v-if="smAndUp && !isPendingTab && !isOverdueTab">
            {{ item.reviewer?.name || '-' }}
          </td>
          <td v-if="smAndUp && !isPendingTab && !isOverdueTab">
            {{ item.reviewNote || '-' }}
          </td>
          <td
            v-if="!isOverdueTab && !readonly"
            class="text-center"
          >
            <v-btn
              v-if="item.status === 'submitted' || item.status === 'completed'"
              icon
              color="light-blue-darken-4"
              variant="plain"
              size="22"
              class="mx-2"
              :ripple="false"
              @click="$emit('review', item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="canEdit(item)"
              icon
              color="light-blue-darken-4"
              variant="plain"
              size="22"
              class="mx-2"
              :ripple="false"
              @click="$emit('edit', item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="canDelete(item)"
              icon
              color="red-lighten-1"
              variant="plain"
              size="22"
              class="mx-2"
              :ripple="false"
              @click="$emit('delete', item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { usePermissionStore } from '@/stores/permission'

const { smAndUp } = useDisplay()

const props = defineProps({
  status: {
    type: [String, Array],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchKeyword: {
    type: String,
    default: ''
  },
  companyId: {
    type: String,
    default: ''
  },
  departmentId: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh', 'review', 'edit', 'delete', 'insert'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const permissionStore = usePermissionStore()

const tableItems = ref([])
const totalItems = ref(0)
const tableLoading = ref(false)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'assignedDate', order: 'asc' }]
})

const canEdit = (item) => {
  // 待排程 TAB 內的排程（pending / today / penalty）皆可編輯
  return permissionStore.hasPermission('EMPLOYEE_COMMENT_SCHEDULE_UPDATE') &&
    (item.status === 'pending' || item.status === 'today' || item.status === 'penalty')
}

const canDelete = (item) => {
  // 待排程 TAB 內的排程（pending / today / penalty）皆可刪除
  return permissionStore.hasPermission('EMPLOYEE_COMMENT_SCHEDULE_DELETE') &&
    (item.status === 'pending' || item.status === 'today' || item.status === 'penalty')
}

const isPendingTab = computed(() => {
  const s = props.status
  if (Array.isArray(s)) {
    return s.includes('pending') || s.includes('today')
  }
  return s === 'pending' || s === 'today'
})

const isOverdueTab = computed(() => props.status === 'overdue')

const isSubmittedOrCompletedTab = computed(() =>
  props.status === 'submitted' || props.status === 'completed'
)

const allHeaders = [
  { title: '指定日期', key: 'assignedDate', sortable: true },
  { title: '姓名', key: 'employee.name', sortable: false },
  { title: '公司', key: 'employee.company.name', sortable: false },
  { title: '部門', key: 'employee.department.name', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '提交時間', key: 'submittedAt', sortable: true },
  { title: '審核狀態', key: 'reviewStatus', sortable: true },
  { title: '審核人', key: 'reviewer.name', sortable: false },
  { title: '備註', key: 'reviewNote', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const tableHeaders = computed(() => {
  let headers = allHeaders

  if (isOverdueTab.value) {
    headers = headers.filter(h =>
      h.key !== 'submittedAt' && h.key !== 'reviewStatus' && h.key !== 'reviewer.name' && h.key !== 'reviewNote' && h.key !== 'actions'
    )
  } else if (isPendingTab.value) {
    headers = headers.filter(h =>
      h.key !== 'submittedAt' && h.key !== 'reviewStatus' && h.key !== 'reviewer.name' && h.key !== 'reviewNote'
    )
  }

  // 如果是只讀模式，移除操作欄位
  if (props.readonly) {
    headers = headers.filter(h => h.key !== 'actions')
  }

  // sm 以下：待審核、已完成只顯示指定日期、姓名、狀態
  if (!smAndUp.value) {
    if (isSubmittedOrCompletedTab.value) {
      headers = headers.filter(h =>
        h.key === 'assignedDate' || h.key === 'employee.name' || h.key === 'status'
      )
    } else {
      headers = headers.filter(h =>
        h.key !== 'employee.company.name' && h.key !== 'employee.department.name'
      )
    }
  }

  return headers
})

const fetchTableData = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tableOptions.page,
      itemsPerPage: tableOptions.itemsPerPage,
      sortBy: tableOptions.sortBy[0]?.key,
      sortOrder: tableOptions.sortBy[0]?.order
    }

    // 處理狀態篩選
    if (Array.isArray(props.status)) {
      // 多個狀態：用逗號分隔傳給後端
      params.status = props.status.join(',')
    } else {
      params.status = props.status
    }

    // 處理姓名搜尋
    if (props.searchKeyword && props.searchKeyword.trim()) {
      params.quickSearch = props.searchKeyword.trim()
    }

    // 處理公司、部門篩選
    if (props.companyId) {
      params.company = props.companyId
    }
    if (props.departmentId) {
      params.department = props.departmentId
    }

    const { data } = await apiAuth.get('/employee-comments/schedules', { params })
    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得表格資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

const handleTableOptionsChange = () => {
  fetchTableData()
}

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const dateStr = d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const week = weekdays[d.getDay()]
  return `${dateStr} (${week})`
}

// 僅日期（用於提交時間第一行，與 designRequest 表格一致）
const formatDateOnly = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 僅時間（用於提交時間第二行，與 designRequest 表格一致）
const formatTime = (date) => {
  if (!date) return ''
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch {
    return ''
  }
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'grey',
    today: 'blue',
    overdue: 'red',
    submitted: 'orange',
    completed: 'green',
    rejected: 'red',
    penalty: 'purple'
  }
  return colorMap[status] || 'grey'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待排程',
    today: '繳交日',
    overdue: '已過期',
    submitted: '已提交',
    completed: '已完成',
    rejected: '已拒絕',
    penalty: '懲罰中'
  }
  return textMap[status] || status
}

const getReviewStatusColor = (reviewStatus) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green'
  }
  return colorMap[reviewStatus] || 'grey'
}

const getReviewStatusText = (reviewStatus) => {
  const textMap = {
    pending: '待審核',
    approved: '完成'
  }
  return textMap[reviewStatus] || reviewStatus || '-'
}

watch(() => props.status, () => {
  tableOptions.page = 1
  fetchTableData()
}, { immediate: true })

watch(() => props.loading, (newVal) => {
  if (!newVal) {
    fetchTableData()
  }
})

// 暴露方法給父組件
defineExpose({
  fetchTableData,
  refresh: fetchTableData
})
</script>

<style lang="scss" scoped>
:deep(.v-data-table) {
  thead {
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
  }
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}
</style>
