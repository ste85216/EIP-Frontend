<template>
  <v-container max-width="2500">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5">
      <!-- 左側搜尋區塊 -->
      <v-col
        cols="12"
        lg="2"
      >
        <v-row>
          <v-col
            cols="12"
            class="mt-1 ps-lg-5"
          >
            <v-card class="elevation-4 rounded-lg py-6 px-4 px-sm-2 px-xl-4">
              <v-card-title class="font-weight-bold d-flex align-center mb-2">
                搜尋條件
              </v-card-title>
              <v-card-text class="pa-2">
                <v-row>
                  <!-- 公司選擇 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.company"
                      :items="companies"
                      :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                      item-value="_id"
                      label="公司"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:model-value="handleCompanyChange"
                    />
                  </v-col>

                  <!-- 部門選擇 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.department"
                      :items="departments"
                      :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                      item-value="_id"
                      label="部門"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      :disabled="!searchCriteria.company"
                    />
                  </v-col>

                  <!-- 聘僱類型 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.employmentType"
                      :items="employmentTypeOptions"
                      label="聘僱類型"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>

                  <!-- 職稱 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.jobTitle"
                      :items="jobTitleOptions"
                      label="職稱"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>

                  <!-- 任職狀態 -->
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.status"
                      :items="statusOptions"
                      label="任職狀態"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>

                <v-row class="border rounded-lg border border-opacity-25 mb-2 mx-0">
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-select
                      v-model="searchCriteria.dateType"
                      :items="dateTypeOptions"
                      label="日期類型"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:model-value="handleDateTypeChange"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    lg="12"
                  >
                    <v-date-input
                      v-model="searchCriteria.dateRange"
                      label="日期區間"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      hide-details
                      clearable
                      multiple="range"
                      :disabled="!searchCriteria.dateType"
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                      @update:model-value="handleDateRangeChange"
                    />
                  </v-col>
                </v-row>

                <!-- 搜尋按鈕區 -->
                <v-row>
                  <v-col
                    cols="12"
                    class="d-flex justify-end gap-2"
                  >
                    <v-row class="d-flex justify-space-between">
                      <v-col
                        cols="3"
                        class="pe-0"
                      >
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
                        cols="8"
                        class="ps-0"
                      >
                        <v-btn
                          color="cyan-darken-2"
                          prepend-icon="mdi-magnify"
                          :loading="tableLoading"
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

      <!-- 右側表格區塊 -->
      <v-col
        cols="12"
        lg="10"
        class="px-6 ps-lg-6 pe-lg-8 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-7 px-1 px-sm-4 px-md-6 mt-1 bg-white">
          <!-- 標題和功能按鈕區 -->
          <v-col
            cols="12"
            class="ps-4 pb-sm-4"
          >
            <v-row>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-row class="d-flex justify-end">
                  <v-col class="d-flex align-center justify-space-between">
                    <h3 class="d-inline-block">
                      公司員工列表
                    </h3>
                  </v-col>
                  <v-col
                    cols="7"
                    sm="4"
                    md="3"
                    lg="2"
                    class="d-flex align-center"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋系統員工編號、姓名、暱稱、Email、科威員工編號、分機號碼、列印號碼、備註、LineID'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-text-field
                      v-model="quickSearch"
                      :loading="tableLoading"
                      label="快速搜尋"
                      append-inner-icon="mdi-magnify"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <!-- 表格區 -->
          <v-col cols="12">
            <v-data-table-server
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :items="tableItems"
              :headers="filteredHeaders"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :page="tablePage"
              :items-per-page-options="[10, 15, 50, 100]"
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <!-- 科威員編 -->
                  <td>
                    {{ item.employeeCode }}
                  </td>

                  <!-- 系統編號 (只在 lg 以上顯示) -->
                  <td v-if="lgAndUp">
                    {{ item.employeeId }}
                  </td>

                  <!-- 姓名 -->
                  <td>
                    <v-menu
                      location="end"
                      transition="fade-transition"
                      open-on-hover
                      close-delay="30"
                      open-delay="30"
                      class="pa-0"
                    >
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="d-flex align-center status-cell"
                        >
                          {{ item.name }}
                        </div>
                      </template>
                      <v-card
                        min-width="130"
                        class="rounded-lg pa-0 status-card"
                        elevation="3"
                      >
                        <v-card-text class="pa-0">
                          <div
                            v-if="item.nickname"
                            class="d-flex align-center px-3 py-2 bg-light-blue text-white"
                          >
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-account-badge
                            </v-icon>
                            <span>暱稱：{{ item.nickname }}</span>
                          </div>
                          <div class="d-flex align-center px-3 py-2 bg-light-blue-darken-3 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-phone
                            </v-icon>
                            <span>分機號碼：{{ item.extNumber || '無' }}</span>
                          </div>
                          <div class="d-flex align-center px-3 py-2 bg-light-blue-darken-1 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-printer
                            </v-icon>
                            <span>列印編號：{{ item.printNumber || '無' }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-menu>
                  </td>

                  <!-- 公司 (只在 sm 以上顯示) -->
                  <td v-if="smAndUp">
                    {{ item.company?.name }}
                  </td>

                  <!-- 部門 (只在 sm 以上顯示) -->
                  <td v-if="smAndUp">
                    {{ item.department?.name }}
                  </td>

                  <!-- 聘僱類型 (只在 md 以上顯示) -->
                  <td v-if="mdAndUp">
                    {{ item.employmentType }}
                  </td>

                  <!-- 職稱 (只在 sm 以上顯示) -->
                  <td v-if="smAndUp">
                    {{ item.jobTitle }}
                  </td>

                  <!-- Email (只在 md 以上顯示) -->
                  <td v-if="mdAndUp">
                    {{ item.email }}
                  </td>

                  <!-- 狀態 (只在 md 以上顯示) -->
                  <td
                    v-if="mdAndUp"
                    class="pa-2"
                  >
                    <v-menu
                      location="end"
                      transition="fade-transition"
                      open-on-hover
                      close-delay="30"
                      open-delay="30"
                      class="pa-0"
                    >
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="status-cell d-flex align-center"
                        >
                          <v-chip
                            size="small"
                            variant="outlined"
                            :color="getStatusColor(item.employmentStatus)"
                          >
                            {{ item.employmentStatus }}
                          </v-chip>
                        </div>
                      </template>
                      <v-card
                        min-width="200"
                        class="rounded-lg pa-0 status-card"
                        elevation="3"
                      >
                        <v-card-text class="pa-0">
                          <div
                            class="d-flex align-center px-3 py-2"
                            :class="getStatusDateClass(item)"
                          >
                            <v-icon
                              size="16"
                              class="me-2"
                            >
                              {{ getStatusDateIcon(item) }}
                            </v-icon>
                            <span>{{ getStatusDateText(item) }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-menu>
                  </td>

                  <!-- 備註 (只在 lg 以上顯示) -->
                  <td v-if="lgAndUp">
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
                            <div
                              class="menu-card-text pa-4"
                            >
                              {{ item.note }}
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </template>
                    <template v-else />
                  </td>

                  <!-- 設備 -->
                  <td class="text-center">
                    <v-btn
                      icon
                      color="blue-darken-3"
                      variant="plain"
                      :ripple="false"
                      @click="openDeviceDialog(item)"
                    >
                      <v-icon>mdi-devices</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 設備清單對話框 -->
    <v-dialog
      v-model="deviceDialog.open"
      max-width="1000"
    >
      <v-card class="device-dialog rounded-lg">
        <v-toolbar
          color="blue-darken-3"
          height="60"
          class="px-2"
        >
          <v-toolbar-title
            class="card-title text-white rounded-t-lg d-flex align-center"
          >
            <span class="font-weight-bold"><v-icon
              size="small"
              class="me-2"
            >mdi-devices</v-icon> 設備清單 - </span>
            <span class="font-weight-bold">{{ deviceDialog.employeeName }}</span>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="text"
            @click="closeDeviceDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div
            v-if="deviceDialog.loading"
            class="d-flex justify-center py-12"
          >
            <v-progress-circular
              indeterminate
              size="48"
              color="deep-purple-darken-2"
            />
          </div>
          <div
            v-else-if="deviceDialog.devices.length === 0"
            class="d-flex flex-column align-center py-8 text-grey"
          >
            <v-icon
              icon="mdi-devices"
              size="48"
              class="mb-4"
              color="grey-lighten-1"
            />
            <span class="card-title">尚無設備資料</span>
          </div>
          <v-row v-else>
            <v-col
              v-for="device in deviceDialog.devices"
              :key="device._id"
              cols="12"
              md="6"
            >
              <v-card
                variant="outlined"
                class="device-card rounded-lg"
                elevation="0"
              >
                <v-card-item class="px-6 py-3">
                  <template #prepend>
                    <v-icon
                      size="26"
                      class="me-3"
                      :icon="getDeviceIcon(device.type?.name)"
                      color="blue-darken-3"
                    />
                  </template>
                  <v-card-title class="text-blue-grey-darken-2 font-weight-bold">
                    {{ device.type?.name }}
                  </v-card-title>
                  <v-card-subtitle v-if="device.deviceName">
                    {{ device.deviceName }}
                  </v-card-subtitle>
                </v-card-item>

                <v-divider />

                <v-card-text class="pt-4 px-6">
                  <v-row dense>
                    <template v-if="device.serialNumber">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-barcode
                          </v-icon>
                          <span class="text-grey">序號：</span>
                          <span class="ml-2">{{ device.serialNumber }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.loginName">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-account
                          </v-icon>
                          <span class="text-grey">登入名稱：</span>
                          <span class="ml-2">{{ device.loginName }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.office2021Account">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-microsoft-office
                          </v-icon>
                          <span class="text-grey">Office 2021：</span>
                          <span class="ml-2">{{ device.office2021Account }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.office365Account">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-microsoft-office
                          </v-icon>
                          <span class="text-grey">Office 365：</span>
                          <span class="ml-2">{{ device.office365Account }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.office2021InstallDate">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-calendar
                          </v-icon>
                          <span class="text-grey">安裝日期：</span>
                          <span class="ml-2">{{ formatDate(device.office2021InstallDate) }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.macAddress">
                      <v-col cols="12">
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-ethernet
                          </v-icon>
                          <span class="text-grey">MAC：</span>
                          <span class="ml-2">{{ device.macAddress }}</span>
                        </div>
                      </v-col>
                    </template>

                    <template v-if="device.note">
                      <v-col cols="12">
                        <div class="d-flex align-center">
                          <v-icon
                            size="18"
                            color="grey"
                            class="me-2"
                          >
                            mdi-note-text
                          </v-icon>
                          <span class="text-grey">備註：</span>
                          <span class="ml-2">{{ device.note }}</span>
                        </div>
                      </v-col>
                    </template>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'

// 頁面定義
definePage({
  meta: {
    title: '公司員工列表 | Ystravel',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.IT, UserRole.HR]
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

// 表格相關
const tableHeaders = [
  { title: '科威員編', key: 'employeeCode', align: 'start', sortable: true },
  { title: '系統編號', key: 'employeeId', minWidth: '120px', align: 'start', sortable: true },
  { title: '姓名', key: 'name', minWidth: '90px', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', minWidth: '90px', align: 'start', sortable: true },
  { title: '部門', key: 'department.name', align: 'start', sortable: true },
  { title: '聘僱類型', key: 'employmentType', align: 'start', sortable: true },
  { title: '職稱', key: 'jobTitle', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: '狀態', key: 'employmentStatus', width: '100px', align: 'start', sortable: true },
  { title: '備註', key: 'note', minWidth:'160px', align: 'start', sortable: true },
  { title: '設備', key: 'devices', align: 'center', sortable: false }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'employeeCode', order: 'asc' }])

// 搜尋相關響應式變數
const quickSearch = ref('')
const companies = ref([])
const departments = ref([])
const searchCriteria = ref({
  company: '',
  department: '',
  employmentType: '',
  jobTitle: '',
  status: '',
  dateType: '',
  dateRange: []
})

// 狀態選項
const statusOptions = [
  { title: '在職', value: '在職' },
  { title: '離職', value: '離職' },
  { title: '留職停薪', value: '留職停薪' },
  { title: '待入職', value: '待入職' }
]

// 聘僱類型選項
const employmentTypeOptions = [
  { text: '正職', value: '正職' },
  { text: '兼職', value: '兼職' },
  { text: '實習生', value: '實習生' }
]

// 職稱選項
const jobTitleOptions = [
  { text: '董事長', value: '董事長' },
  { text: '總經理', value: '總經理' },
  { text: '副總經理', value: '副總經理' },
  { text: '協理', value: '協理' },
  { text: '總監', value: '總監' },
  { text: '部長', value: '部長' },
  { text: '經理', value: '經理' },
  { text: '票務經理', value: '票務經理' },
  { text: '專案經理', value: '專案經理' },
  { text: '副理', value: '副理' },
  { text: '主任', value: '主任' },
  { text: '業務代表', value: '業務代表' },
  { text: 'OP', value: 'OP' },
  { text: '線控', value: '線控' },
  { text: '線控助理', value: '線控助理' },
  { text: '日本線控', value: '日本線控' },
  { text: '日本手配', value: '日本手配' },
  { text: '財務', value: '財務' },
  { text: '美編', value: '美編' },
  { text: '行銷', value: '行銷' },
  { text: '網頁設計', value: '網頁設計' },
  { text: '工程師', value: '工程師' },
  { text: '人事行政專員', value: '人事行政專員' },
  { text: '行政專員', value: '行政專員' },
  { text: '總務專員', value: '總務專員' },
  { text: '財務助理', value: '財務助理' },
  { text: '業務助理', value: '業務助理' },
  { text: 'OP助理', value: 'OP助理' },
  { text: '團體機位助理', value: '團體機位助理' },
  { text: '美編助理', value: '美編助理' },
  { text: '外務', value: '外務' },
  { text: '旅遊經理人', value: '旅遊經理人' },
  { text: '助理工程師', value: '助理工程師' },
  { text: 'Indoor', value: 'Indoor' },
  { text: '工讀生', value: '工讀生' },
  { text: '實習生', value: '實習生' },
  { text: '顧問', value: '顧問' }
]

// 日期類型選項
const dateTypeOptions = [
  { title: '到職日期', value: 'hireDate' },
  { title: '離職日期', value: 'resignationDate' },
  { title: '留停開始日期', value: 'unpaidLeaveStartDate' },
  { title: '留停復職日期', value: 'reinstatementDate' }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    // sm以下：只顯示科威員編、姓名和設備
    return tableHeaders.filter(header =>
      ['employeeCode', 'name', 'devices'].includes(header.key)
    )
  } else if (!mdAndUp.value) {
    // sm~md：顯示科威員編、姓名、公司、部門、職稱、設備
    return tableHeaders.filter(header =>
      ['employeeCode', 'name', 'company.name', 'department.name', 'jobTitle', 'devices'].includes(header.key)
    )
  } else if (!lgAndUp.value) {
    // md~lg：顯示除了系統編號和備註外的所有欄位
    return tableHeaders.filter(header =>
      !['employeeId', 'note'].includes(header.key)
    )
  } else {
    // lg以上：顯示所有欄位
    return tableHeaders
  }
})

// 設備對話框相關
const deviceDialog = ref({
  open: false,
  loading: false,
  employeeName: '',
  employeeId: '',
  devices: []
})

// API 相關函數
const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = data.result.data
    }
  } catch (error) {
    console.error('載入公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const handleCompanyChange = async () => {
  searchCriteria.value.department = ''
  if (!searchCriteria.value.company) {
    departments.value = []
    return
  }

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: searchCriteria.value.company }
    })
    if (data.success) {
      departments.value = data.result
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    departments.value = []
  }
}

// 處理日期類型變更
const handleDateTypeChange = () => {
  searchCriteria.value.dateRange = []
}

// 修改日期區間變更處理函數
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 修改 performSearch 函數中的日期處理部分
const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'employeeId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: quickSearch.value,
      company: searchCriteria.value.company,
      department: searchCriteria.value.department,
      employmentType: searchCriteria.value.employmentType,
      jobTitle: searchCriteria.value.jobTitle,
      status: searchCriteria.value.status
    }

    // 處理日期搜尋
    if (searchCriteria.value.dateType &&
        Array.isArray(searchCriteria.value.dateRange) &&
        searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      const endDate = new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      params.dateType = searchCriteria.value.dateType
      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/employees/all', { params })
    if (data.success) {
      tableItems.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

const resetSearch = () => {
  searchCriteria.value = {
    company: '',
    department: '',
    employmentType: '',
    jobTitle: '',
    status: '',
    dateType: '',
    dateRange: []
  }
  quickSearch.value = ''
  departments.value = []
  performSearch()
}

// 表格操作函數
const handleTableOptionsChange = async (options) => {
  tablePage.value = options.page
  tableItemsPerPage.value = options.itemsPerPage
  if (options.sortBy?.length > 0) {
    tableSortBy.value = options.sortBy
  }
  await performSearch()
}

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  tablePage.value = 1
  performSearch()
}, 300)

watch(quickSearch, () => {
  debouncedSearch()
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadCompanies(),
    performSearch()
  ])
})

// 狀態顏色對應
const getStatusColor = (status) => {
  switch (status) {
    case '在職':
      return 'teal-lighten-1'
    case '離職':
      return 'grey'
    case '留職停薪':
      return 'amber-darken-2'
    case '待入職':
      return 'light-blue-darken-1'
    default:
      return 'grey'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 開啟設備對話框
const openDeviceDialog = async (employee) => {
  deviceDialog.value = {
    open: true,
    loading: true,
    employeeName: employee.name,
    employeeId: employee._id,
    devices: []
  }

  try {
    const { data } = await apiAuth.get('/hardware/devices/all', {
      params: {
        user: employee._id,
        all: true,
        sortBy: 'type.order',
        sortOrder: 'asc'
      }
    })
    if (data.success) {
      deviceDialog.value.devices = data.result.data
    }
  } catch (error) {
    console.error('載入設備清單失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入設備清單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deviceDialog.value.loading = false
  }
}

// 關閉設備對話框
const closeDeviceDialog = () => {
  deviceDialog.value.open = false
}

// 在 script setup 部分添加以下函數
const getDeviceIcon = (deviceType) => {
  if (!deviceType) return 'mdi-devices'

  const type = deviceType.toLowerCase()
  if (type.includes('筆電') || type.includes('筆記型電腦')) return 'mdi-laptop'
  if (type.includes('桌機') || type.includes('桌上型電腦')) return 'mdi-desktop-tower-monitor'
  if (type.includes('主機')) return 'mdi-desktop-tower'
  if (type.includes('平板')) return 'mdi-tablet'
  if (type.includes('手機')) return 'mdi-cellphone'
  if (type.includes('螢幕')) return 'mdi-monitor'
  if (type.includes('印表機') || type.includes('事務機')) return 'mdi-printer'
  if (type.includes('鍵盤')) return 'mdi-keyboard-outline'
  if (type.includes('滑鼠')) return 'mdi-mouse-outline'

  return 'mdi-devices'
}

const getStatusDateIcon = (item) => {
  switch (item.employmentStatus) {
    case '在職':
      return 'mdi-calendar-check'
    case '離職':
      return 'mdi-calendar-remove'
    case '留職停薪':
      return 'mdi-calendar-clock'
    case '待入職':
      return 'mdi-calendar-arrow-right'
    default:
      return 'mdi-calendar'
  }
}

const getStatusDateText = (item) => {
  switch (item.employmentStatus) {
    case '在職':
      return `到職日期：${formatDate(item.hireDate)}`
    case '離職':
      return `離職日期：${formatDate(item.resignationDate)}`
    case '待入職':
      return `到職日期：${formatDate(item.hireDate)}`
    case '留職停薪':
      return `留停開始日期：${formatDate(item.unpaidLeaveStartDate)}`
    default:
      return ''
  }
}

const getStatusDateClass = (item) => {
  switch (item.employmentStatus) {
    case '在職':
      return 'bg-teal-lighten-1 text-white'
    case '離職':
      return 'bg-grey text-white'
    case '留職停薪':
      return 'bg-amber-darken-2 text-white'
    case '待入職':
      return 'bg-light-blue-darken-1 text-white'
    default:
      return 'bg-grey text-white'
  }
}
</script>

<style lang="scss" scoped>
.v-table :deep(thead) {
  height: 48px !important;
  background-color: #455a64 !important;
  color: #fff !important;
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
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

.v-table :deep(tbody tr) {
  height: 48px !important;
}

.device-dialog {
  .device-card {
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.12);
    min-height: 345.69px;

    &:hover {
      border-color: var(--v-primary-base);
      transform: translateY(-2px);
    }
  }
}

.status-cell {
  border-radius: 4px;
  min-height: 32px;
}

.status-card {
  .v-card-text {
    font-size: 0.875rem;
  }
}
</style>
