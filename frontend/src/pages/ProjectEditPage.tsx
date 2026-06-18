import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProjectDetails, useUpdateProject } from '../hooks/useProjects'
import { useUsersList } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading: isProjectLoading, error } = useProjectDetails(id || '')
  const { data: managers } = useUsersList('PROJECT_MANAGER')
  const { data: clients } = useUsersList('CLIENT')
  const updateProjectMutation = useUpdateProject()

  // Form State
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'PLANNING' | 'ONGOING' | 'COMPLETED' | 'OVERDUE'>('PLANNING')
  const [progress, setProgress] = useState(0)
  const [managerId, setManagerId] = useState('')
  const [clientId, setClientId] = useState('')
  const [formError, setFormError] = useState('')

  // Sync state when project loads
  useEffect(() => {
    if (project) {
      setName(project.name)
      setLocation(project.location)
      setBudget(project.budget.toString())
      setStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '')
      setEndDate(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '')
      setDescription(project.description || '')
      setStatus(project.status)
      setProgress(project.progress)
      setManagerId(project.managerId || '')
      setClientId(project.clientId || '')
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!id) return

    if (!name || !location || !budget || !startDate || !endDate) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      await updateProjectMutation.mutateAsync({
        id,
        data: {
          name,
          location,
          description,
          budget: parseFloat(budget),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          progress,
          managerId: managerId || undefined,
          clientId: clientId || undefined,
        },
      })
      navigate('/projects')
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to update project configurations.')
    }
  }

  if (isProjectLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Fetching contract configurations...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !project) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-400 font-bold mb-2">Error loading configurations</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'Project not found.'}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to projects
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Configure Project</h1>
            <p className="text-zinc-400 text-sm mt-1">Modify budget sheets, managers, status, and contract ranges</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Project Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-violet-600 bg-none"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Budget (LKR) *
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Project Manager
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-violet-600"
                >
                  <option value="">Unassigned</option>
                  {managers?.map((mgr: any) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Client / Owner
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-violet-600"
                >
                  <option value="">Unassigned</option>
                  {clients?.map((cl: any) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Manual Site Progress (%)
                </label>
                <span className="text-sm font-black text-violet-400">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-600"
                placeholder="Contract scopes, notes, materials etc."
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-zinc-800 pt-5 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-zinc-800 text-zinc-355 hover:bg-zinc-850 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProjectMutation.isPending}
                className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {updateProjectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Configurations
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ProjectEditPage
