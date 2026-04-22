/**
 * 格式化日期為 YYYY/MM/DD 格式
 * @param {string | Date} date - 要格式化的日期
 * @returns {string} 格式化後的日期字串
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}/${month}/${day}`
}

/**
 * Date 或可被解析的值 → YYYY-MM-DD（依本機時區日曆日）
 * 送 API 日期欄位時請用此函式，勿用 toISOString().split('T')[0]，否則 UTC+8 會少一天
 */
export const dateToYmdLocal = (value) => {
  if (value == null || value === '') return null
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim())
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
  }
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化數字為千分位格式
 * @param {number} number - 要格式化的數字
 * @returns {string} 格式化後的數字字串
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-'
  }
  return value.toLocaleString('en-US')
}
