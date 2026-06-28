import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from '../utils/toast'
import { 
  useTimesheetDetails, 
  useSubmitTimesheet, 
  useApproveTimesheet, 
  useRejectTimesheet 
} from '../hooks/useTimesheets'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User, 
  Info, 
  MessageSquare, 
  Lock, 
  Check, 
  X, 
  ShieldAlert,
  Coins
} from 'lucide-react'

const TimesheetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // State for rejection modal/input
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  // Queries
  const { data: timesheet, isLoading, isError } = useTimesheetDetails(id || '')
  
  // Mutations
  const submitTimesheetMutation = useSubmitTimesheet()
  const approveTimesheetMutation = useApproveTimesheet()
  const rejectTimesheetMutation = useRejectTimesheet()

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  // Calculate worker's pay for the week based on daily hours matrix
  const calculateWorkerWeeklyPay = (row: any) => {
    const dailyWage = row.worker.dailyWage
    const hourlyRate = dailyWage / 8
    const hours = [
      row.mondayHours,
      row.tuesdayHours,
      row.wednesdayHours,
      row.thursdayHours,
      row.fridayHours,
      row.saturdayHours,
      row.sundayHours,
    ]

    let weeklyPay = 0
    hours.forEach((h) => {
      if (h > 0) {
        // Present. Base wage is dailyWage. Overtime is (h - 8) hours
        const overtime = Math.max(0, h - 8)
        weeklyPay += dailyWage + overtime * 1.5 * hourlyRate
      }
    })
    return weeklyPay
  }

  const handleSubmit = async () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to submit this timesheet for approval? It will be locked for editing until reviewed.')) return
    try {
      await submitTimesheetMutation.mutateAsync(id)
      toast.success('Timesheet submitted for approval successfully.')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit timesheet')
    }
  }

  const handleApprove = async () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to APPROVE this timesheet? This will log project payroll expenses and lock the record.')) return
    try {
      await approveTimesheetMutation.mutateAsync(id)
      toast.success('Timesheet approved successfully.')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to approve timesheet')
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    setRejectError('')
    if (!id) return
    if (!rejectReason.trim()) {
      setRejectError('Please enter a rejection reason.')
      return
    }

    try {
      await rejectTimesheetMutation.mutateAsync({ id, reason: rejectReason })
      setIsRejectOpen(false)
      setRejectReason('')
    } catch (err: any) {
      setRejectError(err?.response?.data?.error || 'Failed to reject timesheet')
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading timesheet details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !timesheet) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/22 rounded-xl space-y-4 max-w-md mx-auto">
          <ShieldAlert className="h-12 w-12 mx-auto text-rose-400 animate-pulse" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Timesheet Not Found</p>
          <p className="text-xs text-slate-400">The requested timesheet could not be fetched or does not exist.</p>
          <Link to="/timesheets" className="inline-flex text-xs font-bold text-blue-400 hover:text-blue-300">
            Back to Timesheets
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  // Calculate grand totals
  const totalHoursCombined = timesheet.rows?.reduce((sum, row) => sum + row.totalHours, 0) || 0
  const totalEstimatedPayroll = timesheet.rows?.reduce((sum, row) => sum + calculateWorkerWeeklyPay(row), 0) || 0

  const getStatusBanner = () => {
    switch (timesheet.status) {
      case 'APPROVED':
        return (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/22 rounded-xl flex items-start space-x-3 text-emerald-400">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Timesheet Approved</p>
              <p className="text-slate-405 text-xs mt-1">
                Approved by {timesheet.approvedBy?.name || 'Admin'} on {formatDate(timesheet.updatedAt)}.
                Weekly payroll summaries have been generated, and LKR {totalEstimatedPayroll.toLocaleString()} was logged to project expenses.
              </p>
            </div>
          </div>
        )
      case 'REJECTED':
        return (
          <div className="p-4 bg-rose-500/10 border border-rose-500/22 rounded-xl flex items-start space-x-3 text-rose-455">
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Timesheet Rejected</p>
              <p className="text-slate-400 text-xs mt-1 font-bold">
                Reason: <span className="text-rose-400 font-semibold">{timesheet.rejectionReason}</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                Rejected by {timesheet.approvedBy?.name || 'Manager'}. Weekly log is unlocked for supervisors to modify daily logs and resubmit.
              </p>
            </div>
          </div>
        )
      case 'SUBMITTED':
        return (
          <div className="p-4 bg-blue-500/10 border border-blue-500/22 rounded-xl flex items-start space-x-3 text-blue-400">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Awaiting Verification</p>
              <p className="text-slate-400 text-xs mt-1">
                Submitted by {timesheet.submittedBy?.name || 'Supervisor'} on {formatDate(timesheet.updatedAt)}. 
                Awaiting review and approval from Project Manager or Admin.
              </p>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-4 bg-slate-500/10 border border-slate-500/22 rounded-xl flex items-start space-x-3 text-slate-400">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Draft Timesheet</p>
              <p className="text-slate-400 text-xs mt-1">
                This weekly log is in draft status. Supervisors can verify compiled hours against daily check-ins before submitting.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/timesheets"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Timesheets
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 border-b border-[#1a2535] pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                timesheet.status === 'APPROVED' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' 
                  : timesheet.status === 'REJECTED'
                  ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
                  : timesheet.status === 'SUBMITTED'
                  ? 'bg-blue-500/10 text-blue-405 border border-blue-500/22'
                  : 'bg-slate-500/10 text-slate-405 border border-slate-500/22'
              }`}>
                {timesheet.status}
              </span>
              <span className="text-slate-500 text-xs font-semibold">• ID: {timesheet.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-2">
              Weekly Timesheet Period
            </h1>
            <p className="text-slate-350 text-sm mt-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
              {formatDate(timesheet.startDate)} — {formatDate(timesheet.endDate)}
            </p>
          </div>

          <div className="bg-[#0d1526] border border-[#1a2535] p-4 rounded-xl flex gap-6">
            <div>
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Project</span>
              <span className="block text-white font-extrabold text-sm mt-0.5">{timesheet.project?.name}</span>
              <span className="block text-slate-400 text-xs font-semibold">{timesheet.project?.location}</span>
            </div>
            <div className="w-px bg-[#1a2535]"></div>
            <div>
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Hours</span>
              <span className="block text-blue-400 font-black text-lg mt-0.5">{totalHoursCombined} hrs</span>
            </div>
          </div>
        </div>

        {/* Status Alert Banner */}
        {getStatusBanner()}

        {/* Matrix Grid Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Worker Weekly Matrix (Mon-Sun)</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-[#1a2535]">
                  <th className="py-4 px-6 min-w-[180px]">WORKER / TRADE</th>
                  <th className="py-4 px-3 text-center">MON</th>
                  <th className="py-4 px-3 text-center">TUE</th>
                  <th className="py-4 px-3 text-center">WED</th>
                  <th className="py-4 px-3 text-center">THU</th>
                  <th className="py-4 px-3 text-center">FRI</th>
                  <th className="py-4 px-3 text-center">SAT</th>
                  <th className="py-4 px-3 text-center">SUN</th>
                  <th className="py-4 px-4 text-center">TOT HOURS</th>
                  <th className="py-4 px-4 text-right">DAILY WAGE</th>
                  <th className="py-4 px-6 text-right">EST. PAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2535] text-xs">
                {timesheet.rows?.map((row) => {
                  const estPay = calculateWorkerWeeklyPay(row)
                  return (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        {row.worker.name}
                        <span className="block text-[10px] text-slate-500 font-semibold">{row.worker.trade}</span>
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-300 bg-white/[0.005]">
                        {row.mondayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-350">
                        {row.tuesdayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-300 bg-white/[0.005]">
                        {row.wednesdayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-350">
                        {row.thursdayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-300 bg-white/[0.005]">
                        {row.fridayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-350">
                        {row.saturdayHours || '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-slate-300 bg-white/[0.005]">
                        {row.sundayHours || '-'}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-blue-400">
                        {row.totalHours} hrs
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 font-semibold">
                        {formatCurrency(row.worker.dailyWage)}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-white">
                        {formatCurrency(estPay)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-white/[0.01] font-black text-xs border-t border-[#1a2535] text-white">
                  <td className="py-4 px-6 uppercase tracking-wider">Grand Total</td>
                  <td colSpan={7}></td>
                  <td className="py-4 px-4 text-center text-blue-405 font-black">{totalHoursCombined} hrs</td>
                  <td></td>
                  <td className="py-4 px-6 text-right text-emerald-400 font-black">{formatCurrency(totalEstimatedPayroll)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 text-slate-400 text-xs">
            <Lock className="h-4 w-4 text-slate-500 shrink-0" />
            <span>
              {timesheet.status === 'APPROVED' 
                ? 'This timesheet is fully locked and approved.' 
                : 'Locks: Submitted timesheets cannot be modified until reviewed.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Supervisor submission action */}
            {(timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED') && (
              <button
                onClick={handleSubmit}
                disabled={submitTimesheetMutation.isPending}
                className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {submitTimesheetMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Submit for Approval
              </button>
            )}

            {/* PM/Admin approval and rejection actions */}
            {timesheet.status === 'SUBMITTED' && (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
              <>
                <button
                  onClick={() => {
                    setRejectError('')
                    setRejectReason('')
                    setIsRejectOpen(true)
                  }}
                  className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/22 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approveTimesheetMutation.isPending}
                  className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 disabled:opacity-50"
                >
                  {approveTimesheetMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-emerald-500" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Timesheet
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Confirmation Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
            <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01] flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">Reject Weekly Timesheet</h3>
              <button
                onClick={() => setIsRejectOpen(false)}
                className="p-1.5 rounded-lg bg-white/[0.04] text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-4">
              {rejectError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                  {rejectError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe why this timesheet is being rejected (e.g., incorrect overtime logged on Tuesday)..."
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold placeholder-slate-650"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1a2535] flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="flex-1 py-2.5 bg-[#0b1220] hover:bg-[#111d33] border border-[#1a2535] text-slate-350 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectTimesheetMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-200 shadow-md shadow-rose-500/10 hover:shadow-rose-500/25 disabled:opacity-50"
                >
                  {rejectTimesheetMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-rose-500" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default TimesheetDetailsPage
