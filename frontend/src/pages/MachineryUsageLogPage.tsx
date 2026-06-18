import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMachineryDetails, useLogMachineryUsage } from '../hooks/useMachinery'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, DollarSign } from 'lucide-react'

const MachineryUsageLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Queries
  const { data: machinery, isLoading: isMachineryLoading, isError: isMachineryError } = useMachineryDetails(id || '')
  const { data: projects, isLoading: isProjectsLoading } = useProjects()

  // Mutation
  const logUsageMutation = useLogMachineryUsage(id || '')

  // Form states
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [quantity, setQuantity] = useState('')
  const [operatorName, setOperatorName] = useState('')
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  const [formError, setFormError] = useState('')

  // Calculate live estimation when quantity or rate changes
  useEffect(() => {
    if (machinery && quantity) {
      const qtyVal = parseFloat(quantity)
      if (!isNaN(qtyVal) && qtyVal > 0) {
        setEstimatedCost(qtyVal * machinery.rate)
      } else {
        setEstimatedCost(0)
      }
    } else {
      setEstimatedCost(0)
    }
  }, [quantity, machinery])

  // If machinery is inactive or in maintenance, redirect or block
  const isLocked = machinery?.status === 'MAINTENANCE' || machinery?.status === 'INACTIVE'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (isLocked) {
      setFormError(`Machinery is currently in ${machinery?.status} status and cannot be logged for usage.`)
      return
    }

    if (!projectId) {
      setFormError('Please select a project assignment.')
      return
    }

    const qtyVal = parseFloat(quantity)
    if (isNaN(qtyVal) || qtyVal <= 0) {
      setFormError(`Please enter a valid positive number of ${machinery?.paymentType.toLowerCase()}s.`)
      return
    }

    try {
      const payload = {
        projectId,
        date,
        operatorName: operatorName.trim() || undefined,
        [machinery?.paymentType === 'HOUR' ? 'hoursUsed' : 'daysUsed']: qtyVal,
      }
      await logUsageMutation.mutateAsync(payload)
      navigate(`/machinery/${id}`)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to log machinery usage.')
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
          <h1 className="text-3xl font-extrabold text-white">Log Project Usage</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Record time durations and project assignments for <span className="text-violet-400 font-extrabold">{machinery.name}</span>
          </p>
        </div>

        {/* Locked warning */}
        {isLocked && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold space-y-1">
            <p className="uppercase tracking-wide">⚠️ Machine Lock Active</p>
            <p className="text-zinc-400 font-medium normal-case">
              This machinery is currently set to status: <span className="font-black text-rose-450">{machinery.status}</span>. 
              Usage entries cannot be created until the status is restored to ACTIVE.
            </p>
          </div>
        )}

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
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Assign Project context *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                disabled={isLocked}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer disabled:opacity-50"
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

            {/* Date and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Usage Date *</label>
                <input
                  type="date"
                  required
                  disabled={isLocked}
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold disabled:opacity-50 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">
                  Duration ({machinery.paymentType.toLowerCase()}s) *
                </label>
                <input
                  type="number"
                  required
                  disabled={isLocked}
                  min="0.1"
                  step="any"
                  placeholder={`Number of ${machinery.paymentType.toLowerCase()}s used`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold disabled:opacity-50"
                />
              </div>
            </div>

            {/* Operator Name */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Operator / driver name</label>
              <input
                type="text"
                disabled={isLocked}
                placeholder="e.g. Sarath Kumara"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold disabled:opacity-50"
              />
            </div>

            {/* Live Estimation */}
            <div className="p-4 bg-violet-600/10 border border-violet-500/20 rounded-lg flex items-center justify-between">
              <div>
                <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Auto-Calculated Cost</span>
                <span className="block text-zinc-500 text-[10px] font-bold mt-0.5 uppercase">
                  Rate: Rs.{machinery.rate} / {machinery.paymentType.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center text-violet-400 font-black text-lg">
                <DollarSign className="h-4.5 w-4.5 shrink-0" />
                <span>Rs.{estimatedCost.toLocaleString()}</span>
              </div>
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
                disabled={isLocked || logUsageMutation.isPending}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {logUsageMutation.isPending ? (
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

export default MachineryUsageLogPage
