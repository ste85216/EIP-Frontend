<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>國定假日管理</h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-btn
                  color="teal-darken-1"
                  prepend-icon="mdi-cloud-download"
                  variant="outlined"
                  :loading="loadFromApiLoading"
                  @click="openLoadYearDialog"
                >
                  取得國定假日
                </v-btn>
                <v-btn
                  color="red-lighten-1"
                  prepend-icon="mdi-delete-sweep"
                  variant="outlined"
                  :loading="deleteAllLoading"
                  class="ms-2"
                  @click="openDeleteAllDialog"
                >
                  刪除所有假日
                </v-btn>
                <v-spacer />
                <v-col
                  cols="4"
                  sm="3"
                  md="2"
                  lg="2"
                  class="px-1 my-1"
                >
                  <v-select
                    v-model="selectedYearFilter"
                    :items="availableYears"
                    item-title="label"
                    item-value="value"
                    label="年份篩選"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col
                  cols="7"
                  sm="6"
                  md="4"
                  lg="2"
                  class="px-1 my-1"
                >
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="quickSearch"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋假日名稱"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      clearable
                    />
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 表格區塊 -->
          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table
              :headers="headers"
              :items="filteredItems"
              :loading="loading"
              :items-per-page-options="[10, 20, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ formatDate(item.date) }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.year }} 年</td>
                  <td>
                    <v-chip
                      size="small"
                      :color="getTypeColor(item.type)"
                      variant="tonal"
                      label
                      class="font-weight-medium"
                    >
                      {{ getTypeText(item.type) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn
                      icon
                      variant="plain"
                      color="red-lighten-1"
                      size="small"
                      @click="handleDelete(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ConfirmDeleteDialog
      v-model="deleteDialog"
      max-width="320"
      title="確認刪除"
      :message="`確定要刪除「${deleteTargetName}」嗎？`"
      confirm-button-text="刪除"
      @confirm="confirmDelete"
    />

    <ConfirmDeleteDialog
      v-model="deleteAllDialog"
      max-width="320"
      title="確認刪除所有假日"
      message="確定要刪除<strong>所有</strong>儲存的假日資料嗎？此操作無法復原。"
      confirm-button-text="刪除"
      confirm-button-color="red-lighten-1"
      @confirm="confirmDeleteAll"
    />

    <!-- 輸入年份對話框 -->
    <v-dialog
      v-model="loadYearDialog"
      max-width="320"
      persistent
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            icon="mdi-calendar-edit"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">輸入年份</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="loadYearDialog = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-progress-linear
          v-if="loadFromApiLoading"
          color="teal-darken-1"
          indeterminate
        />
        <v-card-text class="px-6 py-4 mt-4">
          <v-text-field
            v-model.number="inputYear"
            label="年份 *"
            type="number"
            variant="outlined"
            density="compact"
            :min="2000"
            :max="2100"
            :rules="yearRules"
            hint="請輸入 2000-2100 之間的年份"
            persistent-hint
            autofocus
            clearable
            @keyup.enter="confirmLoadYear"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="loadYearDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :disabled="!inputYear || inputYear < 2000 || inputYear > 2100"
            :loading="loadFromApiLoading"
            @click="confirmLoadYear"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

definePage({
  meta: {
    title: '國定假日管理 | Ystravel',
    login: true,
    permission: 'TAIWAN_HOLIDAY_MANAGEMENT_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const loading = ref(false)
const loadFromApiLoading = ref(false)
const deleteAllLoading = ref(false)
const items = ref([])
const quickSearch = ref('')
const selectedYearFilter = ref(null)
const deleteDialog = ref(false)
const deleteAllDialog = ref(false)
const deleteTargetId = ref(null)
const deleteTargetName = ref('')
const loadYearDialog = ref(false)
const inputYear = ref(null)

const yearRules = [
  (v) => {
    if (!v && v !== 0) return '請輸入年份'
    if (v < 2000 || v > 2100) return '年份必須在 2000-2100 之間'
    return true
  }
]

const headers = [
  { title: '日期', key: 'date', sortable: true },
  { title: '名稱', key: 'name', sortable: true },
  { title: '年份', key: 'year', sortable: true },
  { title: '類型', key: 'type', sortable: false },
  { title: '操作', key: 'actions', sortable: false, align: 'center', width: '80' }
]

// 取得目前資料中所有不重複的年份（降序排列，最新的在前）
const availableYears = computed(() => {
  const years = new Set()
  items.value.forEach(item => {
    if (item.year) {
      years.add(item.year)
    }
  })
  return Array.from(years)
    .sort((a, b) => b - a) // 降序：最新年份在前
    .map(year => ({
      label: `${year} 年`,
      value: year
    }))
})

// 搜尋過濾（同時考慮年份篩選和名稱搜尋）
const filteredItems = computed(() => {
  let result = items.value

  // 年份篩選
  if (selectedYearFilter.value) {
    result = result.filter(item => item.year === selectedYearFilter.value)
  }

  // 名稱搜尋
  if (quickSearch.value && quickSearch.value.trim() !== '') {
    const keyword = quickSearch.value.trim().toLowerCase()
    result = result.filter(item => {
      return item.name && item.name.toLowerCase().includes(keyword)
    })
  }

  return result
})

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  // 明確使用西元年格式，避免顯示民國年
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const getTypeColor = (type) => {
  const colorMap = {
    national: 'orange-darken-2',
    weekend: 'blue-grey-darken-1'
  }
  return colorMap[type] || 'grey'
}

const getTypeText = (type) => {
  const textMap = {
    national: '國定假日',
    weekend: '週末'
  }
  return textMap[type] || '其他'
}

const fetchList = async () => {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/taiwan-holidays')
    if (data.success) {
      items.value = data.result || []
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

const openLoadYearDialog = () => {
  inputYear.value = new Date().getFullYear()
  loadYearDialog.value = true
}

const confirmLoadYear = async () => {
  if (!inputYear.value || inputYear.value < 2000 || inputYear.value > 2100) return

  loadFromApiLoading.value = true
  loadYearDialog.value = false

  try {
    const { data } = await apiAuth.post('/taiwan-holidays/load-from-api', {
      year: inputYear.value
    })
    if (data.success) {
      createSnackbar({
        text: data.message || `已載入 ${inputYear.value} 年國定假日`,
        snackbarProps: { color: 'teal-darken-1' }
      })
      // 刷新列表（顯示所有年份）
      await fetchList()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadFromApiLoading.value = false
  }
}

const handleDelete = (item) => {
  deleteTargetId.value = item._id
  deleteTargetName.value = `${formatDate(item.date)} ${item.name}`
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteTargetId.value) return
  try {
    const { data } = await apiAuth.delete(`/taiwan-holidays/${deleteTargetId.value}`)
    if (data.success) {
      createSnackbar({
        text: '已刪除',
        snackbarProps: { color: 'teal-darken-1' }
      })
      deleteTargetId.value = null
      deleteTargetName.value = ''
      await fetchList()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const openDeleteAllDialog = () => {
  deleteAllDialog.value = true
}

const confirmDeleteAll = async () => {
  deleteAllLoading.value = true
  try {
    const { data } = await apiAuth.delete('/taiwan-holidays/all')
    if (data.success) {
      createSnackbar({
        text: data.message || '已刪除所有假日',
        snackbarProps: { color: 'teal-darken-1' }
      })
      deleteAllDialog.value = false
      await fetchList()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteAllLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

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

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

:deep(.v-field :not(.v-textarea .v-field)) {
  .v-field__input {
    font-size: 13px;
    height: 36px !important;
    padding-top: 4px !important;
  }

  .v-field__field {
    height: 36px !important;
  }
  @include sm {
    .v-field__input {
      height: 40px !important;
      padding-top: 8px !important;
      font-size: 14px;
    }
    .v-field__field {
      height: 40px !important;
    }
  }
}
</style>
