<template>
  <v-container max-width="1660">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <h3>行銷美編申請設定</h3>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="teal-darken-1"
          align-tabs="start"
        >
          <v-tab
            v-if="showProductTypeConfigTab"
            value="productTypeConfig"
          >
            <v-icon start>
              mdi-cog
            </v-icon>
            申請限制設定
          </v-tab>
          <v-tab
            v-if="showNotificationEmailTab"
            value="notificationEmail"
          >
            <v-icon start>
              mdi-email-multiple
            </v-icon>
            通知設定
          </v-tab>
          <v-tab
            v-if="showTaskConversionConfigTab"
            value="taskConversionConfig"
          >
            <v-icon start>
              mdi-auto-fix
            </v-icon>
            任務轉換設定
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 申請限制設定標籤頁 -->
          <v-window-item value="productTypeConfig">
            <v-card flat>
              <v-card-text class="px-0 pt-6 pb-4">
                <template v-if="productTypeConfigsLoading">
                  <div class="d-flex justify-center align-center py-8">
                    <v-progress-circular
                      indeterminate
                      color="teal-darken-2"
                      size="40"
                    />
                  </div>
                </template>
                <template v-else>
                  <div
                    v-if="productTypeConfigs.length === 0"
                    class="text-center py-8"
                  >
                    <v-icon
                      icon="mdi-cog-off"
                      size="48"
                      color="grey-lighten-1"
                      class="mb-3"
                    />
                    <div class="text-grey-lighten-1">
                      尚未載入申請限制設定
                    </div>
                  </div>
                  <v-list v-else>
                    <v-list-item
                      v-for="config in productTypeConfigs"
                      :key="config.productType"
                      class="mb-3 border rounded px-4 pt-3 pb-4"
                    >
                      <div class="d-flex align-center mb-3 w-100">
                        <v-icon
                          icon="mdi-package-variant"
                          size="22"
                          color="teal-darken-2"
                          class="me-3"
                        />
                        <span class="text-grey-darken-3 font-weight-bold me-4">{{ config.displayName || getProductTypeLabel(config.productType) }}</span>
                        <v-spacer />
                        <v-btn
                          icon
                          color="light-blue-darken-4"
                          variant="plain"
                          size="small"
                          @click="openEditProductTypeConfigDialog(config)"
                        >
                          <v-icon size="20">
                            mdi-pencil
                          </v-icon>
                        </v-btn>
                      </div>

                      <!-- 時間限制顯示 -->
                      <div class="d-flex align-center mb-2 w-100">
                        <v-icon
                          icon="mdi-clock-outline"
                          size="18"
                          color="grey-darken-1"
                          class="me-2"
                        />
                        <span class="text-grey-darken-2 me-2">時間限制：</span>
                        <v-chip
                          :color="config.enableTimeLimit ? 'orange' : 'grey'"
                          size="small"
                          label
                        >
                          {{ config.enableTimeLimit ? '已啟用' : '未啟用' }}
                        </v-chip>
                        <template v-if="config.enableTimeLimit">
                          <span class="text-grey-darken-1 ms-3">
                            {{ formatDateTime(config.applicationStartDate) }} ~ {{ formatDateTime(config.applicationEndDate) }}
                          </span>
                        </template>
                      </div>

                      <!-- 名額限制顯示 -->
                      <div class="d-flex align-center w-100">
                        <v-icon
                          icon="mdi-account-multiple"
                          size="18"
                          color="grey-darken-1"
                          class="me-2"
                        />
                        <span class="text-grey-darken-2 me-2">名額限制：</span>
                        <v-chip
                          :color="config.enableQuotaLimit ? 'blue' : 'grey'"
                          size="small"
                          label
                        >
                          {{ config.enableQuotaLimit ? '已啟用' : '未啟用' }}
                        </v-chip>
                        <template v-if="config.enableQuotaLimit">
                          <span class="text-grey-darken-1 ms-3">
                            已使用：{{ config.quotaUsed || 0 }} / 總名額：{{ config.quotaLimit }}
                            <span class="text-teal-darken-2 font-weight-bold ms-2">
                              (剩餘：{{ config.quotaRemaining || 0 }})
                            </span>
                          </span>
                          <div class="text-grey-darken-1 ms-3 mt-1">
                            <span>正取名額：</span>
                            <span class="text-blue-darken-2 font-weight-bold">{{ config.regularQuota || config.quotaLimit || 0 }}</span>
                            <span class="ms-2">備取名額：</span>
                            <span class="text-orange-darken-2 font-weight-bold">{{ config.backupQuota || 0 }}</span>
                          </div>
                        </template>
                      </div>
                    </v-list-item>
                  </v-list>
                </template>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 通知設定標籤頁 -->
          <v-window-item value="notificationEmail">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <v-row class="pb-2">
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-btn
                      prepend-icon="mdi-plus"
                      color="teal-darken-1"
                      variant="outlined"
                      :size="buttonSize"
                      @click="openNotificationEmailDialog"
                    >
                      新增用戶
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- 通知設定表格 -->
                <v-data-table-server
                  v-model:items-per-page="itemsPerPage"
                  v-model:sort-by="notificationEmailSortBy"
                  :items="notificationEmails"
                  :headers="notificationEmailHeaders"
                  :loading="notificationEmailsLoading"
                  :page="notificationEmailCurrentPage"
                  :items-length="notificationEmailTotalItems"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                  @update:options="handleNotificationEmailTableOptionsChange"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td>{{ item.user?.name || '-' }}</td>
                      <td>{{ item.user?.email || '-' }}</td>
                      <td>
                        <div class="d-flex flex-wrap ga-1 py-2">
                          <v-chip
                            v-for="category in item.categories"
                            :key="category"
                            color="teal-darken-1"
                            size="small"
                            variant="tonal"
                          >
                            {{ getCategoryLabel(category) }}
                          </v-chip>
                        </div>
                      </td>
                      <td>
                        <span v-if="item.note">
                          {{ item.note }}
                        </span>
                        <span
                          v-else
                          class="text-grey"
                        >
                          -
                        </span>
                      </td>
                      <td class="text-center">
                        <v-btn
                          icon
                          color="light-blue-darken-4"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="editNotificationEmail(item)"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="red-lighten-1"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          :loading="deletingEmailId === item._id"
                          @click="openDeleteEmailConfirmDialog(item)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table-server>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- 任務轉換設定標籤頁 -->
          <v-window-item value="taskConversionConfig">
            <v-card flat>
              <v-card-text class="px-0 pt-6">
                <v-row class="pb-2">
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-btn
                      prepend-icon="mdi-plus"
                      color="teal-darken-1"
                      variant="outlined"
                      :size="buttonSize"
                      @click="openTaskConversionDialog"
                    >
                      新增申請類型
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- 任務轉換設定表格 -->
                <v-data-table-server
                  v-model:items-per-page="itemsPerPage"
                  v-model:sort-by="taskConversionSortBy"
                  :items="taskConversionConfigs"
                  :headers="taskConversionHeaders"
                  :loading="taskConversionConfigsLoading"
                  :page="taskConversionCurrentPage"
                  :items-length="taskConversionTotalItems"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                  @update:options="handleTaskConversionTableOptionsChange"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td>{{ getProductTypeText(item.productType, item) }}</td>
                      <td>{{ item.project?.name || '-' }}</td>
                      <td>{{ item.category || '-' }}</td>
                      <td>{{ item.creator?.name || '-' }}</td>
                      <td class="text-center">
                        <v-btn
                          icon
                          color="light-blue-darken-4"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          @click="editTaskConversion(item)"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="red-lighten-1"
                          variant="plain"
                          size="22"
                          class="mx-2"
                          :ripple="false"
                          :loading="deletingTaskConversionId === item._id"
                          @click="openDeleteTaskConversionConfirmDialog(item)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table-server>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>

    <!-- 新增/編輯通知設定對話框 -->
    <v-dialog
      v-model="notificationEmailDialog.open"
      max-width="480"
      persistent
      :fullscreen="!smAndUp"
      :no-click-animation="isSubmittingNotificationEmail"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2"
          :class="notificationEmailDialog.id ? 'bg-blue-darken-1' : 'bg-teal-darken-1'"
        >
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            {{ notificationEmailDialog.id ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          <span class="card-title text-white">{{ notificationEmailDialog.id ? '編輯用戶設定' : '新增用戶設定' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeNotificationEmailDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="notificationEmailFormRef"
            v-model="notificationEmailFormValid"
            :disabled="isSubmittingNotificationEmail"
            @submit.prevent="submitNotificationEmail"
          >
            <v-row>
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
                  :disabled="!!notificationEmailDialog.id"
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="notificationEmailForm.categories"
                  :items="categoryOptions"
                  item-title="label"
                  item-value="value"
                  label="* 選擇通知分類"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  :rules="[v => (v && v.length > 0) || '請至少選擇一個大分類']"
                  prepend-inner-icon="mdi-checkbox-multiple-marked-outline"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="notificationEmailForm.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-1">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeNotificationEmailDialog"
          >
            取消
          </v-btn>
          <v-btn
            :color="notificationEmailDialog.id ? 'blue-darken-1' : 'teal-darken-1'"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isSubmittingNotificationEmail"
            @click="submitNotificationEmail"
          >
            {{ notificationEmailDialog.id ? '修改' : '新增' }}
          </v-btn>
        </v-card-actions>
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

    <!-- 編輯申請類型設定對話框 -->
    <v-dialog
      v-model="editProductTypeConfigDialog.show"
      max-width="800"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-darken-1">
          <v-icon
            icon="mdi-pencil"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">編輯申請限制設定</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            color="white"
            :ripple="false"
            class="opacity-100"
            :size="smAndUp ? '36' : '32'"
            @click="closeEditProductTypeConfigDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 pt-6 pb-4">
          <v-form ref="editProductTypeConfigFormRef">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-package-variant"
                    size="18"
                    color="blue-darken-1"
                    class="me-2"
                  />
                  <span class="text-blue-darken-1 card-title">{{ editProductTypeConfigForm.displayName || getProductTypeLabel(editProductTypeConfigForm.productType) }}</span>
                </div>
              </v-col>

              <!-- 時間限制設定 -->
              <v-col cols="12">
                <v-card
                  class="pt-3 pb-2 px-4 elevation-0 mb-4"
                  style="border: 1px solid #e0e0e0;"
                >
                  <div class="d-flex align-center mb-3">
                    <v-checkbox
                      v-model="editProductTypeConfigForm.enableTimeLimit"
                      label="啟用時間限制"
                      color="blue-darken-1"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <v-row v-if="editProductTypeConfigForm.enableTimeLimit">
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        :model-value="formatDateTimeLocal(editProductTypeConfigForm.applicationStartDate)"
                        label="* 開放申請開始時間"
                        type="datetime-local"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-calendar-clock"
                        clearable
                        :rules="[v => !!v || '請選擇開始時間']"
                        @update:model-value="(value) => editProductTypeConfigForm.applicationStartDate = value ? new Date(value) : null"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        :model-value="formatDateTimeLocal(editProductTypeConfigForm.applicationEndDate)"
                        label="* 開放申請結束時間"
                        type="datetime-local"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-calendar-clock"
                        clearable
                        :rules="[
                          v => !!v || '請選擇結束時間',
                          v => !editProductTypeConfigForm.applicationStartDate || !v || new Date(v) > editProductTypeConfigForm.applicationStartDate || '結束時間必須晚於開始時間'
                        ]"
                        @update:model-value="(value) => editProductTypeConfigForm.applicationEndDate = value ? new Date(value) : null"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <!-- 名額限制設定 -->
              <v-col cols="12">
                <v-card
                  class="pt-3 pb-5 px-4 elevation-0 mb-4"
                  style="border: 1px solid #e0e0e0;"
                >
                  <div class="d-flex align-center mb-3">
                    <v-checkbox
                      v-model="editProductTypeConfigForm.enableQuotaLimit"
                      label="啟用名額限制"
                      color="blue-darken-1"
                      hide-details
                      density="compact"
                    />
                  </div>
                  <v-row v-if="editProductTypeConfigForm.enableQuotaLimit">
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model.number="editProductTypeConfigForm.quotaLimit"
                        label="* 總名額"
                        type="number"
                        variant="outlined"
                        density="compact"
                        :rules="[
                          v => v !== '' && v !== null && v !== undefined || '請輸入總名額',
                          v => v >= 0 || '名額不能小於0'
                        ]"
                        prepend-inner-icon="mdi-account-multiple"
                        @update:model-value="handleQuotaLimitChange"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model.number="editProductTypeConfigForm.regularQuota"
                        label="* 正取名額"
                        type="number"
                        variant="outlined"
                        density="compact"
                        :rules="[
                          v => v !== '' && v !== null && v !== undefined || '請輸入正取名額',
                          v => v >= 0 || '正取名額不能小於0',
                          v => !editProductTypeConfigForm.quotaLimit || v <= editProductTypeConfigForm.quotaLimit || '正取名額不能大於總名額'
                        ]"
                        prepend-inner-icon="mdi-account-check"
                        hint="正取名額以外的名額將自動成為備取名額"
                        persistent-hint
                      />
                    </v-col>
                    <v-col
                      cols="12"
                    >
                      <v-card
                        class="pa-3 elevation-0"
                        style="background: #f5f5f5;"
                      >
                        <div class="text-caption text-grey-darken-1 mb-2">
                          目前狀態
                        </div>
                        <div class="text-body-2 mb-1">
                          <span class="text-grey-darken-2">已使用：</span>
                          <span class="font-weight-bold">{{ editProductTypeConfigForm.quotaUsed || 0 }}</span>
                          <span class="text-grey-darken-2 ms-2">/ 總名額：</span>
                          <span class="font-weight-bold">{{ editProductTypeConfigForm.quotaLimit || 0 }}</span>
                        </div>
                        <div class="text-body-2">
                          <span class="text-grey-darken-2">正取名額：</span>
                          <span class="font-weight-bold text-blue-darken-2">{{ editProductTypeConfigForm.regularQuota || editProductTypeConfigForm.quotaLimit || 0 }}</span>
                          <span class="text-grey-darken-2 ms-2">備取名額：</span>
                          <span class="font-weight-bold text-orange-darken-2">{{ Math.max(0, (editProductTypeConfigForm.quotaLimit || 0) - (editProductTypeConfigForm.regularQuota || editProductTypeConfigForm.quotaLimit || 0)) }}</span>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <!-- 備註 -->
              <v-col cols="12">
                <v-textarea
                  v-model="editProductTypeConfigForm.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  prepend-inner-icon="mdi-note-text"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeEditProductTypeConfigDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="updatingProductTypeConfig"
            @click="updateProductTypeConfig"
          >
            儲存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增/編輯任務轉換設定對話框 -->
    <v-dialog
      v-model="taskConversionDialog.open"
      persistent
      max-width="480"
      :fullscreen="!smAndUp"
      :no-click-animation="isSubmittingTaskConversion"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2"
          :class="taskConversionDialog.id ? 'bg-blue-darken-1' : 'bg-teal-darken-1'"
        >
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            {{ taskConversionDialog.id ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          <span class="card-title text-white">{{ taskConversionDialog.id ? '編輯申請類型設定' : '新增申請類型設定' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeTaskConversionDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="taskConversionFormRef"
            v-model="taskConversionFormValid"
            :disabled="isSubmittingTaskConversion"
            @submit.prevent="submitTaskConversion"
          >
            <v-row>
              <!-- 申請類型選擇 -->
              <v-col cols="12">
                <v-select
                  v-model="taskConversionForm.productType"
                  :items="availableProductTypes"
                  item-title="label"
                  item-value="value"
                  label="* 申請類型"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇申請類型']"
                  prepend-inner-icon="mdi-package-variant"
                  :disabled="!!taskConversionDialog.id"
                  clearable
                />
              </v-col>
              <!-- 選擇專案 -->
              <v-col cols="12">
                <v-select
                  v-model="taskConversionForm.project"
                  :items="allProjects"
                  item-title="name"
                  item-value="_id"
                  label="* 選擇專案"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇專案']"
                  prepend-inner-icon="mdi-folder"
                  :loading="loadingAllProjects"
                  clearable
                  @update:model-value="handleTaskConversionProjectChange"
                />
              </v-col>
              <!-- 選擇任務分類 -->
              <v-col cols="12">
                <v-select
                  v-model="taskConversionForm.taskCategoryId"
                  :items="allCategories"
                  item-title="name"
                  item-value="_id"
                  label="* 選擇任務分類"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇任務分類']"
                  prepend-inner-icon="mdi-folder-outline"
                  :disabled="!taskConversionForm.project"
                  :loading="loadingAllCategories"
                  clearable
                />
              </v-col>
              <!-- 選擇建立者 -->
              <v-col cols="12">
                <v-autocomplete
                  v-model="taskConversionForm.creator"
                  :items="allUsers"
                  item-title="label"
                  item-value="value"
                  label="* 選擇建立者"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇建立者']"
                  prepend-inner-icon="mdi-account"
                  :filter="customFilter"
                  :loading="loadingAllUsers"
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="closeTaskConversionDialog"
          >
            取消
          </v-btn>
          <v-btn
            :color="taskConversionDialog.id ? 'blue-darken-1' : 'teal-darken-1'"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isSubmittingTaskConversion"
            @click="submitTaskConversion"
          >
            {{ taskConversionDialog.id ? '修改' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除任務轉換設定確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteTaskConversionConfirmDialog.show"
      title="確認刪除任務轉換設定"
      :max-width="320"
      :message="deleteTaskConversionConfirmDialog.message"
      confirm-button-text="確認"
      cancel-button-text="取消"
      @confirm="confirmDeleteTaskConversion"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { usePermissionStore } from '@/stores/permission'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// 頁面定義
definePage({
  meta: {
    title: '行銷美編申請設定 | Ystravel',
    login: true,
    permission: 'MARKETING_DESIGN_REQUEST_SETTINGS_READ'
  }
})

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const { smAndUp } = useDisplay()
const permissionStore = usePermissionStore()

// 響應式設定
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const itemsPerPage = ref(10)

// Tab 管理
const activeTab = ref('notificationEmail')

// 權限檢查
const showNotificationEmailTab = computed(() => {
  return permissionStore.hasPermission('MARKETING_DESIGN_REQUEST_NOTIFICATION_MANAGE')
})

const showProductTypeConfigTab = computed(() => {
  return permissionStore.hasPermission('MARKETING_DESIGN_REQUEST_SETTING_MANAGE')
})

const showTaskConversionConfigTab = computed(() => {
  return permissionStore.hasPermission('MARKETING_DESIGN_REQUEST_TASK_CONVERSION_MANAGE')
})

// 初始化 activeTab，設定為第一個有權限的 TAB
const initializeActiveTab = () => {
  if (showProductTypeConfigTab.value) {
    activeTab.value = 'productTypeConfig'
  } else if (showNotificationEmailTab.value) {
    activeTab.value = 'notificationEmail'
  } else if (showTaskConversionConfigTab.value) {
    activeTab.value = 'taskConversionConfig'
  }
}

// 監聽 activeTab 變化，確保切換到有權限的 TAB
watch(activeTab, (newTab) => {
  if (newTab === 'notificationEmail' && !showNotificationEmailTab.value) {
    initializeActiveTab()
  }
  if (newTab === 'productTypeConfig' && !showProductTypeConfigTab.value) {
    initializeActiveTab()
  }
  if (newTab === 'taskConversionConfig' && !showTaskConversionConfigTab.value) {
    initializeActiveTab()
  }
})

// 監聽權限變化，自動切換到第一個有權限的 TAB
watch([showNotificationEmailTab, showProductTypeConfigTab, showTaskConversionConfigTab], () => {
  if ((activeTab.value === 'notificationEmail' && !showNotificationEmailTab.value) ||
      (activeTab.value === 'productTypeConfig' && !showProductTypeConfigTab.value) ||
      (activeTab.value === 'taskConversionConfig' && !showTaskConversionConfigTab.value)) {
    initializeActiveTab()
  }
}, { immediate: true })

// 通知 EMAIL 管理相關變數
const notificationEmailDialog = ref({
  open: false,
  id: ''
})
const notificationEmailForm = ref({
  user: '',
  categories: [],
  note: ''
})
const notificationEmailFormRef = ref(null)
const notificationEmailFormValid = ref(false)
const isSubmittingNotificationEmail = ref(false)
const notificationEmails = ref([])
const users = ref([])
const notificationEmailsLoading = ref(false)
const deletingEmailId = ref(null)
const notificationEmailCurrentPage = ref(1)
const notificationEmailTotalItems = ref(0)
const notificationEmailSortBy = ref([{ key: 'createdAt', order: 'desc' }])
const originalNotificationEmailData = ref({})

// 大分類選項
const categoryOptions = [
  { value: 'printing', label: '印刷相關' },
  { value: 'map', label: '地圖相關' },
  { value: 'dm', label: 'DM相關' },
  { value: 'itRelated', label: 'IT相關' },
  { value: 'website', label: '網站相關' },
  { value: 'other', label: '其他' }
]


// 刪除 EMAIL 確認對話框相關變數
const deleteEmailConfirmDialog = reactive({
  show: false,
  emailId: null,
  emailName: '',
  message: ''
})

// 申請限制設定相關變數
const productTypeConfigs = ref([])
const productTypeConfigsLoading = ref(false)
const editProductTypeConfigDialog = reactive({ show: false })
const editProductTypeConfigForm = reactive({
  productType: '',
  displayName: '',
  enableTimeLimit: false,
  applicationStartDate: null,
  applicationEndDate: null,
  enableQuotaLimit: false,
  quotaLimit: null,
  regularQuota: null,
  quotaUsed: 0,
  note: ''
})
const editProductTypeConfigFormRef = ref(null)
const updatingProductTypeConfig = ref(false)

// 任務轉換設定相關變數
const taskConversionDialog = ref({
  open: false,
  id: ''
})
const taskConversionForm = ref({
  productType: '',
  project: '',
  taskCategoryId: '',
  creator: ''
})
const editingLegacyCategoryName = ref('')
const taskConversionFormRef = ref(null)
const taskConversionFormValid = ref(false)
const isSubmittingTaskConversion = ref(false)
const taskConversionConfigs = ref([])
const taskConversionConfigsLoading = ref(false)
const deletingTaskConversionId = ref(null)
const deleteTaskConversionConfirmDialog = reactive({
  show: false,
  configId: null,
  message: ''
})
const taskConversionCurrentPage = ref(1)
const taskConversionTotalItems = ref(0)
const taskConversionSortBy = ref([{ key: 'createdAt', order: 'desc' }])
const originalTaskConversionData = ref({})

// 所有專案和任務分類（給有權限的人）
const allProjects = ref([])
const loadingAllProjects = ref(false)
const allCategories = ref([])
const loadingAllCategories = ref(false)
const allUsers = ref([])
const loadingAllUsers = ref(false)

// 申請類型選項
const productTypeOptions = ref([])

// 表格標題
const notificationEmailHeaders = [
  { title: '用戶名稱', key: 'user.name', sortable: false },
  { title: 'Email', key: 'user.email', sortable: false },
  { title: '通知分類', key: 'categories', sortable: false },
  { title: '備註', key: 'note', sortable: false },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

const taskConversionHeaders = [
  { title: '申請類型', key: 'productType', sortable: false },
  { title: '專案', key: 'project.name', sortable: false },
  { title: '任務分類', key: 'category', sortable: false },
  { title: '建立者', key: 'creator.name', sortable: false },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]


// 自訂過濾器
const customFilter = (item, queryText) => {
  const textToSearch = (queryText || '').toLowerCase()
  const raw = item.raw || item
  const itemText = raw && raw.name && (raw.userId || raw.employeeCode)
    ? `${raw.name} ${raw.userId || raw.employeeCode}`.toLowerCase()
    : raw && raw.name ? raw.name.toLowerCase() : ''
  return itemText.includes(textToSearch)
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

// 格式化為 datetime-local 格式（用於 input type="datetime-local"）
const formatDateTimeLocal = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 取得產品類型標籤
const getProductTypeLabel = (productType) => {
  const typeMap = {
    'printing': '印刷相關',
    'infoBookletCover': '說資封面',
    'banner': '布條',
    'coachSign': '車頭牌',
    'seriesMap': 'Series地圖',
    'seriesMapModify': '修改Series地圖',
    'SPMap': 'SP地圖',
    'newDMSingle': '新DM(單支)',
    'newDMMultiple': '新DM(綜合)',
    'modifyDM': '修改DM',
    'newElectronicInfo': '電子說資',
    'coupon': '折價券/禮券',
    'homepageBanner': '首頁大圖'
  }
  return typeMap[productType] || productType
}

// 取得產品類型文字
const getProductTypeText = (type, item) => {
  if (type === 'printing') {
    if (item && item.printingTypes) {
      const map = {
        infoBookletCover: '說資封面',
        banner: '布條',
        coachSign: '車頭牌',
        other: '其他'
      }
      const selected = Object.entries(item.printingTypes)
        .filter(([, v]) => v)
        .map(([k]) => map[k])
        .filter(Boolean)
      return selected.length > 0 ? `【印刷相關】- ${selected.join('、')}` : '【印刷相關】'
    }
    // 如果沒有 printingTypes，嘗試從 productTypeOptions 中查找對應的 label
    const option = productTypeOptions.value.find(opt => opt.value === type)
    if (option) {
      return option.label
    }
    return '【印刷相關】'
  }
  const option = productTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 通知 EMAIL 管理相關方法
const openNotificationEmailDialog = async () => {
  notificationEmailDialog.value = {
    open: true,
    id: ''
  }
  notificationEmailForm.value = {
    user: '',
    categories: [],
    note: ''
  }
  await fetchUsers()
  if (notificationEmailFormRef.value) {
    notificationEmailFormRef.value.reset()
  }
}

const editNotificationEmail = async (email) => {
  notificationEmailDialog.value = {
    open: true,
    id: email._id
  }
  // 舊分類 electronic 對應為 itRelated，方便編輯時顯示正確選項
  const categories = (email.categories || []).map(c => (c === 'electronic' ? 'itRelated' : c))
  notificationEmailForm.value = {
    user: email.user?._id || '',
    categories: [...categories],
    note: email.note || ''
  }
  await fetchUsers()
  originalNotificationEmailData.value = JSON.parse(JSON.stringify({
    id: email._id,
    user: email.user?._id || '',
    categories: [...categories],
    note: email.note || ''
  }))
}

const closeNotificationEmailDialog = () => {
  notificationEmailDialog.value = {
    open: false,
    id: ''
  }
  notificationEmailForm.value = {
    user: '',
    categories: [],
    note: ''
  }
  originalNotificationEmailData.value = {}
  if (notificationEmailFormRef.value) {
    notificationEmailFormRef.value.reset()
  }
}

const fetchNotificationEmails = async () => {
  notificationEmailsLoading.value = true
  try {
    const params = {
      page: notificationEmailCurrentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (notificationEmailSortBy.value && notificationEmailSortBy.value.length > 0 && notificationEmailSortBy.value[0].key) {
      params.sortBy = notificationEmailSortBy.value[0].key
      params.sortOrder = notificationEmailSortBy.value[0].order || 'desc'
    }

    const { data } = await apiAuth.get('/notificationEmails', { params })
    if (data.success) {
      notificationEmails.value = data.result?.data || data.result || []
      notificationEmailTotalItems.value = data.result?.totalItems || notificationEmails.value.length
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

const submitNotificationEmail = async () => {
  if (isSubmittingNotificationEmail.value) return

  // 觸發表單驗證
  const { valid } = await notificationEmailFormRef.value.validate()
  if (!valid) return

  // 編輯模式：檢查資料是否有變更
  if (notificationEmailDialog.value.id) {
    const currentData = {
      id: notificationEmailDialog.value.id,
      user: notificationEmailForm.value.user,
      categories: [...notificationEmailForm.value.categories].sort(),
      note: notificationEmailForm.value.note || ''
    }

    const originalData = {
      id: originalNotificationEmailData.value.id,
      user: originalNotificationEmailData.value.user,
      categories: [...(originalNotificationEmailData.value.categories || [])].sort(),
      note: originalNotificationEmailData.value.note || ''
    }

    if (JSON.stringify(currentData) === JSON.stringify(originalData)) {
      createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
      return
    }
  }

  try {
    isSubmittingNotificationEmail.value = true

    if (notificationEmailDialog.value.id) {
      // 編輯模式
      const { data } = await apiAuth.put(`/notificationEmails/${notificationEmailDialog.value.id}`, {
        categories: notificationEmailForm.value.categories,
        note: notificationEmailForm.value.note
      })
      if (!data.success) {
        throw new Error(data.message || '更新失敗')
      }
      createSnackbar({
        text: '通知設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      // 新增模式
      const { data } = await apiAuth.post('/notificationEmails', notificationEmailForm.value)
      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }
      createSnackbar({
        text: '通知設定新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeNotificationEmailDialog()
    await fetchNotificationEmails()
  } catch (error) {
    console.error('操作失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || error.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmittingNotificationEmail.value = false
  }
}

const openDeleteEmailConfirmDialog = (notification) => {
  deleteEmailConfirmDialog.emailId = notification._id
  deleteEmailConfirmDialog.emailName = notification.user?.name
  deleteEmailConfirmDialog.message = `您確定要刪除 <strong>${notification.user?.name}</strong> (${notification.user?.email}) 的通知設定嗎？此操作無法復原。`
  deleteEmailConfirmDialog.show = true
}

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

// 取得大分類標籤
const getCategoryLabel = (category) => {
  const categoryMap = {
    'printing': '印刷相關',
    'map': '地圖相關',
    'dm': 'DM相關',
    'electronic': 'IT相關', // 舊資料相容
    'itRelated': 'IT相關',
    'website': '網站相關',
    'other': '其他'
  }
  return categoryMap[category] || category
}


// 用戶下拉選單選項，排除已設定過的 user
// 用戶下拉選單選項，排除已設定過的 user（編輯模式下包含當前用戶）
const availableUsers = computed(() => {
  const usedUserIds = notificationEmails.value
    .filter(e => e._id !== notificationEmailDialog.value.id) // 編輯模式下排除當前記錄
    .map(e => e.user?._id)
  return users.value.filter(u => !usedUserIds.includes(u.value))
})

// 申請類型選項，排除已設定過的申請類型（編輯模式下包含當前申請類型）
const availableProductTypes = computed(() => {
  const usedProductTypes = taskConversionConfigs.value
    .filter(config => config._id !== taskConversionDialog.value.id) // 編輯模式下排除當前記錄
    .map(config => config.productType)
  return productTypeOptions.value.filter(option => !usedProductTypes.includes(option.value))
})

// 申請限制設定相關方法
const fetchProductTypeConfigs = async () => {
  productTypeConfigsLoading.value = true
  try {
    const { data } = await apiAuth.get('/marketing/product-type-configs')
    if (data.success) {
      productTypeConfigs.value = data.result
    }
  } catch (error) {
    console.error('取得申請限制設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得申請限制設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    productTypeConfigsLoading.value = false
  }
}

const openEditProductTypeConfigDialog = async (config) => {
  editProductTypeConfigForm.productType = config.productType
  editProductTypeConfigForm.displayName = config.displayName || getProductTypeLabel(config.productType)
  editProductTypeConfigForm.enableTimeLimit = config.enableTimeLimit || false
  editProductTypeConfigForm.applicationStartDate = config.applicationStartDate ? new Date(config.applicationStartDate) : null
  editProductTypeConfigForm.applicationEndDate = config.applicationEndDate ? new Date(config.applicationEndDate) : null
  editProductTypeConfigForm.enableQuotaLimit = config.enableQuotaLimit || false
  editProductTypeConfigForm.quotaLimit = config.quotaLimit || null
  editProductTypeConfigForm.regularQuota = config.regularQuota || config.quotaLimit || null
  editProductTypeConfigForm.quotaUsed = config.quotaUsed || 0
  editProductTypeConfigForm.note = config.note || ''
  editProductTypeConfigDialog.show = true
}

const closeEditProductTypeConfigDialog = () => {
  editProductTypeConfigDialog.show = false
  editProductTypeConfigForm.productType = ''
  editProductTypeConfigForm.displayName = ''
  editProductTypeConfigForm.enableTimeLimit = false
  editProductTypeConfigForm.applicationStartDate = null
  editProductTypeConfigForm.applicationEndDate = null
  editProductTypeConfigForm.enableQuotaLimit = false
  editProductTypeConfigForm.quotaLimit = null
  editProductTypeConfigForm.regularQuota = null
  editProductTypeConfigForm.quotaUsed = 0
  editProductTypeConfigForm.note = ''
}

const handleQuotaLimitChange = (newQuotaLimit) => {
  if (editProductTypeConfigForm.regularQuota !== null && editProductTypeConfigForm.regularQuota > newQuotaLimit) {
    editProductTypeConfigForm.regularQuota = newQuotaLimit
  }
  if (editProductTypeConfigForm.regularQuota === null && newQuotaLimit !== null) {
    editProductTypeConfigForm.regularQuota = newQuotaLimit
  }
}

const updateProductTypeConfig = async () => {
  const { valid } = await editProductTypeConfigFormRef.value.validate()
  if (!valid) return

  updatingProductTypeConfig.value = true
  try {
    const { data } = await apiAuth.put(`/marketing/product-type-configs/${editProductTypeConfigForm.productType}`, {
      enableTimeLimit: editProductTypeConfigForm.enableTimeLimit,
      applicationStartDate: editProductTypeConfigForm.applicationStartDate,
      applicationEndDate: editProductTypeConfigForm.applicationEndDate,
      enableQuotaLimit: editProductTypeConfigForm.enableQuotaLimit,
      quotaLimit: editProductTypeConfigForm.quotaLimit,
      regularQuota: editProductTypeConfigForm.regularQuota,
      note: editProductTypeConfigForm.note
    })

    if (data.success) {
      createSnackbar({
        text: '設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      closeEditProductTypeConfigDialog()
      await fetchProductTypeConfigs()
    }
  } catch (error) {
    console.error('更新申請限制設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新申請限制設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    updatingProductTypeConfig.value = false
  }
}

// 任務轉換設定相關方法
const openTaskConversionDialog = async () => {
  taskConversionDialog.value = {
    open: true,
    id: ''
  }
  editingLegacyCategoryName.value = ''
  taskConversionForm.value = {
    productType: '',
    project: '',
    taskCategoryId: '',
    creator: ''
  }
  await fetchAllProjects()
  await fetchAllUsers()
  await fetchProductTypes()
  allCategories.value = []
  if (taskConversionFormRef.value) {
    taskConversionFormRef.value.reset()
  }
}

const editTaskConversion = async (config) => {
  editingLegacyCategoryName.value = config.category || ''
  taskConversionForm.value = {
    productType: config.productType,
    project: config.project?._id || '',
    taskCategoryId: config.taskCategoryId ? String(config.taskCategoryId) : '',
    creator: config.creator?._id || ''
  }
  await fetchAllProjects()
  await fetchAllUsers()
  await fetchProductTypes()

  if (taskConversionForm.value.project) {
    await fetchAllCategories(taskConversionForm.value.project)
  }

  editingLegacyCategoryName.value = ''

  originalTaskConversionData.value = JSON.parse(JSON.stringify({
    id: config._id,
    productType: config.productType,
    project: taskConversionForm.value.project,
    taskCategoryId: String(taskConversionForm.value.taskCategoryId || ''),
    creator: taskConversionForm.value.creator
  }))

  taskConversionDialog.value = {
    open: true,
    id: config._id
  }
}

const closeTaskConversionDialog = () => {
  taskConversionDialog.value = {
    open: false,
    id: ''
  }
  editingLegacyCategoryName.value = ''
  taskConversionForm.value = {
    productType: '',
    project: '',
    taskCategoryId: '',
    creator: ''
  }
  allCategories.value = []
  originalTaskConversionData.value = {}
  if (taskConversionFormRef.value) {
    taskConversionFormRef.value.reset()
  }
}

const fetchTaskConversionConfigs = async () => {
  taskConversionConfigsLoading.value = true
  try {
    const params = {
      page: taskConversionCurrentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (taskConversionSortBy.value && taskConversionSortBy.value.length > 0 && taskConversionSortBy.value[0].key) {
      params.sortBy = taskConversionSortBy.value[0].key
      params.sortOrder = taskConversionSortBy.value[0].order || 'desc'
    }

    const { data } = await apiAuth.get('/marketing/task-conversion-configs', { params })
    if (data.success) {
      taskConversionConfigs.value = data.result?.data || data.result || []
      taskConversionTotalItems.value = data.result?.totalItems || taskConversionConfigs.value.length
    }
  } catch (error) {
    console.error('取得任務轉換設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得任務轉換設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    taskConversionConfigsLoading.value = false
  }
}

const fetchAllProjects = async () => {
  loadingAllProjects.value = true
  try {
    const { data } = await apiAuth.get('/marketing/task-conversion-configs/all-projects')
    if (data.success) {
      allProjects.value = data.result || []
    }
  } catch (error) {
    console.error('取得所有專案失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得所有專案失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingAllProjects.value = false
  }
}

const fetchAllUsers = async () => {
  loadingAllUsers.value = true
  try {
    const { data } = await apiAuth.get('/marketing/task-conversion-configs/all-users')
    if (data.success) {
      allUsers.value = (data.result || []).map(user => ({
        value: user._id,
        label: `${user.name} (${user.userId || ''})`
      }))
    }
  } catch (error) {
    console.error('取得所有用戶失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得所有用戶失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingAllUsers.value = false
  }
}

const handleTaskConversionProjectChange = async (projectId) => {
  if (!projectId) {
    allCategories.value = []
    taskConversionForm.value.taskCategoryId = ''
    return
  }
  taskConversionForm.value.taskCategoryId = ''
  await fetchAllCategories(projectId)
}

const fetchAllCategories = async (projectId) => {
  if (!projectId) {
    allCategories.value = []
    return
  }

  loadingAllCategories.value = true
  try {
    const { data } = await apiAuth.get(`/marketing/task-conversion-configs/all-categories/${projectId}`)
    if (data.success) {
      allCategories.value = (data.result || []).map(cat => ({
        _id: cat._id,
        name: cat.name
      }))
      // 如果只有一個分類，自動選擇（僅新增模式）
      if (!taskConversionDialog.value.id && allCategories.value.length === 1) {
        taskConversionForm.value.taskCategoryId = String(allCategories.value[0]._id)
      } else if (taskConversionDialog.value.id) {
        if (!taskConversionForm.value.taskCategoryId && editingLegacyCategoryName.value) {
          const match = allCategories.value.find(
            (cat) => cat.name === editingLegacyCategoryName.value
          )
          if (match) {
            taskConversionForm.value.taskCategoryId = String(match._id)
          }
        }
        const cur = taskConversionForm.value.taskCategoryId
        if (cur && !allCategories.value.some((cat) => String(cat._id) === String(cur))) {
          taskConversionForm.value.taskCategoryId = ''
        }
      }
    }
  } catch (error) {
    console.error('取得所有任務分類失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得所有任務分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingAllCategories.value = false
  }
}

const submitTaskConversion = async () => {
  if (isSubmittingTaskConversion.value) return

  // 觸發表單驗證
  const { valid } = await taskConversionFormRef.value.validate()
  if (!valid) return

  // 編輯模式：檢查資料是否有變更
  if (taskConversionDialog.value.id) {
    const currentData = {
      id: taskConversionDialog.value.id,
      productType: taskConversionForm.value.productType,
      project: taskConversionForm.value.project,
      taskCategoryId: String(taskConversionForm.value.taskCategoryId || ''),
      creator: taskConversionForm.value.creator
    }

    if (JSON.stringify(currentData) === JSON.stringify(originalTaskConversionData.value)) {
      createSnackbar({ text: '資料未做任何變更', snackbarProps: { color: 'red-lighten-1' } })
      return
    }
  }

  try {
    isSubmittingTaskConversion.value = true

    if (taskConversionDialog.value.id) {
      // 編輯模式
      const configData = {
        project: taskConversionForm.value.project,
        taskCategoryId: taskConversionForm.value.taskCategoryId,
        creator: taskConversionForm.value.creator
      }

      const { data } = await apiAuth.put(`/marketing/task-conversion-configs/${taskConversionDialog.value.id}`, configData)
      if (!data.success) {
        throw new Error(data.message || '更新失敗')
      }
      createSnackbar({
        text: '任務轉換設定更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      // 新增模式
      const configData = {
        productType: taskConversionForm.value.productType,
        project: taskConversionForm.value.project,
        taskCategoryId: taskConversionForm.value.taskCategoryId,
        creator: taskConversionForm.value.creator
      }

      const { data } = await apiAuth.post('/marketing/task-conversion-configs', configData)
      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }
      createSnackbar({
        text: '任務轉換設定新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeTaskConversionDialog()
    await fetchTaskConversionConfigs()
  } catch (error) {
    console.error('操作失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || error.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmittingTaskConversion.value = false
  }
}

const openDeleteTaskConversionConfirmDialog = (config) => {
  deleteTaskConversionConfirmDialog.configId = config._id
  const productTypeText = getProductTypeText(config.productType, { productType: config.productType })
  deleteTaskConversionConfirmDialog.message = `您確定要刪除申請類型「<strong>${productTypeText}</strong>」的任務轉換設定嗎？此操作無法復原。`
  deleteTaskConversionConfirmDialog.show = true
}

const confirmDeleteTaskConversion = async () => {
  const configId = deleteTaskConversionConfirmDialog.configId
  deletingTaskConversionId.value = configId
  try {
    const { data } = await apiAuth.delete(`/marketing/task-conversion-configs/${configId}`)
    if (data.success) {
      createSnackbar({
        text: '任務轉換設定刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await fetchTaskConversionConfigs()
    }
  } catch (error) {
    console.error('刪除任務轉換設定失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除任務轉換設定失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deletingTaskConversionId.value = null
    deleteTaskConversionConfirmDialog.show = false
  }
}

// 取得申請類型選項
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

// 表格選項變更處理
const handleNotificationEmailTableOptionsChange = async (options) => {
  if (options.page !== undefined) {
    notificationEmailCurrentPage.value = options.page
  }
  if (options.itemsPerPage !== undefined) {
    itemsPerPage.value = options.itemsPerPage
  }
  if (options.sortBy !== undefined) {
    notificationEmailSortBy.value = options.sortBy
  }
  await fetchNotificationEmails()
}

const handleTaskConversionTableOptionsChange = async (options) => {
  if (options.page !== undefined) {
    taskConversionCurrentPage.value = options.page
  }
  if (options.itemsPerPage !== undefined) {
    itemsPerPage.value = options.itemsPerPage
  }
  if (options.sortBy !== undefined) {
    taskConversionSortBy.value = options.sortBy
  }
  await fetchTaskConversionConfigs()
}

// 監聽 activeTab 變化，載入對應的資料
watch(activeTab, async (newTab) => {
  if (newTab === 'notificationEmail' && showNotificationEmailTab.value) {
    await fetchNotificationEmails()
    await fetchUsers()
  } else if (newTab === 'productTypeConfig' && showProductTypeConfigTab.value) {
    await fetchProductTypeConfigs()
  } else if (newTab === 'taskConversionConfig' && showTaskConversionConfigTab.value) {
    await fetchTaskConversionConfigs()
    await fetchAllProjects()
    await fetchAllUsers()
    await fetchProductTypes()
  }
}, { immediate: true })

onMounted(async () => {
  initializeActiveTab()

  // 根據當前 TAB 載入對應的資料
  if (activeTab.value === 'notificationEmail' && showNotificationEmailTab.value) {
    await fetchNotificationEmails()
    await fetchUsers()
  } else if (activeTab.value === 'productTypeConfig' && showProductTypeConfigTab.value) {
    await fetchProductTypeConfigs()
  } else if (activeTab.value === 'taskConversionConfig' && showTaskConversionConfigTab.value) {
    await fetchTaskConversionConfigs()
    await fetchAllProjects()
    await fetchAllUsers()
    await fetchProductTypes()
  }
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.notification-email-card {
  border: 1px solid #aaa;
  border-radius: 4px;
}

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
</style>

