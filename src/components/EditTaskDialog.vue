<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    persistent
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center">
        <v-icon
          class="me-2"
          color="primary"
        >
          mdi-pencil
        </v-icon>
        編輯任務
      </v-card-title>

      <v-card-text>
        <v-form
          ref="form"
          @submit.prevent="saveTask"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="taskData.name"
                label="任務名稱"
                variant="outlined"
                :rules="[v => !!v || '請輸入任務名稱']"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="taskData.description"
                label="任務描述"
                variant="outlined"
                rows="3"
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="taskData.assignee"
                label="指派對象"
                variant="outlined"
                :items="project?.team?.members || []"
                item-title="name"
                item-value="_id"
                :rules="[v => !!v || '請選擇指派對象']"
                required
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="taskData.category"
                label="任務分類"
                variant="outlined"
                :items="categoryOptions"
                item-title="name"
                item-value="name"
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="taskData.dueDate"
                label="截止日期"
                type="date"
                variant="outlined"
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="taskData.collaborators"
                label="協作者"
                variant="outlined"
                :items="project?.team?.members || []"
                item-title="name"
                item-value="_id"
                multiple
                chips
              />
            </v-col>

            <v-col cols="12">
              <label class="text-body-2 font-weight-medium mb-2 d-block">詳細描述</label>
              <RichTextEditor
                v-model="taskData.detailedDescription"
                placeholder="請輸入詳細描述..."
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="saveTask"
        >
          儲存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import RichTextEditor from '@/components/RichTextEditor.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  },
  project: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'task-updated'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 響應式變數
const form = ref(null)
const saving = ref(false)
const taskData = ref({
  name: '',
  description: '',
  detailedDescription: '',
  assignee: null,
  collaborators: [],
  dueDate: '',
  category: ''
})

// 計算屬性
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 任務分類選項
const categoryOptions = computed(() => {
  if (!props.project?.taskCategories) return []
  return props.project.taskCategories.map(cat => ({
    name: cat.name,
    value: cat.name
  }))
})

// 監聽任務變化，初始化表單資料
watch(() => props.task, (newTask) => {
  if (newTask) {
    taskData.value = {
      name: newTask.name || '',
      description: newTask.description || '',
      detailedDescription: newTask.detailedDescription || '',
      assignee: newTask.assignee?._id || null,
      collaborators: newTask.collaborators?.map(c => c._id) || [],
      dueDate: newTask.dueDate ? newTask.dueDate.split('T')[0] : '',
      category: newTask.category || ''
    }
  }
}, { immediate: true })

// 儲存任務
const saveTask = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    saving.value = true

    const { data } = await apiAuth.put(`/tasks/${props.task._id}`, {
      name: taskData.value.name,
      description: taskData.value.description,
      detailedDescription: taskData.value.detailedDescription,
      assignee: taskData.value.assignee,
      collaborators: taskData.value.collaborators,
      dueDate: taskData.value.dueDate || null,
      category: taskData.value.category || null
    })

    if (data.success) {
      emit('task-updated', data.data)
      closeDialog()
      createSnackbar({
        text: '任務更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    saving.value = false
  }
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
