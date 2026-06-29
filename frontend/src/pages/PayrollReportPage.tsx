import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { usePayrollReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  DollarSign, 
  Calendar,
  Users
} from 'lucide-react'

const PayrollReportPage: React.FC = () => {
  const { data: projects } = useProjects()
  
  // Set default to current month (June 2026 based on system time)
  const [month, setMonth] = useState<string>('2026-06')
  const [projectId, setProjectId] = useState<string>('')

  const { data, isLoading } = usePayrollReport({
    month,
    projectId: projectId || undefined
  })

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
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
    if (!data?.payroll || data.payroll.length === 0) return
    const headers = ['Worker Name', 'Trade', 'Days Worked', 'Basic Pay (LKR)', 'Overtime Pay (LKR)', 'Total Payout (LKR)', 'Assigned Sites']
    const rows = data.payroll.map((p: any) => [
      p.workerName,
      p.trade,
      p.days,
      p.basic,
      p.overtime,
      p.total,
      p.projects
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `payroll_report_${month}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Labour Payroll Report - ${month}`)
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
              <h1 className="text-3xl font-black text-white tracking-tight">Workforce Payroll Report</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Calculate basic wages, overtime hours, and compile period-based payroll records from daily attendance logs.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.payroll || data.payroll.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payroll Month/Period</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site Filter</label>
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
        </div>

        {/* Grand Total Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Compiling payroll logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Grand Total Payout</span>
                <span className="block text-3xl font-black text-[#00d2ff]">
                  {formatCurrency(data?.grandTotal || 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Period Payroll Statements</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">WORKER</th>
                      <th className="py-3 px-4">TRADE</th>
                      <th className="py-3 px-4 text-center">DAYS LOGGED</th>
                      <th className="py-3 px-4 text-right">BASIC PAY (LKR)</th>
                      <th className="py-3 px-4 text-right">OVERTIME PAY (LKR)</th>
                      <th className="py-3 px-4 text-right">TOTAL PAYOUT (LKR)</th>
                      <th className="py-3 px-6">SITES ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {data?.payroll?.map((p: any) => (
                      <tr key={p.workerId} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-bold text-white">{p.workerName}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{p.trade}</td>
                        <td className="py-3.5 px-4 text-center text-slate-350 font-semibold">{p.days} days</td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">{formatCurrency(p.basic)}</td>
                        <td className="py-3.5 px-4 text-right text-[#00d2ff] font-semibold">{formatCurrency(p.overtime)}</td>
                        <td className="py-3.5 px-4 text-right text-white font-black text-sm">{formatCurrency(p.total)}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-bold truncate max-w-[200px]" title={p.projects}>{p.projects}</td>
                      </tr>
                    ))}
                    {(!data?.payroll || data.payroll.length === 0) && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-semibold bg-[#0d1322]/70">
                          No payroll data found for the selected period/project.
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

export default PayrollReportPage
