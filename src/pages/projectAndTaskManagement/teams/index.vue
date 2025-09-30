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
              我的團隊
            </span>
            <v-btn
              v-if="canCreateTeam"
              v-tooltip:end="'新增團隊'"
              icon
              :size="smAndUp ? '32' : '24'"
              color="grey-darken-3"
              class="ms-2"
              variant="plain"
              @click="openCreateTeamDialog"
            >
              <v-icon :size="smAndUp ? '24' : '16'">
                mdi-plus
              </v-icon>
            </v-btn>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              placeholder="搜尋團隊名稱..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              class="search-field"
            />
          </div>
        </div>
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
              :items="filteredTeams"
              :loading="loading"
              hover
              density="compact"
              item-key="_id"
              :items-per-page="25"
              :items-per-page-options="[10, 25, 50, 100, -1]"
            >
              <template #item="{ item }">
                <tr>
                  <!-- 團隊名稱 -->
                  <td>
                    <div class="d-flex align-center">
                      <router-link
                        :to="`/projectAndTaskManagement/teams/${item._id}`"
                        class="text-decoration-none text-blue-darken-2 font-weight-medium team-name-link"
                      >
                        {{ item.name }}
                      </router-link>
                    </div>
                  </td>

                  <!-- 成員 -->
                  <td>
                    <div class="d-flex align-center">
                      <v-tooltip
                        v-for="(member, memberIndex) in item.members.slice(0, 3)"
                        :key="member._id"
                        :text="member.name"
                        location="top"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <UserAvatar
                            v-bind="tooltipProps"
                            :user="member"
                            size="24"
                            avatar-class="me-n2"
                            :style="{ zIndex: 3 - memberIndex }"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip
                        v-if="item.members.length > 3"
                        :text="getExtraMembersText(item.members.slice(3))"
                        location="top"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <span
                            v-bind="tooltipProps"
                            class="text-caption text-grey ms-2"
                          >
                            +{{ item.members.length - 3 }}
                          </span>
                        </template>
                      </v-tooltip>
                      <span class="text-caption text-grey ms-2">
                        ({{ item.members.length }} 人)
                      </span>
                    </div>
                  </td>

                  <!-- 管理者 -->
                  <td>
                    <div class="d-flex align-center">
                      <v-chip
                        v-for="manager in item.managers.slice(0, 2)"
                        :key="manager._id"
                        size="small"
                        color="teal-darken-1"
                        class="me-1"
                      >
                        {{ manager.name }}
                      </v-chip>
                      <span
                        v-if="item.managers.length > 2"
                        class="text-caption text-grey"
                      >
                        +{{ item.managers.length - 2 }}
                      </span>
                    </div>
                  </td>

                  <!-- 專案數量 -->
                  <td>
                    <v-chip
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.projects?.length || 0 }} 個專案
                    </v-chip>
                  </td>

                  <!-- 描述 -->
                  <td style="max-width: 200px;">
                    <span
                      v-if="item.description"
                      class="text-truncate"
                      style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;"
                      :title="item.description"
                    >
                      {{ item.description }}
                    </span>
                    <span
                      v-else
                      class="text-grey"
                    >無描述</span>
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

    <!-- 新增團隊對話框 -->
    <CreateTeamDialog
      v-model="createTeamDialog"
      @team-created="handleTeamCreated"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useTeamStore } from '@/stores/team'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import CreateTeamDialog from '@/components/CreateTeamDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/user'

// 頁面定義
definePage({
  meta: {
    title: '我的團隊 | 專案與任務管理',
    login: true
  }
})

const { apiAuth } = useApi()
const { createSnackbar } = useSnackbar()
const teamStore = useTeamStore()
const userStore = useUserStore()

// 響應式數據
const loading = ref(false)
const createTeamDialog = ref(false)
const searchQuery = ref('')

const { smAndUp } = useDisplay()

// 只有 Admin 或 Manager 可以新增團隊
const canCreateTeam = computed(() => userStore.isAdmin || userStore.isManager)

// 使用 store 中的團隊數據
const teams = computed(() => teamStore.teams)

// 根據搜尋條件過濾團隊
const filteredTeams = computed(() => {
  if (!searchQuery.value.trim()) {
    return teams.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return teams.value.filter(team =>
    team.name.toLowerCase().includes(query)
  )
})

// 表格標題
const headers = [
  { title: '團隊名稱', key: 'name', sortable: true },
  { title: '成員', key: 'members', sortable: false },
  { title: '管理者', key: 'managers', sortable: false },
  { title: '專案數量', key: 'projects', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '建立日期', key: 'createdAt', sortable: true },
]

// 載入團隊列表
const fetchTeams = async () => {
  try {
    loading.value = true
    const { data } = await apiAuth.get('/teams/my-teams')
    if (data.success) {
      teamStore.setTeams(data.data)
    }
  } catch (error) {
    console.error('載入團隊列表失敗:', error)
    createSnackbar({
      text: '載入團隊列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 開啟新增團隊對話框
const openCreateTeamDialog = () => {
  createTeamDialog.value = true
}

// 處理團隊建立完成
const handleTeamCreated = (team) => {
  console.log('團隊建立成功:', team)
  // 將新團隊添加到 store
  teamStore.addTeam(team)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

// 取得額外成員的文本（用於 +N 的 tooltip）
const getExtraMembersText = (extraMembers) => {
  if (!extraMembers || extraMembers.length === 0) {
    return ''
  }
  return extraMembers.map(member => member.name).join('、')
}

// 組件掛載時載入數據
onMounted(() => {
  fetchTeams()
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

.v-avatar {
  border: 2px solid white;
}

.search-field {
  min-width: 240px;
}

.team-name-link {
  transition: text-decoration 0.2s ease;
}

.team-name-link:hover {
  text-decoration: underline !important;
}
</style>
<route lang="yaml">
  meta:
    layout: ProjectAndTask
</route>
