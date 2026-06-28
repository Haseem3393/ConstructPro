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
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Retrieving tradesman profile data...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (workerError || !worker) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 p-6 rounded-2xl text-center text-rose-455 font-bold max-w-lg mx-auto mt-16 relative">
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
        <div className="flex items-center space-x-4 border-b border-[#1a2535] pb-5">
          <Link
            to="/workers"
            className="p-2.5 bg-[#0d1526] border border-[#1a2535] rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Worker Profile</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Detailed attendance records, skill category, and historical earnings</p>
          </div>
        </div>

        {/* Worker Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bio Info Card */}
          <div className="lg:col-span-1 bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 relative overflow-hidden shadow-xl space-y-5">
            <div className="absolute top-0 left-0 w-[4px] h-full bg-blue-500"></div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/22 flex items-center justify-center font-bold text-2xl text-blue-400">
                {worker.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{worker.name}</h3>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/22">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {worker.trade}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1a2535] pt-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Hourly Wage Equiv</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(worker.dailyWage / 8)}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Base Daily Rate</span>
                <span className="text-slate-200 font-semibold">{formatCurrency(worker.dailyWage)}/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Active Status</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  worker.active 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                    : 'bg-slate-800 text-slate-400 border border-[#1a2535]'
                }`}>
                  {worker.active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1a2535] pt-5 space-y-3">
              <div className="flex items-center text-xs text-slate-400">
                <Phone className="h-4 w-4 text-slate-650 mr-2.5 shrink-0" />
                <span className="truncate">{worker.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-start text-xs text-slate-400">
                <MapPin className="h-4 w-4 text-slate-650 mr-2.5 mt-0.5 shrink-0" />
                <span>{worker.address || 'No address recorded'}</span>
              </div>
            </div>
          </div>

          {/* Stats Indicators Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500"></div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Days Logged</span>
              <span className="block text-4xl font-black text-white">{totalDaysPresent}</span>
              <div className="flex items-center text-[10px] text-slate-400 font-semibold uppercase space-x-1 pt-4">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Present on-site</span>
              </div>
            </div>

            <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500"></div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Overtime Hours</span>
              <span className="block text-4xl font-black text-white">{totalOvertimeHours} hrs</span>
              <div className="flex items-center text-[10px] text-slate-400 font-semibold uppercase space-x-1 pt-4">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>1.5x hourly rate pay</span>
              </div>
            </div>

            <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500"></div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Earned</span>
              <span className="block text-3xl font-black text-white">{formatCurrency(totalLifetimeEarnings)}</span>
              <div className="flex items-center text-[10px] text-slate-400 font-semibold uppercase space-x-1 pt-4">
                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                <span>Gross payroll ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Ledger Table */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005] flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-350 flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
              Attendance & Payout Logs
            </h3>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {attendanceRecords.length} records found
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] text-slate-655 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">LOG DATE</th>
                  <th className="py-4 px-6">ASSIGNED PROJECT</th>
                  <th className="py-4 px-4 text-center">CHECK-IN STATUS</th>
                  <th className="py-4 px-4 text-center">OVERTIME LOG</th>
                  <th className="py-4 px-6 text-right">TOTAL PAYOUT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2535]">
                {attendanceRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-center text-xs text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-4 px-6 text-xs text-slate-300 font-bold">{formatDate(record.date)}</td>
                    <td className="py-4 px-6 text-xs text-white font-bold">{record.project?.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        record.present 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' 
                          : 'bg-rose-500/10 text-rose-450 border border-rose-500/22'
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
                    <td className="py-4 px-4 text-center text-xs text-slate-400">
                      {record.overtimeHours > 0 ? (
                        <span className="font-bold text-blue-400">{record.overtimeHours} hrs</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right text-xs font-black text-white tabular-nums">
                      {formatCurrency(record.totalPay)}
                    </td>
                  </tr>
                ))}
                {attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-black uppercase tracking-wider">
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
