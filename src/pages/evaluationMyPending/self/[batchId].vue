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

          <template v-else-if="formMeta">
            <div class="px-4 px-sm-6 py-4 d-flex align-center">
              <v-btn
                variant="text"
                color="blue-grey-darken-2"
                prepend-icon="mdi-arrow-left"
                @click="router.push('/evaluationMyPending')"
              >
                返回我的考核
              </v-btn>
            </div>
            <v-divider />
            <div class="px-4 px-sm-6 pt-4 pb-2">
              <v-card
                elevation="0"
                class="preview-card pa-4"
              >
                <div class="mb-4 d-flex align-center flex-wrap font-weight-bold">
                  <v-icon
                    size="20"
                    class="me-2"
                  >
                    mdi-clipboard-check-outline
                  </v-icon>
                  <span>自我評核表</span>
                  <span class="mx-2 text-grey-darken-1">－</span>
                  <span class="sub-title">{{ displayName }}</span>
                </div>

                <v-alert
                  v-if="readOnly"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  您已完成自我評分。
                </v-alert>

                <div
                  v-for="(q, qIndex) in questions"
                  :key="qIndex"
                  class="preview-question mb-5 pa-5 rounded"
                >
                  <div class="font-weight-bold mb-3">
                    {{ questions.length > 1 ? `${qIndex + 1}. ` : '' }}{{ q.title || '（未命名題目）' }}
                  </div>
                  <ul
                    v-if="getPointsList(q).length > 0"
                    class="text-grey-darken-3 mb-3 ps-5"
                  >
                    <li
                      v-for="(point, i) in getPointsList(q)"
                      :key="i"
                    >
                      {{ point }}
                    </li>
                  </ul>
                  <div
                    v-if="criteriaText(q)"
                    class="text-grey-darken-3 mb-4 pre-wrap"
                  >
                    <span class="sub-title text-black">*評分標準</span><br>
                    <div class="pt-2 ps-2">
                      {{ criteriaText(q) }}
                    </div>
                  </div>
                  <div class="w-100 d-flex justify-end">
                    <v-text-field
                      :model-value="scoreInputs[`q-${qIndex}`]"
                      type="number"
                      variant="outlined"
                      density="compact"
                      placeholder="填寫分數（50-100）"
                      hide-details
                      min="50"
                      max="100"
                      class="score-input bg-white"
                      style="max-width: 240px;"
                      :readonly="readOnly"
                      @update:model-value="v => setScore(qIndex, v)"
                    />
                  </div>
                </div>

                <div
                  v-if="questions.length === 0"
                  class="text-grey text-center py-6"
                >
                  尚無自評題目
                </div>

                <div
                  v-if="!readOnly && questions.length > 0"
                  class="mt-6 d-flex justify-end"
                >
                  <v-btn
                    color="teal-darken-1"
                    :loading="submitting"
                    @click="openSubmitConfirm"
                  >
                    送出自我評分
                  </v-btn>
                </div>
              </v-card>
            </div>
          </template>
        </v-card>

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
                {{ instructionsText }}
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

        <ConfirmDialog
          v-model="selfSubmitConfirmOpen"
          :max-width="320"
          title="確認送出自我評分"
          :message="selfSubmitConfirmMessage"
          confirm-button-text="送出"
          cancel-button-text="取消"
          header-icon="mdi-clipboard-check-outline"
          @confirm="doSubmitSelfAssessment"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

definePage({
  meta: {
    title: '自我評分 | Ystravel',
    login: true
  }
})

const route = useRoute()
const router = useRouter()
const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const batchId = computed(() => route.params.batchId)
const loading = ref(true)
const submitting = ref(false)
const instructionsDialogOpen = ref(false)
const selfSubmitConfirmOpen = ref(false)
const formMeta = ref(null)
const scoreInputs = reactive({})

const questions = computed(() => formMeta.value?.selfAssessmentQuestions || [])
const readOnly = computed(() => Boolean(formMeta.value?.alreadySubmitted))
const displayName = computed(() => (formMeta.value?.displayName || '').trim() || '—')
const instructionsText = computed(() => (formMeta.value?.selfAssessmentFillingInstructions || '').trim())

const selfSubmitConfirmMessage =
  '請確認所有自評分數已填寫正確，一經送出即無法修改。確定要送出嗎？'

function setScore (qIndex, v) {
  const key = `q-${qIndex}`
  if (v === '' || v === null || v === undefined) {
    scoreInputs[key] = null
    return
  }
  const num = Number(v)
  if (Number.isNaN(num)) return
  scoreInputs[key] = num
}

function clearScoreKeys () {
  Object.keys(scoreInputs).forEach((k) => {
    delete scoreInputs[k]
  })
}

function initScoresFromSubmitted (scores) {
  clearScoreKeys()
  if (!Array.isArray(scores)) return
  scores.forEach((s) => {
    scoreInputs[`q-${s.questionIndex}`] = s.score
  })
}

function initScoresEmpty (n) {
  clearScoreKeys()
  for (let i = 0; i < n; i++) {
    scoreInputs[`q-${i}`] = null
  }
}

function getPointsList (q) {
  const arr = q?.scoringPoints
  return Array.isArray(arr) ? arr.filter((s) => (s != null && String(s).trim() !== '')) : []
}

function criteriaText (q) {
  return (q?.scoringCriteria || '').trim()
}

function collectScoresPayload () {
  return questions.value.map((_, i) => ({
    questionIndex: i,
    score: Number(scoreInputs[`q-${i}`])
  }))
}

async function fetchForm () {
  loading.value = true
  try {
    const { data } = await apiAuth.get(`/evaluations/batch/${batchId.value}/self-assessment`)
    const r = data?.result
    if (r?.noSelfAssessmentQuestions) {
      createSnackbar({
        text: '此批次表單未設定自評題目',
        snackbarProps: { color: 'amber-darken-2' }
      })
      router.replace('/evaluationMyPending')
      return
    }
    formMeta.value = r
    if (r?.alreadySubmitted && r?.submittedScores) {
      initScoresFromSubmitted(r.submittedScores)
    } else {
      initScoresEmpty(r?.selfAssessmentQuestions?.length || 0)
    }
    const inst = (r?.selfAssessmentFillingInstructions || '').trim()
    if (inst && !r?.alreadySubmitted) {
      instructionsDialogOpen.value = true
    }
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    router.replace('/evaluationMyPending')
  } finally {
    loading.value = false
  }
}

function openSubmitConfirm () {
  const n = questions.value.length
  for (let i = 0; i < n; i++) {
    const v = scoreInputs[`q-${i}`]
    if (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))) {
      createSnackbar({
        text: `請填寫第 ${i + 1} 題分數`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }
    const num = Number(v)
    if (num < 50 || num > 100) {
      createSnackbar({
        text: `第 ${i + 1} 題分數須為 50–100`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }
  }
  selfSubmitConfirmOpen.value = true
}

async function doSubmitSelfAssessment () {
  submitting.value = true
  try {
    await apiAuth.post(`/evaluations/batch/${batchId.value}/self-assessment`, {
      scores: collectScoresPayload()
    })
    createSnackbar({ text: '自評已送出', snackbarProps: { color: 'teal-lighten-1' } })
    router.push('/evaluationMyPending')
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '送出失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchForm()
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
