<template>
  <v-container max-width="2100">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 返回按鈕 -->
      <v-col
        cols="12"
        class="py-0"
      >
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          :size="smAndUp ? 'default' : 'small'"
          color="blue-grey-darken-2"
          class="px-2"
          @click="goBack"
        >
          返回講座列表
        </v-btn>
      </v-col>

      <!-- 載入中 -->
      <v-col
        v-if="loading"
        cols="12"
        class="text-center py-10"
      >
        <v-progress-circular
          indeterminate
          color="blue-grey-darken-2"
          size="60"
          width="6"
        />
        <div class="mt-4 text-grey-darken-1">
          載入中...
        </div>
      </v-col>

      <!-- 講座活動內容 -->
      <template v-else-if="lectureEventData.lectureName">
        <!-- 標題區 -->
        <v-col
          cols="12"
          class="pb-0"
        >
          <div class="mb-2 d-flex align-center">
            <div class="lecture-title">
              {{ lectureEventData.lectureName }}
            </div>
            <v-btn
              icon
              variant="text"
              size="32"
              color="blue-grey-darken-2"
              class="ms-2"
              aria-label="查看活動簡介"
              @click="activityIntroductionDialog.show = true"
            >
              <v-icon size="20">
                mdi-text-box-search-outline
              </v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- 資訊區 -->
        <v-col cols="12">
          <v-card
            class="info-card elevation-0"
          >
            <v-card-text class="px-4 py-3">
              <v-row dense>
                <v-col
                  cols="6"
                  sm="6"
                  md="3"
                >
                  <div class="info-label d-flex align-center">
                    <v-icon
                      size="14"
                      class="me-1"
                      color="blue-darken-1"
                    >
                      mdi-calendar
                    </v-icon>活動時間
                  </div>
                  <div class="info-value">
                    <div v-if="lectureEventData.eventDateTime">
                      {{ formatDateTime(lectureEventData.eventDateTime) }}
                    </div>
                    <span v-else>-</span>
                  </div>
                </v-col>
                <v-col
                  cols="6"
                  sm="6"
                  md="3"
                >
                  <div class="info-label d-flex align-center">
                    <v-icon
                      size="14"
                      class="me-1"
                      color="teal"
                    >
                      mdi-clock-outline
                    </v-icon>入場時間
                  </div>
                  <div class="info-value">
                    <div v-if="lectureEventData.entryDateTime">
                      {{ formatDateTime(lectureEventData.entryDateTime) }}
                    </div>
                    <span v-else>-</span>
                  </div>
                </v-col>
                <v-col
                  cols="6"
                  sm="6"
                  md="3"
                >
                  <div class="info-label d-flex align-center">
                    <v-icon
                      size="14"
                      class="me-1"
                      color="red-darken-1"
                    >
                      mdi-map-marker
                    </v-icon>地點
                  </div>
                  <div class="info-value">
                    {{ lectureEventData.location || '-' }}
                  </div>
                </v-col>
                <v-col
                  cols="6"
                  sm="6"
                  md="3"
                >
                  <div class="info-label d-flex align-center">
                    <v-icon
                      size="14"
                      class="me-1"
                      color="blue-grey-darken-2"
                    >
                      mdi-account
                    </v-icon>
                    業務
                  </div>
                  <div class="info-value">
                    {{ getApplicantName(lectureEventData.applicant) || '-' }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 參加者表格區 -->
        <v-col cols="12">
          <v-card
            class="elevation-0"
          >
            <v-card-title class="pt-0 mb-4 px-0 d-flex align-center ">
              <v-btn
                v-if="canManageParticipants"
                color="teal-darken-2"
                prepend-icon="mdi-plus"
                variant="outlined"
                @click="openParticipantDialog()"
              >
                新增參加者
              </v-btn>
              <v-spacer />
              <div class="participant-registration-summary text-body-2 text-blue-grey-darken-2 me-1">
                <span class="me-4">
                  總人數：<span class="font-weight-bold">{{ totalRegisteredCount }}</span> 人
                </span>
                <span>
                  已確認：<span class="font-weight-bold">{{ confirmedRegisteredCount }}</span> 人
                </span>
              </div>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-data-table
                :headers="participantHeaders"
                :items="participants"
                :loading="loading"
                hover
                density="compact"
                class="rounded-ts-lg rounded-te-lg"
              >
                <template #item="{ item, index }">
                  <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                    <td>{{ item.name }}</td>
                    <td>{{ item.phone || '-' }}</td>
                    <td>{{ item.email || '-' }}</td>
                    <td>{{ item.lineId || '-' }}</td>
                    <td>{{ item.participantCount || 1 }}</td>
                    <td>
                      <v-chip
                        v-if="item.paymentStatus === true"
                        color="green-darken-1"
                        size="small"
                        label
                      >
                        已付款
                      </v-chip>
                      <v-chip
                        v-else-if="item.paymentStatus === false"
                        color="red-darken-1"
                        size="small"
                        label
                      >
                        未付款
                      </v-chip>
                      <span v-else>-</span>
                    </td>
                    <td>
                      <v-chip
                        v-if="(item.participantStatus || 'pending') === 'pending'"
                        color="amber-darken-2"
                        size="small"
                        label
                      >
                        待確認
                      </v-chip>
                      <v-chip
                        v-else-if="item.participantStatus === 'confirmed'"
                        color="green-darken-1"
                        size="small"
                        label
                      >
                        已確認
                      </v-chip>
                      <v-chip
                        v-else-if="item.participantStatus === 'cancelled'"
                        color="grey-darken-1"
                        size="small"
                        label
                      >
                        已取消
                      </v-chip>
                      <span v-else>-</span>
                    </td>
                    <td>
                      <div v-if="item.createdAt">
                        <div>{{ formatDate(item.createdAt) }}</div>
                        <div class="text-caption text-grey-darken-1">
                          <v-icon
                            size="14"
                            style="padding-bottom: 2px;"
                          >
                            mdi-clock-outline
                          </v-icon> {{ formatTime(item.createdAt) }}
                        </div>
                      </div>
                    </td>
                    <td>{{ item.note || '-' }}</td>
                    <td class="text-center">
                      <v-btn
                        v-if="canManageParticipants"
                        icon
                        variant="text"
                        size="small"
                        color="light-blue-darken-2"
                        class="me-1"
                        @click="openParticipantDialog(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="blue-grey-darken-2"
                        @click="openNoteHistoryDialog(item)"
                      >
                        <v-icon>mdi-history</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </template>

      <!-- 未找到講座活動 -->
      <v-col
        v-else
        cols="12"
        class="text-center py-10"
      >
        <v-icon
          icon="mdi-alert-circle"
          size="64"
          color="grey-darken-1"
          class="mb-4"
        />
        <h3 class="text-grey-darken-1">
          找不到此講座活動
        </h3>
      </v-col>
    </v-row>

    <!-- 新增/編輯參加者對話框 -->
    <v-dialog
      v-model="participantDialog.show"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title :class="`d-flex align-center px-6 py-2 ${participantDialog.isEdit ? 'bg-blue-darken-2' : 'bg-teal-darken-2'}`">
          <v-icon
            icon="mdi-account-plus"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ participantDialog.isEdit ? '編輯參加者' : '新增參加者' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            size="36"
            @click="closeParticipantDialog"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="participantFormRef"
            v-model="participantFormValid"
          >
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="participantFormData.name"
                  label="* 姓名"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入姓名']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="participantFormData.phone"
                  label="電話"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="participantFormData.email"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  type="email"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="participantFormData.lineId"
                  label="LineId"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="participantFormData.participantCount"
                  label="人數"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="1"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="participantFormData.paymentStatus"
                  :items="paymentStatusOptions"
                  item-title="text"
                  item-value="value"
                  label="付款"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="participantFormData.participantStatus"
                  :items="participantStatusOptions"
                  item-title="text"
                  item-value="value"
                  label="狀態"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="participantFormData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-1">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="closeParticipantDialog"
          >
            取消
          </v-btn>
          <v-btn
            :color="participantDialog.isEdit ? 'blue-darken-2' : 'teal-darken-2'"
            variant="outlined"
            class="ms-2"
            :loading="submitting"
            :disabled="!participantFormValid"
            @click="saveParticipant"
          >
            {{ participantDialog.isEdit ? '更新' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 參加者異動紀錄對話框 -->
    <v-dialog
      v-model="noteHistoryDialog.show"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg participant-change-history-dialog">
        <v-card-title class="participant-change-history-dialog__title d-flex align-center px-6 py-2 bg-blue-grey-darken-2 position-sticky top-0 flex-shrink-0">
          <v-icon
            icon="mdi-history"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">參加者資訊異動紀錄</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            size="36"
            @click="closeNoteHistoryDialog"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="participant-change-history-dialog__body px-6 py-4 overflow-y-auto">
          <div
            v-if="noteHistoryLoading"
            class="text-center py-8"
          >
            <v-progress-circular
              indeterminate
              color="blue-grey-darken-2"
            />
            <div class="mt-4 text-grey-darken-1">
              載入中...
            </div>
          </div>
          <div
            v-else-if="noteHistoryList.length === 0"
            class="text-center py-8 text-grey-darken-1"
          >
            尚無異動紀錄
          </div>
          <v-timeline
            v-else
            side="end"
            density="compact"
            class="note-history-timeline"
          >
            <v-timeline-item
              v-for="(history, index) in noteHistoryList"
              :key="index"
              dot-color="blue-grey-darken-2"
              size="small"
              class="note-history-item"
            >
              <v-card class="elevation-1 note-history-card">
                <v-card-text class="pa-4 w-100">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="me-2 min-w-0">
                      <div class="text-body-2 font-weight-medium">
                        {{ history.editor?.name || '未知使用者' }}
                        <span
                          v-if="history.editor?.employeeLink?.extNumber"
                          class="text-grey-darken-1"
                        >
                          ({{ history.editor.employeeLink.extNumber }})
                        </span>
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ formatDateTime(history.updatedAt || history.createdAt) }}
                      </div>
                    </div>
                    <div class="flex-shrink-0 align-self-start">
                      <v-chip
                        v-if="history.action === 'create'"
                        size="small"
                        color="teal-darken-2"
                        variant="tonal"
                      >
                        新增參加者
                      </v-chip>
                      <v-chip
                        v-else
                        size="small"
                        color="blue-grey-darken-2"
                        variant="tonal"
                      >
                        資料變更
                      </v-chip>
                    </div>
                  </div>
                  <div class="text-body-2 mt-2">
                    <div
                      v-for="(ch, chIdx) in (history.changes || [])"
                      :key="chIdx"
                      class="mb-2"
                    >
                      <div class="text-grey-darken-1 mb-1">
                        {{ participantHistoryFieldLabel(ch.field) }}
                      </div>
                      <div
                        v-if="history.action === 'create'"
                        class="white-space-pre-wrap"
                      >
                        {{ formatParticipantHistoryValue(ch.field, ch.newValue) }}
                      </div>
                      <div
                        v-else
                        class="white-space-pre-wrap"
                      >
                        {{ formatParticipantHistoryValue(ch.field, ch.oldValue) }}
                        <span class="text-grey-darken-1 mx-1">→</span>
                        {{ formatParticipantHistoryValue(ch.field, ch.newValue) }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>

        <v-card-actions class="px-6 py-5 flex-shrink-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="closeNoteHistoryDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 活動簡介 -->
    <v-dialog
      v-model="activityIntroductionDialog.show"
      max-width="640"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-book-open-page-variant"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">活動簡介</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            size="36"
            @click="activityIntroductionDialog.show = false"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 activity-intro-dialog-body py-6">
          <v-card
            variant="outlined"
            class="px-4 py-3 mb-5 rounded-lg border border-opacity-50"
          >
            <div class="text-subtitle-2 font-weight-medium text-blue-grey-darken-2 mb-3">
              活動簡介（短）
            </div>
            <div class="activity-intro-text text-body-2">
              {{ activityIntroShortDisplay }}
            </div>
            <div class="d-flex justify-end mt-2">
              <v-btn
                icon
                variant="text"
                size="small"
                color="blue-grey-darken-2"
                aria-label="複製活動簡介（短）"
                @click="copyActivityIntroduction('short')"
              >
                <v-icon size="20">
                  mdi-content-copy
                </v-icon>
              </v-btn>
            </div>
          </v-card>
          <v-card
            variant="outlined"
            class="px-4 py-3 rounded-lg border border-opacity-50"
          >
            <div class="text-subtitle-2 font-weight-medium text-blue-grey-darken-2 mb-3">
              活動簡介（長）
            </div>
            <div class="activity-intro-text text-body-2">
              {{ activityIntroLongDisplay }}
            </div>
            <div class="d-flex justify-end mt-2">
              <v-btn
                icon
                variant="text"
                size="small"
                color="blue-grey-darken-2"
                aria-label="複製活動簡介（長）"
                @click="copyActivityIntroduction('long')"
              >
                <v-icon size="20">
                  mdi-content-copy
                </v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-1">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="activityIntroductionDialog.show = false"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { usePermissionStore } from '@/stores/permission'
import {
  formatParticipantHistoryValue,
  participantHistoryFieldLabel
} from '@/utils/lectureEventParticipantHistory'

// 頁面定義
definePage({
  meta: {
    title: '講座活動統計表詳細資訊 | Ystravel',
    login: true,
    permission: 'LECTURE_EVENT_STATISTICS_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const { smAndUp } = useDisplay()
const permissionStore = usePermissionStore()

// 資料相關
const loading = ref(false)
const lectureEventData = ref({})
const participants = ref([])

function participantRowHeadcount (p) {
  const n = Number(p?.participantCount)
  return Number.isFinite(n) && n > 0 ? n : 1
}

const totalRegisteredCount = computed(() => {
  return (participants.value || []).reduce((sum, p) => sum + participantRowHeadcount(p), 0)
})

const confirmedRegisteredCount = computed(() => {
  return (participants.value || []).reduce((sum, p) => {
    if (p?.participantStatus !== 'confirmed') return sum
    return sum + participantRowHeadcount(p)
  }, 0)
})

// 權限檢查（新增／編輯參加者；刪除僅限講座管理權限，此頁不提供）
const canManageParticipants = computed(() => {
  return permissionStore.hasPermission('LECTURE_EVENT_STATISTICS_ATTENDEE_UPDATE')
})

// 參加者表格欄位
const participantHeaders = [
  { title: '姓名', key: 'name', sortable: true },
  { title: '電話', key: 'phone', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'LineId', key: 'lineId', sortable: false },
  { title: '人數', key: 'participantCount', sortable: true },
  { title: '付款', key: 'paymentStatus', sortable: false },
  { title: '狀態', key: 'participantStatus', sortable: false },
  { title: '建立時間', key: 'createdAt', sortable: true },
  { title: '備註', key: 'note', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 參加者對話框
const participantDialog = reactive({
  show: false,
  isEdit: false
})
const participantFormRef = ref(null)
const participantFormValid = ref(false)
const submitting = ref(false)
const participantFormData = reactive({
  name: '',
  phone: '',
  email: '',
  lineId: '',
  participantCount: 1,
  paymentStatus: null,
  participantStatus: 'pending',
  note: ''
})
const currentParticipantId = ref(null)

// 付款狀態選項
const paymentStatusOptions = [
  { text: '已付款', value: true },
  { text: '未付款', value: false }
]

const participantStatusOptions = [
  { text: '待確認', value: 'pending' },
  { text: '已確認', value: 'confirmed' },
  { text: '已取消', value: 'cancelled' }
]

// 參加者異動紀錄對話框
const noteHistoryDialog = reactive({
  show: false
})
const noteHistoryLoading = ref(false)
const noteHistoryList = ref([])

const activityIntroductionDialog = reactive({
  show: false
})

const activityIntroShortDisplay = computed(() => {
  const t = lectureEventData.value?.shortIntroduction
  if (t == null || String(t).trim() === '') return '（無內容）'
  return String(t)
})

const activityIntroLongDisplay = computed(() => {
  const t = lectureEventData.value?.longIntroduction
  if (t == null || String(t).trim() === '') return '（無內容）'
  return String(t)
})

const copyActivityIntroduction = async (which) => {
  const key = which === 'short' ? 'shortIntroduction' : 'longIntroduction'
  const label = which === 'short' ? '活動簡介（短）' : '活動簡介（長）'
  const raw = lectureEventData.value?.[key]
  const text = raw == null ? '' : String(raw)
  if (text.trim() === '') {
    createSnackbar({
      text: `${label}尚無內容可複製`,
      snackbarProps: { color: 'amber-darken-2' }
    })
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    createSnackbar({
      text: `已複製${label}`,
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (err) {
    console.error(`複製${label}失敗:`, err)
    createSnackbar({
      text: '複製失敗，請手動選取文字',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 取得講座活動詳細資料
const fetchLectureEventData = async () => {
  loading.value = true
  try {
    const { data } = await apiAuth.get(`/marketing/lecture-events/${route.params.id}`)
    if (data.success) {
      lectureEventData.value = data.result
      participants.value = data.result.participants || []
    } else {
      createSnackbar({
        text: '取得講座活動資料失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('取得講座活動資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得講座活動資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 取得申請人顯示名稱
const getApplicantName = (applicant) => {
  if (!applicant) return ''
  const extNumber = applicant.employeeLink?.extNumber
  return extNumber ? `${applicant.name} (${extNumber})` : applicant.name
}

// 格式化日期時間（完整格式）
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 格式化時間
const formatTime = (date) => {
  if (!date) return ''
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('Error formatting time:', e)
    return ''
  }
}

// 開啟參加者對話框
const openParticipantDialog = (item = null) => {
  if (item) {
    participantDialog.isEdit = true
    participantFormData.name = item.name || ''
    participantFormData.phone = item.phone || ''
    participantFormData.email = item.email || ''
    participantFormData.lineId = item.lineId || ''
    participantFormData.participantCount = item.participantCount || 1
    participantFormData.paymentStatus = item.paymentStatus
    participantFormData.participantStatus = item.participantStatus || 'pending'
    participantFormData.note = item.note || ''
    currentParticipantId.value = item._id
  } else {
    participantDialog.isEdit = false
    participantFormData.name = ''
    participantFormData.phone = ''
    participantFormData.email = ''
    participantFormData.lineId = ''
    participantFormData.participantCount = 1
    participantFormData.paymentStatus = null
    participantFormData.participantStatus = 'pending'
    participantFormData.note = ''
    currentParticipantId.value = null
  }
  participantDialog.show = true
}

// 關閉參加者對話框
const closeParticipantDialog = () => {
  participantDialog.show = false
  participantFormRef.value?.reset()
  participantFormValid.value = false
}

// 儲存參加者
const saveParticipant = async () => {
  const { valid } = await participantFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (participantDialog.isEdit) {
      const { data } = await apiAuth.patch(
        `/marketing/lecture-events/${route.params.id}/participants/${currentParticipantId.value}`,
        participantFormData
      )
      if (data.success) {
        createSnackbar({
          text: '參加者更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeParticipantDialog()
        await fetchLectureEventData()
      }
    } else {
      const { data } = await apiAuth.post(
        `/marketing/lecture-events/${route.params.id}/participants`,
        participantFormData
      )
      if (data.success) {
        createSnackbar({
          text: '參加者新增成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeParticipantDialog()
        await fetchLectureEventData()
      }
    }
  } catch (error) {
    console.error('儲存參加者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '儲存參加者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

// 開啟參加者異動紀錄對話框
const openNoteHistoryDialog = async (item) => {
  noteHistoryDialog.show = true
  await fetchNoteHistory(item._id)
}

// 關閉參加者異動紀錄對話框
const closeNoteHistoryDialog = () => {
  noteHistoryDialog.show = false
  noteHistoryList.value = []
}

// 取得參加者異動紀錄
const fetchNoteHistory = async (participantId) => {
  noteHistoryLoading.value = true
  try {
    const { data } = await apiAuth.get(
      `/marketing/lecture-events/${route.params.id}/participants/${participantId}/note-history`
    )
    if (data.success) {
      noteHistoryList.value = data.result || []
    } else {
      createSnackbar({
        text: '取得異動紀錄失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('取得異動紀錄失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得異動紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    noteHistoryLoading.value = false
  }
}

// 返回上一頁
const goBack = () => {
  router.push('/lectureEventStatistics')
}

// 頁面載入時初始化
onMounted(async () => {
  await fetchLectureEventData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

/* 異動紀錄對話框：參考 marketingDesignRequest 新增對話框，標題／按鈕固定、內容區捲動 */
.participant-change-history-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.participant-change-history-dialog__title {
  z-index: 2;
}

.participant-change-history-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
}

.lecture-title {
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.activity-intro-dialog-body {
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.activity-intro-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.info-card {
  border: 1px solid #aaa;
  border-radius: 4px;
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

@include sm {
  .lecture-title {
    font-size: 20px;
  }

  .info-value {
    font-size: 14px;
  }
}

@include md {
  .lecture-title {
    font-size: 22px;
  }
}

.white-space-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.note-history-timeline) {
  width: 100%;

  .v-timeline-item {
    width: 100%;

    .v-timeline-item__body {
      width: 100%;
      max-width: 100%;
    }
  }
}

.note-history-card {
  width: 100%;
  max-width: 100%;
}
</style>

