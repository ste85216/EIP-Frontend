<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>
              客戶評論管理
            </h3>
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 申請時間 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請時間 :</span>
                  <v-date-input
                    v-model="searchCriteria.applicationDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    placeholder="請選擇申請時間"
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 評論日期 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">評論日期 :</span>
                  <v-date-input
                    v-model="searchCriteria.commentDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    multiple="range"
                    placeholder="請選擇評論日期"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 50字 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">50字 :</span>
                  <v-select
                    v-model="searchCriteria.hasFiftyWordComment"
                    :items="[
                      { value: true, text: '確認' },
                      { value: false, text: '尚未確認' }
                    ]"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇狀態"
                    hide-details
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 審核者 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">審核者 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.reviewer"
                    :items="reviewers"
                    :item-title="getReviewerTitle"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇審核者"
                    hide-details
                    :filter="customFilter"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 禮品寄出日 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">禮品寄出日 :</span>
                  <v-date-input
                    v-model="searchCriteria.giftSentDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    placeholder="請選擇禮品寄出日"
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 寄出者 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">寄出者 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.sender"
                    :items="senders"
                    :item-title="getSenderTitle"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇寄出者"
                    hide-details
                    :filter="customFilter"
                    :disabled="false"
                  />
                </div>
              </v-col>
              <v-col
                lg="10"
                class="d-none d-md-block"
              />
              <!-- 搜尋按鈕 -->
              <v-col
                cols="12"
                md="8"
                lg="2"
              >
                <v-row class="d-sm-flex justify-sm-end">
                  <v-col
                    cols="8"
                    sm="4"
                    lg="8"
                    class="ps-1 pe-0"
                  >
                    <v-btn
                      color="cyan-darken-2"
                      prepend-icon="mdi-magnify"
                      :loading="loading"
                      :disabled="false"
                      block
                      @click="fetchTableData"
                    >
                      搜尋
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="4"
                    sm="2"
                    lg="4"
                    class="pe-2"
                  >
                    <v-btn
                      color="grey"
                      width="40"
                      block
                      :disabled="false"
                      @click="resetSearch"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider class="my-0" />

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <!-- 總花費顯示 -->
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                  class="px-1 my-1"
                >
                  <div class="d-flex align-center">
                    <v-chip
                      color="teal-darken-1"
                      label
                      class="px-4"
                      prepend-icon="mdi-cash-multiple"
                    >
                      <span class=" font-weight-bold">
                        總花費：{{ formatCurrency(totalCost) }}
                      </span>
                    </v-chip>
                  </div>
                </v-col>
                <v-spacer />
                <v-col
                  cols="7"
                  sm="6"
                  md="4"
                  lg="2"
                  class="px-1 my-1"
                >
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="quickSearch"
                      :loading="isSearching"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋申請編號、姓名、電話、地址、花費、備註"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      clearable
                      :disabled="false"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 表格區塊 -->
          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              v-model:items-per-page="tableOptions.itemsPerPage"
              v-model:page="tableOptions.page"
              v-model:sort-by="tableOptions.sortBy"
              :headers="tableHeaders"
              :items="tableItems"
              :items-length="totalItems"
              :loading="loading"
              :items-per-page-options="[10, 20, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.designRequestNumber || '-' }}</td>
                  <td>
                    <div v-if="item.applicationDate">
                      <div>{{ formatDate(item.applicationDate) }}</div>
                      <div class="text-caption text-grey-darken-1">
                        <v-icon
                          size="14"
                          style="padding-bottom: 2px;"
                        >
                          mdi-clock-outline
                        </v-icon> {{ formatTime(item.applicationDate) }}
                      </div>
                    </div>
                  </td>
                  <td>{{ item.customerName }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.address }}</td>
                  <td>{{ formatDate(item.commentDate) }}</td>
                  <td>
                    <v-chip
                      :color="getFiftyWordCommentColor(item.hasFiftyWordComment)"
                      size="small"
                      label
                      class="font-weight-medium"
                    >
                      {{ getFiftyWordCommentText(item.hasFiftyWordComment) }}
                    </v-chip>
                  </td>
                  <td>
                    {{ item.reviewer ? getReviewerTitle(item.reviewer) : '-' }}
                  </td>
                  <td>{{ item.giftSentDate ? formatDate(item.giftSentDate) : '-' }}</td>
                  <td>
                    {{ item.sender ? getSenderTitle(item.sender) : '-' }}
                  </td>
                  <td>{{ item.cost ? `$${item.cost}` : '-' }}</td>
                  <td>{{ item.note || '-' }}</td>
                  <td class="text-center">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      size="small"
                      :ripple="false"
                      @click="openEditDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ImageLightbox ref="imageLightboxRef" />

    <!-- 編輯對話框 -->
    <v-dialog
      v-model="editDialog.show"
      max-width="800"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-light-blue-darken-2">
          <v-icon
            icon="mdi-pencil"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">編輯客戶評論</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            size="36"
            @click="closeEditDialog"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="editFormRef"
            v-model="editFormValid"
            @submit.prevent="saveEdit"
          >
            <v-row>
              <!-- 客戶資訊分區標題 -->
              <v-col
                cols="12"
                class="sub-title text-blue-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="2"
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-account-outline
                    </v-icon> 客戶資訊
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- 客戶資訊欄位 -->
              <v-col
                cols="12"
                lg="4"
              >
                <v-text-field
                  v-model="editFormData.customerName"
                  label="* 客戶名稱"
                  variant="outlined"
                  density="compact"
                  disabled
                  :rules="[v => !!v || '請輸入客戶名稱']"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-text-field
                  v-model="editFormData.phone"
                  label="* 電話"
                  variant="outlined"
                  density="compact"
                  disabled
                  :rules="[v => !!v || '請輸入電話']"
                  required
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-date-input
                  v-model="editFormData.commentDate"
                  label="* 評論日期"
                  variant="outlined"
                  density="compact"
                  disabled
                  :rules="[v => !!v || '請選擇評論日期']"
                  prepend-icon=""
                  required
                />
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  v-model="editFormData.address"
                  label="* 地址"
                  variant="outlined"
                  density="compact"
                  disabled
                  :rules="[v => !!v || '請輸入地址']"
                  required
                />
              </v-col>
              <v-col
                v-if="editFormData.images && editFormData.images.length > 0"
                cols="12"
              >
                <v-btn
                  color="blue-darken-1"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-image"
                  @click="openLightbox(editFormData.images, 0)"
                >
                  查看截圖
                </v-btn>
              </v-col>
              <!-- 審核資訊分區標題 -->
              <v-col
                cols="12"
                class="sub-title text-blue-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="2"
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-clipboard-check-outline
                    </v-icon> 審核資訊
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- 審核資訊欄位 -->
              <v-col
                cols="12"
                lg="4"
              >
                <v-select
                  :model-value="editFormData.hasFiftyWordComment ? 'confirmed' : 'notConfirmed'"
                  :items="fiftyWordCommentOptions"
                  item-title="text"
                  item-value="value"
                  label="50字"
                  variant="outlined"
                  density="compact"
                  @update:model-value="(value) => editFormData.hasFiftyWordComment = value === 'confirmed'"
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-select
                  v-model="editFormData.reviewer"
                  :items="reviewers"
                  :item-title="getReviewerTitle"
                  item-value="_id"
                  label="審核者"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-text-field
                  v-model.number="editFormData.cost"
                  label="花費"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-date-input
                  v-model="editFormData.giftSentDate"
                  label="禮品寄出日"
                  variant="outlined"
                  density="compact"
                  prepend-icon=""
                  clearable
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                lg="4"
              >
                <v-select
                  v-model="editFormData.sender"
                  :items="senders"
                  :item-title="getSenderTitle"
                  item-value="_id"
                  label="寄出者"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editFormData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  hide-details
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
            @click="closeEditDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="light-blue-darken-2"
            variant="outlined"
            class="ms-2"
            :loading="submitting"
            :disabled="!editFormValid"
            @click="saveEdit"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import debounce from 'lodash/debounce'
import ImageLightbox from '@/components/ImageLightbox.vue'

// 頁面定義
definePage({
  meta: {
    title: '客戶評論管理 | Ystravel',
    login: true,
    permission: 'CUSTOMER_COMMENT_MANAGEMENT_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 表格相關變數
const loading = ref(false)
const tableItems = ref([])
const totalItems = ref(0)
const totalCost = ref(0)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'applicationDate', order: 'desc' }]
})
const tableHeaders = [
  { title: '申請編號', key: 'designRequestNumber', sortable: true },
  { title: '申請時間', key: 'applicationDate', sortable: true },
  { title: '姓名', key: 'customerName', sortable: true },
  { title: '電話', key: 'phone', sortable: true },
  { title: '地址', key: 'address', sortable: true },
  { title: '評論日期', key: 'commentDate', sortable: true },
  { title: '50字', key: 'hasFiftyWordComment', sortable: false },
  { title: '審核者', key: 'reviewer', sortable: false },
  { title: '禮品寄出日', key: 'giftSentDate', sortable: true },
  { title: '寄出者', key: 'sender', sortable: false },
  { title: '花費', key: 'cost', sortable: true },
  { title: '備註', key: 'note', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 搜尋條件
const searchCriteria = reactive({
  applicationDate: [],
  commentDate: [],
  hasFiftyWordComment: null,
  reviewer: null,
  giftSentDate: [],
  sender: null
})

// 快速搜尋
const quickSearch = ref('')
const isSearching = ref(false)

const imageLightboxRef = ref(null)

// 編輯對話框相關變數
const editDialog = reactive({ show: false })
const editFormRef = ref(null)
const editFormValid = ref(false)
const submitting = ref(false)
const editFormData = reactive({
  customerName: '',
  phone: '',
  address: '',
  commentDate: null,
  hasFiftyWordComment: false,
  reviewer: null,
  giftSentDate: null,
  sender: null,
  cost: null,
  note: '',
  images: []
})
const currentEditId = ref(null)

// 審核者列表
const reviewers = ref([])
// 寄出者列表
const senders = ref([])
// 50字選項
const fiftyWordCommentOptions = [
  { text: '確認', value: 'confirmed' },
  { text: '尚未確認', value: 'notConfirmed' }
]

// 取得審核者顯示標題
const getReviewerTitle = (item) => {
  if (!item) return ''
  return item.name || ''
}

// 取得寄出者顯示標題
const getSenderTitle = (item) => {
  if (!item) return ''
  return item.name || ''
}

// 取得50字狀態顏色
const getFiftyWordCommentColor = (hasFiftyWordComment) => {
  return hasFiftyWordComment ? 'green-darken-1' : 'orange-darken-2'
}

// 取得50字狀態文字
const getFiftyWordCommentText = (hasFiftyWordComment) => {
  return hasFiftyWordComment ? '確認' : '尚未確認'
}

// 取得表格資料
const fetchTableData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = {
      page: tableOptions.page,
      itemsPerPage: tableOptions.itemsPerPage,
      sortBy: tableOptions.sortBy[0]?.key,
      sortOrder: tableOptions.sortBy[0]?.order
    }

    // 快速搜尋
    if (quickSearch.value) {
      params.search = quickSearch.value
    }

    // 申請時間區間處理
    if (searchCriteria.applicationDate?.length > 0) {
      const dates = Array.from(searchCriteria.applicationDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.applicationDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.applicationDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.applicationDateEnd = endDate.toISOString()
      }
    }

    // 評論日期區間處理
    if (searchCriteria.commentDate?.length > 0) {
      const dates = Array.from(searchCriteria.commentDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.commentDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.commentDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.commentDateEnd = endDate.toISOString()
      }
    }

    // 50字評論狀態
    if (searchCriteria.hasFiftyWordComment !== null && searchCriteria.hasFiftyWordComment !== '') {
      params.hasFiftyWordComment = searchCriteria.hasFiftyWordComment
    }

    // 審核者
    if (searchCriteria.reviewer) {
      params.reviewer = searchCriteria.reviewer
    }

    // 禮品寄出日區間處理
    if (searchCriteria.giftSentDate?.length > 0) {
      const dates = Array.from(searchCriteria.giftSentDate)
      const start = dates[0]
      const end = dates[dates.length - 1]

      if (start) {
        const startDate = new Date(start)
        startDate.setHours(0, 0, 0, 0)
        params.giftSentDateStart = startDate.toISOString()
      }
      if (end && end !== start) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        params.giftSentDateEnd = endDate.toISOString()
      } else if (start) {
        const endDate = new Date(start)
        endDate.setHours(23, 59, 59, 999)
        params.giftSentDateEnd = endDate.toISOString()
      }
    }

    // 寄出者
    if (searchCriteria.sender) {
      params.sender = searchCriteria.sender
    }

    const { data } = await apiAuth.get('/marketing/customer-comments', { params })
    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
      totalCost.value = data.result.totalCost || 0
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得表格資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
    isSearching.value = false
  }
}

// 表格選項變更處理
const handleTableOptionsChange = () => {
  fetchTableData()
}

// 重置搜尋
const resetSearch = () => {
  searchCriteria.applicationDate = []
  searchCriteria.commentDate = []
  searchCriteria.hasFiftyWordComment = null
  searchCriteria.reviewer = null
  searchCriteria.giftSentDate = []
  searchCriteria.sender = null
  quickSearch.value = ''
  fetchTableData()
}

// 自定義搜尋過濾器
const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const raw = item.raw || item
  const itemText = raw && raw.name
    ? raw.userId
      ? `${raw.name} ${raw.userId}`.toLowerCase()
      : raw.name.toLowerCase()
    : ''
  return itemText.includes(textToSearch)
}

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  tableOptions.page = 1
  fetchTableData()
}, 300)

// 監聽快速搜尋變更
watch(quickSearch, (newValue) => {
  // 有搜尋值時觸發搜尋
  if (newValue !== undefined) {
    isSearching.value = true
    debouncedSearch()
  }
})

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
      hour12: false
    })
  } catch {
    return ''
  }
}

// 格式化貨幣
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// 取得完整檔案 URL
const getFileUrl = (file) => {
  if (!file) return ''
  if (typeof file === 'string') {
    const filePath = file
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }
    const baseURL = import.meta.env.VITE_API || 'http://localhost:4002'
    return `${baseURL}${filePath.startsWith('/') ? '' : '/'}${filePath}`
  }
  return ''
}

// 開啟燈箱預覽
const openLightbox = (images, index) => {
  if (!images || images.length === 0) return

  const imageUrls = images
    .map(img => getFileUrl(img))
    .filter(url => url)

  if (!imageUrls.length || !imageLightboxRef.value) return

  const safeIndex = typeof index === 'number'
    ? Math.min(Math.max(index, 0), imageUrls.length - 1)
    : 0

  imageLightboxRef.value.open(imageUrls, safeIndex)
}

// 開啟編輯對話框
const openEditDialog = async (item) => {
  try {
    const { data } = await apiAuth.get(`/marketing/customer-comments/${item._id}`)
    if (data.success) {
      const result = data.result
      editFormData.customerName = result.customerName || ''
      editFormData.phone = result.phone || ''
      editFormData.address = result.address || ''
      editFormData.commentDate = result.commentDate ? (typeof result.commentDate === 'string' ? new Date(result.commentDate) : result.commentDate) : null
      editFormData.hasFiftyWordComment = result.hasFiftyWordComment || false
      editFormData.reviewer = result.reviewer?._id || null
      editFormData.giftSentDate = result.giftSentDate ? (typeof result.giftSentDate === 'string' ? new Date(result.giftSentDate) : result.giftSentDate) : null
      editFormData.sender = result.sender?._id || null
      editFormData.cost = result.cost || null
      editFormData.note = result.note || ''
      editFormData.images = result.images || []
      currentEditId.value = item._id
      editDialog.show = true
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '取得資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 關閉編輯對話框
const closeEditDialog = () => {
  editDialog.show = false
  editFormData.customerName = ''
  editFormData.phone = ''
  editFormData.address = ''
  editFormData.commentDate = null
  editFormData.hasFiftyWordComment = false
  editFormData.reviewer = null
  editFormData.giftSentDate = null
  editFormData.sender = null
  editFormData.cost = null
  editFormData.note = ''
  editFormData.images = []
  currentEditId.value = null
  if (editFormRef.value) {
    editFormRef.value.resetValidation()
  }
}

// 儲存編輯
const saveEdit = async () => {
  if (!editFormRef.value) return
  const { valid } = await editFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    // 處理日期欄位，將 Date 物件轉換為 ISO 字串
    const commentDateValue = editFormData.commentDate instanceof Date
      ? editFormData.commentDate.toISOString()
      : (editFormData.commentDate || null)
    const giftSentDateValue = editFormData.giftSentDate instanceof Date
      ? editFormData.giftSentDate.toISOString()
      : (editFormData.giftSentDate || null)

    const updateData = {
      customerName: editFormData.customerName,
      phone: editFormData.phone,
      address: editFormData.address,
      commentDate: commentDateValue,
      hasFiftyWordComment: editFormData.hasFiftyWordComment,
      reviewer: editFormData.reviewer || null,
      giftSentDate: giftSentDateValue,
      sender: editFormData.sender || null,
      cost: editFormData.cost || null,
      note: editFormData.note || ''
    }
    const { data } = await apiAuth.patch(`/marketing/customer-comments/${currentEditId.value}`, updateData)
    if (data.success) {
      createSnackbar({
        text: '更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditDialog()
      fetchTableData()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

// 取得審核者列表
const fetchReviewers = async () => {
  try {
    const { data } = await apiAuth.get('/permissions/users-by-role', { params: { permission: 'CUSTOMER_COMMENT_REVIEWER_TAG' } })
    if (data.success) {
      const users = Array.isArray(data.result?.data) ? data.result.data.slice() : []
      users.sort((a, b) => String(a?.userId ?? '').localeCompare(String(b?.userId ?? '')))
      reviewers.value = users.map(u => ({ _id: u._id, name: u.name, userId: u.userId }))
    }
  } catch {
    reviewers.value = []
  }
}

// 取得寄出者列表
const fetchSenders = async () => {
  try {
    const { data } = await apiAuth.get('/permissions/users-by-role', { params: { permission: 'CUSTOMER_COMMENT_SENDER_TAG' } })
    if (data.success) {
      const users = Array.isArray(data.result?.data) ? data.result.data.slice() : []
      users.sort((a, b) => String(a?.userId ?? '').localeCompare(String(b?.userId ?? '')))
      senders.value = users.map(u => ({ _id: u._id, name: u.name, userId: u.userId }))
    }
  } catch {
    senders.value = []
  }
}

// 初始化
onMounted(() => {
  fetchTableData()
  fetchReviewers()
  fetchSenders()
})
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

/* 表格樣式 */
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

/* 燈箱樣式 */
/* 禁用狀態的樣式 */
.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed !important;
}

.disabled-btn:hover {
  opacity: 0.6 !important;
  transform: none !important;
}
</style>
