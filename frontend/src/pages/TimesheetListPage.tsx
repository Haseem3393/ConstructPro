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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-455 border border-rose-500/22">
            <AlertCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        )
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/10 text-blue-405 border border-blue-500/22">
            <Clock className="h-3 w-3 mr-1" /> Submitted
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-500/10 text-slate-400 border border-slate-500/22">
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Weekly Timesheets</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Submit, review, and approve worker weekly timesheets</p>
          </div>
          
          {(user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'PROJECT_MANAGER') && (
            <button
              onClick={() => {
                setCreateError('')
                setIsCreateOpen(true)
              }}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Timesheet
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-500" /> Filter Timesheets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs text-slate-250 focus:outline-none transition-all font-semibold cursor-pointer"
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
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs text-slate-250 focus:outline-none transition-all font-semibold cursor-pointer"
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
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-350">Weekly Periods Registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-[#7c3aed] animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
              <p className="text-slate-500 text-sm font-semibold">Loading timesheets...</p>
            </div>
          ) : !timesheets || timesheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <ClipboardList className="h-12 w-12 text-slate-700 animate-pulse" />
              <p className="text-slate-500 text-sm font-semibold">No weekly timesheets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">WEEK PERIOD</th>
                    <th className="py-4 px-4">PROJECT</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-4 text-center">TOTAL HOURS</th>
                    <th className="py-4 px-4">PREPARED BY</th>
                    <th className="py-4 px-6 text-right w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {timesheets.map((ts) => (
                    <tr key={ts.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-[#7c3aed] shrink-0" />
                          <span>
                            {formatDate(ts.startDate)} - {formatDate(ts.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {ts.project?.name}
                        <span className="block text-[10px] text-slate-500 font-normal">{ts.project?.location}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(ts.status)}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-zinc-300">
                        {ts.totalHours} hrs
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {ts.submittedBy?.name || 'System'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/timesheets/${ts.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322]/90 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">Generate Timesheet</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="p-6 space-y-4">
              {createError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Week Start Date (Must be a Monday)</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-[#7c3aed]/5 border border-[#7c3aed]/10 rounded-xl">
                <p className="text-[10px] text-[#00d2ff] font-semibold leading-relaxed">
                  Note: Generating a timesheet will scan daily attendance check-ins between Monday and Sunday for the selected week, compiling them into a single ledger for approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 bg-[#0a0f1d]/60 hover:bg-[#7c3aed]/10 border border-white/10 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTimesheetMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createTimesheetMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" /> : <Plus className="h-4 w-4 mr-2" />}
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
