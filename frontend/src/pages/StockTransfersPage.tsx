import React, { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useMaterials } from '../hooks/useMaterials'
import { useTransfers, useCreateTransfer, useApproveTransfer } from '../hooks/useInventory'
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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25">
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/25">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
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
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process transfer approval')
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Stock Transfers</h1>
            <p className="text-zinc-400 text-sm mt-1">Request and approve materials transfers between different construction sites</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Transfer request
          </button>
        </div>

        {/* Transfers List Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-350">Stock movements registry</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading transfers log...</p>
            </div>
          ) : !transfers || transfers.length === 0 ? (
            <div className="p-16 text-center text-zinc-550 text-xs font-semibold">
              No stock transfers registered.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
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
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        {t.fromProject.name}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-violet-400">
                        <ArrowRightLeft className="h-4 w-4 mx-auto" />
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {t.toProject.name}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-300">
                        {t.material.name}
                        <span className="block text-[9px] text-zinc-550 font-normal uppercase mt-0.5">Unit: {t.material.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-black text-white">
                        {t.quantity.toLocaleString()} {t.material.unit}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-4 px-4 font-medium text-zinc-450">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-550" />
                          <span>{formatDate(t.date)}</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          {t.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApprove(t.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                              title="Approve stock transfer"
                            >
                              <Check className="h-3 w-3" /> Approve
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">New Transfer Request</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded text-xs font-bold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">From Project (Source) *</label>
                <select
                  value={fromProjectId}
                  onChange={(e) => {
                    setFromProjectId(e.target.value)
                    setMaterialId('')
                  }}
                  required
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
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
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">To Project (Destination) *</label>
                <select
                  value={toProjectId}
                  onChange={(e) => setToProjectId(e.target.value)}
                  required
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
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
                  <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Select Material *</label>
                  <select
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    required
                    disabled={!fromProjectId}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer disabled:opacity-40"
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
                  <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Transfer Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 20"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-violet-600/5 border border-violet-500/15 rounded-lg flex items-start space-x-2">
                <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-violet-400 font-semibold leading-relaxed">
                  Note: A transfer request deducts items from the source project's inventory and increments it in the destination project only once approved by an Admin.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-850 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-[#1b1c25] border border-zinc-800 text-zinc-400 rounded-lg font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTransferMutation.isPending}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {createTransferMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
