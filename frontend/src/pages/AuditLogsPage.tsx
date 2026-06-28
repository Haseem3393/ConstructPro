import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuditLogs } from '../hooks/useAudit'
import { useUsersList } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Search, 
  Calendar,
  AlertTriangle,
  History
} from 'lucide-react'

const AuditLogsPage: React.FC = () => {
  const { data: users } = useUsersList()
  
  // Filter States
  const [selectedUserId, setSelectedUserId] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  const { data: logs, isLoading } = useAuditLogs({
    userId: selectedUserId || undefined,
    moduleName: moduleName || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const modules = [
    { value: 'Project', label: 'Projects Module' },
    { value: 'Task', label: 'Tasks Timelines' },
    { value: 'Material', label: 'Materials Registry' },
    { value: 'Machinery', label: 'Machinery Fleets' },
    { value: 'Expense', label: 'Expense Ledgers' },
    { value: 'Payment', label: 'Payments Milestones' },
    { value: 'Contract', label: 'Contracts Registry' },
    { value: 'ChangeOrder', label: 'Change Orders' },
    { value: 'Attendance', label: 'Attendance Logs' },
    { value: 'Settings', label: 'Settings configurations' }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center">
            <History className="h-7 w-7 mr-2 text-violet-500" /> Administrative Audit Logs
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Review immutable, chronological records of all project creations, attendance updates, cost edits, and contract approvals.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* User filter */}
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">User Filter</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            >
              <option value="">All Users</option>
              {users?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Module Filter</label>
            <select
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-650 cursor-pointer"
            />
          </div>

          {/* Search bar */}
          <div>
            <label className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-violet-650"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Synthesizing audit database records...</p>
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30">
              <h3 className="font-extrabold text-sm text-zinc-350">Chronological System Events</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3 px-6 w-48">TIMESTAMP</th>
                    <th className="py-3 px-4 w-40">USER</th>
                    <th className="py-3 px-4 w-28 text-center">ACTION</th>
                    <th className="py-3 px-4 w-36">MODULE</th>
                    <th className="py-3 px-6">DETAILS / SPECIFICS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {logs?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-zinc-400">{formatDate(log.timestamp)}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{log.userName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                          log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-755">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-zinc-300 font-medium leading-normal">{log.details}</td>
                    </tr>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-550 text-xs font-semibold">
                        No activity logs match the specified search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default AuditLogsPage
