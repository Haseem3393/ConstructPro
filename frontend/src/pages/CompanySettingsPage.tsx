import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompanySettings, useUpdateCompanySettings } from '../hooks/useSettings'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Building,
  Upload
} from 'lucide-react'

const CompanySettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useCompanySettings()
  const updateSettingsMutation = useUpdateCompanySettings()

  // Form states
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vatNo, setVatNo] = useState('')
  const [currency, setCurrency] = useState('LKR')
  const [workingDays, setWorkingDays] = useState('Mon-Sat')

  // Status message
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (settings) {
      setName(settings.name || '')
      setLogoUrl(settings.logoUrl || '')
      setAddress(settings.address || '')
      setPhone(settings.phone || '')
      setEmail(settings.email || '')
      setVatNo(settings.vatNo || '')
      setCurrency(settings.currency || 'LKR')
      setWorkingDays(settings.workingDays || 'Mon-Sat')
    }
  }, [settings])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoUrl(file.name) // simulated path
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    
    updateSettingsMutation.mutate({
      name,
      logoUrl,
      address,
      phone,
      email,
      vatNo,
      currency,
      workingDays
    }, {
      onSuccess: () => {
        setSuccessMsg('Company settings updated successfully!')
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    })
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Company Profile Settings</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Update corporate address details, email coordinates, tax references, currencies, and sidebar logos.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Loading company details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/22 text-emerald-400 p-4 rounded-xl text-xs font-bold">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                  placeholder="e.g. Munaf & Sons Contractors"
                />
              </div>

              {/* Logo Upload Simulation */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Sidebar Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0f1d]/60 border border-white/10 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest">
                    {logoUrl ? 'LOGO' : 'NONE'}
                  </div>
                  <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    <Upload className="h-4 w-4 mr-2" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logoUrl && <span className="text-slate-500 text-[10px] font-bold">File: {logoUrl}</span>}
                </div>
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Physical Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold leading-normal"
                  placeholder="Kandy Road, Colombo"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Telephone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                  placeholder="+94 11 234 5678"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                  placeholder="info@munafandsons.com"
                />
              </div>

              {/* VAT registration */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">VAT Registration Number</label>
                <input
                  type="text"
                  required
                  value={vatNo}
                  onChange={(e) => setVatNo(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
                  placeholder="VAT-1234567-89"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              {/* Working days */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Site Working Days</label>
                <select
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="Mon-Fri">Mon-Fri (5-Day Work Week)</option>
                  <option value="Mon-Sat">Mon-Sat (6-Day Work Week)</option>
                  <option value="Mon-Sun">Mon-Sun (7-Day Work Week)</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:opacity-90 text-white rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-widest disabled:opacity-40 cursor-pointer shadow-lg shadow-violet-500/10"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Changes
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </SidebarLayout>
  )
}

export default CompanySettingsPage
