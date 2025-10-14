<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-6 px-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg py-7 px-0">
          <div class="d-flex align-center px-7">
            <h3 class="me-4">
              行銷美編需求申請
            </h3>
            <v-spacer />
            <!-- 移除員工登入相關 UI -->
          </div>
          <v-divider class="mt-5 mb-6" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-9 pb-2">
            <v-row class="mb-2">
              <!-- 申請日期 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
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
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 申請人 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
                <div class="d-flex align-center">
                  <span class="text-label">申請人 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.applicant"
                    class="ms-4"
                    :items="employees"
                    :item-title="item => item && item.name && item.userId ? `${item.name} (${item.userId})` : item && item.name ? item.name : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇申請人"
                    hide-details
                    :filter="customFilter"
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 大分類 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
                <div class="d-flex align-center">
                  <span class="text-label">申請類型 (大) :</span>
                  <v-select
                    v-model="searchCriteria.productCategory"
                    class="ms-4"
                    :items="productCategoryOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇大分類"
                    hide-details
                    :disabled="false"
                    @update:model-value="handleProductCategoryChange"
                  />
                </div>
              </v-col>

              <!-- 申請類型 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
                <div class="d-flex align-center">
                  <span class="text-label">申請類型 :</span>
                  <v-select
                    v-model="searchCriteria.productType"
                    class="ms-4"
                    :items="filteredProductTypeOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇申請類型"
                    hide-details
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 狀態 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
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
                    :disabled="false"
                  />
                </div>
              </v-col>

              <!-- 處理人員 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
                <div class="d-flex align-center">
                  <span class="text-label">處理人員 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.assignedDesigner"
                    class="ms-4"
                    :items="marketingDesigners"
                    :item-title="item => item && item.name && item.userId ? `${item.name} (${item.userId})` : item && item.name ? item.name : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇處理人員"
                    hide-details
                    :filter="customFilter"
                    :disabled="false"
                  />
                </div>
              </v-col>
              <v-col />
              <!-- 搜尋按鈕 -->
              <v-col
                cols="12"
                sm="6"
                md="2"
              >
                <v-row class="d-flex justify-end">
                  <v-col
                    cols="8"
                    class="ps-0"
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
                    cols="3"
                    class="ps-0"
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
                  :disabled="false"
                  @click="openDialog()"
                >
                  新增申請
                </v-btn>
                <v-spacer />
                <v-col cols="2">
                  <div class="d-flex align-center">
                    <v-icon
                      v-tooltip:start="'可搜尋申請編號、申請詳細資訊'"
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
                      :disabled="false"
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
                  <td>{{ item.applicant?.name }} ({{ item.applicant?.userId || 'N/A' }})</td>
                  <td>{{ getProductTypeText(item.productType, item) }}</td>
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
                  <td>
                    <v-chip
                      v-if="item.assignedDesigner?.name"
                      color="blue-darken-1"
                      size="small"
                      label
                      class="font-weight-medium"
                    >
                      {{ item.assignedDesigner.name }}
                    </v-chip>
                    <v-chip
                      v-else
                      color="grey"
                      size="small"
                      label
                      class="font-weight-medium"
                    >
                      尚未指派
                    </v-chip>
                  </td>
                  <td>
                    <div
                      v-if="item.departmentNote"
                      class="department-note-display"
                    >
                      <div
                        class="department-note-text"
                        v-html="formatDepartmentNote(item.departmentNote)"
                      />
                    </div>
                    <div
                      v-else
                      class="department-note-display"
                    >
                      <span class="text-grey-lighten-1">( 無 )</span>
                    </div>
                  </td>
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
      <v-card class="rounded-lg pb-2 dialog">
        <v-card-title class="d-flex align-center px-6 py-1 bg-light-blue-darken-2">
          <v-icon
            icon="mdi-text-box-outline"
            size="18"
            color="white"
            class="me-2"
          />
          <span class="card-title">申請單詳細資訊</span>
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
                        icon="mdi-shape"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">申請類型</span>
                    </div>
                    <div class="text-body-2">
                      {{ getProductTypeText(formData.productType) }}
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
                      {{ formData.applicant?.name ? `${formData.applicant.name} (${formData.applicant.userId || 'N/A'})` : '( 無 )' }}
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
                        icon="mdi-note-text"
                        size="16"
                        color="blue-grey-darken-1"
                        class="me-2"
                      />
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">部門備註</span>
                    </div>
                    <div class="text-body-2">
                      <span
                        v-if="formData.departmentNote"
                        style="white-space: pre-line;"
                        v-html="formatDepartmentNote(formData.departmentNote)"
                      />
                      <span
                        v-else
                        class="text-grey-lighten-1"
                      >( 無 )</span>
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
              <!-- 印刷相關特殊顯示 -->
              <template v-if="formData.productType === 'printing'">
                <!-- 上傳檔案顯示區塊（最上方） -->
                <v-row v-if="formData.files && formData.files.length > 0">
                  <v-col cols="12">
                    <v-card
                      class="info-item-card pa-3"
                      variant="outlined"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          size="16"
                          color="blue-grey-darken-1"
                          class="me-2"
                        >
                          mdi-file-document
                        </v-icon>
                        <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">上傳檔案</span>
                      </div>
                      <div class="text-body-2 info-item-value">
                        <div
                          v-for="(file, index) in formData.files"
                          :key="index"
                          class="d-flex align-center mb-1"
                        >
                          <v-icon
                            size="small"
                            class="me-2"
                          >
                            mdi-file
                          </v-icon>
                          <span class="text-grey-darken-1">{{ truncateFileName(getFileName(file), 20) }}</span>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row>
                  <!-- 根據選擇顯示對應資料 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="formData.printingTypes?.[sectionKey]"
                      cols="12"
                    >
                      <v-card class="mb-4 printing-section-card elevation-0">
                        <div class="printing-section-header d-flex align-center px-5 py-3">
                          <span class="sub-title text-blue-grey-darken-2 font-weight-bold">※ {{ section.title }}</span>
                        </div>
                        <v-divider class="mb-0" />
                        <v-card-text class="pt-4 pb-4 px-5">
                          <v-row>
                            <v-col
                              v-for="field in section.fields"
                              :key="field.name"
                              :cols="field.cols?.xs || 12"
                              :sm="field.cols?.sm || 6"
                              :lg="field.cols?.lg || 4"
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
                                <div class="text-body-2 info-item-value">
                                  <template v-if="field.type === 'text'">
                                    <span
                                      v-if="getNestedValue(formData, field.name)"
                                      style="white-space: pre-line;"
                                    >{{ getNestedValue(formData, field.name) }}</span>
                                    <span v-else>( 無 )</span>
                                  </template>
                                  <template v-else-if="field.type === 'textarea'">
                                    <span
                                      v-if="getNestedValue(formData, field.name)"
                                      style="white-space: pre-line;"
                                    >{{ getNestedValue(formData, field.name) }}</span>
                                    <span v-else>( 無 )</span>
                                  </template>
                                  <template v-else-if="field.type === 'date'">
                                    {{ getNestedValue(formData, field.name) ? formatDate(getNestedValue(formData, field.name)) : '( 無 )' }}
                                  </template>
                                  <template v-else-if="field.type === 'number'">
                                    {{ getNestedValue(formData, field.name) !== null && getNestedValue(formData, field.name) !== undefined && getNestedValue(formData, field.name) !== '' ? getNestedValue(formData, field.name) : '( 無 )' }}
                                  </template>
                                  <template v-else-if="field.type === 'select'">
                                    {{ typeof getNestedValue(formData, field.name) === 'boolean' ? (getNestedValue(formData, field.name) ? '是' : '否') : '( 無 )' }}
                                  </template>
                                </div>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </template>
                </v-row>
              </template>
              <!-- 其他類型的原有顯示 -->
              <v-row v-else>
                <template
                  v-for="field in visibleFormFields"
                  :key="field.name"
                >
                  <v-col
                    :cols="field.cols?.xs || 12"
                    :sm="field.cols?.sm || 6"
                    :lg="field.cols?.lg || 4"
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
                      <div class="text-body-2 info-item-value">
                        <!-- 文字欄位 -->
                        <template v-if="field.type === 'text'">
                          <span
                            v-if="formData[field.name]"
                            style="white-space: pre-line;"
                          >{{ formData[field.name] }}</span>
                          <span v-else>( 無 )</span>
                        </template>
                        <!-- 多行文字欄位 -->
                        <template v-else-if="field.type === 'textarea'">
                          <span
                            v-if="formData[field.name]"
                            style="white-space: pre-line;"
                          >{{ formData[field.name] }}</span>
                          <span v-else>( 無 )</span>
                        </template>
                        <!-- 日期欄位 -->
                        <template v-else-if="field.type === 'date'">
                          {{ formData[field.name] ? formatDate(formData[field.name]) : '( 無 )' }}
                        </template>
                        <!-- 數字欄位 -->
                        <template v-else-if="field.type === 'number'">
                          {{ formData[field.name] !== null && formData[field.name] !== undefined && formData[field.name] !== '' ? formData[field.name] : '( 無 )' }}
                        </template>
                        <!-- 核取方塊 -->
                        <template v-else-if="field.type === 'checkbox'">
                          <v-icon :color="formData[field.name] ? 'success' : 'grey'">
                            {{ formData[field.name] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                          {{ formData[field.name] ? '是' : '否' }}
                        </template>
                        <!-- 下拉選單 -->
                        <template v-else-if="field.type === 'select'">
                          {{ typeof formData[field.name] === 'boolean' ? (formData[field.name] ? '是' : '否') : '( 無 )' }}
                        </template>
                        <!-- 檔案欄位 -->
                        <template v-else-if="field.type === 'file'">
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
                              <span class="text-grey-darken-1">{{ truncateFileName(getFileName(file), 20) }}</span>
                            </div>
                          </template>
                          <template v-else>
                            <span class="text-grey">( 無 )</span>
                          </template>
                        </template>
                        <!-- 行程陣列欄位 -->
                        <div
                          v-else-if="field.type === 'array'"
                          class="w-100 py-4 px-3 rounded"
                        >
                          <div
                            v-if="!formData[field.name] || formData[field.name].length === 0"
                            class="text-center py-8"
                          >
                            <v-icon
                              icon="mdi-map-marker-off"
                              size="48"
                              color="grey-lighten-1"
                              class="mb-3"
                            />
                            <div class="text-grey-lighten-1">
                              尚未新增任何行程
                            </div>
                          </div>

                          <v-row v-else>
                            <v-col
                              v-for="(item, index) in formData[field.name]"
                              :key="index"
                              cols="12"
                              md="6"
                              class="mb-1"
                            >
                              <div class="px-3 border rounded-lg h-100 d-flex flex-column">
                                <div
                                  class="d-flex justify-space-between align-center my-2"
                                  style="height: 40px;"
                                >
                                  <span class="text-subtitle-2 text-grey-darken-1">行程 {{ index + 1 }}</span>
                                  <v-btn
                                    v-if="!dialog.isEdit && formData[field.name].length > 2"
                                    icon="mdi-close"
                                    color="red-darken-1"
                                    size="small"
                                    variant="plain"
                                    :ripple="false"
                                    @click="removeArrayItem(field.name, index)"
                                  />
                                </div>
                                <v-row class="pb-2">
                                  <!-- 團體名稱 -->
                                  <v-col
                                    cols="12"
                                    lg="6"
                                    class="pb-0"
                                  >
                                    <v-text-field
                                      v-model="formData[field.name][index].groupName"
                                      label="* 團體名稱"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      :readonly="dialog.isEdit"
                                      :rules="[v => !!v || '請輸入團體名稱']"
                                      clearable
                                    />
                                  </v-col>
                                  <!-- 出發日期 -->
                                  <v-col
                                    cols="12"
                                    lg="6"
                                    class="pb-0"
                                  >
                                    <v-text-field
                                      v-model="formData[field.name][index].departureDate"
                                      label="出發日期"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      :readonly="dialog.isEdit"
                                      clearable
                                    />
                                  </v-col>
                                  <!-- 同業價 -->
                                  <v-col
                                    cols="12"
                                    lg="6"
                                    class="pb-0"
                                  >
                                    <v-text-field
                                      v-model.number="formData[field.name][index].agentPrice"
                                      label="* 同業價 ( 若無該價格，請填 0 )"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      :readonly="dialog.isEdit"
                                      :rules="[
                                        v => v !== '' && v !== null && v !== undefined || '請輸入同業價',
                                        v => v >= 0 || '同業價不能小於0'
                                      ]"
                                      clearable
                                      prepend-inner-icon="mdi-currency-usd"
                                    />
                                  </v-col>
                                  <!-- 直客價 -->
                                  <v-col
                                    cols="12"
                                    lg="6"
                                    class="pb-0"
                                  >
                                    <v-text-field
                                      v-model.number="formData[field.name][index].retailPrice"
                                      label="* 直客價 ( 若無該價格，請填 0 )"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      :readonly="dialog.isEdit"
                                      :rules="[
                                        v => v !== '' && v !== null && v !== undefined || '請輸入直客價',
                                        v => v >= 0 || '直客價不能小於0'
                                      ]"
                                      clearable
                                      prepend-inner-icon="mdi-currency-usd"
                                    />
                                  </v-col>
                                  <!-- 行程特色 -->
                                  <v-col
                                    cols="12"
                                    class="pb-0"
                                  >
                                    <v-textarea
                                      v-model="formData[field.name][index].tripHighlights"
                                      label="行程特色"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      :readonly="dialog.isEdit"
                                      auto-grow
                                      rows="3"
                                      clearable
                                    />
                                  </v-col>
                                </v-row>
                              </div>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </template>
              </v-row>
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
      <v-card class="rounded-lg add-dialog">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-teal-darken-2 ">
          <v-icon
            icon="mdi-text-box-outline"
            size="18"
            color="white"
            class="me-2"
          />
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

              <!-- 申請類型選擇 -->
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
                  label="* 申請類型"
                  variant="outlined"
                  density="compact"
                  :readonly="dialog.isEdit"
                  :rules="[v => !!v || '請選擇申請類型']"
                  @update:model-value="handleProductTypeChange"
                />
              </v-col>
            </v-row>

            <!-- 申請資訊區塊 -->
            <template v-if="formData.productType">
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

                <!-- 印刷相關特殊處理 -->
                <template v-if="formData.productType === 'printing'">
                  <v-col cols="12">
                    <v-card class="mb-4 printing-checkbox-card elevation-0">
                      <v-card-text class="py-4">
                        <div class="card-title text-teal-darken-2 mb-3">
                          <v-icon
                            icon="mdi-checkbox-multiple-marked-outline"
                            size="20"
                            class="me-2"
                          />
                          請選擇需要的印刷類型
                        </div>
                        <v-row>
                          <v-col
                            v-for="subType in productTypeConfig?.subTypes"
                            :key="subType.name"
                            cols="12"
                            sm="6"
                            md="3"
                          >
                            <v-checkbox
                              v-model="formData.printingTypes[subType.name]"
                              :label="subType.label"
                              color="teal-darken-2"
                              hide-details
                              density="compact"
                              class="printing-checkbox"
                            />
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- 上傳檔案欄位（放在所有子類型表單區塊上方） -->
                  <v-col
                    v-if="productTypeConfig?.requiredFiles && hasSelectedPrintingType && !isOnlyCoachSign"
                    cols="12"
                    class="mb-4"
                  >
                    <v-card
                      class="pa-4 elevation-0 upload-file-card"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="sub-title font-weight-bold text-light-blue-darken-3">※ 共同欄位: 上傳檔案</span>
                      </div>
                      <v-file-input
                        v-for="fileField in productTypeConfig.requiredFiles"
                        :key="fileField.name"
                        v-model="formData[fileField.name]"
                        :label="fileField.label"
                        variant="outlined"
                        density="compact"
                        :multiple="fileField.multiple"
                        :accept="fileField.accept"
                        :readonly="dialog.isEdit"
                        :rules="[
                          v => (v && v.length > 0) || '請上傳檔案 ( LOGO AI 檔、行程 Word 檔 )',
                          v => !v || v.length <= 5 || '最多只能上傳 5 個檔案'
                        ]"
                        counter
                        prepend-icon="mdi-paperclip"
                        chips
                      >
                        <template #selection="{ fileNames }">
                          <div
                            class="d-flex flex-wrap align-center"
                            style="gap: 4px;"
                          >
                            <template
                              v-for="(fileName, index) in fileNames"
                              :key="fileName"
                            >
                              <v-chip
                                v-if="index < 2"
                                color="teal-darken-1"
                                size="small"
                                label
                                class="mb-1"
                              >
                                {{ truncateFileName(fileName, 15) }}
                              </v-chip>
                              <span
                                v-if="index === 2"
                                class="text-overline text-grey-darken-3 ms-1"
                              >
                                +{{ fileNames.length - 2 }} 個檔案
                              </span>
                            </template>
                          </div>
                        </template>
                      </v-file-input>
                    </v-card>
                  </v-col>

                  <!-- 子類型表單區塊 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="formData.printingTypes?.[sectionKey]"
                      cols="12"
                    >
                      <v-card class="mb-4 printing-section-card elevation-0">
                        <div class="printing-section-header d-flex align-center px-5 py-3">
                          <span class="sub-title text-teal-darken-2 font-weight-bold">※ {{ section.title }}</span>
                        </div>
                        <v-divider class="mb-0" />
                        <v-card-text class="pt-4 pb-4 px-5">
                          <v-row>
                            <v-col
                              v-for="field in section.fields"
                              :key="field.name"
                              :cols="field.cols?.xs || 12"
                              :sm="field.cols?.sm || 6"
                              :lg="field.cols?.lg || 4"
                            >
                              <!-- 文字輸入欄位 -->
                              <v-text-field
                                v-if="field.type === 'text'"
                                :model-value="getNestedValue(formData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                                @update:model-value="(value) => setNestedValue(formData, field.name, value)"
                              />
                              <!-- 多行文字輸入欄位 -->
                              <v-textarea
                                v-else-if="field.type === 'textarea'"
                                :model-value="getNestedValue(formData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                                auto-grow
                                rows="5"
                                @update:model-value="(value) => setNestedValue(formData, field.name, value)"
                              />
                              <!-- 日期選擇欄位 -->
                              <v-date-input
                                v-else-if="field.type === 'date'"
                                :model-value="getNestedValue(formData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                prepend-icon
                                clearable
                                :disabled="dialog.isEdit"
                                :rules="field.required ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : []"
                                :cancel-text="'取消'"
                                :ok-text="'確認'"
                                @update:model-value="(value) => setNestedValue(formData, field.name, value)"
                              />
                              <!-- 數字輸入欄位 -->
                              <v-text-field
                                v-else-if="field.type === 'number'"
                                :model-value="getNestedValue(formData, field.name)"
                                :label="field.label"
                                type="number"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="[
                                  ...(field.required ? [v => v !== '' && v !== null && v !== undefined || `請輸入${field.label.replace('* ', '')}`] : []),
                                  v => v >= field.min || `${field.label.replace('* ', '')}不能小於${field.min}`
                                ]"
                                @update:model-value="(value) => setNestedValue(formData, field.name, value)"
                              />
                              <!-- 下拉選單欄位 -->
                              <v-select
                                v-else-if="field.type === 'select'"
                                :model-value="getNestedValue(formData, field.name)"
                                :items="field.items"
                                item-title="title"
                                item-value="value"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :readonly="dialog.isEdit"
                                :rules="field.required ? [v => (v !== null && v !== undefined) || `請選擇${field.label.replace('* ', '')}`] : []"
                                @update:model-value="(value) => setNestedValue(formData, field.name, value)"
                              />
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </template>
                </template>

                <!-- 動態表單欄位 -->
                <template v-else-if="formFields.length > 0">
                  <v-col
                    v-for="field in visibleFormFields"
                    :key="field.name"
                    :cols="field.cols?.xs || 12"
                    :sm="field.cols?.sm || 6"
                    :lg="field.cols?.lg || 4"
                  >
                    <!-- 特殊組合：是否需要強調航空公司 + 請填寫需強調的航空公司 -->
                    <template v-if="field.name === 'airlineHighlightNote'">
                      <v-checkbox
                        v-model="formData.needAirlineHighlight"
                        :label="'是否需要強調航空公司'"
                        :readonly="dialog.isEdit"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mb-1"
                      />
                      <v-text-field
                        v-model="formData.airlineHighlightNote"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :readonly="dialog.isEdit"
                        :disabled="!formData.needAirlineHighlight"
                        :rules="formData.needAirlineHighlight ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                      />
                      <div
                        v-if="field.illustrations && field.illustrations.length"
                        class="d-flex flex-wrap mt-2"
                        style="gap: 16px;"
                      >
                        <img
                          v-for="(img, idx) in field.illustrations"
                          :key="img"
                          :src="basePath + img.replace(/^\//, '')"
                          :alt="field.label + ' 示意圖' + (idx+1)"
                          style="max-width: 560px; border-radius: 8px;"
                        >
                      </div>
                    </template>
                    <!-- 特殊組合：是否需要放以下LOGO + 請填寫LOGO編號或所需航空公司名稱 -->
                    <template v-else-if="field.name === 'useLogo'">
                      <v-checkbox
                        v-model="formData.needUseLogo"
                        :label="'是否需要放以下LOGO?'"
                        :readonly="dialog.isEdit"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mb-1"
                      />
                      <v-text-field
                        v-model="formData.useLogo"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :readonly="dialog.isEdit"
                        :disabled="!formData.needUseLogo"
                        :rules="formData.needUseLogo ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                      />
                      <div
                        v-if="field.illustrations && field.illustrations.length"
                        class="d-flex flex-wrap mt-2"
                        style="gap: 16px;"
                      >
                        <img
                          v-for="(img, idx) in field.illustrations"
                          :key="img"
                          :src="basePath + img.replace(/^\//, '')"
                          :alt="field.label + ' 示意圖' + (idx+1)"
                          style="max-width: 560px; border-radius: 8px;"
                        >
                      </div>
                    </template>
                    <!-- 其他欄位原本渲染方式 -->
                    <template v-else>
                      <!-- 文字輸入欄位 -->
                      <div v-if="field.illustrations && field.illustrations.length">
                        <v-text-field
                          v-if="field.type === 'text'"
                          v-model="formData[field.name]"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :disabled="field.name === 'quickTemplateNumber' && formData.useQuickTemplate !== true"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => !!v || `請輸入${field.label.replace('* ', '')}`]
                              : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : [])
                          "
                        />
                        <div
                          class="d-flex flex-wrap mt-2"
                          style="gap: 16px;"
                        >
                          <img
                            v-for="(img, idx) in field.illustrations"
                            :key="img"
                            :src="basePath + img.replace(/^\//, '')"
                            :alt="field.label + ' 示意圖' + (idx+1)"
                            style="max-width: 560px; border-radius: 8px;"
                          >
                        </div>
                      </div>
                      <div v-else-if="field.type === 'text'">
                        <v-text-field
                          v-model="formData[field.name]"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :disabled="field.name === 'quickTemplateNumber' && formData.useQuickTemplate !== true"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => !!v || `請輸入${field.label.replace('* ', '')}`]
                              : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : [])
                          "
                        />
                      </div>
                      <!-- 多行文字輸入欄位 -->
                      <v-textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="formData[field.name]"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :readonly="dialog.isEdit"
                        :rules="
                          field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [v => !!v || `請輸入${field.label.replace('* ', '')}`]
                            : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : [])
                        "
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
                        :rules="
                          field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [v => !!v || `請選擇${field.label.replace('* ', '')}`]
                            : (field.required ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : [])
                        "
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
                        :rules="
                          field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [
                              v => v !== '' && v !== null && v !== undefined || `請輸入${field.label.replace('* ', '')}`,
                              v => v >= field.min || `${field.label.replace('* ', '')}不能小於${field.min}`
                            ]
                            : (field.required
                              ? [
                                v => v !== '' && v !== null && v !== undefined || `請輸入${field.label.replace('* ', '')}`,
                                v => v >= field.min || `${field.label.replace('* ', '')}不能小於${field.min}`
                              ]
                              : []
                            )
                        "
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
                        :rules="[
                          ...(field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [v => (v && v.length > 0) || getFileUploadErrorMessage(field.label)]
                            : (field.required ? [v => (v && v.length > 0) || getFileUploadErrorMessage(field.label)] : [])),
                          v => !v || v.length <= 5 || '最多只能上傳 5 個檔案'
                        ]"
                        counter
                        prepend-icon="mdi-paperclip"
                        chips
                      >
                        <template #selection="{ fileNames }">
                          <div
                            class="d-flex flex-wrap align-center"
                            style="gap: 4px;"
                          >
                            <template
                              v-for="(fileName, index) in fileNames"
                              :key="fileName"
                            >
                              <v-chip
                                v-if="index < 2"
                                color="teal-darken-1"
                                size="small"
                                label
                                class="mb-1"
                              >
                                {{ truncateFileName(fileName, 15) }}
                              </v-chip>
                              <span
                                v-if="index === 2"
                                class="text-overline text-grey-darken-3 ms-1"
                              >
                                +{{ fileNames.length - 2 }} 個檔案
                              </span>
                            </template>
                          </div>
                        </template>
                      </v-file-input>
                      <!-- 下拉選單欄位 -->
                      <div v-else-if="field.type === 'select'">
                        <v-select
                          v-model="formData[field.name]"
                          :items="field.items"
                          item-title="title"
                          item-value="value"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => (v !== null && v !== undefined) || `請選擇${field.label.replace('* ', '')}`]
                              : (field.required ? [v => (v !== null && v !== undefined) || `請選擇${field.label.replace('* ', '')}`] : [])
                          "
                        />
                        <!-- 連結按鈕 -->
                        <v-btn
                          v-if="field.link"
                          :href="field.link.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="blue-darken-1"
                          variant="text"
                          size="small"
                          class="mt-1"
                          prepend-icon="mdi-open-in-new"
                        >
                          {{ field.link.text }}
                        </v-btn>
                      </div>
                      <!-- 行程陣列欄位 -->
                      <div
                        v-else-if="field.type === 'array'"
                        class="w-100 border py-4 px-3 rounded"
                      >
                        <div class="d-flex align-center justify-space-between mb-4">
                          <div class="d-flex align-center">
                            <v-icon
                              icon="mdi-map-marker-multiple"
                              size="20"
                              color="grey-darken-1"
                              class="me-2"
                            />
                            <span class="sub-title text-grey-darken-1">{{ field.label }}</span>
                            <!-- 行程陣列驗證錯誤訊息 -->
                            <div
                              v-if="field.required && (!formData[field.name] || formData[field.name].length === 0)"
                              class="text-red-lighten-1 text-caption ms-3"
                            >
                              <v-icon
                                icon="mdi-alert-circle-outline"
                                size="small"
                                class="me-1"
                              />
                              請至少新增一筆行程
                            </div>
                          </div>
                          <v-btn
                            color="teal-darken-2"
                            variant="outlined"
                            size="small"
                            prepend-icon="mdi-plus"
                            :disabled="dialog.isEdit"
                            @click="addArrayItem(field.name)"
                          >
                            新增行程
                          </v-btn>
                        </div>

                        <div
                          v-if="!formData[field.name] || formData[field.name].length === 0"
                          class="text-center py-8"
                        >
                          <v-icon
                            icon="mdi-map-marker-off"
                            size="48"
                            color="grey-lighten-1"
                            class="mb-3"
                          />
                          <div class="text-grey-lighten-1">
                            尚未新增任何行程
                          </div>
                        </div>

                        <v-row v-else>
                          <v-col
                            v-for="(item, index) in formData[field.name]"
                            :key="index"
                            cols="12"
                            md="6"
                            class="mb-1"
                          >
                            <div class="px-3 border rounded-lg h-100 d-flex flex-column">
                              <div
                                class="d-flex justify-space-between align-center my-2"
                                style="height: 40px;"
                              >
                                <span class="text-subtitle-2 text-grey-darken-1">行程 {{ index + 1 }}</span>
                                <v-btn
                                  v-if="!dialog.isEdit && formData[field.name].length > 2"
                                  icon="mdi-close"
                                  color="red-darken-1"
                                  size="small"
                                  variant="plain"
                                  :ripple="false"
                                  @click="removeArrayItem(field.name, index)"
                                />
                              </div>
                              <v-row class="pb-2">
                                <!-- 團體名稱 -->
                                <v-col
                                  cols="12"
                                  lg="6"
                                  class="pb-0"
                                >
                                  <v-text-field
                                    v-model="formData[field.name][index].groupName"
                                    label="* 團體名稱"
                                    variant="outlined"
                                    density="compact"
                                    class="mb-1"
                                    :readonly="dialog.isEdit"
                                    :rules="[v => !!v || '請輸入團體名稱']"
                                    clearable
                                  />
                                </v-col>
                                <!-- 出發日期 -->
                                <v-col
                                  cols="12"
                                  lg="6"
                                  class="pb-0"
                                >
                                  <v-text-field
                                    v-model="formData[field.name][index].departureDate"
                                    label="出發日期"
                                    variant="outlined"
                                    density="compact"
                                    class="mb-1"
                                    :readonly="dialog.isEdit"
                                    clearable
                                  />
                                </v-col>
                                <!-- 同業價 -->
                                <v-col
                                  cols="12"
                                  lg="6"
                                  class="pb-0"
                                >
                                  <v-text-field
                                    v-model.number="formData[field.name][index].agentPrice"
                                    label="* 同業價 ( 若無該價格，請填 0 )"
                                    type="number"
                                    variant="outlined"
                                    density="compact"
                                    class="mb-1"
                                    :readonly="dialog.isEdit"
                                    :rules="[
                                      v => v !== '' && v !== null && v !== undefined || '請輸入同業價',
                                      v => v >= 0 || '同業價不能小於0'
                                    ]"
                                    clearable
                                    prepend-inner-icon="mdi-currency-usd"
                                  />
                                </v-col>
                                <!-- 直客價 -->
                                <v-col
                                  cols="12"
                                  lg="6"
                                  class="pb-0"
                                >
                                  <v-text-field
                                    v-model.number="formData[field.name][index].retailPrice"
                                    label="* 直客價 ( 若無該價格，請填 0 )"
                                    type="number"
                                    variant="outlined"
                                    density="compact"
                                    class="mb-1"
                                    :readonly="dialog.isEdit"
                                    :rules="[
                                      v => v !== '' && v !== null && v !== undefined || '請輸入直客價',
                                      v => v >= 0 || '直客價不能小於0'
                                    ]"
                                    clearable
                                    prepend-inner-icon="mdi-currency-usd"
                                  />
                                </v-col>
                                <!-- 行程特色 -->
                                <v-col
                                  cols="12"
                                  class="pb-0"
                                >
                                  <v-textarea
                                    v-model="formData[field.name][index].tripHighlights"
                                    label="行程特色"
                                    variant="outlined"
                                    density="compact"
                                    class="mb-1"
                                    :readonly="dialog.isEdit"
                                    auto-grow
                                    rows="3"
                                    clearable
                                  />
                                </v-col>
                              </v-row>
                            </div>
                          </v-col>
                        </v-row>
                      </div>
                      <!-- 核取方塊 -->
                      <v-checkbox
                        v-else-if="field.type === 'checkbox' && field.name !== 'needAirlineHighlight' && field.name !== 'needUseLogo'"
                        v-model="formData[field.name]"
                        :label="field.label"
                        :readonly="dialog.isEdit"
                        density="compact"
                        color="primary"
                        hide-details
                      />
                    </template>
                  </v-col>
                </template>
              </v-row>
            </template>

            <!-- 注意事項區域 -->
            <div
              v-if="productTypeConfig && productTypeConfig.notices && productTypeConfig.notices.length > 0"
              class="mt-6"
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
                        color="orange-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="2"
                      class="d-flex align-center justify-center text-orange-darken-2"
                    >
                      <v-icon
                        size="18"
                        class="me-2 text-orange-darken-2"
                      >
                        mdi-alert-circle
                      </v-icon> 注意事項
                    </v-col>
                    <v-col
                      cols="5"
                      class="d-flex align-center justify-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="orange-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <v-card
                class="mt-4"
                variant="outlined"
                color="orange-lighten-4"
              >
                <v-card-text class="py-4">
                  <div
                    v-for="(notice, index) in productTypeConfig.notices"
                    :key="index"
                    class="d-flex align-center mb-2"
                  >
                    <v-icon
                      icon="mdi-alert-octagon-outline"
                      size="small"
                      color="orange-darken-2"
                      class="me-2"
                    />
                    <span class="text-body-2 text-grey-darken-1">{{ notice }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
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
      max-width="500"
      persistent
    >
      <v-card class="rounded-lg pb-4">
        <v-card-title class="d-flex align-center px-6 py-4 bg-teal-darken-2">
          <v-icon
            icon="mdi-check-circle"
            size="20"
            color="white"
            class="me-3"
          />
          <span class="card-title text-white">確認送出申請</span>
        </v-card-title>

        <v-card-text class="px-6 pt-6 pb-0">
          <div class="mb-4">
            <p class="sub-title mb-4">
              您是否確定要送出此申請單？
            </p>

            <div class="bg-teal-lighten-5 pa-4 rounded-lg border-left-teal-darken-2">
              <div class="d-flex align-center mb-2">
                <v-icon
                  icon="mdi-information"
                  size="20"
                  color="teal-darken-2"
                  class="me-2"
                />
                <span class="text-teal-darken-2 font-weight-bold">重要提醒</span>
              </div>
              <p class="text-body-2 text-grey-darken-1 mb-0">
                送出後將無法修改申請內容，請確認所有填寫的資料都正確無誤。
              </p>
              <p class="text-body-2 text-grey-darken-1 mb-0 mt-2">
                若之後申請內容有需更改，請通知行銷美編部，謝謝。
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="confirmDialog.show = false"
          >
            返回修改
          </v-btn>
          <v-btn
            color="teal-darken-2"
            class="ms-2"
            variant="outlined"
            :loading="submitting"
            @click="handleSubmit"
          >
            確認送出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, onUnmounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { debounce } from 'lodash'
// import EmployeeLogin from '@/components/EmployeeLogin.vue' // 移除員工登入組件

// 頁面定義
definePage({
  meta: {
    title: '行銷美編需求申請 | Ystravel',
    login: true,  // 需要登入
    permission: 'MARKETING_DESIGN_REQUEST_PAGE_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

// 移除員工登入相關變數

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
  { title: '申請類型', key: 'productType', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '處理人員', key: 'assignedDesigner.name', sortable: false },
  { title: '部門備註', key: 'departmentNote', width: 300, align: 'center', sortable: false },
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
  // 其他欄位會在選擇申請類型後動態添加
})

// 申請類型選項
const productTypeOptions = ref([])
// 大分類選項
const productCategoryOptions = ref([])

// 動態表單欄位
const formFields = ref([])

// 當前申請類型配置
const productTypeConfig = ref(null)

// 計算屬性：過濾顯示的欄位
const visibleFormFields = computed(() => {
  // 過濾掉 needAirlineHighlight、needUseLogo 這兩個欄位
  return formFields.value.filter(
    field => field.name !== 'needAirlineHighlight' && field.name !== 'needUseLogo'
  )
})

// 計算屬性：根據大分類過濾申請類型選項
const filteredProductTypeOptions = computed(() => {
  if (!searchCriteria.productCategory) {
    return productTypeOptions.value
  }

  const categoryMap = {
    'printing': ['printing'],
    'map': ['seriesMap', 'seriesMapModify', 'SPMap'],
    'dm': ['newDMSingle', 'newDMMultiple', 'modifyDM'],
    'electronic': ['newElectronicInfo']
  }

  const allowedTypes = categoryMap[searchCriteria.productCategory] || []
  return productTypeOptions.value.filter(option => allowedTypes.includes(option.value))
})

// 計算屬性：檢查是否有勾選任一印刷子類型
const hasSelectedPrintingType = computed(() => {
  if (!formData.printingTypes) return false
  return Object.values(formData.printingTypes).some(value => value === true)
})

// 計算屬性：檢查是否只有車頭牌被勾選
const isOnlyCoachSign = computed(() => {
  if (!formData.printingTypes) return false
  return formData.printingTypes.coachSign === true &&
         formData.printingTypes.infoBookletCover === false &&
         formData.printingTypes.banner === false &&
         formData.printingTypes.other === false
})

// 重新載入印刷相關欄位配置
const reloadPrintingFields = async () => {
  if (formData.productType !== 'printing') return

  try {
    const params = new URLSearchParams()
    if (formData.printingTypes) {
      params.append('printingTypes', JSON.stringify(formData.printingTypes))
    }

    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/printing/fields?${params.toString()}`)
    if (data.success) {
      productTypeConfig.value = data.result
    }
  } catch (error) {
    console.error('重新載入印刷欄位配置失敗:', error)
  }
}

// 員工列表
const employees = ref([])
const marketingDesigners = ref([])

// 搜尋條件
const searchCriteria = reactive({
  search: '',
  applicationDate: [],
  applicant: '',
  productCategory: '',
  productType: '',
  status: '',
  assignedDesigner: ''
})

// 快速搜尋
const quickSearch = ref('')
const isSearching = ref(false)

// 新增 basePath 變數，取得 Vite 的 base 路徑
const basePath = import.meta.env.BASE_URL || '/'

// 格式化部門備註內容
const formatDepartmentNote = (content) => {
  if (!content) return ''
  return content.replace(
    /<a href="([^"]+)" target="_blank" class="url-button">連結<\/a>/g,
    (match, url) => {
      return `<a href="${url}" target="_blank" class="url-button">連結</a>`
    }
  )
}

// 重置搜尋條件
const resetSearch = () => {
  searchCriteria.search = ''
  searchCriteria.applicationDate = []
  searchCriteria.applicant = ''
  searchCriteria.productCategory = ''
  searchCriteria.productType = ''
  searchCriteria.status = ''
  searchCriteria.assignedDesigner = ''
  fetchTableData()
}

// 取得表格資料
const fetchTableData = async () => {
  if (loading.value) {
    return
  }
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
    if (searchCriteria.productCategory) params.productCategory = searchCriteria.productCategory
    if (searchCriteria.productType) params.productType = searchCriteria.productType
    if (searchCriteria.status) params.status = searchCriteria.status
    if (searchCriteria.assignedDesigner) params.assignedDesigner = searchCriteria.assignedDesigner

    // 申請日期區間處理
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

    const endpoint = '/marketing/design-requests'
    const { data } = await apiAuth.get(endpoint, { params })

    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
    } else {
      console.error('API 回應失敗:', data)
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

// 取得申請類型選項
const fetchProductTypes = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/design-requests/product-types')
    if (data.success) {
      productTypeOptions.value = data.result.flatMap(category =>
        category.items.map(item => ({
          value: item.value,
          label: `${category.category} - ${item.label}`
        }))
      )
    }
  } catch (error) {
    console.error('取得申請類型失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得申請類型失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 取得大分類選項
const fetchProductCategories = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/design-requests/product-categories')
    if (data.success) {
      productCategoryOptions.value = data.result
    }
  } catch (error) {
    console.error('取得大分類失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得大分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 大分類變更處理
const handleProductCategoryChange = () => {
  // 當大分類變更時，清空申請類型選擇
  searchCriteria.productType = ''
}

// 申請類型變更處理
const handleProductTypeChange = async (value) => {
  if (!value) {
    formFields.value = []
    productTypeConfig.value = null
    return
  }

  try {
    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/${value}/fields`)
    if (data.success) {
      const config = data.result
      productTypeConfig.value = config

      // 特殊處理：印刷相關類型
      if (value === 'printing') {
        // 初始化印刷類型選擇
        if (!formData.printingTypes) {
          formData.printingTypes = {
            infoBookletCover: false,
            banner: false,
            coachSign: false,
            other: false
          }
        }

        // 初始化各子類型的資料結構
        if (!formData.infoBookletCover) {
          formData.infoBookletCover = {
            title: '',
            style: '',
            imageSubject: '',
            content: '',
            requestedByDate: null
          }
        }
        if (!formData.banner) {
          formData.banner = {
            title: '',
            style: '',
            imageSubject: '',
            content: '',
            quantity: 1,
            requestedByDate: null
          }
        }
        if (!formData.coachSign) {
          formData.coachSign = {
            content: '',
            useInfoBookletCover: false,
            quantity: 1
          }
        }
        if (!formData.otherNote) {
          formData.otherNote = ''
        }

        formFields.value = []
      } else {
        // 其他類型的原有處理邏輯
        formFields.value = [
          ...(config.fields || []),
          ...(config.required || []),
          ...(config.optional || []),
          ...(config.conditional || [])
        ]
        console.log('formFields', formFields.value)

        // 初始化表單資料
        formFields.value.forEach(field => {
          if (!(field.name in formData)) {
            if (field.type === 'checkbox') {
              formData[field.name] = false
            } else if (field.type === 'file') {
              formData[field.name] = null
            } else if (field.type === 'date') {
              formData[field.name] = null
            } else if (field.type === 'select') {
              // 特殊處理：DM單支和DM多支的useQuickTemplate預設為false
              if (field.name === 'useQuickTemplate' && (value === 'newDMSingle' || value === 'newDMMultiple')) {
                formData[field.name] = false
              }
              // 特殊處理：車頭牌的useInfoBookletCover預設為false
              else if (field.name === 'useInfoBookletCover' && value === 'coachSign') {
                formData[field.name] = false
              } else {
                formData[field.name] = null
              }
            } else {
              formData[field.name] = ''
            }
          }
        })

        // 特殊處理：新DM(多支)自動初始化兩筆行程
        if (value === 'newDMMultiple') {
          const itineraryField = formFields.value.find(field => field.name === 'itinerary')
          if (itineraryField && (!formData.itinerary || formData.itinerary.length === 0)) {
            formData.itinerary = []
            // 自動新增兩筆行程
            for (let i = 0; i < 2; i++) {
              const newItem = {}
              itineraryField.arrayFields.forEach(subField => {
                if (subField.type === 'number') {
                  newItem[subField.name] = 0
                } else if (subField.type === 'checkbox') {
                  newItem[subField.name] = false
                } else {
                  newItem[subField.name] = ''
                }
              })
              formData.itinerary.push(newItem)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('取得欄位配置失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得欄位配置失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    formFields.value = []
    productTypeConfig.value = null
  }
}



// 監聽印刷類型變更
watch(() => formData.printingTypes, async (newValue) => {
  if (formData.productType === 'printing' && newValue) {
    await reloadPrintingFields()
  }
}, { deep: true })

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

  // 額外驗證行程陣列
  let itineraryValid = true
  const itineraryField = formFields.value.find(field => field.name === 'itinerary')
  if (itineraryField && itineraryField.required) {
    if (!formData.itinerary || formData.itinerary.length === 0) {
      itineraryValid = false
      createSnackbar({
        text: '請至少新增一筆行程',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  }

  // 額外驗證印刷相關
  let printingValid = true
  if (formData.productType === 'printing') {
    // 檢查是否至少選擇了一個印刷類型
    const selectedTypes = Object.values(formData.printingTypes || {}).filter(Boolean)
    if (selectedTypes.length === 0) {
      printingValid = false
      createSnackbar({
        text: '請至少選擇一個印刷類型',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }

    // 檢查檔案上傳（只有車頭牌被勾選時不驗證）
    if (!isOnlyCoachSign.value && productTypeConfig.value?.requiredFiles) {
      const fileField = productTypeConfig.value.requiredFiles.find(field => field.name === 'files')
      if (fileField && (!formData.files || formData.files.length === 0)) {
        printingValid = false
      }
    }
  }

  // 只有驗證通過才顯示確認對話框
  if (valid && itineraryValid && printingValid) {
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

      // 跳過 applicant，讓後端自動設置為登入用戶
      if (key === 'applicant') return

      if (Array.isArray(formData[key]) && formData[key][0] instanceof File) {
        // 處理檔案上傳（只有車頭牌被勾選時不傳送檔案）
        if (key === 'files' && isOnlyCoachSign.value) {
          // 只有車頭牌被勾選時，不傳送檔案
          return
        }
        formData[key].forEach(file => {
          formDataToSend.append(key, file)
        })
      } else if (Array.isArray(formData[key]) && key === 'itinerary') {
        // 特殊處理行程陣列
        formData[key].forEach((item, index) => {
          Object.keys(item).forEach(subKey => {
            formDataToSend.append(`itinerary[${index}][${subKey}]`, item[subKey])
          })
        })
      } else if (formData[key] instanceof Date) {
        // 處理日期
        formDataToSend.append(key, formData[key].toISOString())
      } else if (key === 'printingTypes' || key === 'infoBookletCover' || key === 'banner' || key === 'coachSign' || key === 'otherNote') {
        // 特殊處理印刷相關資料
        if (key === 'printingTypes') {
          formDataToSend.append(key, JSON.stringify(formData[key]))
        } else if (key === 'infoBookletCover' || key === 'banner' || key === 'coachSign') {
          // 只要有勾選，所有欄位都送出（即使為空）
          if (formData.printingTypes && formData.printingTypes[key]) {
            // 根據子類型定義所有應該送出的欄位
            const fieldDefinitions = {
              infoBookletCover: ['title', 'style', 'imageSubject', 'content', 'requestedByDate'],
              banner: ['title', 'style', 'imageSubject', 'content', 'quantity', 'requestedByDate'],
              coachSign: ['content', 'useInfoBookletCover', 'quantity']
            }

            const fieldsToSend = fieldDefinitions[key] || []
            fieldsToSend.forEach(subKey => {
              const value = formData[key]?.[subKey]
              if (value instanceof Date) {
                formDataToSend.append(`${key}[${subKey}]`, value.toISOString())
              } else {
                formDataToSend.append(`${key}[${subKey}]`, value ?? '')
              }
            })
          }
        } else if (key === 'otherNote' && formData.printingTypes && formData.printingTypes.other) {
          formDataToSend.append(key, formData[key] ?? '')
        }
      } else if (formData[key] !== null && formData[key] !== undefined) {
        // 只傳送非 null 和非 undefined 的值
        formDataToSend.append(key, formData[key])
      }
    })

    // 使用一般 API 端點
    const endpoint = '/marketing/design-requests'

    const { data } = await apiAuth.post(endpoint, formDataToSend, {
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
  formFields.value = []
  productTypeConfig.value = null

  // 清除動態欄位
  const keysToDelete = Object.keys(formData).filter(key =>
    key !== 'productType'
  )
  keysToDelete.forEach(key => {
    delete formData[key]
  })

  // 清除印刷相關資料
  if (formData.printingTypes) {
    delete formData.printingTypes
  }
  if (formData.infoBookletCover) {
    delete formData.infoBookletCover
  }
  if (formData.banner) {
    delete formData.banner
  }
  if (formData.coachSign) {
    delete formData.coachSign
  }
  if (formData.otherNote) {
    delete formData.otherNote
  }
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
  if (formData[fieldName] && formData[fieldName].length > index && formData[fieldName].length > 2) {
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
    array: 'mdi-view-list',
    select: 'mdi-form-select'
  }
  return iconMap[fieldType] || 'mdi-form-textbox'
}

// 取得所有用戶列表（用於申請人）
const fetchEmployees = async () => {
  try {
    const { data } = await apiAuth.get('/users/public/all')
    if (data.success) {
      const users = Array.isArray(data.result?.data) ? data.result.data.slice() : []
      users.sort((a, b) => String(a?.userId ?? '').localeCompare(String(b?.userId ?? '')))
      employees.value = users
    }
  } catch (error) {
    console.error('取得用戶列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得用戶列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 取得行銷美編部用戶列表（用於處理人員）
const fetchMarketingDesigners = async () => {
  try {
    const { data } = await apiAuth.get('/permissions/users-by-role', {
      params: { permission: 'MARKETING_DESIGN_REQUEST_DESIGNER_TAG' }
    })
    if (data.success) {
      const users = Array.isArray(data.result?.data) ? data.result.data : []
      marketingDesigners.value = users
        .map(u => ({ _id: u._id, name: u.name, userId: u.userId }))
        .sort((a, b) => String(a?.userId ?? '').localeCompare(String(b?.userId ?? '')))
      return
    }
    // 非 success 視為錯誤處理
    throw new Error('載入處理人員失敗')
  } catch (error) {
    marketingDesigners.value = []
    console.error('取得行銷美編部用戶列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '無法載入處理人員清單',
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
  if (!date) return ''
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (e) {
    console.error('Error formatting time:', e)
    return ''
  }
}

// 取得申請類型文字
const getProductTypeText = (type, row) => {
  if (type === 'printing') {
    // 若 row 有 printingTypes，則用 getPrintingTypeText
    if (row && row.printingTypes) return getPrintingTypeText(row.printingTypes)
    // 詳細資訊用 formData.printingTypes
    if (formData && formData.printingTypes) return getPrintingTypeText(formData.printingTypes)
    return '【印刷相關】'
  }
  const option = productTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 自定義搜尋過濾器
const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const itemText = item.raw && item.raw.name && item.raw.userId
    ? `${item.raw.name} ${item.raw.userId}`.toLowerCase()
    : item.raw && item.raw.name ? item.raw.name.toLowerCase() : ''
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

// 截斷過長的檔名
const truncateFileName = (name, length = 15) => {
  if (name.length <= length) {
    return name
  }
  return `${name.substring(0, length)}...`
}



// 取得檔案上傳錯誤訊息
const getFileUploadErrorMessage = (label) => {
  if (!label) return '請上傳檔案'

  // 移除必填標記
  const cleanLabel = label.replace(/^\*\s*/, '')

  // 如果標籤已經包含「上傳檔案」，直接使用
  if (cleanLabel === '上傳檔案') {
    return '請上傳檔案'
  }

  // 如果標籤包含「圖片」，使用「請上傳圖片」
  if (cleanLabel.includes('圖片')) {
    return '請上傳圖片'
  }

  // 如果標籤已經包含「上傳」，直接使用
  if (cleanLabel.includes('上傳')) {
    return `請${cleanLabel}`
  }

  // 否則加上「請上傳」
  return `請上傳${cleanLabel}`
}

// 取得巢狀物件值
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// 設定巢狀物件值
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

// 移除所有員工登入相關函數

// 頁面載入時初始化
onMounted(async () => {
  try {
    loading.value = true

    // 載入基本資料
    await Promise.all([
      fetchProductTypes(),
      fetchProductCategories(),
      fetchEmployees(),
      fetchMarketingDesigners()
    ])

    console.log('開始載入表格資料...')
    loading.value = false
    // 執行搜尋
    await fetchTableData()
    console.log('表格資料載入完成')
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '初始化失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
})

// 清理定時器
onUnmounted(() => {
  // 移除員工登入相關的清理邏輯
})

// 取得印刷相關子類型顯示文字
const getPrintingTypeText = (printingTypes) => {
  if (!printingTypes) return ''
  const map = {
    infoBookletCover: '說資封面',
    banner: '布條',
    coachSign: '車頭牌',
    other: '其他'
  }
  const selected = Object.entries(printingTypes)
    .filter(([, v]) => v)
    .map(([k]) => map[k])
    .filter(Boolean)
  return selected.length > 0 ? `【印刷相關】- ${selected.join('、')}` : '【印刷相關】'
}
</script>

<style lang="scss" scoped>
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
  :deep(.url-button) {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 4px;
    margin: 0 2px;
    font-size: 11px;
    transition: background-color 0.2s;
    background-color: #4077ad;
    color: white;
    text-decoration: none;
    &:hover {
    background-color: #1565c0;
    }
  }
}

.sub-card-title {
  font-size: 14px;
  font-weight: 500;
  color: #455a64;
}

.info-item-value {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 38px;
}

/* 確認送出對話框樣式 */
.border-left-teal-darken-2 {
  border-left: 4px solid rgb(0, 121, 107) !important;
}

.printing-checkbox-card {
  border: 1px solid #b2dfdb;
  background: #f5fafd;
  border-radius: 8px;
}

.printing-checkbox {
  font-weight: 500;
  font-size: 16px;
}
/* 新增申請時的印刷相關樣式 */
.add-dialog .printing-section-card {
  background: #fff;
  border: 2px solid #26a69a;
  border-radius: 10px;
}
.add-dialog .printing-section-header {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

/* 詳細資訊對話框中的印刷相關樣式 - 使用一致的藍色主題 */
.dialog .printing-section-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
}
.dialog .printing-section-header {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.upload-file-card {
  border: 1px solid #81D4FA;
  border-radius: 8px;
}

.clock-container {
  border: 1px solid #E65100;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 16px;
}

/* 部門備註顯示樣式 */
.department-note-display {
  text-align: center;
}


.department-note-text {
  margin: 8px 0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  transition: all 0.1s ease;
  :deep(.url-button) {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 4px;
    margin: 0 2px;
    font-size: 11px;
    transition: background-color 0.2s;
    background-color: #4077ad;
    color: white;
    text-decoration: none;
    &:hover {
    background-color: #1565c0;
    }
  }
}
</style>
