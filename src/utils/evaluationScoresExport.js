/** 考核評分 Excel：依「表單模板」分區；左側為公司、部門、被考核人（考核對象），每列一人，數值為該筆之彙總（與考核評分表 TOTAL 列邏輯一致） */

function getEvaluateeCompanyDept (block) {
  const c = (block.evaluateeCompanyName ?? '').trim()
  const d = (block.evaluateeDepartmentName ?? '').trim()
  if (c || d) {
    return { company: c || '_', dept: d || '_' }
  }
  const s = (block.evaluateeDept || '').trim()
  const sep = ' - '
  const idx = s.indexOf(sep)
  if (idx >= 0) {
    return {
      company: s.slice(0, idx).trim() || '_',
      dept: s.slice(idx + sep.length).trim() || '_'
    }
  }
  if (s) return { company: '_', dept: s }
  return { company: '_', dept: '_' }
}

function round1 (n) {
  return Math.round(n * 10) / 10
}

export function buildPartScoreColumns (parts) {
  return (parts || []).map((part) => {
    const sw = part.subWeights && part.subWeights.length > 1 ? part.subWeights : null
    if (sw) {
      return sw.map((s, sIdx) => ({
        sIdx,
        label: `${part.title || '部分'}-${s.label || `選項${sIdx + 1}`}(${Math.round((s.weight || 0) * 100)}%)`
      }))
    }
    return [{ sIdx: 0, label: `${part.title || '部分'}(${Math.round((part.weight || 0) * 100)}%)` }]
  })
}

/** 與 [batchId].vue scoresTotals 相同邏輯（單筆考核內跨「評核者」平均後加權） */
export function computeScoresTotals (data) {
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
    attendanceWeight: attWeight
  }
}

/** 表頭一列（同一模板共用） */
export function buildHeaderRowForParts (data) {
  const parts = data?.parts || []
  const partCols = buildPartScoreColumns(parts)
  const header = ['公司', '部門', '姓名']
  let questionNum = 0
  parts.forEach((part, pIdx) => {
    (part.questions || []).forEach((q, qIdx) => {
      questionNum += 1
      header.push(`${questionNum}.${q.title || `題目${qIdx + 1}`}`)
    })
    ;(partCols[pIdx] || []).forEach((col) => {
      header.push(col.label)
    })
  })
  if ((data.attendanceWeight ?? 0) > 0) {
    header.push(`出勤分數 (${Math.round((data.attendanceWeight || 0) * 100)}%)`)
  }
  header.push('加權總分')
  return header
}

/**
 * 單一被考核人（一筆考核）一列：左欄姓名+員編，其餘為彙總分數
 */
export function buildDataRowForEvaluatee (block) {
  const parts = block?.parts || []
  const partCols = buildPartScoreColumns(parts)
  const totals = computeScoresTotals(block)
  const { company, dept } = getEvaluateeCompanyDept(block)
  const code = block.evaluateeEmployeeCode ? ` (${block.evaluateeEmployeeCode})` : ''
  const line = [company, dept, `${block.evaluateeName || '_'}${code}`]

  parts.forEach((part, pIdx) => {
    (part.questions || []).forEach((_, qIdx) => {
      const key = `${pIdx}-${qIdx}`
      line.push(totals ? (totals.questionScores[key] ?? '_') : '_')
    })
    ;(partCols[pIdx] || []).forEach((col) => {
      line.push(totals ? (totals.partSegmentScores?.[pIdx]?.[col.sIdx] ?? '_') : '_')
    })
  })
  if ((block.attendanceWeight ?? 0) > 0) {
    line.push(totals ? (totals.attendanceScore ?? '_') : '_')
  }
  line.push(totals ? (totals.totalScore ?? '_') : '_')
  return line
}

/**
 * @param {Array<{ templateName: string, blocks: object[] }>} grouped 已依模板分組的 scores-summary
 */
export function buildSheetRowsFromGrouped (grouped) {
  const out = []
  const note = [
    '說明：各欄為該員工該筆考核之彙總（各題為已填寫評核者之平均，再依權重計算部分分與加權總分；與系統「考核評分表」一致）。前兩欄為公司、部門；「姓名」欄為被考核人（含員編）。'
  ]
  grouped.forEach((g, gi) => {
    if (gi > 0) out.push([])
    out.push([g.templateName])
    if (!g.blocks?.length) return
    out.push(buildHeaderRowForParts(g.blocks[0]))
    for (const block of g.blocks) {
      out.push(buildDataRowForEvaluatee(block))
    }
  })
  out.push([])
  out.push(note)
  return out
}
