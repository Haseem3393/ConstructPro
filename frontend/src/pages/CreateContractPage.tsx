import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateContract } from '../hooks/useContracts'
import { useSubcontractorsList } from '../hooks/useFinance'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, Paperclip } from 'lucide-react'

const CreateContractPage: React.FC = () => {
  const navigate = useNavigate()

  // Queries
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const { data: subcontractors } = useSubcontractorsList()

  // Mutation
  const createContractMutation = useCreateContract()

  // Form states
  const [projectId, setProjectId] = useState('')
  const [type, setType] = useState<'MAIN' | 'SUBCONTRACTOR'>('MAIN')
  const [clientName, setClientName] = useState('')
  const [subcontractorId, setSubcontractorId] = useState('')
  const [value, setValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Milestone Based (Foundation 25%, Structure 35%, Roofing 25%, Handover 15%)')
  const [scope, setScope] = useState('')
  const [uploadedDocName, setUploadedDocName] = useState('')
  const [formError, setFormError] = useState('')

  // Sync clientName when subcontractor changes
  useEffect(() => {
    if (type === 'SUBCONTRACTOR' && subcontractorId && subcontractors) {
      const selected = subcontractors.find(s => s.id === subcontractorId)
      if (selected) {
        setClientName(selected.name)
      }
    }
  }, [subcontractorId, subcontractors, type])

  // Sync clientName suggestion when project changes in MAIN mode
  useEffect(() => {
    if (type === 'MAIN' && projectId && projects) {
      const selected = projects.find(p => p.id === projectId)
      if (selected && selected.client) {
        setClientName(selected.client.name)
      }
    }
  }, [projectId, projects, type])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedDocName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!projectId) {
      setFormError('Please select a project site.')
      return
    }

    if (type === 'SUBCONTRACTOR' && !subcontractorId) {
      setFormError('Please select a subcontractor payee.')
      return
    }

    if (!clientName.trim()) {
      setFormError('Client / Payee Name is required.')
      return
    }

    const valueVal = parseFloat(value)
    if (isNaN(valueVal) || valueVal <= 0) {
      setFormError('Contract value must be a positive number greater than zero.')
      return
    }

    if (!startDate || !endDate) {
      setFormError('Please specify start and end dates.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      setFormError('Contract start date must be before end date.')
      return
    }

    try {
      await createContractMutation.mutateAsync({
        projectId,
        type,
        clientName: clientName.trim(),
        subcontractorId: type === 'SUBCONTRACTOR' ? subcontractorId : undefined,
        value: valueVal,
        startDate,
        endDate,
        paymentTerms: paymentTerms.trim() || undefined,
        scope: scope.trim() || undefined,
        documentUrl: uploadedDocName || undefined,
      })
      navigate('/contracts')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create contract.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/contracts"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Registry
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-2xl font-black text-white tracking-tight">Register Construction Contract</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register main client project binders or legal subcontractor agreements, initializing payment terms schedules</p>
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

            {/* Type Toggle */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contract Classification *</label>
              <div className="grid grid-cols-2 gap-2 bg-[#0a0f1d]/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setType('MAIN')
                    setSubcontractorId('')
                    setClientName('')
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${type === 'MAIN' ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow shadow-purple-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Main Contract (Client Client)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('SUBCONTRACTOR')
                    setClientName('')
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${type === 'SUBCONTRACTOR' ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow shadow-purple-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Subcontractor Binder
                </button>
              </div>
            </div>

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

            {/* Payee Selection / Input fields */}
            {type === 'SUBCONTRACTOR' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subcontractor Payee *</label>
                  <select
                    value={subcontractorId}
                    onChange={(e) => setSubcontractorId(e.target.value)}
                    required
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                  >
                    <option value="">Select Subcontractor</option>
                    {subcontractors?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payee Name Display *</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Auto-populated from select"
                    value={clientName}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-semibold focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haseem Munaf, Ministry of Roads"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            )}

            {/* Contract Value LKR */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contract Value (LKR) *</label>
              <input
                type="number"
                required
                min="1000"
                step="any"
                placeholder="e.g. 50000000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            {/* Timeline Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Terms</label>
              <input
                type="text"
                placeholder="e.g. Net 30, Milestone schedule logs"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scope of Work / Description</label>
              <textarea
                rows={4}
                placeholder="Details of agreement scope, structural milestones, and concrete targets."
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold resize-none"
              />
            </div>

            {/* Document upload mock */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Signed Agreement Document</label>
              <div className="relative flex items-center justify-center border-2 border-dashed border-white/10 hover:border-[#7c3aed]/30 bg-[#0a0f1d]/60 rounded-xl p-5 transition-all group cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center space-y-1">
                  <Paperclip className="h-5 w-5 text-slate-500 mx-auto group-hover:text-[#00d2ff] transition-colors" />
                  <span className="block text-xs font-bold text-slate-355">
                    {uploadedDocName ? uploadedDocName : 'Choose contract PDF/Word file'}
                  </span>
                  <span className="block text-[9px] text-slate-500 uppercase font-black">
                    Valid formats: PDF, DOC, DOCX up to 10MB
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-3">
              <Link
                to="/contracts"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createContractMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createContractMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Contract
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateContractPage
