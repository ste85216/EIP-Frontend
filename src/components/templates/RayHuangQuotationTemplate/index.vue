<template>
  <div
    ref="previewContent"
    :class="[
      currentView === 'quotation' ? 'preview-content' : 'preview-content-contract'
    ]"
  >
    <!-- 報價單頁面 -->
    <div
      v-if="currentView === 'quotation'"
      class="quotation-template"
    >
      <div class="quotation-template">
        <!-- 頁首 -->
        <div class="header">
          <div class="title">
            <div class="d-flex justify-space-between pe-4 title-content">
              <h2 style="letter-spacing: 8px;">
                專案報價單
              </h2>
              <div>
                <p><span style="font-weight: bold;">No.</span>&nbsp;{{ formData.formNumber }}</p>
                <p><span style="font-weight: bold;">報價日期：</span>{{ formatDate(formData.date) }}</p>
              </div>
            </div>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">
                    <span>客</span><span>戶</span>
                  </td>
                  <td class="content">
                    {{ formData.customerName }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>地</span><span>址</span>
                  </td>
                  <td class="content">
                    {{ formData.customerAddress }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>統</span><span>編</span>
                  </td>
                  <td class="content">
                    {{ formData.customerTaxId }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>聯</span><span>絡</span><span>人</span>
                  </td>
                  <td class="content">
                    {{ formData.customerContact }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>部</span><span>門</span>
                  </td>
                  <td class="content">
                    {{ formData.customerDepartment }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>電</span><span>話</span>
                  </td>
                  <td class="content">
                    {{ formData.customerPhone }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>郵</span><span>件</span>
                  </td>
                  <td class="content">
                    {{ formData.customerEmail }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>手</span><span>機</span>
                  </td>
                  <td class="content">
                    {{ formData.customerMobile }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>專</span><span>案</span><span>類</span><span>別</span>
                  </td>
                  <td class="content">
                    {{ formData.projectType }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>專</span><span>案</span><span>名</span><span>稱</span>
                  </td>
                  <td class="content">
                    {{ formData.projectName }}
                  </td>
                </tr>
                <tr>
                  <td class="label">
                    <span>工</span><span>作</span><span>天</span>
                  </td>
                  <td class="content">
                    {{ formData.workDays }}&nbsp;天 ( 不含例假日 )
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="company-info">
            <img
              src="@/assets/image/銳皇LOGO.png"
              alt="Company Logo"
              class="company-logo"
            >
            <p>台北市中山區松江路 220 號 9 樓 907 室</p>
            <p><span style="font-weight: bold;">統編</span> 83213438</p>
            <p><span style="font-weight: bold;">聯絡人</span> 陳淑貞 0937-826735</p>
            <p>poppy.grdesign@gmail.com</p>
          </div>
        </div>

        <!-- 報價項目表格 -->
        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>項次</th>
                <th>項目名稱</th>
                <th>說明</th>
                <th>工作天</th>
                <th>數量</th>
                <th>單位</th>
                <th>單價</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody class="data-tbody">
              <tr
                v-for="(item, index) in formData.items"
                :key="index"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.workDays }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unit }}</td>
                <td>$ {{ formatAmount(item.price) }}</td>
                <td>$ {{ formatAmount(item.quantity * item.price) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colspan="6"
                  class="special-note"
                >
                  {{ formData.specialNote }}
                </td>
                <td
                  colspan="1"
                  class="text-right pe-0"
                >
                  <div class="total-amount ps-4 pb-1">
                    合計
                  </div>
                </td>
                <td
                  colspan="4"
                  class="px-0"
                >
                  <div class="total-amount w-100 pb-1">
                    $ {{ formatAmount(totalAmount) }}
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="1" />
                <td
                  colspan="6"
                  class="text-right pe-0"
                >
                  <div class="total-amount ps-4 pb-1">
                    稅金
                  </div>
                </td>
                <td class="px-0">
                  <div class="total-amount pb-1 w-100">
                    $ {{ formatAmount(Math.round(totalAmount * 1.05) - totalAmount) }}
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  colspan="7"
                  class="text-right pe-0"
                >
                  <div class="total-amount ps-4 pb-1">
                    總計
                  </div>
                </td>
                <td class="px-0">
                  <div class="total-amount pb-1 w-100">
                    $ {{ formatAmount(Math.round(totalAmount * 1.05)) }}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 注意事項 -->
        <div class="notes">
          <h3>注意事項</h3>
          <ol>
            <li>本報價單為合約附件，客戶用印簽名後生效。</li>
            <li>本報價單有效期限為一個月，逾期後另行報價。</li>
            <li>
              本報價本專案執行期最長為<div class="work-days">
                {{ formData.validityDays }}
              </div>日內，若因客戶確認時間延誤超出<div class="work-days">
                {{ formData.delayDays }}
              </div>日，客戶需將全額費用結清，銳皇數位行銷設計仍須將專案執行完畢。
            </li>
            <li>本報價單不含文案撰寫、商業攝影、翻譯、國際授權圖及印刷。</li>
          </ol>
        </div>

        <!-- 簽名欄 -->
        <div class="signature">
          <div class="company-stamp">
            <p>公司用印</p>
            <div class="stamp-box" />
          </div>
          <div class="contact-signature">
            <p>聯絡人簽名</p>
            <div class="signature-box" />
            <p class="mt-2">
              日期 ：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/
            </p>
          </div>
        </div>

        <div class="footer">
          <p>報價單確認後，請 E-mail 予聯絡人，謝謝您的配合！</p>
        </div>
      </div>
    </div>

    <!-- 合約書第一頁 -->
    <div
      v-if="currentView === 'contract1'"
      class="contract-template"
    >
      <div class="contract-header">
        <img
          src="@/assets/image/銳皇LOGO.png"
          class="company-logo-contract"
        >
        <h1 class="contract-title">
          設計專案合約書
        </h1>
      </div>

      <div class="contract-content">
        <div class="contract-sections">
          <!-- 立合約書人區塊 -->
          <div class="parties-block">
            <p class="parties-title">
              立合約書人：
            </p>
            <div class="parties-content">
              <div class="party-line">
                甲方：<div class="underline-input">
                  {{ formData.contract?.page1?.partyA }}
                </div>（以下簡稱甲方）
              </div>
              <div class="party-line">
                乙方：<div class="underline-input">
                  {{ formData.contract?.page1?.partyB }}
                </div>（以下簡稱乙方）
              </div>
              <div class="party-line">
                茲因甲方委託乙方執行<div class="project-name-input">
                  {{ formData.contract?.page1?.projectName }}
                </div>（以下簡稱「本專案」）
              </div>
              <div class="party-line">
                特立本合約條款，雙方<span class="font-weight-bold">同意共同遵守</span>下列事項：
              </div>
            </div>
          </div>

          <!-- 合約條款 -->
          <div class="section">
            <div class="section-title">
              第一條 <span class="ps-6">本專案內容</span>
            </div>
            <div class="section-content">
              甲方委託乙方規劃設計本專案內容（報價單之說明）。
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第二條 <span class="ps-6">本專案費用</span>
            </div>
            <div class="section-content d-flex">
              甲方應支付乙方製作費，其總價為新台幣<div class="total-amount-input">
                {{ formatAmount(formData.contract?.page1?.totalAmount) }}
              </div>元整（含稅）。
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第三條 <span class="ps-6">合約期限</span>
            </div>
            <div class="section-content">
              <div>1. &nbsp;&nbsp;&nbsp;&nbsp;專案起始日：甲方付款日（訂金）隔日起算。</div>
              <div class="d-flex">
                2. &nbsp;&nbsp;&nbsp;&nbsp;專案執行工作日：預估<div class="underline-input">
                  {{ formData.contract?.page1?.estimatedWorkDays }}
                </div>個工作天，不含例假日、甲方確認稿件、新增需求及驗收工作日。
              </div>
              <div class="d-flex">
                3. &nbsp;&nbsp;&nbsp;&nbsp;乙方同意於中華民國<div class="underline-input">
                  {{ formData.contract?.page1?.contractYear }}
                </div>年<div class="underline-input">
                  {{ formData.contract?.page1?.contractMonth }}
                </div>月<div class="underline-input">
                  {{ formData.contract?.page1?.contractDay }}
                </div>日前完成專案。
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第四條 <span class="ps-6">本專案付款方式</span>
            </div>
            <div class="section-content">
              <div class="d-flex">
                甲方於簽訂本合約時，需預付乙方新台幣<div class="deposit-amount-input">
                  {{ formatAmount(formData.contract?.page1?.depositAmount) }}
                </div>
                元整之訂金。
              </div>
              甲方同意以下列方式支付款項：<br>
              <div class="payment-options">
                <div class="checkbox-line">
                  <div
                    class="custom-checkbox"
                    :class="{ 'checked': formData.contract?.page1?.paymentMethod?.singlePayment }"
                  >
                    {{ formData.contract?.page1?.paymentMethod?.singlePayment ? '✓' : '' }}
                  </div>
                  一次付清
                </div>
                <div
                  class="date-line"
                >
                  於<div class="underline-input">
                    {{ formData.contract?.page1?.paymentMethod?.singlePaymentDate?.year }}
                  </div>年
                  <div class="underline-input">
                    {{ formData.contract?.page1?.paymentMethod?.singlePaymentDate?.month }}
                  </div>月
                  <div class="underline-input">
                    {{ formData.contract?.page1?.paymentMethod?.singlePaymentDate?.day }}
                  </div>日付清全額款項。
                </div>

                <div class="payment-section">
                  <div class="d-flex align-start">
                    <div class="checkbox-line pt-2">
                      <div
                        class="custom-checkbox"
                        :class="{ 'checked': formData.contract?.page1?.paymentMethod?.deposit }"
                      >
                        {{ formData.contract?.page1?.paymentMethod?.deposit ? '✓' : '' }}
                      </div>
                    </div>
                    <div>
                      <div class="date-line-2">
                        訂金於<div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.depositDate?.year }}
                        </div>年
                        <div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.depositDate?.month }}
                        </div>月
                        <div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.depositDate?.day }}
                        </div>日，
                        給付新台幣<div class="deposit-amount-input">
                          {{ formatAmount(formData.contract?.page1?.paymentMethod?.depositAmount) }}
                        </div>元整。
                      </div>
                      <div class="date-line-2">
                        尾款於<div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.finalPaymentDate?.year }}
                        </div>年
                        <div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.finalPaymentDate?.month }}
                        </div>月
                        <div class="underline-input">
                          {{ formData.contract?.page1?.paymentMethod?.finalPaymentDate?.day }}
                        </div>日，
                        給付新台幣<div class="deposit-amount-input">
                          {{ formatAmount(formData.contract?.page1?.paymentMethod?.finalPaymentAmount) }}
                        </div>元整。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-grey-darken-1">
                -·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·
              </div>
              <div>
                <div class="checkbox-options">
                  <div class="checkbox-line">
                    <div
                      class="custom-checkbox"
                      :class="{ 'checked': formData.contract?.page1?.paymentType?.cash }"
                    >
                      {{ formData.contract?.page1?.paymentType?.cash ? '✓' : '' }}
                    </div>
                    現金
                  </div>
                  <div class="checkbox-line">
                    <div
                      class="custom-checkbox"
                      :class="{ 'checked': formData.contract?.page1?.paymentType?.transfer }"
                    >
                      {{ formData.contract?.page1?.paymentType?.transfer ? '✓' : '' }}
                    </div>
                    匯款（匯費由匯款方甲方自行吸收）
                  </div>
                  <div class="checkbox-line">
                    <div
                      class="custom-checkbox"
                      :class="{ 'checked': formData.contract?.page1?.paymentType?.check }"
                    >
                      {{ formData.contract?.page1?.paymentType?.check ? '✓' : '' }}
                    </div>
                    支票（<span class="font-weight-bold">到期日</span><div class="underline-input">
                      {{ formData.contract?.page1?.paymentType?.checkDate?.year }}
                    </div>年
                    <div class="underline-input">
                      {{ formData.contract?.page1?.paymentType?.checkDate?.month }}
                    </div>月
                    <div class="underline-input">
                      {{ formData.contract?.page1?.paymentType?.checkDate?.day }}
                    </div>日）
                  </div>
                </div>
              </div>

              <div class="bank-info mt-2">
                <div>1.&nbsp;&nbsp;&nbsp;&nbsp;甲方應依規定，付款予乙方指定之帳戶：</div>
                <div>2.&nbsp;&nbsp;&nbsp;&nbsp;乙方指定之銀行帳戶：</div>
                <div class="bank-details">
                  <div><span class="font-weight-bold">戶&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 名</span> &nbsp;&nbsp;&nbsp;&nbsp;銳皇國際股份有限公司</div>
                  <div><span class="font-weight-bold">銀&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 行</span> &nbsp;&nbsp;&nbsp;&nbsp;國泰世華銀行 連城分行</div>
                  <div><span class="font-weight-bold">銀 &nbsp;行 &nbsp;代 &nbsp;號</span> &nbsp;&nbsp;&nbsp;&nbsp;013</div>
                  <div><span class="font-weight-bold">銀 &nbsp;行 &nbsp;帳 &nbsp;號</span> &nbsp;&nbsp;&nbsp;&nbsp;128-03-501599-6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合約書第二頁 -->
    <div
      v-if="currentView === 'contract2'"
      class="contract-template"
    >
      <div class="contract-content">
        <div class="contract-sections">
          <div class="section">
            <div class="section-title">
              第五條 <span class="ps-6">修改及驗收</span>
            </div>
            <div class="section-content">
              <div class="d-flex">
                <div class="me-4">
                  1.
                </div>
                <div>
                  <div class="d-flex">
                    乙方於設計提案過程中，應提供<div class="underline-input">
                      {{ formData.contract?.page2?.designProposalCount }}
                    </div>款設計提案供甲方選擇及確認，甲方應於<div class="underline-input">
                      {{ formData.contract?.page2?.responseDay }}
                    </div>個工作
                  </div>
                  日內提供回覆，若無任何回覆則視同確認。
                </div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  2.
                </div>
                <div>
                  甲乙雙方於確認本專案之方向及設計風格無誤後，乙方應立即開始製作專案，若甲方對於專案內容
                  <div class="d-flex">
                    仍有問題需要修改專案，須立即通知乙方進行修改專案，設計階段修改次數僅限<div class="underline-input">
                      {{ formData.contract?.page2?.designRevisionCount }}
                    </div>次，印刷
                  </div>
                  <div class="d-flex">
                    階段（數位打樣）修改次數限<div class="underline-input">
                      {{ formData.contract?.page2?.printRevisionCount }}
                    </div>次，乙方所製作之專案初稿須交由甲方確認色系及排版正確
                  </div>
                  無誤後，再進行大量印刷程序。
                </div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  3.
                </div>
                <div>甲方對於本專案內容需求部分如有變更，超過附件範圍時，乙方得依甲方需求提出報價，完成之時間表雙方另議訂之。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  4.
                </div>
                <div>在乙方經甲方審查確認後送交大量印刷程序，將不再接受文件內容物之修改，若有修改之必要，已印刷之費用需由甲方支付。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  5.
                </div>
                <div>本專案設計稿件經甲方電子郵件確認定稿後，若甲方再提出修改，甲方應支付設計變更費用。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  6.
                </div>
                <div class="d-flex flex-column">
                  本專案結案驗收依報價單項目為準，乙方應於本專案結案後提供甲方 :
                  <div class="d-flex">
                    <div class="provided-items-input">
                      {{ formData.contract?.page2?.providedItems }}
                    </div>。
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第六條 <span class="ps-6">保密約定</span>
            </div>
            <div class="section-content">
              乙方同意因參與本專案而知悉或持有甲方之商業機密及其他機密資訊，負有保密義務，乙方不得以任何方法洩漏或公開予其他第三人，亦不得為自己或其他人之利益，使用該資訊。乙方違反本契約之約定者，甲方有權立即終止本契約，若甲方受有損害時，甲方並得向乙方請求損害賠償。乙方員工之違約行為，亦視為乙方之違約。
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第七條 <span class="ps-6">著作財產權之歸屬</span>
            </div>
            <div class="section-content">
              <div class="d-flex">
                <div class="me-4">
                  1.
                </div>
                <div>本專案完成結案後，著作財產權及使用權歸甲方所有，乙方不得轉移他人使用；提案階段之所有品牌識別設計著作財產權仍歸乙方所有。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  2.
                </div>
                <div>乙方保證本專案之設計係其獨立發想之原創著作，絕無抄襲、複製、改作、剽竊或其他侵害第三人之智慧財產權或有違反相關法令之情事，如因前述事項產生爭議時，乙方應賠償甲方因此所受一切損失，營收利益及包括甲方因此所產生之訴訟費、律師費、和解金或損害賠償等費用。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  3.
                </div>
                <div>甲方所提供之資料及內容(含設計、圖片、文案等)，甲方應負取得一切相關資料之責任，並保證不得侵犯第三者之著作權、商標專用權、其他權利或牴觸現行法律，否則，若因此衍生法律責任及損失，概由甲方負責。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  4.
                </div>
                <div>本專案各圖檔、文案之美術著作權、攝影著作權及語文著作權，歸屬各該圖檔及文案之創作者、提供者所有。</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第八條 <span class="ps-6">解除或終止契約</span>
            </div>
            <div class="section-content">
              乙方提供甲方確認或驗收時，甲方無故不履行確認及驗收，乙方以書面或電子郵件催告二次後仍未取得任何回覆，乙方得終止專案製作，乙方不需返還甲方訂金款項之金額。
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第九條 <span class="ps-6">其它</span>
            </div>
            <div class="section-content">
              <div class="d-flex">
                <div class="me-4">
                  1.
                </div>
                <div>所有附件為本合約之一部分。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  2.
                </div>
                <div>本合約如有未盡事宜，悉依相關法令辦理。</div>
              </div>
              <div class="d-flex">
                <div class="me-4">
                  3.
                </div>
                <div>本合約書正本壹式貳份，甲、乙雙方各執乙份，自簽定後生效。</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第十條 <span class="ps-6">爭議處理</span>
            </div>
            <div class="section-content">
              本合約任何爭議之解決以臺灣臺北地方法院為第一審管轄法院，但如經雙方同意亦得提付仲裁。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合約書第三頁 -->
    <div
      v-if="currentView === 'contract3'"
      class="contract-template"
    >
      <div class="contract-content">
        <div class="contract-sections">
          <div class="section">
            <div class="section-title">
              第十一條 <span class="ps-6">其他協議事項</span>
            </div>
            <div class="section-content">
              <pre class="other-agreements ps-4">{{ formData.contract?.page3?.otherAgreements }}</pre>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              第十二條 <span class="ps-6">合約分存</span>
            </div>
            <div class="section-content">
              <div class="ps-4">
                本契約書壹式貳份，雙方各執乙份。
              </div>
            </div>
          </div>

          <div
            class="section"
            style="margin-top: 120px;"
          >
            <div class="section-title">
              立約人
            </div>
            <div class="section-content-contract-3">
              <div class="party-info mb-8">
                <div class="d-flex mb-2">
                  <div>
                    甲方：
                  </div>
                  <div class="party-input">
                    {{ formData.contract?.page3?.partyA?.companyName }}
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    代表人：
                  </div>
                  <div class="party-input">
                    {{ formData.contract?.page3?.partyA?.representative }}
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    地址：
                  </div>
                  <div class="party-input">
                    {{ formData.contract?.page3?.partyA?.address }}
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    電話：
                  </div>
                  <div class="party-input">
                    {{ formData.contract?.page3?.partyA?.phone }}
                  </div>
                </div>
                <div class="d-flex mb-4">
                  <div class="label-width">
                    統一編號 / 身分證字號：
                  </div>
                  <div class="party-input">
                    {{ formData.contract?.page3?.partyA?.taxId }}
                  </div>
                </div>
                <div class="stamp-box-container-contract">
                  <div class="stamp-box-contract">
                    <p>公司用印</p>
                  </div>
                </div>
                <div>
                  <p class="mt-1 mb-2 font-weight-bold">
                    簽約日期
                  </p>
                  <p>
                    中華民國&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日
                  </p>
                </div>
              </div>

              <div class="party-info">
                <div class="d-flex mb-2">
                  <div class="label-width">
                    乙方：
                  </div>
                  <div class="party-input">
                    銳皇國際股份有限公司
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    負責人：
                  </div>
                  <div class="party-input">
                    黃士元
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    地址：
                  </div>
                  <div class="party-input">
                    10467 台北市中山區松江路 220 號 4 樓之 5
                  </div>
                </div>
                <div class="d-flex mb-2">
                  <div class="label-width">
                    電話：
                  </div>
                  <div class="party-input">
                    02-25080789
                  </div>
                </div>
                <div class="d-flex mb-4">
                  <div class="label-width">
                    統一編號：
                  </div>
                  <div class="party-input">
                    83213438
                  </div>
                </div>
                <div class="stamp-box-container-contract">
                  <div class="stamp-box-contract">
                    <p>公司用印</p>
                  </div>
                </div>
                <div>
                  <p class="mt-1 mb-2 font-weight-bold">
                    簽約日期
                  </p>
                  <p>
                    中華民國&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

// 當前顯示的頁面
const currentView = ref('quotation')

// 監聽 formData 中的 includeContract 變化
watch(() => props.formData?.includeContract, (newVal) => {
  if (!newVal) {
    currentView.value = 'quotation'
  }
})

// 監聽父組件的分頁變化
watch(() => props.formData?.currentPage, (newVal) => {
  if (newVal) {
    currentView.value = newVal
  }
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `${year}/${month}/${day}`
}

// 格式化金額
const formatAmount = (amount) => {
  if (amount === undefined || amount === null || amount === '') return ''
  // 如果輸入是數字或可以轉換為數字
  const numAmount = Number(amount)
  if (!isNaN(numAmount)) {
    return numAmount.toLocaleString('zh-TW')
  }
  // 如果不是數字，直接返回原始值
  return amount
}

// 計算總金額
const totalAmount = computed(() => {
  if (!props.formData?.items) return 0
  return props.formData.items.reduce((total, item) => {
    const quantity = Number(item?.quantity) || 0
    const price = Number(item?.price) || 0
    return total + (quantity * price)
  }, 0)
})
</script>

<style lang="scss" scoped>
.preview-content {
  background: white;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 13mm 15mm;
  box-sizing: border-box;
}

.preview-content-contract {
  background: white;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 10mm 9mm;
  box-sizing: border-box;
}

.quotation-template {
  font-size: 12px;
  line-height: 1.4;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  width: 100%;
  text-align: left;
}

.title-content {
  border-bottom: 3px solid #663399;
}

.title h2 {
  font-size: 20px;
  margin-bottom: 10px;
  letter-spacing: 6px;
  color: #000;
}

.company-info {
  width: 480px;
  text-align: right;
  img {
    margin-bottom: 12px;
  }
  p {
    line-height: 2;
    font-size: 14px;
  }
}

.company-logo {
  height: 124px !important;
  width: auto !important;
  object-fit: contain !important;
  margin-bottom: 5px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  tr {
    display: flex;
  }
  .content {
    padding-left: 24px;
    font-size: 13px;
  }
}

.info-table td {
  padding: 4px 6px;
  height: 24px;
}

.info-table .label {
  width: 72px;
  height: 26px;
  border-bottom: 2px solid #663399;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}

.items-table-container {
  height: 320px;
  overflow-y: visible;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 13px;
}

.items-table th {
  padding: 6px;
  text-align: center;
}

.items-table  {
  td {
    padding: 6px;
    text-align: center;
  }

  tfoot td {
    border-bottom: none;
  }
}

.items-table .special-note {
  text-align: left;
  text-align: center;
}

.data-tbody {
  border-top: 3px solid #663399 !important;
  border-bottom: 3px solid #663399 !important;
  tr:not(:last-child) {
    border-bottom: 1px solid #000;
  }
}

.items-table tfoot tr {
  height: 32px;
}

.total-amount {
  display: inline-block;
  border-bottom: 1px solid #000;
  font-weight: 600;

}

.notes {
  margin: 8px 0;
  .work-days {
    margin: 0 4px;
    width: 32px;
    display: inline-block;
    text-align: center;
    border-bottom: 1px solid #000;
    font-weight: 600;
  }
}

.notes h3 {
  font-size: 14px;
  margin-bottom: 8px;
}

.notes ol {
  padding-left: 20px;
  margin: 0;
}

.notes li {
  padding-left: 12px;
  margin-bottom: 4px;
  line-height: 1.6;
  font-size: 14px;
}

.signature {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 600;
}

.stamp-box,
.signature-box {
  width: 150px;
  height: 80px;
  margin: 5px 0;
}

.footer {
  text-align: center;
  margin-top: 15px;
  color: #000080;
  font-size: 14px;
}

.text-right {
  text-align: right;
}

.items-table th:nth-child(1),
.items-table td:nth-child(1) {
  width: 40px;
}

.items-table th:nth-child(2),
.items-table td:nth-child(2) {
  width: 120px;
}

.items-table th:nth-child(3),
.items-table td:nth-child(3) {
  width: 120px;
}

.items-table th:nth-child(4),
.items-table td:nth-child(4) {
  width: 70px;
}

.items-table th:nth-child(5),
.items-table td:nth-child(5) {
  width: 50px;
}

.items-table th:nth-child(6),
.items-table td:nth-child(6) {
  width: 50px;
}

.items-table th:nth-child(7),
.items-table td:nth-child(7) {
  width: 36px;
}

.items-table th:nth-child(8)
.items-table td:nth-child(8) {
  width: 36px;
}

.contract-template {
  font-size: 14px;
  line-height: 1.4;
}

.contract-header {
  text-align: center;
  margin-bottom: 16px;

  .company-logo-contract {
    height: 72px;
  }

  .contract-title {
    font-size: 18px;
    font-weight: 900;
  }
}

.parties-block {
  margin-bottom: 16px;

  .parties-title {
    font-weight: bold;
  }

  .parties-content {
    padding-left: 100px;
  }

  .party-line {
    padding-left: 8px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;

    .underline-input {
      min-width: 320px;
      height: 26px;
      margin: 0 10px;
      padding: 0 10px;
      font-weight: 600;
      border-bottom: 1px solid #000;
      display: inline-block;
      text-align: center;
    }

    .project-name-input {
      min-width: 212px;
      height: 26px;
      margin: 0 10px;
      padding: 0 10px;
      font-weight: 600;
      border-bottom: 1px solid #000;
      display: inline-block;
      text-align: center;
    }
  }
}

.section {
  margin-bottom: 8px;

  .section-title {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .section-content {
    padding-left: 70px;
    line-height: 1.8;

    .underline-input {
      min-width: 50px;
      height: 26px;
      margin: 0 5px;
      padding: 0 5px;
      font-weight: 600;
      border-bottom: 1px solid #000;
      display: inline-block;
      text-align: center;
    }


  }
}

.total-amount-input {
  min-width: 140px;
  height: 26px;
  margin: 0 10px;
  padding: 0 10px;
  font-weight: 600;
  border-bottom: 1px solid #000;
  display: inline-block;
  text-align: center;
}

.deposit-amount-input {
  min-width: 160px;
  height: 26px;
  margin: 0 10px;
  padding: 0 10px;
  font-weight: 600;
  border-bottom: 1px solid #000;
  display: inline-block;
  text-align: center;
}

.check-input {
  accent-color: #663399;
}

.payment-options {
  padding-top: 20px;
}

.checkbox-line {
  display: flex;
  align-items: center;

  input[type="checkbox"] {
    margin-right: 10px;
  }
}

.date-line {
  margin-left: 24px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;

  .underline-input {
    min-width: 30px;
    height: 22px;
    margin: 0 5px;
    padding: 0 5px;
    border-bottom: 1px solid #000;
    display: inline-block;
    text-align: center;
  }
}

.date-line-2 {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}



.bank-info {
  .bank-details {
    padding-left: 28px;
    line-height: 2;
  }
}

.mt-2 {
  margin-top: 20px;
}

.mb-4 {
  margin-bottom: 40px;
}

.preview-content,
.preview-content-contract {
  input[type="checkbox"] {
    accent-color: #4e4e4e;
  }
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid #000;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  margin-right: 8px;
  padding-bottom: 2px;
  background-color: #fff;
  font-size: 10px;
  line-height: 1;
  vertical-align: middle;

  &.checked {
    background-color: #663399;
  }
}

.checkbox-line {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.provided-items-input {
  min-width: 250px;
  height: 26px;
  margin: 0 4px;
  padding: 0 12px;
  font-weight: 600;
  border-bottom: 1px solid #000;
  display: inline-block;
  text-align: center;
}

.mt-8 {
  margin-top: 80px;
}

.mb-8 {
  margin-bottom: 80px;
}

.mb-4 {
  margin-bottom: 40px;
}

.mb-2 {
  margin-bottom: 20px;
}

.stamp-box-container {
  display: flex;
  justify-content: flex-end;
  padding-right: 120px;
}

.party-info {
  .underline-input {
    flex-grow: 1;
    border-bottom: 1px solid #000;
    padding: 0 8px;
    min-height: 24px;
  }
}

.other-agreements {
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-size: inherit;
  line-height: inherit;
  background: none;
  border: none;
  padding: 0;
}

.party-input {
  min-width: 200px;
  height: 26px;
  display: inline-block;
}

.section-content-contract-3 {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
}

.stamp-box-container-contract {
  width: 350px;
  height: 180px;
  margin-top: 20px;
  border-bottom: 3px solid #663399
}

.stamp-box-contract {
  width: 120px;
  height: 120px;
  p {
    margin: 0;
    font-weight: 900;
  }
}
</style>
