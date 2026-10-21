import Papa from 'papaparse'

export const APPEARANCES = [
  { id: 'sage', name: 'Sage', detail: 'Fresh greens. A little breathing room.', theme: 'light', accent: '#34634f' },
  { id: 'sand', name: 'Sand', detail: 'Warm neutrals. Slow Sunday energy.', theme: 'light', accent: '#85523b' },
  { id: 'midnight', name: 'Midnight', detail: 'Soft contrast. After-hours focus.', theme: 'dark', accent: '#a7c9b2' },
]
export const appearanceOf = id => APPEARANCES.find(a => a.id === id) || APPEARANCES[0]
export function bmi(weight, heightCm, unit = 'kg') {
  const kg = Number(weight) * (unit === 'lb' ? 0.45359237 : 1)
  const h = Number(heightCm)
  return Number.isFinite(kg) && kg > 0 && Number.isFinite(h) && h >= 50 && h <= 260 ? kg / (h / 100) ** 2 : null
}
export const bmiCategory = n => n == null ? 'Add your height to get started' : n < 18.5 ? 'Underweight' : n < 25 ? 'Healthy weight' : n < 30 ? 'Overweight' : 'Obesity'
export function validDate(value) {
  if (value instanceof Date && Number.isFinite(+value)) return value.toISOString().slice(0, 10)
  const s = String(value ?? '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(s + 'T12:00:00Z')
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s ? s : null
}
export const validWeight = (w, unit) => Number.isFinite(Number(w)) && Number(w) > 0 && Number(w) <= (unit === 'lb' ? 1500 : 680)
export function weightPreview(rows, map, unit, existing = []) {
  const errors = [], entries = [], days = new Set(existing.map(x => x.d))
  let duplicates = 0
  rows.forEach((row, i) => {
    if (row.every(v => v === '' || v == null)) return
    const d = validDate(row[map.date])
    const raw = row[map.weight]
    const from = String(map.unit >= 0 ? row[map.unit] : unit).trim().toLowerCase()
    const sourceUnit = ['lb', 'lbs'].includes(from) ? 'lb' : from === 'kg' ? 'kg' : null
    if (!d || !sourceUnit || !validWeight(raw, sourceUnit)) { errors.push(`Row ${i + 2}: use a real YYYY-MM-DD date, a positive weight, and kg or lb.`); return }
    if (days.has(d)) { duplicates++; return }
    const w = Number(raw) * (sourceUnit === unit ? 1 : sourceUnit === 'lb' ? 0.45359237 : 1 / 0.45359237)
    if (!validWeight(w, unit)) { errors.push(`Row ${i + 2}: converted weight is outside the supported range.`); return }
    entries.push({ d, w: Math.round(w * 1000) / 1000 })
    days.add(d)
  })
  return { entries, errors, duplicates }
}
export async function readSpreadsheet(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Please choose a file smaller than 10 MB.')
  if (/\.csv$/i.test(file.name)) {
    const result = Papa.parse(await file.text(), { skipEmptyLines: 'greedy' })
    if (result.errors.length) throw new Error('This CSV could not be read: ' + result.errors[0].message)
    if (result.data.length > 20001) throw new Error('Import up to 20,000 rows at a time.')
    return [{ name: file.name, rows: result.data }]
  }
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Choose CSV or Excel (.xlsx). Save older .xls workbooks as .xlsx first.')
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  return wb.worksheets.filter(ws => ws.rowCount).map(ws => {
    if (ws.rowCount > 20001 || ws.columnCount > 200) throw new Error('Use sheets with at most 20,000 data rows and 200 columns.')
    const rows = []
    ws.eachRow({ includeEmpty: true }, row => {
      const cells = []
      for (let c = 1; c <= ws.columnCount; c++) {
        let v = row.getCell(c).value
        if (v && typeof v === 'object' && !(v instanceof Date)) {
          if ('formula' in v || 'sharedFormula' in v) v = v.result ?? ''
          else if (v.richText) v = v.richText.map(x => x.text).join('')
          else v = v.text ?? ''
        }
        cells.push(v ?? '')
      }
      rows.push(cells)
    })
    return { name: ws.name, rows }
  })
}
export function spreadsheetCSV(rows) {
  return Papa.unparse(rows.map(row => row.map(v => v instanceof Date ? validDate(v) : v)))
}
export function downloadCSV(name, rows) {
  const url = URL.createObjectURL(new Blob([Papa.unparse(rows, { escapeFormulae: true })], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
