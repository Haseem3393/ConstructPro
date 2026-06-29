import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateCheque, usePayablesList } from '../hooks/useFinance'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CreateChequePage: React.FC = () => {
  const navigate = useNavigate()

  // Queries
  const { data: payablesData, isLoading: isPayablesLoading } = usePayablesList('PENDING')

  // Mutation
  const createChequeMutation = useCreateCheque()

  // Form states
  const [chequeNo, setChequeNo] = useState('')
  const [bank, setBank] = useState('')
  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [payableId, setPayableId] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')

  // Auto-populate form when linking a payable bill
  useEffect(() => {
    if (payableId && payablesData?.payables) {
      const selected = payablesData.payables.find(p => p.id === payableId)
      if (selected) {
        setAmount(selected.amount.toString())
        const payeeName = selected.supplier?.name || selected.subcontractor?.name || ''
        setPayee(payeeName)
      }
    }
  }, [payableId, payablesData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!chequeNo.trim()) {
      setFormError('Cheque Number is required.')
      return
    }

    if (!bank.trim()) {
      setFormError('Bank Name is required.')
      return
    }

    if (!payee.trim()) {
      setFormError('Payee Name is required.')
      return
    }

    const amountVal = parseFloat(amount)
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Cheque amount must be a positive number greater than zero.')
      return
    }

    if (!issueDate) {
      setFormError('Please select cheque issue date.')
      return
    }

    try {
      await createChequeMutation.mutateAsync({
        chequeNo: chequeNo.trim(),
        bank: bank.trim(),
        payee: payee.trim(),
        amount: amountVal,
        issueDate,
        payableId: payableId || undefined,
        notes: notes.trim() || undefined,
      })
      navigate('/cheques')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to issue cheque.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/cheques"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Register
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Issue Corporate Cheque</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register corporate cheque details, link them to outstanding supplier bills, and log payment clearances</p>
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

            {/* Optional Link to Payable */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Outstanding Bill (Optional)</label>
              <select
                value={payableId}
                onChange={(e) => setPayableId(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
              >
                <option value="">Do not link (Custom Payee)</option>
                {isPayablesLoading ? (
                  <option>Loading pending bills...</option>
                ) : (
                  payablesData?.payables.map((p) => {
                    const name = p.supplier?.name || p.subcontractor?.name || 'Unassigned Payee'
                    const ref = p.reference ? ` (Ref: ${p.reference})` : ''
                    return (
                      <option key={p.id} value={p.id}>
                        {name} - Rs.{p.amount.toLocaleString()}{ref}
                      </option>
                    )
                  })
                )}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Selecting an outstanding bill will automatically suggestion-fill the Payee Name and Amount.</p>
            </div>

            {/* Cheque No and Bank Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cheque Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CQ-909876"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Bank, HNB"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            {/* Payee Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payee Name *</label>
              <input
                type="text"
                required
                placeholder="Name of the person/firm the cheque is issued to"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
              />
            </div>

            {/* Amount and Issue Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cheque Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="e.g. 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cheque Issue Date *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes / Memo (Optional)</label>
              <textarea
                rows={2}
                placeholder="Optional notes or cheque description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                to="/cheques"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-all cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createChequeMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createChequeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Issue Cheque
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateChequePage
