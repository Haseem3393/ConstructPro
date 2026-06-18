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
  Save
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
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Opening Stock</h1>
            <p className="text-zinc-400 text-sm mt-1">One-time initial stock registry for materials at project startup</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Initial Stock
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-zinc-450 text-xs font-bold uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-zinc-550" /> Filter Stocks
          </h3>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full max-w-md bg-[#1c1d26] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 cursor-pointer"
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
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-350">Opening Stock ledger</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading ledger logs...</p>
            </div>
          ) : !openingStocks || openingStocks.length === 0 ? (
            <div className="p-16 text-center text-zinc-550 text-xs font-semibold">
              No opening stock transactions recorded for the selected project.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6">PROJECT / SITE</th>
                    <th className="py-4 px-4">ITEM DESCRIPTION</th>
                    <th className="py-4 px-4 text-center">INITIAL QTY</th>
                    <th className="py-4 px-4 text-right">UNIT PRICE</th>
                    <th className="py-4 px-4 text-right">TOTAL CAPITAL</th>
                    <th className="py-4 px-6">REGISTRATION DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {openingStocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-violet-400 shrink-0" />
                          <span className="font-bold text-white">{stock.projectName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-200">
                        {stock.materialName}
                        <span className="block text-[10px] text-zinc-550 font-normal uppercase mt-0.5">Unit: {stock.unit}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-zinc-350">
                        {stock.quantity.toLocaleString()} {stock.unit}
                      </td>
                      <td className="py-4 px-4 text-right text-zinc-400">
                        {formatCurrency(stock.unitPrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-green-400">
                        {formatCurrency(stock.total)}
                      </td>
                      <td className="py-4 px-6 text-zinc-450 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-550" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">New Opening Stock</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded text-xs font-bold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Select Project *</label>
                <select
                  value={newProjectId}
                  onChange={(e) => {
                    setNewProjectId(e.target.value)
                    setNewMaterialId('')
                  }}
                  required
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
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
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Select Material *</label>
                <select
                  value={newMaterialId}
                  onChange={(e) => setNewMaterialId(e.target.value)}
                  required
                  disabled={!newProjectId}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer disabled:opacity-40"
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
                  <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-1">Unit Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 2500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-violet-600/5 border border-violet-500/15 rounded-lg flex items-start space-x-2">
                <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-violet-400 font-semibold leading-relaxed">
                  Opening stock is a one-time operation per material in a project. This sets the initial inventory level without creating expense entries in the system.
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
                  disabled={createOpeningStockMutation.isPending}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {createOpeningStockMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
