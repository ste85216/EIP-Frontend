<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>出勤管理</h3>
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
                  <span class="search-label">年度 :</span>
                  <v-select
                    v-model="searchCriteria.year"
                    :items="yearOptions"
                    variant="outlined"
                    density="compact"
                    placeholder="篩選年度"
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
          <v-divider class="my-0" />

          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-btn
                  color="teal-darken-2"
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  @click="openCreateDialog"
                >
                  新增出勤紀錄
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

          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :headers="headers"
              :items="items"
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
                  <td>{{ item.templateName || '_' }}</td>
                  <td class="text-center">
                    <template
                      v-for="fillChip in [attendanceListStatusChip(item.listFillStatus)]"
                      :key="`${item._id}-${fillChip.text}`"
                    >
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="fillChip.color"
                      >
                        {{ fillChip.text }}
                      </v-chip>
                    </template>
                  </td>
                  <td class="text-center">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      @click.stop="goToDetail(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
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

    <v-dialog
      v-model="createDialog.open"
      persistent
      max-width="360"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-calendar-plus"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">新增出勤紀錄</span>
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
          @submit.prevent="doCreate"
        >
          <v-card-text class="px-4 px-sm-6 py-4 pt-sm-7 pb-2">
            <v-text-field
              v-model="createDialog.name"
              label="* 名稱"
              variant="outlined"
              density="compact"
              placeholder="例如：2026年上半年度出勤分數"
              :rules="[v => !!v?.trim() || '請輸入名稱']"
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
                v => (v != null && v !== '' && !isNaN(Number(v))) || '請輸入年度',
                v => (Number(v) >= 2000 && Number(v) <= 2100) || '年度需介於 2000-2100'
              ]"
              class="mb-3"
            />
            <v-select
              v-model="createDialog.template"
              :items="templateOptions"
              item-title="name"
              item-value="_id"
              label="* 出勤表單模板"
              variant="outlined"
              density="compact"
              placeholder="請選擇"
              :rules="[v => !!v || '請選擇出勤表單模板']"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-5">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              :size="smAndUp ? 'default' : 'small'"
              type="button"
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
              新增
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ConfirmDeleteDialog
      v-model="deleteDialog.open"
      title="確認刪除"
      :message="`確定要刪除「${deleteDialog.name || ''}」嗎？`"
      @confirm="doDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'

definePage({
  meta: {
    title: '出勤管理 | Ystravel',
    login: true,
    permission: 'ATTENDANCE_MANAGEMENT_READ'
  }
})
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const headers = [
  { title: '名稱', key: 'name', sortable: false },
  { title: '年度', key: 'year', sortable: false },
  { title: '表單模板', key: 'templateName', sortable: false },
  { title: '狀態', key: 'listFillStatus', sortable: false, align: 'center' },
  { title: '操作', key: 'actions', sortable: false, width: 120, align: 'center' }
]

const items = ref([])
const loading = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const searchText = ref('')
const searchCriteria = reactive({ year: null })
const templateOptions = ref([])
const yearOptions = ref([])

function attendanceListStatusChip (status) {
  switch (status) {
    case 'empty':
      return { text: '尚無名單', color: 'grey-darken-1' }
    case 'incomplete':
      return { text: '填寫中', color: 'orange-darken-2' }
    case 'complete':
      return { text: '已完成', color: 'teal-darken-2' }
    default:
      return { text: '_', color: 'grey' }
  }
}

const createDialog = reactive({
  open: false,
  name: '',
  year: new Date().getFullYear(),
  template: null,
  submitting: false
})

const deleteDialog = reactive({
  open: false,
  id: null,
  name: ''
})
const createFormRef = ref(null)

async function fetchList () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/attendances', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        search: searchText.value || undefined,
        year: searchCriteria.year || undefined
      }
    })
    items.value = data?.result?.data || []
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

async function fetchTemplates () {
  try {
    const { data } = await apiAuth.get('/attendance-form-templates', {
      params: { itemsPerPage: 500 }
    })
    templateOptions.value = data?.result?.data || []
  } catch {
    templateOptions.value = []
  }
}

async function fetchYearOptions () {
  try {
    const { data } = await apiAuth.get('/attendances/years')
    yearOptions.value = data?.result || []
  } catch {
    yearOptions.value = []
  }
}

function handleOptionsChange (opts) {
  page.value = opts.page ?? 1
  itemsPerPage.value = opts.itemsPerPage || 10
  fetchList()
}

function resetSearch () {
  searchCriteria.year = null
  searchText.value = ''
  page.value = 1
  fetchList()
}

function goToDetail (item) {
  router.push(`/attendanceManagement/${item._id}`)
}

function openCreateDialog () {
  createDialog.name = ''
  createDialog.year = new Date().getFullYear()
  createDialog.template = null
  createDialog.open = true
  fetchTemplates()
}

function openDeleteDialog (item) {
  deleteDialog.id = item._id
  deleteDialog.name = item.name
  deleteDialog.open = true
}

async function doCreate () {
  const form = createFormRef.value
  if (form) {
    const { valid } = await form.validate()
    if (!valid) return
  }
  createDialog.submitting = true
  try {
    const { data } = await apiAuth.post('/attendances', {
      name: createDialog.name.trim(),
      year: createDialog.year,
      template: createDialog.template
    })
    createSnackbar({ text: '新增成功', snackbarProps: { color: 'teal-lighten-1' } })
    createDialog.open = false
    fetchList()
    fetchYearOptions()
    router.push(`/attendanceManagement/${data.result._id}`)
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '新增失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    createDialog.submitting = false
  }
}

async function doDelete () {
  if (!deleteDialog.id) return
  try {
    await apiAuth.delete(`/attendances/${deleteDialog.id}`)
    createSnackbar({ text: '已刪除', snackbarProps: { color: 'teal-lighten-1' } })
    deleteDialog.open = false
    fetchList()
    fetchYearOptions()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

watch([searchText, () => searchCriteria.year], () => {
  page.value = 1
  fetchList()
})

onMounted(() => {
  fetchList()
  fetchYearOptions()
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
