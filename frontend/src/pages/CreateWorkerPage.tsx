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
        <div className="flex items-center space-x-4">
          <Link
            to="/workers"
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Register Worker</h1>
            <p className="text-zinc-400 text-sm mt-1">Add new skilled labor resources, contact details, and base wage rates</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
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
                  placeholder="e.g. A.C. Kumar"
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
                  placeholder="e.g. 2500"
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
                  placeholder="e.g. +94771234567"
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
                placeholder="e.g. 123 Main Street, Colombo 03"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800/80">
              <button
                type="submit"
                disabled={createWorkerMutation.isPending}
                className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/10 transition-all disabled:opacity-50"
              >
                {createWorkerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
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
