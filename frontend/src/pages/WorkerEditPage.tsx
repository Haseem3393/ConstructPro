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
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">Fetching worker profile state...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !worker) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 text-rose-455 p-6 rounded-2xl text-center max-w-lg mx-auto relative mt-16 z-10">
          <p className="font-bold mb-2 text-base">Error loading configurations</p>
          <p className="text-slate-500 text-xs mb-5">
            {(error as any)?.response?.data?.error || 'Worker not found.'}
          </p>
          <Link
            to="/workers"
            className="inline-flex items-center text-xs text-blue-450 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
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
        <div className="flex items-center space-x-4 border-b border-white/10 pb-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-[#0d1322]/70 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Configure Worker</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Modify worker status, daily wages, or contact metadata</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2 font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Tradesman Name *
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
                  Trade Skill Category *
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold cursor-pointer"
                >
                  {trades.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Base Daily Wage (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Home Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 resize-none font-semibold"
              />
            </div>

            <div className="flex items-center space-x-3 py-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 bg-[#0a0f1d]/60 border-white/10 text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-opacity-25 rounded cursor-pointer accent-[#7c3aed]"
              />
              <label htmlFor="active" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                Active status in active trade registry
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-white/10 pt-5 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateWorkerMutation.isPending}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
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
