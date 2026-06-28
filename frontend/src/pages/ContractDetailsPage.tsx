import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContractDetails } from '../hooks/useContracts'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  FileText, 
  Download,
  Building,
  Activity,
  History,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileCheck,
  Plus
} from 'lucide-react'
import { toast } from '../utils/toast'

const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: contract, isLoading, isError } = useContractDetails(id || '')

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/22">
            Active
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-450 border border-rose-500/22">
            Terminated
          </span>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Paid
          </span>
        )
      case 'DUE':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-455 border border-amber-500/22">
            Due
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-[#1a2535]">
            Pending
          </span>
        )
    }
  }

  const getChangeOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-450 border border-rose-500/22">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-455 border border-amber-500/20 animate-pulse">
            Pending
          </span>
        )
    }
  }

  const formatPercentageName = (pctName: string) => {
    switch (pctName) {
      case 'FOUNDATION_25':
        return 'Foundation Level Complete (25%)'
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
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Loading contract dossier...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !contract) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/8 border border-rose-500/20 rounded-2xl space-y-4 max-w-md mx-auto relative mt-16 z-10">
          <AlertTriangle className="h-10 w-10 mx-auto text-rose-450 animate-bounce" />
          <p className="font-black text-sm uppercase tracking-wider">Contracts Directory Error</p>
          <p className="text-xs text-slate-500">The requested contract agreement details could not be found.</p>
          <Link to="/contracts" className="inline-flex text-xs font-bold text-blue-400 hover:text-blue-300">
            Back to Registry
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Navigation back */}
        <div className="flex items-center">
          <Link
            to="/contracts"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Contracts Registry
          </Link>
        </div>

        {/* Contract Header Profile */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/22 flex items-center justify-center text-blue-400 shrink-0">
              <FileCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{contract.clientName}</h1>
                {getStatusBadge(contract.status)}
              </div>
              <div className="flex items-center text-xs text-slate-400 mt-1 space-x-1.5 font-semibold">
                <Building className="h-4 w-4 text-slate-550 shrink-0" />
                <span>Project: {contract.project?.name}</span>
                <span>•</span>
                <span className="capitalize">{contract.type.toLowerCase()} Agreement</span>
              </div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-2.5">
                Agreement timeline: <span className="text-slate-300 font-extrabold">{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-[#1a2535] pt-4 md:pt-0 md:pl-6">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Base Contract Value</span>
            <span className="block text-xl font-black text-blue-400">{formatCurrency(contract.value)}</span>
            {contract.paymentTerms && (
              <span className="block text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[200px]" title={contract.paymentTerms}>
                Terms: {contract.paymentTerms}
              </span>
            )}
          </div>
        </div>

        {/* Financial Progress Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Value */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-550 uppercase tracking-widest">Base Contract Value</span>
              <span className="block text-xl font-black text-white">{formatCurrency(contract.value)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1220] text-slate-400 border border-[#1a2535]">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Received */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-555 uppercase tracking-widest">Total Cleared Receipts</span>
              <span className="block text-xl font-black text-emerald-400">{formatCurrency(contract.totalReceived || 0)}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Outstanding */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-555 uppercase tracking-widest">Outstanding Balances</span>
              <span className="block text-xl font-black text-rose-455">{formatCurrency(contract.totalOutstanding || 0)}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-455 border border-rose-500/22">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Contract scope & document card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scope Card */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-3">
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Scope of Work</span>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-medium">
              {contract.scope || 'No structural scope of work has been written. Add descriptions to details.'}
            </p>
          </div>

          {/* Document Download Card */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Contract Binders File</span>
              <p className="text-slate-400 text-xs mt-3 leading-normal font-medium">
                {contract.documentUrl ? `Signed file: ${contract.documentUrl}` : 'No scanned agreement document uploaded.'}
              </p>
            </div>
            
            {contract.documentUrl && (
              <button 
                onClick={() => toast.success(`Simulating file download: ${contract.documentUrl}`)}
                className="mt-6 w-full py-2.5 bg-[#0b1220] hover:bg-[#111d33] border border-[#1a2535] hover:border-blue-500/30 text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" /> Download Document
              </button>
            )}
          </div>
        </div>

        {/* Payment Schedule Ledgers */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005]">
            <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider flex items-center text-blue-400">
              Payment Schedule Milestones
            </h3>
          </div>
          {!contract.payments || contract.payments.length === 0 ? (
            <div className="p-12 text-center text-slate-550 text-xs font-semibold">
              No payment schedule milestones initialized.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                    <th className="py-4 px-6">MILESTONE PERCENTAGE</th>
                    <th className="py-4 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-4 px-4">DUE DATE</th>
                    <th className="py-4 px-4">PAID DATE</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535] text-xs">
                  {contract.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6 font-extrabold text-slate-300">
                        {formatPercentageName(p.percentage)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-white text-sm tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold">{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                      <td className="py-4 px-4 text-slate-450 font-medium">{p.paidDate ? formatDate(p.paidDate) : '-'}</td>
                      <td className="py-4 px-4">
                        {getPaymentStatusBadge(p.status)}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/payments/${p.id}`}
                          className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-450 group-hover:text-blue-400 transition-colors"
                        >
                          View Payment <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Change Orders ledger */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005] flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-slate-350 uppercase tracking-wider">
              Associated Change Orders
            </h3>
            <Link
              to={`/change-orders/new?projectId=${contract.projectId}&contractId=${contract.id}`}
              className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Request Change
            </Link>
          </div>
          {!contract.changeOrders || contract.changeOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-550 text-xs font-semibold">
              No change orders registered against this contract.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                    <th className="py-4 px-6">DATE REQUESTED</th>
                    <th className="py-4 px-4">DESCRIPTION</th>
                    <th className="py-4 px-4 text-right">COST IMPACT (LKR)</th>
                    <th className="py-4 px-4 text-center">TIME IMPACT</th>
                    <th className="py-4 px-4">REQUESTED BY</th>
                    <th className="py-4 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535] text-xs">
                  {contract.changeOrders.map((co) => (
                    <tr key={co.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6 text-slate-450 font-medium">{formatDate(co.createdAt)}</td>
                      <td className="py-4 px-4 text-slate-300 font-semibold" title={co.reason || ''}>
                        <span className="block">{co.description}</span>
                        {co.reason && <span className="block text-[10px] text-slate-500 font-medium mt-0.5">{co.reason}</span>}
                      </td>
                      <td className={`py-4 px-4 text-right font-black ${co.costImpact >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
                        {co.costImpact >= 0 ? `+${formatCurrency(co.costImpact)}` : `-${formatCurrency(Math.abs(co.costImpact))}`}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-300">
                        {co.timeImpact >= 0 ? `+${co.timeImpact} days` : `${co.timeImpact} days`}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold capitalize">{co.requestedBy.toLowerCase()}</td>
                      <td className="py-4 px-6">{getChangeOrderStatusBadge(co.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ContractDetailsPage
