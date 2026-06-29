import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usePortalProject } from '../hooks/usePortal'
import SidebarLayout from '../components/SidebarLayout'
import { 
  FolderKanban, 
  Activity, 
  DollarSign, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Receipt,
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react'

const ClientPortalPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePortalProject()

  // Enforce CLIENT role check
  if (user?.role !== 'CLIENT') {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-6 max-w-lg mx-auto text-center mt-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
          <AlertTriangle className="h-10 w-10 text-rose-455 mx-auto mb-3 animate-bounce" />
          <h2 className="text-lg font-black text-rose-455 mb-2 uppercase tracking-widest">Access Denied</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            This portal is restricted to CLIENT accounts only.
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const project = data?.project
  const stats = data?.stats

  const subPages = [
    {
      name: 'Site Progress Timeline',
      description: 'Track construction milestones, timeline statuses, site photographs, and daily foreman reports.',
      path: '/portal/progress',
      icon: Activity,
      color: 'hover:border-violet-500/40 text-violet-400'
    },
    {
      name: 'Payments & Schedules',
      description: 'Audit contract values, paid milestones summaries, outstanding payments, and due dates.',
      path: '/portal/payments',
      icon: Receipt,
      color: 'hover:border-emerald-500/40 text-emerald-400'
    },
    {
      name: 'Shared Site Documents',
      description: 'Review shared blueprints, technical schematics, structural agreements, and planning files.',
      path: '/portal/documents',
      icon: FileText,
      color: 'hover:border-blue-500/40 text-blue-400'
    }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Block */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Hello, {data?.clientName || 'Client'}</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Welcome to your ConstructPro portal. Monitor active construction progress and plan financial schedules.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Syncing client portal profile...</p>
          </div>
        ) : isError || !project ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3 animate-bounce" />
            No active project site linked to your client account. Please contact corporate management.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Banner & Progress circle */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-center backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="space-y-4">
                <div>
                  <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22 mb-2">
                    Active Project Context
                  </span>
                  <h2 className="text-2xl font-black text-white">{project.name}</h2>
                  <p className="text-slate-400 text-xs font-semibold mt-1 flex items-center">
                    <FolderKanban className="h-3.5 w-3.5 mr-1 text-[#00d2ff]" /> {project.location}
                  </p>
                </div>
                <p className="text-slate-400 text-xs leading-normal font-semibold">
                  {project.description || 'No detailed description logged.'}
                </p>
              </div>

              {/* Progress gauge visual circle */}
              <div className="flex justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#00d2ff" 
                      strokeWidth="6" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (project.progress / 100) * 251.2}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{project.progress}%</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Completed</span>
                  </div>
                </div>
              </div>

              {/* Project Status */}
              <div className="bg-[#0a0f1d]/60 border border-white/10 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px]">Site Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    project.status === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' :
                    project.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/22' :
                    'bg-[#0a0f1d]/60 border border-white/10 text-slate-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Schedule</span>
                  <span className="block text-xs font-bold text-slate-350">
                    Expected: {new Date(project.expectedCompletion).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 flex justify-between items-center backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Milestones Completed</span>
                  <span className="block text-xl font-extrabold text-white">
                    {stats?.milestonesCompleted} <span className="text-slate-500 text-xs font-bold">/ {stats?.milestonesTotal}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/15">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 flex justify-between items-center backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Receipted Payments</span>
                  <span className="block text-xl font-extrabold text-white">
                    {stats?.paymentsMade} <span className="text-slate-500 text-xs font-bold">/ {stats?.paymentsTotal}</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-1 flex justify-between items-center backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Days Remaining</span>
                  <span className="block text-xl font-extrabold text-white">{stats?.daysRemaining} days</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/15">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Portal navigation options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {subPages.map((page, idx) => {
                const Icon = page.icon
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(page.path)}
                    className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-white/20 flex flex-col justify-between h-44 group relative overflow-hidden backdrop-blur-xl"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-xl bg-white/[0.04] text-inherit border border-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base group-hover:text-[#00d2ff] transition-colors">
                        {page.name}
                      </h3>
                      <p className="text-slate-400 text-[11px] mt-1.5 leading-normal line-clamp-2 font-semibold">
                        {page.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ClientPortalPage
