<template>
  <v-container max-width="1920">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <!-- 標題區塊 -->
          <div class="d-flex align-center px-4 px-sm-6">
            <h3>
              評論排程表
            </h3>
            <v-spacer />
          </div>

          <!-- 標題與搜尋區塊分隔線 -->
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋欄位 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 公司 -->
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
                    :items="companies"
                    :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="請選擇公司"
                    @update:model-value="handleCompanyChange"
                  />
                </div>
              </v-col>

              <!-- 部門 -->
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
                    :items="departments"
                    :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="請選擇部門"
                    :disabled="!searchCriteria.company"
                  />
                </div>
              </v-col>

              <!-- 快速搜尋 -->
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
                    v-model="searchCriteria.searchKeyword"
                    variant="outlined"
                    density="compact"
                    placeholder="搜尋姓名"
                    append-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                  />
                </div>
              </v-col>

              <!-- 重置按鈕 -->
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

          <!-- 搜尋區塊與內容分隔線 -->
          <v-divider class="mt-1 mb-2" />

          <!-- 標籤頁 -->
          <v-card-text class="px-4 px-sm-6 pt-2 pb-4">
            <v-tabs
              v-model="activeTab"
              color="teal-darken-1"
              align-tabs="start"
            >
              <v-tab value="pending">
                <v-icon start>
                  mdi-clock-outline
                </v-icon>
                待排程
              </v-tab>
              <v-tab value="submitted">
                <v-icon start>
                  mdi-file-clock-outline
                </v-icon>
                待審核
              </v-tab>
              <v-tab value="completed">
                <v-icon start>
                  mdi-check-circle-outline
                </v-icon>
                已完成
              </v-tab>
              <v-tab value="overdue">
                <v-icon start>
                  mdi-alert-circle-outline
                </v-icon>
                已過期
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- 待排程標籤頁 -->
              <v-window-item value="pending">
                <v-card flat>
                  <v-card-text class="px-0 pt-6">
                    <!-- 待排程表格（含懲罰排程 penalty） -->
                    <ScheduleTable
                      ref="pendingTableRef"
                      :status="['pending', 'today', 'penalty']"
                      :loading="loading"
                      :search-keyword="searchCriteria.searchKeyword"
                      :company-id="searchCriteria.company"
                      :department-id="searchCriteria.department"
                      :readonly="true"
                      @refresh="fetchTableData"
                    />
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- 待審核標籤頁 -->
              <v-window-item value="submitted">
                <v-card flat>
                  <v-card-text class="px-0 pt-6">
                    <!-- 待審核表格 -->
                    <ScheduleTable
                      ref="submittedTableRef"
                      status="submitted"
                      :loading="loading"
                      :search-keyword="searchCriteria.searchKeyword"
                      :company-id="searchCriteria.company"
                      :department-id="searchCriteria.department"
                      :readonly="true"
                      @refresh="fetchTableData"
                    />
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- 已完成標籤頁 -->
              <v-window-item value="completed">
                <v-card flat>
                  <v-card-text class="px-0 pt-6">
                    <!-- 已完成表格 -->
                    <ScheduleTable
                      ref="completedTableRef"
                      status="completed"
                      :loading="loading"
                      :search-keyword="searchCriteria.searchKeyword"
                      :company-id="searchCriteria.company"
                      :department-id="searchCriteria.department"
                      :readonly="true"
                      @refresh="fetchTableData"
                    />
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- 已過期標籤頁 -->
              <v-window-item value="overdue">
                <v-card flat>
                  <v-card-text class="px-0 pt-6">
                    <!-- 已過期表格 -->
                    <ScheduleTable
                      ref="overdueTableRef"
                      status="overdue"
                      :loading="loading"
                      :search-keyword="searchCriteria.searchKeyword"
                      :company-id="searchCriteria.company"
                      :department-id="searchCriteria.department"
                      :readonly="true"
                      @refresh="fetchTableData"
                    />
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ScheduleTable from '@/components/EmployeeCommentScheduleTable.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '評論排程表 | Ystravel',
    login: true
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

// ===== Tab 管理 =====
const activeTab = ref('pending')
const loading = ref(false)
const companies = ref([])
const departments = ref([])
const searchCriteria = ref({
  company: null,
  department: null,
  searchKeyword: ''
})

const pendingTableRef = ref(null)
const submittedTableRef = ref(null)
const completedTableRef = ref(null)
const overdueTableRef = ref(null)

const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = data.result.data
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const handleCompanyChange = async () => {
  searchCriteria.value.department = null
  if (!searchCriteria.value.company) {
    departments.value = []
    return
  }
  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: searchCriteria.value.company }
    })
    if (data.success) {
      departments.value = data.result
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    departments.value = []
  }
}

const resetSearch = () => {
  searchCriteria.value.company = null
  searchCriteria.value.department = null
  searchCriteria.value.searchKeyword = ''
  departments.value = []
}

const fetchTableData = () => {
  // 觸發當前標籤頁的表格刷新
  if (activeTab.value === 'pending' && pendingTableRef.value) {
    pendingTableRef.value.fetchTableData()
  } else if (activeTab.value === 'submitted' && submittedTableRef.value) {
    submittedTableRef.value.fetchTableData()
  } else if (activeTab.value === 'completed' && completedTableRef.value) {
    completedTableRef.value.fetchTableData()
  } else if (activeTab.value === 'overdue' && overdueTableRef.value) {
    overdueTableRef.value.fetchTableData()
  }
}

// 當搜尋條件改變時，重新載入當前標籤頁的資料（nextTick 確保子組件已收到新 props）
watch(() => [searchCriteria.value.company, searchCriteria.value.department, searchCriteria.value.searchKeyword], async () => {
  await nextTick()
  fetchTableData()
}, { deep: true })

// 當切換標籤頁時，重新載入資料
watch(activeTab, () => {
  fetchTableData()
})

onMounted(() => {
  loadCompanies()
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}


</style>
