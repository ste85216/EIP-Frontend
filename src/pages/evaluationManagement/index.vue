<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>考核管理</h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
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
                  <span class="search-label">狀態 :</span>
                  <v-select
                    v-model="searchCriteria.status"
                    :items="statusOptions"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇狀態"
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
                  <span class="search-label">年度 :</span>
                  <v-select
                    v-model="searchCriteria.year"
                    :items="yearOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇年度"
                    hide-details
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

          <!-- 功能按鈕區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1   bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-btn
                  v-if="canManageEvaluation"
                  color="teal-darken-2"
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  @click="openCreateDialog"
                >
                  建立考核
                </v-btn>
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
                    placeholder="搜尋名稱"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 表格區塊 -->
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
                  <td>{{ item.year || '_' }}</td>
                  <td>{{ item.evaluationCount ?? 0 }}</td>
                  <td>{{ formatDate(item.startDate) }}</td>
                  <td>{{ formatDate(item.dueDate) }}</td>
                  <td>
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td class="text-center">
                    <v-btn
                      v-if="item.status === 'draft'"
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      @click.stop="goToDetail(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      v-else
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      @click.stop="goToDetail(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'draft' && canManageEvaluation"
                      icon
                      variant="text"
                      size="small"
                      color="red-lighten-1"
                      @click.stop="openDeleteDialog(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 建立考核對話框 -->
    <v-dialog
      v-model="createDialog.open"
      persistent
      max-width="420"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-clipboard-plus-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">建立考核</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="createDialog.open = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-form
          ref="createFormRef"
          @submit.prevent="submitCreate"
        >
          <v-card-text class="px-4 px-sm-6 py-4 py-sm-7">
            <v-text-field
              v-model="createDialog.name"
              label="* 考核名稱"
              variant="outlined"
              density="compact"
              placeholder="例如：上半年考核、下半年考核"
              :rules="[v => !!v?.trim() || '請輸入考核名稱']"
              class="mb-3"
            />
            <v-text-field
              v-model.number="createDialog.year"
              label="* 年度"
              variant="outlined"
              density="compact"
              type="number"
              min="2000"
              max="2100"
              :rules="[
                v => v != null && v !== '' || '請輸入年度',
                v => (v >= 2000 && v <= 2100) || '年度需介於 2000-2100'
              ]"
              class="mb-3"
            />
            <v-date-input
              v-model="createDialog.startDate"
              label="開始日期（選填；籌備中則當天 00:01 自動發送考核）"
              variant="outlined"
              density="compact"
              clearable
              prepend-icon
              ok-text="確認"
              cancel-text="取消"
              class="mb-3"
            />
            <v-date-input
              v-model="createDialog.dueDate"
              label="截止日期（選填，當天 23:59 後不得填寫）"
              variant="outlined"
              density="compact"
              clearable
              prepend-icon
              ok-text="確認"
              cancel-text="取消"
              class="mb-3"
            />
            <v-select
              v-model="createDialog.attendance"
              label="出勤項目（選填，考核評分表將帶入此出勤分數）"
              :items="attendanceOptions"
              item-title="displayName"
              item-value="_id"
              variant="outlined"
              density="compact"
              clearable
              placeholder="請選擇出勤項目"
              :loading="attendanceOptionsLoading"
              class="mb-1"
            />
            <v-switch
              v-model="createDialog.notifyAtStart"
              label="開始日 07:30 自動發送通知"
              color="teal-darken-1"
              density="compact"
              class="ms-1"
              hide-details
              :disabled="!createNotifyAtStartEligible"
            />
            <div
              v-if="!createNotifyAtStartEligible"
              class="text-caption text-medium-emphasis ms-1 mb-1"
            >
              請設定開始日期以啟用
            </div>
          </v-card-text>

          <v-card-actions class="px-6 py-5">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              :size="smAndUp ? 'default' : 'small'"
              @click="createDialog.open = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-2"
              :size="smAndUp ? 'default' : 'small'"
              type="submit"
              :loading="createDialog.submitting"
            >
              建立
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteDialog.open"
      title="確認刪除考核"
      :message="deleteDialog.message"
      :expected-name="deleteDialog.expectedName"
      input-label="考核名稱"
      @confirm="submitDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { dateToYmdLocal } from '@/utils/format'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { usePermissionStore } from '@/stores/permission'

definePage({
  meta: {
    title: '考核管理 | Ystravel',
    login: true,
    permission: 'EVALUATION_MANAGEMENT_READ'
  }
})

const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()
const permissionStore = usePermissionStore()
const canManageEvaluation = computed(() => permissionStore.hasPermission('EVALUATION_MANAGEMENT_MANAGE'))

const searchCriteria = reactive({
  status: null,
  year: null
})
const searchText = ref('')

const statusOptions = [
  { value: 'draft', text: '籌備中' },
  { value: 'sent', text: '已發送' }
]

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y)
  }
  return years
})

const headers = [
  { title: '考核名稱', key: 'name', sortable: false },
  { title: '年度', key: 'year', sortable: false },
  { title: '考核對象數', key: 'evaluationCount', sortable: false },
  { title: '開始時間', key: 'startDate', sortable: false },
  { title: '截止時間', key: 'dueDate', sortable: false },
  { title: '狀態', key: 'status', sortable: false },
  { title: '建立時間', key: 'createdAt', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: 160, align: 'center' }
]

const batches = ref([])
const loading = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const createFormRef = ref(null)

const attendanceOptions = ref([])
const attendanceOptionsLoading = ref(false)
const createDialog = reactive({
  open: false,
  name: '',
  year: currentYear,
  startDate: null,
  dueDate: null,
  attendance: null,
  notifyAtStart: false,
  submitting: false
})

function isStartDateOnOrAfterToday (d) {
  if (!d) return false
  const sd = d instanceof Date ? new Date(d.getTime()) : new Date(d)
  if (isNaN(sd.getTime())) return false
  const t = new Date()
  sd.setHours(0, 0, 0, 0)
  t.setHours(0, 0, 0, 0)
  return sd.getTime() >= t.getTime()
}

const createNotifyAtStartEligible = computed(() => isStartDateOnOrAfterToday(createDialog.startDate))

const deleteDialog = reactive({
  open: false,
  batchId: null,
  expectedName: '',
  message: '',
  submitting: false
})

function getStatusColor (status) {
  const map = { draft: 'grey-darken-1', sent: 'teal' }
  return map[status] || 'grey'
}

function getStatusText (status) {
  const map = { draft: '籌備中', sent: '已發送' }
  return map[status] || status
}

function formatDate (date) {
  if (!date) return '_'
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchBatches () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/evaluation-batches/all', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        status: searchCriteria.status || undefined,
        year: searchCriteria.year || undefined,
        search: searchText.value?.trim() || undefined
      }
    })
    batches.value = data?.result?.data || []
    totalItems.value = data?.result?.totalItems || 0
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

function resetSearch () {
  searchCriteria.status = null
  searchCriteria.year = null
  searchText.value = ''
  page.value = 1
  fetchBatches()
}

watch([() => searchCriteria.status, () => searchCriteria.year, searchText], () => {
  page.value = 1
  fetchBatches()
})

function goToDetail (item) {
  router.push(`/evaluationManagement/${item._id}`)
}

async function fetchAttendanceOptions (year) {
  if (!year) {
    attendanceOptions.value = []
    return
  }
  attendanceOptionsLoading.value = true
  try {
    const { data } = await apiAuth.get('/attendances', {
      params: { year, itemsPerPage: 500 }
    })
    const list = data?.result?.data || []
    attendanceOptions.value = list.map(a => ({
      ...a,
      displayName: `${a.name || '_'}（${a.year || '_'}年）`
    }))
  } catch {
    attendanceOptions.value = []
  } finally {
    attendanceOptionsLoading.value = false
  }
}

function openCreateDialog () {
  createDialog.name = ''
  createDialog.year = currentYear
  createDialog.startDate = null
  createDialog.dueDate = null
  createDialog.attendance = null
  createDialog.notifyAtStart = false
  createDialog.open = true
  fetchAttendanceOptions(createDialog.year)
}

watch(() => createDialog.year, (y) => {
  if (createDialog.open) fetchAttendanceOptions(y)
}, { immediate: false })

watch(() => createDialog.startDate, (v) => {
  if (!isStartDateOnOrAfterToday(v)) createDialog.notifyAtStart = false
})

function escapeHtml (s) {
  if (s == null || s === '') return ''
  const div = document.createElement('div')
  div.textContent = String(s)
  return div.innerHTML
}

function openDeleteDialog (item) {
  deleteDialog.batchId = item._id
  deleteDialog.expectedName = item.name || ''
  const safeName = escapeHtml(item.name || '_')
  deleteDialog.message = `確定要刪除「<span class='text-red-lighten-1' style='font-weight: 800;'>${safeName}</span>」嗎？此操作無法復原，相關考核表單將一併刪除。`
  deleteDialog.open = true
}

async function submitDelete () {
  if (!deleteDialog.batchId) return
  deleteDialog.submitting = true
  try {
    await apiAuth.delete(`/evaluation-batches/${deleteDialog.batchId}`)
    createSnackbar({ text: '刪除成功', snackbarProps: { color: 'teal-lighten-1' } })
    deleteDialog.open = false
    fetchBatches()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteDialog.submitting = false
  }
}

async function submitCreate () {
  const valid = await createFormRef.value?.validate()
  if (!valid?.valid) return

  createDialog.submitting = true
  try {
    const startDateStr = dateToYmdLocal(createDialog.startDate)
    const dueDateStr = dateToYmdLocal(createDialog.dueDate)
    const { data } = await apiAuth.post('/evaluation-batches', {
      name: createDialog.name.trim(),
      year: createDialog.year,
      startDate: startDateStr,
      dueDate: dueDateStr,
      attendance: createDialog.attendance || undefined,
      notifyAtStart: !!(createDialog.notifyAtStart && createNotifyAtStartEligible.value)
    })
    createSnackbar({ text: '建立成功', snackbarProps: { color: 'teal-lighten-1' } })
    createDialog.open = false
    fetchBatches()
    router.push(`/evaluationManagement/${data.result._id}`)
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '建立失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    createDialog.submitting = false
  }
}

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
</style>
