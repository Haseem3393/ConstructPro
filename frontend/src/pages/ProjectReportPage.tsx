import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  FolderKanban, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

const ProjectReportPage: React.FC = () => {
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Date filters (applied on client side to tasks/milestones)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const { data: report, isLoading: isReportLoading } = useProjectReport(selectedProjectId)

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter tasks & milestones on client side based on date range input
  const filteredTasks = report?.tasks?.filter((t: any) => {
    if (!startDate && !endDate) return true
    const taskDate = new Date(t.dueDate)
    if (startDate && taskDate < new Date(startDate)) return false
    if (endDate && taskDate > new Date(endDate)) return false
    return true
  }) || []

  const filteredMilestones = report?.milestones?.filter((m: any) => {
    if (!startDate && !endDate) return true
    const milestoneDate = new Date(m.dueDate)
    if (startDate && milestoneDate < new Date(startDate)) return false
    if (endDate && milestoneDate > new Date(endDate)) return false
    return true
  }) || []

  // Add item to local download history
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
    if (!report) return
    const headers = ['Type', 'Title/Name', 'Due Date', 'Status', 'Details']
    const rows: any[] = []

    filteredTasks.forEach((t: any) => {
      rows.push(['Task', t.title, new Date(t.dueDate).toLocaleDateString(), t.status, t.priority || 'NORMAL'])
    })

    filteredMilestones.forEach((m: any) => {
      rows.push(['Milestone', m.name, new Date(m.dueDate).toLocaleDateString(), m.completed ? 'COMPLETED' : 'PENDING', m.description || ''])
    })

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${report.name}_project_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    logDownload(`${report.name} Project Report`)
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
              <h1 className="text-3xl font-black text-white">Project Status Report</h1>
              <p className="text-zinc-400 text-xs mt-1">
                Analyze single-project schedules, tasks pending, team sizes, and milestone compliance records.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isReportLoading || !report}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-zinc-805 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Select Project</label>
            {isProjectsLoading ? (
              <div className="text-xs text-zinc-550">Loading projects...</div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
              >
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>
        </div>

        {/* Report Body */}
        {isReportLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Aggregating project summary details...</p>
          </div>
        ) : !report ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            Please select a project to load the report.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Progress Rate</span>
                <span className="block text-2xl font-black text-violet-400">{report.progress}%</span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Tasks Done/Pending</span>
                <span className="block text-xl font-extrabold text-white">
                  {report.tasksCompleted} <span className="text-zinc-550 text-xs font-bold">/ {report.tasksPending} pending</span>
                </span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Milestones Completed</span>
                <span className="block text-xl font-extrabold text-white">
                  {report.milestonesCompleted} <span className="text-zinc-555 text-xs font-bold">/ {report.milestonesTotal}</span>
                </span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Team Size</span>
                <span className="block text-2xl font-black text-white">{report.teamSize} members</span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Timeline Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1.5 ${
                  report.timelineStatus === 'DELAYED' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {report.timelineStatus === 'DELAYED' ? 'Delayed / Critical' : 'On Time'}
                </span>
              </div>
            </div>

            {/* Task Checklist details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Tasks Summary */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-zinc-350">Tasks Timeline</h3>
                  <span className="text-[10px] font-black text-zinc-550">{filteredTasks.length} active</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                        <th className="py-3 px-6">TASK TITLE</th>
                        <th className="py-3 px-4">DUE DATE</th>
                        <th className="py-3 px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs">
                      {filteredTasks.map((t: any) => (
                        <tr key={t.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-zinc-200">{t.title}</td>
                          <td className="py-3.5 px-4 text-zinc-400 font-semibold">{formatDate(t.dueDate)}</td>
                          <td className="py-3.5 px-6 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              t.status === 'DONE' ? 'bg-green-500/10 text-green-400' :
                              t.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredTasks.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550">No tasks logged in this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Milestones Summary */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-zinc-350">Milestones Registry</h3>
                  <span className="text-[10px] font-black text-zinc-550">{filteredMilestones.length} logged</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                        <th className="py-3 px-6">MILESTONE NAME</th>
                        <th className="py-3 px-4">DUE DATE</th>
                        <th className="py-3 px-6 text-right">COMPLIANCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs">
                      {filteredMilestones.map((m: any) => (
                        <tr key={m.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-zinc-200">
                            <span className="block">{m.name}</span>
                            {m.description && <span className="block text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">{m.description}</span>}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-semibold">{formatDate(m.dueDate)}</td>
                          <td className="py-3.5 px-6 text-right">
                            {m.completed ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black bg-zinc-800 text-zinc-500 uppercase tracking-wider">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredMilestones.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550">No milestones set in this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ProjectReportPage
