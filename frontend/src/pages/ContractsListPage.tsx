import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContractsList } from '../hooks/useContracts'
import { useProjects } from '../hooks/useProjects'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Loader2, 
  Search, 
  Building, 
  Calendar, 
  DollarSign, 
  FileText,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

const ContractsListPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filter States
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data: contracts, isLoading, isError } = useContractsList({
    projectId: projectId || undefined,
    status: status || undefined,
  })

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/22">
            Active
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Terminated
          </span>
        )
    }
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Contracts Registry</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage main client contracts, subcontractor legal binders, and values tracking</p>
          </div>

          {isEditable && (
            <Link
              to="/contracts/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> New Contract
            </Link>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Project Filter */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Contract Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Synchronizing contracts database...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load contracts data from server.
          </div>
        ) : !contracts || contracts.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            No contracts matching the selected filters.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">PROJECT</th>
                    <th className="py-4 px-4">TYPE</th>
                    <th className="py-4 px-4">CLIENT / PAYEE</th>
                    <th className="py-4 px-4 text-right">VALUE (LKR)</th>
                    <th className="py-4 px-4">TIMELINE START / END</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.015] transition-colors group">
                      {/* Project Name */}
                      <td className="py-4 px-6 font-extrabold text-white">
                        {c.project?.name}
                      </td>

                      {/* Contract Type */}
                      <td className="py-4 px-4 font-semibold">
                        {c.type === 'MAIN' ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22">
                            Main Client
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-455 border border-amber-500/22">
                            Subcontract
                          </span>
                        )}
                      </td>

                      {/* Client / Payee Name */}
                      <td className="py-4 px-4 text-slate-300 font-bold">
                        <span>{c.clientName}</span>
                        {c.subcontractor && (
                          <span className="block text-[9px] text-slate-550 font-bold mt-0.5">Sub: {c.subcontractor.name}</span>
                        )}
                      </td>

                      {/* Value LKR */}
                      <td className="py-4 px-4 text-right text-[#00d2ff] font-black text-sm tabular-nums">
                        {formatCurrency(c.value)}
                      </td>

                      {/* Timeline dates */}
                      <td className="py-4 px-4 text-slate-400 font-semibold leading-normal">
                        <span className="block text-slate-300">{formatDate(c.startDate)}</span>
                        <span className="block text-[10px] text-slate-550 font-bold mt-0.5">To {formatDate(c.endDate)}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(c.status)}
                      </td>

                      {/* Action trigger */}
                      <td className="py-4 px-6">
                        <Link 
                          to={`/contracts/${c.id}`}
                          className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-[#00d2ff] transition-colors cursor-pointer"
                        >
                          Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ContractsListPage
