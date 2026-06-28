import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjects, useCreateProject, useDeleteProject } from '../hooks/useProjects'
import { useUsersList } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Loader2, 
  Plus, 
  X, 
  Edit2, 
  Trash2,
  Filter,
  Eye,
  AlertCircle,
} from 'lucide-react'
import { toast } from '../utils/toast'

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: projects, isLoading, error } = useProjects()
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()

  // Fetch PMs and Clients
  const { data: managers } = useUsersList('PROJECT_MANAGER')
  const { data: clients } = useUsersList('CLIENT')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [managerId, setManagerId] = useState('')
  const [clientId, setClientId] = useState('')
  const [formError, setFormError] = useState('')

  // Column Filters
  const [searchName, setSearchName] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchBudget, setSearchBudget] = useState('')

  // Rows per page
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name || !location || !budget || !startDate || !endDate) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      await createProjectMutation.mutateAsync({
        name,
        location,
        budget: parseFloat(budget),
        startDate,
        endDate,
        description,
        managerId: managerId || undefined,
        clientId: clientId || undefined,
      })
      setName('')
      setLocation('')
      setBudget('')
      setStartDate('')
      setEndDate('')
      setDescription('')
      setManagerId('')
      setClientId('')
      setIsModalOpen(false)
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to create project.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(id)
        toast.success('Project deleted successfully.')
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Failed to delete project.')
      }
    }
  }

  // Filtered projects
  const filteredProjects = projects?.filter(project => {
    const matchesName = project.name.toLowerCase().includes(searchName.toLowerCase())
    const matchesLocation = project.location.toLowerCase().includes(searchLocation.toLowerCase())
    const matchesStatus = project.status.toLowerCase().includes(searchStatus.toLowerCase())
    const matchesBudget = project.budget.toString().includes(searchBudget)
    return matchesName && matchesLocation && matchesStatus && matchesBudget
  }) || []

  return (
    <SidebarLayout>
      <div className="space-y-6 fade-up">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Project Management</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Configure and filter construction contracts and budget sheets</p>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.005] flex justify-between items-center">
            <h3 className="font-black text-sm text-slate-350">Contract Records</h3>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {filteredProjects.length} records found
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="h-9 w-9 text-blue-500 animate-spin" />
                <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Syncing project ledger...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400 font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{(error as any)?.response?.data?.error || 'Failed to sync project records.'}</span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  {/* Columns Labels */}
                  <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-[#1a2535]">
                    <th className="py-4 px-6 w-12 text-center">ID</th>
                    <th className="py-4 px-6">PROJECT NAME</th>
                    <th className="py-4 px-4">LOCATION</th>
                    <th className="py-4 px-4">BUDGET (LKR)</th>
                    <th className="py-4 px-4 text-center">PROGRESS</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-6 text-center w-32">ACTIONS</th>
                  </tr>
                  {/* Inline Search Fields */}
                  <tr className="bg-white/[0.005] border-b border-[#1a2535]">
                    <td className="py-2.5 px-4 text-center text-slate-700 font-bold">-</td>
                    <td className="py-2.5 px-6">
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Search budget..."
                        value={searchBudget}
                        onChange={(e) => setSearchBudget(e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-700 font-bold">-</td>
                    <td className="py-2.5 px-4">
                      <select
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                        className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-2 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all"
                      >
                        <option value="">All Statuses</option>
                        <option value="PLANNING">Planning</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-6 text-center text-slate-700 font-bold">-</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535] text-xs">
                  {filteredProjects.slice(0, rowsPerPage).map((project, index) => (
                    <tr key={project.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-slate-650">{index + 1}</td>
                      <td className="py-4 px-6">
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="block font-bold text-white text-sm hover:text-blue-400 transition-colors"
                        >
                          {project.name}
                        </Link>
                        {project.description && (
                          <span className="block text-[10px] text-slate-550 mt-1 line-clamp-1">{project.description}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-350">{project.location}</td>
                      <td className="py-4 px-4 font-extrabold text-slate-200 tabular-nums">{project.budget.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          <span className="font-black text-slate-300 w-8 text-right tabular-nums">{project.progress}%</span>
                          <div className="w-16 bg-[#0b1220] rounded-full h-1.5 overflow-hidden border border-white/[0.02] shrink-0">
                             <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-1.5 rounded-full" style={{ width: `${project.progress}%` }} />
                           </div>
                         </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${
                          project.status === 'ONGOING'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/22'
                            : project.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                            : project.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-450 border border-rose-500/22'
                            : 'bg-amber-500/10 text-amber-450 border border-amber-500/22'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Edit / Pencil button */}
                           <button 
                             onClick={() => navigate(`/projects/${project.id}/edit`)}
                             className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20 transition-all duration-150"
                             title="Edit"
                           >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete button (only for Admin) */}
                          {user?.role === 'ADMIN' && (
                            <button 
                              onClick={() => handleDelete(project.id)}
                              className="p-1.5 bg-rose-500/10 text-rose-450 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition-all duration-150"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-600 font-bold uppercase tracking-wider text-xs">No project contracts match search filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-white/[0.005] border-t border-[#1a2535] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="font-semibold">
              Showing {Math.min(filteredProjects.length, rowsPerPage)} of {filteredProjects.length} entries
            </div>
            <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                className="bg-[#0b1220] border border-[#1a2535] rounded-xl px-2.5 py-1 text-slate-350 focus:outline-none focus:border-blue-500/50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl shadow-2xl shadow-black/80 max-w-lg w-full overflow-hidden modal-enter relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#1a2535] bg-white/[0.01]">
              <h3 className="text-base font-black text-white">Create Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg bg-white/[0.04] text-slate-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {formError && (
                  <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="e.g. Colombo Residential Complex"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="e.g. Colombo 03"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Budget (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                    placeholder="e.g. 5000000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Project Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2.5 text-sm text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  >
                    <option value="">Unassigned</option>
                    {managers?.map((mgr: any) => (
                      <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Client / Owner</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-3 py-2.5 text-sm text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  >
                    <option value="">Unassigned</option>
                    {clients?.map((cl: any) => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="Additional descriptions..."
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-[#1a2535] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#1a2535] hover:bg-[#111d33] text-slate-350 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
                >
                  {createProjectMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default ProjectsPage
