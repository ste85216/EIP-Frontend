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
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                class="px-3 px-lg-5"
              >
                <v-card
                  class="elevation-4 rounded-lg py-3 py-sm-5 px-2 px-sm-4"
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
                          :size="buttonSize"
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
                          :size="buttonSize"
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
        <v-row class="elevation-4 rounded-lg py-4 py-lg-6 px-1 px-sm-4 px-lg-6 mt-1 bg-white">
          <!-- 標題和功能按鈕區 -->
          <v-col
            cols="12"
            class="ps-4 pb-sm-4"
          >
            <v-row>
              <v-col>
                <h3>
                  員工管理
                </h3>
              </v-col>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-row class="d-flex justify-space-between">
                  <v-col
                    cols="5"
                    sm="4"
                    class="pe-0 pe-sm-4"
                  >
                    <v-btn
                      prepend-icon="mdi-account-plus"
                      variant="outlined"
                      color="blue-grey-darken-2"
                      @click="openDialog(null)"
                    >
                      新增員工
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="7"
                    sm="5"
                    md="4"
                    lg="3"
                    xl="2"
                    class="d-flex align-center"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋系統員工編號、姓名、Email、科威員工編號、分機號碼、列印號碼、備註、暱稱、LineID'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-2"
                    />
                    <v-text-field
                      v-model="quickSearch"
                      :loading="tableLoading"
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
                  <!-- 科威員編 -->
                  <td>{{ item.employeeCode }}</td>

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
                              class="menu-card-text pa-4 pt-3"
                            >
                              {{ item.note }}
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-menu>
                    </template>
                    <template v-else />
                  </td>

                  <!-- 操作 -->
                  <td class="text-center">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      :size="actionButtonSize"
                      :ripple="false"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="hasSystemUserReadPermission && !item.hasSystemUser && (item.employmentStatus === '在職' || item.employmentStatus === '待入職')"
                      v-tooltip:start="'新增為系統用戶'"
                      icon
                      color="teal-darken-1"
                      variant="plain"
                      :size="actionButtonSize"
                      :ripple="false"
                      @click="copyEmployeeToUser(item)"
                    >
                      <v-icon>mdi-account-plus</v-icon>
                    </v-btn>
                    <v-btn
                      v-else-if="hasSystemUserReadPermission && !item.hasSystemUser && (item.employmentStatus === '離職' || item.employmentStatus === '留職停薪')"
                      v-tooltip:start="'離職/留停員工無法複製為系統用戶'"
                      icon
                      color="grey"
                      variant="plain"
                      :size="actionButtonSize"
                      :ripple="false"
                      disabled
                    >
                      <v-icon>mdi-account-plus</v-icon>
                    </v-btn>
                    <v-btn
                      v-else-if="hasSystemUserReadPermission && item.hasSystemUser"
                      v-tooltip:start="'已有系統用戶'"
                      icon
                      color="grey"
                      variant="plain"
                      :size="actionButtonSize"
                      :ripple="false"
                      disabled
                    >
                      <v-icon>mdi-account-check</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-lighten-1"
                      variant="plain"
                      :size="actionButtonSize"
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
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :no-click-animation="isSubmitting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-8 py-4 bg-blue-grey-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-plus
          </v-icon>
          {{ dialog.id ? '編輯員工資料' : '新增員工' }}
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
        <v-card-text class="mt-6 mb-0 px-6">
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
            @submit.prevent="submitEmployee"
          >
            <v-row>
              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
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
                      mdi-card-account-details-outline
                    </v-icon> 基本資料
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- 系統編號 (只在編輯時顯示) -->
              <v-col
                v-if="dialog.id"
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="employeeId.value.value"
                  :error-messages="employeeId.errorMessage.value"
                  label="系統編號"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
              <!-- 姓名 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.errorMessage.value"
                  label="*姓名"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
              <!-- 暱稱 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="nickname.value.value"
                  :error-messages="nickname.errorMessage.value"
                  label="暱稱"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- LineID -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="lineID.value.value"
                  :error-messages="lineID.errorMessage.value"
                  label="LineID"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- Line連結 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="lineLink.value.value"
                  :error-messages="lineLink.errorMessage.value"
                  label="Line連結"
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
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
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
                      mdi-office-building-outline
                    </v-icon> 任職資料
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
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
                  @update:model-value="handleFormCompanyChange"
                />
              </v-col>

              <!-- 部門選擇 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="department.value.value"
                  :error-messages="department.errorMessage.value"
                  :items="formDepartments"
                  :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                  item-value="_id"
                  label="*部門"
                  variant="outlined"
                  density="compact"
                  clearable
                  :disabled="!company.value.value"
                />
              </v-col>

              <!-- 聘僱類型 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="employmentType.value.value"
                  :error-messages="employmentType.errorMessage.value"
                  :items="employmentTypeOptions"
                  item-title="text"
                  item-value="value"
                  label="*聘僱類型"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 職稱 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="jobTitle.value.value"
                  :error-messages="jobTitle.errorMessage.value"
                  :items="jobTitleOptions"
                  item-title="text"
                  item-value="value"
                  label="*職稱"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 科威系統及員工編號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="employeeCode.value.value"
                  :error-messages="employeeCode.errorMessage.value"
                  label="*科威系統及員工編號"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- Email -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="email.value.value"
                  :error-messages="email.errorMessage.value"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  clearable
                  :append-inner-icon="'mdi-at'"
                  @click:append-inner="appendCompanyDomain"
                />
              </v-col>

              <!-- Email 密碼 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="emailPassword.value.value"
                  :error-messages="emailPassword.errorMessage.value"
                  label="Email密碼"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 分機號碼 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="extNumber.value.value"
                  :error-messages="extNumber.errorMessage.value"
                  label="*分機號碼"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 列印編號 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="printNumber.value.value"
                  :error-messages="printNumber.errorMessage.value"
                  label="*列印編號"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <!-- 任職狀態 -->
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="employmentStatus.value.value"
                  :error-messages="employmentStatus.errorMessage.value"
                  :items="statusOptions"
                  label="*任職狀態"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="handleEmploymentStatusChange"
                />
              </v-col>

              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center"
              >
                <v-row>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
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
                      mdi-calendar-outline
                    </v-icon> 日期資料
                  </v-col>
                  <v-col
                    cols="3"
                    sm="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 到職日期 -->
              <v-col
                cols="12"
                sm="3"
              >
                <v-date-input
                  v-model="hireDate.value.value"
                  :error-messages="hireDate.errorMessage.value"
                  label="*到職日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="hireDate.value.value = null"
                />
              </v-col>

              <!-- 留停日期 -->
              <v-col
                v-if="unpaidLeaveStartDate.value.value"
                cols="12"
                sm="3"
              >
                <v-date-input
                  v-model="unpaidLeaveStartDate.value.value"
                  :error-messages="unpaidLeaveStartDate.errorMessage.value"
                  label="留停開始日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="unpaidLeaveStartDate.value.value = null"
                />
              </v-col>

              <!-- 復職日期 -->
              <v-col
                v-if="reinstatementDate.value.value"
                cols="12"
                sm="3"
              >
                <v-date-input
                  v-model="reinstatementDate.value.value"
                  :error-messages="reinstatementDate.errorMessage.value"
                  label="留停復職日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="reinstatementDate.value.value = null"
                />
              </v-col>

              <!-- 離職日期 -->
              <v-col
                v-if="resignationDate.value.value"
                cols="12"
                sm="3"
              >
                <v-date-input
                  v-model="resignationDate.value.value"
                  :error-messages="resignationDate.errorMessage.value"
                  label="離職日期"
                  variant="outlined"
                  density="compact"
                  clearable
                  prepend-icon
                  :ok-text="'確認'"
                  :cancel-text="'取消'"
                  @click:clear="resignationDate.value.value = null"
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

    <!-- 刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog.open"
      title="確認刪除員工"
      :message="`確定要刪除員工「<span class='text-pink-lighten-1' style='font-weight: 800;'>${confirmDeleteDialog.name}</span>」嗎？此操作無法復原。`"
      :expected-name="confirmDeleteDialog.name"
      input-label="員工姓名"
      @confirm="deleteEmployee"
    />

    <!-- 離職日期對話框 -->
    <v-dialog
      v-model="leaveDialog.open"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-red-lighten-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-calendar-remove
          </v-icon>
          離職日期
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="handleLeaveCancel"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-date-input
            v-model="leaveDialog.date"
            label="離職日期"
            variant="outlined"
            density="compact"
            prepend-icon
            :ok-text="'確認'"
            :cancel-text="'取消'"
            :error-messages="leaveDialog.error"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="handleLeaveCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="red-lighten-1"
            variant="outlined"
            :size="buttonSize"
            @click="handleLeaveConfirm"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 留職停薪對話框 -->
    <v-dialog
      v-model="suspensionDialog.open"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-amber-darken-4 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-calendar-clock
          </v-icon>
          留停開始日期
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="handleSuspensionCancel"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-date-input
            v-model="suspensionDialog.date"
            label="留職停薪開始日期"
            variant="outlined"
            density="compact"
            prepend-icon
            :ok-text="'確認'"
            :cancel-text="'取消'"
            :error-messages="suspensionDialog.error"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="handleSuspensionCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="amber-darken-4"
            variant="outlined"
            :size="buttonSize"
            @click="handleSuspensionConfirm"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 復職對話框 -->
    <v-dialog
      v-model="reinstatementDialog.open"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-teal-darken-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-calendar-check
          </v-icon>
          留停復職日期
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="handleReinstatementCancel"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-date-input
            v-model="reinstatementDialog.date"
            label="留停復職日期"
            variant="outlined"
            density="compact"
            prepend-icon
            :ok-text="'確認'"
            :cancel-text="'取消'"
            :error-messages="reinstatementDialog.error"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="handleReinstatementCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :size="buttonSize"
            @click="handleReinstatementConfirm"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯出 Excel 對話框 -->
    <v-dialog
      v-model="exportDialog.open"
      max-width="320"
      :persistent="isExporting"
      :no-click-animation="isExporting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-deep-orange-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-file-export
          </v-icon>
          匯出員工資料
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeExportDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-row>
            <v-col
              cols="12"
              class="px-1 py-0 py-sm-2"
            >
              <v-radio-group
                v-model="exportDialog.type"
                hide-details
              >
                <v-radio
                  label="所有員工資料"
                  value="all"
                  color="deep-orange-darken-2"
                />
                <v-radio
                  label="單一公司資料"
                  value="company"
                  color="deep-orange-darken-2"
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
                @update:model-value="handleExportCompanyChange"
              />
            </v-col>

            <v-col
              v-if="exportDialog.type === 'company'"
              cols="12"
              class="pb-0"
            >
              <v-select
                v-model="exportDialog.departments"
                :items="exportDialog.departmentOptions"
                :item-title="item => item ? `${item.name} (${item.departmentId})` : ''"
                item-value="_id"
                label="部門"
                variant="outlined"
                density="compact"
                :error-messages="exportDialog.departmentError"
                clearable
                multiple
                :disabled="!exportDialog.company"
                @update:model-value="() => exportDialog.departmentError = ''"
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
                    :active="exportDialog.departments.length === exportDialog.departmentOptions.length"
                    @click="selectAllDepartments"
                  />
                  <v-divider class="mt-2" />
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="exportDialog.employmentStatus"
                :items="statusOptions"
                label="任職狀態"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                :error-messages="exportDialog.employmentStatusError"
                clearable
                multiple
                @update:model-value="() => exportDialog.employmentStatusError = ''"
              >
                <template #selection="{ item, index }">
                  <span v-if="index === 0">{{ item.raw.title }}</span>
                  <span v-else-if="index === 1">...</span>
                </template>
                <template #prepend-item>
                  <v-list-item
                    title="全選"
                    color="deep-orange-darken-2"
                    prepend-icon="mdi-checkbox-multiple-marked"
                    :active="exportDialog.employmentStatus.length === statusOptions.length"
                    @click="selectAllEmploymentStatus"
                  />
                  <v-divider class="mt-2" />
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
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
            color="deep-orange-darken-2"
            variant="outlined"
            :size="buttonSize"
            :loading="isExporting"
            @click="handleExportExcel"
          >
            匯出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯入 Excel 對話框 -->
    <v-dialog
      v-model="importDialog.open"
      max-width="360"
      :persistent="isImporting"
      :no-click-animation="isImporting"
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-light-blue-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-file-import
          </v-icon>
          匯入員工資料
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeImportDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
          <v-row>
            <v-col
              cols="12"
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
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="closeImportDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="light-blue-darken-2"
            variant="outlined"
            :size="buttonSize"
            :loading="isImporting"
            @click="handleImportExcel"
          >
            匯入
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 複製確認對話框 -->
    <v-dialog
      v-model="copyConfirmDialog.open"
      max-width="360"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-teal-darken-1 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-account-plus
          </v-icon>
          複製為系統用戶
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="copyConfirmDialog.open = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-6 pb-3">
          <div class="mb-4">
            確定要將員工「<span class="text-teal-darken-1 font-weight-bold">{{ copyConfirmDialog.employee?.name }}</span>」新增為系統用戶嗎？
          </div>
          <div class="mb-4">
            系統將自動創建對應的用戶帳號，預設密碼為：<span class="text-blue-darken-1 font-weight-bold">ys{{ copyConfirmDialog.employee?.extNumber }}{{ copyConfirmDialog.employee?.printNumber }}</span>
          </div>
          <v-select
            v-model="copyConfirmDialog.selectedRole"
            :items="roleOptions"
            label="選擇權限"
            variant="outlined"
            density="compact"
            hide-details
            class="py-2"
            :error-messages="copyConfirmDialog.roleError"
            @update:model-value="copyConfirmDialog.roleError = ''"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :size="buttonSize"
            @click="copyConfirmDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :size="buttonSize"
            @click="confirmCopyEmployeeToUser"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯入結果對話框 -->
    <v-dialog
      v-model="importResultDialog.open"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-3 bg-light-blue-darken-2 d-flex align-center">
          <v-icon
            size="20"
            color="white"
            class="me-2"
          >
            mdi-file-check
          </v-icon>
          匯入結果
          <v-spacer />
          <v-btn
            icon
            color="white"
            variant="plain"
            class="opacity-100"
            :ripple="false"
            size="20"
            @click="closeImportResultDialog"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-7 pb-0">
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
                  :title="`${item.employeeCode} - ${item.name}`"
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
                  :title="`${item.employeeCode} - ${item.name}`"
                  :subtitle="item.message"
                />
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            :size="buttonSize"
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
import { usePermissionStore } from '@/stores/permission'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

// 頁面定義
definePage({
  meta: {
    title: '員工管理 | TEST',
    login: true,
    permission: 'EMPLOYEE_MANAGEMENT_READ'
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const permissionStore = usePermissionStore()
const router = useRouter()
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

// 響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const actionButtonSize = computed(() => smAndUp.value ? '32' : 'small')
const dialogWidth = computed(() => mdAndUp.value ? '1200' : '100%')

// 權限檢查
const hasSystemUserReadPermission = computed(() => {
  return permissionStore.hasPermission('SYSTEM_USER_CREATE')
})

// 表格相關
const tableHeaders = [
  { title: '科威員編', key: 'employeeCode', minWidth: '80px', align: 'start', sortable: true },
  { title: '系統編號', key: 'employeeId', minWidth: '120px', align: 'start', sortable: true },
  { title: '姓名', key: 'name', minWidth: '90px', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', minWidth: '90px', align: 'start', sortable: true },
  { title: '部門', key: 'department.name', align: 'start', sortable: true },
  { title: '聘僱類型', key: 'employmentType', align: 'start', sortable: true },
  { title: '職稱', key: 'jobTitle', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: '狀態', key: 'employmentStatus', width: '100px', align: 'start', sortable: true },
  { title: '備註', key: 'note', width:'160px', align: 'start', sortable: true },
  { title: '操作', key: 'actions', minWidth: '130px', align: 'center', sortable: false }
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
  status: '在職', // 預設在職狀態
  dateType: '',
  dateRange: []
})

// 對話框相關響應式變數
const dialog = ref({
  open: false,
  id: null
})

const confirmDeleteDialog = ref({
  open: false,
  id: '',
  name: ''
})

// 狀態選項
const statusOptions = [
  { title: '在職', value: '在職' },
  { title: '離職', value: '離職' },
  { title: '留職停薪', value: '留職停薪' },
  { title: '待入職', value: '待入職' }
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
    // sm以下：只顯示科威員編、姓名和操作
    return tableHeaders.filter(header =>
      ['employeeCode', 'name', 'actions'].includes(header.key)
    )
  } else if (!mdAndUp.value) {
    // sm~md：顯示科威員編、姓名、公司、部門、職稱、操作
    return tableHeaders.filter(header =>
      ['employeeCode', 'name', 'company.name', 'department.name', 'jobTitle', 'actions'].includes(header.key)
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

    // 當選擇顯示全部時，將頁碼設為1
    if (tableItemsPerPage.value === -1) {
      params.page = 1
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
    status: '在職', // 預設在職狀態
    dateType: '',
    dateRange: []
  }
  quickSearch.value = ''
  departments.value = []
  performSearch()
}

// 表格操作函數
const handleTableOptionsChange = async (options) => {
  // 當選擇顯示全部時，將頁碼設為1
  if (options.itemsPerPage === -1) {
    tablePage.value = 1
  } else {
    tablePage.value = options.page
  }
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

// 刪除相關函數
const confirmDelete = (item) => {
  confirmDeleteDialog.value = {
    open: true,
    id: item._id,
    name: item.name
  }
}

const deleteEmployee = async () => {
  try {
    const { data } = await apiAuth.delete(`/employees/${confirmDeleteDialog.value.id}`)

    if (data.success) {
      await performSearch()
      confirmDeleteDialog.value.open = false

      // 如果有系統用戶被影響，顯示額外訊息
      if (data.result?.affectedUser) {
        createSnackbar({
          text: `員工已刪除，相關系統用戶「${data.result.affectedUser.name}」的關聯已解除`,
          snackbarProps: { color: 'orange-darken-1' }
        })
      } else {
        createSnackbar({
          text: '刪除員工成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 表單相關響應式變數
const formDepartments = ref([])

// 表單相關函數
const handleFormCompanyChange = async () => {
  department.value.value = ''
  formDepartments.value = []
  if (!company.value.value) return

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: company.value.value }
    })
    if (data.success) {
      formDepartments.value = data.result
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 新增載入狀態
const isDialogLoading = ref(false)

// 在 script setup 中添加表單驗證架構
const employeeSchema = computed(() => {
  const schema = {
    company: yup
      .string()
      .required('請選擇公司'),
    department: yup
      .string()
      .required('請選擇部門'),
    name: yup
      .string()
      .required('請輸入姓名')
      .trim(),
    nickname: yup
      .string()
      .nullable()
      .trim(),
    lineID: yup
      .string()
      .nullable()
      .trim(),
    lineLink: yup
      .string()
      .nullable()
      .trim(),
    email: yup
      .string()
      .nullable()
      .test('email-format', value => {
        // 如果沒有填寫 email，直接返回 true
        if (!value || value.trim() === '') return true

        // 如果有填寫，則進行驗證
        return true
      })
      .email('請輸入正確的 Email 格式'),
    emailPassword: yup
      .string()
      .nullable(),
    employeeCode: yup
      .string()
      .required('請輸入科威員工編號'),
    extNumber: yup
      .string()
      .required('請輸入分機號碼'),
    printNumber: yup
      .string()
      .required('請輸入列印編號'),
    employmentStatus: yup
      .string()
      .required('請選擇任職狀態'),
    employmentType: yup
      .string()
      .required('請選擇聘僱類型'),
    jobTitle: yup
      .string()
      .required('請選擇職稱'),
    hireDate: yup
      .date()
      .required('請選擇到職日期'),
    resignationDate: yup
      .date()
      .nullable(),
    unpaidLeaveStartDate: yup
      .date()
      .nullable(),
    reinstatementDate: yup
      .date()
      .nullable(),
    note: yup
      .string()
      .nullable()
  }

  if (dialog.value.id) {
    schema.employeeId = yup
      .string()
      .required('請輸入系統員工編號')
  }

  return yup.object(schema)
})

// 初始化表單
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: employeeSchema,
  initialValues: {
    company: '',
    department: '',
    name: '',
    nickname: '',
    lineID: '',
    lineLink: '',
    email: '',
    emailPassword: '',
    employeeCode: '',
    extNumber: '',
    printNumber: '',
    employmentStatus: '在職',
    employmentType: '正職',
    jobTitle: '',
    note: '',
    hireDate: null,
    resignationDate: null,
    unpaidLeaveStartDate: null,
    reinstatementDate: null
  }
})

// 定義表單欄位
const company = useField('company')
const department = useField('department')
const name = useField('name')
const email = useField('email')
const emailPassword = useField('emailPassword')
const employeeCode = useField('employeeCode')
const extNumber = useField('extNumber')
const printNumber = useField('printNumber')
const employmentStatus = useField('employmentStatus')
const employmentType = useField('employmentType')
const jobTitle = useField('jobTitle')
const note = useField('note')
const employeeId = useField('employeeId')
const hireDate = useField('hireDate')
const resignationDate = useField('resignationDate')
const unpaidLeaveStartDate = useField('unpaidLeaveStartDate')
const reinstatementDate = useField('reinstatementDate')
const nickname = useField('nickname')
const lineID = useField('lineID')
const lineLink = useField('lineLink')

// 處理任職狀態變更
const handleEmploymentStatusChange = (newStatus) => {
  if (newStatus === '離職') {
    // 離職狀態
    leaveDialog.value = {
      open: true,
      date: null,
      error: ''
    }
  } else if (newStatus === '留職停薪') {
    // 留停狀態，清除之前的復職日期
    reinstatementDate.value.value = null
    suspensionDialog.value = {
      open: true,
      date: null,
      error: ''
    }
  } else if (newStatus === '在職' || newStatus === '待入職') {
    // 清除離職日期（如果是從離職狀態改回在職或待入職）
    resignationDate.value.value = null

    // 檢查是否有未結束的留停狀態（有留停開始日期但沒有復職日期）
    if (unpaidLeaveStartDate.value.value && !reinstatementDate.value.value) {
      reinstatementDialog.value = {
        open: true,
        date: null,
        error: ''
      }
    }
  }
}

// 修改對話框確認按鈕處理函數
const handleLeaveConfirm = () => {
  if (!leaveDialog.value.date) {
    leaveDialog.value.error = '請選擇離職日期'
    return
  }
  resignationDate.value.value = leaveDialog.value.date
  leaveDialog.value.open = false
  leaveDialog.value.error = ''
}

const handleSuspensionConfirm = () => {
  if (!suspensionDialog.value.date) {
    suspensionDialog.value.error = '請選擇留停開始日期'
    return
  }
  unpaidLeaveStartDate.value.value = suspensionDialog.value.date
  // 確保清除復職日期
  reinstatementDate.value.value = null
  suspensionDialog.value.open = false
  suspensionDialog.value.error = ''
}

const handleReinstatementConfirm = () => {
  if (!reinstatementDialog.value.date) {
    reinstatementDialog.value.error = '請選擇留停復職日期'
    return
  }
  // 設定復職日期，不會覆蓋留停開始日期
  reinstatementDate.value.value = reinstatementDialog.value.date
  reinstatementDialog.value.open = false
  reinstatementDialog.value.error = ''
}

// 修改 openDialog 函數
const openDialog = async (item) => {
  dialog.value.open = true
  dialog.value.id = item?._id || null
  isDialogLoading.value = true

  try {
    if (item) {
      // 編輯模式
      // 先設定公司並載入部門列表
      company.value.value = item.company?._id || ''
      if (item.company?._id) {
        await handleFormCompanyChange()
      }

      // 設定其他欄位值
      department.value.value = item.department?._id || ''
      name.value.value = item.name || ''
      nickname.value.value = item.nickname || ''
      lineID.value.value = item.lineID || ''
      lineLink.value.value = item.lineLink || ''
      email.value.value = item.email ?? ''
      emailPassword.value.value = item.emailPassword || ''
      employeeCode.value.value = item.employeeCode || ''
      extNumber.value.value = item.extNumber || ''
      printNumber.value.value = item.printNumber || ''
      employmentStatus.value.value = item.employmentStatus || '在職'
      employmentType.value.value = item.employmentType || '正職'
      jobTitle.value.value = item.jobTitle || ''
      note.value.value = item.note || ''
      if (employeeId.value) {
        employeeId.value.value = item.employeeId || ''
      }
      hireDate.value.value = item.hireDate ? new Date(item.hireDate) : null
      resignationDate.value.value = item.resignationDate ? new Date(item.resignationDate) : null
      unpaidLeaveStartDate.value.value = item.unpaidLeaveStartDate ? new Date(item.unpaidLeaveStartDate) : null
      reinstatementDate.value.value = item.reinstatementDate ? new Date(item.reinstatementDate) : null
    } else {
      // 新增模式
      resetForm()
    }
  } catch (error) {
    console.error('載入員工資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入員工資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    closeDialog()
  } finally {
    isDialogLoading.value = false
  }
}

// 修改 closeDialog 函數
const closeDialog = () => {
  dialog.value.open = false
  dialog.value.id = null
  isDialogLoading.value = false
  resetForm()
  formDepartments.value = []
}

// 修改 submitEmployee 函數
const submitEmployee = handleSubmit(async (values) => {
  try {
    if (dialog.value.id) {
      // 編輯
      const { data } = await apiAuth.patch(`/employees/${dialog.value.id}`, values)
      if (data.success) {
        // 如果員工有系統用戶且任職狀態發生變化，更新用戶狀態
        if (values.employmentStatus) {
          try {
            await apiAuth.patch(`/employees/${dialog.value.id}/status-change`, {
              employmentStatus: values.employmentStatus
            })
          } catch (statusError) {
            console.warn('更新用戶狀態失敗:', statusError)
            // 不阻擋主要流程，只記錄警告
          }
        }

        await performSearch()
        closeDialog()
        createSnackbar({
          text: '員工資料更新成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增
      const { data } = await apiAuth.post('/employees', values)
      if (data.success) {
        await performSearch()
        closeDialog()
        createSnackbar({
          text: '新增員工成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message
    const errorField = error?.response?.data?.field

    // 如果有特定欄位錯誤，更新對應欄位的錯誤訊息
    if (errorField) {
      switch (errorField) {
        case 'email':
          email.setErrors([errorMessage])
          break
        case 'employeeId':
          employeeId.setErrors([errorMessage])
          break
        case 'employeeCode':
          employeeCode.setErrors([errorMessage])
          break
        case 'extNumber':
          extNumber.setErrors([errorMessage])
          break
        case 'printNumber':
          printNumber.setErrors([errorMessage])
          break
      }
    }

    createSnackbar({
      text: errorMessage || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// 對話框相關的 ref
const leaveDialog = ref({
  open: false,
  date: null,
  error: ''
})

const suspensionDialog = ref({
  open: false,
  date: null,
  error: ''
})

const reinstatementDialog = ref({
  open: false,
  date: null,
  error: ''
})

// 對話框取消按鈕處理函數
const handleLeaveCancel = () => {
  leaveDialog.value.open = false
  leaveDialog.value.error = ''
  employmentStatus.value.value = '在職'
}

const handleSuspensionCancel = () => {
  suspensionDialog.value.open = false
  suspensionDialog.value.error = ''
  employmentStatus.value.value = '在職'
}

const handleReinstatementCancel = () => {
  reinstatementDialog.value.open = false
  reinstatementDialog.value.error = ''
  employmentStatus.value.value = '留職停薪'
}

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

// 匯出相關
const isExporting = ref(false)
const exportDialog = ref({
  open: false,
  type: 'all',
  company: null,
  departments: [],
  departmentOptions: [],
  employmentStatus: [],
  companyError: '',
  departmentError: '',
  employmentStatusError: ''
})

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

// 開啟匯出對話框
const openExportDialog = () => {
  exportDialog.value = {
    open: true,
    type: 'all',
    company: null,
    departments: [],
    departmentOptions: [],
    employmentStatus: [],
    companyError: '',
    departmentError: '',
    employmentStatusError: ''
  }
}

// 關閉匯出對話框
const closeExportDialog = () => {
  exportDialog.value.open = false
}

// 處理匯出公司變更
const handleExportCompanyChange = async (companyId) => {
  exportDialog.value.departments = []
  exportDialog.value.departmentOptions = []
  exportDialog.value.companyError = ''
  exportDialog.value.departmentError = ''

  if (!companyId) return

  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: companyId }
    })
    if (data.success) {
      exportDialog.value.departmentOptions = data.result
    }
  } catch (error) {
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
}

// 全選部門
const selectAllDepartments = () => {
  exportDialog.value.departmentError = '' // 清除部門錯誤訊息
  if (exportDialog.value.departments.length === exportDialog.value.departmentOptions.length) {
    exportDialog.value.departments = []
  } else {
    exportDialog.value.departments = exportDialog.value.departmentOptions.map(dept => dept._id)
  }
}

// 全選任職狀態
const selectAllEmploymentStatus = () => {
  exportDialog.value.employmentStatusError = '' // 清除任職狀態錯誤訊息
  if (exportDialog.value.employmentStatus.length === statusOptions.length) {
    exportDialog.value.employmentStatus = []
  } else {
    exportDialog.value.employmentStatus = statusOptions.map(status => status.value)
  }
}

// 處理匯出 Excel
const handleExportExcel = async () => {
  try {
    // 驗證
    let hasError = false
    exportDialog.value.companyError = ''
    exportDialog.value.departmentError = ''
    exportDialog.value.employmentStatusError = ''

    // 檢查任職狀態（不論匯出類型都必選）
    if (!exportDialog.value.employmentStatus || exportDialog.value.employmentStatus.length === 0) {
      exportDialog.value.employmentStatusError = '請選擇至少一個任職狀態'
      hasError = true
    }

    // 如果是單一公司匯出，檢查公司和部門
    if (exportDialog.value.type === 'company') {
      if (!exportDialog.value.company) {
        exportDialog.value.companyError = '請選擇公司'
        hasError = true
      }

      // 只有在有選擇公司的情況下才檢查部門
      if (exportDialog.value.company && (!exportDialog.value.departments || exportDialog.value.departments.length === 0)) {
        exportDialog.value.departmentError = '請選擇至少一個部門'
        hasError = true
      }
    }

    if (hasError) return

    isExporting.value = true

    // 準備查詢參數
    const params = {
      type: exportDialog.value.type
    }

    if (exportDialog.value.type === 'company') {
      params.company = exportDialog.value.company
      if (exportDialog.value.departments.length > 0) {
        params.departments = exportDialog.value.departments.join(',')
      }
    }

    // 添加任職狀態參數
    if (exportDialog.value.employmentStatus.length > 0) {
      params.employmentStatus = exportDialog.value.employmentStatus.join(',')
    }

    // 呼叫 API 取得資料
    const { data } = await apiAuth.get('/employees/export', { params })

    if (data.success) {
      // 載入 XLSX
      const XLSX = await loadXLSX()

      // 準備 Excel 資料
      const excelData = data.result.map(employee => {
        // 格式化日期函數
        const formatExcelDate = (date) => {
          if (!date) return ''
          const d = new Date(date)
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${year}/${month}/${day}`
        }

        return {
          '科威員編': employee.employeeCode,
          '姓名': employee.name,
          '暱稱': employee.nickname || '',
          'LineID': employee.lineID || '',
          'Line連結': employee.lineLink || '',
          '公司': employee.company?.name || '',
          '部門': employee.department?.name || '',
          '聘僱類型': employee.employmentType || '正職',
          '職稱': employee.jobTitle || '',
          '分機號碼': employee.extNumber,
          '列印編號': employee.printNumber,
          'Email': employee.email,
          'Email密碼': employee.emailPassword,
          '任職狀態': employee.employmentStatus,
          '到職日期': formatExcelDate(employee.hireDate),
          '離職日期': formatExcelDate(employee.resignationDate),
          '留停開始日期': formatExcelDate(employee.unpaidLeaveStartDate),
          '留停復職日期': formatExcelDate(employee.reinstatementDate),
          '備註': employee.note || ''
        }
      })

      // 創建工作表
      const ws = XLSX.utils.json_to_sheet(excelData)

      // 設定欄寬
      const colWidths = {
        '科威員編': 15,
        '姓名': 15,
        '暱稱': 15,
        'LineID': 15,
        'Line連結': 30,
        '公司': 20,
        '部門': 20,
        '聘僱類型': 12,
        '職稱': 12,
        '分機號碼': 12,
        '列印編號': 12,
        'Email': 30,
        'Email密碼': 15,
        '任職狀態': 12,
        '到職日期': 15,
        '離職日期': 15,
        '留停開始日期': 15,
        '留停復職日期': 15,
        '備註': 40
      }

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }))

      // 創建工作簿
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '員工資料')

      // 生成檔案並下載
      const fileName = exportDialog.value.type === 'all'
        ? '所有員工資料清單.xlsx'
        : `${companies.value.find(c => c._id === exportDialog.value.company)?.name}員工資料清單.xlsx`

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
  } finally {
    isExporting.value = false
  }
}

// 新增 appendCompanyDomain 函數
const appendCompanyDomain = () => {
  const currentValue = email.value.value || ''
  // 如果已經包含 @ystravel.com.tw，則不做任何操作
  if (currentValue.includes('@ystravel.com.tw')) return

  // 移除現有的 @ 及其後面的內容
  const cleanValue = currentValue.split('@')[0]

  // 如果有值才附加網域
  if (cleanValue && cleanValue.trim() !== '') {
    email.value.value = `${cleanValue}@ystravel.com.tw`
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


// 複製確認對話框
const copyConfirmDialog = ref({
  open: false,
  employee: null,
  selectedRole: 0, // 預設一般用戶
  roleError: ''
})

// RBAC 角色選項
const roleOptions = ref([])

// 載入角色列表
const loadRoles = async () => {
  try {
    const roles = await permissionStore.getAllRoles()
    console.log('載入的角色列表:', roles)
    roleOptions.value = roles
      .filter(role => role.isActive)
      .map(role => ({
        value: role._id,
        title: role.name,
        description: role.description
      }))
    console.log('處理後的角色選項:', roleOptions.value)
  } catch (error) {
    console.error('載入角色列表失敗:', error)
    createSnackbar({
      text: '載入角色列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 組件掛載時載入角色列表
loadRoles()

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

        // 在轉換前先處理特定欄位的格式，確保文字欄位不會被當作數字處理
        const range = XLSX.utils.decode_range(worksheet['!ref'])

        // 找出需要保持文字格式的欄位索引
        const textFields = ['科威員編', 'Email密碼']
        const textColumnIndices = []

        // 檢查標題列，找出文字欄位的索引
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })]
          if (headerCell && textFields.includes(headerCell.v)) {
            textColumnIndices.push(C)
          }
        }

        // 將指定欄位的數字類型轉換為文字類型
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // 跳過標題列
          for (const C of textColumnIndices) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
            const cell = worksheet[cellRef]
            if (cell) {
              if (cell.t === 'n') { // 如果是數字類型
                // 將數字轉換為字串
                let strValue = cell.v.toString()

                // 對於科威員編，如果是純數字且小於4位數，自動補零到4位
                const headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })]
                if (headerCell && headerCell.v === '科威員編') {
                  if (/^\d+$/.test(strValue) && strValue.length < 4) {
                    strValue = strValue.padStart(4, '0')
                  }
                }

                cell.t = 's' // 轉換為文字類型
                cell.v = strValue
                cell.w = strValue // 設定格式化顯示值
              } else if (cell.t === 's' && cell.v) {
                // 如果已經是文字，檢查是否需要補零
                const headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })]
                if (headerCell && headerCell.v === '科威員編') {
                  let strValue = cell.v.toString().trim()
                  if (/^\d+$/.test(strValue) && strValue.length < 4) {
                    strValue = strValue.padStart(4, '0')
                    cell.v = strValue
                    cell.w = strValue
                  }
                }
              }
            }
          }
        }

        // 轉換為 JSON，使用格式化後的值
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // 使用格式化的值而不是原始值
          defval: '', // 空單元格的默認值
          dateNF: 'yyyy/mm/dd' // 日期格式
        })

        // 準備匯入資料
        const employees = jsonData.map(row => {
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

          // 印出原始日期資料，用於除錯
          console.log('Excel 原始日期:', {
            hireDate: row['到職日期'],
            type: typeof row['到職日期']
          })

          return {
            employeeCode: row['科威員編']?.toString(),
            name: row['姓名'],
            nickname: row['暱稱'],
            lineID: row['LineID'],
            lineLink: row['Line連結'],
            company: row['公司'],
            department: row['部門'],
            employmentType: row['聘僱類型'] || '正職',
            jobTitle: row['職稱'] || '',
            extNumber: row['分機號碼']?.toString().trim(),
            printNumber: row['列印編號']?.toString().trim(),
            email: row['Email'],
            emailPassword: row['Email密碼'],
            employmentStatus: row['任職狀態'],
            hireDate: formatDate(row['到職日期']),
            resignationDate: formatDate(row['離職日期']),
            unpaidLeaveStartDate: formatDate(row['留停開始日期']),
            reinstatementDate: formatDate(row['留停復職日期']),
            note: row['備註']
          }
        })

        // 印出處理後的資料，用於除錯
        console.log('處理後的匯入資料:', JSON.stringify(employees, null, 2))

        // 呼叫 API
        const { data: response } = await apiAuth.post('/employees/import', {
          employees
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

// 在 script setup 部分添加以下函數
const downloadExampleFile = () => {
  const link = document.createElement('a')
  link.href = 'https://eip.ystravel.com.tw/GInternational/uploads/example/example_employeeList.xlsx'
  link.download = 'example_employeeList.xlsx'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  createSnackbar({
    text: '範例檔案下載成功',
    snackbarProps: { color: 'teal-lighten-1' }
  })
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

const employmentTypeOptions = [
  { text: '正職', value: '正職' },
  { text: '兼職', value: '兼職' },
  { text: '實習生', value: '實習生' }
]

const jobTitleOptions = [  // 有順序之分
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
  { text: '旅遊規劃師', value: '旅遊規劃師' },
  { text: '旅遊專案企劃專員', value: '旅遊專案企劃專員' },
  { text: '助理工程師', value: '助理工程師' },
  { text: 'Indoor', value: 'Indoor' },
  { text: '工讀生', value: '工讀生' },
  { text: '實習生', value: '實習生' },
  { text: '顧問', value: '顧問' }
]

// 複製員工為系統用戶
const copyEmployeeToUser = (employee) => {
  copyConfirmDialog.value = {
    open: true,
    employee: employee,
    selectedRole: null, // 重置為空，讓用戶選擇角色
    roleError: ''
  }
}

// 確認複製員工為系統用戶
const confirmCopyEmployeeToUser = async () => {
  // 驗證權限選擇
  if (copyConfirmDialog.value.selectedRole === null || copyConfirmDialog.value.selectedRole === undefined) {
    copyConfirmDialog.value.roleError = '請選擇權限'
    return
  }

  const employee = copyConfirmDialog.value.employee
  console.log('準備發送請求:', {
    employeeId: employee._id,
    selectedRole: copyConfirmDialog.value.selectedRole,
    roleId: copyConfirmDialog.value.selectedRole
  })
  try {
    const { data } = await apiAuth.post(`/employees/${employee._id}/copy-to-user`, {
      roleId: copyConfirmDialog.value.selectedRole, // 使用選擇的 RBAC 角色 ID
      password: `ys${employee.extNumber}${employee.printNumber}`
    })

    if (data.success) {
      // 關閉對話框
      copyConfirmDialog.value.open = false

      // 更新表格資料
      await performSearch()

      const message = data.message.includes('建立關聯')
        ? `員工 ${employee.name} 已與現有系統用戶建立關聯`
        : `員工 ${employee.name} 已成功新增為系統用戶`

      createSnackbar({
        text: message,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('複製員工為用戶失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
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
