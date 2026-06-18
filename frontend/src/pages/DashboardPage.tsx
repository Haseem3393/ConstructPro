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
  ArrowRight,
  TrendingDown,
  Percent
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useDashboardStats()

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const formatBudget = (value: number) => {
    if (value >= 1000000) {
      return `Rs.${(value / 1000000).toFixed(2)}M`
    }
    return `Rs.${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Gathering real-time stats...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !data) {
    return (
      <SidebarLayout>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-red-400 font-bold mb-2">Failed to sync stats</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'Make sure the database is active and migrated.'}
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const { stats, recentActivity, projectsOverview } = data

  const statCards = [
    {
      label: 'TOTAL PROJECTS',
      value: stats.totalProjects,
      desc: 'Overall portfolio size',
      icon: Building2,
      color: 'bg-violet-600/10 text-violet-400 border-violet-500/20',
      iconBg: 'bg-violet-500/20 text-violet-400'
    },
    {
      label: 'ACTIVE PROJECTS',
      value: stats.activeProjects,
      desc: 'Ongoing developments',
      icon: TrendingUp,
      color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      label: 'COMPLETED PROJECTS',
      value: stats.completedProjects,
      desc: 'Successfully handed over',
      icon: CheckCircle,
      color: 'bg-blue-600/10 text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500/20 text-blue-400'
    },
    {
      label: 'DELAYED / OVERDUE',
      value: stats.overdueProjects,
      desc: 'Attention required',
      icon: Clock,
      color: 'bg-rose-600/10 text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400',
      highlight: stats.overdueProjects > 0
    },
    {
      label: 'PORTFOLIO BUDGET',
      value: formatBudget(stats.totalBudget),
      desc: 'Combined values',
      icon: DollarSign,
      color: 'bg-amber-600/10 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400'
    },
    {
      label: 'PORTFOLIO EXPENSES',
      value: formatBudget(stats.totalSpent),
      desc: `${stats.budgetUtilization.toFixed(1)}% utilization rate`,
      icon: Percent,
      color: 'bg-orange-600/10 text-orange-400 border-orange-500/20',
      iconBg: 'bg-orange-500/20 text-orange-400'
    }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Title and stats summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Real-time financials, project statuses, and activity feed</p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-[#14161f] border border-zinc-800 rounded-lg px-4 py-2 text-zinc-400 font-semibold uppercase">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span>Live Data Synced</span>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/portfolio" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Portfolio Overview
          </Link>
          <Link 
            to="/dashboard/financials" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Financials Overview
          </Link>
          <Link 
            to="/dashboard/workforce" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Workforce Overview
          </Link>
        </div>

        {/* Stats cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div 
                key={idx} 
                className={`bg-[#14161f] border rounded-xl p-6 relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg ${card.highlight ? 'border-rose-500/40 shadow-rose-950/10' : 'border-zinc-800/80 shadow-black/5'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">{card.label}</span>
                    <span className="block text-2xl font-black text-white">{card.value}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">{card.desc}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-650" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Dashboard split body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Overview Table (2 Cols wide) */}
          <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-[#171924]/30">
              <div>
                <h3 className="font-bold text-base text-white">Active Projects Overview</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Quick lookup of the latest construction developments</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 cursor-pointer" />
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-400 font-extrabold tracking-wider uppercase bg-[#181a24]/50">
                    <th className="py-4 px-6">Project Name</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4 text-center">Progress</th>
                    <th className="py-4 px-4">Budget</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {projectsOverview.slice(0, 5).map((project) => (
                    <tr key={project.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="block font-bold text-white text-sm line-clamp-1">{project.name}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-semibold">Manager: {project.manager?.name || 'Unassigned'}</span>
                      </td>
                      <td className="py-4 px-4 text-zinc-300 font-medium">{project.location}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          <span className="font-bold text-zinc-200 w-8 text-right">{project.progress}%</span>
                          <div className="w-16 bg-zinc-800 rounded-full h-1.5 shrink-0 overflow-hidden">
                            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-200">{formatBudget(project.budget)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          project.status === 'ONGOING' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : project.status === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : project.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {projectsOverview.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">No active projects available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity / Expenses Feed (1 Col wide) */}
          <div className="bg-[#14161f] border border-zinc-800/80 rounded-xl p-6 flex flex-col h-[400px]">
            <h3 className="font-bold text-base text-white border-b border-zinc-800 pb-3 mb-4">Activity Log</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex space-x-3 text-xs pb-3 border-b border-zinc-800/40 last:border-0 last:pb-0">
                  <div className="w-2.5 h-2.5 bg-violet-500 rounded-full shrink-0 mt-1 shadow-lg shadow-violet-500/30"></div>
                  <div className="space-y-1 flex-1">
                    <p className="text-zinc-200 font-bold leading-relaxed">{activity.description}</p>
                    <div className="flex items-center text-[10px] text-zinc-500 space-x-2 font-semibold uppercase">
                      <span>{activity.category}</span>
                      <span>•</span>
                      <span>By {activity.user}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center text-zinc-500 text-xs py-8">No recent transactions or labor expense logs found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DashboardPage
