import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBudgetDetails } from '../hooks/useFinance'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertOctagon,
  Percent
} from 'lucide-react'

const CATEGORY_COLORS = [
  '#a78bfa', // LABOUR - Violet
  '#34d399', // MATERIAL - Green
  '#60a5fa', // EQUIPMENT - Blue
  '#fbbf24', // SUBCONTRACTOR - Amber
  '#f87171', // TRANSPORT - Red
  '#a1a1aa', // OTHER - Zinc
]

const BudgetDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { data, isLoading, isError } = useBudgetDetails(projectId || '')

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  // Segmented Donut Chart properties
  const donutR = 40
  const donutCirc = 2 * Math.PI * donutR // ~251.32

  const donutSegments = useMemo(() => {
    if (!data?.categoryBreakdown) return []
    
    let accumulatedPercent = 0
    return data.categoryBreakdown.map((cat, index) => {
      const percent = cat.percent
      const strokeDasharray = `${(percent / 100) * donutCirc} ${donutCirc}`
      const strokeDashoffset = `${-(accumulatedPercent / 100) * donutCirc}`
      accumulatedPercent += percent

      return {
        ...cat,
        color: CATEGORY_COLORS[index] || '#a1a1aa',
        strokeDasharray,
        strokeDashoffset,
      }
    })
  }, [data])

  // Trend line chart calculation
  const trendPoints = useMemo(() => {
    if (!data?.monthlyTrend || data.monthlyTrend.length === 0) return []
    return data.monthlyTrend
  }, [data])

  const svgPath = useMemo(() => {
    if (trendPoints.length < 2) return ''
    const width = 500
    const height = 150
    const padding = 15

    const maxAmt = Math.max(...trendPoints.map((p) => p.amount), 50000)

    const points = trendPoints.map((p, index) => {
      const x = padding + (index / (trendPoints.length - 1)) * (width - padding * 2)
      const y = height - padding - (p.amount / maxAmt) * (height - padding * 2)
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [trendPoints])

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Analyzing budget sheets...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !data) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-400" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Budget Details Error</p>
          <p className="text-xs text-zinc-400">The requested project budget tracker could not be compiled.</p>
          <Link to="/budget" className="inline-flex text-xs font-bold text-violet-400 hover:text-violet-300">
            Back to Budgets
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const utilizationPercent = data.progressPercent
  const maxTrendAmt = Math.max(...trendPoints.map((p) => p.amount), 50000)

  // Color Coding configurations
  let themeColor = 'text-green-400 border-green-500/25 bg-green-500/10'
  let progressColor = 'bg-green-500'
  if (utilizationPercent > 100) {
    themeColor = 'text-red-455 border-red-500/35 bg-red-500/10'
    progressColor = 'bg-red-600'
  } else if (utilizationPercent >= 80) {
    themeColor = 'text-rose-450 border-rose-500/25 bg-rose-500/10'
    progressColor = 'bg-rose-500'
  } else if (utilizationPercent >= 50) {
    themeColor = 'text-amber-400 border-amber-500/25 bg-amber-500/10'
    progressColor = 'bg-amber-500'
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Navigation back */}
        <div className="flex items-center">
          <Link
            to="/budget"
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Budgets
          </Link>
        </div>

        {/* Banner Headers */}
        <div className="border-b border-zinc-800 pb-5">
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest bg-violet-600/10 px-2.5 py-0.5 rounded border border-violet-500/10">
            Site Code: PRJ-{data.project.id.slice(-4).toUpperCase()}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2.5">{data.project.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">Detailed cost classification breakdown and cash flow tracking curves</p>
        </div>

        {/* Budget Threshold Alert Banners */}
        {utilizationPercent >= 100 && (
          <div className="p-4 bg-red-650/15 border border-red-500/25 text-rose-455 rounded-lg text-xs font-bold flex items-start space-x-3">
            <AlertOctagon className="h-5 w-5 shrink-0 text-red-500 animate-pulse" />
            <div>
              <p className="uppercase tracking-wide">🚨 OVERSPENT EXCEEDED</p>
              <p className="text-zinc-400 font-medium normal-case mt-0.5">
                This project has exceeded its target budget cap of {formatCurrency(data.project.budget)} by a total of <span className="text-red-400 font-black">{formatCurrency(Math.abs(data.remaining))}</span>. Freeze further non-essential manual expense logs.
              </p>
            </div>
          </div>
        )}

        {utilizationPercent >= 80 && utilizationPercent < 100 && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-450 animate-bounce" />
            <div>
              <p className="uppercase tracking-wide">⚠️ WARNING: CRITICAL EXHAUSTION</p>
              <p className="text-zinc-400 font-medium normal-case mt-0.5">
                Capital utilization has crossed 80%. Remaining liquid capital reserves are down to <span className="text-white font-extrabold">{formatCurrency(data.remaining)}</span>.
              </p>
            </div>
          </div>
        )}

        {utilizationPercent >= 50 && utilizationPercent < 80 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-450" />
            <div>
              <p className="uppercase tracking-wide">ℹ️ NOTICE: CAPITAL HALF-DEPLETED</p>
              <p className="text-zinc-400 font-medium normal-case mt-0.5">
                Budget consumption has crossed 50%. Standard operations remain on track. Remaining budget is {formatCurrency(data.remaining)}.
              </p>
            </div>
          </div>
        )}

        {/* Large Metrics widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Target Capital Budget</span>
              <span className="block text-xl font-black text-white">{formatCurrency(data.project.budget)}</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-850 text-zinc-400 border border-zinc-800">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Spent */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Spent to Date</span>
              <span className="block text-xl font-black text-violet-400">{formatCurrency(data.spent)}</span>
            </div>
            <div className="p-3 rounded-lg bg-violet-600/10 text-violet-450 border border-violet-500/15">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Remaining Reserve Cap</span>
              <span className={`block text-xl font-black ${data.remaining < 0 ? 'text-rose-455 animate-pulse' : 'text-green-400'}`}>
                {data.remaining < 0 ? `-${formatCurrency(Math.abs(data.remaining))}` : formatCurrency(data.remaining)}
              </span>
            </div>
            <div className={`p-3 rounded-lg border ${data.remaining < 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' : 'bg-green-500/10 text-green-400 border-green-500/15'}`}>
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span>Overall Budget Consumption</span>
            <span className={utilizationPercent > 80 ? 'text-rose-400' : 'text-zinc-300'}>
              {utilizationPercent.toFixed(2)}% Used
            </span>
          </div>
          <div className="w-full bg-zinc-850 h-3 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Visual Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie/Donut Chart visual */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Cost Category Allocation</span>
            
            {data.spent === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-zinc-650 font-bold">
                No recorded cost data to render chart.
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-5 py-2">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {/* Render Segments */}
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="100"
                        cy="100"
                        r={donutR}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="15"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        transform="rotate(-90 100 100)"
                        className="transition-all hover:stroke-[18px]"
                      >
                        <title>{`${seg.category}: ${seg.percent.toFixed(1)}%`}</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Wastage</span>
                    <span className="block text-sm font-black text-white">{utilizationPercent.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] w-full pt-2 border-t border-zinc-850">
                  {donutSegments.map((seg, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                      <span className="text-zinc-400 capitalize truncate">{seg.category.toLowerCase()}</span>
                      <span className="text-white ml-auto">{seg.percent.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Spending Trend Chart */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Monthly Capital Outflow Trend</span>
            
            {trendPoints.length < 2 ? (
              <div className="h-48 flex items-center justify-center text-xs text-zinc-650 font-bold">
                Not enough monthly records to plot line trend graph.
              </div>
            ) : (
              <div className="mt-6">
                <svg viewBox="0 0 500 150" className="w-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="15" y1="15" x2="485" y2="15" stroke="#27272a" strokeWidth="1" strokeDasharray="3" />
                  <line x1="15" y1="135" x2="485" y2="135" stroke="#27272a" strokeWidth="1" />
                  
                  {/* SVG Line Graph */}
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_4px_12px_rgba(139,92,246,0.25)]"
                  />

                  {/* Chart Dots */}
                  {trendPoints.map((p, index) => {
                    const width = 500
                    const height = 150
                    const padding = 15
                    const x = padding + (index / (trendPoints.length - 1)) * (width - padding * 2)
                    const y = height - padding - (p.amount / maxTrendAmt) * (height - padding * 2)
                    return (
                      <g key={index} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill="#14161f"
                          stroke="#a78bfa"
                          strokeWidth="2.5"
                          className="hover:r-6 hover:fill-violet-400 transition-all"
                        />
                        <title>{`${p.month}: ${formatCurrency(p.amount)}`}</title>
                      </g>
                    )
                  })}
                </svg>
                <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase tracking-wider mt-4">
                  <span>{trendPoints[0].month}</span>
                  <span>{trendPoints[trendPoints.length - 1].month}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Category Capital Allocations
            </h3>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-zinc-550 font-bold tracking-wider uppercase bg-[#181a24]/30 border-b border-zinc-800">
                  <th className="py-3 px-6">CATEGORY</th>
                  <th className="py-3 px-4 text-right">SPENT (LKR)</th>
                  <th className="py-3 px-6">PERCENT OF TOTAL SPENT</th>
                  <th className="py-3 px-6">UTILIZATION RATIO VISUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {data.categoryBreakdown.map((cat, idx) => (
                  <tr key={cat.category} className="hover:bg-[#1a1c27]/20 transition-colors">
                    <td className="py-3.5 px-6 font-extrabold text-zinc-300 capitalize">{cat.category.toLowerCase()}</td>
                    <td className="py-3.5 px-4 text-right text-white font-black text-sm">{formatCurrency(cat.amount)}</td>
                    <td className="py-3.5 px-6 font-bold text-violet-400">{cat.percent.toFixed(1)}%</td>
                    <td className="py-3.5 px-6 min-w-[150px]">
                      <div className="w-32 bg-zinc-850 h-2 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${cat.percent}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default BudgetDetailsPage
