import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  useChangeOrdersList, 
  useApproveChangeOrder, 
  useRejectChangeOrder 
} from '../hooks/useContracts'
import { useProjects } from '../hooks/useProjects'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { toast } from '../utils/toast'
import { 
  Plus, 
  Loader2, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react'

const ChangeOrdersPage: React.FC = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  // Filter States
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data: changeOrders, isLoading, isError } = useChangeOrdersList({
    projectId: projectId || undefined,
    status: status || undefined,
  })

  // Mutations
  const approveMutation = useApproveChangeOrder()
  const rejectMutation = useRejectChangeOrder()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/22">
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Rejected
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

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to APPROVE this change order? This will update the contract value, extend the project timeline, and adjust the project budget.')) {
      try {
        await approveMutation.mutateAsync(id)
        toast.success('Change order approved successfully.')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to approve change order')
      }
    }
  }

  const handleReject = async (id: string) => {
    if (window.confirm('Are you sure you want to REJECT this change order?')) {
      try {
        await rejectMutation.mutateAsync(id)
        toast.success('Change order rejected successfully.')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to reject change order')
      }
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Change Orders Ledger</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Audit scope changes, cost impacts, and project timeline extensions</p>
          </div>

          <Link
            to="/change-orders/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Change Order
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Project Filter */}
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

            {/* Status Filter */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Change Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing change orders...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-xl shadow-xl backdrop-blur-xl font-semibold">
            Failed to load change orders from server.
          </div>
        ) : !changeOrders || changeOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl">
            No change orders found matching selection filters.
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3.5 px-6">PROJECT / CONTRACT</th>
                    <th className="py-3.5 px-4">DESCRIPTION & REASON</th>
                    <th className="py-3.5 px-4 text-right">COST IMPACT (LKR)</th>
                    <th className="py-3.5 px-4 text-center">TIME IMPACT</th>
                    <th className="py-3.5 px-4">REQUESTED BY</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {changeOrders.map((co) => (
                    <tr key={co.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Project and Contract */}
                      <td className="py-4 px-6">
                        <span className="block font-extrabold text-white">{co.project?.name}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                          Contract: {co.contract?.clientName}
                        </span>
                      </td>

                      {/* Description and Reason */}
                      <td className="py-4 px-4 max-w-xs leading-normal">
                        <p className="text-slate-200 font-semibold">{co.description}</p>
                        {co.reason && (
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5 italic">
                            Reason: {co.reason}
                          </p>
                        )}
                      </td>

                      {/* Cost Impact */}
                      <td className="py-4 px-4 text-right font-black text-sm tabular-nums">
                        {co.costImpact > 0 ? (
                          <span className="text-amber-400">+{formatCurrency(co.costImpact)}</span>
                        ) : co.costImpact < 0 ? (
                          <span className="text-emerald-400">-{formatCurrency(Math.abs(co.costImpact))}</span>
                        ) : (
                          <span className="text-slate-500">Rs.0</span>
                        )}
                      </td>

                      {/* Time Impact */}
                      <td className="py-4 px-4 text-center font-bold">
                        {co.timeImpact > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-[#0a0f1d]/60 text-[10px] text-amber-400 border border-white/10 rounded-lg">
                            +{co.timeImpact} days
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold">No impact</span>
                        )}
                      </td>

                      {/* Requested By */}
                      <td className="py-4 px-4 font-semibold text-slate-400 capitalize">
                        {co.requestedBy}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(co.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {co.status === 'PENDING' ? (
                          isAdmin ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(co.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="inline-flex items-center justify-center p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/22 rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                                title="Approve Change Order"
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(co.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="inline-flex items-center justify-center p-1.5 bg-rose-500/10 text-rose-455 border border-rose-500/22 rounded-xl hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                                title="Reject Change Order"
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-455" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold italic">Admin review required</span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processed</span>
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

export default ChangeOrdersPage
