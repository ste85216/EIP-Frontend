<template>
  <v-container max-width="1800">
    <v-row class="pt-md-4 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-7 pb-10 px-0">
          <!-- 載入中 -->
          <v-card-text
            v-if="loading"
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
          </v-card-text>

          <!-- 表單內容 -->
          <template v-else>
            <v-tabs
              v-model="editorTab"
              class="px-4 px-sm-6 px-md-7 mb-8"
              color="blue-grey-darken-2"
            >
              <v-tab
                value="evaluator"
                prepend-icon="mdi-clipboard-text-outline"
              >
                評核表單
              </v-tab>
              <v-tab
                value="self"
                prepend-icon="mdi-account-edit-outline"
              >
                自評表單
              </v-tab>
            </v-tabs>
            <v-window v-model="editorTab">
              <v-window-item value="evaluator">
                <v-row class="px-4 px-sm-6 px-md-7">
                  <!-- 編輯區 -->
                  <v-col
                    cols="12"
                    lg="5"
                  >
                    <div class="card-title mb-5 text-blue-grey-darken-2 d-flex align-center">
                      <v-icon
                        size="20"
                        class="me-1"
                      >
                        mdi-view-list-outline
                      </v-icon>基本資料
                    </div>
                    <v-text-field
                      v-model="form.name"
                      label="* 表單名稱"
                      variant="outlined"
                      density="compact"
                      :rules="[v => !!v?.trim() || '請輸入表單名稱', nameUniqueRule]"
                      class="mb-3"
                    />
                    <v-row class="mb-3">
                      <v-col
                        cols="6"
                        class="pb-0"
                      >
                        <v-text-field
                          v-model.number="form.year"
                          label="* 年度"
                          variant="outlined"
                          density="compact"
                          type="number"
                          min="2000"
                          max="2100"
                          :rules="[
                            v => v != null && v !== '' || '請輸入年度',
                            v => (v >= 2000 && v <= 2100) || '年度需介於 2000-2100'
                          ]"
                        />
                      </v-col>
                      <v-col
                        cols="6"
                        class="pb-0"
                      >
                        <v-select
                          v-model="form.category"
                          :items="categoryOptions"
                          item-title="name"
                          item-value="_id"
                          label="分類（選填）"
                          variant="outlined"
                          density="compact"
                          clearable
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mb-3">
                      <v-col
                        cols="12"
                        sm="6"
                        class="pb-0"
                      >
                        <v-select
                          v-model="form.attendanceFormTemplate"
                          :items="attendanceTemplateOptions"
                          item-title="name"
                          item-value="_id"
                          label="* 關聯出勤表單"
                          variant="outlined"
                          density="compact"
                          placeholder="請選擇"
                          :rules="[v => !!v || '請選擇關聯的出勤表單模板']"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        class="pb-0"
                      >
                        <v-select
                          v-model="form.specialAchievementEnabled"
                          :items="specialAchievementItems"
                          item-title="title"
                          item-value="value"
                          label="特殊事蹟"
                          variant="outlined"
                          density="compact"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-textarea
                      v-model="form.fillingInstructions"
                      label="填寫說明（選填）"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      placeholder="評核者進入填寫頁面時會先看到的說明"
                      class="mb-3"
                    />
                    <v-textarea
                      v-model="form.confirmPrompt"
                      label="確認提示詞（選填）"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      placeholder="評核者按下送出時，確認視窗會顯示的提示詞"
                      class="mb-3"
                    />
                    <v-textarea
                      v-model="form.description"
                      label="備註（選填）"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      class="mb-5"
                      hide-details
                    />

                    <div class="card-title mb-2 text-blue-grey-darken-2 d-flex align-center">
                      <v-icon
                        size="20"
                        class="me-1"
                      >
                        mdi-list-box-outline
                      </v-icon>表單部分
                    </div>
                    <p class="text-caption text-grey-darken-1 mb-3">
                      {{ partsWeightHint }}
                    </p>
                    <v-expansion-panels
                      v-model="expandedParts"
                      class="mb-2"
                    >
                      <v-expansion-panel
                        v-for="(part, partIndex) in form.parts"
                        :key="partIndex"
                      >
                        <v-expansion-panel-title
                          class="sub-title font-weight-bold"
                        >
                          {{ part.title || `部分 ${partIndex + 1}` }}
                          <template v-if="(part.subWeights || []).length > 1">
                            <v-chip
                              v-for="(sw, swIdx) in part.subWeights"
                              :key="swIdx"
                              size="small"
                              class="ms-2"
                              color="blue-grey-darken-3"
                            >
                              {{ sw.label || '未命名' }} {{ Math.round((sw.weight || 0) * 100) }}%
                            </v-chip>
                          </template>
                          <v-chip
                            v-else
                            size="small"
                            class="ms-2"
                            color="blue-grey-darken-3"
                          >
                            {{ Math.round((part.weight || 0) * 100) }}%
                          </v-chip>
                          <v-btn
                            icon
                            variant="plain"
                            size="x-small"
                            color="red"
                            class="ms-1"
                            @click.stop="openDeletePartDialog(partIndex)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-row class="mt-4 mb-2">
                            <v-col
                              cols="12"
                              sm="7"
                            >
                              <v-text-field
                                v-model="part.title"
                                label="部分標題"
                                variant="outlined"
                                density="compact"
                                hide-details
                              />
                            </v-col>
                            <v-col
                              cols="12"
                              sm="5"
                            >
                              <v-text-field
                                v-model.number="part.weight"
                                label="加權比例總計 (0~1)"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                variant="outlined"
                                density="compact"
                                placeholder="例如 0.3 表示 30%"
                                hide-details
                              />
                            </v-col>
                          </v-row>
                          <div class="mb-3">
                            <div class="d-flex align-center gap-2 mb-4">
                              <span class="text-body-2 text-grey-darken-1">* 拆開加權（如需拆開，請至少新增兩項）</span>
                              <v-btn
                                variant="outlined"
                                size="x-small"
                                prepend-icon="mdi-plus"
                                color="blue-grey-darken-1"
                                class="ms-1"
                                @click="addSubWeight(partIndex)"
                              >
                                新增子權重
                              </v-btn>
                            </div>
                            <v-row dense>
                              <v-col
                                v-for="(sw, swIdx) in (part.subWeights || [])"
                                :key="swIdx"
                                cols="12"
                                sm="6"
                              >
                                <div class="d-flex align-center gap-1">
                                  <v-text-field
                                    v-model="sw.label"
                                    placeholder="例如：主管"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    class="me-3"
                                  />
                                  <v-text-field
                                    v-model.number="sw.weight"
                                    placeholder="0~1"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    style="width: 80px;"
                                  />
                                  <v-btn
                                    icon
                                    variant="plain"
                                    size="x-small"
                                    color="red"
                                    class="ms-1"
                                    @click="removeSubWeight(partIndex, swIdx)"
                                  >
                                    <v-icon>mdi-delete</v-icon>
                                  </v-btn>
                                </div>
                              </v-col>
                            </v-row>
                            <p
                              v-if="(part.subWeights || []).length > 1"
                              class="text-caption mt-1 mb-0"
                              :class="subWeightsSumMatch(part) ? 'text-teal' : 'text-red-lighten-1'"
                            >
                              子權重總和：{{ ((part.subWeights || []).reduce((s, x) => s + (Number(x.weight) || 0), 0) * 100).toFixed(0) }}%
                              {{ subWeightsSumMatch(part) ? '✓' : '（須等於加權比例總計）' }}
                            </p>
                          </div>
                          <div
                            v-for="(q, qIndex) in part.questions"
                            :key="qIndex"
                            class="mb-4 pt-2 pb-4 px-3 border rounded"
                          >
                            <div class="d-flex align-center mb-2">
                              <span class="text-subtitle-2">題目{{ part.questions.length > 1 ? ` ${qIndex + 1}` : '' }}</span>
                              <v-btn
                                icon
                                variant="plain"
                                size="x-small"
                                color="red"
                                class="ms-auto"
                                @click="removeQuestion(partIndex, qIndex)"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </div>
                            <v-text-field
                              v-model="q.title"
                              label="標題"
                              variant="outlined"
                              density="compact"
                              class="mb-4"
                              hide-details
                            />
                            <div class="mb-4">
                              <v-textarea
                                v-model="q.scoringPointsText"
                                label="評分要點（每行一項）"
                                variant="outlined"
                                density="compact"
                                rows="4"
                                placeholder="客戶回訪的頻率與質量&#10;客戶滿意度&#10;客戶流失率"
                                hide-details
                                @blur="syncScoringPoints(partIndex, qIndex)"
                              />
                            </div>
                            <v-textarea
                              v-model="q.scoringCriteria"
                              label="評分標準"
                              variant="outlined"
                              density="compact"
                              rows="18"
                              placeholder="98–100分 穩定達成..."
                              hide-details
                            />
                          </div>
                          <v-btn
                            variant="outlined"
                            size="small"
                            prepend-icon="mdi-plus"
                            class="mb-2"
                            color="teal-darken-2"
                            @click="addQuestion(partIndex)"
                          >
                            新增題目
                          </v-btn>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                    <v-btn
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-plus"
                      class="mt-3"
                      color="blue-darken-2"
                      @click="addPart"
                    >
                      新增部分
                    </v-btn>
                  </v-col>

                  <!-- 預覽區 -->
                  <v-col
                    cols="12"
                    lg="7"
                  >
                    <div class="card-title font-weight-bold text-blue-grey-darken-2 d-flex align-center mb-4">
                      <v-icon
                        size="20"
                        class="me-2"
                      >
                        mdi-eye
                      </v-icon>
                      表單預覽
                    </div>
                    <v-card
                      elevation="0"
                      class="preview-card pa-4 border"
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
                              王小明（示意）
                            </div>
                          </v-col>
                          <v-col cols="6">
                            <div class="text-subtitle-2 text-grey-darken-1 mb-1">
                              公司部門
                            </div>
                            <div class="sub-title">
                              永信台北 - 業務部（示意）
                            </div>
                          </v-col>
                        </v-row>
                      </div>

                      <template
                        v-for="(part, partIndex) in form.parts"
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
                            第{{ partIndex + 1 }}部分 {{ part.title || `（未命名）` }}
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
                                :model-value="''"
                                variant="outlined"
                                density="compact"
                                placeholder="填寫分數"
                                readonly
                                hide-details
                                class="preview-score-input"
                                style="max-width: 240px;"
                              />
                            </div>
                          </div>
                        </div>
                      </template>
                      <div
                        v-if="form.specialAchievementEnabled"
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
                          <div class="sub-title text-grey-darken-1 mb-3">
                            該員工是否有特殊事蹟 ? 若有，可填寫該員工特殊事蹟內容。
                          </div>
                          <v-radio-group
                            :model-value="true"
                            inline
                            hide-details
                            class="mb-4 mt-0"
                            density="compact"
                            disabled
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
                            label="特殊事蹟內容"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            class="bg-white"
                            disabled
                            rows="3"
                            auto-grow
                            placeholder="（評核者於實際填寫時輸入）"
                          />
                        </div>
                      </div>
                      <div
                        v-if="form.parts.length === 0"
                        class="text-grey text-center py-6"
                      >
                        尚無部分，請在左側新增
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item value="self">
                <v-row class="px-4 px-sm-6 px-md-7">
                  <v-col
                    cols="12"
                    lg="5"
                  >
                    <div class="card-title mb-5 text-blue-grey-darken-2 d-flex align-center">
                      <v-icon
                        size="20"
                        class="me-1"
                      >
                        mdi-account-edit-outline
                      </v-icon>自評表單
                    </div>
                    <v-textarea
                      v-model="form.selfAssessmentFillingInstructions"
                      label="自評填寫說明（選填）"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      placeholder="被考核人開啟自評時先看到的說明"
                      class="mb-5"
                      hide-details
                    />
                    <div
                      v-for="(q, qIndex) in form.selfAssessmentQuestions"
                      :key="qIndex"
                      class="mb-4 pt-2 pb-4 px-3 border rounded"
                    >
                      <div class="d-flex align-center mb-2">
                        <span class="text-subtitle-2">題目 {{ qIndex + 1 }}</span>
                        <v-btn
                          icon
                          variant="plain"
                          size="x-small"
                          color="red"
                          class="ms-auto"
                          @click="removeSelfAssessmentQuestion(qIndex)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      <v-text-field
                        v-model="q.title"
                        label="題目"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                        hide-details
                      />
                      <div class="mb-4">
                        <v-textarea
                          v-model="q.scoringPointsText"
                          label="評分要點（每行一項）"
                          variant="outlined"
                          density="compact"
                          rows="4"
                          hide-details
                          @blur="syncSelfAssessmentScoringPoints(qIndex)"
                        />
                      </div>
                      <v-textarea
                        v-model="q.scoringCriteria"
                        label="評分標準"
                        variant="outlined"
                        density="compact"
                        rows="8"
                        hide-details
                      />
                    </div>
                    <v-btn
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-plus"
                      class="mb-2"
                      color="teal-darken-2"
                      @click="addSelfAssessmentQuestion"
                    >
                      新增自評題目
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="7"
                  >
                    <div class="card-title font-weight-bold text-blue-grey-darken-2 d-flex align-center mb-4">
                      <v-icon
                        size="20"
                        class="me-2"
                      >
                        mdi-eye
                      </v-icon>
                      自評預覽
                    </div>
                    <v-card
                      elevation="0"
                      class="preview-card pa-4 border"
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
                        <span class="sub-title">王小明（示意）</span>
                      </div>
                      <p
                        v-if="form.selfAssessmentFillingInstructions?.trim()"
                        class="text-body-2 text-grey-darken-1 mb-4 pre-wrap"
                      >
                        {{ form.selfAssessmentFillingInstructions }}
                      </p>
                      <div
                        v-for="(q, qIndex) in form.selfAssessmentQuestions"
                        :key="'s'+qIndex"
                        class="preview-question mb-5 pa-5 rounded"
                      >
                        <div class="font-weight-bold mb-3">
                          {{ form.selfAssessmentQuestions.length > 1 ? `${qIndex + 1}. ` : '' }}{{ q.title || '（未命名題目）' }}
                        </div>
                        <ul
                          v-if="getSelfAssessmentScoringPointsList(q).length > 0"
                          class="text-grey-darken-3 mb-3 ps-5"
                        >
                          <li
                            v-for="(point, i) in getSelfAssessmentScoringPointsList(q)"
                            :key="i"
                          >
                            {{ point }}
                          </li>
                        </ul>
                        <div
                          v-if="(q.scoringCriteria || '').trim()"
                          class="text-grey-darken-3 mb-4 pre-wrap"
                        >
                          <span class="sub-title text-black">*評分標準</span><br>
                          <div class="pt-2 ps-2">
                            {{ q.scoringCriteria }}
                          </div>
                        </div>
                        <div class="w-100 d-flex justify-end">
                          <v-text-field
                            :model-value="''"
                            variant="outlined"
                            density="compact"
                            placeholder="填寫分數"
                            readonly
                            hide-details
                            class="preview-score-input"
                            style="max-width: 240px;"
                          />
                        </div>
                      </div>
                      <div
                        v-if="form.selfAssessmentQuestions.length === 0"
                        class="text-grey text-center py-6"
                      >
                        尚未新增自評題目
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <ConfirmDeleteDialog
      v-model="deletePartDialog.open"
      :max-width="360"
      title="確認刪除部分"
      :message="`確定要刪除「${deletePartDialog.partTitle || ''}」嗎？此部分內的所有題目也會一併刪除。`"
      @confirm="confirmDeletePart"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useEvaluationEditBar } from '@/composables/useEvaluationEditBar'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

definePage({
  meta: {
    title: '考核表單編輯 | Ystravel',
    login: true,
    permission: 'EVALUATION_TEMPLATE_MANAGE'
  }
})

const route = useRoute()
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const templateId = computed(() => route.params.id)
const loading = ref(true)
const editorTab = ref('evaluator')
const expandedParts = ref([])
const deletePartDialog = reactive({ open: false, partIndex: null, partTitle: '' })

const categoryOptions = ref([])
const attendanceTemplateOptions = ref([])

const selectedAttendanceWeight = computed(() => {
  const id = form.attendanceFormTemplate
  if (!id) return null
  const t = attendanceTemplateOptions.value.find(x => x._id === id || x._id?.toString() === id?.toString())
  return t?.weight ?? null
})

const partsWeightHint = computed(() => {
  const att = selectedAttendanceWeight.value
  if (att != null && att > 0) {
    const pct = Math.round((1 - att) * 100)
    return `已選擇關聯出勤表單（權重 ${Math.round(att * 100)}%），部分權重總和需為 ${pct}%`
  }
  return '請先選擇關聯出勤表單，部分權重總和需為 (100% - 出勤權重)'
})

const specialAchievementItems = [
  { title: '否', value: false },
  { title: '是', value: true }
]

const form = reactive({
  name: '',
  year: new Date().getFullYear(),
  category: null,
  attendanceFormTemplate: null,
  specialAchievementEnabled: false,
  description: '',
  fillingInstructions: '',
  confirmPrompt: '',
  parts: [],
  selfAssessmentFillingInstructions: '',
  selfAssessmentQuestions: []
})

function getEmptyPart () {
  return {
    title: '',
    weight: 0,
    subWeights: [],
    questions: [],
    order: 0
  }
}

function getEmptySubWeight () {
  return { label: '', weight: 0 }
}

function addSubWeight (partIndex) {
  const part = form.parts[partIndex]
  if (!part.subWeights) part.subWeights = []
  part.subWeights.push(getEmptySubWeight())
  if (part.subWeights.length === 1) part.subWeights.push(getEmptySubWeight())
}

function removeSubWeight (partIndex, swIndex) {
  form.parts[partIndex].subWeights.splice(swIndex, 1)
}

function subWeightsSumMatch (part) {
  const sw = part.subWeights || []
  if (sw.length <= 1) return true
  const sum = sw.reduce((s, x) => s + (Number(x.weight) || 0), 0)
  const total = Number(part.weight) || 0
  return Math.abs(sum - total) <= 0.01
}

function getEmptyQuestion () {
  return {
    title: '',
    scoringPoints: [],
    scoringPointsText: '',
    scoringCriteria: '',
    order: 0
  }
}

function addPart () {
  form.parts.push(getEmptyPart())
  expandedParts.value = [form.parts.length - 1]
}

function addQuestion (partIndex) {
  const q = getEmptyQuestion()
  form.parts[partIndex].questions.push(q)
}

function removeQuestion (partIndex, qIndex) {
  form.parts[partIndex].questions.splice(qIndex, 1)
}

function openDeletePartDialog (partIndex) {
  const part = form.parts[partIndex]
  deletePartDialog.partIndex = partIndex
  deletePartDialog.partTitle = part?.title?.trim() || `部分 ${partIndex + 1}`
  deletePartDialog.open = true
}

function confirmDeletePart () {
  const partIndex = deletePartDialog.partIndex
  if (partIndex == null) return
  form.parts.splice(partIndex, 1)
  const current = Array.isArray(expandedParts.value)
    ? expandedParts.value
    : (expandedParts.value != null ? [expandedParts.value] : [])
  expandedParts.value = current
    .filter(v => v !== partIndex)
    .map(v => (v > partIndex ? v - 1 : v))
  deletePartDialog.open = false
}

function syncScoringPoints (partIndex, qIndex) {
  const q = form.parts[partIndex].questions[qIndex]
  const text = q.scoringPointsText || ''
  q.scoringPoints = text.split('\n').map(s => s.trim()).filter(Boolean)
}

function addSelfAssessmentQuestion () {
  form.selfAssessmentQuestions.push(getEmptyQuestion())
}

function removeSelfAssessmentQuestion (qIndex) {
  form.selfAssessmentQuestions.splice(qIndex, 1)
}

function syncSelfAssessmentScoringPoints (qIndex) {
  const q = form.selfAssessmentQuestions[qIndex]
  const text = q.scoringPointsText || ''
  q.scoringPoints = text.split('\n').map(s => s.trim()).filter(Boolean)
}

function getSelfAssessmentScoringPointsList (q) {
  if (!q) return []
  const text = (q.scoringPointsText || '').trim()
  const fromText = text ? text.split('\n').map(s => s.trim()).filter(Boolean) : []
  if (fromText.length > 0) return fromText
  return (q.scoringPoints || [])
}

function getScoringPointsList (part, qIndex) {
  const q = part.questions[qIndex]
  if (!q) return []
  const text = (q.scoringPointsText || '').trim()
  const fromText = text ? text.split('\n').map(s => s.trim()).filter(Boolean) : []
  if (fromText.length > 0) return fromText
  return (q.scoringPoints || [])
}

function getScoringCriteria (part, qIndex) {
  const q = part.questions[qIndex]
  return q?.scoringCriteria?.trim() || ''
}

async function fetchAttendanceTemplates () {
  try {
    const { data } = await apiAuth.get('/attendance-form-templates', {
      params: { itemsPerPage: 500 }
    })
    attendanceTemplateOptions.value = data?.result?.data || []
  } catch {
    attendanceTemplateOptions.value = []
  }
}

async function nameUniqueRule (v) {
  const name = (v || '').trim()
  if (!name) return true
  const yearNum = form.year != null ? Number(form.year) : null
  if (!yearNum || yearNum < 2000 || yearNum > 2100) return true
  try {
    const { data } = await apiAuth.get('/evaluation-templates/check-unique', {
      params: { name, year: yearNum, excludeId: templateId.value }
    })
    return data?.unique !== false || '同年度已存在相同名稱的表單模板'
  } catch {
    return true
  }
}

function prepareFormForEdit (template) {
  form.name = template.name || ''
  form.year = template.year ?? new Date().getFullYear()
  form.category = template.category?._id || template.category || null
  form.attendanceFormTemplate = template.attendanceFormTemplate?._id || template.attendanceFormTemplate || null
  form.specialAchievementEnabled = Boolean(template.specialAchievementEnabled)
  form.description = template.description || ''
  form.fillingInstructions = template.fillingInstructions || ''
  form.confirmPrompt = template.confirmPrompt || ''
  form.selfAssessmentFillingInstructions = template.selfAssessmentFillingInstructions || ''
  form.selfAssessmentQuestions = (template.selfAssessmentQuestions || []).map(q => ({
    ...q,
    scoringPointsText: (q.scoringPoints || []).join('\n')
  }))
  form.parts = (template.parts || []).map(p => ({
    ...p,
    subWeights: Array.isArray(p.subWeights) ? p.subWeights.map(sw => ({ ...sw })) : [],
    questions: (p.questions || []).map(q => ({
      ...q,
      scoringPointsText: (q.scoringPoints || []).join('\n')
    }))
  }))
  if (form.parts.length === 0) {
    form.parts = [getEmptyPart()]
  }
}

function prepareFormForSubmit () {
  const parts = form.parts.map((p, i) => {
    const subWeights = (p.subWeights || []).filter(sw => sw.label || (sw.weight && sw.weight > 0))
    return {
      title: p.title,
      weight: Number(p.weight) || 0,
      subWeights: subWeights.length > 1 ? subWeights : [],
      order: i,
      questions: (p.questions || []).map((q, qi) => {
      const pointsText = q.scoringPointsText || ''
      const points = pointsText.split('\n').map(s => s.trim()).filter(Boolean)
      return {
        title: q.title,
        scoringPoints: points,
        scoringCriteria: q.scoringCriteria || '',
        order: qi
      }
    })
    }
  })
  return {
    name: form.name.trim(),
    year: form.year,
    category: form.category || null,
    attendanceFormTemplate: form.attendanceFormTemplate || null,
    specialAchievementEnabled: Boolean(form.specialAchievementEnabled),
    description: form.description?.trim() || '',
    fillingInstructions: form.fillingInstructions?.trim() || '',
    confirmPrompt: form.confirmPrompt?.trim() || '',
    parts,
    selfAssessmentFillingInstructions: form.selfAssessmentFillingInstructions?.trim() || '',
    selfAssessmentQuestions: (form.selfAssessmentQuestions || []).map((q, qi) => {
      const pointsText = q.scoringPointsText || ''
      const points = pointsText.split('\n').map(s => s.trim()).filter(Boolean)
      return {
        title: (q.title || '').trim(),
        scoringPoints: points,
        scoringCriteria: q.scoringCriteria || '',
        order: qi
      }
    }).filter((q) => q.title.length > 0)
  }
}

async function fetchCategories () {
  try {
    const { data } = await apiAuth.get('/evaluation-template-categories')
    categoryOptions.value = data?.result || []
  } catch {
    categoryOptions.value = []
  }
}

async function fetchTemplate () {
  loading.value = true
  try {
    const [templateRes] = await Promise.all([
      apiAuth.get(`/evaluation-templates/${templateId.value}`),
      fetchCategories(),
      fetchAttendanceTemplates()
    ])
    const { data } = templateRes
    prepareFormForEdit(data.result)
    expandedParts.value = []
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    router.push('/evaluationTemplateManagement/')
  } finally {
    loading.value = false
  }
}

async function submitForm () {
  if (!form.name?.trim()) {
    createSnackbar({
      text: '請輸入表單名稱',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  const yearNum = form.year != null ? Number(form.year) : null
  if (yearNum >= 2000 && yearNum <= 2100) {
    try {
      const { data } = await apiAuth.get('/evaluation-templates/check-unique', {
        params: {
          name: form.name.trim(),
          year: yearNum,
          excludeId: templateId.value
        }
      })
      if (!data?.unique) {
        createSnackbar({
          text: '同年度已存在相同名稱的表單模板',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }
    } catch {
      // 檢查失敗時仍允許送出，由後端驗證
    }
  }
  const payload = prepareFormForSubmit()
  if (payload.parts.length > 0 && !payload.attendanceFormTemplate) {
    createSnackbar({
      text: '請選擇關聯的出勤表單模板',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  let expectedTotal = 1
  if (payload.parts.length > 0 && payload.attendanceFormTemplate) {
    const att = attendanceTemplateOptions.value.find(
      t => (t._id === payload.attendanceFormTemplate) || (t._id?.toString() === payload.attendanceFormTemplate?.toString())
    )
    const attWeight = att?.weight ?? 0
    expectedTotal = 1 - attWeight
  }
  for (const p of payload.parts) {
    if (p.subWeights && p.subWeights.length > 1) {
      const emptyLabel = p.subWeights.find((sw) => !(sw?.label || '').trim())
      if (emptyLabel) {
        createSnackbar({
          text: `部分「${p.title || '未命名'}」的拆開加權項目請填寫名稱`,
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }
      const subSum = p.subWeights.reduce((s, x) => s + (Number(x.weight) || 0), 0)
      const partWeight = Number(p.weight) || 0
      if (Math.abs(subSum - partWeight) > 0.01) {
        createSnackbar({
          text: `部分「${p.title || '未命名'}」的子權重總和須等於該部分加權`,
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }
    }
  }
  const totalWeight = payload.parts.reduce((s, p) => s + (p.weight || 0), 0)
  if (payload.parts.length > 0 && Math.abs(totalWeight - expectedTotal) > 0.01) {
    createSnackbar({
      text: `各部分的加權總和必須為 ${Math.round(expectedTotal * 100)}%（出勤權重 ${Math.round((1 - expectedTotal) * 100)}%）`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  try {
    await apiAuth.patch(`/evaluation-templates/${templateId.value}`, payload)
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

function goBack () {
  router.push('/evaluationTemplateManagement/')
}

const evaluationEditBar = useEvaluationEditBar()

onMounted(() => {
  evaluationEditBar.register({
    loading,
    submitForm,
    goBack
  })
  fetchTemplate()
})

onBeforeUnmount(() => {
  evaluationEditBar.unregister()
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

.preview-score-input :deep(.v-field__input) {
  cursor: default;
  background-color: #fff;
}
</style>
