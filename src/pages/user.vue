<template>
  <v-container max-width="2400">
    <!-- 頁面標題和功能按鈕區 -->
    <v-row class="pt-md-6 px-0 px-md-4">
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg pt-6 py-md-7 px-0">
          <div class="d-flex align-center px-4 px-sm-6">
            <h3>用戶管理</h3>
            <v-spacer />
          </div>
          <v-divider class="mt-5 mb-1 mb-sm-3" />

          <!-- 搜尋條件區塊 -->
          <v-card-text class="pt-4 px-6 ps-sm-8 pe-sm-7 px-md-9 pb-2">
            <v-row class="mb-2">
              <!-- 狀態篩選 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">狀態篩選 :</span>
                  <v-select
                    v-model="statusFilter"
                    :items="statusFilterOptions"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="選擇狀態"
                  />
                </div>
              </v-col>

              <!-- LINE帳號 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">LINE帳號 :</span>
                  <v-select
                    v-model="lineAccountFilter"
                    :items="lineAccountFilterOptions"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="請選擇LINE帳號"
                  />
                </div>
              </v-col>

              <!-- 權限 -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">權限 :</span>
                  <v-select
                    v-model="roleFilter"
                    :items="availableRoles"
                    item-title="name"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="請選擇權限"
                  />
                </div>
              </v-col>

              <!-- 公司（員工關聯所屬公司） -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">公司 :</span>
                  <v-select
                    v-model="companyFilter"
                    :items="companies"
                    item-title="name"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    placeholder="請選擇公司"
                  />
                </div>
              </v-col>

              <!-- 部門（依所選公司載入） -->
              <v-col
                cols="12"
                sm="6"
                md="4"
                lg="2"
                class="px-1 pe-sm-2 py-1"
              >
                <div class="d-flex flex-column">
                  <span class="search-label">部門 :</span>
                  <v-select
                    v-model="departmentFilter"
                    :items="departments"
                    item-title="name"
                    item-value="_id"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    :disabled="!companyFilter"
                    :placeholder="departmentSelectPlaceholder"
                  />
                </div>
              </v-col>

              <!-- 搜尋按鈕 -->
              <v-col
                cols="12"
                md="4"
                lg="2"
                style="padding-top: 34px;"
              >
                <v-row class="d-sm-flex justify-sm-end">
                  <v-col
                    cols="8"
                    sm="4"
                    md="8"
                    lg="8"
                    class="ps-1 pe-0"
                  >
                    <v-btn
                      color="cyan-darken-2"
                      prepend-icon="mdi-magnify"
                      :loading="tableLoading"
                      block
                      @click="tableLoadItems(true)"
                    >
                      搜尋
                    </v-btn>
                  </v-col>
                  <v-col
                    cols="4"
                    sm="2"
                    md="4"
                    lg="4"
                    class="pe-2"
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
          <v-divider class="my-0" />

          <!-- 功能按鈕和快速搜尋區 -->
          <v-row class="px-1 px-sm-3 px-md-7 mt-1 bg-white">
            <v-col
              cols="12"
              class="ps-4 pb-sm-4"
            >
              <v-row class="d-flex align-center px-5 px-md-2">
                <v-btn
                  color="blue-grey-darken-1"
                  prepend-icon="mdi-account-plus"
                  variant="outlined"
                  class="me-3"
                  @click="openDialog(null)"
                >
                  新增用戶
                </v-btn>
                <v-btn
                  color="teal-darken-1"
                  prepend-icon="mdi-account-search"
                  variant="outlined"
                  @click="checkEmployeeLinks"
                >
                  檢查
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
                    <v-text-field
                      v-model="quickSearchText"
                      :loading="tableLoading"
                      density="compact"
                      variant="outlined"
                      placeholder="搜尋使用者編號、姓名、Email、備註"
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
          <v-card-text class="px-sm-6 px-md-7">
            <v-data-table-server
              :key="tableKey"
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              v-model:page="tablePage"
              density="compact"
              class="rounded-ts-lg rounded-te-lg"
              :items-per-page-options="[10, 20, 50, { value: -1, title: '全部' }]"
              :items="tableItems"
              :headers="filteredHeaders"
              :header-props="headerProps"
              :loading="tableLoading"
              :items-length="tableItemsLength"
              :search="tableSearch"
              hover
              @update:options="handleTableOptionsChange"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.userId }}</td>
                  <td v-if="lgAndUp">
                    <UserAvatar
                      :user="item"
                      :size="28"
                    />
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      {{ item.name }}
                      <v-chip
                        v-if="item.isSystemAccount"
                        size="x-small"
                        color="blue-grey-darken-2"
                        class="ms-2"
                        label
                      >
                        系統
                      </v-chip>
                    </div>
                  </td>
                  <td v-if="lgAndUp">
                    {{ item.email }}
                  </td>
                  <td v-if="mdAndUp">
                    <div v-if="item.rbacRoles && item.rbacRoles.length > 0">
                      <v-chip
                        v-for="userRole in item.rbacRoles.slice(0, 2)"
                        :key="userRole._id"
                        label
                        size="small"
                        color="blue-darken-2"
                        class="ma-1"
                      >
                        {{ userRole.role?.name || '未知角色' }}
                      </v-chip>
                      <span
                        v-if="item.rbacRoles.length > 2"
                        class="text-grey text-caption"
                      >
                        (+{{ item.rbacRoles.length - 2 }} 個)
                      </span>
                    </div>
                    <span
                      v-else
                      class="text-grey"
                    >無權限</span>
                  </td>
                  <td v-if="lgAndUp">
                    <v-menu
                      v-if="item.employeeLink"
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
                          class="d-inline-block pe-6"
                        >
                          <v-chip
                            size="small"
                            color="teal-lighten-1"
                            prepend-icon="mdi-account-check"
                          >
                            已關聯
                          </v-chip>
                        </div>
                      </template>
                      <v-card
                        min-width="200"
                        class="rounded-lg pa-0 status-card"
                        elevation="3"
                      >
                        <v-card-text class="pa-0">
                          <div class="d-flex align-center px-3 py-2 bg-teal-lighten-1 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-office-building
                            </v-icon>
                            <span>公司：{{ item.employeeLink?.company?.name || '無' }}</span>
                          </div>
                          <div class="d-flex align-center px-3 py-2 bg-teal-lighten-3 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-domain
                            </v-icon>
                            <span>部門：{{ item.employeeLink?.department?.name || '無' }}</span>
                          </div>
                          <div class="d-flex align-center px-3 py-2 bg-teal-lighten-2 text-white">
                            <v-icon
                              size="16"
                              class="me-2"
                              color="white"
                            >
                              mdi-identifier
                            </v-icon>
                            <span>科威編號：{{ item.employeeLink?.employeeCode || '無' }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-menu>
                    <span
                      v-else
                      class="text-grey"
                    >無關聯</span>
                  </td>
                  <td v-if="mdAndUp">
                    <v-chip
                      v-if="item.lineUserId"
                      size="small"
                      color="green-lighten-1"
                      prepend-icon="mdi-check-circle"
                    >
                      已綁定
                    </v-chip>
                    <span
                      v-else
                      class="text-grey"
                    >尚未綁定</span>
                  </td>
                  <td v-if="lgAndUp">
                    {{ item.note }}
                  </td>
                  <td>
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      width="28"
                      :size="buttonSize"
                      :ripple="false"
                      @click="openDialog(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </td>
                  <td>
                    <v-switch
                      v-model="item.isActive"
                      :color="item.isActive ? 'teal-darken-1' : 'grey-darken-4'"
                      :label="smAndUp ? (item.isActive ? '啟用' : '停用') : undefined"
                      hide-details
                      @click.prevent="handleStatusChange(item)"
                    />
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增/編輯對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      max-width="1100"
    >
      <v-form
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-card class="rounded-lg user-dialog">
          <v-card-title class="d-flex align-center px-6 py-1 bg-blue-grey-darken-2">
            <v-icon
              icon="mdi-account"
              size="18"
              color="white"
              class="me-2"
            />
            <span class="card-title text-white">{{ dialog.id ? '用戶資料編輯' : '新增用戶' }}</span>
            <v-spacer />
            <v-btn
              icon
              variant="text"
              color="white"
              :size="smAndUp ? '40' : '36'"
              @click="closeDialog"
            >
              <v-icon :size="smAndUp ? '24' : '20'">
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text class="px-4 px-sm-6 py-4 py-sm-7">
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
                    class="d-flex align-center justify-center text-blue-grey-darken-2"
                  >
                    <v-icon
                      size="18"
                      class="me-2 text-blue-grey-darken-2"
                    >
                      mdi-account-circle
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
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                v-if="isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="userId.value.value"
                  :error-messages="userId.errorMessage.value"
                  label="用戶編號"
                  type="text"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="name.value.value"
                  :error-messages="name.errorMessage.value"
                  label="*姓名"
                  type="text"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="email.value.value"
                  :error-messages="email.errorMessage.value"
                  label="*Email"
                  type="email"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>

              <v-col
                v-if="!isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="password.value.value"
                  :error-messages="password.errorMessage.value"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  label="*密碼"
                  variant="outlined"
                  density="compact"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-col>

              <v-col
                v-if="!isEditing"
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  v-model="confirmPassword.value.value"
                  :error-messages="confirmPassword.errorMessage.value"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  label="*確認密碼"
                  variant="outlined"
                  density="compact"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="note.value.value"
                  :error-messages="note.errorMessage.value"
                  label="備註"
                  type="text"
                  rows="2"
                  variant="outlined"
                  density="compact"
                  clearable
                />
              </v-col>
            </v-row>

            <!-- 權限設定區塊 -->
            <v-row>
              <v-col
                cols="12"
                class="sub-title text-blue-grey-darken-2 d-flex align-center justify-center mt-4"
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
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    sm="4"
                    md="2"
                    class="d-flex align-center justify-center text-blue-grey-darken-2"
                  >
                    <v-icon
                      size="18"
                      class="me-2 text-blue-grey-darken-2"
                    >
                      mdi-shield-account
                    </v-icon> 權限設定
                  </v-col>
                  <v-col
                    cols="3"
                    sm="4"
                    md="5"
                    class="d-flex align-center justify-center"
                  >
                    <v-divider
                      class="border-opacity-25"
                      color="blue-grey-darken-2"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-select
                  v-model="selectedRolesField.value.value"
                  :items="availableRoles"
                  item-title="name"
                  item-value="_id"
                  label="*角色"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  closable-chips
                  :error-messages="selectedRolesField.meta.touched ? selectedRolesField.errorMessage.value : []"
                  persistent-hint
                  @blur="selectedRolesField.handleBlur"
                >
                  <template #selection="{ item, index }">
                    <v-chip
                      v-if="index < 2"
                      size="small"
                      color="teal"
                      class="ma-1"
                    >
                      {{ item.raw.name }}
                    </v-chip>
                    <span
                      v-if="index === 2"
                      class="text-grey text-caption align-self-center"
                    >
                      (+{{ selectedRolesField.value.value.length - 2 }} 個角色)
                    </span>
                  </template>
                </v-select>
              </v-col>



              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-btn
                  color="teal-darken-1"
                  variant="outlined"
                  prepend-icon="mdi-shield-account"
                  :disabled="selectedRolesField.value.value.length === 0"
                  block
                  @click="openPermissionSelector"
                >
                  管理額外/拒絕權限
                </v-btn>
                <div
                  v-if="selectedRolesField.value.value.length > 0"
                  class="text-caption text-grey mt-2"
                >
                  <div v-if="extraPermissionsField.value.value.length > 0">
                    額外權限：{{ extraPermissionsField.value.value.length }} 個
                  </div>
                  <div v-if="deniedPermissionsField.value.value.length > 0">
                    拒絕權限：{{ deniedPermissionsField.value.value.length }} 個
                  </div>
                  <div
                    v-if="extraPermissionsField.value.value.length === 0 && deniedPermissionsField.value.value.length === 0"
                  >
                    使用角色預設權限
                  </div>
                </div>
              </v-col>
              <v-col
                cols="2"
                class="ps-5"
              >
                <v-switch
                  v-model="isSystemAccount.value.value"
                  :color="isSystemAccount.value.value ? 'blue-grey-darken-2' : 'grey-darken-4'"
                  label="系統帳號"
                  hide-details
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-6 py-4 mb-2">
            <v-hover>
              <template #default="{ isHovering, props }">
                <v-btn
                  v-if="isEditing"
                  v-bind="props"
                  :color="isHovering ? 'red-lighten-1' : 'grey'"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  :size="buttonSize"
                  @click="confirmDeleteDialog = true"
                >
                  永久刪除
                </v-btn>
              </template>
            </v-hover>
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
              type="submit"
              class="ms-2"
              :size="smAndUp ? 'default' : 'small'"
              :loading="isSubmitting"
              :disabled="isEditing && !hasChanges"
            >
              {{ dialog.id ? '更新' : '送出' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 確認刪除對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="confirmDeleteDialog"
      title="確認刪除用戶"
      :message="`確定要刪除用戶「<span class='text-pink-lighten-1' style='font-weight: 800;'>${originalData?.name || ''}</span>」嗎？ 此操作無法復原。`"
      :expected-name="originalData?.name || ''"
      input-label="用戶"
      @confirm="deleteUser"
    />

    <!-- 確認停用對話框 -->
    <ConfirmDeleteDialog
      v-model="showConfirmDialog"
      :width="320"
      title="確認停用帳號"
      message="確定要停用此帳號嗎？停用後該使用者將無法登入系統。"
      confirm-button-text="停用"
      cancel-button-text="取消"
      confirm-button-color="red-darken-1"
      @confirm="confirmStatusChange"
    />

    <!-- 確認啟用對話框 -->
    <ConfirmDialog
      v-model="showEnableDialog"
      :width="320"
      title="確認啟用帳號"
      :message="`確定要啟用使用者「<span class='text-teal-lighten-1' style='font-weight: 800;'>${selectedUser?.name || ''}</span>」的帳號嗎？`"
      confirm-button-color="teal-darken-1"
      header-color="bg-teal-darken-1"
      header-icon="mdi-account-check"
      @confirm="confirmEnableUser"
    />

    <!-- 權限選擇器對話框 -->
    <PermissionSelector
      v-model="permissionSelectorDialog"
      :base-permissions="selectedRolePermissionCodes"
      :extra-permissions="extraPermissionsCodes"
      :denied-permissions="deniedPermissionsCodes"
      @save="handlePermissionSelectorSave"
      @reset-to-base="handleResetToBasePermissions"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import debounce from 'lodash/debounce'
import * as yup from 'yup'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PermissionSelector from '@/components/PermissionSelector.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '用戶管理 | Ystravel',
    login: true,
    permission: 'USER_MANAGEMENT_READ'
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp, mdAndUp, lgAndUp } = useDisplay()

const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')

// 權限檢查 (暫時移除，如需要可重新啟用)
// const isSuperAdmin = computed(() => {
//   return permissionStore.hasPermission('SUPER_ADMIN')
// })

// ===== 基礎狀態管理 =====
const isEditing = ref(false)
const originalData = ref(null)
const confirmDeleteDialog = ref(false)
const headerProps = { class: 'header-bg' }

// ===== 表單驗證架構 =====
const userSchema = computed(() => {
  const schema = {
    email: yup
      .string()
      .required('請輸入 email')
      .email('請輸入正確的 email 格式'),
    name: yup
      .string()
      .required('請輸入姓名'),
    note: yup
      .string()
      .nullable(),
    selectedRoles: yup
      .array()
      .min(1, '請至少選擇一個權限')
      .required('請選擇權限')
  }

  if (isEditing.value) {
    schema.userId = yup
      .string()
      .required('請輸入使用者編號')
  }

  if (!isEditing.value) {
    schema.password = yup
      .string()
      .required('請輸入密碼')
      .min(8, '密碼長度至少需要8個字元')
    schema.confirmPassword = yup
      .string()
      .required('請再次輸入密碼')
      .oneOf([yup.ref('password')], '密碼不一致')
  }

  return yup.object(schema)
})

// ===== 表單初始化與欄位設定 =====
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: userSchema,
  validateOnMount: false,
  initialValues: {
    email: '',
    name: '',
    note: '',
    selectedRoles: [],
    isSystemAccount: false,
    extraPermissions: [],
    deniedPermissions: []
  }
})

// ===== 表單欄位定義 =====
const email = useField('email')
const name = useField('name')
const note = useField('note')
const password = useField('password')
const confirmPassword = useField('confirmPassword')
const userId = useField('userId')
const selectedRolesField = useField('selectedRoles')
const isSystemAccount = useField('isSystemAccount')
const extraPermissionsField = useField('extraPermissions')
const deniedPermissionsField = useField('deniedPermissions')

// ===== 表格相關設定 =====
const tableItemsPerPage = ref(10)
const tableSortBy = ref([{ key: 'userId', order: 'asc' }])
const tablePage = ref(1)
const tableItems = ref([])
const tableKey = ref(0)
const tableHeaders = computed(() => [
  { title: '用戶編號', align: 'left', sortable: true, key: 'userId' },
  { title: '大頭貼', align: 'left', sortable: false, key: 'avatar' },
  { title: '姓名', align: 'left', sortable: true, key: 'name' },
  { title: 'Email', align: 'left', sortable: true, key: 'email' },
  { title: '權限', align: 'left', sortable: true, key: 'rbacRoles' },
  { title: '員工關聯', align: 'left',  sortable: false, key: 'employeeLink' },
  { title: 'Line帳號', align: 'left', sortable: true, key: 'lineUserId' },
  { title: '備註', align: 'left', sortable: true, key: 'note' },
  { title: '操作', align: 'left', sortable: false, key: 'action' },
  { title: '帳號狀態', align: 'left', sortable: true, key: 'isActive' }
])

const tableLoading = ref(true)
const tableItemsLength = ref(0)
const tableSearch = ref('')

// ===== 搜尋相關設定 =====
const quickSearchText = ref('')
const statusFilter = ref(null)
const lineAccountFilter = ref(null)
const roleFilter = ref(null)
const companyFilter = ref(null)
const departmentFilter = ref(null)
const companies = ref([])
const departments = ref([])

const departmentSelectPlaceholder = computed(() =>
  companyFilter.value ? '請選擇部門' : '請先選擇公司'
)

// LINE 帳號篩選選項
const lineAccountFilterOptions = [
  { text: '已綁定', value: 'bound' },
  { text: '尚未綁定', value: 'unbound' }
]

// 狀態篩選選項
const statusFilterOptions = [
  { text: '啟用', value: 'active' },
  { text: '停用', value: 'inactive' }
]

// ===== 對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

// 權限選擇器對話框
const permissionSelectorDialog = ref(false)


// ===== 角色選項 (保留舊系統兼容性) =====
// const roles = ref([
//   { value: UserRole.USER, title: roleNames[UserRole.USER] },    // 一般用戶
//   { value: UserRole.MANAGER, title: roleNames[UserRole.MANAGER] },  // 經理
//   { value: UserRole.IT, title: roleNames[UserRole.IT] },  // IT人員
//   { value: UserRole.DESIGNER, title: roleNames[UserRole.DESIGNER] },  // 美編人員
//   { value: UserRole.MARKETING, title: roleNames[UserRole.MARKETING] },  // 行銷人員
//   { value: UserRole.HR, title: roleNames[UserRole.HR] },  // 人資
//   { value: UserRole.SUPERVISOR, title: roleNames[UserRole.SUPERVISOR] }  // 總管
// ])

// ===== 新 RBAC 角色管理 =====
const availableRoles = ref([])
const availablePermissions = ref([])
const rolesWithPermissions = ref([]) // 儲存角色及其權限資訊

// 計算選中角色的所有權限 ID
const selectedRolePermissionIds = computed(() => {
  if (selectedRolesField.value.value.length === 0) return []

  const permissionIds = new Set()
  selectedRolesField.value.value.forEach(roleId => {
    const role = rolesWithPermissions.value.find(r => r._id === roleId)
    if (role && role.permissions) {
      role.permissions.forEach(perm => {
        if (perm._id) {
          permissionIds.add(perm._id.toString())
        }
      })
    }
  })
  return Array.from(permissionIds)
})

// 計算選中角色的所有權限代碼（用於 PermissionSelector）
const selectedRolePermissionCodes = computed(() => {
  if (selectedRolesField.value.value.length === 0) return []

  const permissionCodes = new Set()
  selectedRolesField.value.value.forEach(roleId => {
    const role = rolesWithPermissions.value.find(r => r._id === roleId)
    if (role && role.permissions) {
      role.permissions.forEach(perm => {
        // 優先使用 code，如果沒有則使用 _id
        const code = perm.code || perm._id
        if (code) {
          permissionCodes.add(String(code))
        }
      })
    }
  })
  return Array.from(permissionCodes)
})

// 額外權限選項：所有權限 - 角色權限
const extraPermissionOptions = computed(() => {
  if (selectedRolesField.value.value.length === 0) return []

  return availablePermissions.value.filter(perm => {
    return !selectedRolePermissionIds.value.includes(perm._id.toString())
  })
})

// 拒絕權限選項：僅顯示角色中已有的權限
const deniedPermissionOptions = computed(() => {
  if (selectedRolesField.value.value.length === 0) return []

  return availablePermissions.value.filter(perm => {
    return selectedRolePermissionIds.value.includes(perm._id.toString())
  })
})

// ===== 響應式表格抬頭設定 =====
const filteredHeaders = computed(() => {
  if (lgAndUp.value) {
    return tableHeaders.value
  }
  if (mdAndUp.value) {
    // 在 md 以上顯示 rbacRoles 和 lineUserId，但仍隱藏 email、note、employeeLink、avatar
    return tableHeaders.value.filter(header => header.key !== 'email' && header.key !== 'note' && header.key !== 'employeeLink' && header.key !== 'avatar')
  }
  // XS：同時隱藏 email、note、employeeLink、avatar、rbacRoles、lineUserId
  return tableHeaders.value.filter(header => header.key !== 'email' && header.key !== 'note' && header.key !== 'employeeLink' && header.key !== 'avatar' && header.key !== 'rbacRoles' && header.key !== 'lineUserId')
})

// ===== 輔助函數 =====

// 檢查員工關聯
const checkEmployeeLinks = async () => {
  try {
    const { data } = await apiAuth.post('/users/check-employee-links')
    if (data.success) {
      // 重新載入資料
      await tableLoadItems()

      // 顯示詳細結果
      console.log('檢查結果:', data.result)

      let message = `檢查完成！成功關聯 ${data.result.linked} 個用戶`
      if (data.result.errors.length > 0) {
        message += `，${data.result.errors.length} 個無法關聯`
      }

      createSnackbar({
        text: message,
        snackbarProps: { color: 'teal-lighten-1' }
      })

      // 如果有錯誤，顯示詳細資訊
      if (data.result.errors.length > 0) {
        console.log('無法關聯的用戶:', data.result.errors)
      }
    }
  } catch (error) {
    console.error('檢查員工關聯失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '檢查失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== 角色管理函數 =====
const loadRoles = async () => {
  try {
    const result = await permissionStore.getAllRoles()
    // result 已經是角色陣列，不需要再訪問 .data
    availableRoles.value = result.map(role => ({
      _id: role._id,
      name: role.name,
      code: role.code
    }))

    // 儲存完整的角色資訊（包含權限）
    rolesWithPermissions.value = result.map(role => ({
      _id: role._id,
      name: role.name,
      code: role.code,
      permissions: role.permissions || []
    }))
  } catch (error) {
    console.error('載入角色失敗:', error)
    createSnackbar({
      text: error.message || '載入角色失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

// ===== 載入權限選項 =====
const loadPermissions = async () => {
  try {
    const result = await permissionStore.getAllPermissions()
    availablePermissions.value = result.map(permission => ({
      _id: permission._id,
      name: permission.name,
      code: permission.code
    }))
  } catch (error) {
    console.error('載入權限失敗:', error)
    createSnackbar({
      text: error.message || '載入權限失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

const loadCompanies = async () => {
  try {
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = Array.isArray(data.result?.data) ? data.result.data : (data.result || [])
    }
  } catch (error) {
    console.error('載入公司清單失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入公司清單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const loadDepartmentsByCompany = async (companyId) => {
  departments.value = []
  if (!companyId) {
    return
  }
  try {
    const { data } = await apiAuth.get('/departments/suggestions', {
      params: { company: companyId }
    })
    if (data.success) {
      departments.value = Array.isArray(data.result) ? data.result : []
    }
  } catch (error) {
    console.error('載入部門清單失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門清單失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// ===== API 相關函數 =====
const tableLoadItems = async (reset) => {
  if (reset) {
    tablePage.value = 1
  }
  // 當選擇「全部」時，重置頁碼為 1
  if (tableItemsPerPage.value === -1) {
    tablePage.value = 1
  }
  await performSearch()
}

const performSearch = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value === -1 ? (tableItemsLength.value > 0 ? tableItemsLength.value : 999999) : tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'userId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: quickSearchText.value,
      statusFilter: statusFilter.value || '',
      systemAccountFilter: 'all',
      lineAccountFilter: lineAccountFilter.value || 'all',
      roleFilter: roleFilter.value || '',
      companyFilter: companyFilter.value || '',
      departmentFilter: departmentFilter.value || ''
    }

    const { data } = await apiAuth.get('/users/search', { params })

    if (data.success) {
      // 載入每個用戶的 RBAC 角色
      const usersWithRoles = await Promise.all(
        data.result.data.map(async (user) => {
          try {
            const rolesResult = await permissionStore.getUserRoles(user._id)
            return {
              ...user,
              rbacRoles: rolesResult || []
            }
          } catch (error) {
            console.error(`載入用戶 ${user.name} 的角色失敗:`, error)
            return {
              ...user,
              rbacRoles: []
            }
          }
        })
      )

      tableItems.value = usersWithRoles
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('搜索失敗:', error)
    const errorMessage = error?.response?.data?.message || '搜索失敗'
    if (error?.response?.status === 401) {
      await user.logout()
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
    tableLoading.value = false
  }
}

// ===== 表單操作函數 =====
const submit = handleSubmit(async (values) => {
  try {
    if (isEditing.value) {
      // 檢查是否有基本資料變更
      const basicFieldsChanged = ['email', 'name', 'note', 'userId', 'isSystemAccount'].some(key => {
        const formValue = key === 'email' ? email.value.value :
                        key === 'name' ? name.value.value :
                        key === 'note' ? note.value.value :
                        key === 'userId' ? userId.value.value :
                        key === 'isSystemAccount' ? isSystemAccount.value.value : null
        return originalData.value[key] !== formValue
      })

      // 檢查是否有角色變更
      const originalRoles = originalData.value.selectedRoles || []
      const currentRoles = selectedRolesField.value.value || []
      const rolesChanged = originalRoles.length !== currentRoles.length ||
        !originalRoles.every(roleId => currentRoles.includes(roleId))

      // 檢查是否有額外權限變更
      const originalExtraPermissions = originalData.value.extraPermissions || []
      const currentExtraPermissions = extraPermissionsField.value.value || []
      const extraPermissionsChanged = originalExtraPermissions.length !== currentExtraPermissions.length ||
        !originalExtraPermissions.every(permId => currentExtraPermissions.includes(permId))

      // 檢查是否有拒絕權限變更
      const originalDeniedPermissions = originalData.value.deniedPermissions || []
      const currentDeniedPermissions = deniedPermissionsField.value.value || []
      const deniedPermissionsChanged = originalDeniedPermissions.length !== currentDeniedPermissions.length ||
        !originalDeniedPermissions.every(permId => currentDeniedPermissions.includes(permId))

      // 準備更新資料
      const updateData = { ...values }

      // 如果有角色變更，將角色 ID 加入更新資料中
      if (rolesChanged) {
        updateData.roleIds = selectedRolesField.value.value
      }

      // 如果有額外權限變更，將額外權限 ID 加入更新資料中
      if (extraPermissionsChanged) {
        updateData.extraPermissionIds = extraPermissionsField.value.value
      }

      // 如果有拒絕權限變更，將拒絕權限 ID 加入更新資料中
      if (deniedPermissionsChanged) {
        updateData.deniedPermissionIds = deniedPermissionsField.value.value
      }

      // 如果有任何變更，執行更新
      if (basicFieldsChanged || rolesChanged || extraPermissionsChanged || deniedPermissionsChanged) {
        await apiAuth.patch(`users/${dialog.value.id}`, updateData)

        // 重新載入表格數據以確保排序正確
        await tableLoadItems(false)
      }
    } else {
      const submitData = Object.fromEntries(
        Object.entries(values).filter(([key]) => key !== 'userId')
      )

      // 將角色 ID 加入提交資料中
      if (selectedRolesField.value.value.length > 0) {
        submitData.roleIds = selectedRolesField.value.value
      }

      // 將額外權限 ID 加入提交資料中
      if (extraPermissionsField.value.value.length > 0) {
        submitData.extraPermissionIds = extraPermissionsField.value.value
      }

      // 將拒絕權限 ID 加入提交資料中
      if (deniedPermissionsField.value.value.length > 0) {
        submitData.deniedPermissionIds = deniedPermissionsField.value.value
      }

      await apiAuth.post('/users', submitData)
      await tableLoadItems(true)
    }

    createSnackbar({
      text: isEditing.value ? '用戶資料更新成功' : '用戶新增成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closeDialog()
  } catch (error) {
    const message = error?.response?.data?.message || '操作失敗'
    createSnackbar({
      text: message,
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
})

// ===== 對話框操作函數 =====
const openDialog = async (item) => {
  dialog.value.open = true

  if (item) {
    isEditing.value = true
    dialog.value.id = item._id
    email.value.value = item.email
    name.value.value = item.name
    note.value.value = item.note
    userId.value.value = item.userId
    isSystemAccount.value.value = item.isSystemAccount || false
    password.value.value = ''
    confirmPassword.value.value = ''

    // 載入用戶的 RBAC 角色
    try {
      const userRoles = await permissionStore.getUserRoles(item._id)
      selectedRolesField.value.value = userRoles
        ?.filter(userRole => userRole.isActive)
        ?.map(userRole => userRole.role._id) || []
    } catch (error) {
      console.error('載入用戶角色失敗:', error)
      selectedRolesField.value.value = []
    }

    // 等待角色載入完成後，再載入額外權限和拒絕權限
    // 這樣 watch 可以正確過濾不在選項中的權限
    await nextTick()

    // 載入用戶的額外權限和拒絕權限
    // 如果用戶資料中已經有這些欄位，直接使用；否則從 API 獲取
    let extraPerms = []
    if (item.extraPermissions && item.extraPermissions.length > 0) {
      extraPerms = item.extraPermissions.map(perm => {
        if (typeof perm === 'string') {
          return perm
        } else if (perm._id) {
          return perm._id
        }
        return perm
      })
    }

    let deniedPerms = []
    if (item.deniedPermissions && item.deniedPermissions.length > 0) {
      deniedPerms = item.deniedPermissions.map(perm => {
        if (typeof perm === 'string') {
          return perm
        } else if (perm._id) {
          return perm._id
        }
        return perm
      })
    }

    // 過濾掉不在當前角色選項中的權限
    // 等待權限載入完成
    await loadPermissions()

    const newExtraOptions = extraPermissionOptions.value.map(p => p._id.toString())
    const newDeniedOptions = deniedPermissionOptions.value.map(p => p._id.toString())

    extraPermissionsField.value.value = extraPerms.filter(permId => {
      return newExtraOptions.includes(permId.toString())
    })

    deniedPermissionsField.value.value = deniedPerms.filter(permId => {
      return newDeniedOptions.includes(permId.toString())
    })

    originalData.value = {
      email: item.email,
      name: item.name,
      note: item.note,
      userId: item.userId,
      isSystemAccount: item.isSystemAccount || false,
      selectedRoles: [...selectedRolesField.value.value], // 保存原始角色選擇
      extraPermissions: [...extraPermissionsField.value.value], // 保存原始額外權限
      deniedPermissions: [...deniedPermissionsField.value.value] // 保存原始拒絕權限
    }
  } else {
    isEditing.value = false
    dialog.value.id = ''
    selectedRolesField.value.value = []
    extraPermissionsField.value.value = []
    deniedPermissionsField.value.value = []
    originalData.value = null
    resetForm()
  }
}

const closeDialog = () => {
  dialog.value.open = false
  originalData.value = null
  resetForm()
}

// ===== 刪除用戶函數 =====
const deleteUser = async () => {
  try {
    tableLoading.value = true
    await apiAuth.delete(`/users/${dialog.value.id}`)
    closeDialog()
    await tableLoadItems(true)

    createSnackbar({
      text: '用戶刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    console.error('Delete user error:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
    confirmDeleteDialog.value = false
  }
}

// ===== 計算屬性 =====
const hasChanges = computed(() => {
  if (!isEditing.value) return true
  if (!originalData.value) return false

  // 檢查基本欄位變更
  const basicFieldsChanged = ['email', 'name', 'note', 'userId', 'isSystemAccount'].some(key => {
    const formValue = key === 'email' ? email.value.value :
                    key === 'name' ? name.value.value :
                    key === 'note' ? note.value.value :
                    key === 'userId' ? userId.value.value :
                    key === 'isSystemAccount' ? isSystemAccount.value.value : null
    return originalData.value[key] !== formValue
  })

  // 檢查 RBAC 角色變更
  const originalRoles = originalData.value.selectedRoles || []
  const currentRoles = selectedRolesField.value.value || []
  const rolesChanged = originalRoles.length !== currentRoles.length ||
    !originalRoles.every(roleId => currentRoles.includes(roleId))

  // 檢查額外權限變更
  const originalExtraPermissions = originalData.value.extraPermissions || []
  const currentExtraPermissions = extraPermissionsField.value.value || []
  const extraPermissionsChanged = originalExtraPermissions.length !== currentExtraPermissions.length ||
    !originalExtraPermissions.every(permId => currentExtraPermissions.includes(permId))

  // 檢查拒絕權限變更
  const originalDeniedPermissions = originalData.value.deniedPermissions || []
  const currentDeniedPermissions = deniedPermissionsField.value.value || []
  const deniedPermissionsChanged = originalDeniedPermissions.length !== currentDeniedPermissions.length ||
    !originalDeniedPermissions.every(permId => currentDeniedPermissions.includes(permId))

  return basicFieldsChanged || rolesChanged || extraPermissionsChanged || deniedPermissionsChanged
})

// ===== 監聽器 =====
const debouncedQuickSearch = debounce(() => {
  tablePage.value = 1
  tableLoading.value = true // 開始搜尋時顯示 loading
  performSearch()
    .finally(() => {
      tableLoading.value = false // 搜尋完成後關閉 loading
    })
}, 300)

watch(quickSearchText, (newVal) => {
  debouncedQuickSearch(newVal)
})

watch(companyFilter, (newCompany) => {
  departmentFilter.value = null
  loadDepartmentsByCompany(newCompany)
})

// 重置搜尋條件
const resetSearch = () => {
  statusFilter.value = null
  lineAccountFilter.value = null
  roleFilter.value = null
  companyFilter.value = null
  departmentFilter.value = null
  departments.value = []
  quickSearchText.value = ''
  tableLoadItems(true)
}

// 監聽角色選擇變化，自動清理不在新選項中的額外/拒絕權限
watch(() => selectedRolesField.value.value, (newRoleIds) => {
  if (newRoleIds.length === 0) {
    // 如果沒有選擇角色，清空額外和拒絕權限
    extraPermissionsField.value.value = []
    deniedPermissionsField.value.value = []
    return
  }

  // 計算新的選項
  const newExtraOptions = extraPermissionOptions.value.map(p => p._id.toString())
  const newDeniedOptions = deniedPermissionOptions.value.map(p => p._id.toString())

  // 清理不在新選項中的額外權限
  extraPermissionsField.value.value = extraPermissionsField.value.value.filter(permId => {
    return newExtraOptions.includes(permId.toString())
  })

  // 清理不在新選項中的拒絕權限
  deniedPermissionsField.value.value = deniedPermissionsField.value.value.filter(permId => {
    return newDeniedOptions.includes(permId.toString())
  })
})

// ===== 生命週期鉤子 =====
onMounted(async () => {
  try {
    // 先載入角色和權限，這樣搜尋欄位才能正常顯示選項
    await loadRoles()
    await loadPermissions()
    await loadCompanies()
    await loadDepartmentsByCompany(companyFilter.value)
    await tableLoadItems(true)
  } catch (error) {
    console.error('初始化加載失敗:', error)
  }
})

// ===== 處理表格選項變更 =====
const handleTableOptionsChange = () => {
  tableLoadItems(false)
}

// ===== 添加 router =====
const router = useRouter()

// ===== 新增密碼相關的響應式變數 =====
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 將權限 ID 轉換為權限代碼（用於 PermissionSelector）
const convertIdsToCodes = (ids) => {
  return ids.map(id => {
    const perm = availablePermissions.value.find(p => {
      const permId = p._id || p.code
      return String(permId) === String(id)
    })
    // 如果找到，返回代碼；否則返回 ID 本身（可能是代碼）
    return perm ? (perm.code || perm._id) : id
  })
}

// 將權限代碼轉換為權限 ID（用於存儲）
const convertCodesToIds = (codes) => {
  return codes.map(code => {
    const perm = availablePermissions.value.find(p => {
      const permCode = p.code || p._id
      return String(permCode) === String(code)
    })
    // 如果找到，返回 ID；否則返回代碼本身（可能是 ID）
    return perm ? perm._id : code
  })
}

// 計算額外權限和拒絕權限的代碼（用於 PermissionSelector）
const extraPermissionsCodes = computed(() => {
  return convertIdsToCodes(extraPermissionsField.value.value || [])
})

const deniedPermissionsCodes = computed(() => {
  return convertIdsToCodes(deniedPermissionsField.value.value || [])
})

// ===== 權限選擇器相關函數 =====
const openPermissionSelector = () => {
  if (selectedRolesField.value.value.length === 0) {
    createSnackbar({
      text: '請先選擇角色',
      snackbarProps: { color: 'orange-darken-2' }
    })
    return
  }
  permissionSelectorDialog.value = true
}

const handlePermissionSelectorSave = (result) => {
  // result 可能是陣列（舊格式）或物件（新格式）
  let extraPermCodes = []
  let deniedPermCodes = []

  if (Array.isArray(result)) {
    // 舊格式：直接是權限陣列
    // 這種情況下，我們需要計算額外和拒絕權限
    const selectedPermCodes = new Set(result.map(c => String(c)))
    const basePermCodes = new Set(selectedRolePermissionCodes.value.map(c => String(c)))

    // 額外權限：選中但不在角色權限中的
    extraPermCodes = result.filter(perm => {
      return !basePermCodes.has(String(perm))
    })

    // 拒絕權限：在角色權限中但未選中的
    deniedPermCodes = Array.from(basePermCodes).filter(basePermCode => {
      return !selectedPermCodes.has(String(basePermCode))
    })
  } else {
    // 新格式：包含 permissions, extraPermissions, deniedPermissions
    extraPermCodes = result.extraPermissions || []
    deniedPermCodes = result.deniedPermissions || []
  }

  // 將權限代碼轉換為權限 ID 並存儲
  extraPermissionsField.value.value = convertCodesToIds(extraPermCodes)
  deniedPermissionsField.value.value = convertCodesToIds(deniedPermCodes)

  permissionSelectorDialog.value = false

  createSnackbar({
    text: '權限設定已更新',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

const handleResetToBasePermissions = () => {
  // 清除額外權限和拒絕權限
  extraPermissionsField.value.value = []
  deniedPermissionsField.value.value = []

  createSnackbar({
    text: '已重置為原角色權限',
    snackbarProps: { color: 'teal-lighten-1' }
  })
}

// ===== 處理狀態變更 =====
const showConfirmDialog = ref(false)
const showEnableDialog = ref(false)
const selectedUser = ref(null)

// 處理狀態變更
const handleStatusChange = (item) => {
  // 如果是要停用帳號，則顯示刪除確認對話框
  if (item.isActive) {
    selectedUser.value = item
    showConfirmDialog.value = true
  } else {
    // 如果是要啟用帳號，顯示啟用確認對話框
    selectedUser.value = item
    showEnableDialog.value = true
  }
}

// 確認停用帳號
const confirmStatusChange = async () => {
  if (selectedUser.value) {
    await updateUserStatus(selectedUser.value, false)
  }
}

// 確認啟用帳號
const confirmEnableUser = async () => {
  if (selectedUser.value) {
    await updateUserStatus(selectedUser.value, true)
  }
}

// 更新用戶狀態
const updateUserStatus = async (user, newStatus) => {
  try {
    const response = await apiAuth.patch(`/users/${user._id}`, {
      isActive: newStatus
    })

    if (response.data.success) {
      // 更新本地數據
      const index = tableItems.value.findIndex(u => u._id === user._id)
      if (index !== -1) {
        tableItems.value[index].isActive = newStatus
      }

      createSnackbar({
        text: `帳號已${newStatus ? '啟用' : '停用'}`,
        snackbarProps: { color: newStatus ? 'teal-lighten-1' : 'warning' }
      })
    }
  } catch (error) {
    console.error('更新用戶狀態失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
    // 恢復原狀態
    const index = tableItems.value.findIndex(u => u._id === user._id)
    if (index !== -1) {
      tableItems.value[index].isActive = !newStatus
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;
.v-data-table :deep(thead) {
  background-color: #455A64;
  color: white;
  height: 48px;
}

.odd-row {
  background-color: #f6f8fa;
}

.even-row {
  background-color: #fffaf0;
}

</style>
