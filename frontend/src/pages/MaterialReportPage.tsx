import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useMaterialReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Archive, 
  Calendar,
  AlertTriangle,
  Layers
} from 'lucide-react'

const MaterialReportPage: React.FC = () => {
  const { data: projects } = useProjects()

  // Filters
  const [projectId, setProjectId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data, isLoading } = useMaterialReport({
    projectId: projectId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
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
    if (!data?.materialUsage || data.materialUsage.length === 0) return
    const headers = ['Material Name', 'Used Qty', 'Unit', 'Avg Price (LKR)', 'Total Cost (LKR)']
    const rows = data.materialUsage.map((m: any) => [
      m.name,
      m.usedQty,
      m.unit,
      m.avgPrice.toFixed(2),
      m.totalCost
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `material_usage_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Material Consumptions Audit`)
  }

  // Find max cost for chart scaling
  const mostUsed = data?.mostUsed || []
  const maxCost = mostUsed.length > 0 ? Math.max(...mostUsed.map((m: any) => m.totalCost), 1) : 1

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
              <h1 className="text-3xl font-black text-white tracking-tight">Material Usage Report</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Audit material stock consumptions, calculate wastage rates, and analyze resource budget spends.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.materialUsage || data.materialUsage.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest disabled:opacity-40 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Analyzing inventory stock usage logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Summaries & horizontal bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Cards */}
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Material Outlays</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Material Cost</span>
                    <span className="block text-2xl font-black text-white">{formatCurrency(data?.totalMaterialCost || 0)}</span>
                  </div>
                  <div className="space-y-1 border-t border-white/10 pt-4">
                    <span className="block text-[9px] font-black text-rose-455 uppercase tracking-widest">Estimated Wastage Cost (3.5%)</span>
                    <span className="block text-xl font-extrabold text-rose-455">{formatCurrency(data?.wastageCost || 0)}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0a0f1d]/60 border border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="font-black uppercase tracking-widest text-[9px]">Wastage Safety Threshold</span>
                  <span className="px-2 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/22 uppercase text-[9px] font-black tracking-widest">
                    Safe
                  </span>
                </div>
              </div>

              {/* Most Used Materials SVG Horizontal Bar Chart */}
              <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Most Used Materials (By Value)</h3>
                <div className="flex-1 space-y-4 flex flex-col justify-center">
                  {mostUsed.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center font-bold uppercase tracking-widest">No material transactions recorded in this period.</p>
                  ) : (
                    mostUsed.map((m: any, idx: number) => {
                      const percentage = (m.totalCost / maxCost) * 100
                      return (
                        <div key={m.materialId} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-zinc-300">
                            <span>{m.name}</span>
                            <span>{formatCurrency(m.totalCost)} ({m.usedQty} {m.unit})</span>
                          </div>
                          {/* Custom SVG Horizontal Bar */}
                          <div className="w-full bg-[#0a0f1d]/60 h-3 rounded-full overflow-hidden border border-white/10">
                            <div 
                              className="bg-[#7c3aed] h-full rounded-full transition-all duration-500"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Material Usage Table */}
              <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                  <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Material Usage Ledger</h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                        <th className="py-3 px-6">MATERIAL</th>
                        <th className="py-3 px-4 text-right">QUANTITY USED</th>
                        <th className="py-3 px-4 text-right">AVERAGE UNIT PRICE</th>
                        <th className="py-3 px-6 text-right">TOTAL MATERIAL COST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                      {data?.materialUsage?.map((m: any) => (
                        <tr key={m.materialId} className="hover:bg-white/[0.015] transition-colors group">
                          <td className="py-3.5 px-6 font-bold text-white text-sm">{m.name}</td>
                          <td className="py-3.5 px-4 text-right text-slate-300 font-semibold">{m.usedQty} {m.unit}</td>
                          <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">{formatCurrency(m.avgPrice)}</td>
                          <td className="py-3.5 px-6 text-right text-white font-black text-sm">{formatCurrency(m.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wastage analysis */}
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Wastage Analytics</h3>
                <p className="text-slate-400 text-xs font-semibold leading-normal">
                  Identifies materials with high wastage margins based on standard structural limits (normal standard threshold is &lt;5%).
                </p>
                <div className="space-y-3">
                  {data?.wastageAnalysis?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl text-xs font-bold">
                      No wastage logs computed.
                    </div>
                  ) : (
                    data?.wastageAnalysis?.slice(0, 3).map((w: any, idx: number) => (
                      <div key={idx} className="bg-[#0a0f1d]/60 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-white text-xs">{w.name}</span>
                          <span className="block text-[10px] text-slate-500 font-bold mt-0.5">Wasted: {w.wastageQty.toFixed(1)} {w.unit}</span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest mb-1 border ${
                            w.status === 'HIGH' ? 'bg-rose-500/10 text-rose-455 border-rose-500/22' : 'bg-[#0a0f1d]/60 border border-white/10 text-slate-400'
                          }`}>
                            {w.status}
                          </span>
                          <span className="block text-xs font-black text-rose-455">{formatCurrency(w.wastageCost)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default MaterialReportPage
