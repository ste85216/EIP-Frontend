/** 講座參加者異動紀錄：欄位顯示名與值格式化（避免 XSS：僅供文字顯示，勿用 v-html） */

const PARTICIPANT_CHANGE_FIELD_LABELS = {
  name: '姓名',
  phone: '電話',
  email: 'Email',
  lineId: 'LineId',
  participantCount: '人數',
  paymentStatus: '付款',
  participantStatus: '狀態',
  note: '備註'
}

export function formatParticipantHistoryValue (field, value) {
  if (value === null || value === undefined || value === '') {
    return '_'
  }
  if (field === 'paymentStatus') {
    if (value === true) return '已付款'
    if (value === false) return '未付款'
    return '_'
  }
  if (field === 'participantStatus') {
    if (value === 'pending') return '待確認'
    if (value === 'confirmed') return '已確認'
    if (value === 'cancelled') return '已取消'
    return '_'
  }
  if (field === 'participantCount') {
    const n = Number(value)
    return Number.isFinite(n) ? String(n) : String(value)
  }
  return String(value)
}

export function participantHistoryFieldLabel (field) {
  return PARTICIPANT_CHANGE_FIELD_LABELS[field] || field
}
