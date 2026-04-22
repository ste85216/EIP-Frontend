<template>
  <v-container max-width="1600">
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-0 py-md-5 px-0">
          <!-- 載入中 / 錯誤 -->
          <div
            v-if="loading && !batch"
            class="d-flex align-center justify-center py-10"
          >
            <v-progress-circular
              indeterminate
              color="blue-grey-darken-2"
              size="32"
              class="me-3"
            />
            <span class="text-grey">載入中...</span>
          </div>
          <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mx-4 mt-4"
          >
            {{ error }}
          </v-alert>

          <template v-else-if="batch">
            <!-- 批次資訊 -->
            <div class="px-4 px-sm-6 pb-6 pt-3">
              <div class="d-flex align-center mb-1">
                <h3 class="me-1">
                  {{ batch.name || '_' }}
                </h3>
                <v-btn
                  v-if="canManageEvaluation"
                  icon
                  variant="text"
                  size="x-small"
                  color="grey"
                  @click="openBatchEditDialog"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <div class="text-body-2 text-grey-darken-1 d-flex align-center flex-wrap">
                <v-icon
                  icon="mdi-calendar-outline"
                  size="14"
                  color="grey-darken-1"
                  class="me-1"
                />
                年度：{{ batch.year || '_' }}{{ (batch.startDate || batch.dueDate) ? ' ｜' : '' }}
                <span
                  v-if="batch.startDate"
                  class="ms-2"
                >
                  <v-icon
                    icon="mdi-calendar-start"
                    size="14"
                    color="grey-darken-1"
                    class="me-1"
                  />
                  開始：{{ formatDate(batch.startDate) }}{{ batch.dueDate ? ' ｜' : '' }}
                </span>
                <span
                  v-if="batch.dueDate"
                  class="ms-2"
                >
                  <v-icon
                    icon="mdi-calendar-end"
                    size="14"
                    color="grey-darken-1"
                    class="me-1"
                  />
                  截止：{{ formatDate(batch.dueDate) }}
                </span>
              </div>
            </div>
            <v-divider class="py-1" />

            <!-- 搜尋條件區塊 -->
            <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-3">
              <v-row class="mb-2">
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  lg="2"
                  class="px-1 pe-sm-2 py-1"
                >
                  <div class="d-flex flex-column">
                    <span class="search-label">公司 :</span>
                    <v-select
                      v-model="searchCriteria.company"
                      :items="companyOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="請選擇公司"
                      hide-details
                      @update:model-value="onEvalSearchCompanyChange"
                    />
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  lg="2"
                  class="px-1 pe-sm-2 py-1"
                >
                  <div class="d-flex flex-column">
                    <span class="search-label">部門 :</span>
                    <v-select
                      v-model="searchCriteria.department"
                      :items="departmentOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      :placeholder="!searchCriteria.company ? '請先選擇公司' : '請選擇部門'"
                      hide-details
                      :disabled="!searchCriteria.company"
                    />
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  lg="2"
                  class="px-1 pe-sm-2 py-1"
                >
                  <div class="d-flex flex-column">
                    <span class="search-label">表單模板 :</span>
                    <v-select
                      v-model="searchCriteria.template"
                      :items="templateFilterOptions"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="請選擇表單模板"
                      hide-details
                    />
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="3"
                  lg="2"
                  class="px-1 pe-sm-2 py-1"
                >
                  <div class="d-flex flex-column">
                    <span class="search-label">狀態 :</span>
                    <v-select
                      v-model="searchCriteria.progressStatus"
                      :items="evalProgressFilterOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      placeholder="請選擇狀態"
                      clearable
                      hide-details
                    />
                  </div>
                </v-col>
                <div class="d-flex align-end pt-3 pb-2 ms-auto ms-sm-1 me-1">
                  <v-btn
                    color="grey"
                    elevation="1"
                    :size="smAndUp ? 'default' : 'small'"
                    @click="resetSearch"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </div>
              </v-row>
            </v-card-text>
            <v-divider class="my-0" />

            <!-- 新增按鈕 + 關鍵字搜尋 -->
            <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
              <v-col
                cols="12"
                class="ps-4 pb-sm-4"
              >
                <v-row class="d-flex align-center px-5 px-md-2">
                  <v-btn
                    v-if="canManageEvaluation"
                    color="teal-darken-2"
                    prepend-icon="mdi-plus"
                    variant="outlined"
                    :disabled="batch.status === 'sent'"
                    @click="openAddDialog"
                  >
                    新增考核表單
                  </v-btn>
                  <v-btn
                    v-if="evaluations.length > 0"
                    class="ms-3"
                    color="teal-darken-1"
                    prepend-icon="mdi-file-excel-outline"
                    elevation="1"
                    @click="openScoreExportDialog"
                  >
                    匯出
                  </v-btn>
                  <v-btn
                    v-if="canManageEvaluation && batch.status === 'draft' && invalidTemplates.length > 0"
                    color="orange-darken-1"
                    prepend-icon="mdi-alert"
                    variant="outlined"
                    class="ms-3"
                    @click="weightWarningDialogOpen = true"
                  >
                    權重異常
                  </v-btn>
                  <v-spacer />
                  <v-col
                    cols="7"
                    sm="6"
                    md="4"
                    lg="2"
                    class="px-1 my-1"
                  >
                    <v-text-field
                      v-model="evalKeywordSearch"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋考核對象"
                      append-inner-icon="mdi-magnify"
                      hide-details
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-card-text class="px-sm-6 px-md-7">
              <v-data-table-server
                v-if="evaluations.length > 0"
                v-model:items-per-page="evalItemsPerPage"
                v-model:page="evalPage"
                :headers="evalHeaders"
                :items="paginatedEvaluations"
                :items-length="filteredEvaluations.length"
                :loading="loadingEvaluations"
                :items-per-page-options="[10, 20, 50, 100]"
                hover
                density="compact"
                class="rounded-lg"
                @update:options="handleEvalOptionsChange"
              >
                <template #item="{ item, index }">
                  <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                    <td>{{ item.evaluateeDept || '_' }}</td>
                    <td>
                      {{ item.evaluateeName || '_' }}
                      <span
                        v-if="item.evaluateeEmployeeCode"
                        class="text-grey ms-1"
                      >({{ item.evaluateeEmployeeCode }})</span>
                    </td>
                    <td>{{ item.templateName || '_' }}</td>
                    <td class="text-center">
                      <v-chip
                        v-if="getEvaluationProgressChip(item).color"
                        size="small"
                        variant="tonal"
                        :color="getEvaluationProgressChip(item).color"
                      >
                        {{ getEvaluationProgressChip(item).text }}
                      </v-chip>
                      <span
                        v-else
                        class="text-grey"
                      >{{ getEvaluationProgressChip(item).text }}</span>
                    </td>
                    <td class="text-center">
                      <template v-if="batch.status === 'draft'">
                        <template v-if="canManageEvaluation">
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            color="light-blue-darken-2"
                            @click.stop="openEditDialog(item)"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            color="teal-darken-2"
                            @click.stop="openCopyEvaluationDialog(item)"
                          >
                            <v-icon>mdi-content-copy</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            color="red-lighten-1"
                            @click.stop="openDeleteConfirm(item)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </template>
                        <span
                          v-else
                          class="text-caption text-medium-emphasis"
                        >_</span>
                      </template>
                      <v-btn
                        v-else
                        variant="text"
                        color="blue-grey-darken-2"
                        icon
                        size="small"
                        @click.stop="openScoresDialog(item)"
                      >
                        <v-icon>mdi-chart-box-outline</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </v-data-table-server>
              <template v-else>
                <v-progress-linear
                  v-if="loadingEvaluations"
                  indeterminate
                  color="teal-darken-2"
                  class="mb-3"
                />
                <div
                  v-else
                  class="empty-state text-center py-12 border border-dashed border-md rounded-lg"
                >
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-clipboard-outline
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無考核表單
                  </h3>
                  <p
                    v-if="batch.status === 'draft' && canManageEvaluation"
                    class="text-body-2 text-medium-emphasis"
                  >
                    點擊「新增考核表單」開始新增
                  </p>
                  <p
                    v-else-if="batch.status === 'draft'"
                    class="text-body-2 text-medium-emphasis"
                  >
                    僅具檢視權限，無法新增考核表單
                  </p>
                </div>
              </template>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增/編輯考核表單對話框 -->
    <v-dialog
      v-model="formDialog.open"
      persistent
      max-width="1200"
    >
      <v-card class="rounded-lg form-dialog">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0 form-dialog-header"
        >
          <v-icon
            icon="mdi-clipboard-plus-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">{{ formDialog.isEdit ? '編輯考核表單' : '新增考核表單' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="formDialog.open = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-form
          ref="formDialogRef"
          class="d-flex flex-column flex-grow-1 form-dialog-form"
          @submit.prevent="submitForm"
        >
          <v-card-text class="px-6 py-6 form-dialog-content">
            <v-row class="mb-2">
              <v-col
                cols="12"
                sm="4"
                class="pb-0"
              >
                <v-select
                  v-model="formDialog.year"
                  :items="formDialogYearOptions"
                  label="* 年度"
                  variant="outlined"
                  density="compact"
                  placeholder="請選擇年度"
                  :rules="[v => v != null && v !== '' || '請選擇年度']"
                  clearable
                  @update:model-value="onFormDialogYearChange"
                />
              </v-col>
              <v-col
                cols="12"
                sm="4"
                class="pb-0"
              >
                <v-select
                  v-model="formDialog.template"
                  :items="formDialogTemplateOptions"
                  item-title="name"
                  item-value="_id"
                  label="* 表單模板"
                  variant="outlined"
                  density="compact"
                  placeholder="請選擇表單模板"
                  :rules="[v => !!v || '請選擇表單模板']"
                  :disabled="formDialog.year == null"
                  @update:model-value="onTemplateChange"
                />
              </v-col>
              <v-col
                cols="12"
                sm="4"
                class="pb-0"
              >
                <v-autocomplete
                  v-model="formDialog.evaluatee"
                  :items="filteredEmployeeOptions"
                  :item-title="item => item?.name ? `${item.name} (${getEmployeeDeptStr(item)})` : ''"
                  item-value="_id"
                  label="* 考核對象"
                  variant="outlined"
                  density="compact"
                  placeholder="請選擇考核對象"
                  :rules="[v => !!v || '請選擇考核對象']"
                  clearable
                />
              </v-col>
            </v-row>
            <div class="mb-3 d-flex align-center justify-space-between flex-wrap">
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-account-multiple-outline"
                  size="20"
                  color="teal-darken-2"
                  class="me-1"
                />
                <span class="text-subtitle-2">評核者</span>
                <span
                  v-if="!formDialog.template"
                  class="text-caption text-grey ms-1"
                >（請先選擇表單模板，才可勾選各評核者可見的部分）</span>
              </div>
              <div class="d-flex gap-2 mt-1 mt-sm-0">
                <v-btn
                  variant="outlined"
                  size="small"
                  color="blue-darken-2"
                  prepend-icon="mdi-office-building"
                  :disabled="!formDialog.template"
                  @click="openSelectDeptDialog"
                >
                  選擇部門
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  color="teal-darken-2"
                  class="ms-3"
                  prepend-icon="mdi-plus"
                  @click="addEvaluator"
                >
                  新增評核者
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  color="grey-darken-3"
                  class="ms-3"
                  prepend-icon="mdi-account-multiple-plus"
                  @click="openBatchAddDialog"
                >
                  批次新增
                </v-btn>
              </div>
            </div>
            <v-row>
              <v-col
                v-for="(ev, idx) in formDialog.evaluators"
                :key="idx"
                cols="12"
                sm="6"
              >
                <div class="pa-3 pt-4 rounded border h-100">
                  <div class="d-flex align-center mb-2 flex-wrap">
                    <v-autocomplete
                      v-model="ev.user"
                      :items="getEvaluatorOptions(idx)"
                      :item-title="item => getEvaluatorItemTitle(item)"
                      item-value="_id"
                      label="評核者"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      class="flex-grow-1 me-2"
                      style="min-width: 160px;"
                    />
                    <v-checkbox
                      v-if="formDialogTemplateSpecialAchievementEnabled"
                      v-model="ev.fillsSpecialAchievement"
                      hide-details
                      density="compact"
                      color="teal-darken-2"
                      label="特殊事蹟"
                      class="ms-sm-2 me-1"
                    />
                    <v-btn
                      v-if="formDialog.evaluators.length > 1"
                      icon
                      variant="plain"
                      size="small"
                      color="red-lighten-1"
                      @click="removeEvaluator(idx)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <div
                    v-if="selectedTemplateParts.length > 0"
                    class="text-caption text-grey-darken-1 mt-1"
                  >
                    可見部分：
                  </div>
                  <v-chip-group
                    v-if="visiblePartSegmentOptions.length > 0"
                    :model-value="evVisiblePartSegments(ev)"
                    multiple
                    mandatory
                    color="teal-darken-2"
                    @update:model-value="(val) => setEvVisiblePartSegments(ev, val)"
                  >
                    <v-chip
                      v-for="opt in visiblePartSegmentOptions"
                      :key="opt.value"
                      :value="opt.value"
                      :prepend-icon="evVisiblePartSegments(ev).includes(opt.value) ? 'mdi-check-circle' : ''"
                      size="small"
                      variant="outlined"
                    >
                      {{ opt.title }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-6 py-5 form-dialog-actions">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              @click="formDialog.open = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-2"
              type="submit"
              :loading="formDialog.submitting"
            >
              {{ formDialog.isEdit ? '儲存' : '新增' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 批次新增評核者對話框 -->
    <v-dialog
      v-model="batchAddDialogOpen"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-grey-darken-3 position-sticky top-0">
          <v-icon
            icon="mdi-account-multiple-plus"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">批次新增評核者</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="batchAddDialogOpen = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pt-7 pb-1">
          <v-text-field
            v-model.number="batchAddCount"
            label="新增數量"
            variant="outlined"
            density="compact"
            type="number"
            min="1"
            max="50"
            :rules="[
              v => v != null && v !== '' || '請輸入數量',
              v => (v >= 1 && v <= 50) || '數量需介於 1-50'
            ]"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="batchAddDialogOpen = false"
          >
            取消
          </v-btn>
          <v-btn
            color="grey-darken-3"
            variant="outlined"
            class="ms-2"
            @click="confirmBatchAdd"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 選擇部門對話框 -->
    <v-dialog
      v-model="selectDeptDialogOpen"
      persistent
      max-width="640"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-darken-1 position-sticky top-0">
          <v-icon
            icon="mdi-office-building"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">選擇部門</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="selectDeptDialogOpen = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pt-6 pb-1">
          <v-form
            ref="selectDeptFormRef"
            @submit.prevent="confirmSelectDept"
          >
            <v-row>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="selectDeptForm.company"
                  :items="selectDeptCompanyOptions"
                  item-title="name"
                  item-value="id"
                  label="公司"
                  variant="outlined"
                  density="compact"
                  clearable
                  :rules="[v => !!v || '請選擇公司']"
                  class="mb-4"
                  @update:model-value="selectDeptForm.department = null"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="selectDeptForm.department"
                  :items="selectDeptDepartmentOptions"
                  item-title="name"
                  item-value="id"
                  label="部門"
                  variant="outlined"
                  density="compact"
                  clearable
                  :rules="[v => !!v || '請選擇部門']"
                  class="mb-4"
                />
              </v-col>
            </v-row>
          </v-form>
          <div
            v-if="selectedTemplateParts.length > 0"
            class="text-caption text-grey-darken-1 mb-2"
          >
            可見部分：
          </div>
          <v-chip-group
            v-if="visiblePartSegmentOptions.length > 0"
            :model-value="selectDeptVisiblePartSegments()"
            multiple
            mandatory
            color="blue-darken-1"
            @update:model-value="(val) => setSelectDeptVisiblePartSegments(val)"
          >
            <v-chip
              v-for="opt in visiblePartSegmentOptions"
              :key="opt.value"
              :value="opt.value"
              :prepend-icon="selectDeptVisiblePartSegments().includes(opt.value) ? 'mdi-check-circle' : ''"
              size="small"
              variant="outlined"
            >
              {{ opt.title }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="selectDeptDialogOpen = false"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="outlined"
            class="ms-2"
            @click="confirmSelectDept"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 複製考核（表單與評核者）對話框 -->
    <v-dialog
      v-model="copyEvalDialog.open"
      persistent
      max-width="480"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0">
          <v-icon
            icon="mdi-content-copy"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">複製考核設定</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="copyEvalDialog.open = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pt-5 pb-2">
          <p class="text-grey-darken-3 mb-6">
            將「{{ copyEvalDialog.sourceName || '_' }}」的設定套用到以下員工（可多選）：
          </p>
          <v-row>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="copyEvalForm.company"
                :items="copyEvalCompanyOptions"
                item-title="name"
                item-value="id"
                label="公司"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                class="mb-3"
                @update:model-value="copyEvalForm.department = null; copyEvalForm.selectedEmployees = []"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="copyEvalForm.department"
                :items="copyEvalDepartmentOptions"
                item-title="name"
                item-value="id"
                label="部門"
                variant="outlined"
                density="compact"
                clearable
                class="mb-3"
                @update:model-value="copyEvalForm.selectedEmployees = []"
              />
            </v-col>
          </v-row>
          <v-select
            v-model="copyEvalForm.selectedEmployees"
            :items="copyEvalEmployeeOptions"
            item-title="displayName"
            item-value="_id"
            label="員工"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            placeholder="請選擇考核對象"
            :disabled="!copyEvalForm.company || !copyEvalForm.department"
          >
            <template #prepend-item>
              <v-list-item
                title="全選員工"
                prepend-icon="mdi-checkbox-multiple-marked"
                :active="copyEvalEmployeeAllSelected"
                :disabled="!copyEvalForm.company || !copyEvalForm.department || copyEvalEmployeeOptions.length === 0"
                @click="toggleCopyEvalEmployeesAll"
              />
              <v-divider class="my-2" />
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="copyEvalDialog.open = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :loading="copyEvalDialog.submitting"
            :disabled="!copyEvalForm.selectedEmployees?.length"
            @click="doCopyEvaluation"
          >
            複製
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 編輯考核批次資訊對話框 -->
    <v-dialog
      v-model="batchEditDialogOpen"
      persistent
      max-width="380"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 mb-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-pencil"
            size="20"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">編輯考核批次</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            color="white"
            size="32"
            @click="batchEditDialogOpen = false"
          >
            <v-icon size="22">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-form
          ref="batchEditFormRef"
          @submit.prevent="saveBatchInfo"
        >
          <v-card-text class="px-6 py-4">
            <v-text-field
              v-model="batchEditForm.name"
              label="* 考核名稱"
              variant="outlined"
              density="compact"
              :rules="[v => !!v?.trim() || '請輸入考核名稱']"
              class="mb-3"
            />
            <v-date-input
              v-model="batchEditForm.startDate"
              label="開始日期"
              variant="outlined"
              density="compact"
              clearable
              prepend-icon
              ok-text="確認"
              cancel-text="取消"
              class="mb-3"
              :rules="[batchEditStartDateRule]"
              @click:clear="batchEditForm.startDate = null"
              @update:model-value="() => batchEditFormRef?.validate?.()"
            />
            <v-date-input
              v-model="batchEditForm.dueDate"
              label="截止日期"
              variant="outlined"
              density="compact"
              clearable
              prepend-icon
              ok-text="確認"
              cancel-text="取消"
              class="mb-3"
              :rules="[batchEditDueDateRule]"
              @click:clear="batchEditForm.dueDate = null"
              @update:model-value="() => batchEditFormRef?.validate?.()"
            />
            <v-select
              v-model="batchEditForm.attendance"
              label="出勤項目（選填，考核評分表將帶入此出勤分數）"
              :items="batchEditAttendanceOptions"
              item-title="displayName"
              item-value="_id"
              variant="outlined"
              density="compact"
              clearable
              placeholder="請選擇出勤項目"
              :loading="batchEditAttendanceLoading"
              class="mb-2"
            />
            <v-switch
              v-model="batchEditForm.notifyAtStart"
              label="開始日 07:30 自動發送通知"
              color="teal-darken-1"
              density="compact"
              class="ms-1"
              hide-details
              :disabled="!batchEditNotifyAtStartEligible"
            />
            <div
              v-if="!batchEditNotifyAtStartEligible"
              class="text-caption text-medium-emphasis ms-1"
            >
              請先設定開始日期，方可啟用開始日自動通知
            </div>
          </v-card-text>
          <v-card-actions class="px-6 py-5">
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              type="button"
              @click="batchEditDialogOpen = false"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-2"
              type="submit"
              :loading="batchEditSubmitting"
            >
              儲存
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="sendConfirmOpen"
      dialog-width="320"
      title="確認發送考核"
      message="確定要發送此考核批次作業嗎？發送後仍可修改批次名稱、起訖日期與出勤項目。"
      confirm-button-text="發送"
      header-icon="mdi-send"
      :close-on-confirm="false"
      :confirm-loading="sendSubmitting"
      @confirm="doSendBatch"
    />

    <ConfirmDialog
      v-model="postSendNotifyOpen"
      dialog-width="380"
      title="發送通知"
      :message="postSendNotifyMessageHtml"
      confirm-button-text="立即發送"
      cancel-button-text="稍後再說"
      header-icon="mdi-bell-ring-outline"
      :close-on-confirm="false"
      :confirm-loading="postSendNotifyLoading"
      @confirm="confirmPostSendNotify"
    />

    <ConfirmDialog
      v-model="resendNotifyOpen"
      dialog-width="380"
      title="再次發送通知"
      :message="resendNotifyMessageHtml"
      confirm-button-text="發送"
      cancel-button-text="取消"
      header-icon="mdi-bell-ring-outline"
      header-color="bg-teal-darken-2"
      :close-on-confirm="false"
      :confirm-loading="resendNotifyLoading"
      @confirm="confirmResendNotify"
    />

    <ConfirmDeleteDialogWithTextField
      v-model="recallConfirmOpen"
      title="確認收回考核"
      :message="recallConfirmMessageHtml"
      :expected-name="recallConfirmExpectedName"
      confirm-button-text="收回"
      confirm-button-color="orange-darken-2"
      header-color="bg-orange-darken-2"
      input-label-for-confirm="本批次名稱"
      cancel-button-text="取消"
      @confirm="doRecallBatch"
    />

    <ConfirmDeleteDialog
      v-model="deleteConfirmOpen"
      dialog-width="320"
      title="確認刪除"
      :message="deleteEvaluationConfirmMessage"
      confirm-button-text="刪除"
      @confirm="doDeleteEvaluation"
    />

    <v-dialog
      v-model="weightWarningDialogOpen"
      max-width="480"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-orange-darken-1 position-sticky top-0">
          <v-icon
            icon="mdi-alert"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">權重異常</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="weightWarningDialogOpen = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-6">
          <p class=" mb-3">
            以下表單的「 部分權重 」與「 出勤權重 」不符，請先至考核表單管理調整後再發送：
          </p>
          <ul class="ps-4">
            <li
              v-for="t in invalidTemplates"
              :key="t.name"
              class="mb-1"
            >
              <strong>{{ t.name }}</strong>：目前 - {{ t.currentPct }}%／應為 - {{ t.expectedPct }}%
            </li>
          </ul>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 評分彙總對話框 -->
    <v-dialog
      v-model="scoresDialogOpen"
      max-width="98vw"
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-chart-box-outline"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">考核評分表</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="scoresDialogOpen = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pt-3 pb-5">
          <!-- 資訊提示 -->
          <div
            v-if="scoresDialogData"
            class="mb-4 mt-3 rounded"
          >
            <div class="card-title d-flex align-center flex-wrap">
              <span class="font-weight-bold me-3 text-grey-darken-3">考核對象 :</span>
              <span class="text-blue-grey-darken-2">{{ scoresDialogData.evaluateeName || '_' }}{{ scoresDialogData.evaluateeEmployeeCode ? ` (${scoresDialogData.evaluateeEmployeeCode})` : '' }}</span>
              <span class="font-weight-bold ms-4 me-3 text-grey-darken-3">公司部門 :</span>
              <span class="text-blue-grey-darken-2">{{ scoresDialogData.evaluateeDept || '_' }}</span>
              <v-btn
                v-if="scoresDialogHasSpecialAchievements"
                icon
                variant="text"
                color="amber-darken-2"
                size="36"
                class="ms-2"
                aria-label="檢視特殊事蹟"
                @click="openSpecialAchievementsDialog"
              >
                <v-icon size="20">
                  mdi-trophy-variant
                </v-icon>
              </v-btn>
            </div>
          </div>
          <div
            v-if="scoresDialogLoading"
            class="py-10 text-center overflow-y-auto"
          >
            <v-progress-circular
              indeterminate
              color="teal-darken-2"
            />
          </div>
          <div
            v-else-if="scoresDialogData"
            class="scores-table-wrapper overflow-y-auto"
          >
            <table class="scores-summary-table">
              <thead>
                <tr>
                  <th class="sticky-col">
                    評核者
                  </th>
                  <template
                    v-for="(part, pIdx) in scoresDialogData.parts"
                    :key="pIdx"
                  >
                    <th
                      v-for="(q, qIdx) in part.questions"
                      :key="`${pIdx}-${qIdx}`"
                      :colspan="1"
                    >
                      {{ q.title }}
                    </th>
                    <th
                      v-for="col in (partScoreColumns[pIdx] || [])"
                      :key="`${pIdx}-${col.sIdx}`"
                      class="part-total-col"
                    >
                      {{ col.label }}
                    </th>
                  </template>
                  <th
                    v-if="(scoresDialogData.attendanceWeight ?? 0) > 0"
                    class="attendance-col"
                  >
                    出勤分數 ({{ Math.round((scoresDialogData.attendanceWeight || 0) * 100) }}%)
                  </th>
                  <th class="total-col">
                    加權總分
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rIdx) in scoresDialogData.evaluatorRows"
                  :key="rIdx"
                >
                  <td class="sticky-col">
                    {{ row.evaluatorName }}
                    <v-chip
                      v-if="row.evaluatorStatus === 'abandoned'"
                      size="x-small"
                      color="orange"
                      class="ms-1"
                    >
                      已放棄
                    </v-chip>
                    <v-chip
                      v-else-if="!row.isCompleted"
                      size="x-small"
                      color="grey"
                      class="ms-1"
                    >
                      尚未填寫
                    </v-chip>
                  </td>
                  <template
                    v-for="(part, pIdx) in scoresDialogData.parts"
                    :key="pIdx"
                  >
                    <template
                      v-for="(q, qIdx) in part.questions"
                      :key="`${pIdx}-${qIdx}`"
                    >
                      <td>
                        {{ row.isCompleted ? (row.scores[`${pIdx}-${qIdx}`] ?? '_') : '_' }}
                      </td>
                    </template>
                    <template
                      v-for="col in (partScoreColumns[pIdx] || [])"
                      :key="`${pIdx}-${col.sIdx}`"
                    >
                      <td
                        v-if="scoresTotals && rIdx === 0"
                        class="part-total-col font-weight-bold"
                        :rowspan="(scoresDialogData.evaluatorRows?.length || 0) + 1"
                      >
                        {{ scoresTotals.partSegmentScores?.[pIdx]?.[col.sIdx] ?? '_' }}
                      </td>
                      <td
                        v-else-if="!scoresTotals"
                        class="part-total-col font-weight-medium"
                      >
                        -
                      </td>
                    </template>
                  </template>
                  <template v-if="(scoresDialogData.attendanceWeight ?? 0) > 0">
                    <td
                      v-if="scoresTotals && rIdx === 0"
                      class="attendance-col font-weight-bold"
                      :rowspan="(scoresDialogData.evaluatorRows?.length || 0) + 1"
                    >
                      {{ scoresTotals.attendanceScore ?? '_' }}
                    </td>
                    <td
                      v-else-if="!scoresTotals"
                      class="attendance-col"
                    >
                      -
                    </td>
                  </template>
                  <td
                    v-if="scoresTotals && rIdx === 0"
                    class="total-col font-weight-bold"
                    :rowspan="(scoresDialogData.evaluatorRows?.length || 0) + 1"
                  >
                    {{ scoresTotals.totalScore ?? '_' }}
                  </td>
                  <td
                    v-else-if="!scoresTotals"
                    class="total-col font-weight-bold"
                  >
                    {{ row.isCompleted ? formatTotalWeightedScore(row) : '_' }}
                  </td>
                </tr>
                <!-- TOTAL 列（部分總分、出勤、加權總分由 rowspan 涵蓋，此列只顯示題目平均） -->
                <tr
                  v-if="scoresTotals"
                  class="scores-total-row"
                >
                  <td class="sticky-col font-weight-bold">
                    TOTAL
                  </td>
                  <template
                    v-for="(part, pIdx) in scoresDialogData.parts"
                    :key="pIdx"
                  >
                    <template
                      v-for="(q, qIdx) in part.questions"
                      :key="`${pIdx}-${qIdx}`"
                    >
                      <td class="font-weight-medium">
                        {{ scoresTotals.questionScores[`${pIdx}-${qIdx}`] ?? '_' }}
                      </td>
                    </template>
                  </template>
                </tr>
              </tbody>
            </table>
            <p class="text-caption text-grey mt-3 mb-0">
              說明：部分分數 = 所有評核者中有填寫的欄位分數加總 ÷ 有填寫欄位數，再 × 權重；有拆開加權時，各別計算後加總；加權總分含出勤分數。
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="specialAchievementDialogOpen"
      max-width="520"
      scrollable
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-amber-darken-3 position-sticky top-0"
        >
          <v-icon
            icon="mdi-trophy-variant"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">特殊事蹟</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="specialAchievementDialogOpen = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-5 ">
          <div
            v-if="specialAchievementDialogLines.length"
            class="text-body-2 text-medium-emphasis mb-4 d-flex align-start"
          >
            <v-icon
              icon="mdi-information-outline"
              size="18"
              color="amber-darken-2"
              class="me-1 mt-0"
            />
            <span>以下為各評核者針對該員工填寫的特殊事蹟。</span>
          </div>
          <div
            v-if="specialAchievementDialogLines.length"
            class="d-flex flex-column ga-4"
          >
            <v-card
              v-for="(line, i) in specialAchievementDialogLines"
              :key="i"
              variant="flat"
              elevation="0"
              class="special-achievement-card rounded-lg overflow-hidden"
            >
              <div class="d-flex align-stretch">
                <div
                  class="special-achievement-card-accent flex-shrink-0"
                  aria-hidden="true"
                />
                <div class="flex-grow-1 pa-4 bg-white min-width-0">
                  <div>
                    <div>
                      <div class="text-subtitle-1 font-weight-medium text-grey-darken-3 mb-3 ps-1">
                        {{ line.evaluatorName || '_' }}
                      </div>
                      <v-sheet
                        color="amber-lighten-5"
                        rounded="lg"
                        class="pa-3"
                      >
                        <div class="d-flex align-start ga-2">
                          <v-icon
                            icon="mdi-format-quote-open"
                            size="22"
                            color="amber-darken-1"
                            class="flex-shrink-0 mt-n1"
                          />
                          <div class="text-body-2 text-grey-darken-3 pre-wrap flex-grow-1 min-width-0">
                            {{ line.text }}
                          </div>
                        </div>
                      </v-sheet>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
          <div
            v-else
            class="text-center text-medium-emphasis py-8"
          >
            <v-icon
              icon="mdi-text-box-outline"
              size="40"
              color="grey-lighten-1"
              class="mb-2"
            />
            <div>尚無特殊事蹟內容。</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="scoreExportDialog.open"
      max-width="340"
      :persistent="scoreExportDialog.loading"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="d-flex align-center px-6 py-2 bg-teal-darken-2 position-sticky top-0"
        >
          <v-icon
            icon="mdi-download"
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          />
          <span class="card-title text-white">匯出考核 Excel</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            :disabled="scoreExportDialog.loading"
            @click="closeScoreExportDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pt-6 pb-0">
          <v-select
            v-model="scoreExportDialog.company"
            :items="scoreExportCompanyOptions"
            item-title="name"
            item-value="id"
            label="*公司"
            variant="outlined"
            density="compact"
            :error-messages="scoreExportDialog.companyError"
            @update:model-value="onScoreExportCompanyChange"
          />
          <v-select
            v-model="scoreExportDialog.departments"
            class="mt-4"
            :items="scoreExportDepartmentOptions"
            item-title="name"
            item-value="id"
            :label="scoreExportDialog.company === SCORE_EXPORT_ALL_COMPANIES ? '部門' : '*部門'"
            variant="outlined"
            density="compact"
            multiple
            chips
            closable-chips
            clearable
            :disabled="!scoreExportDialog.company || scoreExportDialog.company === SCORE_EXPORT_ALL_COMPANIES"
            :error-messages="scoreExportDialog.departmentError"
            @update:model-value="scoreExportDialog.departmentError = ''"
          >
            <template
              v-if="scoreExportDialog.company && scoreExportDialog.company !== SCORE_EXPORT_ALL_COMPANIES"
              #prepend-item
            >
              <v-list-item
                title="全選部門"
                prepend-icon="mdi-checkbox-multiple-marked"
                :active="scoreExportDepartmentAllSelected"
                @click="toggleScoreExportDepartmentsAll"
              />
              <v-divider class="my-2" />
            </template>
          </v-select>
          <p
            v-if="scoreExportDialog.company === SCORE_EXPORT_ALL_COMPANIES"
            class="text-caption text-medium-emphasis mb-0"
          >
            將匯出本批次所有公司、所有部門之員工資料。
          </p>
        </v-card-text>
        <v-card-actions class="px-6 py-5">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            type="button"
            :disabled="scoreExportDialog.loading"
            @click="closeScoreExportDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :loading="scoreExportDialog.loading"
            @click="doScoreExportExcel"
          >
            下載
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { definePage } from 'vue-router/auto'
import * as XLSX from 'xlsx'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useEvaluationBatchDetailBar } from '@/composables/useEvaluationBatchDetailBar'
import { buildSheetRowsFromGrouped } from '@/utils/evaluationScoresExport'
import { dateToYmdLocal } from '@/utils/format'
import { usePermissionStore } from '@/stores/permission'

definePage({
  meta: {
    title: '考核批次詳情 | Ystravel',
    login: true,
    permissions: ['EVALUATION_MANAGEMENT_READ', 'EVALUATION_MANAGEMENT_MANAGE']
  }
})

const route = useRoute()
const router = useRouter()
const { smAndUp } = useDisplay()
const evaluationBatchDetailBar = useEvaluationBatchDetailBar()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const permissionStore = usePermissionStore()
const canManageEvaluation = computed(() => permissionStore.hasPermission('EVALUATION_MANAGEMENT_MANAGE'))

const batchId = computed(() => route.params.batchId)

const batch = ref(null)
const evaluations = ref([])
const loading = ref(true)
const evalPage = ref(1)
const evalKeywordSearch = ref('')
const evalProgressFilterOptions = [
  { title: '進行中', value: 'in_progress' },
  { title: '已完成', value: 'complete' }
]

const searchCriteria = reactive({
  company: null,
  department: null,
  template: null,
  progressStatus: null
})
const evalItemsPerPage = ref(10)
const evalHeaders = [
  { title: '公司部門', key: 'evaluateeDept', sortable: false },
  { title: '考核對象', key: 'evaluateeName', sortable: false },
  { title: '表單模板', key: 'templateName', sortable: false },
  { title: '狀態', key: 'progressStatus', sortable: false, width: 148, align: 'center' },
  { title: '操作', key: 'actions', sortable: false, width: 160, align: 'center' }
]
const loadingEvaluations = ref(false)
const error = ref('')
const sendSubmitting = ref(false)
const sendConfirmOpen = ref(false)
const postSendNotifyOpen = ref(false)
const postSendNotifyLoading = ref(false)
const resendNotifyOpen = ref(false)
const resendNotifyLoading = ref(false)
const recallConfirmOpen = ref(false)
const deleteConfirmOpen = ref(false)
const deleteTarget = ref(null)

function escapeHtmlPlain (s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const deleteEvaluationConfirmMessage = computed(() => {
  const t = deleteTarget.value
  const label = t
    ? `${t.evaluateeName || '_'}${t.evaluateeEmployeeCode ? ` (${t.evaluateeEmployeeCode})` : ''}`
    : '_'
  return `確定要刪除「<strong>${escapeHtmlPlain(label)}</strong>」的考核表單嗎？`
})

const recallConfirmExpectedName = computed(() => batch.value?.name ?? '')

const recallConfirmMessageHtml = computed(() => {
  const name = recallConfirmExpectedName.value
  if (!name) {
    return '此批次<strong>尚未設定名稱</strong>，請先編輯批次填寫名稱後再使用「收回」。'
  }
  return (
    '收回後，所有已填寫的評分將<strong>清空</strong>，所有人需重新填寫；收回後可編輯並重新發送。<br><br>' +
    `請在下方輸入框<strong>完整輸入</strong>本批次名稱「<strong>${escapeHtmlPlain(name)}</strong>」以確認收回。`
  )
})

const postSendNotifyMessageHtml =
  '考核已發送。是否<span class="font-weight-medium">現在</span>對相關評核者與考核對象發送 Email、LINE 與站內通知？'

const resendNotifyMessageHtml = computed(() => {
  const name = escapeHtmlPlain(batch.value?.name || '_')
  return `確定要再次對「<span class="text-teal-darken-1 font-weight-bold">${name}</span>」相關人員發送 Email、LINE 與站內通知嗎？`
})

/** 匯出 Excel：公司選「所有公司」時的值（單選：一個公司或全部） */
const SCORE_EXPORT_ALL_COMPANIES = '__ALL_COMPANIES__'

const scoreExportDialog = reactive({
  open: false,
  loading: false,
  company: null,
  departments: [],
  companyError: '',
  departmentError: ''
})
const scoresDialogOpen = ref(false)
const scoresDialogData = ref(null)
const scoresDialogLoading = ref(false)
const specialAchievementDialogOpen = ref(false)
const specialAchievementDialogLines = ref([])

const scoresDialogHasSpecialAchievements = computed(() =>
  (scoresDialogData.value?.specialAchievementLines || []).length > 0
)

function openSpecialAchievementsDialog () {
  const lines = scoresDialogData.value?.specialAchievementLines
  specialAchievementDialogLines.value = Array.isArray(lines) ? [...lines] : []
  specialAchievementDialogOpen.value = true
}

const round1 = (n) => Math.round(n * 10) / 10

/** 考核評分表：有 subWeights 時依 segment 分組計算；partSegmentScores[pIdx][sIdx] = 該 segment 加權分 */
const scoresTotals = computed(() => {
  const data = scoresDialogData.value
  if (!data?.evaluatorRows?.length) return null

  const questionScores = {}
  const partScores = {}
  const partSegmentScores = {}
  let totalFromRounded = 0

  data.parts?.forEach((part, pIdx) => {
    const questions = part.questions || []
    const subWeights = part.subWeights && part.subWeights.length > 1 ? part.subWeights : null
    let weighted = null

    questions.forEach((_, qIdx) => {
      const key = `${pIdx}-${qIdx}`
      let qSum = 0
      let qCount = 0
      data.evaluatorRows.forEach((row) => {
        const v = row.scores?.[key]
        if (v != null && typeof v === 'number' && !isNaN(v)) {
          qSum += v
          qCount++
        }
      })
      questionScores[key] = qCount > 0 ? (qSum / qCount).toFixed(1) : '_'
    })

    if (subWeights) {
      partSegmentScores[pIdx] = {}
      let partWeightedSum = 0
      subWeights.forEach((sw, sIdx) => {
        const segEvaluators = data.evaluatorRows.filter((r) => {
          const hasScores = questions.some((_, qIdx) => {
            const v = r.scores?.[`${pIdx}-${qIdx}`]
            return v != null && typeof v === 'number' && !isNaN(v)
          })
          if (!hasScores) return false
          const val = r.partSegmentIndex?.[String(pIdx)] ?? r.partSegmentIndex?.[pIdx]
          const segIdx = val != null ? Number(val) : 0
          return !Number.isNaN(segIdx) && segIdx === sIdx
        })
        let segSum = 0
        let segCount = 0
        questions.forEach((_, qIdx) => {
          const key = `${pIdx}-${qIdx}`
          segEvaluators.forEach((row) => {
            const v = row.scores?.[key]
            if (v != null && typeof v === 'number' && !isNaN(v)) {
              segSum += v
              segCount++
            }
          })
        })
        const segAvg = segCount > 0 ? segSum / segCount : null
        const swVal = sw?.weight ?? 0
        const segWeighted = segAvg != null && swVal > 0 ? segAvg * swVal : null
        const segRounded = segWeighted != null ? round1(segWeighted) : null
        partSegmentScores[pIdx][sIdx] = segRounded != null ? segRounded.toFixed(1) : '_'
        if (segRounded != null) partWeightedSum += segRounded
      })
      weighted = partWeightedSum > 0 ? partWeightedSum : null
    } else {
      partSegmentScores[pIdx] = { 0: '_' }
      let partSum = 0
      let partCount = 0
      questions.forEach((_, qIdx) => {
        const key = `${pIdx}-${qIdx}`
        data.evaluatorRows.forEach((row) => {
          const v = row.scores?.[key]
          if (v != null && typeof v === 'number' && !isNaN(v)) {
            partSum += v
            partCount++
          }
        })
      })
      const partAvg = partCount > 0 ? partSum / partCount : null
      const weight = part.weight ?? 0
      weighted = partAvg != null ? partAvg * weight : null
      const rounded = weighted != null ? round1(weighted) : null
      partSegmentScores[pIdx][0] = rounded != null ? rounded.toFixed(1) : '_'
    }

    const rounded = weighted != null ? round1(weighted) : null
    partScores[pIdx] = rounded != null ? rounded.toFixed(1) : '_'
    if (rounded != null) totalFromRounded += rounded
  })

  const attWeight = data.attendanceWeight ?? 0
  const attScore = data.attendanceScore
  const attWeighted = attScore != null && attWeight > 0 ? attScore * attWeight : null
  const attRounded = attWeighted != null ? round1(attWeighted) : null
  if (attRounded != null) totalFromRounded += attRounded
  const totalScore = totalFromRounded > 0 ? round1(totalFromRounded).toFixed(1) : '_'

  return {
    questionScores,
    partScores,
    partSegmentScores,
    totalScore,
    attendanceScore: attRounded != null ? attRounded.toFixed(1) : (attScore != null ? attScore.toFixed(1) : '_'),
    attendanceWeight: attWeight,
    attendanceFormTemplateName: data.attendanceFormTemplateName || '_'
  }
})

/** 每個部分的「分數欄」清單：有 subWeights 時一欄一 segment，否則一欄 */
const partScoreColumns = computed(() => {
  const parts = scoresDialogData.value?.parts || []
  return parts.map((part) => {
    const sw = part.subWeights && part.subWeights.length > 1 ? part.subWeights : null
    if (sw) {
      return sw.map((s, sIdx) => ({ sIdx, label: `${part.title || '部分'}-${s.label || `選項${sIdx + 1}`}(${Math.round((s.weight || 0) * 100)}%)` }))
    }
    return [{ sIdx: 0, label: `${part.title || '部分'}(${Math.round((part.weight || 0) * 100)}%)` }]
  })
})

const templateOptions = ref([])
const employeeOptions = ref([])
const userOptions = ref([])
const templateDetails = ref({})

const formDialogRef = ref(null)
const batchEditFormRef = ref(null)
const batchEditDialogOpen = ref(false)
const batchEditSubmitting = ref(false)
const batchAddDialogOpen = ref(false)
const batchAddCount = ref(1)
const invalidTemplates = ref([])
const weightWarningDialogOpen = ref(false)
const selectDeptDialogOpen = ref(false)
const selectDeptFormRef = ref(null)
const selectDeptForm = reactive({
  company: null,
  department: null,
  visibleParts: [],
  partSegmentIndex: {}
})
const copyEvalDialog = reactive({ open: false, submitting: false, sourceItem: null, sourceName: '' })
const copyEvalForm = reactive({
  company: null,
  department: null,
  selectedEmployees: []
})
const batchEditAttendanceOptions = ref([])
const batchEditAttendanceLoading = ref(false)
const batchEditForm = reactive({
  name: '',
  startDate: null,
  dueDate: null,
  attendance: null,
  notifyAtStart: false
})

function isStartDateOnOrAfterToday (d) {
  if (!d) return false
  const sd = d instanceof Date ? new Date(d.getTime()) : new Date(d)
  if (isNaN(sd.getTime())) return false
  const t = new Date()
  sd.setHours(0, 0, 0, 0)
  t.setHours(0, 0, 0, 0)
  return sd.getTime() >= t.getTime()
}

const batchEditNotifyAtStartEligible = computed(() => isStartDateOnOrAfterToday(batchEditForm.startDate))

function batchEditStartDateRule (v) {
  if (!v) return true
  if (!batchEditForm.dueDate) return true
  return new Date(v).getTime() <= new Date(batchEditForm.dueDate).getTime() || '開始日期不能晚於截止日期'
}

function batchEditDueDateRule (v) {
  if (!v) return true
  if (!batchEditForm.startDate) return true
  return new Date(v).getTime() >= new Date(batchEditForm.startDate).getTime() || '截止日期不能早於開始日期'
}

const formDialog = reactive({
  open: false,
  isEdit: false,
  id: null,
  year: null,
  template: null,
  evaluatee: null,
  evaluators: [{ user: null, visibleParts: [], partSegmentIndex: {}, fillsSpecialAchievement: false }],
  submitting: false
})

/** 年度選項：從考核表單模板取得 */
const formDialogYearOptions = computed(() => {
  const set = new Set()
  templateOptions.value.forEach((t) => {
    if (t.year != null) set.add(t.year)
  })
  return [...set].filter(Boolean).sort((a, b) => b - a)
})

/** 表單模板選項：依所選年度篩選 */
const formDialogTemplateOptions = computed(() => {
  if (formDialog.year == null) return []
  return templateOptions.value.filter(t => t.year == null || t.year === formDialog.year)
})

const selectedTemplateParts = computed(() => {
  if (!formDialog.template) return []
  const fromOptions = templateOptions.value.find(t => String(t._id) === String(formDialog.template))
  if (fromOptions?.parts?.length) return fromOptions.parts
  const fromDetails = templateDetails.value[formDialog.template]
  return fromDetails?.parts || []
})

const formDialogTemplateSpecialAchievementEnabled = computed(() => {
  const tid = formDialog.template
  if (!tid) return false
  const t = templateOptions.value.find(x => String(x._id) === String(tid)) || templateDetails.value[tid]
  return Boolean(t?.specialAchievementEnabled)
})

/** 可見部分選項：有 subWeights 的 part 拆成多個選項（如 跨部門評核 - 主管、跨部門評核 - 其他人） */
const visiblePartSegmentOptions = computed(() => {
  const parts = selectedTemplateParts.value
  const opts = []
  parts.forEach((part, pIdx) => {
    const sw = part.subWeights
    if (sw && sw.length > 1) {
      sw.forEach((s, sIdx) => {
        opts.push({
          value: `${pIdx}-${sIdx}`,
          title: `${part.title || `第${pIdx + 1}部分`} - ${s.label || `選項${sIdx + 1}`}`
        })
      })
    } else {
      opts.push({
        value: String(pIdx),
        title: part.title || `第${pIdx + 1}部分`
      })
    }
  })
  return opts
})

function evVisiblePartSegments (ev) {
  const parts = selectedTemplateParts.value
  const segs = []
  const vp = Array.isArray(ev.visibleParts) ? ev.visibleParts : []
  const psi = ev.partSegmentIndex && typeof ev.partSegmentIndex === 'object' ? ev.partSegmentIndex : {}
  vp.forEach((pIdx) => {
    const part = parts[pIdx]
    const sw = part?.subWeights
    if (sw && sw.length > 1) {
      const n = psi[pIdx] != null ? Number(psi[pIdx]) : (psi[String(pIdx)] != null ? Number(psi[String(pIdx)]) : 0)
      const sIdx = !isNaN(n) && n >= 0 ? n : 0
      segs.push(`${pIdx}-${sIdx}`)
    } else {
      segs.push(String(pIdx))
    }
  })
  return segs
}

function setEvVisiblePartSegments (ev, newSegs) {
  const partToVal = {}
  newSegs.forEach((v) => {
    const pIdx = v.includes('-') ? parseInt(String(v).split('-')[0], 10) : parseInt(v, 10)
    partToVal[pIdx] = v
  })
  const visibleParts = []
  const partSegmentIndex = {}
  Object.entries(partToVal).forEach(([pIdxStr, v]) => {
    visibleParts.push(parseInt(pIdxStr, 10))
    if (v.includes('-')) {
      partSegmentIndex[pIdxStr] = parseInt(v.split('-')[1], 10)
    }
  })
  ev.visibleParts = visibleParts.sort((a, b) => a - b)
  ev.partSegmentIndex = partSegmentIndex
}

function selectDeptVisiblePartSegments () {
  return evVisiblePartSegments(selectDeptForm)
}

function setSelectDeptVisiblePartSegments (newSegs) {
  setEvVisiblePartSegments(selectDeptForm, newSegs)
}

const companyOptions = computed(() => {
  const set = new Set()
  evaluations.value.forEach((e) => {
    if (e.companyName) set.add(e.companyName)
  })
  return [...set].sort()
})

/** 下載 Excel：公司／部門（依本批次考核對象，需後端 evaluateeCompanyId）；首位為「所有公司」 */
const scoreExportCompanyOptions = computed(() => {
  const map = new Map()
  evaluations.value.forEach((e) => {
    const id = e.evaluateeCompanyId
    const name = e.companyName
    if (id && name) map.set(String(id), { id, name })
  })
  const rest = [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-Hant'))
  return [{ id: SCORE_EXPORT_ALL_COMPANIES, name: '所有公司' }, ...rest]
})

const scoreExportDepartmentOptions = computed(() => {
  const cid = scoreExportDialog.company
  if (!cid || cid === SCORE_EXPORT_ALL_COMPANIES) return []
  const map = new Map()
  evaluations.value.forEach((e) => {
    if (String(e.evaluateeCompanyId || '') !== String(cid)) return
    const id = e.evaluateeDepartmentId
    const name = e.deptName
    if (id && name) map.set(String(id), { id, name })
  })
  return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-Hant'))
})

const scoreExportDepartmentAllSelected = computed(() => {
  const opts = scoreExportDepartmentOptions.value
  if (opts.length === 0) return false
  const set = new Set((scoreExportDialog.departments || []).map(d => String(d)))
  return opts.every(o => set.has(String(o.id)))
})

const departmentOptions = computed(() => {
  const company = searchCriteria.company
  if (!company) return []
  const set = new Set()
  evaluations.value.forEach((e) => {
    if (e.companyName === company && e.deptName) set.add(e.deptName)
  })
  return [...set].sort()
})

const templateFilterOptions = computed(() => {
  const set = new Set()
  evaluations.value.forEach((e) => {
    if (e.templateName) set.add(e.templateName)
  })
  return [...set].sort()
})

/** 選擇部門對話框：公司選項（從員工資料取得） */
const selectDeptCompanyOptions = computed(() => {
  const map = new Map()
  employeeOptions.value.forEach((emp) => {
    const company = emp.company
    const id = typeof company === 'object' ? company?._id : company
    const name = typeof company === 'object' ? company?.name : null
    if (id && name) map.set(String(id), { id, name })
  })
  return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

/** 複製考核：公司選項 */
const copyEvalCompanyOptions = computed(() => {
  const map = new Map()
  employeeOptions.value.forEach((emp) => {
    const company = emp.company
    const id = typeof company === 'object' ? company?._id : company
    const name = typeof company === 'object' ? company?.name : null
    if (id && name) map.set(String(id), { id, name })
  })
  return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

/** 複製考核：部門選項（依所選公司篩選） */
const copyEvalDepartmentOptions = computed(() => {
  const companyId = copyEvalForm.company
  if (!companyId) return []
  const map = new Map()
  employeeOptions.value.forEach((emp) => {
    const company = emp.company
    const empCompanyId = typeof company === 'object' ? company?._id : company
    if (String(empCompanyId) !== String(companyId)) return
    const dept = emp.department
    const id = typeof dept === 'object' ? dept?._id : dept
    const name = typeof dept === 'object' ? dept?.name : null
    if (id && name) map.set(String(id), { id, name })
  })
  return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

/** 複製考核：員工選項（依公司+部門篩選，排除已在此批次的考核對象） */
const copyEvalEmployeeOptions = computed(() => {
  const companyId = copyEvalForm.company
  const deptId = copyEvalForm.department
  if (!companyId || !deptId) return []
  const excludeIds = new Set(
    evaluations.value.map((e) => {
      const id = typeof e.evaluatee === 'object' ? e.evaluatee?._id : e.evaluatee
      return id ? String(id) : null
    }).filter(Boolean)
  )
  const sourceId = copyEvalDialog.sourceItem
    ? String((typeof copyEvalDialog.sourceItem.evaluatee === 'object' ? copyEvalDialog.sourceItem.evaluatee?._id : copyEvalDialog.sourceItem.evaluatee) || '')
    : ''
  if (sourceId) excludeIds.add(sourceId)
  return employeeOptions.value
    .filter((emp) => {
      if (excludeIds.has(String(emp._id))) return false
      const empCompanyId = typeof emp.company === 'object' ? emp.company?._id : emp.company
      const empDeptId = typeof emp.department === 'object' ? emp.department?._id : emp.department
      return String(empCompanyId) === String(companyId) && String(empDeptId) === String(deptId)
    })
    .map((emp) => ({
      ...emp,
      displayName: emp.employeeCode ? `${emp.name || '_'} (${emp.employeeCode})` : (emp.name || '_')
    }))
})

const copyEvalEmployeeAllSelected = computed(() => {
  const opts = copyEvalEmployeeOptions.value
  if (opts.length === 0) return false
  const set = new Set((copyEvalForm.selectedEmployees || []).map(id => String(id)))
  return opts.every(o => set.has(String(o._id)))
})

/** 選擇部門對話框：部門選項（依所選公司篩選） */
const selectDeptDepartmentOptions = computed(() => {
  const companyId = selectDeptForm.company
  if (!companyId) return []
  const map = new Map()
  employeeOptions.value.forEach((emp) => {
    const company = emp.company
    const empCompanyId = typeof company === 'object' ? company?._id : company
    if (String(empCompanyId) !== String(companyId)) return
    const dept = emp.department
    const id = typeof dept === 'object' ? dept?._id : dept
    const name = typeof dept === 'object' ? dept?.name : null
    if (id && name) map.set(String(id), { id, name })
  })
  return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
})

const filteredEvaluations = computed(() => {
  let list = evaluations.value
  if (searchCriteria.company) {
    list = list.filter(e => e.companyName === searchCriteria.company)
  }
  if (searchCriteria.department) {
    list = list.filter(e => e.deptName === searchCriteria.department)
  }
  if (searchCriteria.template) {
    list = list.filter(e => e.templateName === searchCriteria.template)
  }
  if (searchCriteria.progressStatus) {
    const ps = searchCriteria.progressStatus
    list = list.filter((e) => {
      const { total, finished } = countEvaluationEvaluatorProgress(e)
      if (ps === 'complete') return total > 0 && finished >= total
      if (ps === 'in_progress') return total > 0 && finished < total
      return true
    })
  }
  const kw = (evalKeywordSearch.value || '').trim().toLowerCase()
  if (kw) {
    list = list.filter((e) => {
      const name = (e.evaluateeName || '').toLowerCase()
      const code = (e.evaluateeEmployeeCode || '').toLowerCase()
      return name.includes(kw) || code.includes(kw)
    })
  }
  return list
})

const sortedEvaluations = computed(() => {
  return [...filteredEvaluations.value].sort((a, b) => {
    const deptA = (a.evaluateeDept || '').toString()
    const deptB = (b.evaluateeDept || '').toString()
    return deptA.localeCompare(deptB)
  })
})

const paginatedEvaluations = computed(() => {
  const start = (evalPage.value - 1) * evalItemsPerPage.value
  return sortedEvaluations.value.slice(start, start + evalItemsPerPage.value)
})

function onEvalSearchCompanyChange () {
  searchCriteria.department = null
}

function resetSearch () {
  searchCriteria.company = null
  searchCriteria.department = null
  searchCriteria.template = null
  searchCriteria.progressStatus = null
  evalKeywordSearch.value = ''
  evalPage.value = 1
}

function handleEvalOptionsChange (opts) {
  evalPage.value = opts.page ?? 1
  evalItemsPerPage.value = opts.itemsPerPage ?? 10
}

const filteredEmployeeOptions = computed(() => {
  const usedIds = evaluations.value.map((e) => {
    const id = typeof e.evaluatee === 'object' ? e.evaluatee?._id : e.evaluatee
    return id ? String(id) : null
  }).filter(Boolean)
  const excludeIds = formDialog.isEdit && formDialog.evaluatee
    ? usedIds.filter(id => String(id) !== String(formDialog.evaluatee))
    : usedIds
  return employeeOptions.value.filter(emp => !excludeIds.includes(String(emp._id)))
})

function toArray (val) {
  if (Array.isArray(val)) return val
  if (val?.data && Array.isArray(val.data)) return val.data
  return []
}

/** 評核進度：每位評核者須為 completed 或 abandoned 才算該筆考核完成 */
function countEvaluationEvaluatorProgress (item) {
  const evs = item?.evaluators || []
  const total = evs.length
  let finished = 0
  for (const e of evs) {
    const s = e?.status || 'pending'
    if (s === 'completed' || s === 'abandoned') finished++
  }
  return { total, finished }
}

function getEvaluationProgressChip (item) {
  if (batch.value?.status === 'draft') {
    return { text: '_', color: null }
  }
  const { total, finished } = countEvaluationEvaluatorProgress(item)
  if (total === 0) {
    return { text: '未設定評核者', color: 'grey-darken-1' }
  }
  if (finished >= total) {
    return { text: '已完成', color: 'teal-darken-1' }
  }
  return { text: `進行中 ${finished}/${total}`, color: 'orange-darken-2' }
}

function openScoreExportDialog () {
  scoreExportDialog.open = true
  scoreExportDialog.company = null
  scoreExportDialog.departments = []
  scoreExportDialog.companyError = ''
  scoreExportDialog.departmentError = ''
}

function closeScoreExportDialog () {
  if (scoreExportDialog.loading) return
  scoreExportDialog.open = false
}

function onScoreExportCompanyChange () {
  scoreExportDialog.departments = []
  scoreExportDialog.companyError = ''
  scoreExportDialog.departmentError = ''
}

function toggleScoreExportDepartmentsAll () {
  scoreExportDialog.departmentError = ''
  const opts = scoreExportDepartmentOptions.value
  if (opts.length === 0) return
  if (scoreExportDepartmentAllSelected.value) {
    scoreExportDialog.departments = []
  } else {
    scoreExportDialog.departments = opts.map(o => o.id)
  }
}

function toggleCopyEvalEmployeesAll () {
  const opts = copyEvalEmployeeOptions.value
  if (opts.length === 0) return
  if (copyEvalEmployeeAllSelected.value) {
    copyEvalForm.selectedEmployees = []
  } else {
    copyEvalForm.selectedEmployees = opts.map(o => o._id)
  }
}

function filterScoreSummariesByExport (list, companyId, departmentIds) {
  if (companyId === SCORE_EXPORT_ALL_COMPANIES) {
    return [...list]
  }
  const deptSet = new Set(departmentIds.map(id => String(id)))
  return list.filter((s) =>
    String(s.evaluateeCompanyId || '') === String(companyId) &&
    deptSet.has(String(s.evaluateeDepartmentId || ''))
  )
}

/** Excel 匯出：同公司→同部門→員工編號（數字友善排序） */
function compareScoreSummaryExportOrder (a, b) {
  const c1 = (a.evaluateeCompanyName || '').trim() || String(a.evaluateeCompanyId || '')
  const c2 = (b.evaluateeCompanyName || '').trim() || String(b.evaluateeCompanyId || '')
  const cmpC = c1.localeCompare(c2, 'zh-Hant')
  if (cmpC !== 0) return cmpC
  const d1 = (a.evaluateeDepartmentName || '').trim() || String(a.evaluateeDepartmentId || '')
  const d2 = (b.evaluateeDepartmentName || '').trim() || String(b.evaluateeDepartmentId || '')
  const cmpD = d1.localeCompare(d2, 'zh-Hant')
  if (cmpD !== 0) return cmpD
  const ca = String(a.evaluateeEmployeeCode || '').trim()
  const cb = String(b.evaluateeEmployeeCode || '').trim()
  return ca.localeCompare(cb, 'zh-Hant', { numeric: true })
}

function groupScoreSummariesByTemplate (list) {
  const map = new Map()
  for (const s of list) {
    const name = s.templateName || '_'
    if (!map.has(name)) map.set(name, [])
    map.get(name).push(s)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'zh-Hant'))
    .map(([templateName, blocks]) => ({
      templateName,
      blocks: [...blocks].sort(compareScoreSummaryExportOrder)
    }))
}

function safeExcelFileNamePart (s) {
  return String(s || '').replace(/[/\\?*:[\]"<>|]/g, '_').trim().slice(0, 80) || '批次'
}

async function doScoreExportExcel () {
  scoreExportDialog.companyError = ''
  scoreExportDialog.departmentError = ''
  if (!scoreExportDialog.company) {
    scoreExportDialog.companyError = '請選擇公司'
    return
  }
  const exportAllCompanies = scoreExportDialog.company === SCORE_EXPORT_ALL_COMPANIES
  if (!exportAllCompanies && !scoreExportDialog.departments?.length) {
    scoreExportDialog.departmentError = '請選擇至少一個部門'
    return
  }
  scoreExportDialog.loading = true
  try {
    const { data } = await apiAuth.get(`/evaluations/by-batch/${batchId.value}/scores-summary`)
    const raw = Array.isArray(data?.result) ? data.result : []
    const filtered = filterScoreSummariesByExport(
      raw,
      scoreExportDialog.company,
      scoreExportDialog.departments
    )
    if (filtered.length === 0) {
      createSnackbar({
        text: '範圍內沒有考核資料',
        snackbarProps: { color: 'orange-darken-2' }
      })
      return
    }
    const grouped = groupScoreSummariesByTemplate(filtered)
    const rows = buildSheetRowsFromGrouped(grouped)
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0)
    // 欄寬：SheetJS 的 wch 約為「字元寬度」。調整下列數字即可改匯出 Excel 欄寬。
    const excelColWchCompany = 20
    const excelColWchDept = 20
    const excelColWchEvaluatee = 32 // 第 3 欄：姓名（含員編）
    const excelColWchRest = 40 // 題目、部分加權、出勤、加權總分等
    ws['!cols'] = Array.from({ length: maxCol }, (_, i) => {
      if (i === 0) return { wch: excelColWchCompany }
      if (i === 1) return { wch: excelColWchDept }
      if (i === 2) return { wch: excelColWchEvaluatee }
      return { wch: excelColWchRest }
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '評分匯出')
    const batchName = safeExcelFileNamePart(batch.value?.name)
    const d = new Date()
    const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    XLSX.writeFile(wb, `考核評分匯出_${batchName}_${ds}.xlsx`)
    scoreExportDialog.open = false
    createSnackbar({ text: '下載成功', snackbarProps: { color: 'teal-lighten-1' } })
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '下載失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    scoreExportDialog.loading = false
  }
}

function getEmployeeDeptStr (emp) {
  if (!emp) return ''
  const companyName = typeof emp.company === 'object' ? emp.company?.name : ''
  const deptName = typeof emp.department === 'object' ? emp.department?.name : ''
  return companyName && deptName ? `${companyName} - ${deptName}` : (deptName || companyName || '')
}

function getEvaluatorItemTitle (user) {
  if (!user?.name) return ''
  const link = user.employeeLink
  const emp = link
    ? employeeOptions.value.find(e => String(e._id) === String(link?._id || link))
    : null
  const deptStr = emp ? getEmployeeDeptStr(emp) : ''
  return deptStr ? `${user.name} (${deptStr})` : user.name
}

function getEvaluatorOptions (currentIdx) {
  const evaluateeEmpId = formDialog.evaluatee ? String(formDialog.evaluatee) : null
  const excludeUserIds = new Set()
  formDialog.evaluators.forEach((ev, i) => {
    if (i !== currentIdx && ev.user) excludeUserIds.add(String(ev.user))
  })
  return userOptions.value.filter((u) => {
    const linkId = typeof u.employeeLink === 'object' ? u.employeeLink?._id : u.employeeLink
    if (evaluateeEmpId && linkId && String(linkId) === evaluateeEmpId) return false
    if (excludeUserIds.has(String(u._id))) return false
    return true
  })
}

async function fetchBatch () {
  if (!batchId.value) return
  loading.value = true
  error.value = ''
  try {
    const { data } = await apiAuth.get(`/evaluation-batches/${batchId.value}`)
    batch.value = data?.result
    if (!batch.value) {
      error.value = '找不到此考核批次'
    }
  } catch (err) {
    error.value = err?.response?.data?.message || '載入失敗'
    createSnackbar({
      text: error.value,
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

async function fetchEvaluations () {
  if (!batchId.value) return
  loadingEvaluations.value = true
  try {
    const { data } = await apiAuth.get(`/evaluations/by-batch/${batchId.value}`)
    evaluations.value = toArray(data?.result) || []
    evalPage.value = 1
    await fetchInvalidTemplates()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入考核列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loadingEvaluations.value = false
  }
}

async function fetchInvalidTemplates () {
  if (!batchId.value) return
  try {
    const { data } = await apiAuth.get(`/evaluation-batches/${batchId.value}/check-weight-status`)
    invalidTemplates.value = data?.result?.invalidTemplates || []
  } catch {
    invalidTemplates.value = []
  }
}

async function fetchTemplates () {
  try {
    const { data } = await apiAuth.get('/evaluation-templates/all', {
      params: { page: 1, itemsPerPage: 500 }
    })
    templateOptions.value = data?.result?.data || []
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入表單模板失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

async function ensureTemplateDetail (templateId) {
  if (!templateId || templateDetails.value[templateId]) return
  try {
    const { data } = await apiAuth.get(`/evaluation-templates/${templateId}`)
    templateDetails.value[templateId] = data?.result || {}
  } catch {
    templateDetails.value[templateId] = {}
  }
}

async function fetchEmployees () {
  try {
    const { data } = await apiAuth.get('/employees/all', {
      params: { status: '在職', itemsPerPage: -1 }
    })
    const arr = Array.isArray(data?.result) ? data.result : (data?.result?.data || [])
    employeeOptions.value = arr
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入員工失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

async function fetchUsers () {
  try {
    const { data } = await apiAuth.get('/users/public/all')
    const arr = Array.isArray(data?.result?.data) ? data.result.data : []
    userOptions.value = arr
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入用戶失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

function onFormDialogYearChange () {
  formDialog.template = null
  formDialog.evaluators = [{ user: null, visibleParts: [], partSegmentIndex: {}, fillsSpecialAchievement: false }]
}

async function onTemplateChange () {
  await ensureTemplateDetail(formDialog.template)
  const parts = formDialog.template ? (templateDetails.value[formDialog.template]?.parts || []) : []
  formDialog.evaluators.forEach((ev) => {
    ev.visibleParts = parts.length > 0 ? [...Array(parts.length).keys()] : []
    ev.partSegmentIndex = {}
  })
  if (!formDialogTemplateSpecialAchievementEnabled.value) {
    formDialog.evaluators.forEach((ev) => { ev.fillsSpecialAchievement = false })
  }
}

function addEvaluator () {
  const parts = selectedTemplateParts.value
  formDialog.evaluators.push({
    user: null,
    visibleParts: parts.length > 0 ? [...Array(parts.length).keys()] : [],
    partSegmentIndex: {},
    fillsSpecialAchievement: false
  })
}

function openBatchAddDialog () {
  batchAddCount.value = 1
  batchAddDialogOpen.value = true
}

function openCopyEvaluationDialog (item) {
  copyEvalDialog.sourceItem = item
  copyEvalDialog.sourceName = item?.evaluateeName || item?.evaluatee?.name || '_'
  copyEvalForm.company = null
  copyEvalForm.department = null
  copyEvalForm.selectedEmployees = []
  copyEvalDialog.open = true
}

async function doCopyEvaluation () {
  const sourceItem = copyEvalDialog.sourceItem
  const ids = copyEvalForm.selectedEmployees
  if (!sourceItem?._id || !ids?.length) return
  copyEvalDialog.submitting = true
  try {
    const { data } = await apiAuth.post(`/evaluations/${sourceItem._id}/copy`, {
      evaluateeIds: ids.map(id => (typeof id === 'object' ? id?._id : id) || id)
    })
    createSnackbar({ text: data?.message || '複製成功', snackbarProps: { color: 'teal-lighten-1' } })
    copyEvalDialog.open = false
    fetchEvaluations()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '複製失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    copyEvalDialog.submitting = false
  }
}

function openSelectDeptDialog () {
  if (!formDialog.template) return
  selectDeptForm.company = null
  selectDeptForm.department = null
  const parts = selectedTemplateParts.value
  selectDeptForm.visibleParts = parts.length > 0 ? [...Array(parts.length).keys()] : []
  selectDeptForm.partSegmentIndex = {}
  selectDeptDialogOpen.value = true
}

async function confirmSelectDept () {
  const valid = await selectDeptFormRef.value?.validate()
  if (!valid?.valid) return

  const companyId = selectDeptForm.company
  const deptId = selectDeptForm.department
  const visibleParts = Array.isArray(selectDeptForm.visibleParts) ? [...selectDeptForm.visibleParts] : []
  const partSegmentIndex = selectDeptForm.partSegmentIndex && typeof selectDeptForm.partSegmentIndex === 'object'
    ? { ...selectDeptForm.partSegmentIndex }
    : {}

  const parts = selectedTemplateParts.value
  if (parts.length > 0 && visibleParts.length === 0) {
    createSnackbar({
      text: '請選擇至少一個可見部分',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  const empsInDept = employeeOptions.value.filter((emp) => {
    const empCompanyId = typeof emp.company === 'object' ? emp.company?._id : emp.company
    const empDeptId = typeof emp.department === 'object' ? emp.department?._id : emp.department
    return String(empCompanyId) === String(companyId) && String(empDeptId) === String(deptId)
  })

  const existingUserIds = new Set(
    formDialog.evaluators
      .map(ev => ev.user)
      .filter(Boolean)
      .map(id => String(id))
  )

  const evaluateeEmpId = formDialog.evaluatee ? String(formDialog.evaluatee) : null
  const empIds = new Set(empsInDept.map(e => String(e._id)))
  const usersToAdd = userOptions.value.filter((u) => {
    const linkId = typeof u.employeeLink === 'object' ? u.employeeLink?._id : u.employeeLink
    if (!linkId || !empIds.has(String(linkId)) || existingUserIds.has(String(u._id))) return false
    if (evaluateeEmpId && String(linkId) === evaluateeEmpId) return false
    return true
  })

  if (usersToAdd.length === 0) {
    createSnackbar({
      text: '該部門沒有可新增的評核者（可能已加入、無系統帳號或為考核對象本人）',
      snackbarProps: { color: 'orange-darken-2' }
    })
    return
  }

  formDialog.evaluators = formDialog.evaluators.filter(ev => ev.user)
  const finalParts = parts.length > 0 ? visibleParts : []
  usersToAdd.forEach((u) => {
    formDialog.evaluators.push({
      user: u._id,
      visibleParts: [...finalParts],
      partSegmentIndex: { ...partSegmentIndex },
      fillsSpecialAchievement: false
    })
  })

  createSnackbar({
    text: `已新增 ${usersToAdd.length} 位評核者`,
    snackbarProps: { color: 'teal-lighten-1' }
  })
  selectDeptDialogOpen.value = false
}

function confirmBatchAdd () {
  const n = Number(batchAddCount.value)
  if (!Number.isInteger(n) || n < 1 || n > 50) {
    createSnackbar({
      text: '數量需介於 1-50',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  const parts = selectedTemplateParts.value
  for (let i = 0; i < n; i++) {
    formDialog.evaluators.push({
      user: null,
      visibleParts: parts.length > 0 ? [...Array(parts.length).keys()] : [],
      partSegmentIndex: {},
      fillsSpecialAchievement: false
    })
  }
  batchAddDialogOpen.value = false
}

function removeEvaluator (idx) {
  formDialog.evaluators.splice(idx, 1)
}

function formatDate (date) {
  if (!date) return '_'
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchBatchEditAttendanceOptions (year) {
  if (!year) {
    batchEditAttendanceOptions.value = []
    return
  }
  batchEditAttendanceLoading.value = true
  try {
    const { data } = await apiAuth.get('/attendances', {
      params: { year, itemsPerPage: 500 }
    })
    const list = data?.result?.data || []
    batchEditAttendanceOptions.value = list.map(a => ({
      ...a,
      displayName: `${a.name || '_'}（${a.year || '_'}年）`
    }))
  } catch {
    batchEditAttendanceOptions.value = []
  } finally {
    batchEditAttendanceLoading.value = false
  }
}

function openBatchEditDialog () {
  batchEditForm.name = batch.value?.name || ''
  batchEditForm.startDate = batch.value?.startDate ? new Date(batch.value.startDate) : null
  batchEditForm.dueDate = batch.value?.dueDate ? new Date(batch.value.dueDate) : null
  const att = batch.value?.attendance
  batchEditForm.attendance = att?._id || att || null
  const wantNotify = batch.value?.notifyAtStart === true
  batchEditForm.notifyAtStart = wantNotify && isStartDateOnOrAfterToday(batchEditForm.startDate)
  batchEditDialogOpen.value = true
  fetchBatchEditAttendanceOptions(batch.value?.year)
}

watch(() => batchEditForm.startDate, (v) => {
  if (!isStartDateOnOrAfterToday(v)) batchEditForm.notifyAtStart = false
})

async function saveBatchInfo () {
  const valid = await batchEditFormRef.value?.validate()
  if (!valid?.valid) return

  batchEditSubmitting.value = true
  try {
    const startDateStr = dateToYmdLocal(batchEditForm.startDate)
    const dueDateStr = dateToYmdLocal(batchEditForm.dueDate)
    await apiAuth.patch(`/evaluation-batches/${batchId.value}`, {
      name: batchEditForm.name.trim(),
      startDate: startDateStr ?? null,
      dueDate: dueDateStr ?? null,
      attendance: batchEditForm.attendance ?? null,
      notifyAtStart: !!(batchEditForm.notifyAtStart && isStartDateOnOrAfterToday(batchEditForm.startDate))
    })
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
    batch.value.name = batchEditForm.name.trim()
    batch.value.startDate = startDateStr ? new Date(startDateStr) : null
    batch.value.dueDate = dueDateStr ? new Date(dueDateStr) : null
    batch.value.attendance = batchEditForm.attendance
      ? { _id: batchEditForm.attendance }
      : null
    batch.value.notifyAtStart = !!(batchEditForm.notifyAtStart && isStartDateOnOrAfterToday(batchEditForm.startDate))
    batchEditDialogOpen.value = false
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    batchEditSubmitting.value = false
  }
}

function openAddDialog () {
  formDialog.isEdit = false
  formDialog.id = null
  formDialog.year = null
  formDialog.template = null
  formDialog.evaluatee = null
  formDialog.evaluators = [{ user: null, visibleParts: [], partSegmentIndex: {}, fillsSpecialAchievement: false }]
  formDialog.open = true
}

async function openEditDialog (item) {
  const templateId = typeof item.template === 'object' ? item.template?._id : item.template
  const evaluateeId = typeof item.evaluatee === 'object' ? item.evaluatee?._id : item.evaluatee
  await ensureTemplateDetail(templateId)
  const tmpl = templateOptions.value.find(t => String(t._id) === String(templateId)) || templateDetails.value[templateId]
  formDialog.isEdit = true
  formDialog.id = item._id
  formDialog.year = tmpl?.year ?? null
  formDialog.template = templateId
  formDialog.evaluatee = evaluateeId
  const evs = (item.evaluators || []).map((e) => {
    const uid = typeof e.user === 'object' ? e.user?._id : e.user
    const vp = Array.isArray(e.visibleParts) ? e.visibleParts : []
    const psi = e.partSegmentIndex && typeof e.partSegmentIndex === 'object' ? { ...e.partSegmentIndex } : {}
    return {
      user: uid,
      visibleParts: [...vp],
      partSegmentIndex: psi,
      fillsSpecialAchievement: Boolean(e.fillsSpecialAchievement)
    }
  })
  formDialog.evaluators = evs.length > 0 ? evs : [{ user: null, visibleParts: [], partSegmentIndex: {}, fillsSpecialAchievement: false }]
  formDialog.open = true
}

function prepareEvaluatorsPayload () {
  return formDialog.evaluators
    .filter((ev) => ev.user)
    .map((ev) => ({
      user: ev.user,
      visibleParts: Array.isArray(ev.visibleParts) ? ev.visibleParts : [],
      partSegmentIndex: ev.partSegmentIndex && typeof ev.partSegmentIndex === 'object' ? ev.partSegmentIndex : {},
      fillsSpecialAchievement: Boolean(ev.fillsSpecialAchievement)
    }))
}

async function submitForm () {
  const valid = await formDialogRef.value?.validate()
  if (!valid?.valid) return

  const hasEmpty = formDialog.evaluators.some(ev => !ev.user)
  if (hasEmpty) {
    createSnackbar({
      text: '請確認是否所有評核者都已選擇',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  const evs = prepareEvaluatorsPayload()
  if (evs.length === 0) {
    createSnackbar({
      text: '請選擇至少一位評核者',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  formDialog.submitting = true
  try {
    const basePayload = {
      template: formDialog.template,
      evaluatee: formDialog.evaluatee,
      evaluators: prepareEvaluatorsPayload(),
      year: batch.value?.year ?? new Date().getFullYear()
    }
    if (formDialog.isEdit) {
      await apiAuth.patch(`/evaluations/${formDialog.id}`, basePayload)
      createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
    } else {
      await apiAuth.post('/evaluations', { ...basePayload, batch: batchId.value })
      createSnackbar({ text: '新增成功', snackbarProps: { color: 'teal-lighten-1' } })
    }
    formDialog.open = false
    fetchEvaluations()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '操作失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    formDialog.submitting = false
  }
}

function openSendConfirm () {
  if (evaluations.value.length === 0) {
    createSnackbar({
      text: '請先新增至少一筆考核表單',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  sendConfirmOpen.value = true
}

function openRecallConfirm () {
  if (!(batch.value?.name ?? '').trim()) {
    createSnackbar({
      text: '請先為此考核批次設定名稱後再收回',
      snackbarProps: { color: 'orange-darken-2' }
    })
    return
  }
  recallConfirmOpen.value = true
}

async function openScoresDialog (item) {
  scoresDialogOpen.value = true
  scoresDialogData.value = null
  scoresDialogLoading.value = true
  try {
    const { data } = await apiAuth.get(`/evaluations/by-batch/${batchId.value}/scores-summary`, {
      params: { evaluationId: item._id }
    })
    scoresDialogData.value = data?.result?.[0] || null
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入評分失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    scoresDialogOpen.value = false
  } finally {
    scoresDialogLoading.value = false
  }
}

/**
 * 加權總分：僅填寫部分時，換算為滿分 100 以利不同評核者間比較
 * 公式：換算總分 = (已填寫部分的加權分數總和) / (已填寫部分的權重總和) × 100
 */
/** 單一評核者加權總分：該評核者部分的加權 + 出勤加權 */
function getTotalWeightedScoreNum (row) {
  const data = scoresDialogData.value
  const parts = data?.parts || []
  let weightedSum = 0
  let weightSum = 0
  const psi = row.partSegmentIndex && typeof row.partSegmentIndex === 'object' ? row.partSegmentIndex : {}
  parts.forEach((part, pIdx) => {
    const questions = part.questions || []
    if (questions.length === 0) return
    let sum = 0
    let count = 0
    questions.forEach((_, qIdx) => {
      const v = row.scores?.[`${pIdx}-${qIdx}`]
      if (v != null && typeof v === 'number' && !isNaN(v)) {
        sum += v
        count++
      }
    })
    if (count > 0) {
      const avg = sum / count
      const sw = part.subWeights
      let segIdx = 0
      if (sw && sw.length > 1) {
        const n = psi[pIdx] != null ? Number(psi[pIdx]) : (psi[String(pIdx)] != null ? Number(psi[String(pIdx)]) : 0)
        segIdx = !isNaN(n) && n >= 0 && n < sw.length ? n : 0
      }
      const weight = (sw && sw.length > 1) ? (sw[segIdx]?.weight || 0) : (part.weight ?? 0)
      weightedSum += avg * weight
      weightSum += weight
    }
  })
  const attWeight = data?.attendanceWeight ?? 0
  const attScore = data?.attendanceScore
  if (attScore != null && attWeight > 0) {
    weightedSum += attScore * attWeight
    weightSum += attWeight
  }
  if (weightSum <= 0) return null
  return weightedSum / weightSum
}

function formatTotalWeightedScore (row) {
  const val = getTotalWeightedScoreNum(row)
  return val != null ? val.toFixed(1) : '_'
}

async function doRecallBatch () {
  evaluationBatchDetailBar.setSubmitting(true)
  try {
    await apiAuth.post(`/evaluation-batches/${batchId.value}/recall`)
    createSnackbar({ text: '已收回考核批次', snackbarProps: { color: 'teal-lighten-1' } })
    fetchBatch()
    fetchEvaluations()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '收回失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    evaluationBatchDetailBar.setSubmitting(false)
  }
}

async function doSendBatch () {
  sendSubmitting.value = true
  try {
    await apiAuth.post(`/evaluation-batches/${batchId.value}/send`)
    createSnackbar({ text: '發送成功', snackbarProps: { color: 'teal-lighten-1' } })
    sendConfirmOpen.value = false
    await fetchBatch()
    fetchEvaluations()
    postSendNotifyOpen.value = true
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '發送失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    sendSubmitting.value = false
  }
}

function openResendNotifyDialog () {
  resendNotifyOpen.value = true
}

async function confirmPostSendNotify () {
  postSendNotifyLoading.value = true
  try {
    await apiAuth.post(`/evaluation-batches/${batchId.value}/send-notification`)
    createSnackbar({
      text: '通知已發送',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    postSendNotifyOpen.value = false
    await fetchBatch()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '發送失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    postSendNotifyLoading.value = false
  }
}

async function confirmResendNotify () {
  resendNotifyLoading.value = true
  try {
    await apiAuth.post(`/evaluation-batches/${batchId.value}/send-notification`)
    createSnackbar({
      text: '通知已發送',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    resendNotifyOpen.value = false
    await fetchBatch()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '發送失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    resendNotifyLoading.value = false
  }
}

function openDeleteConfirm (item) {
  deleteTarget.value = item
  deleteConfirmOpen.value = true
}

async function doDeleteEvaluation () {
  if (!deleteTarget.value?._id) return
  try {
    await apiAuth.delete(`/evaluations/${deleteTarget.value._id}`)
    createSnackbar({ text: '刪除成功', snackbarProps: { color: 'teal-lighten-1' } })
    fetchEvaluations()
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    deleteTarget.value = null
  }
}

watch([() => searchCriteria.company, () => searchCriteria.department, () => searchCriteria.template, () => searchCriteria.progressStatus, evalKeywordSearch], () => {
  evalPage.value = 1
})

watch(batchId, () => {
  fetchBatch()
  fetchEvaluations()
}, { immediate: false })

onMounted(() => {
  fetchTemplates()
  fetchEmployees()
  fetchUsers()
  fetchBatch()
  fetchEvaluations()
  evaluationBatchDetailBar.register({
    loading,
    sendBatch: openSendConfirm,
    recallBatch: openRecallConfirm,
    resendBatchNotification: openResendNotifyDialog,
    goBack: () => router.push('/evaluationManagement'),
    batch,
    evaluations
  })
})

onBeforeUnmount(() => {
  evaluationBatchDetailBar.unregister()
})
</script>

<style scoped>
.search-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.form-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.form-dialog .form-dialog-header {
  z-index: 2;
  flex-shrink: 0;
}

.form-dialog .form-dialog-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.form-dialog .form-dialog-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.form-dialog .form-dialog-actions {
  flex-shrink: 0;
}

:deep(.v-table),
:deep(.v-data-table-server .v-table) {
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
    font-size: 13px !important;
  }
}
.odd-row {
  background-color: #f6f8fa;
}
.even-row {
  background-color: #fffaf0;
}

.scores-table-wrapper {
  overflow-x: auto;
}
.scores-summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.scores-summary-table th,
.scores-summary-table td {
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px 12px;
  text-align: center;
}

.scores-summary-table .sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  min-width: 120px;
  text-align: left;
}

.scores-summary-table tbody tr:nth-child(even) .sticky-col {
  background-color: #fffaf0;
}
.scores-summary-table tbody tr:nth-child(odd) .sticky-col {
  background-color: #f6f8fa;
}
.scores-summary-table .part-total-col {
  background-color: rgba(194, 194, 194, 0.7);
  vertical-align: middle;
}
.scores-summary-table .attendance-col {
  background-color: rgba(0, 150, 136, 0.15);
  vertical-align: middle;
}
.scores-summary-table .total-col {
  background-color: rgba(49, 49, 49, 0.8);
  color: #fff;
  vertical-align: middle;
}
.scores-summary-table tr.scores-total-row td {
  background-color: rgba(0, 128, 128, 0.12);
}
.scores-summary-table tr.scores-total-row .sticky-col {
  background-color: rgba(0, 128, 128, 0.2) !important;
}
.scores-summary-table tr.scores-total-row .total-col {
  background-color: rgba(49, 49, 49, 0.9) !important;
  color: #fff;
}

.special-achievement-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.special-achievement-card-accent {
  width: 5px;
  background: linear-gradient(180deg, #ff8f00, #ef6c00);
}
.special-achievement-card .min-width-0 {
  min-width: 0;
}
</style>
