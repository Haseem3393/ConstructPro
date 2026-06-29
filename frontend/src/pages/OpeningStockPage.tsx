import React, { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useMaterials } from '../hooks/useMaterials'
import { useOpeningStock, useCreateOpeningStock } from '../hooks/useInventory'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Plus, 
  Filter, 
  Loader2, 
  Calendar, 
  Inbox, 
  AlertTriangle, 
  X,
  Building,
  Archive,
  Save,
  Info
} from 'lucide-react'

const OpeningStockPage: React.FC = () => {
  // Filter states
  const [selectedProjectId, setSelectedProjectId] = useState('')

  // Create Modal states
  const [isOpen, setIsOpen] = useState(false)
  const [newProjectId, setNewProjectId] = useState('')
  const [newMaterialId, setNewMaterialId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [modalError, setModalError] = useState('')

  // Queries
  const { data: projects } = useProjects()
  const { data: materials } = useMaterials({ projectId: newProjectId || undefined })
  const { data: openingStocks, isLoading, isFetching } = useOpeningStock({
    projectId: selectedProjectId || undefined,
  })

  const createOpeningStockMutation = useCreateOpeningStock()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleOpenModal = () => {
    setNewProjectId('')
    setNewMaterialId('')
    setQuantity('')
    setUnitPrice('')
    setModalError('')
    setIsOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    if (!newProjectId || !newMaterialId || !quantity || !unitPrice) {
      setModalError('Please fill in all required fields.')
      return
    }

    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)

    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      setModalError('Quantity and unit price must be positive numbers.')
      return
    }

    try {
      await createOpeningStockMutation.mutateAsync({
        projectId: newProjectId,
        materialId: newMaterialId,
        quantity: qty,
        unitPrice: price,
      })
      setIsOpen(false)
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to record opening stock. One-time limit might be violated.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Opening Stock</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">One-time initial stock registry for materials at project startup</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Initial Stock
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-500" /> Filter Stocks
          </h3>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full max-w-md bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Registry Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Opening Stock ledger</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-[#7c3aed] animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70">
              <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading ledger logs...</p>
            </div>
          ) : !openingStocks || openingStocks.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No opening stock transactions recorded for the selected project.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">PROJECT / SITE</th>
                    <th className="py-4 px-4">ITEM DESCRIPTION</th>
                    <th className="py-4 px-4 text-center">INITIAL QTY</th>
                    <th className="py-4 px-4 text-right">UNIT PRICE</th>
                    <th className="py-4 px-4 text-right">TOTAL CAPITAL</th>
                    <th className="py-4 px-6">REGISTRATION DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {openingStocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-[#00d2ff] shrink-0" />
                          <span className="font-extrabold text-white">{stock.projectName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-200">
                        {stock.materialName}
                        <span className="block text-[10px] text-slate-550 font-bold uppercase mt-0.5">Unit: {stock.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-300">
                        {stock.quantity.toLocaleString()} {stock.unit}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 font-semibold">
                        {formatCurrency(stock.unitPrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-emerald-400">
                        {formatCurrency(stock.total)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{formatDate(stock.date)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Opening Stock Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322]/95 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-widest">New Opening Stock</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white bg-[#0a0f1d]/60 border border-white/10 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Project *</label>
                <select
                  value={newProjectId}
                  onChange={(e) => {
                    setNewProjectId(e.target.value)
                    setNewMaterialId('')
                  }}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Material *</label>
                <select
                  value={newMaterialId}
                  onChange={(e) => setNewMaterialId(e.target.value)}
                  required
                  disabled={!newProjectId}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer disabled:opacity-40"
                >
                  <option value="">Select Material</option>
                  {materials?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 2500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#7c3aed]/10 border border-[#7c3aed]/22 rounded-xl flex items-start space-x-2">
                <Info className="h-4 w-4 text-[#00d2ff] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Opening stock is a one-time operation per material in a project. This sets the initial inventory level without creating expense entries in the system.
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
                  disabled={createOpeningStockMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createOpeningStockMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default OpeningStockPage
