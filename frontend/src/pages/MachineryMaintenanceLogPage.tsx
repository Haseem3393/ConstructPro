import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMachineryDetails, useLogMachineryMaintenance } from '../hooks/useMachinery'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, Wrench } from 'lucide-react'

const MachineryMaintenanceLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Queries
  const { data: machinery, isLoading: isMachineryLoading, isError: isMachineryError } = useMachineryDetails(id || '')
  const { data: projects, isLoading: isProjectsLoading } = useProjects()

  // Mutation
  const logMaintenanceMutation = useLogMachineryMaintenance(id || '')

  // Form states
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [cost, setCost] = useState('')
  const [description, setDescription] = useState('')
  const [doneBy, setDoneBy] = useState('')
  const [setStatusMaintenance, setSetStatusMaintenance] = useState(true)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!projectId) {
      setFormError('Please select a project to allocate this maintenance expense.')
      return
    }

    if (!description.trim()) {
      setFormError('Please enter a description of the maintenance performed.')
      return
    }

    const costVal = parseFloat(cost)
    if (isNaN(costVal) || costVal < 0) {
      setFormError('Please enter a valid non-negative cost value.')
      return
    }

    try {
      await logMaintenanceMutation.mutateAsync({
        projectId,
        date,
        description: description.trim(),
        cost: costVal,
        doneBy: doneBy.trim() || undefined,
        setStatusMaintenance,
      })
      navigate(`/machinery/${id}`)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to log machinery maintenance.')
    }
  }

  if (isMachineryLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading asset context...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isMachineryError || !machinery) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4 max-w-md mx-auto">
          <p className="font-extrabold text-sm uppercase tracking-wider">Asset Registry Error</p>
          <p className="text-xs text-zinc-400">The machinery equipment details could not be found.</p>
          <Link to="/machinery" className="inline-flex text-xs font-bold text-violet-400 hover:text-violet-300">
            Back to Registry
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to={`/machinery/${id}`}
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Machinery Detail
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Log Maintenance Service</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Record repairs, servicing, and technical maintenance for <span className="text-violet-400 font-extrabold">{machinery.name}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Project Select */}
            <div>
              <label className="block text-[10px] font-black text-zinc-455 uppercase tracking-widest mb-2">Allocate Expense Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
              >
                <option value="">Select Project</option>
                {isProjectsLoading ? (
                  <option>Loading Projects...</option>
                ) : (
                  projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date and Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Service Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-455 uppercase tracking-widest mb-2">Maintenance Cost (LKR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 15000 (Enter 0 if covered under free warranty)"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>
            </div>

            {/* Done By / Technician */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Service Technician / Workshop Agency</label>
              <input
                type="text"
                placeholder="e.g. DIMO Machinery, Local Mechanic Workshop"
                value={doneBy}
                onChange={(e) => setDoneBy(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Description / Work Details */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Service Description / Repairs Performed *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Engine oil replacement, filter swap, hydraulic pump seal repairs."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Flag Maintenance Status Toggle */}
            <div className="pt-2">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={setStatusMaintenance}
                  onChange={(e) => setSetStatusMaintenance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 peer-checked:after:bg-white border border-zinc-750"></div>
                <span className="ms-3 text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-amber-400" />
                  Flag machinery status to MAINTENANCE automatically
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-850 flex gap-2">
              <Link
                to={`/machinery/${id}`}
                className="flex-1 py-3 bg-[#1b1c25] border border-zinc-800 text-zinc-450 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={logMaintenanceMutation.isPending}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {logMaintenanceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default MachineryMaintenanceLogPage
