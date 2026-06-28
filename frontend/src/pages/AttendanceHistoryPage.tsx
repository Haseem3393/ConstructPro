import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useProjects } from '../hooks/useProjects'
import { useWorkersList } from '../hooks/useWorkers'
import { useAttendanceHistory, useUpdateAttendance } from '../hooks/useAttendance'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Calendar, 
  Users, 
  Loader2, 
  Download, 
  Edit3, 
  Filter, 
  X, 
  Save, 
  AlertTriangle 
} from 'lucide-react'

const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filter States
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Edit Modal States
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [editPresent, setEditPresent] = useState(false)
  const [editOvertime, setEditOvertime] = useState('0')
  const [editWage, setEditWage] = useState('0')
  const [editError, setEditError] = useState('')

  // Data Queries
  const { data: projects } = useProjects()
  const { data: workers } = useWorkersList()
  const { data: historyRecords, isLoading, isFetching } = useAttendanceHistory({
    projectId: selectedProject || undefined,
    workerId: selectedWorker || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const updateAttendanceMutation = useUpdateAttendance()

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  // Edit Permissions Check
  const canUserEdit = (record: any) => {
    if (user?.role === 'ADMIN') return true
    if (user?.role === 'PROJECT_MANAGER') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const recordDate = new Date(record.date)
      recordDate.setHours(0, 0, 0, 0)
      const diffTime = today.getTime() - recordDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 3
    }
    return false
  }

  // CSV Export
  const handleExportCSV = () => {
    if (!historyRecords || historyRecords.length === 0) return

    const headers = ['Date', 'Worker', 'Trade', 'Project', 'Status', 'Overtime Hours', 'Total Pay (LKR)']
    const rows = historyRecords.map((r) => [
      new Date(r.date).toLocaleDateString(),
      r.workerName,
      r.trade,
      r.projectName,
      r.present ? 'Present' : 'Absent',
      r.overtimeHours,
      r.totalPay,
    ])

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ConstructPro_Attendance_History_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle Edit Action
  const handleOpenEdit = (record: any) => {
    setEditingRecord(record)
    setEditPresent(record.present)
    setEditOvertime(record.overtimeHours.toString())
    // Find daily wage from record or find in worker registry
    const matchedWorker = workers?.find(w => w.id === record.workerId)
    setEditWage(matchedWorker?.dailyWage.toString() || '2000')
    setEditError('')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')

    if (!editingRecord) return

    const overtime = parseFloat(editOvertime)
    const wage = parseFloat(editWage)

    if (isNaN(overtime) || overtime < 0 || overtime > 24) {
      setEditError('Overtime hours must be between 0 and 24')
      return
    }

    if (isNaN(wage) || wage <= 0) {
      setEditError('Daily wage must be a positive number')
      return
    }

    try {
      await updateAttendanceMutation.mutateAsync({
        id: editingRecord.id,
        data: {
          present: editPresent,
          overtimeHours: editPresent ? overtime : 0,
          dailyWage: wage,
        },
      })
      setEditingRecord(null)
    } catch (err: any) {
      setEditError(err?.response?.data?.error || 'Failed to update record')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#1a2535] pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Attendance Audit History</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Review historic worker check-ins and wage logs</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!historyRecords || historyRecords.length === 0}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-[#1a2535] bg-[#0b1220] hover:bg-[#111d33] text-slate-350 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.14em] flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-700" /> Filter Logs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-2">Worker</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2 text-xs text-slate-355 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              >
                <option value="">All Workers</option>
                {workers?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* History Table Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005] flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-350">Attendance Audit Ledger</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="h-9 w-9 text-blue-500 animate-spin" />
                <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading history records...</p>
            </div>
          ) : !historyRecords || historyRecords.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-black uppercase tracking-wider">
              No matching attendance logs found in the selected range.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-655 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-4">WORKER</th>
                    <th className="py-4 px-4">PROJECT</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-4 text-center">OVERTIME</th>
                    <th className="py-4 px-4 text-right">TOTAL PAY</th>
                    {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                      <th className="py-4 px-6 text-right w-28">ACTIONS</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535] text-xs">
                  {historyRecords.map((record: any) => {
                    const editable = canUserEdit(record)
                    return (
                      <tr key={record.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {record.workerName}
                          <span className="block text-[10px] text-slate-550 font-semibold">{record.trade}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{record.projectName}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            record.present 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' 
                              : 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-300">
                          {record.overtimeHours} hrs
                        </td>
                        <td className="py-4 px-4 text-right font-black text-white tabular-nums">
                          {formatCurrency(record.totalPay)}
                        </td>
                        {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                          <td className="py-4 px-6 text-right">
                            {editable ? (
                              <button
                                onClick={() => handleOpenEdit(record)}
                                className="p-1.5 bg-[#0b1220] hover:bg-[#111d33] text-slate-400 hover:text-blue-400 border border-[#1a2535] rounded-lg transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Locked</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Confirmation Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
            <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">Edit Attendance Log</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                  {editError}
                </div>
              )}

              <div className="bg-[#0b1220] border border-[#1a2535] p-4 rounded-xl space-y-1">
                <span className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.14em]">Selected Log</span>
                <span className="block text-white font-extrabold">{editingRecord.workerName}</span>
                <span className="block text-slate-400 text-xs font-semibold">
                  {editingRecord.projectName} • {new Date(editingRecord.date).toLocaleDateString()}
                </span>
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-2">Check-in Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPresent(true)}
                    className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                      editPresent 
                        ? 'bg-emerald-500/10 border-emerald-500/22 text-emerald-400' 
                        : 'bg-[#0b1220] border-[#1a2535] text-slate-550 hover:text-slate-200 hover:bg-[#111d33]'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPresent(false)
                      setEditOvertime('0')
                    }}
                    className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                      !editPresent 
                        ? 'bg-rose-500/10 border-rose-500/22 text-rose-455' 
                        : 'bg-[#0b1220] border-[#1a2535] text-slate-550 hover:text-slate-200 hover:bg-[#111d33]'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              {/* Overtime Hours input */}
              {editPresent && (
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Overtime Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    required
                    value={editOvertime}
                    onChange={(e) => setEditOvertime(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all font-semibold"
                  />
                </div>
              )}

              {/* Daily Wage input */}
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Daily Wage (LKR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editWage}
                  onChange={(e) => setEditWage(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1a2535] flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 bg-[#0b1220] hover:bg-[#111d33] border border-[#1a2535] text-slate-350 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAttendanceMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
                >
                  {updateAttendanceMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default AttendanceHistoryPage
