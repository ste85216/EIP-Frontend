<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5 px-2 px-xxl-0">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="mt-1 px-lg-6 px-xl-12 px-xxl-2"
              >
                <v-card class="elevation-4 rounded-lg py-7 px-0">
                  <div class="d-flex align-center px-7">
                    <h3 class="me-4">
                      直客詢問統計表
                    </h3>
                    <v-spacer />
                    <!-- 倒數計時顯示器 -->
                    <div
                      v-if="currentEmployee && remainingTime > 0"
                      class="clock-container"
                    >
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-timer-sand"
                          size="18"
                          class="me-2"
                          color="orange-darken-4"
                        />
                        <div
                          class="text-orange-darken-4"
                          style="font-size: 15px; font-weight: 600; letter-spacing: 1px;"
                        >
                          {{ Math.floor(remainingTime / 60) }}:{{ String(remainingTime % 60).padStart(2, '0') }}
                        </div>
                      </div>
                    </div>
                    <EmployeeLogin
                      ref="employeeLoginRef"
                      login-endpoint="/employees/google-login"
                      @login-success="handleEmployeeLogin"
                      @logout="handleEmployeeLogout"
                    />
                  </div>
                  <v-divider class="mt-5 mb-6" />
                  <v-card-text class="pt-4 px-9">
                    <v-row class="mb-2">
                      <!-- 來源選擇 -->
                      <v-col cols="2">
                        <div class="d-flex align-center">
                          <span class="text-label">來源 :</span>
                          <v-select
                            v-model="searchCriteria.source"
                            :items="sourceOptions"
                            item-title="text"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            placeholder="請選擇來源"
                            hide-details
                            clearable
                            class="ms-4"
                            :disabled="!currentEmployee"
                          />
                        </div>
                      </v-col>

                      <!-- 業務選擇 -->
                      <v-col cols="2">
                        <div class="d-flex align-center">
                          <span class="text-label">業務 :</span>
                          <v-autocomplete
                            v-model="searchCriteria.salesPerson"
                            class="ms-4"
                            :items="searchSalesPersons"
                            :item-title="item => {
                              if (!item) return '';
                              if (typeof item === 'string') return item;
                              return `${item.name} ( ${item.nickname ? item.nickname + ' ' : ''} ${item.employeeCode} )`;
                            }"
                            item-value="_id"
                            variant="outlined"
                            density="compact"
                            placeholder="請選擇業務"
                            hide-details
                            clearable
                            :disabled="!currentEmployee"
                            @update:model-value="handleSalesPersonChange"
                          />
                        </div>
                      </v-col>

                      <!-- 日期區間 -->
                      <v-col
                        cols="2"
                        class="pe-1"
                      >
                        <div class="d-flex align-center">
                          <span class="text-label">日期 :</span>
                          <v-date-input
                            v-model="searchCriteria.dateRange"
                            class="ms-4"
                            variant="outlined"
                            density="compact"
                            prepend-icon
                            hide-details
                            clearable
                            placeholder="請選擇日期"
                            multiple="range"
                            :cancel-text="'取消'"
                            :ok-text="'確認'"
                            :disabled="!currentEmployee"
                            @update:model-value="handleDateRangeChange"
                          />
                        </div>
                      </v-col>

                      <!-- 地區 -->
                      <v-col cols="2">
                        <div class="d-flex align-center">
                          <span class="text-label">地區 :</span>
                          <v-autocomplete
                            v-model="searchCriteria.inquiryPlace"
                            class="ms-4"
                            :items="placeOptions"
                            variant="outlined"
                            density="compact"
                            clearable
                            placeholder="請選擇地區"
                            hide-details
                            :disabled="!currentEmployee"
                          />
                        </div>
                      </v-col>

                      <!-- 詢問結果 -->
                      <v-col cols="2">
                        <div class="d-flex align-center">
                          <span class="text-label">結果 :</span>
                          <v-select
                            v-model="searchCriteria.inquiryResult"
                            class="ms-4"
                            :items="inquiryResultOptions"
                            item-title="text"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            clearable
                            placeholder="請選擇結果"
                            hide-details
                            :disabled="!currentEmployee"
                          />
                        </div>
                      </v-col>
                      <v-col cols="2">
                        <v-row class="d-flex justify-end">
                          <v-col
                            cols="8"
                            class="ps-0"
                          >
                            <v-btn
                              color="cyan-darken-2"
                              prepend-icon="mdi-magnify"
                              :loading="tableLoading"
                              :disabled="!currentEmployee"
                              block
                              @click="performSearch"
                            >
                              搜尋
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="3"
                            class="ps-0"
                          >
                            <v-btn
                              color="grey"
                              width="40"
                              block
                              :disabled="!currentEmployee"
                              @click="resetSearch"
                            >
                              <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider class="my-2" />
                  <v-row class="px-1 px-md-7 mt-1 bg-white">
                    <!-- 標題和功能按鈕區 -->
                    <v-col
                      cols="12"
                      class="ps-4 pb-sm-4"
                    >
                      <v-row>
                        <v-col class="d-flex justify-space-between align-center">
                          <div class="d-flex justify-space-between align-center">
                            <v-btn
                              prepend-icon="mdi-account-switch"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              :disabled="!currentEmployee"
                              @click="openSalesRotationDialog"
                            >
                              業務輪流表
                            </v-btn>
                            <v-btn
                              v-tooltip="isCurrentMonthActive ? '取消本月篩選' : '查看本月'"
                              icon
                              :color="isCurrentMonthActive ? 'orange-darken-2' : 'cyan-darken-2'"
                              variant="text"
                              size="34"
                              class="me-4"
                              :disabled="!currentEmployee"
                              @click="toggleCurrentMonth"
                            >
                              <v-icon
                                size="20"
                                style="padding-top: 2px;"
                              >
                                {{ isCurrentMonthActive ? 'mdi-calendar-remove' : 'mdi-calendar-month' }}
                              </v-icon>
                            </v-btn>
                          </div>
                          <v-col
                            cols="2"
                            class="d-flex align-center pe-1"
                          >
                            <v-icon
                              v-tooltip:start="'可搜尋客戶姓名、電話、Email、Line ID、詢問內容、進度 / 備註'"
                              icon="mdi-information"
                              size="small"
                              color="blue-grey-darken-2"
                              class="me-2"
                            />
                            <v-text-field
                              v-model="quickSearch"
                              :loading="isSearching"
                              density="compact"
                              variant="outlined"
                              label="快速搜尋"
                              append-inner-icon="mdi-magnify"
                              hide-details
                              clearable
                              :disabled="!currentEmployee"
                            />
                          </v-col>
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- 表格區 -->
                    <v-col cols="12">
                      <v-data-table-server
                        v-model:items-per-page="tableItemsPerPage"
                        v-model:sort-by="tableSortBy"
                        :items-per-page-options="[10, 20, 50, 100]"
                        :items="tableItems"
                        :headers="filteredHeaders"
                        :loading="tableLoading"
                        :items-length="tableItemsLength"
                        :page="tablePage"
                        hover
                        density="compact"
                        class="rounded-ts-lg rounded-te-lg"
                        @update:options="handleTableOptionsChange"
                      >
                        <template #item="{ item, index }">
                          <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                            <td>
                              <!-- inquiryDate column -->
                              <div v-if="item.inquiryDate">
                                <div>{{ formatDatePart(item.inquiryDate) }}</div>
                                <div class="text-caption text-grey-darken-1">
                                  <v-icon
                                    size="14"
                                    style="padding-bottom: 2px;"
                                  >
                                    mdi-clock-outline
                                  </v-icon> {{ formatTimePart(item.inquiryDate) }}
                                </div>
                              </div>
                            </td>
                            <td>{{ item.source }}</td>
                            <td>{{ item.inquiryPlace }}</td>
                            <td>
                              <div
                                class="white-space-pre-wrap"
                                v-html="formatInquiryContent(item.inquiryContent)"
                              />
                            </td>
                            <td>{{ item.customerName }}</td>
                            <td>
                              <v-menu>
                                <template #activator="{ props }">
                                  <v-btn
                                    v-bind="props"
                                    :color="getCustomerTitleColor(item.customerTitle)"
                                    variant="outlined"
                                    class="px-2"
                                    size="small"
                                    :loading="updatingCustomerTitles.has(item._id)"
                                  >
                                    {{ item.customerTitle || '選擇稱謂' }}
                                  </v-btn>
                                </template>
                                <v-list>
                                  <v-list-item
                                    v-for="title in titleOptions"
                                    :key="title"
                                    @click="updateCustomerTitle(item._id, title)"
                                  >
                                    <v-list-item-title>{{ title }}</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </td>
                            <td>{{ item.customerPhone }}</td>
                            <td>{{ item.customerLineId }}</td>
                            <td>{{ item.customerEmail }}</td>
                            <td>
                              <v-menu max-height="320">
                                <template #activator="{ props }">
                                  <v-btn
                                    v-if="item.salesPerson"
                                    v-bind="props"
                                    color="blue-darken-1"
                                    variant="outlined"
                                    class="px-2"
                                    size="small"
                                    :loading="updatingSalesPersons.has(item._id)"
                                  >
                                    {{ getSalesPersonIndex(item.salesPerson) }} {{ item.salesPerson.nickname || item.salesPerson.name }}
                                  </v-btn>
                                  <v-btn
                                    v-else
                                    v-bind="props"
                                    color="grey"
                                    variant="outlined"
                                    class="px-2"
                                    size="small"
                                    :loading="updatingSalesPersons.has(item._id)"
                                  >
                                    選擇業務
                                  </v-btn>
                                </template>
                                <v-list>
                                  <v-list-item
                                    v-for="person in companySalesPersonsMap.get(item.company._id) || []"
                                    :key="person._id"
                                    @click="updateSalesPerson(item._id, person._id)"
                                  >
                                    <v-list-item-title>{{ getSalesPersonIndex(person) }} {{ person.nickname || person.name }} ({{ person.employeeCode }})</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </td>
                            <td>
                              <v-menu max-height="360">
                                <template #activator="{ props }">
                                  <v-btn
                                    v-if="item.inquiryResult"
                                    v-bind="props"
                                    :color="getInquiryResultColor(item.inquiryResult)"
                                    variant="outlined"
                                    class="px-2 opacity-100"
                                    size="small"
                                    :loading="updatingInquiryResults.has(item._id)"
                                  >
                                    {{ item.inquiryResult }}
                                  </v-btn>
                                  <v-btn
                                    v-else
                                    v-bind="props"
                                    color="grey"
                                    variant="outlined"
                                    class="px-2 opacity-100"
                                    size="small"
                                    :loading="updatingInquiryResults.has(item._id)"
                                  >
                                    選擇結果
                                  </v-btn>
                                </template>
                                <v-list>
                                  <v-list-item
                                    v-for="option in inquiryResultOptions"
                                    :key="option.value"
                                    @click="updateInquiryResult(item._id, option.value)"
                                  >
                                    <v-list-item-title>{{ option.text }}</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </td>
                            <td>
                              <div class="d-flex align-center">
                                <div class="white-space-pre-wrap flex-grow-1">
                                  <template v-if="item.latestProgressNote?.content">
                                    {{ item.latestProgressNote.content }}
                                    <div
                                      v-if="item.latestProgressNote"
                                      class="text-caption text-grey-darken-1"
                                    >
                                      <v-icon
                                        size="14"
                                        style="padding-bottom: 2px;"
                                      >
                                        mdi-clock-outline
                                      </v-icon> <span>{{ formatProgressNoteTime(item.latestProgressNote.createdAt) }}</span>
                                    </div>
                                  </template>
                                  <template v-else>
                                    <div class="text-grey">
                                      【 請點擊右方按鈕新增 】
                                    </div>
                                  </template>
                                </div>
                                <v-btn
                                  v-tooltip:top="'新增及查看紀錄'"
                                  icon
                                  color="blue-grey-darken-3"
                                  variant="plain"
                                  size="15"
                                  class="ms-2"
                                  :ripple="false"
                                  @click="openSimpleDialog(item)"
                                >
                                  <v-icon>mdi-history</v-icon>
                                </v-btn>
                              </div>
                            </td>
                          </tr>
                        </template>
                      </v-data-table-server>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 簡化版編輯對話框 -->
    <v-dialog
      v-model="simpleDialog.open"
      persistent
      max-width="720"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-blue-grey-darken-2">
          <v-icon
            size="20"
            class="me-2"
          >
            mdi-history
          </v-icon>
          <span class="card-title text-white">進度 / 備註 - 歷史紀錄</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeSimpleDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-7">
          <!-- 加入載入中動畫 -->
          <div
            v-if="isDialogLoading"
            class="d-flex justify-center align-center"
            style="min-height: 200px;"
          >
            <v-progress-circular
              indeterminate
              color="amber-darken-4"
              size="64"
              width="8"
            />
          </div>

          <!-- 新增進度/備註區域 -->
          <div v-else>
            <div class="d-flex align-center mb-6">
              <v-textarea
                v-model="progressNoteInput"
                label="新增進度 / 備註"
                variant="outlined"
                density="compact"
                :error="!!progressNoteError"
                :error-messages="progressNoteError"
                rows="2"
                hide-details="auto"
                class="flex-grow-1 me-2"
                :disabled="isAddingNote"
              />
              <v-btn
                color="teal-darken-1"
                :loading="isAddingNote"
                :disabled="!progressNoteInput?.trim()"
                @click="confirmNoteDialog = true"
              >
                新增
              </v-btn>
            </div>

            <!-- 進度/備註列表 -->
            <v-data-table
              :headers="progressNotesHeaders"
              :items="getCurrentItemProgressNotes"
              class="elevation-0 rounded-sm progress-notes-table"
              density="compact"
              :sort-by="[{ key: 'createdAt', order: 'desc' }]"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.content }}</td>
                  <td>{{ formatProgressNoteTime(item.createdAt) }}</td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 確認新增進度/備註對話框 -->
    <v-dialog
      v-model="confirmNoteDialog"
      max-width="340"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-teal-darken-2">
          <v-icon
            size="20"
            class="me-2"
          >
            mdi-check-circle
          </v-icon>
          <span class="card-title text-white">確認新增</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="confirmNoteDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 pt-3 pb-0">
          <div class="mb-4">
            請確認是否要新增以下進度/備註？新增後將無法修改或刪除。
          </div>
          <v-card
            variant="outlined"
            color="grey-darken-1"
            class="pa-3"
          >
            {{ progressNoteInput }}
          </v-card>
        </v-card-text>
        <v-card-actions class="px-6 py-6">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="confirmNoteDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isAddingNote"
            class="ms-2"
            @click="addProgressNote"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 業務輪流表對話框 -->
    <v-dialog
      v-model="salesRotationDialog.open"
      max-width="890"
    >
      <v-card class="rounded-lg pb-2">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-blue-grey-darken-2">
          <v-icon
            size="20"
            class="me-2"
          >
            mdi-account-switch
          </v-icon>
          <span class="card-title text-white">業務輪流表</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeSalesRotationDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-7 py-7">
          <!-- 加入載入中動畫 -->
          <div
            v-if="isLoadingSalesRotation"
            class="d-flex justify-center align-center"
            style="min-height: 200px;"
          >
            <v-progress-circular
              indeterminate
              color="amber-darken-4"
              size="64"
              width="8"
            />
          </div>

          <!-- 業務列表 -->
          <div v-else>
            <div
              v-if="companySalesPersons.length === 0"
              class="text-center pa-4 text-grey"
            >
              目前尚無業務資料
            </div>
            <v-row v-else>
              <v-col
                v-for="(person, index) in companySalesPersons"
                :key="person._id"
                cols="12"
                sm="3"
                class="pa-1"
              >
                <v-list-item
                  class="px-3 pt-2 py-3 rounded-lg"
                  density="compact"
                  style="border: 1px solid #e0e0e0;"
                >
                  <v-list-item-title style="font-size: 15px;">
                    {{ person.nickname || person.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle style="font-size: 13px;">
                    員工編號：{{ person.employeeCode }}
                  </v-list-item-subtitle>
                  <template #prepend>
                    <v-avatar
                      color="amber-darken-4"
                      size="18"
                    >
                      <span style="font-size: 12px; color: #fff;">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                </v-list-item>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="closeSalesRotationDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 業務指派確認對話框 -->
    <v-dialog
      v-model="salesPersonAssignmentDialog.open"
      persistent
      max-width="340"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-1 mb-2 d-flex justify-space-between align-center bg-teal-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-check-circle
            </v-icon>確認業務指派
          </div>
          <v-btn
            icon
            variant="text"
            size="40"
            @click="closeSalesPersonAssignmentDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-3">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="card-title text-grey-darken-2 mb-3">
                被指派的業務：{{ salesPersonAssignmentDialog.salesPersonName }}
              </div>
              <div class="text-grey-darken-2">
                請確認指派業務是否正確，確認後會發送Email給被指派的業務。
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 py-4 mb-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :disabled="salesPersonAssignmentDialog.isLoading"
            @click="closeSalesPersonAssignmentDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="salesPersonAssignmentDialog.isLoading"
            :disabled="salesPersonAssignmentDialog.isLoading"
            @click="confirmSalesPersonAssignment"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <TourGuide ref="tourGuide" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import TourGuide from '@/components/TourGuide.vue'
import EmployeeLogin from '@/components/EmployeeLogin.vue'

// 頁面定義
definePage({
  meta: {
    title: '直客詢問統計表 | Ystravel',
    login: false,
  }
})

// API 與工具初始化
const { api } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp, mdAndUp } = useDisplay()

// 響應式變數
const isSearching = ref(false)
const isCurrentMonthActive = ref(false)
const employeeLoginRef = ref(null)
const currentEmployee = ref(null)

// 倒數計時相關變數
const autoLogoutTimer = ref(null)
const countdownTimer = ref(null)
const remainingTime = ref(0)
const reminderShown = ref({
  fiveMinutes: false,
  oneMinute: false
})
const VERIFICATION_EXPIRY_HOURS = 1 // 1小時過期

// 表格相關
const tableHeaders = [
  { title: '日期 / 時間', key: 'inquiryDate', minWidth: '116px', align: 'start', sortable: true },
  { title: '來源', key: 'source', width: '90px', align: 'start', sortable: true },
  { title: '地區', key: 'inquiryPlace', minWidth: '84px', align: 'start', sortable: true },
  { title: '詢問內容', key: 'inquiryContent', width: '240px', align: 'start', sortable: true },
  { title: '客戶姓名', key: 'customerName', minWidth: '104px', align: 'start', sortable: true },
  { title: '稱謂', key: 'customerTitle', align: 'start', sortable: true },
  { title: '電話', key: 'customerPhone', align: 'start', sortable: true },
  { title: 'Line ID', key: 'customerLineId', align: 'start', sortable: true },
  { title: 'Email', key: 'customerEmail', align: 'start', sortable: true },
  { title: '業務', key: 'salesPerson.name', align: 'start', sortable: true },
  { title: '詢問結果', key: 'inquiryResult', width: '110px', align: 'start', sortable: true },
  { title: '最新進度 / 備註', key: 'latestProgressNote.content', width: '220px', align: 'start', sortable: true }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'inquiryDate', order: 'desc' }])

// 搜尋相關響應式變數
const quickSearch = ref('')
const searchCriteria = ref({
  source: null,
  salesPerson: null,
  dateRange: null,
  inquiryPlace: null,
  inquiryResult: null
})

// 來源選項
const sourceOptions = [
  { text: 'Facebook', value: 'Facebook' },
  { text: 'Line@', value: 'Line@' },
  { text: 'IG', value: 'IG' },
  { text: '非常婚禮', value: '非常婚禮' },
  { text: '其他', value: '其他' }
]

// 詢問結果選項
const inquiryResultOptions = [
  { text: '成交', value: '成交' },
  { text: '不成交', value: '不成交' },
  { text: '其他', value: '其他' }
]

// 地區選項
const placeOptions = ref([])

// 稱謂選項
const titleOptions = ['先生', '小姐', '其他']

// 修改響應式表格標頭
const filteredHeaders = computed(() => {
  let headers = tableHeaders

  // 根據螢幕大小過濾欄位
  if (!smAndUp.value) {
    headers = headers.filter(header =>
      ['inquiryDate', 'customerName'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    headers = headers.filter(header =>
      !['inquiryPlace'].includes(header.key)
    )
  }
  return headers
})

// 對話框相關響應式變數
const isDialogLoading = ref(false)
const progressNoteInput = ref('')
const isAddingNote = ref(false)
const confirmNoteDialog = ref(false)
const progressNotesHeaders = [
  { title: '進度/備註內容', key: 'content', align: 'start' },
  { title: '建立時間', key: 'createdAt', width: '170px', align: 'start' }
]

// 修改 simpleDialog 的結構
const simpleDialog = ref({
  open: false,
  id: null,
  originalResult: null,
  pendingResult: null,
  requireNote: false
})

// 業務輪流表對話框相關響應式變數
const salesRotationDialog = ref({
  open: false
})

const isLoadingSalesRotation = ref(false)
const companySalesPersons = ref([])

// 添加一個 Map 來存儲每個公司的業務列表
const companySalesPersonsMap = ref(new Map())
const searchSalesPersons = ref([])

const updatingSalesPersons = ref(new Set())
const updatingInquiryResults = ref(new Set())
const updatingCustomerTitles = ref(new Set())

// 業務指派確認對話框
const salesPersonAssignmentDialog = ref({
  open: false,
  itemId: null,
  salesPersonId: null,
  salesPersonName: '',
  customerName: '',
  isLoading: false
})

// 添加進度/備註錯誤計算屬性
const progressNoteError = computed(() => {
  if (simpleDialog.value.requireNote && (!progressNoteInput.value || !progressNoteInput.value.trim())) {
    return '更改詢問結果為"不成交"或是"其他"時，請新增一筆進度/備註紀錄說明原因'
  }
  return ''
})

// 獲取當前項目的進度/備註
const getCurrentItemProgressNotes = computed(() => {
  const item = tableItems.value.find(i => i._id === simpleDialog.value.id)
  return item?.progressNotes || []
})

// 載入地區選項
const loadPlaceOptions = async () => {
  try {
    const { data } = await api.get('/lineCategories/all-second-level')
    if (data.success) {
      placeOptions.value = data.result
        .sort((a, b) => a.order - b.order)
        .map(item => item.name)
    }
  } catch (error) {
    console.error('載入地區選項失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入地區選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 修改 loadSearchSalesPersons 函數
const loadSearchSalesPersons = async () => {
  try {
    const params = {
      showInB2C: true
    }

    // 如果已登入業務，只顯示該公司的業務
    if (currentEmployee.value) {
      params.company = currentEmployee.value.company._id
    }

    // 檢查是否有 Authorization header
    if (!api.defaults.headers.common['Authorization']) {
      // 如果沒有 header，嘗試從 localStorage 獲取
      const authData = localStorage.getItem('employeeAuth')
      if (authData) {
        const { token } = JSON.parse(authData)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }

    const { data } = await api.get('/employees/suggestions', { params })
    if (data.success) {
      // 按照 order 排序業務列表
      const sortedSalesPersons = data.result.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999
        const orderB = typeof b.order === 'number' ? b.order : 9999
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.name.localeCompare(b.name)
      })
      searchSalesPersons.value = sortedSalesPersons
    }
  } catch (error) {
    console.error('載入業務列表失敗:', error)
    // 如果是 401 錯誤，不顯示錯誤訊息，因為可能是未登入狀態
    if (error?.response?.status !== 401) {
    createSnackbar({
      text: error?.response?.data?.message || '載入業務列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    }
  }
}

// 添加一個新的函數來獲取特定公司的業務列表
const getCompanySalesPersons = async (companyId) => {
  try {
    const { data } = await api.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        company: companyId
      }
    })
    if (data.success) {
      // 按照 order 排序業務列表
      const sortedSalesPersons = data.result.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999
        const orderB = typeof b.order === 'number' ? b.order : 9999
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.name.localeCompare(b.name)
      })
      companySalesPersonsMap.value.set(companyId, sortedSalesPersons)
    }
  } catch (error) {
    console.error('載入業務列表失敗:', error)
    companySalesPersonsMap.value.set(companyId, [])
  }
}

// 處理日期區間變更
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 處理業務選擇變更
const handleSalesPersonChange = (value) => {
  if (!value && currentEmployee.value) {
    searchCriteria.value.salesPerson = null
  }
}

// 檢查登出狀態的函數
const checkAutoLogout = () => {
  if (!currentEmployee.value) {
    return
  }

  const authData = localStorage.getItem('employeeAuth')
  if (!authData) {
    return
  }

  const { timestamp } = JSON.parse(authData)
  const now = new Date().getTime()
  const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

  if (now > expiryTime) {
    // 清除驗證資訊
    localStorage.removeItem('employeeAuth')
    currentEmployee.value = null

    // 通知 EmployeeLogin 組件登出
    if (employeeLoginRef.value) {
      employeeLoginRef.value.handleLogout()
    }

    // 清空表格資料
    tableItems.value = []
    tableItemsLength.value = 0

    // 強制觸發搜尋更新
    performSearch()

    // 顯示登出提示
    createSnackbar({
      text: '登入時效已到期，已自動登出',
      snackbarProps: {
        color: 'warning',
        timeout: -1, // 不自動關閉
        location: 'top'
      }
    })

    // 清除定時器
    if (autoLogoutTimer.value) {
      clearInterval(autoLogoutTimer.value)
      autoLogoutTimer.value = null
    }
  }
}

// 添加一個函數來設置定時器
const setupAutoLogoutTimer = () => {
  // 先清除舊的定時器
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value)
  }
  // 設置新的定時器
  autoLogoutTimer.value = setInterval(checkAutoLogout, 1000)
}

// 更新驗證時間戳記
const updateVerificationTimestamp = () => {
  const authData = localStorage.getItem('employeeAuth')
  if (authData) {
    const data = JSON.parse(authData)
    // 更新時間戳記
    data.timestamp = new Date().getTime()
    localStorage.setItem('employeeAuth', JSON.stringify(data))

    // 重置提醒狀態
    reminderShown.value = {
      fiveMinutes: false,
      oneMinute: false
    }

    // 更新倒數計時
    updateRemainingTime()
  }
}

// 更新倒數計時
const updateRemainingTime = () => {
  const authData = localStorage.getItem('employeeAuth')
  if (!authData) {
    remainingTime.value = 0
    return
  }

  const { timestamp } = JSON.parse(authData)
  const now = new Date().getTime()
  const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)
  const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000))
  remainingTime.value = remaining

  // 檢查是否需要顯示提醒
  const remainingMinutes = Math.floor(remaining / 60)

  // 5分鐘提醒
  if (remainingMinutes === 5 && !reminderShown.value.fiveMinutes) {
    createSnackbar({
      text: '系統將在 5 分鐘後自動登出，請注意資料保存',
      snackbarProps: {
        color: 'warning',
        timeout: 10000, // 顯示10秒
        location: 'top'
      }
    })
    reminderShown.value.fiveMinutes = true
  }

  // 1分鐘提醒
  if (remainingMinutes === 1 && !reminderShown.value.oneMinute) {
    createSnackbar({
      text: '系統將在 1 分鐘後自動登出，請立即保存資料！',
      snackbarProps: {
        color: 'warning',
        timeout: 10000, // 顯示10秒
        location: 'top'
      }
    })
    reminderShown.value.oneMinute = true
  }
}

// Employee 登入處理函數
const handleEmployeeLogin = async (employee) => {
  currentEmployee.value = employee

  // 確保 Authorization header 已設定
  const authData = localStorage.getItem('employeeAuth')
  if (authData) {
    const { token } = JSON.parse(authData)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // 載入該公司的業務列表
  await loadSearchSalesPersons()

  // 執行搜尋
  await performSearch()

  // 啟動倒數計時器
  setupAutoLogoutTimer()
  updateRemainingTime()
  countdownTimer.value = setInterval(() => {
    updateRemainingTime()
  }, 1000)
}

// Employee 登出處理函數
const handleEmployeeLogout = () => {
  currentEmployee.value = null

  // 清空表格資料
  tableItems.value = []
  tableItemsLength.value = 0

  // 清空搜尋條件
  resetSearch()

  // 清除 API headers
  delete api.defaults.headers.common['Authorization']

  // 清除定時器
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value)
    autoLogoutTimer.value = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }

  // 重置倒數計時
  remainingTime.value = 0
  reminderShown.value = {
    fiveMinutes: false,
    oneMinute: false
  }
}

// 修改 performSearch 函數
const performSearch = async () => {
  if (!currentEmployee.value) {
    tableItems.value = []
    tableItemsLength.value = 0
    isSearching.value = false
    return
  }

  try {
    // 確保 Authorization header 已設定
    if (!api.defaults.headers.common['Authorization']) {
      const authData = localStorage.getItem('employeeAuth')
      if (authData) {
        const { token } = JSON.parse(authData)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }

    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'inquiryDate',
      sortOrder: tableSortBy.value[0]?.order || 'desc',
      quickSearch: quickSearch.value,
      source: searchCriteria.value.source,
      inquiryPlace: searchCriteria.value.inquiryPlace,
      salesPerson: searchCriteria.value.salesPerson,
      inquiryResult: searchCriteria.value.inquiryResult
    }

    if (Array.isArray(searchCriteria.value.dateRange) &&
        searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      const endDate = new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    // 使用 Employee 專用 API 端點
    const endpoint = '/customerInquiries/employee/all'

    // 更新時間戳記
    updateVerificationTimestamp()

    const { data } = await api.get(endpoint, { params })
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
    isSearching.value = false
  }
}

const resetSearch = () => {
  searchCriteria.value = {
    source: null,
    salesPerson: null,
    dateRange: null,
    inquiryPlace: null,
    inquiryResult: null
  }
  quickSearch.value = ''
  isCurrentMonthActive.value = false
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

// 監聽快速搜尋變更
watch(quickSearch, () => {
  isSearching.value = true
  debouncedSearch()
})

// 開啟業務輪流表對話框
const openSalesRotationDialog = async () => {
  salesRotationDialog.value.open = true
  isLoadingSalesRotation.value = true

  try {
    // 載入公司業務列表（只顯示一般業務，不包括業務主管）
    const { data } = await api.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        employmentStatus: '在職',
        company: currentEmployee.value.company._id
      }
    })
    if (data.success) {
      // 按照 order 排序業務列表
      const sortedSalesPersons = data.result.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 9999
        const orderB = typeof b.order === 'number' ? b.order : 9999
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.name.localeCompare(b.name)
      })
      companySalesPersons.value = sortedSalesPersons
    }
  } catch (error) {
    console.error('載入業務列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入業務列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoadingSalesRotation.value = false
  }
}

// 關閉業務輪流表對話框
const closeSalesRotationDialog = () => {
  salesRotationDialog.value.open = false
  companySalesPersons.value = []
}

// 修改 openSimpleDialog 函數
const openSimpleDialog = async (item) => {
  if (!item?._id) {
    console.error('無效的項目ID')
    return
  }

  try {
    isDialogLoading.value = true
    simpleDialog.value = {
      open: true,
      id: item._id,
      originalResult: null,
      pendingResult: null,
      requireNote: false
    }

    // 確保資料已載入
    await performSearch()

    isDialogLoading.value = false
  } catch (error) {
    console.error('載入詢問資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入詢問資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeSimpleDialog()
  }
}

// 修改 closeSimpleDialog 函數
const closeSimpleDialog = () => {
  // 如果是強制新增備註的情況且還沒有完成，恢復原始詢問結果
  if (simpleDialog.value.requireNote && simpleDialog.value.pendingResult) {
    const currentItem = tableItems.value.find(item => item._id === simpleDialog.value.id)
    if (currentItem) {
      currentItem.inquiryResult = simpleDialog.value.originalResult
    }
  }

  simpleDialog.value = {
    open: false,
    id: null,
    originalResult: null,
    pendingResult: null,
    requireNote: false
  }
  progressNoteInput.value = ''
  confirmNoteDialog.value = false
  isDialogLoading.value = false
}

// 添加新增進度/備註函數
const addProgressNote = async () => {
  if (!progressNoteInput.value?.trim()) {
    createSnackbar({
      text: '請輸入進度/備註內容',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  isAddingNote.value = true
  try {
    const response = await api.post(`/customerInquiries/employee/${simpleDialog.value.id}/progress-notes`, {
      content: progressNoteInput.value
    })

    if (response.data.success) {
      // 如果這是強制新增備註的情況（因為改為不成交或其他）
      if (simpleDialog.value.requireNote && simpleDialog.value.pendingResult) {
        // 更新詢問結果
        const endpoint = `/customerInquiries/employee/${simpleDialog.value.id}`

        const currentItem = tableItems.value.find(item => item._id === simpleDialog.value.id)

        // 保留所有原有的資料
        const updateData = {
          inquiryResult: simpleDialog.value.pendingResult,
          salesPerson: currentItem.salesPerson?._id || null,
          customerTitle: currentItem.customerTitle || null,
          customerPhone: currentItem.customerPhone || null,
          customerLineId: currentItem.customerLineId || null,
          customerEmail: currentItem.customerEmail || null,
          inquiryContent: currentItem.inquiryContent || null,
          inquiryPlace: currentItem.inquiryPlace || null,
          source: currentItem.source || null
        }

        const { data: updateResponse } = await api.patch(endpoint, updateData)

        if (updateResponse.success) {
          // 更新本地資料，保留所有欄位
          Object.assign(currentItem, {
            inquiryResult: simpleDialog.value.pendingResult,
            customerTitle: currentItem.customerTitle,
            customerPhone: currentItem.customerPhone,
            customerLineId: currentItem.customerLineId,
            customerEmail: currentItem.customerEmail,
            inquiryContent: currentItem.inquiryContent,
            inquiryPlace: currentItem.inquiryPlace,
            source: currentItem.source
          })
        }
      }

      // 更新表格中的項目
      const index = tableItems.value.findIndex(item => item._id === simpleDialog.value.id)
      if (index !== -1) {
        if (!tableItems.value[index].progressNotes) {
          tableItems.value[index].progressNotes = []
        }
        tableItems.value[index].progressNotes.unshift(response.data.result)
        tableItems.value[index].latestProgressNote = response.data.result
      }

      progressNoteInput.value = ''
      confirmNoteDialog.value = false

      // 如果是強制新增備註的情況，關閉對話框
      if (simpleDialog.value.requireNote) {
        closeSimpleDialog()
      }

      createSnackbar({
        text: '進度/備註已新增',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      await performSearch()
    }
  } catch (error) {
    console.error('新增進度/備註錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || '新增進度/備註時發生錯誤',
      snackbarProps: { color: 'red-lighten-1' }
    })

    // 如果發生錯誤且是強制新增備註的情況，恢復原始詢問結果
    if (simpleDialog.value.requireNote) {
      const currentItem = tableItems.value.find(item => item._id === simpleDialog.value.id)
      if (currentItem) {
        currentItem.inquiryResult = simpleDialog.value.originalResult
      }
    }
  } finally {
    isAddingNote.value = false
  }
}

const updateSalesPerson = async (id, salesPersonId) => {
  try {
    const currentItem = tableItems.value.find(item => item._id === id)

    if (currentItem.salesPerson?._id === salesPersonId) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    const companySalesPersons = companySalesPersonsMap.value.get(currentItem.company._id) || []
    const selectedSalesPerson = companySalesPersons.find(sp => sp._id === salesPersonId)

    if (!selectedSalesPerson) {
      createSnackbar({
        text: '無法選擇其他公司的業務',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 開啟確認對話框
    salesPersonAssignmentDialog.value = {
      open: true,
      itemId: id,
      salesPersonId: salesPersonId,
      salesPersonName: selectedSalesPerson.nickname || selectedSalesPerson.name,
      customerName: currentItem.customerName || '未命名客戶'
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 確認業務指派
const confirmSalesPersonAssignment = async () => {
  try {
    // 設置loading狀態
    salesPersonAssignmentDialog.value.isLoading = true

    const { itemId, salesPersonId } = salesPersonAssignmentDialog.value
    const currentItem = tableItems.value.find(item => item._id === itemId)

    if (!currentItem) {
      createSnackbar({
        text: '找不到該項目',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    updatingSalesPersons.value.add(itemId)

    const endpoint = `/customerInquiries/employee/${itemId}`

    const updateData = {
      salesPerson: salesPersonId,
      inquiryResult: currentItem.inquiryResult || null,
      customerTitle: currentItem.customerTitle || null,
      customerPhone: currentItem.customerPhone || null,
      customerLineId: currentItem.customerLineId || null,
      customerEmail: currentItem.customerEmail || null,
      sendEmailNotification: true // 添加email通知標記
    }

    const { data } = await api.patch(endpoint, updateData)
    if (data.success) {
      const companySalesPersons = companySalesPersonsMap.value.get(currentItem.company._id) || []
      const updatedSalesPerson = companySalesPersons.find(sp => sp._id === salesPersonId)
      Object.assign(currentItem, {
        salesPerson: updatedSalesPerson,
        customerTitle: currentItem.customerTitle,
        customerPhone: currentItem.customerPhone,
        customerLineId: currentItem.customerLineId,
        customerEmail: currentItem.customerEmail,
        inquiryResult: currentItem.inquiryResult
      })
      await performSearch()
      createSnackbar({
        text: '更新業務成功，已發送通知給被指派的業務',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingSalesPersons.value.delete(salesPersonAssignmentDialog.value.itemId)
    closeSalesPersonAssignmentDialog()
  }
}

// 關閉業務指派確認對話框
const closeSalesPersonAssignmentDialog = () => {
  salesPersonAssignmentDialog.value = {
    open: false,
    itemId: null,
    salesPersonId: null,
    salesPersonName: '',
    customerName: '',
    isLoading: false
  }
}

const getInquiryResultColor = (result) => {
  switch (result) {
    case '成交':
      return 'teal-lighten-1'
    case '不成交':
      return 'red-lighten-1'
    case '其他':
      return 'grey-darken-1'
    default:
      return 'grey-lighten-2'
  }
}

const updateInquiryResult = async (id, result) => {
  try {
    const currentItem = tableItems.value.find(item => item._id === id)
    const originalResult = currentItem.inquiryResult

    if (currentItem.inquiryResult === result) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    if (result === '不成交' || result === '其他') {
      // 不要立即更新狀態，而是等待備註新增完成
      simpleDialog.value = {
        open: true,
        id: id,
        originalResult: originalResult,
        pendingResult: result,
        requireNote: true
      }
      return
    }

    updatingInquiryResults.value.add(id)

    const endpoint = `/customerInquiries/employee/${id}`

    const updateData = {
      inquiryResult: result,
      salesPerson: currentItem.salesPerson?._id || null,
      customerTitle: currentItem.customerTitle || null
    }

    const { data } = await api.patch(endpoint, updateData)
    if (data.success) {
      Object.assign(currentItem, {
        inquiryResult: result,
        customerTitle: currentItem.customerTitle
      })
      await performSearch()
      createSnackbar({
        text: '更新詢問結果成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingInquiryResults.value.delete(id)
  }
}

// 添加更新稱謂的函數
const updateCustomerTitle = async (id, title) => {
  try {
    const currentItem = tableItems.value.find(item => item._id === id)

    if (currentItem.customerTitle === title) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    updatingCustomerTitles.value.add(id)

    const endpoint = `/customerInquiries/employee/${id}`

    const { data } = await api.patch(endpoint, {
      customerTitle: title,
      inquiryResult: currentItem.inquiryResult || '',
      salesPerson: currentItem.salesPerson?._id || null
    })

    if (data.success) {
      currentItem.customerTitle = title
      await performSearch()
      createSnackbar({
        text: '更新稱謂成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingCustomerTitles.value.delete(id)
  }
}

// 監聽表格資料變化，預先載入每個公司的業務列表
watch(() => tableItems.value, async (items) => {
  if (!items) return

  const companyIds = new Set(items.map(item => item.company._id))

  for (const companyId of companyIds) {
    if (!companySalesPersonsMap.value.has(companyId)) {
      await getCompanySalesPersons(companyId)
    }
  }
}, { immediate: true })

// 添加一個新的計算屬性來獲取業務的序號
const getSalesPersonIndex = (salesPerson) => {
  if (!salesPerson) return ''

  // 如果是業務主管，不顯示序號
  if (salesPerson.isB2CSupervisor) {
    return ''
  }

  // 找到該業務所屬的公司
  const companyId = salesPerson.company?._id || salesPerson.company

  if (!companyId) {
    // 如果找不到公司資訊，使用全局 order
    return typeof salesPerson.order === 'number' ? `${salesPerson.order + 1}.` : ''
}

  // 從公司業務列表中查找該業務的索引
  const companySalesPersons = companySalesPersonsMap.value.get(companyId) || []
  const index = companySalesPersons.findIndex(person => person._id === salesPerson._id)

  if (index !== -1) {
    return `${index + 1}.`
  }

  // 如果找不到，使用全局 order 作為備用
  return typeof salesPerson.order === 'number' ? `${salesPerson.order + 1}.` : ''
}

// 日期格式化函數
const formatDatePart = (dateString) => {
  if (!dateString) return ''
  try {
    const dateObj = new Date(dateString)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (e) {
    console.error('Error formatting date part:', e)
    return ''
  }
}

const formatTimePart = (dateString) => {
  if (!dateString) return ''
  try {
    const dateObj = new Date(dateString)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('Error formatting time part:', e)
    return ''
  }
}

const formatProgressNoteTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatInquiryContent = (content) => {
  if (!content) return ''
  return content.replace(
    /<a href="([^"]+)" target="_blank" class="url-button">↗<\/a>/g,
    (match, url) => {
      return `<a href="${url}" target="_blank" class="url-button">↗</a>`
    }
  )
}

// 添加稱謂顏色相關函數
const getCustomerTitleColor = (title) => {
  switch (title) {
    case '小姐':
      return 'pink-lighten-1'
    case '先生':
      return 'blue-darken-1'
    case '其他':
      return 'grey-darken-2'
    default:
      return 'grey'
  }
}

// 添加本月按鈕的函數
const setCurrentMonth = () => {
  if (isCurrentMonthActive.value) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    searchCriteria.value.dateRange = [startOfMonth, endOfMonth]
  } else {
    searchCriteria.value.dateRange = null
  }
  performSearch()
}

// 切換本月狀態的函數
const toggleCurrentMonth = () => {
  isCurrentMonthActive.value = !isCurrentMonthActive.value
  setCurrentMonth()
}

// 監聽日期範圍變化
watch(() => searchCriteria.value.dateRange, (newDateRange) => {
  if (newDateRange && isCurrentMonthActive.value) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const isStillCurrentMonth = newDateRange.length === 2 &&
      new Date(newDateRange[0]).getTime() === startOfMonth.getTime() &&
      new Date(newDateRange[1]).getTime() === endOfMonth.getTime()

    if (!isStillCurrentMonth) {
      isCurrentMonthActive.value = false
    }
  } else if (!newDateRange && isCurrentMonthActive.value) {
    isCurrentMonthActive.value = false
  }
})

// 監聽登入狀態變化
watch(() => currentEmployee.value, (newVal) => {
  if (newVal) {
    updateRemainingTime()
  } else {
    remainingTime.value = 0
  }
})

// 處理用戶活動，更新時間戳記
const handleUserActivity = () => {
  if (currentEmployee.value) {
    updateVerificationTimestamp()
  }
}

// 初始化
onMounted(async () => {
  try {
    tableLoading.value = true

    // 等待 EmployeeLogin 組件初始化完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 檢查 Employee 登入狀態
    const authData = localStorage.getItem('employeeAuth')
    if (authData) {
      try {
        const { token, employee, timestamp } = JSON.parse(authData)
        const now = new Date().getTime()
        const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

        if (now <= expiryTime) {
          // 檢查員工是否有B2C權限
          if (!employee.showInB2C && !employee.isB2CSupervisor) {
            // 沒有B2C權限，清除登入狀態並顯示錯誤訊息
            localStorage.removeItem('employeeAuth')
            currentEmployee.value = null
            createSnackbar({
              text: '此員工帳號未開放使用「 直客詢問統計表 」功能，如有疑問請聯絡管理者',
              snackbarProps: {
                color: 'red-lighten-1',
                timeout: -1 // 不自動關閉
              }
            })
            await Promise.all([
              loadSearchSalesPersons(),
              loadPlaceOptions()
            ])
            return
          }

          // 有權限，恢復登入狀態
          currentEmployee.value = employee
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // 載入資料
          await Promise.all([
            loadSearchSalesPersons(),
            loadPlaceOptions()
          ])

          // 執行搜尋
          await performSearch()

          // 啟動倒數計時器
          setupAutoLogoutTimer()
          updateRemainingTime()
          countdownTimer.value = setInterval(() => {
            updateRemainingTime()
          }, 1000)
        } else {
          // Token 已過期，清除資料
          localStorage.removeItem('employeeAuth')
          currentEmployee.value = null
          await Promise.all([
            loadSearchSalesPersons(),
            loadPlaceOptions()
          ])
        }
      } catch (error) {
        console.error('解析登入資料失敗:', error)
        localStorage.removeItem('employeeAuth')
        currentEmployee.value = null
        await Promise.all([
          loadSearchSalesPersons(),
          loadPlaceOptions()
        ])
      }
    } else {
      // 沒有登入資料，只載入基本資料
      currentEmployee.value = null
      await Promise.all([
        loadSearchSalesPersons(),
        loadPlaceOptions()
      ])
    }

    // 添加用戶活動監聽器
    document.addEventListener('click', handleUserActivity)
    document.addEventListener('keydown', handleUserActivity)
    document.addEventListener('scroll', handleUserActivity)
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
})

// 清理定時器
onUnmounted(() => {
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value)
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }

  // 移除事件監聽器
  document.removeEventListener('click', handleUserActivity)
  document.removeEventListener('keydown', handleUserActivity)
  document.removeEventListener('scroll', handleUserActivity)
})
</script>

<style lang="scss" scoped>
.white-space-pre-wrap {
  padding: 12px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 300px;
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

.url-button {
  display: inline-block;
  padding: 4px 8px;
  background-color: #1976d2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin: 0 4px;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }
}

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
  a {
    padding: 1px 4px;
    background: #5C6BC0;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: #ffffff;
    text-decoration: none;
    font-size: 11px;
    transition: background-color 0.2s;
    &:hover {
      background-color: #283593;
    }
  }
}

.text-label {
  white-space: nowrap;
}

.progress-notes-table {
  :deep(thead) {
    background-color: #185869 !important;
  }
  tbody tr {
    td {
      font-size: 13px !important;
    }

    &.odd-row {
      background-color: #f0f4f5;
    }

    &.even-row {
      background-color: #fbfcfc;
    }

    &:hover {
      background-color: #CFD8DC !important;
    }
  }
}

/* 對話框標題樣式 */
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.clock-container {
  border: 1px solid #E65100;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 16px;
}
</style>

<route lang="yaml">
  meta:
    layout: Ystravel
</route>




