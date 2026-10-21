import { describe, it, expect } from 'vitest'
import { bmi, bmiCategory, validDate, weightPreview, readSpreadsheet, spreadsheetCSV } from './jgym.js'

describe('BMI and weigh-in import integrity', () => {
  it('uses metric BMI and converts pounds without changing height', () => {
    expect(bmi(80, 200)).toBe(20)
    expect(bmi(176.3698097, 200, 'lb')).toBeCloseTo(20)
    expect(bmi('', 200)).toBeNull()
    expect(bmi(80, 0)).toBeNull()
    expect(bmi(Infinity, 180)).toBeNull()
    expect(bmiCategory(18.5)).toBe('Healthy weight')
    expect(bmiCategory(25)).toBe('Overweight')
    expect(bmiCategory(30)).toBe('Obesity')
  })
  it('rejects impossible or ambiguous dates instead of guessing', () => {
    expect(validDate('2024-02-29')).toBe('2024-02-29')
    expect(validDate('2025-02-29')).toBeNull()
    expect(validDate('03/04/2025')).toBeNull()
    expect(validDate(new Date('2025-01-02T00:00:00Z'))).toBe('2025-01-02')
  })
  it('converts units and skips existing and in-file duplicate days', () => {
    const result = weightPreview([['2025-01-01',80,'kg'],['2025-01-02',176.3698,'lb'],['2025-01-02',90,'kg']], {date:0,weight:1,unit:2}, 'kg', [{d:'2025-01-01',w:79}])
    expect(result.entries).toEqual([{d:'2025-01-02',w:80}])
    expect(result.duplicates).toBe(2)
    expect(result.errors).toEqual([])
  })
  it('reports malformed records without silently accepting them', () => {
    const r = weightPreview([['2025-01-01',-1,'kg'],['bad',80,'kg'],['2025-01-02',80,'stones'],['2025-01-03','','kg']],{date:0,weight:1,unit:2},'kg')
    expect(r.entries).toHaveLength(0)
    expect(r.errors).toHaveLength(4)
  })
  it('reads quoted and semicolon CSV files', async () => {
    const file = {name:'weight.csv',size:70,text:async()=>'date;weight;note\n2025-01-01;80;"hello; world"'}
    const sheets = await readSpreadsheet(file)
    expect(sheets[0].rows[1]).toEqual(['2025-01-01','80','hello; world'])
    expect(spreadsheetCSV(sheets[0].rows)).toContain('2025-01-01,80,hello; world')
  })
  it('reads multiple Excel sheets, date cells and cached formulas', async () => {
    const {default:ExcelJS} = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    const a = wb.addWorksheet('Weight'); a.addRow(['date','weight']); a.addRow([new Date('2025-01-02T00:00:00Z'), {formula:'40*2',result:80}])
    const b = wb.addWorksheet('Workouts'); b.addRow(['Date','Exercise','Reps']); b.addRow(['2025-01-02','Squat',8])
    const bytes = await wb.xlsx.writeBuffer()
    const sheets = await readSpreadsheet({name:'history.xlsx',size:bytes.byteLength,arrayBuffer:async()=>bytes})
    expect(sheets.map(x => x.name)).toEqual(['Weight','Workouts'])
    expect(validDate(sheets[0].rows[1][0])).toBe('2025-01-02')
    expect(sheets[0].rows[1][1]).toBe(80)
  })
  it('rejects oversized and unsupported files', async () => {
    await expect(readSpreadsheet({name:'a.xlsx',size:11*1024*1024})).rejects.toThrow('10 MB')
    await expect(readSpreadsheet({name:'a.xls',size:1})).rejects.toThrow('.xlsx')
  })
})
