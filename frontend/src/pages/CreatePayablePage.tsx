import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreatePayable, useSubcontractorsList } from '../hooks/useFinance'
import { useProjects } from '../hooks/useProjects'
import { useSuppliers } from '../hooks/useSuppliers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CreatePayablePage: React.FC = () => {
  const navigate = useNavigate()

  // Queries
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const { data: suppliers } = useSuppliers()
  const { data: subcontractors } = useSubcontractorsList()

  // Mutation
  const createPayableMutation = useCreatePayable()

  // Form states
  const [payeeType, setPayeeType] = useState<'SUPPLIER' | 'SUBCONTRACTOR'>('SUPPLIER')
  const [supplierId, setSupplierId] = useState('')
  const [subcontractorId, setSubcontractorId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!projectId) {
      setFormError('Please select a project context.')
      return
    }

    if (payeeType === 'SUPPLIER' && !supplierId) {
      setFormError('Please select a supplier payee.')
      return
    }

    if (payeeType === 'SUBCONTRACTOR' && !subcontractorId) {
      setFormError('Please select a subcontractor payee.')
      return
    }

    const amountVal = parseFloat(amount)
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Amount must be a positive number greater than zero.')
      return
    }

    if (!dueDate) {
      setFormError('Please select a payment due date.')
      return
    }

    try {
      await createPayableMutation.mutateAsync({
        projectId,
        supplierId: payeeType === 'SUPPLIER' ? supplierId : undefined,
        subcontractorId: payeeType === 'SUBCONTRACTOR' ? subcontractorId : undefined,
        amount: amountVal,
        dueDate,
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
      })
      navigate('/payables')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create payable entry.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/payables"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Payables
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Create Accounts Payable</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register supplier invoices or sub-contractor liabilities to compile overall outstanding payables</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Payee Type Toggle */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payee Classification *</label>
              <div className="grid grid-cols-2 gap-2 bg-[#0a0f1d]/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setPayeeType('SUPPLIER')
                    setSubcontractorId('')
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${payeeType === 'SUPPLIER' ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow-md shadow-purple-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Material Supplier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayeeType('SUBCONTRACTOR')
                    setSupplierId('')
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${payeeType === 'SUBCONTRACTOR' ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow-md shadow-purple-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Subcontractor Agency
                </button>
              </div>
            </div>

            {/* Payee Select Dropdown */}
            {payeeType === 'SUPPLIER' ? (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Supplier Payee *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.shortName})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Subcontractor Payee *</label>
                <select
                  value={subcontractorId}
                  onChange={(e) => setSubcontractorId(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Subcontractor</option>
                  {subcontractors?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Project Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Charge Project context *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all font-semibold cursor-pointer"
              >
                <option value="">Select Project</option>
                {isProjectsLoading ? (
                  <option>Loading Projects...</option>
                ) : (
                  projects?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Amount and Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Liability Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invoice / Bill Reference Number</label>
              <input
                type="text"
                placeholder="e.g. BILL-C3-009"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Invoice Description / Bill Notes</label>
              <textarea
                rows={3}
                placeholder="Details of payable (e.g. sand delivery invoice, piling subcontract installment, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                to="/payables"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-all cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createPayableMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createPayableMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Bill
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreatePayablePage
