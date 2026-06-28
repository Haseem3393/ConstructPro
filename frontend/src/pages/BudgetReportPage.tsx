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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/reports" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hub
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Budget Comparison Report</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Monitor capital allocations, track total actual expenditures, and detect project budget overruns.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !budgetReport || budgetReport.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Fetching budget summaries...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Clustered Bar Chart Panel */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Budget vs Actual Spent (Grouped comparison)</h3>
                <div className="flex items-center space-x-4 text-[10px] font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-violet-600 rounded-sm"></span>
                    <span className="text-zinc-400">Capital Budget</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
                    <span className="text-zinc-400">Actual Spent</span>
                  </div>
                </div>
              </div>

              {/* Grouped SVG Bar Chart */}
              <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
                {projectsData.length === 0 ? (
                  <p className="text-xs text-zinc-500">No project budgets set.</p>
                ) : (
                  <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    {/* Y Axis Grid Lines */}
                    <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1={chartPadding} y1={chartPadding + chartInnerHeight / 2} x2={chartWidth - chartPadding} y2={chartPadding + chartInnerHeight / 2} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#27272a" strokeWidth="0.5" />

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
                            fill="#8b5cf6"
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
                            fill={p.overspent ? '#ef4444' : '#10b981'}
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
                <div className="flex justify-between text-[8px] text-zinc-550 font-bold uppercase tracking-wider px-2 mt-2">
                  <span>{projectsData[0].projectName}</span>
                  <span>{projectsData[projectsData.length - 1].projectName}</span>
                </div>
              )}
            </div>

            {/* Overspent Highlights Alert */}
            {projectsData.some((p: any) => p.overspent) && (
              <div className="bg-rose-500/10 border border-rose-550/20 rounded-xl p-6 space-y-3 shadow-xl">
                <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-rose-400" /> Overspent Project Site Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectsData.filter((p: any) => p.overspent).map((p: any) => (
                    <div key={p.projectId} className="bg-[#1d1b24]/40 border border-rose-500/10 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="block font-bold text-white text-xs">{p.projectName}</span>
                        <span className="block text-[10px] text-rose-400 font-bold mt-1">Variance: {formatCurrency(p.variance)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-zinc-500 font-bold uppercase">Budget Spent Rate</span>
                        <span className="block text-sm font-black text-rose-400">{p.percentUsed.toFixed(1)}% Used</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Variance Table */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30 flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-zinc-350">Cost Variance Ledger (Worst-First)</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                      <th className="py-3 px-6">PROJECT SITE</th>
                      <th className="py-3 px-4 text-right">CAPITAL BUDGET</th>
                      <th className="py-3 px-4 text-right">ACTUAL SPENT</th>
                      <th className="py-3 px-4 text-right">VARIANCE (BUDGET - ACTUAL)</th>
                      <th className="py-3 px-6 text-right">PERCENTAGE SPENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {projectsData.map((p: any) => (
                      <tr key={p.projectId} className="hover:bg-[#1a1c27]/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-white text-sm">{p.projectName}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-300 font-semibold">{formatCurrency(p.budget)}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-300 font-semibold">{formatCurrency(p.actual)}</td>
                        <td className={`py-3.5 px-4 text-right font-black ${p.variance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatCurrency(p.variance)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${
                            p.percentUsed >= 100 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            p.percentUsed >= 80 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {p.percentUsed.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {projectsData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-550 text-xs font-semibold">
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
