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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            Paid
          </span>
        )
      case 'OVERDUE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/25 animate-pulse">
            Overdue
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Accounts Payable</h1>
            <p className="text-zinc-400 text-sm mt-1">Track pending invoices, sub-contractor bills, and outstanding payables liabilities</p>
          </div>

          {isEditable && (
            <Link
              to="/payables/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> New Payable
            </Link>
          )}
        </div>

        {/* Outstanding Liability metrics */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest">Total Outstanding Liabilities</span>
            <span className="block text-3xl font-black text-rose-455">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-violet-500 inline-block" />
              ) : (
                formatCurrency(data?.totalOutstanding || 0)
              )}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/15">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl">
          <div className="max-w-xs">
            <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Filter by Invoice Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-600 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Synchronizing invoices...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#14161f] border border-rose-500/20 rounded-xl shadow-xl">
            Failed to load payables invoices.
          </div>
        ) : !data?.payables || data.payables.length === 0 ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            No accounts payables records found.
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3.5 px-6">PAYEE (SUPPLIER / SUBCONTRACTOR)</th>
                    <th className="py-3.5 px-4">PROJECT</th>
                    <th className="py-3.5 px-4">DESCRIPTION / REF</th>
                    <th className="py-3.5 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-3.5 px-4">DUE DATE</th>
                    <th className="py-3.5 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {data.payables.map((p) => {
                    const payeeName = p.supplier?.name || p.subcontractor?.name || 'Generic Payee'
                    const payeeType = p.supplier ? 'Supplier' : 'Subcontractor'

                    return (
                      <tr key={p.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                        {/* Payee */}
                        <td className="py-3.5 px-6 font-semibold">
                          <span className="block text-zinc-200">{payeeName}</span>
                          <span className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mt-0.5">{payeeType}</span>
                        </td>

                        {/* Project */}
                        <td className="py-3.5 px-4 text-zinc-300 font-semibold">{p.project?.name}</td>

                        {/* Description / Reference */}
                        <td className="py-3.5 px-4 text-zinc-400 max-w-[200px] truncate leading-normal" title={p.description || ''}>
                          <span className="block text-zinc-300 font-medium truncate">{p.description || 'No description'}</span>
                          {p.reference && (
                            <span className="inline-block mt-0.5 text-[9px] font-black text-violet-400 uppercase bg-violet-500/5 border border-violet-500/10 px-1.5 rounded">
                              Ref: {p.reference}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right text-white font-black text-sm">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">{formatDate(p.dueDate)}</td>

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
