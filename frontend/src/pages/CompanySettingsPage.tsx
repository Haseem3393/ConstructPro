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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white">Company Profile Settings</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Update corporate address details, email coordinates, tax references, currencies, and sidebar logos.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Loading company details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6 max-w-2xl">
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-xs font-bold">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="col-span-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-650"
                  placeholder="e.g. Munaf & Sons Contractors"
                />
              </div>

              {/* Logo Upload Simulation */}
              <div className="col-span-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Company Sidebar Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-center text-zinc-650 font-black text-[10px] uppercase">
                    {logoUrl ? 'LOGO' : 'NONE'}
                  </div>
                  <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/50 font-bold text-xs uppercase tracking-wider transition-colors">
                    <Upload className="h-4 w-4 mr-2" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logoUrl && <span className="text-zinc-500 text-[10px] font-bold">File: {logoUrl}</span>}
                </div>
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Physical Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-650 leading-normal"
                  placeholder="Kandy Road, Colombo"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Contact Telephone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-650"
                  placeholder="+94 11 234 5678"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-650"
                  placeholder="info@munafandsons.com"
                />
              </div>

              {/* VAT registration */}
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">VAT Registration Number</label>
                <input
                  type="text"
                  required
                  value={vatNo}
                  onChange={(e) => setVatNo(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-650"
                  placeholder="VAT-1234567-89"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-650 cursor-pointer"
                >
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              {/* Working days */}
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Site Working Days</label>
                <select
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-650 cursor-pointer"
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
                className="inline-flex items-center justify-center px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-40"
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
