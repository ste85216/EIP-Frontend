<template>
  <v-container max-width="1400">
    <!-- 主要內容區 -->
    <v-row class="elevation-4 rounded-lg py-4 py-sm-8 px-1 px-sm-10 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-10 mb-4 bg-white">
      <!-- 標題區 -->
      <v-col
        cols="12"
        class="ps-3 pb-6 d-flex align-center"
      >
        <h3>公司部門管理</h3>
        <v-icon
          v-if="smAndUp"
          v-tooltip="'人數為「在職」人數'"
          icon="mdi-information"
          size="small"
          color="blue-grey-darken-2"
          class="ms-4"
        />
      </v-col>

      <!-- 功能按鈕和搜尋區 -->
      <v-col cols="12">
        <v-row>
          <v-col>
            <v-row>
              <!-- 手機版按鈕 -->
              <v-col
                v-if="!mdAndUp"
                cols="6"
              >
                <v-btn
                  prepend-icon="mdi-domain"
                  variant="outlined"
                  color="blue-grey-darken-1"
                  class="me-2"
                  block
                  @click="openCompanyDialog"
                >
                  公司管理
                </v-btn>
              </v-col>
              <v-col
                v-if="!mdAndUp"
                cols="6"
              >
                <v-btn
                  prepend-icon="mdi-account-multiple-plus"
                  variant="outlined"
                  color="blue-grey-darken-1"
                  block
                  @click="openDepartmentDialog"
                >
                  新增部門
                </v-btn>
              </v-col>

              <!-- 桌面版按鈕 -->
              <v-col v-if="mdAndUp">
                <v-btn
                  v-if="!user.isIT"
                  prepend-icon="mdi-domain"
                  variant="outlined"
                  color="blue-grey-darken-1"
                  class="me-4"
                  @click="openCompanyDialog"
                >
                  公司管理
                </v-btn>
                <v-btn
                  prepend-icon="mdi-office-building-marker"
                  variant="outlined"
                  color="blue-grey-darken-2"
                  class="me-4"
                  @click="openLocationDialog"
                >
                  公司地點
                </v-btn>
                <v-btn
                  v-if="!user.isIT"
                  prepend-icon="mdi-account-multiple-plus"
                  variant="outlined"
                  color="blue-grey-darken-2"
                  @click="openDepartmentDialog"
                >
                  新增部門
                </v-btn>
              </v-col>

              <!-- 篩選和搜尋 -->
              <v-col
                cols="6"
                md="3"
                lg="2"
              >
                <v-select
                  v-model="companyFilter"
                  :items="[{ name: '全部', _id: '' }, ...sortedCompanies]"
                  label="選擇公司"
                  item-title="name"
                  item-value="_id"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="loadDepartments(true)"
                />
              </v-col>
              <v-col
                cols="6"
                md="3"
                lg="2"
                class="d-flex justify-end align-center ps-0"
              >
                <v-icon
                  v-if="smAndUp"
                  v-tooltip:top="'可搜尋部門編號、部門名稱'"
                  icon="mdi-information"
                  size="small"
                  color="blue-grey-darken-2"
                  class="me-3"
                />
                <v-text-field
                  v-model="tableSearch"
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

          <!-- 資料表格 -->
          <v-col cols="12">
            <v-data-table-server
              :key="tableKey"
              v-model:items-per-page="tableItemsPerPage"
              v-model:sort-by="tableSortBy"
              :items="departments"
              :items-length="tableItemsLength"
              :loading="tableLoading"
              :page="tablePage"
              :headers="filteredHeaders"
              :header-props="headerProps"
              :items-per-page-options="[10, 20, 50]"
              density="compact"
              hover
              class="rounded-ts-lg rounded-te-lg"
              @update:options="handleTableUpdate"
            >
              <template #item="{ item, index }">
                <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                  <td>{{ item.departmentId || '尚未設定' }}</td>
                  <td v-if="smAndUp">
                    {{ item.company?.name || '未設定' }}
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.employeeCount }} 人</td>
                  <td class="d-flex justify-center h-25">
                    <v-btn
                      icon
                      color="light-blue-darken-4"
                      variant="plain"
                      :size="buttonSize"
                      :ripple="false"
                      :disabled="user.isIT"
                      @click="openEditDepartment(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="red-lighten-1"
                      variant="plain"
                      :size="buttonSize"
                      :ripple="false"
                      :disabled="user.isIT"
                      @click="confirmDeleteDepartment(item)"
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

    <!-- 公司管理 Dialog -->
    <v-dialog
      v-model="companyDialog.open"
      persistent
      max-width="940"
    >
      <v-card class="rounded-lg ps-8 pe-4 py-4">
        <div class="card-title pb-2 d-flex justify-space-between align-center">
          公司管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeCompanyDialog"
          />
        </div>
        <v-card-text class="ps-2">
          <v-row>
            <!-- 左側現有公司列表 -->
            <v-col
              cols="7"
              class="px-5 border rounded-lg"
            >
              <v-row>
                <v-col class="card-subtitle text-blue-grey-darken-2 pt-3 mb-4">
                  現有公司列表
                </v-col>
              </v-row>
              <div class="mb-8">
                <v-chip
                  v-for="company in sortedCompanies"
                  :key="company._id"
                  color="blue-grey-darken-2"
                  label
                  class="me-4 mb-2 pa-4 pe-1"
                >
                  <span class="text-pink-lighten-2">{{ company.companyId }}&nbsp;</span>
                  {{ company.name }}
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
                        @click="openEditCompany(company)"
                      >
                        <v-icon
                          icon="mdi-pencil"
                          size="16"
                          color="light-blue-darken-4"
                        />
                        <span
                          class="ps-2 text-blue-grey-darken-2"
                          style="font-size: 14px;"
                        >編輯</span>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        @click="openPasswordDialog(company)"
                      >
                        <v-icon
                          icon="mdi-lock"
                          size="16"
                          color="teal-darken-2"
                        />
                        <span
                          class="ps-2 text-blue-grey-darken-2"
                          style="font-size: 14px;"
                        >管理密碼</span>
                      </v-list-item>
                      <v-list-item
                        density="compact"
                        class="ps-2 pe-3 py-0"
                        color="red-lighten-1"
                        @click="confirmDeleteCompany(company)"
                      >
                        <v-icon
                          icon="mdi-delete"
                          size="16"
                          color="red-lighten-1"
                        />
                        <span
                          class="ps-2 text-blue-grey-darken-2"
                          style="font-size: 14px;"
                        >刪除</span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-chip>
              </div>
            </v-col>
            <v-spacer />
            <!-- 右側新增公司表單 -->
            <v-col
              cols="4"
              class="border rounded-lg px-4 pt-4"
            >
              <v-row>
                <v-col
                  cols="12"
                  class="card-subtitle text-blue-grey-darken-2 mb-4"
                >
                  新增公司
                </v-col>
              </v-row>
              <v-form @submit.prevent="submitCompany">
                <v-text-field
                  v-model="companyForm.name"
                  :error-messages="companyErrors"
                  label="新增公司"
                  required
                  variant="outlined"
                  density="compact"
                />
                <v-card-actions class="pa-0 mt-2">
                  <v-spacer />
                  <v-btn
                    color="teal-darken-1"
                    variant="outlined"
                    type="submit"
                    size="small"
                    :loading="isSubmitting"
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

    <!-- 編輯公司 Dialog -->
    <v-dialog
      v-model="editCompanyDialog.open"
      persistent
      width="320"
    >
      <v-card class="rounded-lg pa-4">
        <div class="card-title px-4 py-3">
          編輯公司
        </div>
        <v-card-text class="pb-1 px-4">
          <v-form @submit.prevent="submitEditCompany">
            <v-text-field
              v-model="editCompanyDialog.companyId"
              label="公司編號"
              variant="outlined"
              density="compact"
              class="mb-4"
            />
            <v-text-field
              v-model="editCompanyDialog.name"
              :error-messages="editCompanyErrors"
              label="公司名稱"
              required
              variant="outlined"
              density="compact"
            />
            <v-card-actions class="pa-0 mt-2">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                @click="closeEditCompanyDialog"
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

    <!-- 刪除確認 Dialog -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteCompanyDialog.open"
      title="確認刪除公司"
      :message="`確定要刪除公司「<span class='text-pink-lighten-1' style='font-weight: 800;'>${deleteCompanyDialog.name}</span>」嗎？此操作無法復原。`"
      :expected-name="deleteCompanyDialog.name"
      input-label="公司名稱"
      @confirm="deleteCompany"
    />

    <!-- 部門刪除確認 Dialog -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteDepartmentDialog.open"
      title="確認刪除部門"
      :message="`確定要刪除「<span class='text-teal-darken-2' style='font-weight: 800;'>${deleteDepartmentDialog.companyName}</span>」的「<span class='text-pink-lighten-1' style='font-weight: 800;'>${deleteDepartmentDialog.name}</span>」嗎？此操作無法復原。`"
      :expected-name="deleteDepartmentDialog.name"
      input-label="部門名稱"
      @confirm="deleteDepartment"
    />

    <!-- 部門管理 Dialog -->
    <v-dialog
      v-model="departmentDialog.open"
      persistent
      width="320"
    >
      <v-card class="rounded-lg px-2 pt-4">
        <div class="card-title ps-6 py-3">
          {{ departmentDialog.id ? '編輯部門' : '新增部門' }}
        </div>
        <v-card-text>
          <v-form @submit.prevent="submitDepartment">
            <v-select
              v-model="departmentForm.company"
              :items="companies"
              :item-title="item => item ? `${item.name} (${item.companyId})` : ''"
              item-value="_id"
              label="*選擇公司"
              required
              variant="outlined"
              density="compact"
              class="mb-3"
              :error-messages="departmentErrors.company"
            />
            <v-select
              v-model="departmentForm.departmentCode"
              :items="defaultDepartments"
              item-title="name"
              item-value="code"
              label="參考部門代碼 ( 可不選 )"
              required
              clearable
              hint="選擇後，會自動帶入部門編號及部門名稱"
              persistent-hint
              variant="outlined"
              density="compact"
              class="mb-3"
              :error-messages="departmentErrors.departmentCode"
              :disabled="!departmentForm.company"
            />
            <v-text-field
              v-model="departmentForm.departmentId"
              label="*部門編號"
              required
              variant="outlined"
              density="compact"
              class="mb-3"
              clearable
              :error-messages="departmentErrors.departmentId"
              :hint="departmentForm.company ? '建議輸入「公司編號 + 部門代碼」' : '請先選擇公司'"
              persistent-hint
              :disabled="!departmentForm.company"
            />
            <v-text-field
              v-model="departmentForm.name"
              label="*部門名稱"
              required
              variant="outlined"
              density="compact"
              clearable
              :error-messages="departmentErrors?.name"
              :hint="'請輸入部門名稱'"
              persistent-hint
              :disabled="!departmentForm.company"
            />
            <v-card-actions class="pa-0 mt-2">
              <v-spacer />
              <v-btn
                color="grey-darken-1"
                variant="outlined"
                :size="buttonSize"
                @click="closeDepartmentDialog"
              >
                取消
              </v-btn>
              <v-btn
                color="teal-darken-1"
                variant="outlined"
                type="submit"
                :size="buttonSize"
                :loading="isSubmitting"
                class="ms-2"
              >
                {{ departmentDialog.id ? '修改' : '新增' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 公司地點管理 Dialog -->
    <v-dialog
      v-model="locationDialog.open"
      max-width="1200"
    >
      <v-card class="rounded-lg px-2 py-4">
        <div class="card-title ps-6 pe-3 pb-2 d-flex justify-space-between align-center">
          公司地點管理
          <v-btn
            icon="mdi-close"
            color="red-lighten-1"
            variant="plain"
            :size="buttonSize"
            @click="closeLocationDialog"
          />
        </div>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-table
                density="compact"
                class="rounded-ts-lg rounded-te-lg"
              >
                <thead>
                  <tr>
                    <th>公司</th>
                    <th>地點</th>
                    <th class="text-center">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(company, index) in companies"
                    :key="company._id"
                    :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }"
                  >
                    <td style="min-width: 100px;">
                      {{ company.name }}
                    </td>
                    <td class="pt-2">
                      <v-chip
                        v-for="location in [...company.locations].sort((a, b) => a.order - b.order)"
                        :key="location._id"
                        class="me-2 mb-2"
                        variant="outlined"
                        color="blue-grey-darken-2"
                        label
                      >
                        {{ location.locationName }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon
                        color="light-blue-darken-4"
                        variant="plain"
                        :size="buttonSize"
                        :ripple="false"
                        @click="editCompanyLocations(company)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 新增/新增/編輯地點 Dialog -->
    <v-dialog
      v-model="editLocationDialog.open"
      persistent
      width="400"
    >
      <v-card class="rounded-lg px-4 pt-7 pb-6">
        <v-form @submit.prevent="submitEditLocations">
          <div class="card-title px-4 pb-2 d-flex align-center justify-space-between">
            <span>新增 / 編輯公司地點</span>
            <div>
              <v-btn
                v-tooltip:start="'批量新增地點'"
                icon
                color="grey-darken-1"
                size="22"
                class="me-2"
                @click="openBatchLocationDialog"
              >
                <v-icon size="14">
                  mdi-plus-box-multiple-outline
                </v-icon>
              </v-btn>
              <v-btn
                v-tooltip:start="'新增地點'"
                icon
                color="grey-darken-1"
                size="22"
                @click="addEditingLocation"
              >
                <v-icon size="14">
                  mdi-plus
                </v-icon>
              </v-btn>
            </div>
          </div>
          <v-card-text class="mt-3 pa-3">
            <v-row>
              <v-col
                v-for="(location, index) in editingLocations"
                :key="index"
                cols="12"
                class="mt-4"
              >
                <div class="d-flex align-center item-container">
                  <v-row>
                    <v-col
                      cols="9"
                      class="d-flex align-center pe-0"
                    >
                      <div class="order-number">
                        {{ index + 1 }}
                      </div>
                      <v-text-field
                        v-model="location.locationName"
                        :error-messages="location.error"
                        label="*地點名稱"
                        type="text"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details="auto"
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="d-flex align-center"
                    >
                      <div class="d-flex align-center justify-space-between w-100 pe-1">
                        <div class="d-flex flex-column">
                          <v-btn
                            v-if="index > 0"
                            icon
                            variant="text"
                            color="grey-darken-1"
                            size="18"
                            :ripple="false"
                            class="me-1"
                            @click="moveLocation(index, 'up')"
                          >
                            <v-icon size="18">
                              mdi-chevron-up
                            </v-icon>
                          </v-btn>
                          <v-btn
                            v-if="index < editingLocations.length - 1"
                            icon
                            variant="text"
                            color="grey-darken-1"
                            size="18"
                            :ripple="false"
                            class="me-1"
                            @click="moveLocation(index, 'down')"
                          >
                            <v-icon size="18">
                              mdi-chevron-down
                            </v-icon>
                          </v-btn>
                        </div>

                        <v-btn
                          icon
                          variant="text"
                          color="red-lighten-1"
                          size="20"
                          @click="removeEditingLocation(index)"
                        >
                          <v-icon size="18">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-3 pt-4">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              :size="buttonSize"
              @click="closeEditLocationDialog"
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
              :disabled="!hasLocationChanges"
            >
              確定
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 批量新增 Dialog -->
    <v-dialog
      v-model="batchLocationDialog.open"
      persistent
      width="300"
    >
      <v-card class="rounded-lg px-4 pt-7 pb-6">
        <v-form @submit.prevent="handleBatchLocationAdd">
          <div class="card-title px-4 pb-2">
            批量新增地點
          </div>
          <v-card-text class="mt-3 pa-3">
            <v-text-field
              v-model="batchLocationDialog.count"
              label="請輸入要新增的地點數量"
              type="number"
              min="1"
              max="10"
              variant="outlined"
              density="compact"
              :error-messages="batchLocationDialog.error"
              hide-details="auto"
            />
          </v-card-text>
          <v-card-actions class="px-3 pt-4">
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              size="small"
              @click="closeBatchLocationDialog"
            >
              取消
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="outlined"
              class="ms-1"
              size="small"
              type="submit"
            >
              確定
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 密碼管理 Dialog -->
    <v-dialog
      v-model="passwordDialog.open"
      persistent
      max-width="320"
    >
      <v-card class="rounded-lg px-4 pt-7 pb-6">
        <div class="card-title px-4 pb-2">
          管理公司密碼
        </div>
        <v-card-text class="mt-3 pa-3">
          <v-text-field
            v-model="passwordDialog.newPassword"
            label="新密碼"
            type="password"
            variant="outlined"
            density="compact"
            :error-messages="passwordDialog.error"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="px-3 pt-4">
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            :size="buttonSize"
            @click="closePasswordDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :size="buttonSize"
            :loading="isSubmitting"
            :disabled="!passwordDialog.newPassword"
            class="ms-2"
            @click="updateCompanyPassword"
          >
            更新
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
import UserRole from '@/enums/UserRole'
import ConfirmDeleteDialogWithTextField from '@/components/ConfirmDeleteDialogWithTextField.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

definePage({
  meta: {
    title: '公司部門管理 | GInternational',
    login: true,
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.IT]
  }
})

const { smAndUp, mdAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const router = useRouter()
const user = useUserStore()
const buttonSize = computed(() => (smAndUp.value ? 'default' : 'small'))

// 表格相關
const tableKey = ref(0)
const tableLoading = ref(false)
const tableItemsPerPage = ref(10)
const tableSortBy = ref([{ key: 'departmentId', order: 'asc' }])
const tablePage = ref(1)
const tableItemsLength = ref(0)
const tableSearch = ref('')
const companyFilter = ref('')

const headerProps = {
  class: 'header-bg'
}

const tableHeaders = [
  { title: '部門編號', key: 'departmentId', align: 'start', minWidth: '68px', sortable: true },
  { title: '公司', key: 'company.name', align: 'start', minWidth: '68px', sortable: true },
  { title: '部門', key: 'name', align: 'start', minWidth: '68px', sortable: true },
  { title: '人數', key: 'employeeCount', align: 'start', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

const filteredHeaders = computed(() => {
  return smAndUp.value
    ? tableHeaders
    : tableHeaders.filter(header => ['departmentId', 'name', 'employeeCount', 'actions'].includes(header.key))
})

// 公司相關
const companies = ref([])
const companyDialog = ref({ open: false })
const editCompanyDialog = ref({ open: false, _id: '', companyId: '', name: '' })
const deleteCompanyDialog = ref({ open: false, _id: '', name: '' })
const companyForm = ref({ name: '' })
const companyErrors = ref([])
const editCompanyErrors = ref([])

// 部門相關
const departments = ref([])
const departmentDialog = ref({
  open: false,
  id: null
})
const deleteDepartmentDialog = ref({ open: false, id: '', name: '', companyName: '' })
const departmentForm = ref({
  company: '',
  name: '',
  departmentId: '',
  departmentCode: '',
  originalData: null
})
const departmentErrors = ref({
  company: [],
  departmentId: [],
  departmentCode: [],
  name: []
})

const isSubmitting = ref(false)

// 排序後的公司列表
const sortedCompanies = computed(() => {
  return [...companies.value].sort((a, b) => a.companyId.localeCompare(b.companyId))
})

// 在 script 部分添加預設部門選項
const defaultDepartments = [
  { code: 'IT', name: 'IT (IT部)' },
  { code: 'OP', name: 'OP (OP部)' },
  { code: 'TO', name: 'TO (線控部)' },
  { code: 'AT', name: 'AT (機控部)' },
  { code: 'BC', name: 'BC (直售部)' },
  { code: 'BB', name: 'BB (同業部)' },
  { code: 'BD', name: 'BD (商務部)' },
  { code: 'MD', name: 'MD (行銷美編部)' },
  { code: 'FM', name: 'FM (財務管理部)' },
  { code: 'CI', name: 'CI (企業獎勵部)' },
  { code: 'GB', name: 'GB (高爾夫球事業部)' }
]

// 載入公司列表
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

// 載入部門列表
const loadDepartments = async (resetPage = false) => {
  if (resetPage) {
    tablePage.value = 1
  }

  tableLoading.value = true
  try {
    const params = {
      page: tablePage.value,
      itemsPerPage: tableItemsPerPage.value,
      sortBy: tableSortBy.value[0]?.key || 'departmentId',
      sortOrder: tableSortBy.value[0]?.order || 'asc',
      quickSearch: tableSearch.value,
      company: companyFilter.value
    }

    const { data } = await apiAuth.get('/departments/all', { params })
    if (data.success) {
      departments.value = data.result.data
      tableItemsLength.value = data.result.totalItems
    }
  } catch (error) {
    console.error('載入部門列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入部門列表失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    tableLoading.value = false
  }
}

// 公司相關操作
const openCompanyDialog = () => {
  companyDialog.value.open = true
  companyForm.value.name = ''
  companyErrors.value = []
}

const closeCompanyDialog = () => {
  companyDialog.value.open = false
  companyForm.value.name = ''
  companyErrors.value = []
}

const submitCompany = async () => {
  if (!companyForm.value.name) {
    companyErrors.value = ['請輸入公司名稱']
    return
  }

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.post('/companies', {
      name: companyForm.value.name
    })

    if (data.success) {
      companies.value.push(data.result)
      companyForm.value.name = ''
      companyErrors.value = []
      createSnackbar({
        text: '新增公司成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    companyErrors.value = [error?.response?.data?.message || '新增失敗']
  } finally {
    isSubmitting.value = false
  }
}

const openEditCompany = (company) => {
  editCompanyDialog.value = {
    open: true,
    _id: company._id,
    companyId: company.companyId,
    name: company.name
  }
}

const closeEditCompanyDialog = () => {
  editCompanyDialog.value = {
    open: false,
    _id: '',
    companyId: '',
    name: ''
  }
  editCompanyErrors.value = []
}

const submitEditCompany = async () => {
  if (!editCompanyDialog.value.name) {
    editCompanyErrors.value = ['請輸入公司名稱']
    return
  }

  isSubmitting.value = true
  try {
    const { data } = await apiAuth.patch(`/companies/${editCompanyDialog.value._id}`, {
      name: editCompanyDialog.value.name,
      companyId: editCompanyDialog.value.companyId
    })

    if (data.success) {
      const index = companies.value.findIndex(c => c._id === editCompanyDialog.value._id)
      if (index !== -1) {
        companies.value[index] = data.result
      }
      closeEditCompanyDialog()
      createSnackbar({
        text: '修改公司成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '修改失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmitting.value = false
  }
}

const confirmDeleteCompany = (company) => {
  deleteCompanyDialog.value = {
    open: true,
    _id: company._id,
    name: company.name
  }
}

const deleteCompany = async () => {
  try {
    await apiAuth.delete(`/companies/${deleteCompanyDialog.value._id}`)
    companies.value = companies.value.filter(c => c._id !== deleteCompanyDialog.value._id)
    deleteCompanyDialog.value.open = false
    createSnackbar({
      text: '刪除公司成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 表格更新處理
const handleTableUpdate = async (options) => {
  const { page, itemsPerPage, sortBy } = options
  tablePage.value = page
  tableItemsPerPage.value = itemsPerPage
  tableSortBy.value = sortBy
  await loadDepartments(false)
}

// 搜尋防抖
const debouncedSearch = debounce(() => {
  loadDepartments(true)
}, 300)

// 監聽搜尋和過濾條件變化
watch(tableSearch, () => {
  debouncedSearch()
})

watch([tableItemsPerPage, tableSortBy], () => {
  loadDepartments(true)
})

watch(companyFilter, () => {
  loadDepartments(true)
})

// 生命週期鉤子
onMounted(async () => {
  await Promise.all([
    loadCompanies(),
    loadDepartments()
  ])
})

// 部門相關操作
const openDepartmentDialog = () => {
  departmentDialog.value = {
    open: true,
    id: null
  }
  departmentForm.value = {
    company: '',
    name: '',
    departmentId: '',
    departmentCode: '',
    originalData: null
  }
  departmentErrors.value = {
    company: [],
    departmentId: [],
    departmentCode: [],
    name: []
  }
}

const closeDepartmentDialog = () => {
  departmentDialog.value = {
    open: false,
    id: null
  }
  departmentForm.value = {
    company: '',
    name: '',
    departmentId: '',
    departmentCode: '',
    originalData: null
  }
  departmentErrors.value = {
    company: [],
    departmentId: [],
    departmentCode: [],
    name: []
  }
}

const confirmDeleteDepartment = (department) => {
  deleteDepartmentDialog.value = {
    open: true,
    id: department._id,
    name: department.name,
    companyName: department.company?.name || '未知公司'
  }
}

const deleteDepartment = async () => {
  try {
    await apiAuth.delete(`/departments/${deleteDepartmentDialog.value.id}`)
    await loadDepartments()
    deleteDepartmentDialog.value.open = false
    createSnackbar({
      text: '刪除部門成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const submitDepartment = async () => {
  // 清空錯誤訊息
  departmentErrors.value = {
    company: [],
    departmentId: [],
    departmentCode: [],
    name: []
  }

  // 收集所有錯誤
  let hasError = false

  // 表單驗證
  if (!departmentForm.value.company) {
    departmentErrors.value.company = ['請選擇公司']
    hasError = true
  }
  if (!departmentForm.value.departmentId) {
    departmentErrors.value.departmentId = ['請輸入部門編號']
    hasError = true
  }
  if (!departmentForm.value.name?.trim()) {
    departmentErrors.value.name = ['請輸入部門名稱']
    hasError = true
  }

  if (hasError) return

  isSubmitting.value = true
  try {
    const departmentData = {
      company: departmentForm.value.company,
      departmentId: departmentForm.value.departmentId,
      name: departmentForm.value.name,
      departmentCode: departmentForm.value.departmentCode
    }

    if (departmentDialog.value.id) {
      // 編輯部門
      const { data } = await apiAuth.patch(`/departments/${departmentDialog.value.id}`, departmentData)
      if (data.success) {
        await loadDepartments()
        closeDepartmentDialog()
        createSnackbar({
          text: '修改部門成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    } else {
      // 新增部門
      const { data } = await apiAuth.post('/departments', departmentData)
      if (data.success) {
        await loadDepartments()
        closeDepartmentDialog()
        createSnackbar({
          text: '新增部門成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
      }
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message
    if (errorMessage?.includes('部門編號')) {
      departmentErrors.value.departmentId = [errorMessage]
    } else if (errorMessage?.includes('部門名稱')) {
      departmentErrors.value.name = [errorMessage]
    } else {
      createSnackbar({
        text: errorMessage || '操作失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const openEditDepartment = (department) => {
  departmentDialog.value = {
    open: true,
    id: department._id
  }
  departmentForm.value = {
    company: department.company._id,
    name: department.name,
    departmentId: department.departmentId,
    departmentCode: department.departmentCode,
    originalData: { ...department }
  }
}

// 修改監聽部門代碼的函數，讓名稱隨代碼變化而更新
watch(() => departmentForm.value.departmentCode, (newCode, oldCode) => {
  if (newCode) {
    const selectedDepartment = defaultDepartments.find(d => d.code === newCode)
    if (selectedDepartment) {
      const match = selectedDepartment.name.match(/\((.*?)\)/)
      if (match && match[1]) {
        // 只在新增模式或手動選擇部門代碼時更新名稱
        if (!departmentDialog.value.id || newCode !== oldCode) {
          departmentForm.value.name = match[1]
        }
      }
    }
  } else {
    // 只在新增模式下清空名稱
    if (!departmentDialog.value.id) {
      departmentForm.value.name = ''
    }
  }
})

// 修改監聽公司和部門代碼變化，自動生成部門編號
watch([() => departmentForm.value.company, () => departmentForm.value.departmentCode], () => {
  if (departmentForm.value.company && departmentForm.value.departmentCode) {
    const selectedCompany = companies.value.find(c => c._id === departmentForm.value.company)
    if (selectedCompany) {
      departmentForm.value.departmentId = `${selectedCompany.companyId}${departmentForm.value.departmentCode}`
    }
  } else if (!departmentDialog.value.id) {
    // 只在新增模式下清除部門編號
    departmentForm.value.departmentId = ''
  }
}, { immediate: true })

// 監聽各個欄位的變化，清除對應的錯誤訊息
watch(() => departmentForm.value.company, () => {
  if (departmentForm.value.company) {
    departmentErrors.value.company = []
  }
})

watch(() => departmentForm.value.departmentId, () => {
  if (departmentForm.value.departmentId) {
    departmentErrors.value.departmentId = []
  }
})

watch(() => departmentForm.value.name, () => {
  if (departmentForm.value.name?.trim()) {
    departmentErrors.value.name = []
  }
})

// 在 script setup 中添加
const locationDialog = ref({
  open: false
})

const editLocationDialog = ref({
  open: false,
  companyId: '',
  companyName: ''
})

const editingLocations = ref([])
const originalLocations = ref([])

const hasLocationChanges = computed(() => {
  if (editingLocations.value.length !== originalLocations.value.length) return true
  return editingLocations.value.some((loc, index) =>
    loc.locationName !== originalLocations.value[index]?.locationName
  )
})

const openLocationDialog = () => {
  locationDialog.value.open = true
}

const closeLocationDialog = () => {
  locationDialog.value.open = false
}

const editCompanyLocations = (company) => {
  editLocationDialog.value = {
    open: true,
    companyId: company._id,
    companyName: company.name
  }
  // 確保地點按照 order 排序
  const sortedLocations = [...company.locations].sort((a, b) => a.order - b.order)
  editingLocations.value = sortedLocations.map((loc, index) => ({
    ...loc,
    order: index,
    error: ''
  }))
  originalLocations.value = sortedLocations.map(loc => ({ ...loc }))
}

const closeEditLocationDialog = () => {
  editLocationDialog.value = {
    open: false,
    companyId: '',
    companyName: ''
  }
  editingLocations.value = []
  originalLocations.value = []
}

const addEditingLocation = () => {
  const newOrder = editingLocations.value.length
  editingLocations.value.push({
    locationName: '',
    order: newOrder,
    error: ''
  })
}

const removeEditingLocation = (index) => {
  editingLocations.value.splice(index, 1)
}

const validateLocations = (items) => {
  let hasError = false
  items.forEach(item => {
    item.error = ''
    if (!item.locationName?.trim()) {
      item.error = '請輸入地點名稱'
      hasError = true
    }
  })
  return !hasError
}

const submitEditLocations = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    if (!validateLocations(editingLocations.value)) {
      return
    }

    // 檢查重複的地點名稱
    const locationNames = editingLocations.value.map(loc => loc.locationName.trim())
    const uniqueLocationNames = new Set(locationNames)
    if (locationNames.length !== uniqueLocationNames.size) {
      createSnackbar({
        text: '同一公司內不能有重複的地點名稱',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    const { data } = await apiAuth.patch(`/companies/${editLocationDialog.value.companyId}`, {
      locations: editingLocations.value.map((loc, index) => ({
        locationName: loc.locationName.trim(),
        order: index
      }))
    })

    if (data.success) {
      createSnackbar({
        text: '地點更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      await loadCompanies()
      closeEditLocationDialog()
    }
  } catch (error) {
    console.error('更新地點時發生錯誤:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

// 統一錯誤處理
const handleError = (error) => {
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

const batchLocationDialog = ref({
  open: false,
  count: '',
  error: ''
})

const openBatchLocationDialog = () => {
  batchLocationDialog.value = {
    open: true,
    count: '',
    error: ''
  }
}

const closeBatchLocationDialog = () => {
  batchLocationDialog.value = {
    open: false,
    count: '',
    error: ''
  }
}

const handleBatchLocationAdd = () => {
  const count = parseInt(batchLocationDialog.value.count)
  if (!count || count < 1 || count > 10) {
    batchLocationDialog.value.error = '請輸入1-10之間的數字'
    return
  }

  batchLocationDialog.value.error = ''
  const startOrder = editingLocations.value.length
  const newLocations = Array(count).fill(null).map((_, index) => ({
    locationName: '',
    order: startOrder + index,
    error: ''
  }))
  editingLocations.value.push(...newLocations)
  closeBatchLocationDialog()
}

const moveLocation = (index, direction) => {
  if (
    (direction === 'up' && index === 0) ||
    (direction === 'down' && index === editingLocations.value.length - 1)
  ) {
    return
  }

  const newIndex = direction === 'up' ? index - 1 : index + 1
  const temp = { ...editingLocations.value[index] }
  editingLocations.value[index] = { ...editingLocations.value[newIndex], order: temp.order }
  editingLocations.value[newIndex] = { ...temp, order: editingLocations.value[index].order }
}

// 在 script setup 中添加
const passwordDialog = ref({
  open: false,
  companyId: '',
  companyName: '',
  newPassword: '',
  error: ''
})

const openPasswordDialog = (company) => {
  passwordDialog.value = {
    open: true,
    companyId: company._id,
    companyName: company.name,
    newPassword: '',
    error: ''
  }
}

const closePasswordDialog = () => {
  passwordDialog.value = {
    open: false,
    companyId: '',
    companyName: '',
    newPassword: '',
    error: ''
  }
}

const updateCompanyPassword = async () => {
  if (!passwordDialog.value.newPassword) return

  isSubmitting.value = true
  try {
    await apiAuth.patch(`/companies/${passwordDialog.value.companyId}/statistics-password`, {
      statisticsPassword: passwordDialog.value.newPassword
    })

    createSnackbar({
      text: '密碼更新成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })

    closePasswordDialog()
  } catch (error) {
    passwordDialog.value.error = error?.response?.data?.message || '密碼更新失敗'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.v-table :deep(thead) {
  background-color: #455a64 !important;
  color: #fff !important;
  height: 48px;
}

.item-container {
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #a9a9a9;
  border-radius: 4px;
  :deep(.v-field) {
    background-color: #fff;
  }
}

.v-table {
  :deep(tbody) {
    tr:nth-child(odd) {
      background-color: #f6f8fa !important;
    }
    tr:nth-child(even) {
      background-color: #fffaf0 !important;
    }
  }
}

.v-card-text .v-table {
  :deep(thead) {
    background-color: #5e3f32 !important;
  }
  :deep(tbody) {
    tr:nth-child(odd) {
      background-color: #fff5f4 !important;
    }
    tr:nth-child(even) {
      background-color: #f1fcff !important;
    }
  }
}

.order-number {
  min-width: 18px;
  height: 18px;
  border-radius: 12px;
  background-color: #666;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  margin-right: 8px;
}
</style>
