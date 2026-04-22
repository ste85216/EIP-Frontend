<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-0 py-md-3 px-0">
          <div
            v-if="loading && !batch"
            class="d-flex align-center justify-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="blue-grey-darken-2"
              size="32"
              class="me-3"
            />
            <span class="text-grey">載入中...</span>
          </div>

          <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mx-4 mt-4"
          >
            {{ error }}
          </v-alert>

          <template v-else-if="batch">
            <div class="px-4 px-sm-6 pb-3 pt-3 d-flex align-center flex-wrap ga-2">
              <v-btn
                variant="text"
                color="blue-grey-darken-2"
                prepend-icon="mdi-arrow-left"
                class="px-1"
                @click="router.push('/selfAssessmentManagement')"
              >
                返回自評列表
              </v-btn>
            </div>
            <div class="px-4 px-sm-6 pb-6">
              <h3 class="mb-1">
                {{ batch.name || '_' }}
              </h3>
              <div class="text-body-2 text-grey-darken-1">
                年度：{{ batch.year || '_' }}
                <span v-if="batch.status"> ｜ {{ statusText(batch.status) }}</span>
              </div>
            </div>
            <v-divider class="py-1" />

            <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-3">
              <v-row class="mb-2">
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  lg="2"
                  class="px-1 pe-sm-2 py-1"
                >
                  <div class="d-flex flex-column">
                    <span class="search-label">公司 :</span>
                    <v-select
                      v-model="searchCriteria.company"
                      :items="companyOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="請選擇公司"
                      hide-details
                      @update:model-value="searchCriteria.department = null"
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
                    <span class="search-label">部門 :</span>
                    <v-select
                      v-model="searchCriteria.department"
                      :items="departmentOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      :placeholder="!searchCriteria.company ? '請先選擇公司' : '請選擇部門'"
                      hide-details
                      :disabled="!searchCriteria.company"
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
                    <span class="search-label">表單模板 :</span>
                    <v-select
                      v-model="searchCriteria.template"
                      :items="templateOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="請選擇表單模板"
                      hide-details
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
                    <span class="search-label">自評狀態 :</span>
                    <v-select
                      v-model="searchCriteria.selfStatus"
                      :items="selfStatusFilterOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="請選擇"
                      hide-details
                    />
                  </div>
                </v-col>
                <div class="d-flex align-end pt-3 pb-2 ms-auto ms-sm-1 me-1">
                  <v-btn
                    color="grey"
                    elevation="1"
                    size="default"
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
                      v-model="keywordSearch"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋考核對象"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-card-text class="px-sm-6 px-md-7">
              <v-table
                v-if="paginatedFilteredRows.length > 0"
                class="rounded-lg"
                density="compact"
              >
                <thead>
                  <tr>
                    <th>公司部門</th>
                    <th>考核對象</th>
                    <th>表單模板</th>
                    <th class="text-center">
                      狀態
                    </th>
                    <th class="text-end">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in paginatedFilteredRows"
                    :key="item.evaluationId"
                    :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  >
                    <td>{{ item.evaluateeDept || '_' }}</td>
                    <td>
                      {{ item.evaluateeName || '_' }}
                      <span
                        v-if="item.evaluateeEmployeeCode"
                        class="text-grey ms-1"
                      >({{ item.evaluateeEmployeeCode }})</span>
                    </td>
                    <td>{{ item.templateName || '_' }}</td>
                    <td class="text-center">
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="selfStatusChip(item.selfStatus).color"
                      >
                        {{ selfStatusChip(item.selfStatus).text }}
                      </v-chip>
                    </td>
                    <td class="text-end datatable-actions">
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="light-blue-darken-2"
                        title="查看自評"
                        @click="openViewDialog(item)"
                      >
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div
                v-if="filteredRows.length > 0"
                class="d-flex justify-end align-center py-3 px-2"
              >
                <span class="text-caption text-medium-emphasis me-4">
                  第 {{ evalPageStart }}-{{ evalPageEnd }} 筆，共 {{ filteredRows.length }} 筆
                </span>
                <v-pagination
                  v-model="evalPage"
                  :length="evalPageCount"
                  :total-visible="7"
                  density="compact"
                  rounded
                />
              </div>
              <div
                v-else
                class="text-center py-12 text-medium-emphasis"
              >
                沒有符合條件的資料
              </div>
            </v-card-text>
          </template>
        </v-card>

        <v-dialog
          v-model="viewDialog.open"
          max-width="800"
        >
          <v-card
            v-if="viewDialog.row"
            class="rounded-lg"
          >
            <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0">
              <v-icon
                icon="mdi-clipboard-check-outline"
                :size="smAndUp ? '20' : '18'"
                color="white"
                class="me-2"
              />
              <span class="card-title text-white">員工自評表</span>
              <v-spacer />
              <v-btn
                icon
                variant="plain"
                class="opacity-100"
                :ripple="false"
                color="white"
                :size="smAndUp ? '36' : '32'"
                aria-label="關閉"
                @click="viewDialog.open = false"
              >
                <v-icon :size="smAndUp ? '22' : '18'">
                  mdi-close
                </v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text
              class="px-4 px-sm-6 py-4 py-sm-4 overflow-y-auto"
              style="max-height: calc(100vh - 220px);"
            >
              <template v-if="viewDialog.row.selfStatus === 'no_account'">
                <v-alert
                  type="warning"
                  variant="tonal"
                  density="compact"
                >
                  此員工尚無綁定 EIP 帳號，無法填寫自評。
                </v-alert>
              </template>
              <template v-else-if="viewDialog.row.selfStatus === 'not_required'">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  此表單未設定自評題目。
                </v-alert>
              </template>
              <template v-else>
                <v-card
                  elevation="0"
                  class="preview-card pa-4"
                >
                  <div class="mb-4 d-flex align-center flex-wrap font-weight-bold">
                    <v-icon
                      size="20"
                      class="me-2"
                    >
                      mdi-clipboard-check-outline
                    </v-icon>
                    <span>自我評核表</span>
                    <span class="mx-2 text-grey-darken-1">－</span>
                    <span class="sub-title">{{ viewDialog.form.displayName }}</span>
                  </div>
                  <p
                    v-if="viewDialog.form.fillingInstructions"
                    class="text-body-2 text-grey-darken-1 mb-4 pre-wrap"
                  >
                    {{ viewDialog.form.fillingInstructions }}
                  </p>
                  <div
                    v-if="viewDialog.form.submittedAt"
                    class="text-caption text-grey mb-3"
                  >
                    送出時間：{{ formatDateTime(viewDialog.form.submittedAt) }}
                  </div>
                  <div
                    v-for="(q, qIndex) in viewDialog.form.questions"
                    :key="qIndex"
                    class="preview-question mb-5 pa-5 rounded"
                  >
                    <div class="font-weight-bold mb-3">
                      {{ viewDialog.form.questions.length > 1 ? `${qIndex + 1}. ` : '' }}{{ q.title || '（未命名題目）' }}
                    </div>
                    <ul
                      v-if="getPointsList(q).length > 0"
                      class="text-grey-darken-3 mb-3 ps-5"
                    >
                      <li
                        v-for="(point, i) in getPointsList(q)"
                        :key="i"
                      >
                        {{ point }}
                      </li>
                    </ul>
                    <div
                      v-if="criteriaText(q)"
                      class="text-grey-darken-3 mb-4 pre-wrap"
                    >
                      <span class="sub-title text-black">*評分標準</span><br>
                      <div class="pt-2 ps-2">
                        {{ criteriaText(q) }}
                      </div>
                    </div>
                    <div class="w-100 d-flex justify-end">
                      <v-text-field
                        :model-value="scoreFieldModel(q)"
                        type="number"
                        variant="outlined"
                        density="compact"
                        placeholder="填寫分數（50-100）"
                        hide-details
                        readonly
                        class="preview-score-input bg-white"
                        style="max-width: 240px;"
                      />
                    </div>
                  </div>
                  <div
                    v-if="viewDialog.form.questions.length === 0"
                    class="text-grey text-center py-6"
                  >
                    尚無自評題目
                  </div>
                </v-card>
              </template>
            </v-card-text>

            <v-card-actions class="px-6 py-5">
              <v-spacer />
              <v-btn
                variant="outlined"
                :size="smAndUp ? 'default' : 'small'"
                color="grey-darken-1"
                @click="viewDialog.open = false"
              >
                關閉
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'

definePage({
  meta: {
    title: '自評進度詳情 | Ystravel',
    login: true,
    permission: 'SELF_ASSESSMENT_MANAGEMENT_READ'
  }
})

const route = useRoute()
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const batchId = computed(() => route.params.batchId)
const loading = ref(true)
const error = ref('')
const batch = ref(null)
const rows = ref([])

const searchCriteria = reactive({
  company: null,
  department: null,
  template: null,
  selfStatus: null
})
const keywordSearch = ref('')
const itemsPerPage = ref(10)
const evalPage = ref(1)

const selfStatusFilterOptions = [
  { value: 'completed', title: '已完成' },
  { value: 'pending', title: '未完成' },
  { value: 'not_required', title: '無需自評' },
  { value: 'no_account', title: '無帳號綁定' }
]

const companyOptions = computed(() => {
  const map = new Map()
  rows.value.forEach((r) => {
    const id = (r.evaluateeCompanyId || '').trim()
    if (!id) return
    const name = companyNameById(id)
    if (!map.has(id)) map.set(id, { title: name || id, value: id })
  })
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
})

const companyIdToName = computed(() => {
  const m = {}
  rows.value.forEach((r) => {
    const id = (r.evaluateeCompanyId || '').trim()
    if (!id) return
    const dept = r.evaluateeDept || ''
    const parts = dept.split(' - ')
    if (parts.length >= 2 && !m[id]) m[id] = parts[0].trim()
  })
  return m
})

function companyNameById (id) {
  if (!id) return ''
  return companyIdToName.value[id] || ''
}

const departmentOptions = computed(() => {
  const company = searchCriteria.company
  if (!company) return []
  const map = new Map()
  rows.value.forEach((r) => {
    if ((r.evaluateeCompanyId || '').trim() !== company) return
    const did = (r.evaluateeDepartmentId || '').trim()
    const name = deptNameByRow(r)
    if (did && name && !map.has(did)) map.set(did, { title: name, value: did })
  })
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
})

function deptNameByRow (r) {
  const dept = r.evaluateeDept || ''
  const parts = dept.split(' - ')
  if (parts.length >= 2) return parts[1].trim()
  return parts[0]?.trim() || ''
}

const templateOptions = computed(() => {
  const set = new Set()
  rows.value.forEach((r) => {
    const n = (r.templateName || '').trim()
    if (n) set.add(n)
  })
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hant'))
})

const filteredRows = computed(() => {
  let out = rows.value
  if (searchCriteria.company) {
    out = out.filter((r) => (r.evaluateeCompanyId || '').trim() === searchCriteria.company)
  }
  if (searchCriteria.department) {
    out = out.filter((r) => (r.evaluateeDepartmentId || '').trim() === searchCriteria.department)
  }
  if (searchCriteria.template) {
    out = out.filter((r) => (r.templateName || '').trim() === searchCriteria.template)
  }
  if (searchCriteria.selfStatus) {
    out = out.filter((r) => r.selfStatus === searchCriteria.selfStatus)
  }
  const kw = (keywordSearch.value || '').trim().toLowerCase()
  if (kw) {
    out = out.filter((r) => {
      const name = (r.evaluateeName || '').toLowerCase()
      const code = (r.evaluateeEmployeeCode || '').toLowerCase()
      return name.includes(kw) || code.includes(kw)
    })
  }
  return out
})

const paginatedFilteredRows = computed(() => {
  const all = filteredRows.value
  const per = Math.max(1, itemsPerPage.value)
  const start = (evalPage.value - 1) * per
  return all.slice(start, start + per)
})

const evalPageCount = computed(() => {
  const n = filteredRows.value.length
  const per = Math.max(1, itemsPerPage.value)
  return Math.max(1, Math.ceil(n / per))
})

const evalPageStart = computed(() => {
  if (filteredRows.value.length === 0) return 0
  return (evalPage.value - 1) * itemsPerPage.value + 1
})

const evalPageEnd = computed(() => {
  const end = evalPage.value * itemsPerPage.value
  return Math.min(end, filteredRows.value.length)
})

watch(filteredRows, () => {
  if (evalPage.value > evalPageCount.value) {
    evalPage.value = Math.max(1, evalPageCount.value)
  }
})

function criteriaText (q) {
  return (q?.scoringCriteria || '').trim()
}

/** 與「我的考核」自評頁相同：有分數顯示數字，否則空白只保留 placeholder 視覺 */
function scoreFieldModel (q) {
  if (q.score != null && !Number.isNaN(Number(q.score))) return String(q.score)
  return ''
}

function selfStatusChip (s) {
  const map = {
    completed: { text: '已完成', color: 'teal' },
    pending: { text: '未完成', color: 'amber-darken-2' },
    not_required: { text: '無需自評', color: 'grey' },
    no_account: { text: '無帳號綁定', color: 'orange-darken-2' }
  }
  return map[s] || { text: '_', color: 'grey' }
}

function statusText (status) {
  const map = { draft: '籌備中', sent: '已發送' }
  return map[status] || status
}

function formatDateTime (d) {
  if (!d) return '_'
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return '_'
  return x.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function resetSearch () {
  searchCriteria.company = null
  searchCriteria.department = null
  searchCriteria.template = null
  searchCriteria.selfStatus = null
  keywordSearch.value = ''
  evalPage.value = 1
}

const viewDialog = reactive({
  open: false,
  row: null,
  form: {
    displayName: '',
    fillingInstructions: '',
    questions: [],
    submittedAt: null
  }
})

function getPointsList (q) {
  const arr = q?.scoringPoints
  return Array.isArray(arr) ? arr.filter((s) => s != null && String(s).trim() !== '') : []
}

function openViewDialog (item) {
  viewDialog.row = item
  const sf = item.selfForm || {}
  viewDialog.form = {
    displayName: sf.displayName || '_',
    fillingInstructions: sf.fillingInstructions || '',
    questions: Array.isArray(sf.questions) ? sf.questions.map((q) => ({ ...q })) : [],
    submittedAt: sf.submittedAt || null
  }
  viewDialog.open = true
}

async function loadAll () {
  loading.value = true
  error.value = ''
  try {
    const [batchRes, overviewRes] = await Promise.all([
      apiAuth.get(`/evaluation-batches/${batchId.value}`),
      apiAuth.get(`/evaluations/by-batch/${batchId.value}/self-assessment-overview`)
    ])
    batch.value = batchRes.data?.result || null
    const data = overviewRes.data?.result
    rows.value = data?.rows || []
    if (!batch.value) {
      error.value = '找不到此考核批次'
    }
  } catch (err) {
    error.value = err?.response?.data?.message || '載入失敗'
    createSnackbar({
      text: error.value,
      snackbarProps: { color: 'red-lighten-1' }
    })
    router.push('/selfAssessmentManagement')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
/* 與「我的考核」自評填寫、evaluationMyPending/index 表格一致 */
.preview-card {
  min-height: 200px;
}
.preview-question {
  background-color: #f6f6f6;
}
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
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
:deep(.v-table) {
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
    font-size: 13px !important;
  }
}
.preview-score-input :deep(.v-field__input) {
  opacity: 1;
}
</style>
