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
        <!-- 載入中 -->
        <div
          v-if="loading"
          class="d-flex justify-center pt-16 mt-16"
        >
          <v-progress-circular
            indeterminate
            color="grey"
            width="8"
            size="88"
          />
        </div>

        <!-- 團隊內容 -->
        <div v-else-if="team">
          <!-- 團隊標題 -->
          <div
            class="d-flex align-top mb-6"
            style="width: 100%; overflow: hidden;"
          >
            <div style="flex: 1; min-width: 0;">
              <div>
                <div class="page-title d-flex align-center">
                  {{ team?.name }}
                  <!-- 管理按鈕（只有團隊管理者可見） -->
                  <v-menu
                    v-if="isTeamManager"
                    location="bottom start"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :size="smAndUp ? '24' : '18'"
                        class="ms-2"
                        variant="plain"
                        :ripple="false"
                        color="grey-darken-1"
                      >
                        <v-icon :size="smAndUp ? '24' : '18'">
                          mdi-chevron-down
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list
                      density="compact"
                      slim
                    >
                      <v-list-item
                        title="修改團隊資訊"
                        @click="openEditTeamInfoDialog"
                      >
                        <template #prepend>
                          <v-icon :size="iconSize">
                            mdi-pencil
                          </v-icon>
                        </template>
                      </v-list-item>
                      <v-list-item
                        base-color="red-darken-3"
                        title="刪除團隊"
                        @click="confirmDeleteTeam"
                      >
                        <template #prepend>
                          <v-icon :size="iconSize">
                            mdi-delete
                          </v-icon>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <div
                  class="sub-description pt-3"
                  style="word-wrap: break-word; white-space: pre-wrap; overflow-wrap: break-word; max-width: 100%;"
                >
                  {{ team?.description || '無描述' }}
                </div>
              </div>
            </div>
          </div>
          <v-row>
            <!-- 團隊專案 -->
            <v-col
              cols="12"
              md="6"
              lg="7"
              class="pt-1 pt-md-3"
            >
              <v-card
                class="border py-2 px-2 rounded-lg block-card"
                variant="outlined"
              >
                <v-card-title
                  class="d-flex align-center px-2 px-sm-4 justify-space-between"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      class="me-3"
                      color="grey-darken-3"
                    >
                      mdi-folder-multiple-outline
                    </v-icon>
                    <span class="block-title">
                      團隊專案
                    </span>
                  </div>
                  <div class="d-flex align-center">
                    <v-btn
                      icon="mdi-history"
                      :size="iconButtonSize"
                      variant="text"
                      color="grey-darken-1"
                      class="me-1"
                      @click="openHistoryProjectsDialog"
                    />
                    <v-btn
                      v-if="isTeamManager"
                      icon="mdi-plus"
                      :size="iconButtonSize"
                      variant="text"
                      color="grey-darken-1"
                      @click="openCreateProjectDialog"
                    />
                  </div>
                </v-card-title>
                <v-card-text class="px-2 px-sm-4 pb-0 pb-sm-2">
                  <div v-if="updatedProjects && updatedProjects.length > 0">
                    <v-list>
                      <v-list-item
                        v-for="project in paginatedProjects"
                        :key="project._id"
                        class=" px-2 py-2 mb-2 border rounded-lg bg-grey-lighten-5"
                        :to="`/projectAndTaskManagement/projects/${project._id}`"
                        clickable
                      >
                        <template #prepend>
                          <v-icon
                            :color="project.iconColor && project.iconColor !== 'white' ? project.iconColor : 'grey-lighten-1'"
                            size="32"
                            class="ps-3"
                          >
                            {{ project.iconColor && project.iconColor !== 'white' ? 'mdi-square-rounded' : 'mdi-square-rounded-outline' }}
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ project.name }}</v-list-item-title>
                        <template #append>
                          <v-icon>mdi-chevron-right</v-icon>
                        </template>
                      </v-list-item>
                    </v-list>

                    <!-- 專案分頁組件 -->
                    <div
                      v-if="totalProjectsPages > 1"
                      class="d-flex justify-center mt-2"
                    >
                      <v-pagination
                        v-model="projectsPage"
                        :length="totalProjectsPages"
                        :total-visible="smAndUp ? 7 : 5"
                        size="x-small"
                        color="teal-darken-1"
                        variant="outlined"
                      />
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-center py-4"
                  >
                    <v-icon
                      size="48"
                      color="grey-lighten-1"
                    >
                      mdi-folder-outline
                    </v-icon>
                    <p class="text-body-2 text-medium-emphasis mt-2">
                      尚無專案
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- 團隊成員 -->
            <v-col
              cols="12"
              md="6"
              lg="5"
            >
              <v-card
                class="mb-6 border py-2 px-2 rounded-lg block-card members-card"
                variant="outlined"
              >
                <v-card-title
                  class="d-flex align-center px-2 px-sm-4 justify-space-between"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      class="me-2"
                      color="grey-darken-3"
                    >
                      mdi-account-multiple
                    </v-icon>
                    <span class="block-title">
                      團隊成員
                    </span>
                  </div>
                  <v-btn
                    v-if="isTeamManager"
                    icon="mdi-plus"
                    :size="iconButtonSize"
                    variant="text"
                    color="grey-darken-1"
                    @click="openAddMemberDialog"
                  />
                </v-card-title>
                <v-card-text class="px-2 px-sm-4 pb-0 pb-sm-2">
                  <v-list>
                    <v-list-item
                      v-for="member in paginatedMembers"
                      :key="member._id"
                      class=" px-3 py-2 mb-2 border rounded-lg list-item"
                    >
                      <template #prepend>
                        <UserAvatar
                          :user="member"
                          :size="avatarSize"
                        />
                      </template>
                      <v-list-item-title>
                        <div class="d-flex align-center mb-1">
                          <span class="list-item-name">{{ member.name }}</span>
                          <v-chip
                            v-if="checkIsTeamManager(member._id)"
                            size="x-small"
                            color="teal-darken-1"
                            variant="outlined"
                            class="ms-2"
                          >
                            團隊管理者
                          </v-chip>
                        </div>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="list-item-email">{{ member.email }}</span>
                      </v-list-item-subtitle>
                      <template #append>
                        <v-menu
                          v-if="canManageMember(member._id)"
                          location="bottom end"
                        >
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon
                              variant="text"
                              :size="iconButtonSize"
                              color="grey-darken-1"
                            >
                              <v-icon :size="iconSize">
                                mdi-dots-vertical
                              </v-icon>
                            </v-btn>
                          </template>
                          <v-list
                            slim
                            density="compact"
                          >
                            <v-list-item
                              v-if="!checkIsTeamManager(member._id)"
                              title="指派為管理者"
                              @click="assignManager(member)"
                            >
                              <template #prepend>
                                <v-icon :size="iconSize">
                                  mdi-account-cog
                                </v-icon>
                              </template>
                            </v-list-item>
                            <v-list-item
                              v-if="checkIsTeamManager(member._id)"
                              title="移除管理者"
                              base-color="red-darken-3"
                              @click="removeManager(member)"
                            >
                              <template #prepend>
                                <v-icon :size="iconSize">
                                  mdi-account-minus
                                </v-icon>
                              </template>
                            </v-list-item>
                            <v-list-item
                              title="移除成員"
                              base-color="red-darken-3"
                              @click="removeMember(member)"
                            >
                              <template #prepend>
                                <v-icon :size="iconSize">
                                  mdi-account-minus
                                </v-icon>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </template>
                    </v-list-item>
                  </v-list>

                  <!-- 分頁組件 -->
                  <div
                    v-if="totalMembersPages > 1"
                    class="d-flex justify-center mt-4"
                  >
                    <v-pagination
                      v-model="membersPage"
                      :length="totalMembersPages"
                      :total-visible="smAndUp ? 7 : 5"
                      size="x-small"
                      color="teal-darken-1"
                      variant="outlined"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- 錯誤狀態 -->
        <div
          v-else
          class="text-center py-8"
        >
          <v-icon
            size="64"
            color="error"
          >
            mdi-alert-circle
          </v-icon>
          <h2 class="text-h5 mt-4">
            找不到團隊
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            請檢查網址是否正確
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            class="mt-4"
            to="/projectAndTaskManagement"
          >
            返回首頁
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteDialog"
      title="確認刪除團隊"
      :message="`您確定要刪除團隊「<span class='font-weight-bold text-red-darken-2'>${team?.name}</span>」嗎 ? ※ 注意：此操作將會同時刪除該團隊下的所有專案（共 ${team?.projects?.length || 0} 個專案）以及專案內的所有任務。\n\n此操作無法復原，請謹慎操作。`"
      :expected-name="team?.name"
      input-label="團隊名稱"
      confirm-button-text="刪除"
      @confirm="deleteTeam"
    />

    <!-- 新增成員對話框 -->
    <v-dialog
      v-model="addMemberDialog"
      persistent
      max-width="480"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-multiple-plus
          </v-icon>
          新增團隊成員
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="addMemberDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-3 px-6">
          <v-combobox
            v-model="selectedMembers"
            :items="availableUsers"
            item-title="name"
            item-value="_id"
            label="選擇成員"
            multiple
            chips
            closable-chips
            hide-details
            variant="outlined"
            density="compact"
            :loading="loadingUsers"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #prepend>
                  <UserAvatar
                    :user="item.raw"
                    size="32"
                  />
                </template>
                <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <v-chip
                :key="item.value"
                closable
                @click:close="removeSelectedMember(item.value)"
              >
                <UserAvatar
                  :user="item.raw"
                  size="24"
                  avatar-class="start"
                />
                {{ item.raw.name }}
              </v-chip>
            </template>
          </v-combobox>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="addMemberDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-1"
            :size="buttonSize"
            :loading="addingMembers"
            :disabled="!selectedMembers || selectedMembers.length === 0"
            @click="addMembers"
          >
            新增
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 修改團隊資訊對話框 -->
    <v-dialog
      v-model="editTeamInfoDialog"
      persistent
      max-width="480"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-pencil
          </v-icon>
          修改團隊資訊
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="editTeamInfoDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 px-6">
          <v-text-field
            v-model="newTeamName"
            label="團隊名稱"
            variant="outlined"
            density="compact"
            hide-details
            counter="50"
            :rules="[v => !!v || '團隊名稱不能為空', v => !v || v.length <= 50 || '團隊名稱不能超過50個字元']"
            class="mb-6"
          />
          <v-textarea
            v-model="newDescription"
            label="團隊描述"
            variant="outlined"
            density="compact"
            hide-details
            rows="4"
            counter="200"
            :rules="[v => !v || v.length <= 200 || '描述不能超過200個字元']"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="editTeamInfoDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-1"
            :size="buttonSize"
            :loading="updatingTeamInfo"
            @click="updateTeamInfo"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增專案對話框 -->
    <CreateProjectDialog
      v-model="createProjectDialog"
      :default-team-id="team?._id"
      @project-created="handleProjectCreated"
    />

    <!-- 歷史專案對話框 -->
    <HistoryProjectsDialog
      v-model="historyProjectsDialog"
      :team-id="team?._id"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useTeamStore } from '@/stores/team'
import { usePermissionStore } from '@/stores/permission'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import CreateProjectDialog from '@/components/CreateProjectDialog.vue'
import HistoryProjectsDialog from '@/components/HistoryProjectsDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'

// 頁面定義
definePage({
  meta: {
    title: '團隊詳情 | 專案與任務管理',
    login: true
  }
})

const route = useRoute()
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const permissionStore = usePermissionStore()
const { smAndUp } = useDisplay()

// 響應式變數
const team = ref(null)
const loading = ref(true)
const deleteDialog = ref(false)
const addMemberDialog = ref(false)
const selectedMembers = ref([])
const availableUsers = ref([])
const loadingUsers = ref(false)
const addingMembers = ref(false)
const editTeamInfoDialog = ref(false)
const newTeamName = ref('')
const newDescription = ref('')
const updatingTeamInfo = ref(false)
const createProjectDialog = ref(false)
const historyProjectsDialog = ref(false)
const membersPage = ref(1)
const membersPerPage = 10
const projectsPage = ref(1)
const projectsPerPage = 12
const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')
const iconButtonSize = computed(() => !smAndUp.value ? 'x-small' : 'small')
const iconSize = computed(() => !smAndUp.value ? 15 : 20)
const avatarSize = computed(() => !smAndUp.value ? 36 : 40)

// 檢查是否為團隊管理者或擁有 PROJECT_AND_TASK_MANAGE 權限
const isTeamManager = computed(() => {
  if (!team.value || !user._id) return false
  // 擁有 PROJECT_AND_TASK_MANAGE 權限的用戶可以管理任何團隊
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) return true
  // 檢查是否為團隊管理者
  return team.value.managers?.some(manager => manager._id === user._id) || false
})

// 獲取更新後的專案列表（包含 store 中的最新顏色，排除已完成的專案）
const updatedProjects = computed(() => {
  if (!team.value?.projects) return []

  return team.value.projects
    .filter(project => project.status !== 'completed') // 排除已完成的專案
    .map(project => {
      // 直接從 store 的 projects 陣列中查找
      const storeProject = projectStore.projects.find(p => p._id === project._id)
      const result = storeProject ? { ...project, ...storeProject } : project

      // 調試信息
      if (storeProject) {
        console.log(`專案 ${project.name} 從 store 更新:`, storeProject)
      }

      return result
    })
})

// 分頁後的團隊成員列表
const paginatedMembers = computed(() => {
  if (!team.value?.members) return []

  const startIndex = (membersPage.value - 1) * membersPerPage
  const endIndex = startIndex + membersPerPage

  return team.value.members.slice(startIndex, endIndex)
})

// 團隊成員總頁數
const totalMembersPages = computed(() => {
  if (!team.value?.members) return 0
  return Math.ceil(team.value.members.length / membersPerPage)
})

// 分頁後的團隊專案列表
const paginatedProjects = computed(() => {
  if (!updatedProjects.value) return []

  const startIndex = (projectsPage.value - 1) * projectsPerPage
  const endIndex = startIndex + projectsPerPage

  return updatedProjects.value.slice(startIndex, endIndex)
})

// 團隊專案總頁數
const totalProjectsPages = computed(() => {
  if (!updatedProjects.value) return 0
  return Math.ceil(updatedProjects.value.length / projectsPerPage)
})

// 取得團隊資料
const fetchTeam = async () => {
  try {
    loading.value = true
    const { data } = await apiAuth.get(`/teams/${route.params.id}`)
    if (data.success) {
      team.value = data.data

      // 將團隊的專案數據同步到專案 store
      if (data.data.projects && data.data.projects.length > 0) {
        data.data.projects.forEach(project => {
          projectStore.updateProject(project._id, project)
        })
      }
    }
  } catch (error) {
    console.error('取得團隊資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得團隊資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 確認刪除團隊
const confirmDeleteTeam = () => {
  deleteDialog.value = true
}

// 刪除團隊
const deleteTeam = async () => {
  try {
    const { data } = await apiAuth.delete(`/teams/${route.params.id}`)
    if (data.success) {
      // 先從 store 中移除該團隊下的所有專案
      if (team.value?.projects) {
        team.value.projects.forEach(project => {
          projectStore.removeProject(project._id)
        })
      }

      // 從 store 中移除團隊
      teamStore.removeTeam(route.params.id)

      createSnackbar({
        text: '團隊及相關專案刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 跳轉回專案與任務管理首頁
      router.push('/projectAndTaskManagement')
    }
  } catch (error) {
    console.error('刪除團隊失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除團隊失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 檢查指定成員是否為團隊管理者
const checkIsTeamManager = (memberId) => {
  if (!team.value || !team.value.managers) return false
  return team.value.managers.some(manager => manager._id === memberId)
}

// 檢查是否可以管理指定成員
const canManageMember = (memberId) => {
  if (!team.value || !user._id) return false
  // 擁有 PROJECT_AND_TASK_MANAGE 權限的用戶可以管理任何成員
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) return true
  // 團隊管理者可以管理其他成員（但不能管理自己）
  if (isTeamManager.value && memberId !== user._id) return true
  return false
}

// 指派成員為團隊管理者
const assignManager = async (member) => {
  try {
    const { data } = await apiAuth.post(`/teams/${route.params.id}/managers`, {
      memberId: member._id
    })
    if (data.success) {
      // 局部更新管理者列表，避免重新載入整個頁面
      if (!team.value.managers) {
        team.value.managers = []
      }
      team.value.managers.push(member)

      // 更新 store 中的團隊資料
      teamStore.updateTeam(route.params.id, { managers: team.value.managers })

      createSnackbar({
        text: `${member.name} 已成為團隊管理者`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('指派管理者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '指派管理者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 移除團隊管理者
const removeManager = async (member) => {
  try {
    const { data } = await apiAuth.delete(`/teams/${route.params.id}/managers`, {
      data: { managerId: member._id }
    })
    if (data.success) {
      // 局部更新管理者列表，避免重新載入整個頁面
      if (team.value.managers) {
        team.value.managers = team.value.managers.filter(manager => manager._id !== member._id)
      }

      // 更新 store 中的團隊資料
      teamStore.updateTeam(route.params.id, { managers: team.value.managers })

      createSnackbar({
        text: `${member.name} 已移除團隊管理者權限`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('移除管理者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '移除管理者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 移除團隊成員
const removeMember = async (member) => {
  try {
    const { data } = await apiAuth.delete(`/teams/${route.params.id}/members`, {
      data: { memberId: member._id }
    })
    if (data.success) {
      // 局部更新成員列表，避免重新載入整個頁面
      if (team.value.members) {
        team.value.members = team.value.members.filter(m => m._id !== member._id)
      }
      // 如果該成員也是管理者，也要從管理者列表中移除
      if (team.value.managers) {
        team.value.managers = team.value.managers.filter(manager => manager._id !== member._id)
      }

      // 更新 store 中的團隊資料
      teamStore.updateTeam(route.params.id, {
        members: team.value.members,
        managers: team.value.managers
      })

      createSnackbar({
        text: `${member.name} 已從團隊中移除`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('移除成員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '移除成員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 開啟新增成員對話框
const openAddMemberDialog = async () => {
  addMemberDialog.value = true
  selectedMembers.value = []
  await fetchAvailableUsers()
}

// 取得可用的用戶列表
const fetchAvailableUsers = async () => {
  try {
    loadingUsers.value = true
    const { data } = await apiAuth.get('/teams/users/list')
    if (data.success) {
      // 過濾掉已經是團隊成員的用戶
      const currentMemberIds = team.value?.members?.map(member => member._id) || []
      availableUsers.value = data.data.filter(user => !currentMemberIds.includes(user._id))
    }
  } catch (error) {
    console.error('取得用戶列表失敗:', error)
    createSnackbar({
      text: '取得用戶列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingUsers.value = false
  }
}

// 移除選中的成員
const removeSelectedMember = (memberId) => {
  selectedMembers.value = selectedMembers.value.filter(id => id !== memberId)
}

// 新增成員到團隊
const addMembers = async () => {
  if (!selectedMembers.value || selectedMembers.value.length === 0) return

  try {
    addingMembers.value = true
    const memberIds = selectedMembers.value.map(member => member._id)
    const addedMembers = []

    // 逐一新增成員
    for (const memberId of memberIds) {
      const { data } = await apiAuth.post(`/teams/${route.params.id}/members`, {
        memberId
      })
      if (!data.success) {
        throw new Error(data.message || '新增成員失敗')
      }
      // 找到對應的成員資料
      const member = availableUsers.value.find(u => u._id === memberId)
      if (member) {
        addedMembers.push(member)
      }
    }

    // 局部更新成員列表，避免重新載入整個頁面
    if (!team.value.members) {
      team.value.members = []
    }
    team.value.members.push(...addedMembers)

    // 更新 store 中的團隊資料
    teamStore.updateTeam(route.params.id, { members: team.value.members })

    createSnackbar({
      text: `成功新增 ${memberIds.length} 位成員`,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    // 關閉對話框
    addMemberDialog.value = false
  } catch (error) {
    console.error('新增成員失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '新增成員失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    addingMembers.value = false
  }
}

// 開啟修改團隊資訊對話框
const openEditTeamInfoDialog = () => {
  newTeamName.value = team.value?.name || ''
  newDescription.value = team.value?.description || ''
  editTeamInfoDialog.value = true
}

// 更新團隊資訊
const updateTeamInfo = async () => {
  try {
    updatingTeamInfo.value = true
    const { data } = await apiAuth.put(`/teams/${route.params.id}`, {
      name: newTeamName.value,
      members: team.value.members.map(member => member._id),
      description: newDescription.value
    })

    if (data.success) {
      // 局部更新團隊資訊，避免重新載入整個頁面
      team.value.name = newTeamName.value
      team.value.description = newDescription.value

      // 更新 store 中的團隊資料
      teamStore.updateTeam(route.params.id, {
        name: newTeamName.value,
        description: newDescription.value
      })

      createSnackbar({
        text: '團隊資訊更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      // 關閉對話框
      editTeamInfoDialog.value = false
    }
  } catch (error) {
    console.error('更新團隊資訊失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新團隊資訊失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingTeamInfo.value = false
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
  // 將新專案添加到團隊的專案列表中
  if (!team.value.projects) {
    team.value.projects = []
  }
  team.value.projects.push(project)

  // 同步更新到專案 store
  projectStore.addProject(project)

  createSnackbar({
    text: '專案建立成功',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 組件掛載時載入資料
onMounted(() => {
  fetchTeam()
})

// 監聽路由參數變化，重新載入資料
watch(() => route.params.id, () => {
  fetchTeam()
})

// 監聽專案 store 的變化，同步更新團隊專案列表
watch(() => projectStore.projects, (newProjects) => {
  if (team.value && newProjects.length > 0) {
    // 檢查屬於當前團隊的專案
    const teamProjects = newProjects.filter(project => project.team?._id === team.value._id)

    // 總是更新團隊的專案列表，確保數據同步
    team.value.projects = teamProjects

    console.log(`團隊 ${team.value.name} 的專案列表已更新，共 ${teamProjects.length} 個專案`)
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
@use '/src/styles/rwd' as rwd;

.members-card {
  padding-bottom: 11px !important;
}

.list-item-name {
  font-size: 14px;
}
.list-item-email {
  font-size: 12px;
}

@include rwd.sm {
  .list-item-name {
    font-size: 15px;
  }
  .list-item-email {
    font-size: 14px;
  }
}
</style>

<route lang="yaml">
  meta:
    layout: ProjectAndTask
</route>

