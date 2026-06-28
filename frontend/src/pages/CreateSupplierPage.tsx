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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Suppliers
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2535] pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Add Supplier Profile</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register a new vendor/supplier company with billing terms</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holcim Cement Sri Lanka"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Short Name / Unique Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HOLCIM (No spaces)"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold uppercase"
                />
                <span className="text-[8px] text-slate-500 block mt-1">Short identifier used for PO logs</span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">VAT Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. VAT-1022934-8"
                  value={vatNo}
                  onChange={(e) => setVatNo(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +94 11 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Vendor Email</label>
                <input
                  type="email"
                  placeholder="e.g. sales@holcim.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Billing Address</label>
              <input
                type="text"
                placeholder="e.g. 100 Galle Road, Colombo 03"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 transition-all font-semibold cursor-pointer"
              >
                <option value="Cash">Cash / Immediate</option>
                <option value="Credit 30 Days">Credit 30 Days</option>
                <option value="Credit 60 Days">Credit 60 Days</option>
                <option value="Credit 90 Days">Credit 90 Days</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1a2535] flex gap-2">
              <Link
                to="/suppliers"
                className="flex-1 py-3 bg-[#0b1220] border border-[#1a2535] text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createSupplierMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
              >
                {createSupplierMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
