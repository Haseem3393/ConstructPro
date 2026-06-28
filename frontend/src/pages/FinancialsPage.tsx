import React from 'react'
import { Link } from 'react-router-dom'
import { useFinancialStats } from '../hooks/useDashboard'
import SidebarLayout from '../components/SidebarLayout'
import { 
  DollarSign, 
  TrendingUp, 
  Loader2, 
  Wallet, 
  Percent,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react'

const FinancialsPage: React.FC = () => {
  const { data, isLoading, error } = useFinancialStats()

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">Analyzing transaction journals...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center font-bold flex items-center justify-center gap-2 max-w-md mx-auto mt-16 z-10 relative">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Failed to fetch financial stats. Please verify database sync.</span>
        </div>
      </SidebarLayout>
    )
  }

  const { totalBudget, totalSpent, budgetUtilization, categoryData, recentExpenses } = data

  const remainingBudget = totalBudget - totalSpent

  // SVG Donut Calculations
  let cumulativePercent = 0
  const donutData = categoryData.map((item: any) => {
    const amount = item.amount || 0
    const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
    const dashArray = 314.16
    const dashOffset = dashArray - (dashArray * percent) / 100
    const rotation = (cumulativePercent * 360) / 100
    cumulativePercent += percent
    return {
      ...item,
      percent,
      dashOffset,
      rotation
    }
  })

  const colors: Record<string, { stroke: string; bg: string; text: string }> = {
    LABOUR: { stroke: 'stroke-[#7c3aed]', bg: 'bg-[#7c3aed]/10', text: 'text-[#a78bfa]' },
    MATERIAL: { stroke: 'stroke-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    EQUIPMENT: { stroke: 'stroke-[#00d2ff]', bg: 'bg-[#00d2ff]/10', text: 'text-[#00d2ff]' },
    OTHER: { stroke: 'stroke-slate-400', bg: 'bg-slate-500/10', text: 'text-slate-400' }
  }

  return (
    <SidebarLayout>
      <div className="space-y-8 fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Financials Dashboard</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Aggregated construction spends, material acquisitions, and labor costs</p>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/portfolio" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Portfolio Overview
          </Link>
          <Link 
            to="/dashboard/financials" 
            className="px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-colors"
          >
            Financials Overview
          </Link>
          <Link 
            to="/dashboard/workforce" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Workforce Overview
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#7c3aed]" />
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Cumulative Budget</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(totalBudget)}</span>
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase space-x-1.5 pt-2">
              <Wallet className="h-3.5 w-3.5 text-slate-650" />
              <span>Project portfolio value</span>
            </div>
          </div>

          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#6366f1]" />
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Cost Logged</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(totalSpent)}</span>
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase space-x-1.5 pt-2">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              <span>Real-time expenses</span>
            </div>
          </div>

          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00d2ff]" />
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance Funds</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(remainingBudget)}</span>
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase space-x-1.5 pt-2">
              <Percent className="h-3.5 w-3.5 text-emerald-500" />
              <span>{(100 - budgetUtilization).toFixed(1)}% remaining</span>
            </div>
          </div>

          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Utilization Index</span>
            <span className="block text-2xl font-black text-white">{budgetUtilization.toFixed(1)}%</span>
            <div className="w-full bg-[#0a0f1d]/60 rounded-full h-1.5 mt-2.5 overflow-hidden border border-white/[0.02]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff]"
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts & Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Custom SVG Spending Trend Area Chart (2 Cols wide) */}
          <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <h3 className="font-black text-sm text-white">Monthly Cash Flow Flowchart</h3>
              <p className="text-[10px] text-slate-600 mt-0.5 uppercase font-bold tracking-wider">Aggregate spending trends mapped over the last 6 months</p>
            </div>

            <div className="my-6 relative">
              {/* Responsive SVG Area Line Chart */}
              <svg viewBox="0 0 500 200" className="w-full h-48 drop-shadow-lg overflow-visible">
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00d2ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.1)" />

                {/* Area Gradient */}
                <path 
                  d="M 0,190 Q 70,160 100,120 T 200,130 T 300,70 T 400,90 T 500,30 L 500,190 L 0,190 Z" 
                  fill="url(#gradient-area)" 
                />
                
                {/* Trend Stroke Line */}
                <path 
                  d="M 0,190 Q 70,160 100,120 T 200,130 T 300,70 T 400,90 T 500,30" 
                  fill="none" 
                  stroke="#7c3aed" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Data point indicators */}
                <circle cx="100" cy="120" r="5" fill="#00d2ff" stroke="#0d1322" strokeWidth="2" />
                <circle cx="200" cy="130" r="5" fill="#00d2ff" stroke="#0d1322" strokeWidth="2" />
                <circle cx="300" cy="70" r="5" fill="#00d2ff" stroke="#0d1322" strokeWidth="2" />
                <circle cx="400" cy="90" r="5" fill="#00d2ff" stroke="#0d1322" strokeWidth="2" />
                <circle cx="500" cy="30" r="5" fill="#00d2ff" stroke="#0d1322" strokeWidth="2" />
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 pt-3">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun (Active)</span>
              </div>
            </div>
          </div>

          {/* Donut Chart (1 Col wide) */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] to-transparent" />
            <div>
              <h3 className="font-black text-sm text-white">Expense Distribution</h3>
              <p className="text-[10px] text-slate-600 mt-0.5 uppercase font-bold tracking-wider">Ratio split across cost groups</p>
            </div>

            <div className="flex justify-center my-6 relative items-center">
              <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90">
                {donutData.map((item: any, idx: number) => {
                  const strokeColor = colors[item.category]?.stroke || 'stroke-slate-500'
                  if (item.percent === 0) return null
                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      className={`${strokeColor} transition-all duration-700`}
                      strokeWidth="12"
                      strokeDasharray="314.16"
                      strokeDashoffset={item.dashOffset}
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        transformOrigin: '60px 60px'
                      }}
                    />
                  )
                })}
                {/* Center cutout */}
                <circle cx="60" cy="60" r="38" fill="#0d1322" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spent</span>
                <span className="text-base font-black text-white leading-none mt-1">{budgetUtilization.toFixed(0)}%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              {donutData.map((item: any, idx: number) => {
                const colorConfig = colors[item.category] || { bg: 'bg-slate-500/10', text: 'text-slate-400' }
                return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${colorConfig.text.replace('text', 'bg')}`}></span>
                      <span className="font-bold text-slate-350">{item.category}</span>
                    </div>
                    <span className="font-black text-white">{item.percent.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transaction ledger list */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.005] flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm text-white">Recent Expenditure Audit Log</h3>
              <p className="text-[10px] text-slate-650 mt-0.5 font-bold uppercase tracking-wider">Detailed listing of recent expenditures</p>
            </div>
            <span className="text-[9px] bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {recentExpenses?.length || 0} bills logged
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-white/10">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">EXPENSE PARTICULARS</th>
                  <th className="py-4 px-4">SITE LOCATION</th>
                  <th className="py-4 px-4">BILLING CATEGORY</th>
                  <th className="py-4 px-4">TRANSACTION DATE</th>
                  <th className="py-4 px-6 text-right">SETTLED AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {recentExpenses?.map((expense: any, idx: number) => {
                  const catColor = colors[expense.category] || { bg: 'bg-slate-800', text: 'text-slate-400' }
                  return (
                    <tr key={expense.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-slate-650">{idx + 1}</td>
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {expense.description || 'General cost ledger item'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-350">{expense.project?.name}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded ${catColor.bg} ${catColor.text} border border-current/10`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600 flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-700" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-white text-sm tabular-nums">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  )
                })}
                {recentExpenses?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-600">
                      No expense logs synced with database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default FinancialsPage
