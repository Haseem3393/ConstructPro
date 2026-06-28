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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/reports" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hub
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Material Usage Report</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Audit material stock consumptions, calculate wastage rates, and analyze resource budget spends.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.materialUsage || data.materialUsage.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Project Site Filter</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Analyzing inventory stock usage logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Summaries & horizontal bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Cards */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Material Outlays</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Total Material Cost</span>
                    <span className="block text-2xl font-black text-white">{formatCurrency(data?.totalMaterialCost || 0)}</span>
                  </div>
                  <div className="space-y-1 border-t border-zinc-850 pt-4">
                    <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider text-rose-455">Estimated Wastage Cost (3.5%)</span>
                    <span className="block text-xl font-extrabold text-rose-400">{formatCurrency(data?.wastageCost || 0)}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-between text-[10px] font-bold text-zinc-400">
                  <span>Wastage Safety Threshold</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase text-[9px] font-black">
                    Safe
                  </span>
                </div>
              </div>

              {/* Most Used Materials SVG Horizontal Bar Chart */}
              <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Most Used Materials (By Value)</h3>
                <div className="flex-1 space-y-4 flex flex-col justify-center">
                  {mostUsed.length === 0 ? (
                    <p className="text-xs text-zinc-550 py-4 text-center">No material transactions recorded in this period.</p>
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
                          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
                            <div 
                              className="bg-violet-600 h-full rounded-full transition-all duration-500"
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
              <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30">
                  <h3 className="font-extrabold text-sm text-zinc-350">Material Usage Ledger</h3>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                        <th className="py-3 px-6">MATERIAL</th>
                        <th className="py-3 px-4 text-right">QUANTITY USED</th>
                        <th className="py-3 px-4 text-right">AVERAGE UNIT PRICE</th>
                        <th className="py-3 px-6 text-right">TOTAL MATERIAL COST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs">
                      {data?.materialUsage?.map((m: any) => (
                        <tr key={m.materialId} className="hover:bg-[#1a1c27]/20 transition-colors">
                          <td className="py-3.5 px-6 font-bold text-white">{m.name}</td>
                          <td className="py-3.5 px-4 text-right text-zinc-300 font-semibold">{m.usedQty} {m.unit}</td>
                          <td className="py-3.5 px-4 text-right text-zinc-400 font-semibold">{formatCurrency(m.avgPrice)}</td>
                          <td className="py-3.5 px-6 text-right text-white font-black text-sm">{formatCurrency(m.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wastage analysis */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Wastage Analytics</h3>
                <p className="text-zinc-455 text-xs leading-normal">
                  Identifies materials with high wastage margins based on standard structural limits (normal standard threshold is &lt;5%).
                </p>
                <div className="space-y-3">
                  {data?.wastageAnalysis?.length === 0 ? (
                    <div className="p-8 text-center text-zinc-550 border border-dashed border-zinc-800 rounded-lg text-xs font-bold">
                      No wastage logs computed.
                    </div>
                  ) : (
                    data?.wastageAnalysis?.slice(0, 3).map((w: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-white text-xs">{w.name}</span>
                          <span className="block text-[10px] text-zinc-500 font-semibold mt-0.5">Wasted: {w.wastageQty.toFixed(1)} {w.unit}</span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider mb-1 ${
                            w.status === 'HIGH' ? 'bg-rose-500/15 text-rose-400' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {w.status}
                          </span>
                          <span className="block text-xs font-black text-rose-400">{formatCurrency(w.wastageCost)}</span>
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
