import React from 'react'
import { Link } from 'react-router-dom'
import { useMachineryReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Truck,
  Wrench,
  DollarSign,
  PieChart
} from 'lucide-react'

const MachineryReportPage: React.FC = () => {
  const { data, isLoading } = useMachineryReport()

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
    if (!data?.machinery || data.machinery.length === 0) return
    const headers = ['Machine Name', 'Brand', 'Ownership', 'Hours Used', 'Total Cost (LKR)', 'Projects Active']
    const rows = data.machinery.map((m: any) => [
      m.name,
      m.brand || 'N/A',
      m.ownership,
      m.hoursUsed.toFixed(1),
      m.cost,
      m.projects
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `machinery_usage_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Machinery & Equipment Audit`)
  }

  // Owned vs Hired Cost calculations for Split Progress Bar
  const ownedCost = data?.ownedCost || 0
  const hiredCost = data?.hiredCost || 0
  const totalCost = ownedCost + hiredCost
  const ownedPercentage = totalCost > 0 ? (ownedCost / totalCost) * 100 : 0
  const hiredPercentage = totalCost > 0 ? (hiredCost / totalCost) * 100 : 0

  // Most used equipment chart (top 3 by hours)
  const machineryList = data?.machinery || []
  const topUsed = [...machineryList]
    .sort((a, b) => b.hoursUsed - a.hoursUsed)
    .slice(0, 3)

  const maxHours = topUsed.length > 0 ? Math.max(...topUsed.map((m: any) => m.hoursUsed), 1) : 1

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
              <h1 className="text-3xl font-black text-white tracking-tight">Machinery Usage Report</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Audit equipment hours, rental cost profiles, and evaluate owned asset operations vs hired rentals.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.machinery || data.machinery.length === 0}
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
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Compiling machinery performance records...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Summaries & SVG charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Owned vs Rented Cost Comparison */}
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <PieChart className="h-4 w-4 mr-1 text-[#00d2ff]" /> Owned vs Hired Cost Split
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#00d2ff]">Owned ({ownedPercentage.toFixed(1)}%)</span>
                    <span className="text-pink-400">Hired ({hiredPercentage.toFixed(1)}%)</span>
                  </div>
                  {/* Custom SVG Dual Progress Bar */}
                  <div className="w-full bg-[#0a0f1d]/60 h-3 rounded-full overflow-hidden flex border border-white/10">
                    <div className="bg-[#7c3aed] h-full" style={{ width: `${ownedPercentage}%` }}></div>
                    <div className="bg-pink-500 h-full" style={{ width: `${hiredPercentage}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] pt-4 border-t border-white/10 font-bold">
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest">Owned Usage cost</span>
                    <span className="text-white text-xs font-extrabold">{formatCurrency(ownedCost)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest">Hired usage cost</span>
                    <span className="text-white text-xs font-extrabold">{formatCurrency(hiredCost)}</span>
                  </div>
                </div>
              </div>

              {/* Most Used Equipment Horizontal Bar Chart */}
              <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Most Used Machinery (By Hours)</h3>
                <div className="flex-1 space-y-4 flex flex-col justify-center">
                  {topUsed.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center font-bold uppercase tracking-widest">No machinery usages logged.</p>
                  ) : (
                    topUsed.map((m: any) => {
                      const percentage = (m.hoursUsed / maxHours) * 100
                      return (
                        <div key={m.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-zinc-300">
                            <span>{m.name} ({m.brand || 'N/A'})</span>
                            <span>{m.hoursUsed.toFixed(1)} hours ({formatCurrency(m.cost)})</span>
                          </div>
                          {/* Custom SVG Horizontal Bar */}
                          <div className="w-full bg-[#0a0f1d]/60 h-3 rounded-full overflow-hidden border border-white/10">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                m.ownership === 'OWNED' ? 'bg-[#7c3aed]' : 'bg-pink-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Machinery Usage Registry */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Equipment Fleet Usage Ledger</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">EQUIPMENT</th>
                      <th className="py-3 px-4">BRAND</th>
                      <th className="py-3 px-4">OWNERSHIP</th>
                      <th className="py-3 px-4 text-center">HOURS OPERATED</th>
                      <th className="py-3 px-4 text-right">ACCUMULATED COSTS</th>
                      <th className="py-3 px-6">ACTIVE SITES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {machineryList.map((m: any) => (
                      <tr key={m.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-bold text-white text-sm">{m.name}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{m.brand || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            m.ownership === 'OWNED' 
                              ? 'bg-[#7c3aed]/10 text-[#00d2ff] border-[#7c3aed]/22' 
                              : 'bg-pink-500/10 text-pink-400 border border-pink-500/22'
                          }`}>
                            {m.ownership}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-350 font-bold">{m.hoursUsed.toFixed(1)} hrs</td>
                        <td className="py-3.5 px-4 text-right text-white font-black text-sm">{formatCurrency(m.cost)}</td>
                        <td className="py-3.5 px-6 text-slate-400 font-bold truncate max-w-[200px]" title={m.projects}>{m.projects || 'N/A'}</td>
                      </tr>
                    ))}
                    {machineryList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-semibold bg-[#0d1322]/70">
                          No machinery fleet items cataloged.
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

export default MachineryReportPage
