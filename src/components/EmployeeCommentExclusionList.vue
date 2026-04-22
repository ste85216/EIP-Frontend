<template>
  <div>
    <v-row class="pb-2">
      <v-col
        cols="12"
        md="6"
      >
        <v-btn
          prepend-icon="mdi-plus"
          color="teal-darken-1"
          variant="outlined"
          :size="buttonSize"
          @click="openAddDialog"
        >
          新增排除員工
        </v-btn>
      </v-col>
      <v-spacer />
    </v-row>

    <!-- 排除名單表格 -->
    <v-data-table
      :headers="tableHeaders"
      :items="exclusions"
      :loading="loading"
      hover
      density="compact"
      class="mt-4 rounded-ts-lg rounded-te-lg"
    >
      <template #item="{ item, index }">
        <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
          <td>{{ item.employee?.name || '-' }}</td>
          <td>{{ item.employee?.company?.name || '-' }}</td>
          <td>{{ item.employee?.department?.name || '-' }}</td>
          <td>{{ item.employee?.jobTitle || '-' }}</td>
          <td>{{ item.reason || '-' }}</td>
          <td class="text-center">
            <v-btn
              icon
              color="red-lighten-1"
              variant="plain"
              size="22"
              class="mx-2"
              :ripple="false"
              @click="openDeleteDialog(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- 新增排除員工對話框 -->
    <v-dialog
      v-model="addDialog"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
      :no-click-animation="submitting"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-account-remove
          </v-icon>
          <span class="card-title text-white">新增排除員工</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeAddDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="formRef"
            v-model="formValid"
          >
            <v-autocomplete
              v-model="formData.employeeId"
              :items="allEmployees"
              :item-title="getEmployeeTitle"
              item-value="_id"
              label="* 選擇員工"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || '請選擇員工']"
              required
              :loading="loadingEmployees"
              :filter="customFilter"
              clearable
            />
            <v-textarea
              v-model="formData.reason"
              label="排除原因（選填）"
              variant="outlined"
              density="compact"
              rows="2"
              class="mt-4"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-1">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeAddDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="submitting"
            :disabled="!formValid"
            @click="addExclusion"
          >
            新增
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteDialog.show"
      dialog-width="320"
      title="確認移除排除"
      :message="`確定要將員工「<span class='text-red'>${deleteDialog.employeeName}</span>」從排除名單移除嗎？`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="移除"
      cancel-button-text="取消"
      @confirm="handleDeleteExclusion"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

const emit = defineEmits(['refresh'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()

const exclusions = ref([])
const allEmployees = ref([])
const loading = ref(false)
const loadingEmployees = ref(false)
const addDialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const submitting = ref(false)
const deleteDialog = ref({
  show: false,
  id: null,
  employeeName: ''
})

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '500' : '100%')

const formData = reactive({
  employeeId: null,
  reason: ''
})

const tableHeaders = [
  { title: '姓名', key: 'employee.name', sortable: true },
  { title: '公司', key: 'employee.company.name', sortable: false },
  { title: '部門', key: 'employee.department.name', sortable: false },
  { title: '職稱', key: 'employee.jobTitle', sortable: false },
  { title: '排除原因', key: 'reason', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const fetchExclusions = async () => {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/employee-comments/exclusions')
    if (data.success) {
      exclusions.value = data.result
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得排除名單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

const fetchAllEmployees = async () => {
  loadingEmployees.value = true
  try {
    // 取得所有員工（不分頁）
    const { data } = await apiAuth.get('/employees/all', {
      params: {
        itemsPerPage: -1,
        status: '在職' // 只取得在職員工
      }
    })
    if (data.success) {
      const employees = data.result.data || data.result || []

      // 去重：確保每個員工 ID 只出現一次，並過濾掉無效的員工
      const uniqueEmployeesMap = new Map()
      for (const employee of employees) {
        // 確保員工有有效的 _id
        if (employee && employee._id) {
          const idStr = employee._id.toString()
          // 如果這個 ID 還沒出現過，或者當前員工的資料更完整，則更新
          if (!uniqueEmployeesMap.has(idStr)) {
            uniqueEmployeesMap.set(idStr, employee)
          }
        }
      }
      const uniqueEmployees = Array.from(uniqueEmployeesMap.values())

      // 依姓名排序
      uniqueEmployees.sort((a, b) => {
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB, 'zh-TW')
      })
      allEmployees.value = uniqueEmployees
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得員工列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingEmployees.value = false
  }
}

const getEmployeeTitle = (item) => {
  if (!item) return ''
  const companyName = item.company?.name || ''
  const departmentName = item.department?.name || ''
  const extNumber = item.extNumber || ''
  if (extNumber) {
    return `${item.name} (${extNumber}) - ${companyName} - ${departmentName}`
  }
  return `${item.name} - ${companyName} - ${departmentName}`
}

const customFilter = (item, queryText) => {
  if (!queryText) return true

  const textToSearch = queryText.toLowerCase().trim()
  if (!textToSearch) return true

  const raw = item.raw || item
  if (!raw) return false

  const name = raw?.name || ''
  const extNumber = raw?.extNumber || ''
  const companyName = raw?.company?.name || ''
  const departmentName = raw?.department?.name || ''
  const employeeCode = raw?.employeeCode || ''

  const searchText = `${name} ${extNumber} ${companyName} ${departmentName} ${employeeCode}`.toLowerCase()
  return searchText.includes(textToSearch)
}

const openAddDialog = async () => {
  addDialog.value = true
  if (allEmployees.value.length === 0) {
    await fetchAllEmployees()
  }
}

const closeAddDialog = () => {
  addDialog.value = false
  formData.employeeId = null
  formData.reason = ''
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const addExclusion = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    const { data } = await apiAuth.post('/employee-comments/exclusions', {
      employeeId: formData.employeeId,
      reason: formData.reason || ''
    })

    if (data.success) {
      createSnackbar({
        text: '已加入排除名單',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchExclusions()
      emit('refresh')
      closeAddDialog()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '新增失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

const openDeleteDialog = (item) => {
  deleteDialog.value = {
    show: true,
    id: item._id,
    employeeName: item.employee?.name || '未知員工'
  }
}

const handleDeleteExclusion = async () => {
  const id = deleteDialog.value.id
  if (!id) return

  try {
    const { data } = await apiAuth.delete(`/employee-comments/exclusions/${id}`)
    if (data.success) {
      createSnackbar({
        text: '已移除排除名單',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      deleteDialog.value = { show: false, id: null, employeeName: '' }
      await fetchExclusions()
      emit('refresh')
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '移除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

onMounted(() => {
  fetchExclusions()
})
</script>

<style lang="scss" scoped>
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
  }
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
