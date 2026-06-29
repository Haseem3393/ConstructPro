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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Registry
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Register Machinery & Equipment</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Add a new company-owned asset or sub-contracted hired machinery to the fleet registry</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Machinery Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. JCB Excavator 3CX, Concrete Mixer, Tower Crane"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Brand / Model (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Caterpillar, Komatsu, Liebherr"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            {/* Ownership and Hire Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ownership Type *</label>
                <select
                  value={ownership}
                  onChange={(e) => setOwnership(e.target.value as 'OWNED' | 'HIRED')}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                >
                  <option value="OWNED">Owned (Company Asset)</option>
                  <option value="HIRED">Hired (External Provider)</option>
                </select>
              </div>

              {ownership === 'HIRED' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hire Provider / Source *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senok Trade, United Rentals"
                    value={hireSource}
                    onChange={(e) => setHireSource(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Payment Type and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Rate Type *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'HOUR' | 'DAY')}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
                >
                  <option value="HOUR">Per Hour</option>
                  <option value="DAY">Per Day</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rate (LKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE')}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
              >
                <option value="ACTIVE">Active (Available)</option>
                <option value="INACTIVE">Inactive (Unavailable)</option>
                <option value="MAINTENANCE">Maintenance (Under Repairs)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                to="/machinery"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMachineryMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createMachineryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
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
