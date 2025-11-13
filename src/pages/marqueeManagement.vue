<template>
  <v-container max-width="1600">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題與操作 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>跑馬燈管理</h3>
      </v-col>

      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-btn
                  prepend-icon="mdi-bullhorn"
                  variant="outlined"
                  color="teal-darken-1"
                  class="me-4"
                  @click="openCreateDialog"
                >
                  新增跑馬燈
                </v-btn>
                <v-btn
                  prepend-icon="mdi-broadcast"
                  variant="outlined"
                  color="red-darken-1"
                  class="me-4"
                  :loading="isBroadcasting"
                  @click="showBroadcastDialog = true"
                >
                  重新推播
                </v-btn>
                <v-btn
                  prepend-icon="mdi-sort"
                  variant="outlined"
                  color="blue-grey-darken-2"
                  @click="openSortDialog"
                >
                  排序
                </v-btn>
              </v-col>
              <v-col
                sm="3"
                lg="2"
                class="pe-1"
              >
                <v-select
                  v-model="searchCriteria.type"
                  :items="typeOptionsForFilter"
                  item-title="title"
                  item-value="value"
                  label="類型篩選"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                sm="3"
                lg="2"
                class="pe-1"
              >
                <v-select
                  v-model="searchCriteria.isActive"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="狀態篩選"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                sm="4"
                lg="3"
              >
                <v-text-field
                  v-model="searchCriteria.quickSearch"
                  label="快速搜尋（內容）"
                  append-inner-icon="mdi-magnify"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="items"
              :loading="tableLoading"
              :page="currentPage"
              :items-length="totalItems"
              density="compact"
              class="elevation-0 rounded"
              @update:options="handleTableOptions"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td class="text-center">
                    <v-chip
                      size="small"
                      color="blue-grey"
                      variant="tonal"
                    >
                      {{ item.order || 0 }}
                    </v-chip>
                  </td>
                  <td>
                    <v-chip
                      :color="getTypeColor(item.type)"
                      size="small"
                    >
                      {{ getTypeText(item.type) }}
                    </v-chip>
                  </td>
                  <td>
                    <div
                      class="text-truncate"
                      style="max-width: 200px;"
                    >
                      {{ item.content }}
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getStatusColor(item)"
                      size="small"
                    >
                      {{ getStatusText(item) }}
                    </v-chip>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ formatDateOnly(item.startDate) }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTimeOnly(item.startDate) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ formatDateOnly(item.endDate) }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTimeOnly(item.endDate) }}</span>
                    </div>
                  </td>
                  <td>{{ item.publisher?.name || '未知' }}</td>
                  <td>
                    <div class="d-flex align-center gap-1 justify-center">
                      <v-btn
                        icon
                        size="small"
                        color="blue"
                        variant="text"
                        @click="editItem(item)"
                      >
                        <v-icon size="18">
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        :color="item.isActive ? 'orange' : 'green'"
                        variant="text"
                        @click="toggleActive(item)"
                      >
                        <v-icon size="18">
                          {{ item.isActive ? 'mdi-pause' : 'mdi-play' }}
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="red"
                        variant="text"
                        @click="confirmDelete(item)"
                      >
                        <v-icon size="18">
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="showEditDialog"
      max-width="680"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-bullhorn"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ isEditing ? '編輯跑馬燈' : '新增跑馬燈' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeEditDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="formRef"
            @submit.prevent="submit"
          >
            <v-row>
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="form.type"
                  :items="typeOptions"
                  item-title="label"
                  item-value="value"
                  label="類型 *"
                  variant="outlined"
                  density="compact"
                  :error="errors.type"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model.number="form.order"
                  label="排序（選填）"
                  type="number"
                  variant="outlined"
                  density="compact"
                  min="0"
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-switch
                  v-model="form.isActive"
                  label="啟用"
                  color="green"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="form.startDate"
                  label="開始時間"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-calendar-clock"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="form.endDate"
                  label="結束時間"
                  type="datetime-local"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-calendar-clock"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col
                cols="12"
              >
                <v-textarea
                  v-model.trim="form.content"
                  label="內容 *"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  counter="200"
                  :error="errors.content"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeEditDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="submitting"
            @click="submit"
          >
            {{ isEditing ? '更新' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 排序管理對話框 -->
    <v-dialog
      v-model="showSortDialog"
      max-width="400"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-sort"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">跑馬燈排序</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="showSortDialog = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4">
          <div class="text-subtitle-1 mb-4">
            拖拽調整跑馬燈顯示順序
          </div>
          <draggable
            v-model="sortableItems"
            item-key="_id"
            class="sortable-list"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element, index }">
              <v-list-item
                :key="element._id"
                class="border rounded mb-2"
              >
                <template #prepend>
                  <div class="drag-handle cursor-move me-2">
                    <v-icon color="grey-darken-1">
                      mdi-drag-vertical
                    </v-icon>
                  </div>
                </template>
                <v-list-item-title>
                  <v-chip
                    size="x-small"
                    :color="getTypeColor(element.type)"
                    class="me-2"
                  >
                    {{ getTypeText(element.type) }}
                  </v-chip>
                  <span
                    class="text-truncate"
                    style="max-width: 420px; display: inline-block; vertical-align: middle;"
                  >{{ element.content }}</span>
                </v-list-item-title>
                <template #append>
                  <v-chip
                    size="small"
                    color="blue-grey"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="showSortDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-grey-darken-2"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isUpdatingOrder"
            @click="updateOrder"
          >
            更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :width="320"
      :title="`確認刪除跑馬燈`"
      :message="`確定要刪除這則內容嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="doDelete"
    />

    <!-- 重新推播確認對話框 -->
    <ConfirmDialog
      v-model="showBroadcastDialog"
      :dialog-width="'320'"
      title="確認重新推播"
      message="此動作將強制所有使用者重新顯示跑馬燈，是否繼續？"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="確認"
      cancel-button-text="取消"
      header-color="bg-red-darken-1"
      header-icon="mdi-bullhorn"
      @confirm="doBroadcast"
    />
  </v-container>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref, onMounted, watch } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import draggable from 'vuedraggable'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

definePage({
  meta: {
    title: '跑馬燈管理 | Ystravel',
    login: true,
    permission: 'MARQUEE_MANAGEMENT_READ'
  }
})

const createSnackbar = useSnackbar()
const { apiAuth } = useApi()
const { smAndUp } = useDisplay()

// 資料
const items = ref([])
const tableLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)

// 搜尋條件
const searchCriteria = ref({ type: null, isActive: null, quickSearch: '' })

// 選項
const typeOptions = [
  { label: '一般', value: 'announcement' },
  { label: '系統', value: 'system' },
  { label: '更新', value: 'update' },
  { label: '維護', value: 'maintenance' },
  { label: '活動', value: 'event' }
]
const typeOptionsForFilter = [ { title: '全部', value: null }, ...typeOptions.map(t => ({ title: t.label, value: t.value })) ]
const statusOptions = [
  { title: '全部', value: null },
  { title: '啟用', value: true },
  { title: '停用', value: false },
  { title: '已過期', value: 'expired' }
]

// 表頭
const headers = [
  { title: '排序', key: 'order', sortable: false, align: 'center'},
  { title: '類型', key: 'type', sortable: true },
  { title: '內容', key: 'content', sortable: false },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '開始時間', key: 'startDate', sortable: true },
  { title: '結束時間', key: 'endDate', sortable: true },
  { title: '發布者', key: 'publisher', sortable: false },
  { title: '操作', key: 'actions', sortable: false, align: 'center' }
]

// 表單
const showEditDialog = ref(false)
const isEditing = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const form = ref({ type: 'announcement', content: '', startDate: '', endDate: '', order: 0, isActive: true, _id: null })
const errors = ref({ type: false, content: false })

// 排序
const showSortDialog = ref(false)
const sortableItems = ref([])
const isUpdatingOrder = ref(false)
const isBroadcasting = ref(false)
const showBroadcastDialog = ref(false)

// 刪除
const showDeleteDialog = ref(false)
const selectedId = ref(null)

// 載入列表
const loadList = async () => {
  try {
    tableLoading.value = true
    const params = { page: currentPage.value, itemsPerPage: itemsPerPage.value }
    if (searchCriteria.value.type) params.type = searchCriteria.value.type
    if (searchCriteria.value.isActive !== null) {
      if (searchCriteria.value.isActive === 'expired') params.expired = true
      else params.isActive = searchCriteria.value.isActive
    }
    if (searchCriteria.value.quickSearch) params.quickSearch = searchCriteria.value.quickSearch
    const { data } = await apiAuth.get('/marquees', { params })
    items.value = data.result.data
    totalItems.value = data.result.totalItems
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '載入失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    tableLoading.value = false
  }
}

const performSearch = async () => { currentPage.value = 1; await loadList() }
const debouncedQuickSearch = debounce(() => { currentPage.value = 1; tableLoading.value = true; performSearch().finally(() => { tableLoading.value = false }) }, 300)

const handleTableOptions = (options) => {
  if (options.page !== undefined) currentPage.value = options.page
  if (options.itemsPerPage !== undefined) itemsPerPage.value = options.itemsPerPage
  loadList()
}

// 新增/編輯
const openCreateDialog = async () => {
  isEditing.value = false
  await showCreateForm()
  showEditDialog.value = true
}
const showCreateForm = async () => {
  resetForm()
  try {
    const { data } = await apiAuth.get('/marquees/max-order')
    const maxOrder = data.result || 0
    form.value.order = Number(maxOrder) + 1
  } catch {
    const localMax = items.value.length > 0 ? Math.max(...items.value.map(it => it.order || 0)) : 0
    form.value.order = Number(localMax) + 1
  }
  // 預設開始時間為當下（本地時間字串，供 datetime-local 使用）
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  const localNow = new Date(now.getTime() - offset)
  form.value.startDate = localNow.toISOString().slice(0, 16)
  form.value.isActive = true
}
const editItem = (item) => {
  isEditing.value = true
  form.value = {
    _id: item._id,
    type: item.type,
    content: item.content,
    order: item.order || 0,
    isActive: item.isActive,
    startDate: item.startDate ? toLocalDatetime(item.startDate) : '',
    endDate: item.endDate ? toLocalDatetime(item.endDate) : ''
  }
  errors.value = { type: false, content: false }
  showEditDialog.value = true
}

const closeEditDialog = () => { showEditDialog.value = false }
const resetForm = () => { form.value = { type: 'announcement', content: '', startDate: '', endDate: '', order: 0, isActive: true, _id: null }; errors.value = { type: false, content: false } }
const validate = () => { errors.value.type = !form.value.type; errors.value.content = !form.value.content || form.value.content.trim() === ''; return !(errors.value.type || errors.value.content) }

const submit = async () => {
  if (!validate()) return
  try {
    submitting.value = true
    const payload = {
      type: form.value.type,
      content: form.value.content.trim(),
      order: form.value.order || 0,
      isActive: form.value.isActive,
      startDate: form.value.startDate ? new Date(form.value.startDate).toISOString() : '',
      endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : ''
    }
    let resp
    if (isEditing.value && form.value._id) resp = await apiAuth.patch(`/marquees/${form.value._id}`, payload)
    else resp = await apiAuth.post('/marquees', payload)
    createSnackbar({ text: resp.data.message || (isEditing.value ? '更新成功' : '新增成功'), snackbarProps: { color: 'teal-lighten-1' } })
    showEditDialog.value = false
    await loadList()
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '操作失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    submitting.value = false
  }
}

// 切換啟用
const toggleActive = async (item) => {
  try {
    const { data } = await apiAuth.patch(`/marquees/${item._id}/toggle`)
    createSnackbar({ text: data.message, snackbarProps: { color: 'teal-lighten-1' } })
    await loadList()
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '切換失敗', snackbarProps: { color: 'red-lighten-1' } })
  }
}

// 刪除
const confirmDelete = (item) => { selectedId.value = item._id; showDeleteDialog.value = true }
const doDelete = async () => {
  try {
    const { data } = await apiAuth.delete(`/marquees/${selectedId.value}`)
    createSnackbar({ text: data.message, snackbarProps: { color: 'teal-lighten-1' } })
    showDeleteDialog.value = false
    await loadList()
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '刪除失敗', snackbarProps: { color: 'red-lighten-1' } })
  }
}

// 載入所有跑馬燈用於排序
const loadAllMarqueesForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }
    const { data } = await apiAuth.get('/marquees', { params })
    return data.result.data || []
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '載入失敗', snackbarProps: { color: 'red-lighten-1' } })
    return []
  }
}

// 排序
const openSortDialog = async () => {
  const allItems = await loadAllMarqueesForSort()
  sortableItems.value = [...allItems].sort((a, b) => (a.order || 0) - (b.order || 0))
  showSortDialog.value = true
}
const updateOrder = async () => {
  try {
    isUpdatingOrder.value = true
    const marquees = sortableItems.value.map((it, idx) => ({ id: it._id, order: idx + 1 }))
    const { data } = await apiAuth.patch('/marquees/order/update', { marquees })
    createSnackbar({ text: data.message, snackbarProps: { color: 'teal-lighten-1' } })
    showSortDialog.value = false
    await loadList()
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '更新順序失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    isUpdatingOrder.value = false
  }
}

// 重新推播：強制所有已抑制的使用者重新顯示（前置確認）
const doBroadcast = async () => {
  try {
    isBroadcasting.value = true
    const { data } = await apiAuth.post('/marquees/broadcast')
    createSnackbar({ text: data.message || '已重新推播', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (err) {
    createSnackbar({ text: err.response?.data?.message || err.message || '推播失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    isBroadcasting.value = false
  }
}

// 工具
const isExpired = (item) => { if (!item.endDate) return false; const now = new Date(); return new Date(item.endDate) < now }
const getStatusText = (item) => (isExpired(item) ? '已過期' : (item.isActive ? '啟用' : '停用'))
const getStatusColor = (item) => (isExpired(item) ? 'orange-darken-1' : (item.isActive ? 'green-darken-1' : 'grey-darken-1'))
const getTypeText = (type) => ({ system: '系統', update: '更新', announcement: '一般', maintenance: '維護', event: '活動' }[type] || type)
const getTypeColor = (type) => ({ system: 'blue-darken-2', update: 'cyan-darken-3', announcement: 'grey-darken-2', maintenance: 'red-darken-1', event: 'indigo-darken-1' }[type] || 'grey')
const formatDateOnly = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
const formatTimeOnly = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) }
const toLocalDatetime = (iso) => { const d = new Date(iso); const off = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - off).toISOString().slice(0,16) }

// 監聽搜尋
watch(() => searchCriteria.value.quickSearch, () => debouncedQuickSearch())
watch(() => searchCriteria.value.type, () => { currentPage.value = 1; tableLoading.value = true; performSearch().finally(() => { tableLoading.value = false }) })
watch(() => searchCriteria.value.isActive, () => { currentPage.value = 1; tableLoading.value = true; performSearch().finally(() => { tableLoading.value = false }) })

onMounted(() => { loadList() })
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as rwd;
@use '@/styles/settings' as *;

:deep(.v-data-table) {
  thead { height: 48px; background-color: #455a64 !important; color: #fff !important; th { font-size: 13px !important; } }
  tbody tr { min-height: 48px; }
  td { height: 48px !important; div { line-height: 1.6; } }
}

.odd-row { background-color: #f6f8fa; }
.even-row { background-color: #fffaf0; }

.border { border: 1px solid rgba(0, 0, 0, 0.12) !important; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 拖拉排序樣式 */
.sortable-list { min-height: 100px; }
.drag-handle { cursor: move; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; transition: background-color 0.1s ease; }
.drag-handle:hover { background-color: #e0e0e0; }
.ghost-item { opacity: 0.5; background-color: #e3f2fd; border: 2px dashed #2196f3; }
.chosen-item { background-color: #c9c9c9; transform: scale(1.02); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); }
.cursor-move { cursor: move; }
</style>


