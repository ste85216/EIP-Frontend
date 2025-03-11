<template>
  <v-container
    max-width="1920"
    min-width="1700"
    height="100%"
    class="overflow-x-scroll"
  >
    <v-row>
      <v-col
        cols="12"
        md="5"
        class="pe-7 pe-md-2"
      >
        <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 ms-sm-4 mb-4 bg-white">
          <v-col
            cols="12"
            class="pa-0 mb-4"
          >
            <div class="d-flex align-center justify-space-between mb-4 px-4 pt-4">
              <v-row>
                <v-col
                  cols="6"
                  md="12"
                  lg="6"
                  class="d-flex align-center"
                >
                  <h3 class="d-inline me-2">
                    表單產生器
                  </h3>
                  <v-icon
                    v-if="smAndUp"
                    v-tooltip:top="'選擇表單模板後，將出現該表單資料欄位'"
                    icon="mdi-information"
                    size="small"
                    class="me-3"
                    color="blue-grey-darken-2"
                  />
                </v-col>
                <v-col
                  cols="6"
                  md="12"
                  lg="6"
                  class="d-flex align-center justify-end gap-2"
                >
                  <v-btn
                    v-if="user.isAdmin || user.isSuperAdmin"
                    color="blue-grey-darken-1"
                    variant="outlined"
                    prepend-icon="mdi-file-cog"
                    :size="buttonSize"
                    @click="openTemplateDialog"
                  >
                    模板管理
                  </v-btn>
                  <v-btn
                    color="red-darken-1"
                    variant="outlined"
                    prepend-icon="mdi-swap-horizontal"
                    :size="buttonSize"
                    class="ms-2"
                    :disabled="isAdding"
                    @click="startNewForm"
                  >
                    新增模式
                  </v-btn>
                  <v-btn
                    color="blue-grey-darken-1"
                    variant="outlined"
                    prepend-icon="mdi-history"
                    :size="buttonSize"
                    class="ms-2"
                    @click="openHistoryDialog"
                  >
                    表單紀錄
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-row class="mt-2">
                    <v-col
                      cols="6"
                      class="d-flex align-center ps-3"
                    >
                      <v-select
                        v-model="selectedType"
                        :items="templateTypeOptions"
                        label="選擇表單類型"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details
                        :disabled="!isAdding || isEditing"
                        @update:model-value="loadFormTemplateOptions"
                      />
                    </v-col>
                    <v-col
                      cols="6"
                      class="d-flex align-center ps-3"
                    >
                      <v-select
                        v-model="selectedTemplate"
                        :items="templateOptions"
                        label="選擇表單模板"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details
                        :disabled="!isAdding || !selectedType || isEditing"
                        :hint="templateOptions.length === 0 ? '無可用的表單模板' : ''"
                        persistent-hint
                        @update:model-value="handleTemplateChange"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <!-- 表單欄位區域 -->
          <!-- 1. 銳皇專案報價單 -->
          <v-col
            v-if="currentTemplate && selectedTemplate && currentTemplate === templateComponents.RayHuangQuotationTemplate.preview"
            cols="12"
          >
            <v-row>
              <v-col cols="12">
                <!-- 報價單表單 -->
                <v-card elevation="0">
                  <v-card-text class="px-0 pt-0 pb-2">
                    <RayHuangQuotationFormFields
                      ref="formFieldsRef"
                      v-model="formData"
                      :validate="enableValidation"
                      :is-viewing="isViewing"
                      :disabled="isViewing"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
          <!-- 2. 永信旅遊報價單 -->
          <v-col
            v-if="currentTemplate && selectedTemplate && currentTemplate === templateComponents.YstravelQuotationTemplate.preview"
            cols="12"
          >
            <v-row>
              <v-col cols="12">
                <!-- 報價單表單 -->
                <v-card elevation="0">
                  <v-card-text>
                    <YstravelQuotationFormFields
                      ref="formFieldsRef"
                      v-model="formData"
                      :validate="enableValidation"
                      :is-viewing="isViewing"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- 添加載入中的顯示 -->
          <v-col
            v-if="isTemplateLoading"
            cols="12"
          >
            <v-row>
              <v-col cols="12">
                <v-card
                  elevation="0"
                >
                  <v-card-text>
                    <div
                      class="d-flex flex-column align-center justify-center"
                      style="min-height: 121px;"
                    >
                      <v-progress-circular
                        indeterminate
                        color="deep-purple-darken-2"
                        size="32"
                      />
                      <div class="mt-4 text-grey font-weight-medium">
                        載入表單欄位中...
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        clos="12"
        md="7"
        class="ps-md-4"
      >
        <v-row
          class="elevation-4 rounded-lg pt-4 pb-3 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-3 mb-4 bg-white"
          style="min-width: 900px; min-height: 216px;"
        >
          <v-col cols="12">
            <div class="card-title px-6 pt-6 text-grey-darken-3 d-flex justify-space-between">
              <div>
                《 預覽及匯出 》
                <span class="text-grey font-weight-medium">
                  (&nbsp; {{ 
                    isViewing ? '查閱模式' : 
                    isEditing ? '編輯模式' : 
                    '新增模式' 
                  }}&nbsp; )
                </span>
              </div>
              <div>
                <v-btn
                  v-if="!isViewing"
                  class="me-4"
                  color="teal-darken-1"
                  :disabled="!previewReady"
                  :loading="isSaving"
                  @click="isEditing ? updateForm() : submitForm()"
                >
                  {{ isEditing ? '儲存' : '新增' }}
                </v-btn>
                <v-btn
                  color="red-darken-1"
                  prepend-icon="mdi-file-pdf-box"
                  :disabled="!previewReady"
                  :loading="isExportingPDF"
                  class="me-4"
                  @click="handleExportPDF"
                >
                  匯出
                </v-btn>
                <v-btn
                  color="deep-orange-darken-1"
                  :loading="isExportingReport"
                  prepend-icon="mdi-file-export"
                  @click="openReportDialog"
                >
                  匯出報表
                </v-btn>
              </div>
            </div>
            <v-divider class="mt-8 mx-6" />
            <v-card
              elevation="0"
              min-width="681"
            >
              <v-card-text
                v-if="!previewReady"
                style="font-size: 15px; font-weight: 600;"
                class="text-center text-grey font-weight-medium pa-0 pt-9 pb-3"
              >
                <template v-if="isTemplateLoading">
                  <div
                    class="d-flex flex-column align-center justify-center"
                    style="min-height: 200px;"
                  >
                    <v-progress-circular
                      indeterminate
                      color="deep-purple-darken-2"
                      size="32"
                    />
                    <div class="mt-4">
                      載入表單預覽畫面中...
                    </div>
                  </div>
                </template>
                <template v-else>
                  ( 請 先 選 擇 表 單 模 版 )
                </template>
              </v-card-text>
              <v-card-text v-if="previewReady">
                <component
                  :is="currentTemplate"
                  ref="templateRef"
                  :form-data="formData"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 表單模板管理話框 -->
    <v-dialog
      v-model="templateDialog.open"
      persistent
      max-width="880"
    >
      <v-card class="rounded-lg px-8 py-4">
        <div class="card-title px-2 pb-2 d-flex justify-space-between align-center">
          表單模板管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeTemplateDialog"
          />
        </div>
        <v-card-text class="ps-2 ">
          <v-row class="">
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3">
                  現有表單模板
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="6"
                >
                  <v-select
                    v-model="dialogSelectedType"
                    :items="templateTypeOptions"
                    label="表單類型"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    clearable
                    class="mb-1"
                  />
                </v-col>
              </v-row>

              <div class="mb-8">
                <v-chip
                  v-for="template in filteredTemplates"
                  :key="template._id"
                  class="me-4 mb-2 pa-4 pe-1"
                  color="blue-grey-darken-2"
                  label
                >
                  {{ template.name }}
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        class="ms-2"
                        :ripple="false"
                        color="white"
                        v-bind="props"
                      >
                        <v-icon color="cyan-darken-3">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openEditTemplate(template)"
                      >
                        <v-icon
                          icon="mdi-pencil"
                          size="16"
                          color="light-blue-darken-4"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >編輯</span>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        color="red-lighten-1"
                        @click="confirmDeleteTemplate(template)"
                      >
                        <v-icon
                          icon="mdi-delete"
                          size="16"
                          color="red-lighten-1"
                        />
                        <span
                          style="font-size: 14px;"
                          class="ps-2 text-blue-grey-darken-2"
                        >刪除</span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增表單模板
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitTemplate">
                <v-row>
                  <v-col
                    cols="12"
                    class="pb-2"
                  >
                    <v-select
                      v-model="templateForm.type"
                      :items="templateTypeOptions"
                      label="表單類型*"
                      item-title="title"
                      item-value="value"
                      :error-messages="templateErrors.type"
                      variant="outlined"
                      clearable
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="templateForm.name"
                      :error-messages="templateErrors.name"
                      label="表單名稱*"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="templateForm.componentName"
                      :error-messages="templateErrors.componentName"
                      label="組件名稱*"
                      placeholder="例如: RayHuangQuotationTemplate"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>
                <v-card-actions class="pa-0 mt-2">
                  <v-spacer />

                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    size="small"
                    :loading="isSubmitting"
                    class="ms-2"
                  >
                    新增
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 編輯表單模板對話框 -->
    <v-dialog
      v-model="editTemplateDialog.open"
      persistent
      width="360"
    >
      <v-card class="rounded-lg pa-4">
        <div class="card-title ps-5 py-3">
          編輯表單模板
        </div>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="submitEditTemplate">
            <v-select
              v-model="editTemplateDialog.type"
              :items="templateTypeOptions"
              label="表單類型*"
              item-title="title"
              item-value="value"
              :error-messages="editTemplateErrors.type"
              variant="outlined"
              density="compact"
              class="mb-4"
              clearable
            />
            <v-text-field
              v-model="editTemplateDialog.name"
              :error-messages="editTemplateErrors.name"
              label="表單名稱*"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-text-field
              v-model="editTemplateDialog.componentName"
              :error-messages="editTemplateErrors.componentName"
              label="組件名稱*"
              required
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-card-actions class="pa-0 mt-4">
              <v-spacer />
              <v-btn
                color="grey"
                variant="outlined"
                @click="closeEditTemplateDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="isSubmitting"
                class="ms-2"
              >
                修改
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 表單模板刪除確認對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteTemplateDialog.open"
      title="確認刪除表單模板"
      :message="`確定要刪除表單模板「<span class='text-pink-lighten-1' style='font-weight: 800;'>${deleteTemplateDialog.name}</span>」嗎？此操作無法復原`"
      :expected-name="deleteTemplateDialog.name"
      input-label="表單模板名稱"
      @confirm="deleteTemplate"
    />

    <!-- 表單歷史紀錄對話框 -->
    <v-dialog
      v-model="historyDialog.open"
      max-width="1500"
    >
      <v-card
        class="rounded-lg pa-4 "
        min-height="920"
      >
        <div class="d-flex justify-space-between align-center ps-6 pb-2">
          <div class="card-title">
            表單歷史紀錄
          </div>
          <v-btn
            icon
            color="red-lighten-1"
            variant="plain"
            @click="closeHistoryDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text>
          <!-- 在原有搜尋條件的上方添加快速搜尋 -->

          <div class="border rounded-lg px-4 py-4">
            <v-row>
              <v-col cols="12">
                <!-- 原有的搜尋條件保持不變 -->
                <v-row>
                  <v-col cols="3">
                    <v-select
                      v-model="historySearch.type"
                      :items="templateTypeOptions"
                      label="表單類型"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      clearable
                      @update:model-value="loadTemplateOptions"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    class="pb-0"
                  >
                    <v-select
                      v-model="historySearch.formTemplate"
                      :items="historyTemplateOptions"
                      label="表單模板"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      clearable
                      :disabled="!historySearch.type"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    class="pb-0"
                  >
                    <v-date-input
                      v-model="historySearch.date"
                      label="創建日期區間"
                      variant="outlined"
                      density="compact"
                      prepend-icon
                      clearable
                      multiple="range"
                      :ok-text="'確認'"
                      :cancel-text="'取消'"
                    />
                  </v-col>
                  <v-col 
                    cols="3"
                    class="pb-0"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-btn
                          color="blue-grey-darken-1"
                          block
                          class="me-3"
                          @click="resetHistorySearch"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cos="6">
                        <v-btn
                          color="cyan-darken-2"
                          block
                          :loading="isSearching"
                          :disabled="isSearching"
                          @click="searchHistory"
                        >
                          搜尋
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- 按鈕 -->
            <v-row class="mt-0" />
          </div>
          <v-row>
            <v-col
              cols="12"
              sm="4"
              lg="3"
              class="ms-auto mt-6 ps-0 d-flex align-center"
            >
              <v-icon
                v-tooltip:start="'可搜尋單號、客戶名稱、專案名稱、項目'"
                size="20"
                color="blue-grey-darken-2"
                class="me-2"
              >
                mdi-information
              </v-icon>
              <v-text-field
                v-model="historyQuickSearch"
                label="快速搜尋"
                append-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
          </v-row>
          <!-- 歷紀錄列表 -->
          <v-table class="rounded-lg mt-6">
            <thead class="bg-blue-grey-darken-2">
              <tr>
                <th style="height: 36px;">
                  表單模板名稱
                </th>
                <th style="height: 36px;">
                  單號
                </th>
                <th style="height: 36px;">
                  客戶名稱
                </th>
                <th style="height: 36px;">
                  專案名稱
                </th>
                <th style="height: 36px;">
                  創建日期
                </th>
                <th style="height: 36px;">
                  創建者
                </th>
                <th style="height: 36px;">
                  最後編輯者
                </th>
                <th
                  class="text-center"
                  style="height: 36px;"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="history in histories"
                :key="history._id"
              >
                <td>{{ history?.formTemplate?.name || '未知模板' }}</td>
                <td>{{ history?.formNumber || '-' }}</td>
                <td>{{ history?.clientName || '-' }}</td>
                <td>{{ history?.projectName || '-' }}</td>
                <td>{{ formatDate(history?.createdAt) }}</td>
                <td>{{ history?.creator?.name || '未知' }} {{ history?.creator?.role === 2 ? `(${history?.creator?.adminId})` : `(${history?.creator?.userId})` }}</td>
                <td>{{ history?.lastEditor?.name || '未知' }} {{ history?.lastEditor?.role === 2 ? `(${history?.lastEditor?.adminId})` : `(${history?.lastEditor?.userId})` }}</td>
                <td class="text-center">
                  <v-btn
                    v-if="(() => {
                      const currentId = user.isAdmin ? user.adminId : user.userId
                      const creatorId = history.creator?.role === 2 ? history.creator?.adminId : history.creator?.userId
                      return creatorId === currentId || user.role === 1 || user.role === 2
                    })()"
                    v-tooltip="'編輯表單'"
                    icon
                    variant="plain"
                    color="light-blue-darken-2"
                    :loading="isEditingLoading"
                    @click="editHistory(history)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-tooltip="'查閱表單'"
                    icon
                    variant="plain"
                    color="teal-lighten-1"
                    :loading="isViewingLoading"
                    @click="viewForm(history)"
                  >
                    <v-icon>mdi-book-open-variant-outline</v-icon>
                  </v-btn>
                  <template
                    v-if="(() => {
                      const currentId = user.isAdmin ? user.adminId : user.userId
                      const creatorId = history.creator?.role === 2 ? history.creator?.adminId : history.creator?.userId
                      return creatorId === currentId || user.role === 1 || user.role === 2
                    })()"
                  >
                    <v-btn
                      icon
                      variant="plain"
                      color="red-lighten-1"
                      :loading="deletingFormId === history._id"
                      :disabled="deletingFormId === history._id"
                      @click="deleteHistory(history)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </td>
              </tr>
              <tr v-if="!histories.length">
                <td
                  colspan="7"
                  class="text-center"
                >
                  沒有資料
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- 添加分頁控制 -->
          <div class="d-flex justify-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              size="32"
              rounded="circle"
              @update:model-value="handlePageChange"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 表單歷史紀錄確認刪除對話框 -->
    <ConfirmDeleteDialog
      v-model="confirmDeleteDialog.open"
      :dialog-width="'320'"
      title="確認刪除表單"
      :message="`確定要刪除表單「${confirmDeleteDialog.templateName} ${confirmDeleteDialog.formNumber}」嗎？此操作無法恢復。`"
      @confirm="confirmDelete"
    />

    <ConfirmDeleteDialog
      v-model="confirmDialogOpen"
      :dialog-width="'310'"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :confirm-button-text="confirmDialogConfirmText"
      :cancel-button-text="confirmDialogCancelText"
      :confirm-button-color="'teal-lighten-1'"
      @confirm="handleConfirm"
    />

    <v-overlay
      v-model="showProgressOverlay"
      class="align-center justify-center"
      persistent
      opacity="1"
      scrim="#fff"
    >
      <v-card
        color="white"
        width="300"
        class="px-6 py-8"
        elevation="0"
      >
        <div class="text-center mb-6">
          <v-progress-circular
            :model-value="downloadProgress"
            color="deep-purple-darken-2"
            size="120"
            width="14"
          >
            {{ Math.round(downloadProgress) }} %
          </v-progress-circular>
        </div>
        <div class="text-center sub-title font-weight-medium mt-6">
          正在匯出 PDF...
        </div>
      </v-card>
    </v-overlay>

    <v-dialog
      v-model="exportOptionsDialogOpen"
      max-width="300"
    >
      <v-card class="px-4 py-4 rounded-lg">
        <v-card-title class="card-title">
          選擇匯出內容
        </v-card-title>
        <v-card-text class="pb-0 px-3">
          <v-radio-group v-model="exportOption">
            <v-radio
              label="報價單"
              value="quotation"
              color="deep-purple-darken-2"
            />
            <v-radio
              label="合約書"
              value="contract"
              color="deep-purple-darken-2"
            />
            <v-radio
              label="報價單 + 合約書"
              value="both"
              color="deep-purple-darken-2"
              hide-details
            />
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            text
            variant="outlined"
            size="small"
            @click="exportOptionsDialogOpen = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            text
            variant="outlined"
            size="small"
            @click="confirmExportPDF"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 匯出報表對話框 -->
    <v-dialog
      v-model="reportDialog.open"
      persistent
      width="320"
    >
      <v-card class="rounded-lg py-3 px-2">
        <v-card-title class="card-title px-6 py-3 mb-2">
          匯出報表
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-form @submit.prevent="handleExportReport">
            <v-select
              v-model="reportDialog.type"
              :items="templateTypeOptions"
              label="表單類型"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              class="mb-4"
              :error-messages="reportDialog.typeError"
              clearable
              @update:model-value="loadReportTemplateOptions"
            />

            <v-select
              v-model="reportDialog.template"
              :items="reportTemplateOptions"
              label="表單模板"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              class="mb-4"
              :error-messages="reportDialog.templateError"
              :disabled="!reportDialog.type"
              clearable
            />

            <v-date-input
              v-model="reportDialog.dateRange"
              label="報價日期區間"
              variant="outlined"
              density="compact"
              multiple="range"
              prepend-icon
              clearable
              class="mb-4"
              :cancel-text="'取消'"
              :ok-text="'確認'"
              :error-messages="reportDialog.dateError"
            />

            <v-card-actions class="pa-0">
              <v-spacer />
              <v-btn
                color="grey"
                variant="outlined"
                @click="closeReportDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :loading="isExportingReport"
                class="ms-2"
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
import { ref, shallowRef, computed, watch, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'
import UserRole from '@/enums/UserRole'
import { definePage } from 'vue-router/auto'
import { useUserStore } from '@/stores/user'
import { useDisplay } from 'vuetify'
import { debounce } from 'lodash'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// 動態引入重量級組件
const RayHuangQuotationTemplate = defineAsyncComponent(() => 
  import('@/components/templates/RayHuangQuotationTemplate/index.vue')
)
const RayHuangQuotationFormFields = defineAsyncComponent(() => 
  import('@/components/templates/RayHuangQuotationTemplate/RayHuangQuotationFormFields.vue')
)
const YstravelQuotationTemplate = defineAsyncComponent(() => 
  import('@/components/templates/YstravelQuotationTemplate/index.vue')
)
const YstravelQuotationFormFields = defineAsyncComponent(() => 
  import('@/components/templates/YstravelQuotationTemplate/YstravelQuotationFormFields.vue')
)

// 動態引入 schema
const rayHuangQuotationSchema = ref(null)
const ystravelQuotationSchema = ref(null)

// 動態引入 PDF 相關庫
const html2pdf = ref(null)
const jsPDF = ref(null)
const html2canvas = ref(null)

// 初始化函數
const initDependencies = async () => {
  try {
    // 載入 schema
    const rayHuangSchema = await import('@/components/templates/RayHuangQuotationTemplate/schema')
    const ystravelSchema = await import('@/components/templates/YstravelQuotationTemplate/schema')
    rayHuangQuotationSchema.value = rayHuangSchema.quotationSchema
    ystravelQuotationSchema.value = ystravelSchema.quotationSchema

    // 載入 PDF 相關庫
    const html2pdfModule = await import('html2pdf.js')
    const jsPDFModule = await import('jspdf')
    const html2canvasModule = await import('html2canvas')
    
    html2pdf.value = html2pdfModule.default
    jsPDF.value = jsPDFModule.jsPDF
    html2canvas.value = html2canvasModule.default
  } catch (error) {
    console.error('載入相依套件失敗:', error)
    createSnackbar({
      text: '載入相依套件失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

definePage({
  meta: {
    title: '表單產生器 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]
  }
})

const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 基本響應式變數
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const selectedTemplate = ref(null)
const selectedType = ref(null)
const templateOptions = ref([])
const templateRef = ref(null)
const formFieldsRef = ref(null)
const deletingFormId = ref('')

// 模板相關
const currentTemplate = shallowRef(null)
const previewReady = ref(false)
const isTemplateLoading = ref(false)
const enableValidation = ref(false)

// 模板組映射
const templateComponents = {
  RayHuangQuotationTemplate: {
    preview: RayHuangQuotationTemplate,
    fields: RayHuangQuotationFormFields,
    schema: rayHuangQuotationSchema
  },
  YstravelQuotationTemplate: {
    preview: YstravelQuotationTemplate,
    fields: YstravelQuotationFormFields,
    schema: ystravelQuotationSchema
  }
}

// 表單類型選項
const templateTypeOptions = [
  { title: '報價單', value: 'quotation' }
  // { title: '請購單', value: 'purchase' },
  // { title: '請假單', value: 'leave' }
]

// 表單資料
const formData = ref({})

// 重置表單資料
const resetFormData = (templateType) => {
  switch (templateType) {
    case 'RayHuangQuotationTemplate':
      formData.value = {
        date: new Date(),
        customerName: '',
        customerAddress: '',
        customerTaxId: '',
        customerContact: '',
        customerDepartment: '',
        customerPhone: '',
        customerEmail: '',
        customerMobile: '',
        projectType: '',
        projectName: '',
        workDays: '',
        specialNote: '',
        validityDays: '',
        delayDays: '',
        includeContract: false,
        currentPage: 'quotation',
        items: [
          {
            name: '',
            description: '',
            workDays: '',
            quantity: 1,
            unit: '份',
            price: ''
          }
        ],
        contract: {
          page1: {
            partyA: '',
            partyB: '鋭皇國際股份有限公司',
            projectName: '',
            totalAmount: '',
            estimatedWorkDays: 'X',
            contractYear: '',
            contractMonth: '',
            contractDay: '',
            depositAmount: '',
            paymentMethod: {
              singlePayment: false,
              singlePaymentDate: {
                year: '',
                month: '',
                day: ''
              },
              deposit: false,
              depositAmount: '',
              depositDate: {
                year: '',
                month: '',
                day: ''
              },
              finalPaymentAmount: '',
              finalPaymentDate: {
                year: '',
                month: '',
                day: ''
              }
            },
            paymentType: {
              cash: false,
              transfer: false,
              check: false,
              checkDate: {
                year: '',
                month: '',
                day: ''
              }
            }
          },
          page2: {
            designProposalCount: '',
            responseDay: '',
            designRevisionCount: '',
            printRevisionCount: '',
            providedItems: ''
          },
          page3: {
            otherAgreements: '',
            partyA: {
              companyName: '',
              representative: '',
              address: '',
              phone: '',
              taxId: ''
            },
            partyB: {
              companyName: '鋭皇國際股份有限公司',
              representative: '陳淑貞',
              address: '10467 台北市中山區松江路 220 號 4 樓之 5',
              phone: '02-25623385',
              taxId: '83213438'
            }
          }
        }
      }
      break
    
    case 'YstravelQuotationTemplate':
      formData.value = {
        date: new Date(),
        
        // 客戶資訊
        customerName: '',
        customerAddress: '',
        customerTaxId: '',
        contactPerson: '',
        position: '',
        officePhone: '',
        fax: '',
        mobile: '',
        
        // 旅遊資訊
        projectName: '',
        destination: '',
        departureDate: new Date(),
        returnDate: new Date(),
        
        // 報價明細
        items: [
          {
            category: '',
            description: '',
            unitPrice: 0,
            quantity: 1,
            unit: '人',
            remark: ''
          }
        ],
        
        // 備註
        cancellationPolicy: '',
        validityPeriod: 7,

        // 重置合約相關欄位
        includeContract: false,
        currentPage: 'quotation',
        contract: null
      }
      break
    
    default:
      formData.value = {
        includeContract: false,
        currentPage: 'quotation',
        contract: null
      }
  }
}

// 表單模板管理相關
const templateDialog = ref({
  open: false
})

const editTemplateDialog = ref({
  open: false,
  id: '',
  name: '',
  type: '',
  componentName: ''
})

const deleteTemplateDialog = ref({
  open: false,
  id: '',
  name: ''
})

const templateForm = ref({
  name: '',
  type: '',
  componentName: ''
})

const templateErrors = ref({
  type: '',
  name: '',
  componentName: ''
})

const editTemplateErrors = ref({
  name: '',
  type: '',
  componentName: ''
})

const isSubmitting = ref(false)
const formTemplates = ref([])

// 添加新的響應式變數
const dialogSelectedType = ref(null)

// 修改 filteredTemplates 計算屬性
const filteredTemplates = computed(() => {
  if (!dialogSelectedType.value) return formTemplates.value

  return formTemplates.value.filter(template => {
    return template.type === dialogSelectedType.value
  })
})

// 修改 handleTemplateChange 方法
const handleTemplateChange = async (templateId) => {
  if (!templateId) {
    currentTemplate.value = null
    previewReady.value = false
    resetFormData()
    return
  }

  try {
    // 開始載入，顯示載入動畫
    isTemplateLoading.value = true
    // 重置所有狀態
    previewReady.value = false
    currentTemplate.value = null
    enableValidation.value = false
    
    // 獲取模板資訊
    const { data } = await apiAuth.get(`/formTemplates/${templateId}`)
    if (data.success) {
      const template = data.result
      // console.log('選擇的模板:', template)
      const components = templateComponents[template.componentName]
      if (components) {
        try {
          // 先獲取單號，確保有單號才繼續
          let formNumber = null
          
          switch (template.componentName) {
            case 'RayHuangQuotationTemplate': {
              const response = await apiAuth.get('/forms/ray-huang-quotation/next-number', {params: {templateId}})
              if (response.data.success) {
                formNumber = response.data.result
              }
              break
            }
            case 'YstravelQuotationTemplate': {
              const response = await apiAuth.get('/forms/ystravel-quotation/next-number', {params: {templateId}})
              if (response.data.success) {
                formNumber = response.data.result
              }
              break
            }
            default:
              throw new Error('未知的模板類型')
          }

          if (!formNumber) {
            throw new Error('無法取得單號')
          }

          // 先重置表單數據
          resetFormData(template.componentName)
          
          // 然後設置新的單號
          formData.value = { 
            ...formData.value,
            formNumber 
          }

          // 等待資料設置完成
          await nextTick()

          // 設置模板和預覽
          currentTemplate.value = components.preview

          // 再次等待 DOM 更新
          await nextTick()

          // 最後才啟用驗證和顯示內容
          enableValidation.value = true
          previewReady.value = true

        } catch (error) {
          console.error('取得單號失敗:', error)
          createSnackbar({
            text: '取得單號失敗',
            snackbarProps: { color: 'red-lighten-1' }
          })
          throw error // 向上拋出錯誤，讓外層統一處理
        }
      } else {
        throw new Error('找不到對應的組件')
      }
    }
  } catch (error) {
    console.error('載入失敗:', error)
    // 統一的錯誤處理
    currentTemplate.value = null
    resetFormData()
    previewReady.value = false
    createSnackbar({
      text: error.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    // 最後才關閉 loading
    isTemplateLoading.value = false
  }
}

// 添加新的狀態
const isSearching = ref(false)

// 添加分頁相關的響應式變數
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// 添加新的響應式變數
const historyQuickSearch = ref('')

const handlePageChange = (newPage) => {
  currentPage.value = newPage
  searchHistory()
}

// 修改 searchHistory 方法，整合快速搜尋
const searchHistory = async () => {
  if (isSearching.value) return
  isSearching.value = true

  try {
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      sort: 'createdAt',
      order: 'desc'
    }

    // 添加快速搜尋參數
    if (historyQuickSearch.value) {
      params.quickSearch = historyQuickSearch.value
    }

    // 添加原有的搜尋條件
    if (historySearch.value.type) {
      params.type = historySearch.value.type
    }
    if (historySearch.value.formTemplate) {
      params.formTemplate = historySearch.value.formTemplate
    }

    // 處理日期範圍
    if (historySearch.value.date?.length) {
      const startDate = new Date(historySearch.value.date[0])
      startDate.setHours(0, 0, 0, 0)
      params.startDate = startDate.toISOString()

      const endDate = historySearch.value.date.length > 1
        ? new Date(historySearch.value.date[historySearch.value.date.length - 1])
        : new Date(historySearch.value.date[0])
      endDate.setHours(23, 59, 59, 999)
      params.endDate = endDate.toISOString()
    }

    const { data } = await apiAuth.get('/forms', { params })
    if (data.success) {
      histories.value = data.result.data
      totalItems.value = data.result.totalItems
      currentPage.value = data.result.currentPage
    }
  } catch (error) {
    console.error('搜尋失敗:', error)
    createSnackbar({
      text: '載入歷史紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSearching.value = false
  }
}

// 添加防抖的快速搜尋處理
const debouncedHistorySearch = debounce(() => {
  currentPage.value = 1
  searchHistory()
}, 300)

// 監聽快速搜尋的變化
watch(historyQuickSearch, () => {
  debouncedHistorySearch()
})

// 修改重置搜尋方法，加入快速搜尋的重置
const resetHistorySearch = async () => {
  historySearch.value = {
    type: '',
    formTemplate: '',
    date: []
  }
  historyQuickSearch.value = '' // 重置快速搜尋
  historyTemplateOptions.value = []
  currentPage.value = 1
  await searchHistory()
}

// 添加加載狀態的響應式變數
const isSaving = ref(false);
const isExportingPDF = ref(false);

// 修改 updateForm 方法，添加加載狀態
const updateForm = async () => {
  try {
    isSaving.value = true;
    // 確保啟用驗證
    enableValidation.value = true
    
    // 進行表單驗證
    const isValid = await formFieldsRef.value?.validate()
    if (!isValid) {
      createSnackbar({
        text: '請填寫必填欄位',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 發送更新請求
    const { data } = await apiAuth.patch(`/forms/${editingFormId.value}`, {
      formNumber: formData.value.formNumber, // 獨立傳遞 formNumber
      formData: { ...formData.value, formNumber: undefined }, // 移除 formData 中的 formNumber
      lastEditor: user.userId
    })

    if (!data.success) {
      throw new Error(data.message || '更新表單失敗')
    }

    // 重新載入歷史記錄
    await loadHistory()

    createSnackbar({
      text: '表單更新成功',
      snackbarProps: {
        color: 'teal-lighten-1',
      }
    })
  } catch (error) {
    console.error('更新表單失敗:', error)
    const errorMessage = error.response?.data?.message || '更新表單失敗';
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSaving.value = false;
  }
}

const exportOptionsDialogOpen = ref(false);
const exportOption = ref('quotation');

const handleExportPDF = async () => {
  if (formData.value.includeContract) {
    exportOptionsDialogOpen.value = true;
  } else {
    await downloadPDF('quotation');
  }
};

const confirmExportPDF = async () => {
  await downloadPDF(exportOption.value);
  exportOptionsDialogOpen.value = false;
};

// 修改 downloadPDF 方法
const downloadPDF = async (option) => {
  if (isExportingPDF.value) return;

  try {
    isExportingPDF.value = true;
    showProgressOverlay.value = true; // 顯示進度遮罩
    downloadProgress.value = 0; // 初始化進度
    // 確保啟用驗證
    enableValidation.value = true;
    await nextTick();

    // 進行表單驗證
    const isValid = await formFieldsRef.value?.validate();
    if (!isValid) {
      createSnackbar({
        text: '請填寫必填欄位',
        snackbarProps: { color: 'red-lighten-1' }
      });
      return;
    }

    // 獲取當前選擇的表單模板名稱
    const currentTemplate = formTemplates.value.find(t => t._id === selectedTemplate.value);
    if (!currentTemplate) {
      throw new Error('找不到表單模板');
    }
    const templateName = currentTemplate.name;

    // 生成 PDF
    const element = templateRef.value?.$el;
    if (!element) {
      throw new Error('找不到要轉換的元素');
    }

    // console.log('開始生成 PDF');
    const pdfBlob = await generatePDF(element, templateName, option, (progress) => {
      downloadProgress.value = progress;
    });
    // console.log('PDF 生成成功');

    // 直接下載 PDF
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `${templateName}_${formData.value.formNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    createSnackbar({
      text: 'PDF 下載成功',
      snackbarProps: {
        color: 'teal-lighten-1',
      }
    });
  } catch (error) {
    console.error('PDF 下載失敗:', error);
    createSnackbar({
      text: error.message || 'PDF 下載失敗',
      snackbarProps: { color: 'red-lighten-1' }
    });
  } finally {
    isExportingPDF.value = false;
    showProgressOverlay.value = false; // 隱藏進度遮罩
  }
};

// API 相關方法
const loadTemplates = async () => {
  try {
    const { data } = await apiAuth.get('/formTemplates/all')
    if (data.success) {
      formTemplates.value = data.result.data
      templateOptions.value = data.result.data.map(template => ({
        title: template.name,
        value: template._id
      }))

      // 如果沒有模板，顯示提示訊息
      if (templateOptions.value.length === 0) {
        createSnackbar({
          text: '目前沒有任何表單模板',
          snackbarProps: {
            color: 'warning'
          }
        })
      }
    }
  } catch (error) {
    console.error('載入表單模板失敗:', error)
    createSnackbar({
      text: '載入表單模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    // 確保無論如何都清空 loading 狀態
    templateOptions.value = templateOptions.value || []
  }
}

const loadFormTemplateOptions = async () => {
  if (!selectedType.value) {
    templateOptions.value = []
    selectedTemplate.value = null
    return
  }

  try {
    const params = { type: selectedType.value }
    const { data } = await apiAuth.get('/formTemplates/search', { params })
    if (data.success) {
      templateOptions.value = data.result.map(template => ({
        title: template.name,
        value: template._id
      }))
    }
  } catch (error) {
    console.error('載入模板選項失敗:', error)
    createSnackbar({
      text: '載入模板選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 表單模板管理相關方法
const openTemplateDialog = async () => {
  try {
    templateDialog.value.open = true
    // 重置分頁
    templateCurrentPage.value = 1
    // 重置選擇
    dialogSelectedType.value = null
    // 重置表單
    templateForm.value = {
      name: '',
      type: '',
      componentName: ''
    }
    templateErrors.value = {
      type: '',
      name: '',
      componentName: ''
    }

    // 載入第一頁資料
    await loadDialogTemplates()
  } catch (error) {
    console.error('開啟模板管理對話框失敗:', error)
    createSnackbar({
      text: '載入模板資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const closeTemplateDialog = () => {
  templateDialog.value.open = false
  templateForm.value = {
    name: '',
    type: '',
    componentName: ''
  }
  templateErrors.value = {
    type: '',
    name: '',
    componentName: ''
  }
}

const openEditTemplate = (template) => {
  editTemplateDialog.value = {
    open: true,
    id: template._id,
    name: template.name,
    type: template.type,
    componentName: template.componentName
  }
  editTemplateErrors.value = {
    name: '',
    type: '',
    componentName: ''
  }
}

const closeEditTemplateDialog = () => {
  editTemplateDialog.value = {
    open: false,
    id: '',
    name: '',
    type: '',
    componentName: ''
  }
  editTemplateErrors.value = {
    name: '',
    type: '',
    componentName: ''
  }
}

const confirmDeleteTemplate = (template) => {
  deleteTemplateDialog.value = {
    open: true,
    id: template._id,
    name: template.name
  }
}

const submitTemplate = async () => {
  // 重錯誤訊息
  templateErrors.value = {
    type: '',
    name: '',
    componentName: ''
  }

  // 檢查每個欄位
  let hasError = false
  if (!templateForm.value.type) {
    templateErrors.value.type = '請選擇表單類型'
    hasError = true
  }
  if (!templateForm.value.name) {
    templateErrors.value.name = '請輸入表單名稱'
    hasError = true
  }
  if (!templateForm.value.componentName) {
    templateErrors.value.componentName = '請輸入組件名稱'
    hasError = true
  }

  if (hasError) return

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.post('/formTemplates', templateForm.value)
    if (data.success) {
      createSnackbar({
        text: '新增表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 重置表單
      templateForm.value = {
        name: '',
        type: '',
        componentName: ''
      }
      templateErrors.value = {
        type: '',
        name: '',
        componentName: ''
      }
      await loadDialogTemplates()
    }
  } catch (error) {
    console.error('新增失敗:', error.response?.data)
    // 如果是後端回傳的特定欄位錯誤
    if (error.response?.data?.validationError) {
      const validationErrors = error.response.data.validationError
      Object.keys(validationErrors).forEach(key => {
        templateErrors.value[key] = validationErrors[key].message
      })
    } else {
      // 一般錯誤訊息
      createSnackbar({
        text: error.response?.data?.message || '新增失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const submitEditTemplate = async () => {
  // 驗證所有必填欄位
  const errors = {
    name: '',
    type: '',
    componentName: ''
  }

  if (!editTemplateDialog.value.name) errors.name = '請輸入表單名稱'
  if (!editTemplateDialog.value.type) errors.type = '請選擇表單類型'
  if (!editTemplateDialog.value.componentName) errors.componentName = '請輸入組件名稱'

  // 如果有任何錯誤
  if (Object.values(errors).some(error => error)) {
    editTemplateErrors.value = errors
    return
  }

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.patch(`/formTemplates/${editTemplateDialog.value.id}`, {
      name: editTemplateDialog.value.name,
      type: editTemplateDialog.value.type,
      componentName: editTemplateDialog.value.componentName
    })

    if (data.success) {
      createSnackbar({
        text: '修改表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditTemplateDialog()
      await loadDialogTemplates()
    }
  } catch (error) {
    editTemplateErrors.value = {
      name: error.response?.data?.message || '修改失敗',
      type: '',
      componentName: ''
    }
  } finally {
    isSubmitting.value = false
  }
}

const deleteTemplate = async () => {
  try {
    const { data } = await apiAuth.delete(`/formTemplates/${deleteTemplateDialog.value.id}`)
    if (data.success) {
      createSnackbar({
        text: '刪除表單模板成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      // 從本地列表中移除被刪除的模板
      formTemplates.value = formTemplates.value.filter(
        template => template._id !== deleteTemplateDialog.value.id
      )
      // 如果當前選中的模板被刪除，清空選擇
      if (selectedTemplate.value === deleteTemplateDialog.value.id) {
        selectedTemplate.value = null
      }
      // 關閉刪除對話框
      deleteTemplateDialog.value = {
        open: false,
        id: '',
        name: ''
      }
      // 重新載入模板列表
      await loadDialogTemplates()
    }
  } catch (error) {
    let errorMessage = '刪除失敗'
    // 處理特定的錯誤情況
    if (error.response?.status === 409) {
      errorMessage = '此表單模板有表單使用中，無法刪除'
    } else {
      errorMessage = error.response?.data?.message || '刪除失敗'
    }
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 加模板列表頁相關的響應式變數
const templateCurrentPage = ref(1)
const templateItemsPerPage = ref(10)
const templateTotalItems = ref(0)

// 修改 loadDialogTemplates 方法
const loadDialogTemplates = async () => {
  try {
    const params = {
      page: templateCurrentPage.value,
      itemsPerPage: templateItemsPerPage.value
    }

    // 載入所有表單板
    const { data } = await apiAuth.get('/formTemplates/all', { params })
    if (data.success) {
      formTemplates.value = data.result.data
      templateTotalItems.value = data.result.totalItems
      templateCurrentPage.value = data.result.currentPage
    }
  } catch (error) {
    console.error('載入表單模板失敗:', error)
    createSnackbar({
      text: '載入表單模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    formTemplates.value = []
  }
}

// 監聽選擇的模板變化
watch(selectedTemplate, async (newVal) => {
  if (newVal) {
    // 當選擇模板時才載入相依套件
    await initDependencies()
    const template = formTemplates.value.find(t => t._id === newVal)
    if (template) {
      resetFormData(template.componentName)
      await handleTemplateChange(newVal)
    }
  } else {
    resetFormData()
    currentTemplate.value = null
    previewReady.value = false
  }
})

// 監聽表單類型變化
watch(selectedType, (newVal) => {
  // 當表單類型改變時，清空表單模板的選擇
  selectedTemplate.value = null
  currentTemplate.value = null
  previewReady.value = false
  formData.value = {}
  
  if (newVal) {
    // 如果有選擇類型，載入對應的模板選項
    loadFormTemplateOptions()
  } else {
    // 如果清空類型，則清空模板選項
    templateOptions.value = []
  }
})

// 監聽表單值的變化
watch(() => templateForm.value.type, (newVal) => {
  if (newVal) {
    templateErrors.value.type = ''
  }
})

watch(() => templateForm.value.name, (newVal) => {
  if (newVal) {
    templateErrors.value.name = ''
  }
})

watch(() => templateForm.value.componentName, (newVal) => {
  if (newVal) {
    templateErrors.value.componentName = ''
  }
})

// 或者使用一個組合的 watch
watch(templateForm, (newVal) => {
  // 類型
  if (newVal.type) {
    templateErrors.value.type = ''
  }
  // 名稱
  if (newVal.name) {
    templateErrors.value.name = ''
  }
  // 組件名稱
  if (newVal.componentName) {
    templateErrors.value.componentName = ''
  }
}, { deep: true })

// 生命週期鉤子
onMounted(async () => {
  try {
    // 先載入模板
    await loadTemplates()
    // 當用戶實際需要時才載入相依套件
    if (selectedTemplate.value) {
      await initDependencies()
    }
  } catch (error) {
    console.error('初始化失敗:', error)
    createSnackbar({
      text: '載入初始資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// 歷史紀錄相關
const historyDialog = ref({
  open: false
})

const historySearch = ref({
  type: '',
  formTemplate: '',
  date: []
})

const histories = ref([])

const historyTemplateOptions = ref([])

const loadTemplateOptions = async () => {
  try {
    // console.log('開始載入模板選項')
    // console.log('當前搜尋條件:', {
    //   type: historySearch.value.type
    // })

    // 清空現有選項
    historyTemplateOptions.value = []
    historySearch.value.formTemplate = ''

    // 只有當類型有選擇時載入模板
    if (historySearch.value.type) {
      const params = {
        type: historySearch.value.type
      }

      // console.log('準備發送請求，參數:', params)
      const { data } = await apiAuth.get('/formTemplates/search', { params })
      // console.log('收到回應:', data)

      if (data.success) {
        historyTemplateOptions.value = data.result.map(template => ({
          title: template.name,
          value: template._id
        }))
        // console.log('處理後的選項:', historyTemplateOptions.value)
      }
    }
  } catch (error) {
    console.error('載入模板選項失敗:', error)
    createSnackbar({
      text: '載入模板選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const closeHistoryDialog = () => {
  historyDialog.value.open = false
  resetHistorySearch()
}

// 修改 openHistoryDialog
const openHistoryDialog = async () => {
  try {
    historyDialog.value.open = true
    // 清空所有搜尋條件
    historySearch.value = {
      type: '',
      formTemplate: '',
      date: []
    }
    historyTemplateOptions.value = []
    currentPage.value = 1

    // 入第一頁資料
    await searchHistory()
  } catch (error) {
    console.error('開啟歷史紀錄對話框失敗:', error)
    createSnackbar({
      text: '載入歷史紀錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const formToDelete = ref(null)
const confirmDeleteDialog = ref({
  open: false,
  templateName: '',
  formNumber: ''
})

const deleteHistory = async (history) => {
  formToDelete.value = history
  confirmDeleteDialog.value = {
    open: true,
    templateName: history.formTemplate?.name || '未知模板',
    formNumber: history.formNumber || ''
  }
}

const confirmDelete = async () => {
  try {
    deletingFormId.value = formToDelete.value._id
    const { data } = await apiAuth.delete(`/forms/${formToDelete.value._id}`)
    if (data.success) {
      createSnackbar({
        text: '刪除歷史紀錄成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await searchHistory()
    }
  } catch (error) {
    createSnackbar({
      text: error.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingFormId.value = ''
    formToDelete.value = null
    confirmDeleteDialog.value.open = false
  }
}

// 日期格式化
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 監聽類型變化
watch(
  () => historySearch.value.type,
  () => {
    // 當類型變化時，清空模板選項和選擇的模板
    historySearch.value.formTemplate = ''
    historyTemplateOptions.value = []
  }
)

watch(selectedType, (newVal) => {
  // 當表單類型改變時，清空表單模板的選擇
  selectedTemplate.value = null
  
  if (newVal) {
    // 如果有選擇類型，載入對應的模板選項
    loadFormTemplateOptions()
  } else {
    // 如果清空類型，則清空模板選項
    templateOptions.value = []
  }
})

// 添加下載歷史 PDF 的方法
// const downloadHistoryPDF = async (history) => {
//   try {
//     if (!history.pdfUrl) {
//       createSnackbar({
//         text: '找不到 PDF 檔案',
//         snackbarProps: { color: 'red-lighten-1' }
//       })
//       return
//     }

//     // 直接開啟 PDF
//     window.open(history.pdfUrl, '_blank')
//     createSnackbar({
//       text: 'PDF 開啟成功',
//       snackbarProps: {
//         color: 'teal-lighten-1',
//         timeout: 2000
//       }
//     })
//   } catch (error) {
//     console.error('PDF 開啟失敗:', error)
//     createSnackbar({
//       text: 'PDF 開啟失敗',
//       snackbarProps: { color: 'red-lighten-1' }
//     })
//   }
// }

// 添加編輯歷史記錄的方法
const isEditingLoading = ref(false);
const isViewingLoading = ref(false);

// 修改 editHistory 方法，添加加載狀態
const editHistory = async (history) => {
  try {
    isEditingLoading.value = true;
    if (!history) {
      throw new Error('歷史記錄資料不存在')
    }

    // 設置編輯狀態
    isEditing.value = true;
    isViewing.value = false;
    isAdding.value = false;
    editingFormId.value = history._id;

    // 先獲取完整的表單資料
    const { data } = await apiAuth.get(`/forms/${history._id}`);
    if (!data.success) {
      throw new Error(data.message || '獲取表單資料失敗');
    }

    // 使用完整的表單資料
    const completeHistory = data.result;

    // 設置表單類型
    selectedType.value = completeHistory.formTemplate?.type;
    await nextTick();

    // 載入表單模板選項
    await loadFormTemplateOptions();

    // 設置選擇的模板
    selectedTemplate.value = completeHistory.formTemplate?._id;
    await nextTick();

    // 根據不同的模板類型，設置對應的資料結構
    const template = formTemplates.value.find(t => t._id === completeHistory.formTemplate?._id);
    if (!template) {
      throw new Error('找不到對應的模板');
    }

    // 使用 Promise 來確保資料設置完成
    await new Promise((resolve) => {
      setTimeout(async () => {
        switch (template.componentName) {
          case 'RayHuangQuotationTemplate': {
            formData.value = {
              formNumber: completeHistory.formNumber,
              date: completeHistory.formData?.date ? new Date(completeHistory.formData.date) : new Date(completeHistory.createdAt),
              customerName: completeHistory.formData?.customerName || '',
              customerAddress: completeHistory.formData?.customerAddress || '',
              customerTaxId: completeHistory.formData?.customerTaxId || '',
              customerContact: completeHistory.formData?.customerContact || '',
              customerDepartment: completeHistory.formData?.customerDepartment || '',
              customerPhone: completeHistory.formData?.customerPhone || '',
              customerEmail: completeHistory.formData?.customerEmail || '',
              customerMobile: completeHistory.formData?.customerMobile || '',
              projectType: completeHistory.formData?.projectType || '',
              projectName: completeHistory.formData?.projectName || '',
              workDays: completeHistory.formData?.workDays || '',
              specialNote: completeHistory.formData?.specialNote || '',
              validityDays: completeHistory.formData?.validityDays || '',
              delayDays: completeHistory.formData?.delayDays || '',
              items: Array.isArray(completeHistory.formData?.items) && completeHistory.formData.items.length > 0
                ? completeHistory.formData.items
                : [{
                    name: '',
                    description: '',
                    workDays: '',
                    quantity: 1,
                    unit: '份',
                    price: ''
                  }],
              // 確保成本項目被正確初始化
              costs: Array.isArray(completeHistory.formData?.costs) && completeHistory.formData.costs.length > 0
                ? completeHistory.formData.costs
                : [{
                    costName: '',
                    costAmount: 0,
                    remark: ''
                  }],
              includeContract: completeHistory.formData?.includeContract || false,
              contract: completeHistory.formData?.contract || {
                page1: {},
                page2: {},
                page3: {}
              }
            };
            break;
          }
          case 'YstravelQuotationTemplate': {
            // ... YstravelQuotationTemplate 的程式碼 ...
            break;
          }
        }
        await nextTick();
        resolve();
      }, 500);
    });

    createSnackbar({
      text: '已載入表單歷史資料',
      snackbarProps: {
        color: 'teal-lighten-1',
      }
    });
    
    closeHistoryDialog();
  } catch (error) {
    console.error('載入歷史資料失敗:', error);
    createSnackbar({
      text: error.message || '載入歷史資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    });
  } finally {
    isEditingLoading.value = false;
  }
};

// 添加載入狀態
const loading = ref(false)

// 添加更新表單的狀態
const isEditing = ref(false)
const editingFormId = ref(null)

// 添加載入歷史記錄的方法
const loadHistory = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      quickSearch: historyQuickSearch.value
    }

    const { data } = await apiAuth.get('/forms', { params })
    if (!data.success) {
      throw new Error(data.message || '載入歷史記錄失敗')
    }

    histories.value = data.result.data
    totalItems.value = data.result.totalItems
    totalPages.value = data.result.totalPages
  } catch (error) {
    console.error('載入歷史記錄失敗:', error)
    createSnackbar({
      text: error.message || '載入歷史記錄失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 新增表單提交方法
const submitForm = async () => {
  try {
    // 確保啟用驗證
    enableValidation.value = true
    
    // 進行表單驗證
    const isValid = await formFieldsRef.value?.validate()
    if (!isValid) {
      createSnackbar({
        text: '請填寫必填欄位',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 彈出確認對話框
    confirmDialogOpen.value = true;
  } catch (error) {
    console.error('新增表單失敗:', error)
    createSnackbar({
      text: error.message || '新增表單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 修改 generatePDF 函數，添加進度回調
const generatePDF = async (element, templateName, option, onProgress) => {
  // 確保所有必要的庫都已載入
  if (!html2pdf.value || !jsPDF.value || !html2canvas.value) {
    await initDependencies();
  }

  const style = document.createElement('style');
  style.textContent = `
    @page {
      size: A4;
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  const opt = {
    margin: 0,
    filename: `${templateName}_${formData.value.formNumber}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: {
      scale: 4,
      useCORS: true,
      letterRendering: true,
      width: 795,
      height: 1123,
      windowWidth: 795,
      windowHeight: 1123
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    }
  };

  try {
    const pages = [];
    if (option === 'quotation' || option === 'both') {
      pages.push('quotation');
    }
    if (option === 'contract' || option === 'both') {
      pages.push('contract1', 'contract2', 'contract3');
    }

    const doc = new jsPDF.value(opt.jsPDF);
    const originalPage = formData.value.currentPage;

    for (let i = 0; i < pages.length; i++) {
      formData.value.currentPage = pages[i];
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas.value(element, {
        ...opt.html2canvas,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i > 0) {
        doc.addPage();
      }

      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      if (onProgress) {
        onProgress(((i + 1) / pages.length) * 100);
      }
    }

    formData.value.currentPage = originalPage;
    await nextTick();

    return doc.output('blob');
  } catch (error) {
    console.error('PDF 生成失敗:', error);
    throw error;
  } finally {
    document.head.removeChild(style);
  }
};

const startNewForm = () => {
  isAdding.value = true;
  isEditing.value = false;
  isViewing.value = false; // 重置查閱狀態
  editingFormId.value = null;
  resetFormData();
  selectedType.value = null;
  selectedTemplate.value = null;
};

const isAdding = ref(true);

// 添加查閱表單的方法
const viewForm = async (history) => {
  try {
    isViewingLoading.value = true;
    // console.log('開始查閱表單:', history)
    if (!history) {
      throw new Error('表單資料不存在')
    }

    // 設置查閱狀態
    isViewing.value = true;
    isEditing.value = false; // 重置編輯狀態
    isAdding.value = false; // 重置新增狀態
    editingFormId.value = history._id;

    // 獲取完整的表單資料
    const { data } = await apiAuth.get(`/forms/${history._id}`);
    if (!data.success) {
      throw new Error(data.message || '獲取表單資料失敗');
    }

    // 使用完整的表單資料
    const completeHistory = data.result;
    // console.log('獲取到的完整資料:', completeHistory);

    // 設置表單類型
    selectedType.value = completeHistory.formTemplate?.type;
    await nextTick();

    // 載入表單模板選項
    await loadFormTemplateOptions();

    // 設置選擇的模板
    selectedTemplate.value = completeHistory.formTemplate?._id;
    await nextTick();

    // 根據不同的模板類型，設置對應的資料結構
    const template = formTemplates.value.find(t => t._id === completeHistory.formTemplate?._id);
    if (!template) {
      throw new Error('找不到對應的模板');
    }

    // 使用 Promise 來確保資料設置完成
    await new Promise((resolve) => {
      setTimeout(async () => {
        switch (template.componentName) {
          case 'RayHuangQuotationTemplate': {
            formData.value = {
              ...completeHistory.formData,
              formNumber: completeHistory.formNumber
            };
            break;
          }
          case 'YstravelQuotationTemplate': {
            formData.value = {
              ...completeHistory.formData,
              formNumber: completeHistory.formNumber
            };
            break;
          }
        }
        await nextTick();
        resolve();
      }, 500);
    });

    createSnackbar({
      text: '已載入表單資料',
      snackbarProps: {
        color: 'teal-lighten-1',
        timeout: 3000
      }
    });

    closeHistoryDialog();
  } catch (error) {
    console.error('載入表單資料失敗:', error);
    createSnackbar({
      text: error.message || '載入表單資料失敗',
      snackbarProps: { color: 'red-lighten-1' }
    });
  } finally {
    isViewingLoading.value = false;
  }
};

// 添加查閱狀態
const isViewing = ref(false);

const confirmDialogOpen = ref(false);
const confirmDialogTitle = ref('確認新增表單');
const confirmDialogMessage = ref('是否確定資料皆已填寫完成且正確?');
const confirmDialogConfirmText = ref('確認');
const confirmDialogCancelText = ref('取消');

const handleConfirm = async () => {
  try {
    // 發送新增請求
    const { data } = await apiAuth.post('/forms', {
      formTemplate: selectedTemplate.value,
      formNumber: formData.value.formNumber,
      formData: formData.value,
      lastEditor: user.userId
    });

    if (!data.success) {
      throw new Error(data.message || '新增表單失敗');
    }

    // 切換到編輯模式
    isEditing.value = true;
    editingFormId.value = data.result._id; // 假設後端返回新創建表單的 ID
    // 確保新增模式按鈕可用
    isAdding.value = false;

    createSnackbar({
      text: '表單新增成功',
      snackbarProps: { color: 'teal-lighten-1' }
    });
  } catch (error) {
    console.error('新增表單失敗:', error);
    const errorMessage = error.response?.data?.message || '新增表單失敗';
    createSnackbar({
      text: errorMessage,
      snackbarProps: { color: 'red-lighten-1' }
    });
  }
};

const showProgressOverlay = ref(false);
const downloadProgress = ref(0);

const isExportingReport = ref(false)
const reportDialog = ref({
  open: false,
  type: '',
  template: '',
  dateRange: [],
  typeError: '',
  templateError: '',
  dateError: ''
})

const reportTemplateOptions = ref([])

// 開啟報表對話框
const openReportDialog = () => {
  reportDialog.value = {
    open: true,
    type: '',
    template: '',
    dateRange: [],
    typeError: '',
    templateError: '',
    dateError: ''
  }
  reportTemplateOptions.value = []
}

// 關閉報表對話框
const closeReportDialog = () => {
  reportDialog.value.open = false
  reportTemplateOptions.value = []
}

// 載入報表模板選項
const loadReportTemplateOptions = async () => {
  reportDialog.value.template = ''
  reportTemplateOptions.value = []
  reportDialog.value.typeError = ''

  if (!reportDialog.value.type) return

  try {
    const params = { type: reportDialog.value.type }
    const { data } = await apiAuth.get('/formTemplates/search', { params })
    if (data.success) {
      reportTemplateOptions.value = data.result.map(template => ({
        title: template.name,
        value: template._id
      }))
    }
  } catch (error) {
    console.error('載入模板選項失敗:', error)
    createSnackbar({
      text: '載入模板選項失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 處理匯出報表
const handleExportReport = async () => {
  try {
    // 驗證
    let hasError = false
    reportDialog.value.typeError = ''
    reportDialog.value.templateError = ''
    reportDialog.value.dateError = ''

    if (!reportDialog.value.type) {
      reportDialog.value.typeError = '請選擇表單類型'
      hasError = true
    }

    if (!reportDialog.value.template) {
      reportDialog.value.templateError = '請選擇表單模板'
      hasError = true
    }

    if (!reportDialog.value.dateRange || reportDialog.value.dateRange.length === 0) {
      reportDialog.value.dateError = '請選擇日期區間'
      hasError = true
    }

    if (hasError) return

    isExportingReport.value = true

    // 確保 html2pdf 已載入
    if (!html2pdf.value) {
      await initDependencies()
    }

    // 準備查詢參數
    const params = {
      formTemplate: reportDialog.value.template
    }

    // 處理日期範圍
    if (reportDialog.value.dateRange && reportDialog.value.dateRange.length > 0) {
      const startDate = new Date(reportDialog.value.dateRange[0])
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(reportDialog.value.dateRange[reportDialog.value.dateRange.length - 1])
      endDate.setHours(23, 59, 59, 999)
      
      params.startDate = startDate.toISOString()
      params.endDate = endDate.toISOString()
    }

    // 獲取報表資料
    const { data } = await apiAuth.get('/forms/report', { params })
    
    if (data.success) {
      // 計算總金額和總成本
      const totalAmount = data.result.reduce((acc, curr) => {
        const itemsTotal = curr.formData.items.reduce((sum, item) => {
          return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0)
        }, 0)
        return acc + Math.round(itemsTotal * 1.05)
      }, 0)

      const totalCost = data.result.reduce((acc, curr) => {
        return acc + (curr.formData.costs || []).reduce((sum, cost) => {
          return sum + (Number(cost.costAmount) || 0)
        }, 0)
      }, 0)

      const totalIncome = totalAmount - totalCost

      // 創建 PDF 內容
      const content = document.createElement('div')
      content.innerHTML = `
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; font-size: 16px; font-weight: bold;">
            ${formTemplates.value.find(t => t._id === reportDialog.value.template)?.name || ''} - 統計報表
          </div>
          <p style="margin-bottom: 16px; font-size: 12px;">
            統計期間：${formatDate(reportDialog.value.dateRange[0])} ~ ${formatDate(reportDialog.value.dateRange[reportDialog.value.dateRange.length - 1])}
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; background-color: #f5f5f5; text-align: center;">單號</th>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; background-color: #f5f5f5; text-align: center;">報價日期</th>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; background-color: #f5f5f5; text-align: center;">客戶</th>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; background-color: #f5f5f5; text-align: center;">總金額 (含稅)</th>
                <th style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; background-color: #f5f5f5; text-align: center;">成本</th>
                <th style="border: 1px solid #ddd; border-bottom: none; padding: 4px; background-color: #f5f5f5; text-align: center;">實際收入</th>
              </tr>
            </thead>
            <tbody>
              ${data.result.map(form => {
                const itemsTotal = form.formData.items.reduce((sum, item) => {
                  return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0)
                }, 0)
                const total = Math.round(itemsTotal * 1.05)
                
                const cost = (form.formData.costs || []).reduce((sum, cost) => {
                  return sum + (Number(cost.costAmount) || 0)
                }, 0)
                
                const income = total - cost

                return `
                  <tr>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; text-align: center;">${form.formNumber}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; text-align: center;">${formatDate(form.formData.date)}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; text-align: center;">${form.formData.customerName || '-'}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; text-align: center;">$ ${total.toLocaleString()}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; border-right: none; padding: 4px; text-align: center;">$ ${cost.toLocaleString()}</td>
                    <td style="border: 1px solid #ddd; border-bottom: none; padding: 4px; text-align: center;">$ ${income.toLocaleString()}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="border: 1px solid #ddd; border-right: none; padding: 4px; font-weight: bold; background-color: #f5f5f5; text-align: center;">總計</td>
                <td style="border: 1px solid #ddd; border-right: none; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">$ ${totalAmount.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; border-right: none; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">$ ${totalCost.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">$ ${totalIncome.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `

      // 配置 PDF 選項
      const options = {
        margin: 10,
        filename: `${formTemplates.value.find(t => t._id === reportDialog.value.template)?.name} - 統計報表.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 6,
          logging: false,
          useCORS: true,
          allowTaint: true,
          removeContainer: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        }
      }

      // 生成 PDF
      await html2pdf.value().from(content).set(options).save()

      closeReportDialog()
      createSnackbar({
        text: 'PDF 匯出成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('匯出報表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '匯出報表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isExportingReport.value = false
  }
}

// 在 loadReportTemplateOptions 函數之前添加以下 watch
// 監聽報表對話框中的表單類型變化
watch(() => reportDialog.value.type, (newVal) => {
  if (newVal) {
    reportDialog.value.typeError = ''
  }
})

// 監聽報表對話框中的表單模板變化
watch(() => reportDialog.value.template, (newVal) => {
  if (newVal) {
    reportDialog.value.templateError = ''
  }
})

// 監聽報表對話框中的日期區間變化
watch(() => reportDialog.value.dateRange, (newVal) => {
  if (newVal && newVal.length > 0) {
    reportDialog.value.dateError = ''
  }
}, { deep: true })
</script>
<style lang="scss" scoped>
.v-table  {
  :deep(tbody tr:nth-child(odd)) {
    background-color: #f9ffff;
  }
  :deep(tbody tr:nth-child(even)) {
    background-color: #ffffff;
  }
}
</style>
