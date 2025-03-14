<template>
  <v-container max-width="2160">
    <v-row class="pt-md-5">
      <v-col 
        cols="12"
        lg="2"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 ps-lg-6 pe-lg-0"
          >
            <v-card class="elevation-4 rounded-lg py-6 px-4 px-sm-2 px-xl-4">
              <v-card-title class="font-weight-bold d-flex align-center">
                搜尋條件
              </v-card-title>
              <v-card-text class="pa-2">
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.year"
                      :items="searchYearOptions"
                      label="年度"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.theme"
                      :items="themeOptions"
                      label="行銷主題"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                    />
                    <v-date-input
                      v-model="searchCriteria.createdDateRange"
                      label="建立日期"
                      variant="outlined"
                      density="compact"
                      hide-details
                      multiple="range"
                      prepend-icon
                      clearable
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      class="mb-6"
                    />
                    <v-row class="d-flex justify-space-between">
                      <v-col cols="3">
                        <v-btn
                          color="grey"
                          width="40"
                          block
                          @click="resetSearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="9"
                        class="ps-0"
                      >
                        <v-btn
                          color="cyan-darken-2"
                          prepend-icon="mdi-magnify"
                          :loading="isLoading"
                          block
                          @click="performSearch"
                        >
                          搜尋
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-1 mx-0 mx-sm-4 ms-md-4 me-md-4 mb-4 bg-white">
          <!-- 標題區塊 -->
          <v-col 
            cols="12"
            class="ps-3 pb-6 d-flex align-center"
          >
            <h3
              class="d-inline"
            >
              行銷預算管理
            </h3>
          </v-col>

          <!-- 表格區塊 -->
          <v-col cols="12">
            <div class="d-flex align-center mb-4">
              <v-btn
                color="blue-grey-darken-1"
                variant="outlined"
                prepend-icon="mdi-plus"
                @click="openDialog()"
              >
                新增預算表
              </v-btn>
              <div
                style="width: 260px;"
                class="ms-auto d-flex align-center"
              >
                <v-icon
                  v-tooltip:start="'可搜尋備註、建立者'"
                  icon="mdi-information"
                  size="small"
                  color="blue-grey-darken-2"
                  class="me-2"
                />
                <v-text-field
                  v-model="quickSearchText"
                  label="快速搜尋"
                  append-inner-icon="mdi-magnify"
                  :loading="isLoading"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleQuickSearch"
                />
              </div>
            </div>
          </v-col>
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              v-model:sort-by="tableSortBy"
              density="compact"
              :headers="headers"
              :items="items"
              :items-length="totalItems"
              :items-per-page-options="[10, 20, 50, 100]"
              :loading="isLoading"
              class="elevation-0 rounded-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #[`item.actions`]="{ item }">
                <v-btn
                  icon
                  color="light-blue-darken-4"
                  variant="plain"
                  :size="buttonSize"
                  @click="editItem(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <template #[`item.annualTotalBudget`]="{ item }">
                {{ formatNumber(item.annualTotalBudget) }}
              </template>
              <template #[`item.totalBudget`]="{ item }">
                {{ formatNumber(item.totalBudget) }}
              </template>
              <template #[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #[`item.note`]="{ item }">
                <template v-if="item.note">
                  <v-menu
                    location="top"
                    transition="fade-transition"
                    :close-on-content-click="true"
                    :close-on-back="true"
                  >
                    <template #activator="{ props }">
                      <div 
                        v-bind="props"
                        class="note-cell"
                      >
                        {{ item.note }}
                      </div>
                    </template>
                    <v-card
                      min-width="300"
                      max-width="400"
                      class="rounded-lg menu-card"
                      elevation="3"
                    >
                      <v-card-text class="pa-0">
                        <div class="menu-header px-3 py-2">
                          <v-icon
                            size="16"
                            color="white"
                            class="me-2"
                          >
                            mdi-text-box
                          </v-icon>
                          <span class="text-white text-subtitle-2">備註內容</span>
                        </div>
                        <div class="menu-card-text pa-4 pt-3">
                          {{ item.note }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      max-width="2600"
      :fullscreen="!smAndUp"
    >
      <v-form
        ref="form"
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg pb-4">
          <div class="card-title px-6 py-6 d-flex justify-space-between align-center">
            {{ dialog.id ? '編輯預算表' : '新增預算表' }}
            <v-btn
              icon
              color="red-lighten-1"
              variant="plain"
              :size="buttonSize"
              @click="closeDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-card-text>
            <div
              v-if="isLoadingBudget"
              class="d-flex justify-center align-center"
              style="min-height: 300px;"
            >
              <v-progress-circular
                indeterminate
                color="deep-purple-darken-2"
                size="64"
              />
            </div>
            <template v-else>
              <!-- 年度和主題選擇 -->
              <v-row class="mb-6">
                <v-col
                  cols="3"
                >
                  <v-text-field
                    v-model="year.value.value"
                    :error-messages="year.errorMessage.value"
                    label="*年度"
                    variant="outlined"
                    density="compact"
                    type="number"
                    min="1911"
                    max="9999"
                    hide-details
                    class="mb-6"
                    @blur="validateYear"
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <v-autocomplete
                    v-model="theme.value.value"
                    :error-messages="theme.errorMessage.value"
                    :items="themeOptions"
                    item-title="name"
                    item-value="_id"
                    label="*行銷主題"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col
                  cols="3"
                >
                  <amount-input
                    v-model="annualTotalBudget.value.value"
                    :error-messages="annualTotalBudget.errorMessage.value"
                    label="*年度總預算"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-6"
                  />
                </v-col>
                <v-col>
                  <v-textarea
                    v-model="note.value.value"
                    :error-messages="note.errorMessage.value"
                    label="備註"
                    variant="outlined"
                    density="compact"
                    clearable
                    auto-grow
                    rows="1"
                  />
                </v-col>
              </v-row>

              <!-- 預算表格 -->
              <div class="budget-table">
                <div class="budget-table-title mb-4 d-flex align-center position-relative">
                  <div class="budget-title-center">
                    <span class="align-self-center">
                      <span class="text-orange-darken-2">{{ year.value.value ? `${year.value.value}` : '( 請先選擇年度 )' }}</span> 
                      年度 
                      <span class="text-pink-darken-1">{{ theme.value.value ? getThemeName(theme.value.value) : '( 請先選擇行銷主題 )' }}</span> 
                      行銷廣告預算表
                    </span>
                  </div>
                  <div class="budget-title-right d-flex align-center ms-auto me-1">
                    <span
                      class="text-grey-darken-1 me-2"
                      style="font-size: 16px;"
                    >預算差異 : </span>
                    <span
                      :class="getBudgetDifferenceClass"
                      style="font-size: 16px;"
                    >{{ getBudgetDifference === 0 ? '0' : formatNumber(getBudgetDifference) }}</span>
                  </div>
                </div>

                <v-table class="budget-grid">
                  <!-- 表頭 -->
                  <thead class="budget-header">
                    <tr>
                      <th class="delete-button-col" />
                      <th class="channel-col">
                        <span class="ms-10 me-3">廣告渠道</span>
                        <!-- 渠道新增按鈕 -->
                        <v-btn
                          v-tooltip="'新增廣告渠道'"
                          icon
                          size="24"
                          @click="addChannel"
                        >
                          <v-icon
                            size="18"
                            color="teal-darken-2"
                            style="font-weight: 900;"
                          >
                            mdi-plus
                          </v-icon>
                        </v-btn>
                      </th>
                      <th class="sort-buttons-col" />
                      <th class="add-platform-col" />
                      <th class="delete-button-col" />
                      <th class="platform-col">
                        平台
                      </th>
                      <th class="sort-buttons-col" />
                      <th class="quick-fill-col" />
                      <th
                        v-for="(month, key) in monthList"
                        :key="key"
                        class="month-col text-center"
                      >
                        {{ month }}
                      </th>
                    </tr>
                  </thead>

                  <!-- 表格內容 -->
                  <tbody>
                    <template
                      v-for="(channel, channelIndex) in budgetData"
                      :key="channelIndex"
                    >
                      <template
                        v-for="(platform, platformIndex) in channel.platforms"
                        :key="`${channelIndex}-${platformIndex}`"
                      >
                        <tr :class="{ 'row-odd': channelIndex % 2 === 0 }">
                          <!-- 渠道名稱和刪除按鈕 -->
                          <template v-if="platformIndex === 0">
                            <td
                              v-if="platformIndex === 0"
                              class="delete-button-col"
                              :rowspan="channel.platforms.length"
                            >
                              <v-btn
                                v-if="budgetData.length > 1"
                                v-tooltip="'刪除廣告渠道'"
                                icon
                                size="24"
                                color="red-lighten-1"
                                class="delete-button"
                                @click="removeChannel(channelIndex)"
                              >
                                <v-icon size="14">
                                  mdi-minus
                                </v-icon>
                              </v-btn>
                            </td>
                            <td
                              class="channel-col pe-1"
                              :rowspan="channel.platforms.length"
                            >
                              <div class="d-flex align-center">
                                <v-autocomplete
                                  v-model="channel.channelId"
                                  :items="channelOptions"
                                  item-title="name"
                                  item-value="_id"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  class="channel-select"
                                  @update:model-value="(val) => handleChannelChange(val, channelIndex)"
                                />
                              </div>
                            </td>
                            <td
                              class="sort-buttons-col"
                              :rowspan="channel.platforms.length"
                            >
                              <div class="d-flex flex-column align-center">
                                <v-btn
                                  v-tooltip="'上移'"
                                  icon="mdi-chevron-up"
                                  size="24"
                                  density="compact"
                                  variant="text"
                                  :disabled="channelIndex === 0"
                                  @click="moveChannel(channelIndex, 'up')"
                                />
                                <v-btn
                                  v-tooltip="'下移'"
                                  icon="mdi-chevron-down"
                                  size="24"
                                  density="compact"
                                  variant="text"
                                  :disabled="channelIndex === budgetData.length - 1"
                                  @click="moveChannel(channelIndex, 'down')"
                                />
                              </div>
                            </td>
                            <td
                              class="add-platform-col"
                              :rowspan="channel.platforms.length"
                            >
                              <v-btn
                                v-tooltip="'新增平台'"
                                icon
                                size="24"
                                color="blue-grey-darken-2"
                                @click="addPlatform(channelIndex)"
                              >
                                <v-icon size="14">
                                  mdi-plus
                                </v-icon>
                              </v-btn>
                            </td>
                          </template>

                          <!-- 平台選擇和刪除按鈕 -->
                          <td class="delete-button-col">
                            <v-btn
                              v-if="channel.platforms.length > 1"
                              v-tooltip="'刪除平台'"
                              icon
                              size="24"
                              color="amber-darken-4"
                              class="delete-button"
                              @click="removePlatform(channelIndex, platformIndex)"
                            >
                              <v-icon size="14">
                                mdi-minus
                              </v-icon>
                            </v-btn>
                          </td>
                          <td class="platform-col">
                            <v-autocomplete
                              v-model="platform.platformId"
                              :items="getFilteredPlatformOptions(channel.channelId)"
                              item-title="name"
                              item-value="_id"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="platform-select"
                            />
                          </td>
                          <!-- 平台排序按鈕 -->
                          <td class="sort-buttons-col">
                            <div class="d-flex flex-column align-center">
                              <v-btn
                                v-tooltip="'上移'"
                                icon="mdi-chevron-up"
                                size="24"
                                density="compact"
                                variant="text"
                                :disabled="platformIndex === 0"
                                @click="movePlatform(channelIndex, platformIndex, 'up')"
                              />
                              <v-btn
                                v-tooltip="'下移'"
                                icon="mdi-chevron-down"
                                size="24"
                                density="compact"
                                variant="text"
                                :disabled="platformIndex === channel.platforms.length - 1"
                                @click="movePlatform(channelIndex, platformIndex, 'down')"
                              />
                            </div>
                          </td>

                          <!-- 快速填入按鈕 -->
                          <td class="quick-fill-col">
                            <div class="h-100 py-2 d-flex flex-column align-center justify-space-between">
                              <v-btn
                                v-tooltip="'快速填入所有月份金額'"
                                icon
                                size="20"
                                color="teal-darken-2"
                                @click="showQuickFillDialog(channelIndex, platformIndex)"
                              >
                                <v-icon size="14">
                                  mdi-pencil-plus-outline
                                </v-icon>
                              </v-btn>
                              <v-btn
                                v-tooltip="'刪除所有月份金額'"
                                icon
                                size="20"
                                color="red-lighten-1"
                                @click="clearAllMonths(channelIndex, platformIndex)"
                              >
                                <v-icon size="14">
                                  mdi-eraser
                                </v-icon>
                              </v-btn>
                            </div>
                          </td>

                          <!-- 月份金額輸入 -->
                          <td
                            v-for="monthKey in Object.keys(monthList)"
                            :key="monthKey"
                            class="month-col"
                          >
                            <amount-input
                              v-model="platform.budget[monthKey]"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="month-input"
                            />
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </v-table>
              </div>
            </template>
          </v-card-text>

          <v-card-actions class="px-6 py-4">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="dialog.id"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  :size="buttonSize"
                  @click="confirmDeleteDialog = true"
                >
                  永久刪除
                </v-btn>
              </template>
            </v-hover>
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              :size="buttonSize"
              :loading="isSubmitting"
              @click="closeDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              type="submit"
              class="ms-2"
              :size="buttonSize"
              :loading="isSubmitting"
              :disabled="(dialog.id && !hasChanges) || isSubmitting"
            >
              送出
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除預算表"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.year}年度${originalData?.theme?.name}</span>」的預算表嗎？此操作無法復原。`"
      :expected-name="`${originalData?.year}年度${originalData?.theme?.name}`"
      input-label="預算表名稱"
      @confirm="deleteBudget"
    />

    <!-- 確認刪除渠道對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteChannelDialog.show"
      title="確認刪除廣告渠道"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'> ${getChannelName(confirmDeleteChannelDialog.channelId)} </span>」廣告渠道嗎？會連同底下平台及金額一併刪除。`"
      @confirm="confirmDeleteChannel"
    />

    <!-- 確認刪除平台對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeletePlatformDialog.show"
      title="確認刪除平台"
      :message="`確定要刪除「<span class='text-teal-darken-1' style='font-weight: 800;'> ${getPlatformName(confirmDeletePlatformDialog.platformId)} </span>」平台嗎？ 會連同底下金額一併刪除。`"
      @confirm="confirmDeletePlatform"
    />

    <!-- 快速填入金額對話框 -->
    <v-dialog
      v-model="quickFillDialog.show"
      max-width="360"
    >
      <v-form
        ref="quickFillForm"
        @submit.prevent="validateAndApplyQuickFill"
      >
        <v-card class="px-6 pt-6 pb-3">
          <div class="card-title mb-2">
            快速填入月份金額
          </div>
          <v-card-text class="px-0 pb-2">
            <div class="text-grey mb-4">
              輸入金額將填入該平台的所有月份
            </div>
            <amount-input
              v-model="quickFillDialog.amount"
              label="請輸入金額"
              variant="outlined"
              density="compact"
              :error-messages="quickFillDialog.error"
              @update:model-value="quickFillDialog.error = ''"
              @keyup.enter="validateAndApplyQuickFill"
            />
          </v-card-text>
          <v-card-actions class="px-0 pt-0">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              size="small"
              variant="outlined"
              @click="quickFillDialog.show = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              size="small"
              variant="outlined"
              type="submit"
            >
              確認
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useForm, useField } from 'vee-validate'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import * as yup from 'yup'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import { debounce } from 'lodash'
import { formatNumber } from '@/utils/format'
import AmountInput from '../components/AmountInput.vue'


// ===== 頁面設定 =====
definePage({
  meta: {
    title: '行銷預算管理 | GInternational',
    login: true,
    roles: [ UserRole.ADMIN, UserRole.MANAGER, UserRole.USER ]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const router = useRouter()
const user = useUserStore()
// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const isLoadingBudget = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  year: yup.string().required('請選擇年度'),
  theme: yup.string().required('請選擇行銷主題'),
  annualTotalBudget: yup.number().required('請輸入').min(0, '年度總預算不能小於0')
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    year: '',
    theme: '',
    annualTotalBudget: ''
  }
})

// ===== 表單欄位 =====
const year = useField('year')
const theme = useField('theme')
const note = useField('note')
const annualTotalBudget = useField('annualTotalBudget')

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// ===== 表格設定 =====
const headers = [
  { title: '建立日期', key: 'createdAt', align: 'start', sortable: true },
  { title: '年度', key: 'year', align: 'start', sortable: true },
  { title: '行銷主題', key: 'theme.name', align: 'start', sortable: true },
  { title: '年度總預算', key: 'annualTotalBudget', align: 'start', sortable: true },
  { title: '總預算預估', key: 'totalBudget', align: 'start', sortable: false },
  { title: '備註', key: 'note', align: 'start', sortable: true },
  { title: '建立者', key: 'creator.name', align: 'start', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const items = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)
const tableSortBy = ref([{ key: 'createdAt', order: 'desc' }])

// ===== 選項資料 =====
const yearOptions = ref([])
const themeOptions = ref([])
const channelOptions = ref([])
const platformOptions = ref([])

// ===== 搜尋相關設定 =====
const searchCriteria = ref({
  year: null,
  theme: null,
  createdDateRange: []
})

// ===== 月份列表 =====
const monthList = {
  JAN: '一月',
  FEB: '二月',
  MAR: '三月',
  APR: '四月',
  MAY: '五月',
  JUN: '六月',
  JUL: '七月',
  AUG: '八月',
  SEP: '九月',
  OCT: '十月',
  NOV: '十一月',
  DEC: '十二月'
}

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!dialog.value.id) return true
  return true
})

// 計算預算差異
const getBudgetDifference = computed(() => {
  const plannedTotal = parseFloat(annualTotalBudget.value.value) || 0
  const actualTotal = budgetData.value.reduce((total, channel) => {
    return total + channel.platforms.reduce((channelTotal, platform) => {
      return channelTotal + Object.values(platform.budget).reduce((monthTotal, value) => {
        return monthTotal + (parseFloat(value) || 0)
      }, 0)
    }, 0)
  }, 0)
  return plannedTotal - actualTotal
})

// 根據差異值決定顯示顏色
const getBudgetDifferenceClass = computed(() => {
  const difference = getBudgetDifference.value
  if (difference === 0) return 'text-grey-darken-1'
  if (difference > 0) return 'text-teal-darken-1'
  return 'text-red-lighten-1'
})

// ===== 預算表資料 =====
const budgetData = ref([{
  channelId: '',
  platforms: [{
    platformId: '',
    budget: {
      JAN: '',
      FEB: '',
      MAR: '',
      APR: '',
      MAY: '',
      JUN: '',
      JUL: '',
      AUG: '',
      SEP: '',
      OCT: '',
      NOV: '',
      DEC: ''
    }
  }]
}])

// 獲取 行銷主題 名稱的方法
const getThemeName = (themeId) => {
  const theme = themeOptions.value.find(t => t._id === themeId)
  return theme ? theme.name : ''
}

// ===== 確認對話框狀態 =====
const confirmDeleteChannelDialog = ref({
  show: false,
  channelId: '',
  channelIndex: -1
})

const confirmDeletePlatformDialog = ref({
  show: false,
  platformId: '',
  channelIndex: -1,
  platformIndex: -1
})

// 獲取渠道名稱的方法
const getChannelName = (channelId) => {
  const channel = channelOptions.value.find(c => c._id === channelId)
  return channel ? channel.name : ''
}

// 獲取平台名稱的方法
const getPlatformName = (platformId) => {
  const platform = platformOptions.value.find(p => p._id === platformId)
  return platform ? platform.name : ''
}

// 刪除渠道
const removeChannel = (channelIndex) => {
  const channel = budgetData.value[channelIndex]
  
  // 檢查渠道是否為空且所有平台和金額都是空的
  const isEmpty = !channel.channelId && channel.platforms.every(platform => {
    return !platform.platformId && Object.values(platform.budget).every(value => !value)
  })

  if (isEmpty && budgetData.value.length > 1) {
    // 如果是空的就直接刪除
    budgetData.value.splice(channelIndex, 1)
  } else {
    // 否則顯示確認對話框
    confirmDeleteChannelDialog.value = {
      show: true,
      channelId: channel.channelId,
      channelIndex
    }
  }
}

// 確認刪除渠道
const confirmDeleteChannel = () => {
  const { channelIndex } = confirmDeleteChannelDialog.value
  if (budgetData.value.length > 1) {
    budgetData.value.splice(channelIndex, 1)
  }
  confirmDeleteChannelDialog.value.show = false
}

// 新增平台
const addPlatform = (channelIndex) => {
  budgetData.value[channelIndex].platforms.push({
    platformId: '',
    budget: {
      JAN: '',
      FEB: '',
      MAR: '',
      APR: '',
      MAY: '',
      JUN: '',
      JUL: '',
      AUG: '',
      SEP: '',
      OCT: '',
      NOV: '',
      DEC: ''
    }
  })
}

// 刪除平台
const removePlatform = (channelIndex, platformIndex) => {
  const platforms = budgetData.value[channelIndex].platforms
  
  // 如果該渠道只有一個平台，則不允許刪除
  if (platforms.length <= 1) {
    createSnackbar({
      text: '若廣告渠道只剩一個平台，請直接刪除廣告渠道',
      snackbarProps: { color: 'orange-darken-1' }
    })
    return
  }

  const platform = platforms[platformIndex]
  
  // 檢查平台是否為空且所有金額都是空的
  const isEmpty = !platform.platformId && Object.values(platform.budget).every(value => !value)

  if (isEmpty) {
    // 如果是空的就直接刪除
    platforms.splice(platformIndex, 1)
  } else {
    // 是否顯示確認對話框
    confirmDeletePlatformDialog.value = {
      show: true,
      platformId: platform.platformId,
      channelIndex,
      platformIndex
    }
  }
}

// 確認刪除平台
const confirmDeletePlatform = () => {
  const { channelIndex, platformIndex } = confirmDeletePlatformDialog.value
  const platforms = budgetData.value[channelIndex].platforms
  
  // 再次確認是否可以刪除
  if (platforms.length > 1) {
    platforms.splice(platformIndex, 1)
  }
  confirmDeletePlatformDialog.value.show = false
}

// 新增渠道
const addChannel = () => {
  budgetData.value.push({
    channelId: '',
    platforms: [{
      platformId: '',
      budget: {
        JAN: '',
        FEB: '',
        MAR: '',
        APR: '',
        MAY: '',
        JUN: '',
        JUL: '',
        AUG: '',
        SEP: '',
        OCT: '',
        NOV: '',
        DEC: ''
      }
    }]
  })
}

// ===== 方法 =====
const loadData = async () => {
  try {
    isLoading.value = true
    const params = {
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'createdAt',
      sortOrder: tableSortBy.value[0]?.order || 'desc'
    }

    if (quickSearchText.value) {
      params.search = quickSearchText.value
    }

    if (searchCriteria.value.year) {
      params.year = searchCriteria.value.year
    }

    if (searchCriteria.value.theme) {
      params.theme = searchCriteria.value.theme
    }

    // 處理建立日期範圍
    if (searchCriteria.value.createdDateRange && searchCriteria.value.createdDateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.createdDateRange[0])
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(searchCriteria.value.createdDateRange[searchCriteria.value.createdDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)
      
      params.createdDateStart = startDate.toISOString()
      params.createdDateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/marketing/budgets/all', { params })
    if (data.success) {
      items.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

// 表格操作函數
const handleTableOptionsChange = async (options) => {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }
  await loadData()
}

// 新增搜尋用的年度選項
const searchYearOptions = ref([])

const loadOptions = async () => {
  try {
    // 先獲取所有預算資料來提取實際存在的年度
    const { data: budgetData } = await apiAuth.get('/marketing/budgets/all', { 
      params: { 
        page: 1,
        itemsPerPage: 9999 // 獲取所有資料以確保不遺漏任何年度
      } 
    })

    // 從預算資料中提取實際的年度（只用於搜尋條件）
    if (budgetData.success) {
      const uniqueYears = [...new Set(budgetData.result.data.map(item => item.year))]
      searchYearOptions.value = uniqueYears.sort((a, b) => b - a)
    }

    const [
      { data: yearData },
      { data: themeData },
      { data: channelData },
      { data: platformData }
    ] = await Promise.all([
      apiAuth.get('/marketing/budgets/years'),
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 2 } })
    ])

    if (yearData.success) {
      yearOptions.value = yearData.result
    }
    if (themeData.success) {
      themeOptions.value = themeData.result
    }
    if (channelData.success) {
      channelOptions.value = channelData.result
    }
    if (platformData.success) {
      platformOptions.value = platformData.result
    }
  } catch (error) {
    handleError(error)
  }
}

const resetSearch = () => {
  searchCriteria.value = {
    year: null,
    theme: null,
    createdDateRange: []
  }
  performSearch()
}

const performSearch = async () => {
  page.value = 1
  await loadData()
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  resetForm()
  // 重置預算表資料
  budgetData.value = [{
    channelId: '',
    platforms: [{
      platformId: '',
      budget: {
        JAN: '',
        FEB: '',
        MAR: '',
        APR: '',
        MAY: '',
        JUN: '',
        JUL: '',
        AUG: '',
        SEP: '',
        OCT: '',
        NOV: '',
        DEC: ''
      }
    }]
  }]
}

const editItem = async (item) => {
  try {
    if (!item || !item._id) {
      // console.error('無效的項目:', item)
      return
    }

    // 先打開對話框
    dialog.value = {
      open: true,
      id: item._id
    }
    
    // 設置載入狀態
    isLoadingBudget.value = true

    const { data } = await apiAuth.get(`/marketing/budgets/${item._id}`)
    if (data.success) {
      const budget = data.result
      
      year.value.value = budget.year
      theme.value.value = budget.theme._id
      note.value.value = budget.note
      annualTotalBudget.value.value = budget.annualTotalBudget
      
      // 重組數據結構
      const channelGroups = {}
      budget.items.forEach(item => {
        if (!channelGroups[item.channel._id]) {
          channelGroups[item.channel._id] = {
            channelId: item.channel._id,
            platforms: []
          }
        }
        channelGroups[item.channel._id].platforms.push({
          platformId: item.platform._id,
          budget: item.monthlyBudget
        })
      })
      
      budgetData.value = Object.values(channelGroups)
      originalData.value = budget
    }
  } catch (error) {
    console.error('編輯項目發生錯誤:', error)
    handleError(error)
    // 如果發生錯誤，關閉對話框
    closeDialog()
  } finally {
    isLoadingBudget.value = false
  }
}

const closeDialog = () => {
  try {
    dialog.value = {
      open: false,
      id: ''
    }
    originalData.value = null
    resetForm()
    // 重置預算表資料
    budgetData.value = [{
      channelId: '',
      platforms: [{
        platformId: '',
        budget: {
          JAN: '',
          FEB: '',
          MAR: '',
          APR: '',
          MAY: '',
          JUN: '',
          JUL: '',
          AUG: '',
          SEP: '',
          OCT: '',
          NOV: '',
          DEC: ''
        }
      }]
    }]
    
    // 確保所有欄位都被重置
    year.value.value = ''
    theme.value.value = ''
    note.value.value = ''
    annualTotalBudget.value.value = ''
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = handleSubmit(async (values) => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    
    // 驗證必填欄位
    if (!values.year) {
      createSnackbar({
        text: '請選擇年度',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    if (!values.theme) {
      createSnackbar({
        text: '請選擇行銷主題',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 檢查年度總預算
    if (!values.annualTotalBudget) {
      createSnackbar({
        text: '請輸入年度總預算',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 驗證預算資料
    const hasEmptyChannel = budgetData.value.some(channel => !channel.channelId)
    const hasEmptyPlatform = budgetData.value.some(channel => 
      channel.platforms.some(platform => !platform.platformId)
    )

    if (hasEmptyChannel || hasEmptyPlatform) {
      createSnackbar({
        text: '請選擇所有廣告渠道和平台',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 處理預算資料
    const submitData = {
      year: parseInt(values.year),
      theme: values.theme,
      annualTotalBudget: parseFloat(values.annualTotalBudget),
      note: values.note || '',
      items: budgetData.value.flatMap(channel => 
        channel.platforms.map(platform => ({
          channel: channel.channelId,
          platform: platform.platformId,
          monthlyBudget: {
            JAN: platform.budget.JAN === '' ? 0 : Number(platform.budget.JAN),
            FEB: platform.budget.FEB === '' ? 0 : Number(platform.budget.FEB),
            MAR: platform.budget.MAR === '' ? 0 : Number(platform.budget.MAR),
            APR: platform.budget.APR === '' ? 0 : Number(platform.budget.APR),
            MAY: platform.budget.MAY === '' ? 0 : Number(platform.budget.MAY),
            JUN: platform.budget.JUN === '' ? 0 : Number(platform.budget.JUN),
            JUL: platform.budget.JUL === '' ? 0 : Number(platform.budget.JUL),
            AUG: platform.budget.AUG === '' ? 0 : Number(platform.budget.AUG),
            SEP: platform.budget.SEP === '' ? 0 : Number(platform.budget.SEP),
            OCT: platform.budget.OCT === '' ? 0 : Number(platform.budget.OCT),
            NOV: platform.budget.NOV === '' ? 0 : Number(platform.budget.NOV),
            DEC: platform.budget.DEC === '' ? 0 : Number(platform.budget.DEC)
          }
        }))
      )
    }

    if (dialog.value.id) {
      const { data } = await apiAuth.patch(`/marketing/budgets/${dialog.value.id}`, submitData)
      if (data.success) {
        createSnackbar({
          text: '預算表更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeDialog()
        loadData()
      }
    } else {
      const { data } = await apiAuth.post('/marketing/budgets', submitData)
      if (data.success) {
        createSnackbar({
          text: '預算表新增成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        closeDialog()
        loadData()
      }
    }
  } catch (error) {
    console.error('提交表單時發生錯誤:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteBudget = async () => {
  if (!dialog.value.id) return
  
  try {
    await apiAuth.delete(`/marketing/budgets/${dialog.value.id}`)
    createSnackbar({
      text: '預算表刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    confirmDeleteDialog.value = false
  }
}

const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    user.logout()
    router.push('/login')
    createSnackbar({
      text: '登入已過期，請重新登入',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } else {
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 監聽器 =====
watch([page, itemsPerPage], () => {
  loadData()
})

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadOptions()
  ])
})

// 快速填入對話框狀態
const quickFillDialog = ref({
  show: false,
  amount: '',
  error: '',
  channelIndex: -1,
  platformIndex: -1
})

// 驗證並應用快速填入
const validateAndApplyQuickFill = () => {
  if (!quickFillDialog.value.amount) {
    quickFillDialog.value.error = '請輸入金額'
    return
  }

  const amount = Number(quickFillDialog.value.amount)
  if (isNaN(amount) || amount < 0) {
    quickFillDialog.value.error = '請輸入有效金額'
    return
  }

  const { channelIndex, platformIndex } = quickFillDialog.value
  if (channelIndex === -1 || platformIndex === -1) return

  const platform = budgetData.value[channelIndex].platforms[platformIndex]
  Object.keys(monthList).forEach(month => {
    platform.budget[month] = amount
  })

  quickFillDialog.value.show = false
  quickFillDialog.value.error = ''
}

// 顯示快速填入對話框
const showQuickFillDialog = (channelIndex, platformIndex) => {
  quickFillDialog.value = {
    show: true,
    amount: '',
    error: '',
    channelIndex,
    platformIndex
  }
}

// 在 script setup 中添加排序方法
// 移動廣告渠道
const moveChannel = (index, direction) => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= budgetData.value.length) return
  
  const temp = budgetData.value[index]
  budgetData.value[index] = budgetData.value[newIndex]
  budgetData.value[newIndex] = temp
}

// 移動平台
const movePlatform = (channelIndex, platformIndex, direction) => {
  const platforms = budgetData.value[channelIndex].platforms
  const newIndex = direction === 'up' ? platformIndex - 1 : platformIndex + 1
  if (newIndex < 0 || newIndex >= platforms.length) return
  
  const temp = platforms[platformIndex]
  platforms[platformIndex] = platforms[newIndex]
  platforms[newIndex] = temp
}

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')

// 使用 lodash 的 debounce 來優化搜尋
const debouncedSearch = debounce(() => {
  loadData()
}, 300)

// 處理快速搜尋
const handleQuickSearch = () => {
  isLoading.value = true
  page.value = 1
  debouncedSearch()
}

// 新增日期格式化函數
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  // 創建一個 UTC 日期對象
  const utcDate = new Date(dateString)
  
  // 轉換為台灣時間（UTC+8）
  const taiwanDate = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  
  const year = taiwanDate.getUTCFullYear()
  const month = String(taiwanDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taiwanDate.getUTCDate()).padStart(2, '0')
  
  return `${year}/${month}/${day}`
}

// 新增日期驗證監聽
watch(
  () => searchCriteria.value.createdDateRange,
  (newCreatedDateRange) => {
    if (newCreatedDateRange && newCreatedDateRange.length > 0) {
      const start = new Date(newCreatedDateRange[0])
      const end = new Date(newCreatedDateRange[newCreatedDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '建立日期的結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.createdDateRange = []
      }
    }
  }
)

// 在 script setup 中添加清空所有月份金額的方法
// 清空所有月份金額
const clearAllMonths = (channelIndex, platformIndex) => {
  const platform = budgetData.value[channelIndex].platforms[platformIndex]
  Object.keys(monthList).forEach(month => {
    platform.budget[month] = ''
  })
  
  createSnackbar({
    text: '已清空所有月份金額',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 在 script setup 中添加年度驗證方法
const validateYear = (event) => {
  const yearValue = event.target.value
  
  // 檢查是否為空
  if (!yearValue) {
    year.setValue('')
    return
  }

  // 轉換為數字並檢查範圍
  const numYear = parseInt(yearValue)
  if (isNaN(numYear)) {
    createSnackbar({
      text: '請輸入有效的年度',
      snackbarProps: { color: 'red-lighten-1' }
    })
    year.setValue('')
    return
  }

  if (numYear < 1911 || numYear > 9999) {
    createSnackbar({
      text: '年度必須在 1911 到 9999 之間',
      snackbarProps: { color: 'red-lighten-1' }
    })
    year.setValue('')
    return
  }

  // 使用 setValue 方法更新值
  year.setValue(numYear.toString())
}

// ===== 平台選擇相關方法 =====
// 根據廣告渠道過濾平台選項
const getFilteredPlatformOptions = (channelId) => {
  if (!channelId) return []
  return platformOptions.value.filter(platform => platform.parentId?._id === channelId)
}

// 監聽廣告渠道變更
const handleChannelChange = (channelId, channelIndex) => {
  // 當廣告渠道變更時，清空該渠道下所有平台的選擇
  const channel = budgetData.value[channelIndex]
  channel.platforms.forEach(platform => {
    platform.platformId = ''
  })
}
</script>

<style lang="scss" scoped>
.budget-table {
  overflow-x: auto;
  width: 100%;
}

.budget-table-title {
  min-height: 32px;
  font-size: 20px;
  font-weight: 600;
}

.budget-title-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  white-space: nowrap;
  z-index: 1;
}

.budget-title-right {
  position: relative;
  z-index: 2;
}

.budget-grid {
  width: 100%;
  min-width: 1720px;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px;
  border-spacing: 0;
  margin: 0;
  padding: 0;
}

.budget-header {
  background: #455A64;
  color: white;
  
  th {
    text-align: center !important;
    font-weight: 600 !important;
    white-space: nowrap;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

tbody {
  tr {
    height: 64px;
    &.row-odd {
      background: #f3f7f7;
    }
  }

  td {
    padding: 8px;
    vertical-align: middle;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  .quick-fill-col {
    border-right: 1px solid #e0e0e0;
  }

  .add-platform-col {
    border-right: 1px solid #e0e0e0;
  }
}

:deep(.v-data-table) {
  thead {
    background: #455a64;
    color: #fff;
    height: 48px;
  }
  .v-data-table__tr {
    &:nth-child(odd) {
      background: #f6f8fa;
    }
    &:nth-child(even) {
      background: #fffaf0;
    }
    &:hover {
      background: #e0e0e0 !important;
    }
  }
}

.delete-button-col {
  width: 30px;
  padding: 0 !important;
  text-align: center;
}

.channel-col {
  max-width: 160px;
  min-width: 160px;
  .channel-select {
    width: 180px;
  }
}

.platform-col {
  padding-right: 4px !important;
  min-width: 160px;
}

.month-col {
  min-width: 106px;
  padding: 8px !important;
}

.delete-button {
  margin-left: 16px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 1;
  }
}

.month-input {
  width: 100%;
}

.quick-fill-col {
  min-width: 48px;
  padding: 0 8px 0 0 !important;
  text-align: center;
}

.sort-buttons-col {
  min-width: 32px;
  padding: 0 !important;
  text-align: center;
  
  .v-btn {
    margin: 2px 0;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
    
    &:disabled {
      opacity: 0.3;
    }
  }
}

.add-platform-col {
  width: 32px;
  padding: 0 16px 0 8px !important;
  text-align: center;
}

.note-cell {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.menu-card {
  overflow: hidden;
  .menu-header {
    font-size: 14px;
    background: linear-gradient(to right, #7E57C2, #4527A0);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }
  .menu-card-text {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .budget-table {
    margin: 0;
    padding: 0;
  }
}
</style>
