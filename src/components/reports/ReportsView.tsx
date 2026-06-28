'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays } from 'date-fns'
import { Download, FileText, Calendar, BarChart2, Table } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency, formatDate, getCategoryBreakdown } from '@/lib/calculations'
import type { Expense } from '@/types'
import { cn } from '@/lib/utils'

type ReportType = 'weekly' | 'monthly' | 'yearly'

interface ReportData {
  title: string
  dateRange: string
  expenses: Expense[]
  totalIncome: number
  totalSpent: number
  totalSavings: number
  categoryBreakdown: ReturnType<typeof getCategoryBreakdown>
}

function buildReport(
  type: ReportType,
  expenses: Expense[],
  currentMonth: { id: string; income: number; startDate: string } | null,
): ReportData {
  const today = new Date()
  let start: Date
  let end: Date
  let title: string

  if (type === 'weekly') {
    start = startOfWeek(today)
    end = endOfWeek(today)
    title = `Weekly Report — ${format(start, 'MMM d')}–${format(end, 'MMM d, yyyy')}`
  } else if (type === 'monthly') {
    start = currentMonth ? parseISO(currentMonth.startDate) : new Date(today.getFullYear(), today.getMonth(), 1)
    end = today
    title = `Monthly Report — ${format(start, 'MMMM yyyy')}`
  } else {
    start = startOfYear(today)
    end = endOfYear(today)
    title = `Yearly Report — ${format(today, 'yyyy')}`
  }

  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')

  const filtered = expenses.filter(e => e.date >= startStr && e.date <= endStr)
  const totalIncome = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalSpent = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const totalSavings = filtered.filter(e => e.type === 'savings').reduce((s, e) => s + e.amount, 0)
  const categoryBreakdown = getCategoryBreakdown(filtered)

  return {
    title,
    dateRange: `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`,
    expenses: filtered.sort((a, b) => b.date.localeCompare(a.date)),
    totalIncome,
    totalSpent,
    totalSavings,
    categoryBreakdown,
  }
}

function exportCSV(report: ReportData, currencySymbol: string) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']
  const rows = report.expenses.map(e => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.type,
    e.amount.toFixed(2),
    `"${(e.notes ?? '').replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

async function exportPDF(report: ReportData, currencySymbol: string) {
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default
    const autoTableModule = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(report.title, 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(report.dateRange, 14, 28)

    // Summary stats
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, 38)

    const summaryData = [
      ['Income', formatCurrency(report.totalIncome, currencySymbol)],
      ['Spent', formatCurrency(report.totalSpent, currencySymbol)],
      ['Savings', formatCurrency(report.totalSavings, currencySymbol)],
      ['Net', formatCurrency(report.totalIncome - report.totalSpent - report.totalSavings, currencySymbol)],
    ]

    ;(autoTableModule.default ?? (doc as any).autoTable)(doc, {
      startY: 42,
      head: [['Category', 'Amount']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14 },
      tableWidth: 80,
    })

    const afterSummary = (doc as any).lastAutoTable?.finalY ?? 80

    // Category breakdown
    if (report.categoryBreakdown.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Category Breakdown', 14, afterSummary + 10)

      ;(autoTableModule.default ?? (doc as any).autoTable)(doc, {
        startY: afterSummary + 14,
        head: [['Category', 'Amount', '%', 'Transactions']],
        body: report.categoryBreakdown.map(b => [
          b.category,
          formatCurrency(b.amount, currencySymbol),
          `${b.percentage.toFixed(1)}%`,
          b.count,
        ]),
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 14 },
      })
    }

    const afterBreakdown = (doc as any).lastAutoTable?.finalY ?? afterSummary + 40

    // Transactions
    if (report.expenses.length > 0) {
      doc.addPage()
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Transactions', 14, 20)

      ;(autoTableModule.default ?? (doc as any).autoTable)(doc, {
        startY: 24,
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: report.expenses.map(e => [
          e.date,
          e.description,
          e.category,
          e.type,
          formatCurrency(e.amount, currencySymbol),
        ]),
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 14 },
        columnStyles: { 4: { halign: 'right' } },
      })
    }

    doc.save(`${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf`)
    return true
  } catch (err) {
    return false
  }
}

export function ReportsView() {
  const { expenses, currentMonth, settings } = useFinanceStore()
  const [activeReport, setActiveReport] = useState<ReportType>('monthly')
  const [isExporting, setIsExporting] = useState(false)

  const report = buildReport(activeReport, expenses, currentMonth)

  const REPORT_TYPES: { type: ReportType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'weekly',  label: 'Weekly',  icon: <Calendar className="w-4 h-4" />,  description: 'Current week' },
    { type: 'monthly', label: 'Monthly', icon: <BarChart2 className="w-4 h-4" />, description: currentMonth ? format(parseISO(currentMonth.startDate), 'MMMM') : 'This month' },
    { type: 'yearly',  label: 'Yearly',  icon: <FileText className="w-4 h-4" />,  description: format(new Date(), 'yyyy') },
  ]

  async function handlePDFExport() {
    setIsExporting(true)
    const success = await exportPDF(report, settings.currencySymbol)
    setIsExporting(false)
    if (success) {
      toast.success('PDF exported successfully')
    } else {
      toast.error('PDF export requires jsPDF — falling back to CSV')
      exportCSV(report, settings.currencySymbol)
    }
  }

  function handleCSVExport() {
    exportCSV(report, settings.currencySymbol)
    toast.success('CSV exported successfully')
  }

  const net = report.totalIncome - report.totalSpent - report.totalSavings

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Reports</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Export and review your financial data
        </p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-3 gap-3">
        {REPORT_TYPES.map(({ type, label, icon, description }) => (
          <button
            key={type}
            onClick={() => setActiveReport(type)}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              activeReport === type
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900',
            )}
          >
            <div className={cn(
              'mb-2',
              activeReport === type ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500',
            )}>
              {icon}
            </div>
            <p className={cn(
              'text-sm font-semibold',
              activeReport === type ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-300',
            )}>
              {label}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
          </button>
        ))}
      </div>

      {/* Report preview */}
      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {/* Report header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{report.title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{report.dateRange}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCSVExport}
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={handlePDFExport}
              disabled={isExporting}
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exporting…' : 'PDF'}
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Income',  value: report.totalIncome,  color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Spent',   value: report.totalSpent,   color: 'text-red-600 dark:text-red-400' },
            { label: 'Savings', value: report.totalSavings, color: 'text-teal-600 dark:text-teal-400' },
            { label: 'Net',     value: net,                 color: net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
          ].map(stat => (
            <Card key={stat.label} className="border-zinc-200/60 dark:border-zinc-800/60">
              <CardContent className="p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
                <AmountDisplay amount={stat.value} size="md" className={stat.color} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category breakdown */}
        {report.categoryBreakdown.length > 0 && (
          <Card className="border-zinc-200/60 dark:border-zinc-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2.5">
                {report.categoryBreakdown.slice(0, 8).map(b => (
                  <div key={b.category} className="flex items-center gap-3">
                    <CategoryIcon category={b.category} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-medium text-zinc-700 dark:text-zinc-300">
                          {b.category}
                        </span>
                        <span className="tabular-nums text-zinc-500">
                          {b.percentage.toFixed(1)}% · {formatCurrency(b.amount, settings.currencySymbol, settings.privacyMode)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${b.percentage}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 flex-shrink-0">
                      {b.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions table */}
        {report.expenses.length > 0 ? (
          <Card className="border-zinc-200/60 dark:border-zinc-800/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Transactions</CardTitle>
                <span className="text-xs text-zinc-500">{report.expenses.length} records</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      {['Date', 'Description', 'Category', 'Type', 'Amount'].map(h => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 last:text-right"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses.slice(0, 20).map(expense => (
                      <tr
                        key={expense.id}
                        className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="py-2.5 pl-4 pr-2 text-xs text-zinc-500 tabular-nums whitespace-nowrap">
                          {expense.date}
                        </td>
                        <td className="py-2.5 px-2 text-zinc-800 dark:text-zinc-200 max-w-[160px] truncate">
                          {expense.description}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon category={expense.category} size="sm" />
                            <span className="text-xs capitalize text-zinc-600 dark:text-zinc-400">
                              {expense.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full font-medium capitalize',
                            expense.type === 'income'  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            expense.type === 'savings' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                                                         'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
                          )}>
                            {expense.type}
                          </span>
                        </td>
                        <td className={cn(
                          'py-2.5 pl-2 pr-4 text-right font-semibold tabular-nums',
                          expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-zinc-800 dark:text-zinc-200',
                        )}>
                          {expense.type === 'income' && !settings.privacyMode ? '+' : ''}
                          {formatCurrency(expense.amount, settings.currencySymbol, settings.privacyMode)}
                        </td>
                      </tr>
                    ))}
                    {report.expenses.length > 20 && (
                      <tr>
                        <td colSpan={5} className="py-3 pl-4 text-xs text-zinc-400 italic">
                          {report.expenses.length - 20} more transactions — export CSV for the full list
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Table className="w-10 h-10 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No transactions in this period</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
