import React from 'react'
import { Link } from 'react-router-dom'
import { useBudgetReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

const BudgetReportPage: React.FC = () => {
  const { data: budgetReport, isLoading } = useBudgetReport()

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
    if (!budgetReport || budgetReport.length === 0) return
    const headers = ['Project Name', 'Budget (LKR)', 'Actual Spent (LKR)', 'Variance (LKR)', 'Percentage Used %', 'Status']
    const rows = budgetReport.map((r: any) => [
      r.projectName,
      r.budget,
      r.actual,
      r.variance,
      r.percentUsed.toFixed(1),
      r.overspent ? 'OVERSPENT' : 'ON TRACK'
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `budget_vs_actual_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Budget vs Actual Comparison`)
  }

  // Clustered Bar Chart Math
  const chartWidth = 550
  const chartHeight = 200
  const chartPadding = 30
  
  const projectsData = budgetReport || []
  const maxVal = projectsData.length > 0 
    ? Math.max(...projectsData.flatMap((p: any) => [p.budget, p.actual]), 10000) 
    : 10000

  // Calculate coordinates for clustered bars
  // Group width is (chartWidth - padding*2) / projectCount
  const chartInnerWidth = chartWidth - chartPadding * 2
  const chartInnerHeight = chartHeight - chartPadding * 2
  const groupWidth = projectsData.length > 0 ? chartInnerWidth / projectsData.length : chartInnerWidth
  const barWidth = Math.max(groupWidth * 0.35, 6)
  const gap = groupWidth * 0.1

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
              <h1 className="text-3xl font-black text-white tracking-tight">Budget Comparison Report</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Monitor capital allocations, track total actual expenditures, and detect project budget overruns.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !budgetReport || budgetReport.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Fetching budget summaries...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Clustered Bar Chart Panel */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget vs Actual Spent</h3>
                <div className="flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-[#7c3aed] rounded-sm"></span>
                    <span className="text-slate-400">Capital Budget</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
                    <span className="text-slate-400">Actual Spent</span>
                  </div>
                </div>
              </div>

              {/* Grouped SVG Bar Chart */}
              <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
                {projectsData.length === 0 ? (
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No project budgets set.</p>
                ) : (
                  <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    {/* Y Axis Grid Lines */}
                    <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1={chartPadding} y1={chartPadding + chartInnerHeight / 2} x2={chartWidth - chartPadding} y2={chartPadding + chartInnerHeight / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                    {projectsData.map((p: any, idx: number) => {
                      const groupX = chartPadding + idx * groupWidth
                      const budgetHeight = (p.budget / maxVal) * chartInnerHeight
                      const actualHeight = (p.actual / maxVal) * chartInnerHeight

                      const budgetY = chartHeight - chartPadding - budgetHeight
                      const actualY = chartHeight - chartPadding - actualHeight

                      return (
                        <g key={p.projectId}>
                          {/* Budget Bar */}
                           <rect
                            x={groupX + gap}
                            y={budgetY}
                            width={barWidth}
                            height={budgetHeight}
                            fill="#7c3aed"
                            rx="1.5"
                            className="cursor-pointer transition-all hover:opacity-80"
                          >
                            <title>{`Budget: ${p.budget}`}</title>
                          </rect>
                          {/* Actual Bar */}
                          <rect
                            x={groupX + gap + barWidth + gap / 2}
                            y={actualY}
                            width={barWidth}
                            height={actualHeight}
                            fill={p.overspent ? '#f43f5e' : '#10b981'}
                            rx="1.5"
                            className="cursor-pointer transition-all hover:opacity-80"
                          >
                            <title>{`Actual Spent: ${p.actual}`}</title>
                          </rect>
                        </g>
                      )
                    })}
                  </svg>
                )}
              </div>
              {projectsData.length > 0 && (
                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider px-2 mt-2">
                  <span>{projectsData[0].projectName}</span>
                  <span>{projectsData[projectsData.length - 1].projectName}</span>
                </div>
              )}
            </div>

            {/* Overspent Highlights Alert */}
            {projectsData.some((p: any) => p.overspent) && (
              <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-6 space-y-3 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
                <h3 className="text-sm font-black text-rose-455 uppercase tracking-widest flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-rose-455 animate-pulse" /> Overspent Project Site Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectsData.filter((p: any) => p.overspent).map((p: any) => (
                    <div key={p.projectId} className="bg-[#0a0f1d]/60 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="block font-bold text-white text-xs">{p.projectName}</span>
                        <span className="block text-[10px] text-rose-455 font-bold mt-1">Variance: {formatCurrency(p.variance)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-widest">Budget Spent Rate</span>
                        <span className="block text-sm font-black text-rose-455">{p.percentUsed.toFixed(1)}% Used</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Variance Table */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Cost Variance Ledger (Worst-First)</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">PROJECT SITE</th>
                      <th className="py-3 px-4 text-right">CAPITAL BUDGET</th>
                      <th className="py-3 px-4 text-right">ACTUAL SPENT</th>
                      <th className="py-3 px-4 text-right">VARIANCE (BUDGET - ACTUAL)</th>
                      <th className="py-3 px-6 text-right">PERCENTAGE SPENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {projectsData.map((p: any) => (
                      <tr key={p.projectId} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-bold text-white text-sm">{p.projectName}</td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-semibold">{formatCurrency(p.budget)}</td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-semibold">{formatCurrency(p.actual)}</td>
                        <td className={`py-3.5 px-4 text-right font-black ${p.variance < 0 ? 'text-rose-455' : 'text-emerald-400'}`}>
                          {formatCurrency(p.variance)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            p.percentUsed >= 100 ? 'bg-rose-500/10 text-rose-455 border-rose-500/22' :
                            p.percentUsed >= 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/22' :
                            'bg-emerald-500/10 text-emerald-450 border-emerald-500/22'
                          }`}>
                            {p.percentUsed.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {projectsData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-semibold">
                          No budgets comparative reports logged.
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

export default BudgetReportPage
