import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useChequesList, useUpdateChequeStatus } from '../hooks/useFinance'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Loader2, 
  AlertTriangle,
  Building,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react'

const ChequesPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')

  // Queries
  const { data: cheques, isLoading, isError } = useChequesList({
    status: statusFilter || undefined,
    bank: bankFilter || undefined,
  })

  // Mutations
  const updateStatusMutation = useUpdateChequeStatus()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus })
    } catch (err) {
      console.error('Failed to update cheque status', err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Cleared
          </span>
        )
      case 'BOUNCED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/22 animate-pulse">
            Bounced
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/22">
            Issued
          </span>
        )
    }
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  // Extract unique bank list for filtering option
  const bankNamesList = React.useMemo(() => {
    if (!cheques) return []
    const set = new Set(cheques.map(c => c.bank))
    return Array.from(set)
  }, [cheques])

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Cheques Register</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage corporate cheque payments, bank clearings, and transaction statuses</p>
          </div>

          {isEditable && (
            <Link
              to="/cheques/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Issue Cheque
            </Link>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Status Filter */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ISSUED">Issued (Uncleared)</option>
                <option value="CLEARED">Cleared</option>
                <option value="BOUNCED">Bounced</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Bank Filter */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter Bank</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Banks</option>
                {bankNamesList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cheques list table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing cheques journal...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load cheques logs.
          </div>
        ) : !cheques || cheques.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            No cheque records registered.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3.5 px-6">CHEQUE NO</th>
                    <th className="py-3.5 px-4">BANK</th>
                    <th className="py-3.5 px-4">PAYEE NAME</th>
                    <th className="py-3.5 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-3.5 px-4">ISSUE DATE</th>
                    <th className="py-3.5 px-4">LINKED BILL</th>
                    <th className="py-3.5 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {cheques.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Cheque No */}
                      <td className="py-4 px-6 font-extrabold text-white">{c.chequeNo}</td>

                      {/* Bank */}
                      <td className="py-4 px-4 text-slate-300 font-semibold">{c.bank}</td>

                      {/* Payee */}
                      <td className="py-4 px-4 text-slate-300 font-medium">{c.payee}</td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right text-[#00d2ff] font-black text-sm tabular-nums">
                        {formatCurrency(c.amount)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400 font-semibold">{formatDate(c.issueDate)}</td>

                      {/* Linked Payable */}
                      <td className="py-4 px-4 text-slate-400 font-semibold max-w-[150px] truncate" title={c.payable?.description || ''}>
                        {c.payable ? (
                          <span>
                            Bill Ref: {c.payable.reference || c.payable.id.slice(-6).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold italic">Unlinked payment</span>
                        )}
                      </td>

                      {/* Status select toggle or badge */}
                      <td className="py-4 px-6">
                        {isEditable ? (
                          <div className="relative inline-block text-left">
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                              disabled={updateStatusMutation.isPending}
                              className="bg-[#0a0f1d]/60 border border-white/10 rounded px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 cursor-pointer text-slate-200 transition-colors"
                            >
                              <option value="ISSUED">Issued</option>
                              <option value="CLEARED">Cleared</option>
                              <option value="BOUNCED">Bounced</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        ) : (
                          getStatusBadge(c.status)
                        )}
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

export default ChequesPage
