import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateExpense } from '../hooks/useFinance'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, Paperclip } from 'lucide-react'

const CreateExpensePage: React.FC = () => {
  const navigate = useNavigate()
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const createExpenseMutation = useCreateExpense()

  // Form states
  const [projectId, setProjectId] = useState('')
  const [category, setCategory] = useState('MATERIAL')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [attachedFileName, setAttachedFileName] = useState('')
  const [formError, setFormError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFileName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!projectId) {
      setFormError('Please select a project context.')
      return
    }

    const amountVal = parseFloat(amount)
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Amount must be a positive number greater than zero.')
      return
    }

    const targetDate = new Date(date)
    if (targetDate > new Date()) {
      setFormError('Expense date cannot be in the future.')
      return
    }

    try {
      await createExpenseMutation.mutateAsync({
        projectId,
        category,
        amount: amountVal,
        date,
        description: description.trim() || undefined,
        reference: reference.trim() || undefined,
        receiptUrl: attachedFileName || undefined,
      })
      navigate('/expenses')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to record project expense.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/expenses"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Ledger
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2535] pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Record Project Expense</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Manually log project expenditures, site costs, subcontractor fees, or transport charges</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Project Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project context *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
              >
                <option value="">Select Project</option>
                {isProjectsLoading ? (
                  <option>Loading Projects...</option>
                ) : (
                  projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Category and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
                >
                  <option value="LABOUR">Labour & Payroll</option>
                  <option value="MATERIAL">Materials & Stock</option>
                  <option value="EQUIPMENT">Machinery & Equipment</option>
                  <option value="SUBCONTRACTOR">Subcontractor Bills</option>
                  <option value="TRANSPORT">Transport & Delivery</option>
                  <option value="OTHER">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Amount (LKR / Rs.) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Date and Invoice/Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reference / Invoice Number</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9908"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description / Notes</label>
              <textarea
                rows={3}
                placeholder="Details of expense (e.g. sand unloading charges, machine replacement parts, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
              />
            </div>

            {/* Receipt Attachment */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Attach Receipt (Photo/PDF)</label>
              <div className="relative flex items-center justify-center border-2 border-dashed border-[#1a2535] hover:border-blue-500/50 bg-[#0b1220] rounded-xl p-6 transition-all group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-2">
                  <Paperclip className="h-6 w-6 text-slate-500 mx-auto group-hover:text-blue-400 transition-colors" />
                  <span className="block text-xs font-bold text-slate-350">
                    {attachedFileName ? attachedFileName : 'Select or drag receipt file'}
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase font-black">
                    Max size: 5MB (PDF or Image formats)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1a2535] flex gap-2">
              <Link
                to="/expenses"
                className="flex-1 py-3 bg-[#0b1220] border border-[#1a2535] text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
              >
                {createExpenseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateExpensePage
