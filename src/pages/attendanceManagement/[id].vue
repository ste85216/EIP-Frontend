<template>
  <v-container max-width="1680">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-0 pt-md-3 pb-md-5 px-0">
          <div
            v-if="loading && !attendance"
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

          <template v-else-if="attendance">
            <!-- 出勤資訊 -->
            <div class="px-4 px-sm-6 pb-6 pt-3">
              <v-btn
                prepend-icon="mdi-arrow-left"
                variant="text"
                :size="smAndUp ? 'default' : 'small'"
                color="blue-grey-darken-2"
                class="px-2 mb-2"
                @click="router.push('/attendanceManagement')"
              >
                返回列表
              </v-btn>
              <div class="d-flex align-center mb-1">
                <h3 class="me-1">
                  {{ attendance.name || '_' }}
                </h3>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="grey"
                  @click="openAttendanceEditDialog"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <div class="text-body-2 text-grey-darken-1 d-flex align-center flex-wrap">
                <span class="d-inline-flex align-center">
                  <v-icon
                    icon="mdi-calendar-outline"
                    size="14"
                    color="grey-darken-1"
                    class="me-1"
                  />
                  年度：{{ attendance.year || '_' }}
                </span>
                <span class="mx-2">｜</span>
                <span class="d-inline-flex align-center">
                  <v-icon
                    icon="mdi-file-document-outline"
                    size="14"
                    color="grey-darken-1"
                    class="me-1"
                  />
                  表單模板：{{ attendance.template?.name || '_' }}
                </span>
                <span class="mx-2">｜</span>
                <span class="d-inline-flex align-center">
                  <v-icon
                    icon="mdi-percent-outline"
                    size="14"
                    color="grey-darken-1"
                    class="me-1"
                  />
                  出勤權重：{{ formatTemplateWeight(attendance.template?.weight) }}
                </span>
              </div>
            </div>
            <v-divider class="py-1" />

            <!-- 搜尋條件區塊 -->
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
                      @update:model-value="onSearchCompanyChange"
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
                    <span class="search-label">狀態 :</span>
                    <v-select
                      v-model="searchCriteria.fillStatus"
                      :items="fillStatusOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      placeholder="請選擇狀態"
                      clearable
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

            <!-- 新增按鈕 + 關鍵字搜尋 -->
            <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
              <v-col
                cols="12"
                class="ps-4 pb-sm-4"
              >
                <v-row class="d-flex align-center px-5 px-md-2">
                  <v-btn
                    color="teal-darken-2"
                    prepend-icon="mdi-account-sync"
                    variant="outlined"
                    :loading="initLoading"
                    @click="openSyncInitConfirm"
                  >
                    同步在職員工
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
                      v-model="keywordSearch"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋員工姓名"
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
                v-if="list.length > 0 && filteredList.length > 0"
                v-model:items-per-page="recordItemsPerPage"
                v-model:page="recordPage"
                :headers="recordHeaders"
                :items="paginatedFilteredList"
                :items-length="filteredList.length"
                hover
                density="compact"
                class="rounded-ts-lg rounded-te-lg"
                :items-per-page-options="[10, 15, 20, 25, 50, 100]"
                @update:options="handleRecordTableOptions"
              >
                <template #item="{ item, index }">
                  <tr
                    :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  >
                    <td>{{ item.companyName }}</td>
                    <td>{{ item.deptName }}</td>
                    <td>{{ item.employeeName }}</td>
                    <td class="text-center">
                      <v-chip
                        v-if="item.filledAt"
                        size="small"
                        color="teal-darken-1"
                        variant="tonal"
                      >
                        已填寫
                      </v-chip>
                      <v-chip
                        v-else
                        size="small"
                        color="grey-darken-1"
                        variant="tonal"
                      >
                        尚未填寫
                      </v-chip>
                    </td>
                    <td class="text-center">
                      {{ item.tardyCount ?? '_' }}
                    </td>
                    <td class="text-center">
                      {{ item.tardyMinutes ?? '_' }}
                    </td>
                    <td class="text-center">
                      {{ item.forgotPunchCount ?? '_' }}
                    </td>
                    <td class="text-center">
                      {{ item.personalLeaveHours ?? '_' }}
                    </td>
                    <td class="text-center">
                      <span :class="{ 'font-weight-bold': item.rawScore != null }">
                        {{ item.rawScore != null ? item.rawScore : '_' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span :class="{ 'font-weight-bold': item.weightedScore != null }">
                        {{ item.weightedScore != null ? item.weightedScore : '_' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon
                        variant="text"
                        size="x-small"
                        color="light-blue-darken-2"
                        @click="openEditDialog(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        size="x-small"
                        color="red-lighten-1"
                        @click="openRemoveDialog(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table-server>
              <div
                v-else-if="list.length > 0"
                class="empty-state text-center py-12 border border-dashed border-md rounded-lg"
              >
                <v-icon
                  size="56"
                  color="grey-lighten-1"
                  class="mb-2"
                >
                  mdi-filter-remove-outline
                </v-icon>
                <h3 class="text-h6 text-medium-emphasis mb-2">
                  沒有符合條件的資料
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  請調整公司、部門、狀態或搜尋員工姓名
                </p>
                <v-btn
                  variant="outlined"
                  color="grey"
                  @click="resetSearch"
                >
                  清除篩選
                </v-btn>
              </div>
              <div
                v-else
                class="empty-state text-center py-12 border border-dashed border-md rounded-lg"
              >
                <v-icon
                  size="56"
                  color="grey-lighten-1"
                  class="mb-2"
                >
                  mdi-calendar-account-outline
                </v-icon>
                <h3 class="text-h6 text-medium-emphasis mb-2">
                  尚無員工出勤紀錄
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  請點選上方「 同步在職員工 」，將在職員工加入此出勤名單
                </p>
              </div>
            </v-card-text>
          </template>

          <v-card-text
            v-else
            class="text-center py-10"
          >
            <div class="text-grey">
              找不到此出勤
            </div>
            <v-btn
              color="teal-darken-2"
              variant="outlined"
              class="mt-4"
              @click="router.push('/attendanceManagement')"
            >
              返回列表
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="editDialog.open"
      max-width="420"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-clipboard-edit-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">填寫出勤資料</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="editDialog.open = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-form
          ref="editRecordFormRef"
          @submit.prevent="saveRecord"
        >
          <v-card-text class="px-4 px-sm-6 py-4 py-sm-4">
            <div class="mb-5 mt-1 rounded">
              <div class="card-title">
                <span class="font-weight-bold me-3 text-grey-darken-3">員工 :</span>
                <span class="text-teal-darken-2">{{ editDialog.employeeName || '_' }}</span>
                <span class="font-weight-bold ms-4 me-3 text-grey-darken-3">公司部門 :</span>
                <span class="text-teal-darken-2">{{ editDialog.companyDept || '_' }}</span>
              </div>
            </div>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editDialog.tardyCount"
                  label="* 遲到次數"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  :rules="[v => (v != null && v !== '' && !isNaN(Number(v)) && Number(v) >= 0) || '此欄位必填']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editDialog.tardyMinutes"
                  label="* 遲到累計分鐘"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  :rules="[v => (v != null && v !== '' && !isNaN(Number(v)) && Number(v) >= 0) || '此欄位必填']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editDialog.forgotPunchCount"
                  label="* 忘記打卡次數"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  :rules="[v => (v != null && v !== '' && !isNaN(Number(v)) && Number(v) >= 0) || '此欄位必填']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editDialog.personalLeaveHours"
                  label="* 事假累積時數"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  step="0.5"
                  :rules="[v => (v != null && v !== '' && !isNaN(Number(v)) && Number(v) >= 0) || '此欄位必填']"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-6 pt-0 pb-5">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              :size="smAndUp ? 'default' : 'small'"
              type="button"
              @click="editDialog.open = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-2"
              :size="smAndUp ? 'default' : 'small'"
              type="submit"
              :loading="editDialog.submitting"
            >
              儲存
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 編輯出勤基本資料對話框 -->
    <v-dialog
      v-model="attendanceEditDialog.open"
      persistent
      max-width="360"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-pencil"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">編輯出勤</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            color="white"
            size="32"
            @click="attendanceEditDialog.open = false"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-form
          ref="attendanceEditFormRef"
          @submit.prevent="saveAttendance"
        >
          <v-card-text class="px-6 pt-6 pb-2">
            <v-text-field
              v-model="attendanceEditDialog.name"
              label="* 名稱"
              variant="outlined"
              density="compact"
              :rules="[v => !!v?.trim() || '請輸入名稱']"
              class="mb-3"
            />
            <v-text-field
              v-model.number="attendanceEditDialog.year"
              label="* 年度"
              variant="outlined"
              density="compact"
              type="number"
              min="2000"
              max="2100"
              :rules="[v => (v != null && !isNaN(v) && v >= 2000 && v <= 2100) || '請輸入有效年度（2000-2100）']"
              class="mb-3"
            />
            <v-select
              v-model="attendanceEditDialog.template"
              :items="templateOptions"
              item-title="name"
              item-value="_id"
              label="* 關聯表單模板"
              variant="outlined"
              density="compact"
              clearable
              :rules="[v => !!v || '請選擇關聯表單模板']"
            />
          </v-card-text>
          <v-card-actions class="px-6 pt-3 pb-5">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              type="button"
              @click="attendanceEditDialog.open = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-2"
              type="submit"
              :loading="attendanceEditDialog.submitting"
            >
              儲存
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="removeDialog.open"
      dialog-width="360"
      title="確認排除"
      :message="`確定要排除「${removeDialog.employeeName || ''}」嗎？排除後該員工將不會出現在此出勤名單中。`"
      confirm-button-text="確認排除"
      confirm-button-color="red-lighten-1"
      header-color="bg-red-lighten-1"
      header-icon="mdi-delete-alert"
      @confirm="confirmRemoveRecord"
    />

    <ConfirmDialog
      v-model="syncInitConfirmOpen"
      dialog-width="360"
      title="確認同步在職員工"
      :message="syncInitConfirmMessage"
      confirm-button-text="確定同步"
      confirm-button-color="teal-darken-2"
      header-color="bg-teal-darken-2"
      header-icon="mdi-account-sync"
      @confirm="confirmSyncInitRecords"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

definePage({
  meta: {
    title: '出勤詳情 | Ystravel',
    login: true,
    permission: 'ATTENDANCE_MANAGEMENT_READ'
  }
})

const route = useRoute()
const router = useRouter()
const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const attendanceId = computed(() => route.params.id)
const attendance = ref(null)
const list = ref([])
const loading = ref(true)
const initLoading = ref(false)
const syncInitConfirmOpen = ref(false)
const keywordSearch = ref('')
const recordPage = ref(1)
const recordItemsPerPage = ref(15)
const recordHeaders = [
  { title: '公司', key: 'companyName', sortable: false },
  { title: '部門', key: 'deptName', sortable: false },
  { title: '姓名', key: 'employeeName', sortable: false },
  { title: '狀態', key: 'fillStatus', sortable: false, align: 'center' },
  { title: '遲到次數', key: 'tardyCount', sortable: false, align: 'center' },
  { title: '遲到分鐘', key: 'tardyMinutes', sortable: false, align: 'center' },
  { title: '忘記打卡', key: 'forgotPunchCount', sortable: false, align: 'center' },
  { title: '事假時數', key: 'personalLeaveHours', sortable: false, align: 'center' },
  { title: '出勤原始分數', key: 'rawScore', sortable: false, align: 'center' },
  { title: '加權分數', key: 'weightedScore', sortable: false, align: 'center' },
  { title: '操作', key: 'actions', sortable: false, align: 'center' }
]
const templateOptions = ref([])

const fillStatusOptions = [
  { title: '已填寫', value: 'filled' },
  { title: '尚未填寫', value: 'unfilled' }
]

const searchCriteria = reactive({
  company: null,
  department: null,
  fillStatus: null
})

const attendanceEditDialog = reactive({
  open: false,
  name: '',
  year: null,
  template: null,
  submitting: false
})

const editDialog = reactive({
  open: false,
  employeeId: null,
  employeeName: '',
  companyDept: '',
  tardyCount: null,
  tardyMinutes: null,
  forgotPunchCount: null,
  personalLeaveHours: null,
  submitting: false
})

const editRecordFormRef = ref(null)
const removeDialog = reactive({
  open: false,
  employeeId: null,
  employeeName: ''
})
const attendanceEditFormRef = ref(null)

const companyOptions = computed(() => {
  const set = new Set()
  list.value.forEach((row) => {
    if (row.companyName) set.add(row.companyName)
  })
  return [...set].sort()
})

const departmentOptions = computed(() => {
  const company = searchCriteria.company
  if (!company) return []
  const set = new Set()
  list.value.forEach((row) => {
    if (row.companyName === company && row.deptName) set.add(row.deptName)
  })
  return [...set].sort()
})

const syncInitConfirmMessage = computed(() => {
  if (list.value.length === 0) {
    return '將依目前在職員工建立此出勤名單，確定要執行嗎？'
  }
  return '同步會把「目前在職、但尚未出現在此出勤名單」的員工加入。<br><br>若您曾手動排除某位員工（例如不需計算出勤者），只要他仍在職，同步後<strong>可能會再次被加入</strong>。確定要同步嗎？'
})

const filteredList = computed(() => {
  let result = list.value
  if (searchCriteria.company) {
    result = result.filter(r => r.companyName === searchCriteria.company)
  }
  if (searchCriteria.department) {
    result = result.filter(r => r.deptName === searchCriteria.department)
  }
  if (searchCriteria.fillStatus === 'filled') {
    result = result.filter(r => !!r.filledAt)
  } else if (searchCriteria.fillStatus === 'unfilled') {
    result = result.filter(r => !r.filledAt)
  }
  const kw = (keywordSearch.value || '').trim().toLowerCase()
  if (kw) {
    result = result.filter(r => (r.employeeName || '').toLowerCase().includes(kw))
  }
  return result
})

const paginatedFilteredList = computed(() => {
  const start = (recordPage.value - 1) * recordItemsPerPage.value
  return filteredList.value.slice(start, start + recordItemsPerPage.value)
})

function handleRecordTableOptions (opts) {
  recordPage.value = opts.page ?? 1
  recordItemsPerPage.value = opts.itemsPerPage ?? 15
}

watch(
  () => [searchCriteria.company, searchCriteria.department, searchCriteria.fillStatus, keywordSearch.value],
  () => {
    recordPage.value = 1
  }
)

function onSearchCompanyChange () {
  searchCriteria.department = null
}

function resetSearch () {
  searchCriteria.company = null
  searchCriteria.department = null
  searchCriteria.fillStatus = null
  keywordSearch.value = ''
  recordPage.value = 1
}

function formatTemplateWeight (w) {
  if (w == null || w === '') return '_'
  const pct = Math.round((Number(w) || 0) * 100)
  return `${pct}%`
}

async function fetchTemplates () {
  try {
    const { data } = await apiAuth.get('/attendance-form-templates', { params: { itemsPerPage: 500 } })
    templateOptions.value = data?.result?.data || []
  } catch {
    templateOptions.value = []
  }
}

function openAttendanceEditDialog () {
  if (!attendance.value) return
  attendanceEditDialog.name = attendance.value.name || ''
  attendanceEditDialog.year = attendance.value.year ?? null
  attendanceEditDialog.template = attendance.value.template?._id || attendance.value.template || null
  attendanceEditDialog.open = true
}

async function saveAttendance () {
  const form = attendanceEditFormRef.value
  if (!form) return
  const { valid } = await form.validate()
  if (!valid) return
  if (!attendanceId.value) return
  attendanceEditDialog.submitting = true
  try {
    await apiAuth.patch(`/attendances/${attendanceId.value}`, {
      name: attendanceEditDialog.name?.trim(),
      year: attendanceEditDialog.year,
      template: attendanceEditDialog.template || null
    })
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
    attendanceEditDialog.open = false
    await fetchDetail()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    attendanceEditDialog.submitting = false
  }
}

async function fetchDetail () {
  if (!attendanceId.value) return
  loading.value = true
  try {
    const [{ data: attData }, { data: recData }] = await Promise.all([
      apiAuth.get(`/attendances/${attendanceId.value}`),
      apiAuth.get(`/attendances/${attendanceId.value}/records`)
    ])
    attendance.value = attData?.result
    list.value = recData?.result?.list || []
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

function openSyncInitConfirm () {
  if (!attendanceId.value) return
  syncInitConfirmOpen.value = true
}

function confirmSyncInitRecords () {
  void initRecords()
}

async function initRecords () {
  if (!attendanceId.value) return
  initLoading.value = true
  try {
    await apiAuth.post(`/attendances/${attendanceId.value}/init-records`)
    createSnackbar({ text: '已新增員工紀錄', snackbarProps: { color: 'teal-lighten-1' } })
    await fetchDetail()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    initLoading.value = false
  }
}

function openEditDialog (row) {
  editDialog.employeeId = row.employee?._id || row.employee
  editDialog.employeeName = row.employeeName || ''
  editDialog.companyDept = [row.companyName, row.deptName].filter(Boolean).join(' - ') || '_'
  editDialog.tardyCount = row.tardyCount ?? null
  editDialog.tardyMinutes = row.tardyMinutes ?? null
  editDialog.forgotPunchCount = row.forgotPunchCount ?? null
  editDialog.personalLeaveHours = row.personalLeaveHours ?? null
  editDialog.open = true
}

async function saveRecord () {
  const form = editRecordFormRef.value
  if (form) {
    const { valid } = await form.validate()
    if (!valid) return
  }
  if (!editDialog.employeeId) return
  editDialog.submitting = true
  try {
    await apiAuth.post(`/attendances/${attendanceId.value}/records`, {
      employeeId: editDialog.employeeId,
      tardyCount: editDialog.tardyCount,
      tardyMinutes: editDialog.tardyMinutes,
      forgotPunchCount: editDialog.forgotPunchCount,
      personalLeaveHours: editDialog.personalLeaveHours
    })
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
    editDialog.open = false
    await fetchDetail()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    editDialog.submitting = false
  }
}

function openRemoveDialog (row) {
  removeDialog.employeeId = row.employee?._id || row.employee
  removeDialog.employeeName = row.employeeName
  removeDialog.open = true
}

async function confirmRemoveRecord () {
  const employeeId = removeDialog.employeeId
  if (!employeeId || !attendanceId.value) return
  try {
    await apiAuth.delete(`/attendances/${attendanceId.value}/records`, {
      params: { employeeId }
    })
    createSnackbar({ text: '已排除該員工', snackbarProps: { color: 'teal-lighten-1' } })
    removeDialog.open = false
    await fetchDetail()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

onMounted(() => {
  fetchTemplates()
  fetchDetail()
})
</script>

<style scoped>
.search-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}
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
