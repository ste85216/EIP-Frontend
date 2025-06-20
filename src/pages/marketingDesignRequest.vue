<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-5 px-5 px-lg-10 px-xxl-0">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg py-7 px-0">
          <div class="d-flex align-center px-7">
            <h3 class="me-4">
              美編需求申請
            </h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-6" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-9">
            <v-row class="mb-2">
              <!-- 申請日期 -->
              <v-col cols="2">
                <div class="d-flex align-center">
                  <span class="text-label">申請日期 :</span>
                  <v-date-input
                    v-model="searchCriteria.applicationDate"
                    class="ms-4"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    hide-details
                    clearable
                    multiple="range"
                    :cancel-text="'取消'"
                    :ok-text="'確認'"
                    @update:model-value="handleDateRangeChange"
                  />
                </div>
              </v-col>

              <!-- 申請人 -->
              <v-col cols="2">
                <div class="d-flex align-center">
                  <span class="text-label">申請人 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.applicant"
                    class="ms-4"
                    :items="employees"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇申請人"
                    hide-details
                    :filter="customFilter"
                  />
                </div>
              </v-col>

              <!-- 產物類型 -->
              <v-col cols="2">
                <div class="d-flex align-center">
                  <span class="text-label">產物類型 :</span>
                  <v-select
                    v-model="searchCriteria.productType"
                    class="ms-4"
                    :items="productTypeOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇產物類型"
                    hide-details
                  />
                </div>
              </v-col>

              <!-- 狀態 -->
              <v-col cols="2">
                <div class="d-flex align-center">
                  <span class="text-label">狀態 :</span>
                  <v-select
                    v-model="searchCriteria.status"
                    class="ms-4"
                    :items="[
                      { value: 'pending', text: '待處理' },
                      { value: 'in_progress', text: '處理中' },
                      { value: 'completed', text: '已完成' },
                      { value: 'cancelled', text: '已取消' }
                    ]"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇狀態"
                    hide-details
                  />
                </div>
              </v-col>

              <!-- 處理人員 -->
              <v-col cols="2">
                <div class="d-flex align-center">
                  <span class="text-label">處理人員 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.assignedDesigner"
                    class="ms-4"
                    :items="marketingDesigners"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇處理人員"
                    hide-details
                    :filter="customFilter"
                  />
                </div>
              </v-col>

              <!-- 搜尋按鈕 -->
              <v-col cols="2">
                <v-row class="d-flex justify-end">
                  <v-col
                    cols="8"
                    class="ps-0"
                  >
                    <v-btn
                      color="cyan-darken-2"
                      prepend-icon="mdi-magnify"
                      :loading="loading"
                      block
                      @click="fetchTableData"
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

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center ps-1 my-1">
                <v-btn
                  color="teal-darken-2"
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  @click="openDialog()"
                >
                  新增申請
                </v-btn>
                <v-spacer />
                <v-col cols="2">
                  <div class="d-flex align-center">
                    <v-icon
                      v-tooltip:start="'可搜尋申請編號、申請人、產物類型、狀態、處理人員'"
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
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 表格區塊 -->
          <v-card-text class="px-6">
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
                  <td>{{ item.designRequestNumber }}</td>
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
                  <td>{{ item.applicant?.name }} ({{ item.applicant?.employeeCode }})</td>
                  <td>{{ getProductTypeText(item.productType) }}</td>
                  <td>
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                      label
                      class="font-weight-medium"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </td>
                  <td>{{ item.assignedDesigner?.name || '尚未指派' }}</td>
                  <td class="text-center">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 查看詳細資料對話框 -->
    <v-dialog
      v-model="dialog.show"
      max-width="1200"
    >
      <v-card class="rounded-lg pb-2">
        <v-card-title class="d-flex align-center px-6 py-1 bg-light-blue-darken-2">
          <span class="card-title">申請單詳細資料</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <v-row>
            <!-- 基本資訊 -->
            <v-col cols="12">
              <div class="d-flex align-center mb-4">
                <v-icon
                  icon="mdi-package-variant"
                  size="18"
                  color="primary"
                  class="me-2"
                />
                <span class="text-primary card-title">基本資訊</span>
              </div>
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-identifier"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">申請編號</span>
                    </div>
                    <div class="text-body-2">
                      {{ formData.designRequestNumber || '( 無 )' }}
                    </div>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-calendar-clock"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">申請日期</span>
                    </div>
                    <div class="text-body-2">
                      {{ formatDate(formData.applicationDate) }}
                      <span class="text-caption text-grey-darken-1">
                        {{ formatTime(formData.applicationDate) }}
                      </span>
                    </div>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-account-circle"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">申請人</span>
                    </div>
                    <div class="text-body-2">
                      {{ formData.applicant?.name ? `${formData.applicant.name} (${formData.applicant.employeeCode})` : '( 無 )' }}
                    </div>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-shape"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">產物類型</span>
                    </div>
                    <div class="text-body-2">
                      {{ formData.productType ? getProductTypeText(formData.productType) : '( 無 )' }}
                    </div>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-progress-check"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">狀態</span>
                    </div>
                    <div class="text-body-2">
                      <v-chip
                        :color="getStatusColor(formData.status)"
                        size="small"
                        label
                        class="font-weight-medium elevation-0"
                      >
                        {{ getStatusText(formData.status) }}
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    class="info-item-card pa-3"
                    variant="outlined"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        icon="mdi-account-edit"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">處理人員</span>
                    </div>
                    <div class="text-body-2">
                      {{ formData.assignedDesigner?.name || '尚未指派' }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <!-- 產物資訊 -->
            <v-col cols="12">
              <div class="d-flex align-center mb-4 mt-4">
                <v-icon
                  icon="mdi-form-textbox"
                  size="18"
                  color="primary"
                  class="me-2"
                />
                <span class="text-primary card-title">申請資訊</span>
              </div>
              <v-row>
                <template
                  v-for="field in formFields"
                  :key="field.name"
                >
                  <v-col
                    :cols="field.cols?.xs || 12"
                    :sm="field.cols?.sm || 6"
                    :md="field.cols?.md || field.cols?.lg || 4"
                  >
                    <v-card
                      class="info-item-card pa-3"
                      variant="outlined"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          :icon="getFieldIcon(field.type)"
                          size="16"
                          color="blue-grey-darken-1"
                          class="me-2"
                        />
                        <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">{{ getDisplayLabel(field.label) }}</span>
                      </div>
                      <!-- 一般文字欄位 -->
                      <div
                        v-if="field.type === 'text' || field.type === 'textarea'"
                        class="text-body-2"
                      >
                        {{ formData[field.name] || '( 無 )' }}
                      </div>
                      <!-- 日期欄位 -->
                      <div
                        v-else-if="field.type === 'date'"
                        class="text-body-2"
                      >
                        {{ formData[field.name] ? formatDate(formData[field.name]) : '( 無 )' }}
                      </div>
                      <!-- 數字欄位 -->
                      <div
                        v-else-if="field.type === 'number'"
                        class="text-body-2"
                      >
                        {{ formData[field.name] !== null && formData[field.name] !== undefined && formData[field.name] !== '' ? formData[field.name] : '( 無 )' }}
                      </div>
                      <!-- 核取方塊 -->
                      <div
                        v-else-if="field.type === 'checkbox'"
                        class="text-body-2"
                      >
                        <v-icon :color="formData[field.name] ? 'success' : 'grey'">
                          {{ formData[field.name] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                        </v-icon>
                        {{ formData[field.name] ? '是' : '否' }}
                      </div>
                      <!-- 檔案欄位 -->
                      <div
                        v-else-if="field.type === 'file'"
                        class="text-body-2"
                      >
                        <template v-if="formData[field.name] && formData[field.name].length > 0">
                          <div
                            v-for="(file, index) in formData[field.name]"
                            :key="index"
                            class="d-flex align-center mb-1"
                          >
                            <v-icon
                              size="small"
                              class="me-2"
                            >
                              mdi-file
                            </v-icon>
                            <span class="text-grey-darken-1">
                              {{ getFileName(file) }}
                            </span>
                          </div>
                        </template>
                        <div
                          v-else
                          class="text-grey"
                        >
                          ( 無檔案 )
                        </div>
                      </div>
                      <!-- 行程陣列欄位 -->
                      <div
                        v-else-if="field.type === 'array'"
                        class="w-100"
                      >
                        <div class="d-flex align-center mb-2">
                          <span class="text-subtitle-2">{{ field.label }}</span>
                          <v-spacer />
                          <v-btn
                            color="primary"
                            variant="text"
                            size="small"
                            prepend-icon="mdi-plus"
                            @click="addArrayItem(field.name)"
                          >
                            新增行程
                          </v-btn>
                        </div>

                        <v-card
                          v-for="(item, index) in formData[field.name]"
                          :key="index"
                          class="mb-4 pa-4"
                          variant="outlined"
                        >
                          <div class="d-flex align-center mb-2">
                            <span class="text-subtitle-2">行程 {{ index + 1 }}</span>
                            <v-spacer />
                            <v-btn
                              color="error"
                              variant="text"
                              size="small"
                              icon="mdi-delete"
                              @click="removeArrayItem(field.name, index)"
                            />
                          </div>

                          <v-row>
                            <v-col
                              v-for="subField in field.arrayFields"
                              :key="subField.name"
                              cols="12"
                              sm="6"
                              md="4"
                            >
                              <!-- 文字輸入欄位 -->
                              <v-text-field
                                v-if="subField.type === 'text'"
                                v-model="formData[field.name][index][subField.name]"
                                :label="subField.label"
                                variant="outlined"
                                density="compact"

                                :readonly="dialog.isEdit"
                                :rules="subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []"
                              />

                              <!-- 多行文字輸入欄位 -->
                              <v-textarea
                                v-else-if="subField.type === 'textarea'"
                                v-model="formData[field.name][index][subField.name]"
                                :label="subField.label"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []"
                                auto-grow
                                rows="3"
                              />

                              <!-- 數字輸入欄位 -->
                              <v-text-field
                                v-else-if="subField.type === 'number'"
                                v-model.number="formData[field.name][index][subField.name]"
                                :label="subField.label"
                                type="number"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="[
                                  ...(subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []),
                                  ...(subField.min !== undefined ? [v => v >= subField.min || `${subField.label.replace('* ', '')}不能小於${subField.min}`] : [])
                                ]"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </div>
                    </v-card>
                  </v-col>
                </template>
              </v-row>
            </v-col>

            <!-- 處理進度 -->
            <v-col
              v-if="formData.progressHistory && formData.progressHistory.length > 0"
              cols="12"
            >
              <div class="d-flex align-center mb-4 mt-4">
                <v-icon
                  icon="mdi-timeline-clock"
                  color="primary"
                  class="me-2"
                />
                <span class="text-primary text-h6 font-weight-medium">處理進度</span>
              </div>
              <v-timeline density="compact">
                <v-timeline-item
                  v-for="(progress, index) in formData.progressHistory"
                  :key="index"
                  :dot-color="getStatusColor(progress.status)"
                  size="small"
                >
                  <template #opposite>
                    <div class="text-caption">
                      {{ formatDateTime(progress.updatedAt) }}
                    </div>
                  </template>
                  <div class="text-subtitle-2">
                    {{ getStatusText(progress.status) }}
                  </div>
                  <div
                    v-if="progress.comment"
                    class="text-grey"
                  >
                    {{ progress.comment }}
                  </div>
                  <div class="text-caption text-grey">
                    處理人員：{{ progress.updatedBy?.name }}
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="closeDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增申請對話框 -->
    <v-dialog
      v-model="addDialog.show"
      max-width="1200"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-teal-darken-2 ">
          <span class="card-title">新增申請單</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-7">
          <v-form
            ref="form"
            v-model="formValid"
          >
            <!-- 基本資訊區塊 -->
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
                      color="teal-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="2"
                    class="d-flex align-center justify-center text-teal-darken-2"
                  >
                    <v-icon
                      size="18"
                      class="me-2 text-teal-darken-2"
                    >
                      mdi-package-variant
                    </v-icon> 基本資訊
                  </v-col>
                  <v-col
                    cols="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="teal-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 產物類型選擇 -->
              <v-col
                cols="12"
                sm="6"
                lg="4"
              >
                <v-select
                  v-model="formData.productType"
                  :items="productTypeOptions"
                  item-title="label"
                  item-value="value"
                  label="* 產物類型"
                  variant="outlined"
                  density="compact"
                  :readonly="dialog.isEdit"
                  :rules="[v => !!v || '請選擇產物類型']"
                  @update:model-value="handleProductTypeChange"
                />
              </v-col>

              <!-- 申請人選擇 -->
              <v-col
                cols="12"
                sm="6"
                lg="4"
              >
                <v-autocomplete
                  v-model="formData.applicant"
                  :items="employees"
                  item-title="label"
                  item-value="value"
                  label="* 申請人"
                  variant="outlined"
                  density="compact"
                  :readonly="dialog.isEdit"
                  :rules="[v => !!v || '請選擇申請人']"
                  clearable
                  :menu-props="{ maxHeight: 400 }"
                  :filter="customFilter"
                />
              </v-col>
            </v-row>

            <!-- 申請資訊區塊 -->
            <template v-if="formData.productType && formData.applicant">
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
                        color="teal-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="2"
                      class="d-flex align-center justify-center text-teal-darken-2"
                    >
                      <v-icon
                        size="18"
                        class="me-2 text-teal-darken-2"
                      >
                        mdi-form-textbox
                      </v-icon> 申請資訊
                    </v-col>
                    <v-col
                      cols="5"
                      class="d-flex align-center justify-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="teal-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- 動態表單欄位 -->
                <template v-if="formFields.length > 0">
                  <v-col
                    v-for="field in formFields"
                    :key="field.name"
                    :cols="field.cols?.xs || 12"
                    :sm="field.cols?.sm || 6"
                    :lg="field.cols?.lg || 4"
                  >
                    <!-- 文字輸入欄位 -->
                    <v-text-field
                      v-if="field.type === 'text'"
                      v-model="formData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      :readonly="dialog.isEdit"
                      :rules="field.required === true ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                    />

                    <!-- 多行文字輸入欄位 -->
                    <v-textarea
                      v-else-if="field.type === 'textarea'"
                      v-model="formData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      :readonly="dialog.isEdit"
                      :rules="field.required === true ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                      auto-grow
                      rows="5"
                    />

                    <!-- 日期選擇欄位 -->
                    <v-date-input
                      v-else-if="field.type === 'date'"
                      v-model="formData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      clearable
                      :disabled="dialog.isEdit"
                      :rules="field.required === true ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : []"
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                    />

                    <!-- 數字輸入欄位 -->
                    <v-text-field
                      v-else-if="field.type === 'number'"
                      v-model.number="formData[field.name]"
                      :label="field.label"
                      type="number"
                      variant="outlined"
                      density="compact"
                      :readonly="dialog.isEdit"
                      :rules="[
                        ...(field.required === true ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []),
                        ...(field.min !== undefined ? [v => v >= field.min || `${field.label.replace('* ', '')}不能小於${field.min}`] : [])
                      ]"
                    />

                    <!-- 檔案上傳欄位 -->
                    <v-file-input
                      v-else-if="field.type === 'file'"
                      v-model="formData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      :multiple="field.multiple"
                      :accept="field.accept"
                      :readonly="dialog.isEdit"
                      :rules="field.required === true ? [v => !!v && v.length > 0 || `請上傳${field.label.replace('* ', '')}`] : []"
                      show-size
                      truncate-length="15"
                      prepend-icon="mdi-paperclip"
                    />

                    <!-- 行程陣列欄位 -->
                    <div
                      v-else-if="field.type === 'array'"
                      class="w-100"
                    >
                      <div class="d-flex align-center mb-2">
                        <span class="text-subtitle-2">{{ field.label }}</span>
                        <v-spacer />
                        <v-btn
                          color="primary"
                          variant="text"
                          size="small"
                          prepend-icon="mdi-plus"
                          @click="addArrayItem(field.name)"
                        >
                          新增行程
                        </v-btn>
                      </div>

                      <v-card
                        v-for="(item, index) in formData[field.name]"
                        :key="index"
                        class="mb-4 pa-4"
                        variant="outlined"
                      >
                        <div class="d-flex align-center mb-2">
                          <span class="text-subtitle-2">行程 {{ index + 1 }}</span>
                          <v-spacer />
                          <v-btn
                            color="error"
                            variant="text"
                            size="small"
                            icon="mdi-delete"
                            @click="removeArrayItem(field.name, index)"
                          />
                        </div>

                        <v-row>
                          <v-col
                            v-for="subField in field.arrayFields"
                            :key="subField.name"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <!-- 文字輸入欄位 -->
                            <v-text-field
                              v-if="subField.type === 'text'"
                              v-model="formData[field.name][index][subField.name]"
                              :label="subField.label"
                              variant="outlined"
                              density="compact"
                              :readonly="dialog.isEdit"
                              :rules="subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []"
                            />

                            <!-- 多行文字輸入欄位 -->
                            <v-textarea
                              v-else-if="subField.type === 'textarea'"
                              v-model="formData[field.name][index][subField.name]"
                              :label="subField.label"
                              variant="outlined"
                              density="compact"
                              :readonly="dialog.isEdit"
                              :rules="subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []"
                              auto-grow
                              rows="3"
                            />

                            <!-- 數字輸入欄位 -->
                            <v-text-field
                              v-else-if="subField.type === 'number'"
                              v-model.number="formData[field.name][index][subField.name]"
                              :label="subField.label"
                              type="number"
                              variant="outlined"
                              density="compact"
                              :readonly="dialog.isEdit"
                              :rules="[
                                ...(subField.required ? [v => !!v || `請輸入${subField.label.replace('* ', '')}`] : []),
                                ...(subField.min !== undefined ? [v => v >= subField.min || `${subField.label.replace('* ', '')}不能小於${subField.min}`] : [])
                              ]"
                            />
                          </v-col>
                        </v-row>
                      </v-card>
                    </div>

                    <!-- 核取方塊 -->
                    <v-checkbox
                      v-else-if="field.type === 'checkbox'"
                      v-model="formData[field.name]"
                      :label="field.label"
                      :readonly="dialog.isEdit"
                      density="compact"
                      color="primary"
                      hide-details
                    />
                  </v-col>
                </template>
              </v-row>
            </template>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-4 mb-2">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :loading="submitting"
            @click="confirmSubmit"
          >
            送出申請
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 確認送出對話框 -->
    <v-dialog
      v-model="confirmDialog.show"
      max-width="360"
      persistent
    >
      <v-card class="rounded-lg py-2 px-1">
        <v-card-title class="d-flex align-center px-6 py-4">
          <span class="card-title">確認送出</span>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <p>請確認所有填寫的資料都正確無誤。送出後將無法修改。</p>
        </v-card-text>

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="confirmDialog.show = false"
          >
            返回
          </v-btn>
          <v-btn
            color="teal-darken-1"
            class="ms-2"
            variant="outlined"
            :loading="submitting"
            @click="handleSubmit"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { debounce } from 'lodash'

// 頁面定義
definePage({
  meta: {
    title: '美編需求申請管理 | GInternational',
    login: false  // 不需要登入
  }
})

const { api } = useApi()  // 只引入不需要驗證的 api
const createSnackbar = useSnackbar()

// 表格相關
const loading = ref(false)
const tableItems = ref([])
const totalItems = ref(0)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'applicationDate', order: 'desc' }]
})

// 表格欄位定義
const tableHeaders = [
  { title: '申請編號', key: 'designRequestNumber', sortable: true },
  { title: '申請日期', key: 'applicationDate', sortable: true },
  { title: '申請人', key: 'applicant.name', sortable: false },
  { title: '產物類型', key: 'productType', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '處理人員', key: 'assignedDesigner.name', sortable: false },
  { title: '查看', key: 'actions', align: 'center', sortable: false }
]

// 對話框相關
const dialog = reactive({
  show: false,
  isEdit: false
})

const addDialog = reactive({
  show: false
})

const confirmDialog = reactive({
  show: false
})

const form = ref(null)
const formValid = ref(false)
const submitting = ref(false)

// 表單資料
const formData = reactive({
  productType: '',
  applicant: '',
  // 其他欄位會在選擇產物類型後動態添加
})

// 產物類型選項
const productTypeOptions = ref([])

// 動態表單欄位
const formFields = ref([])

// 員工列表
const employees = ref([])
const marketingDesigners = ref([])

// 搜尋條件
const searchCriteria = reactive({
  search: '',
  applicationDate: [],
  applicant: '',
  productType: '',
  status: '',
  assignedDesigner: ''
})

// 快速搜尋
const quickSearch = ref('')
const isSearching = ref(false)

// 處理日期範圍變更
const handleDateRangeChange = () => {
  if (searchCriteria.applicationDate?.length === 2) {
    const [start, end] = searchCriteria.applicationDate
    if (start && end) {
      // 設定開始日期為當天的 00:00:00
      const startDate = new Date(start)
      startDate.setHours(0, 0, 0, 0)

      // 設定結束日期為當天的 23:59:59.999
      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999)

      // 更新搜尋條件
      searchCriteria.applicationDate = [startDate.toISOString(), endDate.toISOString()]
    }
  }
}

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.search = ''
  searchCriteria.applicationDate = []
  searchCriteria.applicant = ''
  searchCriteria.productType = ''
  searchCriteria.status = ''
  searchCriteria.assignedDesigner = ''
  fetchTableData()
}

// 取得表格資料
const fetchTableData = async () => {
  if (loading.value) return

  loading.value = true
  try {
    // 構建查詢參數
    const params = {
      page: tableOptions.page,
      itemsPerPage: tableOptions.itemsPerPage,
      sortBy: tableOptions.sortBy[0]?.key,
      sortOrder: tableOptions.sortBy[0]?.order,
      search: quickSearch.value
    }

    // 添加搜尋條件
    if (searchCriteria.applicant) params.applicant = searchCriteria.applicant
    if (searchCriteria.productType) params.productType = searchCriteria.productType
    if (searchCriteria.status) params.status = searchCriteria.status
    if (searchCriteria.assignedDesigner) params.assignedDesigner = searchCriteria.assignedDesigner

    // 處理日期範圍
    if (searchCriteria.applicationDate?.length === 2) {
      const [start, end] = searchCriteria.applicationDate
      if (start && end) {
        params.applicationDateStart = start
        params.applicationDateEnd = end
      }
    }

    const { data } = await api.get('/marketing/design-requests', { params })

    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    console.error('取得表格資料失敗:', error)
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

// 取得產物類型選項
const fetchProductTypes = async () => {
  try {
    const { data } = await api.get('/marketing/design-requests/product-types')
    if (data.success) {
      productTypeOptions.value = data.result.flatMap(category =>
        category.items.map(item => ({
          value: item.value,
          label: `${category.category} - ${item.label}`
        }))
      )
    }
  } catch (error) {
    console.error('取得產物類型失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得產物類型失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 產物類型變更處理
const handleProductTypeChange = async (value) => {
  if (!value || !formData.applicant) {
    formFields.value = []
    return
  }

  try {
    const { data } = await api.get(`/marketing/design-requests/product-types/${value}/fields`)
    if (data.success) {
      const config = data.result
      formFields.value = [
        ...(config.fields || []),
        ...(config.required || []),
        ...(config.optional || []),
        ...(config.conditional || [])
      ]

      // 初始化表單資料
      formFields.value.forEach(field => {
        if (!(field.name in formData)) {
          if (field.type === 'checkbox') {
            formData[field.name] = false
          } else if (field.type === 'file') {
            formData[field.name] = []
          } else if (field.type === 'date') {
            formData[field.name] = null
          } else {
            formData[field.name] = ''
          }
        }
      })
    }
  } catch (error) {
    console.error('取得欄位配置失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得欄位配置失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    formFields.value = []
  }
}

// 新增 watch 監聽申請人變更
watch(() => formData.applicant, (newValue) => {
  if (!newValue || !formData.productType) {
    formFields.value = []
  } else {
    handleProductTypeChange(formData.productType)
  }
})



// 開啟對話框
const openDialog = (item = null) => {
  if (item) {
    // 查看模式：載入資料
    dialog.isEdit = true
    dialog.show = true
    Object.assign(formData, item)
    handleProductTypeChange(item.productType)
  } else {
    // 新增模式：重置表單
    dialog.isEdit = false
    addDialog.show = true
    resetForm()
  }
}

// 關閉對話框
const closeDialog = () => {
  dialog.show = false
  addDialog.show = false
  resetForm()
}

// 確認送出
const confirmSubmit = async () => {
  // 觸發表單驗證
  const { valid } = await form.value.validate()

  // 只有驗證通過才顯示確認對話框
  if (valid) {
    confirmDialog.show = true
  }
  // 驗證失敗時，錯誤訊息會自動顯示在欄位下方
}

// 送出表單
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 建立 FormData 物件處理檔案上傳
    const formDataToSend = new FormData()

    // 加入基本資料
    Object.keys(formData).forEach(key => {
      // 跳過 designRequestNumber，讓後端自動生成
      if (key === 'designRequestNumber') return

      if (Array.isArray(formData[key]) && formData[key][0] instanceof File) {
        // 處理檔案上傳
        formData[key].forEach(file => {
          formDataToSend.append(key, file)
        })
      } else if (formData[key] instanceof Date) {
        // 處理日期
        formDataToSend.append(key, formData[key].toISOString())
      } else if (formData[key] !== null && formData[key] !== undefined) {
        // 只傳送非 null 和非 undefined 的值
        formDataToSend.append(key, formData[key])
      }
    })

    const { data } = await api.post('/marketing/design-requests', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (data.success) {
      createSnackbar({
        text: '申請成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      confirmDialog.show = false
      addDialog.show = false
      resetForm()
      fetchTableData()
    }
  } catch (error) {
    console.error('送出申請失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message ||
            error?.response?.data?.error ||
            '送出申請失敗，請稍後再試',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

// 重置表單
const resetForm = () => {
  form.value?.reset()
  formValid.value = false
  formData.productType = ''
  formData.applicant = ''
  formFields.value = []

  // 清除動態欄位
  const keysToDelete = Object.keys(formData).filter(key =>
    key !== 'productType' && key !== 'applicant'
  )
  keysToDelete.forEach(key => {
    delete formData[key]
  })
}

// 新增陣列項目
const addArrayItem = (fieldName) => {
  if (!formData[fieldName]) {
    formData[fieldName] = []
  }

  // 找到對應的欄位配置
  const field = formFields.value.find(f => f.name === fieldName)
  if (!field) return

  // 建立新的項目，包含所有子欄位
  const newItem = {}
  field.arrayFields.forEach(subField => {
    if (subField.type === 'number') {
      newItem[subField.name] = 0
    } else if (subField.type === 'checkbox') {
      newItem[subField.name] = false
    } else {
      newItem[subField.name] = ''
    }
  })

  formData[fieldName].push(newItem)
}

// 移除陣列項目
const removeArrayItem = (fieldName, index) => {
  if (formData[fieldName] && formData[fieldName].length > index) {
    formData[fieldName].splice(index, 1)
  }
}

// 取得狀態顏色
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange-darken-2',
    in_progress: 'blue-darken-1',
    completed: 'green-darken-1',
    cancelled: 'red-lighten-1'
  }
  return colorMap[status] || 'grey'
}

// 取得狀態文字
const getStatusText = (status) => {
  const textMap = {
    pending: '待處理',
    in_progress: '處理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 取得欄位類型對應的圖標
const getFieldIcon = (fieldType) => {
  const iconMap = {
    text: 'mdi-text',
    textarea: 'mdi-text-long',
    date: 'mdi-calendar',
    number: 'mdi-numeric',
    file: 'mdi-file-document',
    checkbox: 'mdi-checkbox-marked',
    array: 'mdi-view-list'
  }
  return iconMap[fieldType] || 'mdi-form-textbox'
}

// 取得所有在職員工列表（用於申請人）
const fetchEmployees = async () => {
  try {
    const { data } = await api.get('/employees/active')
    if (data.success) {
      employees.value = data.result
    }
  } catch (error) {
    console.error('取得員工列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得員工列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 取得行銷美編部在職員工列表（用於處理人員）
const fetchMarketingDesigners = async () => {
  try {
    const { data } = await api.get('/employees/marketing-design')
    if (data.success) {
      marketingDesigners.value = data.result
    }
  } catch (error) {
    console.error('取得行銷美編部員工列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得行銷美編部員工列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 格式化時間
const formatTime = (date) => {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

// 取得產物類型文字
const getProductTypeText = (type) => {
  const option = productTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 格式化日期時間
const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 自定義搜尋過濾器
const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const itemText = item.raw.label.toLowerCase()
  return itemText.includes(textToSearch)
}

// 監聽快速搜尋
const debouncedSearch = debounce(() => {
  tableOptions.page = 1
  fetchTableData()
}, 300)

// 監聽快速搜尋變更
watch(quickSearch, () => {
  isSearching.value = true
  debouncedSearch()
})

// 從檔案路徑中獲取檔名
const getFileName = (filePath) => {
  if (!filePath) return ''
  // 從路徑中提取檔名
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

// 取得顯示標籤（查看詳細資訊時移除必填標記）
const getDisplayLabel = (label) => {
  if (!label) return ''
  // 在查看詳細資訊時移除 "* " 前綴
  if (dialog.show && dialog.isEdit) {
    return label.replace(/^\*\s*/, '')
  }
  return label
}

// 頁面載入時初始化
onMounted(() => {
  fetchProductTypes()
  fetchEmployees()
  fetchMarketingDesigners()
  fetchTableData()
})
</script>

<style scoped>
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

/* 搜尋區域樣式 */
.text-label {
  color: #455a64;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* :deep(.v-field) {
  border-radius: 4px;
  font-size: 14px;
} */


/* 詳細資料對話框樣式 */
:deep(.v-timeline) {
  .v-timeline-item__body {
    padding: 12px !important;
  }
}

/* 資訊項目卡片樣式 */
.info-item-card {
  height: 100%;
  background: #f5f5f5;
  border: 1px solid rgba(0,0,0,0.1) !important;
}

/* 內容區域白色背景 */
.info-item-card .text-body-2 {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.sub-card-title {
  font-size: 14px;
  font-weight: 500;
  color: #455a64;
}

</style>

<route lang="yaml">
  meta:
    layout: Ystravel
</route>
