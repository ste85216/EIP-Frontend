<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6 py-1">
            <h3>
              行銷美編需求申請
            </h3>
            <v-spacer />
            <!-- 移除員工登入相關 UI -->
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 申請日期 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex  flex-column">
                  <span class="search-label">申請日期 :</span>
                  <v-date-input
                    v-model="searchCriteria.applicationDate"
                    variant="outlined"
                    density="compact"
                    prepend-icon
                    clearable
                    multiple="range"
                    hide-details
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
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請人 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.applicant"
                    :items="employees"
                    :item-title="item => {
                      if (!item || !item.name) return ''
                      const extNumber = item.employeeLink?.extNumber
                      return extNumber ? `${item.name} (${extNumber})` : item.name
                    }"
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
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請類型 (大) :</span>
                  <v-select
                    v-model="searchCriteria.productCategory"
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
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">申請類型 :</span>
                  <v-select
                    v-model="searchCriteria.productType"
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
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">狀態 :</span>
                  <v-select
                    v-model="searchCriteria.status"
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
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">處理人員 :</span>
                  <v-autocomplete
                    v-model="searchCriteria.assignedDesigner"
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
              <v-col
                lg="10"
                class="d-none d-md-block"
              />
              <!-- 搜尋按鈕 -->
              <v-col
                cols="12"
                md="8"
                lg="2"
              >
                <v-row class="d-sm-flex justify-sm-end">
                  <v-col
                    cols="8"
                    sm="4"
                    lg="8"
                    class="ps-1 pe-0"
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
                    cols="4"
                    sm="2"
                    lg="4"
                    class="pe-2"
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
          <v-divider class="my-0" />

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
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
                <v-col
                  cols="7"
                  sm="6"
                  md="4"
                  lg="2"
                  class="px-1 my-1"
                >
                  <div class="d-flex align-center">
                    <!-- <v-icon
                      v-if="smAndUp"
                      v-tooltip:start="'可搜尋申請編號、申請詳細資訊'"
                      icon="mdi-information"
                      size="small"
                      color="blue-grey-darken-2"
                      class="me-2"
                    /> -->
                    <v-text-field
                      v-model="quickSearch"
                      :loading="isSearching"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋申請編號、申請詳細資訊"
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
          <v-card-text class="px-sm-6 px-md-7">
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
                  <!-- 申請編號 -->
                  <td v-if="mdAndUp">
                    {{ item.designRequestNumber }}
                  </td>

                  <!-- 申請日期 -->
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

                  <!-- 申請人 -->
                  <td>{{ item.applicant?.name }} ({{ item.applicant?.employeeLink?.extNumber || 'N/A' }})</td>

                  <!-- 申請類型 -->
                  <td v-if="smAndUp">
                    {{ getProductTypeText(item.productType, item) }}
                  </td>

                  <!-- 狀態 -->
                  <td v-if="smAndUp">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                      label
                      class="font-weight-medium"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </td>

                  <!-- 處理人員 -->
                  <td v-if="mdAndUp">
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

                  <!-- 部門備註 -->
                  <td v-if="mdAndUp">
                    <div
                      v-if="getDisplayDepartmentNote(item) || item.quotaRank"
                      class="department-note-display"
                    >
                      <div class="department-note-text">
                        <span
                          v-if="item.quotaRank"
                          class="quota-rank-badge"
                          :class="item.quotaRank.startsWith('正取') ? 'regular' : 'backup'"
                        >{{ item.quotaRank }}</span>
                        <span
                          v-if="getDisplayDepartmentNote(item)"
                          v-html="formatDepartmentNote(getDisplayDepartmentNote(item))"
                        />
                      </div>
                    </div>
                    <div
                      v-else
                      class="department-note-display"
                    >
                      <span class="text-grey-lighten-1">( 無 )</span>
                    </div>
                  </td>

                  <!-- 查看 -->
                  <td class="text-center">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
                      :disabled="item.status === 'cancelled' || item.productType === 'customerComment'"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-book-open-variant-outline</v-icon>
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
      <v-card class="rounded-lg dialog">
        <v-card-title class="d-flex align-center px-6 py-2 bg-light-blue-darken-2 position-sticky top-0">
          <v-icon
            icon="mdi-text-box-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">申請單詳細資訊</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4 overflow-y-auto">
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
                    <div class="text-body-2 info-item-value">
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
                    <div class="text-body-2 info-item-value">
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
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">申請時間</span>
                    </div>
                    <div class="text-body-2 info-item-value">
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
                    <div class="text-body-2 info-item-value">
                      {{ formData.applicant?.name ? `${formData.applicant.name} (${formData.applicant?.employeeLink?.extNumber || 'N/A'})` : '( 無 )' }}
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
                    <div class="text-body-2 info-item-value">
                      <v-chip
                        :color="getStatusColor(formData.status)"
                        size="small"
                        label
                        class="font-weight-medium"
                        style="font-family: '微軟正黑體';"
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
                    <div class="text-body-2 info-item-value">
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
                    <div class="text-body-2 info-item-value">
                      <template v-if="getDisplayDepartmentNote(formData) || formData.quotaRank">
                        <span
                          v-if="formData.quotaRank"
                          class="quota-rank-badge"
                          :class="formData.quotaRank.startsWith('正取') ? 'regular' : 'backup'"
                        >{{ formData.quotaRank }}</span>
                        <span
                          v-if="getDisplayDepartmentNote(formData)"
                          style="white-space: pre-line;"
                          v-html="formatDepartmentNote(getDisplayDepartmentNote(formData))"
                        />
                      </template>
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
                <!-- 共同欄位顯示區塊（最上方） -->
                <v-row>
                  <!-- 行程簡稱 -->
                  <v-col
                    v-if="formData.tripShortName"
                    cols="12"
                    sm="6"
                  >
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
                          mdi-text
                        </v-icon>
                        <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">行程簡稱</span>
                      </div>
                      <div class="text-body-2 info-item-value">
                        {{ formData.tripShortName }}
                      </div>
                    </v-card>
                  </v-col>
                  <!-- 上傳檔案 -->
                  <v-col
                    v-if="formData.files && formData.files.length > 0"
                    cols="12"
                    :sm="formData.tripShortName ? 6 : 12"
                  >
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
                        <div class="d-flex flex-column">
                          <div
                            v-for="(file, index) in formData.files"
                            :key="index"
                            :class="['d-flex align-center px-2 rounded-sm', formData.files.length > 1 && index < formData.files.length - 1 ? 'mb-2' : '']"
                            style="border: 1px solid #e6e6e6; min-height: 38px;"
                          >
                            <v-icon
                              size="small"
                              class="me-2"
                              :color="isImageFile(file) ? 'blue' : 'grey'"
                            >
                              {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                            </v-icon>
                            <span class="text-grey-darken-1 me-2 flex-grow-1">{{ truncateFileName(getFileName(file), 25) }}</span>
                            <!-- 圖片預覽按鈕 -->
                            <v-btn
                              v-if="isImageFile(file)"
                              icon
                              size="small"
                              color="blue"
                              variant="text"
                              @click="openLightbox(formData.files, index)"
                            >
                              <v-icon>mdi-eye</v-icon>
                            </v-btn>
                          </div>
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
                      v-if="formData.printingTypes && formData.printingTypes[sectionKey] && formData[sectionKey]"
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
              <!-- 館格修改、下架特殊顯示 -->
              <template v-else-if="formData.productType === 'galleryModifyRemove'">
                <v-row>
                  <!-- 根據選擇顯示對應資料 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="formData.galleryTypes && formData.galleryTypes[sectionKey] && formData[sectionKey]"
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
                                  <template v-else-if="field.type === 'file'">
                                    <template v-if="getNestedValue(formData, field.name) && getNestedValue(formData, field.name).length > 0">
                                      <div class="d-flex flex-column">
                                        <div
                                          v-for="(file, index) in getNestedValue(formData, field.name)"
                                          :key="index"
                                          :class="['d-flex align-center px-2 py-2 rounded-sm', getNestedValue(formData, field.name).length > 1 && index < getNestedValue(formData, field.name).length - 1 ? 'mb-2' : '']"
                                          style="border: 1px solid #e6e6e6;"
                                        >
                                          <v-icon
                                            size="small"
                                            class="me-2"
                                            :color="isImageFile(file) ? 'blue' : 'grey'"
                                          >
                                            {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                                          </v-icon>
                                          <span class="text-grey-darken-1 me-2 flex-grow-1">{{ truncateFileName(getFileName(file), 25) }}</span>
                                          <!-- 圖片預覽按鈕 -->
                                          <v-btn
                                            v-if="isImageFile(file)"
                                            icon
                                            size="20"
                                            color="blue"
                                            variant="plain"
                                            :ripple="false"
                                            class="opacity-100"
                                            @click="openLightbox(getNestedValue(formData, field.name), index)"
                                          >
                                            <v-icon size="16">
                                              mdi-eye
                                            </v-icon>
                                          </v-btn>
                                        </div>
                                      </div>
                                    </template>
                                    <template v-else>
                                      <span class="text-grey">( 無 )</span>
                                    </template>
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
                            <div class="d-flex flex-column">
                              <div
                                v-for="(file, index) in formData[field.name]"
                                :key="index"
                                :class="['d-flex align-center px-2 py-2 rounded-sm', formData[field.name].length > 1 && index < formData[field.name].length - 1 ? 'mb-2' : '']"
                                style="border: 1px solid #e6e6e6;"
                              >
                                <v-icon
                                  size="small"
                                  class="me-2"
                                  :color="isImageFile(file) ? 'blue' : 'grey'"
                                >
                                  {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                                </v-icon>
                                <span class="text-grey-darken-1 me-2 flex-grow-1">{{ truncateFileName(getFileName(file), 25) }}</span>
                                <!-- 圖片預覽按鈕 -->
                                <v-btn
                                  v-if="isImageFile(file)"
                                  icon
                                  size="20"
                                  color="blue"
                                  variant="plain"
                                  :ripple="false"
                                  class="opacity-100"
                                  @click="openLightbox(formData[field.name], index)"
                                >
                                  <v-icon size="16">
                                    mdi-eye
                                  </v-icon>
                                </v-btn>
                              </div>
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
                                      :clearable="!dialog.isEdit"
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
                                      :clearable="!dialog.isEdit"
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
                                      :clearable="!dialog.isEdit"
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
                                      :clearable="!dialog.isEdit"
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
                                      :clearable="!dialog.isEdit"
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
            :size="smAndUp ? 'default' : 'small'"
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
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-text-box-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">新增申請單</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-4 px-sm-6  py-4 py-sm-7 overflow-y-auto">
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
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="teal-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="4"
                    md="2"
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
                    cols="3"
                    sm="4"
                    md="5"
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
                  :items="productTypeOptionsForCreate"
                  item-title="label"
                  item-value="value"
                  label="* 申請類型"
                  variant="outlined"
                  density="compact"
                  :readonly="dialog.isEdit"
                  :rules="[
                    v => !!v || '請選擇申請類型',
                  ]"
                  @update:model-value="handleProductTypeChange"
                />
              </v-col>

              <!-- 申請類型設定資訊顯示（只在有設定時間或名額限制時顯示） -->
              <v-col
                v-if="formData.productType && productTypeConfig?.config && (productTypeConfig.config.enableTimeLimit || productTypeConfig.config.enableQuotaLimit)"
                cols="12"
              >
                <v-card
                  class="px-4 py-3 elevation-0"
                  style="background-color: #f9f9f9; border: 1px solid #ddd;"
                >
                  <div class="flex-wrap">
                    <!-- 時間限制顯示 -->
                    <template v-if="productTypeConfig.config.enableTimeLimit">
                      <div class="d-inline-flex align-center setting-content font-weight-bold text-grey-darken-2 me-sm-4">
                        <v-icon
                          icon="mdi-clock-outline"
                          :size="smAndUp ? '18' : '14'"
                          color="orange-darken-2"
                          class="me-2"
                        /> <span class="setting-title">開放申請時間：</span>
                        <span class="setting-content font-weight-bold text-orange-darken-2 ">
                          {{ formatDateTime(productTypeConfig.config.applicationStartDate) }} ~ {{ formatDateTime(productTypeConfig.config.applicationEndDate) }}
                        </span>
                      </div>
                    </template>

                    <!-- 名額限制顯示 -->
                    <template v-if="productTypeConfig.config.enableQuotaLimit">
                      <div class="d-inline-flex align-center setting-content font-weight-bold text-grey-darken-2">
                        <v-icon
                          icon="mdi-account-multiple"
                          :size="smAndUp ? '18' : '14'"
                          color="blue-darken-2"
                          class="me-2"
                        /> <span class="setting-title-2">剩餘名額：</span>
                        <span
                          class="setting-content"
                          :class="productTypeConfig.config.quotaRemaining > 0 ? 'font-weight-bold text-blue-darken-2' : 'font-weight-bold text-red-darken-2'"
                        >
                          {{ productTypeConfig.config.quotaRemaining || 0 }} / {{ productTypeConfig.config.quotaLimit }}
                          <template v-if="productTypeConfig.config.backupQuota !== undefined && productTypeConfig.config.backupQuota !== null && productTypeConfig.config.backupQuota > 0">
                            <span class="text-blue-grey-darken-2 ms-1 font-weight-regular">
                              ( 包含 <span class="text-pink font-weight-bold">{{ productTypeConfig.config.backupQuota }}</span> 備取 )
                            </span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </div>
                </v-card>
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
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center justify-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="teal-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
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
                      cols="3"
                      sm="4"
                      md="5"
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
                  <v-col
                    cols="12"
                    class="pb-0"
                  >
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
                        <v-row v-if="formData.printingTypes">
                          <v-col
                            v-for="subType in productTypeConfig?.subTypes"
                            :key="subType.name"
                            cols="6"
                            md="3"
                            class="py-0 py-sm-2"
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

                  <!-- 共同欄位（放在所有子類型表單區塊上方） -->
                  <v-col
                    v-if="productTypeConfig?.requiredFiles && hasSelectedPrintingType"
                    cols="12"
                    class="mb-4"
                  >
                    <v-card
                      class="pa-4 elevation-0 upload-file-card"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="sub-title font-weight-bold text-light-blue-darken-3">※ 共同欄位</span>
                      </div>
                      <v-row>
                        <template
                          v-for="field in productTypeConfig.requiredFiles"
                          :key="field.name"
                        >
                          <!-- 行程簡稱欄位 -->
                          <v-col
                            v-if="field.type === 'text' && field.name === 'tripShortName'"
                            :cols="field.cols?.xs || 12"
                            :sm="field.cols?.sm || 6"
                            :lg="field.cols?.lg || 6"
                          >
                            <v-text-field
                              v-model="formData[field.name]"
                              :label="field.label"
                              variant="outlined"
                              density="compact"
                              :readonly="dialog.isEdit"
                              :rules="field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                            />
                          </v-col>
                          <!-- 上傳檔案欄位 -->
                          <v-col
                            v-else-if="field.type === 'file'"
                            :cols="field.cols?.xs || 12"
                            :sm="field.cols?.sm || 12"
                            :lg="field.cols?.lg || 12"
                          >
                            <v-file-input
                              v-model="formData[field.name]"
                              :label="getFileUploadLabel(field.label, field)"
                              variant="outlined"
                              density="compact"
                              :multiple="field.multiple"
                              :accept="field.accept"
                              :readonly="dialog.isEdit"
                              :rules="[
                                v => (v && v.length > 0) || '請上傳檔案 ( LOGO AI 檔、行程 Word 檔、圖片檔 )',
                                v => !v || v.length <= 5 || '最多只能上傳 5 個檔案'
                              ]"
                              counter
                              prepend-icon="mdi-paperclip"
                              chips
                              @update:model-value="(files) => handleFileInputChange(files, field)"
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
                                      class="text-caption text-grey-darken-3 ms-1"
                                    >
                                      +{{ fileNames.length - 2 }} 個檔案
                                    </span>
                                  </template>
                                </div>
                              </template>
                            </v-file-input>
                          </v-col>
                        </template>
                      </v-row>
                    </v-card>
                  </v-col>

                  <!-- 子類型表單區塊 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="formData.printingTypes && formData.printingTypes[sectionKey] && (sectionKey === 'other' ? true : formData[sectionKey])"
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
                                :min="field.name.includes('requestedByDate') && !dialog.isEdit ? getMinDeliveryDate() : undefined"
                                :allowed-dates="field.name.includes('requestedByDate') && !dialog.isEdit ? isAllowedDate : undefined"
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

                <!-- 館格修改、下架特殊處理 -->
                <template v-else-if="formData.productType === 'galleryModifyRemove'">
                  <v-col
                    cols="12"
                    class="pb-0"
                  >
                    <v-card class="mb-4 printing-checkbox-card elevation-0">
                      <v-card-text class="py-4">
                        <div class="card-title text-teal-darken-2 mb-3">
                          <v-icon
                            icon="mdi-checkbox-multiple-marked-outline"
                            size="20"
                            class="me-2"
                          />
                          請選擇需要的項目
                        </div>
                        <v-row v-if="formData.galleryTypes">
                          <v-col
                            v-for="subType in productTypeConfig?.subTypes"
                            :key="subType.name"
                            cols="6"
                            md="3"
                            class="py-0 py-sm-2"
                          >
                            <v-checkbox
                              v-model="formData.galleryTypes[subType.name]"
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

                  <!-- 子類型表單區塊 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="formData.galleryTypes && formData.galleryTypes[sectionKey] && formData[sectionKey]"
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
                              <!-- 檔案上傳欄位 -->
                              <v-file-input
                                v-else-if="field.type === 'file'"
                                :model-value="getNestedValue(formData, field.name)"
                                :label="getFileUploadLabel(field.label, field)"
                                variant="outlined"
                                density="compact"
                                :multiple="field.multiple"
                                :accept="field.accept"
                                :readonly="dialog.isEdit"
                                :rules="field.required ? [v => (v && v.length > 0) || getFileUploadErrorMessage(field.label)] : []"
                                counter
                                prepend-icon="mdi-paperclip"
                                chips
                                @update:model-value="(files) => handleGalleryFileInputChange(files, field)"
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
                                        class="text-caption text-grey-darken-3 ms-1"
                                      >
                                        +{{ fileNames.length - 2 }} 個檔案
                                      </span>
                                    </template>
                                  </div>
                                </template>
                              </v-file-input>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </template>
                </template>

                <!-- 動態表單欄位 -->
                <template v-else-if="formFields.length > 0">
                  <!-- 產品類型層級的示意圖（獨立佔據一整行） -->
                  <v-col
                    v-if="productTypeConfig?.illustrations && productTypeConfig.illustrations.length > 0"
                    cols="12"
                  >
                    <div class="text-center mb-4">
                      <img
                        v-for="(img, idx) in productTypeConfig.illustrations"
                        :key="img"
                        :src="basePath + img.replace(/^\//, '')"
                        :alt="productTypeConfig.displayName + ' 示意圖' + (idx+1)"
                        style="max-width: 100%; border-radius: 8px;"
                      >
                    </div>
                  </v-col>

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
                        class="mt-2 text-center"
                        style="gap: 16px; overflow-x: auto; padding-bottom: 8px;"
                      >
                        <img
                          v-for="(img, idx) in field.illustrations"
                          :key="img"
                          :src="basePath + img.replace(/^\//, '')"
                          :alt="field.label + ' 示意圖' + (idx+1)"
                          style="max-width: 550px; min-width: 280px; border-radius: 8px; flex-shrink: 0;"
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
                        class="mt-2 text-center"
                        style="gap: 16px; overflow-x: auto; padding-bottom: 8px;"
                      >
                        <img
                          v-for="(img, idx) in field.illustrations"
                          :key="img"
                          :src="basePath + img.replace(/^\//, '')"
                          :alt="field.label + ' 示意圖' + (idx+1)"
                          style="max-width: 550px; min-width: 280px; border-radius: 8px; flex-shrink: 0;"
                        >
                      </div>
                    </template>
                    <!-- 特殊處理：講座活動的日期時間欄位 -->
                    <template v-else-if="(field.name === 'eventDateTime' || field.name === 'entryDateTime') && formData.productType === 'lectureEvent'">
                      <v-text-field
                        v-model="formData[field.name]"
                        :label="field.label"
                        type="datetime-local"
                        variant="outlined"
                        density="compact"
                        :readonly="dialog.isEdit"
                        :rules="field.required ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : []"
                      />
                    </template>
                    <!-- 其他欄位原本渲染方式 -->
                    <template v-else>
                      <!-- 文字輸入欄位 -->
                      <div v-if="field.illustrations && field.illustrations.length">
                        <!-- 示意圖放在最上方 -->
                        <div
                          class="mb-3 overflow-x-auto text-center"
                          style="gap: 16px;"
                        >
                          <img
                            v-for="(img, idx) in field.illustrations"
                            :key="img"
                            :src="basePath + img.replace(/^\//, '')"
                            :alt="field.label + ' 示意圖' + (idx+1)"
                            style="max-width: 550px; border-radius: 8px;"
                          >
                        </div>
                        <v-text-field
                          v-if="field.type === 'text'"
                          v-model="formData[field.name]"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :disabled="(field.name === 'quickTemplateNumber' && formData.useQuickTemplate !== true) || (field.conditionalRequired && formData[field.conditionalRequired.field] !== field.conditionalRequired.value)"
                          :maxlength="field.maxLength"
                          :counter="field.maxLength ? true : false"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])]
                              : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])] : [])
                          "
                        />
                      </div>
                      <div v-else-if="field.type === 'text'">
                        <v-text-field
                          v-model="formData[field.name]"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :disabled="(field.name === 'quickTemplateNumber' && formData.useQuickTemplate !== true) || (field.conditionalRequired && formData[field.conditionalRequired.field] !== field.conditionalRequired.value)"
                          :maxlength="field.maxLength"
                          :counter="field.maxLength ? true : false"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])]
                              : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])] : [])
                          "
                        />
                      </div>
                      <!-- 多行文字輸入欄位 -->
                      <div v-else-if="field.type === 'textarea'">
                        <v-textarea
                          v-model="formData[field.name]"
                          :label="field.label"
                          variant="outlined"
                          density="compact"
                          :readonly="dialog.isEdit"
                          :maxlength="field.maxLength"
                          :counter="field.maxLength ? true : false"
                          :rules="
                            field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                              ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])]
                              : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`, ...(field.maxLength ? [v => !v || v.length <= field.maxLength || `字數不能超過${field.maxLength}字`] : [])] : [])
                          "
                          auto-grow
                          rows="5"
                        />
                        <!-- 顯示範例文字 -->
                        <div
                          v-if="field.exampleText"
                          class="mt-3 pa-3 rounded"
                          style="background: #f9f9f9; border: 1px solid #e0e0e0;"
                        >
                          <div class="d-flex align-center sub-title-1 text-grey-darken-1 mb-3 font-weight-bold">
                            <v-icon
                              icon="mdi-information"
                              size="14"
                              class="me-2"
                            />
                            範例：
                          </div>
                          <div
                            class="sub-title-1 text-grey-darken-1 font-weight-bold"
                            style="white-space: pre-line;"
                          >
                            {{ field.exampleText }}
                          </div>
                        </div>
                      </div>
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
                        :min="field.name.includes('requestedByDate') && !dialog.isEdit ? getMinDeliveryDate() : undefined"
                        :allowed-dates="field.name.includes('requestedByDate') && !dialog.isEdit ? isAllowedDate : undefined"
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
                        :label="getFileUploadLabel(field.label, field)"
                        variant="outlined"
                        density="compact"
                        :multiple="field.multiple"
                        :accept="field.accept"
                        :readonly="dialog.isEdit"
                        :disabled="field.conditionalRequired && formData[field.conditionalRequired.field] !== field.conditionalRequired.value"
                        :rules="[
                          ...(field.conditionalRequired && formData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [v => (v && v.length > 0) || getFileUploadErrorMessage(field.label)]
                            : (field.required ? [v => (v && v.length > 0) || getFileUploadErrorMessage(field.label)] : [])),
                          field.multiple === false
                            ? (v => !v || v.length <= 1 || '只能上傳 1 個檔案')
                            : (v => !v || v.length <= 5 || '最多只能上傳 5 個檔案')
                        ]"
                        counter
                        prepend-icon="mdi-paperclip"
                        chips
                        @update:model-value="(files) => handleFileInputChange(files, field)"
                      >
                        <template #selection="{ fileNames }">
                          <div
                            class="d-flex align-center"
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
                              >
                                {{ truncateFileName(fileName, 15) }}
                              </v-chip>
                              <span
                                v-if="index === 2"
                                class="text-caption text-grey-darken-3 ms-1"
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
                                    :clearable="!dialog.isEdit"
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
                                    :clearable="!dialog.isEdit"
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
                                    :clearable="!dialog.isEdit"
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
                                    :clearable="!dialog.isEdit"
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
                                    :clearable="!dialog.isEdit"
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
                      cols="3"
                      sm="4"
                      md="5"
                      class="d-flex align-center justify-center"
                    >
                      <v-divider
                        class="border-opacity-25"
                        color="orange-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      sm="4"
                      md="2"
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
                      cols="3"
                      sm="4"
                      md="5"
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
                    <span class="notice-text text-grey-darken-1">{{ notice }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 py-5">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="submitting"
            @click="confirmSubmit"
          >
            送出申請
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ImageLightbox ref="imageLightboxRef" />

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
import debounce from 'lodash/debounce'
import { useDisplay } from 'vuetify'
import ImageLightbox from '@/components/ImageLightbox.vue'
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

const { smAndUp, mdAndUp } = useDisplay()
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
const allHeaders = [
  { title: '申請編號', key: 'designRequestNumber', sortable: true, show: 'md' },
  { title: '申請時間', key: 'applicationDate', sortable: true, show: 'all' },
  { title: '申請人', key: 'applicant.name', sortable: false, show: 'all' },
  { title: '申請類型', key: 'productType', sortable: false, show: 'sm' },
  { title: '狀態', key: 'status', sortable: true, show: 'sm' },
  { title: '處理人員', key: 'assignedDesigner.name', sortable: false, show: 'md' },
  { title: '部門備註', key: 'departmentNote', width: 300, align: 'center', sortable: false, show: 'md' },
  { title: '查看', key: 'actions', align: 'center', sortable: false, show: 'all' }
]

// 計算屬性：根據螢幕大小過濾欄位
const tableHeaders = computed(() => {
  return allHeaders.filter(header => {
    if (header.show === 'all') return true
    if (header.show === 'sm' && smAndUp.value) return true
    if (header.show === 'md' && mdAndUp.value) return true
    return false
  })
})

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
// 國定假日列表（Set 格式，方便快速查找）
const taiwanHolidays = ref(new Set())

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
    'itRelated': ['newElectronicInfo', 'coSellingTour'],
    'website': ['homepageBanner', 'hostedTour', 'galleryModifyRemove'],
    'other': ['coupon', 'lectureEvent', 'customerComment']
  }

  const allowedTypes = categoryMap[searchCriteria.productCategory] || []
  return productTypeOptions.value.filter(option => allowedTypes.includes(option.value))
})

// 計算屬性：新增申請時的申請類型選項（包含 disabled 狀態）
const productTypeOptionsForCreate = computed(() => {
  // 暫時禁用的申請類型
  const disabledTypes = ['homepageBanner', 'coupon']

  return productTypeOptions.value.map(option => ({
    ...option,
    disabled: disabledTypes.includes(option.value)
  }))
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

      // 當「其他」選項被勾選時，確保 otherNote 被初始化
      if (formData.printingTypes && formData.printingTypes.other && (formData.otherNote === undefined || formData.otherNote === null)) {
        formData.otherNote = ''
      }
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
  applicant: null,
  productCategory: null,
  productType: null,
  status: null,
  assignedDesigner: null
})

// 快速搜尋
const quickSearch = ref('')
const isSearching = ref(false)

// 新增 basePath 變數，取得 Vite 的 base 路徑
const basePath = import.meta.env.BASE_URL || '/'

// 取得用於顯示的部門備註（有 quotaRank 時移除舊的候補/備取前綴，避免重複顯示）
const getDisplayDepartmentNote = (item) => {
  const note = item?.departmentNote || ''
  if (!note) return ''
  if (item?.quotaRank) {
    return note.replace(/^(?:候補|備取)\s*\d+\s*\n?/, '').trim()
  }
  return note
}

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
  searchCriteria.applicant = null
  searchCriteria.productCategory = null
  searchCriteria.productType = null
  searchCriteria.status = null
  searchCriteria.assignedDesigner = null
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
        category.items
          .map(item => ({
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

// 取得國定假日列表
const fetchTaiwanHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    // 取得今年和明年的國定假日
    const [currentYearData, nextYearData] = await Promise.all([
      apiAuth.get('/taiwan-holidays', { params: { year: currentYear } }),
      apiAuth.get('/taiwan-holidays', { params: { year: nextYear } })
    ])

    const holidays = new Set()

    // 處理今年的國定假日
    if (currentYearData.data.success && currentYearData.data.result) {
      currentYearData.data.result.forEach(holiday => {
        // 確保日期格式為 YYYY-MM-DD
        const date = new Date(holiday.date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        holidays.add(dateStr)
      })
    }

    // 處理明年的國定假日
    if (nextYearData.data.success && nextYearData.data.result) {
      nextYearData.data.result.forEach(holiday => {
        // 確保日期格式為 YYYY-MM-DD
        const date = new Date(holiday.date)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        holidays.add(dateStr)
      })
    }

    taiwanHolidays.value = holidays
    console.log('已載入國定假日:', Array.from(holidays).slice(0, 10)) // 除錯用，顯示前10個
  } catch (error) {
    console.error('取得國定假日失敗:', error)
    // 失敗時不影響其他功能，只記錄錯誤
  }
}

// 大分類變更處理
const handleProductCategoryChange = () => {
  // 當大分類變更時，清空申請類型選擇
  searchCriteria.productType = null
}

// 申請類型變更處理
const handleProductTypeChange = async (value) => {
  // 檢查是否為暫時禁用的申請類型
  // const disabledTypes = ['homepageBanner', 'coupon']
  // if (value && disabledTypes.includes(value)) {
  //   formData.productType = ''
  //   createSnackbar({
  //     text: '此申請類型尚未開放使用',
  //     snackbarProps: { color: 'warning' }
  //   })
  //   return
  // }

  // 當申請類型改變時，重置表單驗證狀態
  if (form.value) {
    form.value.resetValidation()
  }

  if (!value) {
    formFields.value = []
    productTypeConfig.value = null
    return
  }

  try {
    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/${value}/fields`)
    if (data.success) {
      const config = data.result

      // 在設置 productTypeConfig 之前，先清理舊類型的資料並初始化新類型的資料
      // 這樣可以避免模板在渲染時訪問到未定義的屬性

      // 特殊處理：印刷相關類型
      if (value === 'printing') {
        // 如果是查看模式，保留現有資料；如果是新增模式，清理舊資料
        if (!dialog.isEdit) {
          // 清理館格修改、下架的資料
          if (formData.galleryTypes) {
            delete formData.galleryTypes
          }
          if (formData.modify) {
            delete formData.modify
          }
          if (formData.removal) {
            delete formData.removal
          }
        }

        // 初始化行程簡稱
        if (!formData.tripShortName) {
          formData.tripShortName = ''
        }
        // 初始化印刷類型選擇（必須在設置 productTypeConfig 之前）
        if (!formData.printingTypes) {
          formData.printingTypes = {
            infoBookletCover: false,
            banner: false,
            coachSign: false,
            other: false
          }
        }

        // 初始化各子類型的資料結構（只有在不存在時才初始化）
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
        if (formData.otherNote === undefined || formData.otherNote === null) {
          formData.otherNote = ''
        }

        formFields.value = []

        // 最後設置 productTypeConfig，確保所有資料都已初始化
        productTypeConfig.value = config
        } else if (value === 'galleryModifyRemove') {
        // 如果是查看模式，保留現有資料；如果是新增模式，清理舊資料
        if (!dialog.isEdit) {
          // 清理印刷相關的資料
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

        // 初始化館格類型選擇（必須在設置 productTypeConfig 之前）
        // 如果是查看模式，保留現有的 galleryTypes；如果是新增模式，初始化為 false
        if (!formData.galleryTypes) {
          formData.galleryTypes = {
            modify: false,
            removal: false
          }
        }

        // 初始化各子類型的資料結構（只有在不存在時才初始化）
        if (!formData.modify) {
          formData.modify = {
            branch: '',
            groupId: '',
            files: null,
            note: ''
          }
        }
        if (!formData.removal) {
          formData.removal = {
            branch: '',
            groupId: '',
            files: null,
            note: ''
          }
        }

        formFields.value = []

        // 最後設置 productTypeConfig，確保所有資料都已初始化
        productTypeConfig.value = config
      } else {
        // 清理印刷相關和館格修改、下架的資料
        if (formData.printingTypes) {
          delete formData.printingTypes
        }
        if (formData.galleryTypes) {
          delete formData.galleryTypes
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
        if (formData.modify) {
          delete formData.modify
        }
        if (formData.removal) {
          delete formData.removal
        }

        // 其他類型的原有處理邏輯
        formFields.value = [
          ...(config.fields || []),
          ...(config.required || []),
          ...(config.optional || []),
          ...(config.conditional || [])
        ]

        // 特殊處理：講座活動
        if (value === 'lectureEvent') {
          // 初始化 needDM 為 false
          if (!formData.needDM) {
            formData.needDM = false
          }
          // 初始化 dmImage 為空陣列
          if (!formData.dmImage) {
            formData.dmImage = []
          }
          // 初始化日期時間欄位
          if (!formData.eventDateTime) {
            formData.eventDateTime = null
          }
          if (!formData.entryDateTime) {
            formData.entryDateTime = null
          }
        }

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
              // 特殊處理：DM單支和DM綜合的useQuickTemplate預設為false
              if (field.name === 'useQuickTemplate' && (value === 'newDMSingle' || value === 'newDMMultiple')) {
                formData[field.name] = false
              }
              // 特殊處理：車頭牌的useInfoBookletCover預設為false
              else if (field.name === 'useInfoBookletCover' && value === 'coachSign') {
                formData[field.name] = false
              }
              // 特殊處理：講座活動的needDM預設為false
              else if (field.name === 'needDM' && value === 'lectureEvent') {
                formData[field.name] = false
              } else {
                formData[field.name] = null
              }
            } else {
              formData[field.name] = ''
            }
          }
        })

        // 特殊處理：新DM(綜合)自動初始化兩筆行程
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

        // 最後設置 productTypeConfig，確保注意事項等配置能正確顯示
        productTypeConfig.value = config
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
  if (formData.productType === 'printing' && newValue && productTypeConfig.value) {
    await reloadPrintingFields()
  }
}, { deep: true })

// 監聽館格類型變更
watch(() => formData.galleryTypes, async (newValue) => {
  if (formData.productType === 'galleryModifyRemove' && newValue && productTypeConfig.value) {
    await reloadGalleryFields()
  }
}, { deep: true })

// 重新載入館格相關欄位配置
const reloadGalleryFields = async () => {
  if (formData.productType !== 'galleryModifyRemove') return

  try {
    const params = new URLSearchParams()
    if (formData.galleryTypes) {
      params.append('galleryTypes', JSON.stringify(formData.galleryTypes))
    }

    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/galleryModifyRemove/fields?${params.toString()}`)
    if (data.success) {
      productTypeConfig.value = data.result
    }
  } catch (error) {
    console.error('重新載入館格欄位配置失敗:', error)
  }
}

// 監聽折價券/禮券類型變更，當不是「其他」時清空「其他類型」
watch(() => formData.couponType, (newValue) => {
  if (formData.productType === 'coupon' && newValue !== '其他') {
    formData.couponTypeOther = ''
  }
})

// 開啟對話框
const openDialog = async (item = null) => {
  if (item) {
    // 查看模式：載入資料
    dialog.isEdit = true
    dialog.show = true
    Object.assign(formData, item)
    // 確保館格修改、下架的資料結構正確
    if (item.productType === 'galleryModifyRemove') {
      // 確保 galleryTypes 存在
      if (!formData.galleryTypes) {
        formData.galleryTypes = {
          modify: !!(formData.modify && Object.values(formData.modify).some(v => v && v !== '')),
          removal: !!(formData.removal && Object.values(formData.removal).some(v => v && v !== ''))
        }
      }
      // 確保 modify 和 removal 的資料結構存在
      if (!formData.modify) {
        formData.modify = {
          branch: '',
          groupId: '',
          files: [],
          note: ''
        }
      }
      if (!formData.removal) {
        formData.removal = {
          branch: '',
          groupId: '',
          files: [],
          note: ''
        }
      }
    }
    await handleProductTypeChange(item.productType)
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

  // 額外驗證館格修改、下架
  let galleryValid = true
  if (formData.productType === 'galleryModifyRemove') {
    // 檢查是否至少選擇了一個館格類型
    const selectedTypes = Object.values(formData.galleryTypes || {}).filter(Boolean)
    if (selectedTypes.length === 0) {
      galleryValid = false
      createSnackbar({
        text: '請至少選擇一個類型（修改或下架）',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }

    // 檢查必填欄位
    if (formData.galleryTypes?.modify) {
      if (!formData.modify?.branch) {
        galleryValid = false
        createSnackbar({
          text: '修改類型：館別為必填欄位',
          snackbarProps: { color: 'red-lighten-1' }
        })
      }
    }
    if (formData.galleryTypes?.removal) {
      if (!formData.removal?.branch) {
        galleryValid = false
        createSnackbar({
          text: '下架類型：館別為必填欄位',
          snackbarProps: { color: 'red-lighten-1' }
        })
      }
    }
  }

  // 只有驗證通過才顯示確認對話框
  if (valid && itineraryValid && printingValid && galleryValid) {
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
        // 掛團選填附件：後端以 hostedTourFiles 接收（不限制 MIME），仍存成 files
        const appendFieldName = formData.productType === 'hostedTour' && key === 'files' ? 'hostedTourFiles' : key
        formData[key].forEach(file => {
          formDataToSend.append(appendFieldName, file)
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
      } else if (key === 'eventDateTime' || key === 'entryDateTime') {
        // 特殊處理：講座活動的日期時間（可能是字串格式 datetime-local）
        if (formData[key]) {
          let dateValue = formData[key]
          // 如果是字串格式（datetime-local），轉換為 Date
          if (typeof dateValue === 'string') {
            dateValue = new Date(dateValue)
          }
          if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            formDataToSend.append(key, dateValue.toISOString())
          }
        }
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
      } else if (key === 'galleryTypes' || key === 'modify' || key === 'removal') {
        // 特殊處理館格修改、下架資料
        if (key === 'galleryTypes') {
          formDataToSend.append(key, JSON.stringify(formData[key]))
        } else if (key === 'modify' || key === 'removal') {
          // 只要有勾選，所有欄位都送出（即使為空）
          if (formData.galleryTypes && formData.galleryTypes[key === 'modify' ? 'modify' : 'removal']) {
            // 處理檔案上傳
            if (formData[key]?.files && Array.isArray(formData[key].files) && formData[key].files.length > 0) {
              formData[key].files.forEach(file => {
                if (file instanceof File) {
                  formDataToSend.append(`${key}[files]`, file)
                }
              })
            }

            // 根據子類型定義所有應該送出的欄位
            const fieldDefinitions = {
              modify: ['branch', 'groupId', 'note'],
              removal: ['branch', 'groupId', 'note']
            }

            const fieldsToSend = fieldDefinitions[key] || []
            fieldsToSend.forEach(subKey => {
              const value = formData[key]?.[subKey]
              formDataToSend.append(`${key}[${subKey}]`, value ?? '')
            })
          }
        }
      } else if (key === 'needDM') {
        // 特殊處理：講座活動的 needDM 布林值
        formDataToSend.append(key, formData[key] ? 'true' : 'false')
      } else if (key === 'needAirlineHighlight' || key === 'needUseLogo') {
        // 特殊處理：新DM相關的 checkbox 布林值
        formDataToSend.append(key, formData[key] ? 'true' : 'false')
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

  // 清除館格修改、下架相關資料
  if (formData.galleryTypes) {
    delete formData.galleryTypes
  }
  if (formData.modify) {
    delete formData.modify
  }
  if (formData.removal) {
    delete formData.removal
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

// 格式化日期時間（顯示用）
const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
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

// 計算最小日期（用於希望交付日），根據不同申請類型設定不同工作天
const getMinDeliveryDate = () => {
  // 取得台灣時間的今天（UTC+8）
  const now = new Date()
  const taiwanOffset = 8 * 60 // 台灣時區 UTC+8，轉換為分鐘
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const taiwanTime = new Date(utc + (taiwanOffset * 60000))

  const today = new Date(taiwanTime.getFullYear(), taiwanTime.getMonth(), taiwanTime.getDate())

  // 根據申請類型決定工作天數
  let workingDays = 3 // 預設 3 天

  if (formData.productType === 'printing' && formData.printingTypes) {
    // 說資封面、布條: 10天
    if (formData.printingTypes.infoBookletCover || formData.printingTypes.banner) {
      workingDays = 10
    }
  } else if (formData.productType === 'seriesMap') {
    // Series地圖: 3天
    workingDays = 3
  } else if (formData.productType === 'seriesMapModify') {
    // 修改Series地圖: 2天
    workingDays = 2
  } else if (formData.productType === 'SPMap') {
    // SP地圖: 3天
    workingDays = 3
  } else if (formData.productType === 'newElectronicInfo') {
    // 電子說資: 1天
    workingDays = 1
  }

  // 計算工作日（排除週六、週日和國定假日）
  // 從明天開始計算第一個工作日
  let currentDate = new Date(today)
  let daysAdded = 0

  while (daysAdded < workingDays) {
    // 先往後一天
    currentDate.setDate(currentDate.getDate() + 1)
    const dayOfWeek = currentDate.getDay()

    // 格式化日期為 YYYY-MM-DD 格式，用於比對國定假日
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // 檢查是否為工作日（排除週六、週日和國定假日）
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = taiwanHolidays.value.has(dateStr)

    if (!isWeekend && !isHoliday) {
      daysAdded++
    }
  }

  // 返回台灣時間格式的日期字串
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 檢查日期是否為可選的工作日（用於日期選擇器的 allowed-dates）
const isAllowedDate = (dateValue) => {
  if (!dateValue) return false

  // Vuetify 的 allowed-dates 函數接收的參數是 YYYY-MM-DD 字串格式
  let dateStr = dateValue
  let date

  if (typeof dateValue === 'string' && dateValue.includes('-')) {
    // 如果是 YYYY-MM-DD 字串格式，使用本地時間解析（避免時區問題）
    const parts = dateValue.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1 // month 是 0-based，所以要減 1
      const day = parseInt(parts[2], 10)
      date = new Date(year, month, day)
      dateStr = dateValue
    } else {
      return false
    }
  } else {
    // 如果是 Date 物件或其他格式，轉換為字串
    date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      return false
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dateStr = `${year}-${month}-${day}`
  }

  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    return false
  }

  const dayOfWeek = date.getDay()

  // 排除週六（6）和週日（0）
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  // 排除國定假日
  if (taiwanHolidays.value.has(dateStr)) {
    return false
  }

  return true
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
  if (type === 'galleryModifyRemove') {
    // 若 row 有 galleryTypes，則用 getGalleryTypeText
    if (row && row.galleryTypes) return getGalleryTypeText(row.galleryTypes)
    // 詳細資訊用 formData.galleryTypes
    if (formData && formData.galleryTypes) return getGalleryTypeText(formData.galleryTypes)
    return '【館格修改、下架】'
  }
  const option = productTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 自定義搜尋過濾器
const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const raw = item.raw || item
  const extNumber = raw?.employeeLink?.extNumber
  const itemText = raw && raw.name
    ? extNumber
      ? `${raw.name} ${extNumber}`.toLowerCase()
      : raw.name.toLowerCase()
    : ''
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
const getFileName = (file) => {
  if (!file) return ''
  // 如果是物件（包含 url 和 originalName），優先使用 originalName
  if (typeof file === 'object' && file !== null && file.originalName) {
    return file.originalName
  }
  // 如果是字串（舊格式或直接是路徑），從路徑中提取檔名
  if (typeof file === 'string') {
    const parts = file.split('/')
    return parts[parts.length - 1]
  }
  // 如果是物件但只有 url，從 url 中提取檔名
  if (typeof file === 'object' && file !== null && file.url) {
    const parts = file.url.split('/')
    return parts[parts.length - 1]
  }
  return ''
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

// 將檔案 accept 字串轉換為簡潔的格式文字（用於 label）
const getFileAcceptTextShort = (accept) => {
  if (!accept) return ''

  const formatMap = {
    'image/*': '圖片',
    '.pdf': 'PDF',
    '.doc': 'Word',
    '.docx': 'Word',
    '.ai': 'AI',
    '.xls': 'XLS',
    '.xlsx': 'XLSX',
    '.txt': 'TXT',
    '.zip': 'ZIP',
    '.rar': 'RAR'
  }

  // 處理 accept 字串（可能是逗號分隔的多個格式）
  const formats = accept.split(',').map(f => f.trim())
  const readableFormats = formats.map(format => {
    // 如果是 image/*，返回簡短文字
    if (format === 'image/*') {
      return formatMap['image/*']
    }

    // 移除開頭的點號
    const cleanFormat = format.replace(/^\./, '')

    // 查找對應的格式說明，如果沒有則使用大寫格式
    return formatMap[format] || formatMap[`.${cleanFormat}`] || cleanFormat.toUpperCase()
  })

  // 去重並過濾空值
  const uniqueFormats = [...new Set(readableFormats)].filter(f => f)

  return uniqueFormats.join('、')
}

// 將檔案 accept 字串轉換為可讀的格式文字（用於錯誤訊息）
const getFileAcceptText = (accept) => {
  // 如果沒有 accept 限制，或 accept 是 *，返回 '所有格式'
  if (!accept || accept.trim() === '' || accept.trim() === '*') return '所有格式'

  const formatMap = {
    'image/*': '圖片檔 (JPEG、PNG、WebP、GIF)',
    '.pdf': 'PDF',
    '.doc': 'Word (DOC)',
    '.docx': 'Word (DOCX)',
    '.ai': 'Adobe Illustrator (AI)',
    '.xls': 'Excel (XLS)',
    '.xlsx': 'Excel (XLSX)',
    '.txt': '文字檔 (TXT)',
    '.zip': 'ZIP 壓縮檔',
    '.rar': 'RAR 壓縮檔'
  }

  // 處理 accept 字串（可能是逗號分隔的多個格式）
  const formats = accept.split(',').map(f => f.trim()).filter(f => f !== '*')

  // 如果過濾後沒有格式，返回 '所有格式'
  if (formats.length === 0) return '所有格式'

  const readableFormats = formats.map(format => {
    // 如果是 image/*，直接返回對應文字
    if (format === 'image/*') {
      return formatMap['image/*']
    }

    // 移除開頭的點號（如果有的話）
    const cleanFormat = format.replace(/^\./, '')

    // 查找對應的格式說明
    return formatMap[format] || formatMap[`.${cleanFormat}`] || format.toUpperCase()
  })

  return readableFormats.join('、')
}

// 生成帶有限制說明的檔案上傳 label（簡潔版）
const getFileUploadLabel = (originalLabel, field) => {
  if (!originalLabel) return ''

  const parts = []

  // 大小限制
  parts.push('30MB')

  // 格式限制（只有在有指定格式時才顯示）
  if (field.accept && field.accept.trim() !== '') {
    const acceptText = getFileAcceptTextShort(field.accept)
    if (acceptText && acceptText !== '*') {
      parts.push(acceptText)
    }
  }

  // 如果有限制說明，添加到 label
  if (parts.length > 0) {
    return `${originalLabel} ( ${parts.join('、')} )`
  }

  return originalLabel
}

// 檢查檔案是否符合 accept 限制
const isFileTypeAllowed = (file, accept) => {
  // 如果沒有 accept 限制，或 accept 是 *，允許所有檔案
  if (!accept || accept.trim() === '' || accept.trim() === '*') return true

  const acceptedTypes = accept.split(',').map(t => t.trim())

  // 檢查檔案類型或副檔名
  for (const acceptedType of acceptedTypes) {
    // 如果是 *，允許所有檔案
    if (acceptedType === '*') {
      return true
    }
    // 如果是 image/*，檢查是否為圖片類型
    if (acceptedType === 'image/*') {
      if (file.type && file.type.startsWith('image/')) {
        return true
      }
    }
    // 如果是具體的 MIME 類型
    else if (acceptedType.includes('/')) {
      if (file.type === acceptedType) {
        return true
      }
    }
    // 如果是副檔名（如 .pdf）
    else {
      const ext = acceptedType.startsWith('.') ? acceptedType : `.${acceptedType}`
      const fileName = file.name || ''
      if (fileName.toLowerCase().endsWith(ext.toLowerCase())) {
        return true
      }
    }
  }

  return false
}

// 處理館格檔案輸入變更，驗證檔案
const handleGalleryFileInputChange = (files, field) => {
  // 處理 null、undefined 或空值的情況
  if (!files) {
    setNestedValue(formData, field.name, [])
    return
  }

  // 將單個 File 物件轉換為陣列（單檔案模式）
  const filesArray = Array.isArray(files) ? files : [files]

  // 過濾掉 null 或 undefined
  const validFilesArray = filesArray.filter(file => file != null)

  if (validFilesArray.length === 0) {
    setNestedValue(formData, field.name, [])
    return
  }

  const maxFileSize = 30 * 1024 * 1024 // 30MB
  const maxFileCount = field.multiple ? 5 : 1
  const validFiles = []

  // 檢查檔案數量
  if (validFilesArray.length > maxFileCount) {
    createSnackbar({
      text: `最多只能上傳 ${maxFileCount} 個檔案`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    setNestedValue(formData, field.name, [])
    return
  }

  // 檢查每個檔案
  for (const file of validFilesArray) {
    // 檢查檔案大小
    if (file.size > maxFileSize) {
      createSnackbar({
        text: `檔案「${file.name}」超過大小限制，每個檔案最大 30MB`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      setNestedValue(formData, field.name, [])
      return
    }

    // 檢查檔案類型（只有在有 accept 限制且不是 * 時才檢查）
    if (field.accept && field.accept.trim() !== '' && field.accept.trim() !== '*' && !isFileTypeAllowed(file, field.accept)) {
      const acceptText = getFileAcceptText(field.accept)
      createSnackbar({
        text: `檔案「${file.name}」格式不支援，僅支援：${acceptText}`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      setNestedValue(formData, field.name, [])
      return
    }

    validFiles.push(file)
  }

  // 如果所有檔案都通過驗證，更新表單資料
  setNestedValue(formData, field.name, validFiles)
}

// 處理檔案輸入變更，驗證檔案
const handleFileInputChange = (files, field) => {
  // 處理 null、undefined 或空值的情況
  if (!files) {
    formData[field.name] = []
    return
  }

  // 將單個 File 物件轉換為陣列（單檔案模式）
  const filesArray = Array.isArray(files) ? files : [files]

  // 過濾掉 null 或 undefined
  const validFilesArray = filesArray.filter(file => file != null)

  if (validFilesArray.length === 0) {
    formData[field.name] = []
    return
  }

  const maxFileSize = 30 * 1024 * 1024 // 30MB
  const maxFileCount = field.multiple ? 5 : 1
  const validFiles = []

  // 檢查檔案數量
  if (validFilesArray.length > maxFileCount) {
    createSnackbar({
      text: `最多只能上傳 ${maxFileCount} 個檔案`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    formData[field.name] = []
    return
  }

  // 檢查每個檔案
  for (const file of validFilesArray) {
    // 檢查檔案大小
    if (file.size > maxFileSize) {
      createSnackbar({
        text: `檔案「${file.name}」超過大小限制，每個檔案最大 30MB`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      formData[field.name] = []
      return
    }

    // 檢查檔案類型（只有在有 accept 限制且不是 * 時才檢查）
    if (field.accept && field.accept.trim() !== '' && field.accept.trim() !== '*' && !isFileTypeAllowed(file, field.accept)) {
      const acceptText = getFileAcceptText(field.accept)
      createSnackbar({
        text: `檔案「${file.name}」格式不支援，僅支援：${acceptText}`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      formData[field.name] = []
      return
    }

    validFiles.push(file)
  }

  // 如果所有檔案都通過驗證，更新表單資料
  formData[field.name] = validFiles
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
  if (!obj) return
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  if (target) {
    target[lastKey] = value
  }
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
      fetchMarketingDesigners(),
      fetchTaiwanHolidays()
    ])

    loading.value = false
    // 執行搜尋
    await fetchTableData()
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

// 取得館格修改、下架子類型顯示文字
const getGalleryTypeText = (galleryTypes) => {
  if (!galleryTypes) return '【網站相關】 - 館格修改、下架'
  const map = {
    modify: '館格修改',
    removal: '館格下架'
  }
  const selected = Object.entries(galleryTypes)
    .filter(([, v]) => v)
    .map(([k]) => map[k])
    .filter(Boolean)
  if (selected.length === 0) return '【網站相關】 - 館格修改、下架'
  if (selected.length === 1) return `【網站相關】 - ${selected[0]}`
  return '【網站相關】 - 館格修改、下架'
}

  // 判斷是否為圖片檔案
const isImageFile = (file) => {
  if (!file) return false
  const fileName = getFileName(file).toLowerCase()
  return /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
}

const imageLightboxRef = ref(null)

// 開啟燈箱預覽
const openLightbox = (files, index) => {
  const imageFiles = files.filter(file => isImageFile(file))
  if (imageFiles.length === 0) return

  const originalImageFiles = files.filter(file => isImageFile(file))
  const clickedFile = files[index]
  const clickedFileIndex = originalImageFiles.findIndex((img) => {
    if (typeof clickedFile === 'object' && clickedFile !== null && typeof img === 'object' && img !== null) {
      return clickedFile.url === img.url
    }
    return clickedFile === img
  })
  const targetIndex = clickedFileIndex >= 0 ? clickedFileIndex : 0

  const imageUrls = imageFiles.map(file => getFileUrl(file)).filter(url => url)

  if (!imageUrls.length || !imageLightboxRef.value) return

  imageLightboxRef.value.open(imageUrls, targetIndex)
}

// 取得完整檔案 URL
const getFileUrl = (file) => {
  if (!file) return ''
  // 如果是物件（包含 url），使用 url
  if (typeof file === 'object' && file !== null && file.url) {
    const url = file.url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const baseURL = import.meta.env.VITE_API || 'http://localhost:4002'
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  }
  if (typeof file === 'string') {
    const filePath = file
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }
    const baseURL = import.meta.env.VITE_API || 'http://localhost:4002'
    return `${baseURL}${filePath.startsWith('/') ? '' : '/'}${filePath}`
  }
  return ''
}
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

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

:deep(.v-data-table__tbody) {
  td {
    font-size: 13px !important;
  }
}

:deep(.v-field :not(.v-textarea .v-field)) {
  .v-field__input {
    font-size: 13px;
    height: 36px !important;
    padding-top: 4px !important;
  }

  .v-field__field {
    height: 36px !important;
  }
  @include sm {
    .v-field__input {
      height: 40px !important;
      padding-top: 8px !important;
      font-size: 14px;
    }
    .v-field__field {
      height: 40px !important;
    }
  }
}

/* 搜尋區域樣式 */

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
.info-item-card {
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

.v-checkbox  {
  color: #666;
  :deep(.v-label) {
    font-size: 14px !important;
    color: #333;
    @include sm {
      font-size: 15px !important;
    }
  }
}

.notice-text {
  font-size: 12px;
  color: #455a64;
  @include sm {
    font-size: 14px !important;
  }
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

.quota-rank-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
  &.regular {
    background-color: #E8F5E9;
    color: #43A047;
    border: 1px solid #C8E6C9;
  }
  &.backup {
    background-color: #eee;
    color: #888;
    border: 1px solid #bdbdbd;
  }
}

.setting-title {
  min-width: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #455a64;
  @include sm {
    font-size: 16px;
  }
}
.setting-title-2 {
  min-width: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #455a64;
  @include sm {
    min-width: 84px;
    font-size: 16px;
  }
}
.setting-content {
  font-size: 12px;
  font-weight: 500;
  color: #455a64;
  @include sm {
    font-size: 16px;
  }
}

/* 燈箱預覽樣式 */
</style>
