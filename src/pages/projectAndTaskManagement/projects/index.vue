<template>
  <v-container
    max-width="1280"
    class="pt-0 pt-sm-4"
  >
    <v-row class="mt-2 mx-0 py-2 px-0 px-sm-2 rounded-lg bg-white">
      <v-col
        cols="12"
        class="pa-0"
      >
        <!-- 標題和新增按鈕 -->
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <span class="page-title">
              我的專案
            </span>
            <v-btn
              v-if="canCreateProject"
              v-tooltip:end="'新增專案'"
              icon
              :size="smAndUp ? '32' : '24'"
              color="grey-darken-3"
              class="ms-2"
              variant="plain"
              @click="openCreateProjectDialog"
            >
              <v-icon :size="smAndUp ? '24' : '16'">
                mdi-plus
              </v-icon>
            </v-btn>
          </div>
          <div class="d-flex align-center">
            <v-btn
              icon
              :size="smAndUp ? '32' : '24'"
              color="grey-darken-3"
              class="me-3"
              variant="plain"
              @click="openHistoryProjectsDialog"
            >
              <v-icon :size="smAndUp ? '24' : '16'">
                mdi-history
              </v-icon>
            </v-btn>
            <v-text-field
              v-model="searchQuery"
              placeholder="搜尋專案名稱..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="search-field"
            />
          </div>
        </div>

        <!-- 搜尋欄位 -->
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
      >
        <v-card elevation="0">
          <v-card-text class="px-2 pt-2">
            <v-data-table
              :headers="headers"
              :items="filteredProjects"
              :loading="loading"
              hover
              density="compact"
              item-key="_id"
              :items-per-page="25"
              :items-per-page-options="[10, 25, 50, 100, -1]"
            >
              <template #item="{ item }">
                <tr>
                  <!-- 專案名稱 -->
                  <td>
                    <div class="d-flex align-center">
                      <v-icon
                        :icon="item.iconColor && item.iconColor !== 'white' ? 'mdi-square-rounded' : 'mdi-square-rounded-outline'"
                        class="me-2"
                        :color="item.iconColor && item.iconColor !== 'white' ? item.iconColor : 'grey-darken-1'"
                      />
                      <router-link
                        :to="`/projectAndTaskManagement/projects/${item._id}`"
                        class="text-decoration-none text-blue-darken-2 font-weight-medium project-name-link"
                      >
                        {{ item.name }}
                      </router-link>
                    </div>
                  </td>

                  <!-- 所屬團隊 -->
                  <td>
                    <div class="d-flex align-center">
                      <v-chip
                        size="small"
                        color="blue-darken-2"
                      >
                        {{ item.team?.name || '未分配團隊' }}
                      </v-chip>
                    </div>
                  </td>

                  <!-- 狀態 -->
                  <td>
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </td>

                  <!-- 收藏狀態 -->
                  <td>
                    <v-btn
                      :icon="isProjectFavorited(item) ? 'mdi-star' : 'mdi-star-outline'"
                      size="small"
                      variant="text"
                      :color="isProjectFavorited(item) ? 'amber' : 'grey'"
                      @click="toggleFavorite(item)"
                    />
                  </td>

                  <!-- 建立日期 -->
                  <td>
                    {{ formatDate(item.createdAt) }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增專案對話框 -->
    <CreateProjectDialog
      v-model="createProjectDialog"
      @project-created="handleProjectCreated"
    />

    <!-- 歷史專案對話框 -->
    <HistoryProjectsDialog
      v-model="historyProjectsDialog"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { definePage } from 'vue-router/auto'
import CreateProjectDialog from '@/components/CreateProjectDialog.vue'
import HistoryProjectsDialog from '@/components/HistoryProjectsDialog.vue'
import { useTeamStore } from '@/stores/team'

// 頁面定義
definePage({
  meta: {
    title: '我的專案 | 專案與任務管理',
    login: true
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()

// 響應式數據
const projects = ref([])
const loading = ref(false)
const createProjectDialog = ref(false)
const historyProjectsDialog = ref(false)
const searchQuery = ref('')

const { smAndUp } = useDisplay()

// 只有使用者為任一團隊管理者時可新增專案
const canCreateProject = computed(() => {
  const teams = teamStore.teams || []
  return teams.some(t => t?.managers?.some(m => m._id === userStore._id))
})

// 合併本地專案列表和 store 中的專案資料，確保即時更新
const mergedProjects = computed(() => {
  return projects.value.map(project => {
    // 從 store 中查找最新的專案資料
    const storeProject = projectStore.projects.find(p => p._id === project._id)

    if (storeProject) {
      // 合併資料，優先使用 store 中的最新資料
      return {
        ...project,
        ...storeProject,
        // 確保 iconColor 被正確處理
        iconColor: storeProject.iconColor !== undefined ? storeProject.iconColor : project.iconColor,
        // 確保 favorites 結構正確
        favorites: storeProject.favorites || project.favorites
      }
    }

    return project
  })
})

// 根據搜尋條件過濾專案（排除已完成的專案）
const filteredProjects = computed(() => {
  // 先過濾掉已完成的專案
  const activeProjects = mergedProjects.value.filter(project => project.status !== 'completed')

  if (!searchQuery.value.trim()) {
    return activeProjects
  }

  const query = searchQuery.value.toLowerCase().trim()
  return activeProjects.filter(project =>
    project.name.toLowerCase().includes(query)
  )
})

// 表格標題
const headers = [
  { title: '專案名稱', key: 'name', sortable: true },
  { title: '所屬團隊', key: 'team', sortable: true },
  { title: '狀態', key: 'status', sortable: true },
  { title: '收藏', key: 'favorite', sortable: false },
  { title: '建立日期', key: 'createdAt', sortable: true }
]

// 載入專案列表
const fetchProjects = async () => {
  try {
    loading.value = true
    const { data } = await apiAuth.get('/projects/my-projects')
    if (data.success) {
      projects.value = data.data
    }
  } catch (error) {
    console.error('載入專案列表失敗:', error)
    createSnackbar({
      text: '載入專案列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 開啟新增專案對話框
const openCreateProjectDialog = () => {
  createProjectDialog.value = true
}

// 開啟歷史專案對話框
const openHistoryProjectsDialog = () => {
  historyProjectsDialog.value = true
}

// 處理專案建立完成
const handleProjectCreated = (project) => {
  console.log('專案建立成功:', project)
  // 重新載入專案列表
  fetchProjects()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

// 取得狀態顏色
const getStatusColor = (status) => {
  const statusColors = {
    'on-track': 'green',
    'at-risk': 'orange',
    'off-track': 'red',
    'on-hold': 'grey-darken-2',
    'completed': 'blue'
  }
  return statusColors[status] || 'grey-darken-1'
}

// 取得狀態文字
const getStatusText = (status) => {
  const statusTexts = {
    'on-track': '進度正常',
    'at-risk': '存在風險',
    'off-track': '偏離進度',
    'on-hold': '擱置中',
    'completed': '完成'
  }
  return statusTexts[status] || '尚未設定'
}

// 檢查專案是否被收藏
const isProjectFavorited = (project) => {
  if (!project.favorites || !userStore._id) return false
  return project.favorites.some(fav => {
    const userId = typeof fav.user === 'string' ? fav.user : fav.user._id
    return userId === userStore._id
  })
}

// 切換收藏狀態
const toggleFavorite = async (project) => {
  try {
    const { data } = await apiAuth.post(`/projects/${project._id}/favorite`)
    if (data.success) {
      // 更新本地專案資料
      const projectIndex = projects.value.findIndex(p => p._id === project._id)
      if (projectIndex !== -1) {
        projects.value[projectIndex] = data.data
      }

      // 同步更新到 project store，讓側邊欄即時更新
      projectStore.updateProject(project._id, data.data)

      createSnackbar({
        text: data.message,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('切換收藏狀態失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '切換收藏狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 監聽 project store 的變化，確保即時更新
watch(() => projectStore.projects, () => {
  // 當 store 中的專案資料更新時，觸發響應式更新
  // mergedProjects 計算屬性會自動重新計算
}, { deep: true })

// 組件掛載時載入數據
onMounted(() => {
  fetchProjects()
})
</script>

<style lang="scss" scoped>

.v-data-table {
  :deep(thead) {
    height: 48px !important;
  }
  :deep(th:first-child) {
    border-radius: 12px 0 0px 0px;
  }
  :deep(th:last-child) {
    border-radius: 0px 12px 0px 0px;
  }
  :deep(th) {
    background-color: #455A64;
    color: white;
  }
  :deep(tbody tr) {
    height: 48px;
  }
  :deep(tbody tr:nth-child(even)) {
    background-color: #f6f6f6;
  }
  :deep(tbody tr td:first-child) {
    border-left: 1px solid #ddd;
  }
  :deep(tbody tr td:last-child) {
    border-right: 1px solid #ddd;
  }
  :deep(.v-data-table-footer) {
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-radius: 0px 0px 12px 12px;
    margin-top: 0px;
    padding: 16px 12px;
  }
}


.v-card {
  border-radius: 12px;
}

.search-field {
  min-width: 240px;
}

.project-name-link {
  transition: text-decoration 0.2s ease;
}

.project-name-link:hover {
  text-decoration: underline !important;
}

</style>
<route lang="yaml">
  meta:
    layout: ProjectAndTask
</route>
