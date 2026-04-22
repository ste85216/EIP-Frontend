<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <h3>評論名單管理</h3>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="teal-darken-1"
          align-tabs="start"
        >
          <v-tab value="candidates">
            <v-icon start>
              mdi-account-group
            </v-icon>
            候選名單
          </v-tab>
          <v-tab value="exclusions">
            <v-icon start>
              mdi-account-off
            </v-icon>
            排除名單
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 候選名單標籤頁 -->
          <v-window-item value="candidates">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <CandidateList
                  @refresh="fetchData"
                />
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 排除名單標籤頁 -->
          <v-window-item value="exclusions">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <ExclusionList
                  @refresh="fetchData"
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
import { ref } from 'vue'
import { definePage } from 'vue-router/auto'
import CandidateList from '@/components/EmployeeCommentCandidateList.vue'
import ExclusionList from '@/components/EmployeeCommentExclusionList.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '評論名單管理 | Ystravel',
    login: true,
    permission: 'EMPLOYEE_COMMENT_CANDIDATE_MANAGEMENT_READ'
  }
})

// ===== Tab 管理 =====
const activeTab = ref('candidates')

const fetchData = () => {
  // 由子組件處理
}
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}
</style>
