import React from 'react'
import { Link } from 'react-router-dom'
import { useWorkforceOverview } from '../hooks/useDashboard'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Users, 
  DollarSign, 
  Loader2, 
  Hammer, 
  Phone,
  CheckCircle,
  Briefcase
} from 'lucide-react'

const WorkforcePage: React.FC = () => {
  const { data, isLoading, error } = useWorkforceOverview()

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Syncing active payrolls...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/25 p-6 rounded-xl text-center text-rose-400 font-bold max-w-lg mx-auto">
          Failed to fetch workforce overview. Verify database sync.
        </div>
      </SidebarLayout>
    )
  }

  const { totalWorkers, totalDailyWageLiability, averageDailyWage, tradeData, workers } = data

  // Find max count to scale the bars in SVG
  const maxCount = tradeData.reduce((max: number, item: any) => item.count > max ? item.count : max, 1)

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Workforce Hub</h1>
          <p className="text-zinc-400 text-sm mt-1">Labor registry metrics, active trade assignments, and wage schedules</p>
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
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Financials Overview
          </Link>
          <Link 
            to="/dashboard/workforce" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Workforce Overview
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Laborers</span>
            <span className="block text-2xl font-black text-white">{totalWorkers}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              <span>Registered on-site</span>
            </div>
          </div>

          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Average Daily Wage</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(averageDailyWage)}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
              <span>Standard rate index</span>
            </div>
          </div>

          <div className="bg-[#14161f] border border-zinc-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-600"></div>
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Daily Wage Liability</span>
            <span className="block text-2xl font-black text-white">{formatCurrency(totalDailyWageLiability)}</span>
            <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1.5 pt-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>Total daily payout value</span>
            </div>
          </div>
        </div>

        {/* Trade Chart & Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Custom SVG Bar Chart (2 Cols wide) */}
          <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Active Workers by Trade</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Demographics comparison of construction skills on-site</p>
            </div>

            <div className="my-6 relative">
              <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
                {/* Y-axis gridlines */}
                <line x1="40" y1="20" x2="500" y2="20" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="40" y1="70" x2="500" y2="70" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="500" y2="120" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="40" y1="170" x2="500" y2="170" stroke="#374151" />

                {/* X-axis base line */}
                <line x1="40" y1="170" x2="500" y2="170" stroke="#374151" strokeWidth="2" />

                {/* Bar drawings */}
                {tradeData.map((item: any, idx: number) => {
                  const barWidth = 45
                  const gap = 60
                  const startX = 60 + idx * (barWidth + gap)
                  const heightVal = (item.count / maxCount) * 130 // Scale height to fit 130px max
                  const startY = 170 - heightVal

                  return (
                    <g key={idx}>
                      {/* Interactive Bar */}
                      <rect 
                        x={startX} 
                        y={startY} 
                        width={barWidth} 
                        height={heightVal} 
                        fill="url(#bar-gradient)" 
                        className="transition-all duration-700 hover:opacity-85"
                        rx="4" 
                      />
                      
                      {/* Top value badge */}
                      <text 
                        x={startX + barWidth / 2} 
                        y={startY - 6} 
                        textAnchor="middle" 
                        fill="#fff" 
                        fontSize="10" 
                        fontWeight="bold"
                      >
                        {item.count}
                      </text>

                      {/* X Label */}
                      <text 
                        x={startX + barWidth / 2} 
                        y="188" 
                        textAnchor="middle" 
                        fill="#9ca3af" 
                        fontSize="9" 
                        fontWeight="bold"
                        className="uppercase tracking-wider"
                      >
                        {item.trade}
                      </text>
                    </g>
                  )
                })}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Quick list of Trades descriptions (1 Col wide) */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <h3 className="font-bold text-base text-white border-b border-zinc-805 pb-3">Available Trade Categories</h3>
            <div className="space-y-4 my-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-violet-600/10 text-violet-400 rounded-lg shrink-0">
                  <Hammer className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Masonry (Masons)</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">Civil structures layout, bricklaying, brick masonry, and structural concrete forms.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg shrink-0">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Carpenters</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">Wooden formwork, roofing structures, and scaffolding setup.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">General Labor (Helpers)</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">Site clearance, helper duties, and assisting tradespersons.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workforce registry list */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-350">Site Labor Records</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {workers?.length || 0} active workers
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">LABORER NAME</th>
                  <th className="py-4 px-4">TRADE SKILL</th>
                  <th className="py-4 px-4">CONTACT NUMBER</th>
                  <th className="py-4 px-4 text-center">ACCOUNT STATUS</th>
                  <th className="py-4 px-6 text-right">DAILY PAY WAGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {workers?.map((worker: any, idx: number) => (
                  <tr key={worker.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-zinc-550">{idx + 1}</td>
                    <td className="py-4 px-6 font-bold text-white text-sm">
                      {worker.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded bg-[#1c1d26] border border-zinc-800 text-zinc-350">
                        {worker.trade}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-400 flex items-center space-x-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-550" />
                      <span>{worker.phone || 'No Phone'}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-white text-sm">
                      {formatCurrency(worker.dailyWage)}
                    </td>
                  </tr>
                ))}
                {workers?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No worker records found.
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

export default WorkforcePage
