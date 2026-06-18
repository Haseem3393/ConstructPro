import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useProjects } from '../hooks/useProjects'
import { useAttendance, useSaveAttendance } from '../hooks/useAttendance'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Save, 
  Search,
  Check,
  UserX
} from 'lucide-react'

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  // Fetch projects list
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const [selectedProject, setSelectedProject] = useState('')

  // Set default project when loaded
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  // Fetch attendance for selected project & date
  const { data: serverRecords, isLoading: isAttendanceLoading, isFetching } = useAttendance(
    selectedProject,
    selectedDate
  )

  const [attendanceList, setAttendanceList] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Search state to filter workers in the grid
  const [searchName, setSearchName] = useState('')
  const [searchTrade, setSearchTrade] = useState('')

  const saveMutation = useSaveAttendance()

  // Sync server data to local edit state
  useEffect(() => {
    if (serverRecords) {
      setAttendanceList(serverRecords)
    }
  }, [serverRecords])

  const toggleAttendance = (workerId: string) => {
    setAttendanceList((prev) =>
      prev.map((worker) => {
        if (worker.workerId === workerId) {
          const nextPresent = !worker.present
          return {
            ...worker,
            present: nextPresent,
            overtimeHours: nextPresent ? worker.overtimeHours : 0, // Reset overtime if absent
          }
        }
        return worker
      })
    )
  }

  const handleOvertimeChange = (workerId: string, hoursStr: string) => {
    let hours = parseFloat(hoursStr)
    if (isNaN(hours) || hours < 0) hours = 0
    if (hours > 24) hours = 24

    setAttendanceList((prev) =>
      prev.map((worker) => {
        if (worker.workerId === workerId) {
          return {
            ...worker,
            overtimeHours: hours,
          }
        }
        return worker
      })
    )
  }

  const calculateTotalPay = (worker: any) => {
    if (!worker.present) return 0
    const hourlyRate = worker.dailyWage / 8
    const overtimePay = worker.overtimeHours ? hourlyRate * 1.5 * worker.overtimeHours : 0
    return worker.dailyWage + overtimePay
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const isFutureDate = selectedDate > todayStr
  const isClean = !!serverRecords && JSON.stringify(attendanceList) === JSON.stringify(serverRecords)

  const handleSave = async () => {
    setStatusMessage(null)
    if (!selectedProject || !selectedDate) return
    if (isFutureDate) {
      setStatusMessage({ type: 'error', text: 'Cannot log attendance for future dates.' })
      return
    }

    try {
      const recordsToSave = attendanceList.map((worker) => ({
        workerId: worker.workerId,
        present: worker.present,
        overtimeHours: worker.overtimeHours || 0,
        dailyWage: worker.dailyWage,
      }))

      await saveMutation.mutateAsync({
        projectId: selectedProject,
        date: selectedDate,
        records: recordsToSave,
      })

      setStatusMessage({ type: 'success', text: 'Attendance record saved successfully!' })
      setTimeout(() => setStatusMessage(null), 4000)
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to save attendance logs.',
      })
    }
  }

  const filteredAttendance = attendanceList.filter(worker => {
    const matchesName = worker.name.toLowerCase().includes(searchName.toLowerCase())
    const matchesTrade = worker.trade.toLowerCase().includes(searchTrade.toLowerCase())
    return matchesName && matchesTrade
  })

  const presentCount = attendanceList.filter((w) => w.present).length

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Daily Timesheets</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage and audit labor wages and overtime allocations</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Select Period & Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Calendar Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setStatusMessage(null)
                  }}
                  className="pl-10 w-full bg-[#1c1d26] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Construction Project</label>
              {isProjectsLoading ? (
                <div className="flex items-center h-11">
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin mr-2" />
                  <span className="text-xs text-zinc-500">Loading projects...</span>
                </div>
              ) : (
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value)
                    setStatusMessage(null)
                  }}
                  className="w-full bg-[#1c1d26] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-violet-600 bg-none"
                >
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.location}
                    </option>
                  ))}
                  {projects?.length === 0 && <option value="">No projects created yet</option>}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
            } text-xs font-bold tracking-wide`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Timesheet List Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-zinc-400" />
              <h3 className="font-bold text-sm text-zinc-350">Worker Registry & Payroll</h3>
            </div>
            {isFetching && (
              <span className="flex items-center text-[10px] text-violet-400 font-bold uppercase tracking-wider animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Syncing...
              </span>
            )}
          </div>

          {isAttendanceLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">Reading attendance logs...</p>
            </div>
          ) : !selectedProject ? (
            <div className="p-10 text-center text-zinc-500 text-sm font-medium">
              Create a construction site in Projects Module to log timesheets.
            </div>
          ) : attendanceList.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 text-sm font-medium">
              No workers registered in database. Run database seeds or add workers.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  {/* Columns Labels */}
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6 w-12 text-center">ID</th>
                    <th className="py-4 px-6">WORKER NAME</th>
                    <th className="py-4 px-4">TRADE</th>
                    <th className="py-4 px-4 text-right">DAILY WAGE</th>
                    <th className="py-4 px-4 text-center">OVERTIME HOURS</th>
                    <th className="py-4 px-4 text-right">CALCULATED PAY</th>
                    <th className="py-4 px-6 text-center w-40">ACTIONS</th>
                  </tr>
                  {/* Inline search fields */}
                  <tr className="bg-[#161822]/40 border-b border-zinc-805">
                    <td className="py-2.5 px-4 text-center text-zinc-650 font-bold">-</td>
                    <td className="py-2.5 px-6">
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Search trade..."
                        value={searchTrade}
                        onChange={(e) => setSearchTrade(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
                      />
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {filteredAttendance.map((worker, index) => (
                    <tr 
                      key={worker.workerId} 
                      className={`transition-colors ${
                        worker.present 
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10' 
                          : 'hover:bg-[#1a1c27]/30'
                      }`}
                    >
                      <td className="py-4 px-6 text-center font-bold text-zinc-500">{index + 1}</td>
                      <td className="py-4 px-6">
                        <span className="block font-bold text-white text-sm">{worker.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-zinc-300 bg-zinc-800 rounded uppercase tracking-wide">
                          {worker.trade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-zinc-300">
                        {worker.dailyWage.toLocaleString()} LKR
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          disabled={!worker.present}
                          min="0"
                          max="24"
                          step="0.5"
                          value={worker.present ? worker.overtimeHours : ''}
                          onChange={(e) => handleOvertimeChange(worker.workerId, e.target.value)}
                          placeholder="0.0"
                          className="w-16 px-2 py-1 bg-[#1b1c25] border border-zinc-800 rounded focus:ring-1 focus:ring-violet-600 focus:outline-none disabled:opacity-40 disabled:bg-zinc-900 text-center text-zinc-300 font-semibold"
                        />
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-violet-400">
                        {calculateTotalPay(worker).toLocaleString()} LKR
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleAttendance(worker.workerId)}
                          className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all inline-flex items-center space-x-1.5 ${
                            worker.present
                              ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                              : 'bg-rose-600/15 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white'
                          }`}
                        >
                          {worker.present ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">No Timesheet records matching search parameters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Save Row */}
          <div className="px-6 py-4 bg-[#171924]/20 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
              Present Summary: <span className="text-emerald-400 font-extrabold">{presentCount}</span> / {attendanceList.length} Workers Logged
            </div>
            {isClean ? (
              <span className="flex items-center text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Synced with Server
              </span>
            ) : (
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Timesheet
              </button>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default AttendancePage
