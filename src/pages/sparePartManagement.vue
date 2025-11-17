<template>
  <v-container max-width="1920">
    <v-row class="elevation-4 rounded-lg py-4 py-sm-6 px-1 px-sm-6 mt-2 mt-sm-6 mx-0 mx-sm-4 mx-md-4 mb-4 bg-white">
      <!-- 標題區塊 -->
      <v-col
        cols="12"
        class="ps-3 pb-0"
      >
        <h3>備品管理</h3>
      </v-col>

      <!-- 標籤頁 -->
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="teal-darken-1"
          align-tabs="start"
        >
          <v-tab
            v-if="showSparePartTab"
            value="spareParts"
          >
            <v-icon start>
              mdi-package-variant
            </v-icon>
            備品管理
          </v-tab>
          <v-tab
            v-if="showWarehouseTab"
            value="warehouses"
          >
            <v-icon start>
              mdi-warehouse
            </v-icon>
            倉庫管理
          </v-tab>
          <v-tab
            v-if="showManufacturerTab"
            value="manufacturers"
          >
            <v-icon start>
              mdi-factory
            </v-icon>
            廠商管理
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- 備品管理標籤頁 -->
          <v-window-item value="spareParts">
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
                      @click="openSparePartDialog"
                    >
                      新增備品
                    </v-btn>
                    <v-btn
                      prepend-icon="mdi-sort"
                      color="blue-grey-darken-2"
                      variant="outlined"
                      :size="buttonSize"
                      class="ms-3"
                      @click="openSortDialog"
                    >
                      排序
                    </v-btn>
                  </v-col>
                  <v-spacer />
                  <v-col
                    cols="12"
                    md="3"
                  >
                    <v-text-field
                      v-model="sparePartSearchText"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋備品"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      :loading="sparePartLoading"
                    />
                  </v-col>
                </v-row>

                <!-- 備品表格 -->
                <v-data-table-server
                  v-model:items-per-page="itemsPerPage"
                  :items="spareParts"
                  :headers="sparePartHeaders"
                  :loading="sparePartLoading"
                  :page="sparePartCurrentPage"
                  :items-length="sparePartTotalItems"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                  @update:options="handleSparePartTableOptionsChange"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td class="text-center">
                        <v-chip
                          size="small"
                          color="blue-grey"
                          variant="tonal"
                        >
                          {{ item.order || 0 }}
                        </v-chip>
                      </td>
                      <td>{{ item.name }}</td>
                      <td>
                        <v-chip
                          :color="item.isActive ? 'success' : 'error'"
                          size="small"
                          variant="tonal"
                        >
                          {{ item.isActive ? '啟用' : '停用' }}
                        </v-chip>
                      </td>
                      <td>{{ formatDate(item.createdAt) }}</td>
                      <td>{{ item.creator?.name || '-' }}</td>
                      <td>{{ item.manufacturer?.name || '-' }}</td>
                      <td
                        style="max-width: 280px;"
                      >
                        <div
                          v-if="item.warehouses && item.warehouses.length > 0"
                          class="d-flex flex-wrap ga-1 py-2"
                        >
                          <v-chip
                            v-for="warehouse in item.warehouses"
                            :key="warehouse._id || warehouse"
                            size="small"
                            variant="tonal"
                            color="teal-darken-1"
                          >
                            {{ warehouse.name || warehouse }}
                          </v-chip>
                        </div>
                        <span
                          v-else
                          class="text-grey"
                        >
                          -
                        </span>
                      </td>
                      <td>
                        <span v-if="item.packaging">
                          {{ item.packaging }}
                        </span>
                        <span
                          v-else
                          class="text-grey"
                        >
                          -
                        </span>
                      </td>
                      <td>{{ formatCurrency(item.cost) }}</td>
                      <td>{{ formatCurrency(item.price) }}</td>
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
                          @click="editSparePart(item)"
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
                          @click="confirmDeleteSparePart(item)"
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

          <!-- 倉庫管理標籤頁 -->
          <v-window-item value="warehouses">
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
                      @click="openWarehouseDialog"
                    >
                      新增倉庫
                    </v-btn>
                    <v-btn
                      prepend-icon="mdi-sort"
                      color="blue-grey-darken-2"
                      variant="outlined"
                      :size="buttonSize"
                      class="ms-3"
                      @click="openWarehouseSortDialog"
                    >
                      排序
                    </v-btn>
                  </v-col>
                  <v-spacer />
                  <v-col
                    cols="12"
                    md="3"
                  >
                    <v-text-field
                      v-model="warehouseSearchText"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋倉庫"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      :loading="warehouseLoading"
                    />
                  </v-col>
                </v-row>

                <!-- 倉庫表格 -->
                <v-data-table-server
                  v-model:items-per-page="itemsPerPage"
                  :items="warehouses"
                  :headers="warehouseHeaders"
                  :loading="warehouseLoading"
                  :page="warehouseCurrentPage"
                  :items-length="warehouseTotalItems"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                  @update:options="handleWarehouseTableOptionsChange"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td class="text-center">
                        <v-chip
                          size="small"
                          color="blue-grey"
                          variant="tonal"
                        >
                          {{ item.order || 0 }}
                        </v-chip>
                      </td>
                      <td>{{ item.name }}</td>
                      <td>
                        <v-chip
                          :color="item.isActive ? 'success' : 'error'"
                          size="small"
                          variant="tonal"
                        >
                          {{ item.isActive ? '啟用' : '停用' }}
                        </v-chip>
                      </td>
                      <td>{{ formatDate(item.createdAt) }}</td>
                      <td>{{ item.creator?.name || '-' }}</td>
                      <td>{{ item.company?.name || '-' }}</td>
                      <td>
                        <span v-if="item.address">
                          {{ item.address }}
                        </span>
                        <span
                          v-else
                          class="text-grey"
                        >
                          -
                        </span>
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
                          @click="editWarehouse(item)"
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
                          @click="confirmDeleteWarehouse(item)"
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

          <!-- 廠商管理標籤頁 -->
          <v-window-item value="manufacturers">
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
                      @click="openDialog"
                    >
                      新增廠商
                    </v-btn>
                  </v-col>
                  <v-spacer />
                  <v-col
                    cols="12"
                    md="3"
                  >
                    <v-text-field
                      v-model="quickSearchText"
                      prepend-inner-icon="mdi-magnify"
                      label="搜尋廠商"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      :loading="isLoading"
                    />
                  </v-col>
                </v-row>

                <!-- 廠商表格 -->
                <v-data-table-server
                  v-model:items-per-page="itemsPerPage"
                  :items="manufacturers"
                  :headers="manufacturerHeaders"
                  :loading="isLoading"
                  :page="manufacturerCurrentPage"
                  :items-length="manufacturerTotalItems"
                  hover
                  density="compact"
                  class="mt-4 rounded-ts-lg rounded-te-lg"
                  @update:options="handleManufacturerTableOptionsChange"
                >
                  <template #item="{ item, index }">
                    <tr :class="{ 'odd-row': index % 2 === 0, 'even-row': index % 2 !== 0 }">
                      <td>{{ item.name }}</td>
                      <td>
                        <v-chip
                          :color="item.isActive ? 'success' : 'error'"
                          size="small"
                          variant="tonal"
                        >
                          {{ item.isActive ? '啟用' : '停用' }}
                        </v-chip>
                      </td>
                      <td>{{ formatDate(item.createdAt) }}</td>
                      <td>{{ item.creator?.name || '-' }}</td>
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
                          @click="editItem(item)"
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
                          @click="confirmDelete(item)"
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

    <!-- 新增/編輯廠商對話框 -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
      :no-click-animation="isSubmitting"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-factory
          </v-icon>
          <span class="card-title text-white">{{ dialog.id ? '編輯廠商' : '新增廠商' }}</span>
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
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="form"
            v-model="formValid"
            :disabled="isSubmitting"
            @submit.prevent="submit"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="*廠商名稱"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入廠商名稱', v => (v && v.length <= 200) || '廠商名稱不能超過200個字元']"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-switch
                  v-model="formData.isActive"
                  label="啟用狀態"
                  color="teal-darken-1"
                  hide-details
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
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ dialog.id ? '修改' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增/編輯備品對話框 -->
    <v-dialog
      v-model="sparePartDialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
      :no-click-animation="sparePartSubmitting"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-package-variant
          </v-icon>
          <span class="card-title text-white">{{ sparePartDialog.id ? '編輯備品' : '新增備品' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeSparePartDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="sparePartForm"
            v-model="sparePartFormValid"
            :disabled="sparePartSubmitting"
            @submit.prevent="submitSparePart"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="sparePartFormData.name"
                  label="*備品名稱"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入備品名稱']"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="sparePartFormData.manufacturer"
                  :items="manufacturerOptions"
                  item-title="name"
                  item-value="_id"
                  label="廠商"
                  variant="outlined"
                  density="compact"
                  clearable
                  :loading="manufacturersLoading"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="sparePartFormData.warehouses"
                  :items="warehouseOptions"
                  item-title="name"
                  item-value="_id"
                  label="*倉庫"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  :loading="warehousesLoading"
                  :rules="[v => (v && v.length > 0) || '請至少選擇一個倉庫']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="sparePartFormData.packaging"
                  label="包裝形式"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model.number="sparePartFormData.cost"
                  label="成本"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  :rules="[v => v === '' || v === null || v >= 0 || '成本不能為負數']"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model.number="sparePartFormData.price"
                  label="價格"
                  variant="outlined"
                  density="compact"
                  type="number"
                  min="0"
                  :rules="[v => v === '' || v === null || v >= 0 || '價格不能為負數']"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="sparePartFormData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-switch
                  v-model="sparePartFormData.isActive"
                  label="啟用狀態"
                  color="teal-darken-1"
                  hide-details
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
            @click="closeSparePartDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="sparePartSubmitting"
            @click="submitSparePart"
          >
            {{ sparePartDialog.id ? '修改' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增/編輯倉庫對話框 -->
    <v-dialog
      v-model="warehouseDialog.open"
      persistent
      :width="dialogWidth"
      :fullscreen="!smAndUp"
      :no-click-animation="warehouseSubmitting"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-1">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-warehouse
          </v-icon>
          <span class="card-title text-white">{{ warehouseDialog.id ? '編輯倉庫' : '新增倉庫' }}</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="closeWarehouseDialog"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 mt-4">
          <v-form
            ref="warehouseForm"
            v-model="warehouseFormValid"
            :disabled="warehouseSubmitting"
            @submit.prevent="submitWarehouse"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="warehouseFormData.name"
                  label="*倉庫名稱"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請輸入倉庫名稱', v => (v && v.length <= 200) || '倉庫名稱不能超過200個字元']"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="warehouseFormData.company"
                  :items="companies"
                  item-title="name"
                  item-value="_id"
                  label="*公司"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || '請選擇公司']"
                  :loading="companiesLoading"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="warehouseFormData.address"
                  label="地址"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !v || v.length <= 500 || '地址不能超過500個字元']"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="warehouseFormData.note"
                  label="備註"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-switch
                  v-model="warehouseFormData.isActive"
                  label="啟用狀態"
                  color="teal-darken-1"
                  hide-details
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
            @click="closeWarehouseDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="warehouseSubmitting"
            @click="submitWarehouse"
          >
            {{ warehouseDialog.id ? '修改' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除廠商確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteDialog.open"
      dialog-width="320"
      title="確認刪除廠商"
      :message="`確定要刪除廠商「<span class='text-red'>${deleteDialog.name}</span>」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="deleteItem"
    />

    <!-- 刪除倉庫確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteWarehouseDialog.open"
      dialog-width="320"
      title="確認刪除倉庫"
      :message="`確定要刪除倉庫「<span class='text-red'>${deleteWarehouseDialog.name}</span>」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="deleteWarehouse"
    />

    <!-- 刪除備品確認對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteSparePartDialog.open"
      dialog-width="320"
      title="確認刪除備品"
      :message="`確定要刪除備品「<span class='text-red'>${deleteSparePartDialog.name}</span>」嗎？此操作無法復原。`"
      confirm-button-color="red-lighten-1"
      cancel-button-color="grey-darken-1"
      confirm-button-text="刪除"
      cancel-button-text="取消"
      @confirm="deleteSparePart"
    />

    <!-- 倉庫排序管理對話框 -->
    <v-dialog
      v-model="showWarehouseSortDialog"
      max-width="400"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-sort
          </v-icon>
          <span class="card-title text-white">倉庫排序</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="showWarehouseSortDialog = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <div class="text-subtitle-1 mb-4">
            拖拽調整倉庫顯示順序
          </div>
          <draggable
            v-model="sortableWarehouses"
            item-key="_id"
            class="sortable-list"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element, index }">
              <v-list-item
                :key="element._id"
                class="border rounded mb-2"
              >
                <template #prepend>
                  <div class="drag-handle cursor-move me-2">
                    <v-icon color="grey-darken-1">
                      mdi-drag-vertical
                    </v-icon>
                  </div>
                </template>
                <v-list-item-title>{{ element.name }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="small"
                    color="blue-grey"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="showWarehouseSortDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-grey-darken-2"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isUpdatingWarehouseOrder"
            @click="updateWarehouseOrder"
          >
            更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 排序管理對話框 -->
    <v-dialog
      v-model="showSortDialog"
      max-width="400"
    >
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-2 bg-blue-grey-darken-2">
          <v-icon
            :size="smAndUp ? '20' : '18'"
            color="white"
            class="me-2"
          >
            mdi-sort
          </v-icon>
          <span class="card-title text-white">備品排序</span>
          <v-spacer />
          <v-btn
            icon
            variant="plain"
            class="opacity-100"
            :ripple="false"
            color="white"
            :size="smAndUp ? '36' : '32'"
            @click="showSortDialog = false"
          >
            <v-icon :size="smAndUp ? '22' : '18'">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-6 py-4">
          <div class="text-subtitle-1 mb-4">
            拖拽調整備品顯示順序
          </div>
          <draggable
            v-model="sortableSpareParts"
            item-key="_id"
            class="sortable-list"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost-item"
            chosen-class="chosen-item"
          >
            <template #item="{ element, index }">
              <v-list-item
                :key="element._id"
                class="border rounded mb-2"
              >
                <template #prepend>
                  <div class="drag-handle cursor-move me-2">
                    <v-icon color="grey-darken-1">
                      mdi-drag-vertical
                    </v-icon>
                  </div>
                </template>
                <v-list-item-title>{{ element.name }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="small"
                    color="blue-grey"
                  >
                    {{ index + 1 }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </v-card-text>

        <v-card-actions class="px-6 pb-5 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            :size="smAndUp ? 'default' : 'small'"
            @click="showSortDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="blue-grey-darken-2"
            variant="outlined"
            class="ms-2"
            :size="smAndUp ? 'default' : 'small'"
            :loading="isUpdatingOrder"
            @click="updateOrder"
          >
            更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { definePage } from 'vue-router/auto'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'
import draggable from 'vuedraggable'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue'

// ===== 頁面設定 =====
definePage({
  meta: {
    title: '備品管理 | Ystravel',
    login: true,
    permission: 'SPARE_PART_MANAGEMENT_READ'
  }
})

// ===== API 與 Store 初始化 =====
const { apiAuth } = useApi()
const user = useUserStore()
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// ===== 響應式設定與螢幕斷點 =====
const { smAndUp } = useDisplay()
const buttonSize = computed(() => smAndUp.value ? 'default' : 'small')
const dialogWidth = computed(() => smAndUp.value ? '500' : '100%')

// ===== Tab 管理 =====
const activeTab = ref('spareParts')

// ===== 權限檢查 =====
// 檢查是否顯示備品管理 TAB（需要備品 READ 權限，SPARE_PART_MANAGEMENT_READ 只是用來控制能否進入頁面）
const showSparePartTab = computed(() => {
  return permissionStore.hasPermission('SPARE_PART_READ')
})

// 檢查是否顯示廠商管理 TAB（需要廠商 READ 權限）
const showManufacturerTab = computed(() => {
  return permissionStore.hasPermission('SPARE_PART_MANUFACTURER_READ')
})

// 檢查是否顯示倉庫管理 TAB（需要倉庫 READ 權限）
const showWarehouseTab = computed(() => {
  return permissionStore.hasPermission('SPARE_PART_WAREHOUSE_READ')
})

// 檢查是否有備品管理權限（用於確保能讀取倉庫和廠商資料）
// 只有 SPARE_PART_READ 權限時，才需要載入倉庫和廠商資料用於備品表單
const hasSparePartPermission = computed(() => {
  return permissionStore.hasPermission('SPARE_PART_READ')
})

// 初始化 activeTab，設定為第一個有權限的 TAB
const initializeActiveTab = () => {
  if (showSparePartTab.value) {
    activeTab.value = 'spareParts'
  } else if (showWarehouseTab.value) {
    activeTab.value = 'warehouses'
  } else if (showManufacturerTab.value) {
    activeTab.value = 'manufacturers'
  }
}

// 監聽 activeTab 變化，確保切換到有權限的 TAB
watch(activeTab, (newTab) => {
  // 如果切換到備品 TAB 但沒有權限，切換到第一個有權限的 TAB
  if (newTab === 'spareParts' && !showSparePartTab.value) {
    initializeActiveTab()
  }
  // 如果切換到倉庫 TAB 但沒有權限，切換到第一個有權限的 TAB
  if (newTab === 'warehouses' && !showWarehouseTab.value) {
    initializeActiveTab()
  }
  // 如果切換到廠商 TAB 但沒有權限，切換到第一個有權限的 TAB
  if (newTab === 'manufacturers' && !showManufacturerTab.value) {
    initializeActiveTab()
  }
})

// 監聽權限變化，自動切換到第一個有權限的 TAB
watch([showSparePartTab, showWarehouseTab, showManufacturerTab], () => {
  // 如果當前 TAB 沒有權限，切換到第一個有權限的 TAB
  if ((activeTab.value === 'spareParts' && !showSparePartTab.value) ||
      (activeTab.value === 'warehouses' && !showWarehouseTab.value) ||
      (activeTab.value === 'manufacturers' && !showManufacturerTab.value)) {
    initializeActiveTab()
  }
}, { immediate: true })

// ===== 廠商管理相關狀態 =====
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const form = ref(null)
const formValid = ref(false)
const manufacturers = ref([])
const manufacturerCurrentPage = ref(1)
const manufacturerTotalPages = ref(1)
const manufacturerTotalItems = ref(0)
const itemsPerPage = ref(10)

// ===== 廠商搜尋相關 =====
const quickSearchText = ref('')

const debouncedManufacturerSearch = debounce(() => {
  manufacturerCurrentPage.value = 1
  loadManufacturers()
}, 300)

watch(quickSearchText, () => {
  isLoading.value = true
  debouncedManufacturerSearch()
})

// ===== 廠商對話框設定 =====
const dialog = ref({
  open: false,
  id: ''
})

const formData = ref({
  name: '',
  note: '',
  isActive: true
})

// ===== 廠商刪除對話框 =====
const deleteDialog = ref({
  open: false,
  id: '',
  name: ''
})

// ===== 倉庫管理相關狀態 =====
const warehouseLoading = ref(false)
const warehouseSubmitting = ref(false)
const warehouseDeleting = ref(false)
const warehouseForm = ref(null)
const warehouseFormValid = ref(false)
const warehouses = ref([])
const warehouseCurrentPage = ref(1)
const warehouseTotalPages = ref(1)
const warehouseTotalItems = ref(0)
const showWarehouseSortDialog = ref(false)
const sortableWarehouses = ref([])
const isUpdatingWarehouseOrder = ref(false)

// ===== 倉庫搜尋相關 =====
const warehouseSearchText = ref('')

const debouncedWarehouseSearch = debounce(() => {
  warehouseCurrentPage.value = 1
  loadWarehouses()
}, 300)

watch(warehouseSearchText, () => {
  warehouseLoading.value = true
  debouncedWarehouseSearch()
})

// ===== 倉庫對話框設定 =====
const warehouseDialog = ref({
  open: false,
  id: ''
})

const warehouseFormData = ref({
  name: '',
  company: '',
  address: '',
  note: '',
  isActive: true
})

// ===== 倉庫刪除對話框 =====
const deleteWarehouseDialog = ref({
  open: false,
  id: '',
  name: ''
})

// ===== 公司列表 =====
const companies = ref([])
const companiesLoading = ref(false)

// ===== 備品管理相關狀態 =====
const sparePartLoading = ref(false)
const sparePartSubmitting = ref(false)
const sparePartDeleting = ref(false)
const sparePartForm = ref(null)
const sparePartFormValid = ref(false)
const spareParts = ref([])
const showSortDialog = ref(false)
const sortableSpareParts = ref([])
const isUpdatingOrder = ref(false)
const sparePartCurrentPage = ref(1)
const sparePartTotalPages = ref(1)
const sparePartTotalItems = ref(0)

// ===== 備品搜尋相關 =====
const sparePartSearchText = ref('')

const debouncedSparePartSearch = debounce(() => {
  sparePartCurrentPage.value = 1
  loadSpareParts()
}, 300)

watch(sparePartSearchText, () => {
  sparePartLoading.value = true
  debouncedSparePartSearch()
})

// ===== 備品對話框設定 =====
const sparePartDialog = ref({
  open: false,
  id: ''
})

const sparePartFormData = ref({
  name: '',
  manufacturer: '',
  warehouses: [],
  packaging: '',
  cost: 0,
  price: 0,
  note: '',
  isActive: true
})

// ===== 備品刪除對話框 =====
const deleteSparePartDialog = ref({
  open: false,
  id: '',
  name: ''
})

// ===== 廠商選項（用於備品表單） =====
const manufacturerOptions = computed(() => {
  return manufacturers.value
    .filter(m => m.isActive !== false)
    .map(m => ({
      name: m.name,
      _id: m._id
    }))
})

const manufacturersLoading = computed(() => isLoading.value)

// ===== 倉庫選項（用於備品表單） =====
const warehouseOptions = computed(() => {
  return warehouses.value
    .filter(w => w.isActive !== false)
    .map(w => ({
      name: w.name,
      _id: w._id
    }))
})

const warehousesLoading = computed(() => warehouseLoading.value)

// ===== 表格標題 =====
const manufacturerHeaders = [
  { title: '廠商名稱', key: 'name', sortable: true },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '建立時間', key: 'createdAt', sortable: true },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '備註', key: 'note' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

const warehouseHeaders = [
  { title: '排序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '倉庫名稱', key: 'name', sortable: true },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '建立時間', key: 'createdAt', sortable: true },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '公司', key: 'company', sortable: false },
  { title: '地址', key: 'address' },
  { title: '備註', key: 'note' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]

const sparePartHeaders = [
  { title: '排序', key: 'order', sortable: false, align: 'center', width: '80px' },
  { title: '備品名稱', key: 'name', sortable: true },
  { title: '狀態', key: 'isActive', sortable: true },
  { title: '建立時間', key: 'createdAt', sortable: true },
  { title: '建立者', key: 'creator', sortable: false },
  { title: '廠商', key: 'manufacturer', sortable: false },
  { title: '倉庫', key: 'warehouses', sortable: false },
  { title: '包裝形式', key: 'packaging' },
  { title: '成本', key: 'cost', sortable: true },
  { title: '價格', key: 'price', sortable: true },
  { title: '備註', key: 'note' },
  { title: '操作', key: 'action', sortable: false, align: 'center' }
]


// ===== 方法 =====
const loadCompanies = async () => {
  try {
    companiesLoading.value = true
    const { data } = await apiAuth.get('/companies/all')
    if (data.success) {
      companies.value = data.result.data
    }
  } catch (error) {
    handleError(error)
  } finally {
    companiesLoading.value = false
  }
}

const loadManufacturers = async () => {
  try {
    isLoading.value = true

    const params = {
      page: manufacturerCurrentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (quickSearchText.value) {
      params.search = quickSearchText.value
    }

    const { data } = await apiAuth.get('/manufacturers', { params })

    if (data.success) {
      manufacturers.value = data.result.data
      manufacturerTotalPages.value = data.result.totalPages
      manufacturerTotalItems.value = data.result.totalItems || 0
    }
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

const loadWarehouses = async () => {
  try {
    warehouseLoading.value = true

    const params = {
      page: warehouseCurrentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (warehouseSearchText.value) {
      params.search = warehouseSearchText.value
    }

    const { data } = await apiAuth.get('/warehouses', { params })

    if (data.success) {
      warehouses.value = data.result.data
      warehouseTotalPages.value = data.result.totalPages
      warehouseTotalItems.value = data.result.totalItems || 0
    }
  } catch (error) {
    handleError(error)
  } finally {
    warehouseLoading.value = false
  }
}

const loadSpareParts = async () => {
  try {
    sparePartLoading.value = true

    const params = {
      page: sparePartCurrentPage.value,
      itemsPerPage: itemsPerPage.value
    }

    if (sparePartSearchText.value) {
      params.search = sparePartSearchText.value
    }

    const { data } = await apiAuth.get('/spareParts', { params })

    if (data.success) {
      spareParts.value = data.result.data
      sparePartTotalPages.value = data.result.totalPages
      sparePartTotalItems.value = data.result.totalItems || 0
    }
  } catch (error) {
    handleError(error)
  } finally {
    sparePartLoading.value = false
  }
}

const openDialog = () => {
  dialog.value = {
    open: true,
    id: ''
  }
  formData.value = {
    name: '',
    note: '',
    isActive: true
  }
  if (form.value) {
    form.value.reset()
  }
}

const editItem = (item) => {
  dialog.value = {
    open: true,
    id: item._id
  }
  formData.value = {
    name: item.name,
    note: item.note || '',
    isActive: item.isActive
  }
}

const closeDialog = () => {
  dialog.value = {
    open: false,
    id: ''
  }
  formData.value = {
    name: '',
    note: '',
    isActive: true
  }
  if (form.value) {
    form.value.reset()
  }
}

const submit = async () => {
  if (!formValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const submitData = {
      name: formData.value.name,
      note: formData.value.note || '',
      isActive: formData.value.isActive
    }

    if (dialog.value.id) {
      // 編輯模式
      const { data } = await apiAuth.patch(`/manufacturers/${dialog.value.id}`, submitData)
      if (!data.success) {
        throw new Error(data.message || '更新失敗')
      }
      createSnackbar({
        text: '廠商更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      // 新增模式
      const { data } = await apiAuth.post('/manufacturers', submitData)
      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }
      createSnackbar({
        text: '廠商新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeDialog()
    await loadManufacturers()
  } catch (error) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (item) => {
  deleteDialog.value = {
    open: true,
    id: item._id,
    name: item.name
  }
}

const deleteItem = async () => {
  if (!deleteDialog.value.id || isDeleting.value) return

  try {
    isDeleting.value = true
    const { data } = await apiAuth.delete(`/manufacturers/${deleteDialog.value.id}`)
    if (!data.success) {
      throw new Error(data.message || '刪除失敗')
    }
    createSnackbar({
      text: '廠商刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    deleteDialog.value = {
      open: false,
      id: '',
      name: ''
    }
    await loadManufacturers()
  } catch (error) {
    handleError(error)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

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

// ===== 倉庫管理方法 =====
const openWarehouseDialog = () => {
  warehouseDialog.value = {
    open: true,
    id: ''
  }
  warehouseFormData.value = {
    name: '',
    company: '',
    address: '',
    note: '',
    isActive: true
  }
  if (warehouseForm.value) {
    warehouseForm.value.reset()
  }
}

const editWarehouse = (item) => {
  warehouseDialog.value = {
    open: true,
    id: item._id
  }
  warehouseFormData.value = {
    name: item.name,
    company: item.company?._id || item.company || '',
    address: item.address || '',
    note: item.note || '',
    isActive: item.isActive
  }
}

const closeWarehouseDialog = () => {
  warehouseDialog.value = {
    open: false,
    id: ''
  }
  warehouseFormData.value = {
    name: '',
    company: '',
    address: '',
    note: '',
    isActive: true
  }
  if (warehouseForm.value) {
    warehouseForm.value.reset()
  }
}

const submitWarehouse = async () => {
  if (!warehouseFormValid.value || warehouseSubmitting.value) return

  try {
    warehouseSubmitting.value = true

    const submitData = {
      name: warehouseFormData.value.name,
      company: warehouseFormData.value.company,
      address: warehouseFormData.value.address || '',
      note: warehouseFormData.value.note || '',
      isActive: warehouseFormData.value.isActive
    }

    if (warehouseDialog.value.id) {
      // 編輯模式
      const { data } = await apiAuth.patch(`/warehouses/${warehouseDialog.value.id}`, submitData)
      if (!data.success) {
        throw new Error(data.message || '更新失敗')
      }
      createSnackbar({
        text: '倉庫更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      // 新增模式
      const { data } = await apiAuth.post('/warehouses', submitData)
      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }
      createSnackbar({
        text: '倉庫新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeWarehouseDialog()
    await loadWarehouses()
  } catch (error) {
    handleError(error)
  } finally {
    warehouseSubmitting.value = false
  }
}

const confirmDeleteWarehouse = (item) => {
  deleteWarehouseDialog.value = {
    open: true,
    id: item._id,
    name: item.name
  }
}

const deleteWarehouse = async () => {
  if (!deleteWarehouseDialog.value.id || warehouseDeleting.value) return

  try {
    warehouseDeleting.value = true
    const { data } = await apiAuth.delete(`/warehouses/${deleteWarehouseDialog.value.id}`)
    if (!data.success) {
      throw new Error(data.message || '刪除失敗')
    }
    createSnackbar({
      text: '倉庫刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    deleteWarehouseDialog.value = {
      open: false,
      id: '',
      name: ''
    }
    await loadWarehouses()
  } catch (error) {
    handleError(error)
  } finally {
    warehouseDeleting.value = false
  }
}

// ===== 備品管理方法 =====
const openSparePartDialog = () => {
  sparePartDialog.value = {
    open: true,
    id: ''
  }
  sparePartFormData.value = {
    name: '',
    manufacturer: '',
    warehouses: [],
    packaging: '',
    cost: 0,
    price: 0,
    note: '',
    isActive: true
  }
  if (sparePartForm.value) {
    sparePartForm.value.reset()
  }
}

const editSparePart = (item) => {
  sparePartDialog.value = {
    open: true,
    id: item._id
  }
  sparePartFormData.value = {
    name: item.name,
    manufacturer: item.manufacturer?._id || item.manufacturer || '',
    warehouses: item.warehouses ? item.warehouses.map(w => w._id || w) : [],
    packaging: item.packaging || '',
    cost: item.cost || 0,
    price: item.price || 0,
    note: item.note || '',
    isActive: item.isActive
  }
}

const closeSparePartDialog = () => {
  sparePartDialog.value = {
    open: false,
    id: ''
  }
  sparePartFormData.value = {
    name: '',
    manufacturer: '',
    warehouses: [],
    packaging: '',
    cost: 0,
    price: 0,
    note: '',
    isActive: true
  }
  if (sparePartForm.value) {
    sparePartForm.value.reset()
  }
}

const submitSparePart = async () => {
  if (!sparePartFormValid.value || sparePartSubmitting.value) return

  try {
    sparePartSubmitting.value = true

    const submitData = {
      name: sparePartFormData.value.name,
      manufacturer: sparePartFormData.value.manufacturer || null,
      warehouses: sparePartFormData.value.warehouses || [],
      packaging: sparePartFormData.value.packaging || '',
      cost: sparePartFormData.value.cost || 0,
      price: sparePartFormData.value.price || 0,
      note: sparePartFormData.value.note || '',
      isActive: sparePartFormData.value.isActive
    }

    if (sparePartDialog.value.id) {
      // 編輯模式
      const { data } = await apiAuth.patch(`/spareParts/${sparePartDialog.value.id}`, submitData)
      if (!data.success) {
        throw new Error(data.message || '更新失敗')
      }
      createSnackbar({
        text: '備品更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    } else {
      // 新增模式
      const { data } = await apiAuth.post('/spareParts', submitData)
      if (!data.success) {
        throw new Error(data.message || '新增失敗')
      }
      createSnackbar({
        text: '備品新增成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }

    closeSparePartDialog()
    await loadSpareParts()
  } catch (error) {
    handleError(error)
  } finally {
    sparePartSubmitting.value = false
  }
}

const confirmDeleteSparePart = (item) => {
  deleteSparePartDialog.value = {
    open: true,
    id: item._id,
    name: item.name
  }
}

const deleteSparePart = async () => {
  if (!deleteSparePartDialog.value.id || sparePartDeleting.value) return

  try {
    sparePartDeleting.value = true
    const { data } = await apiAuth.delete(`/spareParts/${deleteSparePartDialog.value.id}`)
    if (!data.success) {
      throw new Error(data.message || '刪除失敗')
    }
    createSnackbar({
      text: '備品刪除成功',
      snackbarProps: { color: 'teal-lighten-1' }
    })
    deleteSparePartDialog.value = {
      open: false,
      id: '',
      name: ''
    }
    await loadSpareParts()
  } catch (error) {
    handleError(error)
  } finally {
    sparePartDeleting.value = false
  }
}

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// 載入所有備品用於排序
const loadAllSparePartsForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }

    const { data } = await apiAuth.get('/spareParts', { params })

    if (data.success) {
      return data.result.data
    }
    return []
  } catch (error) {
    handleError(error)
    return []
  }
}

// 排序管理
const openSortDialog = async () => {
  const allSpareParts = await loadAllSparePartsForSort()
  sortableSpareParts.value = [...allSpareParts].sort((a, b) => (a.order || 0) - (b.order || 0))
  showSortDialog.value = true
}

const updateOrder = async () => {
  try {
    isUpdatingOrder.value = true

    const sparePartsData = sortableSpareParts.value.map((item, index) => ({
      id: item._id,
      order: index + 1
    }))

    const response = await apiAuth.patch('/spareParts/order/update', { spareParts: sparePartsData })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showSortDialog.value = false
    await loadSpareParts()
  } catch (error) {
    console.error('更新順序錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '更新順序失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingOrder.value = false
  }
}

// 載入所有倉庫用於排序
const loadAllWarehousesForSort = async () => {
  try {
    const params = {
      page: 1,
      itemsPerPage: 9999 // 載入所有資料
    }

    const { data } = await apiAuth.get('/warehouses', { params })

    if (data.success) {
      return data.result.data
    }
    return []
  } catch (error) {
    handleError(error)
    return []
  }
}

// 倉庫排序管理
const openWarehouseSortDialog = async () => {
  const allWarehouses = await loadAllWarehousesForSort()
  sortableWarehouses.value = [...allWarehouses].sort((a, b) => (a.order || 0) - (b.order || 0))
  showWarehouseSortDialog.value = true
}

const updateWarehouseOrder = async () => {
  try {
    isUpdatingWarehouseOrder.value = true

    const warehousesData = sortableWarehouses.value.map((item, index) => ({
      id: item._id,
      order: index + 1
    }))

    const response = await apiAuth.patch('/warehouses/order/update', { warehouses: warehousesData })
    createSnackbar({
      text: response.data.message,
      snackbarProps: { color: 'teal-lighten-1' }
    })

    showWarehouseSortDialog.value = false
    await loadWarehouses()
  } catch (error) {
    console.error('更新倉庫順序錯誤:', error)
    createSnackbar({
      text: error.response?.data?.message || error.message || '更新倉庫順序失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingWarehouseOrder.value = false
  }
}

// ===== 表格選項變更處理 =====
const handleSparePartTableOptionsChange = async (options) => {
  sparePartCurrentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  await loadSpareParts()
}

const handleWarehouseTableOptionsChange = async (options) => {
  warehouseCurrentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  await loadWarehouses()
}

const handleManufacturerTableOptionsChange = async (options) => {
  manufacturerCurrentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  await loadManufacturers()
}

// ===== 生命週期鉤子 =====
onMounted(async () => {
  const loadPromises = []

  // 根據權限載入對應的資料
  if (showSparePartTab.value) {
    // 如果有備品管理權限，需要載入倉庫和廠商資料（用於備品表單的下拉選單）
    // 即使沒有倉庫/廠商的完整權限，也要能讀取它們的資料
    loadPromises.push(loadCompanies(), loadSpareParts())
    if (hasSparePartPermission.value) {
      loadPromises.push(loadManufacturers(), loadWarehouses())
    }
  }

  if (showWarehouseTab.value) {
    loadPromises.push(loadWarehouses())
    // 如果還沒有載入公司資料，載入它（倉庫需要公司資料）
    if (!showSparePartTab.value) {
      loadPromises.push(loadCompanies())
    }
  }

  if (showManufacturerTab.value) {
    loadPromises.push(loadManufacturers())
  }

  await Promise.all(loadPromises)
})
</script>

<style lang="scss" scoped>
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
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

// 排序對話框樣式
.sortable-list {
  min-height: 100px;
}

.drag-handle {
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
}

.drag-handle:hover {
  background-color: #e0e0e0;
}

.ghost-item {
  opacity: 0.5;
  background-color: #e3f2fd;
  border: 2px dashed #2196f3;
}

.chosen-item {
  background-color: #c9c9c9;
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cursor-move {
  cursor: move;
}
</style>

