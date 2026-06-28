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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white">Payments & Schedules</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Audit billing structures, paid milestone certificates, and check outstanding balances.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Fetching accounts statements...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Highlights Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Total Contract Value</span>
                <span className="block text-2xl font-black text-white">{formatCurrency(data?.contractValue || 0)}</span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider text-emerald-450">Total Paid</span>
                <span className="block text-2xl font-black text-emerald-400">{formatCurrency(data?.totalPaid || 0)}</span>
              </div>
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider text-rose-455">Outstanding Balance</span>
                <span className="block text-2xl font-black text-rose-400">{formatCurrency(data?.outstandingBalance || 0)}</span>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30">
                <h3 className="font-extrabold text-sm text-zinc-350">Scheduled Billing Milestones</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                      <th className="py-3 px-6">MILESTONE STAGE</th>
                      <th className="py-3 px-4 text-right">BILLING AMOUNT</th>
                      <th className="py-3 px-4 text-center">STATUS</th>
                      <th className="py-3 px-4">DUE DATE</th>
                      <th className="py-3 px-6">PAID/RECEIPTED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {data?.paymentSchedule?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-white text-sm">{p.milestone}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-300 font-black">{formatCurrency(p.amount)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            p.status === 'DUE' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 animate-pulse' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-semibold">{formatDate(p.dueDate)}</td>
                        <td className="py-3.5 px-6 text-zinc-300 font-bold">
                          {p.status === 'PAID' ? (
                            <span className="text-emerald-400">{formatDate(p.paidDate)}</span>
                          ) : (
                            <span className="text-zinc-550">Pending Clearance</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!data?.paymentSchedule || data.paymentSchedule.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-550 text-xs font-semibold">
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
