import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMachineryDetails, useUpdateMachineryStatus } from '../hooks/useMachinery'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Calendar, 
  Loader2, 
  AlertTriangle,
  Cpu,
  Wrench,
  Activity,
  History,
  Building,
  User,
  Plus,
  Lock
} from 'lucide-react'

const MachineryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { data: machinery, isLoading, isError } = useMachineryDetails(id || '')
  const updateStatusMutation = useUpdateMachineryStatus(id || '')

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const isEditor = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'
  const isSupervisorOrBetter = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' || user?.role === 'SUPERVISOR'

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync(newStatus)
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  // Compile cost trend chart points (sorted chronologically)
  const chartPoints = useMemo(() => {
    if (!machinery?.usages || machinery.usages.length === 0) return []

    const sortedUsages = [...machinery.usages].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let cumulativeCost = 0
    const historyPoints = sortedUsages.map((u) => {
      cumulativeCost += u.totalCost
      return {
        date: new Date(u.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        cost: cumulativeCost
      }
    })

    return [{ date: 'Start', cost: 0 }, ...historyPoints]
  }, [machinery])

  // SVG Line Path calculation
  const svgPath = useMemo(() => {
    if (chartPoints.length < 2) return ''
    const width = 500
    const height = 150
    const padding = 15

    const maxCost = Math.max(...chartPoints.map((p) => p.cost), 10000)

    const points = chartPoints.map((p, index) => {
      const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2)
      const y = height - padding - (p.cost / maxCost) * (height - padding * 2)
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [chartPoints])

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Synchronizing fleet details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !machinery) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-450 animate-bounce" />
          <p className="font-extrabold text-sm uppercase tracking-widest">Asset Registry Error</p>
          <p className="text-xs text-slate-400 font-semibold">The machinery equipment details could not be found.</p>
          <Link to="/machinery" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 uppercase tracking-widest cursor-pointer">
            Back to Registry
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const isLockedFromUsage = machinery.status === 'MAINTENANCE' || machinery.status === 'INACTIVE'
  const maxCostVal = Math.max(...chartPoints.map((p) => p.cost), 10000)

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <Link
            to="/machinery"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Fleet Registry
          </Link>

          <div className="flex items-center gap-2">
            {/* Log Usage Button (ADMIN, PM, SUPERVISOR) */}
            {isSupervisorOrBetter && (
              isLockedFromUsage ? (
                <button
                  disabled
                  title={`Machine cannot be logged for usage because its status is ${machinery.status}`}
                  className="inline-flex items-center px-4 py-2 bg-zinc-800/80 border border-white/5 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Log Usage
                </button>
              ) : (
                <Link
                  to={`/machinery/${machinery.id}/usage`}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Log Usage
                </Link>
              )
            )}

            {/* Log Maintenance Button (ADMIN, PM only) */}
            {isEditor && (
              <Link
                to={`/machinery/${machinery.id}/maintenance`}
                className="inline-flex items-center px-4 py-2 bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 text-[#00d2ff] border border-[#7c3aed]/22 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                <Wrench className="h-4 w-4 mr-1.5" />
                Log Maintenance
              </Link>
            )}
          </div>
        </div>

        {/* Machinery Header Profile Details */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/22 flex items-center justify-center text-[#00d2ff] shrink-0">
              <Cpu className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{machinery.name}</h1>
                <span className="text-[10px] font-black text-[#00d2ff] uppercase tracking-widest bg-[#7c3aed]/10 border border-[#7c3aed]/22 px-2 py-0.5 rounded">
                  {machinery.ownership}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 font-semibold">{machinery.brand || 'Generic Brand'}</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2.5">
                Standard billing rate: <span className="text-[#00d2ff] font-extrabold">{formatCurrency(machinery.rate)} / {machinery.paymentType.toLowerCase()}</span>
              </p>
              {machinery.ownership === 'HIRED' && (
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                  Hire Provider: <span className="text-slate-350 font-extrabold">{machinery.hireSource}</span>
                </p>
              )}
            </div>
          </div>

          {/* Status Select Toggle */}
          <div className="flex flex-col justify-center shrink-0 min-w-[200px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Machine Status Indicator</label>
            {isEditor ? (
              <div className="relative">
                <select
                  value={machinery.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updateStatusMutation.isPending}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 cursor-pointer disabled:opacity-50 text-slate-200"
                >
                  <option value="ACTIVE" className="text-emerald-400">Active (Available)</option>
                  <option value="INACTIVE" className="text-slate-400">Inactive (Unavailable)</option>
                  <option value="MAINTENANCE" className="text-amber-400">Maintenance (Repairs)</option>
                </select>
                {updateStatusMutation.isPending && (
                  <span className="absolute right-8 top-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#7c3aed]" />
                  </span>
                )}
              </div>
            ) : (
              <div className="py-2.5">
                {machinery.status === 'ACTIVE' && (
                  <span className="inline-flex px-3 py-1 rounded text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
                    Active
                  </span>
                )}
                {machinery.status === 'MAINTENANCE' && (
                  <span className="inline-flex px-3 py-1 rounded text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/22">
                    Maintenance
                  </span>
                )}
                {machinery.status === 'INACTIVE' && (
                  <span className="inline-flex px-3 py-1 rounded text-xs font-black uppercase tracking-widest bg-zinc-500/10 text-slate-400 border border-white/10">
                    Inactive
                  </span>
                )}
              </div>
            )}
            {isLockedFromUsage && (
              <p className="text-[10px] text-rose-455 mt-2 font-bold flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                Locked from logging new usages
              </p>
            )}
          </div>
        </div>

        {/* Dashboard Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Assigned Project */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Project Assignment</span>
              <span className="block text-lg font-black text-white truncate max-w-[170px]">{machinery.currentProject}</span>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/22">
              <Building className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Usage This Month */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Fleet Usage This Month</span>
              <span className="block text-2xl font-black text-emerald-400">
                {machinery.stats?.totalUsageThisMonth || 0}
                <span className="text-slate-400 text-xs font-bold uppercase ml-1.5">{machinery.paymentType.toLowerCase()}s</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/22">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Cumulative Usage Costs */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Log Expenses This Month</span>
              <span className="block text-2xl font-black text-[#00d2ff]">
                {formatCurrency(machinery.stats?.totalCostThisMonth || 0)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#7c3aed]/10 text-violet-400 border border-[#7c3aed]/22">
              <History className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Visual Cost Trend Line Chart */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Project Expense Curve</span>
          {chartPoints.length < 2 ? (
            <div className="h-28 flex items-center justify-center text-xs text-slate-500 font-bold">
              Not enough usage records to plot expense curve.
            </div>
          ) : (
            <div>
              <svg viewBox="0 0 500 150" className="w-full overflow-visible">
                {/* Grid Lines */}
                <line x1="15" y1="15" x2="485" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3" />
                <line x1="15" y1="135" x2="485" y2="135" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                
                {/* SVG Line Graph */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#00d2ff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_4px_12px_rgba(0,210,255,0.25)]"
                />

                {/* Chart Dots */}
                {chartPoints.map((p, index) => {
                  const width = 500
                  const height = 150
                  const padding = 15
                  const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2)
                  const y = height - padding - (p.cost / maxCostVal) * (height - padding * 2)
                  return (
                    <g key={index} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#0d1322"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        className="hover:r-6 hover:fill-[#00d2ff] transition-all"
                      />
                      <title>{`${p.date}: ${formatCurrency(p.cost)}`}</title>
                    </g>
                  )
                })}
              </svg>
              <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase tracking-wider mt-2.5">
                <span>{chartPoints[0].date}</span>
                <span>{chartPoints[chartPoints.length - 1].date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Usage and Maintenance Log Ledgers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Ledger */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Usage Logs History
              </h3>
            </div>

            {!machinery.usages || machinery.usages.length === 0 ? (
              <div className="p-12 text-center text-slate-505 text-xs font-bold bg-[#0d1322]/70">
                No usage logs recorded for this machine.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-4">PROJECT</th>
                      <th className="py-3 px-4 text-center">DURATION</th>
                      <th className="py-3 px-4 text-right">TOTAL COST</th>
                      <th className="py-3 px-6">OPERATOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {machinery.usages.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-semibold">{formatDate(u.date)}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{u.project?.name}</td>
                        <td className="py-3.5 px-4 text-center text-slate-300 font-bold">
                          {u.hoursUsed !== null ? `${u.hoursUsed} hrs` : `${u.daysUsed} days`}
                        </td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-black tabular-nums">
                          {formatCurrency(u.totalCost)}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-semibold">{u.operatorName || 'System / Default'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Maintenance Ledger */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-amber-450 uppercase tracking-widest flex items-center gap-1.5">
                <Wrench className="h-4 w-4" /> Maintenance Services
              </h3>
            </div>

            {!machinery.maintenances || machinery.maintenances.length === 0 ? (
              <div className="p-12 text-center text-slate-505 text-xs font-bold bg-[#0d1322]/70">
                No maintenance records logged in the system.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-4">PROJECT CHARGED</th>
                      <th className="py-3 px-4 text-right">COST (LKR)</th>
                      <th className="py-3 px-4">DESCRIPTION</th>
                      <th className="py-3 px-6">TECHNICIAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {machinery.maintenances.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-semibold">{formatDate(m.date)}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{m.project?.name}</td>
                        <td className="py-3.5 px-4 text-right text-amber-400 font-black tabular-nums">
                          {formatCurrency(m.cost)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-[180px] truncate leading-normal" title={m.description}>
                          {m.description}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-semibold">{m.doneBy || 'Generic Agent'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default MachineryDetailsPage
