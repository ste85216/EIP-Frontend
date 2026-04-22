<template>
  <v-container max-width="1000">
    <v-row class="pt-md-4 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pb-3 px-0">
          <v-card-text
            v-if="loading"
            class="text-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="teal-darken-2"
              size="60"
              width="6"
            />
            <div class="mt-4 text-grey-darken-1">
              載入中...
            </div>
          </v-card-text>

          <template v-else>
            <v-alert
              v-if="mustBlockForSelf && selfAssessmentBatchId"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mx-4 mx-sm-6 mt-4"
            >
              <div class="d-flex flex-column flex-sm-row align-sm-center ga-3">
                <span>請先完成「自我評分」後，才可填寫對他人的考核表。</span>
                <v-btn
                  color="teal-darken-2"
                  variant="flat"
                  size="small"
                  prepend-icon="mdi-account-edit-outline"
                  :to="`/evaluationMyPending/self/${selfAssessmentBatchId}`"
                  class="align-self-start"
                >
                  前往自我評分
                </v-btn>
              </div>
            </v-alert>
            <div class="px-4 px-sm-6 py-4 d-flex align-center">
              <v-btn
                variant="text"
                color="blue-grey-darken-2"
                prepend-icon="mdi-arrow-left"
                @click="router.push('/evaluationMyPending')"
              >
                返回我的考核
              </v-btn>
              <v-spacer />
              <v-btn
                v-if="!isCompleted && !isPastDue && !isAbandoned"
                variant="outlined"
                color="orange-darken-3"
                prepend-icon="mdi-close-circle-outline"
                size="small"
                @click="abandonDialogOpen = true"
              >
                放棄
              </v-btn>
            </div>
            <v-divider />
            <div class="px-4 px-sm-6 pt-4 pb-2">
              <v-card
                elevation="0"
                class="preview-card pa-4 "
              >
                <div class="mb-4 d-flex align-center font-weight-bold">
                  <v-icon
                    size="20"
                    class="me-2"
                  >
                    mdi-account
                  </v-icon>
                  考核對象
                </div>
                <div
                  class="rounded mt-5 mb-3"
                  style="background-color: #f6f6f6;"
                >
                  <v-row class="mb-2 px-5">
                    <v-col cols="6">
                      <div class="text-subtitle-2 text-grey-darken-1 mb-1">
                        姓名
                      </div>
                      <div class="sub-title">
                        {{ evaluateeName }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-subtitle-2 text-grey-darken-1 mb-1">
                        公司部門
                      </div>
                      <div class="sub-title">
                        {{ evaluateeDept }}
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <template
                  v-for="(part, partIndex) in visibleParts"
                  :key="partIndex"
                >
                  <div class="preview-part mb-4">
                    <div class="font-weight-bold mb-2 d-flex align-center">
                      <v-icon
                        size="20"
                        class="me-2"
                      >
                        mdi-hand-pointing-right
                      </v-icon>
                      {{ getPartDisplayTitle(part) }}
                    </div>
                    <div
                      v-for="(q, qIndex) in part.questions"
                      :key="qIndex"
                      class="preview-question mb-5 pa-5 rounded"
                    >
                      <div class="font-weight-bold mb-3">
                        {{ part.questions.length > 1 ? `${qIndex + 1}. ` : '' }}{{ q.title || '（未命名題目）' }}
                      </div>
                      <ul
                        v-if="getScoringPointsList(part, qIndex).length > 0"
                        class="text-grey-darken-3 mb-3 ps-5"
                      >
                        <li
                          v-for="(point, i) in getScoringPointsList(part, qIndex)"
                          :key="i"
                        >
                          {{ point }}
                        </li>
                      </ul>
                      <div
                        v-if="getScoringCriteria(part, qIndex)"
                        class="text-grey-darken-3 mb-4 pre-wrap"
                      >
                        <span class="sub-title text-black">*評分標準</span><br>
                        <div class="pt-2 ps-2">
                          {{ getScoringCriteria(part, qIndex) }}
                        </div>
                      </div>
                      <div class="w-100 d-flex justify-end">
                        <v-text-field
                          :model-value="scoreMap[`${part.originalIndex}-${qIndex}`]"
                          type="number"
                          variant="outlined"
                          density="compact"
                          placeholder="填寫分數（50-100）"
                          hide-details
                          min="50"
                          max="100"
                          class="score-input bg-white"
                          style="max-width: 240px;"
                          :readonly="isCompleted || isAbandoned || mustBlockForSelf"
                          @update:model-value="v => setScore(part.originalIndex, qIndex, v)"
                        />
                      </div>
                    </div>
                  </div>
                </template>

                <div
                  v-if="visibleParts.length === 0"
                  class="text-grey text-center py-6"
                >
                  此表單尚無題目
                </div>

                <div
                  v-if="showSpecialAchievementSection"
                  class="preview-part mb-4 mt-6"
                >
                  <div class="font-weight-bold mb-3 d-flex align-center">
                    <v-icon
                      size="20"
                      class="me-2"
                    >
                      mdi-star-four-points-outline
                    </v-icon>
                    特殊事蹟
                  </div>
                  <div
                    class="pa-5 rounded"
                    style="background-color: #f6f6f6;"
                  >
                    <template v-if="isCompleted || isAbandoned">
                      <div
                        v-if="evaluation?.mySpecialAchievement?.hasAchievement"
                        class="pre-wrap text-body-1"
                      >
                        {{ evaluation.mySpecialAchievement.text || '' }}
                      </div>
                      <div
                        v-else
                        class="text-grey-darken-1"
                      >
                        無特殊事蹟
                      </div>
                    </template>
                    <template v-else>
                      <div class="sub-title text-grey-darken-1 mb-3">
                        該員工是否有特殊事蹟 ? 若有，可填寫該員工特殊事蹟內容。
                      </div>
                      <v-radio-group
                        v-model="specialHasAchievement"
                        inline
                        hide-details
                        class="mb-4 mt-0"
                        density="compact"
                        :disabled="isPastDue || mustBlockForSelf"
                      >
                        <v-radio
                          label="是"
                          :value="true"
                          color="teal-darken-2"
                        />
                        <v-radio
                          label="否"
                          :value="false"
                          class="ms-1"
                          color="grey-darken-1"
                        />
                      </v-radio-group>
                      <v-textarea
                        v-model="specialText"
                        label="特殊事蹟內容"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        class="bg-white"
                        :disabled="specialHasAchievement !== true"
                        :readonly="isPastDue || mustBlockForSelf"
                        rows="3"
                        auto-grow
                      />
                    </template>
                  </div>
                </div>

                <v-alert
                  v-if="isCompleted"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mt-4 mb-2"
                >
                  您已完成此考核評分，無法再修改。
                </v-alert>

                <v-alert
                  v-else-if="isPastDue"
                  variant="tonal"
                  density="compact"
                  class="mt-4 mb-2"
                  color="amber-darken-4 d-flex align-center"
                >
                  <v-icon
                    size="20"
                    class="me-2"
                    style="padding-bottom: 2px;"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <span class="font-weight-bold">已超過截止日期，無法提交評分。請聯絡人資部門協助。</span>
                </v-alert>

                <v-alert
                  v-else-if="isAbandoned"
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-4 mb-2"
                >
                  您已放棄此考核評核。
                </v-alert>

                <div
                  v-else-if="!mustBlockForSelf"
                  class="mt-7 d-flex justify-end"
                >
                  <v-btn
                    color="teal-darken-1"
                    :loading="submitting"
                    @click="openSubmitConfirm"
                  >
                    提交評分
                  </v-btn>
                </div>
              </v-card>
            </div>
          </template>
        </v-card>

        <ConfirmDialog
          v-model="submitConfirmOpen"
          :max-width="320"
          title="確認提交評分"
          :message="submitConfirmMessage"
          confirm-button-text="送出"
          cancel-button-text="取消"
          header-icon="mdi-clipboard-check-outline"
          @confirm="doSubmitScores"
        />

        <v-dialog
          v-model="instructionsDialogOpen"
          persistent
          max-width="600"
        >
          <v-card class="rounded-lg">
            <v-card-title
              class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
            >
              <v-icon
                icon="mdi-information-outline"
                :size="smAndUp ? '20' : '18'"
                color="white"
                class="me-2"
              />
              <span class="card-title text-white">填寫說明</span>
            </v-card-title>
            <v-card-text class="px-4 px-sm-6 py-4 py-sm-7">
              <div class="pre-wrap font-weight-medium">
                {{ fillingInstructionsText }}
              </div>
            </v-card-text>
            <v-card-actions class="px-6 pb-5">
              <v-spacer />
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                :size="smAndUp ? 'default' : 'small'"
                @click="instructionsDialogOpen = false"
              >
                我已閱讀
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <ConfirmDeleteDialogWithTextField
          v-model="abandonDialogOpen"
          title="確認放棄"
          message="確定要放棄此考核評核嗎？放棄後將無法再填寫此考核對象的評分。"
          :expected-name="evaluateeNameForConfirm"
          :input-label-for-confirm="evaluateeNameForConfirm ? `「${evaluateeNameForConfirm}」確認` : '考核對象姓名'"
          confirm-button-text="放棄"
          confirm-button-color="orange-darken-2"
          header-color="bg-orange-darken-2"
          @confirm="doAbandon"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'

definePage({
  meta: {
    title: '評核填寫 | Ystravel',
    login: true
  }
})

const route = useRoute()
const router = useRouter()
const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const evaluationId = computed(() => route.params.id)
const loading = ref(true)
const submitting = ref(false)
const submitConfirmOpen = ref(false)
const abandonDialogOpen = ref(false)
const instructionsDialogOpen = ref(false)
const evaluation = ref(null)
const parts = ref([])
const scoreMap = reactive({})
const specialHasAchievement = ref(false)
const specialText = ref('')

const showSpecialAchievementSection = computed(() =>
  Boolean(evaluation.value?.templateSpecialAchievementEnabled && evaluation.value?.myFillsSpecialAchievement)
)

const visibleParts = computed(() =>
  (parts.value || []).filter(p => p.visible !== false)
)

const myPartSegmentIndex = computed(() => {
  const psi = evaluation.value?.myPartSegmentIndex
  return psi && typeof psi === 'object' ? psi : {}
})

function getPartDisplayTitle (part) {
  const baseTitle = part?.title || `第${(part?.originalIndex ?? 0) + 1}部分`
  const sw = part?.subWeights
  if (sw && sw.length > 1) {
    const sIdx = myPartSegmentIndex.value[part.originalIndex] != null
      ? Number(myPartSegmentIndex.value[part.originalIndex])
      : myPartSegmentIndex.value[String(part.originalIndex)] != null
        ? Number(myPartSegmentIndex.value[String(part.originalIndex)])
        : 0
    const seg = sw[sIdx]
    const segLabel = seg?.label || `選項${sIdx + 1}`
    return `${baseTitle} - ${segLabel}`
  }
  return baseTitle
}

const isCompleted = computed(() =>
  evaluation.value?.myEvaluatorStatus === 'completed'
)

const isAbandoned = computed(() =>
  evaluation.value?.myEvaluatorStatus === 'abandoned'
)

const mustBlockForSelf = computed(() =>
  Boolean(evaluation.value?.mustCompleteSelfAssessmentFirst)
)

const selfAssessmentBatchId = computed(() => {
  const b = evaluation.value?.batch
  if (b == null) return ''
  if (typeof b === 'object' && b !== null && b._id != null) return String(b._id)
  return String(b)
})

const isPastDue = computed(() => {
  const due = evaluation.value?.batchDueDate || evaluation.value?.dueDate
  if (!due) return false
  const dueEnd = new Date(due)
  dueEnd.setHours(23, 59, 59, 999)
  return new Date() > dueEnd
})

const evaluateeName = computed(() => {
  const e = evaluation.value?.evaluatee
  if (!e) return '_'
  const name = e.name || ''
  const code = e.employeeCode ? ` (${e.employeeCode})` : ''
  return name + code
})

const evaluateeNameForConfirm = computed(() => {
  const e = evaluation.value?.evaluatee
  return e?.name?.trim() || ''
})

const evaluateeDept = computed(() => {
  const e = evaluation.value?.evaluatee
  if (!e) return '_'
  const company = e.company
  const dept = e.department
  const companyName = company && typeof company === 'object' ? company.name : ''
  const deptName = dept && typeof dept === 'object' ? dept.name : ''
  if (companyName && deptName) return `${companyName} - ${deptName}`
  return deptName || companyName || '_'
})

const fillingInstructionsText = computed(() => {
  const t = evaluation.value?.template
  return (t?.fillingInstructions || '').trim()
})

function escapeHtml (s) {
  if (!s || typeof s !== 'string') return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}

const submitConfirmMessage = computed(() => {
  const t = evaluation.value?.template
  const prompt = (t?.confirmPrompt || '').trim()
  if (prompt) return escapeHtml(prompt)
  return '請確認所有分數已填寫正確，一經送出即無法修改。確定要送出嗎？'
})

function getScoringPointsList (part, qIndex) {
  const q = part.questions?.[qIndex]
  if (!q) return []
  const text = (q.scoringPointsText || '').trim()
  const fromText = text ? text.split('\n').map(s => s.trim()).filter(Boolean) : []
  if (fromText.length > 0) return fromText
  return Array.isArray(q.scoringPoints) ? q.scoringPoints : []
}

function getScoringCriteria (part, qIndex) {
  const q = part.questions?.[qIndex]
  return q?.scoringCriteria?.trim() || ''
}

function setScore (partIndex, qIndex, val) {
  const key = `${partIndex}-${qIndex}`
  if (val === '' || val === null || val === undefined) {
    scoreMap[key] = null
    return
  }
  const num = Number(val)
  if (isNaN(num)) return
  scoreMap[key] = num
}

function initSpecialAchievement () {
  const m = evaluation.value?.mySpecialAchievement
  if (m && (m.hasAchievement === true || m.hasAchievement === false)) {
    specialHasAchievement.value = m.hasAchievement
    specialText.value = typeof m.text === 'string' ? m.text : ''
  } else {
    specialHasAchievement.value = false
    specialText.value = ''
  }
}

function initScoreMap () {
  const scores = evaluation.value?.scores || []
  parts.value.forEach((part) => {
    const partIndex = part.originalIndex ?? 0
    const questions = part.questions || []
    questions.forEach((q, qIndex) => {
      const key = `${partIndex}-${qIndex}`
      const found = scores.find(
        s => s.partIndex === partIndex && s.questionIndex === qIndex
      )
      scoreMap[key] = found?.score != null ? found.score : null
    })
  })
}

function collectScores () {
  const arr = []
  visibleParts.value.forEach((part) => {
    const partIndex = part.originalIndex ?? 0
    const questions = part.questions || []
    questions.forEach((q, qIndex) => {
      const key = `${partIndex}-${qIndex}`
      const val = scoreMap[key]
      arr.push({
        partIndex,
        questionIndex: qIndex,
        score: val === '' || val === null || val === undefined ? null : Number(val)
      })
    })
  })
  return arr
}

async function fetchEvaluation () {
  loading.value = true
  try {
    const { data } = await apiAuth.get(`/evaluations/${evaluationId.value}/for-evaluator`)
    evaluation.value = data?.result
    const template = evaluation.value?.template
    parts.value = template?.parts || []
    initScoreMap()
    initSpecialAchievement()
    const instructions = (template?.fillingInstructions || '').trim()
    const status = evaluation.value?.myEvaluatorStatus
    if (
      instructions &&
      status !== 'completed' &&
      status !== 'abandoned' &&
      !evaluation.value?.mustCompleteSelfAssessmentFirst
    ) {
      instructionsDialogOpen.value = true
    }
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    router.push('/evaluationMyPending')
  } finally {
    loading.value = false
  }
}

function validateScores () {
  const missing = []
  const belowMin = []
  const aboveMax = []
  visibleParts.value.forEach((part) => {
    const partIndex = part.originalIndex ?? 0
    const questions = part.questions || []
    questions.forEach((q, qIndex) => {
      const key = `${partIndex}-${qIndex}`
      const val = scoreMap[key]
      const label = questions.length > 1 ? `第${partIndex + 1}部分第${qIndex + 1}題` : `第${partIndex + 1}部分`
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        missing.push(label)
      } else {
        const num = Number(val)
        if (num < 50) belowMin.push(label)
        else if (num > 100) aboveMax.push(label)
      }
    })
  })
  if (belowMin.length > 0) return { missing, belowMin, aboveMax: [] }
  if (aboveMax.length > 0) return { missing: [], belowMin: [], aboveMax }
  if (missing.length > 0) return { missing, belowMin: [], aboveMax: [] }
  return null
}

function validateSpecialAchievement () {
  if (!showSpecialAchievementSection.value) return null
  if (isCompleted.value || isAbandoned.value || isPastDue.value) return null
  if (specialHasAchievement.value === true) {
    const t = (specialText.value || '').trim()
    if (!t) return '選擇「是」時請填寫特殊事蹟內容'
  }
  return null
}

function openSubmitConfirm () {
  const result = validateScores()
  if (result) {
    if (result.belowMin?.length > 0) {
      createSnackbar({
        text: `分數不可低於50分：${result.belowMin.slice(0, 3).join('、')}${result.belowMin.length > 3 ? '...' : ''}`,
        snackbarProps: { color: 'red-lighten-1' }
      })
    } else if (result.aboveMax?.length > 0) {
      createSnackbar({
        text: `分數不可超過100分：${result.aboveMax.slice(0, 3).join('、')}${result.aboveMax.length > 3 ? '...' : ''}`,
        snackbarProps: { color: 'red-lighten-1' }
      })
    } else if (result.missing?.length > 0) {
      createSnackbar({
        text: `請填寫所有題目的分數：${result.missing.slice(0, 3).join('、')}${result.missing.length > 3 ? '...' : ''}`,
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
    return
  }
  const saErr = validateSpecialAchievement()
  if (saErr) {
    createSnackbar({
      text: saErr,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  submitConfirmOpen.value = true
}

async function doSubmitScores () {
  submitting.value = true
  try {
    const scores = collectScores()
    const body = { scores }
    if (
      showSpecialAchievementSection.value &&
      !isPastDue.value
    ) {
      body.specialAchievement = {
        hasAchievement: specialHasAchievement.value === true,
        text: specialHasAchievement.value === true ? (specialText.value || '').trim() : ''
      }
    }
    await apiAuth.patch(`/evaluations/${evaluationId.value}/submit-scores`, body)
    createSnackbar({ text: '評分已儲存', snackbarProps: { color: 'teal-lighten-1' } })
    router.push('/evaluationMyPending')
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '提交失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

async function doAbandon () {
  submitting.value = true
  try {
    await apiAuth.patch(`/evaluations/${evaluationId.value}/abandon`)
    createSnackbar({ text: '已放棄此考核評核', snackbarProps: { color: 'teal-lighten-1' } })
    router.push('/evaluationMyPending')
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '放棄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

watch(specialHasAchievement, (v, oldV) => {
  if (v !== true && oldV === true) specialText.value = ''
})

onMounted(() => {
  fetchEvaluation()
})
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
.preview-card {
  min-height: 200px;
}
.preview-question {
  background-color: #f6f6f6;
}
</style>
