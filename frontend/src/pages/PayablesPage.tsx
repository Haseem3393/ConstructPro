import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePayablesList } from '../hooks/useFinance'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Loader2, 
  AlertTriangle,
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

const PayablesPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filter state
  const [statusFilter, setStatusFilter] = useState('')

  // Queries
  const { data, isLoading, isError } = usePayablesList(statusFilter || undefined)

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
      case 'OVERDUE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22 animate-pulse">
            Overdue
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/22">
            Pending
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
            <h1 className="text-3xl font-black text-white tracking-tight">Accounts Payable</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Track pending invoices, sub-contractor bills, and outstanding payables liabilities</p>
          </div>

          {isEditable && (
            <Link
              to="/payables/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> New Payable
            </Link>
          )}
        </div>

        {/* Outstanding Liability metrics */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="space-y-1">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Outstanding Liabilities</span>
            <span className="block text-3xl font-black text-rose-455">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed] inline-block" />
              ) : (
                formatCurrency(data?.totalOutstanding || 0)
              )}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/22">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="max-w-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter by Invoice Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending (Unpaid)</option>
              <option value="OVERDUE">Overdue (Past due date)</option>
              <option value="PAID">Paid (Cleared)</option>
            </select>
          </div>
        </div>

        {/* Payables List Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing invoices...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load payables invoices.
          </div>
        ) : !data?.payables || data.payables.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            No accounts payables records found.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3.5 px-6">PAYEE (SUPPLIER / SUBCONTRACTOR)</th>
                    <th className="py-3.5 px-4">PROJECT</th>
                    <th className="py-3.5 px-4">DESCRIPTION / REF</th>
                    <th className="py-3.5 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-3.5 px-4">DUE DATE</th>
                    <th className="py-3.5 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {data.payables.map((p) => {
                    const payeeName = p.supplier?.name || p.subcontractor?.name || 'Generic Payee'
                    const payeeType = p.supplier ? 'Supplier' : 'Subcontractor'

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Payee */}
                        <td className="py-3.5 px-6 font-semibold">
                          <span className="block text-slate-200">{payeeName}</span>
                          <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{payeeType}</span>
                        </td>

                        {/* Project */}
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{p.project?.name}</td>

                        {/* Description / Reference */}
                        <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate leading-normal" title={p.description || ''}>
                          <span className="block text-slate-300 font-semibold truncate">{p.description || 'No description'}</span>
                          {p.reference && (
                            <span className="inline-block mt-0.5 text-[9px] font-black text-[#00d2ff] bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-1.5 py-0.2 rounded-lg">
                              Ref: {p.reference}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right text-[#00d2ff] font-black text-sm tabular-nums">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{formatDate(p.dueDate)}</td>

                        {/* Status */}
                        <td className="py-3.5 px-6">
                          {getStatusBadge(p.status)}
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

export default PayablesPage
