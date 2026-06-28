import React, { useState } from 'react'
import { useAttendanceSummary } from '../hooks/useAttendance'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Calendar, 
  Users, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  BarChart2, 
  ArrowRight,
  ClipboardList
} from 'lucide-react'

const AttendanceSummaryPage: React.FC = () => {
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const defaultEnd = now.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  const { data: summaryData, isLoading, isFetching } = useAttendanceSummary({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  const workerSummaries = summaryData?.workerSummaries || []
  const projectCosts = summaryData?.projectCosts || []

  // Aggregate stats
  const totalLabourWages = workerSummaries.reduce((sum: number, w: any) => sum + w.totalPay, 0)
  const totalManDays = workerSummaries.reduce((sum: number, w: any) => sum + w.presentDays, 0)
  const totalWorkersCount = workerSummaries.length

  // SVG Bar Chart configurations
  const svgWidth = 600
  const svgHeight = 220
  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40
  
  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center border-b border-[#1a2535] pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Workforce Analytics & Summary</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Aggregate summaries of daily labor logs and check-in ratios</p>
          </div>
        </div>

        {/* Date Filters Panel */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-slate-500" /> Select Summary Period
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Commencement Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Summary Indicators */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-slate-500 text-sm font-semibold">Compiling labor data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-5 space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1 text-slate-500" /> Active Logged Labor
                </span>
                <span className="block font-black text-white text-xl">{totalWorkersCount} workers</span>
              </div>
              <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-5 space-y-2">
                <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center">
                  <ClipboardList className="h-3.5 w-3.5 mr-1 text-blue-500" /> Total Man-Days Logged
                </span>
                <span className="block font-black text-blue-400 text-xl">{totalManDays} days</span>
              </div>
              <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-5 space-y-2">
                <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1 text-slate-500" /> Cumulative Wages Liability
                </span>
                <span className="block font-black text-emerald-400 text-xl">{formatCurrency(totalLabourWages)}</span>
              </div>
            </div>

            {/* Attendance SVG Bar Chart and Project Cost summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SVG Chart card */}
              <div className="lg:col-span-2 bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 space-y-4 flex flex-col">
                <h3 className="font-bold text-sm text-slate-350 flex items-center uppercase tracking-widest text-[10px]">
                  <BarChart2 className="h-4.5 w-4.5 mr-1.5 text-slate-550" /> Project Attendance Rate (%)
                </h3>

                <div className="flex-1 w-full bg-[#0b1220] border border-[#1a2535] rounded-xl p-3 flex items-center justify-center min-h-[240px]">
                  {projectCosts.length === 0 ? (
                    <span className="text-slate-500 text-xs font-bold">No project check-ins logged for this range.</span>
                  ) : (
                    <svg width="100%" height={svgHeight} className="overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((val) => {
                        const y = paddingTop + chartHeight - (val / 100) * chartHeight
                        return (
                          <g key={val}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={svgWidth - paddingRight}
                              y2={y}
                              stroke="#1a2535"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={paddingLeft - 8}
                              y={y + 4}
                              textAnchor="end"
                              fill="#64748b"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              {val}%
                            </text>
                          </g>
                        )
                      })}

                      {/* Render Bars */}
                      {projectCosts.map((p: any, idx: number) => {
                        const barWidth = Math.min(36, chartWidth / projectCosts.length - 20)
                        const barSpacing = chartWidth / projectCosts.length
                        const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2
                        
                        const rate = p.attendanceRate || 0
                        const barHeight = (rate / 100) * chartHeight
                        const y = paddingTop + chartHeight - barHeight

                        return (
                          <g key={p.projectId} className="group cursor-pointer">
                            <defs>
                              <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
                              </linearGradient>
                            </defs>
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              fill={`url(#grad-${idx})`}
                              rx="4"
                              className="transition-all duration-300 hover:brightness-125"
                            />
                            {/* Value tooltip */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 6}
                              textAnchor="middle"
                              fill="#60a5fa"
                              fontSize="10"
                              fontWeight="black"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {rate.toFixed(0)}%
                            </text>
                            {/* X-axis Label */}
                            <text
                              x={x + barWidth / 2}
                              y={paddingTop + chartHeight + 16}
                              textAnchor="middle"
                              fill="#64748b"
                              fontSize="9"
                              fontWeight="bold"
                              className="w-16 truncate"
                            >
                              {p.name.length > 8 ? `${p.name.substring(0, 7)}...` : p.name}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* Project Labor Cost Breakdown card */}
              <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl flex flex-col">
                <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01]">
                  <h3 className="font-bold text-xs text-slate-350 uppercase tracking-widest">Labour Liabilities</h3>
                </div>
                <div className="flex-1 divide-y divide-[#1a2535] overflow-y-auto max-h-[250px]">
                  {projectCosts.map((p: any) => (
                    <div key={p.projectId} className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                      <div>
                        <span className="block font-bold text-white text-xs">{p.name}</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Attendance: {p.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                      <span className="font-black text-white text-xs">{formatCurrency(p.totalLabourCost)}</span>
                    </div>
                  ))}
                  {projectCosts.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">No records available.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Worker Summary Table Card */}
            <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01] flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-350">Worker Payroll Metrics Breakdown</h3>
                {isFetching && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
              </div>

              {workerSummaries.length === 0 ? (
                <div className="p-16 text-center text-slate-500 text-sm font-semibold">
                  No attendance records recorded for the selected period.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-[#1a2535]">
                        <th className="py-4 px-6">STAFF NAME</th>
                        <th className="py-4 px-4 text-center">PRESENT DAYS</th>
                        <th className="py-4 px-4 text-center">ABSENT DAYS</th>
                        <th className="py-4 px-4 text-center">OVERTIME HOURS</th>
                        <th className="py-4 px-6 text-right">GROSS PAYROLL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a2535] text-xs">
                      {workerSummaries.map((w: any) => (
                        <tr key={w.workerId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-bold text-white text-sm">{w.name}</td>
                          <td className="py-4 px-4 text-center text-slate-300 font-bold">{w.presentDays} days</td>
                          <td className="py-4 px-4 text-center text-slate-500 font-semibold">{w.absentDays} days</td>
                          <td className="py-4 px-4 text-center text-slate-300 font-bold">{w.overtimeHours} hrs</td>
                          <td className="py-4 px-6 text-right font-black text-white text-sm">
                            {formatCurrency(w.totalPay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  )
}

export default AttendanceSummaryPage
