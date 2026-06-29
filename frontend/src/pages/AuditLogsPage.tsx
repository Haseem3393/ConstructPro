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
        <div className="border-b border-white/10 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center tracking-tight">
            <History className="h-7 w-7 mr-2 text-[#7c3aed]" /> Administrative Audit Logs
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Review immutable, chronological records of all project creations, attendance updates, cost edits, and contract approvals.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          {/* User filter */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">User Filter</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Users</option>
              {users?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Module Filter</label>
            <select
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Modules</option>
              {modules.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Search bar */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Synthesizing audit database records...</p>
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Chronological System Events</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3 px-6 w-48">TIMESTAMP</th>
                    <th className="py-3 px-4 w-40">USER</th>
                    <th className="py-3 px-4 w-28 text-center">ACTION</th>
                    <th className="py-3 px-4 w-36">MODULE</th>
                    <th className="py-3 px-6">DETAILS / SPECIFICS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                  {logs?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-3.5 px-6 font-semibold text-slate-400">{formatDate(log.timestamp)}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{log.userName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                          log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' :
                          log.action === 'UPDATE' ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/22' :
                          'bg-rose-500/10 text-rose-455 border-rose-500/22'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-zinc-300 font-medium leading-normal">{log.details}</td>
                    </tr>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest bg-[#0d1322]/70">
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
