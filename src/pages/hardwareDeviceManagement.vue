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
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="mt-1 px-lg-5"
              >
                <v-card class="elevation-4 rounded-lg py-6 px-4 px-sm-2 px-xl-4">
                  <v-card-title class="font-weight-bold d-flex align-center mb-2">
                    搜尋條件
                  </v-card-title>
                  <v-card-text class="pa-2">
                    <v-row>
                      <!-- 硬體類型選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        lg="12"
                      >
                        <v-select
                          v-model="searchCriteria.type"
                          :items="hardwareTypes"
                          :item-title="item => item ? item.name : ''"
                          item-value="_id"
                          label="硬體類型"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                        />
                      </v-col>

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
                          @update:model-value="handleSearchCompanyChange"
                        />
                      </v-col>

                      <!-- 地點選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        lg="12"
                      >
                        <v-select
                          v-model="searchCriteria.location"
                          :items="searchLocations"
                          :item-title="item => item ? item.locationName : ''"
                          item-value="_id"
                          label="地點"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          :disabled="!searchCriteria.company"
                        />
                      </v-col>

                      <!-- 庫存狀態 -->
                      <v-col
                        cols="12"
                        sm="6"
                        lg="12"
                      >
                        <v-select
                          v-model="searchCriteria.stockStatus"
                          :items="stockStatusOptions"
                          label="庫存狀態"
                          item-title="title"
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                        />
                      </v-col>

                      <!-- 報帳狀態 -->
                      <v-col
                        cols="12"
                        sm="6"
                        lg="12"
                      >
                        <v-select
                          v-model="searchCriteria.expenseStatus"
                          :items="expenseStatusOptions"
                          label="報帳狀態"
                          item-title="title"
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                        />
                      </v-col>

                      <!-- 使用者選擇 -->
                      <v-col
                        cols="12"
                        sm="6"
                        lg="12"
                      >
                        <v-autocomplete
                          v-model="searchCriteria.user"
                          v-model:search-input="employeeSearch"
                          :items="searchEmployees"
                          :loading="isSearchEmployeesLoading"
                          label="使用者"
                          return-object
                          :item-props="item => ({
                            key: item._id,
                            title: formatEmployeeDisplay(item),
                            value: item._id
                          })"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          @update:search="handleEmployeeSearch"
                          @click:clear="clearEmployeeSearch"
                          @click:input="loadAllEmployees"
                        >
                          <template #selection="{ item }">
                            {{ formatEmployeeDisplay(searchEmployees.find(emp => emp._id === item.value)) }}
                          </template>
                          <template
                            v-if="smAndUp"
                            #append-inner
                          >
                            <v-tooltip
                              location="top"
                              close-delay="200"
                            >
                              <template #activator="{ props }">
                                <v-icon
                                  v-bind="props"
                                  icon="mdi-information"
                                  size="18"
                                />
                              </template>
                              輸入系統員工編號或姓名查詢
                            </v-tooltip>
                          </template>
                        </v-autocomplete>
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
                          item-title="title"
                          item-value="value"
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
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="px-5"
              >
                <v-card
                  class="elevation-4 rounded-lg py-5 px-4 px-sm-2 px-xl-4"
                >
                  <v-card-title class="font-weight-bold d-flex justify-space-between mb-2">
                    <span>匯入 / 匯出 Excel</span>
                    <v-btn
                      v-tooltip:start="'下載範例檔案'"
                      icon
                      variant="text"
                      color="blue-grey-darken-2"
                      size="28"
                      @click="downloadExampleFile"
                    >
                      <v-icon size="20">
                        mdi-download-box-outline
                      </v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-card-text class="pa-2">
                    <v-row>
                      <v-col
                        cols="6"
                      >
                        <v-btn
                          prepend-icon="mdi-file-import"
                          color="light-blue-darken-2"
                          block
                          class="me-4"
                          @click="openImportDialog"
                        >
                          匯入
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="6"
                      >
                        <v-btn
                          prepend-icon="mdi-file-export"
                          color="deep-orange-darken-1"
                          block
                          @click="openExportDialog"
                        >
                          匯出
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>

      <!-- 右側表格區塊 -->
      <v-col
        cols="12"
        lg="10"
        class="px-6 ps-lg-4 pe-lg-8 mb-6"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-4 px-md-6 mt-1 bg-white">
          <!-- 標題和功能按鈕區 -->
          <v-col
            cols="12"
            class="ps-4 pb-sm-4"
          >
            <v-row>
              <v-col>
                <h3>
                  硬體設備管理
                </h3>
              </v-col>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-row class="d-flex justify-space-between">
                  <v-col cols="4">
                    <v-btn
                      prepend-icon="mdi-laptop"
                      variant="outlined"
                      color="blue-grey-darken-1"
                      class="me-4"
                      @click="openDialog(null)"
                    >
                      新增設備
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="3"
                    xl="2"
                    class="d-flex align-center"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋裝置名稱、登入名稱、序號、MAC、IP、Office 2021 帳號、Office 365 帳號、備註'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-text-field
                      v-model="quickSearchText"
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
              hover
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.type?.name }}</td>
                  <td>
                    <div v-if="item.company?.name">
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
                            {{ item.company?.name }}
                          </div>
                        </template>
                        <v-card
                          class="rounded-lg pa-0 status-card"
                          elevation="3"
                        >
                          <v-card-text class="pa-0">
                            <div class="d-flex align-center ps-3 pe-4 py-2 bg-light-blue-darken-2 text-white">
                              <v-icon
                                size="16"
                                class="me-2"
                                color="white"
                              >
                                mdi-map-marker
                              </v-icon>
                              <span>地點：{{ item.location?.locationName || '無' }}</span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </div>
                  </td>
                  <td>{{ item.serialNumber }}</td>
                  <td>{{ item.deviceName }}</td>
                  <td>{{ item.loginName }}</td>
                  <td>{{ formatDate(item.purchaseDate) }}</td>
                  <td>
                    <div v-if="item.office2021Account">
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
                            {{ item.office2021Account }}
                          </div>
                        </template>
                        <v-card
                          min-width="200"
                          class="rounded-lg pa-0 status-card"
                          elevation="3"
                        >
                          <v-card-text class="pa-0">
                            <div class="d-flex align-center px-3 py-2 bg-light-blue-darken-2 text-white">
                              <v-icon
                                size="16"
                                class="me-2"
                                color="white"
                              >
                                mdi-calendar
                              </v-icon>
                              <span>安裝日期：{{ formatDate(item.office2021InstallDate) || '無' }}</span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </div>
                  </td>
                  <td>{{ item.office365Account }}</td>
                  <td>
                    <div
                      v-if="item.user"
                      class="status-cell d-flex align-center"
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
                            class="d-flex align-center status-cell pe-4"
                          >
                            {{ item.user.name }}
                          </div>
                        </template>
                        <v-card
                          min-width="130"
                          class="rounded-lg pa-0 status-card"
                          elevation="3"
                        >
                          <v-card-text class="pa-0">
                            <div class="d-flex align-center px-3 py-2 bg-light-blue-darken-1 text-white">
                              <v-icon
                                size="16"
                                class="me-2"
                                color="white"
                              >
                                mdi-phone
                              </v-icon>
                              <span>分機號碼：{{ item.user.extNumber || '無' }}</span>
                            </div>
                            <div class="d-flex align-center px-3 py-2 bg-light-blue-darken-3 text-white">
                              <v-icon
                                size="16"
                                class="me-2"
                                color="white"
                              >
                                mdi-printer
                              </v-icon>
                              <span>列印編號：{{ item.user.printNumber || '無' }}</span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </div>
                  </td>
                  <td>
                    <v-chip
                      size="small"
                      variant="outlined"
                      :color="item.stockStatus ? 'info' : 'grey'"
                    >
                      {{ item.stockStatus ? '未出貨' : '已出貨' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-menu
                      v-if="item.expenseStatus"
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
                          <v-chip
                            size="small"
                            variant="outlined"
                            :color="item.expenseStatus ? 'teal-lighten-1' : 'red-lighten-1'"
                          >
                            {{ item.expenseStatus ? '已報帳' : '未報帳' }}
                          </v-chip>
                        </div>
                      </template>
                      <v-card
                        min-width="200"
                        class="rounded-lg pa-0 status-card"
                        elevation="3"
                      >
                        <v-card-text class="pa-0">
                          <div class="d-flex align-center px-3 py-2 bg-teal-lighten-1 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-office-building
                            </v-icon>
                            <span>報帳對象：{{ item.expenseObject?.name || '無' }}</span>
                          </div>
                          <div class="d-flex align-center px-3 py-2 bg-teal-darken-1 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-calendar
                            </v-icon>
                            <span>報帳日期：{{ formatDate(item.expenseDate) || '無' }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-menu>
                    <v-chip
                      v-else
                      size="small"
                      variant="outlined"
                      color="red-lighten-1"
                    >
                      未報帳
                    </v-chip>
                  </td>
                  <td v-if="xlAndUp">
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
                  </td>
                  <td class="text-center">
                    <div class="d-flex align-center justify-center">
                      <v-btn
                        icon
                        class="me-1"
                        color="light-blue-darken-4"
                        variant="plain"
                        size="24"
                        :ripple="false"
                        @click="openDialog(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        v-tooltip="'複製'"
                        icon
                        class="me-1"
                        color="teal-darken-2"
                        variant="plain"
                        size="24"
                        :ripple="false"
                        @click="copyItem(item)"
                      >
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        color="red-lighten-1"
                        variant="plain"
                        size="24"
                        :ripple="false"
                        @click="confirmDelete(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog.open"
      title="確認刪除設備"
      :message="`確定要刪除序號為「<span class='text-pink-lighten-1' style='font-weight: 800;'>${confirmDeleteDialog.name}</span>」的「<span class='text-teal-darken-1' style='font-weight: 800;'>${confirmDeleteDialog.type}</span>」嗎？此操作無法復原。`"
      :expected-name="confirmDeleteDialog.name"
      input-label="序號"
      @confirm="deleteDevice"
    />

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
    >
      <v-card class="rounded-lg px-4 py-6">
        <div class="card-title px-4 py-3">
          {{ dialog.id ? '編輯設備資料' : '新增設備' }}
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
            @submit.prevent="submitDevice"
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
                      mdi-laptop
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

              <!-- 硬體類型 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="type.value.value"
                  :error-messages="type.errorMessage.value"
                  :items="hardwareTypes"
                  :item-title="item => item ? item.name : ''"
                  item-value="_id"
                  label="*硬體類型"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 公司 -->
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
                  label="公司"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="handleCompanyChange"
                />
              </v-col>

              <!-- 地點 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="location.value.value"
                  :error-messages="location.errorMessage.value"
                  :items="locations"
                  :item-title="item => item ? item.locationName : ''"
                  item-value="_id"
                  label="地點"
                  variant="outlined"
                  density="compact"
                  clearable
                  :disabled="!company.value.value"
                />
              </v-col>

              <!-- 使用者 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-autocomplete
                  v-model="user.value.value"
                  v-model:search-input="employeeSearch"
                  :error-messages="user.errorMessage.value"
                  :items="dialogEmployees"
                  :loading="isDialogEmployeesLoading"
                  label="使用者"
                  item-value="_id"
                  :item-props="item => ({
                    key: item._id,
                    title: formatEmployeeDisplay(item),
                    value: item._id
                  })"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:search="handleEmployeeSearch"
                  @click:clear="clearEmployeeSearch"
                  @click:input="loadAllEmployees"
                >
                  <template #selection="{ item }">
                    {{ formatEmployeeDisplay(dialogEmployees.find(emp => emp._id === item.value)) }}
                  </template>
                </v-autocomplete>
              </v-col>

              <!-- 序號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="serialNumber.value.value"
                  :error-messages="serialNumber.errorMessage.value"
                  label="*序號"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 裝置名稱 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="deviceName.value.value"
                  :error-messages="deviceName.errorMessage.value"
                  label="裝置名稱"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 登入名稱 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="loginName.value.value"
                  :error-messages="loginName.errorMessage.value"
                  label="登入名稱"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- MAC -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="macAddress.value.value"
                  :error-messages="macAddress.errorMessage.value"
                  label="MAC"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- IP -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="IPAddress.value.value"
                  :error-messages="IPAddress.errorMessage.value"
                  label="IP"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>


              <!-- 進貨日期 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-date-input
                  v-model="purchaseDate.value.value"
                  :error-messages="purchaseDate.errorMessage.value"
                  label="進貨日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="purchaseDate.value.value = null"
                />
              </v-col>

              <!-- 庫存狀態 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="stockStatus.value.value"
                  :error-messages="stockStatus.errorMessage.value"
                  :items="stockStatusOptions"
                  label="*庫存狀態"
                  item-title="title"
                  item-value="value"
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
                      mdi-microsoft-office
                    </v-icon> Office 資料
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

              <!-- Office 2021 帳號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="office2021Account.value.value"
                  :error-messages="office2021Account.errorMessage.value"
                  label="Office 2021 帳號"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- Office 2021 安裝日期 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-date-input
                  v-model="office2021InstallDate.value.value"
                  :error-messages="office2021InstallDate.errorMessage.value"
                  label="Office 2021 安裝日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="office2021InstallDate.value.value = null"
                />
              </v-col>

              <!-- Office 365 帳號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="office365Account.value.value"
                  :error-messages="office365Account.errorMessage.value"
                  label="Office 365 帳號"
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
                      mdi-cash
                    </v-icon> 報帳資料
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

              <!-- 報帳狀態 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="expenseStatus.value.value"
                  :error-messages="expenseStatus.errorMessage.value"
                  :items="expenseStatusOptions"
                  label="*報帳狀態"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 報帳對象 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="expenseObject.value.value"
                  :error-messages="expenseObject.errorMessage.value"
                  :items="companies"
                  :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
                  item-value="_id"
                  label="報帳對象"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 報帳日期 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-date-input
                  v-model="expenseDate.value.value"
                  :error-messages="expenseDate.errorMessage.value"
                  label="報帳日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="expenseDate.value.value = null"
                />
              </v-col>

              <!-- 備註 -->
              <v-col cols="12">
                <v-text-field
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
            </v-row>

            <v-card-actions class="px-3 mt-4">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
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
              >
                {{ dialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 匯出對話框 -->
    <v-dialog
      v-model="exportDialog.open"
      max-width="320"
    >
      <v-card class="rounded-lg px-4 pt-5 pb-4">
        <v-card-title class="card-title mb-2">
          匯出硬體設備資料
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              cols="12"
              class="px-1"
            >
              <v-radio-group
                v-model="exportDialog.type"
                hide-details
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

            <v-col
              v-if="exportDialog.type === 'company'"
              cols="12"
              class="pb-0"
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
                @update:model-value="() => exportDialog.companyError = ''"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="exportDialog.hardwareTypes"
                :items="hardwareTypes"
                :item-title="item => item ? item.name : ''"
                item-value="_id"
                label="硬體類型"
                variant="outlined"
                density="compact"
                :error-messages="exportDialog.hardwareTypeError"
                clearable
                multiple
                @update:model-value="() => exportDialog.hardwareTypeError = ''"
              >
                <template #selection="{ item, index }">
                  <span v-if="index === 0">{{ item.raw.name }}</span>
                  <span v-else-if="index === 1">...</span>
                </template>
                <template #prepend-item>
                  <v-list-item
                    title="全選"
                    color="deep-purple-darken-2"
                    prepend-icon="mdi-checkbox-multiple-marked"
                    :active="exportDialog.hardwareTypes.length === hardwareTypes.length"
                    @click="selectAllHardwareTypes"
                  />
                  <v-divider class="mt-2" />
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="exportDialog.sortBy"
                :items="sortOptions"
                label="次要排序方式"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                persistent-hint
                hint="會先依硬體類型排序，再依此選項排序"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeExportDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isExporting"
            class="ms-2"
            @click="handleExportExcel"
          >
            匯出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯入對話框 -->
    <v-dialog
      v-model="importDialog.open"
      max-width="380"
    >
      <v-card class="rounded-lg px-4 pt-5 pb-4">
        <v-card-title class="card-title mb-2">
          匯入硬體設備資料
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              cols="12"
              class="pb-0"
            >
              <v-file-input
                v-model="importDialog.file"
                label="*選擇 Excel 檔案"
                variant="outlined"
                density="compact"
                :error-messages="importDialog.fileError"
                accept=".xlsx"
                clearable
                @change="handleFileChange"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeImportDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :loading="isImporting"
            class="ms-2"
            @click="handleImportExcel"
          >
            匯入
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯入結果對話框 -->
    <v-dialog
      v-model="importResultDialog.open"
      max-width="600"
    >
      <v-card class="rounded-lg px-4 pt-5 pb-4">
        <v-card-title class="card-title">
          匯入結果
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              v-if="importResultDialog.success.length > 0"
              cols="12"
            >
              <div class="text-subtitle-1 font-weight-bold text-teal-lighten-1 mb-2">
                成功匯入 {{ importResultDialog.success.length }} 筆資料
              </div>
              <v-list
                density="compact"
                class="bg-teal-lighten-5 rounded-lg"
              >
                <v-list-item
                  v-for="(item, index) in importResultDialog.success"
                  :key="index"
                  :title="`${item.serialNumber} - ${item.type}`"
                  :subtitle="item.message"
                />
              </v-list>
            </v-col>

            <v-col
              v-if="importResultDialog.errors.length > 0"
              cols="12"
            >
              <div class="text-subtitle-1 font-weight-bold text-red-lighten-1 mb-2">
                匯入失敗 {{ importResultDialog.errors.length }} 筆資料
              </div>
              <v-list
                density="compact"
                class="bg-red-lighten-5 rounded-lg"
              >
                <v-list-item
                  v-for="(item, index) in importResultDialog.errors"
                  :key="index"
                  :title="`${item.serialNumber} - ${item.type}`"
                  :subtitle="item.message"
                />
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeImportResultDialog"
          >
            關閉
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserRole from '@/enums/UserRole'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

// 頁面定義
definePage({
  meta: {
    title: '硬體設備管理 | Ystravel',
    login: true,
    roles: [UserRole.ADMIN, UserRole.IT]
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()
const router = useRouter()
const { smAndUp, mdAndUp, xlAndUp } = useDisplay()

// 響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => mdAndUp.value ? '1200' : '100%')

// 表格相關
const tableHeaders = [
  { title: '硬體類型', key: 'type.name', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', align: 'start', sortable: true },
  { title: '序號', key: 'serialNumber', align: 'start', sortable: true },
  { title: '裝置名稱', key: 'deviceName', align: 'start', sortable: true },
  { title: '登入名稱', key: 'loginName', align: 'start', sortable: true },
  { title: '進貨日期', key: 'purchaseDate', align: 'start', sortable: true },
  { title: 'Office 2021 帳號', key: 'office2021Account', align: 'start', sortable: true },
  { title: 'Office 365 帳號', key: 'office365Account', align: 'start', sortable: true },
  { title: '使用者', key: 'user.name', width: '100px',align: 'start', sortable: true },
  { title: '庫存狀態', key: 'stockStatus', align: 'start', sortable: true },
  { title: '報帳狀態', key: 'expenseStatus', align: 'start', sortable: true },
  { title: '備註', key: 'note', align: 'start', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'type.name', order: 'desc' }])

// 搜尋相關響應式變數
const quickSearchText = ref('')
const hardwareTypes = ref([])
const companies = ref([])
const searchCriteria = ref({
  type: '',
  company: '',
  location: '',
  stockStatus: '',
  expenseStatus: '',
  dateType: '',
  dateRange: [],
  user: null
})

// 庫存狀態選項
const stockStatusOptions = [
  { title: '未出貨', value: true },
  { title: '已出貨', value: false }
]

// 日期類型選項
const dateTypeOptions = [
  { title: '進貨日期', value: 'purchaseDate' },
  { title: '安裝日期', value: 'office2021InstallDate' },
  { title: '報帳日期', value: 'expenseDate' }
]

// 報帳狀態選項
const expenseStatusOptions = [
  { title: '已報帳', value: true },
  { title: '未報帳', value: false }
]

// 響應式表格標頭
const filteredHeaders = computed(() => {
  if (!smAndUp.value) {
    return tableHeaders.filter(header =>
      ['deviceName', 'user.name', 'stockStatus', 'actions'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    return tableHeaders.filter(header =>
      !['type.name', 'purchaseDate'].includes(header.key)
    )
  }
  if (!xlAndUp.value) {
    return tableHeaders.filter(header =>
      header.key !== 'note'
    )
  }
  return tableHeaders
})

// 刪除相關響應式變數
const confirmDeleteDialog = ref({
  open: false,
  id: '',
  name: '',
  type: '未知類型'
})

// 新增對話框相關響應式變數
const dialog = ref({
  open: false,
  id: null
})

const isDialogLoading = ref(false)
const employees = ref([])

// 表單驗證架構
const deviceSchema = computed(() => {
  return yup.object({
    type: yup
      .string()
      .required('請選擇硬體類型'),
    purchaseDate: yup
      .date()
      .nullable(),
    deviceName: yup
      .string()
      .nullable(),
    loginName: yup
      .string()
      .nullable(),
    serialNumber: yup
      .string()
      .required('請輸入序號'),
    macAddress: yup
      .string()
      .nullable(),
    IPAddress: yup
      .string()
      .nullable(),
    user: yup
      .string()
      .nullable(),
    company: yup
      .string()
      .nullable(),
    stockStatus: yup
      .boolean()
      .required('請選擇庫存狀態'),
    office2021Account: yup
      .string()
      .nullable(),
    office365Account: yup
      .string()
      .nullable(),
    office2021InstallDate: yup
      .date()
      .nullable(),
    expenseStatus: yup
      .boolean()
      .required('請選擇報帳狀態'),
    note: yup
      .string()
      .nullable(),
    location: yup
      .string()
      .nullable(),
    expenseObject: yup
      .string()
      .nullable(),
    expenseDate: yup
      .date()
      .nullable()
  })
})

// 初始化表單
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: deviceSchema,
  initialValues: {
    type: '',
    purchaseDate: null,
    deviceName: '',
    loginName: '',
    serialNumber: '',
    macAddress: '',
    IPAddress: '',
    user: '',
    company: '',
    stockStatus: true,
    office2021Account: '',
    office365Account: '',
    office2021InstallDate: null,
    expenseStatus: false,
    note: '',
    location: '',
    expenseObject: '',
    expenseDate: null
  }
})

// 定義表單欄位
const type = useField('type')
const purchaseDate = useField('purchaseDate')
const deviceName = useField('deviceName')
const loginName = useField('loginName')
const serialNumber = useField('serialNumber')
const macAddress = useField('macAddress')
const IPAddress = useField('IPAddress')
const user = useField('user')
const company = useField('company')
const stockStatus = useField('stockStatus')
const office2021Account = useField('office2021Account')
const office365Account = useField('office365Account')
const office2021InstallDate = useField('office2021InstallDate')
const expenseStatus = useField('expenseStatus')
const note = useField('note')
const location = useField('location')
const expenseObject = useField('expenseObject')
const expenseDate = useField('expenseDate')

// 在響應式變數區域添加
const locations = ref([])
const selectedEmployee = ref(null)
const searchLocations = ref([])

// 在 script setup 部分添加排序選項
const sortOptions = [
  { title: '裝置名稱', value: 'deviceName' },
  { title: '進貨日期', value: 'purchaseDate' },
  { title: '序號', value: 'serialNumber' }
]

// 修改 exportDialog 的初始值
const exportDialog = ref({
  open: false,
  type: 'all',
  company: null,
  hardwareTypes: [],
  hardwareTypeError: '',
  companyError: '',
  sortBy: 'deviceName'  // 預設排序方式
})

// 修改 openExportDialog 函數
const openExportDialog = () => {
  exportDialog.value = {
    open: true,
    type: 'all',
    company: null,
    hardwareTypes: [],
    hardwareTypeError: '',
    companyError: '',
    sortBy: 'deviceName'  // 重置為預設值
  }
}

// API 相關函數
const loadHardwareTypes = async () => {
  try {
    const { data } = await apiAuth.get('/hardware/categories/all', {
      params: {
        all: true,
        type: 0
      }
    })
    if (data.success) {
      hardwareTypes.value = data.result.data.filter(item => item.type === 0)
    }
  } catch (error) {
    console.error('載入硬體類型列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入硬體類型列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

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

// 處理日期類型變更
const handleDateTypeChange = () => {
  searchCriteria.value.dateRange = []
}

// 修改日期區間變更處理函數
const handleDateRangeChange = (dates) => {
  searchCriteria.value.dateRange = dates
}

// 修改重置搜尋函數
const resetSearch = async () => {
  searchCriteria.value = {
    type: '',
    company: '',
    location: '',
    stockStatus: '',
    expenseStatus: '',
    dateType: '',
    dateRange: [],
    user: null
  }
  quickSearchText.value = ''
  await loadAllEmployees()
  searchLocations.value = []
  await performSearch()
}

// 修改搜尋函數
const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'purchaseDate',
      sortOrder: tableSortBy.value[0]?.order || 'desc',
      search: quickSearchText.value,
      type: searchCriteria.value.type,
      company: searchCriteria.value.company,
      location: searchCriteria.value.location,
      stockStatus: searchCriteria.value.stockStatus,
      expenseStatus: searchCriteria.value.expenseStatus,
      user: searchCriteria.value.user?._id || ''
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

    const { data } = await apiAuth.get('/hardware/devices/all', { params })
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

// 監聽使用者變更
watch(() => searchCriteria.value.user, (newValue) => {
  if (newValue) {
    const selectedUser = employees.value.find(emp => emp._id === newValue._id)
    if (selectedUser) {
      selectedEmployee.value = selectedUser
    }
  } else {
    selectedEmployee.value = null
  }
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadHardwareTypes(),
    loadCompanies(),
    loadAllEmployees(),
    performSearch()
  ])
})

// 刪除相關函數
const confirmDelete = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    id: item._id,
    name: item.serialNumber,
    type: item.type?.name || '未知類型'
  }
}

const deleteDevice = async () => {
  try {
    await apiAuth.delete(`/hardware/devices/${confirmDeleteDialog.value.id}`)
    await performSearch()
    confirmDeleteDialog.value.open = false
    createSnackbar({
      text: '刪除設備成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 載入員工列表
const isDialogEmployeesLoading = ref(false)
const isSearchEmployeesLoading = ref(false)
const employeeSearch = ref('')
const dialogEmployees = ref([])
const searchEmployees = ref([])

const handleEmployeeSearch = debounce(async (search) => {
  if (!search) {
    // 如果搜尋為空，恢復完整列表
    const isFromDialog = !!dialog.value.open
    if (isFromDialog) {
      dialogEmployees.value = [...employees.value]
    } else {
      searchEmployees.value = [...employees.value]
    }
    return
  }

  // 根據觸發來源設置不同的 loading 狀態
  const isFromDialog = !!dialog.value.open
  if (isFromDialog) {
    isDialogEmployeesLoading.value = true
  } else {
    isSearchEmployeesLoading.value = true
  }

  try {
    const { data } = await apiAuth.get('/employees/suggestions', {
      params: {
        search,
        all: true,
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      // 只更新對應的列表，不更新原始資料
      if (isFromDialog) {
        dialogEmployees.value = data.result
      } else {
        searchEmployees.value = data.result
      }
    }
  } catch (error) {
    console.error('搜尋使用者失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '搜尋使用者失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isDialogEmployeesLoading.value = false
    isSearchEmployeesLoading.value = false
  }
}, 300)

// 清除員工搜尋
const clearEmployeeSearch = () => {
  employeeSearch.value = ''
  if (user.value) {
    user.value.value = ''
  } else if (searchCriteria.value) {
    searchCriteria.value.user = null
  }

  // 重置對應的員工列表
  const isFromDialog = !!dialog.value.open
  if (isFromDialog) {
    dialogEmployees.value = [...employees.value]
  } else {
    searchEmployees.value = [...employees.value]
  }
}

// 載入所有員工
const loadAllEmployees = async () => {
  if (employees.value.length > 0) {
    // 如果已有資料，複製到對應的列表
    const isFromDialog = !!dialog.value.open
    if (isFromDialog) {
      dialogEmployees.value = [...employees.value]
    } else {
      searchEmployees.value = [...employees.value]
    }
    return
  }

  const isFromDialog = !!dialog.value.open
  if (isFromDialog) {
    isDialogEmployeesLoading.value = true
  } else {
    isSearchEmployeesLoading.value = true
  }

  try {
    const { data } = await apiAuth.get('/employees/all', {
      params: {
        status: '在職',
        all: true,
        itemsPerPage: 9999
      }
    })
    if (data.success) {
      // 保存原始資料
      employees.value = data.result.data
      // 複製到對應的列表
      if (isFromDialog) {
        dialogEmployees.value = [...data.result.data]
      } else {
        searchEmployees.value = [...data.result.data]
      }
    }
  } catch (error) {
    console.error('載入使用者列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入使用者列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isDialogEmployeesLoading.value = false
    isSearchEmployeesLoading.value = false
  }
}

// 開啟對話框
const openDialog = async (item) => {
  dialog.value.open = true
  dialog.value.id = item?._id || null
  isDialogLoading.value = true

  try {
    // 確保員工列表已載入
    await loadAllEmployees()

    if (item) {
      // 編輯模式
      type.value.value = item.type?._id || ''
      purchaseDate.value.value = item.purchaseDate ? new Date(item.purchaseDate) : null
      deviceName.value.value = item.deviceName || ''
      loginName.value.value = item.loginName || ''
      serialNumber.value.value = item.serialNumber || ''
      macAddress.value.value = item.macAddress || ''
      IPAddress.value.value = item.IPAddress || ''
      user.value.value = item.user?._id || ''
      company.value.value = item.company?._id || ''

      // 如果有公司，載入地點列表並設置地點值
      if (item.company?._id) {
        await handleCompanyChange(item.company._id)
        // 等待地點列表載入後再設置地點值
        if (item.location) {
          location.value.value = item.location._id || item.location
        }
      }

      stockStatus.value.value = item.stockStatus
      office2021Account.value.value = item.office2021Account || ''
      office365Account.value.value = item.office365Account || ''
      office2021InstallDate.value.value = item.office2021InstallDate ? new Date(item.office2021InstallDate) : null
      expenseStatus.value.value = item.expenseStatus
      note.value.value = item.note || ''

      expenseObject.value.value = item.expenseObject?._id || ''
      expenseDate.value.value = item.expenseDate ? new Date(item.expenseDate) : null
    } else {
      // 新增模式
      resetForm()
    }
  } catch (error) {
    console.error('載入設備資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入設備資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeDialog()
  } finally {
    isDialogLoading.value = false
  }
}

// 關閉對話框
const closeDialog = () => {
  dialog.value.open = false
  dialog.value.id = null
  isDialogLoading.value = false
  selectedEmployee.value = null
  // 重置對話框的使用者列表為完整列表
  dialogEmployees.value = [...employees.value]
  // 清空搜尋輸入
  employeeSearch.value = ''
  resetForm()
}

// 複製設備
const copyItem = async (item) => {
  try {
    if (!item || !item._id) {
      createSnackbar({
        text: '無效的項目資料',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 先打開對話框
    dialog.value = {
      open: true,
      id: null // 設為 null 因為是新增
    }
    isDialogLoading.value = true

    // 獲取完整的資料
    const { data } = await apiAuth.get(`/hardware/devices/${item._id}`)
    if (!data.success || !data.result) {
      throw new Error('獲取資料失敗')
    }

    const fullItem = data.result

    // 複製所有欄位，除了序號
    type.value.value = fullItem.type?._id || ''
    purchaseDate.value.value = fullItem.purchaseDate ? new Date(fullItem.purchaseDate) : null
    deviceName.value.value = fullItem.deviceName || ''
    loginName.value.value = fullItem.loginName || ''
    serialNumber.value.value = '' // 序號不複製
    macAddress.value.value = fullItem.macAddress || ''
    IPAddress.value.value = fullItem.IPAddress || ''
    user.value.value = fullItem.user?._id || ''
    company.value.value = fullItem.company?._id || ''

    // 如果有公司，載入地點列表
    if (fullItem.company?._id) {
      await handleCompanyChange(fullItem.company._id)
      if (fullItem.location) {
        location.value.value = fullItem.location._id || fullItem.location
      }
    }

    stockStatus.value.value = fullItem.stockStatus ?? true
    office2021Account.value.value = fullItem.office2021Account || ''
    office365Account.value.value = fullItem.office365Account || ''
    office2021InstallDate.value.value = fullItem.office2021InstallDate ? new Date(fullItem.office2021InstallDate) : null
    expenseStatus.value.value = fullItem.expenseStatus ?? false
    note.value.value = fullItem.note || ''
    expenseObject.value.value = fullItem.expenseObject?._id || ''
    expenseDate.value.value = fullItem.expenseDate ? new Date(fullItem.expenseDate) : null

    // 顯示提示訊息
    createSnackbar({
      text: '請輸入新的序號',
      snackbarProps: {
        color: 'warning',
        timeout: 4000
      }
    })
  } catch (error) {
    console.error('複製項目發生錯誤:', error)
    handleError(error)
    dialog.value.open = false
  } finally {
    isDialogLoading.value = false
  }
}

// 提交表單
const submitDevice = handleSubmit(async (values) => {
  try {
    // 處理空值，將空字符串轉換為 null
    const processedValues = {
      ...values,
      type: values.type || null,
      user: values.user || null,
      company: values.company || null,
      location: values.location || null,
      expenseObject: values.expenseObject || null,
    }

    // 確保 expenseObject 是字串類型
    if (processedValues.expenseObject && typeof processedValues.expenseObject === 'object') {
      processedValues.expenseObject = processedValues.expenseObject._id
    }

    if (dialog.value.id) {
      // 編輯
      const { data } = await apiAuth.patch(`/hardware/devices/${dialog.value.id}`, processedValues)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '設備資料更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增
      const { data } = await apiAuth.post('/hardware/devices', processedValues)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '新增設備成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message
    const errorField = error?.response?.data?.field

    // 顯示錯誤訊息
    createSnackbar({
      text: errorMessage || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })

    // 如果有特定欄位錯誤，更新對應欄位的值和錯誤狀態
    if (errorField) {
      const errorRule = () => errorMessage

      switch (errorField) {
        case 'serialNumber':
          serialNumber.value.value = values.serialNumber
          serialNumber.value.rules = [errorRule]
          break
        case 'macAddress':
          macAddress.value.value = values.macAddress
          macAddress.value.rules = [errorRule]
          break
        case 'IPAddress':
          IPAddress.value.value = values.IPAddress
          IPAddress.value.rules = [errorRule]
          break
      }
      // 防止表單重置
      return
    }
  }
})

// 添加公司變更處理函數
const handleCompanyChange = async (companyId) => {
  location.value.value = ''
  locations.value = []

  if (!companyId) return

  try {
    const { data } = await apiAuth.get(`/companies/${companyId}`)
    if (data.success) {
      locations.value = data.result.locations || []
    }
  } catch (error) {
    console.error('載入地點列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入地點列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 添加公司變更處理函數
const handleSearchCompanyChange = async (companyId) => {
  searchCriteria.value.location = ''
  searchLocations.value = []

  if (!companyId) return

  try {
    const { data } = await apiAuth.get(`/companies/${companyId}`)
    if (data.success) {
      searchLocations.value = data.result.locations || []
    }
  } catch (error) {
    console.error('載入地點列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入地點列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 匯出相關
const isExporting = ref(false)

// 處理匯出 Excel
const handleExportExcel = async () => {
  try {
    // 驗證
    let hasError = false
    exportDialog.value.hardwareTypeError = ''
    exportDialog.value.companyError = ''

    // 檢查硬體類型（必選）
    if (!exportDialog.value.hardwareTypes || exportDialog.value.hardwareTypes.length === 0) {
      exportDialog.value.hardwareTypeError = '請選擇至少一個硬體類型'
      hasError = true
    }

    // 如果是單一公司匯出，檢查公司
    if (exportDialog.value.type === 'company' && !exportDialog.value.company) {
      exportDialog.value.companyError = '請選擇公司'
      hasError = true
    }

    if (hasError) return

    isExporting.value = true

    // 準備查詢參數
    const params = {
      type: exportDialog.value.type,
      sortBy: exportDialog.value.sortBy
    }

    if (exportDialog.value.type === 'company') {
      params.company = exportDialog.value.company
    }

    // 添加硬體類型參數
    if (exportDialog.value.hardwareTypes.length > 0) {
      params.hardwareTypes = exportDialog.value.hardwareTypes.join(',')
    }

    // 呼叫 API 取得資料
    const { data } = await apiAuth.get('/hardware/devices/export', { params })

    if (data.success) {
      // 載入 XLSX
      const XLSX = await import('xlsx')

      // 準備 Excel 資料
      const excelData = data.result.map(device => ({
        '硬體類型': device.type?.name || '',
        '公司': device.company?.name || '',
        '地點': device.location?.locationName || '',  // 修正：使用 locationName
        '序號': device.serialNumber || '',
        '進貨日期': formatDate(device.purchaseDate),
        '使用者': device.user?.name || '',
        '裝置名稱': device.deviceName || '',
        '登入名稱': device.loginName || '',
        'Office 2021 帳號': device.office2021Account || '',
        'Office 2021 安裝日期': formatDate(device.office2021InstallDate),
        'Office 365 帳號': device.office365Account || '',
        'MAC': device.macAddress || '',
        'IP': device.IPAddress || '',
        '庫存狀態': device.stockStatus ? '未出貨' : '已出貨',
        '報帳日期': formatDate(device.expenseDate),
        '報帳對象': device.expenseObject?.name || '',
        '報帳狀態': device.expenseStatus ? '已報帳' : '未報帳',
        '備註': device.note || ''
      }))

      // 創建工作表
      const ws = XLSX.utils.json_to_sheet(excelData)

      // 設定欄寬
      const colWidths = {
        '硬體類型': 15,
        '公司': 20,
        '地點': 15,
        '序號': 20,
        '進貨日期': 15,
        '使用者': 15,
        '裝置名稱': 20,
        '登入名稱': 20,
        'Office 2021 帳號': 25,
        'Office 2021 安裝日期': 25,
        'Office 365 帳號': 25,
        'MAC': 20,
        'IP': 15,
        '庫存狀態': 12,
        '報帳日期': 15,
        '報帳對象': 20,
        '報帳狀態': 12,
        '備註': 30
      }

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }))

      // 創建工作簿
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '硬體設備資料')

      // 生成檔案並下載
      const fileName = exportDialog.value.type === 'all'
        ? '所有硬體設備資料清單.xlsx'
        : `${companies.value.find(c => c._id === exportDialog.value.company)?.name}硬體設備資料清單.xlsx`

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
    if (error?.response?.status === 401) {
      userStore.logout()
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
  } finally {
    isExporting.value = false
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

// 錯誤處理函數
const handleError = (error) => {
  console.error('Error:', error)
  const errorMessage = error?.response?.data?.message || '操作失敗'
  if (error?.response?.status === 401) {
    userStore.logout()
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

watch(quickSearchText, () => {
  debouncedSearch()
})

// 格式化員工顯示
const formatEmployeeDisplay = (employee) => {
  if (!employee) return ''
  return `${employee.name} (${employee.employeeId || ''})`
}

// 關閉匯出對話框
const closeExportDialog = () => {
  exportDialog.value.open = false
}

// 全選硬體類型
const selectAllHardwareTypes = () => {
  exportDialog.value.hardwareTypeError = ''
  if (exportDialog.value.hardwareTypes.length === hardwareTypes.value.length) {
    exportDialog.value.hardwareTypes = []
  } else {
    exportDialog.value.hardwareTypes = hardwareTypes.value.map(type => type._id)
  }
}

// 匯入相關
const isImporting = ref(false)
const importDialog = ref({
  open: false,
  file: null,
  fileError: ''
})

const importResultDialog = ref({
  open: false,
  success: [],
  errors: []
})

// 開啟匯入對話框
const openImportDialog = () => {
  importDialog.value = {
    open: true,
    file: null,
    fileError: ''
  }
}

// 關閉匯入對話框
const closeImportDialog = () => {
  importDialog.value.open = false
}

// 關閉匯入結果對話框
const closeImportResultDialog = () => {
  importResultDialog.value.open = false
}

// 處理檔案變更
const handleFileChange = () => {
  importDialog.value.fileError = ''
}

// 處理匯入 Excel
const handleImportExcel = async () => {
  try {
    // 驗證
    let hasError = false
    importDialog.value.fileError = ''

    if (!importDialog.value.file) {
      importDialog.value.fileError = '請選擇檔案'
      hasError = true
    }

    if (hasError) return

    isImporting.value = true

    // 載入 XLSX
    const XLSX = await loadXLSX()

    // 讀取檔案
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,  // 將 Excel 日期轉換為 JS Date 物件
          dateNF: 'yyyy/mm/dd'  // 指定日期格式
        })

        // 獲取第一個工作表
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        // 轉換為 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 準備匯入資料
        const devices = jsonData.map(row => {
          // 處理日期格式
          const formatDate = (dateStr) => {
            if (!dateStr) return ''

            // 如果是 Excel 的日期數字格式
            if (typeof dateStr === 'number') {
              // Excel 的日期是從 1900/1/1 開始計算的天數
              // 需要減去 Excel 的系統日期偏差 (1900 年的 bug)
              const excelEpoch = new Date(1899, 11, 30)
              const date = new Date(excelEpoch.getTime() + (dateStr * 24 * 60 * 60 * 1000))
              return date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '/')
            }

            // 如果是日期字串，確保格式為 YYYY/MM/DD
            if (typeof dateStr === 'string') {
              const date = new Date(dateStr)
              if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '/')
              }
            }

            return dateStr
          }

          // 處理布林值
          const parseBoolean = (value) => {
            if (typeof value === 'boolean') return value
            if (typeof value === 'string') {
              const lowerValue = value.toLowerCase()
              // 庫存狀態
              if (['未出貨'].includes(lowerValue)) return true
              if (['已出貨'].includes(lowerValue)) return false
              // 報帳狀態
              if (['已報帳'].includes(lowerValue)) return true
              if (['未報帳'].includes(lowerValue)) return false
              // 一般布林值
              if (['true', '是', '1'].includes(lowerValue)) return true
              if (['false', '否', '0'].includes(lowerValue)) return false
            }
            if (typeof value === 'number') return value === 1
            return null
          }

          return {
            type: row['硬體類型'],
            purchaseDate: formatDate(row['進貨日期']),
            deviceName: row['裝置名稱'],
            loginName: row['登入名稱'],
            office2021Account: row['Office 2021 帳號'], // 修正空格
            office2021InstallDate: formatDate(row['Office 2021 安裝日期']), // 修正空格
            office365Account: row['Office 365 帳號'], // 修正空格
            user: row['使用者'],
            serialNumber: row['序號']?.toString(),
            macAddress: row['MAC'],
            IPAddress: row['IP'],
            company: row['公司'],
            location: row['地點'],
            expenseObject: row['報帳對象'],
            expenseDate: formatDate(row['報帳日期']),
            expenseStatus: parseBoolean(row['報帳狀態']),
            stockStatus: parseBoolean(row['庫存狀態']),
            note: row['備註']
          }
        })

        // 呼叫 API
        const { data: response } = await apiAuth.post('/hardware/devices/import', {
          devices
        })

        if (response.success) {
          // 顯示結果
          importResultDialog.value = {
            open: true,
            success: response.result.success,
            errors: response.result.errors
          }

          // 關閉匯入對話框
          closeImportDialog()

          // 重新載入資料
          await performSearch()

          createSnackbar({
            text: '匯入完成',
            snackbarProps: { color: 'teal-lighten-1' }
          })
        }
      } catch (error) {
        console.error('Error:', error)
        const errorMessage = error?.response?.data?.message || '匯入失敗'
        createSnackbar({
          text: errorMessage,
          snackbarProps: { color: 'red-lighten-1' }
        })
      } finally {
        isImporting.value = false
      }
    }

    reader.readAsArrayBuffer(importDialog.value.file)
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error?.response?.data?.message || '匯入失敗'
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
    isImporting.value = false
  }
}

// 載入 XLSX 函數
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

// 在 script setup 部分添加以下函數
const downloadExampleFile = () => {
  const link = document.createElement('a')
  link.href = 'https://eip.ystravel.com.tw/GInternational/uploads/example/example_deviceList.xlsx'
  link.download = 'example_deviceList.xlsx'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  createSnackbar({
    text: '範例檔案下載成功',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

</script>

<style lang="scss" scoped>
:deep(.v-data-table) {
  thead {
    height: 48px;
    background-color: #455a64 !important;
    color: #fff !important;
    // th{
    //   font-size: 13px !important;
    // }
  }
  tbody tr {
    height: 48px;
  }
  // .v-data-table__tbody {
  //   td {
  //     font-size: 14px !important;
  //   }
  // }
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

.note-cell {
  max-width: 100px;
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

.status-cell {
  min-height: 32px;
}

.status-card {
  .v-card-text {
    font-size: 0.875rem;
  }
}
</style>
