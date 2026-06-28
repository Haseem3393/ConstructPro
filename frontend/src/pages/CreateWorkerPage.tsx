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
        <div className="flex items-center space-x-4 border-b border-[#1a2535] pb-5">
          <Link
            to="/workers"
            className="p-2.5 bg-[#0d1526] border border-[#1a2535] rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Register Worker</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Add new skilled labor resources, contact details, and base wage rates</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {formError && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2 font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">
                  Tradesman Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="e.g. A.C. Kumar"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">
                  Trade Skill Category *
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-350 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                >
                  {trades.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">
                  Base Daily Wage (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="e.g. 2500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                  placeholder="e.g. +94771234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] mb-1.5">
                Home Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200"
                placeholder="e.g. 123 Main Street, Colombo 03"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1a2535]">
              <button
                type="submit"
                disabled={createWorkerMutation.isPending}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {createWorkerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Registry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateWorkerPage
