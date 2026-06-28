import React from 'react'
import { Link } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useDashboard'
import SidebarLayout from '../components/SidebarLayout'
import {
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  ChevronRight,
  Percent,
  Activity,
  Layers,
  AlertCircle,
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboardStats()

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    if (d === 1) return '1 day ago'
    return `${d} days ago`
  }

  const formatBudget = (v: number) => {
    if (v >= 1000000) return `Rs.${(v / 1000000).toFixed(2)}M`
    return `Rs.${v.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">Gathering real-time stats...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-8 max-w-lg mx-auto text-center mt-16 z-10 relative">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-rose-450" />
          </div>
          <p className="text-rose-450 font-black text-base mb-2">Failed to sync stats</p>
          <p className="text-slate-500 text-sm">
            {(error as any)?.response?.data?.error ||
              'Make sure the database is active and migrated.'}
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const { stats, recentActivity, projectsOverview } = data

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      desc: 'Overall portfolio size',
      icon: Building2,
      iconColor: 'text-[#a78bfa]',
      iconBg: 'bg-[#7c3aed]/10',
      topLine: 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-transparent',
      glow: 'hover:shadow-[#7c3aed]/5',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      desc: 'Ongoing developments',
      icon: TrendingUp,
      iconColor: 'text-[#00d2ff]',
      iconBg: 'bg-[#00d2ff]/10',
      topLine: 'bg-gradient-to-r from-[#00d2ff] via-[#6366f1] to-transparent',
      glow: 'hover:shadow-[#00d2ff]/5',
    },
    {
      label: 'Completed',
      value: stats.completedProjects,
      desc: 'Successfully handed over',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      topLine: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent',
      glow: 'hover:shadow-emerald-500/5',
    },
    {
      label: 'Delayed / Overdue',
      value: stats.overdueProjects,
      desc: 'Requires immediate attention',
      icon: Clock,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      topLine: 'bg-gradient-to-r from-rose-500 via-rose-400 to-transparent',
      glow: 'hover:shadow-rose-500/5',
      alert: stats.overdueProjects > 0,
    },
    {
      label: 'Portfolio Budget',
      value: formatBudget(stats.totalBudget),
      desc: 'Combined project values',
      icon: DollarSign,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      topLine: 'bg-gradient-to-r from-amber-500 via-amber-400 to-transparent',
      glow: 'hover:shadow-amber-500/5',
    },
    {
      label: 'Portfolio Expenses',
      value: formatBudget(stats.totalSpent),
      desc: `${stats.budgetUtilization.toFixed(1)}% utilization rate`,
      icon: Percent,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      topLine: 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent',
      glow: 'hover:shadow-indigo-500/5',
    },
  ]

  const statusConfig: Record<string, { label: string; classes: string }> = {
    ONGOING: {
      label: 'Ongoing',
      classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    OVERDUE: {
      label: 'Overdue',
      classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    PLANNING: {
      label: 'Planning',
      classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
  }

  return (
    <SidebarLayout>
      <div className="space-y-7 fade-up">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Real-time financials, project statuses, and activity feed
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0d1322]/70 border border-white/10 rounded-xl px-4 py-2 w-fit backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Data</span>
          </div>
        </div>

        {/* ── Sub-navigation Tabs ── */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { label: 'Overview', to: '/dashboard', active: true },
            { label: 'Portfolio', to: '/dashboard/portfolio', active: false },
            { label: 'Financials', to: '/dashboard/financials', active: false },
            { label: 'Workforce', to: '/dashboard/workforce', active: false },
          ].map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                tab.active
                  ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* ── Stats Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className={`relative bg-[#0d1322]/70 border rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group backdrop-blur-xl ${
                  card.alert ? 'border-rose-500/30' : 'border-white/10'
                } ${card.glow}`}
              >
                {/* Gradient top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${card.topLine}`} />
                {/* Subtle corner glow */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-[0.07] pointer-events-none transition-opacity group-hover:opacity-[0.14]"
                  style={{ background: `radial-gradient(circle, currentColor, transparent)` }}
                />

                <div className="flex items-start justify-between">
                  <div className="space-y-2.5">
                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">
                      {card.label}
                    </span>
                    <span className="block text-3xl font-black text-white leading-none">{card.value}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">{card.desc}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Dashboard Body: Projects Table + Activity Feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Projects Overview Table */}
          <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg backdrop-blur-xl">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7c3aed]/10 rounded-xl text-[#a78bfa]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Active Projects</h3>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-bold uppercase tracking-wider">Latest construction developments</p>
                </div>
              </div>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-xs text-[#a78bfa] hover:text-[#c4b5fd] font-bold transition-colors uppercase tracking-wider"
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-slate-600 font-black tracking-[0.13em] uppercase bg-white/[0.005]">
                    <th className="py-4 px-6">Project</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4 text-center">Progress</th>
                    <th className="py-4 px-4">Budget</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {projectsOverview.slice(0, 5).map((project) => {
                    const status = statusConfig[project.status] || {
                      label: project.status,
                      classes: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
                    }
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-white/[0.015] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="block font-bold text-white text-sm leading-tight">
                            {project.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                            {project.manager?.name ? `Mgr: ${project.manager.name}` : 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{project.location}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-slate-350 w-8 text-right tabular-nums">
                              {project.progress}%
                            </span>
                            <div className="w-16 bg-white/[0.05] rounded-full h-1.5 overflow-hidden shrink-0">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#00d2ff] transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200 tabular-nums">
                          {formatBudget(project.budget)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${status.classes}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {projectsOverview.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-600 text-sm">
                        No active projects available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-lg backdrop-blur-xl">
            {/* Feed Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-white/[0.01] flex items-center gap-3">
              <div className="p-2 bg-[#7c3aed]/10 rounded-xl text-[#a78bfa]">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Activity Log</h3>
                <p className="text-[10px] text-slate-600 mt-0.5 font-bold uppercase tracking-wider">Recent system events</p>
              </div>
            </div>

            {/* Feed Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px]">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 text-xs group"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-1 shadow-[0_0_6px_rgba(124,58,237,0.6)]" />
                    <div className="w-px flex-1 bg-white/10 mt-1.5" />
                  </div>

                  <div className="flex-1 pb-4 border-b border-white/10 last:border-0 last:pb-0 space-y-1.5">
                    <p className="text-slate-200 font-semibold leading-relaxed">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-[#a78bfa] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded border border-[#7c3aed]/20">
                        {activity.category}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">By {activity.user}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-600 ml-auto font-medium">
                        {formatRelativeTime(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-10">
                  No recent activity logs found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DashboardPage
