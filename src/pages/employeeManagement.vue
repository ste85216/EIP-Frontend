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
                <v-card class="elevation-4 rounded-lg py-4 py-sm-8 px-4 px-sm-2 px-xl-4">
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
                      color="purple-darken-1"
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
        <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-4 px-md-8 mt-1 bg-white">
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
                  <v-col cols="4">
                    <v-btn
                      prepend-icon="mdi-account-plus"
                      variant="outlined"
                      color="blue-grey-darken-2"
                      class="me-4"
                      @click="openDialog(null)"
                    >
                      新增員工
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="3"
                    class="d-flex align-center"
                  >
                    <v-icon
                      v-tooltip:start="'可搜尋系統員工編號、姓名、Email、科威員工編號、分機號碼、列印號碼、備註'"
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
                  <td>{{ item.employeeId }}</td>
                  <td>{{ item.name }}</td>
                  <td>
                    {{ item.company?.name }}
                  </td>
                  <td>
                    {{ item.department?.name }}
                  </td>
                  <td>
                    {{ item.employeeCode }}
                  </td>
                  <td>
                    {{ item.extNumber }}
                  </td>
                  <td>
                    {{ item.printNumber }}
                  </td>
                  <td>
                    {{ item.email }}
                  </td>
                  <td>
                    <v-chip
                      v-tooltip="getStatusDateTooltip(item)"
                      size="small"
                      variant="outlined"
                      :color="getStatusColor(item.employmentStatus)"
                    >
                      {{ item.employmentStatus }}
                    </v-chip>
                  </td>
                  <td>
                    <div 
                      v-tooltip="item.note"
                      class="note-cell"
                    >
                      {{ item.note }}
                    </div>
                  </td>
                  <td class="text-center">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      :size="buttonSize"
                      :ripple="false"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-lighten-1"
                      variant="plain"
                      :size="buttonSize"
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
    >
      <v-card class="rounded-lg px-4 py-6">
        <div class="card-title px-4 py-3">
          {{ dialog.id ? '編輯員工資料' : '新增員工' }}
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
              color="purple-darken-2"
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
                      mdi-office-building-outline
                    </v-icon> 任職資料
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
                      mdi-calendar-outline
                    </v-icon> 日期資料
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

              <!-- 到職日期 (必填) -->
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
                  :rules="[v => !!v || '請選擇到職日期']"
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
      <v-card class="rounded-lg px-8 pt-6 pb-4">
        <div class="card-title mb-2">
          離職日期
        </div>
        <v-card-text class="px-0 pb-0">
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
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            @click="handleLeaveCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            size="small"
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
      <v-card class="rounded-lg px-8 pt-6 pb-4">
        <div class="card-title mb-2">
          留停開始日期
        </div>
        <v-card-text class="px-0 pb-0">
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
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            @click="handleSuspensionCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            size="small"
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
      <v-card class="rounded-lg px-8 pt-6 pb-4">
        <div class="card-title mb-2">
          留停復職日期
        </div>
        <v-card-text class="px-0 pb-0">
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
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            @click="handleReinstatementCancel"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            size="small"
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
    >
      <v-card class="rounded-lg px-4 pt-5 pb-4">
        <v-card-title class="card-title mb-2">
          匯出員工資料
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
                  label="所有員工資料"
                  value="all"
                  color="purple-darken-1"
                />
                <v-radio
                  label="單一公司資料"
                  value="company"
                  color="purple-darken-1"
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
                    color="purple-lighten-1"
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
                    color="purple-lighten-1"
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

    <!-- 匯入 Excel 對話框 -->
    <v-dialog
      v-model="importDialog.open"
      max-width="380"
    >
      <v-card class="rounded-lg px-4 pt-5 pb-4">
        <v-card-title class="card-title mb-2">
          匯入員工資料
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
    title: '員工管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const router = useRouter()
const { smAndUp, mdAndUp } = useDisplay()

// 響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => mdAndUp.value ? '1200' : '100%')

// 表格相關
const tableHeaders = [
  { title: '系統編號', key: 'employeeId', minWidth: '120px', align: 'start', sortable: true },
  { title: '姓名', key: 'name', minWidth: '90px', align: 'start', sortable: true },
  { title: '公司', key: 'company.name', minWidth: '90px', align: 'start', sortable: true },
  { title: '部門', key: 'department.name', align: 'start', sortable: true },
  { title: '科威員編', key: 'employeeCode', align: 'start', sortable: true },
  { title: '分機號碼', key: 'extNumber', align: 'start', sortable: true },
  { title: '列印編號', key: 'printNumber', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: '狀態', key: 'employmentStatus', align: 'start', sortable: true },
  { title: '備註', key: 'note', width:'160px', align: 'start', sortable: true },
  { title: '操作', key: 'actions', minWidth: '130px', align: 'center', sortable: false }
]

// 表格相關響應式變數
const tableLoading = ref(false)
const tableItems = ref([])
const tablePage = ref(1)
const tableItemsPerPage = ref(10)
const tableItemsLength = ref(0)
const tableSortBy = ref([{ key: 'employeeId', order: 'asc' }])

// 搜尋相關響應式變數
const quickSearchText = ref('')
const companies = ref([])
const departments = ref([])
const searchCriteria = ref({
  company: '',
  department: '',
  status: '',
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
    return tableHeaders.filter(header => 
      ['employeeId', 'name', 'employmentStatus', 'actions'].includes(header.key)
    )
  }
  if (!mdAndUp.value) {
    return tableHeaders.filter(header => 
      !['employeeCode'].includes(header.key)
    )
  }
  return tableHeaders
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
      quickSearch: quickSearchText.value,
      company: searchCriteria.value.company,
      department: searchCriteria.value.department,
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
    status: '',
    dateType: '',
    dateRange: []
  }
  quickSearchText.value = ''
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

watch(quickSearchText, () => {
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
    await apiAuth.delete(`/employees/${confirmDeleteDialog.value.id}`)
    await performSearch()
    confirmDeleteDialog.value.open = false
    createSnackbar({
      text: '刪除員工成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
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
    email: '',
    emailPassword: '',
    employeeCode: '',
    extNumber: '',
    printNumber: '',
    employmentStatus: '在職',
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
const note = useField('note')
const employeeId = useField('employeeId')
const hireDate = useField('hireDate')
const resignationDate = useField('resignationDate')
const unpaidLeaveStartDate = useField('unpaidLeaveStartDate')
const reinstatementDate = useField('reinstatementDate')

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
      email.value.value = item.email ?? ''
      emailPassword.value.value = item.emailPassword || ''
      employeeCode.value.value = item.employeeCode || ''
      extNumber.value.value = item.extNumber || ''
      printNumber.value.value = item.printNumber || ''
      employmentStatus.value.value = item.employmentStatus || '在職'
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

// 取得狀態對應的日期提示文字
const getStatusDateTooltip = (item) => {
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
          '公司': employee.company?.name || '',
          '部門': employee.department?.name || '',
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
        '公司': 20,
        '部門': 20,
        '分機號碼': 12,
        '列印編號': 12,
        'Email': 30,
        'Email密碼': 15,
        '任職狀態': 12,
        '到職日期': 15,
        '離職日期': 15,
        '留停開始日期': 15,
        '留停復職日期': 15,
        '備註': 30
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
            company: row['公司'],
            department: row['部門'],
            extNumber: row['分機號碼']?.toString(),
            printNumber: row['列印編號']?.toString(),
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
  link.href = 'https://yst001.com/GInternational/uploads/example/example_employeeList.xlsx'
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
</script>

<style lang="scss" scoped>
.v-table :deep(thead) {
  background-color: #455a64 !important;
  color: #fff !important;
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: rgb(255, 250, 240);
}

.note-cell {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
