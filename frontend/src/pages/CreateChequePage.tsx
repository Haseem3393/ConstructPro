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
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Register
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Issue Corporate Cheque</h1>
          <p className="text-zinc-400 text-sm mt-1">Register corporate cheque details, link them to outstanding supplier bills, and log payment clearances</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Optional Link to Payable */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Link Outstanding Bill (Optional)</label>
              <select
                value={payableId}
                onChange={(e) => setPayableId(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
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
              <p className="text-[10px] text-zinc-500 mt-1">Selecting an outstanding bill will automatically suggestion-fill the Payee Name and Amount.</p>
            </div>

            {/* Cheque No and Bank Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Cheque Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CQ-909876"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Bank, HNB"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>
            </div>

            {/* Payee Name */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Payee Name *</label>
              <input
                type="text"
                required
                placeholder="Name of the person/firm the cheque is issued to"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Amount and Issue Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-455 uppercase tracking-widest mb-2">Cheque Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="e.g. 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Cheque Issue Date *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Notes / Memo (Optional)</label>
              <textarea
                rows={2}
                placeholder="Optional notes or cheque description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-850 flex gap-2">
              <Link
                to="/cheques"
                className="flex-1 py-3 bg-[#1b1c25] border border-zinc-800 text-zinc-455 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createChequeMutation.isPending}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {createChequeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
