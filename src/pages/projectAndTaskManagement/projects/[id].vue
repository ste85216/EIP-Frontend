<template>
  <v-container
    fluid
    class="pt-0 pt-sm-4 px-0"
  >
    <v-row class="mt-2 mx-0 py-2 px-0 rounded-lg bg-white">
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

        <!-- 專案內容 -->
        <div
          v-else-if="project"
        >
          <!-- 專案標題 -->
          <div class="d-flex align-center pb-6 ps-7 pe-4 border border-t-0 border-e-0 border-s-0">
            <v-icon
              :size="smAndUp ? 32 : 24"
              class="me-2 me-sm-3 pt-1"
              :color="updatedProject?.iconColor && updatedProject?.iconColor !== 'white' ? updatedProject?.iconColor : 'grey-lighten-1'"
            >
              {{ updatedProject?.iconColor && updatedProject?.iconColor !== 'white' ? 'mdi-square-rounded' : 'mdi-square-rounded-outline' }}
            </v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center">
                <span class="page-title">
                  {{ updatedProject?.name }}
                </span>

                <!-- 專案操作下拉選單 -->
                <v-menu v-if="isTeamManager">
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
                      title="修改專案詳情"
                      @click="openEditProjectDialog"
                    >
                      <template #prepend>
                        <v-icon :size="iconSize">
                          mdi-pencil
                        </v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item
                      title="專案描述"
                      @click="openProjectDescriptionDialog"
                    >
                      <template #prepend>
                        <v-icon :size="iconSize">
                          mdi-text-box-outline
                        </v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item
                      base-color="red-darken-3"
                      title="刪除專案"
                      @click="openDeleteProjectDialog"
                    >
                      <template #prepend>
                        <v-icon :size="iconSize">
                          mdi-delete
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <!-- 非團隊管理者只能查看專案描述 -->
                <v-menu v-else>
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
                      title="專案描述"
                      @click="openProjectDescriptionDialog"
                    >
                      <template #prepend>
                        <v-icon :size="iconSize">
                          mdi-text-box-outline
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <!-- 收藏星號 -->
                <v-btn
                  :icon="isProjectFavorited ? 'mdi-star' : 'mdi-star-outline'"
                  size="small"
                  variant="plain"
                  class="opacity-100 me-1"
                  :ripple="false"
                  :color="isProjectFavorited ? 'amber' : 'grey'"
                  @click="toggleFavorite"
                />

                <!-- 狀態選擇下拉選單 -->
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      v-if="smAndUp"
                      :prepend-icon="getStatusIcon(updatedProject?.status)"
                      size="small"
                      variant="outlined"
                      :color="getStatusColor(updatedProject?.status)"
                      v-bind="props"
                    >
                      {{ getStatusText(updatedProject?.status) }}
                    </v-btn>
                    <v-btn
                      v-if="!smAndUp"
                      icon
                      size="24"
                      variant="plain"
                      class="opacity-100"
                      :ripple="false"
                      :color="getStatusColor(updatedProject?.status)"
                      v-bind="props"
                    >
                      <v-icon size="18">
                        {{ getStatusIcon(updatedProject?.status) }}
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-list
                    density="compact"
                    slim
                  >
                    <v-list-item
                      v-for="(status, index) in statusOptions"
                      :key="index"
                      @click="updateProjectStatus(status.value)"
                    >
                      <template #prepend>
                        <v-icon
                          :size="iconSize"
                          :color="getStatusColor(status.value)"
                        >
                          {{ getStatusIcon(status.value) }}
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ status.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- 團隊成員顯示 -->
            <div class="d-flex align-center">
              <!-- 團隊成員下拉選單 -->
              <v-menu>
                <template #activator="{ props }">
                  <div
                    class="d-flex align-center me-3 member-hover-container"
                    v-bind="props"
                  >
                    <div class="d-flex align-center">
                      <UserAvatar
                        v-for="(member, index) in updatedProject?.team?.members?.slice(0, 3)"
                        :key="member._id"
                        :user="member"
                        :size="smAndUp ? 36 : 26"
                        avatar-class="member-avatar"
                        :style="{
                          marginLeft: index > 0 ? '-16px' : '0',
                          zIndex: 10 - index
                        }"
                      />
                      <v-avatar
                        v-if="updatedProject?.team?.members?.length > 3"
                        :size="smAndUp ? 36 : 26"
                        class="member-avatar ms-n2"
                        color="grey-lighten-2"
                        style="z-index: 7"
                      >
                        <span class="text-caption">+{{ updatedProject.team.members.length - 3 }}</span>
                      </v-avatar>
                    </div>
                  </div>
                </template>
                <v-list
                  density="compact"
                  slim
                >
                  <v-list-subheader
                    class="team-name-clickable"
                    @click="navigateToTeamDetail"
                  >
                    {{ updatedProject?.team?.name || '團隊成員' }}
                  </v-list-subheader>
                  <v-list-item
                    v-for="member in updatedProject?.team?.members"
                    :key="member._id"
                  >
                    <template #prepend>
                      <UserAvatar
                        :user="member"
                        size="32"
                        avatar-class="me-2"
                      />
                    </template>
                    <v-list-item-title>
                      <div class="d-flex align-center mb-1">
                        <span style="font-size: 14px;">{{ member.name }}</span>
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
                    <v-list-item-subtitle style="font-size: 13px;">
                      {{ member.email }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- 任務區域 -->
          <div class="task-area">
            <!-- 任務表格 -->
            <TaskTable
              :project="updatedProject"
              :task-categories="taskCategories"
              @task-selected="openTaskSidebar"
              @task-updated="handleTaskUpdated"
              @task-deleted="handleTaskDeleted"
              @task-created="handleTaskCreated"
              @category-created="handleCategoryCreated"
              @category-updated="handleCategoryUpdated"
              @project-updated="handleProjectUpdated"
            />
          </div>
        </div>

        <!-- 錯誤狀態 -->
        <div
          v-else
          class="text-center py-8"
        >
          <v-icon
            size="48"
            color="red-darken-2"
          >
            mdi-alert-circle
          </v-icon>
          <h2 class="page-title mt-4 mb-2">
            找不到專案
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            專案可能已被刪除或是網址不正確
          </p>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            class="mt-4"
            to="/projectAndTaskManagement"
          >
            返回首頁
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 編輯專案對話框 -->
    <EditProjectDialog
      v-model="editProjectDialog"
      :project="project"
      :team-disabled="!teamStore.isProjectTeamManager(project, userStore._id)"
      :allowed-team-ids="allowedTeamIds"
      @project-updated="handleProjectUpdated"
    />

    <!-- 刪除專案確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteProjectDialog"
      title="確認刪除專案"
      :message="`您確定要刪除專案「<span class='font-weight-bold text-red-darken-2'>${updatedProject?.name}</span>」嗎？此操作無法復原，專案內的所有任務也會被刪除。`"
      :expected-name="updatedProject?.name"
      input-label="專案名稱"
      confirm-button-text="刪除"
      @confirm="handleProjectDeleted"
    />

    <!-- 任務詳情側邊欄 -->
    <TaskSidebar
      v-model="taskSidebarOpen"
      :task="selectedTask"
      :project="updatedProject"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />

    <!-- 專案描述對話框 -->
    <v-dialog
      v-model="projectDescriptionDialog"
      max-width="680px"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-text-box-outline
          </v-icon>
          專案描述
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="projectDescriptionDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-6">
          <!-- 專案描述 -->
          <div class="mb-6">
            <div
              v-if="updatedProject?.description"
              class="text-body-1"
              style="white-space: pre-wrap; word-wrap: break-word;"
            >
              {{ updatedProject.description }}
            </div>
            <div
              v-else
              class="text-body-1 text-medium-emphasis text-center py-4"
            >
              <v-icon
                size="32"
                color="grey-lighten-1"
                class="mb-2"
              >
                mdi-text-box-outline
              </v-icon>
              <p>此專案尚無描述</p>
            </div>
          </div>

          <!-- 專案附件 -->
          <div class="attachments-section">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="card-title">
                專案附件
              </div>
              <v-icon
                v-if="canManageAttachments"
                size="16"
                color="grey"
                class="me-2 edit-icon"
                @click="toggleAttachmentSection"
              >
                {{ showAttachmentUpload ? 'mdi-minus' : 'mdi-plus' }}
              </v-icon>
            </div>

            <!-- 附件上傳區域 (可展開/收合) -->
            <div
              v-if="showAttachmentUpload && canManageAttachments"
              class="mb-3 d-flex"
            >
              <v-file-input
                ref="fileInputRef"
                v-model="selectedFiles"
                label="選擇檔案"
                variant="outlined"
                density="compact"
                multiple
                prepend-icon="mdi-paperclip"
                chips
                counter
                :rules="[
                  v => !v || v.length <= 10 || '最多只能上傳 10 個檔案'
                ]"
                @update:model-value="handleFileSelect"
              >
                <template #selection="{ fileNames }">
                  <div
                    class="d-flex flex-wrap align-center"
                    style="gap: 4px;"
                  >
                    <template
                      v-for="(fileName, index) in fileNames"
                      :key="fileName"
                    >
                      <v-chip
                        v-if="index < 3"
                        color="blue-darken-1"
                        size="small"
                        label
                        class="mb-1"
                      >
                        {{ truncateFileName(fileName, 15) }}
                      </v-chip>
                      <span
                        v-if="index === 3"
                        class="text-overline text-grey-darken-3 ms-1"
                      >
                        +{{ fileNames.length - 3 }} 個檔案
                      </span>
                    </template>
                  </div>
                </template>
              </v-file-input>

              <!-- 上傳按鈕 -->
              <v-btn
                v-if="selectedFiles && selectedFiles.length > 0"
                color="teal-darken-1"
                size="small"
                class="ms-3 mt-2"
                variant="outlined"
                :loading="uploadingAttachments"
                @click="uploadAttachments"
              >
                上傳
              </v-btn>
            </div>

            <!-- 現有附件列表 -->
            <div
              v-if="updatedProject?.attachments && updatedProject.attachments.length > 0"
              class="attachment-list"
            >
              <div class="text-caption text-grey mb-2">
                已上傳的附件 ({{ updatedProject.attachments.length }})
              </div>
              <div
                v-for="attachment in updatedProject.attachments"
                :key="attachment._id"
                class="attachment-item d-flex align-center mb-2"
              >
                <v-icon
                  :color="getFileTypeColor(attachment.mimeType)"
                  size="20"
                  class="me-2"
                >
                  {{ getFileTypeIcon(attachment.mimeType) }}
                </v-icon>

                <!-- 只顯示檔名，不可點擊 -->
                <span
                  class="attachment-name flex-grow-1 text-body-2"
                  :title="attachment.originalName"
                >
                  {{ attachment.originalName }}
                </span>

                <!-- 下載按鈕 -->
                <v-btn
                  icon
                  size="x-small"
                  color="blue-grey-lighten-1"
                  variant="text"
                  :title="'下載 ' + attachment.originalName"
                  @click="downloadAttachment(attachment)"
                >
                  <v-icon size="16">
                    mdi-download
                  </v-icon>
                </v-btn>

                <!-- 刪除按鈕 -->
                <v-btn
                  v-if="canManageAttachments"
                  icon
                  size="x-small"
                  color="red-lighten-1"
                  variant="text"
                  :title="'刪除 ' + attachment.originalName"
                  @click="openDeleteAttachmentDialog(attachment)"
                >
                  <v-icon size="16">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <!-- 無附件狀態 -->
            <div
              v-else
              class="no-attachments text-center py-8"
            >
              <v-icon
                size="48"
                color="grey-lighten-1"
                class="mb-4"
              >
                mdi-paperclip
              </v-icon>
              <p class="text-body-2 text-medium-emphasis">
                尚無附件
              </p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            :size="buttonSize"
            @click="projectDescriptionDialog = false"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除附件確認對話框 -->
    <ConfirmDeleteDialog
      v-model="showDeleteAttachmentDialog"
      title="刪除附件"
      :message="`確定要刪除附件「${attachmentToDelete?.originalName || ''}」嗎？<br>此操作無法恢復。`"
      @confirm="confirmDeleteAttachment"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import { useTeamStore } from '@/stores/team'
import { usePermissionStore } from '@/stores/permission'
import EditProjectDialog from '@/components/EditProjectDialog.vue'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import TaskTable from '@/components/TaskTable.vue'
import TaskSidebar from '@/components/TaskSidebar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

const route = useRoute()
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()
const projectStore = useProjectStore()
const userStore = useUserStore()
const teamStore = useTeamStore()
const permissionStore = usePermissionStore()
const iconSize = computed(() => !smAndUp.value ? 15 : 20)
const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

// 頁面定義
definePage({
  meta: {
    title: '專案詳情 | 專案與任務管理',
    login: true,
  }
})

// 獲取更新後的專案資料（包含 store 中的最新資料）
const updatedProject = computed(() => {
  if (!project.value) return null

  // 從 store 中查找最新的專案資料
  const storeProject = projectStore.projects.find(p => p._id === project.value._id)

  if (storeProject) {
    // 合併資料，但確保 favorites 結構正確
    const merged = { ...project.value, ...storeProject }

    // 確保 iconColor 被正確處理（包括 undefined 值）
    if (Object.prototype.hasOwnProperty.call(storeProject, 'iconColor')) {
      merged.iconColor = storeProject.iconColor
    }

    // 確保 status 被正確處理（包括 undefined 值）
    if (Object.prototype.hasOwnProperty.call(storeProject, 'status')) {
      merged.status = storeProject.status
    }

    // 如果 storeProject 有 favorites，深拷貝它；否則使用 project.value 的 favorites
    if (storeProject.favorites && Array.isArray(storeProject.favorites)) {
      // 深拷貝 favorites 陣列，確保每個 favorite 物件結構完整
      merged.favorites = storeProject.favorites.map(fav => ({
        ...fav,
        user: fav.user ? {
          _id: fav.user._id,
          name: fav.user.name,
          email: fav.user.email
        } : fav.user
      }))
    } else if (project.value.favorites && Array.isArray(project.value.favorites)) {
      // 深拷貝 project.value 的 favorites
      merged.favorites = project.value.favorites.map(fav => ({
        ...fav,
        user: fav.user ? {
          _id: fav.user._id,
          name: fav.user.name,
          email: fav.user.email
        } : fav.user
      }))
    }

    return merged
  }

  return project.value
})

// 響應式變數
const project = ref(null)
const loading = ref(true)

// 收藏狀態基於 project 計算
const isProjectFavorited = computed(() => {
  const favorites = project.value?.favorites
  const userId = userStore._id
  return favorites?.some(fav => fav.user._id === userId) || false
})

// 檢查是否為專案所屬團隊的管理者或擁有 PROJECT_AND_TASK_MANAGE 權限
const isTeamManager = computed(() => {
  if (!project.value || !userStore._id) return false
  // 擁有 PROJECT_AND_TASK_MANAGE 權限的用戶可以管理任何專案
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) return true
  // 僅團隊管理者可管理專案
  return teamStore.isProjectTeamManager(project.value, userStore._id)
})

// 允許轉移的目標團隊（使用者同時為該團隊成員且管理者）
const allowedTeamIds = computed(() => {
  const teams = teamStore.teams || []
  return teams
    .filter(t => t?.members?.some(m => m._id === userStore._id) && t?.managers?.some(m => m._id === userStore._id))
    .map(t => t._id)
})

// 檢查指定成員是否為團隊管理者
const checkIsTeamManager = (memberId) => {
  if (!updatedProject.value?.team?.managers) return false
  return updatedProject.value.team.managers.some(manager => manager._id === memberId)
}

// 檢查是否可以管理附件
const canManageAttachments = computed(() => {
  return isTeamManager.value
})
const taskCategories = ref([])
const editProjectDialog = ref(false)
const deleteProjectDialog = ref(false)
const projectDescriptionDialog = ref(false)
const taskSidebarOpen = ref(false)
const selectedTask = ref(null)

// 附件相關變數
const selectedFiles = ref([])
const uploadingAttachments = ref(false)
const showAttachmentUpload = ref(false)
const showDeleteAttachmentDialog = ref(false)
const attachmentToDelete = ref(null)


// 狀態選項
const statusOptions = [
  { title: '設定狀態', value: undefined },
  { title: '進度正常', value: 'on-track' },
  { title: '存在風險', value: 'at-risk' },
  { title: '偏離進度', value: 'off-track' },
  { title: '擱置中', value: 'on-hold' },
  { title: '完成', value: 'completed' }
]

// 取得專案資料
const fetchProject = async () => {
  try {
    loading.value = true
    // 同時取得專案資料和任務資料
    const [projectResponse, tasksResponse] = await Promise.all([
      apiAuth.get(`/projects/${route.params.id}`),
      apiAuth.get(`/tasks/project/${route.params.id}`)
    ])

    if (projectResponse.data.success && tasksResponse.data.success) {
      const projectData = projectResponse.data.data
      const tasksData = tasksResponse.data.data

      project.value = projectData
      // 同步更新到 project store
      projectStore.updateProject(projectData._id, projectData)

      // 處理任務分類和任務資料
      const projectCategories = projectData.taskCategories || []
      const tasksByCategory = {}

      tasksData.forEach(task => {
        const category = task.category || '未分類'
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = []
        }
        tasksByCategory[category].push(task)
      })

      const allCategoryNames = new Set([
        ...projectCategories.map(cat => cat.name),
        ...Object.keys(tasksByCategory)
      ])

      taskCategories.value = Array.from(allCategoryNames).map(categoryName => {
        const projectCategory = projectCategories.find(cat => cat.name === categoryName)
        return {
          name: categoryName,
          color: projectCategory?.color || 'primary',
          expanded: true,
          tasks: tasksByCategory[categoryName] || []
        }
      })
    }
  } catch (error) {
    console.error('取得專案資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得專案資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 取得狀態顏色
const getStatusColor = (status) => {
  switch (status) {
    case 'on-track':
      return 'green'
    case 'at-risk':
      return 'orange'
    case 'off-track':
      return 'red'
    case 'on-hold':
      return 'grey'
    case 'completed':
      return 'blue'
    default:
      return 'grey-lighten-1'
  }
}

// 取得狀態文字
const getStatusText = (status) => {
  switch (status) {
    case 'on-track':
      return '進度正常'
    case 'at-risk':
      return '存在風險'
    case 'off-track':
      return '偏離進度'
    case 'on-hold':
      return '擱置中'
    case 'completed':
      return '完成'
    default:
      return '設定狀態'
  }
}

// 取得狀態圖示
const getStatusIcon = (status) => {
  switch (status) {
    case 'on-track':
      return 'mdi-check-circle'
    case 'at-risk':
      return 'mdi-alert-circle'
    case 'off-track':
      return 'mdi-close-circle'
    case 'on-hold':
      return 'mdi-pause-circle'
    case 'completed':
      return 'mdi-check-circle'
    default:
      return 'mdi-cog'
  }
}

// 切換收藏狀態
const toggleFavorite = async () => {
  try {
    const { data } = await apiAuth.post(`/projects/${project.value._id}/favorite`)
    if (data.success) {
      // 更新專案資料
      project.value = data.data
      // 同步更新到 project store
      projectStore.updateProject(project.value._id, data.data)

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


// 更新專案狀態
const updateProjectStatus = async (status) => {
  try {
    const { data } = await apiAuth.put(`/projects/${project.value._id}`, {
      status
    })

    if (data.success) {
      project.value = data.data

      // 如果我們要設定狀態為 undefined，需要明確確保 data.data 中有 status 屬性
      const storeUpdateData = { ...data.data }
      if (status === undefined && !Object.prototype.hasOwnProperty.call(data.data, 'status')) {
        storeUpdateData.status = undefined
      }

      // 同步更新到 project store
      projectStore.updateProject(project.value._id, storeUpdateData)

      createSnackbar({
        text: '專案狀態更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新專案狀態失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新專案狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 開啟編輯專案對話框
const openEditProjectDialog = () => {
  if (!isTeamManager.value) {
    createSnackbar({
      text: '只有團隊管理者可以修改專案詳情',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  editProjectDialog.value = true
}

// 開啟刪除專案對話框
const openDeleteProjectDialog = () => {
  if (!isTeamManager.value) {
    createSnackbar({
      text: '只有團隊管理者可以刪除專案',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  deleteProjectDialog.value = true
}

// 開啟專案描述對話框
const openProjectDescriptionDialog = () => {
  projectDescriptionDialog.value = true
}

// 監聽專案描述對話框關閉，清空選擇的檔案
watch(projectDescriptionDialog, (newValue) => {
  if (!newValue) {
    // 對話框關閉時清空選擇的檔案和相關狀態
    selectedFiles.value = []
    showAttachmentUpload.value = false
    uploadingAttachments.value = false
  }
})

// 切換附件上傳區域
const toggleAttachmentSection = () => {
  showAttachmentUpload.value = !showAttachmentUpload.value
}

// 處理檔案選擇
const handleFileSelect = (files) => {
  console.log('選擇了檔案:', files?.length || 0, '個')
}

// 上傳附件
const uploadAttachments = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return
  if (!project.value?._id) return

  uploadingAttachments.value = true

  try {
    const formData = new FormData()
    selectedFiles.value.forEach(file => {
      formData.append('attachments', file)
    })

    const { data } = await apiAuth.post(`/projects/${project.value._id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success) {
      createSnackbar({
        text: `成功上傳 ${selectedFiles.value.length} 個附件`,
        snackbarProps: { color: 'success' }
      })

      // 清空選擇的檔案
      selectedFiles.value = []

      // 上傳完成後收合上傳區域
      showAttachmentUpload.value = false

      // 更新專案資料（保留已載入的 team 結構與 managers）
      const incoming = data.data
      const mergedTeam = (() => {
        const currentTeam = project.value?.team
        const nextTeam = incoming?.team
        // 若後端回傳 team 為 ObjectId 或缺少 managers，用現有 team 補齊
        if (typeof nextTeam === 'string') return currentTeam
        if (nextTeam && (!nextTeam.managers || !Array.isArray(nextTeam.managers))) return currentTeam || nextTeam
        return nextTeam || currentTeam
      })()
      project.value = { ...incoming, team: mergedTeam }
      projectStore.updateProject(project.value._id, data.data)
    }
  } catch (error) {
    console.error('上傳附件失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '上傳附件失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    uploadingAttachments.value = false
  }
}

// 下載附件
const downloadAttachment = (attachment) => {
  try {
    // 構建下載 URL
    const downloadUrl = `${import.meta.env.VITE_API}/uploads/projects/${attachment.filename}`

    // 創建臨時連結進行下載
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = attachment.originalName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('開始下載附件:', attachment.originalName)
  } catch (error) {
    console.error('下載附件失敗:', error)
    createSnackbar({
      text: '下載附件失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 顯示刪除確認對話框
const openDeleteAttachmentDialog = (attachment) => {
  attachmentToDelete.value = attachment
  showDeleteAttachmentDialog.value = true
}

// 確認刪除附件
const confirmDeleteAttachment = async () => {
  try {
    const attachment = attachmentToDelete.value
    if (!attachment) return

    const { data } = await apiAuth.delete(`/projects/${project.value._id}/attachments/${attachment._id}`)

    if (data.success) {
      createSnackbar({
        text: '附件刪除成功',
        snackbarProps: { color: 'success' }
      })

      // 更新專案資料（保留已載入的 team 結構與 managers）
      const incoming = data.data
      const mergedTeam = (() => {
        const currentTeam = project.value?.team
        const nextTeam = incoming?.team
        if (typeof nextTeam === 'string') return currentTeam
        if (nextTeam && (!nextTeam.managers || !Array.isArray(nextTeam.managers))) return currentTeam || nextTeam
        return nextTeam || currentTeam
      })()
      project.value = { ...incoming, team: mergedTeam }
      projectStore.updateProject(project.value._id, data.data)
    }
  } catch (error) {
    console.error('刪除附件失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除附件失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    // 重置對話框狀態
    attachmentToDelete.value = null
    showDeleteAttachmentDialog.value = false
  }
}

// 取得檔案類型圖標
const getFileTypeIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'mdi-file-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'mdi-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'mdi-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'mdi-folder-zip'
  if (mimeType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

// 取得檔案類型顏色
const getFileTypeColor = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'green'
  if (mimeType.includes('pdf')) return 'red'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'blue'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'green'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'orange'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'purple'
  return 'grey'
}

// 截斷檔案名稱
const truncateFileName = (fileName, maxLength = 15) => {
  if (fileName.length <= maxLength) return fileName
  return fileName.substring(0, maxLength) + '...'
}

// 跳轉到團隊詳情頁面
const navigateToTeamDetail = () => {
  if (updatedProject.value?.team?._id) {
    router.push(`/projectAndTaskManagement/teams/${updatedProject.value.team._id}`)
  }
}

// 處理專案更新
const handleProjectUpdated = (updatedProject) => {
  project.value = updatedProject
  // 同時更新 store 中的專案資料
  projectStore.updateProject(updatedProject._id, updatedProject)

  // 更新任務分類資料
  const projectCategories = updatedProject.taskCategories || []
  const tasksByCategory = {}

  // 重新組織任務資料
  taskCategories.value.forEach(category => {
    category.tasks.forEach(task => {
      const categoryName = task.category || '未分類'
      if (!tasksByCategory[categoryName]) {
        tasksByCategory[categoryName] = []
      }
      tasksByCategory[categoryName].push(task)
    })
  })

  const allCategoryNames = new Set([
    ...projectCategories.map(cat => cat.name),
    ...Object.keys(tasksByCategory)
  ])

  taskCategories.value = Array.from(allCategoryNames).map(categoryName => {
    const projectCategory = projectCategories.find(cat => cat.name === categoryName)
    return {
      name: categoryName,
      color: projectCategory?.color || 'primary',
      order: projectCategory?.order || 0,
      expanded: true,
      tasks: tasksByCategory[categoryName] || []
    }
  })
}

// 處理專案刪除
const handleProjectDeleted = async () => {
  try {
    const { data } = await apiAuth.delete(`/projects/${project.value._id}`)
    if (data.success) {
      // 從 store 中移除已刪除的專案
      projectStore.removeProject(project.value._id)

      createSnackbar({
        text: '專案刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 跳轉到專案列表頁面
      router.push('/projectAndTaskManagement/projects')
    }
  } catch (error) {
    console.error('刪除專案失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除專案失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 組件掛載時載入資料
onMounted(() => {
  fetchProject()
})

// 開啟任務側邊欄
const openTaskSidebar = (task) => {
  selectedTask.value = task
  taskSidebarOpen.value = true
}

// 處理任務更新
const handleTaskUpdated = (updatedTask) => {
  let taskFound = false
  let oldCategoryName = null

  // 先找到任務原本在哪個分類，並檢查分類是否有變更
  taskCategories.value.forEach(category => {
    const taskIndex = category.tasks.findIndex(t => t._id === updatedTask._id)
    if (taskIndex !== -1) {
      taskFound = true
      oldCategoryName = category.name

      // 如果分類沒有變更，直接更新任務資料
      if (category.name === updatedTask.category) {
        category.tasks[taskIndex] = updatedTask
      } else {
        // 如果分類有變更，從舊分類中移除任務
        category.tasks.splice(taskIndex, 1)
      }
    }
  })

  // 如果任務的分類有變更，需要添加到新分類中
  if (taskFound && oldCategoryName !== updatedTask.category) {
    // 找到新分類，如果不存在則創建
    let newCategory = taskCategories.value.find(cat => cat.name === updatedTask.category)

    if (!newCategory) {
      // 創建新分類
      const projectCategory = project.value?.taskCategories?.find(cat => cat.name === updatedTask.category)
      newCategory = {
        name: updatedTask.category || '未分類',
        color: projectCategory?.color || 'primary',
        order: projectCategory?.order || 999,
        expanded: true,
        tasks: []
      }
      taskCategories.value.push(newCategory)
    }

    // 將任務添加到新分類中
    newCategory.tasks.push(updatedTask)

    // 重新排序任務分類（按 order 欄位排序）
    taskCategories.value.sort((a, b) => (a.order || 999) - (b.order || 999))

    console.log(`✅ 任務「${updatedTask.name}」已從「${oldCategoryName}」移動到「${updatedTask.category}」`)
  }

  // 如果當前選中的任務被更新，也要更新選中的任務
  if (selectedTask.value && selectedTask.value._id === updatedTask._id) {
    selectedTask.value = updatedTask
  }
}

// 處理任務刪除
const handleTaskDeleted = (deletedTaskId) => {
  // 從任務分類中移除已刪除的任務
  taskCategories.value.forEach(category => {
    category.tasks = category.tasks.filter(t => t._id !== deletedTaskId)
  })

  // 如果當前選中的任務被刪除，關閉側邊欄
  if (selectedTask.value && selectedTask.value._id === deletedTaskId) {
    selectedTask.value = null
    taskSidebarOpen.value = false
  }
}

// 處理任務建立
const handleTaskCreated = ({ task, category }) => {
  // 將新任務添加到對應的分類中
  const categoryIndex = taskCategories.value.findIndex(cat => cat.name === category)
  if (categoryIndex !== -1) {
    // 將新任務插入到正確的位置（按 order 排序）
    const tasks = taskCategories.value[categoryIndex].tasks
    const insertIndex = tasks.findIndex(t => t.order !== undefined && t.order > (task.order || 0))

    if (insertIndex === -1) {
      // 如果沒有找到合適的位置，插入到末尾
      tasks.push(task)
    } else {
      // 插入到正確的位置
      tasks.splice(insertIndex, 0, task)
    }
  }
}

// 處理任務分類建立
const handleCategoryCreated = ({ project: updatedProject }) => {
  // 更新專案資料
  project.value = updatedProject

  // 同步更新到 project store
  projectStore.updateProject(updatedProject._id, updatedProject)

  // 重新組織任務分類資料，確保新分類出現在正確位置
  reorganizeTaskCategories()
}

// 重新組織任務分類資料（不重新載入，只重新整理本地資料）
const reorganizeTaskCategories = () => {
  if (!project.value) return

  const projectCategories = project.value.taskCategories || []
  const tasksByCategory = {}

  // 建立專案中存在的分類名稱集合
  const validCategoryNames = new Set(projectCategories.map(cat => cat.name))

  // 收集所有任務並按分類分組（只保留專案中仍存在的分類）
  taskCategories.value.forEach(category => {
    category.tasks.forEach(task => {
      const categoryName = task.category || '未分類'
      // 只有當分類仍存在於專案中時，才收集該分類的任務
      if (validCategoryNames.has(categoryName) || categoryName === '未分類') {
        if (!tasksByCategory[categoryName]) {
          tasksByCategory[categoryName] = []
        }
        tasksByCategory[categoryName].push(task)
      }
    })
  })

  // 獲取所有分類名稱（只包含專案中定義的分類）
  const allCategoryNames = new Set([
    ...projectCategories.map(cat => cat.name),
    // 只有在有未分類任務時才加入未分類
    ...(tasksByCategory['未分類'] ? ['未分類'] : [])
  ])

  // 重新建立任務分類陣列
  taskCategories.value = Array.from(allCategoryNames).map(categoryName => {
    const projectCategory = projectCategories.find(cat => cat.name === categoryName)
    const tasks = tasksByCategory[categoryName] || []

    // 對任務進行排序：先按 order 排序，再按 createdAt 排序
    const sortedTasks = tasks.sort((a, b) => {
      // 如果有 order 欄位，按 order 排序
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      // 如果只有一個有 order，有 order 的排在前面
      if (a.order !== undefined && b.order === undefined) {
        return -1
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1
      }
      // 如果都沒有 order，按建立時間排序（最新的在前）
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return {
      name: categoryName,
      color: projectCategory?.color || 'primary',
      order: projectCategory?.order !== undefined ? projectCategory.order : 999,
      expanded: true,
      tasks: sortedTasks
    }
  })

  // 按照 order 排序
  taskCategories.value.sort((a, b) => (a.order || 999) - (b.order || 999))

  console.log('✅ 任務分類資料重新組織完成')
}

// 處理任務分類更新
const handleCategoryUpdated = async (updateData) => {
  // 不重新載入整個頁面，只更新本地狀態
  console.log('✨ 分類更新，直接更新本地狀態...')

  // 如果有傳入更新資料，直接使用；否則重新載入（向後相容）
  if (updateData && updateData.project) {
    // 更新專案資料
    project.value = updateData.project
    // 同步更新到 project store
    projectStore.updateProject(updateData.project._id, updateData.project)

    // 如果有分類名稱變更資訊，同步更新本地任務資料
    if (updateData.categoryNameChanges && updateData.categoryNameChanges.length > 0) {
      updateData.categoryNameChanges.forEach(change => {
        // 更新任務分類中所有任務的 category 欄位
        taskCategories.value.forEach(category => {
          category.tasks.forEach(task => {
            if (task.category === change.oldName) {
              task.category = change.newName
            }
          })
        })
      })
    }

    // 不管是分類刪除、重命名還是新增，都重新組織任務分類資料
    reorganizeTaskCategories()
  } else {
    // 向後相容：如果沒有傳入更新資料，還是重新載入
    console.log('🔄 未收到更新資料，重新載入...')
    await fetchProject()
  }
}

// 監聽路由參數變化，重新載入資料
watch(() => route.params.id, () => {
  fetchProject()
})
</script>

<style scoped>
.task-categories {
  margin-top: 16px;
}

.task-category {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  padding: 16px;
  background-color: rgb(var(--v-theme-surface));
}

.task-table {
  border-radius: 8px;
}

.task-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.task-table :deep(.v-data-table__td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.task-table :deep(.v-data-table__th) {
  padding: 12px 16px;
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 600;
}

.v-card {
  border-radius: 12px;
}

.member-avatar {
  border: 2px solid white;
  cursor: pointer;
}

.member-hover-container {
  cursor: pointer;
}

.member-hover-container:hover .member-avatar {
  position: relative;
}

.member-hover-container:hover .member-avatar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

.team-name-clickable {
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
}

.team-name-clickable:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}

/* 附件相關樣式 */
.attachments-section {
  .attachment-list {
    .attachment-item {
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
      transition: all 0.2s ease;

      &:hover {
        border-color: #ccc;
        background: #eee;
      }

      .attachment-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.edit-icon {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
}

.no-attachments {
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}
</style>

<route lang="yaml">
  meta:
    layout: ProjectAndTask
</route>
