import React from 'react'
import { useMachineryList } from '../hooks/useMachinery'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Loader2, 
  Wrench, 
  ShieldCheck, 
  AlertOctagon, 
  Cpu, 
  Hourglass, 
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react'

const MachineryListPage: React.FC = () => {
  const { user } = useAuthStore()

  // Queries
  const { data: machineries, isLoading, isError } = useMachineryList()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25">
            Active
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
            Maintenance
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/25">
            Inactive
          </span>
        )
    }
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Machinery & Equipment</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage company assets and hired equipment tracking logs</p>
          </div>

          {isEditable && (
            <Link
              to="/machinery/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Machinery
            </Link>
          )}
        </div>

        {/* List Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Synchronizing equipment fleet...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#14161f] border border-rose-500/20 rounded-xl shadow-xl">
            Failed to load machinery fleet logs.
          </div>
        ) : !machineries || machineries.length === 0 ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            No machinery logged in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machineries.map((machine) => (
              <div 
                key={machine.id}
                className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-black text-sm">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded">
                      {machine.ownership}
                    </span>
                  </div>

                  <h3 className="text-white font-extrabold text-base mt-3.5 group-hover:text-violet-400 transition-colors">
                    {machine.name}
                  </h3>
                  <span className="block text-[10px] text-zinc-500 font-semibold">{machine.brand || 'Generic Brand'}</span>

                  {/* Pricing Rate Details */}
                  <div className="mt-4 pt-3.5 border-t border-zinc-850 space-y-2.5 text-xs text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Standard Rate</span>
                      <span className="text-white font-extrabold">
                        {formatCurrency(machine.rate)} / {machine.paymentType.toLowerCase()}
                      </span>
                    </div>

                    {machine.ownership === 'HIRED' && (
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Hire Provider</span>
                        <span className="text-zinc-300 font-semibold truncate max-w-[150px]">
                          {machine.hireSource}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex justify-between items-center text-xs">
                  {getStatusBadge(machine.status)}
                  
                  <Link
                    to={`/machinery/${machine.id}`}
                    className="inline-flex items-center gap-1 font-bold text-zinc-350 hover:text-white uppercase tracking-wider text-[10px] transition-colors"
                  >
                    Usage Card
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default MachineryListPage
