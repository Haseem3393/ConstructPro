import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useExpenseReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  DollarSign, 
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react'

const ExpenseReportPage: React.FC = () => {
  const { data: projects } = useProjects()
  
  // Filter states
  const [projectId, setProjectId] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data, isLoading } = useExpenseReport({
    projectId: projectId || undefined,
    category: category || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  })

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const logDownload = (reportName: string) => {
    const saved = localStorage.getItem('constructpro_reports_history')
    const history = saved ? JSON.parse(saved) : []
    const newItem = {
      id: Date.now().toString(),
      name: reportName,
      format: 'CSV',
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('constructpro_reports_history', JSON.stringify([newItem, ...history]))
  }

  const handleExport = () => {
    if (!data?.expenses || data.expenses.length === 0) return
    const headers = ['Date', 'Project', 'Category', 'Description', 'Reference/Invoice', 'Amount (LKR)', 'Type']
    const rows = data.expenses.map((e: any) => [
      new Date(e.date).toLocaleDateString(),
      e.project?.name || '',
      e.category,
      e.description || '',
      e.reference || '',
      e.amount,
      e.isAuto ? 'AUTO' : 'MANUAL'
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `expenses_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Expenses & Accounts Audit`)
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Title */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/reports" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hub
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Expense & Accounts Report</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Audit cash outflows, subcontractor bills, material receipts, and track unpaid balances.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.expenses || data.expenses.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Expense Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
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
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Aggregate Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Synthesizing accounts ledger...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Expense</span>
                <span className="block text-2xl font-black text-white">{formatCurrency(data?.totalAmount || 0)}</span>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-emerald-450 uppercase tracking-widest">Paid Amount</span>
                <span className="block text-2xl font-black text-emerald-400">{formatCurrency(data?.paid || 0)}</span>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-rose-455 uppercase tracking-widest">Outstanding Balance</span>
                <span className="block text-2xl font-black text-rose-455">{formatCurrency(data?.balance || 0)}</span>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Transaction History</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-4">PROJECT</th>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">REFERENCE</th>
                      <th className="py-3 px-4 text-right">AMOUNT (LKR)</th>
                      <th className="py-3 px-6 text-center">TYPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {data?.expenses?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-semibold">{formatDate(e.date)}</td>
                        <td className="py-3.5 px-4 font-semibold">{e.project?.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase bg-[#0a0f1d]/60 text-slate-400 border border-white/10 tracking-widest">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 truncate max-w-[200px]" title={e.description || ''}>
                          <span className="block font-medium truncate">{e.description || 'No description'}</span>
                          {e.reference && (
                            <span className="text-[9px] text-[#00d2ff] font-bold uppercase tracking-widest">Ref: {e.reference}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-white font-black text-sm">{formatCurrency(e.amount)}</td>
                        <td className="py-3.5 px-6 text-center">
                          {e.isAuto ? (
                            <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/22">
                              Auto
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black tracking-widest bg-[#0a0f1d]/60 border border-white/10 text-slate-400">
                              Manual
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!data?.expenses || data.expenses.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-semibold bg-[#0d1322]/70">
                          No expenses matching the criteria found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ExpenseReportPage
