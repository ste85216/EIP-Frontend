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
          </div>
          <v-divider class="mt-5 mb-6" />
          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-10">
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
                  <td>{{ formatDate(item.applicationDate) }}</td>
                  <td>{{ item.applicant?.name }} ({{ item.applicant?.employeeCode }})</td>
                  <td>{{ getProductTypeText(item.productType) }}</td>
                  <td>
                    <v-menu max-height="320">
                      <template #activator="{ props }">
                        <v-chip
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
                    <v-menu max-height="320">
                      <template #activator="{ props }">
                        <v-btn
                          v-if="item.assignedDesigner"
                          v-bind="props"
                          color="blue-darken-1"
                          variant="outlined"
                          class="px-3"
                          size="small"
                          :loading="updatingDesigners.has(item._id)"
                        >
                          {{ item.assignedDesigner.name }}
                          <v-icon
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
                        >
                          尚未指派
                          <v-icon
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
                          :key="designer.value"
                          @click="updateAssignedDesigner(item._id, designer.value)"
                        >
                          <v-list-item-title>{{ designer.label }}</v-list-item-title>
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
                    <v-btn
                      v-tooltip:top="'查看詳細資訊'"
                      icon
                      variant="text"
                      size="small"
                      color="info"
                      class="me-2"
                      @click="openViewDialog(item)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-tooltip:top="'編輯申請單'"
                      icon
                      variant="text"
                      size="small"
                      color="light-blue-darken-2"
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
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-1 mb-2 bg-light-blue-darken-2">
          <span class="card-title">編輯申請單</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
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

              <!-- 產物類型選擇 -->
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
                  label="* 產物類型"
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

                <!-- 動態表單欄位 -->
                <template v-if="formFields.length > 0">
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
                      <div v-if="editFormData[field.name] && editFormData[field.name].length > 0">
                        <div class="d-flex flex-column">
                          <div
                            v-for="(file, idx) in editFormData[field.name]"
                            :key="idx"
                            class="d-flex align-center mb-2 px-2 py-2 rounded-sm"
                            style="border: 1px solid #a9a9a9;"
                          >
                            <v-icon
                              size="small"
                              class="me-2"
                              :color="isImageFile(file) ? 'blue' : 'grey'"
                            >
                              {{ isImageFile(file) ? 'mdi-image' : 'mdi-file' }}
                            </v-icon>
                            <span class="text-grey-darken-1 me-2 flex-grow-1">{{ getFileName(file) }}</span>
                            <!-- 圖片預覽 -->
                            <!-- <v-btn
                              v-if="isImageFile(file)"
                              icon
                              size="small"
                              color="blue"
                              variant="text"
                              class="me-1"
                              @click="openLightbox(editFormData[field.name], idx)"
                            >
                              <v-icon>mdi-eye</v-icon>
                            </v-btn> -->
                            <!-- 下載按鈕
                            <v-btn
                              icon
                              size="small"
                              color="green"
                              variant="text"
                              @click="downloadFile(file)"
                            >
                              <v-icon>mdi-download</v-icon>
                            </v-btn> -->
                          </div>
                          <!-- 批量下載按鈕 -->
                          <!-- <v-btn
                            color="teal-darken-1"
                            variant="outlined"
                            size="small"
                            prepend-icon="mdi-download-multiple"
                            class="mt-2"
                            @click="downloadAllFiles(editFormData[field.name])"
                          >
                            下載所有檔案
                          </v-btn> -->
                        </div>
                      </div>
                      <div
                        v-else
                        class="text-grey"
                      >
                        ( 無 )
                      </div>
                    </div>

                    <!-- 下拉選單欄位 -->
                    <v-select
                      v-else-if="field.type === 'select'"
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
                      v-else-if="field.type === 'checkbox'"
                      v-model="editFormData[field.name]"
                      :label="field.label"
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
            @click="closeEditDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="light-blue-darken-1"
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
        <v-card-title class="d-flex align-center px-6 py-1 bg-light-blue-darken-2">
          <span class="card-title">申請單詳細資訊</span>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            color="white"
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
                      <span class="sub-card-title font-weight-bold text-blue-grey-darken-1">產物類型</span>
                    </div>
                    <div class="text-body-2">
                      {{ viewFormData.productType ? getProductTypeText(viewFormData.productType) : '( 無 )' }}
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
                  color="primary"
                  class="me-2"
                />
                <span class="text-primary card-title">申請資訊</span>
              </div>
              <v-row>
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
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// 頁面定義
definePage({
  meta: {
    title: '行銷美編需求申請管理 | GInternational',
    login: true,
    roles: [UserRole.MARKETING, UserRole.ADMIN, UserRole.DESIGNER, UserRole.MANAGER]
  }
})

const { api, apiAuth } = useApi()
const createSnackbar = useSnackbar()

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
  { title: '產物類型', key: 'productType', sortable: false },
  { title: '狀態', key: 'status', sortable: true },
  { title: '處理人員', key: 'assignedDesigner.name', align: 'center', sortable: false },
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
const formFields = ref([])
const visibleFormFields = computed(() => formFields.value)
const productTypeConfig = ref(null)
const employees = ref([])
const marketingDesigners = ref([])
const productTypeOptions = ref([])
const searchCriteria = reactive({
  applicationDate: [],
  applicant: '',
  productType: '',
  status: '',
  assignedDesigner: ''
})

// 新增查看對話框相關變數
const viewDialog = reactive({ show: false })
const viewFormData = reactive({})
const viewFormFields = ref([])

// 計算屬性：過濾顯示的欄位
const visibleViewFormFields = computed(() => {
  return viewFormFields.value
})

// 新增 basePath 變數，取得 Vite 的 base 路徑
const basePath = import.meta.env.BASE_URL || '/'

const resetSearch = () => {
  searchCriteria.applicationDate = []
  searchCriteria.applicant = ''
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
    const { data } = await api.get('/marketing/design-requests', { params })
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
    const { data } = await api.get('/marketing/design-requests/product-types')
    if (data.success) {
      productTypeOptions.value = data.result.flatMap(category =>
        category.items.map(item => ({ value: item.value, label: `${category.category} - ${item.label}` }))
      )
    }
  } catch {
    // 忽略錯誤
  }
}

const fetchEmployees = async () => {
  try {
    const { data } = await api.get('/employees/active')
    if (data.success) employees.value = data.result
  } catch {
    // 忽略錯誤
  }
}

const fetchMarketingDesigners = async () => {
  try {
    const { data } = await api.get('/employees/marketing-design')
    if (data.success) marketingDesigners.value = data.result
  } catch {
    // 忽略錯誤
  }
}

const customFilter = (item, queryText) => {
  const textToSearch = queryText.toLowerCase()
  const itemText = item.raw.label.toLowerCase()
  return itemText.includes(textToSearch)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const getProductTypeText = (type) => {
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
  if (!files || files.length === 0) return

  createSnackbar({
    text: '正在打包檔案，請稍候...',
    snackbarProps: { color: 'teal-lighten-1' }
  })

  const zip = new JSZip()
  await Promise.all(files.map(async (fileUrl) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      zip.file(getFileName(fileUrl), blob)
    } catch {
      // 可選：處理下載失敗
    }
  }))

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, '所有檔案.zip')
}

const openEditDialog = async (item) => {
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

  // 行程陣列中的 departureDate 是字串類型，不需要轉換
  // 但如果有其他日期欄位需要處理，可以在這裡添加

  Object.assign(editFormData, processedItem)

  // 修正申請人只存 id
  if (item.applicant && typeof item.applicant === 'object') {
    editFormData.applicant = item.applicant._id || item.applicant.value
  }

  await fetchProductTypeFields(item.productType)
}

const closeEditDialog = () => {
  editDialog.show = false
  Object.keys(editFormData).forEach(key => delete editFormData[key])
}

const fetchProductTypeFields = async (productType) => {
  try {
    const { data } = await api.get(`/marketing/design-requests/product-types/${productType}/fields`)
    if (data.success) {
      formFields.value = [
        ...(data.result.fields || []),
        ...(data.result.required || []),
        ...(data.result.optional || []),
        ...(data.result.conditional || [])
      ]
      productTypeConfig.value = data.result
    }
  } catch {
    // 忽略錯誤
  }
}

const confirmEditSubmit = async () => {
  const { valid } = await editForm.value.validate()
  if (!valid) return
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

    const { data } = await apiAuth.patch(`/marketing/design-requests/${editFormData._id}`, submitData)
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

  try {
    const currentItem = tableItems.value.find(item => item._id === designRequestId)

    // 檢查狀態是否相同
    if (currentItem.status === newStatus) {
      createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
      return
    }

    updatingStatus.value.add(designRequestId)

    const { data } = await apiAuth.patch(`/marketing/design-requests/${designRequestId}`, {
      status: newStatus
    })

    if (data.success) {
      // 更新本地資料
      currentItem.status = newStatus
      createSnackbar({ text: '狀態更新成功', snackbarProps: { color: 'teal-lighten-1' } })
    }
  } catch (error) {
    console.error('更新狀態失敗:', error)
    createSnackbar({ text: error?.response?.data?.message || '更新狀態失敗', snackbarProps: { color: 'red-lighten-1' } })
  } finally {
    updatingStatus.value.delete(designRequestId)
  }
}

const openViewDialog = async (item) => {
  viewDialog.show = true

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

  // 行程陣列中的 departureDate 是字串類型，不需要轉換
  // 但如果有其他日期欄位需要處理，可以在這裡添加

  Object.assign(viewFormData, processedItem)

  // 修正申請人只存 id
  if (item.applicant && typeof item.applicant === 'object') {
    viewFormData.applicant = item.applicant._id || item.applicant.value
  }

  await fetchViewProductTypeFields(item.productType)
}

const closeViewDialog = () => {
  viewDialog.show = false
  Object.keys(viewFormData).forEach(key => delete viewFormData[key])
}

const fetchViewProductTypeFields = async (productType) => {
  try {
    const { data } = await api.get(`/marketing/design-requests/product-types/${productType}/fields`)
    if (data.success) {
      viewFormFields.value = [
        ...(data.result.fields || []),
        ...(data.result.required || []),
        ...(data.result.optional || []),
        ...(data.result.conditional || [])
      ]
    }
  } catch {
    // 忽略錯誤
  }
}

// 格式化時間
const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
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

// 取得顯示標籤（查看詳細資訊時移除必填標記）
const getDisplayLabel = (label) => {
  if (!label) return ''
  // 在查看詳細資訊時移除 "* " 前綴
  return label.replace(/^\*\s*/, '')
}

// 截斷過長的檔名
const truncateFileName = (name, length = 15) => {
  if (name.length <= length) {
    return name
  }
  return `${name.substring(0, length)}...`
}

// 下載檔案
const downloadFile = (filePath) => {
  if (!filePath) return

  try {
    const link = document.createElement('a')
    link.href = filePath
    link.download = getFileName(filePath)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch {
    // 忽略錯誤
  }
}

onMounted(() => {
  fetchProductTypes()
  fetchEmployees()
  fetchMarketingDesigners()
  fetchTableData()
})
</script>

<style scoped>
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
  background: rgba(0, 0, 0, 0.95) !important;
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
</style>
