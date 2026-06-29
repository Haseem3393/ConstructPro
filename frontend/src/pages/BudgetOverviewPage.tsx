import React from 'react'
import { Link } from 'react-router-dom'
import { useBudgetOverview } from '../hooks/useFinance'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  TrendingDown,
  Building,
  CheckCircle,
  AlertOctagon,
  ArrowRight
} from 'lucide-react'

const BudgetOverviewPage: React.FC = () => {
  const { data: budgets, isLoading, isError } = useBudgetOverview()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            On Track
          </span>
        )
      case 'WARNING':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/22">
            Warning
          </span>
        )
      case 'CRITICAL':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Critical
          </span>
        )
      case 'OVERSPENT':
        return (
          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-605/90 text-white border border-rose-505/22 animate-pulse">
            Overspent
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/22">
            Unknown
          </span>
        )
    }
  }

  // Compile totals and alerts
  const stats = React.useMemo(() => {
    if (!budgets) return { totalBudget: 0, totalSpent: 0, criticalCount: 0, overspentCount: 0 }
    
    let totalBudget = 0
    let totalSpent = 0
    let criticalCount = 0
    let overspentCount = 0

    budgets.forEach(b => {
      totalBudget += b.budget
      totalSpent += b.spent
      if (b.status === 'CRITICAL') criticalCount++
      if (b.status === 'OVERSPENT') overspentCount++
    })

    return { totalBudget, totalSpent, criticalCount, overspentCount }
  }, [budgets])

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Project Budget Tracker</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Monitor budget limits, active expenditures, and cash depletion status across all project sites</p>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Portfolio Budget */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Portfolio Budget</span>
              <span className="block text-xl font-black text-white">
                {isLoading ? '...' : formatCurrency(stats.totalBudget)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Portfolio Spent */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Portfolio Spent</span>
              <span className="block text-xl font-black text-[#00d2ff]">
                {isLoading ? '...' : formatCurrency(stats.totalSpent)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/22">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Critical Warnings */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical Alert Sites</span>
              <span className="block text-2xl font-black text-amber-500">{stats.criticalCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/22">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Overspent Projects */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Overspent Sites</span>
              <span className="block text-2xl font-black text-rose-455">{stats.overspentCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-450 border border-rose-500/22">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Budget overview warnings banner */}
        {(stats.criticalCount > 0 || stats.overspentCount > 0) && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded-xl text-xs font-bold flex items-start space-x-3">
            <AlertOctagon className="h-5 w-5 shrink-0 text-rose-455 animate-bounce" />
            <div>
              <p className="uppercase tracking-widest font-black">⚠️ Budget Attention Required</p>
              <p className="text-slate-400 font-medium normal-case mt-0.5">
                {stats.overspentCount > 0 && `${stats.overspentCount} site(s) have exceeded their budget caps. `}
                {stats.criticalCount > 0 && `${stats.criticalCount} site(s) are utilizing more than 80% of allocated capital reserves.`}
              </p>
            </div>
          </div>
        )}

        {/* Budget List Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Computing project spent balances...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-505/22 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
            Failed to fetch projects budget data.
          </div>
        ) : budgets?.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold uppercase tracking-widest bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            No projects found in system registry.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3.5 px-6">PROJECT</th>
                    <th className="py-3.5 px-4 text-right">TOTAL BUDGET</th>
                    <th className="py-3.5 px-4 text-right">SPENT SO FAR</th>
                    <th className="py-3.5 px-4 text-right">REMAINING CAP</th>
                    <th className="py-3.5 px-6">CAPITAL DRAIN %</th>
                    <th className="py-3.5 px-4">BUDGET STATUS</th>
                    <th className="py-3.5 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs text-slate-350">
                  {budgets?.map((b) => {
                    const isOver = b.percentUsed > 100
                    const isCritical = b.percentUsed >= 80 && b.percentUsed <= 100
                    const isWarning = b.percentUsed >= 50 && b.percentUsed < 80
 
                    let barColor = 'bg-[#7c3aed]'
                    let textColor = 'text-slate-400'
                    if (isOver) {
                      barColor = 'bg-rose-600'
                      textColor = 'text-rose-455'
                    } else if (isCritical) {
                      barColor = 'bg-rose-500'
                      textColor = 'text-rose-450'
                    } else if (isWarning) {
                      barColor = 'bg-amber-500'
                      textColor = 'text-amber-500'
                    }
 
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.015] transition-colors group">
                        {/* Project Name */}
                        <td className="py-4 px-6 font-extrabold text-white">
                          <Link to={`/budget/${b.id}`} className="hover:text-[#00d2ff] transition-colors">
                            {b.name}
                          </Link>
                        </td>
 
                        {/* Budget */}
                        <td className="py-4 px-4 text-right font-medium text-slate-400">
                          {formatCurrency(b.budget)}
                        </td>
 
                        {/* Spent */}
                        <td className="py-4 px-4 text-right font-bold text-white">
                          {formatCurrency(b.spent)}
                        </td>
 
                        {/* Remaining */}
                        <td className={`py-4 px-4 text-right font-bold ${b.remaining < 0 ? 'text-rose-455' : 'text-slate-300'}`}>
                          {b.remaining < 0 ? `-${formatCurrency(Math.abs(b.remaining))}` : formatCurrency(b.remaining)}
                        </td>
 
                        {/* Progress Bar & percentage */}
                        <td className="py-4 px-6 min-w-[200px]">
                          <div className="flex items-center space-x-3">
                            <div className="w-full bg-[#0a0f1d]/60 h-2 rounded-full overflow-hidden border border-white/10">
                              <div 
                                className={`h-full ${barColor} rounded-full`}
                                style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`font-black text-[11px] shrink-0 ${textColor}`}>
                              {b.percentUsed.toFixed(1)}%
                            </span>
                          </div>
                        </td>
 
                        {/* Status badge */}
                        <td className="py-4 px-4">
                          {getStatusBadge(b.status)}
                        </td>
 
                        {/* Action link */}
                        <td className="py-4 px-6">
                          <Link 
                            to={`/budget/${b.id}`}
                            className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#00d2ff] transition-colors"
                          >
                            Breakdown <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default BudgetOverviewPage
