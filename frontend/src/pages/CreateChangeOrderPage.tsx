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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Change Orders
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Create Change Order</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register client scope additions, variations, structural deviations, and budget adjustments</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Project Selector */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Site *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Contract *</label>
              <select
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                required
                disabled={!projectId}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!projectId
                    ? 'Select a project first'
                    : isContractsLoading
                    ? 'Loading contracts...'
                    : !contracts || contracts.length === 0
                    ? 'No contracts registered under this project'
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Variation Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Additional structural columns for ground floor"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Reason / Justification</label>
              <textarea
                rows={3}
                placeholder="e.g. Unforeseen soft soil condition required additional reinforcement pile structure."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold resize-none"
              />
            </div>

            {/* Cost and Time Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cost Impact (LKR) *</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="e.g. 150000 (can be negative for reduction)"
                  value={costImpact}
                  onChange={(e) => setCostImpact(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time Impact (Extra Days) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="e.g. 15"
                  value={timeImpact}
                  onChange={(e) => setTimeImpact(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Requested By Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requested By *</label>
              <select
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                required
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
              >
                <option value="Client">Client</option>
                <option value="PM">Project Manager (PM)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-3">
              <Link
                to="/change-orders"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createChangeOrderMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createChangeOrderMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
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
