<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-6"
      >
        <h3>權限管理</h3>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="teal-darken-1"
          align-tabs="start"
        >
          <v-tab value="roles">
            <v-icon start>
              mdi-account-group
            </v-icon>
            角色管理
          </v-tab>
          <v-tab value="permissions">
            <v-icon start>
              mdi-shield-account
            </v-icon>
            權限管理
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 角色管理標籤頁 -->
          <v-window-item value="roles">
            <v-card flat>
              <v-card-text>
                <v-row>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-btn
                      prepend-icon="mdi-plus"
                      color="teal-darken-1"
                      variant="outlined"
                      @click="openRoleDialog(null)"
                    >
                      新增角色
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="roleSearch"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋角色"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>

                <!-- 角色表格 -->
                <v-data-table
                  :items="filteredRoles"
                  :headers="roleHeaders"
                  :loading="roleLoading"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td>{{ item.name }}</td>
                      <td>{{ item.code }}</td>
                      <td>{{ item.description || '-' }}</td>
                      <td class="py-2">
                        <v-btn
                          color="teal-darken-2"
                          variant="outlined"
                          size="small"
                          prepend-icon="mdi-shield-account"
                          @click="openPermissionSelectionForRole(item)"
                        >
                          查看及編輯權限
                        </v-btn>
                        <div class="text-caption text-grey mt-1">
                          {{ item.permissions?.length || 0 }} 個權限
                        </div>
                      </td>
                      <td class="text-center">
                        <v-btn
                          icon
                          color="light-blue-darken-4"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="editRole(item)"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="red-lighten-1"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="deleteRole(item)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 權限管理標籤頁 -->
          <v-window-item value="permissions">
            <v-card flat>
              <v-card-text>
                <v-row>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-btn
                      prepend-icon="mdi-plus"
                      color="teal-darken-1"
                      variant="outlined"
                      @click="openPermissionDialog(null)"
                    >
                      新增權限
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="permissionSearch"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋權限"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>

                <!-- 權限表格 -->
                <v-data-table
                  :items="filteredPermissions"
                  :headers="permissionHeaders"
                  :loading="permissionLoading"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td>{{ item.code }}</td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.module }}</td>
                      <td>{{ item.action }}</td>
                      <td>{{ item.resource }}</td>
                      <td>{{ item.description || '-' }}</td>
                      <td class="text-center">
                        <v-btn
                          icon
                          color="light-blue-darken-4"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="editPermission(item)"
                        >
                          <v-icon>
                            mdi-pencil
                          </v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="red-lighten-1"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="openDeletePermissionDialog(item)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>



    <!-- 刪除權限確認對話框（共用元件） -->
    <ConfirmDeleteDialog
      v-model="deletePermissionDialogOpen"
      dialog-width="420"
      title="確認刪除"
      :message="`確定要刪除權限「<span class='text-red'>${selectedPermissionToDelete?.name || ''}</span>」嗎？<br/>代碼：${selectedPermissionToDelete?.code || ''}`"
      confirm-button-color="red-darken-1"
      cancel-button-color="grey-darken-1"
      @confirm="confirmDeletePermission"
    />

    <!-- 權限對話框 -->
    <v-dialog
      v-model="permissionDialog.open"
      persistent
      max-width="800"
      :no-click-animation="permissionSubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-teal-darken-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-shield-account
          </v-icon>
          {{ permissionDialog.id ? '編輯權限' : '新增權限' }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closePermissionDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 mb-0 px-6">
          <v-form
            ref="permissionFormRef"
            v-model="permissionFormValid"
            @submit.prevent="savePermission"
          >
            <v-row>
              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="2"
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-shield-key
                    </v-icon> 權限資訊
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="permissionForm.code"
                  label="*權限代碼"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入權限代碼']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="permissionForm.name"
                  label="*權限名稱"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入權限名稱']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="permissionForm.module"
                  :items="moduleOptions"
                  label="*所屬模組"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇模組']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="permissionForm.action"
                  :items="actionOptions"
                  label="*操作類型"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇操作類型']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="permissionForm.resource"
                  label="*資源類型"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入資源類型']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-switch
                  v-model="permissionForm.isActive"
                  label="啟用狀態"
                  color="teal-darken-1"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="permissionForm.description"
                  label="描述"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  clearable
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-3 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                @click="closePermissionDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :size="buttonSize"
                :loading="permissionSubmitting"
              >
                {{ permissionDialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 角色對話框 -->
    <v-dialog
      v-model="roleDialog.open"
      persistent
      max-width="800"
      :no-click-animation="roleSubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-group
          </v-icon>
          {{ roleDialog.id ? '編輯角色' : '新增角色' }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeRoleDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-4 mb-0 px-6">
          <v-form
            ref="roleFormRef"
            v-model="roleFormValid"
            @submit.prevent="saveRole"
          >
            <v-row>
              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="2"
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-account-details
                    </v-icon> 角色資訊
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="roleForm.name"
                  label="*角色名稱"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入角色名稱']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="roleForm.code"
                  label="*角色代碼"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入角色代碼']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="roleForm.level"
                  label="角色層級"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  hint="數字越大權限越高"
                  persistent-hint
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-switch
                  v-model="roleForm.isActive"
                  label="啟用狀態"
                  color="teal-darken-1"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="roleForm.description"
                  label="描述"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  no-resize
                  clearable
                />
              </v-col>

              <!-- 權限選擇按鈕（已移至表格列操作，這裡不再顯示） -->
            </v-row>

            <v-card-actions class="px-3 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                @click="closeRoleDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :size="buttonSize"
                :loading="roleSubmitting"
              >
                {{ roleDialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 權限選擇對話框 -->
    <PermissionSelector
      v-model="permissionSelectionDialog.open"
      :permissions="currentEditingRole ? currentEditingRole.permissions : roleForm.permissions"
      :submitting="permissionSubmitting"
      @save="handlePermissionSave"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import PermissionSelector from '@/components/PermissionSelector.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// 頁面設定
definePage({
  meta: {
    title: '權限管理 | Ystravel',
    login: true
    // 暫時移除權限檢查，讓你能先進入頁面設置權限
  }
})

// Store 和工具
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

// 響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// 響應式狀態
const activeTab = ref('roles')
const permissionSearch = ref('')
const roleSearch = ref('')

// 權限相關
const permissions = ref([])
const permissionLoading = ref(false)
const permissionDialog = ref({ open: false, id: null })
const permissionFormRef = ref(null)
const permissionFormValid = ref(false)
const permissionSubmitting = ref(false)
const deletePermissionDialogOpen = ref(false)
const selectedPermissionToDelete = ref(null)

// 權限選擇對話框
const permissionSelectionDialog = ref({ open: false, initialPermissions: [] })
const currentEditingRole = ref(null)
const permissionForm = ref({
  code: '',
  name: '',
  module: '',
  action: '',
  resource: '',
  description: '',
  isActive: true
})

// 角色相關
const roles = ref([])
const roleLoading = ref(false)
const roleDialog = ref({ open: false, id: null })
const roleFormRef = ref(null)
const roleFormValid = ref(false)
const roleSubmitting = ref(false)
const roleForm = ref({
  name: '',
  code: '',
  description: '',
  permissions: [],
  isActive: true,
  level: 0
})

// 表格標題
const permissionHeaders = [
  { title: '權限代碼', key: 'code', sortable: true },
  { title: '權限名稱', key: 'name', sortable: true },
  { title: '模組', key: 'module', sortable: true },
  { title: '操作', key: 'action', sortable: true },
  { title: '資源', key: 'resource', sortable: true },
  { title: '描述', key: 'description' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

const roleHeaders = [
  { title: '角色名稱', key: 'name', sortable: true },
  { title: '角色代碼', key: 'code', sortable: true },
  { title: '描述', key: 'description' },
  { title: '權限', key: 'permissions' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

// 選項
const moduleOptions = [
  { title: '系統管理', value: 'system' },
  { title: '公司管理', value: 'company' },
  { title: '部門管理', value: 'department' },
  { title: '員工相關', value: 'employee' },
  { title: '行銷管理', value: 'marketing' },
  { title: '硬體管理', value: 'hardware' },
  { title: '專案管理', value: 'project' },
  { title: '審計管理', value: 'audit' },
]

const actionOptions = [
  { title: '新增', value: 'create' },
  { title: '查看', value: 'read' },
  { title: '修改', value: 'update' },
  { title: '刪除', value: 'delete' },
  { title: '匯出', value: 'export' },
  { title: '匯入', value: 'import' },
  { title: '管理', value: 'manage' }
]

// 計算屬性
const filteredPermissions = computed(() => {
  if (!permissionSearch.value) return permissions.value
  return permissions.value.filter(permission =>
    permission.name.toLowerCase().includes(permissionSearch.value.toLowerCase()) ||
    permission.code.toLowerCase().includes(permissionSearch.value.toLowerCase())
  )
})

// const availablePermissions = computed(() => {
//   return permissions.value.map(permission => ({
//     _id: permission._id,
//     name: permission.name,
//     code: permission.code,
//     module: permission.module
//   }))
// })

const filteredRoles = computed(() => {
  if (!roleSearch.value) return roles.value
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(roleSearch.value.toLowerCase()) ||
    role.code.toLowerCase().includes(roleSearch.value.toLowerCase())
  )
})


// 方法
const loadPermissions = async () => {
  try {
    permissionLoading.value = true
    const result = await permissionStore.getAllPermissions()
    permissions.value = result // 直接使用 result，因為 getAllPermissions 已經處理了數據結構
  } catch (error) {
    createSnackbar({
      text: error.message || '載入權限失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    permissionLoading.value = false
  }
}

const loadRoles = async () => {
  try {
    roleLoading.value = true
    const result = await permissionStore.getAllRoles()
    roles.value = result // 直接使用 result，因為 getAllRoles 已經處理了數據結構
  } catch (error) {
    createSnackbar({
      text: error.message || '載入角色失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    roleLoading.value = false
  }
}

const editRole = (role) => {
  openRoleDialog(role)
}

const deleteRole = (role) => {
  // 刪除角色
  createSnackbar({
    text: `刪除角色 ${role.name} 功能開發中`,
    snackbarProps: { color: 'info' }
  })
}

const editPermission = (permission) => {
  openPermissionDialog(permission)
}

const openDeletePermissionDialog = (permission) => {
  selectedPermissionToDelete.value = permission
  deletePermissionDialogOpen.value = true
}

const confirmDeletePermission = async () => {
  const target = selectedPermissionToDelete.value
  if (!target?._id) return

  try {
    await permissionStore.deletePermission(target._id)
    createSnackbar({
      text: `已刪除權限：${target.name}`,
      snackbarProps: { color: 'teal' }
    })
    deletePermissionDialogOpen.value = false
    selectedPermissionToDelete.value = null
    await loadPermissions()
  } catch (error) {
    createSnackbar({
      text: error.message || '刪除權限失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

// 對話框函數
const openPermissionDialog = (permission = null) => {
  permissionDialog.value.open = true
  permissionDialog.value.id = permission?._id || null

  if (permission) {
    // 編輯模式
    permissionForm.value = {
      code: permission.code || '',
      name: permission.name || '',
      module: permission.module || '',
      action: permission.action || '',
      resource: permission.resource || '',
      description: permission.description || '',
      isActive: permission.isActive !== false
    }
  } else {
    // 新增模式
    permissionForm.value = {
      code: '',
      name: '',
      module: '',
      action: '',
      resource: '',
      description: '',
      isActive: true
    }
  }
}

const closePermissionDialog = () => {
  permissionDialog.value.open = false
  permissionDialog.value.id = null
  permissionForm.value = {
    code: '',
    name: '',
    module: '',
    action: '',
    resource: '',
    description: '',
    isActive: true
  }
}

const openRoleDialog = (role = null) => {
  roleDialog.value.open = true
  roleDialog.value.id = role?._id || null

  if (role) {
    // 編輯模式
    roleForm.value = {
      name: role.name || '',
      code: role.code || '',
      description: role.description || '',
      permissions: role.permissions || [], // 保持完整的權限物件
      isActive: role.isActive !== false,
      level: role.level || 0
    }
  } else {
    // 新增模式
    roleForm.value = {
      name: '',
      code: '',
      description: '',
      permissions: [],
      isActive: true,
      level: 0
    }
  }
}

const closeRoleDialog = () => {
  roleDialog.value.open = false
  roleDialog.value.id = null
  roleForm.value = {
    name: '',
    code: '',
    description: '',
    permissions: [],
    isActive: true,
    level: 0
  }
}

// （移除）權限選擇相關函數（已改由表格操作觸發）

// 從表格直接選擇權限
const openPermissionSelectionForRole = (role) => {
  // 設置當前編輯的角色
  currentEditingRole.value = role
  // 設置權限選擇對話框的初始權限
  permissionSelectionDialog.value.initialPermissions = role.permissions || []
  permissionSelectionDialog.value.open = true
}

const handlePermissionSave = async (permissionCodes) => {
  // 根據權限代碼找到對應的權限物件
  const selectedPermissions = []
  permissionCodes.forEach(code => {
    const permission = permissions.value.find(p => p.code === code)
    if (permission) {
      selectedPermissions.push(permission)
    }
  })

  // 如果是在編輯對話框中
  if (roleDialog.value.open) {
    // 更新 roleForm 的權限
    roleForm.value.permissions = selectedPermissions
  } else if (currentEditingRole.value) {
    // 如果是從表格直接選擇權限，直接更新角色
    try {
      const roleId = currentEditingRole.value._id
      const permissionIds = selectedPermissions.map(p => p._id)

      await permissionStore.updateRole(roleId, {
        name: currentEditingRole.value.name,
        code: currentEditingRole.value.code,
        description: currentEditingRole.value.description,
        level: currentEditingRole.value.level,
        permissions: permissionIds
      })

      // 更新本地數據
      const roleIndex = roles.value.findIndex(r => r._id === roleId)
      if (roleIndex !== -1) {
        roles.value[roleIndex].permissions = selectedPermissions
      }

      createSnackbar({
        text: '角色權限已更新',
        snackbarProps: { color: 'teal' }
      })
    } catch (error) {
      console.error('更新角色權限失敗:', error)
      createSnackbar({
        text: '更新角色權限失敗',
        snackbarProps: { color: 'red' }
      })
    }
  }

  // 關閉對話框
  permissionSelectionDialog.value.open = false
  currentEditingRole.value = null
}


const savePermission = async () => {
  if (!permissionFormValid.value) return

  permissionSubmitting.value = true
  try {
    if (permissionDialog.value.id) {
      // 編輯權限
      await permissionStore.updatePermission(permissionDialog.value.id, permissionForm.value)
      createSnackbar({
        text: '權限更新成功',
        snackbarProps: { color: 'teal' }
      })
    } else {
      // 新增權限
      await permissionStore.createPermission(permissionForm.value)
      createSnackbar({
        text: '權限新增成功',
        snackbarProps: { color: 'teal' }
      })
    }
    closePermissionDialog()
    await loadPermissions()
  } catch (error) {
    createSnackbar({
      text: error.message || '操作失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    permissionSubmitting.value = false
  }
}

const saveRole = async () => {
  if (!roleFormValid.value) return

  roleSubmitting.value = true
  try {
    // 準備角色數據，將權限物件轉換為 ID 陣列
    const roleData = {
      ...roleForm.value,
      permissions: roleForm.value.permissions.map(p => p._id || p)
    }

    if (roleDialog.value.id) {
      // 編輯角色
      await permissionStore.updateRole(roleDialog.value.id, roleData)
      createSnackbar({
        text: '角色更新成功',
        snackbarProps: { color: 'teal' }
      })
    } else {
      // 新增角色
      await permissionStore.createRole(roleData)
      createSnackbar({
        text: '角色新增成功',
        snackbarProps: { color: 'teal' }
      })
    }
    closeRoleDialog()
    await loadRoles()
  } catch (error) {
    createSnackbar({
      text: error.message || '操作失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    roleSubmitting.value = false
  }
}

// 生命週期
onMounted(async () => {
  await loadPermissions()
  await loadRoles()
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

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
</style>
