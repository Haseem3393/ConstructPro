import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useSuppliers } from '../hooks/useSuppliers'
import { useMaterials } from '../hooks/useMaterials'
import { useCreatePurchaseOrder } from '../hooks/useInventory'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Info } from 'lucide-react'

interface POLineItem {
  materialId: string
  quantity: number
  unitPrice: number
}

const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: projects } = useProjects()
  const { data: suppliers } = useSuppliers()

  // Form states
  const [projectId, setProjectId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [deliveryDateExpected, setDeliveryDateExpected] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')

  // Line Items state
  const [lineItems, setLineItems] = useState<POLineItem[]>([
    { materialId: '', quantity: 1, unitPrice: 0 }
  ])

  // Query materials of selected project
  const { data: materials } = useMaterials({ projectId: projectId || undefined })

  const createPOMutation = useCreatePurchaseOrder()

  const handleAddItemRow = () => {
    setLineItems([...lineItems, { materialId: '', quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItemRow = (index: number) => {
    if (lineItems.length === 1) return
    const updated = lineItems.filter((_, i) => i !== index)
    setLineItems(updated)
  }

  const handleLineChange = (index: number, field: keyof POLineItem, value: any) => {
    const updated = [...lineItems]
    if (field === 'materialId') {
      updated[index].materialId = value
    } else {
      updated[index][field] = parseFloat(value) || 0
    }
    setLineItems(updated)
  }

  // Auto calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const handleSubmit = async (status: 'DRAFT' | 'ORDERED') => {
    setFormError('')

    if (!projectId || !supplierId) {
      setFormError('Please select a project and a supplier.')
      return
    }

    const validItems = lineItems.filter(item => item.materialId && item.quantity > 0)
    if (validItems.length === 0) {
      setFormError('Purchase order must contain at least one valid material line item.')
      return
    }

    try {
      await createPOMutation.mutateAsync({
        supplierId,
        projectId,
        deliveryDateExpected: deliveryDateExpected || undefined,
        notes: notes || undefined,
        items: validItems,
        status,
      })
      navigate('/inventory/purchases')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to generate purchase order.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/inventory/purchases"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to PO Registry
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2535] pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Create Purchase Order</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Draft or order formal material requests to suppliers</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-6">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Primary Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Site *</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value)
                  // Reset line items material select since project changed
                  setLineItems([{ materialId: '', quantity: 1, unitPrice: 0 }])
                }}
                required
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
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
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Supplier Vendor *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
              >
                <option value="">Select Supplier</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Delivery Date Expected</label>
              <input
                type="date"
                value={deliveryDateExpected}
                onChange={(e) => setDeliveryDateExpected(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Line Items Matrix */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#1a2535]">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Purchase Items Schedule</span>
              <button
                type="button"
                onClick={handleAddItemRow}
                disabled={!projectId}
                className="inline-flex items-center px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-405 border border-blue-500/22 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item Row
              </button>
            </div>

            {!projectId ? (
              <div className="py-8 text-center text-xs text-slate-500 font-bold bg-[#0b1220]/40 border border-dashed border-[#1a2535] rounded-xl">
                Please select a project site to load materials registers.
              </div>
            ) : (
              <div className="space-y-3.5">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-3 bg-[#0b1220]/40 border border-[#1a2535] p-4 rounded-xl">
                    <div className="flex-1 w-full">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Material *</label>
                      <select
                        value={item.materialId}
                        onChange={(e) => handleLineChange(index, 'materialId', e.target.value)}
                        required
                        className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
                      >
                        <option value="">Select Material</option>
                        {materials?.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quantity *</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        required
                        value={item.quantity}
                        onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Unit Price (LKR) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-full sm:w-36 text-right pb-2 shrink-0">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">Line Total</span>
                      <span className="text-slate-200 font-black text-sm pr-1">
                        Rs.{(item.quantity * item.unitPrice).toLocaleString()}
                      </span>
                    </div>

                    <div className="pb-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/22 rounded-lg disabled:opacity-35"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Remarks / Purchase Instructions</label>
            <textarea
              placeholder="e.g. Terms 30 days credit. Delivery required on site by 8:00 AM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
            />
          </div>

          {/* Total Display */}
          <div className="flex justify-between items-center p-4 bg-[#0b1220] border border-[#1a2535] rounded-xl">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Estimated PO Total</span>
            <span className="text-xl font-black text-emerald-405">
              Rs.{totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Save Buttons */}
          <div className="pt-4 border-t border-[#1a2535] flex flex-col sm:flex-row gap-3">
            <Link
              to="/inventory/purchases"
              className="flex-1 py-3 bg-[#0b1220] border border-[#1a2535] text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all order-last sm:order-first"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={createPOMutation.isPending}
              className="flex-1 py-3 bg-[#0b1220] hover:bg-white/[0.02] text-slate-300 border border-[#1a2535] rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('ORDERED')}
              disabled={createPOMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {createPOMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Place Order (Submit)
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreatePurchaseOrderPage
