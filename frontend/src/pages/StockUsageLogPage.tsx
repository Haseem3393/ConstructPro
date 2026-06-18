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
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Stock Consumption Logs</h1>
          <p className="text-zinc-400 text-sm mt-1">Audit trail of material consumptions logged on construction sites</p>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-zinc-450 text-xs font-bold uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-zinc-555" /> Filter Usage Logs
          </h3>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full max-w-md bg-[#1c1d26] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 cursor-pointer"
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
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Top Consumed Materials (Quantities)</span>
              </div>
              <div className="space-y-3.5">
                {materialUsageTotals.map((item, index) => {
                  const maxQty = materialUsageTotals[0].quantity
                  const percent = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-300">{item.name}</span>
                        <span className="text-white font-black">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="w-full bg-[#1b1e28] rounded-full h-2">
                        <div
                          className="bg-violet-600 h-2 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Summary stats card */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-black text-zinc-550 uppercase tracking-widest">Total Consumption Triggers</span>
                <span className="text-5xl font-black text-white mt-4 block">
                  {usageLogs?.length || 0}
                </span>
                <span className="text-zinc-500 text-xs mt-1 block">Active stock-out adjustments cataloged on site</span>
              </div>
              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg flex items-start space-x-2 mt-4">
                <ClipboardList className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                  Usage summaries are populated directly from site-outflow requests, logging locations and dates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Log Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-350">Stock usage registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading usage register...</p>
            </div>
          ) : !usageLogs || usageLogs.length === 0 ? (
            <div className="p-16 text-center text-zinc-550 text-xs font-semibold">
              No consumption logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-4">PROJECT SITE</th>
                    <th className="py-4 px-4">MATERIAL</th>
                    <th className="py-4 px-4 text-center">QUANTITY USED</th>
                    <th className="py-4 px-4">REASON / CONSUMPTION DETAILS</th>
                    <th className="py-4 px-6 text-right">RECORDED BY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {usageLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-300">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5">
                          <Building className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                          <span className="font-bold text-zinc-200">{log.projectName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {log.materialName}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-rose-400">
                        -{log.quantity.toLocaleString()} {log.unit}
                      </td>
                      <td className="py-4 px-4 text-zinc-400 max-w-[240px] truncate" title={log.description}>
                        {log.description || '-'}
                      </td>
                      <td className="py-4 px-6 text-right text-zinc-500 font-semibold">
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
