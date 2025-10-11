<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5 px-0 px-md-2 px-xxl-4">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="px-lg-6 px-xl-4"
              >
                <v-card class="elevation-4 rounded-lg py-2 py-sm-7 px-0">
                  <div class="d-flex align-center px-6 px-sm-10 py-3">
                    <h3 class="me-4">
                      直客詢問統計表管理
                    </h3>
                    <v-spacer />
                    <v-btn
                      to="/B2CStatisticsSales"
                      variant="plain"
                      :ripple="false"
                      class="px-0"
                      color="blue-grey-darken-2"
                    >
                      業務頁面 >
                    </v-btn>
                  </div>
                  <v-divider class="mt-2 mt-sm-5 mb-2 mb-sm-6" />
                  <v-card-text class="pt-4 px-6 px-sm-10 pb-1 pb-sm-4">
                    <v-row class="mb-2">
                      <!-- 公司選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
                        <div class="d-flex align-center">
                          公司 :
                          <v-select
                            v-model="searchCriteria.company"
                            :items="availableCompanies"
                            :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                            item-value="_id"
                            variant="outlined"
                            density="compact"
                            placeholder="請選擇公司"
                            hide-details
                            clearable
                            class="ms-4"
                            @update:model-value="handleCompanyChange"
                          />
                        </div>
                      </v-col>

                      <!-- 來源選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
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
                          />
                        </div>
                      </v-col>

                      <!-- 業務選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
                        <div class="d-flex align-center">
                          <span class="text-label">業務 :</span>
                          <v-autocomplete
                            v-model="searchCriteria.salesPerson"
                            class="ms-4"
                            :items="searchSalesPersons"
                            :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode})` : ''"
                            item-value="_id"
                            variant="outlined"
                            density="compact"
                            :placeholder="!searchCriteria.company ? '請先選擇公司' : '請選擇業務'"
                            hide-details
                            clearable
                            :disabled="!searchCriteria.company"
                          />
                        </div>
                      </v-col>

                      <!-- 日期區間 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
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
                            @update:model-value="handleDateRangeChange"
                            @click:clear="handleDateRangeClear"
                          />
                        </div>
                      </v-col>

                      <!-- 地區 -->
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
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
                          />
                        </div>
                      </v-col>

                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
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
                          />
                        </div>
                      </v-col>
                      <v-col
                        v-if="smAndUp"
                      />
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                        lg="2"
                      >
                        <v-row class="d-flex justify-end">
                          <v-col
                            cols="9"
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
                          <v-col
                            cols="3"
                            class="ps-0"
                          >
                            <v-btn
                              color="grey"
                              block
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
                  <v-row
                    class="mt-1 bg-white px-4 px-sm-9"
                  >
                    <!-- 標題和功能按鈕區 -->
                    <v-col
                      cols="12"
                      class="px-4 pb-sm-4"
                    >
                      <v-row>
                        <!-- 小螢幕按鈕列 (lg以下顯示) -->
                        <v-col
                          v-if="!lgAndUp"
                          class="d-flex justify-space-between align-center"
                        >
                          <v-row>
                            <v-col
                              cols="6"
                              sm="4"
                              md="3"
                            >
                              <v-btn
                                prepend-icon="mdi-microsoft-excel"
                                color="teal-darken-2"
                                :size="buttonSize"
                                block
                                @click="openExportDialog"
                              >
                                匯出 EXCEL
                              </v-btn>
                            </v-col>
                            <v-col
                              cols="6"
                              sm="4"
                              md="3"
                            >
                              <v-btn
                                prepend-icon="mdi-account-cog"
                                variant="outlined"
                                color="blue-grey-darken-2"
                                :size="buttonSize"
                                block
                                @click="openEmployeeManageDialog"
                              >
                                業務管理
                              </v-btn>
                            </v-col>
                            <v-col
                              cols="6"
                              sm="4"
                              md="3"
                            >
                              <v-btn
                                prepend-icon="mdi-account-tie"
                                variant="outlined"
                                color="blue-grey-darken-2"
                                :size="buttonSize"
                                block
                                @click="openSupervisorManageDialog"
                              >
                                業務主管
                              </v-btn>
                            </v-col>
                            <v-col
                              cols="6"
                              sm="4"
                              md="3"
                            >
                              <v-btn
                                prepend-icon="mdi-plus"
                                variant="outlined"
                                color="blue-grey-darken-2"
                                :size="buttonSize"
                                block
                                @click="openDialog(null)"
                              >
                                新增詢問
                              </v-btn>
                            </v-col>
                            <v-col
                              cols="1"
                              class="d-flex align-center justify-center pe-0"
                            >
                              <v-btn
                                v-tooltip="isCurrentMonthActive ? '取消本月篩選' : '查看本月'"
                                icon
                                :color="isCurrentMonthActive ? 'orange-darken-2' : 'cyan-darken-2'"
                                variant="text"
                                size="34"
                                @click="toggleCurrentMonth"
                              >
                                <v-icon
                                  size="20"
                                  style="padding-top: 2px;"
                                >
                                  {{ isCurrentMonthActive ? 'mdi-calendar-remove' : 'mdi-calendar-month' }}
                                </v-icon>
                              </v-btn>
                            </v-col>
                            <v-col
                              cols="11"
                              sm="7"
                              md="11"
                              class="d-flex align-center"
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
                              />
                            </v-col>
                          </v-row>
                        </v-col>

                        <!-- 大螢幕兩欄佈局 (lg以上顯示) -->
                        <v-row
                          v-if="lgAndUp"
                          class="my-3 px-3"
                        >
                          <!-- 左側按鈕區 -->
                          <v-col
                            cols="9"
                            xxl="10"
                          >
                            <v-btn
                              prepend-icon="mdi-microsoft-excel"
                              color="teal-darken-2"
                              class="me-4"
                              @click="openExportDialog"
                            >
                              匯出 EXCEL
                            </v-btn>
                            <v-btn
                              prepend-icon="mdi-account-cog"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openEmployeeManageDialog"
                            >
                              業務管理
                            </v-btn>
                            <v-btn
                              prepend-icon="mdi-account-tie"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openSupervisorManageDialog"
                            >
                              業務主管
                            </v-btn>
                            <v-btn
                              prepend-icon="mdi-plus"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openDialog(null)"
                            >
                              新增詢問
                            </v-btn>
                            <v-btn
                              v-tooltip="isCurrentMonthActive ? '取消本月篩選' : '查看本月'"
                              icon
                              :color="isCurrentMonthActive ? 'orange-darken-2' : 'cyan-darken-2'"
                              variant="text"
                              size="34"
                              @click="toggleCurrentMonth"
                            >
                              <v-icon
                                size="20"
                                style="padding-top: 2px;"
                              >
                                {{ isCurrentMonthActive ? 'mdi-calendar-remove' : 'mdi-calendar-month' }}
                              </v-icon>
                            </v-btn>
                          </v-col>

                          <!-- 右側搜尋區 -->
                          <v-col
                            cols="3"
                            xxl="2"
                            class="d-flex align-center "
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
                            />
                          </v-col>
                        </v-row>
                      </v-row>
                    </v-col>

                    <!-- 表格區 -->
                    <v-col cols="12">
                      <v-data-table-server
                        v-model:items-per-page="tableItemsPerPage"
                        v-model:sort-by="tableSortBy"
                        :items-per-page-options="[10, 20, 50, 100]"
                        :items="tableItems"
                        :headers="tableHeaders"
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
                              {{ item.company?.name }}
                            </td>
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
                              <div
                                v-if="item.inquiryResult"
                                class="inquiry-result-text"
                                :class="getInquiryResultTextClass(item.inquiryResult)"
                              >
                                {{ item.inquiryResult }}
                              </div>
                              <div
                                v-else
                                class="inquiry-result-text text-grey-darken-1"
                              >
                                尚未選擇
                              </div>
                            </td>
                            <td>
                              <div class="d-flex align-center">
                                <div class="white-space-pre-wrap flex-grow-1">
                                  <template v-if="item.latestProgressNote?.content">
                                    {{ item.latestProgressNote.content }}
                                    <div
                                      v-if="item.latestProgressNote"
                                      class="text-caption text-grey-darken-1 "
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
                                      【 尚未新增紀錄 】
                                    </div>
                                  </template>
                                </div>
                                <v-btn
                                  v-tooltip:top="'查看紀錄'"
                                  icon
                                  color="grey-darken-2"
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
                            <td class="text-center">
                              <v-btn
                                icon
                                color="light-blue-darken-4"
                                variant="plain"
                                size="15"
                                class="mx-2"
                                :ripple="false"
                                @click="openDialog(item)"
                              >
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                color="red-lighten-1"
                                variant="plain"
                                size="15"
                                class="mx-2"
                                :ripple="false"
                                @click="confirmDelete(item)"
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
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

      <v-col
        cols="12"
        class="ps-lg-8 pe-lg-8 mb-6"
      />
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-pencil
          </v-icon>
          {{ dialog.id ? '編輯詢問資料' : '新增詢問' }}
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 mb-2 px-6">
          <!-- 加入載入中動畫 -->
          <div
            v-if="isDialogLoading"
            class="d-flex justify-center align-center"
            style="min-height: 458px;"
          >
            <v-progress-circular
              indeterminate
              color="deep-purple-darken-2"
              size="64"
              width="8"
            />
          </div>

          <!-- 表單內容 -->
          <v-form
            v-else
            @submit.prevent="submitInquiry"
          >
            <v-row>
              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
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
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-account-details
                    </v-icon> 客戶資料
                  </v-col>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 客戶姓名 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="customerName.value.value"
                  :error-messages="customerName.errorMessage.value"
                  label="*客戶姓名"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 客戶稱謂 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="customerTitle.value.value"
                  :error-messages="customerTitle.errorMessage.value"
                  :items="titleOptions"
                  label="稱謂"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 客戶電話 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="customerPhone.value.value"
                  :error-messages="customerPhone.errorMessage.value"
                  label="客戶電話"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 客戶 Line ID -->
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="customerLineId.value.value"
                  :error-messages="customerLineId.errorMessage.value"
                  label="Line ID"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 客戶 Email -->
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="customerEmail.value.value"
                  :error-messages="customerEmail.errorMessage.value"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
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
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-card-account-details-outline
                    </v-icon> 基本資料
                  </v-col>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 詢問日期 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-date-input
                  v-model="inquiryDate.value.value"
                  :error-messages="inquiryDate.errorMessage.value"
                  label="*日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                />
              </v-col>

              <!-- 來源 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="source.value.value"
                  :error-messages="source.errorMessage.value"
                  :items="sourceOptions"
                  label="*來源"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 地區 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-autocomplete
                  v-model="inquiryPlace.value.value"
                  :error-messages="inquiryPlace.errorMessage.value"
                  :items="placeOptions"
                  label="*地區"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 公司選擇 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="company.value.value"
                  :error-messages="company.errorMessage.value"
                  :items="companies"
                  :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                  item-value="_id"
                  label="*公司"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 業務 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-autocomplete
                  v-model="salesPerson.value.value"
                  :error-messages="salesPerson.errorMessage.value"
                  :items="dialogSalesPersons"
                  :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode})` : ''"
                  item-value="_id"
                  label="業務"
                  variant="outlined"
                  density="compact"
                  clearable
                  :disabled="!company.value.value"
                  :hide-details="!!company.value.value"
                  :messages="!company.value.value ? ['請先選擇公司'] : []"
                />
              </v-col>

              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
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
                    class="d-flex align-center justify-center"
                  >
                    <v-icon
                      size="18"
                      class="me-2"
                    >
                      mdi-text-box
                    </v-icon> 詢問相關
                  </v-col>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 詢問內容 -->
              <v-col cols="12">
                <v-textarea
                  v-model="inquiryContent.value.value"
                  :error-messages="inquiryContent.errorMessage.value"
                  label="詢問內容"
                  variant="outlined"
                  density="compact"
                  auto-grow
                  hide-details
                  rows="8"
                />
                <div class="d-flex align-end my-2">
                  <v-text-field
                    v-model="urlInput"
                    label="請輸入欲插入的網址"
                    variant="underlined"
                    density="compact"
                    class="me-2 mt-2"
                    hide-details
                    clearable
                    @keydown.enter.prevent
                  />
                  <v-btn
                    color="success"
                    variant="outlined"
                    size="small"
                    :disabled="!urlInput"
                    @click="confirmInsertUrl"
                  >
                    確認
                  </v-btn>
                </div>
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                class="me-1"
                :size="buttonSize"
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
              >
                {{ dialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

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
            <v-icon size="20">
              mdi-close
            </v-icon>
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
              color="deep-purple-darken-2"
              size="64"
              width="8"
            />
          </div>

          <!-- 進度/備註列表 -->
          <div v-else>
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

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog.open"
      title="確認刪除詢問"
      :message="`確定要刪除客戶「<span class='text-pink-lighten-1' style='font-weight: 800;'>${confirmDeleteDialog.customerName}</span>」的詢問記錄嗎？此操作無法復原。`"
      :expected-name="confirmDeleteDialog.customerName"
      input-label="客戶姓名"
      @confirm="deleteInquiry"
    />

    <!-- 業務管理對話框 -->
    <v-dialog
      v-model="employeeManageDialog.open"
      persistent
      max-width="1374"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-cog
          </v-icon>
          業務管理
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeEmployeeManageDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 mb-4 px-6">
          <div>
            <v-autocomplete
              v-model="tempSelectedEmployee"
              :items="filteredEmployees"
              :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode || ''}) - ${item.company?.name || ''}` : ''"
              item-value="_id"
              label="選擇業務"
              variant="outlined"
              density="compact"
              hide-details
              :loading="isLoadingEmployees"
              clearable
              @update:search="searchEmployees"
              @update:model-value="addSelectedEmployee"
            >
              <template #item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :disabled="selectedEmployees.includes(item.value)"
                >
                  <template #prepend>
                    <v-icon
                      v-if="selectedEmployees.includes(item.value)"
                      color="teal-lighten-1"
                      icon="mdi-check-circle"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </div>

          <!-- 已選擇的業務區塊 -->
          <div class="mt-4 mt-md-8 selected-employees-container">
            <div class="sub-title mb-5">
              已選擇的業務：
            </div>
            <!-- 按公司分組顯示業務 -->
            <div
              v-for="(employees, companyName) in groupedSelectedEmployees"
              :key="companyName"
              class="mb-6"
            >
              <div class="sub-title mb-4 text-blue-grey-darken-2">
                【 {{ companyName }} 】
              </div>
              <div class="d-flex flex-wrap ps-1">
                <v-card
                  v-for="(employee, index) in employees"
                  :key="employee._id"
                  class="mb-2 me-3 sales-person-card"
                  elevation="0"
                  width="252"
                >
                  <v-card-text class="pa-2">
                    <div class="d-flex justify-space-between align-center ps-2 pe-1 py-1">
                      <div>
                        <div class="text-subtitle-2 text-deep-purple-darken-2 d-flex align-center">
                          <div class="order-badge me-2">
                            {{ index + 1 }}
                          </div>
                          {{ employee.name }} ( <span
                            class="px-1"
                            :class="employee.nickname ? 'text-deep-purple-darken-2' : 'text-grey-darken-1'"
                          >{{ employee.nickname || '無' }}</span> )
                        </div>
                        <div
                          class="text-caption text-deep-purple-darken-2 mt-1 d-flex align-center"
                        >
                          <v-icon
                            icon="mdi-chat-processing-outline"
                            size="14"
                            class="me-1"
                          />
                          Line：
                          <span
                            v-if="employee.lineID"
                            class="line-id-text"
                            @click="copyLineId(employee.lineID)"
                          >
                            {{ employee.lineID }}
                          </span>
                          <span v-else>尚未填寫</span>
                          <v-btn
                            v-if="employee.lineLink"
                            v-tooltip="'複製 Line 連結'"
                            icon
                            variant="text"
                            color="teal-darken-1"
                            size="18"
                            class="ms-2"
                            :ripple="false"
                            @click="copyLineLink(employee.lineLink)"
                          >
                            <v-icon size="14">
                              mdi-content-copy
                            </v-icon>
                          </v-btn>
                        </div>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <div class="d-flex flex-column align-center me-2">
                          <v-btn
                            v-if="index > 0"
                            icon
                            variant="text"
                            color="grey-darken-1"
                            size="18"
                            :ripple="false"
                            @click="moveEmployee(companyName, index, 'up')"
                          >
                            <v-icon size="18">
                              mdi-chevron-up
                            </v-icon>
                          </v-btn>
                          <v-btn
                            v-if="index < employees.length - 1"
                            icon
                            variant="text"
                            color="grey-darken-1"
                            size="18"
                            :ripple="false"
                            @click="moveEmployee(companyName, index, 'down')"
                          >
                            <v-icon size="18">
                              mdi-chevron-down
                            </v-icon>
                          </v-btn>
                        </div>
                        <v-btn
                          icon
                          variant="text"
                          color="red-lighten-1"
                          size="20"
                          @click="removeSelectedEmployee(employee._id)"
                        >
                          <v-icon size="18">
                            mdi-close
                          </v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-7 mb-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="closeEmployeeManageDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-1"
            :size="buttonSize"
            :loading="isSavingEmployees"
            @click="saveEmployees"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 業務主管對話框 -->
    <v-dialog
      v-model="supervisorManageDialog.open"
      persistent
      max-width="1374"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-tie
          </v-icon>
          業務主管管理
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeSupervisorManageDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="mt-6 mb-4 px-6">
          <div>
            <v-autocomplete
              v-model="tempSelectedSupervisor"
              :items="filteredSupervisors"
              :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode || ''}) - ${item.company?.name || ''}` : ''"
              item-value="_id"
              label="選擇業務主管"
              variant="outlined"
              density="compact"
              hide-details
              :loading="isLoadingSupervisors"
              clearable
              @update:search="searchSupervisors"
              @update:model-value="addSelectedSupervisor"
            >
              <template #item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :disabled="selectedSupervisors.includes(item.value)"
                >
                  <template #prepend>
                    <v-icon
                      v-if="selectedSupervisors.includes(item.value)"
                      color="teal-lighten-1"
                      icon="mdi-check-circle"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </div>

          <!-- 已選擇的業務主管區塊 -->
          <div class="mt-8 selected-employees-container">
            <div class="sub-title mb-5 ps-1">
              已選擇的業務主管：
            </div>
            <!-- 按公司分組顯示業務主管 -->
            <div
              v-for="(supervisors, companyName) in groupedSelectedSupervisors"
              :key="companyName"
              class="mb-6"
            >
              <div class="sub-title mb-4 text-blue-grey-darken-2">
                【 {{ companyName }} 】
              </div>
              <div class="d-flex flex-wrap ps-1">
                <v-card
                  v-for="supervisor in supervisors"
                  :key="supervisor._id"
                  class="mb-2 me-3 sales-person-card"
                  elevation="0"
                  width="252"
                >
                  <v-card-text class="pa-2">
                    <div class="d-flex justify-space-between align-center ps-2 pe-1 py-1">
                      <div>
                        <div class="text-subtitle-2 text-deep-purple-darken-2 d-flex align-center">
                          <v-icon
                            icon="mdi-account-tie"
                            size="16"
                            class="me-2"
                            color="deep-purple-darken-2"
                          />
                          {{ supervisor.name }} ( <span class="text-grey-darken-2">{{ supervisor.employeeCode }}</span> )
                        </div>
                      </div>
                      <v-btn
                        icon
                        size="small"
                        color="red-lighten-1"
                        variant="text"
                        @click="removeSelectedSupervisor(supervisor._id)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-7 mb-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="closeSupervisorManageDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-1"
            :size="buttonSize"
            :loading="isUpdatingSupervisors"
            @click="updateSupervisors"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯出對話框 -->
    <v-dialog
      v-model="exportDialog.open"
      persistent
      max-width="340"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-teal-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-microsoft-excel
            </v-icon>匯出 Excel
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="closeExportDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-3">
          <v-form @submit.prevent="handleExportExcel">
            <v-row>
              <!-- 匯出類型 -->
              <v-col
                cols="12"
                class="pb-0 px-1"
              >
                <v-radio-group
                  v-model="exportDialog.type"
                  hide-details
                  class="mb-3"
                >
                  <v-radio
                    label="所有公司資料"
                    value="all"
                    color="teal-darken-1"
                  />
                  <v-radio
                    label="單一公司資料"
                    value="company"
                    color="teal-darken-1"
                  />
                </v-radio-group>
              </v-col>

              <!-- 公司選擇 -->
              <v-col
                v-if="exportDialog.type === 'company'"
                cols="12"
                class="px-3 pb-0"
              >
                <v-select
                  v-model="exportDialog.company"
                  :items="companies"
                  :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                  item-value="_id"
                  label="公司"
                  variant="outlined"
                  density="compact"
                  :error-messages="exportDialog.companyError"
                  clearable
                />
              </v-col>

              <!-- 日期區間 -->
              <v-col
                cols="12"
                class="px-3 pb-0"
              >
                <v-date-input
                  v-model="exportDialog.dateRange"
                  label="日期區間"
                  variant="outlined"
                  density="compact"
                  prepend-icon
                  :error-messages="exportDialog.dateError"
                  clearable
                  multiple="range"
                  :cancel-text="'取消'"
                  :ok-text="'確認'"
                  @update:model-value="(val) => { exportDialog.dateError = ''; exportDialog.dateRange = val; }"
                />
              </v-col>

              <!-- 來源選擇 -->
              <v-col
                cols="12"
                class="px-3 pb-0"
              >
                <v-select
                  v-model="exportDialog.sources"
                  :items="sourceOptions"
                  item-title="text"
                  item-value="value"
                  label="來源"
                  variant="outlined"
                  density="compact"
                  :error-messages="exportDialog.sourceError"
                  clearable
                  multiple
                >
                  <template #prepend-item>
                    <v-list-item
                      title="全選"
                      color="deep-purple-darken-2"
                      prepend-icon="mdi-checkbox-multiple-marked"
                      :active="exportDialog.sources.length === sourceOptions.length"
                      @click="selectAllSources"
                    />
                    <v-divider class="mt-2" />
                  </template>
                  <template #selection="{ item, index }">
                    <span v-if="index === 0">{{ item.raw.text }}</span>
                    <span v-else-if="index === 1">...</span>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-card-actions class="px-0 pt-4 pb-0 pb-sm-2 mb-2">
              <v-spacer />
              <v-btn
                color="grey"
                variant="outlined"
                class="me-1"
                :size="buttonSize"
                @click="closeExportDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :size="buttonSize"
                :loading="isExporting"
              >
                匯出
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
// import { useUserStore } from '@/stores/user'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

// 頁面定義
definePage({
  meta: {
    title: '直客詢問統計表管理 | Ystravel',
    login: true,
    permission: 'B2C_STATISTICS_MANAGEMENT_READ'
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { mdAndUp, smAndUp, lgAndUp } = useDisplay()

// 響應式變數
const dialogWidth = computed(() => mdAndUp.value ? '880' : '100%')
const isSearching = ref(false)
const isCurrentMonthActive = ref(false)
const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

// 表格相關
const tableHeaders = [
  { title: '公司', key: 'company.name', minWidth: '100px', align: 'start', sortable: true },
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
  { title: '詢問結果', key: 'inquiryResult', minWidth: '110px', align: 'start', sortable: true },
  { title: '最新進度 / 備註', key: 'latestProgressNote.content', width: '220px', align: 'start', sortable: true },
  { title: '操作', key: 'actions', minWidth: '100px', align: 'center', sortable: false }
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
const companies = ref([])
const availableCompanies = ref([])
const searchCriteria = ref({
  company: null,
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

// 確認刪除對話框
const confirmDeleteDialog = ref({
  open: false,
  id: '',
  customerName: ''
})

// 對話框相關響應式變數
const dialog = ref({
  open: false,
  id: null,
  originalResult: null,
  currentItemId: null,
  submitted: false
})

const isDialogLoading = ref(false)

// 簡化版對話框
const simpleDialog = ref({
  open: false,
  id: null
})

// 進度備註相關
const progressNotesHeaders = [
  { title: '進度/備註內容', key: 'content', align: 'start' },
  { title: '建立時間', key: 'createdAt', width: '170px', align: 'start' }
]

// 業務管理對話框
const employeeManageDialog = ref({
  open: false
})

const selectedEmployees = ref([])
const selectedEmployeeDetails = ref([])
const allEmployees = ref([])
const isLoadingEmployees = ref(false)
const isSavingEmployees = ref(false)
const tempSelectedEmployee = ref(null)

// 業務主管對話框
const supervisorManageDialog = ref({
  open: false
})

const selectedSupervisors = ref([])
const selectedSupervisorDetails = ref([])
const allSupervisors = ref([])
const isLoadingSupervisors = ref(false)
const isUpdatingSupervisors = ref(false)
const tempSelectedSupervisor = ref(null)

// 匯出對話框
const exportDialog = ref({
  open: false,
  type: 'all',
  company: null,
  dateRange: null,
  sources: [],
  companyError: '',
  dateError: '',
  sourceError: ''
})

const isExporting = ref(false)

// 更新狀態管理
const updatingSalesPersons = ref(new Set())
const updatingCustomerTitles = ref(new Set())

// 業務指派確認對話框
const salesPersonAssignmentDialog = ref({
  open: false,
  itemId: null,
  salesPersonId: null,
  salesPersonName: '',
  customerName: '',
  isEditMode: undefined,
  processedValues: null,
  isLoading: false
})

// 業務相關
const companySalesPersonsMap = ref(new Map())
const searchSalesPersons = ref([])
const dialogSalesPersons = ref([])

// URL插入
const urlInput = ref('')

// 表單驗證架構
const inquirySchema = yup.object({
  inquiryDate: yup
    .date()
    .required('請選擇日期'),
  source: yup
    .string()
    .required('請選擇來源'),
  inquiryPlace: yup
    .string()
    .required('請選擇地區'),
  company: yup
    .string()
    .required('請選擇公司'),
  salesPerson: yup
    .string()
    .nullable()
    .transform((value) => value || null),
  customerName: yup
    .string()
    .required('請輸入客戶姓名')
    .trim(),
  customerTitle: yup
    .string()
    .nullable(),
  customerPhone: yup
    .string()
    .nullable(),
  customerLineId: yup
    .string()
    .nullable(),
  customerEmail: yup
    .string()
    .nullable()
    .email('請輸入正確的 Email 格式'),
  inquiryContent: yup
    .string()
    .nullable()
})

// 初始化表單
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: inquirySchema,
  initialValues: {
    inquiryDate: new Date(),
    source: '',
    inquiryPlace: '',
    company: '',
    salesPerson: '',
    customerName: '',
    customerTitle: null,
    customerPhone: '',
    customerLineId: '',
    customerEmail: '',
    inquiryContent: ''
  }
})

// 定義表單欄位
const inquiryDate = useField('inquiryDate')
const source = useField('source')
const inquiryPlace = useField('inquiryPlace')
const company = useField('company')
const salesPerson = useField('salesPerson')
const customerName = useField('customerName')
const customerTitle = useField('customerTitle')
const customerPhone = useField('customerPhone')
const customerLineId = useField('customerLineId')
const customerEmail = useField('customerEmail')
const inquiryContent = useField('inquiryContent')

// 計算屬性
const filteredEmployees = computed(() => {
  return allEmployees.value.map(employee => ({
    ...employee,
    disabled: selectedEmployees.value.includes(employee._id)
  }))
})

const filteredSupervisors = computed(() => {
  return allSupervisors.value.map(supervisor => ({
    ...supervisor,
    disabled: selectedSupervisors.value.includes(supervisor._id)
  }))
})

const groupedSelectedEmployees = computed(() => {
  const grouped = {}
  selectedEmployeeDetails.value.forEach(employee => {
    const companyName = employee.company?.name || '未分類'
    if (!grouped[companyName]) {
      grouped[companyName] = []
    }
    grouped[companyName].push({
      ...employee,
      order: typeof employee.order === 'number' ? employee.order : 9999
    })
  })

  Object.values(grouped).forEach(employees => {
    employees.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 9999
      const orderB = typeof b.order === 'number' ? b.order : 9999
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return a.name.localeCompare(b.name)
    })
  })

  return Object.fromEntries(
    Object.entries(grouped)
      .sort(([, employeesA], [, employeesB]) => {
        const companyIdA = employeesA[0]?.company?.companyId || 'ZZZZ'
        const companyIdB = employeesB[0]?.company?.companyId || 'ZZZZ'
        return companyIdA.localeCompare(companyIdB)
      })
  )
})

const groupedSelectedSupervisors = computed(() => {
  const grouped = {}
  selectedSupervisorDetails.value.forEach(supervisor => {
    const companyName = supervisor.company?.name || '未分類'
    if (!grouped[companyName]) {
      grouped[companyName] = []
    }
    grouped[companyName].push(supervisor)
  })

  return Object.fromEntries(
    Object.entries(grouped)
      .sort(([, supervisorsA], [, supervisorsB]) => {
        const companyIdA = supervisorsA[0]?.company?.companyId || 'ZZZZ'
        const companyIdB = supervisorsB[0]?.company?.companyId || 'ZZZZ'
        return companyIdA.localeCompare(companyIdB)
      })
  )
})

const getCurrentItemProgressNotes = computed(() => {
  const item = tableItems.value.find(i => i._id === simpleDialog.value.id)
  return item?.progressNotes || []
})

// 載入地區選項
const loadPlaceOptions = async () => {
  try {
    const { data } = await apiAuth.get('/lineCategories/all-second-level')
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

// 載入公司列表
const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = data.result.data.sort((a, b) => {
        return a.companyId.localeCompare(b.companyId)
      })
      availableCompanies.value = [...companies.value]
    }
  } catch (error) {
    console.error('載入公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 載入業務列表
const loadSearchSalesPersons = async () => {
  try {
    const params = {
      showInB2C: true
    }

    if (searchCriteria.value.company) {
      params.company = searchCriteria.value.company
    }

    const { data } = await apiAuth.get('/employees/suggestions', { params })
    if (data.success) {
      searchSalesPersons.value = data.result
    }
  } catch (error) {
    console.error('載入業務列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入業務列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 處理日期區間變更
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 處理日期清空
const handleDateRangeClear = () => {
  searchCriteria.value.dateRange = null
  // 如果當前月份按鈕是啟用狀態，也要關閉它
  if (isCurrentMonthActive.value) {
    isCurrentMonthActive.value = false
  }
}

// 處理公司變更
const handleCompanyChange = async () => {
  if (!searchCriteria.value.company) return
  await loadSearchSalesPersons()
}

// 執行搜尋
const performSearch = async () => {
  try {
    tableLoading.value = true
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

    if (searchCriteria.value.company) {
      params.company = searchCriteria.value.company
    }

    if (Array.isArray(searchCriteria.value.dateRange) && searchCriteria.value.dateRange.length > 0) {
      const startDate = new Date(searchCriteria.value.dateRange[0])
      const endDate = new Date(searchCriteria.value.dateRange[searchCriteria.value.dateRange.length - 1])
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/customerInquiries/all', { params })
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
    isSearching.value = false
  }
}

// 重置搜尋
const resetSearch = () => {
  searchCriteria.value = {
    company: null,
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

// 處理表格選項變更
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

// 本月按鈕功能
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

const toggleCurrentMonth = () => {
  isCurrentMonthActive.value = !isCurrentMonthActive.value
  setCurrentMonth()
}

// 刪除相關函數
const confirmDelete = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    id: item._id,
    customerName: item.customerName || '未提供姓名'
  }
}

const deleteInquiry = async () => {
  try {
    await apiAuth.delete(`/customerInquiries/${confirmDeleteDialog.value.id}`)
    await performSearch()
    confirmDeleteDialog.value.open = false
    createSnackbar({
      text: '刪除詢問記錄成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 開啟對話框
const openDialog = async (item) => {
  dialog.value.open = true
  dialog.value.id = item?._id || null
  isDialogLoading.value = true

  try {
    if (item) {
      // 編輯模式
      inquiryDate.value.value = item.inquiryDate ? new Date(item.inquiryDate) : null
      source.value.value = item.source || ''
      inquiryPlace.value.value = item.inquiryPlace || ''
      company.value.value = item.company?._id || ''

      // 先載入該公司的業務列表
      if (item.company?._id) {
        const { data } = await apiAuth.get('/employees/suggestions', {
          params: {
            showInB2C: true,
            employmentStatus: '在職',
            company: item.company._id
          }
        })
        if (data.success) {
          dialogSalesPersons.value = data.result
        }
      }

      // 再設定業務值
      salesPerson.value.value = item.salesPerson?._id || ''
      customerName.value.value = item.customerName || ''
      customerTitle.value.value = item.customerTitle || null
      customerPhone.value.value = item.customerPhone || ''
      customerLineId.value.value = item.customerLineId || ''
      customerEmail.value.value = item.customerEmail || ''
      inquiryContent.value.value = item.inquiryContent || ''
    } else {
      // 新增模式
      resetForm()
    }
  } catch (error) {
    console.error('載入詢問資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入詢問資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeDialog()
  } finally {
    isDialogLoading.value = false
  }
}

// 關閉對話框
const closeDialog = () => {
  if (dialog.value.currentItemId && !dialog.value.submitted) {
    const currentItem = tableItems.value.find(item => item._id === dialog.value.currentItemId)
    if (currentItem) {
      currentItem.inquiryResult = dialog.value.originalResult
    }
  }
  dialog.value.open = false
  dialog.value.id = null
  dialog.value.originalResult = null
  dialog.value.currentItemId = null
  dialog.value.submitted = false
  isDialogLoading.value = false
  resetForm()
}

// 簡化版對話框
const openSimpleDialog = async (item) => {
  if (!item?._id) {
    console.error('無效的項目ID')
    return
  }

  simpleDialog.value = {
    open: true,
    id: item._id
  }
}

const closeSimpleDialog = () => {
  simpleDialog.value = {
    open: false,
    id: null
  }
  isDialogLoading.value = false
}

// 提交表單
const submitInquiry = handleSubmit(async (values) => {
  try {
    const originalItem = dialog.value.id ? tableItems.value.find(item => item._id === dialog.value.id) : null

    let processedInquiryDate = null
    if (values.inquiryDate) {
      if (originalItem && originalItem.inquiryDate) {
        const originalDate = new Date(originalItem.inquiryDate)
        const newDate = new Date(values.inquiryDate)

        if (
          originalDate.getFullYear() === newDate.getFullYear() &&
          originalDate.getMonth() === newDate.getMonth() &&
          originalDate.getDate() === newDate.getDate()
        ) {
          processedInquiryDate = originalItem.inquiryDate
        } else {
          processedInquiryDate = new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            originalDate.getHours(),
            originalDate.getMinutes(),
            originalDate.getSeconds(),
            originalDate.getMilliseconds()
          ).toISOString()
        }
      } else {
        const selectedDate = new Date(values.inquiryDate)
        const now = new Date()
        processedInquiryDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        ).toISOString()
      }
    }

    const processedValues = {
      ...values,
      salesPerson: values.salesPerson || null,
      inquiryDate: processedInquiryDate
    }

    if (dialog.value.id) {
      // 編輯模式 - 檢查資料是否有變更
      // 標準化比較用的日期格式
      const normalizeDate = (date) => {
        if (!date) return null
        return new Date(date).toISOString()
      }

      // 檢查資料是否有變更
      const processedData = {
        company: processedValues.company,
        salesPerson: processedValues.salesPerson || null,
        inquiryDate: normalizeDate(processedValues.inquiryDate),
        source: processedValues.source || '',
        inquiryPlace: processedValues.inquiryPlace || '',
        inquiryContent: processedValues.inquiryContent || '',
        customerName: processedValues.customerName || '',
        customerTitle: processedValues.customerTitle || '',
        customerPhone: processedValues.customerPhone || '',
        customerLineId: processedValues.customerLineId || '',
        customerEmail: processedValues.customerEmail || ''
      }

      const originalData = {
        company: originalItem.company._id.toString(),
        salesPerson: originalItem.salesPerson?._id?.toString() || null,
        inquiryDate: normalizeDate(originalItem.inquiryDate),
        source: originalItem.source || '',
        inquiryPlace: originalItem.inquiryPlace || '',
        inquiryContent: originalItem.inquiryContent || '',
        customerName: originalItem.customerName || '',
        customerTitle: originalItem.customerTitle || '',
        customerPhone: originalItem.customerPhone || '',
        customerLineId: originalItem.customerLineId || '',
        customerEmail: originalItem.customerEmail || ''
      }

      const hasChanges = JSON.stringify(processedData) !== JSON.stringify(originalData)

      if (!hasChanges) {
        createSnackbar({
          text: '資料未做任何變更',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }

      // 檢查是否需要確認業務指派
      const originalSalesPersonId = originalItem.salesPerson?._id?.toString()
      const newSalesPersonId = processedValues.salesPerson || null

      if (originalSalesPersonId !== newSalesPersonId && newSalesPersonId) {
        // 有業務變更，需要確認
        const selectedSalesPerson = dialogSalesPersons.value.find(sp => sp._id === newSalesPersonId)
        if (selectedSalesPerson) {
          // 開啟確認對話框
          salesPersonAssignmentDialog.value = {
            open: true,
            itemId: dialog.value.id,
            salesPersonId: newSalesPersonId,
            salesPersonName: selectedSalesPerson.nickname || selectedSalesPerson.name,
            customerName: processedValues.customerName || '未命名客戶',
            isEditMode: true,
            processedValues: processedValues
          }
          return
        }
      }

      // 沒有業務變更或不需要確認，直接提交
      await submitInquiryData(dialog.value.id, processedValues, true)
    } else {
      // 新增模式
      if (processedValues.salesPerson) {
        // 有選擇業務，需要確認
        const selectedSalesPerson = dialogSalesPersons.value.find(sp => sp._id === processedValues.salesPerson)
        if (selectedSalesPerson) {
          // 開啟確認對話框
          salesPersonAssignmentDialog.value = {
            open: true,
            itemId: null,
            salesPersonId: processedValues.salesPerson,
            salesPersonName: selectedSalesPerson.nickname || selectedSalesPerson.name,
            customerName: processedValues.customerName || '未命名客戶',
            isEditMode: false,
            processedValues: processedValues
          }
          return
        }
      }

      // 沒有選擇業務，直接提交
      await submitInquiryData(null, processedValues, false)
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// 實際提交資料的函數
const submitInquiryData = async (id, processedValues, isEdit) => {
  try {
    if (isEdit) {
      // 編輯模式
      const { data } = await apiAuth.patch(
        `/customerInquiries/${id}`,
        {
          ...processedValues,
          sendEmailNotification: salesPersonAssignmentDialog.value.salesPersonId ? true : false
        }
      )

      if (data.success) {
        dialog.value.submitted = true
        const updatedItem = tableItems.value.find(item => item._id === id)
        if (updatedItem) {
          Object.assign(updatedItem, {
            ...updatedItem,
            ...processedValues
          })
        }
        await performSearch()
        closeDialog()
        createSnackbar({
          text: salesPersonAssignmentDialog.value.salesPersonId
            ? '詢問資料更新成功，已發送通知給被指派的業務'
            : '詢問資料更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增模式
      const { data } = await apiAuth.post('/customerInquiries', {
        ...processedValues,
        sendEmailNotification: salesPersonAssignmentDialog.value.salesPersonId ? true : false
      })
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: salesPersonAssignmentDialog.value.salesPersonId
            ? '新增詢問成功，已發送通知給被指派的業務'
            : '新增詢問成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    // 重置loading狀態
    salesPersonAssignmentDialog.value.isLoading = false
  }
}

// URL插入功能
const confirmInsertUrl = () => {
  if (!urlInput.value) return

  const textarea = document.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = inquiryContent.value.value
  const before = text.substring(0, start)
  const after = text.substring(end)

  const buttonHtml = ` <a href="${urlInput.value}" target="_blank" class="url-button">連結</a>`
  inquiryContent.value.value = before + buttonHtml + after

  urlInput.value = ''
}

// 格式化詢問內容
const formatInquiryContent = (content) => {
  if (!content) return ''
  return content.replace(
    /<a href="([^"]+)" target="_blank" class="url-button">↗<\/a>/g,
    (match, url) => {
      return `<a href="${url}" target="_blank" class="url-button">↗</a>`
    }
  )
}

// 更新業務
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

    const { itemId, salesPersonId, isEditMode, processedValues } = salesPersonAssignmentDialog.value

    if (isEditMode !== undefined) {
      // 來自新增/編輯對話框
      await submitInquiryData(itemId, processedValues, isEditMode)
    } else {
      // 來自v-data-table的業務指派
      const currentItem = tableItems.value.find(item => item._id === itemId)

      if (!currentItem) {
        createSnackbar({
          text: '找不到該項目',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }

      updatingSalesPersons.value.add(itemId)

      const updateData = {
        salesPerson: salesPersonId,
        inquiryResult: currentItem.inquiryResult || null,
        customerTitle: currentItem.customerTitle || null,
        customerPhone: currentItem.customerPhone || null,
        customerLineId: currentItem.customerLineId || null,
        customerEmail: currentItem.customerEmail || null,
        sendEmailNotification: true // 添加email通知標記
      }

      const { data } = await apiAuth.patch(`/customerInquiries/${itemId}`, updateData)
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
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    if (salesPersonAssignmentDialog.value.itemId) {
      updatingSalesPersons.value.delete(salesPersonAssignmentDialog.value.itemId)
    }
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
    isEditMode: undefined,
    processedValues: null,
    isLoading: false
  }
}

// 更新稱謂
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

    const { data } = await apiAuth.patch(`/customerInquiries/${id}`, {
      customerTitle: title,
      progressAndNote: currentItem.progressAndNote || '',
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

// 業務管理相關函數
const openEmployeeManageDialog = async () => {
  employeeManageDialog.value.open = true
  isLoadingEmployees.value = true
  tempSelectedEmployee.value = null
  // 清除 localStorage 中的排序資料，讓它與資料庫重新同步
  localStorage.removeItem('b2c_employee_order')
  console.log('已清除 localStorage 中的排序資料')

  try {
    // 載入所有在職員工
    await searchEmployees('')

    // 載入已選擇的業務
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        employmentStatus: '在職'
      }
    })
    if (data.success) {
      // 從 localStorage 獲取之前保存的排序
      let savedOrder = {}
      try {
        const savedOrderStr = localStorage.getItem('b2c_employee_order')
        if (savedOrderStr) {
          savedOrder = JSON.parse(savedOrderStr)
          console.log('從 localStorage 讀取的排序:', savedOrder)
        }
      } catch (e) {
        console.error('讀取排序失敗:', e)
      }

      // 清空和重設資料
      selectedEmployees.value = []
      selectedEmployeeDetails.value = []

      // 按公司分組
      const groupedByCompany = {}

      // 處理每個員工資料，並設定初始 order
      for (const emp of data.result) {
        const companyName = emp.company?.name || '未分類'
        if (!groupedByCompany[companyName]) {
          groupedByCompany[companyName] = []
        }

        // 獲取儲存的 order 或用當前索引作為預設值
        const savedEmployeeOrder = savedOrder[emp._id]

        // 添加到分組
        groupedByCompany[companyName].push({
          ...emp,
          nickname: emp.nickname || '',
          lineID: emp.lineID || '',
          order: savedEmployeeOrder !== undefined ? savedEmployeeOrder : groupedByCompany[companyName].length
        })
      }

      console.log('分組後的資料（排序前）:')
      for (const [companyName, employees] of Object.entries(groupedByCompany)) {
        console.log(`${companyName}:`, employees.map(e => `${e.name}(order=${e.order})`))
      }

      // 對每個公司內的業務排序
      for (const employees of Object.values(groupedByCompany)) {
        employees.sort((a, b) => {
          // 按 order 排序
          return a.order - b.order
        })
      }

      console.log('排序後的資料:')
      for (const [companyName, employees] of Object.entries(groupedByCompany)) {
        console.log(`${companyName}:`, employees.map(e => `${e.name}(order=${e.order})`))
      }

      // 先設定已選擇的業務 ID
      for (const companyEmployees of Object.values(groupedByCompany)) {
        for (const emp of companyEmployees) {
          selectedEmployees.value.push(emp._id)
        }
      }

      // 再設定詳細資料
      for (const companyEmployees of Object.values(groupedByCompany)) {
        for (const emp of companyEmployees) {
          selectedEmployeeDetails.value.push(emp)
        }
      }
    }
  } catch (error) {
    console.error('載入員工資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入員工資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoadingEmployees.value = false
  }
}

const closeEmployeeManageDialog = () => {
  employeeManageDialog.value.open = false
  selectedEmployees.value = []
  allEmployees.value = []
  tempSelectedEmployee.value = null
}

const searchEmployees = async (search) => {
  isLoadingEmployees.value = true
  try {
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        quickSearch: search || '',
        employmentStatus: '在職'
      }
    })
    if (data.success) {
      allEmployees.value = data.result.map(emp => ({
        ...emp,
        nickname: emp.nickname || '',
        employeeCode: emp.employeeCode || '',
        company: emp.company || { name: '未分類' }
      }))
    }
  } catch (error) {
    console.error('載入員工列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入員工列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoadingEmployees.value = false
  }
}

const addSelectedEmployee = async (employeeId) => {
  if (employeeId && !selectedEmployees.value.includes(employeeId)) {
    // 獲取完整的員工資料，包括公司資訊
    const employee = allEmployees.value.find(emp => emp._id === employeeId)
    if (employee) {
      // 找出同公司的員工數量，設定為下一個順序號
      const sameCompanyEmployees = selectedEmployeeDetails.value.filter(
        emp => (emp.company?.name || '未分類') === (employee.company?.name || '未分類')
      )
      const nextOrder = sameCompanyEmployees.length // 從0開始的連續順序

      selectedEmployees.value.push(employeeId)
      selectedEmployeeDetails.value.push({
        ...employee,
        nickname: employee.nickname || '',
        lineID: employee.lineID || '',
        order: nextOrder
      })
    }
  }
  // 清空臨時選擇的員工，以便下次選擇
  tempSelectedEmployee.value = null
}

const removeSelectedEmployee = (employeeId) => {
  // 先找到要移除的員工資訊
  const employeeToRemove = selectedEmployeeDetails.value.find(emp => emp._id === employeeId)
  if (!employeeToRemove) return

  const companyName = employeeToRemove.company?.name || '未分類'

  // 移除員工
  selectedEmployees.value = selectedEmployees.value.filter(id => id !== employeeId)
  selectedEmployeeDetails.value = selectedEmployeeDetails.value.filter(emp => emp._id !== employeeId)

  // 重新調整同公司剩餘員工的順序，確保順序連續
  const sameCompanyEmployees = selectedEmployeeDetails.value.filter(
    emp => (emp.company?.name || '未分類') === companyName
  )

  // 按原有順序排序後重新分配連續的順序號
  sameCompanyEmployees.sort((a, b) => a.order - b.order)
  sameCompanyEmployees.forEach((emp, index) => {
    const globalIndex = selectedEmployeeDetails.value.findIndex(e => e._id === emp._id)
    if (globalIndex !== -1) {
      selectedEmployeeDetails.value[globalIndex].order = index
    }
  })
}

const moveEmployee = (companyName, index, direction) => {
  console.log(`移動員工: ${companyName} 第 ${index} 位 ${direction === 'up' ? '向上' : '向下'}`)

  // 從原始數據源中找出同公司的員工並按 order 排序
  const companyEmployees = selectedEmployeeDetails.value
    .filter(emp => (emp.company?.name || '未分類') === companyName)
    .sort((a, b) => a.order - b.order)

  console.log('同公司員工排序前:')
  companyEmployees.forEach((emp, i) => {
    console.log(`${i}: ${emp.name} - order=${emp.order}`)
  })

  // 確保索引有效
  if (index < 0 || index >= companyEmployees.length) {
    console.log('索引無效')
    return
  }

  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= companyEmployees.length) {
    console.log('新索引無效')
    return
  }

  // 交換兩個員工在數組中的位置
  const employee1 = companyEmployees[index]
  const employee2 = companyEmployees[newIndex]

  console.log(`要交換的員工: ${employee1.name} 和 ${employee2.name}`)

  // 在整個數組中找到這兩個員工的索引
  const allEmployees = [...selectedEmployeeDetails.value]
  const index1 = allEmployees.findIndex(e => e._id === employee1._id)
  const index2 = allEmployees.findIndex(e => e._id === employee2._id)

  if (index1 !== -1 && index2 !== -1) {
    // 交換位置
    [companyEmployees[index], companyEmployees[newIndex]] = [companyEmployees[newIndex], companyEmployees[index]]

    // 重新設置該公司所有員工的連續順序號
    companyEmployees.forEach((emp, idx) => {
      const globalIndex = allEmployees.findIndex(e => e._id === emp._id)
      if (globalIndex !== -1) {
        allEmployees[globalIndex].order = idx
      }
    })

    console.log('移動並重新排序後:')
    companyEmployees.forEach((emp, idx) => {
      console.log(`${idx}: ${emp.name} - order=${emp.order}`)
    })

    // 更新整個數組
    selectedEmployeeDetails.value = [...allEmployees]
  } else {
    console.log('找不到員工索引')
  }
}

const saveEmployees = async () => {
  isSavingEmployees.value = true
  try {
    // 先取得所有原本在 B2C 中的業務
    const { data: originalData } = await apiAuth.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        employmentStatus: '在職'
      }
    })

    if (!originalData.success) {
      throw new Error('無法取得原始業務資料')
    }

    // 找出需要從 B2C 中移除的業務
    const originalEmployeeIds = originalData.result.map(emp => emp._id)
    const employeesToRemove = originalEmployeeIds.filter(id => !selectedEmployees.value.includes(id))

    // 找出需要新增到 B2C 的業務
    const employeesToAdd = selectedEmployees.value.filter(id => !originalEmployeeIds.includes(id))

    // 重新計算所有業務的順序（按公司分組，確保順序連續）
    const finalOrderUpdates = []

    // 按公司分組重新計算順序
    for (const [, employees] of Object.entries(groupedSelectedEmployees.value)) {
      employees.forEach((emp, index) => {
        finalOrderUpdates.push({
          id: emp._id,
          order: index // 確保順序從0開始連續
        })
      })
    }

    console.log('最終順序更新:', finalOrderUpdates)

    // 檢查是否有任何變更
    const originalOrders = {}
    originalData.result.forEach(emp => {
      originalOrders[emp._id] = emp.order
    })

    const hasOrderChanges = finalOrderUpdates.some(update => {
      const originalOrder = originalOrders[update.id]
      return originalOrder !== update.order
    })

    const hasChanges = employeesToRemove.length > 0 || employeesToAdd.length > 0 || hasOrderChanges

    if (!hasChanges) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    console.log('檢查變更:', {
      移除的業務: employeesToRemove,
      新增的業務: employeesToAdd,
      順序變更: hasOrderChanges,
      最終順序: finalOrderUpdates
    })

    let hasError = false

    // 如果有需要移除的業務，先將它們的 showInB2C 設為 false
    if (employeesToRemove.length > 0) {
      try {
        await apiAuth.post('/employees/batch-update-b2c', {
          employeeIds: employeesToRemove,
          showInB2C: false
        })
        console.log('已移除業務:', employeesToRemove)
      } catch (error) {
        if (error?.response?.data?.message !== '資料未做任何變更') {
          hasError = true
          throw error
        }
      }
    }

    // 更新新選擇的業務
    if (employeesToAdd.length > 0) {
      try {
        await apiAuth.post('/employees/batch-update-b2c', {
          employeeIds: employeesToAdd,
          showInB2C: true
        })
        console.log('已新增業務:', employeesToAdd)
      } catch (error) {
        if (error?.response?.data?.message !== '資料未做任何變更') {
          hasError = true
          throw error
        }
      }
    }

    // 更新所有業務的順序
    if (finalOrderUpdates.length > 0) {
      try {
        await apiAuth.post('/employees/batch-update-order', {
          updates: finalOrderUpdates
        })
        console.log('已更新業務順序:', finalOrderUpdates)
      } catch (error) {
        console.error('更新順序失敗:', error)
        hasError = true
        throw error
      }
    }

    // 保存員工順序到 localStorage（使用最新的順序）
    const orderMap = {}
    finalOrderUpdates.forEach(update => {
      orderMap[update.id] = update.order
    })
    localStorage.setItem('b2c_employee_order', JSON.stringify(orderMap))
    console.log('保存到 localStorage 的排序:', orderMap)

    // 只有當所有操作都成功時才顯示成功訊息並更新UI
    if (!hasError) {
      createSnackbar({
        text: '業務設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEmployeeManageDialog()

      // 重新載入業務列表
      await loadSearchSalesPersons()

      // 重新載入所有公司的業務資料到 companySalesPersonsMap
      const allCompanyIds = new Set()
      tableItems.value.forEach(item => {
        if (item.company?._id) {
          allCompanyIds.add(item.company._id)
        }
      })

      // 清空舊的業務資料
      companySalesPersonsMap.value.clear()

      // 重新載入所有公司的業務資料
      for (const companyId of allCompanyIds) {
        await getCompanySalesPersons(companyId)
      }

      // 重新載入表格資料以確保顯示最新的業務順序
      await performSearch()

      console.log('已重新載入所有資料')
    }
  } catch (error) {
    console.error('更新業務設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新業務設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSavingEmployees.value = false
  }
}

// 業務主管相關函數
const openSupervisorManageDialog = async () => {
  supervisorManageDialog.value.open = true
  isLoadingSupervisors.value = true
  tempSelectedSupervisor.value = null

  try {
    // 載入所有在職員工
    await searchSupervisors('')

    // 載入已選擇的業務主管
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        employmentStatus: '在職'
      }
    })
    if (data.success) {
      // 過濾出業務主管
      const supervisors = data.result.filter(emp => emp.isB2CSupervisor)

      // 清空和重設資料
      selectedSupervisors.value = []
      selectedSupervisorDetails.value = []

      // 按公司分組
      const groupedByCompany = {}

      // 處理每個業務主管資料
      for (const supervisor of supervisors) {
        const companyName = supervisor.company?.name || '未分類'
        if (!groupedByCompany[companyName]) {
          groupedByCompany[companyName] = []
        }

        // 添加到分組
        groupedByCompany[companyName].push({
          ...supervisor,
          nickname: supervisor.nickname || ''
        })
      }

      // 先設定已選擇的業務主管 ID
      for (const companySupervisors of Object.values(groupedByCompany)) {
        for (const supervisor of companySupervisors) {
          selectedSupervisors.value.push(supervisor._id)
        }
      }

      // 再設定詳細資料
      for (const companySupervisors of Object.values(groupedByCompany)) {
        for (const supervisor of companySupervisors) {
          selectedSupervisorDetails.value.push(supervisor)
        }
      }
    }
  } catch (error) {
    console.error('載入業務主管資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入業務主管資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoadingSupervisors.value = false
  }
}

const closeSupervisorManageDialog = () => {
  supervisorManageDialog.value.open = false
  selectedSupervisors.value = []
  selectedSupervisorDetails.value = []
  tempSelectedSupervisor.value = null
}

const searchSupervisors = async (searchTerm) => {
  try {
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        search: searchTerm,
        employmentStatus: '在職'
      }
    })
    if (data.success) {
      // 過濾出非業務主管的員工（因為業務主管不應該被重複選擇）
      allSupervisors.value = data.result.filter(emp => !emp.isB2CSupervisor)
    }
  } catch (error) {
    console.error('載入業務主管列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入業務主管列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isLoadingSupervisors.value = false
  }
}

const addSelectedSupervisor = async (supervisorId) => {
  if (supervisorId && !selectedSupervisors.value.includes(supervisorId)) {
    // 獲取完整的員工資料，包括公司資訊
    const supervisor = allSupervisors.value.find(emp => emp._id === supervisorId)
    if (supervisor) {
      selectedSupervisors.value.push(supervisorId)
      selectedSupervisorDetails.value.push({
        ...supervisor,
        nickname: supervisor.nickname || ''
      })
    }
  }
  // 清空臨時選擇的業務主管，以便下次選擇
  tempSelectedSupervisor.value = null
}

const removeSelectedSupervisor = (supervisorId) => {
  // 移除業務主管
  selectedSupervisors.value = selectedSupervisors.value.filter(id => id !== supervisorId)
  selectedSupervisorDetails.value = selectedSupervisorDetails.value.filter(emp => emp._id !== supervisorId)
}

const updateSupervisors = async () => {
  isUpdatingSupervisors.value = true
  try {
    // 先取得所有原本的業務主管
    const { data: originalData } = await apiAuth.get('/employees/suggestions', {
      params: {
        employmentStatus: '在職'
      }
    })

    if (!originalData.success) {
      throw new Error('無法取得原始業務主管資料')
    }

    // 找出原本的業務主管
    const originalSupervisors = originalData.result.filter(emp => emp.isB2CSupervisor)
    const originalSupervisorIds = originalSupervisors.map(emp => emp._id)

    // 找出需要從業務主管中移除的員工
    const supervisorsToRemove = originalSupervisorIds.filter(id => !selectedSupervisors.value.includes(id))

    // 找出需要新增為業務主管的員工
    const supervisorsToAdd = selectedSupervisors.value.filter(id => !originalSupervisorIds.includes(id))

    // 檢查是否有任何變更
    const hasChanges = supervisorsToRemove.length > 0 || supervisorsToAdd.length > 0

    if (!hasChanges) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    console.log('檢查變更:', {
      移除的業務主管: supervisorsToRemove,
      新增的業務主管: supervisorsToAdd
    })

    let hasError = false

    // 如果有需要移除的業務主管，將他們的 isB2CSupervisor 設為 false
    if (supervisorsToRemove.length > 0) {
      try {
        for (const supervisorId of supervisorsToRemove) {
          await apiAuth.patch(`/employees/${supervisorId}`, {
            isB2CSupervisor: false
          })
        }
        console.log('已移除業務主管:', supervisorsToRemove)
      } catch (error) {
        hasError = true
        throw error
      }
    }

    // 新增業務主管
    if (supervisorsToAdd.length > 0) {
      try {
        for (const supervisorId of supervisorsToAdd) {
          await apiAuth.patch(`/employees/${supervisorId}`, {
            isB2CSupervisor: true
          })
        }
        console.log('已新增業務主管:', supervisorsToAdd)
      } catch (error) {
        hasError = true
        throw error
      }
    }

    // 只有當所有操作都成功時才顯示成功訊息並關閉對話框
    if (!hasError) {
      createSnackbar({
        text: '業務主管設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeSupervisorManageDialog()
    }
  } catch (error) {
    console.error('更新業務主管設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新業務主管設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingSupervisors.value = false
  }
}

// 匯出功能
const openExportDialog = () => {
  exportDialog.value = {
    open: true,
    type: 'all',
    company: null,
    dateRange: null,
    sources: [],
    companyError: '',
    dateError: '',
    sourceError: ''
  }
}

const closeExportDialog = () => {
  exportDialog.value.open = false
}

const selectAllSources = () => {
  exportDialog.value.sourceError = ''
  if (exportDialog.value.sources.length === sourceOptions.length) {
    exportDialog.value.sources = []
  } else {
    exportDialog.value.sources = sourceOptions.map(source => source.value)
  }
}

const loadXLSX = async () => {
  if (window.XLSX) return window.XLSX

  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })

  return window.XLSX
}

const formatExcelDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const handleExportExcel = async () => {
  try {
    let hasError = false
    exportDialog.value.companyError = ''
    exportDialog.value.dateError = ''
    exportDialog.value.sourceError = ''

    if (exportDialog.value.type === 'company' && !exportDialog.value.company) {
      exportDialog.value.companyError = '請選擇公司'
      hasError = true
    }

    if (!exportDialog.value.dateRange || !Array.isArray(exportDialog.value.dateRange) || exportDialog.value.dateRange.length === 0) {
      exportDialog.value.dateError = '請選擇日期區間'
      hasError = true
    }

    if (!exportDialog.value.sources || exportDialog.value.sources.length === 0) {
      exportDialog.value.sourceError = '請選擇至少一個來源'
      hasError = true
    }

    if (hasError) return

    isExporting.value = true

    const params = {}

    if (exportDialog.value.dateRange && Array.isArray(exportDialog.value.dateRange) && exportDialog.value.dateRange.length > 0) {
      const startDate = new Date(exportDialog.value.dateRange[0])
      const endDate = new Date(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    if (exportDialog.value.sources.length > 0) {
      params.sources = exportDialog.value.sources.join(',')
    }

    if (exportDialog.value.type === 'company') {
      params.companies = exportDialog.value.company
    }
    // 注意：當選擇「所有公司資料」時，不應該傳送 companies 參數
    // 這樣後端就會返回所有公司的資料

    const { data } = await apiAuth.get('/customerInquiries/export', { params })

    if (data.success) {
      const XLSX = await loadXLSX()

      const excelData = data.result.map(inquiry => {
        let inquiryContent = inquiry.inquiryContent || ''
        inquiryContent = inquiryContent.replace(/<a[^>]*href="([^"]*)"[^>]*>點擊<\/a>/g, '$1')

        return {
          '公司': inquiry.company?.name || '',
          '日期': formatExcelDate(inquiry.inquiryDate),
          '來源': inquiry.source || '',
          '地區': inquiry.inquiryPlace || '',
          '詢問內容': inquiryContent,
          '客戶姓名': inquiry.customerName || '',
          '稱謂': inquiry.customerTitle || '',
          '電話': inquiry.customerPhone || '',
          'Line ID': inquiry.customerLineId || '',
          'Email': inquiry.customerEmail || '',
          '業務': inquiry.salesPerson ? (inquiry.salesPerson.nickname || inquiry.salesPerson.name) : '',
          '詢問結果': inquiry.inquiryResult || '',
          '最新進度 / 備註': inquiry.progressNotes?.length > 0 ? inquiry.progressNotes[inquiry.progressNotes.length - 1].content : ''
        }
      })

      const ws = XLSX.utils.json_to_sheet(excelData)

      const colWidths = {
        '公司': 15,
        '日期': 12,
        '來源': 12,
        '地區': 12,
        '詢問內容': 50,
        '客戶姓名': 15,
        '稱謂': 10,
        '電話': 15,
        'Line ID': 15,
        'Email': 30,
        '業務': 12,
        '詢問結果': 12,
        '最新進度 / 備註': 50
      }

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }))

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '直客詢問統計表')

      let companyName = ''
      if (exportDialog.value.type === 'company') {
        const selectedCompany = companies.value.find(c => c._id === exportDialog.value.company)
        companyName = selectedCompany ? selectedCompany.name : ''
      }

      const fileName = exportDialog.value.type === 'all'
        ? `直客詢問統計表_${formatExcelDate(exportDialog.value.dateRange[0])}_${formatExcelDate(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])}.xlsx`
        : `直客詢問統計表_${companyName}_${formatExcelDate(exportDialog.value.dateRange[0])}_${formatExcelDate(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])}.xlsx`

      XLSX.writeFile(wb, fileName)

      closeExportDialog()

      createSnackbar({
        text: 'Excel 匯出成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error?.response?.data?.message || '操作失敗'
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isExporting.value = false
  }
}

// 格式化函數
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

const copyLineLink = async (lineLink) => {
  try {
    await navigator.clipboard.writeText(lineLink)
    createSnackbar({
      text: 'Line連結已複製',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('複製失敗:', error)
    createSnackbar({
      text: '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const copyLineId = async (lineId) => {
  try {
    await navigator.clipboard.writeText(lineId)
    createSnackbar({
      text: 'Line ID 已複製',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('複製失敗:', error)
    createSnackbar({
      text: '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 獲取公司業務列表
const getCompanySalesPersons = async (companyId) => {
  try {
    const { data } = await apiAuth.get('/employees/suggestions', {
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

// 監聽表格資料變化
watch(() => tableItems.value, async (items) => {
  if (!items) return

  const companyIds = new Set(items.map(item => item.company._id))

  // 強制重新載入所有公司的業務資料以確保順序正確
  for (const companyId of companyIds) {
    await getCompanySalesPersons(companyId)
  }
}, { immediate: true })

// 監聽對話框中的公司選擇變更
watch(() => company.value.value, async (newVal) => {
  salesPerson.value.value = null

  if (newVal) {
    try {
      const { data } = await apiAuth.get('/employees/suggestions', {
        params: {
          showInB2C: true,
          employmentStatus: '在職',
          company: newVal
        }
      })
      if (data.success) {
        dialogSalesPersons.value = data.result
      }
    } catch (error) {
      console.error('載入業務列表失敗:', error)
      createSnackbar({
        text: error?.response?.data?.message || '載入業務列表失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } else {
    dialogSalesPersons.value = []
  }
})

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

// 初始化
onMounted(async () => {
  try {
    tableLoading.value = true
    await Promise.all([
      loadCompanies(),
      loadSearchSalesPersons(),
      loadPlaceOptions()
    ])
    await performSearch()
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

const getInquiryResultTextClass = (result) => {
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
</script>

<style lang="scss" scoped>
.white-space-pre-wrap {
  padding: 4px 0;
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

.back-button {
  transition: 0.3s ease;
  &:hover {
    color: rgb(0, 102, 255);
  }
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

.sales-person-card {
  border: 1px solid #512DA8;
}

.order-badge {
  display: flex;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  background-color: #EC407A;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  line-height: 16px;
  font-weight: bold;
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

.inquiry-result-text {
  text-align: center;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;

  &.teal-lighten-1 {
    background-color: #e0f2f1;
    color: #00695c;
  }

  &.red-lighten-1 {
    background-color: #ffcdd2;
    color: #c62828;
  }

  &.grey-darken-1 {
    background-color: #cfd8dc;
    color: #6b6b6b;
  }

  &.grey-lighten-2 {
    background-color: #f5f5f5;
    color: #424242;
  }
}

.line-id-text {
  cursor: pointer;
  color: #512DA8;

  &:hover {
    color: #5C6BC0;
    text-decoration: underline;
  }
}
</style>

<route lang="yaml">
  meta:
    layout: default
</route>
