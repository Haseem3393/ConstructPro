import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWorkerDetails, useUpdateWorker } from '../hooks/useWorkers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const WorkerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: worker, isLoading: isWorkerLoading, error } = useWorkerDetails(id || '')
  const updateWorkerMutation = useUpdateWorker()

  // Form State
  const [name, setName] = useState('')
  const [trade, setTrade] = useState('Mason')
  const [dailyWage, setDailyWage] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [active, setActive] = useState(true)
  const [formError, setFormError] = useState('')

  // Sync state when worker loads
  useEffect(() => {
    if (worker) {
      setName(worker.name)
      setTrade(worker.trade)
      setDailyWage(worker.dailyWage.toString())
      setPhone(worker.phone || '')
      setAddress(worker.address || '')
      setActive(worker.active)
    }
  }, [worker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!id) return

    if (!name || !trade || !dailyWage) {
      setFormError('Please fill in all required fields.')
      return
    }

    const wageNum = parseFloat(dailyWage)
    if (isNaN(wageNum) || wageNum <= 0) {
      setFormError('Daily wage must be a valid positive number.')
      return
    }

    try {
      await updateWorkerMutation.mutateAsync({
        id,
        data: {
          name,
          trade,
          dailyWage: wageNum,
          phone: phone || undefined,
          address: address || undefined,
          active,
        },
      })
      navigate('/workers')
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to update worker details.')
    }
  }

  const trades = [
    'Mason',
    'Carpenter',
    'Helper',
    'Electrician',
    'Plumber',
    'Painter',
    'Welder',
    'Supervisor',
    'Other'
  ]

  if (isWorkerLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Fetching worker profile state...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !worker) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-400 font-bold mb-2">Error loading configurations</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'Worker not found.'}
          </p>
          <Link
            to="/workers"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to workers
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
            <h1 className="text-3xl font-extrabold text-white">Configure Worker</h1>
            <p className="text-zinc-400 text-sm mt-1">Modify worker status, daily wages, or contact metadata</p>
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
                  Tradesman Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Trade Skill Category *
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  {trades.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Base Daily Wage (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Home Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center space-x-3 py-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 bg-[#1b1c25] border-zinc-800 text-blue-600 focus:ring-blue-600 focus:ring-opacity-25 rounded cursor-pointer"
              />
              <label htmlFor="active" className="text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer select-none">
                Active status in active trade registry
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-zinc-800 pt-5 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-zinc-800 text-zinc-350 hover:bg-zinc-850 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateWorkerMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {updateWorkerMutation.isPending ? (
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

export default WorkerEditPage
