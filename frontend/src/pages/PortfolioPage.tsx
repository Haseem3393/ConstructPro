import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolioData } from '../hooks/useDashboard'
import SidebarLayout from '../components/SidebarLayout'
import { 
  FolderKanban, 
  Search, 
  Loader2, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

const PortfolioPage: React.FC = () => {
  const { data: projects, isLoading, error } = usePortfolioData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const formatBudget = (value: number) => {
    if (value >= 1000000) {
      return `Rs.${(value / 1000000).toFixed(2)}M`
    }
    return `Rs.${value.toLocaleString()}`
  }

  // Filter projects
  const filteredProjects = projects?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter ? p.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  // Summary counts
  const totalCount = projects?.length || 0
  const ongoingCount = projects?.filter(p => p.status === 'ONGOING').length || 0
  const completedCount = projects?.filter(p => p.status === 'COMPLETED').length || 0
  const overdueCount = projects?.filter(p => p.status === 'OVERDUE').length || 0

  const statusConfig: Record<string, { label: string; classes: string; leftBorder: string; progressBg: string }> = {
    ONGOING: {
      label: 'Ongoing',
      classes: 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20',
      leftBorder: 'bg-gradient-to-b from-[#7c3aed] to-[#00d2ff]',
      progressBg: 'bg-gradient-to-r from-[#7c3aed] to-[#00d2ff]',
    },
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      leftBorder: 'bg-gradient-to-b from-emerald-500 to-teal-500',
      progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    },
    OVERDUE: {
      label: 'Overdue',
      classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      leftBorder: 'bg-gradient-to-b from-rose-500 to-red-500',
      progressBg: 'bg-gradient-to-r from-rose-500 to-red-400',
    },
    PLANNING: {
      label: 'Planning',
      classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      leftBorder: 'bg-gradient-to-b from-amber-500 to-orange-500',
      progressBg: 'bg-gradient-to-r from-amber-500 to-orange-400',
    },
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 fade-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Portfolio Registry</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Status tracker, timeline progress, and budgets for all construction sites</p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/portfolio" 
            className="px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-colors"
          >
            Portfolio Overview
          </Link>
          <Link 
            to="/dashboard/financials" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Financials Overview
          </Link>
          <Link 
            to="/dashboard/workforce" 
            className="px-4 py-2.5 bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Workforce Overview
          </Link>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden group backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-transparent" />
            <span className="block text-[10px] font-black text-slate-650 uppercase tracking-widest">Total Projects</span>
            <span className="block text-2xl font-black text-white mt-1.5 leading-none">{totalCount}</span>
          </div>
          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden group backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00d2ff] to-transparent" />
            <span className="block text-[10px] font-black text-[#00d2ff]/80 uppercase tracking-widest">Ongoing</span>
            <span className="block text-2xl font-black text-white mt-1.5 leading-none">{ongoingCount}</span>
          </div>
          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden group backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
            <span className="block text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">Completed</span>
            <span className="block text-2xl font-black text-white mt-1.5 leading-none">{completedCount}</span>
          </div>
          <div className="bg-[#0d1322]/70 border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden group backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-transparent" />
            <span className="block text-[10px] font-black text-rose-400/80 uppercase tracking-widest">Overdue</span>
            <span className="block text-2xl font-black text-white mt-1.5 leading-none">{overdueCount}</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-[#0d1322]/70 border border-white/10 p-4 rounded-2xl shadow-md backdrop-blur-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
            <input
              type="text"
              placeholder="Search by project name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none transition-all duration-200"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Grid Container */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <Loader2 className="h-9 w-9 text-[#7c3aed] animate-spin" />
              <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Syncing portfolio records...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/8 border border-rose-500/20 text-rose-455 p-6 rounded-2xl text-center font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Failed to sync projects database.</span>
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="bg-[#0d1322]/70 border border-white/10 p-12 rounded-2xl text-center text-slate-500 font-bold uppercase tracking-wider text-xs shadow-md backdrop-blur-xl">
            No projects match your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects?.map(project => {
              const config = statusConfig[project.status] || {
                label: project.status,
                classes: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
                leftBorder: 'bg-slate-500',
                progressBg: 'bg-slate-500',
              }
              return (
                <div 
                  key={project.id} 
                  className="bg-[#0d1322]/70 border border-white/10 hover:border-[#7c3aed]/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all duration-300 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between hover:shadow-lg group backdrop-blur-xl"
                >
                  {/* Left color border */}
                  <div className={`absolute top-0 left-0 w-[4px] h-full ${config.leftBorder}`} />

                  <div>
                    {/* Status & ID */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">ID: {project.id.slice(-6).toUpperCase()}</span>
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${config.classes}`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-white leading-tight mb-3 group-hover:text-[#a78bfa] transition-colors">{project.name}</h3>

                    {/* Location & Manager info */}
                    <div className="space-y-2 text-xs text-slate-405 mb-6">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 text-slate-650 mr-2.5 shrink-0" />
                        <span className="font-semibold">{project.location}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3.5 w-3.5 text-slate-650 mr-2.5 shrink-0" />
                        <span className="font-semibold">PM: {project.manager?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-slate-650 mr-2.5 shrink-0" />
                        <span className="font-semibold">
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Budget info */}
                  <div className="border-t border-white/10 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px]">Site Progress</span>
                      <span className="text-slate-200 tabular-nums">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-[#0a0f1d]/60 rounded-full h-1.5 overflow-hidden mb-4 border border-white/[0.02]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${config.progressBg}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center text-slate-405">
                        <DollarSign className="h-4 w-4 text-slate-600 mr-0.5 shrink-0" />
                        <span className="font-bold">Budget: <strong className="text-white font-black ml-1">{formatBudget(project.budget)}</strong></span>
                      </div>
                      <div className="flex items-center text-slate-600 text-[10px] uppercase font-black tracking-widest">
                        <TrendingUp className="h-3.5 w-3.5 text-[#00d2ff] mr-1 shrink-0" />
                        <span>Healthy</span>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PortfolioPage
