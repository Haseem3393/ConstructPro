import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateSupplier } from '../hooks/useSuppliers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const CreateSupplierPage: React.FC = () => {
  const navigate = useNavigate()
  const createSupplierMutation = useCreateSupplier()

  // Form fields
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vatNo, setVatNo] = useState('')
  const [address, setAddress] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Cash')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !shortName) {
      setError('Company Name and Short Code are required.')
      return
    }

    try {
      await createSupplierMutation.mutateAsync({
        name,
        shortName: shortName.toUpperCase().replace(/\s+/g, ''),
        phone: phone || undefined,
        email: email || undefined,
        vatNo: vatNo || undefined,
        address: address || undefined,
        paymentTerms,
      })
      navigate('/suppliers')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create supplier profile.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/suppliers"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Suppliers
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Add Supplier Profile</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register a new vendor/supplier company with billing terms</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holcim Cement Sri Lanka"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Name / Unique Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HOLCIM (No spaces)"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold uppercase"
                />
                <span className="text-[8px] text-slate-500 font-bold block mt-1">Short identifier used for PO logs</span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">VAT Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. VAT-1022934-8"
                  value={vatNo}
                  onChange={(e) => setVatNo(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +94 11 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Email</label>
                <input
                  type="email"
                  placeholder="e.g. sales@holcim.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billing Address</label>
              <input
                type="text"
                placeholder="e.g. 100 Galle Road, Colombo 03"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 transition-all font-semibold cursor-pointer"
              >
                <option value="Cash">Cash / Immediate</option>
                <option value="Credit 30 Days">Credit 30 Days</option>
                <option value="Credit 60 Days">Credit 60 Days</option>
                <option value="Credit 90 Days">Credit 90 Days</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link
                to="/suppliers"
                className="flex-1 py-3 bg-[#0a0f1d]/60 border border-white/10 text-slate-400 hover:bg-[#7c3aed]/10 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createSupplierMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {createSupplierMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateSupplierPage
