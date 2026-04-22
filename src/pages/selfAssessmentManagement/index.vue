<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>自評管理</h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">自評進度 :</span>
                  <v-select
                    v-model="searchCriteria.completionStatus"
                    :items="completionFilterOptions"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇狀態"
                    hide-details
                    @update:model-value="onBatchFilterChange"
                  />
                </div>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                md="3"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">年度 :</span>
                  <v-select
                    v-model="searchCriteria.year"
                    :items="yearOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇年度"
                    hide-details
                    @update:model-value="onBatchFilterChange"
                  />
                </div>
              </v-col>
              <div class="d-flex align-end pt-3 pb-2 ms-auto ms-sm-1 me-1">
                <v-btn
                  color="grey"
                  elevation="1"
                  :size="smAndUp ? 'default' : 'small'"
                  @click="resetSearch"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </v-row>
          </v-card-text>
          <v-divider class="my-0" />

          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-spacer />
                <v-col
                  cols="7"
                  sm="6"
                  md="4"
                  lg="2"
                  class="px-1 my-1"
                >
                  <v-text-field
                    v-model="searchText"
                    density="compact"
                    variant="outlined"
                    placeholder="搜尋考核名稱"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :headers="headers"
              :items="batches"
              :items-length="totalItems"
              :loading="loading"
              :items-per-page-options="[10, 20, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>
                    <span class="font-weight-medium">{{ item.name || '_' }}</span>
                  </td>
                  <td>{{ item.year ?? '_' }}</td>
                  <td>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="completionChip(item.selfAssessmentCompletionStatus).color"
                    >
                      {{ completionChip(item.selfAssessmentCompletionStatus).text }}
                    </v-chip>
                  </td>
                  <td class="text-center datatable-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      title="查看"
                      @click.stop="goDetail(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

definePage({
  meta: {
    title: '自評管理 | Ystravel',
    login: true,
    permission: 'SELF_ASSESSMENT_MANAGEMENT_READ'
  }
})

const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const searchCriteria = reactive({
  completionStatus: null,
  year: null
})
const searchText = ref('')

const completionFilterOptions = [
  { value: 'all_completed', text: '已填完' },
  { value: 'incomplete', text: '未完成' },
  { value: 'none_required', text: '無需自評' },
  { value: 'empty_scope', text: '無考核對象' }
]

const yearOptions = ref([])

const headers = [
  { title: '考核名稱', key: 'name', sortable: false },
  { title: '年度', key: 'year', sortable: false },
  { title: '自評進度', key: 'selfAssessmentCompletionStatus', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: 140, align: 'center' }
]

function completionChip (code) {
  const map = {
    not_yet_sent: { text: '未發送', color: 'grey' },
    all_completed: { text: '已填完', color: 'teal' },
    incomplete: { text: '未完成', color: 'amber-darken-3' },
    none_required: { text: '無需自評', color: 'blue-grey' },
    empty_scope: { text: '無考核對象', color: 'grey-darken-1' }
  }
  return map[code] || { text: '_', color: 'grey' }
}

const batches = ref([])
const loading = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

async function fetchBatches () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/evaluation-batches/all', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        selfAssessmentProgress: '1',
        completionStatus: searchCriteria.completionStatus ?? undefined,
        year: searchCriteria.year ?? undefined,
        search: searchText.value?.trim() || undefined
      }
    })
    batches.value = data?.result?.data || []
    totalItems.value = data?.result?.totalItems || 0
    const ay = data?.result?.availableYears
    if (Array.isArray(ay) && ay.length > 0) {
      yearOptions.value = ay.map((n) => Number(n)).filter((n) => !Number.isNaN(n))
    }
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

function handleOptionsChange (opts) {
  page.value = opts.page ?? 1
  itemsPerPage.value = opts.itemsPerPage || 10
  fetchBatches()
}

function onBatchFilterChange () {
  page.value = 1
  fetchBatches()
}

function resetSearch () {
  searchCriteria.completionStatus = null
  searchCriteria.year = null
  searchText.value = ''
  page.value = 1
  fetchBatches()
}

function goDetail (item) {
  router.push(`/selfAssessmentManagement/${item._id}`)
}

let searchDebounce = null
watch(searchText, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    page.value = 1
    fetchBatches()
  }, 400)
})

onMounted(() => {
  fetchBatches()
})
</script>

<style scoped>
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
    div {
      line-height: 1.6;
    }
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
.datatable-actions {
  white-space: nowrap;
}
</style>
