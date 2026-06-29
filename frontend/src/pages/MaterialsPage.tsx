import React, { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useMaterials, useDeleteMaterial, useRecordStockIn, useRecordStockOut } from '../hooks/useMaterials'
import { useSuppliers } from '../hooks/useSuppliers'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  Edit2, 
  Trash2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  X,
  PlusCircle,
  Truck,
  Info,
  Filter,
  Eye
} from 'lucide-react'
import { toast } from '../utils/toast'

const MaterialsPage: React.FC = () => {
  const { user } = useAuthStore()
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const { data: suppliers } = useSuppliers()

  // Filter States
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Queries
  const { data: materials, isLoading: isMaterialsLoading, error: materialsError } = useMaterials({
    projectId: selectedProjectId || undefined,
    category: selectedCategory || undefined,
    search: searchQuery || undefined
  })

  // Mutations
  const recordStockInMutation = useRecordStockIn(selectedProjectId || 'global')
  const recordStockOutMutation = useRecordStockOut(selectedProjectId || 'global')
  const deleteMaterialMutation = useDeleteMaterial(selectedProjectId || 'global')

  // Modals state
  const [activeModal, setActiveModal] = useState<'stockIn' | 'stockOut' | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)

  // Forms fields
  const [txnQuantity, setTxnQuantity] = useState('')
  const [txnCost, setTxnCost] = useState('')
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0])
  const [txnDescription, setTxnDescription] = useState('')
  const [txnSupplierId, setTxnSupplierId] = useState('')
  const [txnInvoice, setTxnInvoice] = useState('')
  const [txnAutoExpense, setTxnAutoExpense] = useState(true)
  const [modalError, setModalError] = useState('')

  const closeAllModals = () => {
    setActiveModal(null)
    setSelectedMaterial(null)
    setTxnQuantity('')
    setTxnCost('')
    setTxnDate(new Date().toISOString().split('T')[0])
    setTxnDescription('')
    setTxnSupplierId('')
    setTxnInvoice('')
    setTxnAutoExpense(true)
    setModalError('')
  }

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    if (!selectedMaterial || !txnQuantity) {
      setModalError('Quantity is required.')
      return
    }
    const qty = parseFloat(txnQuantity)
    const cost = txnCost ? parseFloat(txnCost) : 0
    if (isNaN(qty) || qty <= 0) {
      setModalError('Quantity must be a positive number.')
      return
    }
    try {
      await recordStockInMutation.mutateAsync({
        matId: selectedMaterial.id,
        data: {
          quantity: qty,
          cost: cost || undefined,
          date: txnDate ? new Date(txnDate).toISOString() : undefined,
          description: txnDescription || undefined,
          supplierId: txnSupplierId || undefined,
          invoiceNumber: txnInvoice || undefined,
          autoExpense: txnAutoExpense
        },
      })
      closeAllModals()
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to save delivery entry.')
    }
  }

  const handleStockOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    if (!selectedMaterial || !txnQuantity) {
      setModalError('Quantity is required.')
      return
    }
    const qty = parseFloat(txnQuantity)
    if (isNaN(qty) || qty <= 0) {
      setModalError('Quantity must be a positive number.')
      return
    }
    if (qty > selectedMaterial.currentStock) {
      setModalError(`Insufficient stock. Current stock is ${selectedMaterial.currentStock} ${selectedMaterial.unit}.`)
      return
    }
    try {
      await recordStockOutMutation.mutateAsync({
        matId: selectedMaterial.id,
        data: {
          quantity: qty,
          date: txnDate ? new Date(txnDate).toISOString() : undefined,
          description: txnDescription || undefined
        },
      })
      closeAllModals()
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to log consumption.')
    }
  }

  const handleDeleteMaterial = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete material type "${name}"? This will delete all its transaction history.`)) {
      return
    }
    try {
      await deleteMaterialMutation.mutateAsync(id)
      toast.success(`Material "${name}" deleted successfully.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete material.')
    }
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'
  const isSupervisor = user?.role === 'SUPERVISOR'
  const canTransact = isEditable || isSupervisor

  const getStatusBadge = (current: number, min: number) => {
    if (current === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
          Out of Stock
        </span>
      )
    }
    if (current <= min) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/22">
          Low Stock
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
        Good Stock
      </span>
    )
  }

  // Find all low stock materials to alert
  const lowStockAlerts = materials?.filter((m) => m.currentStock <= m.minimumLevel) || []

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Materials</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Track warehouse stock indices, deliveries, and consumptions per project</p>
          </div>

          {isEditable && (
            <Link
              to="/materials/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Material
            </Link>
          )}
        </div>

        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/22 rounded-xl p-4 flex items-start space-x-4 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-rose-450 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Low Stock Warnings</h4>
              <p className="text-xs text-rose-350 mt-1 font-semibold">
                The following materials are currently at or below their safety levels:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockAlerts.map(m => (
                  <span key={m.id} className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-455 border border-rose-500/22 rounded-lg">
                    {m.name} ({m.currentStock} {m.unit} remaining in {m.project?.name})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-500" /> Filter Inventory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Masonry">Masonry</option>
                <option value="Formwork">Formwork</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Registry Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Material Registry</h3>
          </div>

          {isMaterialsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0d1322]/70">
              <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Synchronizing site inventory logs...</p>
            </div>
          ) : materialsError ? (
            <div className="p-16 text-center text-rose-455 font-semibold text-sm bg-[#0d1322]/70">
              Failed to load inventory registers. Verify database configuration.
            </div>
          ) : !materials || materials.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No materials found in inventory registers.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">MATERIAL DETAILS</th>
                    <th className="py-4 px-4">PROJECT</th>
                    <th className="py-4 px-4">CATEGORY</th>
                    <th className="py-4 px-4 text-center">TOTAL STOCK IN</th>
                    <th className="py-4 px-4 text-center">TOTAL CONSUMED</th>
                    <th className="py-4 px-4 text-center">CURRENT STOCK</th>
                    <th className="py-4 px-4 text-center">STOCK STATUS</th>
                    <th className="py-4 px-6 text-right w-64">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {materials.map((material) => {
                    const isLow = material.currentStock <= material.minimumLevel
                    return (
                      <tr key={material.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-sm text-white block">{material.name}</span>
                          <span className="text-[10px] text-slate-550 font-bold mt-0.5 block">
                            Unit: {material.unit} • Alert threshold: {material.minimumLevel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 font-semibold">{material.project?.name}</td>
                        <td className="py-4 px-4 text-slate-400">{material.category || 'Other'}</td>
                        <td className="py-4 px-4 text-center font-bold text-slate-350">
                          {material.stockIn.toLocaleString()} {material.unit}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-350">
                          {material.stockOut.toLocaleString()} {material.unit}
                        </td>
                        <td className={`py-4 px-4 text-center font-black ${isLow ? 'text-rose-455' : 'text-emerald-400'}`}>
                          {material.currentStock.toLocaleString()} {material.unit}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(material.currentStock, material.minimumLevel)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/materials/${material.id}`}
                              className="p-1.5 bg-[#0a0f1d]/60 hover:bg-white/[0.05] text-slate-400 hover:text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            {canTransact && (
                              <button
                                onClick={() => {
                                  setSelectedMaterial(material)
                                  setActiveModal('stockIn')
                                }}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl transition-colors border border-emerald-500/22 flex items-center cursor-pointer"
                                title="Delivery / Stock In"
                              >
                                <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                                <span className="text-[10px] font-black uppercase tracking-wider px-0.5">In</span>
                              </button>
                            )}
                            {canTransact && (
                              <button
                                onClick={() => {
                                  setSelectedMaterial(material)
                                  setActiveModal('stockOut')
                                }}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 hover:text-rose-400 rounded-xl transition-colors border border-rose-500/22 flex items-center cursor-pointer"
                                title="Consume / Stock Out"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                                <span className="text-[10px] font-black uppercase tracking-wider px-0.5">Use</span>
                              </button>
                            )}
                            {isEditable && (
                              <button
                                onClick={() => handleDeleteMaterial(material.id, material.name)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 rounded-xl border border-rose-500/22 cursor-pointer"
                                title="Delete Register"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- TRANSACTION MODALS --- */}

      {/* STOCK IN / DELIVERY LOG MODAL */}
      {activeModal === 'stockIn' && selectedMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0d1322]/95 border border-white/10 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-black text-sm text-white uppercase tracking-widest flex items-center">
                <Truck className="h-4.5 w-4.5 text-emerald-500 mr-2" />
                Log Delivery (Stock In)
              </h3>
              <button onClick={closeAllModals} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleStockInSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl flex items-center space-x-3 text-xs">
                <Info className="h-4 w-4 text-[#00d2ff] shrink-0" />
                <div>
                  <span className="block text-slate-400 font-semibold">Logging delivery for: <strong className="text-white font-extrabold">{selectedMaterial.name}</strong></span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Standard unit: {selectedMaterial.unit} • Current stock: {selectedMaterial.currentStock}</span>
                </div>
              </div>

              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/22 text-rose-455 text-xs rounded-xl font-semibold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity Received *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 50"
                    value={txnQuantity}
                    onChange={(e) => setTxnQuantity(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Cost (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 120000"
                    value={txnCost}
                    onChange={(e) => setTxnCost(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier</label>
                  <select
                    value={txnSupplierId}
                    onChange={(e) => setTxnSupplierId(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-250 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-10022"
                    value={txnInvoice}
                    onChange={(e) => setTxnInvoice(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={txnAutoExpense}
                      onChange={(e) => setTxnAutoExpense(e.target.checked)}
                      className="rounded bg-[#0a0f1d]/60 border-white/10 text-[#7c3aed] focus:ring-0 cursor-pointer"
                    />
                    <span>Auto expense</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  placeholder="e.g. Holcim Cement delivery batch 4"
                  value={txnDescription}
                  onChange={(e) => setTxnDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2.5 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordStockInMutation.isPending}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-505 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {recordStockInMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-white" />}
                  Submit Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK OUT / CONSUMPTION MODAL */}
      {activeModal === 'stockOut' && selectedMaterial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0d1322]/95 border border-white/10 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-black text-sm text-white uppercase tracking-widest flex items-center">
                <ArrowUpRight className="h-4.5 w-4.5 text-rose-500 mr-2" />
                Log Consumption (Stock Out)
              </h3>
              <button onClick={closeAllModals} className="text-slate-505 hover:text-white transition-colors cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleStockOutSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl flex items-center space-x-3 text-xs">
                <Inbox className="h-4 w-4 text-[#00d2ff] shrink-0" />
                <div>
                  <span className="block text-slate-400 font-semibold">Recording usage of: <strong className="text-white font-extrabold">{selectedMaterial.name}</strong></span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Available stock: <strong className="text-slate-300 font-extrabold">{selectedMaterial.currentStock} {selectedMaterial.unit}</strong></span>
                </div>
              </div>

              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/22 text-rose-455 text-xs rounded-xl font-semibold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity Consumed *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    max={selectedMaterial.currentStock}
                    placeholder={`e.g. max ${selectedMaterial.currentStock}`}
                    value={txnQuantity}
                    onChange={(e) => setTxnQuantity(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date of Consumption</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Consumption Usage details</label>
                <textarea
                  required
                  placeholder="Describe where the material was used (e.g. concrete columns casting for block C)"
                  value={txnDescription}
                  onChange={(e) => setTxnDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2.5 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordStockOutMutation.isPending}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-450 hover:to-rose-505 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-md shadow-rose-500/10 hover:shadow-rose-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {recordStockOutMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-white" />}
                  Record Consumption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default MaterialsPage
