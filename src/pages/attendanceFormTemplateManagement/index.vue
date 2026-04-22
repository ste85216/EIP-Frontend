<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>出勤表單管理</h3>
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
                  <span class="search-label">年度 :</span>
                  <v-select
                    v-model="searchCriteria.year"
                    :items="yearOptions"
                    variant="outlined"
                    density="compact"
                    placeholder="請選擇年度"
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

          <!-- 功能按鈕和快速搜尋區 -->
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
                  class="me-4"
                  @click="openCreateDialog"
                >
                  新增表單模板
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
                    placeholder="搜尋表單名稱"
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
              :items="templates"
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
                    <span class="font-weight-medium">{{ item.name }}</span>
                  </td>
                  <td>{{ item.year || '_' }}</td>
                  <td>{{ formatWeight(item.weight) }}</td>
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
                      color="teal-darken-2"
                      @click.stop="openCopyConfirmDialog(item)"
                    >
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="red-lighten-1"
                      title="刪除"
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

    <!-- 新增表單模板對話框 -->
    <v-dialog
      v-model="createDialog.open"
      persistent
      max-width="380"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-text-box-plus-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">新增出勤表單模板</span>
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
              label="* 表單名稱"
              variant="outlined"
              density="compact"
              :rules="[v => !!v?.trim() || '請輸入表單名稱']"
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
              hide-details
            />
          </v-card-text>

          <v-card-actions class="px-6 pb-5">
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
              新增
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="copyConfirmDialog.open"
      :max-width="340"
      title="確認複製"
      :message="`確定要複製「${copyConfirmDialog.name || ''}」嗎？將建立一個新的表單模板。`"
      confirm-button-text="複製"
      header-color="bg-teal-darken-2"
      header-icon="mdi-content-copy"
      @confirm="doCopyTemplate"
    />

    <ConfirmDeleteDialog
      v-model="deleteDialog.open"
      title="確認刪除"
      :message="`確定要刪除「${deleteDialog.name}」嗎？`"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

definePage({
  meta: {
    title: '出勤表單管理 | Ystravel',
    login: true,
    permission: 'ATTENDANCE_FORM_TEMPLATE_MANAGEMENT_READ'
  }
})

const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const searchCriteria = reactive({
  year: null
})

const headers = [
  { title: '表單名稱', key: 'name', sortable: false },
  { title: '年度', key: 'year', sortable: false },
  { title: '出勤權重', key: 'weight', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: 160, align: 'center' }
]

const templates = ref([])
const loading = ref(false)
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const searchText = ref('')
const yearOptions = ref([])
const createFormRef = ref(null)

const currentYear = new Date().getFullYear()

const createDialog = reactive({
  open: false,
  name: '',
  year: currentYear,
  submitting: false
})

const copyConfirmDialog = reactive({ open: false, item: null, name: '' })

const deleteDialog = reactive({
  open: false,
  id: null,
  name: ''
})

function formatWeight (w) {
  if (w == null || w === '') return '_'
  const pct = Math.round((Number(w) || 0) * 100)
  return `${pct}%`
}

async function fetchYearOptions () {
  try {
    const { data } = await apiAuth.get('/attendance-form-templates/years')
    yearOptions.value = data?.result || []
  } catch {
    yearOptions.value = []
  }
}

async function fetchTemplates () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/attendance-form-templates', {
      params: {
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        search: searchText.value,
        year: searchCriteria.year ?? undefined
      }
    })
    templates.value = data?.result?.data || []
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
  fetchTemplates()
}

function resetSearch () {
  searchCriteria.year = null
  searchText.value = ''
  page.value = 1
  fetchTemplates()
}

watch([searchText, () => searchCriteria.year], () => {
  page.value = 1
  fetchTemplates()
})

function goToDetail (item) {
  router.push(`/attendanceFormTemplateManagement/${item._id}`)
}

function openCreateDialog () {
  createDialog.name = ''
  createDialog.year = new Date().getFullYear()
  createDialog.open = true
}

async function submitCreate () {
  const valid = await createFormRef.value?.validate()
  if (!valid?.valid) return

  createDialog.submitting = true
  try {
    const { data } = await apiAuth.post('/attendance-form-templates', {
      name: createDialog.name.trim(),
      year: createDialog.year
    })
    createSnackbar({ text: '新增成功', snackbarProps: { color: 'teal-lighten-1' } })
    createDialog.open = false
    fetchTemplates()
    fetchYearOptions()
    router.push(`/attendanceFormTemplateManagement/${data.result._id}`)
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '新增失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    createDialog.submitting = false
  }
}

function openCopyConfirmDialog (item) {
  copyConfirmDialog.item = item
  copyConfirmDialog.name = item?.name || ''
  copyConfirmDialog.open = true
}

async function doCopyTemplate () {
  const item = copyConfirmDialog.item
  if (!item?._id) return
  try {
    const { data } = await apiAuth.post(`/attendance-form-templates/${item._id}/copy`)
    createSnackbar({ text: '複製成功', snackbarProps: { color: 'teal-lighten-1' } })
    copyConfirmDialog.open = false
    fetchTemplates()
    fetchYearOptions()
    router.push(`/attendanceFormTemplateManagement/${data.result._id}`)
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const cannotDeleteReferencedMessage = '此表單模板已被出勤紀錄或考核表單模板關聯使用，無法刪除'

function openDeleteDialog (item) {
  if (item?.isReferenced) {
    createSnackbar({
      text: cannotDeleteReferencedMessage,
      snackbarProps: { color: 'orange-darken-2' }
    })
    return
  }
  deleteDialog.id = item._id
  deleteDialog.name = item.name
  deleteDialog.open = true
}

async function confirmDelete () {
  if (!deleteDialog.id) return
  try {
    await apiAuth.delete(`/attendance-form-templates/${deleteDialog.id}`)
    createSnackbar({ text: '刪除成功', snackbarProps: { color: 'teal-lighten-1' } })
    deleteDialog.open = false
    fetchTemplates()
    fetchYearOptions()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    deleteDialog.open = false
  }
}

onMounted(() => {
  fetchTemplates()
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
