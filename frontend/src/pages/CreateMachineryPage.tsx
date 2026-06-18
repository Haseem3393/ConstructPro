import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateMachinery } from '../hooks/useMachinery'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CreateMachineryPage: React.FC = () => {
  const navigate = useNavigate()
  const createMachineryMutation = useCreateMachinery()

  // Form states
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [ownership, setOwnership] = useState<'OWNED' | 'HIRED'>('OWNED')
  const [hireSource, setHireSource] = useState('')
  const [paymentType, setPaymentType] = useState<'HOUR' | 'DAY'>('HOUR')
  const [rate, setRate] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'>('ACTIVE')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Machinery Name is required.')
      return
    }

    const rateVal = parseFloat(rate)
    if (isNaN(rateVal) || rateVal <= 0) {
      setFormError('Standard Rate must be a positive number (LKR).')
      return
    }

    if (ownership === 'HIRED' && !hireSource.trim()) {
      setFormError('Hire Provider / Source is required for HIRED machinery.')
      return
    }

    try {
      await createMachineryMutation.mutateAsync({
        name: name.trim(),
        brand: brand.trim() || undefined,
        ownership,
        hireSource: ownership === 'HIRED' ? hireSource.trim() : undefined,
        paymentType,
        rate: rateVal,
        status,
      })
      navigate('/machinery')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to register machinery.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/machinery"
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Registry
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-extrabold text-white">Register Machinery & Equipment</h1>
          <p className="text-zinc-400 text-sm mt-1">Add a new company-owned asset or sub-contracted hired machinery to the fleet registry</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs font-bold">
                {formError}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Machinery Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. JCB Excavator 3CX, Concrete Mixer, Tower Crane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Brand / Model (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Caterpillar, Komatsu, Liebherr"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
              />
            </div>

            {/* Ownership and Hire Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Ownership Type *</label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(e.target.value as 'OWNED' | 'HIRED')}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
                >
                  <option value="OWNED">Owned (Company Asset)</option>
                  <option value="HIRED">Hired (External Provider)</option>
                </select>
              </div>

              {ownership === 'HIRED' && (
                <div>
                  <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Hire Provider / Source *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senok Trade, United Rentals"
                    value={hireSource}
                    onChange={(e) => setHireSource(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Payment Type and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Payment Rate Type *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'HOUR' | 'DAY')}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
                >
                  <option value="HOUR">Per Hour</option>
                  <option value="DAY">Per Day</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Rate (LKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 font-semibold"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-widest mb-2">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')}
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 font-semibold cursor-pointer"
              >
                <option value="ACTIVE">Active (Available)</option>
                <option value="INACTIVE">Inactive (Unavailable)</option>
                <option value="MAINTENANCE">Maintenance (Under Repairs)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-850 flex gap-2">
              <Link
                to="/machinery"
                className="flex-1 py-3 bg-[#1b1c25] border border-zinc-800 text-zinc-450 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMachineryMutation.isPending}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {createMachineryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Register Machinery
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateMachineryPage
