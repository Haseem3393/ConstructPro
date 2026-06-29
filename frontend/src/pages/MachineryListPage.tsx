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
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/22">
            Active
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/22">
            Maintenance
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-zinc-500/10 text-slate-400 border border-white/10">
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
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Machinery & Equipment</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage company assets and hired equipment tracking logs</p>
          </div>

          {isEditable && (
            <Link
              to="/machinery/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Machinery
            </Link>
          )}
        </div>

        {/* List Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Synchronizing equipment fleet...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            Failed to load machinery fleet logs.
          </div>
        ) : !machineries || machineries.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            No machinery logged in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machineries.map((machine) => (
              <div 
                key={machine.id}
                className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/22 flex items-center justify-center text-[#00d2ff] font-black text-sm">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-black text-[#00d2ff] uppercase tracking-widest bg-[#7c3aed]/10 border border-[#7c3aed]/22 px-2.5 py-0.5 rounded">
                      {machine.ownership}
                    </span>
                  </div>

                  <h3 className="text-white font-extrabold text-base mt-3.5 group-hover:text-[#00d2ff] transition-colors">
                    {machine.name}
                  </h3>
                  <span className="block text-[10px] text-slate-500 font-bold">{machine.brand || 'Generic Brand'}</span>

                  {/* Pricing Rate Details */}
                  <div className="mt-4 pt-3.5 border-t border-white/10 space-y-2.5 text-xs text-slate-400">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px] font-black">Standard Rate</span>
                      <span className="text-white font-extrabold">
                        {formatCurrency(machine.rate)} / {machine.paymentType.toLowerCase()}
                      </span>
                    </div>

                    {machine.ownership === 'HIRED' && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-black">Hire Provider</span>
                        <span className="text-slate-300 font-semibold truncate max-w-[150px]">
                          {machine.hireSource}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  {getStatusBadge(machine.status)}
                  
                  <Link
                    to={`/machinery/${machine.id}`}
                    className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-white uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
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
