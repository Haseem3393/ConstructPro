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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/reports" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hub
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Workforce Payroll Report</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Calculate basic wages, overtime hours, and compile period-based payroll records from daily attendance logs.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.payroll || data.payroll.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Payroll Month/Period</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-655 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Project Site Filter</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-655 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Compiling payroll logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest">Grand Total Payout</span>
                <span className="block text-3xl font-black text-violet-400">
                  {formatCurrency(data?.grandTotal || 0)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/15">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
                <h3 className="font-extrabold text-sm text-zinc-350">Period Payroll Statements</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                      <th className="py-3 px-6">WORKER</th>
                      <th className="py-3 px-4">TRADE</th>
                      <th className="py-3 px-4 text-center">DAYS LOGGED</th>
                      <th className="py-3 px-4 text-right">BASIC PAY (LKR)</th>
                      <th className="py-3 px-4 text-right">OVERTIME PAY (LKR)</th>
                      <th className="py-3 px-4 text-right">TOTAL PAYOUT (LKR)</th>
                      <th className="py-3 px-6">SITES ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {data?.payroll?.map((p: any) => (
                      <tr key={p.workerId} className="hover:bg-[#1a1c27]/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-white">{p.workerName}</td>
                        <td className="py-3.5 px-4 text-zinc-300 font-semibold">{p.trade}</td>
                        <td className="py-3.5 px-4 text-center text-zinc-350 font-semibold">{p.days} days</td>
                        <td className="py-3.5 px-4 text-right text-zinc-400 font-semibold">{formatCurrency(p.basic)}</td>
                        <td className="py-3.5 px-4 text-right text-violet-400 font-semibold">{formatCurrency(p.overtime)}</td>
                        <td className="py-3.5 px-4 text-right text-white font-black text-sm">{formatCurrency(p.total)}</td>
                        <td className="py-3.5 px-6 text-zinc-500 font-medium truncate max-w-[200px]" title={p.projects}>{p.projects}</td>
                      </tr>
                    ))}
                    {(!data?.payroll || data.payroll.length === 0) && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-550 text-xs font-semibold">
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
