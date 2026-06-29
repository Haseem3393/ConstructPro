import React from 'react'
import { useInventoryOverview } from '../hooks/useInventory'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Loader2, 
  Archive, 
  AlertTriangle, 
  XCircle, 
  Coins, 
  TrendingUp, 
  Building2, 
  ArrowRight,
  ClipboardList
} from 'lucide-react'

const InventoryOverviewPage: React.FC = () => {
  const { data: overview, isLoading, isError } = useInventoryOverview()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading inventory analytics...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !overview) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-450 animate-bounce" />
          <p className="font-extrabold text-sm uppercase tracking-widest">Inventory Error</p>
          <p className="text-xs text-slate-400 font-semibold">Failed to load overview data. Try again later.</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Dashboard</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Cross-project materials aggregation and safety levels tracking</p>
          </div>
          <Link
            to="/materials"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 text-slate-350 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Stock Ledger List
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Items */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center space-x-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="p-3 bg-[#7c3aed]/10 text-slate-400 border border-[#7c3aed]/20 rounded-xl">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Materials</span>
              <span className="text-2xl font-black text-white mt-1 block">{overview.totalMaterials}</span>
            </div>
          </div>

          {/* Card 2: Low Stock */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center space-x-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/22 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alerts</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{overview.lowStockCount}</span>
            </div>
          </div>

          {/* Card 3: Out of Stock */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center space-x-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="p-3 bg-rose-500/10 text-rose-455 border border-rose-500/22 rounded-xl">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Out of Stock</span>
              <span className="text-2xl font-black text-rose-455 mt-1 block">{overview.outOfStockCount}</span>
            </div>
          </div>

          {/* Card 4: Inventory Cash Value */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex items-center space-x-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/22 rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Value</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block tabular-nums">{formatCurrency(overview.totalValue)}</span>
            </div>
          </div>
        </div>

        {/* Per Project Stock Summary Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
            <h3 className="font-extrabold text-xs text-[#00d2ff] uppercase tracking-wider">Per Project Stock Summary</h3>
          </div>

          {overview.projectSummaries.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
              No project directories logged.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-4 px-6">PROJECT SITE</th>
                    <th className="py-4 px-4 text-center">MATERIALS TYPES</th>
                    <th className="py-4 px-4 text-center">LOW SAFETY ALERTS</th>
                    <th className="py-4 px-4 text-right">TOTAL STOCK VALUE</th>
                    <th className="py-4 px-6 text-right w-36">DASHBOARD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs">
                  {overview.projectSummaries.map((ps) => (
                    <tr key={ps.projectId} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2.5">
                          <Building2 className="h-4 w-4 text-[#00d2ff] shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{ps.projectName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{ps.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-300">
                        {ps.materialsCount} items
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          ps.lowStockCount > 0 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/22'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                        }`}>
                          {ps.lowStockCount} Alerts
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-white tabular-nums">
                        {formatCurrency(ps.totalValue)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/materials?projectId=${ps.projectId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
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

export default InventoryOverviewPage
