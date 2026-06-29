import React from 'react'
import { Link } from 'react-router-dom'
import { usePortalPayments } from '../hooks/usePortal'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

const PortalPaymentsPage: React.FC = () => {
  const { data, isLoading } = usePortalPayments()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Payments & Schedules</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Audit billing structures, paid milestone certificates, and check outstanding balances.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Fetching accounts statements...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Highlights Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Contract Value</span>
                <span className="block text-2xl font-black text-white">{formatCurrency(data?.contractValue || 0)}</span>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-emerald-450 uppercase tracking-widest">Total Paid</span>
                <span className="block text-2xl font-black text-emerald-400">{formatCurrency(data?.totalPaid || 0)}</span>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <span className="block text-[9px] font-black text-rose-455 uppercase tracking-widest">Outstanding Balance</span>
                <span className="block text-2xl font-black text-rose-455">{formatCurrency(data?.outstandingBalance || 0)}</span>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Scheduled Billing Milestones</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">MILESTONE STAGE</th>
                      <th className="py-3 px-4 text-right">BILLING AMOUNT</th>
                      <th className="py-3 px-4 text-center">STATUS</th>
                      <th className="py-3 px-4">DUE DATE</th>
                      <th className="py-3 px-6">PAID/RECEIPTED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {data?.paymentSchedule?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-bold text-white text-sm">{p.milestone}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-300 font-black">{formatCurrency(p.amount)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' :
                            p.status === 'DUE' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22 animate-pulse' :
                            'bg-[#0a0f1d]/60 border border-white/10 text-slate-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{formatDate(p.dueDate)}</td>
                        <td className="py-3.5 px-6 text-zinc-300 font-bold">
                          {p.status === 'PAID' ? (
                            <span className="text-emerald-400">{formatDate(p.paidDate)}</span>
                          ) : (
                            <span className="text-slate-500">Pending Clearance</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!data?.paymentSchedule || data.paymentSchedule.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-semibold bg-[#0d1322]/70">
                          No payment milestones mapped.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PortalPaymentsPage
