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
            <v-card class="elevation-4 rounded-lg py-6 px-4 px-sm-4 px-xl-4">
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
                    <v-autocomplete
                      v-model="searchCriteria.channel"
                      :items="channelOptions"
                      label="廣告渠道"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                      @update:model-value="handleChannelChange"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.platform"
                      :items="getFilteredPlatformOptions(searchCriteria.channel)"
                      :label="searchCriteria.channel ? '平台' : '平台 ( 請先選擇廣告渠道 )'"
                      item-title="name"
                      item-value="_id"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="mb-6"
                      :disabled="!searchCriteria.channel"
                    />
                    <v-autocomplete
                      v-model="searchCriteria.detail"
                      :items="detailOptions"
                      label="線別"
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
                    <v-date-input
                      v-model="searchCriteria.invoiceDateRange"
                      label="發票日期"
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
            <h3 class="d-inline">
              實際支出管理
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
                新增實際支出
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
                  v-model="searchText"
                  label="快速搜尋"
                  append-inner-icon="mdi-magnify"
                  :loading="isSearching"
                  base-color="#666"
                  color="blue-grey-darken-3"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleSearch"
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
              <template #[`item.invoiceDate`]="{ item }">
                {{ formatDate(item.invoiceDate) }}
              </template>
              <template #[`item.createdAt`]="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <template #[`item.details`]="{ item }">
                <template v-if="Array.isArray(item.details) && item.details.length > 0">
                  <v-menu
                    location="top"
                    transition="fade-transition"
                    :close-on-content-click="true"
                    :close-on-back="true"
                  >
                    <template #activator="{ props }">
                      <div
                        v-bind="props"
                        class="details-cell"
                      >
                        {{ formatDetails(item.details) }}
                      </div>
                    </template>
                    <v-card
                      min-width="300"
                      max-width="360"
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
                            mdi-format-list-text
                          </v-icon>
                          <span class="text-white text-subtitle-2">線別明細</span>
                        </div>
                        <v-row
                          dense
                          class="details-grid-menu px-2 py-2"
                        >
                          <template
                            v-for="(detail, index) in item.details.filter(d => d.detail?.name)"
                            :key="index"
                          >
                            <v-col cols="6">
                              <div class="d-flex align-center pa-1">
                                <v-icon
                                  size="small"
                                  color="blue-grey-darken-1"
                                  class="me-2"
                                >
                                  mdi-circle-small
                                </v-icon>
                                <span class="text-body-2 text-truncate">{{ detail.detail.name }}</span>
                              </div>
                            </v-col>
                          </template>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
                <template v-else>
                  -
                </template>
              </template>

              <template #[`item.totalExpense`]="{ item }">
                {{ formatNumber(item.totalExpense || 0) }}
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
                      max-width="360"
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
                        <div class="pa-4 pt-3 menu-card-text">
                          {{ item.note }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
                <template v-else />
              </template>

              <template #[`item.actions`]="{ item }">
                <div class="d-flex justify-center">
                  <v-btn
                    icon
                    color="light-blue-darken-4"
                    variant="plain"
                    :size="buttonSize"
                    @click="editItem(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-tooltip="'複製'"
                    icon
                    color="teal-darken-2"
                    variant="plain"
                    :size="buttonSize"
                    @click="copyItem(item)"
                  >
                    <v-icon>mdi-content-copy</v-icon>
                  </v-btn>
                </div>
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
      :width="dialogWidth"
      :fullscreen="!smAndUp"
    >
      <v-card class="rounded-lg px-4 py-6">
        <div
          v-if="isLoadingEdit"
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
          <v-form
            ref="form"
            :disabled="isSubmitting"
            @submit.prevent="submit"
          >
            <div class="card-title px-8 py-3">
              {{ dialog.id ? '編輯實際支出' : '新增實際支出' }}
            </div>

            <v-card-text class="mt-2 mb-4 pa-3">
              <v-row>
                <v-col
                  cols="3"
                  class="px-8"
                >
                  <v-row class="border rounded-lg px-4 pt-2">
                    <v-col cols="12">
                      <v-date-input
                        v-model="invoiceDate.value.value"
                        :error-messages="invoiceDate.errorMessage.value"
                        label="*發票日期"
                        prepend-icon
                        variant="outlined"
                        density="compact"
                        ok-text="確認"
                        cancel-text="取消"
                      />
                    </v-col>

                    <v-col cols="12">
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

                    <v-col cols="12">
                      <v-autocomplete
                        v-model="channel.value.value"
                        :error-messages="channel.errorMessage.value"
                        :items="channelOptions"
                        item-title="name"
                        item-value="_id"
                        label="*廣告渠道"
                        variant="outlined"
                        density="compact"
                        clearable
                        @update:model-value="handleDialogChannelChange"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-autocomplete
                        v-model="platform.value.value"
                        :error-messages="platform.errorMessage.value"
                        :items="getFilteredPlatformOptions(channel.value.value)"
                        :label="channel.value.value ? '*平台' : '*平台 ( 請先選擇廣告渠道 )'"
                        item-title="name"
                        item-value="_id"
                        variant="outlined"
                        density="compact"
                        clearable
                        :disabled="!channel.value.value"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="note.value.value"
                        :error-messages="note.errorMessage.value"
                        label="備註"
                        variant="outlined"
                        density="compact"
                        clearable
                        auto-grow
                        rows="4"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col
                  cols="9"
                  class="px-8"
                >
                  <v-row class="border rounded-lg px-4 pt-2">
                    <v-col cols="12">
                      <div class="d-flex align-center justify-space-between mb-4">
                        <div class="sub-title">
                          線別費用明細
                        </div>
                        <div class="d-flex gap-2 align-center">
                          <v-btn
                            size="small"
                            prepend-icon="mdi-delete-sweep"
                            variant="outlined"
                            color="red-lighten-1"
                            :disabled="!hasAnyAmount"
                            @click="clearAllAmounts"
                          >
                            清除所有金額
                          </v-btn>
                          <v-btn
                            size="small"
                            prepend-icon="mdi-delete-alert"
                            variant="outlined"
                            color="red-darken-2"
                            class="ms-2"
                            :disabled="detailsList.length <= 1"
                            @click="clearAllDetails"
                          >
                            刪除所有線別
                          </v-btn>
                          <v-btn
                            size="small"
                            prepend-icon="mdi-calculator"
                            variant="outlined"
                            color="teal-darken-2"
                            class="ms-2"
                            :disabled="detailsList.length === 0"
                            @click="openAmountDialog"
                          >
                            平均帶入各線別
                          </v-btn>

                          <v-btn
                            size="small"
                            prepend-icon="mdi-plus"
                            variant="outlined"
                            color="blue-darken-4"
                            class="ms-2"
                            @click="addAllDetails"
                          >
                            新增所有線別
                          </v-btn>

                          <v-btn
                            size="small"
                            prepend-icon="mdi-plus"
                            variant="outlined"
                            class="ms-2"
                            @click="openAddDetailsDialog"
                          >
                            批量新增線別
                          </v-btn>

                          <v-btn
                            v-tooltip="'新增線別'"
                            icon
                            size="20"
                            color="grey-darken-2"
                            elevation="1"
                            class="ms-2"
                            @click="addDetail"
                          >
                            <v-icon size="14">
                              mdi-plus
                            </v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="details-grid">
                        <div
                          v-for="(detail, index) in detailsList"
                          :key="index"
                          class="detail-item"
                        >
                          <div class="d-flex align-center">
                            <div class="detail-number">
                              {{ index + 1 }}
                            </div>
                            <div class="detail-fields">
                              <div class="detail-field">
                                <v-autocomplete
                                  v-model="detail.detail"
                                  :error-messages="details.errorMessage?.value?.[index]?.detail"
                                  :items="detailOptions"
                                  item-title="name"
                                  item-value="_id"
                                  label="*線別"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  clearable
                                />
                              </div>
                              <div class="detail-field">
                                <amount-input
                                  v-model="detail.amount"
                                  :error-messages="details.errorMessage?.value?.[index]?.amount"
                                  label="*費用"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                                  clearable
                                />
                              </div>
                              <div class="detail-action">
                                <v-btn
                                  v-if="detailsList.length > 1"
                                  icon
                                  color="error"
                                  variant="plain"
                                  size="32"
                                  @click="removeDetail(index)"
                                >
                                  <v-icon size="18">
                                    mdi-delete
                                  </v-icon>
                                </v-btn>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="d-flex justify-space-between align-center py-2 px-1">
                        <span class="text-subtitle-1">總金額：</span>
                        <span class="text-h6">{{ formatNumber(totalExpense) }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="px-5">
              <v-hover>
                <template #default="{ isHovering, props }">
                  <v-btn
                    v-if="dialog.id"
                    v-bind="props"
                    :color="isHovering ? 'red-lighten-1' : 'grey'"
                    variant="outlined"
                    :size="buttonSize"
                    prepend-icon="mdi-delete"
                    @click="confirmDeleteDialog = true"
                  >
                    刪除
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
                class="ms-1"
                :size="buttonSize"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                送出
              </v-btn>
            </v-card-actions>
          </v-form>
        </template>
      </v-card>
    </v-dialog>

    <!-- 輸入總金額對話框 -->
    <v-dialog
      v-model="amountDialog.open"
      max-width="320"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 pt-6 pb-4">
          請輸入總金額
        </div>
        <v-card-text class="px-6 pb-0">
          <amount-input
            v-model="amountDialog.amount"
            label="總金額"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
            autofocus
            @keyup.enter="confirmAmount"
          />
        </v-card-text>
        <v-card-actions class="px-6 pt-2 pb-6 pt-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="amountDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-2"
            variant="outlined"
            class="ms-2"
            :disabled="!amountDialog.amount || amountDialog.amount <= 0"
            @click="confirmAmount"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除實際支出"
      :message="`確定要刪除「<span class='text-pink-lighten-1' style='font-weight: 800;'>${formatDate(originalData?.invoiceDate)}${originalData?.theme?.name}</span>」的實際支出嗎？ 此操作無法復原。`"
      :expected-name="`${formatDate(originalData?.invoiceDate)}${originalData?.theme?.name}`"
      input-label="發票日期及行銷主題"
      @confirm="deleteExpense"
    />

    <!-- 新增多個線別對話框 -->
    <v-dialog
      v-model="addDetailsDialog.open"
      max-width="320"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 pt-6 pb-4">
          批量新增線別
        </div>
        <v-card-text class="px-6 pb-0">
          <v-text-field
            v-model="addDetailsDialog.count"
            label="要新增的線別數量"
            type="number"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
            min="1"
            :rules="[value => !value || value < 1 ? '數量必須大於0' : true]"
            autofocus
            @keyup.enter="confirmAddDetails"
          />
        </v-card-text>
        <v-card-actions class="px-6 pt-4 pb-6">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="addDetailsDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-2"
            variant="outlined"
            class="ms-2"
            :disabled="!addDetailsDialog.count || addDetailsDialog.count < 1"
            @click="confirmAddDetails"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認清除所有金額對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmClearAmountsDialog"
      :width="300"
      title="確認清除所有金額"
      message="確定要清除所有線別的金額嗎？此操作無法復原。"
      confirm-button-text="清除"
      @confirm="confirmClearAllAmounts"
    />

    <!-- 確認刪除所有線別對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmClearDetailsDialog"
      :width="300"
      title="確認刪除所有線別"
      message="確定要刪除所有線別嗎？此操作無法復原。"
      confirm-button-text="刪除"
      @confirm="confirmClearAllDetails"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { debounce } from 'lodash'
import { formatNumber } from '@/utils/format'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import AmountInput from '../components/AmountInput.vue'

// 自定義日期格式化函數
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

const formatToDate = (dateString) => {
  return dateString ? new Date(dateString) : null
}

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '實際支出管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER]
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '1520' : '100%')

// ===== 基礎狀態管理 =====
const confirmDeleteDialog = ref(false)
const originalData = ref(null)
const isSubmitting = ref(false)
const isLoading = ref(false)
const isSearching = ref(false)
const isLoadingEdit = ref(false)

// ===== 表單驗證架構 =====
const schema = yup.object({
  invoiceDate: yup.date().required('請選擇發票日期'),
  theme: yup.string().required('請選擇行銷主題'),
  channel: yup.string().required('請選擇廣告渠道'),
  platform: yup.string().required('請選擇平台'),
  note: yup.string()
})

// ===== 表單初始化 =====
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema
})

// ===== 表單欄位 =====
const invoiceDate = useField('invoiceDate')
const theme = useField('theme')
const channel = useField('channel')
const platform = useField('platform')
const details = useField('details')
const note = useField('note')

// 新增線別明細相關
const detailsList = ref([{ detail: '', amount: '' }])

// 移除線別明細
const removeDetail = (index) => {
  if (detailsList.value.length > 1) {
    detailsList.value.splice(index, 1)
  }
}

// 計算總金額
const totalExpense = computed(() => {
  return detailsList.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

// 監聽明細變化，同步到表單
watch(detailsList, (newValue) => {
  details.value.value = newValue
}, { deep: true })

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// ===== 表格設定 =====
const headers = [
  { title: '發票日期', key: 'invoiceDate', align: 'start', sortable: true },
  { title: '行銷主題', key: 'theme.name', align: 'start', sortable: true },
  { title: '廣告渠道', key: 'channel.name', align: 'start', sortable: true },
  { title: '平台', key: 'platform.name', align: 'start', sortable: true },
  { title: '線別', key: 'details', align: 'start', maxWidth: '150', sortable: true },
  { title: '總金額', key: 'totalExpense', align: 'start', sortable: true },
  { title: '備註', key: 'note', align: 'start', width: '130', sortable: true },
  { title: '建立者', key: 'creator.name', align: 'start', sortable: true },
  { title: '建立日期', key: 'createdAt', align: 'start', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const items = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const page = ref(1)
const tableSortBy = ref([{ key: 'invoiceDate', order: 'desc' }])

// ===== 選項資料 =====
const themeOptions = ref([])
const channelOptions = ref([])
const platformOptions = ref([])
const detailOptions = ref([])
const budgetOptions = ref([])

// ===== 搜尋相關設定 =====
const searchCriteria = ref({
  theme: null,
  channel: null,
  platform: null,
  detail: null,
  createdDateRange: [],
  invoiceDateRange: []
})

const searchText = ref('')

const debouncedSearch = debounce(() => {
  page.value = 1
  loadData()
}, 300)

// 重置搜尋
const resetSearch = () => {
  searchCriteria.value = {
    theme: null,
    channel: null,
    platform: null,
    detail: null,
    createdDateRange: [],
    invoiceDateRange: []
  }
  searchText.value = ''
  page.value = 1
  loadData()
}

// 執行搜尋
const performSearch = async () => {
  try {
    page.value = 1
    await loadData()
  } catch (error) {
    console.error('搜尋時發生錯誤:', error)
    handleError(error)
  }
}

// ===== 監聽器 =====
watch(searchText, () => {
  isSearching.value = true
  page.value = 1
  debouncedSearch()
})

watch([page, itemsPerPage], () => {
  loadData()
})

// 修改日期驗證監聽
watch(
  [
    () => searchCriteria.value.createdDateRange,
    () => searchCriteria.value.invoiceDateRange
  ],
  ([newCreatedDateRange, newInvoiceDateRange]) => {
    // 驗證建立日期範圍
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

    // 驗證發票日期範圍
    if (newInvoiceDateRange && newInvoiceDateRange.length > 0) {
      const start = new Date(newInvoiceDateRange[0])
      const end = new Date(newInvoiceDateRange[newInvoiceDateRange.length - 1])
      if (start > end) {
        createSnackbar({
          text: '發票日期的結束日期不能早於開始日期',
          snackbarProps: { color: 'warning' }
        })
        searchCriteria.value.invoiceDateRange = []
      }
    }
  }
)

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

    // 處理快速搜尋
    if (searchText.value?.trim()) {
      params.search = searchText.value.trim()
    }

    // 處理條件搜尋
    if (searchCriteria.value.theme) {
      params.theme = searchCriteria.value.theme
    }
    if (searchCriteria.value.channel) {
      params.channel = searchCriteria.value.channel
    }
    if (searchCriteria.value.platform) {
      params.platform = searchCriteria.value.platform
    }
    if (searchCriteria.value.detail) {
      params.detail = searchCriteria.value.detail
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

    // 處理發票日期範圍
    if (searchCriteria.value.invoiceDateRange && searchCriteria.value.invoiceDateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.invoiceDateRange[0])
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(searchCriteria.value.invoiceDateRange[searchCriteria.value.invoiceDateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)

      params.invoiceDateStart = startDate.toISOString()
      params.invoiceDateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/marketing/expenses/all', { params })
    if (data.success) {
      items.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
    isSearching.value = false
  }
}

const loadOptions = async () => {
  try {
    const [
      { data: themeData },
      { data: channelData },
      { data: platformData },
      { data: detailData }
    ] = await Promise.all([
      apiAuth.get('/marketing/categories/options', { params: { type: 0 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 1 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 2 } }),
      apiAuth.get('/marketing/categories/options', { params: { type: 3 } })
    ])

    if (themeData.success) {
      themeOptions.value = themeData.result
    }
    if (channelData.success) {
      channelOptions.value = channelData.result
    }
    if (platformData.success) {
      platformOptions.value = platformData.result
    }
    if (detailData.success) {
      detailOptions.value = detailData.result
    }

    // 載入預算表選項
    try {
      const { data: budgetData } = await apiAuth.get('/marketing/budgets/all', {
        params: {
          page: 1,
          itemsPerPage: 9999 // 獲取所有預算表
        }
      })
      if (budgetData.success) {
        budgetOptions.value = budgetData.result.data.map(budget => ({
          _id: budget._id,
          name: `${budget.year}年度 - ${budget.theme.name}`
        }))
      }
    } catch (error) {
      console.error('載入預算表選項失敗:', error)
    }
  } catch (error) {
    handleError(error)
  }
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  resetForm()
}

const editItem = async (item) => {
  try {
    console.log('編輯項目:', item)
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }

    // 先打開對話框並顯示載入中
    dialog.value = {
      open: true,
      id: item._id
    }
    isLoadingEdit.value = true

    // 獲取完整的資料
    const { data } = await apiAuth.get(`/marketing/expenses/${item._id}`)
    if (!data.success) {
      throw new Error('獲取資料失敗')
    }

    const fullItem = data.result

    invoiceDate.value.value = formatToDate(fullItem.invoiceDate)
    theme.value.value = fullItem.theme._id
    channel.value.value = fullItem.channel._id
    platform.value.value = fullItem.platform._id
    detailsList.value = fullItem.details.map(d => ({
      detail: d.detail._id,
      amount: d.amount
    }))
    note.value.value = fullItem.note
    originalData.value = fullItem
  } catch (error) {
    console.error('編輯項目發生錯誤:', error)
    handleError(error)
    dialog.value.open = false
  } finally {
    isLoadingEdit.value = false
  }
}

const closeDialog = () => {
  try {
    dialog.value = {
      open: false,
      id: ''
    }
    originalData.value = null
    detailsList.value = [{ detail: '', amount: '' }]
    resetForm()
  } catch (error) {
    console.error('關閉對話框時發生錯誤:', error)
  }
}

const submit = handleSubmit(async (values) => {
  try {
    // 檢查是否有未填寫的線別或金額
    const hasEmptyDetails = detailsList.value.some(detail => !detail.detail || !detail.amount)

    if (hasEmptyDetails) {
      createSnackbar({
        text: '請確認選擇所有線別及費用皆已輸入',
        snackbarProps: {
          color: 'red-lighten-1',
        }
      })
      return
    }

    // 檢查是否有重複的線別
    const detailMap = new Map()
    const duplicateDetails = []

    detailsList.value.forEach(detail => {
      if (detail.detail) {
        // 找出目前線別的名稱
        const detailOption = detailOptions.value.find(opt => opt._id === detail.detail)
        const detailName = detailOption?.name || detail.detail

        if (detailMap.has(detail.detail)) {
          // 如果已經存在，加入重複清單
          if (!duplicateDetails.includes(detailName)) {
            duplicateDetails.push(detailName)
          }
        } else {
          // 如果不存在，加入 Map
          detailMap.set(detail.detail, detailName)
        }
      }
    })

    if (duplicateDetails.length > 0) {
      createSnackbar({
        text: `重複的線別：${duplicateDetails.join('、')}`,
        snackbarProps: {
          color: 'red-lighten-1',
          timeout: 4000
        }
      })
      return
    }

    isSubmitting.value = true

    const submitData = {
      ...values,
      invoiceDate: values.invoiceDate instanceof Date ? values.invoiceDate.toISOString() : values.invoiceDate,
      year: values.invoiceDate instanceof Date ? values.invoiceDate.getFullYear() : new Date(values.invoiceDate).getFullYear(),
      details: detailsList.value,
      totalExpense: totalExpense.value
    }

    if (dialog.value.id) {
      await apiAuth.patch(`/marketing/expenses/${dialog.value.id}`, submitData)
      createSnackbar({
        text: '實際支出更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      await apiAuth.post('/marketing/expenses', submitData)
      createSnackbar({
        text: '實際支出新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeDialog()
    loadData()
  } catch (error) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
})

const deleteExpense = async () => {
  if (!dialog.value.id) return

  try {
    await apiAuth.delete(`/marketing/expenses/${dialog.value.id}`)
    createSnackbar({
      text: '實際支出刪除成功',
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

const handleSearch = () => {
  isSearching.value = true
  page.value = 1
  debouncedSearch()
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

// 新增總金額對話框相關
const amountDialog = ref({
  open: false,
  amount: ''
})

// 開啟總金額對話框
const openAmountDialog = () => {
  amountDialog.value = {
    open: true,
    amount: ''
  }
}

// 確認總金額並分配
const confirmAmount = () => {
  const total = Number(amountDialog.value.amount)
  if (!total || total <= 0) return

  // 計算已填寫金額的線別總和
  const filledDetails = detailsList.value.filter(d => d.amount > 0)
  const filledTotal = filledDetails.reduce((sum, d) => sum + Number(d.amount), 0)

  // 計算剩餘可分配金額
  const remainingAmount = total - filledTotal

  // 找出未填寫金額的線別
  const unfilledDetails = detailsList.value.filter(d => !d.amount || d.amount <= 0)

  if (unfilledDetails.length === 0) {
    createSnackbar({
      text: '所有線別已填寫金額',
      snackbarProps: { color: 'warning' }
    })
    amountDialog.value.open = false
    return
  }

  // 計算每個未填寫線別應得的基本金額（取整數）
  const baseAmount = Math.floor(remainingAmount / unfilledDetails.length)

  // 計算餘數
  const remainder = remainingAmount - (baseAmount * unfilledDetails.length)

  // 計算需要分配餘數的項目數（餘數有多少就分給多少個項目）
  const itemsToDistribute = Math.min(remainder, unfilledDetails.length)

  // 分配金額給未填寫的線別
  unfilledDetails.forEach((detail, index) => {
    const detailIndex = detailsList.value.findIndex(d => d === detail)
    if (detailIndex !== -1) {
      // 前面的項目每個多分配1元，直到餘數用完
      detailsList.value[detailIndex].amount = index < itemsToDistribute
        ? baseAmount + 1
        : baseAmount
    }
  })

  amountDialog.value.open = false
}

// 檢查是否有任何金額被填寫
const hasAnyAmount = computed(() => {
  return detailsList.value.some(detail => Number(detail.amount) > 0)
})

// 確認對話框狀態
const confirmClearAmountsDialog = ref(false)
const confirmClearDetailsDialog = ref(false)

// 修改清除所有金額的方法
const clearAllAmounts = () => {
  confirmClearAmountsDialog.value = true
}

// 確認清除所有金額
const confirmClearAllAmounts = () => {
  detailsList.value = detailsList.value.map(detail => ({
    ...detail,
    amount: ''
  }))
  createSnackbar({
    text: '已清除所有線別金額',
    snackbarProps: { color: 'teal-lighten-1' }
  })
  confirmClearAmountsDialog.value = false
}

// 修改清除所有線別的方法
const clearAllDetails = () => {
  confirmClearDetailsDialog.value = true
}

// 確認清除所有線別
const confirmClearAllDetails = () => {
  detailsList.value = [{ detail: '', amount: '' }]
  createSnackbar({
    text: '已刪除所有線別',
    snackbarProps: { color: 'teal-lighten-1' }
  })
  confirmClearDetailsDialog.value = false
}

// 新增多個線別對話框相關
const addDetailsDialog = ref({
  open: false,
  count: ''
})

// 開啟新增多個線別對話框
const openAddDetailsDialog = () => {
  addDetailsDialog.value = {
    open: true,
    count: ''
  }
}

// 確認新增多個線別
const confirmAddDetails = () => {
  const count = Number(addDetailsDialog.value.count)
  if (!count || count < 1) return

  // 新增指定數量的線別，金額預設為空值
  for (let i = 0; i < count; i++) {
    detailsList.value.push({ detail: '', amount: '' })
  }

  createSnackbar({
    text: `已新增 ${count} 個線別`,
    snackbarProps: { color: 'teal-lighten-1' }
  })

  addDetailsDialog.value.open = false
}

// 新增線別明細
const addDetail = () => {
  detailsList.value.push({ detail: '', amount: '' })
}

// 新增所有線別
const addAllDetails = () => {
  // 檢查是否有可用的線別選項
  if (!detailOptions.value || detailOptions.value.length === 0) {
    createSnackbar({
      text: '目前沒有可用的線別',
      snackbarProps: { color: 'warning' }
    })
    return
  }

  // 獲取目前已經使用的線別 ID（排除空值的情況）
  const usedDetailIds = new Set(detailsList.value.map(item => item.detail).filter(Boolean))

  // 過濾出未使用的線別
  const unusedDetails = detailOptions.value.filter(detail => !usedDetailIds.has(detail._id))

  if (unusedDetails.length === 0) {
    createSnackbar({
      text: '所有線別已經被新增',
      snackbarProps: { color: 'warning' }
    })
    return
  }

  // 記錄要新增的總數量
  const totalToAdd = unusedDetails.length

  // 如果第一項是空的，先設定第一項
  if (!detailsList.value[0].detail) {
    detailsList.value[0].detail = unusedDetails[0]._id
    // 移除已使用的第一項
    unusedDetails.shift()
  }

  // 為剩餘未使用的線別新增資料
  unusedDetails.forEach(detail => {
    detailsList.value.push({
      detail: detail._id,
      amount: ''
    })
  })

  createSnackbar({
    text: `已新增 ${totalToAdd} 個線別`,
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 新增線別明細格式化函數
const formatDetails = (details) => {
  if (!Array.isArray(details)) return '-'

  const validDetails = details
    .map(d => d.detail?.name || '')
    .filter(Boolean)

  if (validDetails.length === 0) return '-'
  if (validDetails.length <= 4) return validDetails.join('、')

  return validDetails.slice(0, 4).join('、') + '...'
}

// 在 methods 區域新增 copyItem 方法
const copyItem = async (item) => {
  try {
    if (!item || !item._id) {
      console.error('無效的項目:', item)
      return
    }

    // 打開對話框
    dialog.value = {
      open: true,
      id: '' // 設為空因為是新增
    }
    isLoadingEdit.value = true

    // 獲取完整的資料
    const { data } = await apiAuth.get(`/marketing/expenses/${item._id}`)
    if (!data.success) {
      throw new Error('獲取資料失敗')
    }

    const fullItem = data.result

    // 不帶入發票日期
    invoiceDate.value.value = null
    theme.value.value = fullItem.theme._id
    channel.value.value = fullItem.channel._id
    platform.value.value = fullItem.platform._id
    detailsList.value = fullItem.details.map(d => ({
      detail: d.detail._id,
      amount: d.amount
    }))
    note.value.value = fullItem.note

    // 顯示提示訊息
    createSnackbar({
      text: '請記得選擇發票日期',
      snackbarProps: {
        color: 'warning',
        timeout: 3000
      }
    })
  } catch (error) {
    console.error('複製項目發生錯誤:', error)
    handleError(error)
    dialog.value.open = false
  } finally {
    isLoadingEdit.value = false
  }
}

// ===== 平台選擇相關方法 =====
// 根據廣告渠道過濾平台選項
const getFilteredPlatformOptions = (channelId) => {
  if (!channelId) return []
  return platformOptions.value.filter(platform => platform.parentId?._id === channelId)
}

// 處理搜尋區域的廣告渠道變更
const handleChannelChange = () => {
  // 當廣告渠道變更時，清空平台選擇
  searchCriteria.value.platform = null
}

// 處理對話框中的廣告渠道變更
const handleDialogChannelChange = () => {
  // 當廣告渠道變更時，清空平台選擇
  platform.value.value = ''
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

// ===== 生命週期鉤子 =====
onMounted(async () => {
  await Promise.all([
    loadData(),
    loadOptions()
  ])
})
</script>

<style lang="scss" scoped>
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

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-height: 800px;
  overflow-y: auto;
  padding-right: 8px;
}

.detail-item {
  background-color: #f6f6f6;
  border: 1px solid #b9b9b9;
  border-radius: 8px;
  padding: 8px;

  :deep(.v-field) {
    background-color: #fff;
  }

  &:hover {
    background-color: #eeeeee;
  }

  .detail-fields {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;

    .detail-field {
      width: 50%;
      min-width: 0;
    }

    .detail-field:first-child {
      width: 55%;
    }

    .detail-field:last-child {
      width: 45%;
    }

    .detail-action {
      width: 32px;
      display: flex;
      justify-content: center;
    }
  }

  .detail-number {
    min-width: 18px;
    height: 18px;
    background-color: #283593;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    margin-right: 8px;
  }
}

/* 自定義滾動條樣式 */
.details-grid::-webkit-scrollbar {
  width: 8px;
}

.details-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.details-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.details-grid::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.note-cell {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.details-grid-menu {
  margin: 0;
  .v-col {
    padding: 4px;
    .text-truncate {
      max-width: 120px;
    }
  }
}

.menu-card {
  overflow: hidden;

  .menu-card-text {
    font-size: 13px;
  }

  .menu-header {
    font-size: 14px;
    background: linear-gradient(to right, #7E57C2, #311B92);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }

  .details-grid-menu {
    margin: 0;

    .v-col {
      padding: 2px 4px;

      .menu-item {
        border-radius: 6px;
        .text-truncate {
          max-width: 100px;
          color: #37474f;
        }
      }
    }
  }
}

.details-cell {
  cursor: pointer;
}
</style>
