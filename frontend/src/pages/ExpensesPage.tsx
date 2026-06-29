import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExpensesList } from '../hooks/useFinance'
import { useProjects } from '../hooks/useProjects'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Download, 
  Loader2, 
  Search, 
  Building, 
  Tag, 
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

const ExpensesPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filter States
  const [projectId, setProjectId] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data, isLoading, isError } = useExpensesList({
    projectId: projectId || undefined,
    category: category || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const exportToCSV = () => {
    if (!data?.expenses || data.expenses.length === 0) return

    const headers = ['Date', 'Project', 'Category', 'Description', 'Reference/Invoice', 'Amount (LKR)', 'Added By', 'Type']
    const rows = data.expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.project?.name || '',
      e.category,
      e.description || '',
      e.reference || '',
      e.amount,
      e.createdBy?.name || 'System',
      e.isAuto ? 'AUTO' : 'MANUAL'
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `expenses_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Expenses Ledger</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Audit construction expenditures, labour payroll allocations, and equipment usages</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={exportToCSV}
              disabled={!data?.expenses || data.expenses.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-400 hover:text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>

            {isEditable && (
              <Link
                to="/expenses/new"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Link>
            )}
          </div>
        </div>

        {/* Total Sum Display */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="space-y-1">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Aggregate Cumulative Expense</span>
            <span className="block text-3xl font-black text-[#00d2ff]">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed] inline-block" />
              ) : (
                formatCurrency(data?.totalAmount || 0)
              )}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Filter */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="LABOUR">Labour & Payroll</option>
                <option value="MATERIAL">Materials & Stock</option>
                <option value="EQUIPMENT">Machinery & Equipment</option>
                <option value="SUBCONTRACTOR">Subcontractor Bills</option>
                <option value="TRANSPORT">Transport & Delivery</option>
                <option value="OTHER">Other Expenses</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Expenses List Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing accounts ledger...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load project expenses records.
          </div>
        ) : !data?.expenses || data.expenses.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            No expenses found matching the selected filters.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3 px-6">DATE</th>
                    <th className="py-3 px-4">PROJECT</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">DESCRIPTION / REF</th>
                    <th className="py-3 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-3 px-4">ADDED BY</th>
                    <th className="py-3 px-6 text-center">TYPE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {data.expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-6 font-semibold text-slate-300">{formatDate(e.date)}</td>
                      
                      {/* Project */}
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">{e.project?.name}</td>
                      
                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#0a0f1d]/60 text-slate-300 border border-white/10 rounded-lg">
                          {e.category}
                        </span>
                      </td>

                      {/* Description / Reference */}
                      <td className="py-3.5 px-4 text-slate-400 max-w-[240px] truncate leading-normal" title={e.description || ''}>
                        <span className="block text-slate-300 truncate font-semibold">{e.description || 'No description provided'}</span>
                        {e.reference && (
                          <span className="inline-block mt-0.5 text-[10px] text-[#00d2ff] font-black uppercase tracking-wide bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-1.5 py-0.2 rounded-lg">
                            Invoice: {e.reference}
                          </span>
                        )}
                        {e.receiptUrl && (
                          <span className="block mt-0.5 text-[9px] text-slate-500 font-bold">
                            📎 {e.receiptUrl}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right text-[#00d2ff] font-black text-sm tabular-nums">
                        {formatCurrency(e.amount)}
                      </td>

                      {/* Added By */}
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">
                        {e.createdBy?.name || 'System / Batch'}
                      </td>

                      {/* Type (AUTO vs MANUAL) */}
                      <td className="py-3.5 px-6 text-center">
                        {e.isAuto ? (
                          <span className="inline-flex px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22 rounded-lg">
                            Auto
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-[#0a0f1d]/60 text-slate-400 border border-white/10 rounded-lg">
                            Manual
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ExpensesPage
