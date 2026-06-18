import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorkerDetails, useWorkerAttendance } from '../hooks/useWorkers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  Briefcase, 
  Phone, 
  MapPin, 
  CheckCircle,
  XCircle,
  FileSpreadsheet
} from 'lucide-react'

const WorkerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  const { data: worker, isLoading: isWorkerLoading, error: workerError } = useWorkerDetails(id || '')
  const { data: attendanceHistory, isLoading: isAttendanceLoading } = useWorkerAttendance(id || '')

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (isWorkerLoading || isAttendanceLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Retrieving tradesman profile data...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (workerError || !worker) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/25 p-6 rounded-xl text-center text-rose-400 font-bold max-w-lg mx-auto">
          Worker not found or error loading profile.
        </div>
      </SidebarLayout>
    )
  }

  // Calculations
  const attendanceRecords = attendanceHistory || []
  const totalDaysPresent = attendanceRecords.filter(r => r.present).length
  const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0)
  const totalLifetimeEarnings = attendanceRecords.reduce((sum, r) => sum + r.totalPay, 0)

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/workers"
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Worker Profile</h1>
            <p className="text-zinc-400 text-sm mt-1">Detailed attendance records, skill category, and historical earnings</p>
          </div>
        </div>

        {/* Worker Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bio Info Card */}
          <div className="lg:col-span-1 bg-[#14161f] border border-zinc-800 rounded-xl p-6 relative overflow-hidden shadow-xl space-y-5">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-blue-600"></div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-2xl text-blue-400">
                {worker.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{worker.name}</h3>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {worker.trade}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Hourly Wage Equiv</span>
                <span className="text-zinc-200 font-semibold">{formatCurrency(worker.dailyWage / 8)}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Base Daily Rate</span>
                <span className="text-zinc-200 font-semibold">{formatCurrency(worker.dailyWage)}/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Active Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  worker.active 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700/30'
                }`}>
                  {worker.active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-5 space-y-3">
              <div className="flex items-center text-xs text-zinc-400">
                <Phone className="h-4 w-4 text-zinc-600 mr-2.5 shrink-0" />
                <span className="truncate">{worker.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-start text-xs text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-600 mr-2.5 mt-0.5 shrink-0" />
                <span>{worker.address || 'No address recorded'}</span>
              </div>
            </div>
          </div>

          {/* Stats Indicators Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-600"></div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Days Logged</span>
              <span className="block text-4xl font-black text-white">{totalDaysPresent}</span>
              <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1 pt-4">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span>Present on-site</span>
              </div>
            </div>

            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600"></div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Overtime Hours</span>
              <span className="block text-4xl font-black text-white">{totalOvertimeHours} hrs</span>
              <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1 pt-4">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>1.5x hourly rate pay</span>
              </div>
            </div>

            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500"></div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Earned</span>
              <span className="block text-3xl font-black text-white">{formatCurrency(totalLifetimeEarnings)}</span>
              <div className="flex items-center text-[10px] text-zinc-400 font-semibold uppercase space-x-1 pt-4">
                <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                <span>Gross payroll ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Ledger Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-300 font-sans flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-violet-500" />
              Attendance & Payout Logs
            </h3>
            <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded font-bold">
              {attendanceRecords.length} records found
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">LOG DATE</th>
                  <th className="py-4 px-6">ASSIGNED PROJECT</th>
                  <th className="py-4 px-4 text-center">CHECK-IN STATUS</th>
                  <th className="py-4 px-4 text-center">OVERTIME LOG</th>
                  <th className="py-4 px-6 text-right">TOTAL PAYOUT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {attendanceRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-[#181a24]/30 transition-colors">
                    <td className="py-4 px-6 text-center text-xs text-zinc-550 font-semibold">{index + 1}</td>
                    <td className="py-4 px-6 text-xs text-zinc-300 font-bold">{formatDate(record.date)}</td>
                    <td className="py-4 px-6 text-xs text-white font-bold">{record.project?.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        record.present 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {record.present ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Present
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" /> Absent
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-zinc-400">
                      {record.overtimeHours > 0 ? (
                        <span className="font-semibold text-violet-400">{record.overtimeHours} hrs</span>
                      ) : (
                        <span className="text-zinc-650">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right text-xs font-black text-white">
                      {formatCurrency(record.totalPay)}
                    </td>
                  </tr>
                ))}
                {attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs font-semibold">
                      No attendance logs recorded for this worker.
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

export default WorkerDetailsPage
