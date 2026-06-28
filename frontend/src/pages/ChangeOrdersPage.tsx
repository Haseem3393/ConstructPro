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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25">
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/25">
            Rejected
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
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Change Orders Ledger</h1>
            <p className="text-zinc-400 text-sm mt-1">Audit scope changes, cost impacts, and project timeline extensions</p>
          </div>

          <Link
            to="/change-orders/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Change Order
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Project Filter */}
            <div>
              <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">Project Site</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-600 cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[9px] font-black text-zinc-555 uppercase tracking-widest mb-1.5">Change Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-350 focus:outline-none focus:border-violet-600 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Synchronizing change orders...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#14161f] border border-rose-500/20 rounded-xl shadow-xl">
            Failed to load change orders from server.
          </div>
        ) : !changeOrders || changeOrders.length === 0 ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            No change orders found matching selection filters.
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3.5 px-6">PROJECT / CONTRACT</th>
                    <th className="py-3.5 px-4">DESCRIPTION & REASON</th>
                    <th className="py-3.5 px-4 text-right">COST IMPACT (LKR)</th>
                    <th className="py-3.5 px-4 text-center">TIME IMPACT</th>
                    <th className="py-3.5 px-4">REQUESTED BY</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {changeOrders.map((co) => (
                    <tr key={co.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      {/* Project and Contract */}
                      <td className="py-4 px-6">
                        <span className="block font-extrabold text-white">{co.project?.name}</span>
                        <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">
                          Contract: {co.contract?.clientName}
                        </span>
                      </td>

                      {/* Description and Reason */}
                      <td className="py-4 px-4 max-w-xs leading-normal">
                        <p className="text-zinc-200 font-semibold">{co.description}</p>
                        {co.reason && (
                          <p className="text-[10px] text-zinc-500 font-medium mt-0.5 italic">
                            Reason: {co.reason}
                          </p>
                        )}
                      </td>

                      {/* Cost Impact */}
                      <td className="py-4 px-4 text-right text-white font-black text-sm">
                        {co.costImpact > 0 ? (
                          <span className="text-amber-400">+{formatCurrency(co.costImpact)}</span>
                        ) : co.costImpact < 0 ? (
                          <span className="text-green-400">-{formatCurrency(Math.abs(co.costImpact))}</span>
                        ) : (
                          <span className="text-zinc-400">Rs.0</span>
                        )}
                      </td>

                      {/* Time Impact */}
                      <td className="py-4 px-4 text-center font-bold text-zinc-300">
                        {co.timeImpact > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-amber-400 border border-zinc-700">
                            +{co.timeImpact} days
                          </span>
                        ) : (
                          <span className="text-zinc-500">No impact</span>
                        )}
                      </td>

                      {/* Requested By */}
                      <td className="py-4 px-4 font-semibold text-zinc-400 capitalize">
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
                                className="inline-flex items-center justify-center p-1.5 bg-green-500/10 text-green-400 border border-green-500/25 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                title="Approve Change Order"
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(co.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                className="inline-flex items-center justify-center p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                                title="Reject Change Order"
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-semibold italic">Admin review required</span>
                          )
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Processed</span>
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
