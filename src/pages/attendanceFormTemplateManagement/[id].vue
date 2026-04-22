<template>
  <v-container max-width="1000">
    <v-row class="pt-md-4 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 pb-4 px-3">
          <v-card-text
            v-if="loading"
            class="text-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="teal-darken-2"
              size="48"
            />
            <div class="mt-3 text-grey-darken-1">
              載入中...
            </div>
          </v-card-text>

          <template v-else>
            <v-card-text class="px-4 px-sm-6 py-5">
              <!-- 基本資料 -->
              <v-row>
                <v-col
                  cols="12"
                  class="sub-title d-flex align-center justify-center py-2"
                >
                  <v-row class="flex-grow-1">
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      class="d-flex align-center justify-center text-blue-grey-darken-2 text-subtitle-1 font-weight-medium"
                    >
                      <v-icon
                        size="18"
                        class="me-2"
                      >
                        mdi-view-list-outline
                      </v-icon>
                      基本資料
                    </v-col>
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
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
                  md="4"
                >
                  <v-text-field
                    v-model="form.name"
                    label="* 表單名稱"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v?.trim() || '請輸入表單名稱']"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
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
                      v => (v != null && v !== '' && !isNaN(v)) || '請輸入年度',
                      v => (v >= 2000 && v <= 2100) || '年度需介於 2000-2100'
                    ]"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-text-field
                    v-model.number="form.weight"
                    label="* 出勤權重"
                    variant="outlined"
                    density="compact"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.2 表示 20%"
                    :rules="[
                      v => (v != null && v !== '' && !isNaN(v)) || '請輸入出勤權重',
                      v => (v >= 0 && v <= 1) || '出勤權重需介於 0-1'
                    ]"
                  />
                </v-col>
              </v-row>

              <!-- 遲到 -->
              <v-row class="mt-6">
                <v-col
                  cols="12"
                  class="sub-title d-flex align-center justify-center py-2"
                >
                  <v-row class="flex-grow-1">
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      class="d-flex align-center justify-center text-blue-grey-darken-2 text-subtitle-1 font-weight-medium"
                    >
                      <v-icon
                        size="18"
                        class="me-2"
                      >
                        mdi-clock-alert-outline
                      </v-icon>
                      遲到
                    </v-col>
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-table
                    density="compact"
                    class="rounded border"
                  >
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th class="text-left pa-3 font-weight-bold">
                          指標
                        </th>
                        <th class="text-left pa-3 font-weight-bold">
                          計算方式
                        </th>
                        <th class="text-left pa-3 font-weight-bold">
                          上限
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="pa-3 align-middle">
                          遲到次數
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center flex-wrap gap-2">
                            <span>每次扣</span>
                            <v-text-field
                              v-model.number="form.tardyCount.pointsPerOccurrence"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              hide-details
                              class="mx-1"
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center flex-wrap gap-2">
                            <span>最高</span>
                            <v-text-field
                              v-model.number="form.tardyCount.maxPoints"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              class="mx-1"
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td class="pa-3 align-middle">
                          遲到累計分鐘
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center flex-wrap gap-2">
                            <span>超過</span>
                            <v-text-field
                              v-model.number="form.tardyMinutes.startMinutes"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              class="mx-1"
                              style="max-width: 70px;"
                            />
                            <span>分鐘起，每滿</span>
                            <v-text-field
                              v-model.number="form.tardyMinutes.minutesPerInterval"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              class="mx-1"
                              style="max-width: 70px;"
                            />
                            <span>分鐘扣</span>
                            <v-text-field
                              v-model.number="form.tardyMinutes.pointsPerInterval"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              hide-details
                              class="mx-1"
                              style="max-width: 70px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center flex-wrap gap-2">
                            <span>最高</span>
                            <v-text-field
                              v-model.number="form.tardyMinutes.maxPoints"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              class="mx-1"
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
              </v-row>

              <!-- 忘記打卡 -->
              <v-row class="mt-6">
                <v-col
                  cols="12"
                  class="sub-title d-flex align-center justify-center py-2"
                >
                  <v-row class="flex-grow-1">
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      class="d-flex align-center justify-center text-blue-grey-darken-2 text-subtitle-1 font-weight-medium"
                    >
                      <v-icon
                        size="18"
                        class="me-2"
                      >
                        mdi-credit-card-off-outline
                      </v-icon>
                      忘記打卡
                    </v-col>
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-table
                    density="compact"
                    class="rounded border"
                  >
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th class="text-left py-3 accordion-button font-weight-bold">
                          <div class="d-flex align-center gap-2">
                            <span>忘打卡次數</span>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="teal-darken-1"
                              class="ms-1"
                              @click="addForgotPunchTier"
                            >
                              <v-icon>mdi-plus</v-icon>
                            </v-btn>
                          </div>
                        </th>
                        <th class="text-left pa-3 font-weight-bold">
                          扣分
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(tier, tIdx) in form.forgotPunch.tiers"
                        :key="tIdx"
                      >
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <v-text-field
                              v-model.number="tier.minCount"
                              variant="outlined"
                              density="compact"
                              type="number"
                              min="0"
                              hide-details
                              style="max-width: 70px;"
                            />
                            <span class="mx-1">-</span>
                            <v-text-field
                              v-model.number="tier.maxCount"
                              variant="outlined"
                              density="compact"
                              type="number"
                              min="0"
                              hide-details
                              style="max-width: 70px;"
                            />
                            <span class="mx-1">次</span>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="red-lighten-1"
                              @click="removeForgotPunchTier(tIdx)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <span>每次扣</span>
                            <v-text-field
                              v-model.number="tier.pointsPerOccurrence"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              hide-details
                              class="mx-1"
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <v-text-field
                              v-model.number="form.forgotPunch.overCount"
                              variant="outlined"
                              density="compact"
                              type="number"
                              min="0"
                              placeholder="X"
                              hide-details
                              style="max-width: 70px;"
                            />
                            <span class="mx-1">次以上</span>
                          </div>
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <span>每次扣</span>
                            <v-text-field
                              v-model.number="form.forgotPunch.overPointsPerOccurrence"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              class="mx-1"
                              hide-details
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-grey-lighten-4">
                        <td class="pa-3 font-weight-bold">
                          上限
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <v-text-field
                              v-model.number="form.forgotPunch.maxPoints"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              style="max-width: 80px;"
                            />
                            <span class="mx-1">分</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
              </v-row>

              <!-- 事假 -->
              <v-row class="mt-6">
                <v-col
                  cols="12"
                  class="sub-title d-flex align-center justify-center py-2"
                >
                  <v-row class="flex-grow-1">
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
                      class="d-flex align-center justify-center text-blue-grey-darken-2 text-subtitle-1 font-weight-medium"
                    >
                      <v-icon
                        size="18"
                        class="me-2"
                      >
                        mdi-calendar-remove-outline
                      </v-icon>
                      事假
                    </v-col>
                    <v-col
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="blue-grey-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-table
                    density="compact"
                    class="rounded border"
                  >
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th class="text-left pa-3 font-weight-bold">
                          <div class="d-flex align-center gap-2">
                            <span>累積請假時數</span>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="teal-darken-1"
                              class="ms-1"
                              @click="addPersonalLeaveTier"
                            >
                              <v-icon>mdi-plus</v-icon>
                            </v-btn>
                          </div>
                        </th>
                        <th class="text-left pa-3 font-weight-bold">
                          扣分
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(tier, tIdx) in form.personalLeave.tiers"
                        :key="tIdx"
                      >
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <v-text-field
                              v-model.number="tier.minHours"
                              variant="outlined"
                              density="compact"
                              type="number"
                              min="0"
                              hide-details
                              style="max-width: 70px;"
                            />
                            <span class="mx-1">-</span>
                            <v-text-field
                              v-model.number="tier.maxHours"
                              variant="outlined"
                              density="compact"
                              type="number"
                              min="0"
                              hide-details
                              style="max-width: 70px;"
                            />
                            <span class="mx-1">小時</span>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="red"
                              @click="removePersonalLeaveTier(tIdx)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <span>扣</span>
                            <v-text-field
                              v-model.number="tier.points"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              hide-details
                              class="mx-1"
                              style="max-width: 80px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td class="pa-3">
                          <div class="d-flex align-center flex-wrap gap-2">
                            <span>每增加</span>
                            <v-text-field
                              v-model.number="form.personalLeave.incrementalHours"
                              variant="outlined"
                              density="compact"
                              type="number"
                              placeholder="小時"
                              hide-details
                              class="mx-1"
                              style="max-width: 70px;"
                            />
                            <span>小時再加</span>
                            <v-text-field
                              v-model.number="form.personalLeave.incrementalPoints"
                              variant="outlined"
                              density="compact"
                              type="number"
                              step="0.1"
                              hide-details
                              class="mx-1"
                              style="max-width: 70px;"
                            />
                            <span>分</span>
                          </div>
                        </td>
                        <td class="pa-3" />
                      </tr>
                      <tr class="bg-grey-lighten-4">
                        <td class="pa-3 font-weight-bold">
                          上限
                        </td>
                        <td class="pa-3">
                          <div class="d-flex align-center gap-2">
                            <v-text-field
                              v-model.number="form.personalLeave.maxPoints"
                              variant="outlined"
                              density="compact"
                              type="number"
                              hide-details
                              style="max-width: 80px;"
                            />
                            <span class="mx-1">分</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
              </v-row>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useAttendanceFormEditBar } from '@/composables/useAttendanceFormEditBar'

definePage({
  meta: {
    title: '出勤表單編輯 | Ystravel',
    login: true,
    permission: 'ATTENDANCE_FORM_TEMPLATE_MANAGEMENT_READ'
  }
})

const route = useRoute()
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const templateId = computed(() => route.params.id)
const loading = ref(true)

const form = reactive({
  name: '',
  year: new Date().getFullYear(),
  weight: 0,
  tardyCount: {
    pointsPerOccurrence: 0.5,
    maxPoints: 5
  },
  tardyMinutes: {
    startMinutes: 30,
    minutesPerInterval: 30,
    pointsPerInterval: 1,
    maxPoints: 10
  },
  forgotPunch: {
    tiers: [],
    overCount: null,
    overPointsPerOccurrence: 0,
    maxPoints: 0
  },
  personalLeave: {
    tiers: [],
    incrementalHours: null,
    incrementalPoints: 0,
    maxPoints: 0
  }
})

function addForgotPunchTier () {
  const tiers = form.forgotPunch.tiers
  const lastMax = tiers.length ? tiers[tiers.length - 1].maxCount : 0
  form.forgotPunch.tiers.push({
    minCount: lastMax + 1,
    maxCount: lastMax + 2,
    pointsPerOccurrence: 0
  })
}

function removeForgotPunchTier (idx) {
  form.forgotPunch.tiers.splice(idx, 1)
}

function addPersonalLeaveTier () {
  const tiers = form.personalLeave.tiers
  const lastMax = tiers.length ? tiers[tiers.length - 1].maxHours : 0
  form.personalLeave.tiers.push({
    minHours: lastMax + 1,
    maxHours: lastMax + 2,
    points: 0
  })
}

function removePersonalLeaveTier (idx) {
  form.personalLeave.tiers.splice(idx, 1)
}

function prepareFormForEdit (data) {
  form.name = data.name || ''
  form.year = data.year ?? new Date().getFullYear()
  form.weight = data.weight != null ? Number(data.weight) : 0
  form.tardyCount = {
    pointsPerOccurrence: data.tardyCount?.pointsPerOccurrence ?? 0.5,
    maxPoints: data.tardyCount?.maxPoints ?? 5
  }
  form.tardyMinutes = {
    startMinutes: data.tardyMinutes?.startMinutes ?? 30,
    minutesPerInterval: data.tardyMinutes?.minutesPerInterval ?? 30,
    pointsPerInterval: data.tardyMinutes?.pointsPerInterval ?? 1,
    maxPoints: data.tardyMinutes?.maxPoints ?? 10
  }
  form.forgotPunch = {
    tiers: Array.isArray(data.forgotPunch?.tiers)
      ? data.forgotPunch.tiers.map(t => ({
          minCount: t.minCount ?? 0,
          maxCount: t.maxCount ?? 0,
          pointsPerOccurrence: t.pointsPerOccurrence ?? 0
        }))
      : [],
    overCount: data.forgotPunch?.overCount ?? null,
    overPointsPerOccurrence: data.forgotPunch?.overPointsPerOccurrence ?? 0,
    maxPoints: data.forgotPunch?.maxPoints ?? 0
  }
  form.personalLeave = {
    tiers: Array.isArray(data.personalLeave?.tiers)
      ? data.personalLeave.tiers.map(t => ({
          minHours: t.minHours ?? 0,
          maxHours: t.maxHours ?? 0,
          points: t.points ?? 0
        }))
      : [],
    incrementalHours: data.personalLeave?.incrementalHours ?? null,
    incrementalPoints: data.personalLeave?.incrementalPoints ?? 0,
    maxPoints: data.personalLeave?.maxPoints ?? 0
  }
}

function prepareFormForSubmit () {
  return {
    name: form.name.trim(),
    year: form.year,
    weight: Number(form.weight) || 0,
    tardyCount: {
      pointsPerOccurrence: Number(form.tardyCount.pointsPerOccurrence) || 0,
      maxPoints: Number(form.tardyCount.maxPoints) || 0
    },
    tardyMinutes: {
      startMinutes: Number(form.tardyMinutes.startMinutes) || 0,
      minutesPerInterval: Number(form.tardyMinutes.minutesPerInterval) || 0,
      pointsPerInterval: Number(form.tardyMinutes.pointsPerInterval) || 0,
      maxPoints: Number(form.tardyMinutes.maxPoints) || 0
    },
    forgotPunch: {
      tiers: form.forgotPunch.tiers.map(t => ({
        minCount: Number(t.minCount) || 0,
        maxCount: Number(t.maxCount) || 0,
        pointsPerOccurrence: Number(t.pointsPerOccurrence) || 0
      })),
      overCount: form.forgotPunch.overCount != null && form.forgotPunch.overCount !== ''
        ? Number(form.forgotPunch.overCount)
        : null,
      overPointsPerOccurrence: Number(form.forgotPunch.overPointsPerOccurrence) || 0,
      maxPoints: Number(form.forgotPunch.maxPoints) || 0
    },
    personalLeave: {
      tiers: form.personalLeave.tiers.map(t => ({
        minHours: Number(t.minHours) || 0,
        maxHours: Number(t.maxHours) || 0,
        points: Number(t.points) || 0
      })),
      incrementalHours: form.personalLeave.incrementalHours != null && form.personalLeave.incrementalHours !== ''
        ? Number(form.personalLeave.incrementalHours)
        : null,
      incrementalPoints: Number(form.personalLeave.incrementalPoints) || 0,
      maxPoints: Number(form.personalLeave.maxPoints) || 0
    }
  }
}

async function fetchTemplate () {
  loading.value = true
  try {
    const { data } = await apiAuth.get(`/attendance-form-templates/${templateId.value}`)
    prepareFormForEdit(data.result)
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    router.push('/attendanceFormTemplateManagement/')
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
  const w = form.weight
  if (w == null || w === '' || isNaN(w) || w < 0 || w > 1) {
    createSnackbar({
      text: '請輸入出勤權重（0-1）',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  const payload = prepareFormForSubmit()
  try {
    await apiAuth.patch(`/attendance-form-templates/${templateId.value}`, payload)
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

function goBack () {
  router.push('/attendanceFormTemplateManagement/')
}

const attendanceFormEditBar = useAttendanceFormEditBar()

onMounted(() => {
  attendanceFormEditBar.register({
    loading,
    submitForm,
    goBack
  })
  fetchTemplate()
})

onBeforeUnmount(() => {
  attendanceFormEditBar.unregister()
})
</script>
