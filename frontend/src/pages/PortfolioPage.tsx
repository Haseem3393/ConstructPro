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
  TrendingUp 
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

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Portfolio Registry</h1>
            <p className="text-zinc-400 text-sm mt-1">Status tracker, timeline progress, and budgets for all construction sites</p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 bg-[#14161f] hover:bg-[#1c1d26] border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Overview
          </Link>
          <Link 
            to="/dashboard/portfolio" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
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

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#14161f] border border-zinc-800 p-4 rounded-xl">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Projects</span>
            <span className="block text-2xl font-black text-white mt-1">{totalCount}</span>
          </div>
          <div className="bg-[#14161f] border border-zinc-800 p-4 rounded-xl">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest text-blue-400">Ongoing</span>
            <span className="block text-2xl font-black text-white mt-1">{ongoingCount}</span>
          </div>
          <div className="bg-[#14161f] border border-zinc-800 p-4 rounded-xl">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest text-green-400">Completed</span>
            <span className="block text-2xl font-black text-white mt-1">{completedCount}</span>
          </div>
          <div className="bg-[#14161f] border border-zinc-800 p-4 rounded-xl">
            <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest text-rose-400">Overdue</span>
            <span className="block text-2xl font-black text-white mt-1">{overdueCount}</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 bg-[#14161f] border border-zinc-800 p-4 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by project name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-350 focus:outline-none focus:border-blue-600"
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
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-zinc-500 text-sm font-semibold">Syncing portfolio records...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-6 rounded-xl text-center font-bold">
            Failed to sync projects database.
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="bg-[#14161f] border border-zinc-850 p-12 rounded-xl text-center text-zinc-500">
            No projects match your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects?.map(project => (
              <div 
                key={project.id} 
                className="bg-[#14161f] border border-zinc-800 hover:border-zinc-700 transition-all rounded-xl p-6 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Left color border */}
                <div className={`absolute top-0 left-0 w-[4px] h-full ${
                  project.status === 'COMPLETED' ? 'bg-green-500' :
                  project.status === 'ONGOING' ? 'bg-blue-600' :
                  project.status === 'OVERDUE' ? 'bg-rose-500' :
                  'bg-amber-500'
                }`}></div>

                <div>
                  {/* Status & ID */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ID: {project.id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${
                      project.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      project.status === 'ONGOING' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' :
                      project.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-white leading-tight mb-2">{project.name}</h3>

                  {/* Location & Manager info */}
                  <div className="space-y-1.5 text-xs text-zinc-400 mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 text-zinc-550 mr-2" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 text-zinc-550 mr-2" />
                      <span>PM: {project.manager?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 text-zinc-550 mr-2" />
                      <span>
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Budget info */}
                <div className="border-t border-zinc-800/80 pt-4 mt-auto">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-zinc-500">Site Progress</span>
                    <span className="text-zinc-200">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.status === 'COMPLETED' ? 'bg-green-500' :
                        project.status === 'OVERDUE' ? 'bg-rose-500' :
                        'bg-blue-600'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center text-zinc-400">
                      <DollarSign className="h-4 w-4 text-zinc-500 mr-0.5" />
                      <span>Budget: <strong className="text-white font-extrabold">{formatBudget(project.budget)}</strong></span>
                    </div>
                    <div className="flex items-center text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500 mr-1" />
                      <span>Healthy</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PortfolioPage
