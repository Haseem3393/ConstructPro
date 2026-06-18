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
  Layers
} from 'lucide-react'

const FinancialsPage: React.FC = () => {
  const { data, isLoading, error } = useFinancialStats()

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Analyzing transaction journals...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/25 p-6 rounded-xl text-center text-rose-400 font-bold max-w-lg mx-auto">
          Failed to fetch financial stats. Please verify database sync.
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
    LABOUR: { stroke: 'stroke-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
    MATERIAL: { stroke: 'stroke-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    EQUIPMENT: { stroke: 'stroke-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    OTHER: { stroke: 'stroke-zinc-500', bg: 'bg-zinc-500/10', text: 'text-zinc-400' }
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Financials Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Aggregated construction spends, material acquisitions, and labor costs</p>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/portfolio" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Portfolio Overview
          </Link>
          <Link 
            to="/dashboard/financials" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Financials Overview
          </Link>
          <Link 
            to="/dashboard/workforce" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Workforce Overview
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cumulative Budget</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(totalBudget)}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <Wallet className="h-3.5 w-3.5 text-zinc-500" />
              <span>Project portfolio value</span>
            </div>
          </div>

          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Cost Logged</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(totalSpent)}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
              <span>Real-time expenses</span>
            </div>
          </div>

          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance Funds</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(remainingBudget)}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <Percent className="h-3.5 w-3.5 text-emerald-500" />
              <span>{(100 - budgetUtilization).toFixed(1)}% remaining</span>
            </div>
          </div>

          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Utilization Index</span>
            <span className="block text-2xl font-black text-white">{budgetUtilization.toFixed(1)}%</span>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  budgetUtilization > 90 ? 'bg-rose-500' :
                  budgetUtilization > 75 ? 'bg-amber-500' :
                  'bg-blue-600'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Charts & Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Custom SVG Spending Trend Area Chart (2 Cols wide) */}
          <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Monthly Cash Flow Flowchart</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Aggregate spending trends mapped over the last 6 months</p>
            </div>

            <div className="my-6 relative">
              {/* Responsive SVG Area Line Chart */}
              <svg viewBox="0 0 500 200" className="w-full h-48 drop-shadow-lg overflow-visible">
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="190" x2="500" y2="190" stroke="#374151" />

                {/* Area Gradient */}
                <path 
                  d="M 0,190 Q 70,160 100,120 T 200,130 T 300,70 T 400,90 T 500,30 L 500,190 L 0,190 Z" 
                  fill="url(#gradient-area)" 
                />
                
                {/* Trend Stroke Line */}
                <path 
                  d="M 0,190 Q 70,160 100,120 T 200,130 T 300,70 T 400,90 T 500,30" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Data point indicators */}
                <circle cx="100" cy="120" r="5" fill="#3b82f6" stroke="#0d0e12" strokeWidth="2" />
                <circle cx="200" cy="130" r="5" fill="#3b82f6" stroke="#0d0e12" strokeWidth="2" />
                <circle cx="300" cy="70" r="5" fill="#3b82f6" stroke="#0d0e12" strokeWidth="2" />
                <circle cx="400" cy="90" r="5" fill="#3b82f6" stroke="#0d0e12" strokeWidth="2" />
                <circle cx="500" cy="30" r="5" fill="#3b82f6" stroke="#0d0e12" strokeWidth="2" />
              </svg>

              {/* Chart labels */}
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2 pt-3">
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
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Expense Distribution</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Ratio split across cost groups</p>
            </div>

            <div className="flex justify-center my-6 relative items-center">
              <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90">
                {donutData.map((item: any, idx: number) => {
                  const strokeColor = colors[item.category]?.stroke || 'stroke-zinc-500'
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
                <circle cx="60" cy="60" r="38" fill="#14161f" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Spent</span>
                <span className="text-sm font-black text-white">{budgetUtilization.toFixed(0)}%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              {donutData.map((item: any, idx: number) => {
                const colorConfig = colors[item.category] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400' }
                return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${colorConfig.text.replace('text', 'bg')}`}></span>
                      <span className="font-bold text-zinc-350">{item.category}</span>
                    </div>
                    <span className="font-black text-white">{item.percent.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transaction ledger list */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-300">Recent Expenditure Audit Log</h3>
            <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {recentExpenses?.length || 0} bills logged
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">EXPENSE PARTICULARS</th>
                  <th className="py-4 px-4">SITE LOCATION</th>
                  <th className="py-4 px-4">BILLING CATEGORY</th>
                  <th className="py-4 px-4">TRANSACTION DATE</th>
                  <th className="py-4 px-6 text-right">SETTLED AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {recentExpenses?.map((expense: any, idx: number) => {
                  const catColor = colors[expense.category] || { bg: 'bg-zinc-800', text: 'text-zinc-400' }
                  return (
                    <tr key={expense.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-zinc-550">{idx + 1}</td>
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {expense.description || 'General cost ledger item'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-300">{expense.project?.name}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded ${catColor.bg} ${catColor.text} border border-current/10`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-zinc-500 flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-white text-sm">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  )
                })}
                {recentExpenses?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
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
