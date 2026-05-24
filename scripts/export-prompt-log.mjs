/**
 * Reads docs/PROMPT-LOG.csv and writes a formatted docs/PROMPT-LOG.xlsx
 * with 8pt font, wrapped text, and row heights sized to fit content.
 */
import ExcelJS from 'exceljs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const csvPath = path.join(root, 'docs/PROMPT-LOG.csv')
const xlsxPath = path.join(root, 'docs/PROMPT-LOG.xlsx')

/** Excel column widths (character units) per column index. */
const COLUMN_WIDTHS = [6, 12, 28, 42, 42, 32, 32, 12, 32]

const FONT_SIZE = 8
const LINE_HEIGHT_PT = 13
const CELL_PADDING_PT = 6
const MAX_ROW_HEIGHT = 400

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const next = content[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++
      row.push(field)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      field = ''
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((cell) => cell.length > 0)) rows.push(row)
  }

  return rows
}

function estimateLines(text, columnWidth) {
  const value = String(text ?? '')
  if (!value) return 1

  const charsPerLine = Math.max(8, Math.floor(columnWidth * 1.05))
  const parts = value.split(/\n/)
  return parts.reduce((sum, part) => sum + Math.max(1, Math.ceil(part.length / charsPerLine)), 0)
}

function rowHeightForCells(cells) {
  let maxLines = 1
  cells.forEach((text, index) => {
    maxLines = Math.max(maxLines, estimateLines(text, COLUMN_WIDTHS[index] ?? 20))
  })
  return Math.min(maxLines * LINE_HEIGHT_PT + CELL_PADDING_PT, MAX_ROW_HEIGHT)
}

const csv = fs.readFileSync(csvPath, 'utf8')
const parsed = parseCsv(csv)

const workbook = new ExcelJS.Workbook()
workbook.creator = 'portfolio-v3'
workbook.created = new Date()

const sheet = workbook.addWorksheet('Prompt Log', {
  views: [{ state: 'frozen', ySplit: 1 }],
})

sheet.columns = [
  { key: 'id', width: COLUMN_WIDTHS[0] },
  { key: 'date', width: COLUMN_WIDTHS[1] },
  { key: 'summary', width: COLUMN_WIDTHS[2] },
  { key: 'requested', width: COLUMN_WIDTHS[3] },
  { key: 'outcome', width: COLUMN_WIDTHS[4] },
  { key: 'worked', width: COLUMN_WIDTHS[5] },
  { key: 'improve', width: COLUMN_WIDTHS[6] },
  { key: 'rating', width: COLUMN_WIDTHS[7] },
  { key: 'notes', width: COLUMN_WIDTHS[8] },
]

const headerStyle = {
  font: { name: 'Calibri', size: FONT_SIZE, bold: true, color: { argb: 'FF1F2937' } },
  alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } },
  border: {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  },
}

const cellStyle = {
  font: { name: 'Calibri', size: FONT_SIZE, color: { argb: 'FF111827' } },
  alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
  border: {
    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  },
}

const [header, ...dataRows] = parsed

const headerRow = sheet.addRow(header)
headerRow.height = rowHeightForCells(header)
headerRow.eachCell((cell) => {
  cell.style = headerStyle
})

for (const cells of dataRows) {
  const excelRow = sheet.addRow(cells)
  excelRow.height = rowHeightForCells(cells)
  excelRow.eachCell((cell) => {
    cell.style = cellStyle
  })

  // Zebra striping for readability
  if (excelRow.number % 2 === 0) {
    excelRow.eachCell((cell) => {
      cell.style = {
        ...cellStyle,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } },
      }
    })
  }
}

sheet.autoFilter = {
  from: { row: 1, column: 1 },
  to: { row: parsed.length, column: header.length },
}

await workbook.xlsx.writeFile(xlsxPath)
console.log(`Wrote ${xlsxPath} (${dataRows.length} data rows)`)
