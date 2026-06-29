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
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-6 max-w-lg mx-auto text-center mt-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
          <AlertTriangle className="h-10 w-10 text-rose-455 mx-auto mb-3 animate-bounce" />
          <h2 className="text-lg font-black text-rose-455 mb-2 uppercase tracking-widest">Access Denied</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
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
      color: 'from-[#7c3aed]/20 to-[#7c3aed]/5 hover:border-[#7c3aed]/40 text-[#00d2ff]'
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
      color: 'from-rose-600/20 to-rose-500/5 hover:border-rose-500/40 text-rose-455'
    },
    {
      name: 'Budget vs Actual Report',
      description: 'Clustered comparisons across all project budgets, overspent alerts, and cost variance metrics.',
      path: '/reports/budget',
      icon: TrendingUp,
      color: 'from-cyan-600/20 to-cyan-500/5 hover:border-cyan-500/40 text-[#00d2ff]'
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
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Reports & Analytics Hub</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Generate executive summaries, operational records, workforce payroll statements, and material wastage audits.
          </p>
        </div>

        {/* Quick Stats Summary Strip */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Portfolio Quick Stats</h3>
          {isLoading ? (
            <div className="flex items-center space-x-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#7c3aed]" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aggregating records...</span>
            </div>
          ) : isError ? (
            <p className="text-xs text-rose-455 font-bold uppercase tracking-widest">Failed to aggregate portfolio counters.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Ongoing Projects</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeProjects}</span>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Workforce</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeWorkers}</span>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Contracts</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeContracts}</span>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Machinery</span>
                <span className="block text-xl font-extrabold text-white">{stats?.activeMachinery}</span>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Low Stock Warnings</span>
                <span className={`block text-xl font-extrabold ${stats?.lowStockMaterials > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {stats?.lowStockMaterials}
                </span>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4 col-span-2 sm:col-span-1 lg:col-span-2">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Capital Budget / Spent</span>
                <span className="block text-xs font-black text-[#00d2ff] mt-1 truncate">
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
                className={`bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-white/20 bg-gradient-to-br ${card.color} flex flex-col justify-between h-48 group relative overflow-hidden backdrop-blur-xl`}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] text-inherit border border-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                      Open Report
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-[#00d2ff] transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-normal font-semibold">
                    {card.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Report Downloads List */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Recent Report Downloads</h3>
          {downloadHistory.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No reports downloaded recently in this session.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {downloadHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded bg-[#0a0f1d]/60 border border-white/10 text-slate-450">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-slate-200">{item.name}</span>
                      <span className="block text-[10px] text-slate-500 font-bold">
                        Downloaded on {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-xl bg-[#0a0f1d]/60 border border-white/10 text-[#00d2ff] text-[9px] font-black uppercase tracking-widest">
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
