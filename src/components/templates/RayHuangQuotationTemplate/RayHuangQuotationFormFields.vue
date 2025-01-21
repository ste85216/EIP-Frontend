<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <!-- 分頁控制 -->
    <v-row
      v-if="modelValue.includeContract"
    >
      <v-col
        cols="12"
      >
        <v-tabs
          v-model="currentPage"
          color="deep-purple-darken-4"
          align-tabs="center"
          class="mb-4"
        >
          <v-tab value="quotation">
            報價單
          </v-tab>
          <v-tab value="contract1">
            合約書 (1/3)
          </v-tab>
          <v-tab value="contract2">
            合約書 (2/3)
          </v-tab>
          <v-tab value="contract3">
            合約書 (3/3)
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-window
      v-model="currentPage"
      class="px-4 pt-1"
    >
      <!-- 報價單頁面 -->
      <v-window-item value="quotation">
        <v-row>
          <!-- 基本資訊 -->
          <v-col
            cols="12"
            class="pa-0"
          >
            <v-row>
              <v-col cols="12">
                <div class="d-flex justify-space-between align-center">
                  <span class="sub-title text-blue-grey-darken-2">基本資訊</span>
                  <v-checkbox
                    :model-value="modelValue.includeContract"
                    label="&nbsp;合約書"
                    density="compact"
                    color="purple-darken-2"
                    hide-details
                    @update:model-value="v => updateField('includeContract', v)"
                  />
                </div>
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.quotationNumber"
                  label="單號"
                  variant="outlined"
                  density="compact"
                  clearable
                  :rules="[v => !!v || '請輸入單號']"
                  @update:model-value="v => updateField('quotationNumber', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-date-input
                  :model-value="new Date(modelValue.date)"
                  label="報價日期"
                  variant="outlined"
                  density="compact"
                  prepend-icon
                  clearable
                  :disabled="isViewing"
                  @update:model-value="v => updateField('date', v)"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 客戶資訊 -->
          <v-col
            cols="12"
            class="pa-0 mt-4"
          >
            <v-row>
              <v-col cols="12">
                <div class="sub-title text-blue-grey-darken-2">
                  客戶資訊
                </div>
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerName"
                  label="客戶名稱"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerName', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerAddress"
                  label="地址"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerAddress', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerTaxId"
                  label="統編"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerTaxId', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerContact"
                  label="聯絡人"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerContact', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerDepartment"
                  label="部門"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerDepartment', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerPhone"
                  label="電話"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerPhone', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerEmail"
                  label="郵件"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerEmail', v)"
                />
              </v-col>
              <v-col
                cols="12"
                lg="6"
                class="pb-0"
              >
                <v-text-field
                  :model-value="modelValue.customerMobile"
                  label="手機"
                  variant="outlined"
                  density="compact"
                  class="mb-1"
                  clearable
                  @update:model-value="v => updateField('customerMobile', v)"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 專案資訊 -->
          <v-col
            cols="12"
            class="pa-0 mt-4"
          >
            <v-row>
              <v-col cols="12">
                <v-row>
                  <v-col cols="12">
                    <div class="sub-title text-blue-grey-darken-2">
                      專案資訊
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.projectType"
                      label="專案類別"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateField('projectType', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.projectName"
                      label="專案名稱"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateField('projectName', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.workDays"
                      label="工作天"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateField('workDays', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.specialNote"
                      label="特殊備註 ( 報價項目下方呈現 )"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      @update:model-value="v => updateField('specialNote', v)"
                    />
                  </v-col>
                  <v-col cols="12">
                    <div class="sub-title text-blue-grey-darken-2">
                      注意事項
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.validityDays"
                      label="執行期天數"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      maxlength="3"
                      @update:model-value="v => updateField('validityDays', v)"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="pb-0"
                  >
                    <v-text-field
                      :model-value="modelValue.delayDays"
                      label="延誤天數"
                      variant="outlined"
                      density="compact"
                      class="mb-1"
                      clearable
                      maxlength="3"
                      @update:model-value="v => updateField('delayDays', v)"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- 報價項目 -->
              <v-col cols="12">
                <v-row>
                  <v-col cols="12">
                    <div class="sub-title text-blue-grey-darken-2 d-flex justify-space-between">
                      報價項目
                      <v-btn
                        color="blue-grey-darken-2"
                        variant="outlined"
                        prepend-icon="mdi-plus"
                        size="small"
                        :disabled="isViewing"
                        @click="addItem"
                      >
                        新增項目
                      </v-btn>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <v-expand-transition group>
                      <div
                        v-for="(item, index) in modelValue.items"
                        :key="index"
                        class="mb-4 px-3 border rounded-lg"
                      >
                        <v-row>
                          <v-col
                            cols="12"
                            class="pb-0"
                          >
                            <div
                              class="d-flex justify-space-between align-center mt-2"
                              style="height: 40px;"
                            >
                              <span class="text-subtitle-2 text-grey-darken-1">項目 {{ index + 1 }}</span>
                              <v-btn
                                v-if="index > 0"
                                icon="mdi-close"
                                color="red-darken-1"
                                size="small"
                                variant="plain"
                                @click="removeItem(index)"
                              />
                            </div>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="pb-0"
                          >
                            <v-text-field
                              :model-value="item.name"
                              label="項目名稱"
                              variant="outlined"
                              density="compact"
                              class="mb-1"
                              clearable
                              @update:model-value="v => updateItemField(index, 'name', v)"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="pb-0"
                          >
                            <v-text-field
                              :model-value="item.description"
                              label="說明"
                              variant="outlined"
                              density="compact"
                              class="mb-1"
                              clearable
                              @update:model-value="v => updateItemField(index, 'description', v)"
                            />
                          </v-col>

                          <v-col cols="12">
                            <v-row>
                              <v-col
                                cols="6"
                                md="3"
                                class="pt-2"
                              >
                                <v-text-field
                                  :model-value="item.workDays"
                                  label="工作天"
                                  variant="outlined"
                                  density="compact"
                                  clearable
                                  @update:model-value="v => updateItemField(index, 'workDays', v)"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                md="3"
                                class="pt-2"
                              >
                                <v-text-field
                                  :model-value="item.quantity"
                                  label="數量"
                                  type="number"
                                  variant="outlined"
                                  density="compact"
                                  clearable
                                  @update:model-value="v => updateItemField(index, 'quantity', Number(v))"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                md="3"
                                class="pt-2"
                              >
                                <v-text-field
                                  :model-value="item.unit"
                                  label="單位"
                                  variant="outlined"
                                  density="compact"
                                  clearable
                                  @update:model-value="v => updateItemField(index, 'unit', v)"
                                />
                              </v-col>
                              <v-col
                                cols="6"
                                md="3"
                                class="pt-2"
                              >
                                <v-text-field
                                  :model-value="item.price"
                                  label="單價"
                                  type="number"
                                  variant="outlined"
                                  density="compact"
                                  clearable
                                  @update:model-value="v => updateItemField(index, 'price', Number(v))"
                                />
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </div>
                    </v-expand-transition>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- 合約書第一頁 -->
      <v-window-item value="contract1">
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2 mb-2">
              合約書 (1/3)
            </div>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.partyA"
              label="甲方"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page1.partyA', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.partyB"
              label="乙方"
              variant="outlined"
              density="compact"
              class="mb-1"
              @update:model-value="v => updateContractField('page1.partyB', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.projectName"
              label="專案名稱"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page1.projectName', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.totalAmount"
              label="總價 (含稅)"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page1.totalAmount', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="3"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.estimatedWorkDays"
              label="預估工作天"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="3"
              clearable
              @update:model-value="v => updateContractField('page1.estimatedWorkDays', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="3"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.contractYear"
              label="年 (合約期限)"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="3"
              clearable
              @update:model-value="v => updateContractField('page1.contractYear', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="3"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.contractMonth"
              label="月 (合約期限)"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="2"
              clearable
              @update:model-value="v => updateContractField('page1.contractMonth', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="3"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.contractDay"
              label="日 (合約期限)"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="2"
              clearable
              @update:model-value="v => updateContractField('page1.contractDay', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="3"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page1?.depositAmount"
              label="訂金"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page1.depositAmount', v)"
            />
          </v-col>
          <v-col cols="8" />
          <!-- 付款方式 -->
          <v-col
            cols="12"
            class="py-0"
          >
            <v-checkbox
              :model-value="modelValue.contract?.page1?.paymentMethod?.singlePayment"
              label="&nbsp;一次付清"
              color="purple-darken-2"
              density="compact"
              @update:model-value="v => updatePaymentMethod('page1.paymentMethod.singlePayment', v)"
            />
            <div>
              <v-row>
                <v-col
                  cols="4"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.singlePaymentDate?.year"
                    label="年 (一次付清)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="3"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.singlePaymentDate.year', v)"
                  />
                </v-col>
                <v-col
                  cols="4"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.singlePaymentDate?.month"
                    label="月 (一次付清)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.singlePaymentDate.month', v)"
                  />
                </v-col>
                <v-col
                  cols="4"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.singlePaymentDate?.day"
                    label="日 (一次付清)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.singlePaymentDate.day', v)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <v-col cols="12">
            <v-checkbox
              :model-value="modelValue.contract?.page1?.paymentMethod?.deposit"
              label="&nbsp;訂金"
              color="purple-darken-2"
              density="compact"
              @update:model-value="v => updatePaymentMethod('page1.paymentMethod.deposit', v)"
            />
            <div>
              <!-- 訂金日期和金額 -->
              <v-row>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.depositDate?.year"
                    label="年 (訂金付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="3"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.depositDate.year', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.depositDate?.month"
                    label="月 (訂金付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.depositDate.month', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.depositDate?.day"
                    label="日 (訂金付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.depositDate.day', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.depositAmount"
                    label="訂金金額"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.depositAmount', v)"
                  />
                </v-col>
              </v-row>

              <!-- 尾款日期和金額 -->
              <v-row>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.finalPaymentDate?.year"
                    label="年 (尾款付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="3"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.finalPaymentDate.year', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.finalPaymentDate?.month"
                    label="月 (尾款付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.finalPaymentDate.month', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.finalPaymentDate?.day"
                    label="日 (尾款付款)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.finalPaymentDate.day', v)"
                  />
                </v-col>
                <v-col
                  cols="3"
                  class="pb-0"
                >
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentMethod?.finalPaymentAmount"
                    label="尾款金額"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentMethod.finalPaymentAmount', v)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <!-- 付款類型 -->
          <v-col cols="12">
            <v-checkbox
              :model-value="modelValue.contract?.page1?.paymentType?.cash"
              label="&nbsp;現金"
              color="purple-darken-2"
              density="compact"
              @update:model-value="v => updatePaymentType('page1.paymentType.cash', v)"
            />
            <v-checkbox
              :model-value="modelValue.contract?.page1?.paymentType?.transfer"
              label="&nbsp;匯款"
              color="purple-darken-2"
              density="compact"
              @update:model-value="v => updatePaymentType('page1.paymentType.transfer', v)"
            />
            <v-checkbox
              :model-value="modelValue.contract?.page1?.paymentType?.check"
              label="&nbsp;支票"
              color="purple-darken-2"
              density="compact"
              @update:model-value="v => updatePaymentType('page1.paymentType.check', v)"
            />
            <div>
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentType?.checkDate?.year"
                    label="年 (支票到期)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="3"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentType.checkDate.year', v)"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentType?.checkDate?.month"
                    label="月 (支票到期)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentType.checkDate.month', v)"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    :model-value="modelValue.contract?.page1?.paymentType?.checkDate?.day"
                    label="日 (支票到期)"
                    variant="outlined"
                    density="compact"
                    class="mb-1"
                    maxlength="2"
                    clearable
                    @update:model-value="v => updateContractField('page1.paymentType.checkDate.day', v)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- 合約書第二頁 -->
      <v-window-item value="contract2">
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2 mb-2">
              合約書 (2/3)
            </div>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page2?.designProposalCount"
              label="設計提案數"
              variant="outlined"
              density="compact"
              maxlength="3"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page2.designProposalCount', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page2?.responseDay"
              label="回覆日"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="3"
              clearable
              @update:model-value="v => updateContractField('page2.responseDay', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page2?.designRevisionCount"
              label="設計階段修改次數"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="3"
              clearable
              @update:model-value="v => updateContractField('page2.designRevisionCount', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page2?.printRevisionCount"
              label="印刷階段修改次數"
              variant="outlined"
              density="compact"
              class="mb-1"
              maxlength="3"
              clearable
              @update:model-value="v => updateContractField('page2.printRevisionCount', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page2?.providedItems"
              label="提供甲方項目"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page2.providedItems', v)"
            />
          </v-col>
        </v-row>
      </v-window-item>

      <!-- 合約書第三頁 -->
      <v-window-item value="contract3">
        <v-row>
          <v-col cols="12">
            <div class="sub-title text-blue-grey-darken-2 mb-2">
              合約書 (3/3)
            </div>
          </v-col>
          <v-col
            cols="12"
            class="pb-0"
          >
            <v-textarea
              :model-value="modelValue.contract?.page3?.otherAgreements"
              label="其他協議事項"
              rows="6"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              auto-grow
              @update:model-value="v => updateContractField('page3.otherAgreements', v)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page3?.partyA?.companyName"
              label="甲方"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page3.partyA.companyName', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page3?.partyA?.representative"
              label="代表人(甲方)"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page3.partyA.representative', v)"
            />
          </v-col>
          <v-col
            cols="12"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page3?.partyA?.address"
              label="地址(甲方)"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page3.partyA.address', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page3?.partyA?.phone"
              label="電話(甲方)"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page3.partyA.phone', v)"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="pb-0"
          >
            <v-text-field
              :model-value="modelValue.contract?.page3?.partyA?.taxId"
              label="統一編號 / 身分證字號 (甲方)"
              variant="outlined"
              density="compact"
              class="mb-1"
              clearable
              @update:model-value="v => updateContractField('page3.partyA.taxId', v)"
            />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  isViewing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const form = ref(null)
const valid = ref(false)
const currentPage = ref('quotation')

// 更新欄位的方法
const updateField = (field, value) => {
  const newValue = { ...props.modelValue }
  newValue[field] = value
  emit('update:modelValue', newValue)
}

// 更新合約書欄位的方法
const updateContractField = (field, value) => {
  const newValue = { ...props.modelValue }
  if (!newValue.contract) {
    newValue.contract = {}
  }
  
  const fields = field.split('.')
  let current = newValue.contract
  
  for (let i = 0; i < fields.length - 1; i++) {
    if (!current[fields[i]]) {
      current[fields[i]] = {}
    }
    current = current[fields[i]]
  }
  
  current[fields[fields.length - 1]] = value
  newValue.currentPage = currentPage.value
  emit('update:modelValue', newValue)
}

// 監聽合約書開關變更
watch(() => props.modelValue.includeContract, (newVal) => {
  if (!newVal) {
    currentPage.value = 'quotation'
    const newValue = { ...props.modelValue }
    newValue.currentPage = 'quotation'
    emit('update:modelValue', newValue)
  }
})

// 監聽頁面變化
watch(currentPage, (newVal) => {
  const newValue = { ...props.modelValue }
  newValue.currentPage = newVal
  emit('update:modelValue', newValue)
})

const validate = async () => {
  return await form.value?.validate()
}

const addItem = () => {
  const newItems = [...props.modelValue.items]
  newItems.push({
    name: '',
    description: '',
    workDays: '',
    quantity: 1,
    unit: '份',
    price: 0
  })
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

const removeItem = (index) => {
  const newItems = [...props.modelValue.items]
  newItems.splice(index, 1)
  emit('update:modelValue', { ...props.modelValue, items: newItems })
}

// 更新付款方式的方法
const updatePaymentMethod = (field, value) => {
  const newValue = { ...props.modelValue }
  if (!newValue.contract) {
    newValue.contract = { page1: { paymentMethod: {} } }
  }
  if (!newValue.contract.page1) {
    newValue.contract.page1 = { paymentMethod: {} }
  }
  if (!newValue.contract.page1.paymentMethod) {
    newValue.contract.page1.paymentMethod = {}
  }

  // 處理付款方式互斥
  if (field === 'page1.paymentMethod.singlePayment') {
    newValue.contract.page1.paymentMethod = {
      ...newValue.contract.page1.paymentMethod,
      singlePayment: value,
      deposit: value ? false : newValue.contract.page1.paymentMethod.deposit
    }
  } else if (field === 'page1.paymentMethod.deposit') {
    newValue.contract.page1.paymentMethod = {
      ...newValue.contract.page1.paymentMethod,
      deposit: value,
      singlePayment: value ? false : newValue.contract.page1.paymentMethod.singlePayment
    }
  }

  emit('update:modelValue', newValue)
}

// 更新付款類型的方法
const updatePaymentType = (field, value) => {
  const newValue = { ...props.modelValue }
  if (!newValue.contract) {
    newValue.contract = {}
  }
  if (!newValue.contract.page1) {
    newValue.contract.page1 = {}
  }
  if (!newValue.contract.page1.paymentType) {
    newValue.contract.page1.paymentType = {}
  }

  // 如果是選中狀態，則取消其他選項
  if (value) {
    newValue.contract.page1.paymentType = {
      ...newValue.contract.page1.paymentType,
      cash: field === 'page1.paymentType.cash',
      transfer: field === 'page1.paymentType.transfer',
      check: field === 'page1.paymentType.check'
    }
  } else {
    // 如果是取消狀態，只更新當前選項
    const fieldName = field.split('.').pop()
    newValue.contract.page1.paymentType[fieldName] = false
  }

  emit('update:modelValue', newValue)
}

const updateItemField = (index, field, value) => {
  const newValue = { ...props.modelValue }
  if (!newValue.items) {
    newValue.items = []
  }
  if (!newValue.items[index]) {
    newValue.items[index] = {
      name: '',
      description: '',
      workDays: '',
      quantity: 1,
      unit: '份',
      price: ''
    }
  }
  newValue.items[index][field] = value
  emit('update:modelValue', newValue)
}

defineExpose({
  validate
})
</script>

<style scoped>

</style> 