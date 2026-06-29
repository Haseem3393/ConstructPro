import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMaterialDetails, useRecordStockIn, useRecordStockOut } from '../hooks/useMaterials'
import { useSuppliers } from '../hooks/useSuppliers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, Info, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

const MaterialStockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const suppliersQuery = useSuppliers()

  // Tab mode state
  const [mode, setMode] = useState<'in' | 'out'>('in')

  useEffect(() => {
    const queryMode = searchParams.get('mode')
    if (queryMode === 'out') {
      setMode('out')
    } else {
      setMode('in')
    }
  }, [searchParams])

  // Queries
  const { data: material, isLoading } = useMaterialDetails(id || '')

  // Form Fields
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [autoExpense, setAutoExpense] = useState(true)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  // Mutations
  const recordStockInMutation = useRecordStockIn(material?.projectId || '')
  const recordStockOutMutation = useRecordStockOut(material?.projectId || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!material) return
    const qty = parseFloat(quantity)

    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive number.')
      return
    }

    if (mode === 'out' && qty > material.currentStock) {
      setError(`Insufficient stock. Current stock is ${material.currentStock} ${material.unit}.`)
      return
    }

    try {
      if (mode === 'in') {
        await recordStockInMutation.mutateAsync({
          matId: material.id,
          data: {
            quantity: qty,
            cost: cost ? parseFloat(cost) : undefined,
            date: date ? new Date(date).toISOString() : undefined,
            supplierId: supplierId || undefined,
            invoiceNumber: invoiceNumber || undefined,
            autoExpense,
            description: description || undefined
          }
        })
      } else {
        await recordStockOutMutation.mutateAsync({
          matId: material.id,
          data: {
            quantity: qty,
            date: date ? new Date(date).toISOString() : undefined,
            description: description || undefined
          }
        })
      }
      navigate(`/materials/${material.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit stock transaction.')
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading material details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (!material) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <Info className="h-12 w-12 mx-auto text-rose-450 animate-bounce" />
          <p className="font-extrabold text-sm uppercase tracking-widest">Material Not Found</p>
          <Link to="/materials" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 cursor-pointer">
            Back to Registry
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to={`/materials/${material.id}`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Details
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Stock Adjustment</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Record delivery stock-ins or daily consumption stock-outs</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => {
              setMode('in')
              setError('')
              setQuantity('')
              setDescription('')
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'in'
                ? 'border-[#7c3aed] text-white bg-[#7c3aed]/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
            Stock In (Delivery)
          </button>
          <button
            onClick={() => {
              setMode('out')
              setError('')
              setQuantity('')
              setDescription('')
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'out'
                ? 'border-[#7c3aed] text-white bg-[#7c3aed]/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-rose-455" />
            Stock Out (Consumption)
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="bg-[#0a0f1d]/60 p-3 rounded-xl border border-white/10 flex justify-between text-xs text-slate-400 font-semibold">
            <span>Selected Material: <strong className="text-white">{material.name}</strong></span>
            <span>Current Stock: <strong className="text-white">{material.currentStock} {material.unit}</strong></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  placeholder="e.g. 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>

              {mode === 'in' ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Invoice Cost (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 55000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                  />
                </div>
              )}
            </div>

            {mode === 'in' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                    >
                      <option value="">Select Supplier</option>
                      {suppliersQuery.data?.map((s) => (
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
                      placeholder="e.g. INV-2026-904"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoExpense}
                        onChange={(e) => setAutoExpense(e.target.checked)}
                        className="rounded bg-[#0a0f1d]/60 border-white/10 text-[#7c3aed] focus:ring-0 cursor-pointer"
                      />
                      <span>Auto log as project expense</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {mode === 'in' ? 'Delivery Description' : 'Usage Description *'}
              </label>
              <textarea
                required={mode === 'out'}
                placeholder={mode === 'in' ? 'e.g. Holcim cement delivery batch 4' : 'Describe where it was consumed (e.g. masonry plastering for structural columns)'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold resize-none"
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                to={`/materials/${material.id}`}
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={recordStockInMutation.isPending || recordStockOutMutation.isPending}
                className={`flex-1 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer ${
                  mode === 'in' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-450 hover:to-emerald-550 shadow-md shadow-emerald-500/10' 
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-450 hover:to-rose-550 shadow-md shadow-rose-500/10'
                }`}
              >
                {recordStockInMutation.isPending || recordStockOutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === 'in' ? 'Save Stock In' : 'Save Stock Out'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default MaterialStockPage
