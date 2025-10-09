<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1700"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="rounded-lg">
      <div class="d-flex align-center justify-space-between px-6 py-4 bg-teal-darken-1 text-white">
        <div class="d-flex align-center">
          <v-icon class="me-2">
            mdi-shield-account
          </v-icon>
          選擇權限
        </div>
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

      <v-card-text class="px-6 pt-6">
        <v-row>
          <!-- 動態生成模組卡片 -->
          <v-col
            v-for="module in permissionModules"
            :key="module.key"
            cols="12"
            md="3"
          >
            <v-card
              elevation="0"
              class="permission-card"
            >
              <v-card-title class="d-flex align-center px-6 pt-1">
                <span class="card-title">{{ module.name }}</span>
                <v-spacer />
                <v-switch
                  v-model="modulePermissions[module.key].pageAccess"
                  color="teal"
                  density="compact"
                  hide-details
                  @change="handlePageAccessToggle(module.key)"
                />
              </v-card-title>
              <v-card-text v-if="modulePermissions[module.key].pageAccess && module.features && module.features.length > 0">
                <v-row>
                  <v-col
                    v-for="feature in module.features"
                    :key="feature.key"
                    cols="6"
                    class="py-0 px-4"
                  >
                    <v-checkbox
                      v-model="modulePermissions[module.key][feature.key]"
                      :label="feature.name"
                      color="teal"
                      hide-details
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

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
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'save'])

// 權限模組配置
const permissionModules = ref([
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
      { key: 'teamRead', name: '查看團隊', permission: 'TEAM_READ' },
      { key: 'teamCreate', name: '新增團隊', permission: 'TEAM_CREATE' },
      { key: 'teamUpdate', name: '編輯團隊', permission: 'TEAM_UPDATE' },
      { key: 'teamDelete', name: '刪除團隊', permission: 'TEAM_DELETE' },
      { key: 'projectRead', name: '查看專案', permission: 'PROJECT_READ' },
      { key: 'projectCreate', name: '新增專案', permission: 'PROJECT_CREATE' },
      { key: 'projectUpdate', name: '編輯專案', permission: 'PROJECT_UPDATE' },
      { key: 'projectDelete', name: '刪除專案', permission: 'PROJECT_DELETE' },
      { key: 'taskRead', name: '查看任務', permission: 'TASK_READ' },
      { key: 'taskCreate', name: '新增任務', permission: 'TASK_CREATE' },
      { key: 'taskUpdate', name: '編輯任務', permission: 'TASK_UPDATE' },
      { key: 'taskDelete', name: '刪除任務', permission: 'TASK_DELETE' },
      { key: 'taskAssign', name: '指派任務', permission: 'TASK_ASSIGN' },
      { key: 'taskComplete', name: '完成任務', permission: 'TASK_COMPLETE' },
      { key: 'taskCancel', name: '取消任務', permission: 'TASK_CANCEL' }
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
      { key: 'read', name: '查看行銷實際支出', permission: 'EXPENSE_READ' },
      { key: 'create', name: '新增行銷實際支出', permission: 'EXPENSE_CREATE' },
      { key: 'update', name: '編輯行銷實際支出', permission: 'EXPENSE_UPDATE' },
      { key: 'delete', name: '刪除行銷實際支出', permission: 'EXPENSE_DELETE' },
    ]
  },
  {
    key: 'marketingBudgetManagement',
    name: '行銷預算管理',
    icon: 'mdi-table-edit',
    pagePermission: 'MARKETING_BUDGET_MANAGEMENT_READ',
    features: [
    ]
  },
  {
    key: 'marketingCategoryManagement',
    name: '行銷分類管理',
    icon: 'mdi-shape-plus-outline',
    pagePermission: 'MARKETING_CATEGORY_MANAGEMENT_READ',
    features: [
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
      { key: 'departmentDelete', name: '刪除部門', permission: 'DEPARTMENT_DELETE' }
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
    ]
  },
  {
    key: 'b2CStatisticsManagement',
    name: '直客詢問管理',
    icon: 'mdi-account-question',
    pagePermission: 'B2C_STATISTICS_MANAGEMENT_READ',
    features: [
    ]
  },
  {
    key: 'marketingDesignRequestManagement',
    name: '行銷美編需求申請管理',
    icon: 'mdi-form-select',
    pagePermission: 'MARKETING_DESIGN_REQUEST_MANAGEMENT_READ',
    features: [
    ]
  },
  {
    key: 'hardwareDeviceManagement',
    name: '硬體設備管理',
    icon: 'mdi-server-outline',
    pagePermission: 'HARDWARE_DEVICE_MANAGEMENT_READ',
    features: [
    ]
  },
  {
    key: 'hardwareMaintenanceRecord',
    name: '硬體維修記錄',
    icon: 'mdi-wrench',
    pagePermission: 'HARDWARE_MAINTENANCE_RECORD_READ',
    features: [
    ]
  },
  {
    key: 'hardwareCategoryManagement',
    name: '硬體類型管理',
    icon: 'mdi-shape-plus-outline',
    pagePermission: 'HARDWARE_CATEGORY_MANAGEMENT_READ',
    features: [
    ]
  },
  {
    key: 'auditLog',
    name: '異動紀錄',
    icon: 'mdi-history',
    pagePermission: 'AUDIT_LOG_READ',
    features: [
    ]
  }
])

// 模組權限狀態
const modulePermissions = ref({})

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
.permission-card {
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
