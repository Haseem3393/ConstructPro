import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useAttendanceReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Calendar,
  Users,
  Percent,
  AlertTriangle,
  ChevronDown
} from 'lucide-react'

const AttendanceReportPage: React.FC = () => {
  const { data: projects } = useProjects()

  // Filters
  const [projectId, setProjectId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data, isLoading } = useAttendanceReport({
    projectId: projectId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  })

  const logDownload = (reportName: string) => {
    const saved = localStorage.getItem('constructpro_reports_history')
    const history = saved ? JSON.parse(saved) : []
    const newItem = {
      id: Date.now().toString(),
      name: reportName,
      format: 'CSV',
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('constructpro_reports_history', JSON.stringify([newItem, ...history]))
  }

  const handleExport = () => {
    if (!data?.workerTable || data.workerTable.length === 0) return
    const headers = ['Worker Name', 'Trade', 'Days Present', 'Days Absent', 'Total Days Active', 'Attendance Rate %']
    const rows = data.workerTable.map((w: any) => [
      w.name,
      w.trade,
      w.present,
      w.absent,
      w.total,
      w.rate.toFixed(1)
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`Attendance & Absence Audit`)
  }

  // Calculate overall attendance rate
  const overallPresent = data?.workerTable?.reduce((sum: number, w: any) => sum + w.present, 0) || 0
  const overallTotal = data?.workerTable?.reduce((sum: number, w: any) => sum + w.total, 0) || 0
  const overallRate = overallTotal > 0 ? (overallPresent / overallTotal) * 100 : 0

  // SVG Trend Chart Dimensions
  const chartWidth = 500
  const chartHeight = 160
  const padding = 25

  const dailyTrend = data?.dailyTrend || []
  let chartPoints = ''
  let areaPoints = ''
  
  if (dailyTrend.length > 1) {
    const maxVal = Math.max(...dailyTrend.map((d: any) => d.present + d.absent), 5)
    const stepX = (chartWidth - padding * 2) / (dailyTrend.length - 1)
    const scaleY = (chartHeight - padding * 2) / maxVal

    dailyTrend.forEach((pt: any, idx: number) => {
      const x = padding + idx * stepX
      const y = chartHeight - padding - pt.present * scaleY
      
      if (idx === 0) {
        chartPoints = `M ${x} ${y}`
        areaPoints = `M ${x} ${chartHeight - padding} L ${x} ${y}`
      } else {
        chartPoints += ` L ${x} ${y}`
        areaPoints += ` L ${x} ${y}`
      }

      if (idx === dailyTrend.length - 1) {
        areaPoints += ` L ${x} ${chartHeight - padding} Z`
      }
    })
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Title */}
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/reports" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Hub
          </Link>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Worker Attendance Report</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Monitor site attendance rates, analyze absence risk profiles, and visualize active workforce trend lines.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isLoading || !data?.workerTable || data.workerTable.length === 0}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Project Site Filter</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Analyzing workforce attendance history...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats: Attendance Rate % & Daily Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Attendance Rate */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Attendance Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black text-violet-400">{overallRate.toFixed(1)}%</span>
                    <span className="text-[10px] font-bold text-zinc-500">Target Range: 90%+</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-850">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        overallRate >= 85 ? 'bg-violet-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(overallRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] pt-4 border-t border-zinc-850 font-bold">
                  <div>
                    <span className="block text-zinc-550 uppercase">Total Present Days</span>
                    <span className="text-white text-sm font-extrabold">{overallPresent} days</span>
                  </div>
                  <div>
                    <span className="block text-zinc-550 uppercase">Absent Logs</span>
                    <span className="text-white text-sm font-extrabold">{overallTotal - overallPresent} days</span>
                  </div>
                </div>
              </div>

              {/* Attendance Trend Line Chart */}
              <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Daily Attendance Trend</h3>
                <div className="flex-1 w-full flex items-center justify-center">
                  {dailyTrend.length < 2 ? (
                    <p className="text-xs text-zinc-500">Insufficient daily logs to render trend.</p>
                  ) : (
                    <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="attendanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="0.5" />
                      
                      {/* Area Path */}
                      <path d={areaPoints} fill="url(#attendanceAreaGrad)" />
                      {/* Trend Line Path */}
                      <path d={chartPoints} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Points Circles */}
                      {dailyTrend.map((pt: any, idx: number) => {
                        const stepX = (chartWidth - padding * 2) / (dailyTrend.length - 1)
                        const maxVal = Math.max(...dailyTrend.map((d: any) => d.present + d.absent), 5)
                        const scaleY = (chartHeight - padding * 2) / maxVal
                        const cx = padding + idx * stepX
                        const cy = chartHeight - padding - pt.present * scaleY
                        return (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="3.5"
                            fill="#0d0e12"
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-5 transition-all"
                          >
                            <title>{`Date: ${pt.date}, Present: ${pt.present}`}</title>
                          </circle>
                        )
                      })}
                    </svg>
                  )}
                </div>
                {dailyTrend.length > 1 && (
                  <div className="flex justify-between text-[8px] text-zinc-550 font-bold uppercase tracking-wider px-2 mt-2">
                    <span>{dailyTrend[0].date}</span>
                    <span>{dailyTrend[dailyTrend.length - 1].date}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Worker Attendance Table */}
              <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30">
                    <h3 className="font-extrabold text-sm text-zinc-350">Workforce Attendance Registry</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                          <th className="py-3 px-6">WORKER</th>
                          <th className="py-3 px-4">TRADE</th>
                          <th className="py-3 px-4 text-center">DAYS PRESENT</th>
                          <th className="py-3 px-4 text-center">DAYS ABSENT</th>
                          <th className="py-3 px-6 text-right">ATTENDANCE RATE %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-xs">
                        {data?.workerTable?.map((w: any) => (
                          <tr key={w.workerId} className="hover:bg-[#1a1c27]/20 transition-colors">
                            <td className="py-3.5 px-6 font-bold text-white">{w.name}</td>
                            <td className="py-3.5 px-4 text-zinc-350 font-semibold">{w.trade}</td>
                            <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{w.present} days</td>
                            <td className="py-3.5 px-4 text-center text-zinc-500 font-semibold">{w.absent} days</td>
                            <td className="py-3.5 px-6 text-right font-black">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                w.rate >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                                w.rate >= 75 ? 'bg-blue-500/10 text-blue-400' :
                                'bg-rose-500/10 text-rose-400'
                              }`}>
                                {w.rate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Absence Pattern Analysis */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Absence Risk Audit</h3>
                <p className="text-zinc-450 text-xs leading-normal">
                  Identifies workers with critical attendance profiles (rate below 85%) who are high-risk indicators for schedule delays.
                </p>
                {data?.absenceAnalysis?.length === 0 ? (
                  <div className="p-8 text-center text-zinc-550 border border-dashed border-zinc-800 rounded-lg text-xs font-bold">
                    All workers maintain safe attendance rates!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.absenceAnalysis?.map((ab: any) => (
                      <div key={ab.workerId} className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="block font-bold text-white text-xs">{ab.name}</span>
                          <span className="block text-[10px] text-zinc-500 font-semibold mt-0.5">{ab.trade}</span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider mb-1 ${
                            ab.impact === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400' :
                            ab.impact === 'HIGH' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {ab.impact} RISK
                          </span>
                          <span className="block text-xs font-black text-rose-400">{ab.absenceRate.toFixed(1)}% Absent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default AttendanceReportPage
