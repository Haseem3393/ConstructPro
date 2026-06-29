import React, { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useMaterials } from '../hooks/useMaterials'
import { useTransfers, useCreateTransfer, useApproveTransfer } from '../hooks/useInventory'
import { toast } from '../utils/toast'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Loader2, 
  Calendar, 
  ArrowRightLeft, 
  Check, 
  X,
  Info,
  Building,
  Save
} from 'lucide-react'

const StockTransfersPage: React.FC = () => {
  const { user } = useAuthStore()

  // New Transfer Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [fromProjectId, setFromProjectId] = useState('')
  const [toProjectId, setToProjectId] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [modalError, setModalError] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data: sourceMaterials } = useMaterials({ projectId: fromProjectId || undefined })
  const { data: transfers, isLoading, isFetching } = useTransfers()

  // Mutations
  const createTransferMutation = useCreateTransfer()
  const approveTransferMutation = useApproveTransfer()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-405 border border-emerald-500/22">
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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/22">
            Pending
          </span>
        )
    }
  }

  const handleOpenModal = () => {
    setFromProjectId('')
    setToProjectId('')
    setMaterialId('')
    setQuantity('')
    setModalError('')
    setIsOpen(true)
  }

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    if (!fromProjectId || !toProjectId || !materialId || !quantity) {
      setModalError('Please fill in all fields.')
      return
    }

    if (fromProjectId === toProjectId) {
      setModalError('Source project and destination project cannot be the same.')
      return
    }

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setModalError('Transfer quantity must be a positive number.')
      return
    }

    const matchedMat = sourceMaterials?.find(m => m.id === materialId)
    if (matchedMat && qty > matchedMat.currentStock) {
      setModalError(`Insufficient stock. Source has only ${matchedMat.currentStock} ${matchedMat.unit} available.`)
      return
    }

    try {
      await createTransferMutation.mutateAsync({
        fromProjectId,
        toProjectId,
        materialId,
        quantity: qty
      })
      setIsOpen(false)
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to submit transfer request.')
    }
  }

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this stock transfer? This will deduct the source project stock and credit the destination project.')) {
      return
    }

    try {
      await approveTransferMutation.mutateAsync(id)
      toast.success('Stock transfer approved successfully.')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to process transfer approval')
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Stock Transfers</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Request and approve materials transfers between different construction sites</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Transfer request
          </button>
        </div>

        {/* Transfers List Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Stock movements registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-[#7c3aed] animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70">
              <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading transfers log...</p>
            </div>
          ) : !transfers || transfers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No stock transfers registered.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">SOURCE SITE</th>
                    <th className="py-4 px-4 text-center">DIRECTION</th>
                    <th className="py-4 px-4">DESTINATION SITE</th>
                    <th className="py-4 px-4">MATERIAL TYPE</th>
                    <th className="py-4 px-4 text-center">QUANTITY</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-4">REQUESTED DATE</th>
                    {isAdmin && <th className="py-4 px-6 text-right w-32">APPROVAL</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6 font-extrabold text-white">
                        {t.fromProject.name}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#00d2ff]">
                        <ArrowRightLeft className="h-4 w-4 mx-auto" />
                      </td>
                      <td className="py-4 px-4 font-extrabold text-white">
                        {t.toProject.name}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-300">
                        {t.material.name}
                        <span className="block text-[9px] text-slate-550 font-bold uppercase mt-0.5">Unit: {t.material.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-black text-white">
                        {t.quantity.toLocaleString()} {t.material.unit}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{formatDate(t.date)}</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          {t.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApprove(t.id)}
                              className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-emerald-500/22 inline-flex items-center gap-1 cursor-pointer"
                              title="Approve stock transfer"
                            >
                              <Check className="h-3 w-3" /> Approve
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {t.status === 'APPROVED' ? `By: ${t.approvedBy?.name}` : 'Processed'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Transfer Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322]/95 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-widest">New Transfer Request</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white bg-[#0a0f1d]/60 border border-white/10 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From Project (Source) *</label>
                <select
                  value={fromProjectId}
                  onChange={(e) => {
                    setFromProjectId(e.target.value)
                    setMaterialId('')
                  }}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Source Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To Project (Destination) *</label>
                <select
                  value={toProjectId}
                  onChange={(e) => setToProjectId(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Destination Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Material *</label>
                  <select
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    required
                    disabled={!fromProjectId}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer disabled:opacity-40"
                  >
                    <option value="">Select Material</option>
                    {sourceMaterials?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.currentStock} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transfer Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 20"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#7c3aed]/10 border border-[#7c3aed]/22 rounded-xl flex items-start space-x-2">
                <Info className="h-4 w-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Note: A transfer request deducts items from the source project's inventory and increments it in the destination project only once approved by an Admin.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTransferMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createTransferMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default StockTransfersPage
