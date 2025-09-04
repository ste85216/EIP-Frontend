<!-- eslint-disable vue/no-v-html -->
<template>
  <v-container max-width="2400">
    <v-row class="pt-md-6 px-lg-10 px-xxl-6">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg py-10 px-0">
          <div class="d-flex align-center px-9">
            <h3 class="me-4">
              行銷美編需求申請管理
            </h3>
            <v-spacer />
            <v-btn
              v-if="userStore.isAdmin || userStore.isManager"
              color="blue-grey-darken-2"
              prepend-icon="mdi-email-multiple"
              variant="outlined"
              class="me-4"
              @click="openNotificationEmailDialog"
            >
              通知設定管理
            </v-btn>
            <v-btn
              to="/marketingDesignRequest"
              variant="plain"
              :ripple="false"
              color="blue-grey-darken-2"
              class="pe-0"
            >
              申請頁面 >
            </v-btn>
          </div>
          <v-divider class="mt-5 mb-6" />
          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-3 px-10 pb-2">
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
                    :items="statusOptions"
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
                    :item-title="item => item && item.name && item.employeeCode ? `${item.name} (${item.employeeCode})` : ''"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    clearable
                    placeholder="請選擇處理人員"
                    hide-details
                    :filter="customFilter"
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
          <!-- 表格區塊 -->
          <v-card-text class="px-8">
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
                  <td>{{ getProductTypeText(item.productType, item) }}</td>
                  <td class="text-center">
                    <v-menu
                      max-height="320"
                      :disabled="isCompletedOrCancelled(item.status)"
                    >
                      <template #activator="{ props }">
                        <div
                          v-if="isCompletedOrCancelled(item.status)"
                          class="status-text"
                          :class="getStatusTextClass(item.status)"
                        >
                          {{ getStatusText(item.status) }}
                        </div>
                        <v-chip
                          v-else
                          v-bind="props"
                          :color="getStatusColor(item.status)"
                          size="small"
                          label
                          variant="outlined"
                          class="font-weight-medium"
                          :loading="updatingStatus.has(item._id)"
                        >
                          {{ getStatusText(item.status) }}
                          <v-icon
                            size="small"
                            class="ms-1"
                          >
                            mdi-chevron-down
                          </v-icon>
                        </v-chip>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="status in statusOptions"
                          :key="status.value"
                          @click="updateStatus(item._id, status.value)"
                        >
                          <v-list-item-title>
                            {{ status.text }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="text-center">
                    <v-menu
                      max-height="320"
                      :disabled="isCompletedOrCancelled(item.status)"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-if="item.assignedDesigner"
                          v-bind="props"
                          color="blue-darken-1"
                          variant="outlined"
                          class="px-3"
                          size="small"
                          :loading="updatingDesigners.has(item._id)"
                          :disabled="isCompletedOrCancelled(item.status)"
                          :class="{ 'disabled-btn': isCompletedOrCancelled(item.status) }"
                        >
                          {{ item.assignedDesigner.name }}
                          <v-icon
                            v-if="!isCompletedOrCancelled(item.status)"
                            size="small"
                            class="ms-1"
                          >
                            mdi-chevron-down
                          </v-icon>
                        </v-btn>
                        <v-btn
                          v-else
                          v-bind="props"
                          color="grey"
                          variant="outlined"
                          class="px-3"
                          size="small"
                          :loading="updatingDesigners.has(item._id)"
                          :disabled="isCompletedOrCancelled(item.status)"
                          :class="{ 'disabled-btn': isCompletedOrCancelled(item.status) }"
                        >
                          尚未指派
                          <v-icon
                            v-if="!isCompletedOrCancelled(item.status)"
                            size="small"
                            class="ms-1"
                          >
                            mdi-chevron-down
                          </v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="designer in marketingDesigners"
                          :key="designer._id"
                          @click="updateAssignedDesigner(item._id, designer._id)"
                        >
                          <v-list-item-title>{{ designer.name }} ({{ designer.employeeCode }})</v-list-item-title>
                        </v-list-item>
                        <v-divider />
                        <v-list-item
                          @click="updateAssignedDesigner(item._id, null)"
                        >
                          <v-list-item-title class="text-red-darken-1">
                            <v-icon
                              size="small"
                              class="me-2"
                            >
                              mdi-close
                            </v-icon>
                            清除指派
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                  <td class="text-center">
                    <div
                      v-if="item.departmentNote"
                      class="department-note-cell"
                    >
                      <div
                        v-if="!isCompletedOrCancelled(item.status)"
                        class="department-note-text clickable"
                        @click="openDepartmentNoteDialog(item)"
                        v-html="formatDepartmentNote(item.departmentNote)"
                      />
                      <div
                        v-else
                        class="department-note-text disabled"
                        v-html="formatDepartmentNote(item.departmentNote)"
                      />
                    </div>
                    <div
                      v-else
                      class="department-note-cell"
                    >
                      <v-btn
                        v-if="!isCompletedOrCancelled(item.status)"
                        color="grey"
                        variant="outlined"
                        size="small"
                        class="px-3"
                        @click="openDepartmentNoteDialog(item)"
                      >
                        新增備註
                      </v-btn>
                      <v-btn
                        v-else
                        color="grey"
                        variant="outlined"
                        size="small"
                        class="px-3 disabled-btn"
                        disabled
                      >
                        新增備註
                      </v-btn>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-btn
                      icon
                      color="blue-grey-darken-2"
                      variant="plain"
                      :ripple="false"
                      @click="openViewDialog(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      :ripple="false"
                      :disabled="isCompletedOrCancelled(item.status)"
                      :class="{ 'disabled-btn': isCompletedOrCancelled(item.status) }"
                      @click="openEditDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 編輯對話框 -->
    <v-dialog
      v-model="editDialog.show"
      max-width="1200"
      persistent
    >
      <v-card class="rounded-lg edit-dialog">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-light-blue-darken-2">
          <v-icon
            icon="mdi-pencil"
            size="18"
            color="white"
            class="me-2"
          />
          <span class="card-title">編輯申請單</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            :ripple="false"
            class="opacity-100"
            @click="closeEditDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-7">
          <v-form
            ref="editForm"
            v-model="editFormValid"
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
                      color="light-blue-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="2"
                    class="d-flex align-center justify-center text-light-blue-darken-2"
                  >
                    <v-icon
                      size="18"
                      class="me-2 text-light-blue-darken-2"
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
                      color="light-blue-darken-2"
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
                  v-model="editFormData.productType"
                  :items="productTypeOptions"
                  item-title="label"
                  item-value="value"
                  label="* 申請類型"
                  variant="outlined"
                  density="compact"
                  disabled
                />
              </v-col>

              <!-- 申請人選擇 -->
              <v-col
                cols="12"
                sm="6"
                lg="4"
              >
                <v-autocomplete
                  v-model="editFormData.applicant"
                  :items="employees"
                  item-title="label"
                  item-value="value"
                  label="* 申請人"
                  variant="outlined"
                  density="compact"
                  disabled
                  clearable
                  :menu-props="{ maxHeight: 400 }"
                  :filter="customFilter"
                />
              </v-col>
            </v-row>

            <!-- 申請資訊區塊 -->
            <template v-if="editFormData.productType && editFormData.applicant">
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
                        color="light-blue-darken-2"
                      />
                    </v-col>
                    <v-col
                      cols="2"
                      class="d-flex align-center justify-center text-light-blue-darken-2"
                    >
                      <v-icon
                        size="18"
                        class="me-2 text-light-blue-darken-2"
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
                        color="light-blue-darken-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- 印刷相關特殊處理 -->
                <template v-if="editFormData.productType === 'printing'">
                  <v-col cols="12">
                    <v-card class="mb-4 printing-checkbox-card elevation-0">
                      <v-card-text class="py-4">
                        <div class="card-title text-light-blue-darken-2 mb-3">
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
                              v-model="editFormData.printingTypes[subType.name]"
                              :label="subType.label"
                              color="light-blue-darken-2"
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
                    v-if="productTypeConfig?.requiredFiles && hasSelectedPrintingType"
                    cols="12"
                    class="mb-4"
                  >
                    <v-card
                      class="pa-4 elevation-0 upload-file-card"
                    >
                      <div class="d-flex align-center mb-4">
                        <span class="sub-title font-weight-bold text-light-blue-darken-3">※ 共同欄位: 上傳檔案</span>
                      </div>
                      <div class="text-body-2 info-item-value">
                        <div
                          v-for="(file, index) in editFormData.files"
                          :key="index"
                          class="d-flex align-center mb-1"
                        >
                          <v-icon
                            size="small"
                            class="me-2"
                          >
                            {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                          </v-icon>
                          <span class="text-grey-darken-1">{{ truncateFileName(getFileName(file), 20) }}</span>
                        </div>
                        <div
                          v-if="!editFormData.files || editFormData.files.length === 0"
                          class="text-grey-lighten-1"
                        >
                          ( 無 )
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <!-- 子類型表單區塊 -->
                  <template
                    v-for="(section, sectionKey) in productTypeConfig?.sections"
                    :key="sectionKey"
                  >
                    <v-col
                      v-if="editFormData.printingTypes?.[sectionKey]"
                      cols="12"
                    >
                      <v-card class="mb-4 printing-section-card elevation-0">
                        <div class="printing-section-header d-flex align-center px-5 py-3">
                          <span class="sub-title text-light-blue-darken-2 font-weight-bold">※ {{ section.title }}</span>
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
                                :model-value="getNestedValue(editFormData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :rules="field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                                @update:model-value="(value) => setNestedValue(editFormData, field.name, value)"
                              />
                              <!-- 多行文字輸入欄位 -->
                              <v-textarea
                                v-else-if="field.type === 'textarea'"
                                :model-value="getNestedValue(editFormData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :rules="field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : []"
                                auto-grow
                                rows="5"
                                @update:model-value="(value) => setNestedValue(editFormData, field.name, value)"
                              />
                              <!-- 日期選擇欄位 -->
                              <v-date-input
                                v-else-if="field.type === 'date'"
                                :model-value="getNestedValue(editFormData, field.name)"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                prepend-icon
                                clearable
                                :rules="field.required ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : []"
                                :cancel-text="'取消'"
                                :ok-text="'確認'"
                                @update:model-value="(value) => setNestedValue(editFormData, field.name, value)"
                              />
                              <!-- 數字輸入欄位 -->
                              <v-text-field
                                v-else-if="field.type === 'number'"
                                :model-value="getNestedValue(editFormData, field.name)"
                                :label="field.label"
                                type="number"
                                variant="outlined"
                                density="compact"
                                :rules="[
                                  ...(field.required ? [v => v !== '' && v !== null && v !== undefined || `請輸入${field.label.replace('* ', '')}`] : []),
                                  v => v >= field.min || `${field.label.replace('* ', '')}不能小於${field.min}`
                                ]"
                                @update:model-value="(value) => setNestedValue(editFormData, field.name, value)"
                              />
                              <!-- 下拉選單欄位 -->
                              <v-select
                                v-else-if="field.type === 'select'"
                                :model-value="getNestedValue(editFormData, field.name)"
                                :items="field.items"
                                item-title="title"
                                item-value="value"
                                :label="field.label"
                                variant="outlined"
                                density="compact"
                                :rules="field.required ? [v => (v !== null && v !== undefined) || `請選擇${field.label.replace('* ', '')}`] : []"
                                @update:model-value="(value) => setNestedValue(editFormData, field.name, value)"
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
                    <!-- 文字輸入欄位 -->
                    <div v-if="field.illustrations && field.illustrations.length">
                      <v-text-field
                        v-if="field.type === 'text'"
                        v-model="editFormData[field.name]"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :rules="
                          field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
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
                        v-model="editFormData[field.name]"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :rules="
                          field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
                            ? [v => !!v || `請輸入${field.label.replace('* ', '')}`]
                            : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : [])
                        "
                      />
                    </div>

                    <!-- 多行文字輸入欄位 -->
                    <v-textarea
                      v-else-if="field.type === 'textarea'"
                      v-model="editFormData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      :rules="
                        field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
                          ? [v => !!v || `請輸入${field.label.replace('* ', '')}`]
                          : (field.required ? [v => !!v || `請輸入${field.label.replace('* ', '')}`] : [])
                      "
                      auto-grow
                      rows="5"
                    />

                    <!-- 日期選擇欄位 -->
                    <v-date-input
                      v-else-if="field.type === 'date'"
                      v-model="editFormData[field.name]"
                      :label="field.label"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      clearable
                      :rules="
                        field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
                          ? [v => !!v || `請選擇${field.label.replace('* ', '')}`]
                          : (field.required ? [v => !!v || `請選擇${field.label.replace('* ', '')}`] : [])
                      "
                      :cancel-text="'取消'"
                      :ok-text="'確認'"
                    />

                    <!-- 數字輸入欄位 -->
                    <v-text-field
                      v-else-if="field.type === 'number'"
                      v-model.number="editFormData[field.name]"
                      :label="field.label"
                      type="number"
                      variant="outlined"
                      density="compact"
                      :rules="
                        field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
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
                    <div v-else-if="field.type === 'file'">
                      <v-card
                        class="info-item-card pa-3"
                        variant="outlined"
                      >
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="16"
                            color="grey-darken-1"
                            class="me-2"
                          >
                            mdi-file-document
                          </v-icon>
                          <span class="sub-card-title font-weight-bold text-grey-darken-1">
                            {{ field.label || '上傳檔案' }}
                          </span>
                        </div>
                        <div class="text-body-2 info-item-value">
                          <div v-if="editFormData[field.name] && editFormData[field.name].length > 0">
                            <div
                              v-for="(file, idx) in editFormData[field.name]"
                              :key="idx"
                              class="d-flex align-center mb-1"
                            >
                              <v-icon
                                size="small"
                                class="me-2"
                              >
                                {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                              </v-icon>
                              <span class="text-grey-darken-1">{{ truncateFileName(getFileName(file), 20) }}</span>
                            </div>
                          </div>
                          <div
                            v-else
                            class="text-grey-lighten-1"
                          >
                            ( 無 )
                          </div>
                        </div>
                      </v-card>
                    </div>

                    <!-- 下拉選單欄位 -->
                    <div v-else-if="field.type === 'select'">
                      <v-select
                        v-model="editFormData[field.name]"
                        :items="field.items"
                        item-title="title"
                        item-value="value"
                        :label="field.label"
                        variant="outlined"
                        density="compact"
                        :rules="
                          field.conditionalRequired && editFormData[field.conditionalRequired.field] === field.conditionalRequired.value
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
                        </div>
                      </div>

                      <div
                        v-if="!editFormData[field.name] || editFormData[field.name].length === 0"
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
                          v-for="(item, index) in editFormData[field.name]"
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
                            </div>
                            <v-row class="pb-2">
                              <!-- 團體名稱 -->
                              <v-col
                                cols="12"
                                lg="6"
                                class="pb-0"
                              >
                                <v-text-field
                                  v-model="editFormData[field.name][index].groupName"
                                  label="* 團體名稱"
                                  variant="outlined"
                                  density="compact"
                                  class="mb-1"
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
                                  v-model="editFormData[field.name][index].departureDate"
                                  label="出發日期"
                                  variant="outlined"
                                  density="compact"
                                  class="mb-1"
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
                                  v-model.number="editFormData[field.name][index].agentPrice"
                                  label="* 同業價"
                                  type="number"
                                  variant="outlined"
                                  density="compact"
                                  class="mb-1"
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
                                  v-model.number="editFormData[field.name][index].retailPrice"
                                  label="* 直客價"
                                  type="number"
                                  variant="outlined"
                                  density="compact"
                                  class="mb-1"
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
                                  v-model="editFormData[field.name][index].tripHighlights"
                                  label="行程特色"
                                  variant="outlined"
                                  density="compact"
                                  class="mb-1"
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
                      v-else-if="field.type === 'checkbox' && field.name !== 'useInfoBookletCover'"
                      v-model="editFormData[field.name]"
                      :label="field.label"
                      density="compact"
                      color="primary"
                      hide-details
                    />
                    <v-checkbox
                      v-else-if="field.type === 'checkbox' && field.name === 'useInfoBookletCover'"
                      v-model="editFormData.coachSign.useInfoBookletCover"
                      :label="field.label"
                      density="compact"
                      color="primary"
                      hide-details
                      :true-value="true"
                      :false-value="false"
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
            @click="closeEditDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :loading="submitting"
            @click="confirmEditSubmit"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 圖片預覽對話框 -->
    <v-dialog
      v-model="imagePreviewDialog.show"
      max-width="800"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>圖片預覽</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="closeImagePreview"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <img
            v-if="imagePreviewDialog.currentImage"
            :src="imagePreviewDialog.currentImage"
            style="max-width: 100%; max-height: 500px; object-fit: contain;"
            alt="預覽圖片"
          >
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 燈箱圖片預覽對話框 -->
    <v-dialog
      v-model="lightboxDialog.show"
      fullscreen
      transition="fade-transition"
      @keydown.esc="closeLightbox"
    >
      <v-card
        class="lightbox-card"
        style="background: rgba(0,0,0,0.95);"
      >
        <v-btn
          icon
          class="lightbox-close-btn"
          style="position: absolute; top: 24px; right: 32px; z-index: 1001; background: rgba(0,0,0,0.5);"
          color="white"
          size="large"
          @click="closeLightbox"
        >
          <v-icon
            size="32"
            color="white"
          >
            mdi-close
          </v-icon>
        </v-btn>
        <v-btn
          icon
          class="lightbox-download-btn me-2"
          style="position: absolute; top: 24px; right: 90px; z-index: 1001; background: rgba(0,0,0,0.5);"
          size="large"
          @click="downloadFile(lightboxDialog.currentImage)"
        >
          <v-icon
            size="28"
            color="white"
          >
            mdi-download
          </v-icon>
        </v-btn>
        <div class="lightbox-content">
          <v-btn
            v-if="lightboxDialog.images.length > 1"
            icon="mdi-chevron-left"
            size="large"
            color="white"
            class="lightbox-nav-btn lightbox-prev"
            @click="previousImage"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <img
            v-if="lightboxDialog.currentImage"
            :src="lightboxDialog.currentImage"
            class="lightbox-image"
            alt="燈箱預覽圖片"
          >
          <v-btn
            v-if="lightboxDialog.images.length > 1"
            icon="mdi-chevron-right"
            size="large"
            color="white"
            class="lightbox-nav-btn lightbox-next"
            @click="nextImage"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </div>
        <div
          class="text-center mt-2"
          style="color: #fff; opacity: 0.7;"
        >
          點擊右上角關閉，或按 ESC 離開預覽
        </div>
      </v-card>
    </v-dialog>

    <!-- 查看詳細資料對話框 -->
    <v-dialog
      v-model="viewDialog.show"
      max-width="1200"
    >
      <v-card class="rounded-lg pb-2">
        <v-card-title class="d-flex align-center px-6 py-1 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-text-box-outline"
            size="18"
            color="white"
            class="me-2"
          />
          <span class="card-title">申請單詳細資訊</span>
          <v-spacer />
          <v-btn
            color="white"
            variant="outlined"
            size="small"
            prepend-icon="mdi-content-copy"
            class="me-2"
            @click="copyRequestInfo"
          >
            複製資訊
          </v-btn>
          <v-btn
            icon
            variant="plain"
            color="white"
            :ripple="false"
            class="opacity-100"
            @click="closeViewDialog"
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
                  color="blue-grey-darken-2"
                  class="me-2"
                />
                <span class="text-blue-grey-darken-2 card-title">基本資訊</span>
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
                      {{ viewFormData.designRequestNumber || '( 無 )' }}
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
                      {{ viewFormData.productType ? getProductTypeText(viewFormData.productType, viewFormData) : '( 無 )' }}
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
                      {{ formatDate(viewFormData.applicationDate) }}
                      <span class="text-caption text-grey-darken-1">
                        {{ formatTime(viewFormData.applicationDate) }}
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
                      {{ viewFormData.applicant?.name ? `${viewFormData.applicant.name} (${viewFormData.applicant.employeeCode})` : '( 無 )' }}
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
                        :color="getStatusColor(viewFormData.status)"
                        size="small"
                        label
                        class="font-weight-medium elevation-0"
                      >
                        {{ getStatusText(viewFormData.status) }}
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
                      {{ viewFormData.assignedDesigner?.name || '尚未指派' }}
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
                  color="blue-grey-darken-2"
                  class="me-2"
                />
                <span class="text-blue-grey-darken-2 card-title">申請資訊</span>
              </div>
              <!-- 印刷相關特殊顯示 -->
              <v-row v-if="viewFormData.productType === 'printing'">
                <!-- 檔案欄位（最上方，可下載預覽） -->
                <v-col
                  v-if="viewFormData.files && viewFormData.files.length > 0"
                  cols="12"
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
                          v-for="(file, index) in viewFormData.files"
                          :key="index"
                          class="d-flex align-center mb-2 px-2 rounded-sm"
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
                            size="small"
                            color="blue"
                            variant="text"
                            class="me-1"
                            @click="openLightbox(viewFormData.files, index)"
                          >
                            <v-icon>mdi-eye</v-icon>
                          </v-btn>
                          <!-- 下載按鈕 -->
                          <v-btn
                            icon
                            size="small"
                            color="green"
                            variant="text"
                            @click="downloadFile(file)"
                          >
                            <v-icon>mdi-download</v-icon>
                          </v-btn>
                        </div>
                        <!-- 批量下載按鈕 -->
                        <v-btn
                          color="green-darken-1"
                          variant="outlined"
                          size="small"
                          prepend-icon="mdi-download-multiple"
                          class="mt-2"
                          @click="downloadAllFiles(viewFormData.files)"
                        >
                          下載所有檔案
                        </v-btn>
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <!-- 依勾選子類型顯示卡片 -->
                <template
                  v-for="(section, sectionKey) in productTypeConfig?.sections"
                  :key="sectionKey"
                >
                  <v-col
                    v-if="viewFormData.printingTypes?.[sectionKey]"
                    cols="12"
                  >
                    <v-card
                      class="info-printing-card pa-3 mb-4"
                      variant="outlined"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          size="16"
                          color="blue-grey-darken-1"
                          class="me-2"
                        >
                          mdi-shape
                        </v-icon>
                        <span class="sub-title text-blue-grey-darken-2 font-weight-bold">※ {{ section.title }}</span>
                      </div>
                      <v-divider class="mb-3" />
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
                                  v-if="getNestedValue(viewFormData, field.name)"
                                  style="white-space: pre-line;"
                                >{{ getNestedValue(viewFormData, field.name) }}</span>
                                <span v-else>( 無 )</span>
                              </template>
                              <template v-else-if="field.type === 'textarea'">
                                <span
                                  v-if="getNestedValue(viewFormData, field.name)"
                                  style="white-space: pre-line;"
                                >{{ getNestedValue(viewFormData, field.name) }}</span>
                                <span v-else>( 無 )</span>
                              </template>
                              <template v-else-if="field.type === 'date'">
                                {{ getNestedValue(viewFormData, field.name) ? formatDate(getNestedValue(viewFormData, field.name)) : '( 無 )' }}
                              </template>
                              <template v-else-if="field.type === 'number'">
                                {{ getNestedValue(viewFormData, field.name) !== null && getNestedValue(viewFormData, field.name) !== undefined && getNestedValue(viewFormData, field.name) !== '' ? getNestedValue(viewFormData, field.name) : '( 無 )' }}
                              </template>
                              <template v-else-if="field.type === 'select'">
                                {{ typeof getNestedValue(viewFormData, field.name) === 'boolean' ? (getNestedValue(viewFormData, field.name) ? '是' : '否') : '( 無 )' }}
                              </template>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </template>
              </v-row>
              <v-row v-else>
                <template
                  v-for="field in visibleViewFormFields"
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
                            v-if="viewFormData[field.name]"
                            style="white-space: pre-line;"
                          >{{ viewFormData[field.name] }}</span>
                          <span v-else>( 無 )</span>
                        </template>
                        <!-- 多行文字欄位 -->
                        <template v-else-if="field.type === 'textarea'">
                          <span
                            v-if="viewFormData[field.name]"
                            style="white-space: pre-line;"
                          >{{ viewFormData[field.name] }}</span>
                          <span v-else>( 無 )</span>
                        </template>
                        <!-- 日期欄位 -->
                        <template v-else-if="field.type === 'date'">
                          {{ viewFormData[field.name] ? formatDate(viewFormData[field.name]) : '( 無 )' }}
                        </template>
                        <!-- 數字欄位 -->
                        <template v-else-if="field.type === 'number'">
                          {{ viewFormData[field.name] !== null && viewFormData[field.name] !== undefined && viewFormData[field.name] !== '' ? viewFormData[field.name] : '( 無 )' }}
                        </template>
                        <!-- 核取方塊 -->
                        <template v-else-if="field.type === 'checkbox'">
                          <v-icon :color="viewFormData[field.name] ? 'success' : 'grey'">
                            {{ viewFormData[field.name] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                          {{ viewFormData[field.name] ? '是' : '否' }}
                        </template>
                        <!-- 下拉選單 -->
                        <template v-else-if="field.type === 'select'">
                          {{ typeof viewFormData[field.name] === 'boolean' ? (viewFormData[field.name] ? '是' : '否') : '( 無 )' }}
                        </template>
                        <!-- 檔案欄位 -->
                        <template v-else-if="field.type === 'file'">
                          <template v-if="viewFormData[field.name] && viewFormData[field.name].length > 0">
                            <div class="d-flex flex-column">
                              <div
                                v-for="(file, index) in viewFormData[field.name]"
                                :key="index"
                                class="d-flex align-center mb-2 px-2 rounded-sm"
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
                                  size="small"
                                  color="blue"
                                  variant="text"
                                  class="me-1"
                                  @click="openLightbox(viewFormData[field.name], index)"
                                >
                                  <v-icon>mdi-eye</v-icon>
                                </v-btn>
                                <!-- 下載按鈕 -->
                                <v-btn
                                  icon
                                  size="small"
                                  color="green"
                                  variant="text"
                                  @click="downloadFile(file)"
                                >
                                  <v-icon>mdi-download</v-icon>
                                </v-btn>
                              </div>
                              <!-- 批量下載按鈕 -->
                              <v-btn
                                color="green-darken-1"
                                variant="outlined"
                                size="small"
                                prepend-icon="mdi-download-multiple"
                                class="mt-2"
                                @click="downloadAllFiles(viewFormData[field.name])"
                              >
                                下載所有檔案
                              </v-btn>
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
                            v-if="!viewFormData[field.name] || viewFormData[field.name].length === 0"
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
                              v-for="(item, index) in viewFormData[field.name]"
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
                                </div>
                                <v-row class="pb-2">
                                  <!-- 團體名稱 -->
                                  <v-col
                                    cols="12"
                                    lg="6"
                                    class="pb-0"
                                  >
                                    <v-text-field
                                      v-model="viewFormData[field.name][index].groupName"
                                      label="* 團體名稱"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      readonly
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
                                      v-model="viewFormData[field.name][index].departureDate"
                                      label="出發日期"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      readonly
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
                                      v-model.number="viewFormData[field.name][index].agentPrice"
                                      label="* 同業價"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      readonly
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
                                      v-model.number="viewFormData[field.name][index].retailPrice"
                                      label="* 直客價"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      readonly
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
                                      v-model="viewFormData[field.name][index].tripHighlights"
                                      label="行程特色"
                                      variant="outlined"
                                      density="compact"
                                      class="mb-1"
                                      readonly
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
            @click="closeViewDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 狀態確認對話框 -->
    <v-dialog
      v-model="statusConfirmDialog.show"
      max-width="500"
      persistent
    >
      <v-card class="rounded-lg pb-4">
        <v-card-title class="d-flex align-center px-6 py-4 bg-orange-darken-2">
          <v-icon
            icon="mdi-alert-circle"
            size="20"
            color="white"
            class="me-3"
          />
          <span class="card-title text-white">確認狀態變更</span>
        </v-card-title>

        <v-card-text class="px-6 pt-6 pb-0">
          <div class="mb-4">
            <p class="sub-title mb-4">
              您是否確定要將申請單 <strong>{{ statusConfirmDialog.designRequestNumber }}</strong> 的狀態從
              <v-chip
                :color="getStatusColor(statusConfirmDialog.currentStatus)"
                size="small"
                label
                class="font-weight-medium mx-1"
              >
                {{ getStatusText(statusConfirmDialog.currentStatus) }}
              </v-chip>
              更改為
              <v-chip
                :color="getStatusColor(statusConfirmDialog.newStatus)"
                size="small"
                label
                class="font-weight-medium mx-1"
              >
                {{ getStatusText(statusConfirmDialog.newStatus) }}
              </v-chip>
              ？
            </p>

            <div
              class="bg-orange-lighten-5 pa-4 rounded-lg border-left-orange-darken-2"
            >
              <div class="d-flex align-center mb-2">
                <v-icon
                  icon="mdi-alert-octagon"
                  size="20"
                  color="orange-darken-2"
                  class="me-2"
                />
                <span class="text-orange-darken-2 font-weight-bold">重要提醒</span>
              </div>
              <p class="text-body-2 text-grey-darken-1 mb-0">
                更改為結案狀態後，<strong>申請者上傳的所有圖片及檔案將會被永久刪除</strong>，此操作無法復原。
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="cancelStatusUpdate"
          >
            取消變更
          </v-btn>
          <v-btn
            color="orange-darken-2"
            class="ms-2"
            variant="outlined"
            :loading="updatingStatus.has(statusConfirmDialog.designRequestId)"
            @click="confirmStatusUpdate"
          >
            確認變更
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 通知 EMAIL 管理對話框 -->
    <v-dialog
      v-model="notificationEmailDialog.show"
      max-width="1000"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-email-multiple"
            size="20"
            color="white"
            class="me-3"
          />
          <span class="card-title text-white">通知設定管理</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            color="white"
            :ripple="false"
            class="opacity-100"
            @click="closeNotificationEmailDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-6">
          <!-- 新增通知設定表單 -->
          <v-form ref="notificationEmailFormRef">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-0">
                  <v-icon
                    icon="mdi-plus-circle"
                    size="18"
                    color="blue-grey-darken-2"
                    class="me-2"
                  />
                  <span class="text-blue-grey-darken-2 card-title">新增通知設定</span>
                </div>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="notificationEmailForm.user"
                  :items="availableUsers"
                  item-title="label"
                  item-value="value"
                  label="* 選擇用戶"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇用戶']"
                  prepend-inner-icon="mdi-account"
                  :filter="customFilter"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                class="pt-0 mb-3"
              >
                <v-card
                  class="pa-4 elevation-0 notification-email-card"
                >
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      icon="mdi-checkbox-multiple-marked-outline"
                      size="18"
                      color="grey-darken-1"
                      class="me-2"
                    />
                    <span class="text-grey-darken-1 font-weight-bold">選擇需要通知的大分類</span>
                  </div>

                  <v-row>
                    <v-col
                      v-for="category in categoryOptions"
                      :key="category.value"
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-checkbox
                        :model-value="notificationEmailForm.categories.includes(category.value)"
                        :label="category.label"
                        color="grey-darken-1"
                        hide-details
                        density="compact"
                        @update:model-value="(checked) => toggleCategory(category.value, checked)"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="notificationEmailForm.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  prepend-inner-icon="mdi-note-text"
                />
              </v-col>

              <v-col
                cols="12"
                class="d-flex justify-end pt-0"
              >
                <v-btn
                  color="teal-darken-2"
                  variant="outlined"
                  :loading="addingEmail"
                  @click="addNotificationEmail"
                >
                  新增
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <!-- 通知設定列表 -->
          <div>
            <div class="d-flex align-center mb-4">
              <v-icon
                icon="mdi-format-list-bulleted"
                size="18"
                color="blue-grey-darken-2"
                class="me-2"
              />
              <span class="text-blue-grey-darken-2 card-title">通知設定列表</span>
            </div>

            <template v-if="notificationEmailsLoading">
              <div class="d-flex justify-center align-center py-8">
                <v-progress-circular
                  indeterminate
                  color="blue-grey-darken-2"
                  size="40"
                />
              </div>
            </template>
            <template v-else>
              <div
                v-if="notificationEmails.length === 0"
                class="text-center py-8"
              >
                <v-icon
                  icon="mdi-email-off"
                  size="48"
                  color="grey-lighten-1"
                  class="mb-3"
                />
                <div class="text-grey-lighten-1">
                  尚未設定任何EMAIL
                </div>
              </div>
              <v-list v-else>
                <v-list-item
                  v-for="email in notificationEmails"
                  :key="email._id"
                  class="mb-3 border rounded px-4 py-3"
                  style="flex-direction: column; align-items: flex-start;"
                >
                  <div class="d-flex align-center mb-1">
                    <v-icon
                      icon="mdi-account-circle"
                      size="22"
                      color="blue-grey-darken-2"
                      class="me-3"
                    />
                    <span class="text-grey-darken-3 font-weight-bold me-4">{{ email.user?.name }}</span>
                    <span
                      class="me-4 text-grey-darken-2"
                      style="font-size: 14px;"
                    >{{ email.user?.email }}</span>
                    <span
                      class="me-4 text-grey"
                      style="font-size: 14px;"
                    >備註：{{ email.note || '' }}</span>
                    <v-spacer />
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      size="small"
                      @click="openEditEmailDialog(email)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-darken-1"
                      variant="plain"
                      size="small"
                      :loading="deletingEmailId === email._id"
                      @click="openDeleteEmailConfirmDialog(email)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <div class="d-flex align-center flex-wrap mt-1">
                    <v-chip
                      v-for="category in email.categories"
                      :key="category"
                      color="blue-grey-darken-2"
                      text-color="white"
                      class="me-2 mb-1 font-weight-bold"
                      size="small"
                      label
                    >
                      {{ getCategoryLabel(category) }}
                    </v-chip>
                  </div>
                </v-list-item>
              </v-list>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯通知設定對話框 -->
    <v-dialog
      v-model="editEmailDialog.show"
      max-width="800"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-darken-1">
          <v-icon
            icon="mdi-pencil"
            size="20"
            color="white"
            class="me-3"
          />
          <span class="card-title text-white">編輯通知設定</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeEditEmailDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-6">
          <v-form ref="editEmailFormRef">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-3">
                  <v-icon
                    icon="mdi-account-circle"
                    size="18"
                    color="blue-darken-1"
                    class="me-2"
                  />
                  <span class="text-blue-darken-1 card-title">用戶資訊</span>
                </div>
                <v-card
                  class="pa-4 elevation-0 notification-email-card mb-4"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      icon="mdi-account"
                      size="20"
                      color="grey-darken-1"
                      class="me-3"
                    />
                    <div>
                      <div class="font-weight-bold text-grey-darken-3">
                        {{ editEmailForm.userName }}
                      </div>
                      <div class="text-grey-darken-2">
                        {{ editEmailForm.userEmail }}
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                class="pt-0 mb-3"
              >
                <v-card
                  class="pa-4 elevation-0 notification-email-card"
                >
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      icon="mdi-checkbox-multiple-marked-outline"
                      size="18"
                      color="grey-darken-1"
                      class="me-2"
                    />
                    <span class="text-grey-darken-1 font-weight-bold">選擇需要通知的大分類</span>
                  </div>

                  <v-row>
                    <v-col
                      v-for="category in categoryOptions"
                      :key="category.value"
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-checkbox
                        :model-value="editEmailForm.categories.includes(category.value)"
                        :label="category.label"
                        color="grey-darken-1"
                        hide-details
                        density="compact"
                        @update:model-value="(checked) => toggleEditCategory(category.value, checked)"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editEmailForm.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  prepend-inner-icon="mdi-note-text"
                />
              </v-col>

              <v-col
                cols="12"
                class="d-flex justify-end pt-0"
              >
                <v-btn
                  color="blue-darken-1"
                  variant="outlined"
                  :loading="updatingEmail"
                  @click="updateNotificationEmail"
                >
                  更新
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 刪除通知設定確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteEmailConfirmDialog.show"
      title="確認刪除通知設定"
      :message="deleteEmailConfirmDialog.message"
      confirm-button-text="確認"
      cancel-button-text="取消"
      @confirm="confirmDeleteNotificationEmail"
    />

    <!-- 部門備註編輯對話框 -->
    <v-dialog
      v-model="departmentNoteDialog.show"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 bg-blue-grey-darken-2">
          <v-icon
            icon="mdi-pencil"
            size="20"
            color="white"
            class="me-3"
          />
          <span class="card-title text-white">編輯部門備註</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
            @click="closeDepartmentNoteDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-6">
          <v-row>
            <v-col cols="12">
              <v-icon
                icon="mdi-identifier"
                size="18"
                color="blue-grey-darken-2"
                class="me-2"
              />
              <span class="text-blue-grey-darken-2 font-weight-bold">申請編號：{{ departmentNoteDialog.designRequestNumber }}</span>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="departmentNoteDialog.newNote"
                label="部門備註"
                variant="outlined"
                density="compact"
                rows="6"
                placeholder="請輸入部門備註內容"
                hide-details
                auto-grow
              />
              <div class="d-flex align-end my-2">
                <v-text-field
                  v-model="departmentNoteUrlInput"
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
                  :disabled="!departmentNoteUrlInput"
                  @click="confirmInsertDepartmentNoteUrl"
                >
                  確認
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            :size="buttonSize"
            color="grey-darken-1"
            @click="closeDepartmentNoteDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            class="ms-2"
            variant="outlined"
            :size="buttonSize"
            :loading="updatingDepartmentNote"
            @click="confirmUpdateDepartmentNote"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import { useUserStore } from '@/stores/user'

// 頁面定義
definePage({
  meta: {
    title: '行銷美編需求申請管理 | GInternational',
    login: true,
    roles: [UserRole.MARKETING, UserRole.ADMIN, UserRole.DESIGNER, UserRole.MANAGER]
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()

// 圖片預覽對話框
const imagePreviewDialog = reactive({
  show: false,
  currentImage: null
})

// 燈箱對話框
const lightboxDialog = reactive({
  show: false,
  currentImage: null,
  currentImageName: '',
  currentIndex: 0,
  images: []
})

const loading = ref(false)
const tableItems = ref([])
const totalItems = ref(0)
const tableOptions = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'applicationDate', order: 'desc' }]
})
const tableHeaders = [
  { title: '申請編號', key: 'designRequestNumber', sortable: true },
  { title: '申請日期', key: 'applicationDate', sortable: true },
  { title: '申請人', key: 'applicant.name', sortable: false },
  { title: '申請類型', key: 'productType', sortable: false },
  { title: '狀態', key: 'status', align: 'center', sortable: true },
  { title: '處理人員', key: 'assignedDesigner.name', align: 'center', sortable: false },
  { title: '部門備註', key: 'departmentNote', width: 300, align: 'center', sortable: false },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]
const statusOptions = [
  { value: 'pending', text: '待處理' },
  { value: 'in_progress', text: '處理中' },
  { value: 'completed', text: '已完成' },
  { value: 'cancelled', text: '已取消' }
]
const editDialog = reactive({ show: false })
const editForm = ref(null)
const editFormValid = ref(false)
const submitting = ref(false)
const editFormData = reactive({})
const originalEditData = ref({}) // 新增：記錄原始資料
const formFields = ref([])
const visibleFormFields = computed(() => formFields.value.filter(field => field.name !== 'needAirlineHighlight' && field.name !== 'needUseLogo'))
const productTypeConfig = ref(null)
const employees = ref([])
const marketingDesigners = ref([])
const productTypeOptions = ref([])
// 大分類選項
const productCategoryOptions = ref([])
const searchCriteria = reactive({
  applicationDate: [],
  applicant: '',
  productCategory: '',
  productType: '',
  status: '',
  assignedDesigner: ''
})

// 新增查看對話框相關變數
const viewDialog = reactive({ show: false })
const viewFormData = reactive({})
const viewFormFields = ref([])

// 新增狀態確認對話框相關變數
const statusConfirmDialog = reactive({
  show: false,
  designRequestId: null,
  newStatus: null,
  currentStatus: null,
  designRequestNumber: ''
})

// 通知 EMAIL 管理相關變數
const notificationEmailDialog = reactive({ show: false })
const notificationEmailForm = reactive({
  user: '',
  categories: [],
  note: ''
})
const notificationEmailFormRef = ref(null)
const notificationEmails = ref([])
const users = ref([])
const addingEmail = ref(false)

// 大分類選項
const categoryOptions = [
  { value: 'printing', label: '印刷相關' },
  { value: 'map', label: '地圖相關' },
  { value: 'dm', label: 'DM相關' },
  { value: 'electronic', label: '電子說資' }
]

// 編輯 EMAIL 對話框相關變數
const editEmailDialog = reactive({ show: false })
const editEmailForm = reactive({
  id: '',
  userName: '',
  userEmail: '',
  categories: [],
  note: ''
})
const editEmailFormRef = ref(null)
const updatingEmail = ref(false)
const originalEditEmailData = ref({}) // 新增：記錄原始資料

// 刪除 EMAIL 確認對話框相關變數
const deleteEmailConfirmDialog = reactive({
  show: false,
  emailId: null,
  emailName: '',
  message: ''
})

// 部門備註編輯對話框相關變數
const departmentNoteDialog = reactive({
  show: false,
  designRequestId: null,
  designRequestNumber: '',
  currentNote: '',
  newNote: ''
})
const updatingDepartmentNote = ref(false)

// URL插入相關變數
const departmentNoteUrlInput = ref('')

// 計算屬性：過濾顯示的欄位
const visibleViewFormFields = computed(() => {
  return viewFormFields.value.filter(field => field.name !== 'needAirlineHighlight' && field.name !== 'needUseLogo')
})

// 計算屬性：根據大分類過濾申請類型選項
const filteredProductTypeOptions = computed(() => {
  if (!searchCriteria.productCategory) {
    return productTypeOptions.value
  }

  const categoryMap = {
    'printing': ['printing'],
    'map': ['seriesMap', 'seriesMapModify', 'SPMap'],
    'dm': ['newDMSingle', 'newDMMultiple', 'modifyDM']
  }

  const allowedTypes = categoryMap[searchCriteria.productCategory] || []
  return productTypeOptions.value.filter(option => allowedTypes.includes(option.value))
})

// 新增 basePath 變數，取得 Vite 的 base 路徑
const basePath = import.meta.env.BASE_URL || '/'

const resetSearch = () => {
  searchCriteria.applicationDate = []
  searchCriteria.applicant = ''
  searchCriteria.productCategory = ''
  searchCriteria.productType = ''
  searchCriteria.status = ''
  searchCriteria.assignedDesigner = ''
  fetchTableData()
}

const fetchTableData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = {
      page: tableOptions.page,
      itemsPerPage: tableOptions.itemsPerPage,
      sortBy: tableOptions.sortBy[0]?.key,
      sortOrder: tableOptions.sortBy[0]?.order
    }
    if (searchCriteria.applicant) params.applicant = searchCriteria.applicant
    if (searchCriteria.productCategory) params.productCategory = searchCriteria.productCategory
    if (searchCriteria.productType) params.productType = searchCriteria.productType
    if (searchCriteria.status) params.status = searchCriteria.status
    if (searchCriteria.assignedDesigner) params.assignedDesigner = searchCriteria.assignedDesigner
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
    const { data } = await apiAuth.get('/marketing/design-requests', { params })
    if (data.success) {
      tableItems.value = data.result.data
      totalItems.value = data.result.totalItems
    }
  } catch (error) {
    createSnackbar({ text: error?.response?.data?.message || '取得表格資料失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    loading.value = false
  }
}

const handleTableOptionsChange = () => {
  fetchTableData()
}

const fetchProductTypes = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/design-requests/product-types')
    if (data.success) {
      productTypeOptions.value = data.result.flatMap(category =>
        category.items.map(item => ({ value: item.value, label: `${category.category} - ${item.label}` }))
      )
    }
  } catch {
    // 忽略錯誤
  }
}

// 取得大分類選項
const fetchProductCategories = async () => {
  try {
    const { data } = await apiAuth.get('/marketing/design-requests/product-categories')
    if (data.success) {
      productCategoryOptions.value = data.result
    }
  } catch {
    // 忽略錯誤
  }
}

// 大分類變更處理
const handleProductCategoryChange = () => {
  // 當大分類變更時，清空申請類型選擇
  searchCriteria.productType = ''
}

const fetchEmployees = async () => {
  try {
    const { data } = await apiAuth.get('/employees/active')
    if (data.success) employees.value = data.result
  } catch {
    // 忽略錯誤
  }
}

const fetchMarketingDesigners = async () => {
  try {
    const { data } = await apiAuth.get('/employees/marketing-design')
    if (data.success) marketingDesigners.value = data.result
  } catch {
    // 忽略錯誤
  }
}

const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const itemText = item.raw && item.raw.name && item.raw.employeeCode
    ? `${item.raw.name} ${item.raw.employeeCode}`.toLowerCase()
    : ''
  return itemText.includes(textToSearch)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 1. 新增 getPrintingTypeText 輔助函數（如前述）
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

// 2. 修正 getProductTypeText，正確使用 item 參數
const getProductTypeText = (type, item) => {
  if (type === 'printing') {
    if (item && item.printingTypes) return getPrintingTypeText(item.printingTypes)
    return '【印刷相關】'
  }
  const option = productTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange-darken-2',
    in_progress: 'blue-darken-1',
    completed: 'green-darken-1',
    cancelled: 'red-lighten-1'
  }
  return colorMap[status] || 'grey'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待處理',
    in_progress: '處理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 檢查狀態是否為已完成或已取消
const isCompletedOrCancelled = (status) => {
  return status === 'completed' || status === 'cancelled'
}

// 取得狀態文字樣式類別
const getStatusTextClass = (status) => {
  switch (status) {
    case 'completed':
      return 'teal-lighten-1'
    case 'cancelled':
      return 'red-lighten-1'
    default:
      return 'grey-lighten-2'
  }
}

const getFileName = (filePath) => {
  if (!filePath) return ''
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

// 判斷是否為圖片檔案
const isImageFile = (filePath) => {
  if (!filePath) return false
  const fileName = getFileName(filePath).toLowerCase()
  return /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
}

// 開啟燈箱預覽
const openLightbox = (files, index) => {
  const imageFiles = files.filter(file => isImageFile(file))
  if (imageFiles.length === 0) return

  lightboxDialog.images = imageFiles
  lightboxDialog.currentIndex = index
  lightboxDialog.currentImage = imageFiles[index]
  lightboxDialog.currentImageName = getFileName(imageFiles[index])
  lightboxDialog.show = true
}

// 關閉燈箱
const closeLightbox = () => {
  lightboxDialog.show = false
  lightboxDialog.currentImage = null
  lightboxDialog.currentImageName = ''
  lightboxDialog.currentIndex = 0
  lightboxDialog.images = []
}

// 上一張圖片
const previousImage = () => {
  if (lightboxDialog.images.length <= 1) return
  lightboxDialog.currentIndex = (lightboxDialog.currentIndex - 1 + lightboxDialog.images.length) % lightboxDialog.images.length
  lightboxDialog.currentImage = lightboxDialog.images[lightboxDialog.currentIndex]
  lightboxDialog.currentImageName = getFileName(lightboxDialog.currentImage)
}

// 下一張圖片
const nextImage = () => {
  if (lightboxDialog.images.length <= 1) return
  lightboxDialog.currentIndex = (lightboxDialog.currentIndex + 1) % lightboxDialog.images.length
  lightboxDialog.currentImage = lightboxDialog.images[lightboxDialog.currentIndex]
  lightboxDialog.currentImageName = getFileName(lightboxDialog.currentImage)
}

// 批量下載所有檔案
const downloadAllFiles = async (files) => {
  if (!files || files.length === 0) {
    createSnackbar({
      text: '沒有檔案可供下載',
      snackbarProps: { color: 'orange-lighten-1' }
    })
    return
  }

  createSnackbar({
    text: '正在打包檔案，請稍候...',
    snackbarProps: { color: 'teal-lighten-1' }
  })

  try {
    const zip = new JSZip()
    let successCount = 0
    let failCount = 0

    await Promise.all(files.map(async (fileUrl) => {
      try {
        const response = await fetch(fileUrl)
        if (response.ok) {
          const blob = await response.blob()
          zip.file(getFileName(fileUrl), blob)
          successCount++
        } else {
          console.warn(`檔案下載失敗: ${fileUrl}`)
          failCount++
        }
      } catch (error) {
        console.error(`檔案下載錯誤: ${fileUrl}`, error)
        failCount++
      }
    }))

    if (successCount === 0) {
      createSnackbar({
        text: '所有檔案下載失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `所有檔案_${new Date().toISOString().slice(0, 10)}.zip`)

    // 顯示完成提示
    if (failCount === 0) {
      createSnackbar({
        text: `檔案打包完成！共下載 ${successCount} 個檔案`,
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      createSnackbar({
        text: `檔案打包完成！成功 ${successCount} 個，失敗 ${failCount} 個`,
        snackbarProps: { color: 'orange-lighten-1' }
      })
    }
  } catch (error) {
    console.error('檔案打包失敗:', error)
    createSnackbar({
      text: '檔案打包失敗，請稍後再試',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const openEditDialog = async (item) => {
  // 檢查狀態是否為已完成或已取消，如果是則不允許編輯
  if (isCompletedOrCancelled(item.status)) {
    createSnackbar({
      text: `狀態為「${getStatusText(item.status)}」的申請單無法編輯`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 清理 editFormData
  Object.keys(editFormData).forEach(key => delete editFormData[key])

  editDialog.show = true

  // 深拷貝資料並處理日期欄位
  const processedItem = { ...item }

  // 處理日期欄位，將 ISO 字串轉換為 Date 物件
  // 只有 requestedByDate 是真正的日期欄位，departureDate 是字串類型
  const dateFields = ['requestedByDate']
  dateFields.forEach(field => {
    if (processedItem[field] && typeof processedItem[field] === 'string') {
      processedItem[field] = new Date(processedItem[field])
    }
  })

  // 處理申請人資料，轉換為 v-autocomplete 需要的格式
  if (processedItem.applicant && typeof processedItem.applicant === 'object') {
    // 將申請人物件轉換為 { label, value } 格式
    processedItem.applicant = {
      label: `${processedItem.applicant.name} (${processedItem.applicant.employeeCode})`,
      value: processedItem.applicant._id || processedItem.applicant.id
    }
  }

  // 特殊處理：印刷相關類型
  if (processedItem.productType === 'printing') {
    // 確保 printingTypes 存在，如果沒有則根據現有資料推斷
    if (!processedItem.printingTypes) {
      processedItem.printingTypes = {
        infoBookletCover: !!(processedItem.infoBookletCover && Object.values(processedItem.infoBookletCover).some(v => v && v !== '')),
        banner: !!(processedItem.banner && Object.values(processedItem.banner).some(v => v && v !== '')),
        coachSign: !!(processedItem.coachSign && Object.values(processedItem.coachSign).some(v => v && v !== '')),
        other: !!(processedItem.otherNote && processedItem.otherNote !== '')
      }
    }

    // 確保各子類型的資料結構存在
    if (!processedItem.infoBookletCover) {
      processedItem.infoBookletCover = {
        title: '',
        style: '',
        imageSubject: '',
        content: '',
        requestedByDate: null
      }
    }
    if (!processedItem.banner) {
      processedItem.banner = {
        title: '',
        style: '',
        imageSubject: '',
        content: '',
        quantity: 1,
        requestedByDate: null
      }
    }
    if (!processedItem.coachSign) {
      processedItem.coachSign = {
        content: '',
        useInfoBookletCover: false,
        quantity: 1
      }
    }
    if (!processedItem.otherNote) {
      processedItem.otherNote = ''
    }

    // 處理檔案欄位，確保 files 欄位存在
    if (!processedItem.files) {
      processedItem.files = []
    }
  }

  // 行程陣列中的 departureDate 是字串類型，不需要轉換
  // 但如果有其他日期欄位需要處理，可以在這裡添加

  Object.assign(editFormData, processedItem)
  // 初始化 checkbox 欄位，確保一定存在且為 boolean
  if (editFormData.airlineHighlightNote !== undefined && editFormData.needAirlineHighlight === undefined) {
    editFormData.needAirlineHighlight = false
  }
  if (editFormData.useLogo !== undefined && editFormData.needUseLogo === undefined) {
    editFormData.needUseLogo = false
  }
  // 新增：deep clone 一份原始資料（放在checkbox初始化之後，確保內容一致）
  originalEditData.value = JSON.parse(JSON.stringify(editFormData))
  await fetchProductTypeFields(item.productType)
}

const closeEditDialog = () => {
  editDialog.show = false
  // 清理 editFormData
  Object.keys(editFormData).forEach(key => delete editFormData[key])
  // 重置 productTypeConfig
  productTypeConfig.value = null
}

const fetchProductTypeFields = async (productType) => {
  try {
    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/${productType}/fields`)
    if (data.success) {
      formFields.value = [
        ...(data.result.fields || []),
        ...(data.result.required || []),
        ...(data.result.optional || []),
        ...(data.result.conditional || [])
      ]
      // 確保 productTypeConfig 正確設置
      productTypeConfig.value = data.result
    }
  } catch {
    // 忽略錯誤
  }
}

const confirmEditSubmit = async () => {
  const { valid } = await editForm.value.validate()
  if (!valid) return
  // 新增：比對資料
  if (JSON.stringify(editFormData) === JSON.stringify(originalEditData.value)) {
    createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
    return
  }
  submitting.value = true
  try {
    // 準備提交資料，處理日期格式
    const submitData = { ...editFormData }

    // 將 Date 物件轉換為 ISO 字串
    const dateFields = ['requestedByDate']
    dateFields.forEach(field => {
      if (submitData[field] instanceof Date) {
        submitData[field] = submitData[field].toISOString()
      }
    })

    // 處理行程陣列中的日期欄位
    if (submitData.itinerary && Array.isArray(submitData.itinerary)) {
      // departureDate 是字串類型，不需要轉換
      // 如果有其他日期欄位需要處理，可以在這裡添加
    }

    // 編輯模式下不需要處理檔案上傳，直接使用 JSON
    const submitDataToSend = { ...submitData }

    // 修正 coachSign.useInfoBookletCover 型別
    if (submitDataToSend.coachSign) {
      submitDataToSend.coachSign.useInfoBookletCover = (submitDataToSend.coachSign.useInfoBookletCover === true);
    }

    // 處理印刷相關資料
    if (submitDataToSend.printingTypes) {
      submitDataToSend.printingTypes = JSON.stringify(submitDataToSend.printingTypes)
    }

    // 處理巢狀物件資料
    const nestedFields = ['infoBookletCover', 'banner', 'coachSign']
    nestedFields.forEach(field => {
      if (submitDataToSend[field] && submitDataToSend.printingTypes) {
        const printingTypes = JSON.parse(submitDataToSend.printingTypes)
        if (printingTypes[field]) {
          // 確保所有欄位都送出
          const fieldDefinitions = {
            infoBookletCover: ['title', 'style', 'imageSubject', 'content', 'requestedByDate'],
            banner: ['title', 'style', 'imageSubject', 'content', 'quantity', 'requestedByDate'],
            coachSign: ['content', 'useInfoBookletCover', 'quantity']
          }
          const fieldsToSend = fieldDefinitions[field] || []
          fieldsToSend.forEach(subKey => {
            if (!submitDataToSend[field][subKey]) {
              submitDataToSend[field][subKey] = ''
            }
          })
        }
      }
    })



    const { data } = await apiAuth.patch(`/marketing/design-requests/${editFormData._id}`, submitDataToSend)
    if (data.success) {
      createSnackbar({ text: '修改成功', snackbarProps: { color: 'teal-lighten-1' } })
      closeEditDialog()
      fetchTableData()
    }
  } catch (error) {
    createSnackbar({ text: error?.response?.data?.message || '修改失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    submitting.value = false
  }
}

const updatingDesigners = ref(new Set())

const updateAssignedDesigner = async (designRequestId, newDesignerId) => {
  if (updatingDesigners.value.has(designRequestId)) return

  try {
    const currentItem = tableItems.value.find(item => item._id === designRequestId)

    // 檢查當前狀態是否為已完成或已取消，如果是則不允許變更處理人員
    if (isCompletedOrCancelled(currentItem.status)) {
      createSnackbar({
        text: `狀態為「${getStatusText(currentItem.status)}」的申請單無法再變更處理人員`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 檢查是否為清除指派
    if (newDesignerId === null) {
      if (!currentItem.assignedDesigner) {
        createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
        return
      }
    } else if (currentItem.assignedDesigner?._id === newDesignerId) {
      createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
      return
    }

    updatingDesigners.value.add(designRequestId)

    const { data } = await apiAuth.patch(`/marketing/design-requests/${designRequestId}`, {
      assignedDesigner: newDesignerId
    })

    if (data.success) {
      // 更新本地資料，包括處理人員和可能的狀態更新
      if (data.result) {
        currentItem.assignedDesigner = data.result.assignedDesigner
        // 如果後端自動更新了狀態，也要同步更新本地狀態
        if (data.result.status && data.result.status !== currentItem.status) {
          currentItem.status = data.result.status
          console.log('狀態已自動更新:', data.result.status)
        }
      } else {
        // 如果沒有回傳完整資料，使用原有邏輯
        if (newDesignerId === null) {
          currentItem.assignedDesigner = null
        } else {
          const updatedDesigner = marketingDesigners.value.find(d => d.value === newDesignerId)
          if (updatedDesigner) {
            currentItem.assignedDesigner = {
              _id: newDesignerId,
              name: updatedDesigner.name
            }
          } else {
            currentItem.assignedDesigner = null
          }
        }
      }

      if (newDesignerId === null) {
        createSnackbar({ text: '已清除處理人員指派', snackbarProps: { color: 'teal-lighten-1' } })
      } else {
        createSnackbar({ text: '處理人員更新成功', snackbarProps: { color: 'teal-lighten-1' } })
      }
    }
  } catch (error) {
    console.error('更新處理人員失敗:', error)
    createSnackbar({ text: error?.response?.data?.message || '更新處理人員失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    updatingDesigners.value.delete(designRequestId)
  }
}

const updatingStatus = ref(new Set())

const updateStatus = async (designRequestId, newStatus) => {
  if (updatingStatus.value.has(designRequestId)) return

  const currentItem = tableItems.value.find(item => item._id === designRequestId)

  // 檢查狀態是否相同
  if (currentItem.status === newStatus) {
    createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
    return
  }

  // 檢查當前狀態是否為已完成或已取消，如果是則不允許變更
  if (isCompletedOrCancelled(currentItem.status)) {
    createSnackbar({
      text: `狀態為「${getStatusText(currentItem.status)}」的申請單無法再變更狀態`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 如果是結案狀態（已完成或已取消），先顯示確認對話框
  if (newStatus === 'completed' || newStatus === 'cancelled') {
    statusConfirmDialog.designRequestId = designRequestId
    statusConfirmDialog.newStatus = newStatus
    statusConfirmDialog.currentStatus = currentItem.status
    statusConfirmDialog.designRequestNumber = currentItem.designRequestNumber
    statusConfirmDialog.show = true
    return
  }

  // 非結案狀態，直接更新
  await performStatusUpdate(designRequestId, newStatus)
}

// 執行狀態更新的實際函數
const performStatusUpdate = async (designRequestId, newStatus) => {
  if (updatingStatus.value.has(designRequestId)) return

  try {
    const currentItem = tableItems.value.find(item => item._id === designRequestId)
    updatingStatus.value.add(designRequestId)

    const { data } = await apiAuth.patch(`/marketing/design-requests/${designRequestId}`, {
      status: newStatus
    })

    if (data.success) {
      // 如果是結案狀態，重新獲取完整資料以反映檔案刪除
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        // 重新獲取該筆資料的完整資訊
        try {
          const detailResponse = await apiAuth.get(`/marketing/design-requests/${designRequestId}`)
          if (detailResponse.data.success) {
            // 更新本地資料為最新的完整資料
            const updatedItem = detailResponse.data.result
            const index = tableItems.value.findIndex(item => item._id === designRequestId)
            if (index !== -1) {
              tableItems.value[index] = updatedItem
            }
          }
        } catch (detailError) {
          console.error('重新獲取資料失敗:', detailError)
          // 如果重新獲取失敗，至少更新狀態
          currentItem.status = newStatus
        }
      } else {
        // 非結案狀態，只更新狀態
        currentItem.status = newStatus
      }

      createSnackbar({ text: '狀態更新成功', snackbarProps: { color: 'teal-lighten-1' } })
    }
  } catch (error) {
    console.error('更新狀態失敗:', error)
    createSnackbar({ text: error?.response?.data?.message || '更新狀態失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    updatingStatus.value.delete(designRequestId)
  }
}

// 確認狀態更新
const confirmStatusUpdate = async () => {
  await performStatusUpdate(statusConfirmDialog.designRequestId, statusConfirmDialog.newStatus)
  statusConfirmDialog.show = false
}

// 取消狀態更新
const cancelStatusUpdate = () => {
  statusConfirmDialog.show = false
}

const openViewDialog = async (item) => {
  // 深拷貝資料並處理日期欄位
  const processedItem = { ...item }
  const dateFields = ['requestedByDate']
  dateFields.forEach(field => {
    if (processedItem[field] && typeof processedItem[field] === 'string') {
      processedItem[field] = new Date(processedItem[field])
    }
  })
  Object.assign(viewFormData, processedItem)
  // 先取得 config，確保 productTypeConfig 有值
  await fetchViewProductTypeFields(item.productType)
  viewDialog.show = true
}

const closeViewDialog = () => {
  viewDialog.show = false
  Object.keys(viewFormData).forEach(key => delete viewFormData[key])
}

const fetchViewProductTypeFields = async (productType) => {
  try {
    const { data } = await apiAuth.get(`/marketing/design-requests/product-types/${productType}/fields`)
    if (data.success) {
      viewFormFields.value = [
        ...(data.result.fields || []),
        ...(data.result.required || []),
        ...(data.result.optional || []),
        ...(data.result.conditional || [])
      ]
      // 新增：設 productTypeConfig
      productTypeConfig.value = data.result
    }
  } catch {
    // 忽略錯誤
  }
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

// 取得巢狀物件值
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// 取得顯示標籤（查看詳細資訊時移除必填標記）
const getDisplayLabel = (label) => {
  if (!label) return ''
  // 在查看詳細資訊時移除 "* " 前綴
  if (viewDialog.show && viewDialog.isEdit) {
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



// 下載檔案
const downloadFile = async (filePath) => {
  if (!filePath) {
    createSnackbar({
      text: '檔案路徑無效',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  try {
    createSnackbar({
      text: '正在下載檔案...',
      snackbarProps: { color: 'teal-lighten-1' }
    })

    const response = await fetch(filePath)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getFileName(filePath)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      createSnackbar({
        text: '檔案下載完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      createSnackbar({
        text: '檔案下載失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('檔案下載錯誤:', error)
    createSnackbar({
      text: '檔案下載失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 通知 EMAIL 管理相關方法
const notificationEmailsLoading = ref(false)

const fetchNotificationEmails = async () => {
  notificationEmailsLoading.value = true
  try {
    const { data } = await apiAuth.get('/notificationEmails')
    if (data.success) {
      notificationEmails.value = data.result
    }
  } catch (error) {
    console.error('取得通知設定列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得通知設定列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    notificationEmailsLoading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await apiAuth.get('/notificationEmails/users')
    if (data.success) {
      users.value = data.result.map(user => ({
        value: user._id,
        label: `${user.name} - ${user.email}`
      }))
    }
  } catch (error) {
    console.error('取得用戶列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得用戶列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const openNotificationEmailDialog = () => {
  notificationEmailDialog.show = true
  fetchNotificationEmails()
  fetchUsers()
}

const closeNotificationEmailDialog = () => {
  notificationEmailDialog.show = false
  // 重置表單
  notificationEmailForm.user = ''
  notificationEmailForm.categories = []
  notificationEmailForm.note = ''
  if (notificationEmailFormRef.value) {
    notificationEmailFormRef.value.resetValidation()
  }
}

const addNotificationEmail = async () => {
  // 觸發 v-form 驗證
  const { valid } = await notificationEmailFormRef.value.validate();
  if (!valid) {
    return;
  }

  // 驗證至少選擇一個大分類
  if (!notificationEmailForm.categories || notificationEmailForm.categories.length === 0) {
    createSnackbar({
      text: '請至少選擇一個大分類',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return;
  }

  // 新增 debug log
  console.log('送出通知設定 user:', notificationEmailForm.user)
  console.log('送出通知設定 categories:', notificationEmailForm.categories)
  console.log('送出通知設定 note:', notificationEmailForm.note)

  addingEmail.value = true
  try {
    const { data } = await apiAuth.post('/notificationEmails', notificationEmailForm)
    if (data.success) {
      createSnackbar({
        text: '通知設定新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 清空欄位
      notificationEmailForm.user = ''
      notificationEmailForm.categories = []
      notificationEmailForm.note = ''
      await nextTick()
      if (notificationEmailFormRef.value) {
        notificationEmailFormRef.value.resetValidation()
      }
      await fetchNotificationEmails()
    }
  } catch (error) {
    console.error('新增通知設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '新增通知設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    addingEmail.value = false
  }
}

// 開啟刪除通知設定確認對話框
const openDeleteEmailConfirmDialog = (notification) => {
  deleteEmailConfirmDialog.emailId = notification._id
  deleteEmailConfirmDialog.emailName = notification.user?.name
  deleteEmailConfirmDialog.message = `您確定要刪除 <strong>${notification.user?.name}</strong> (${notification.user?.email}) 的通知設定嗎？此操作無法復原。`
  deleteEmailConfirmDialog.show = true
}

// 確認刪除通知設定
const confirmDeleteNotificationEmail = async () => {
  const emailId = deleteEmailConfirmDialog.emailId
  deletingEmailId.value = emailId
  try {
    const { data } = await apiAuth.delete(`/notificationEmails/${emailId}`)
    if (data.success) {
      createSnackbar({
        text: '通知設定刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchNotificationEmails()
    }
  } catch (error) {
    console.error('刪除通知設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除通知設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingEmailId.value = null
    deleteEmailConfirmDialog.show = false
  }
}

onMounted(() => {
  fetchProductTypes()
  fetchProductCategories()
  fetchEmployees()
  fetchMarketingDesigners()
  fetchTableData()
})

// 計算屬性：檢查是否有勾選任一印刷子類型
const hasSelectedPrintingType = computed(() => {
  if (!editFormData.printingTypes) return false
  return Object.values(editFormData.printingTypes).some(value => value === true)
})

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

const deletingEmailId = ref(null)

// 取得大分類標籤
const getCategoryLabel = (category) => {
  const categoryMap = {
    'printing': '印刷相關',
    'map': '地圖相關',
    'dm': 'DM相關',
    'electronic': '電子說資'
  }
  return categoryMap[category] || category
}

// 切換大分類選擇
const toggleCategory = (categoryValue, checked) => {
  if (checked) {
    if (!notificationEmailForm.categories.includes(categoryValue)) {
      notificationEmailForm.categories.push(categoryValue)
    }
  } else {
    const index = notificationEmailForm.categories.indexOf(categoryValue)
    if (index > -1) {
      notificationEmailForm.categories.splice(index, 1)
    }
  }
}

// 切換編輯對話框中的大分類選擇
const toggleEditCategory = (categoryValue, checked) => {
  if (checked) {
    if (!editEmailForm.categories.includes(categoryValue)) {
      editEmailForm.categories.push(categoryValue)
    }
  } else {
    const index = editEmailForm.categories.indexOf(categoryValue)
    if (index > -1) {
      editEmailForm.categories.splice(index, 1)
    }
  }
}

// 複製申請單資訊
const copyRequestInfo = async () => {
  try {
    let infoText = ''

    // 基本資訊
    infoText += '📌 基本資訊\n'
    if (viewFormData.designRequestNumber) {
      infoText += `申請編號：${viewFormData.designRequestNumber}\n`
    }
    if (viewFormData.productType) {
      infoText += `申請類型：${getProductTypeText(viewFormData.productType, viewFormData)}\n`
    }
    if (viewFormData.applicationDate) {
      infoText += `申請日期：${formatDate(viewFormData.applicationDate)} ${formatTime(viewFormData.applicationDate)}\n`
    }
    if (viewFormData.applicant?.name) {
      infoText += `申請人：${viewFormData.applicant.name} (${viewFormData.applicant.employeeCode})\n`
    }
    if (viewFormData.assignedDesigner?.name) {
      infoText += `處理人員：${viewFormData.assignedDesigner.name}\n`
    }
    infoText += '\n'

    // 申請資訊
    infoText += '📝 申請資訊\n'

    // 印刷相關特殊處理
    if (viewFormData.productType === 'printing') {
      // 依勾選子類型顯示資訊
      const sections = productTypeConfig.value?.sections || {}
      Object.entries(sections).forEach(([sectionKey, section]) => {
        if (viewFormData.printingTypes?.[sectionKey]) {
          infoText += `\n【${section.title}】\n`
          section.fields.forEach(field => {
            const value = getNestedValue(viewFormData, field.name)
            if (value !== null && value !== undefined && value !== '') {
              const displayLabel = getDisplayLabel(field.label).replace('* ', '')
              if (field.type === 'date') {
                infoText += `${displayLabel}：${formatDate(value)}\n`
              } else if (field.type === 'number') {
                infoText += `${displayLabel}：${value}\n`
              } else if (field.type === 'select') {
                infoText += `${displayLabel}：${typeof value === 'boolean' ? (value ? '是' : '否') : value}\n`
              } else {
                infoText += `${displayLabel}：${value}\n`
              }
            }
          })
        }
      })
    } else {
      // 一般表單欄位
      const fields = visibleViewFormFields.value
      fields.forEach(field => {
        // 跳過檔案類型欄位
        if (field.type === 'file') return

        const value = viewFormData[field.name]
        if (value !== null && value !== undefined && value !== '') {
          const displayLabel = getDisplayLabel(field.label).replace('* ', '')

          if (field.type === 'date') {
            infoText += `${displayLabel}：${formatDate(value)}\n`
          } else if (field.type === 'number') {
            infoText += `${displayLabel}：${value}\n`
          } else if (field.type === 'checkbox') {
            infoText += `${displayLabel}：${value ? '是' : '否'}\n`
          } else if (field.type === 'select') {
            infoText += `${displayLabel}：${typeof value === 'boolean' ? (value ? '是' : '否') : value}\n`
          } else if (field.type === 'array') {
            if (Array.isArray(value) && value.length > 0) {
              infoText += `${displayLabel}：\n`
              value.forEach((item, index) => {
                infoText += `  行程 ${index + 1}：\n`
                if (item.groupName) infoText += `    團體名稱：${item.groupName}\n`
                if (item.departureDate) infoText += `    出發日期：${item.departureDate}\n`
                if (item.agentPrice) infoText += `    同業價：${item.agentPrice}\n`
                if (item.retailPrice) infoText += `    直客價：${item.retailPrice}\n`
                if (item.tripHighlights) infoText += `    行程特色：${item.tripHighlights}\n`
              })
            }
          } else {
            // 文字和多行文字
            infoText += `${displayLabel}：${value}\n`
          }
        }
      })
    }

    // 複製到剪貼簿
    await navigator.clipboard.writeText(infoText)

    createSnackbar({
      text: '申請單資訊已複製到剪貼簿',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('複製失敗:', error)
    createSnackbar({
      text: '複製失敗，請稍後再試',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 用戶下拉選單選項，排除已設定過的 user
const availableUsers = computed(() => {
  const usedUserIds = notificationEmails.value.map(e => e.user?._id)
  return users.value.filter(u => !usedUserIds.includes(u.value))
})

// 開啟編輯通知設定對話框
const openEditEmailDialog = (email) => {
  editEmailForm.id = email._id
  editEmailForm.userName = email.user?.name || ''
  editEmailForm.userEmail = email.user?.email || ''
  editEmailForm.categories = [...(email.categories || [])]
  editEmailForm.note = email.note || ''
  editEmailDialog.show = true

  // 新增：deep clone 一份原始資料
  originalEditEmailData.value = JSON.parse(JSON.stringify({
    id: email._id,
    userName: email.user?.name || '',
    userEmail: email.user?.email || '',
    categories: [...(email.categories || [])],
    note: email.note || ''
  }))
}

// 關閉編輯通知設定對話框
const closeEditEmailDialog = () => {
  editEmailDialog.show = false
  // 重置表單
  editEmailForm.id = ''
  editEmailForm.userName = ''
  editEmailForm.userEmail = ''
  editEmailForm.categories = []
  editEmailForm.note = ''
  // 重置原始資料
  originalEditEmailData.value = {}
  if (editEmailFormRef.value) {
    editEmailFormRef.value.resetValidation()
  }
}

// 更新通知設定
const updateNotificationEmail = async () => {
  // 驗證至少選擇一個大分類
  if (!editEmailForm.categories || editEmailForm.categories.length === 0) {
    createSnackbar({
      text: '請至少選擇一個大分類',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  // 新增：比對資料
  const currentData = {
    id: editEmailForm.id,
    userName: editEmailForm.userName,
    userEmail: editEmailForm.userEmail,
    categories: [...editEmailForm.categories].sort(), // 排序以確保比較準確
    note: editEmailForm.note || ''
  }

  const originalData = {
    id: originalEditEmailData.value.id,
    userName: originalEditEmailData.value.userName,
    userEmail: originalEditEmailData.value.userEmail,
    categories: [...(originalEditEmailData.value.categories || [])].sort(), // 排序以確保比較準確
    note: originalEditEmailData.value.note || ''
  }

  if (JSON.stringify(currentData) === JSON.stringify(originalData)) {
    createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
    return
  }

  updatingEmail.value = true
  try {
    const { data } = await apiAuth.put(`/notificationEmails/${editEmailForm.id}`, {
      categories: editEmailForm.categories,
      note: editEmailForm.note
    })
    if (data.success) {
      createSnackbar({
        text: '通知設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditEmailDialog()
      await fetchNotificationEmails()
    }
  } catch (error) {
    console.error('更新通知設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新通知設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingEmail.value = false
  }
}

// 部門備註相關函數
const openDepartmentNoteDialog = (item) => {
  // 檢查狀態是否為已完成或已取消，如果是則不允許編輯
  if (isCompletedOrCancelled(item.status)) {
    createSnackbar({
      text: `狀態為「${getStatusText(item.status)}」的申請單無法編輯部門備註`,
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  departmentNoteDialog.designRequestId = item._id
  departmentNoteDialog.designRequestNumber = item.designRequestNumber
  departmentNoteDialog.currentNote = item.departmentNote || ''
  departmentNoteDialog.newNote = item.departmentNote || ''
  departmentNoteDialog.show = true
}

const closeDepartmentNoteDialog = () => {
  departmentNoteDialog.show = false
  departmentNoteDialog.designRequestId = null
  departmentNoteDialog.designRequestNumber = ''
  departmentNoteDialog.currentNote = ''
  departmentNoteDialog.newNote = ''
  departmentNoteUrlInput.value = ''
}

// URL插入功能
const confirmInsertDepartmentNoteUrl = () => {
  if (!departmentNoteUrlInput.value) return

  const textarea = document.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = departmentNoteDialog.newNote
  const before = text.substring(0, start)
  const after = text.substring(end)

  const buttonHtml = ` <a href="${departmentNoteUrlInput.value}" target="_blank" class="url-button">連結</a>`
  departmentNoteDialog.newNote = before + buttonHtml + after

  departmentNoteUrlInput.value = ''
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

const confirmUpdateDepartmentNote = async () => {
  // 檢查是否有變更
  if (departmentNoteDialog.newNote === departmentNoteDialog.currentNote) {
    createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
    return
  }

  updatingDepartmentNote.value = true
  try {
    const { data } = await apiAuth.patch(`/marketing/design-requests/${departmentNoteDialog.designRequestId}/department-note`, {
      departmentNote: departmentNoteDialog.newNote
    })

    if (data.success) {
      // 更新本地資料
      const currentItem = tableItems.value.find(item => item._id === departmentNoteDialog.designRequestId)
      if (currentItem) {
        currentItem.departmentNote = departmentNoteDialog.newNote
      }

      createSnackbar({
        text: '部門備註更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeDepartmentNoteDialog()
    }
  } catch (error) {
    console.error('更新部門備註失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新部門備註失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingDepartmentNote.value = false
  }
}
</script>

<style lang="scss" scoped>
.text-label {
  color: #455a64;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}
:deep(.v-data-table) {
  thead {
    height: 48px;
    background-color: #455a64 !important;
    color: #fff !important;
  }
}
.odd-row { background-color: #f6f8fa; }
.even-row { background-color: #fffaf0; }

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

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

.info-printing-card {
  border: 1px solid rgba(0,0,0,0.1) !important;
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

/* 燈箱樣式 */
.lightbox-card {
  background: rgba(0, 0, 0, 0.8) !important;
}

.lightbox-close-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 1001;
  background: rgba(0,0,0,0.5) !important;
}

.lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  position: relative;
}

.lightbox-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5) !important;
  border-radius: 50%;
  z-index: 10;
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-nav-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}

/* 在 style 區塊加上 hover 效果 */
.lightbox-close-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}

.lightbox-download-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  box-shadow: 0 0 8px #fff;
}

/* 狀態確認對話框樣式 */
.border-left-orange-darken-2 {
  border-left: 4px solid rgb(245, 101, 101) !important;
}

/* 編輯對話框中的印刷相關樣式 */
.edit-dialog .printing-section-card {
  background: #fff;
  border: 2px solid #90caf9;
  border-radius: 10px;
}
.edit-dialog .printing-section-header {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.printing-checkbox-card {
  border: 1px solid #90caf9;
  background: #f5fafd;
  border-radius: 8px;
}

.printing-checkbox {
  font-weight: 500;
  font-size: 16px;
}

.upload-file-card {
  border: 1px solid #81D4FA;
  border-radius: 8px;
}

.notification-email-card {
  border: 1px solid #aaa;
  border-radius: 4px;
}

/* 禁用狀態的樣式 */
.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed !important;
}

.disabled-btn:hover {
  opacity: 0.6 !important;
  transform: none !important;
}

/* 狀態文字樣式 */
.status-text {
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  min-width: 60px;
  display: inline-block;

  &.teal-lighten-1 {
    background-color: #e0f2f1;
    color: #00695c;
  }

  &.red-lighten-1 {
    background-color: #ffcdd2;
    color: #c62828;
  }

  &.grey-lighten-2 {
    background-color: #f5f5f5;
    color: #424242;
  }
}

/* 部門備註樣式 */
.department-note-cell {
  transition: all 0.2s ease;
}

.department-note-text {
  margin: 8px 0;
  background: #fcfdff;
  border: 1px solid #B0BEC5;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  color: #546E7A;
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

.department-note-text.clickable {
  cursor: pointer;
}

.department-note-text.clickable:hover {
  background: #ECEFF1;
  border-color: #B0BEC5;
}

.department-note-text.disabled {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #9e9e9e;
}
</style>
