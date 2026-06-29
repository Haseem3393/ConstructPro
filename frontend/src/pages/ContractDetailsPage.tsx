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
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/22">
            Active
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Completed
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Terminated
          </span>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Paid
          </span>
        )
      case 'DUE':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-455 border border-amber-500/22">
            Due
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
            Pending
          </span>
        )
    }
  }

  const getChangeOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-455 border border-amber-500/20 animate-pulse">
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
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 font-bold text-sm">Loading contract dossier...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !contract) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl space-y-4 max-w-md mx-auto relative mt-16 backdrop-blur-xl">
          <AlertTriangle className="h-10 w-10 mx-auto text-rose-450 animate-bounce" />
          <p className="font-black text-sm uppercase tracking-widest">Contracts Directory Error</p>
          <p className="text-xs text-slate-400 font-semibold">The requested contract agreement details could not be found.</p>
          <Link to="/contracts" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 cursor-pointer">
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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Contracts Registry
          </Link>
        </div>

        {/* Contract Header Profile */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/22 flex items-center justify-center text-[#00d2ff] shrink-0">
              <FileCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{contract.clientName}</h1>
                {getStatusBadge(contract.status)}
              </div>
              <div className="flex items-center text-xs text-slate-400 mt-1 space-x-1.5 font-semibold">
                <Building className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Project: {contract.project?.name}</span>
                <span>•</span>
                <span className="capitalize">{contract.type.toLowerCase()} Agreement</span>
              </div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-2.5">
                Agreement timeline: <span className="text-slate-300 font-extrabold">{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Base Contract Value</span>
            <span className="block text-xl font-black text-[#00d2ff] tabular-nums">{formatCurrency(contract.value)}</span>
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
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Base Contract Value</span>
              <span className="block text-xl font-black text-[#00d2ff] tabular-nums">{formatCurrency(contract.value)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#7c3aed]/10 text-slate-400 border border-[#7c3aed]/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Received */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-550 uppercase tracking-widest">Total Cleared Receipts</span>
              <span className="block text-xl font-black text-emerald-400 tabular-nums">{formatCurrency(contract.totalReceived || 0)}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Outstanding */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl flex items-center justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-1">
              <span className="block text-[9px] font-black text-slate-550 uppercase tracking-widest">Outstanding Balances</span>
              <span className="block text-xl font-black text-rose-455 tabular-nums">{formatCurrency(contract.totalOutstanding || 0)}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-455 border border-rose-500/22">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Contract scope & document card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scope Card */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl lg:col-span-2 space-y-3 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope of Work</span>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-semibold">
              {contract.scope || 'No structural scope of work has been written. Add descriptions to details.'}
            </p>
          </div>

          {/* Document Download Card */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract Binders File</span>
              <p className="text-slate-400 text-xs mt-3 leading-normal font-semibold">
                {contract.documentUrl ? `Signed file: ${contract.documentUrl}` : 'No scanned agreement document uploaded.'}
              </p>
            </div>
            
            {contract.documentUrl && (
              <button 
                onClick={() => toast.success(`Simulating file download: ${contract.documentUrl}`)}
                className="mt-6 w-full py-2.5 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-350 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" /> Download Document
              </button>
            )}
          </div>
        </div>        {/* Payment Schedule Ledgers */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
            <h3 className="font-extrabold text-xs text-[#00d2ff] uppercase tracking-wider flex items-center">
              Payment Schedule Milestones
            </h3>
          </div>
          {!contract.payments || contract.payments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No payment schedule milestones initialized.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">MILESTONE PERCENTAGE</th>
                    <th className="py-4 px-4 text-right">AMOUNT (LKR)</th>
                    <th className="py-4 px-4">DUE DATE</th>
                    <th className="py-4 px-4">PAID DATE</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-6">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {contract.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6 font-extrabold text-slate-300">
                        {formatPercentageName(p.percentage)}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-[#00d2ff] text-sm tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-semibold">{p.dueDate ? formatDate(p.dueDate) : '-'}</td>
                      <td className="py-4 px-4 text-slate-500 font-medium">{p.paidDate ? formatDate(p.paidDate) : '-'}</td>
                      <td className="py-4 px-4">
                        {getPaymentStatusBadge(p.status)}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/payments/${p.id}`}
                          className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-[#00d2ff] transition-colors cursor-pointer"
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
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-[#00d2ff] uppercase tracking-wider">
              Associated Change Orders
            </h3>
            <Link
              to={`/change-orders/new?projectId=${contract.projectId}&contractId=${contract.id}`}
              className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-[#00d2ff] hover:text-[#00d2ff]/80 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Request Change
            </Link>
          </div>
          {!contract.changeOrders || contract.changeOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No change orders registered against this contract.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">DATE REQUESTED</th>
                    <th className="py-4 px-4">DESCRIPTION</th>
                    <th className="py-4 px-4 text-right">COST IMPACT (LKR)</th>
                    <th className="py-4 px-4 text-center">TIME IMPACT</th>
                    <th className="py-4 px-4">REQUESTED BY</th>
                    <th className="py-4 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {contract.changeOrders.map((co) => (
                    <tr key={co.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6 text-slate-400 font-semibold">{formatDate(co.createdAt)}</td>
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
