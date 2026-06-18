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
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading inventory analytics...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !overview) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/25 rounded-xl space-y-4 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-400" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Inventory Error</p>
          <p className="text-xs text-zinc-400">Failed to load overview data. Try again later.</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Inventory Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Cross-project materials aggregation and safety levels tracking</p>
          </div>
          <Link
            to="/materials"
            className="inline-flex items-center justify-center px-4 py-2 border border-zinc-800 hover:bg-[#1c1d26] text-zinc-350 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Stock Ledger List
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Items */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center space-x-4">
            <div className="p-3 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-lg">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-zinc-550 uppercase tracking-widest">Total Materials</span>
              <span className="text-2xl font-black text-white mt-1 block">{overview.totalMaterials}</span>
            </div>
          </div>

          {/* Card 2: Low Stock */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-zinc-555 uppercase tracking-widest">Low Stock Alerts</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{overview.lowStockCount}</span>
            </div>
          </div>

          {/* Card 3: Out of Stock */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 text-rose-455 border border-rose-500/20 rounded-lg">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-zinc-550 uppercase tracking-widest">Out of Stock</span>
              <span className="text-2xl font-black text-rose-455 mt-1 block">{overview.outOfStockCount}</span>
            </div>
          </div>

          {/* Card 4: Inventory Cash Value */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-zinc-550 uppercase tracking-widest">Inventory Value</span>
              <span className="text-xl font-black text-green-400 mt-1 block">{formatCurrency(overview.totalValue)}</span>
            </div>
          </div>
        </div>

        {/* Per Project Stock Summary Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Per Project Stock Summary</h3>
          </div>

          {overview.projectSummaries.length === 0 ? (
            <div className="p-16 text-center text-zinc-550 text-xs font-semibold">
              No project directories logged.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6">PROJECT SITE</th>
                    <th className="py-4 px-4 text-center">MATERIALS TYPES</th>
                    <th className="py-4 px-4 text-center">LOW SAFETY ALERTS</th>
                    <th className="py-4 px-4 text-right">TOTAL STOCK VALUE</th>
                    <th className="py-4 px-6 text-right w-36">DASHBOARD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {overview.projectSummaries.map((ps) => (
                    <tr key={ps.projectId} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2.5">
                          <Building2 className="h-4 w-4 text-violet-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white block">{ps.projectName}</span>
                            <span className="text-[10px] text-zinc-500">{ps.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-zinc-300">
                        {ps.materialsCount} items
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ps.lowStockCount > 0 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                            : 'bg-green-500/10 text-green-400 border border-green-500/25'
                        }`}>
                          {ps.lowStockCount} Alerts
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-white">
                        {formatCurrency(ps.totalValue)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/materials?projectId=${ps.projectId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-850 hover:bg-[#1a1c24] text-zinc-300 hover:text-white border border-zinc-800 rounded font-bold text-[10px] uppercase tracking-wider transition-colors"
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
