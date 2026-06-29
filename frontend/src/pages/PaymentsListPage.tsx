import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePaymentsList } from '../hooks/useContracts'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Loader2, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  TrendingDown,
  Building,
  TrendingUp,
  Clock
} from 'lucide-react'

const PaymentsListPage: React.FC = () => {
  // Filters
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data, isLoading, isError } = usePaymentsList({
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
      case 'PAID':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Paid
          </span>
        )
      case 'DUE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/22">
            Due
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
            Pending
          </span>
        )
    }
  }

  const formatPercentageName = (pctName: string) => {
    switch (pctName) {
      case 'FOUNDATION_25':
        return 'Foundation Complete (25%)'
      case 'STRUCTURE_35':
        return 'Structure Complete (35%)'
      case 'ROOFING_25':
        return 'Roofing Complete (25%)'
      case 'HANDOVER_15':
        return 'Final Handover (15%)'
      default:
        return pctName
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Milestones</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Audit scheduled project billing milestones, client receivables, and subcontractor payment schedules</p>
        </div>

        {/* Total Outstanding Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="space-y-1">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Outstanding Receivables Schedule</span>
            <span className="block text-3xl font-black text-[#00d2ff]">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed] inline-block" />
              ) : (
                formatCurrency(data?.totalDue || 0)
              )}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Project */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Site</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Schedule Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending (Scheduled)</option>
                <option value="DUE">Due (Milestone Approved)</option>
                <option value="PAID">Paid (Cleared)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading payments ledger...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load payment schedules.
          </div>
        ) : !data?.payments || data.payments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            No payment records matching search filters.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3.5 px-6">PROJECT</th>
                    <th className="py-3.5 px-4">PAYMENT CLIENT / CONTRACT</th>
                    <th className="py-3.5 px-4">MILESTONE PERCENTAGE</th>
                    <th className="py-3.5 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-3.5 px-4">DUE DATE</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {data.payments.map((p) => {
                    const clientName = p.contract?.clientName || 'Generic Client'
                    const contractType = p.contract?.type === 'MAIN' ? 'Main Contract' : 'Subcontract'

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Project */}
                        <td className="py-4 px-6 font-extrabold text-white">{p.project?.name}</td>

                        {/* Client / Contract */}
                        <td className="py-4 px-4">
                          <span className="block text-slate-200 font-bold">{clientName}</span>
                          <span className="block text-[9px] text-slate-550 font-black uppercase mt-0.5">{contractType}</span>
                        </td>

                        {/* Milestone percentage */}
                        <td className="py-4 px-4 font-bold text-slate-400">
                          {formatPercentageName(p.percentage)}
                        </td>

                        {/* Amount LKR */}
                        <td className="py-4 px-4 text-right text-[#00d2ff] font-black text-sm tabular-nums">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-4 text-slate-400 font-semibold">{p.dueDate ? formatDate(p.dueDate) : '-'}</td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {getStatusBadge(p.status)}
                        </td>

                        {/* Action link */}
                        <td className="py-4 px-6">
                          <Link
                            to={`/payments/${p.id}`}
                            className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-[#00d2ff] transition-colors cursor-pointer"
                          >
                            Payment Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PaymentsListPage
