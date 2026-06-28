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
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">Fetching contract configurations...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !project) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 text-rose-450 p-6 rounded-2xl text-center max-w-lg mx-auto flex flex-col items-center mt-16 z-10 relative">
          <p className="font-bold mb-2 text-base">Error loading configurations</p>
          <p className="text-slate-500 text-xs mb-5">
            {(error as any)?.response?.data?.error || 'Project not found.'}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center text-xs text-blue-455 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
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
            className="p-2.5 bg-[#0d1322]/70 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Configure Project</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Modify budget sheets, managers, status, and contract ranges</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-450 text-xs rounded-xl flex items-center gap-2 font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Project Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Budget (LKR) *
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Project Manager
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold"
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Client / Owner
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-355 focus:outline-none transition-all duration-200 font-semibold"
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Manual Site Progress (%)
                </label>
                <span className="text-sm font-black text-[#00d2ff]">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full h-2 bg-[#0a0f1d]/60 border border-white/10 rounded-xl appearance-none cursor-pointer accent-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 resize-none font-semibold"
                placeholder="Contract scopes, notes, materials etc."
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-white/10 pt-5 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProjectMutation.isPending}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
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
