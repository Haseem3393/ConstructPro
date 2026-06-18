import React from 'react'
import { usePortalData } from '../hooks/usePortal'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react'

const ClientPortalPage: React.FC = () => {
  const { data, isLoading, error } = usePortalData()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return 'bg-green-500/10 text-green-400 border border-green-500/25'
      case 'IN_PROGRESS':
      case 'DUE':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
      case 'OVERDUE':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
      case 'PENDING':
      default:
        return 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
      case 'IN_PROGRESS':
      case 'DUE':
        return <Clock className="h-3.5 w-3.5 text-yellow-400 shrink-0 animate-pulse" />
      case 'OVERDUE':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
      case 'PENDING':
      default:
        return <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Opening secure client portal...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-400 font-bold mb-2">Access Denied / Error</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'No active project contracts found linked to your Client Account.'}
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const { project, milestones, payments } = data

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Client Portal</h1>
            <p className="text-zinc-400 text-sm mt-1">Real-time status updates and milestone billing statements</p>
          </div>
        </div>

        {/* Project Overview Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle top primary accent line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-violet-400 uppercase">ACTIVE CONTRACT</span>
              <h2 className="text-2xl font-black text-white mt-1">{project.name}</h2>
              <div className="flex items-center text-xs text-zinc-400 space-x-2 mt-1">
                <span>{project.location}</span>
                {project.description && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-500">{project.description}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 bg-violet-600/15 border border-violet-500/20 px-5 py-3 rounded-lg flex items-center space-x-4">
              <div>
                <span className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">CONTRACT PROGRESS</span>
                <span className="block text-2xl font-black text-violet-400 mt-0.5">{project.progress}%</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-violet-500/25 flex items-center justify-center text-violet-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-6 overflow-hidden">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${project.progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t border-zinc-800 pt-6">
            <div className="space-y-1">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">Contract Budget</span>
              <p className="text-base font-black text-zinc-200">
                {project.contractValue.toLocaleString()} LKR
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">Commenced On</span>
              <p className="text-base font-semibold text-zinc-300">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">Project Handover Target</span>
              <p className="text-base font-semibold text-zinc-300">
                {new Date(project.expectedCompletion).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Milestones and Payments split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Milestones Card */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-zinc-400" />
              <h3 className="font-bold text-sm text-zinc-300">Contract Milestones</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50">
                    <th className="py-3 px-6">Milestone</th>
                    <th className="py-3 px-4 text-center">Value Share</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-6">Target Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-semibold">
                  {milestones.map((milestone) => (
                    <tr key={milestone.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className="block text-white font-bold">{milestone.name}</span>
                        {milestone.description && (
                          <span className="block text-[10px] text-zinc-505 font-medium mt-0.5">{milestone.description}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-zinc-200">{milestone.percentage}%</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold rounded uppercase ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                          <span>{milestone.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">{new Date(milestone.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {milestones.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No scheduled milestones found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Schedule Card */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-zinc-400" />
              <h3 className="font-bold text-sm text-zinc-300">Payment Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50">
                    <th className="py-3 px-6">Billing Event</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-6">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-semibold">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className="block text-white font-bold">{payment.milestone}</span>
                        <span className="block text-[10px] text-zinc-500 font-medium mt-0.5">{payment.percentage}% Share</span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-zinc-200">
                        {payment.amount.toLocaleString()} LKR
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold rounded uppercase ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span>{payment.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">
                        {payment.status === 'PAID' && payment.paidDate && (
                          <span className="text-green-400">Paid: {new Date(payment.paidDate).toLocaleDateString()}</span>
                        )}
                        {payment.status === 'DUE' && payment.dueDate && (
                          <span className="text-yellow-400 font-bold">Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                        )}
                        {payment.status === 'PENDING' && payment.dueDate && (
                          <span>Target: {new Date(payment.dueDate).toLocaleDateString()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No billing events scheduled</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ClientPortalPage
