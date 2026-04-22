<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <h3>評論排程表</h3>
      </v-col>

      <!-- 搜尋欄位 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="searchKeyword"
              prepend-inner-icon="mdi-magnify"
              label="搜尋姓名"
              placeholder="輸入姓名關鍵字搜尋"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
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
                  :search-keyword="searchKeyword"
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
                  :search-keyword="searchKeyword"
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
                  :search-keyword="searchKeyword"
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
                  :search-keyword="searchKeyword"
                  :readonly="true"
                  @refresh="fetchTableData"
                />
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import ScheduleTable from '@/components/EmployeeCommentScheduleTable.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '評論排程表 | Ystravel',
    login: true
  }
})

// ===== Tab 管理 =====
const activeTab = ref('pending')
const loading = ref(false)
const searchKeyword = ref('')

const pendingTableRef = ref(null)
const submittedTableRef = ref(null)
const completedTableRef = ref(null)
const overdueTableRef = ref(null)

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

// 當搜尋關鍵字改變時，重新載入當前標籤頁的資料
watch(searchKeyword, () => {
  fetchTableData()
})

// 當切換標籤頁時，重新載入資料
watch(activeTab, () => {
  fetchTableData()
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}
</style>
