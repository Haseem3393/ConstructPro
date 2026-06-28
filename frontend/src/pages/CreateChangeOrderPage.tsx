import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateChangeOrder, useContractsList } from '../hooks/useContracts'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CreateChangeOrderPage: React.FC = () => {
  const navigate = useNavigate()

  // Queries
  const { data: projects, isLoading: isProjectsLoading } = useProjects()

  // Form states
  const [projectId, setProjectId] = useState('')
  const [contractId, setContractId] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')
  const [costImpact, setCostImpact] = useState('')
  const [timeImpact, setTimeImpact] = useState('')
  const [requestedBy, setRequestedBy] = useState('Client')
  const [formError, setFormError] = useState('')

  // Mutation
  const createChangeOrderMutation = useCreateChangeOrder()

  // Fetch contracts for the selected project
  const { data: contracts, isLoading: isContractsLoading } = useContractsList(
    projectId ? { projectId } : undefined
  )

  // Reset contract selection if project changes
  useEffect(() => {
    setContractId('')
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!projectId) {
      setFormError('Please select a project site.')
      return
    }

    if (!contractId) {
      setFormError('Please select a contract.')
      return
    }

    if (!description.trim()) {
      setFormError('Description is required.')
      return
    }

    const costImpactVal = parseFloat(costImpact)
    if (isNaN(costImpactVal)) {
      setFormError('Cost impact must be a valid number.')
      return
    }

    const timeImpactVal = parseInt(timeImpact, 10)
    if (isNaN(timeImpactVal) || timeImpactVal < 0) {
      setFormError('Time impact must be a non-negative integer.')
      return
    }

    try {
      await createChangeOrderMutation.mutateAsync({
        projectId,
        contractId,
        description: description.trim(),
        reason: reason.trim() || undefined,
        costImpact: costImpactVal,
        timeImpact: timeImpactVal,
        requestedBy,
      })
      navigate('/change-orders')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create change order.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/change-orders"
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Change Orders
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Create Change Order</h1>
          <p className="text-zinc-400 text-sm mt-1">Register client scope additions, variations, structural deviations, and budget adjustments</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Project Selector */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Project Site *</label>
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
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Contract Selector */}
            <div>
              <label className="block text-[10px] font-black text-zinc-455 uppercase tracking-widest mb-2">Target Contract *</label>
              <select
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                required
                disabled={!projectId}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!projectId
                    ? 'Select a project first'
                    : isContractsLoading
                    ? 'Loading contracts...'
                    : !contracts || contracts.length === 0
                    ? 'No contracts registerd under this project'
                    : 'Select Contract'}
                </option>
                {projectId &&
                  contracts?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'MAIN' ? 'Main' : 'Sub'} - {c.clientName} (Rs.{c.value.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Variation Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Additional structural columns for ground floor"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Technical Reason / Justification</label>
              <textarea
                rows={3}
                placeholder="e.g. Unforeseen soft soil condition required additional reinforcement pile structure."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Cost and Time Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Cost Impact (LKR) *</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="e.g. 150000 (can be negative for reduction)"
                  value={costImpact}
                  onChange={(e) => setCostImpact(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Time Impact (Extra Days) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="e.g. 15"
                  value={timeImpact}
                  onChange={(e) => setTimeImpact(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>
            </div>

            {/* Requested By Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Requested By *</label>
              <select
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                required
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
              >
                <option value="Client">Client</option>
                <option value="PM">Project Manager (PM)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-850 flex gap-2">
              <Link
                to="/change-orders"
                className="flex-1 py-3 bg-[#1b1c25] border border-zinc-800 text-zinc-455 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createChangeOrderMutation.isPending}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {createChangeOrderMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Change Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateChangeOrderPage
