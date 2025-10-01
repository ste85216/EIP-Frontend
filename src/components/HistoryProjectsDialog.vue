<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="1200"
    scrollable
  >
    <v-card class="rounded-lg">
      <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
        <v-icon
          size="20"
          color="white"
          class="me-2"
        >
          mdi-history
        </v-icon>
        歷史專案
        <v-spacer />
        <v-btn
          icon
          color="white"
          variant="plain"
          class="opacity-100"
          :ripple="false"
          size="20"
          @click="closeDialog"
        >
          <v-icon size="20">
            mdi-close
          </v-icon>
        </v-btn>
      </div>

      <v-card-text class="pa-0">
        <!-- 搜尋欄位 -->
        <div class="px-6 py-6">
          <v-text-field
            v-model="searchQuery"
            placeholder="搜尋歷史專案名稱..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="search-field"
            @click:clear="searchQuery = ''"
          />
        </div>

        <!-- 專案列表 -->
        <div class="px-6 pb-4">
          <v-data-table
            :headers="headers"
            :items="filteredProjects"
            :loading="loading"
            hover
            density="compact"
            item-key="_id"
            :items-per-page="25"
            :items-per-page-options="[10, 25, 50, 100, -1]"
            class="history-projects-table"
          >
            <template #item="{ item }">
              <tr>
                <!-- 專案名稱 -->
                <td>
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="item.iconColor ? 'mdi-square-rounded' : 'mdi-square-rounded-outline'"
                      class="me-2"
                      :color="item.iconColor || 'grey-darken-1'"
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

                <!-- 完成日期 -->
                <td>
                  {{ formatDate(item.updatedAt) }}
                </td>

                <!-- 建立日期 -->
                <td>
                  {{ formatDate(item.createdAt) }}
                </td>
              </tr>
            </template>

            <!-- 無資料時顯示 -->
            <template #no-data>
              <div class="text-center py-8">
                <v-icon
                  size="64"
                  color="grey-lighten-1"
                >
                  {{ searchQuery ? 'mdi-magnify' : 'mdi-folder-outline' }}
                </v-icon>
                <p class="text-body-1 text-medium-emphasis mt-2">
                  {{ searchQuery ? '找不到符合搜尋條件的歷史專案' : '尚無歷史專案' }}
                </p>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="closeDialog"
        >
          關閉
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  teamId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Composables
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 響應式數據
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const projects = ref([])
const loading = ref(false)
const searchQuery = ref('')

// 表格標題
const headers = [
  { title: '專案名稱', key: 'name', sortable: true },
  { title: '所屬團隊', key: 'team', sortable: true },
  { title: '完成日期', key: 'updatedAt', sortable: true },
  { title: '建立日期', key: 'createdAt', sortable: true }
]

// 根據搜尋條件過濾專案
const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) {
    return projects.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return projects.value.filter(project =>
    project.name.toLowerCase().includes(query)
  )
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

// 載入歷史專案
const fetchHistoryProjects = async () => {
  try {
    loading.value = true
    console.log('🔍 載入歷史專案，teamId:', props.teamId)

    // 構建查詢參數
    const params = new URLSearchParams()
    if (props.teamId && props.teamId !== 'null' && props.teamId !== 'undefined') {
      params.append('teamId', props.teamId)
    }

    const endpoint = params.toString()
      ? `/projects/history?${params.toString()}`
      : '/projects/history'

    console.log('🔍 API 端點:', endpoint)

    const { data } = await apiAuth.get(endpoint)
    if (data.success) {
      projects.value = data.data
      console.log('🔍 載入的歷史專案數量:', data.data.length)
    }
  } catch (error) {
    console.error('載入歷史專案失敗:', error)
    createSnackbar({
      text: '載入歷史專案失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
  searchQuery.value = ''
}

// 監聽對話框開啟狀態
watch(dialog, (newValue) => {
  if (newValue) {
    fetchHistoryProjects()
  }
})
</script>

<style lang="scss" scoped>
.history-projects-table {
  :deep(thead) {
    height: 48px !important;
  }
  :deep(th:first-child) {
    border-radius: 4px 0 0px 0px;
  }
  :deep(th:last-child) {
    border-radius: 0px 4px 0px 0px;
  }
  :deep(th) {
    background-color: #777;
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
    border-radius: 0px 0px 4px 4px;
    margin-top: 0px;
    padding: 16px 12px;
  }
}

.search-field {
  margin-left: auto;
  max-width: 240px;
}

.project-name-link {
  transition: text-decoration 0.2s ease;
}

.project-name-link:hover {
  text-decoration: underline !important;
}
</style>
