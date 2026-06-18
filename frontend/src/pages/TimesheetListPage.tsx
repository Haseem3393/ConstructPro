import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useProjects } from '../hooks/useProjects'
import { useTimesheets, useCreateTimesheet } from '../hooks/useTimesheets'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Plus, 
  Filter, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  ArrowRight,
  ClipboardList
} from 'lucide-react'

const TimesheetListPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filter States
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Create Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProjectId, setNewProjectId] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [createError, setCreateError] = useState('')

  // Data Queries
  const { data: projects } = useProjects()
  const { data: timesheets, isLoading, isFetching } = useTimesheets({
    projectId: selectedProject || undefined,
    status: selectedStatus || undefined,
  })

  const createTimesheetMutation = useCreateTimesheet()

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        )
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="h-3 w-3 mr-1" /> Submitted
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <FileText className="h-3 w-3 mr-1" /> Draft
          </span>
        )
    }
  }

  // Helper to adjust date to nearest Monday
  const getMonday = (d: Date) => {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const mon = new Date(d.setDate(diff))
    mon.setHours(0,0,0,0)
    return mon
  }

  const handleCreateTimesheet = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    if (!newProjectId || !newStartDate) {
      setCreateError('Please fill in all fields.')
      return
    }

    const selectedDate = new Date(newStartDate)
    // Validate if selected date is a Monday
    // Since JavaScript Date getDay() returns 0 for Sunday, 1 for Monday, etc.
    const day = selectedDate.getDay()
    if (day !== 1) {
      // Prompt user to adjust or suggest the correct Monday
      const nearestMonday = getMonday(new Date(selectedDate))
      const yyyy = nearestMonday.getFullYear()
      const mm = String(nearestMonday.getMonth() + 1).padStart(2, '0')
      const dd = String(nearestMonday.getDate()).padStart(2, '0')
      const formattedMon = `${yyyy}-${mm}-${dd}`
      
      setCreateError(`Start date must be a Monday. Suggested nearest Monday: ${formattedMon}`)
      return
    }

    try {
      await createTimesheetMutation.mutateAsync({
        projectId: newProjectId,
        startDate: newStartDate,
      })
      setIsCreateOpen(false)
      setNewProjectId('')
      setNewStartDate('')
    } catch (err: any) {
      setCreateError(err?.response?.data?.error || 'Failed to generate timesheet. A timesheet for this project and week may already exist.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Weekly Timesheets</h1>
            <p className="text-zinc-400 text-sm mt-1">Submit, review, and approve worker weekly timesheets</p>
          </div>
          
          {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'PROJECT_MANAGER') && (
            <button
              onClick={() => {
                setCreateError('')
                setIsCreateOpen(true)
              }}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-violet-600/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Timesheet
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-zinc-450 text-xs font-bold uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-zinc-550" /> Filter Timesheets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-[#1c1d26] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600"
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
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#1c1d26] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timesheets Table Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-350">Weekly Periods Registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">Loading timesheets...</p>
            </div>
          ) : !timesheets || timesheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <ClipboardList className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-500 text-sm font-medium">No weekly timesheets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6">WEEK PERIOD</th>
                    <th className="py-4 px-4">PROJECT</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-4 text-center">TOTAL HOURS</th>
                    <th className="py-4 px-4">PREPARED BY</th>
                    <th className="py-4 px-6 text-right w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {timesheets.map((ts) => (
                    <tr key={ts.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                          <span>
                            {formatDate(ts.startDate)} - {formatDate(ts.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-200">
                        {ts.project?.name}
                        <span className="block text-[10px] text-zinc-550 font-normal">{ts.project?.location}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(ts.status)}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-zinc-300">
                        {ts.totalHours} hrs
                      </td>
                      <td className="py-4 px-4 text-zinc-400">
                        {ts.submittedBy?.name || 'System'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/timesheets/${ts.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-850 hover:bg-[#1a1c24] text-zinc-300 hover:text-white border border-zinc-800 rounded font-bold text-[10px] uppercase tracking-wider transition-colors"
                        >
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Timesheet Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Generate Timesheet</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-bold">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  required
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                >
                  <option value="">Select Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-1.5">Week Start Date (Must be a Monday)</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>

              <div className="p-3.5 bg-violet-600/5 border border-violet-500/10 rounded-lg">
                <p className="text-[10px] text-violet-400 font-semibold leading-relaxed">
                  Note: Generating a timesheet will scan daily attendance check-ins between Monday and Sunday for the selected week, compiling them into a single ledger for approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-855 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 bg-[#1b1c25] border border-zinc-800 text-zinc-400 rounded-lg font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTimesheetMutation.isPending}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {createTimesheetMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default TimesheetListPage
