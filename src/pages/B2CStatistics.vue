<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 搜尋條件區塊 -->
    <v-row class="pt-md-5 px-2 px-xl-2 px-xxl-0">
      <v-col cols="12">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="mt-1 px-lg-5 px-xl-16 px-xxl-0"
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
                          來源 :
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
                        <div class="d-flex align-center">
                          業務 :
                          <v-autocomplete
                            v-model="searchCriteria.salesPerson"
                            class="ms-4"
                            :items="searchSalesPersons"
                            :item-title="item => item ? `${item.name} ( ${item.nickname ? item.nickname + ' ' : ''} ${item.employeeCode} )` : ''"
                            item-value="_id"
                            variant="outlined"
                            density="compact"
                            placeholder="請選擇業務"
                            :hide-details="!!searchCriteria.company"
                            clearable
                            :disabled="!searchCriteria.company"
                            :messages="!searchCriteria.company ? ['請先選擇公司'] : []"
                          />
                        </div>
                      </v-col>

                      <!-- 日期區間 -->
                      <v-col
                        cols="2"
                        class="pe-1"
                      >
                        <div class="d-flex align-center">
                          日期 :
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
                          地區 :
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
                          結果 :
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
                          來源 :
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
                          業務 :
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
                          日期 :
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
                          地區 :
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
                          結果 :
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
                  <v-divider class="mt-4 mb-2" />
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
                            <td>{{ formatDate(item.inquiryDate) }}</td>
                            <td>{{ item.source }}</td>
                            <td>{{ item.inquiryPlace }}</td>
                            <td>
                              <div
                                class="white-space-pre-wrap"
                                v-html="formatInquiryContent(item.inquiryContent)"
                              />
                            </td>
                            <td>{{ item.customerName }}</td>
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
                                    :disabled="!user.isLogin && !verifiedCompany"
                                  >
                                    {{ item.salesPerson.nickname || item.salesPerson.name }}
                                  </v-btn>
                                  <v-btn
                                    v-else
                                    v-bind="props"
                                    color="grey"
                                    variant="outlined"
                                    class="px-2"
                                    size="small"
                                    :loading="updatingSalesPersons.has(item._id)"
                                    :disabled="!user.isLogin && !verifiedCompany"
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
                                    <v-list-item-title>{{ person.nickname || person.name }} ({{ person.employeeCode }})</v-list-item-title>
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
                                    class="px-2"
                                    size="small"
                                    :loading="updatingInquiryResults.has(item._id)"
                                    :disabled="!user.isLogin && !verifiedCompany"
                                  >
                                    {{ item.inquiryResult }}
                                  </v-btn>
                                  <v-btn
                                    v-else
                                    v-bind="props"
                                    color="grey"
                                    variant="outlined"
                                    class="px-2"
                                    size="small"
                                    :loading="updatingInquiryResults.has(item._id)"
                                    :disabled="!user.isLogin && !verifiedCompany"
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
                              <div class="white-space-pre-wrap">
                                {{ item.progressAndNote }}
                              </div>
                            </td>
                            <td>
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
                sm="3"
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

              <!-- 客戶電話 -->
              <v-col
                cols="12"
                sm="3"
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
                sm="3"
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
                sm="3"
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
              <v-col cols="4">
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
              <v-col cols="4">
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
              </v-col>

              <!-- 進度 -->
              <v-col cols="4">
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
              </v-col>
            </v-row>

            <v-card-actions class="px-3 mt-4">
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
      max-width="480"
    >
      <v-card class="rounded-lg px-4 py-4">
        <div class="card-title px-4 py-3">
          編輯詢問資料
        </div>
        <v-card-text class="mt-3 pa-3">
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

          <!-- 簡化表單內容 -->
          <v-form
            v-else
            @submit.prevent="submitSimpleInquiry"
          >
            <v-row>
              <!-- 業務選擇 -->
              <v-col cols="12">
                <v-autocomplete
                  v-model="simpleSalesPerson.value.value"
                  :error-messages="simpleSalesPerson.errorMessage.value"
                  :items="searchSalesPersons"
                  :item-title="item => item ? `${item.name} (${item.nickname ? item.nickname + ' ' : ''}${item.employeeCode})` : ''"
                  item-value="_id"
                  label="業務"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>

              <!-- 詢問結果 -->
              <v-col cols="12">
                <v-select
                  v-model="simpleInquiryResult.value.value"
                  :error-messages="simpleInquiryResult.errorMessage.value"
                  :items="inquiryResultOptions"
                  item-title="text"
                  item-value="value"
                  label="詢問結果"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>

              <!-- 進度 / 備註 -->
              <v-col cols="12">
                <v-textarea
                  v-model="simpleProgressAndNote.value.value"
                  :error-messages="simpleProgressAndNote.errorMessage.value"
                  label="進度 / 備註"
                  variant="outlined"
                  density="compact"
                  hide-details
                  auto-grow
                  rows="8"
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-0 mt-4 pb-0">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                @click="closeSimpleDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                class="ms-2"
                :loading="isSimpleSubmitting"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
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
      max-width="1300"
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
          <div class="mt-8">
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
                  width="238"
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useUserStore } from '@/stores/user'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
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
const VERIFICATION_EXPIRY_HOURS = 10 // 驗證有效期限（小時）

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const { smAndUp, mdAndUp } = useDisplay()

// 響應式變數
const dialogWidth = computed(() => mdAndUp.value ? '1400' : '100%')
const isSearching = ref(false)

// 表格相關
const tableHeaders = [
  { title: '公司', key: 'company.name', align: 'start', sortable: true },
  { title: '日期', key: 'inquiryDate', align: 'start', sortable: true },
  { title: '來源', key: 'source', width: '84px', align: 'start', sortable: true },
  { title: '地區', key: 'inquiryPlace', width: '84px', align: 'start', sortable: true },
  { title: '詢問內容', key: 'inquiryContent', width: '280px', align: 'start', sortable: true },
  { title: '客戶姓名', key: 'customerName', align: 'start', sortable: true },
  { title: '電話', key: 'customerPhone', align: 'start', sortable: true },
  { title: 'Line ID', key: 'customerLineId', align: 'start', sortable: true },
  { title: 'Email', key: 'customerEmail', align: 'start', sortable: true },
  { title: '業務', key: 'salesPerson.name', align: 'start', sortable: true },
  { title: '詢問結果', key: 'inquiryResult', width: '110px', align: 'start', sortable: true },
  { title: '進度 / 備註', key: 'progressAndNote', width: '180px', align: 'start', sortable: true },
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
  { text: '參團', value: '參團' },
  { text: '不參團', value: '不參團' },
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

  // 如果不是管理者、管理員或一般用戶，移除公司欄位
  if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
    headers = headers.filter(header => header.key !== 'company.name')
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
  id: null
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

    // 如果驗證資料已過期，才刪除
    if (now > expiryTime) {
      localStorage.removeItem('companyVerification')
      tempSelectedCompany.value = newVal
      searchCriteria.value.company = null
      isPasswordDialogOpen.value = true
      return
    }

    // 如果選擇的公司與驗證的公司不同，顯示密碼對話框
    if (companyId !== newVal) {
      // 儲存新選擇的公司
      tempSelectedCompany.value = newVal
      // 恢復選擇為舊公司
      searchCriteria.value.company = companyId
      isPasswordDialogOpen.value = true
    } else {
      // 如果是同一家公司，重新載入業務列表並執行搜尋
      await loadSearchSalesPersons()
      performSearch()
    }
  } else {
    // 有身份的人選擇公司時，也要重新載入業務列表
    if (newVal) {
      searchCriteria.value.salesPerson = null // 清空已選擇的業務
      await loadSearchSalesPersons()
    } else {
      searchSalesPersons.value = [] // 如果沒有選擇公司，清空業務列表
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
      // 儲存驗證資訊到 localStorage
      localStorage.setItem('companyVerification', JSON.stringify({
        companyId: tempSelectedCompany.value,
        timestamp: new Date().getTime()
      }))

      verifiedCompany.value = tempSelectedCompany.value
      searchCriteria.value.company = tempSelectedCompany.value
      isPasswordDialogOpen.value = false
      companyPassword.value = ''
      createSnackbar({
        text: '密碼驗證成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 驗證成功後重新載入業務列表
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

// 修改 performSearch 函數
const performSearch = async () => {
  // 檢查未登入用戶是否有選擇公司
  if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
    const verificationData = localStorage.getItem('companyVerification')
    if (!verificationData) {
      tableItems.value = []
      tableItemsLength.value = 0
      isSearching.value = false
      return
    }

    const { companyId, timestamp } = JSON.parse(verificationData)
    const now = new Date().getTime()
    const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

    if (now > expiryTime) {
      localStorage.removeItem('companyVerification')
      tableItems.value = []
      tableItemsLength.value = 0
      isSearching.value = false
      return
    }

    // 如果驗證資料存在且有效，設定公司 ID
    if (!searchCriteria.value.company) {
      searchCriteria.value.company = companyId
      verifiedCompany.value = companyId
    }
  }

  try {
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
  try {
    tableLoading.value = true
    await Promise.all([
      loadCompanies(),
      loadSearchSalesPersons(),
      loadAvailableCompanies(),
      loadPlaceOptions() // 添加載入地區選項
    ])

    // 檢查驗證狀態
    if (!user.isLogin || (!user.isManager && !user.isAdmin && !user.isUser)) {
      const verificationData = localStorage.getItem('companyVerification')
      if (verificationData) {
        const { companyId, timestamp } = JSON.parse(verificationData)
        const now = new Date().getTime()
        const expiryTime = timestamp + (VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000)

        if (now <= expiryTime) {
          // 驗證資料有效，設定公司並執行搜尋
          searchCriteria.value.company = companyId
          verifiedCompany.value = companyId
          await performSearch()
        } else {
          // 驗證資料已過期，清除資料
          localStorage.removeItem('companyVerification')
          verifiedCompany.value = null
        }
      }
    } else {
      // 管理者、管理員或一般用戶直接執行搜尋，不需要設定公司
      searchCriteria.value.company = null
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
  dialog.value.open = false
  dialog.value.id = null
  isDialogLoading.value = false
  resetForm()
}

// 提交表單
const submitInquiry = handleSubmit(async (values) => {
  try {
    // 處理空字串轉為 null
    const processedValues = {
      ...values,
      salesPerson: values.salesPerson || null
    }

    if (dialog.value.id) {
      // 編輯模式 - 檢查資料是否有變更
      const hasChanges = JSON.stringify({
        company: processedValues.company,
        salesPerson: processedValues.salesPerson,
        inquiryDate: processedValues.inquiryDate,
        source: processedValues.source,
        inquiryPlace: processedValues.inquiryPlace || '',
        inquiryContent: processedValues.inquiryContent || '',
        customerName: processedValues.customerName || '',
        customerPhone: processedValues.customerPhone || '',
        customerLineId: processedValues.customerLineId || '',
        customerEmail: processedValues.customerEmail || '',
        progressAndNote: processedValues.progressAndNote || '',
        inquiryResult: processedValues.inquiryResult || ''
      }) !== JSON.stringify({
        company: tableItems.value.find(item => item._id === dialog.value.id)?.company?._id || '',
        salesPerson: tableItems.value.find(item => item._id === dialog.value.id)?.salesPerson?._id || null,
        inquiryDate: tableItems.value.find(item => item._id === dialog.value.id)?.inquiryDate || null,
        source: tableItems.value.find(item => item._id === dialog.value.id)?.source || '',
        inquiryPlace: tableItems.value.find(item => item._id === dialog.value.id)?.inquiryPlace || '',
        inquiryContent: tableItems.value.find(item => item._id === dialog.value.id)?.inquiryContent || '',
        customerName: tableItems.value.find(item => item._id === dialog.value.id)?.customerName || '',
        customerPhone: tableItems.value.find(item => item._id === dialog.value.id)?.customerPhone || '',
        customerLineId: tableItems.value.find(item => item._id === dialog.value.id)?.customerLineId || '',
        customerEmail: tableItems.value.find(item => item._id === dialog.value.id)?.customerEmail || '',
        progressAndNote: tableItems.value.find(item => item._id === dialog.value.id)?.progressAndNote || '',
        inquiryResult: tableItems.value.find(item => item._id === dialog.value.id)?.inquiryResult || ''
      })

      if (!hasChanges) {
        createSnackbar({
          text: '資料未做任何變更',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }

      // 編輯
      const { data } = await apiAuth.patch(`/customerInquiries/${dialog.value.id}`, processedValues)
      if (data.success) {
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
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

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
  const buttonHtml = ` <a href="${urlInput.value}" target="_blank" class="url-button">點擊</a>`
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

// 簡化版對話框相關響應式變數
const simpleDialog = ref({
  open: false,
  id: null
})

// 簡化版表單驗證架構
const simpleInquirySchema = yup.object({
  progressAndNote: yup
    .string()
    .nullable(),
  inquiryResult: yup
    .string()
    .nullable(),
  salesPerson: yup
    .string()
    .nullable()
    .transform((value) => value || null)
})

// 初始化簡化版表單
const { handleSubmit: handleSimpleSubmit, isSubmitting: isSimpleSubmitting, resetForm: resetSimpleForm } = useForm({
  validationSchema: simpleInquirySchema,
  initialValues: {
    progressAndNote: '',
    inquiryResult: '',
    salesPerson: ''
  }
})

// 定義簡化版表單欄位
const simpleProgressAndNote = useField('progressAndNote')
const simpleInquiryResult = useField('inquiryResult')
const simpleSalesPerson = useField('salesPerson')

// 開啟簡化版對話框
const openSimpleDialog = async (item) => {
  simpleDialog.value.open = true
  simpleDialog.value.id = item?._id || null
  isDialogLoading.value = true

  try {
    if (item) {
      // 編輯模式
      simpleProgressAndNote.value.value = item.progressAndNote || ''
      simpleInquiryResult.value.value = item.inquiryResult || ''
      simpleSalesPerson.value.value = item.salesPerson?._id || ''

      // 如果是一般身分，重新載入該公司的業務列表
      if (!user.isLogin && verifiedCompany.value) {
        await loadSearchSalesPersons()
      }
    } else {
      // 新增模式
      resetSimpleForm()
    }
  } catch (error) {
    console.error('載入詢問資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入詢問資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeSimpleDialog()
  } finally {
    isDialogLoading.value = false
  }
}

// 關閉簡化版對話框
const closeSimpleDialog = () => {
  simpleDialog.value.open = false
  simpleDialog.value.id = null
  isDialogLoading.value = false
  resetSimpleForm()
}

// 提交簡化版表單
const submitSimpleInquiry = handleSimpleSubmit(async (values) => {
  try {
    // 處理空字串轉為 null
    const processedValues = {
      progressAndNote: values.progressAndNote || null,
      inquiryResult: values.inquiryResult || null,
      salesPerson: values.salesPerson || null
    }

    if (simpleDialog.value.id) {
      // 檢查資料是否有變更
      const hasChanges = JSON.stringify({
        salesPerson: processedValues.salesPerson,
        progressAndNote: processedValues.progressAndNote || '',
        inquiryResult: processedValues.inquiryResult || ''
      }) !== JSON.stringify({
        salesPerson: tableItems.value.find(item => item._id === simpleDialog.value.id)?.salesPerson?._id || null,
        progressAndNote: tableItems.value.find(item => item._id === simpleDialog.value.id)?.progressAndNote || '',
        inquiryResult: tableItems.value.find(item => item._id === simpleDialog.value.id)?.inquiryResult || ''
      })

      if (!hasChanges) {
        createSnackbar({
          text: '資料未做任何變更',
          snackbarProps: { color: 'red-lighten-1' }
        })
        return
      }

      // 根據用戶身份選擇不同的 API endpoint
      const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
        ? `/customerInquiries/${simpleDialog.value.id}`
        : `/customerInquiries/public/${simpleDialog.value.id}`

      // 編輯
      const { data } = await apiAuth.patch(endpoint, processedValues)
      if (data.success) {
        await performSearch()
        closeSimpleDialog()
        createSnackbar({
          text: '詢問資料更新成功',
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

// 在 script setup 部分添加登出處理函數
const handleLogout = () => {
  // 獲取公司名稱
  const companyName = availableCompanies.value.find(company => company._id === verifiedCompany.value)?.name || ''

  // 清除驗證資訊
  localStorage.removeItem('companyVerification')
  verifiedCompany.value = null
  searchCriteria.value.company = null

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

    const { data } = await apiAuth.patch(endpoint, {
      salesPerson: salesPersonId,
      inquiryResult: currentItem.inquiryResult || null // 保持原有的詢問結果
    })
    if (data.success) {
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
    case '參團':
      return 'teal-lighten-1'
    case '不參團':
      return 'red-lighten-1'
    case '其他':
      return 'grey-darken-1'
    default:
      return 'grey-lighten-2'
  }
}

const updateInquiryResult = async (id, result) => {
  try {
    // 找到當前項目
    const currentItem = tableItems.value.find(item => item._id === id)

    // 檢查資料是否有變更
    if (currentItem.inquiryResult === result) {
      createSnackbar({
        text: '資料未做任何變更',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    updatingInquiryResults.value.add(id)

    const endpoint = user.isLogin && (user.isManager || user.isAdmin || user.isUser)
      ? `/customerInquiries/${id}`
      : `/customerInquiries/public/${id}`

    const { data } = await apiAuth.patch(endpoint, {
      inquiryResult: result,
      salesPerson: currentItem.salesPerson?._id || null // 保持原有的業務
    })
    if (data.success) {
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
          '電話': inquiry.customerPhone || '',
          'Line ID': inquiry.customerLineId || '',
          'Email': inquiry.customerEmail || '',
          '業務': inquiry.salesPerson ? (inquiry.salesPerson.nickname || inquiry.salesPerson.name) : '',
          '詢問結果': inquiry.inquiryResult || '',
          '進度 / 備註': inquiry.progressAndNote || ''
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
        '電話': 15,
        'Line ID': 15,
        'Email': 30,
        '業務': 12,
        '詢問結果': 12,
        '進度 / 備註': 50
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
  return `${year}${month}${day}`
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

</script>

<style lang="scss" scoped>
.white-space-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 300px;
  line-height: 1.5;
}

:deep(.v-data-table) {
  thead {
    height: 48px;
    background-color: #455a64 !important;
    color: #fff !important;
  }
  tbody tr {
    height: auto;
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
  a {
    padding: 1px 4px;
    background: #5C6BC0;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: #ffffff;
    text-decoration: none;
    font-size: 12px;
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
</style>

<route lang="yaml">
  meta:
    layout: B2CStatistics
</route>
