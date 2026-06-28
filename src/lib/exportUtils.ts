import type { Expense, BudgetMonth, Settings } from '@/types'
import { format } from 'date-fns'

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

export function exportToCSV(expenses: Expense[], filename = 'expenses.csv'): void {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']

  const rows = expenses.map(e => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.type,
    e.amount.toFixed(2),
    `"${(e.notes ?? '').replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

export async function exportToPDF(params: {
  expenses: Expense[]
  currentMonth: BudgetMonth | null
  settings: Settings
}): Promise<void> {
  const { expenses, currentMonth, settings } = params
  const sym = settings.currencySymbol

  // Dynamic import keeps jsPDF out of the main bundle
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BudgetApp - Monthly Report', margin, 20)

  // Sub-heading: date range
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  const rangeLabel = currentMonth
    ? `${currentMonth.startDate}${currentMonth.endDate ? ' – ' + currentMonth.endDate : ' – present'}`
    : 'All time'
  doc.text(rangeLabel, margin, 27)
  doc.setTextColor(0)

  // Summary section
  const income = currentMonth?.income ?? 0
  const spent = expenses
    .filter(e => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const savedAmount = expenses
    .filter(e => e.type === 'savings')
    .reduce((s, e) => s + e.amount, 0)
  const balance = income - spent - savedAmount

  const summaryY = 35
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', margin, summaryY)

  const summaryRows = [
    ['Income', `${sym}${income.toFixed(2)}`],
    ['Spent', `${sym}${spent.toFixed(2)}`],
    ['Savings', `${sym}${savedAmount.toFixed(2)}`],
    ['Balance', `${sym}${balance.toFixed(2)}`],
  ]

  autoTable(doc, {
    startY: summaryY + 3,
    head: [],
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [80, 80, 80] },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: margin, right: margin },
    tableWidth: 80,
  })

  // Expense table
  const afterSummaryY = (doc as any).lastAutoTable.finalY + 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Transactions', margin, afterSummaryY)

  const tableRows = expenses.map(e => [
    e.date,
    e.description,
    e.category,
    `${sym}${e.amount.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: afterSummaryY + 3,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 37, 36], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 28 },
      3: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: margin, right: margin },
  })

  // Footer
  const generatedAt = format(new Date(), "yyyy-MM-dd 'at' HH:mm")
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(
    `Generated ${generatedAt}`,
    pageW - margin,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'right' }
  )

  doc.save(`budget-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------

export async function exportToExcel(
  expenses: Expense[],
  filename = 'expenses.xlsx'
): Promise<void> {
  const { utils, writeFile } = await import('xlsx')

  const rows = expenses.map(e => ({
    Date: e.date,
    Description: e.description,
    Category: e.category,
    Type: e.type,
    Amount: e.amount,
    Notes: e.notes ?? '',
  }))

  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Expenses')

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map(key => ({
    wch: Math.max(
      key.length,
      ...rows.map(r => String(r[key as keyof typeof r]).length)
    ),
  }))
  ws['!cols'] = colWidths

  writeFile(wb, filename)
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after a tick so Safari has time to open the download
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
