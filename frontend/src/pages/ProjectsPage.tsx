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
  Eye
} from 'lucide-react'

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
      } catch (err: any) {
        alert(err?.response?.data?.error || 'Failed to delete project.')
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Project Management</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure and filter construction contracts and budget sheets</p>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-300">Contract Records</h3>
            <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded font-bold">
              {filteredProjects.length} records found
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
              <p className="text-zinc-500 text-sm font-medium">Syncing project ledger...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 font-semibold">
              {(error as any)?.response?.data?.error || 'Failed to sync project records.'}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  {/* Columns Labels */}
                  <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                    <th className="py-4 px-6 w-12 text-center">ID</th>
                    <th className="py-4 px-6">PROJECT NAME</th>
                    <th className="py-4 px-4">LOCATION</th>
                    <th className="py-4 px-4">BUDGET (LKR)</th>
                    <th className="py-4 px-4 text-center">PROGRESS</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-6 text-center w-32">ACTIONS</th>
                  </tr>
                  {/* Inline Search Fields */}
                  <tr className="bg-[#161822]/40 border-b border-zinc-805">
                    <td className="py-2.5 px-4 text-center text-zinc-650 font-bold">-</td>
                    <td className="py-2.5 px-6">
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Search budget..."
                        value={searchBudget}
                        onChange={(e) => setSearchBudget(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-600"
                      />
                    </td>
                    <td className="py-2.5 px-4">-</td>
                    <td className="py-2.5 px-4">
                      <select
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-violet-600"
                      >
                        <option value="">All Statuses</option>
                        <option value="PLANNING">Planning</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-6 text-center">-</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {filteredProjects.slice(0, rowsPerPage).map((project, index) => (
                    <tr key={project.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-zinc-500">{index + 1}</td>
                      <td className="py-4 px-6">
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="block font-bold text-white text-sm hover:text-violet-400 transition-colors"
                        >
                          {project.name}
                        </Link>
                        {project.description && (
                          <span className="block text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{project.description}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-300">{project.location}</td>
                      <td className="py-4 px-4 font-extrabold text-zinc-200">{project.budget.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          <span className="font-bold text-zinc-300 w-8 text-right">{project.progress}%</span>
                          <div className="w-16 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                          project.status === 'ONGOING'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                            : project.status === 'COMPLETED'
                            ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                            : project.status === 'OVERDUE'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Edit / Pencil button */}
                          <button 
                            onClick={() => navigate(`/projects/${project.id}/edit`)}
                            className="p-1.5 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white rounded border border-violet-500/20 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete button (only for Admin) */}
                          {user?.role === 'ADMIN' && (
                            <button 
                              onClick={() => handleDelete(project.id)}
                              className="p-1.5 bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white rounded border border-rose-500/20 transition-all"
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
                      <td colSpan={7} className="py-12 text-center text-zinc-500">No project contracts match search filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-[#171924]/20 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
            <div>
              Showing {Math.min(filteredProjects.length, rowsPerPage)} of {filteredProjects.length} entries
            </div>
            <div className="flex items-center space-x-2 font-semibold">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                className="bg-[#1b1c25] border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
              <h3 className="text-lg font-bold text-white">Create Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-350 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                  placeholder="e.g. Colombo Residential Complex"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                  placeholder="e.g. Colombo 03"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Budget (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                    placeholder="e.g. 5000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Project Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-350 focus:outline-none focus:border-violet-600"
                  >
                    <option value="">Unassigned</option>
                    {managers?.map((mgr: any) => (
                      <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Client / Owner</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-350 focus:outline-none focus:border-violet-600"
                  >
                    <option value="">Unassigned</option>
                    {clients?.map((cl: any) => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3.5 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                  placeholder="Additional descriptions..."
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-zinc-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-850 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
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
