import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePaymentDetails, useMarkPaymentPaid } from '../hooks/useContracts'
import { useChequesList } from '../hooks/useFinance'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, DollarSign, Calendar, Paperclip, CheckCircle } from 'lucide-react'

const PaymentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Queries
  const { data: payment, isLoading, isError } = usePaymentDetails(id || '')
  const { data: cheques } = useChequesList({ status: 'ISSUED' }) // Fetch uncleared issued cheques

  // Mutation
  const markPaidMutation = useMarkPaymentPaid(id || '')

  // Form states
  const [method, setMethod] = useState<'Cash' | 'Cheque' | 'Transfer'>('Cash')
  const [chequeId, setChequeId] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [formError, setFormError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptName(e.target.files[0].name)
    }
  }

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (method === 'Cheque' && !chequeId) {
      setFormError('Please select which issued cheque clears this payment.')
      return
    }

    try {
      await markPaidMutation.mutateAsync({
        method,
        chequeId: method === 'Cheque' ? chequeId : undefined,
        receiptUrl: receiptName || undefined,
      })
      navigate('/payments')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to clear payment.')
    }
  }

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatPercentageName = (pctName: string) => {
    switch (pctName) {
      case 'FOUNDATION_25':
        return 'Foundation Complete (25%)'
      case 'STRUCTURE_35':
        return 'Structure Complete (35%)'
      case 'ROOFING_25':
        return 'Roofing Complete (25%)'
      case 'HANDOVER_15':
        return 'Final Handover (15%)'
      default:
        return pctName
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading milestone payment logs...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !payment) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <p className="font-extrabold text-sm uppercase tracking-widest">Milestone Ledger Error</p>
          <p className="text-xs text-slate-400 font-semibold">The requested payment schedule details could not be found.</p>
          <Link to="/payments" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 cursor-pointer">
            Back to Payments
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const isPaid = payment.status === 'PAID'

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to={payment.contractId ? `/contracts/${payment.contractId}` : '/payments'}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Contract / List
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Clearance details</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Milestone details for <span className="text-[#00d2ff] font-extrabold">{formatPercentageName(payment.percentage)}</span> on project <span className="text-white font-extrabold">{payment.project?.name}</span>
          </p>
        </div>

        {/* Milestone info summary */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-5 shadow-xl space-y-3 text-xs text-slate-400 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Milestone Share</span>
            <span className="text-white font-extrabold">{formatPercentageName(payment.percentage)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Bill Target Amount</span>
            <span className="text-[#00d2ff] font-black text-sm tabular-nums">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Associated Contract Base</span>
            <span className="text-slate-200 font-extrabold tabular-nums">{formatCurrency(payment.contractValue)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Scheduled Due Date</span>
            <span className="text-slate-200 font-bold">{payment.dueDate ? formatDate(payment.dueDate) : 'Not Scheduled'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Current Settlement Status</span>
            {isPaid ? (
              <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Paid (Cleared)
              </span>
            ) : (
              <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Unpaid / Outstanding
              </span>
            )}
          </div>
        </div>

        {/* Paid details if already settled */}
        {isPaid && (
          <div className="bg-[#0d1322]/70 border border-emerald-500/20 rounded-xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10b981] via-[#34d399] to-transparent" />
            <div className="flex items-center space-x-2.5 text-emerald-400 font-extrabold text-sm">
              <CheckCircle className="h-5 w-5" />
              <span className="uppercase tracking-wider">Payment Transaction Settled</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-white/5 text-slate-400">
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Settle Method</span>
                <span className="text-slate-200 font-extrabold">{payment.method}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Cleared Date</span>
                <span className="text-slate-200 font-bold">{payment.paidDate ? formatDate(payment.paidDate) : '-'}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Approved By Auditor</span>
                <span className="text-slate-200 font-semibold">{payment.paidBy?.name || 'Authorized Auditor'}</span>
              </div>
              {payment.cheque && (
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Cleared Cheque No</span>
                  <span className="text-[#00d2ff] font-bold">
                    {payment.cheque.chequeNo} ({payment.cheque.bank})
                  </span>
                </div>
              )}
              {payment.receiptUrl && (
                <div className="sm:col-span-2">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Receipt Reference</span>
                  <span className="text-slate-300 font-medium font-mono">📎 {payment.receiptUrl}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Form to clear payment (Admins only, if not paid) */}
        {!isPaid && (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Settle Payment Milestone
            </h3>

            {!isAdmin ? (
              <div className="p-4 bg-[#0a0f1d]/60 border border-white/10 rounded-xl text-xs text-slate-500 font-bold">
                ⚠️ ACCESS RESTRICTED: Only administrators are authorized to process payment schedule clearances.
              </div>
            ) : (
              <form onSubmit={handleMarkPaid} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
                    {formError}
                  </div>
                )}

                {/* Settle Method */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method *</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'Cash' | 'Cheque' | 'Transfer')}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                  >
                    <option value="Cash">Cash Settlement</option>
                    <option value="Cheque">Bank Cheque Clearance</option>
                    <option value="Transfer">Telegraphic Transfer / Online Bank</option>
                  </select>
                </div>

                {/* Conditional Cheque link dropdown */}
                {method === 'Cheque' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Issued Cheque *</label>
                    <select
                      value={chequeId}
                      onChange={(e) => setChequeId(e.target.value)}
                      required
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="">Select Issued Cheque</option>
                      {cheques?.length === 0 ? (
                        <option disabled>No uncleared ISSUED cheques in register. Create one first!</option>
                      ) : (
                        cheques?.map((c) => (
                          <option key={c.id} value={c.id}>
                            No: {c.chequeNo} - {c.bank} (Rs.{c.amount.toLocaleString()} for {c.payee})
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Link this schedule invoice payment directly to an uncleared cheque in the ledger.
                    </p>
                  </div>
                )}

                {/* Receipt Upload Mock */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Clearance Receipt (Optional)</label>
                  <div className="relative flex items-center justify-center border-2 border-dashed border-white/10 hover:border-[#7c3aed]/50 bg-[#0a0f1d]/60 rounded-xl p-4 transition-all group cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center space-y-1">
                      <Paperclip className="h-5 w-5 text-slate-500 mx-auto group-hover:text-[#00d2ff] transition-colors" />
                      <span className="block text-xs font-bold text-slate-355">
                        {receiptName ? receiptName : 'Select transaction confirmation receipt PDF/Image'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settle Action Button */}
                <button
                  type="submit"
                  disabled={markPaidMutation.isPending}
                  className="w-full py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {markPaidMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Clear Payment Schedule
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PaymentDetailsPage
