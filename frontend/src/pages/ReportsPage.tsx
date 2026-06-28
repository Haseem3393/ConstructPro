import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSummaryStats } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  FolderKanban, 
  Receipt, 
  DollarSign, 
  CalendarCheck, 
  Archive, 
  TrendingUp, 
  Truck, 
  FileCheck,
  AlertTriangle,
  Loader2,
  Download,
  Building,
  Plus
} from 'lucide-react'

interface DownloadHistoryItem {
  id: string
  name: string
  format: string
  timestamp: string
}

const ReportsPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: stats, isLoading, isError } = useSummaryStats()
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([])

  useEffect(() => {
    // Load download history from localStorage
    const saved = localStorage.getItem('constructpro_reports_history')
    if (saved) {
      try {
        setDownloadHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing reports history', e)
      }
    } else {
      // Seed initial dummy downloads if empty
      const initial: DownloadHistoryItem[] = [
        { id: '1', name: 'Q2 Material Usage Audit', format: 'CSV', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
        { id: '2', name: 'Vilasita Villa Labour Payroll', format: 'CSV', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: '3', name: 'Consolidated Expense Summary', format: 'CSV', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() }
      ]
      localStorage.setItem('constructpro_reports_history', JSON.stringify(initial))
      setDownloadHistory(initial)
    }
  }, [])

  // Access restriction
  if (user?.role !== 'ADMIN' && user?.role !== 'PROJECT_MANAGER') {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center mt-12">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm">
            Only administrators and project managers have access to reports and analytics.
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  const reportCards = [
    {
      name: 'Project Status Report',
      description: 'Progress tracker, task status distributions, milestone completions, team sizes, and delay analysis.',
      path: '/reports/project',
      icon: FolderKanban,
      color: 'from-blue-600/20 to-blue-500/5 hover:border-blue-500/40 text-blue-400'
    },
    {
      name: 'Expense & Accounts Report',
      description: 'Expenditure audits, paid balances, outstanding amounts, and project finance transactions.',
      path: '/reports/expense',
      icon: Receipt,
      color: 'from-emerald-600/20 to-emerald-500/5 hover:border-emerald-500/40 text-emerald-400'
    },
    {
      name: 'Workforce Payroll Report',
      description: 'Worker basic wage calculations, overtime rate accumulations, days logged, and grand payouts.',
      path: '/reports/payroll',
      icon: DollarSign,
      color: 'from-violet-600/20 to-violet-500/5 hover:border-violet-500/40 text-violet-400'
    },
    {
      name: 'Worker Attendance Report',
      description: 'Attendance rates %, absent patterns, daily presence trends, and historical logs.',
      path: '/reports/attendance',
      icon: CalendarCheck,
      color: 'from-amber-600/20 to-amber-500/5 hover:border-amber-500/40 text-amber-400'
    },
    {
      name: 'Material Usage Report',
      description: 'Stock-out quantity calculations, unit cost averages, wastage breakdowns, and most-used material analytics.',
      path: '/reports/material',
      icon: Archive,
      color: 'from-rose-600/20 to-rose-500/5 hover:border-rose-500/40 text-rose-400'
    },
    {
      name: 'Budget vs Actual Report',
      description: 'Clustered comparisons across all project budgets, overspent alerts, and cost variance metrics.',
      path: '/reports/budget',
      icon: TrendingUp,
      color: 'from-cyan-600/20 to-cyan-500/5 hover:border-cyan-500/40 text-cyan-400'
    },
    {
      name: 'Machinery Usage Report',
      description: 'Usage hours logged, total rental costs, top used assets, and owned vs hired analysis.',
      path: '/reports/machinery',
      icon: Truck,
      color: 'from-pink-600/20 to-pink-500/5 hover:border-pink-500/40 text-pink-400'
    },
    {
      name: 'Contracts & Claims Report',
      description: 'Subcontractor agreements tracking, payment milestones statuses, change order audits, and values.',
      path: '/contracts',
      icon: FileCheck,
      color: 'from-indigo-600/20 to-indigo-500/5 hover:border-indigo-500/40 text-indigo-400'
    }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-black text-white">Reports & Analytics Hub</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Generate executive summaries, operational records, workforce payroll statements, and material wastage audits.
          </p>
        </div>

        {/* Quick Stats Summary Strip */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-650/10 via-transparent to-transparent pointer-events-none"></div>
          
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Portfolio Quick Stats</h3>
          {isLoading ? (
            <div className="flex items-center space-x-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              <span className="text-xs text-zinc-400">Aggregating records...</span>
            </div>
          ) : isError ? (
            <p className="text-xs text-rose-400">Failed to aggregate portfolio counters.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Ongoing Projects</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeProjects}</span>
              </div>
              <div className="space-y-1 border-l border-zinc-800/80 pl-4">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Active Workforce</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeWorkers}</span>
              </div>
              <div className="space-y-1 border-l border-zinc-800/80 pl-4">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Active Contracts</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeContracts}</span>
              </div>
              <div className="space-y-1 border-l border-zinc-800/80 pl-4">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Active Machinery</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeMachinery}</span>
              </div>
              <div className="space-y-1 border-l border-zinc-800/80 pl-4">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Low Stock Warnings</span>
                <span className={`block text-xl font-extrabold ${stats?.lowStockMaterials > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {stats?.lowStockMaterials}
                </span>
              </div>
              <div className="space-y-1 border-l border-zinc-800/80 pl-4 col-span-2 sm:col-span-1 lg:col-span-2">
                <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-wider">Capital Budget / Spent</span>
                <span className="block text-xs font-black text-violet-400 mt-1 truncate">
                  {formatCurrency(stats?.totalSpent)} / {formatCurrency(stats?.totalBudget)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 8 Report Cards Home Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className={`bg-[#14161f] border border-zinc-800/80 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-950/20 bg-gradient-to-br ${card.color} flex flex-col justify-between h-48 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-zinc-950/40 text-inherit border border-zinc-800/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-550 uppercase tracking-wider group-hover:text-inherit transition-colors">
                      Open Report
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-violet-300 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-zinc-450 text-xs mt-1.5 line-clamp-3 leading-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Report Downloads List */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Recent Report Downloads</h3>
          {downloadHistory.length === 0 ? (
            <p className="text-xs text-zinc-500">No reports downloaded recently in this session.</p>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {downloadHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-zinc-200">{item.name}</span>
                      <span className="block text-[10px] text-zinc-500">
                        Downloaded on {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-755 text-zinc-450 text-[9px] font-bold uppercase tracking-wider">
                    {item.format} File
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ReportsPage
