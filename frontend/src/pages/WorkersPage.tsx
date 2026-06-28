import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkersList, useUpdateWorker, useDeleteWorker } from '../hooks/useWorkers'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  Edit2, 
  Trash2,
  Phone,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  MapPin
} from 'lucide-react'
import { toast } from '../utils/toast'

const WorkersPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Filters
  const [tradeFilter, setTradeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: workers, isLoading, error } = useWorkersList()
  const updateWorkerMutation = useUpdateWorker()
  const deleteWorkerMutation = useDeleteWorker()

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateWorkerMutation.mutateAsync({
        id,
        data: { active: !currentActive },
      })
      toast.success(`Worker status updated successfully.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update worker status.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete worker "${name}"? This will delete all their attendance history.`)) {
      return
    }
    try {
      await deleteWorkerMutation.mutateAsync(id)
      toast.success(`Worker "${name}" deleted successfully.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete worker.')
    }
  }

  // Filter workers locally
  const filteredWorkers = workers?.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (w.phone && w.phone.includes(searchQuery))
    const matchesTrade = tradeFilter ? w.trade === tradeFilter : true
    return matchesSearch && matchesTrade
  })

  // Get unique trades for filtering
  const uniqueTrades = Array.from(new Set(workers?.map((w) => w.trade) || []))

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a2535] pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Workers Registry</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Manage skilled labor profiles, daily wage rates, and check-in statuses</p>
          </div>
          {isEditable && (
            <Link
              to="/workers/new"
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Worker
            </Link>
          )}
        </div>

        {/* Data Table Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005] flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-350">Worker Records</h3>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {filteredWorkers?.length || 0} active/archived tradesmen
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Synchronizing workforce listings...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-455 bg-rose-500/8 border border-rose-500/20 rounded-xl max-w-md mx-auto my-12 font-semibold">
              Failed to load worker records. Verify connection.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  {/* Column Labels */}
                  <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                    <th className="py-4 px-6 w-12 text-center">#</th>
                    <th className="py-4 px-6">TRADESMAN</th>
                    <th className="py-4 px-4">TRADE SKILL</th>
                    <th className="py-4 px-4">DAILY RATE</th>
                    <th className="py-4 px-4">CONTACT</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-6 text-center w-48">ACTIONS</th>
                  </tr>
                  {/* Inline Searches */}
                  <tr className="bg-white/[0.005] border-b border-[#1a2535]">
                    <td className="py-2.5 px-4 text-center text-slate-700 font-bold">-</td>
                    <td className="py-2.5 px-6">
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-700" />
                        <input
                          type="text"
                          placeholder="Search name or phone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        value={tradeFilter}
                        onChange={(e) => setTradeFilter(e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all cursor-pointer"
                      >
                        <option value="">All Trades</option>
                        {uniqueTrades.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-4"></td>
                    <td className="py-2.5 px-4"></td>
                    <td className="py-2.5 px-4"></td>
                    <td className="py-2.5 px-6"></td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535]">
                  {filteredWorkers?.map((worker, index) => (
                    <tr key={worker.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6 text-center text-xs text-slate-500 font-semibold">{index + 1}</td>
                      <td className="py-4 px-6">
                        <Link 
                          to={`/workers/${worker.id}`}
                          className="font-bold text-sm text-white hover:text-blue-400 transition-colors block"
                        >
                          {worker.name}
                        </Link>
                        {worker.address && (
                          <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                            <MapPin className="h-3 w-3 mr-1 text-slate-700" /> {worker.address}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-350">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#0b1220] text-slate-355 border border-[#1a2535]">
                          <Briefcase className="h-3 w-3 mr-1.5 text-slate-500" />
                          {worker.trade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-black text-white tabular-nums">
                        Rs.{worker.dailyWage.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {worker.phone ? (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-slate-600" />
                            {worker.phone}
                          </span>
                        ) : (
                          <span className="text-slate-600">No contact info</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            worker.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                              : 'bg-slate-800 text-slate-400 border border-[#1a2535]'
                          }`}
                        >
                          {worker.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2.5">
                          <Link
                            to={`/workers/${worker.id}`}
                            className="p-1.5 bg-[#0b1220] hover:bg-[#111d33] text-slate-350 hover:text-white rounded-lg transition-colors border border-[#1a2535]"
                            title="View Profile Details"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                          </Link>
                          {isEditable && (
                            <Link
                              to={`/workers/${worker.id}/edit`}
                              className="p-1.5 bg-[#0b1220] hover:bg-[#111d33] text-slate-350 hover:text-blue-400 rounded-lg transition-colors border border-[#1a2535]"
                              title="Edit Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          {isEditable && (
                            <button
                              onClick={() => handleToggleActive(worker.id, worker.active)}
                              className={`p-1.5 rounded-lg transition-colors border ${
                                worker.active
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border-rose-500/22'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/22'
                              }`}
                              title={worker.active ? 'Suspend Worker' : 'Activate Worker'}
                            >
                              {worker.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(worker.id, worker.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 rounded-lg transition-colors border border-rose-500/22"
                              title="Delete Worker"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredWorkers?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-black uppercase tracking-wider">
                        No matching worker records located.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default WorkersPage
