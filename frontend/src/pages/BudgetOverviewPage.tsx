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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            On Track
          </span>
        )
      case 'WARNING':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Warning
          </span>
        )
      case 'CRITICAL':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/25">
            Critical
          </span>
        )
      case 'OVERSPENT':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-650 text-white border border-red-500/30 animate-pulse">
            Overspent
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400">
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
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Project Budget Tracker</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitor budget limits, active expenditures, and cash depletion status across all project sites</p>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Portfolio Budget */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Portfolio Budget</span>
              <span className="block text-xl font-black text-white">
                {isLoading ? '...' : formatCurrency(stats.totalBudget)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-850 text-zinc-400 border border-zinc-800">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Portfolio Spent */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Portfolio Spent</span>
              <span className="block text-xl font-black text-violet-400">
                {isLoading ? '...' : formatCurrency(stats.totalSpent)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-violet-600/10 text-violet-450 border border-violet-500/15">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Critical Warnings */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Critical Alert Sites</span>
              <span className="block text-2xl font-black text-amber-400">{stats.criticalCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-450 border border-amber-500/15">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Overspent Projects */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Overspent Sites</span>
              <span className="block text-2xl font-black text-rose-455">{stats.overspentCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/15">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Budget overview warnings banner */}
        {(stats.criticalCount > 0 || stats.overspentCount > 0) && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold flex items-start space-x-3">
            <AlertOctagon className="h-5 w-5 shrink-0 text-rose-450 animate-bounce" />
            <div>
              <p className="uppercase tracking-wide">⚠️ Budget Attention Required</p>
              <p className="text-zinc-400 font-medium normal-case mt-0.5">
                {stats.overspentCount > 0 && `${stats.overspentCount} site(s) have exceeded their budget caps. `}
                {stats.criticalCount > 0 && `${stats.criticalCount} site(s) are utilizing more than 80% of allocated capital reserves.`}
              </p>
            </div>
          </div>
        )}

        {/* Budget List Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Computing project spent balances...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#14161f] border border-rose-500/20 rounded-xl shadow-xl">
            Failed to fetch projects budget data.
          </div>
        ) : budgets?.length === 0 ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            No projects found in system registry.
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3.5 px-6">PROJECT</th>
                    <th className="py-3.5 px-4 text-right">TOTAL BUDGET</th>
                    <th className="py-3.5 px-4 text-right">SPENT SO FAR</th>
                    <th className="py-3.5 px-4 text-right">REMAINING CAP</th>
                    <th className="py-3.5 px-6">CAPITAL DRAIN %</th>
                    <th className="py-3.5 px-4">BUDGET STATUS</th>
                    <th className="py-3.5 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {budgets?.map((b) => {
                    const isOver = b.percentUsed > 100
                    const isCritical = b.percentUsed >= 80 && b.percentUsed <= 100
                    const isWarning = b.percentUsed >= 50 && b.percentUsed < 80

                    let barColor = 'bg-green-500'
                    let textColor = 'text-green-400'
                    if (isOver) {
                      barColor = 'bg-red-600'
                      textColor = 'text-rose-455'
                    } else if (isCritical) {
                      barColor = 'bg-rose-500'
                      textColor = 'text-rose-450'
                    } else if (isWarning) {
                      barColor = 'bg-amber-500'
                      textColor = 'text-amber-400'
                    }

                    return (
                      <tr key={b.id} className="hover:bg-[#1a1c27]/25 transition-colors group">
                        {/* Project Name */}
                        <td className="py-4 px-6 font-extrabold text-white">
                          <Link to={`/budget/${b.id}`} className="hover:text-violet-400 transition-colors">
                            {b.name}
                          </Link>
                        </td>

                        {/* Budget */}
                        <td className="py-4 px-4 text-right font-medium text-zinc-400">
                          {formatCurrency(b.budget)}
                        </td>

                        {/* Spent */}
                        <td className="py-4 px-4 text-right font-bold text-white">
                          {formatCurrency(b.spent)}
                        </td>

                        {/* Remaining */}
                        <td className={`py-4 px-4 text-right font-bold ${b.remaining < 0 ? 'text-rose-455' : 'text-zinc-350'}`}>
                          {b.remaining < 0 ? `-${formatCurrency(Math.abs(b.remaining))}` : formatCurrency(b.remaining)}
                        </td>

                        {/* Progress Bar & percentage */}
                        <td className="py-4 px-6 min-w-[200px]">
                          <div className="flex items-center space-x-3">
                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-850">
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
                            className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-zinc-455 group-hover:text-violet-400 transition-colors"
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
