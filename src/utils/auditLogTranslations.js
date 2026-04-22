/**
 * 異動紀錄欄位翻譯工具
 */

// 欄位名稱翻譯對照表
const fieldTranslations = {
  name: '資料名稱',
  email: '電子郵件',
  role: '權限',
  roles: '權限',
  permissions: '權限',
  userId: '用戶編號',
  adminId: '管理者編號',
  formNumber: '表單編號',
  clientName: '客戶名稱',
  projectName: '專案名稱',
  type: '類型',
  componentName: '組件名稱',
  note: '備註',
  isActive: '啟用狀態',
  employmentStatus: '任職狀態',
  marketingExpenses: '行銷實際支出',
  marketingBudgets: '行銷預算',
  expense: '花費金額',
  invoiceDate: '發票日期',
  theme: '行銷主題',
  channel: '廣告渠道',
  platform: '平台',
  detail: '線別',
  relatedBudget: '關聯預算表',
  year: '年度',
  order: '排序',
  maintenanceDate: '維修日期',
  maintenanceContent: '維修內容',
  maintenanceResult: '維修結果',
  reportUser: '報修人',
  annualTotalBudget: '年度總預算',
  employeeCode: '科威員編',
  extNumber: '分機號碼',
  printNumber: '列印機編號',
  emailPassword: 'Email密碼',
  company: '公司',
  department: '部門',
  employeeId: '系統員編',
  departmentId: '部門編號',
  hireDate: '到職日期',
  resignationDate: '離職日期',
  unpaidLeaveStartDate: '留職停薪開始日期',
  reinstatementDate: '復職日期',
  purchaseDate: '進貨日期',
  serialNumber: '序號',
  loginName: '登入名稱',
  deviceName: '裝置名稱',
  stockStatus: '庫存狀態',
  expenseStatus: '報帳狀態',
  office2021Account: 'office2021帳號',
  office365Account: 'office365帳號',
  office2021InstallDate: 'office2021安裝日期',
  user: '用戶',
  macAddress: 'MAC',
  IPAddress: 'IP',
  VPNAccount: 'VPN帳號',
  VPNApplyReason: 'VPN申請原因',
  location: '地點',
  expenseObject: '報帳對象',
  expenseDate: '報帳日期',
  companyId: '公司編號',
  employmentType: '聘僱類型',
  jobTitle: '職稱',
  nickname: '暱稱',
  inquiryDate: '詢問日期',
  inquiryContent: '詢問內容',
  inquiryResult: '詢問結果',
  inquiryPlace: '詢問地點',
  source: '來源',
  customerName: '客戶姓名',
  customerPhone: '客戶電話',
  customerEmail: '客戶Email',
  customerLineId: '客戶Line ID',
  salesPerson: '業務',
  progress: '進度',
  inquiryResultAndNote: '詢問結果 / 備註',
  showInB2C: 'B2C業務',
  customerTitle: '稱謂',
  lineLink: 'Line 連結',
  lineID: 'Line ID',
  progressNotes: '進度 / 備註',
  // 行銷美編需求申請欄位翻譯
  designRequestNumber: '申請編號',
  productType: '申請類型',
  applicant: '申請人',
  status: '狀態',
  applicationDate: '申請日期',
  assignedDesigner: '處理人員',
  title: '標題',
  style: '風格',
  imageSubject: '圖片主題',
  content: '內容',
  requestedByDate: '希望交付日',
  quantity: '數量',
  useInfoBookletCover: '使用說資封面',
  otherNote: '其他備註',
  files: '檔案',
  referenceImage: '參考圖片',
  images: '圖片',
  groupId: '團號',
  useQuickTemplate: '使用快速版型',
  quickTemplateNumber: '快速版型編號',
  subtitle: '副標',
  departureDate: '出發日期',
  tripHighlights: '行程特色',
  attractionImage: '指定景點圖片',
  agentPrice: '同業價',
  retailPrice: '直客價',
  promotions: '優惠',
  airlineHighlightNote: '航空公司特色備註',
  useLogo: '使用Logo',
  subtitleAndHighlights: '副標/特色',
  itinerary: '行程',
  groupName: '團體名稱',
  printingTypes: '印刷類型',
  progressHistory: '進度歷史',
  infoBookletCover: '說資封面',
  banner: '布條',
  coachSign: '車頭牌',
  other: '其他',
  categories: '分類(複)', // 預設翻譯，特定模型會覆蓋
  reportUserId: '報修人',
  isB2CSupervisor: '業務主管',
  departmentNote: '部門備註',
  newElectronicInfo: '電子說資',
  code: '代碼',
  description: '描述',
  level: '層級',
  module: '模組',
  resource: '資源',
  action: '操作類型',
  image: '圖片',
  startDate: '開始日期',
  endDate: '結束日期',
  isPinned: '置頂',
  lineUserId: 'Line ID',
  lineBoundAt: 'Line 綁定時間',
  notificationPreferences: '通知偏好設定',
  line: 'LINE',
  inbox: '內部收件匣',
  warehouse: '倉庫',
  packaging: '包裝形式',
  manufacturer: '廠商',
  cost: '成本 / 花費',
  price: '價格',
  sparePart: '備品',
  sparePartName: '備品名稱',
  warehouseName: '倉庫名稱',
  quantityChange: '數量變更',
  warehouses: '倉庫列表',
  displayLocations: '顯示位置',
  category: '分類',
  videoUrl: '影片連結',
  thumbnailUrl: '封面圖片',
  isSystemAccount: '系統帳號',
  convertedTaskId: '轉換任務ID',
  originalGroupId: '原團號',
  modifiedGroupId: '修改後團號',
  tripShortName: '行程簡稱',
  expiryDate: '到期日',
  frontSideNote: '正面備註',
  usageRules: '使用規則',
  couponType: '折價券/禮券類型',
  couponTypeOther: '其他折價券/禮券類型',
  faceValue: '面額',
  lineCategory: '線別',
  mainTitle: '大標',
  bannerUrl: '大圖網址連結',
  copy: '文案',
  materialRequirements: '素材需求',
  phone: '電話',
  commentDate: '評論日期',
  hasFiftyWordComment: '50字評論',
  giftSentDate: '禮品寄出日',
  reviewer: '審核者',
  sender: '寄出者',
  address: '地址',
  extraPermissions: '額外權限',
  deniedPermissions: '拒絕權限',
  attachments: '附件',
  lectureName: '講座名稱',
  eventDateTime: '活動時間',
  entryDateTime: '入場時間',
  needDM: '是否需要做DM',
  dmImage: 'DM圖片',
  lectureDescription: '講座敘述',
  shortIntroduction: '活動簡介(短)',
  longIntroduction: '活動簡介(長)',
  branch: '館別',
  redSubtitle: '紅色小標',
  specifiedImageUrl: '指定圖片連結',
  travelAgency: '旅行社',
  modify: '修改',
  removal: '下架',
  galleryTypes: '館格類型',
  // --- 考核、出勤（異動紀錄欄位）---
  dueDate: '截止日期',
  template: '表單模板',
  evaluatee: '考核對象',
  evaluators: '評核者設定',
  specialAchievements: '特殊成就',
  scores: '評分紀錄',
  batch: '考核批次',
  attendance: '關聯出勤紀錄',
  createdBy: '建立者',
  createdAt: '建立時間',
  updatedAt: '更新時間',
  parts: '題組區塊',
  questions: '題目',
  scoringPoints: '計分選項',
  scoringCriteria: '評分標準',
  subWeights: '子加權項目',
  attendanceFormTemplate: '出勤表單模板',
  specialAchievementEnabled: '啟用特殊成就',
  fillingInstructions: '填寫說明',
  confirmPrompt: '送出確認提示',
  visibleParts: '可見題組索引',
  partSegmentIndex: '題組分段設定',
  fillsSpecialAchievement: '填寫特殊成就',
  hasAchievement: '是否有特殊成就',
  text: '文字內容',
  partIndex: '區塊序號',
  questionIndex: '題目序號',
  score: '得分',
  weight: '權重',
  label: '標籤',
  tardyCount: '遲到次數扣分',
  tardyMinutes: '遲到分鐘扣分',
  forgotPunch: '忘打卡扣分',
  personalLeave: '事假扣分',
  pointsPerOccurrence: '每次扣分',
  maxPoints: '扣分上限',
  startMinutes: '起算遲到分鐘',
  minutesPerInterval: '每區間分鐘數',
  pointsPerInterval: '每區間扣分',
  minCount: '次數下限',
  maxCount: '次數上限',
  overCount: '超過次數門檻',
  overPointsPerOccurrence: '超過門檻後每次扣分',
  tiers: '級距設定',
  minHours: '時數下限',
  maxHours: '時數上限',
  points: '分數',
  incrementalHours: '遞增時數門檻',
  incrementalPoints: '遞增扣分',
  filledAt: '填寫時間',
  calculatedScore: '計算得分',
  forgotPunchCount: '忘打卡次數',
  personalLeaveHours: '事假時數',
  employee: '員工',
  roleName: '角色名稱',
  roleCode: '角色代碼',
  _id: '資料編號'
}

// 特定模型的欄位翻譯覆蓋
const modelSpecificTranslations = {
  notificationEmails: {
    categories: '大分類'
  },
  evaluations: {
    template: '考核表單模板',
    status: '考核狀態'
  },
  evaluationBatches: {
    attendance: '關聯出勤紀錄',
    status: '批次狀態',
    dueDate: '批次截止日期',
    startDate: '批次開始日期',
    selfAssessmentSubmissions: '自評送出紀錄'
  },
  evaluationTemplates: {
    weight: '區塊加權比例',
    parts: '題組區塊',
    year: '表單年度',
    selfAssessmentFillingInstructions: '自評填寫說明',
    selfAssessmentQuestions: '自評題目'
  },
  evaluationTemplateCategories: {
    order: '分類排序',
    name: '分類名稱'
  },
  evaluationAttendanceWeights: {
    weight: '出勤佔比權重',
    year: '適用年度'
  },
  attendances: {
    template: '出勤表單模板',
    name: '出勤紀錄名稱',
    year: '出勤年度'
  },
  attendanceFormTemplates: {
    weight: '表單權重',
    name: '表單名稱',
    year: '表單年度',
    tardyCount: '遲到次數計分規則',
    tardyMinutes: '遲到分鐘計分規則',
    forgotPunch: '忘打卡計分規則',
    personalLeave: '事假計分規則'
  },
  attendanceRecords: {
    tardyCount: '遲到次數',
    tardyMinutes: '遲到分鐘數',
    employee: '員工',
    attendance: '所屬出勤紀錄'
  }
}

/**
 * 取得欄位翻譯
 * @param {string} field - 欄位名稱
 * @param {string} targetModel - 目標模型名稱（可選）
 * @returns {string|null} 翻譯後的欄位名稱，如果沒有翻譯則返回 null
 */
export const getFieldTranslation = (field, targetModel = null) => {
  // 如果有特定模型的翻譯，優先使用
  if (targetModel && modelSpecificTranslations[targetModel] && modelSpecificTranslations[targetModel][field]) {
    return modelSpecificTranslations[targetModel][field]
  }
  // 如果預設翻譯中有該欄位，返回翻譯
  if (fieldTranslations[field]) {
    return fieldTranslations[field]
  }
  // 沒有翻譯則返回 null（不顯示）
  return null
}

/**
 * 取得所有欄位翻譯（用於向後兼容）
 * @returns {Object} 欄位翻譯物件
 */
export const getFieldTranslations = () => {
  return fieldTranslations
}

// 行銷分類類型對應
export const marketingCategoryTypes = {
  0: '行銷主題',
  1: '廣告渠道',
  2: '平台',
  3: '線別',
  4: '平台細項'
}

// 硬體類別類型對應
export const hardwareCategoryTypes = {
  0: '設備',
  1: '維修'
}

// 跑馬燈類型對應
export const marqueeTypes = {
  system: '系統',
  update: '更新',
  announcement: '一般',
  maintenance: '維護',
  event: '活動'
}

// 考核批次狀態（auditLog 顯示，與 evaluationManagement 列表用語一致）
export const evaluationBatchStatusLabels = {
  draft: '籌備中',
  sent: '已發送'
}

// 單筆考核狀態（auditLog 顯示）
export const evaluationRecordStatusLabels = {
  draft: '籌備中',
  in_progress: '進行中',
  completed: '已完成'
}

// 評核者於考核內的狀態
export const evaluationEvaluatorStatusLabels = {
  pending: '待評核',
  completed: '已完成',
  abandoned: '已放棄'
}

