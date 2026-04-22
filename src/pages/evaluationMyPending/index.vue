<template>
  <v-container max-width="1280">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center flex-wrap gap-2 px-4 px-sm-6">
            <h3 class="mb-0">
              我的考核
            </h3>
            <v-spacer />
            <v-menu
              v-if="incompleteSelfBatches.length > 1"
              location="bottom"
            >
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  color="teal-darken-1"
                  elevation="1"
                  prepend-icon="mdi-account-edit-outline"
                  append-icon="mdi-menu-down"
                >
                  自我評分 ({{ incompleteSelfBatches.length }})
                </v-btn>
              </template>
              <v-list
                density="compact"
                class="py-0"
              >
                <v-list-item
                  v-for="s in incompleteSelfBatches"
                  :key="s.id"
                  :to="`/evaluationMyPending/self/${s.id}`"
                  :title="s.name"
                  rounded="lg"
                />
              </v-list>
            </v-menu>
            <v-btn
              v-else-if="incompleteSelfBatches.length === 1"
              color="teal-darken-1"
              elevation="1"
              prepend-icon="mdi-account-edit-outline"
              :to="`/evaluationMyPending/self/${incompleteSelfBatches[0].id}`"
            >
              自我評分
            </v-btn>
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
                  <span class="search-label">快速搜尋 :</span>
                  <v-text-field
                    v-model="searchCriteria.quickSearch"
                    density="compact"
                    variant="outlined"
                    placeholder="搜尋考核對象姓名"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
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

          <v-divider class="mb-2" />

          <v-card-text class="px-sm-6">
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="teal-darken-2"
            />
            <template v-else>
              <v-table
                v-if="tableDisplayRows.length > 0"
                class="rounded-lg"
                density="compact"
              >
                <thead>
                  <tr>
                    <th>考核對象</th>
                    <th>公司部門</th>
                    <th>考核名稱</th>
                    <th>年度</th>
                    <th>截止日期</th>
                    <th class="text-end">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in tableDisplayRows"
                    :key="item._id"
                    :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  >
                    <td>
                      {{ item.evaluateeName || '_' }}
                      <span
                        v-if="item.evaluateeEmployeeCode"
                        class="text-grey ms-1"
                      >({{ item.evaluateeEmployeeCode }})</span>
                    </td>
                    <td>{{ item.evaluateeDept || '_' }}</td>
                    <td>{{ item.batchName || '_' }}</td>
                    <td>{{ item.year || '_' }}</td>
                    <td>{{ formatListDueDate(item.listDueDate) }}</td>
                    <td class="text-end">
                      <v-btn
                        color="light-blue-darken-2"
                        variant="text"
                        size="small"
                        :ripple="false"
                        icon
                        :disabled="item.canEvaluateOthers === false"
                        :to="item.canEvaluateOthers === false ? undefined : `/evaluationMyPending/${item._id}`"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div
                v-else-if="list.length > 0 && filteredList.length === 0"
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
                  沒有符合條件的考核
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  請調整公司、部門或快速搜尋條件
                </p>
              </div>
              <div
                v-else-if="list.length > 0 && tableDisplayRows.length === 0"
                class="empty-state text-center py-12 border border-dashed border-md rounded-lg"
              >
                <v-icon
                  size="56"
                  color="grey-lighten-1"
                  class="mb-2"
                >
                  mdi-account-edit-outline
                </v-icon>
                <h3 class="text-h6 text-medium-emphasis mb-2">
                  目前沒有需要評核他人的項目
                </h3>
                <p class="text-body-2 text-medium-emphasis px-2">
                  若尚有自我評分未完成，請使用上方「自我評分」；此列表僅顯示您擔任評核者的考核項目。
                </p>
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
                  mdi-clipboard-check-outline
                </v-icon>
                <h3 class="text-h6 text-medium-emphasis mb-2">
                  目前沒有考核項目
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  您已填寫完所有考核，或目前沒有人資指派您進行考核
                </p>
              </div>
            </template>
          </v-card-text>
        </v-card>

        <v-dialog
          v-model="reminderDialogOpen"
          persistent
          max-width="460"
        >
          <v-card class="rounded-lg">
            <v-card-title
              class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
            >
              <v-icon
                icon="mdi-information-outline"
                :size="smAndUp ? '20' : '18'"
                color="white"
                class="me-2"
              />
              <span class="card-title text-white">注意事項</span>
            </v-card-title>
            <v-card-text class="px-4 px-sm-6 py-4 pb-sm-0 pt-sm-6">
              <p class="mb-3">
                請先完成<strong>自我評分表</strong>後，才能填寫對他人的評分表。
              </p>
              點擊右上方
              <v-btn
                color="teal-darken-1"
                prepend-icon="mdi-account-edit-outline"
                class="mx-2"
              >
                自我評分
              </v-btn>
              按鈕，前往自我評分表。
            </v-card-text>
            <v-card-actions class="px-6 pb-5">
              <v-spacer />
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                :size="smAndUp ? 'default' : 'small'"
                @click="acknowledgeReminder"
              >
                我已閱讀
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'

definePage({
  meta: {
    title: '我的考核 | Ystravel',
    login: true
  }
})

const { smAndUp } = useDisplay()
const route = useRoute()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()
const { _id: userMongoId, userId: userIdField } = storeToRefs(userStore)

const list = ref([])
const loading = ref(false)
const reminderDialogOpen = ref(false)

/** 依使用者區分，避免同裝置換帳號誤用已讀狀態 */
function reminderStorageKey () {
  const uid = (userMongoId.value || userIdField.value || '').trim() || 'guest'
  return `gi_evaluationMyPending_priorSelfReminder_${uid}`
}

/**
 * 待評清單中每一個「考核來源」鍵。
 * 有 batch 時含 lastSentAt（後端每次發送考核時更新），收回再發送會換鍵而再次顯示溫馨提醒。
 * 無 batch 則以單筆考核 id。已讀為累積集合，完成部分項目不會誤判。
 */
function batchReminderKey (item) {
  const b = item.batch
  if (b == null) return null
  const id = typeof b === 'object' && b !== null && b._id != null ? String(b._id) : String(b)
  const sentRaw = item.batchLastSentAt
  if (sentRaw != null && sentRaw !== '') {
    const t = new Date(sentRaw).getTime()
    if (!Number.isNaN(t)) return `batch:${id}@${t}`
  }
  return `batch:${id}`
}

function getCurrentPendingReminderKeys (items) {
  const keys = new Set()
  if (!items?.length) return keys
  for (const item of items) {
    const bk = batchReminderKey(item)
    if (bk != null) {
      keys.add(bk)
      continue
    }
    if (item._id != null) {
      keys.add(`eval:${String(item._id)}`)
    }
  }
  return keys
}

function readAcknowledgedReminderKeys () {
  try {
    const raw = localStorage.getItem(reminderStorageKey())
    if (!raw) return new Set()
    const o = JSON.parse(raw)
    if (o?.v === 2 && Array.isArray(o.keys)) {
      return new Set(o.keys.filter((k) => typeof k === 'string'))
    }
    return new Set()
  } catch {
    return new Set()
  }
}

function writeAcknowledgedReminderKeys (keySet) {
  try {
    const keys = [...keySet].filter((k) => typeof k === 'string').sort()
    localStorage.setItem(reminderStorageKey(), JSON.stringify({ v: 2, keys }))
  } catch {
    /* 無痕模式等可能無法寫入 */
  }
}

function tryOpenReminderAfterFetch () {
  const current = getCurrentPendingReminderKeys(list.value)
  if (current.size === 0) return
  const ack = readAcknowledgedReminderKeys()
  const hasUnseen = [...current].some((k) => !ack.has(k))
  if (hasUnseen) {
    reminderDialogOpen.value = true
  }
}

function acknowledgeReminder () {
  const current = getCurrentPendingReminderKeys(list.value)
  const ack = readAcknowledgedReminderKeys()
  current.forEach((k) => ack.add(k))
  writeAcknowledgedReminderKeys(ack)
  reminderDialogOpen.value = false
}

const searchCriteria = reactive({
  company: null,
  department: null,
  quickSearch: ''
})

const companyOptions = computed(() => {
  const set = new Set()
  list.value.forEach((e) => {
    const n = (e.companyName || '').trim()
    if (n) set.add(n)
  })
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hant'))
})

const departmentOptions = computed(() => {
  const company = searchCriteria.company
  if (!company) return []
  const set = new Set()
  list.value.forEach((e) => {
    if ((e.companyName || '').trim() !== company) return
    const d = (e.deptName || '').trim()
    if (d) set.add(d)
  })
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hant'))
})

function batchIdFromRow (i) {
  const b = i?.batch
  if (b == null) return null
  return typeof b === 'object' && b !== null && b._id != null ? String(b._id) : String(b)
}

/** 尚有未完成自評的批次（可多個），供單一按鈕或選單連結 */
const incompleteSelfBatches = computed(() => {
  const seen = new Map()
  for (const i of list.value) {
    if (!i.batch) continue
    const needSelf = i.needsSelfAssessment === true ||
      (i.needsSelfAssessment == null && i.canEvaluateOthers === false)
    if (!needSelf) continue
    const id = batchIdFromRow(i)
    if (!id || seen.has(id)) continue
    const name = (i.batchName || '').trim() || `考核批次（${id.slice(-6)}）`
    seen.set(id, { id, name })
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
})

const filteredList = computed(() => {
  let out = list.value
  if (searchCriteria.company) {
    const c = searchCriteria.company
    out = out.filter((e) => (e.companyName || '').trim() === c)
  }
  if (searchCriteria.department) {
    const d = searchCriteria.department
    out = out.filter((e) => (e.deptName || '').trim() === d)
  }
  const kw = (searchCriteria.quickSearch || '').trim().toLowerCase()
  if (kw) {
    out = out.filter((e) => {
      const name = (e.evaluateeName || '').toLowerCase()
      return name.includes(kw)
    })
  }
  return out
})

/** 表格不顯示「本人為考核對象」之列（自評請用上方按鈕），避免誤以為要評分自己 */
const tableDisplayRows = computed(() =>
  filteredList.value.filter((i) => !i.isOwnEvaluateeRow)
)

function onSearchCompanyChange () {
  searchCriteria.department = null
}

function resetSearch () {
  searchCriteria.company = null
  searchCriteria.department = null
  searchCriteria.quickSearch = ''
}

function formatListDueDate (date) {
  if (date == null || date === '') return '_'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '_'
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function toArray (val) {
  if (Array.isArray(val)) return val
  if (val?.data && Array.isArray(val.data)) return val.data
  return []
}

async function fetchList () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/evaluations/my-pending')
    list.value = toArray(data?.result)
    tryOpenReminderAfterFetch()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})

watch(
  () => route.fullPath,
  (path, prevPath) => {
    if (path.split('?')[0] !== '/evaluationMyPending') return
    if (prevPath != null && prevPath.startsWith('/evaluationMyPending/self')) {
      fetchList()
    }
  }
)
</script>

<style scoped>
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
.odd-row {
  background-color: #f6f8fa;
}
.even-row {
  background-color: #fffaf0;
}
</style>
