<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1800"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="rounded-lg">
      <div class="d-flex align-center justify-space-between px-6 py-4 bg-teal-darken-1 text-white">
        <div class="d-flex align-center">
          <v-icon class="me-2">
            mdi-shield-account
          </v-icon>
          權限管理
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="white"
            variant="outlined"
            class="me-2"
            size="small"
            @click="resetPermissions"
          >
            重置
          </v-btn>
          <v-btn
            color="white"
            variant="outlined"
            class="me-6"
            size="small"
            @click="openCopyDialog"
          >
            複製角色
          </v-btn>
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <v-card-text class="px-6 pt-6">
        <!-- 使用自適應網格，根據內容動態調整 -->
        <div class="permission-grid">
          <v-card
            v-for="module in permissionModules"
            :key="module.key"
            elevation="0"
            class="permission-card"
            :class="{ 'has-features': module.features && module.features.length > 0 }"
          >
            <v-card-title class="d-flex align-center px-5 pt-2 pb-0">
              <v-icon
                class="me-2"
                size="18"
              >
                {{ module.icon }}
              </v-icon>
              <span class="card-title text-subtitle-2">{{ module.name }}</span>
              <v-spacer />
              <div class="d-flex align-center">
                <v-btn
                  v-if="module.features && module.features.length > 0 && modulePermissions[module.key].pageAccess"
                  icon
                  color="teal"
                  variant="text"
                  size="x-small"
                  class="me-3"
                  title="全選/取消此模組的功能權限"
                  @click="selectAllModuleFeatures(module.key)"
                >
                  <v-icon size="16">
                    mdi-check-all
                  </v-icon>
                </v-btn>
                <v-switch
                  v-model="modulePermissions[module.key].pageAccess"
                  color="teal"
                  density="compact"
                  hide-details
                  @change="handlePageAccessToggle(module.key)"
                />
              </div>
            </v-card-title>
            <v-card-text 
              v-if="modulePermissions[module.key].pageAccess && module.features && module.features.length > 0"
              class="px-4 pb-5"
            >
              <div class="feature-list">
                <v-checkbox
                  v-for="(feature, index) in module.features"
                  :key="feature.key"
                  v-model="modulePermissions[module.key][feature.key]"
                  :label="feature.name"
                  color="teal"
                  hide-details
                  density="compact"
                  :class="['feature-checkbox', { 'feature-left': index % 2 === 0, 'feature-right': index % 2 === 1 }]"
                />
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="teal-darken-1"
          variant="outlined"
          :loading="submitting"
          class="ms-2"
          @click="savePermissions"
        >
          確定
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 複製權限對話框 -->
    <v-dialog
      v-model="copyDialog.open"
      persistent
      max-width="400"
      :no-click-animation="copySubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-content-copy
          </v-icon>
          複製權限
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeCopyDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-2 mb-0 px-6 pb-3">
          <v-form
            ref="copyFormRef"
            v-model="copyFormValid"
            @submit.prevent="copyPermissions"
          >
            <v-row>
              <v-col
                cols="12"
                class="mb-1"
              >
                <div class="role-alert-title">
                  <span
                    class="d-flex align-center"
                  >
                    <v-icon
                      size="15"
                      class="me-2"
                    >
                      mdi-information-outline
                    </v-icon>
                    目標角色 : {{ currentRoleName }}
                  </span>
                </div>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="copyForm.sourceRoleId"
                  :items="availableRoles"
                  item-title="name"
                  item-value="_id"
                  label="*選擇來源角色"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :rules="[v => !!v || '請選擇來源角色']"
                  :disabled="copySubmitting"
                />
              </v-col>

              <v-col
                cols="12"
                class="px-2 py-0 copy-role-checkbox"
              >
                <v-checkbox
                  v-model="copyForm.replaceExisting"
                  label="覆蓋當前角色的現有權限"
                  hide-details
                  color="blue-grey-darken-1"
                  density="compact"
                  :disabled="copySubmitting"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                @click="closeCopyDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="blue-grey-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :loading="copySubmitting"
              >
                確認複製
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import { useSnackbar } from 'vuetify-use-dialog'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  permissions: {
    type: Array,
    default: () => []
  },
  submitting: {
    type: Boolean,
    default: false
  },
  currentRole: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save', 'copy'])

// Store 和工具
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()

// 複製權限相關
const copyDialog = ref({ open: false })
const copyFormRef = ref(null)
const copyFormValid = ref(false)
const copySubmitting = ref(false)
const copyForm = ref({
  sourceRoleId: '',
  replaceExisting: false
})
const allRoles = ref([])

// 權限模組配置
const permissionModules = ref([
  {
    key: 'home',
    name: '首頁',
    icon: 'mdi-home',
    pagePermission: 'HOME_READ',
    features: [
      {
        key: 'BackgroundImageUsageStatsDialog.vueImageRead',
        name: '查看背景使用統計',
        permission: 'SYSTEM_BACKGROUND_IMAGE_READ'
      }
    ]
  },
  { key: 'employeeList',
    name: '公司員工列表',
    icon: 'mdi-account-group',
    pagePermission: 'EMPLOYEE_LIST_READ',
    features: [
    ]
  },
  {
    key: 'projectAndTaskManagement',
    name: '專案與任務管理',
    icon: 'mdi-chart-box-outline',
    pagePermission: 'PROJECT_AND_TASK_MANAGEMENT_READ',
    features: [
      // { key: 'teamRead', name: '查看團隊', permission: 'TEAM_READ' },
      { key: 'teamCreate', name: '新增團隊', permission: 'TEAM_CREATE' },
      { key: 'projectAndTaskManage', name: '管理專案與任務', permission: 'PROJECT_AND_TASK_MANAGE' },
      // { key: 'teamUpdate', name: '編輯團隊', permission: 'TEAM_UPDATE' },
      // { key: 'teamDelete', name: '刪除團隊', permission: 'TEAM_DELETE' },
      // { key: 'projectRead', name: '查看專案', permission: 'PROJECT_READ' },
      // { key: 'projectCreate', name: '新增專案', permission: 'PROJECT_CREATE' },
      // { key: 'projectUpdate', name: '編輯專案', permission: 'PROJECT_UPDATE' },
      // { key: 'projectDelete', name: '刪除專案', permission: 'PROJECT_DELETE' },
      // { key: 'taskRead', name: '查看任務', permission: 'TASK_READ' },
      // { key: 'taskCreate', name: '新增任務', permission: 'TASK_CREATE' },
      // { key: 'taskUpdate', name: '編輯任務', permission: 'TASK_UPDATE' },
      // { key: 'taskDelete', name: '刪除任務', permission: 'TASK_DELETE' },
      // { key: 'taskAssign', name: '指派任務', permission: 'TASK_ASSIGN' },
      // { key: 'taskComplete', name: '完成任務', permission: 'TASK_COMPLETE' },
      // { key: 'taskCancel', name: '取消任務', permission: 'TASK_CANCEL' }
    ]
  },
  {
    key: 'marketingAnalysis',
    name: '行銷費用分析',
    icon: 'mdi-chart-multiple',
    pagePermission: 'MARKETING_ANALYSIS_READ',
    features: [
    ]
  },
  {
    key: 'marketingExpenseManagement',
    name: '實際支出管理',
    icon: 'mdi-cash-100',
    pagePermission: 'MARKETING_EXPENSE_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看實際支出', permission: 'MARKETING_EXPENSE_READ' },
      { key: 'create', name: '新增實際支出', permission: 'MARKETING_EXPENSE_CREATE' },
      { key: 'update', name: '編輯實際支出', permission: 'MARKETING_EXPENSE_UPDATE' },
      { key: 'delete', name: '刪除實際支出', permission: 'MARKETING_EXPENSE_DELETE' },
    ]
  },
  {
    key: 'marketingBudgetManagement',
    name: '行銷預算管理',
    icon: 'mdi-table-edit',
    pagePermission: 'MARKETING_BUDGET_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看行銷預算', permission: 'MARKETING_BUDGET_READ' },
      { key: 'create', name: '新增行銷預算', permission: 'MARKETING_BUDGET_CREATE' },
      { key: 'update', name: '編輯行銷預算', permission: 'MARKETING_BUDGET_UPDATE' },
      { key: 'delete', name: '刪除行銷預算', permission: 'MARKETING_BUDGET_DELETE' },
    ]
  },
  {
    key: 'marketingCategoryManagement',
    name: '行銷分類管理',
    icon: 'mdi-shape-plus-outline',
    pagePermission: 'MARKETING_CATEGORY_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看行銷分類', permission: 'MARKETING_CATEGORY_READ' },
      { key: 'create', name: '新增行銷分類', permission: 'MARKETING_CATEGORY_CREATE' },
      { key: 'update', name: '編輯行銷分類', permission: 'MARKETING_CATEGORY_UPDATE' },
      { key: 'delete', name: '刪除行銷分類', permission: 'MARKETING_CATEGORY_DELETE' },
    ]
  },
  {
    key: 'employeeManagement',
    name: '員工管理',
    icon: 'mdi-account-group',
    pagePermission: 'EMPLOYEE_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看員工', permission: 'EMPLOYEE_READ' },
      { key: 'create', name: '新增員工', permission: 'EMPLOYEE_CREATE' },
      { key: 'update', name: '編輯員工', permission: 'EMPLOYEE_UPDATE' },
      { key: 'delete', name: '刪除員工', permission: 'EMPLOYEE_DELETE' },
      { key: 'export', name: '匯出員工資料', permission: 'EMPLOYEE_EXPORT' },
      { key: 'import', name: '匯入員工資料', permission: 'EMPLOYEE_IMPORT' },
    ]
  },
  {
    key: 'companyAndDepartmentManagement',
    name: '公司部門管理',
    icon: 'mdi-office-building-cog',
    pagePermission: 'COMPANY_AND_DEPARTMENT_MANAGEMENT_READ',
    features: [
      { key: 'companyRead', name: '查看公司', permission: 'COMPANY_READ' },
      { key: 'companyCreate', name: '新增公司', permission: 'COMPANY_CREATE' },
      { key: 'companyUpdate', name: '修改公司', permission: 'COMPANY_UPDATE' },
      { key: 'companyDelete', name: '刪除公司', permission: 'COMPANY_DELETE' },
      { key: 'departmentRead', name: '查看部門', permission: 'DEPARTMENT_READ' },
      { key: 'departmentCreate', name: '新增部門', permission: 'DEPARTMENT_CREATE' },
      { key: 'departmentUpdate', name: '修改部門', permission: 'DEPARTMENT_UPDATE' },
      { key: 'departmentDelete', name: '刪除部門', permission: 'DEPARTMENT_DELETE' },
      { key: 'locationCreate', name: '新增公司地點', permission: 'COMPANY_LOCATION_CREATE' },
      { key: 'locationUpdate', name: '修改公司地點', permission: 'COMPANY_LOCATION_UPDATE' },
      { key: 'locationDelete', name: '刪除公司地點', permission: 'COMPANY_LOCATION_DELETE' }
    ]
  },
  {
    key: 'formGenerator',
    name: '表單產生器',
    icon: 'mdi-list-box-outline',
    pagePermission: 'FORM_GENERATOR_READ',
    features: [
    ]
  },
  {
    key: 'lineCategoryManagement',
    name: '線別分類管理',
    icon: 'mdi-shape-plus-outline',
    pagePermission: 'LINE_CATEGORY_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看線別分類', permission: 'LINE_CATEGORY_READ' },
      { key: 'create', name: '新增線別分類', permission: 'LINE_CATEGORY_CREATE' },
      { key: 'update', name: '編輯線別分類', permission: 'LINE_CATEGORY_UPDATE' },
      { key: 'delete', name: '刪除線別分類', permission: 'LINE_CATEGORY_DELETE' },
    ]
  },
  {
    key: 'b2CStatisticsManagement',
    name: '直客詢問管理',
    icon: 'mdi-account-question',
    pagePermission: 'B2C_STATISTICS_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看直客詢問', permission: 'CUSTOMER_INQUIRY_READ' },
      { key: 'create', name: '新增直客詢問', permission: 'CUSTOMER_INQUIRY_CREATE' },
      { key: 'update', name: '編輯直客詢問', permission: 'CUSTOMER_INQUIRY_UPDATE' },
      { key: 'delete', name: '刪除直客詢問', permission: 'CUSTOMER_INQUIRY_DELETE' },
      { key: 'export', name: '匯出直客詢問', permission: 'CUSTOMER_INQUIRY_EXPORT' },
      { key: 'import', name: '匯入直客詢問', permission: 'CUSTOMER_INQUIRY_IMPORT' },
    ]
  },
  {
    key: 'marketingDesignRequestManagement',
    name: '行銷美編需求申請管理',
    icon: 'mdi-form-select',
    pagePermission: 'MARKETING_DESIGN_REQUEST_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看行美申請', permission: 'MARKETING_DESIGN_REQUEST_READ' },
      { key: 'update', name: '編輯行美申請', permission: 'MARKETING_DESIGN_REQUEST_UPDATE' },
    ]
  },
  {
    key: 'hardwareDeviceManagement',
    name: '硬體設備管理',
    icon: 'mdi-server-outline',
    pagePermission: 'HARDWARE_DEVICE_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看硬體設備', permission: 'HARDWARE_DEVICE_READ' },
      { key: 'create', name: '新增硬體設備', permission: 'HARDWARE_DEVICE_CREATE' },
      { key: 'update', name: '編輯硬體設備', permission: 'HARDWARE_DEVICE_UPDATE' },
      { key: 'delete', name: '刪除硬體設備', permission: 'HARDWARE_DEVICE_DELETE' },
      { key: 'export', name: '匯出硬體設備', permission: 'HARDWARE_DEVICE_EXPORT' },
      { key: 'import', name: '匯入硬體設備', permission: 'HARDWARE_DEVICE_IMPORT' },
    ]
  },
  {
    key: 'hardwareMaintenanceRecord',
    name: '硬體維修記錄',
    icon: 'mdi-wrench',
    pagePermission: 'HARDWARE_MAINTENANCE_RECORD_PAGE_READ',
    features: [
      { key: 'read', name: '查看硬修記錄', permission: 'HARDWARE_MAINTENANCE_RECORD_READ' },
      { key: 'create', name: '新增維修記錄', permission: 'HARDWARE_MAINTENANCE_RECORD_CREATE' },
      { key: 'update', name: '編輯維修記錄', permission: 'HARDWARE_MAINTENANCE_RECORD_UPDATE' },
      { key: 'delete', name: '刪除維修記錄', permission: 'HARDWARE_MAINTENANCE_RECORD_DELETE' },
      { key: 'export', name: '匯出維修記錄', permission: 'HARDWARE_MAINTENANCE_RECORD_EXPORT' },
    ]
  },
  {
    key: 'hardwareCategoryManagement',
    name: '硬體類型管理',
    icon: 'mdi-shape-plus-outline',
    pagePermission: 'HARDWARE_CATEGORY_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看硬體類型', permission: 'HARDWARE_CATEGORY_READ' },
      { key: 'create', name: '新增硬體類型', permission: 'HARDWARE_CATEGORY_CREATE' },
      { key: 'update', name: '編輯硬體類型', permission: 'HARDWARE_CATEGORY_UPDATE' },
      { key: 'delete', name: '刪除硬體類型', permission: 'HARDWARE_CATEGORY_DELETE' },
    ]
  },
  {
    key: 'userManagement',
    name: '用戶管理',
    icon: 'mdi-account-multiple',
    pagePermission: 'USER_MANAGEMENT_READ',
    features: [
      { key: 'read', name: '查看用戶', permission: 'SYSTEM_USER_READ' },
      { key: 'create', name: '新增用戶', permission: 'SYSTEM_USER_CREATE' },
      { key: 'update', name: '編輯用戶', permission: 'SYSTEM_USER_UPDATE' },
      { key: 'delete', name: '刪除用戶', permission: 'SYSTEM_USER_DELETE' },
    ]
  },
  {
    key: 'permissionManagement',
    name: '權限管理',
    icon: 'mdi-shield-account',
    pagePermission: 'PERMISSION_MANAGEMENT_READ',
    features: [
      { key: 'permissionRead', name: '查看權限', permission: 'SYSTEM_PERMISSION_READ' },
      { key: 'permissionCreate', name: '新增權限', permission: 'SYSTEM_PERMISSION_CREATE' },
      { key: 'permissionUpdate', name: '編輯權限', permission: 'SYSTEM_PERMISSION_UPDATE' },
      { key: 'permissionDelete', name: '刪除權限', permission: 'SYSTEM_PERMISSION_DELETE' },
      { key: 'roleRead', name: '查看角色', permission: 'SYSTEM_ROLE_READ' },
      { key: 'roleCreate', name: '新增角色', permission: 'SYSTEM_ROLE_CREATE' },
      { key: 'roleUpdate', name: '編輯角色', permission: 'SYSTEM_ROLE_UPDATE' },
      { key: 'roleDelete', name: '刪除角色', permission: 'SYSTEM_ROLE_DELETE' },
    ]
  },
  {
    key: 'auditLog',
    name: '異動紀錄',
    icon: 'mdi-history',
    pagePermission: 'AUDIT_LOG_PAGE_READ',
    features: [
      { key: 'read', name: '查看異動紀錄', permission: 'AUDIT_LOG_READ' },
      { key: 'delete', name: '刪除異動紀錄', permission: 'AUDIT_LOG_DELETE' },
    ]
  }
])

// 模組權限狀態
const modulePermissions = ref({})

// 計算屬性
const currentRoleName = computed(() => {
  return props.currentRole?.name || '當前角色'
})

const availableRoles = computed(() => {
  if (!props.currentRole) return allRoles.value
  return allRoles.value.filter(role => role._id !== props.currentRole._id)
})

// 初始化模組權限狀態
const initializeModulePermissions = () => {
  const permissions = {}
  permissionModules.value.forEach(module => {
    permissions[module.key] = {
      pageAccess: false,
      ...module.features.reduce((acc, feature) => {
        acc[feature.key] = false
        return acc
      }, {})
    }
  })
  modulePermissions.value = permissions
}

// 載入當前權限
const loadCurrentPermissions = () => {
  if (!props.permissions || props.permissions.length === 0) {
    initializeModulePermissions()
    return
  }

  // 初始化所有模組狀態
  initializeModulePermissions()

  // 檢查頁面權限
  permissionModules.value.forEach(module => {
    const hasPagePermission = props.permissions.some(p => p.code === module.pagePermission)
    modulePermissions.value[module.key].pageAccess = hasPagePermission

    // 檢查功能權限
    module.features.forEach(feature => {
      const hasFeaturePermission = props.permissions.some(p => p.code === feature.permission)
      modulePermissions.value[module.key][feature.key] = hasFeaturePermission
    })
  })
}

// 處理頁面權限切換
const handlePageAccessToggle = (moduleKey) => {
  const module = permissionModules.value.find(m => m.key === moduleKey)
  if (!module) return

  // 如果關閉頁面權限，清空所有功能權限
  if (!modulePermissions.value[moduleKey].pageAccess) {
    module.features.forEach(feature => {
      modulePermissions.value[moduleKey][feature.key] = false
    })
  }
}

// 儲存權限
const savePermissions = () => {
  const selectedPermissions = []

  permissionModules.value.forEach(module => {
    // 如果頁面權限開啟，加入頁面權限
    if (modulePermissions.value[module.key].pageAccess) {
      selectedPermissions.push(module.pagePermission)
    }

    // 加入選中的功能權限
    module.features.forEach(feature => {
      if (modulePermissions.value[module.key][feature.key]) {
        selectedPermissions.push(feature.permission)
      }
    })
  })

  emit('save', selectedPermissions)
}

// 關閉對話框
const closeDialog = () => {
  emit('update:modelValue', false)
}

// 重製權限
const resetPermissions = () => {
  // 初始化所有模組權限為 false
  initializeModulePermissions()
  
  createSnackbar({
    text: '權限已重置',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 全選/全不選模組功能權限
const selectAllModuleFeatures = (moduleKey) => {
  const module = permissionModules.value.find(m => m.key === moduleKey)
  if (!module || !module.features || module.features.length === 0) return

  // 檢查是否已經全選功能權限
  const isAllFeaturesSelected = module.features.every(feature => 
    modulePermissions.value[moduleKey][feature.key]
  )

  if (isAllFeaturesSelected) {
    // 如果已全選，則全不選功能權限
    module.features.forEach(feature => {
      modulePermissions.value[moduleKey][feature.key] = false
    })
    createSnackbar({
      text: `已取消 ${module.name} 的所有功能權限`,
      snackbarProps: { color: 'orange-darken-2' }
    })
  } else {
    // 如果未全選，則全選功能權限
    module.features.forEach(feature => {
      modulePermissions.value[moduleKey][feature.key] = true
    })
    createSnackbar({
      text: `已全選 ${module.name} 的所有功能權限`,
      snackbarProps: { color: 'teal-lighten-1' }
    })
  }
}

// 複製權限相關方法
const openCopyDialog = async () => {
  try {
    // 載入所有角色
    const roles = await permissionStore.getAllRoles()
    allRoles.value = roles
    copyDialog.value.open = true
    copyForm.value = {
      sourceRoleId: '',
      replaceExisting: false
    }
  } catch {
    createSnackbar({
      text: '載入角色失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

const closeCopyDialog = () => {
  copyDialog.value.open = false
  copyForm.value = {
    sourceRoleId: '',
    replaceExisting: false
  }
}

const copyPermissions = async () => {
  if (!copyFormValid.value) return

  copySubmitting.value = true
  try {
    const sourceRoleId = copyForm.value.sourceRoleId
    const replaceExisting = copyForm.value.replaceExisting

    // 獲取來源角色
    const sourceRole = allRoles.value.find(r => r._id === sourceRoleId)
    if (!sourceRole) {
      throw new Error('來源角色不存在')
    }

    // 獲取來源角色的權限ID陣列
    const sourcePermissionIds = sourceRole.permissions?.map(p => p._id || p) || []

    // 準備更新數據
    const updateData = {
      permissions: sourcePermissionIds
    }

    // 如果選擇覆蓋現有權限，直接更新
    if (replaceExisting) {
      await permissionStore.updateRole(props.currentRole._id, updateData)
    } else {
      // 如果不覆蓋，需要合併現有權限
      const existingPermissionIds = props.currentRole?.permissions?.map(p => p._id || p) || []
      
      // 合併權限（去重）
      const mergedPermissionIds = [...new Set([...existingPermissionIds, ...sourcePermissionIds])]
      
      updateData.permissions = mergedPermissionIds
      await permissionStore.updateRole(props.currentRole._id, updateData)
    }

    createSnackbar({
      text: `權限複製成功：${sourceRole.name} → ${props.currentRole.name}`,
      snackbarProps: { color: 'teal' }
    })

    // 發送複製事件，讓父組件重新載入權限
    emit('copy', sourcePermissionIds)
    closeCopyDialog()
  } catch (error) {
    createSnackbar({
      text: error.message || '複製權限失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    copySubmitting.value = false
  }
}

// 監聽權限變化
watch(() => props.permissions, () => {
  loadCurrentPermissions()
}, { immediate: true })

// 監聽對話框開啟
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadCurrentPermissions()
  }
})
</script>

<style lang="scss" scoped>
.role-alert-title {
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid #78909C;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #455A64;
}
.copy-role-checkbox{
  .v-checkbox{
    font-size: 13px !important;
  }
  .v-checkbox:deep(.v-label) {
    font-size: 15px !important;
  }
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  
  // 響應式設計
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.permission-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: fit-content;
  
  &:hover {
    border-color: #26a69a;
    box-shadow: 0 2px 8px rgba(38, 166, 154, 0.1);
  }
  
  &.has-features {
    min-height: 120px;
  }
  
  .card-title {
    font-weight: 500;
    color: #424242;
  }
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
}

.v-checkbox{
  font-size: 11px !important;
}

.feature-checkbox {
  margin: 0;
  flex: 1;
  min-width: 100px;
  max-width: calc(50% - 8px);
  height: 24px;
  
  &.feature-left {
    order: 1;
  }
  
  &.feature-right {
    order: 2;
  }
  :deep(.v-label) {
    font-size: 14px !important;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    order: unset !important;
  }
}

// 滾動條樣式
.permission-grid::-webkit-scrollbar {
  width: 6px;
}

.permission-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.permission-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  
  &:hover {
    background: #a8a8a8;
  }
}
</style>
