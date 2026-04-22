<template>
  <div>
    <v-row class="pb-2">
      <v-col
        cols="12"
        md="6"
      >
        <v-btn
          prepend-icon="mdi-refresh"
          color="teal-darken-1"
          variant="outlined"
          :size="buttonSize"
          :loading="loading"
          @click="syncCandidates"
        >
          同步候選名單
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="searchKeyword"
          prepend-inner-icon="mdi-magnify"
          label="搜尋姓名"
          placeholder="輸入關鍵字搜尋"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          :loading="loading"
        />
      </v-col>
    </v-row>

    <!-- 候選名單表格 -->
    <v-data-table
      v-model:items-per-page="tableOptions.itemsPerPage"
      v-model:page="tableOptions.page"
      v-model:sort-by="tableOptions.sortBy"
      :headers="tableHeaders"
      :items="filteredCandidates"
      :loading="loading"
      :items-per-page-options="[10, 20, 50, 100]"
      hover
      density="compact"
      class="mt-4 rounded-ts-lg rounded-te-lg"
    >
      <template #item="{ item, index }">
        <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
          <td class="text-center">
            <v-chip
              size="small"
              color="blue-grey"
              variant="tonal"
            >
              {{ getOriginalOrder(item) }}
            </v-chip>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.company?.name || '-' }}</td>
          <td>{{ item.department?.name || '-' }}</td>
          <td>{{ formatDate(item.hireDate) }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const emit = defineEmits(['refresh'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const candidates = ref([])
const searchKeyword = ref('')
const loading = ref(false)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'hireDate', order: 'asc' }]
})

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// 依姓名關鍵字篩選候選名單（方便確認該員工是否已在候選名單）
const filteredCandidates = computed(() => {
  const keyword = (searchKeyword.value || '').trim().toLowerCase()
  if (!keyword) return candidates.value
  return candidates.value.filter(c => (c.name || '').toLowerCase().includes(keyword))
})

const tableHeaders = [
  { title: '順序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '姓名', key: 'name', sortable: true },
  { title: '公司', key: 'company.name', sortable: false },
  { title: '部門', key: 'department.name', sortable: false },
  { title: '入職日期', key: 'hireDate', sortable: true }
]

const fetchCandidates = async () => {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/employee-comments/candidates')
    if (data.success) {
      candidates.value = data.result || []
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得候選名單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

const syncCandidates = async () => {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/employee-comments/candidates/sync')
    if (data.success) {
      createSnackbar({
        text: '同步完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchCandidates()
      emit('refresh')
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '同步失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 取得該員工在原始候選名單中的順序（搜尋時也要顯示正確的原始順序）
const getOriginalOrder = (item) => {
  const index = candidates.value.findIndex(c => c._id === item._id)
  return index !== -1 ? index + 1 : 0
}

watch(searchKeyword, () => {
  tableOptions.page = 1
})

onMounted(() => {
  fetchCandidates()
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
