import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateWorker } from '../hooks/useWorkers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const CreateWorkerPage: React.FC = () => {
  const navigate = useNavigate()
  const createWorkerMutation = useCreateWorker()

  const [name, setName] = useState('')
  const [trade, setTrade] = useState('Mason')
  const [dailyWage, setDailyWage] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

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
      await createWorkerMutation.mutateAsync({
        name,
        trade,
        dailyWage: wageNum,
        phone: phone || undefined,
        address: address || undefined,
      })
      navigate('/workers')
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to register worker. Verify input details.')
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

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-white/10 pb-5">
          <Link
            to="/workers"
            className="p-2.5 bg-[#0d1322]/70 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Register Worker</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Add new skilled labor resources, contact details, and base wage rates</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSave} className="space-y-5">
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
                  placeholder="e.g. A.C. Kumar"
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
                  placeholder="e.g. 2500"
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
                  placeholder="e.g. +94771234567"
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
                placeholder="e.g. 123 Main Street, Colombo 03"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <Link
                to="/workers"
                className="px-4 py-2.5 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createWorkerMutation.isPending}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createWorkerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Registry
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateWorkerPage
