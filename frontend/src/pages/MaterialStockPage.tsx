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
          <Loader2 className="h-10 w-10 text-blue-505 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading material details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (!material) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/22 rounded-xl space-y-4 max-w-md mx-auto">
          <Info className="h-12 w-12 mx-auto text-rose-455" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Material Not Found</p>
          <Link to="/materials" className="inline-flex text-xs font-bold text-blue-405 hover:text-blue-300">
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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Details
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2535] pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Stock Adjustment</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Record delivery stock-ins or daily consumption stock-outs</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#1a2535]">
          <button
            onClick={() => {
              setMode('in')
              setError('')
              setQuantity('')
              setDescription('')
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              mode === 'in'
                ? 'border-blue-500 text-white bg-blue-500/5'
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
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              mode === 'out'
                ? 'border-blue-500 text-white bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-rose-450" />
            Stock Out (Consumption)
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-4">
          <div className="bg-[#0b1220] p-3 rounded-lg border border-[#1a2535] flex justify-between text-xs text-slate-400">
            <span>Selected Material: <strong className="text-white">{material.name}</strong></span>
            <span>Current Stock: <strong className="text-white">{material.currentStock} {material.unit}</strong></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  placeholder="e.g. 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>

              {mode === 'in' ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Invoice Cost (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 55000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Usage Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                  />
                </div>
              )}
            </div>

            {mode === 'in' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
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
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Invoice Number</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-904"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoExpense}
                        onChange={(e) => setAutoExpense(e.target.checked)}
                        className="accent-blue-500 rounded"
                      />
                      <span>Auto log as project expense</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {mode === 'in' ? 'Delivery Description' : 'Usage Description *'}
              </label>
              <textarea
                required={mode === 'out'}
                placeholder={mode === 'in' ? 'e.g. Holcim cement delivery batch 4' : 'Describe where it was consumed (e.g. masonry plastering for structural columns)'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-4 border-t border-[#1a2535] flex gap-2">
              <Link
                to={`/materials/${material.id}`}
                className="flex-1 py-3 bg-[#0b1220] border border-[#1a2535] text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={recordStockInMutation.isPending || recordStockOutMutation.isPending}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50 ${
                  mode === 'in' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {recordStockInMutation.isPending || recordStockOutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
