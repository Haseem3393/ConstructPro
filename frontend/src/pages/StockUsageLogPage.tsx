import React, { useState, useMemo } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useUsageLogs } from '../hooks/useInventory'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Filter, 
  Loader2, 
  Calendar, 
  Inbox, 
  AlertTriangle,
  Building,
  ClipboardList
} from 'lucide-react'

const StockUsageLogPage: React.FC = () => {
  // Filter states
  const [selectedProjectId, setSelectedProjectId] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data: usageLogs, isLoading, isFetching } = useUsageLogs({
    projectId: selectedProjectId || undefined,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Compile total usage per material for chart
  const materialUsageTotals = useMemo(() => {
    if (!usageLogs || usageLogs.length === 0) return []

    const map = new Map<string, { quantity: number; unit: string }>()
    usageLogs.forEach((log) => {
      const current = map.get(log.materialName) || { quantity: 0, unit: log.unit }
      map.set(log.materialName, {
        quantity: current.quantity + log.quantity,
        unit: log.unit
      })
    })

    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      quantity: val.quantity,
      unit: val.unit
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5) // top 5
  }, [usageLogs])

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Stock Consumption Logs</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Audit trail of material consumptions logged on construction sites</p>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-500" /> Filter Usage Logs
          </h3>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full max-w-md bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Usage Chart & Summary Cards */}
        {materialUsageTotals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Usage Chart */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Consumed Materials (Quantities)</span>
              </div>
              <div className="space-y-3.5">
                {materialUsageTotals.map((item, index) => {
                  const maxQty = materialUsageTotals[0].quantity
                  const percent = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="text-white font-extrabold">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="w-full bg-[#0a0f1d]/60 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#7c3aed] to-[#00d2ff] h-2 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.3)]"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Summary stats card */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Consumption Triggers</span>
                <span className="text-5xl font-black text-white mt-4 block">
                  {usageLogs?.length || 0}
                </span>
                <span className="text-slate-500 text-xs mt-1 font-bold block">Active stock-out adjustments cataloged on site</span>
              </div>
              <div className="p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl flex items-start space-x-2 mt-4">
                <ClipboardList className="h-4 w-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Usage summaries are populated directly from site-outflow requests, logging locations and dates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Log Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Stock usage registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-[#7c3aed] animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70">
              <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading usage register...</p>
            </div>
          ) : !usageLogs || usageLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No consumption logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-4">PROJECT SITE</th>
                    <th className="py-4 px-4">MATERIAL</th>
                    <th className="py-4 px-4 text-center">QUANTITY USED</th>
                    <th className="py-4 px-4">REASON / CONSUMPTION DETAILS</th>
                    <th className="py-4 px-6 text-right">RECORDED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {usageLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-300">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5">
                          <Building className="h-3.5 w-3.5 text-[#00d2ff] shrink-0" />
                          <span className="font-extrabold text-slate-200">{log.projectName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-white">
                        {log.materialName}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-rose-455 animate-pulse">
                        -{log.quantity.toLocaleString()} {log.unit}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold max-w-[240px] truncate" title={log.description}>
                        {log.description || '-'}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-bold">
                        {log.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default StockUsageLogPage
