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
                    <div
                      class="ms-2"
                      style="width: 130px;"
                    >
                      <v-select
                        v-if="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)"
                        v-show="availableCompanies.length > 0"
                        v-model="searchCriteria.company"
                        :items="availableCompanies"
                        item-title="name"
                        item-value="_id"
                        placeholder="請選擇公司"
                        variant="outlined"
                        density="compact"
                        hide-details
                      />
                    </div>
                    <!-- <v-chip
                      label
                      variant="outlined"
                      size="large"
                      color="red"
                      class="ms-4"
                    >
                      <v-icon
                        icon="mdi-arrow-left"
                        class="me-2"
                      /> 請先選擇公司
                    </v-chip> -->
                    <v-btn
                      v-if="(!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) && verifiedCompany"
                      v-tooltip="'登出'"
                      icon
                      color="red-darken-2"
                      variant="plain"
                      class="ms-4"
                      size="20"
                      :ripple="false"
                      @click="handleLogout"
                    >
                      <v-icon size="20">
                        mdi-logout
                      </v-icon>
                    </v-btn>
                    <v-spacer />
                    <div
                      v-if="!user.isLogin && verifiedCompany"
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
                          {{ formattedRemainingTime }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <v-divider class="mt-5 mb-6" />
                  <v-card-text
                    v-if="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)"
                    class="pt-4 px-9"
                  >
                    <v-row class="mb-2">
                      <!-- 來源選擇 -->
                      <v-col
                        cols="2"
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
                            :disabled="!verifiedCompany"
                          />
                        </div>
                      </v-col>

                      <!-- 業務選擇 -->
                      <v-col
                        cols="2"
                      >
                        <div class="d-flex align-center ">
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
                            :disabled="!searchCriteria.company"
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
                            :disabled="!verifiedCompany"
                            @update:model-value="handleDateRangeChange"
                          />
                        </div>
                      </v-col>

                      <!-- 地區 -->
                      <v-col
                        cols="2"
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
                            :disabled="!verifiedCompany"
                          />
                        </div>
                      </v-col>

                      <!-- 詢問結果 -->
                      <v-col
                        cols="2"
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
                            :disabled="!verifiedCompany"
                          />
                        </div>
                      </v-col>
                      <v-col
                        cols="2"
                      >
                        <v-row class="d-flex justify-end">
                          <v-col
                            cols="8"
                            class="ps-0"
                          >
                            <v-btn
                              color="cyan-darken-2"
                              prepend-icon="mdi-magnify"
                              :loading="tableLoading"
                              :disabled="!verifiedCompany"
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
                              :disabled="!verifiedCompany"
                              @click="resetSearch"
                            >
                              <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text
                    v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                    class="pt-4 px-9"
                  >
                    <v-row class="mb-2">
                      <!-- 公司選擇 -->
                      <v-col
                        cols="2"
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
                        cols="2"
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
                        cols="2"
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
                        cols="2"
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
                          />
                        </div>
                      </v-col>

                      <!-- 地區 -->
                      <v-col
                        cols="2"
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
                        cols="2"
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
                      <v-col />
                      <v-col
                        cols="2"
                      >
                        <v-row class="d-flex justify-end">
                          <v-col
                            cols="7"
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
                    class=" px-1 px-md-7 mt-1 bg-white"
                  >
                    <!-- 標題和功能按鈕區 -->
                    <v-col
                      cols="12"
                      class="ps-4 pb-sm-4"
                    >
                      <v-row>
                        <v-col class="d-flex justify-space-between align-center">
                          <div class="d-flex justify-space-between align-center">
                            <v-btn
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                              prepend-icon="mdi-microsoft-excel"
                              color="teal-darken-2"
                              class="me-4"
                              :disabled="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser && !verifiedCompany)"
                              @click="openExportDialog"
                            >
                              匯出 EXCEL
                            </v-btn>
                            <!-- <v-btn
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                              prepend-icon="mdi-file-pdf-box"
                              color="red-darken-1"
                              class="me-4"
                              :disabled="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser && !verifiedCompany)"
                            >
                              匯出 PDF
                            </v-btn> -->
                            <v-btn
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                              prepend-icon="mdi-account-cog"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openEmployeeManageDialog"
                            >
                              業務管理
                            </v-btn>
                            <v-btn
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                              prepend-icon="mdi-plus"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openDialog(null)"
                            >
                              新增詢問
                            </v-btn>
                            <v-btn
                              v-if="!user.isLogin && verifiedCompany"
                              prepend-icon="mdi-account-switch"
                              variant="outlined"
                              color="blue-grey-darken-2"
                              class="me-4"
                              @click="openSalesRotationDialog"
                            >
                              業務輪流表
                            </v-btn>
                            <v-btn
                              v-tooltip="'查看本月'"
                              icon
                              color="cyan-darken-2"
                              variant="text"
                              size="34"
                              class="me-4"
                              :disabled="!user.isLogin && !verifiedCompany"
                              @click="setCurrentMonth"
                            >
                              <v-icon
                                size="20"
                                style="padding-top: 2px;"
                              >
                                mdi-calendar-month
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
                              :disabled="!user.isLogin && !verifiedCompany"
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
                            <td
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                            >
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
                              <v-menu
                                max-height="360"
                                :open-on-click="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)"
                              >
                                <template #activator="{ props }">
                                  <v-btn
                                    v-if="item.inquiryResult"
                                    v-bind="props"
                                    :color="getInquiryResultColor(item.inquiryResult)"
                                    variant="outlined"
                                    class="px-2 opacity-100"
                                    size="small"
                                    :loading="updatingInquiryResults.has(item._id)"
                                    :disabled="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
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
                                    :disabled="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                                    :style="user.isLogin && (user.isManager || user.isAdmin || user.isUser) ? 'cursor: default !important' : ''"
                                  >
                                    選擇結果
                                  </v-btn>
                                </template>
                                <v-list v-if="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)">
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
                                      {{ user.isLogin && (user.isManager || user.isAdmin || user.isUser) ? '【 尚未新增紀錄 】' : '【 請點擊右方按鈕新增 】' }}
                                    </div>
                                  </template>
                                </div>
                                <v-btn
                                  v-tooltip:top="user.isLogin && (user.isManager || user.isAdmin || user.isUser) ? '查看紀錄' : '新增及查看紀錄'"
                                  icon
                                  color="grey-darken-2"
                                  variant="plain"
                                  size="18"
                                  class="ms-1"
                                  :ripple="false"
                                  @click="openSimpleDialog(item)"
                                >
                                  <v-icon>mdi-history</v-icon>
                                </v-btn>
                              </div>
                            </td>
                            <td
                              v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                              class="text-center"
                            >
                              <v-btn
                                v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser) || verifiedCompany"
                                icon
                                color="light-blue-darken-4"
                                variant="plain"
                                size="18"
                                class="mx-2"
                                :ripple="false"
                                @click="openDialog(item)"
                              >
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                              <v-btn
                                v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
                                icon
                                color="red-lighten-1"
                                variant="plain"
                                size="18"
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
      <v-card class="rounded-lg px-4 py-6">
        <div class="card-title px-4 py-3">
          {{ dialog.id ? '編輯詢問資料' : '新增詢問' }}
        </div>
        <v-card-text class="mt-3 pa-3">
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
                    cols="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="2"
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
                    cols="5"
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
                    cols="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="2"
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
                    cols="5"
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
                    cols="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="2"
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
                    cols="5"
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
                <div class="d-flex align-end mb-2">
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

              <!-- 詢問結果 -->
              <!-- <v-col cols="4">
                <v-select
                  v-model="inquiryResult.value.value"
                  :error-messages="inquiryResult.errorMessage.value"
                  :items="inquiryResultOptions"
                  item-title="text"
                  item-value="value"
                  label="詢問結果"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col> -->

              <!-- 進度 -->
              <!-- <v-col cols="4">
                <v-textarea
                  v-model="progressAndNote.value.value"
                  :error-messages="progressAndNote.errorMessage.value"
                  label="進度 / 備註"
                  variant="outlined"
                  density="compact"
                  hide-details
                  auto-grow
                  rows="8"
                />
              </v-col> -->
            </v-row>

            <v-card-actions class="px-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                @click="closeDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
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
      <v-card class="rounded-lg px-4 py-4">
        <div class="card-title px-4 mt-2 mb-3 d-flex justify-space-between align-center">
          <div>進度 / 備註 - 歷史紀錄</div>
          <v-btn
            icon
            variant="text"
            size="40"
            @click="closeSimpleDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-3">
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

          <!-- 新增進度/備註區域 -->
          <div v-else>
            <div
              v-if="!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)"
              class="d-flex align-center mb-6"
            >
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
      <v-card class="rounded-lg pt-6 pb-4 px-6">
        <div class="card-title mb-3">
          確認新增
        </div>
        <v-card-text class="pa-0 mb-4">
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
        <v-card-actions class="px-0">
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
            @click="addProgressNote"
          >
            確認
          </v-btn>
        </v-card-actions>
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

    <!-- 密碼對話框 -->
    <v-dialog
      v-model="isPasswordDialogOpen"
      persistent
      max-width="320"
      @update:model-value="handlePasswordDialogClose"
    >
      <v-card class="pt-7 px-7 pb-5 rounded-lg">
        <div class="card-title">
          請輸入「{{ selectedCompanyName }}」密碼
        </div>
        <v-card-text class="pa-0 mt-8 mb-5">
          <form @submit.prevent="verifyCompanyPassword">
            <v-text-field
              v-model="companyPassword"
              label="密碼"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              density="compact"
              hide-details
              autocomplete="current-password"
              @click:append-inner="showPassword = !showPassword"
              @keyup.enter="verifyCompanyPassword"
            />
          </form>
        </v-card-text>
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="closePasswordDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isVerifying"
            :disabled="!companyPassword"
            class="ms-2"
            @click="verifyCompanyPassword"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 業務管理對話框 -->
    <v-dialog
      v-model="employeeManageDialog.open"
      persistent
      max-width="1374"
    >
      <v-card class="rounded-lg px-4 py-5">
        <div class="card-title px-4 pt-2">
          業務管理
        </div>
        <v-card-text class="mt-3 pa-3 pe-0">
          <div class="px-1">
            <v-autocomplete
              v-model="tempSelectedEmployee"
              :items="filteredEmployees"
              :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode || ''}) - ${item.company?.name || ''}` : ''"
              item-value="_id"
              label="選擇業務"
              variant="outlined"
              density="compact"
              class="pe-3"
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
          <div class="mt-8 selected-employees-container">
            <div class="sub-title mb-5 ps-1">
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
                          Line：{{ employee.lineID || '尚未填寫' }}
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
        <v-card-actions class="px-4 mt-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            @click="closeEmployeeManageDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isSavingEmployees"
            @click="saveEmployees"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 業務輪流表對話框 -->
    <v-dialog
      v-model="salesRotationDialog.open"
      max-width="880"
    >
      <v-card class="rounded-lg px-4 py-4">
        <div class="card-title px-4 pt-3 pb-1">
          業務輪流表
        </div>
        <v-card-text class="mt-3 px-5 pt-3">
          <!-- 加入載入中動畫 -->
          <div
            v-if="isLoadingSalesRotation"
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
        <v-card-actions class="px-3">
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

    <!-- 匯出對話框 -->
    <v-dialog
      v-model="exportDialog.open"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg px-4 pt-6 pb-4">
        <div class="card-title px-4 mt-1">
          匯出 Excel
        </div>
        <v-card-text class="mt-3 pa-2">
          <v-form @submit.prevent="handleExportExcel">
            <v-row>
              <!-- 匯出類型 -->
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-radio-group
                  v-model="exportDialog.type"
                  hide-details
                  class="mb-3"
                >
                  <v-radio
                    label="所有公司資料"
                    value="all"
                    color="deep-purple-darken-2"
                  />
                  <v-radio
                    label="單一公司資料"
                    value="company"
                    color="deep-purple-darken-2"
                  />
                </v-radio-group>
              </v-col>

              <!-- 公司選擇 -->
              <v-col
                v-if="exportDialog.type === 'company'"
                cols="12"
                class="px-5 pb-0"
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
                class="px-5 pb-0"
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
                class="px-5 pb-0"
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

            <v-card-actions class="pa-0 px-2 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                @click="closeExportDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :loading="isExporting"
              >
                匯出
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
  <TourGuide
    v-if="!user.isLogin"
    ref="tourGuide"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useUserStore } from '@/stores/user'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import TourGuide from '@/components/TourGuide.vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

// 頁面定義
definePage({
  meta: {
    title: '直客詢問統計表 | GInternational',
    login: false,
  }
})

// 在 script setup 區域的開頭添加
const VERIFICATION_EXPIRY_HOURS = 1 // 驗證有效期限（小時）

// 添加提醒狀態變數
const reminderShown = ref({
  fiveMinutes: false,
  oneMinute: false
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const { smAndUp, mdAndUp } = useDisplay()

// 響應式變數
const dialogWidth = computed(() => mdAndUp.value ? '880' : '100%')
const isSearching = ref(false)

// 表格相關
const tableHeaders = [
  { title: '公司', key: 'company.name', align: 'start', sortable: true },
  { title: '日期 / 時間', key: 'inquiryDate', minWidth: '116px', align: 'start', sortable: true },
  { title: '來源', key: 'source', width: '90px', align: 'start', sortable: true },
  { title: '地區', key: 'inquiryPlace', minWidth: '84px', align: 'start', sortable: true },
  { title: '詢問內容', key: 'inquiryContent', width: '240px', align: 'start', sortable: true },
  { title: '客戶姓名', key: 'customerName', minWidth: '90px', align: 'start', sortable: true },
  { title: '稱謂', key: 'customerTitle', align: 'start', sortable: true },
  { title: '電話', key: 'customerPhone', align: 'start', sortable: true },
  { title: 'Line ID', key: 'customerLineId', align: 'start', sortable: true },
  { title: 'Email', key: 'customerEmail', align: 'start', sortable: true },
  { title: '業務', key: 'salesPerson.name', align: 'start', sortable: true },
  { title: '詢問結果', key: 'inquiryResult', width: '110px', align: 'start', sortable: true },
  { title: '最新進度 / 備註', key: 'latestProgressNote.content', width: '220px', align: 'start', sortable: true },
  { title: '操作', key: 'actions', width: '100px', align: 'center', sortable: false }
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

// 載入地區選項
const loadPlaceOptions = async () => {
  try {
    const { data } = await apiAuth.get('/lineCategories/all-second-level')
    if (data.success) {
      // 根據 order 排序
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

// 修改響應式表格標頭
const filteredHeaders = computed(() => {
  let headers = tableHeaders

  // 如果不是管理者、管理員或一般用戶，移除公司欄位和操作欄位
  if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
    headers = headers.filter(header =>
      !['company.name', 'actions'].includes(header.key)
    )
  }

  // 根據螢幕大小過濾欄位
  if (!smAndUp.value) {
    headers = headers.filter(header =>
      ['inquiryDate', 'customerName', 'actions'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    headers = headers.filter(header =>
      !['inquiryPlace'].includes(header.key)
    )
  }
  return headers
})

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
  originalResult: null,  // 保存原始詢問結果
  currentItemId: null,   // 保存當前項目ID
  submitted: false      // 新增：標記是否成功提交
})

const isDialogLoading = ref(false)

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
    .nullable(),
  inquiryResult: yup
    .string()
    .nullable(),
  progressAndNote: yup
    .string()
    .nullable()
    .when('inquiryResult', {
      is: (val) => val === '不成交' || val === '其他',
      then: (schema) => schema.required('當詢問結果為不成交或其他時，進度/備註為必填')
    })
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
    customerTitle: null, // Add customerTitle
    customerPhone: '',
    customerLineId: '',
    customerEmail: '',
    inquiryContent: '',
    inquiryResult: '',
    progressAndNote: ''
  }
})

// 定義表單欄位
const inquiryDate = useField('inquiryDate')
const source = useField('source')
const inquiryPlace = useField('inquiryPlace')
const company = useField('company')
const salesPerson = useField('salesPerson')
const customerName = useField('customerName')
const customerTitle = useField('customerTitle') // Define customerTitle field
const customerPhone = useField('customerPhone')
const customerLineId = useField('customerLineId')
const customerEmail = useField('customerEmail')
const inquiryContent = useField('inquiryContent')
const inquiryResult = useField('inquiryResult')
const progressAndNote = useField('progressAndNote')

// 在 script setup 區域添加以下程式碼
const isPasswordDialogOpen = ref(false)
const companyPassword = ref('')
const isVerifying = ref(false)
const verifiedCompany = ref(null)
const availableCompanies = ref([])
const tempSelectedCompany = ref(null)
const showPassword = ref(false)

// Add customerTitle options near other options
const titleOptions = ['先生', '小姐', '其他']

// 添加計算屬性來獲取所選公司的名稱
const selectedCompanyName = computed(() => {
  if (!tempSelectedCompany.value) return ''
  const company = availableCompanies.value.find(c => c._id === tempSelectedCompany.value)
  return company ? company.name : ''
})

// 載入有詢問記錄的公司列表
const loadAvailableCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/with-inquiries')
    if (data.success) {
      // 根據 companyId 排序
      availableCompanies.value = data.result.sort((a, b) => {
        return a.companyId.localeCompare(b.companyId)
      })
    }
  } catch (error) {
    console.error('載入公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 修改 watch 函數
watch(() => searchCriteria.value.company, async (newVal) => {
  if (newVal && (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser))) {
    const verificationData = localStorage.getItem('companyVerification')
    if (!verificationData) {
      tempSelectedCompany.value = newVal
      searchCriteria.value.company = null
      isPasswordDialogOpen.value = true
      return
    }

    const { companyId, timestamp } = JSON.parse(verificationData)
    const now = new Date().getTime()
    const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

    if (now > expiryTime) {
      const companyName = availableCompanies.value.find(company => company._id === companyId)?.name || ''
      localStorage.removeItem('companyVerification')
      verifiedCompany.value = null
      searchCriteria.value.company = null
      tableItems.value = []
      tableItemsLength.value = 0
      createSnackbar({
        text: `登入時效已到期，已自動登出「${companyName}」`,
        snackbarProps: {
          color: 'warning',
          timeout: -1,
          location: 'top'
        }
      })
      return
    }

    if (companyId !== newVal) {
      tempSelectedCompany.value = newVal
      searchCriteria.value.company = companyId
      isPasswordDialogOpen.value = true
    } else {
      await loadSearchSalesPersons()
      performSearch()
    }
  }
})

// 修改 verifyCompanyPassword 函數
const verifyCompanyPassword = async () => {
  if (!companyPassword.value) return

  isVerifying.value = true
  try {
    const { data } = await apiAuth.post(`/companies/${tempSelectedCompany.value}/verify-statistics-password`, {
      statisticsPassword: companyPassword.value
    })

    if (data.success) {
      localStorage.setItem('companyVerification', JSON.stringify({
        companyId: tempSelectedCompany.value,
        timestamp: new Date().getTime()
      }))

      verifiedCompany.value = tempSelectedCompany.value
      searchCriteria.value.company = tempSelectedCompany.value
      isPasswordDialogOpen.value = false
      companyPassword.value = ''

      // 設置新的定時器
      setupAutoLogoutTimer()

      createSnackbar({
        text: '密碼驗證成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await loadSearchSalesPersons()
      performSearch()
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '密碼驗證失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    companyPassword.value = ''
  } finally {
    isVerifying.value = false
  }
}

const closePasswordDialog = () => {
  isPasswordDialogOpen.value = false
  companyPassword.value = ''
  showPassword.value = false
}

// 處理密碼對話框關閉事件
const handlePasswordDialogClose = (value) => {
  if (!value) {
    // 對話框關閉後，清空 tempSelectedCompany
    setTimeout(() => {
      tempSelectedCompany.value = null
    }, 300) // 等待對話框關閉動畫完成
  }
}

// API 相關函數
const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      // 根據 companyId 排序
      companies.value = data.result.data.sort((a, b) => {
        return a.companyId.localeCompare(b.companyId)
      })
    }
  } catch (error) {
    console.error('載入公司列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 添加一個新的函數來獲取特定公司的業務列表
const getCompanySalesPersons = async (companyId) => {
  try {
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        company: companyId
      }
    })
    if (data.success) {
      companySalesPersonsMap.value.set(companyId, data.result)
    }
  } catch (error) {
    console.error('載入業務列表失敗:', error)
    companySalesPersonsMap.value.set(companyId, [])
  }
}

// 修改 loadSalesPersons 函數為 loadSearchSalesPersons
const loadSearchSalesPersons = async () => {
  try {
    const params = {
      showInB2C: true
    }

    // 如果是一般身分且已驗證公司，只顯示該公司的業務
    if (!user.isLogin && verifiedCompany.value) {
      params.company = verifiedCompany.value
    }

    // 如果有身份的人在搜尋區塊選擇了公司，則顯示該公司的業務
    if (user.isLogin && (user.isManager || user.isAdmin || user.isUser) && searchCriteria.value.company) {
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

const handleCompanyChange = async () => {
  if (!searchCriteria.value.company) return
  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: searchCriteria.value.company }
    })
    if (data.success) {
      // 如果需要部門資料，可以在這裡處理
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 處理日期區間變更
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 添加檢查登出狀態的函數
const checkAutoLogout = () => {
  if (user.isLogin || !verifiedCompany.value) {
    return
  }

  const verificationData = localStorage.getItem('companyVerification')
  if (!verificationData) {
    return
  }

  const { companyId, timestamp } = JSON.parse(verificationData)
  const now = new Date().getTime()
  const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

  if (now > expiryTime) {
    console.log('checkAutoLogout: 驗證已過期，開始執行登出流程')
    // 獲取公司名稱
    const companyName = availableCompanies.value.find(company => company._id === companyId)?.name || ''

    // 清除驗證資訊
    localStorage.removeItem('companyVerification')
    verifiedCompany.value = null
    searchCriteria.value.company = null

    // 清空表格資料
    tableItems.value = []
    tableItemsLength.value = 0

    // 強制觸發搜尋更新
    performSearch()

    // 顯示登出提示
    createSnackbar({
      text: `登入時效已到期，已自動登出「${companyName}」`,
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

    console.log('checkAutoLogout: 登出流程完成')
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

// 在 script setup 區域添加新的函數
const updateVerificationTimestamp = () => {
  const verificationData = localStorage.getItem('companyVerification')
  if (verificationData) {
    const data = JSON.parse(verificationData)
    // 更新時間戳記
    data.timestamp = new Date().getTime()
    localStorage.setItem('companyVerification', JSON.stringify(data))

    // 重置提醒狀態
    reminderShown.value = {
      fiveMinutes: false,
      oneMinute: false
    }

    // 更新倒數計時
    updateRemainingTime()
  }
}

// 修改 performSearch 函數,加入更新時間戳記
const performSearch = async () => {
  // 檢查未登入用戶是否有選擇公司
  if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
    console.log('performSearch: 檢查驗證狀態開始')
    const verificationData = localStorage.getItem('companyVerification')
    if (!verificationData) {
      console.log('performSearch: 無驗證資料')
      tableItems.value = []
      tableItemsLength.value = 0
      isSearching.value = false
      return
    }

    const { companyId, timestamp } = JSON.parse(verificationData)
    const now = new Date().getTime()
    const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

    console.log('performSearch 時間檢查:', {
      現在時間: new Date(now).toLocaleString(),
      到期時間: new Date(expiryTime).toLocaleString(),
      剩餘分鐘: ((expiryTime - now) / 1000 / 60).toFixed(2),
      是否過期: now > expiryTime
    })

    if (now > expiryTime) {
      console.log('performSearch: 驗證已過期')
      localStorage.removeItem('companyVerification')
      tableItems.value = []
      tableItemsLength.value = 0
      isSearching.value = false
      return
    }

    // 如果驗證資料存在且有效，設定公司 ID
    if (!searchCriteria.value.company) {
      console.log('performSearch: 設定公司ID', companyId)
      searchCriteria.value.company = companyId
      verifiedCompany.value = companyId
    }
  }

  try {
    console.log('performSearch: 開始搜尋，參數:', {
      公司: searchCriteria.value.company,
      頁碼: tablePage.value,
      每頁筆數: tableItemsPerPage.value
    })
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

    // 只有當有選擇公司時才加入 company 參數
    // 確保 user.isUser 角色也能獲取所有數據，即使沒有選擇公司
    if (searchCriteria.value.company) {
      params.company = searchCriteria.value.company
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

    // 根據用戶是否登入以及角色選擇不同的 API 端點
    let endpoint = '/customerInquiries/all'
    if (!user.isLogin) {
      endpoint = '/customerInquiries/public/all'
    }

    // 更新時間戳記
    updateVerificationTimestamp()

    const { data } = await apiAuth.get(endpoint, { params })
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
  if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
    // 一般使用者保留公司選擇
    searchCriteria.value = {
      company: searchCriteria.value.company,
      source: null,
      salesPerson: null,
      dateRange: null,
      inquiryPlace: null,
      inquiryResult: null
    }
  } else {
    // 管理者可以重置所有條件
    searchCriteria.value = {
      company: null,
      source: null,
      salesPerson: null,
      dateRange: null,
      inquiryPlace: null,
      inquiryResult: null
    }
  }
  quickSearch.value = ''
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

// 初始化
onMounted(async () => {
  console.log('onMounted: 開始初始化')
  try {
    tableLoading.value = true
    await Promise.all([
      loadCompanies(),
      loadSearchSalesPersons(),
      loadAvailableCompanies(),
      loadPlaceOptions()
    ])

    // 檢查驗證狀態
    if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
      console.log('onMounted: 檢查驗證狀態')
      const verificationData = localStorage.getItem('companyVerification')
      if (verificationData) {
        const { companyId, timestamp } = JSON.parse(verificationData)
        const now = new Date().getTime()
        const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

        console.log('onMounted 時間檢查:', {
          現在時間: new Date(now).toLocaleString(),
          到期時間: new Date(expiryTime).toLocaleString(),
          剩餘分鐘: ((expiryTime - now) / 1000 / 60).toFixed(2),
          是否過期: now > expiryTime
        })

        if (now <= expiryTime) {
          console.log('onMounted: 驗證有效，設定公司並啟動定時檢查')
          searchCriteria.value.company = companyId
          verifiedCompany.value = companyId
          await performSearch()

          // 啟動定時檢查
          console.log('onMounted: 啟動定時檢查')
          setupAutoLogoutTimer()
        } else {
          console.log('onMounted: 驗證已過期，清除資料')
          localStorage.removeItem('companyVerification')
          verifiedCompany.value = null
        }
      }
    } else {
      console.log('onMounted: 已登入用戶，直接搜尋')
      await performSearch()
    }
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
    console.log('onMounted: 初始化完成')
  }
})

// 添加 onUnmounted 清理定時器
onUnmounted(() => {
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value)
  }
})

// 開啟對話框
const openDialog = async (item) => {
  // 如果是管理者、管理員或一般使用者，開啟完整對話框
  if (user.isLogin && (user.isManager || user.isAdmin || user.isUser)) {
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
        customerTitle.value.value = item.customerTitle || null // Load customerTitle
        customerPhone.value.value = item.customerPhone || ''
        customerLineId.value.value = item.customerLineId || ''
        customerEmail.value.value = item.customerEmail || ''
        inquiryContent.value.value = item.inquiryContent || ''
        inquiryResult.value.value = item.inquiryResult || ''
        progressAndNote.value.value = item.progressAndNote || ''
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
  } else {
    // 其他使用者，開啟簡化版對話框
    openSimpleDialog(item)
  }
}

// 關閉對話框
const closeDialog = () => {
  // 如果是從表格更改詢問結果而來，且取消操作，恢復原始狀態
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

// 提交表單
const submitInquiry = handleSubmit(async (values) => {
  try {
    // 處理時間，確保包含當前的時分秒
    const processedValues = {
      ...values,
      salesPerson: values.salesPerson || null,
      inquiryDate: values.inquiryDate ? new Date(
        new Date(values.inquiryDate).getFullYear(),
        new Date(values.inquiryDate).getMonth(),
        new Date(values.inquiryDate).getDate(),
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds()
      ).toISOString() : null
    }

    if (dialog.value.id) {
      // 編輯模式 - 檢查資料是否有變更
      const originalItem = tableItems.value.find(item => item._id === dialog.value.id)

      // 檢查資料是否有變更
      const hasChanges = JSON.stringify({
        company: processedValues.company,
        salesPerson: processedValues.salesPerson || null,
        inquiryDate: processedValues.inquiryDate,
        source: processedValues.source,
        inquiryPlace: processedValues.inquiryPlace || '',
        inquiryContent: processedValues.inquiryContent || '',
        customerName: processedValues.customerName || '',
        customerTitle: processedValues.customerTitle || '',
        customerPhone: processedValues.customerPhone || '',
        customerLineId: processedValues.customerLineId || '',
        customerEmail: processedValues.customerEmail || '',
        progressAndNote: processedValues.progressAndNote || '',
        inquiryResult: processedValues.inquiryResult || ''
      }) !== JSON.stringify({
        company: originalItem.company._id.toString(),
        salesPerson: originalItem.salesPerson?._id?.toString() || null,
        inquiryDate: originalItem.inquiryDate,
        source: originalItem.source,
        inquiryPlace: originalItem.inquiryPlace || '',
        inquiryContent: originalItem.inquiryContent || '',
        customerName: originalItem.customerName || '',
        customerTitle: originalItem.customerTitle || '',
        customerPhone: originalItem.customerPhone || '',
        customerLineId: originalItem.customerLineId || '',
        customerEmail: originalItem.customerEmail || '',
        progressAndNote: originalItem.progressAndNote || '',
        inquiryResult: originalItem.inquiryResult || ''
      }) || (
        // 特別處理：如果是從表格更改詢問結果而來，且結果為不成交或其他，
        // 只要進度/備註有填寫就視為有變更
        dialog.value.currentItemId &&
        ['不成交', '其他'].includes(processedValues.inquiryResult) &&
        processedValues.progressAndNote?.trim()
      )

      if (!hasChanges) {
        createSnackbar({
          text: '資料未做任何變更',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }

      // 更新資料並獲取更新後的完整資料（包含關聯資料）
      const { data } = await apiAuth.patch(
        `/customerInquiries/${dialog.value.id}`,
        processedValues
      )

      if (data.success) {
        // 標記為已成功提交
        dialog.value.submitted = true
        // 立即更新表格中的項目
        const updatedItem = tableItems.value.find(item => item._id === dialog.value.id)
        if (updatedItem) {
          Object.assign(updatedItem, {
            ...updatedItem,
            ...processedValues,
            inquiryResult: processedValues.inquiryResult
          })
        }
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '詢問資料更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增
      const { data } = await apiAuth.post('/customerInquiries', processedValues)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '新增詢問成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// 格式化日期
// const formatDate = (date) => {
//   if (!date) return ''
//   return new Date(date).toLocaleDateString('zh-TW', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit'
//   })
// }

const urlInput = ref('')

const confirmInsertUrl = () => {
  if (!urlInput.value) return

  const textarea = document.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = inquiryContent.value.value
  const before = text.substring(0, start)
  const after = text.substring(end)

  // 插入網址按鈕
  const buttonHtml = ` <a href="${urlInput.value}" target="_blank" class="url-button">連結</a>`
  inquiryContent.value.value = before + buttonHtml + after

  // 清空輸入框
  urlInput.value = ''
}

const formatInquiryContent = (content) => {
  if (!content) return ''

  // 將網址按鈕的 HTML 轉換為實際的按鈕
  return content.replace(
    /<a href="([^"]+)" target="_blank" class="url-button">↗<\/a>/g,
    (match, url) => {
      return `<a href="${url}" target="_blank" class="url-button">↗</a>`
    }
  )
}

// 添加新的變數
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
  id: null
})

// 添加日期格式化函數
const formatProgressNoteTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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
      id: item._id
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

// 添加進度/備註驗證函數
const validateProgressNote = (note) => {
  if (!note || note.trim().length === 0) {
    return '請輸入進度/備註內容'
  }
  if (note.length > 500) {
    return '進度/備註內容不能超過500字'
  }
  return ''
}

// 添加新增進度/備註函數
const addProgressNote = async () => {
  const error = validateProgressNote(progressNoteInput.value)
  if (error) {
    createSnackbar({
      text: error,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  isAddingNote.value = true
  try {
    const response = await apiAuth.post(`/customerInquiries/${simpleDialog.value.id}/progress-notes`, {
      content: progressNoteInput.value
    })

    if (response.data.success) {
      // 如果這是強制新增備註的情況（因為改為不成交或其他）
      if (simpleDialog.value.requireNote && simpleDialog.value.pendingResult) {
        // 更新詢問結果
        const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
          ? `/customerInquiries/${simpleDialog.value.id}`
          : `/customerInquiries/public/${simpleDialog.value.id}`

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

        const { data: updateResponse } = await apiAuth.patch(endpoint, updateData)

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
        // 如果項目不存在 progressNotes，創建一個空陣列
        if (!tableItems.value[index].progressNotes) {
          tableItems.value[index].progressNotes = []
        }

        // 添加新的進度/備註到陣列開頭
        tableItems.value[index].progressNotes.unshift(response.data.result)

        // 更新最新進度/備註
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

      // 重新載入資料以確保顯示正確
      await performSearch()
    } else {
      createSnackbar({
        text: response.data.message || '新增進度/備註失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })

      // 如果新增失敗且是強制新增備註的情況，恢復原始詢問結果
      if (simpleDialog.value.requireNote) {
        const currentItem = tableItems.value.find(item => item._id === simpleDialog.value.id)
        if (currentItem) {
          currentItem.inquiryResult = simpleDialog.value.originalResult
        }
      }
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

// 在 script setup 部分添加登出處理函數
const handleLogout = () => {
  // 獲取公司名稱
  const companyName = availableCompanies.value.find(company => company._id === verifiedCompany.value)?.name || ''

  // 清除驗證資訊
  localStorage.removeItem('companyVerification')
  verifiedCompany.value = null
  searchCriteria.value.company = null

  // 重置提醒狀態
  reminderShown.value = {
    fiveMinutes: false,
    oneMinute: false
  }

  // 清空表格資料
  tableItems.value = []
  tableItemsLength.value = 0

  createSnackbar({
    text: `已登出「${companyName}」`,
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// 在 script setup 區域添加以下程式碼
const employeeManageDialog = ref({
  open: false
})

const selectedEmployees = ref([])
const allEmployees = ref([])
const isLoadingEmployees = ref(false)
const isSavingEmployees = ref(false)

// 過濾已選擇的業務
const filteredEmployees = computed(() => {
  return allEmployees.value.map(employee => ({
    ...employee,
    disabled: selectedEmployees.value.includes(employee._id)
  }))
})

// 修改 searchEmployees 函數
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
      // 將公司資訊添加到每個員工資料中
      allEmployees.value = data.result.map(emp => ({
        ...emp,
        nickname: emp.nickname || '',  // 修改這裡，沒有暱稱時為空字串
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

// 開啟業務管理對話框
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

// 關閉業務管理對話框
const closeEmployeeManageDialog = () => {
  employeeManageDialog.value.open = false
  selectedEmployees.value = []
  allEmployees.value = []
  tempSelectedEmployee.value = null
}

// 儲存業務設定
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

    // 檢查順序是否有變更
    const originalOrders = {}
    originalData.result.forEach(emp => {
      originalOrders[emp._id] = emp.order
    })

    const hasOrderChanges = selectedEmployeeDetails.value.some(emp => {
      const originalOrder = originalOrders[emp._id]
      return originalOrder !== undefined && emp.order !== originalOrder
    })

    console.log('檢查變更:', {
      移除的業務: employeesToRemove,
      新增的業務: employeesToAdd,
      順序變更: hasOrderChanges,
      原始順序: originalOrders,
      目前順序: selectedEmployeeDetails.value.map(emp => ({ id: emp._id, order: emp.order }))
    })

    // 檢查是否有任何變更
    if (employeesToRemove.length === 0 && employeesToAdd.length === 0 && !hasOrderChanges) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    let hasError = false

    // 如果有需要移除的業務，先將它們的 showInB2C 設為 false
    if (employeesToRemove.length > 0) {
      try {
        await apiAuth.post('/employees/batch-update-b2c', {
          employeeIds: employeesToRemove,
          showInB2C: false
        })
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
      } catch (error) {
        if (error?.response?.data?.message !== '資料未做任何變更') {
          hasError = true
          throw error
        }
      }
    }

    // 保存員工順序到 localStorage
    const orderMap = {}
    selectedEmployeeDetails.value.forEach(emp => {
      orderMap[emp._id] = emp.order
    })
    localStorage.setItem('b2c_employee_order', JSON.stringify(orderMap))
    console.log('保存到 localStorage 的排序:', orderMap)

    // 更新所有業務的順序（如果後端支援）
    if (selectedEmployees.value.length > 0) {
      try {
        await apiAuth.post('/employees/batch-update-order', {
          updates: selectedEmployeeDetails.value.map(emp => ({
            id: emp._id,
            order: emp.order
          }))
        })
        console.log('已向後端更新業務順序')
      } catch (error) {
        hasError = true
        throw error
      }
    }

    // 只有當所有操作都成功時才顯示成功訊息
    if (!hasError) {
      createSnackbar({
        text: '業務設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEmployeeManageDialog()
      // 重新載入業務列表
      await loadSearchSalesPersons()
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

// 在 script setup 部分添加
const selectedEmployeeDetails = ref([])

const tempSelectedEmployee = ref(null)

const addSelectedEmployee = async (employeeId) => {
  if (employeeId && !selectedEmployees.value.includes(employeeId)) {
    // 獲取完整的員工資料，包括公司資訊
    const employee = allEmployees.value.find(emp => emp._id === employeeId)
    if (employee) {
      // 找出同公司的最大 order
      const sameCompanyEmployees = selectedEmployeeDetails.value.filter(
        emp => (emp.company?.name || '未分類') === (employee.company?.name || '未分類')
      )
      const maxOrder = sameCompanyEmployees.length > 0
        ? Math.max(...sameCompanyEmployees.map(emp => emp.order || 0))
        : -1

      selectedEmployees.value.push(employeeId)
      selectedEmployeeDetails.value.push({
        ...employee,
        nickname: employee.nickname || '',
        lineID: employee.lineID || '',
        order: maxOrder + 1
      })
    }
  }
  // 清空臨時選擇的員工，以便下次選擇
  tempSelectedEmployee.value = null
}

const removeSelectedEmployee = (employeeId) => {
  selectedEmployees.value = selectedEmployees.value.filter(id => id !== employeeId)
  selectedEmployeeDetails.value = selectedEmployeeDetails.value.filter(emp => emp._id !== employeeId)
}

// 在 script setup 區域中，移除重複宣告的函數，只保留一個版本
const updatingSalesPersons = ref(new Set())
const updatingInquiryResults = ref(new Set())

const updateSalesPerson = async (id, salesPersonId) => {
  try {
    // 找到當前項目
    const currentItem = tableItems.value.find(item => item._id === id)

    // 檢查是否選擇相同的業務
    if (currentItem.salesPerson?._id === salesPersonId) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 檢查選擇的業務是否屬於該公司
    const companySalesPersons = companySalesPersonsMap.value.get(currentItem.company._id) || []
    if (!companySalesPersons.some(sp => sp._id === salesPersonId)) {
      createSnackbar({
        text: '無法選擇其他公司的業務',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    updatingSalesPersons.value.add(id)

    const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
      ? `/customerInquiries/${id}`
      : `/customerInquiries/public/${id}`

    // 保留所有原有的資料
    const updateData = {
      salesPerson: salesPersonId,
      inquiryResult: currentItem.inquiryResult || null,
      customerTitle: currentItem.customerTitle || null,
      customerPhone: currentItem.customerPhone || null,
      customerLineId: currentItem.customerLineId || null,
      customerEmail: currentItem.customerEmail || null
    }

    const { data } = await apiAuth.patch(endpoint, updateData)
    if (data.success) {
      // 立即更新表格中的項目，但保留其他欄位不變
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
        text: '更新業務成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingSalesPersons.value.delete(id)
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

    const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
      ? `/customerInquiries/${id}`
      : `/customerInquiries/public/${id}`

    // 保留原有的進度/備註
    const updateData = {
      inquiryResult: result,
      salesPerson: currentItem.salesPerson?._id || null,
      customerTitle: currentItem.customerTitle || null  // 保留原有的稱謂
    }

    const { data } = await apiAuth.patch(endpoint, updateData)
    if (data.success) {
      // 立即更新表格中的項目，但保留其他欄位不變
      Object.assign(currentItem, {
        inquiryResult: result,
        customerTitle: currentItem.customerTitle  // 確保稱謂保持不變
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

// 業務輪流表對話框相關響應式變數
const salesRotationDialog = ref({
  open: false
})

const isLoadingSalesRotation = ref(false)
const companySalesPersons = ref([])

// 開啟業務輪流表對話框
const openSalesRotationDialog = async () => {
  salesRotationDialog.value.open = true
  isLoadingSalesRotation.value = true

  try {
    // 載入公司業務列表
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        showInB2C: true,
        employmentStatus: '在職',
        company: verifiedCompany.value // 添加公司過濾
      }
    })
    if (data.success) {
      // 過濾出屬於當前公司的業務
      companySalesPersons.value = data.result.filter(emp => emp.company._id === verifiedCompany.value)
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

// 計算屬性：按公司分組的已選擇業務
const groupedSelectedEmployees = computed(() => {
  // 先進行分組
  const grouped = {}
  selectedEmployeeDetails.value.forEach(employee => {
    const companyName = employee.company?.name || '未分類'
    if (!grouped[companyName]) {
      grouped[companyName] = []
    }
    // 創建全新的物件，避免計算屬性修改原始數據
    grouped[companyName].push({
      ...employee,
      order: typeof employee.order === 'number' ? employee.order : 9999
    })
  })

  // 對每個公司的員工按 order 排序
  Object.values(grouped).forEach(employees => {
    employees.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 9999
      const orderB = typeof b.order === 'number' ? b.order : 9999

      // 首先按 order 排序
      if (orderA !== orderB) {
        return orderA - orderB
      }

      // order 相同時，按名字排序
      return a.name.localeCompare(b.name)
    })
  })

  // 按 companyId 排序公司
  return Object.fromEntries(
    Object.entries(grouped)
      .sort(([, employeesA], [, employeesB]) => {
        const companyIdA = employeesA[0]?.company?.companyId || 'ZZZZ'
        const companyIdB = employeesB[0]?.company?.companyId || 'ZZZZ'
        return companyIdA.localeCompare(companyIdB)
      })
  )
})

// 添加移動員工順序的函數
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

  // 交換兩個員工的順序
  const employee1 = companyEmployees[index]
  const employee2 = companyEmployees[newIndex]

  console.log(`要交換的員工: ${employee1.name}(order=${employee1.order}) 和 ${employee2.name}(order=${employee2.order})`)

  // 在整個數組中找到這兩個員工的索引
  const allEmployees = [...selectedEmployeeDetails.value]
  const index1 = allEmployees.findIndex(e => e._id === employee1._id)
  const index2 = allEmployees.findIndex(e => e._id === employee2._id)

  console.log(`在全部員工中的索引: ${employee1.name}=${index1}, ${employee2.name}=${index2}`)

  if (index1 !== -1 && index2 !== -1) {
    // 交換順序值
    const tempOrder = allEmployees[index1].order
    allEmployees[index1].order = allEmployees[index2].order
    allEmployees[index2].order = tempOrder

    console.log(`交換後: ${employee1.name}(order=${allEmployees[index1].order}), ${employee2.name}(order=${allEmployees[index2].order})`)

    // 更新整個數組
    selectedEmployeeDetails.value = [...allEmployees]

    console.log('移動後的全部員工:')
    selectedEmployeeDetails.value
      .filter(emp => (emp.company?.name || '未分類') === companyName)
      .sort((a, b) => a.order - b.order)
      .forEach(emp => {
        console.log(`${emp.name}: order=${emp.order}`)
      })
  } else {
    console.log('找不到員工索引')
  }
}

// 匯出對話框相關響應式變數
const exportDialog = ref({
  open: false,
  type: 'all',
  company: null,  // 改為單一公司
  dateRange: null,
  sources: [],
  companyError: '',
  dateError: '',
  sourceError: ''
})

const isExporting = ref(false)

// 開啟匯出對話框
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

// 關閉匯出對話框
const closeExportDialog = () => {
  exportDialog.value.open = false
}

// 全選來源
const selectAllSources = () => {
  exportDialog.value.sourceError = ''
  if (exportDialog.value.sources.length === sourceOptions.length) {
    exportDialog.value.sources = []
  } else {
    exportDialog.value.sources = sourceOptions.map(source => source.value)
  }
}

// 處理匯出 Excel
const handleExportExcel = async () => {
  try {
    // 驗證
    let hasError = false
    exportDialog.value.companyError = ''
    exportDialog.value.dateError = ''
    exportDialog.value.sourceError = ''

    // 檢查公司選擇
    if (exportDialog.value.type === 'company' && !exportDialog.value.company) {
      exportDialog.value.companyError = '請選擇公司'
      hasError = true
    }

    // 檢查日期區間
    if (!exportDialog.value.dateRange || !Array.isArray(exportDialog.value.dateRange) || exportDialog.value.dateRange.length === 0) {
      exportDialog.value.dateError = '請選擇日期區間'
      hasError = true
    }

    // 檢查來源選擇
    if (!exportDialog.value.sources || exportDialog.value.sources.length === 0) {
      exportDialog.value.sourceError = '請選擇至少一個來源'
      hasError = true
    }

    if (hasError) return

    isExporting.value = true

    // 準備查詢參數
    const params = {}

    // 添加日期參數
    if (exportDialog.value.dateRange && Array.isArray(exportDialog.value.dateRange) && exportDialog.value.dateRange.length > 0) {
      const startDate = new Date(exportDialog.value.dateRange[0])
      const endDate = new Date(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      params.dateStart = startDate.toISOString()
      params.dateEnd = endDate.toISOString()
    }

    // 添加來源參數
    if (exportDialog.value.sources.length > 0) {
      params.sources = exportDialog.value.sources.join(',')
    }

    // 根據匯出類型處理公司參數
    if (exportDialog.value.type === 'company') {
      // 單一公司匯出
      params.companies = exportDialog.value.company
    } else {
      // 所有公司匯出 - 如果用戶已經選擇了公司（例如在搜尋條件中），則使用該公司
      if (searchCriteria.value.company) {
        params.companies = searchCriteria.value.company
      }
    }

    // 呼叫 API 取得資料
    const { data } = await apiAuth.get('/customerInquiries/export', { params })

    if (data.success) {
      // 載入 XLSX
      const XLSX = await loadXLSX()

      // 準備 Excel 資料
      const excelData = data.result.map(inquiry => {
        // 處理詢問內容中的 HTML 連結
        let inquiryContent = inquiry.inquiryContent || ''
        // 使用正則表達式將 HTML 連結轉換為純文字網址
        inquiryContent = inquiryContent.replace(/<a[^>]*href="([^"]*)"[^>]*>點擊<\/a>/g, '$1')

        return {
          '公司': inquiry.company?.name || '',
          '日期': formatExcelDate(inquiry.inquiryDate),
          '來源': inquiry.source || '',
          '地區': inquiry.inquiryPlace || '',
          '詢問內容': inquiryContent,
          '客戶姓名': inquiry.customerName || '',
          '稱謂': inquiry.customerTitle || '', // Add customerTitle to export
          '電話': inquiry.customerPhone || '',
          'Line ID': inquiry.customerLineId || '',
          'Email': inquiry.customerEmail || '',
          '業務': inquiry.salesPerson ? (inquiry.salesPerson.nickname || inquiry.salesPerson.name) : '',
          '詢問結果': inquiry.inquiryResult || '',
          '最新進度 / 備註': inquiry.progressNotes?.length > 0 ? inquiry.progressNotes[inquiry.progressNotes.length - 1].content : ''
        }
      })

      // 創建工作表
      const ws = XLSX.utils.json_to_sheet(excelData)

      // 設定欄寬
      const colWidths = {
        '公司': 15,
        '日期': 12,
        '來源': 12,
        '地區': 12,
        '詢問內容': 50,
        '客戶姓名': 15,
        '稱謂': 10, // Add width for customerTitle
        '電話': 15,
        'Line ID': 15,
        'Email': 30,
        '業務': 12,
        '詢問結果': 12,
        '最新進度 / 備註': 50
      }

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }))

      // 創建工作簿
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '直客詢問統計表')

      // 取得公司名稱
      let companyName = ''
      if (exportDialog.value.type === 'company') {
        const selectedCompany = companies.value.find(c => c._id === exportDialog.value.company)
        companyName = selectedCompany ? selectedCompany.name : ''
      }

      // 生成檔案並下載
      const fileName = exportDialog.value.type === 'all'
        ? `直客詢問統計表_${formatExcelDate(exportDialog.value.dateRange[0])}_${formatExcelDate(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])}.xlsx`
        : `直客詢問統計表_${companyName}_${formatExcelDate(exportDialog.value.dateRange[0])}_${formatExcelDate(exportDialog.value.dateRange[exportDialog.value.dateRange.length - 1])}.xlsx`

      XLSX.writeFile(wb, fileName)

      // 關閉對話框
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

// 在 script setup 區域的開頭添加 loadXLSX 函數
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

// 在 script setup 區域添加 formatExcelDate 函數
const formatExcelDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// Add new date/time formatting functions
const formatDatePart = (dateString) => {
  if (!dateString) return '';
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date part:', e);
    return '';
  }
}

const formatTimePart = (dateString) => {
  if (!dateString) return '';
  try {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 使用24小時制
    });
  } catch (e) {
    console.error('Error formatting time part:', e);
    return '';
  }
}

// 添加一個 Map 來存儲每個公司的業務列表
const companySalesPersonsMap = ref(new Map())
const searchSalesPersons = ref([]) // 用於搜尋區塊的業務列表
const dialogSalesPersons = ref([]) // 用於對話框的業務列表

// 監聽表格資料變化，預先載入每個公司的業務列表
watch(() => tableItems.value, async (items) => {
  if (!items) return

  // 獲取所有不重複的公司 ID
  const companyIds = new Set(items.map(item => item.company._id))

  // 載入每個公司的業務列表
  for (const companyId of companyIds) {
    if (!companySalesPersonsMap.value.has(companyId)) {
      await getCompanySalesPersons(companyId)
    }
  }
}, { immediate: true })

// 監聽對話框中的公司選擇變更
watch(() => company.value.value, async (newVal) => {
  // 清空業務選擇
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

const handleSalesPersonChange = (value) => {
  if (!value && searchCriteria.value.company) {
    searchCriteria.value.salesPerson = null;
  }
};

// 監聽公司選擇的變化
watch(() => searchCriteria.value.company, (newVal) => {
  if (!newVal) {
    searchCriteria.value.salesPerson = null;
  }
});

// 添加一個新的計算屬性來獲取業務的序號
const getSalesPersonIndex = (salesPerson) => {
  if (!salesPerson || typeof salesPerson.order !== 'number') return ''
  return `${salesPerson.order + 1}.`
}

// 在 script setup 區域添加複製函數
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

// 監聽詢問結果變化
watch(() => inquiryResult.value.value, (newVal) => {
  // 只有在非管理者/管理員/一般用戶的情況下才顯示提示
  if (!user.isLogin && (!user.isManager && !user.isAdmin && !user.isUser)) {
    if (newVal === '不成交' || newVal === '其他') {
      // 如果進度/備註為空，顯示提示
      if (!progressAndNote.value.value) {
        createSnackbar({
          text: '當詢問結果為不成交或其他時，請填寫進度/備註',
          snackbarProps: { color: 'warning' }
        })
      }
    }
  }
})

// 添加更新稱謂的函數
const updatingCustomerTitles = ref(new Set())

const updateCustomerTitle = async (id, title) => {
  try {
    // 找到當前項目
    const currentItem = tableItems.value.find(item => item._id === id)

    // 檢查是否選擇相同的稱謂
    if (currentItem.customerTitle === title) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    updatingCustomerTitles.value.add(id)

    const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
      ? `/customerInquiries/${id}`
      : `/customerInquiries/public/${id}`

    const { data } = await apiAuth.patch(endpoint, {
      customerTitle: title,
      progressAndNote: currentItem.progressAndNote || '',  // 保留原有的進度/備註
      inquiryResult: currentItem.inquiryResult || '',      // 保留原有的詢問結果
      salesPerson: currentItem.salesPerson?._id || null    // 保留原有的業務
    })

    if (data.success) {
      // 立即更新表格中的項目
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

// 獲取當前項目的進度/備註
const getCurrentItemProgressNotes = computed(() => {
  const item = tableItems.value.find(i => i._id === simpleDialog.value.id)
  return item?.progressNotes || []
})

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

// 在 script setup 區域添加
const autoLogoutTimer = ref(null)

// 在 script setup 區域添加以下程式碼
const progressNoteError = computed(() => {
  if (simpleDialog.value.requireNote && (!progressNoteInput.value || !progressNoteInput.value.trim())) {
    return '更改詢問結果為"不成交"或是"其他"時，請新增一筆進度/備註紀錄說明原因'
  }
  return ''
})

// 在 script setup 區域添加以下程式碼
const remainingTime = ref(0)
const formattedRemainingTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 更新倒數計時
const updateRemainingTime = () => {
  const verificationData = localStorage.getItem('companyVerification')
  if (!verificationData) {
    remainingTime.value = 0
    return
  }

  const { timestamp } = JSON.parse(verificationData)
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

// 添加定時器
let countdownTimer = null

onMounted(() => {
  // 重置提醒狀態
  reminderShown.value = {
    fiveMinutes: false,
    oneMinute: false
  }

  // 初始化倒數計時
  updateRemainingTime()
  countdownTimer = setInterval(() => {
    updateRemainingTime()
  }, 1000)
})

onUnmounted(() => {
  if (autoLogoutTimer.value) {
    clearInterval(autoLogoutTimer.value)
  }
  // 清除倒數計時器
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

// 監聽驗證狀態變化
watch(() => verifiedCompany.value, (newVal) => {
  if (newVal) {
    updateRemainingTime()
  } else {
    remainingTime.value = 0
  }
})

// 添加本月按鈕的函數
const setCurrentMonth = () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  searchCriteria.value.dateRange = [startOfMonth, endOfMonth]
  performSearch()
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

.clock-container {
  border: 1px solid #E65100;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 8px;
}

</style>

<route lang="yaml">
  meta:
    layout: B2CStatistics
</route>

