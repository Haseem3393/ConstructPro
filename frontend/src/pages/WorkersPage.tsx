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
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update worker status.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete worker "${name}"? This will delete all their attendance history.`)) {
      return
    }
    try {
      await deleteWorkerMutation.mutateAsync(id)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete worker.')
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Workers Registry</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage skilled labor profiles, daily wage rates, and check-in statuses</p>
          </div>
          {isEditable && (
            <Link
              to="/workers/new"
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/10 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Worker
            </Link>
          )}
        </div>

        {/* Data Table Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-300 font-sans">Worker Records</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold">
              {filteredWorkers?.length || 0} active/archived tradesmen
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Synchronizing workforce listings...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-400 font-medium text-sm">
              Failed to load worker records. Verify connection.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  {/* Column Labels */}
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6 w-12 text-center">#</th>
                    <th className="py-4 px-6">TRADESMAN</th>
                    <th className="py-4 px-4">TRADE SKILL</th>
                    <th className="py-4 px-4">DAILY RATE</th>
                    <th className="py-4 px-4">CONTACT</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-6 text-center w-48">ACTIONS</th>
                  </tr>
                  {/* Inline Searches */}
                  <tr className="bg-[#161822]/40 border-b border-zinc-800">
                    <td className="py-2.5 px-4 text-center text-zinc-600 font-bold">-</td>
                    <td className="py-2.5 px-6">
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="Search name or phone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#1b1c25] border border-zinc-800/85 rounded pl-8 pr-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        value={tradeFilter}
                        onChange={(e) => setTradeFilter(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/85 rounded px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-600"
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
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredWorkers?.map((worker, index) => (
                    <tr key={worker.id} className="hover:bg-[#181a24]/30 transition-colors">
                      <td className="py-4 px-6 text-center text-xs text-zinc-500 font-semibold">{index + 1}</td>
                      <td className="py-4 px-6">
                        <Link 
                          to={`/workers/${worker.id}`}
                          className="font-bold text-sm text-white hover:text-blue-400 transition-colors block"
                        >
                          {worker.name}
                        </Link>
                        {worker.address && (
                          <span className="text-[10px] text-zinc-500 flex items-center mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" /> {worker.address}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-350">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-850 text-zinc-350 border border-zinc-800/80">
                          <Briefcase className="h-3 w-3 mr-1.5 text-zinc-500" />
                          {worker.trade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-black text-white">
                        Rs.{worker.dailyWage.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-xs text-zinc-400">
                        {worker.phone ? (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-zinc-650" />
                            {worker.phone}
                          </span>
                        ) : (
                          <span className="text-zinc-600">No contact info</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            worker.active
                              ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                              : 'bg-zinc-800/60 text-zinc-550 border border-zinc-700/40'
                          }`}
                        >
                          {worker.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2.5">
                          <Link
                            to={`/workers/${worker.id}`}
                            className="p-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded transition-colors border border-zinc-800"
                            title="View Profile Details"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                          </Link>
                          {isEditable && (
                            <Link
                              to={`/workers/${worker.id}/edit`}
                              className="p-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 rounded transition-colors border border-zinc-800"
                              title="Edit Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          {isEditable && (
                            <button
                              onClick={() => handleToggleActive(worker.id, worker.active)}
                              className={`p-1.5 rounded transition-colors border ${
                                worker.active
                                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25'
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/25'
                              }`}
                              title={worker.active ? 'Suspend Worker' : 'Activate Worker'}
                            >
                              {worker.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(worker.id, worker.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors border border-rose-500/25"
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
                      <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs font-semibold">
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
