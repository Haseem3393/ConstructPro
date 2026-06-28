import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useChangePassword } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Phone, 
  Save, 
  Loader2, 
  Key, 
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  Building2,
  MapPin,
  Globe,
  ArrowLeft
} from 'lucide-react'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Mutations
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  // Form States - Info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('Munaf & Sons Contractors')
  const [location, setLocation] = useState('Colombo, Sri Lanka')
  const [bio, setBio] = useState('Passionate about construction management and high-quality modern engineering.')
  const [birthday, setBirthday] = useState('1993-10-26')
  const [website, setWebsite] = useState('constructpro.lk')
  
  const [infoSuccess, setInfoSuccess] = useState('')
  const [infoError, setInfoError] = useState('')

  // Form States - Change Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  // Tab State
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')

  // Sync profile details when user store is loaded
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('auth-storage')
      let savedPermissions: any = {}
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          savedPermissions = parsed?.state?.user?.permissions || {}
        } catch (e) {}
      }

      const nameParts = user.name.split(' ')
      setFirstName(nameParts[0] || '')
      setLastName(nameParts.slice(1).join(' ') || '')
      setUsername(savedPermissions.username || user.email.split('@')[0])
      setPhone(savedPermissions.phone || '')
      setCompany(savedPermissions.company || 'Munaf & Sons Contractors')
      setLocation(savedPermissions.location || 'Colombo, Sri Lanka')
      setBio(savedPermissions.bio || 'Passionate about construction management and high-quality modern engineering.')
      setBirthday(savedPermissions.birthday || '1993-10-26')
      setWebsite(savedPermissions.website || 'constructpro.lk')
    }
  }, [user])

  // Save profile info handler
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoSuccess('')
    setInfoError('')

    const fullName = `${firstName} ${lastName}`.trim()
    if (!fullName) {
      setInfoError('Name is required.')
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: fullName,
        phone: phone.trim(),
      })
      
      // Update local storage/store auth details
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.state && parsed.state.user) {
          parsed.state.user.name = fullName
          parsed.state.user.permissions = {
            ...(parsed.state.user.permissions || {}),
            phone: phone.trim(),
            company: company.trim(),
            location: location.trim(),
            bio: bio.trim(),
            birthday,
            website: website.trim(),
            username: username.trim(),
          }
          localStorage.setItem('auth-storage', JSON.stringify(parsed))
        }
      }
      
      setInfoSuccess('Profile updated successfully!')
      setTimeout(() => {
        setInfoSuccess('')
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setInfoError(err.response?.data?.error || 'Failed to update profile.')
    }
  }

  // Save password handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwSuccess('')
    setPwError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all fields.')
      return
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })
      setPwSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(''), 4000)
    } catch (err: any) {
      setPwError(err.response?.data?.error || 'Failed to change password. Verify your current password.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Manage your personal information, profile particulars, and security credentials
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d1322]/70 border border-white/10 hover:border-white/20 hover:text-[#a78bfa] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* ════ MAIN FLOATING GLASSMORPHIC CARD CONTAINER ════ */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl relative overflow-hidden">
          {/* Top gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ════ LEFT COLUMN: User Profile & Particulars ════ */}
            <div className="col-span-1 flex flex-col items-center text-center space-y-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
              {/* Profile Avatar with Glowing Ring */}
              <div className="relative group shrink-0 mt-2">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#00d2ff] p-1 shadow-[0_0_25px_rgba(124,58,237,0.25)] ring-4 ring-white/10 flex items-center justify-center relative">
                  {/* Small Profile Avatar Overlap */}
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-[#060b14] p-0.5 border border-white/10 z-10">
                    <div className="w-full h-full rounded-full bg-[#7c3aed] flex items-center justify-center text-[10px] font-black text-white">
                      {user?.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="w-full h-full rounded-full bg-[#0a0f1d] flex items-center justify-center font-black text-white text-4xl tracking-wider shadow-inner select-none">
                    {user?.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                {/* Active badge */}
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>

              {/* Name & Role */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
              </div>

              {/* Email Address details */}
              <div className="w-full space-y-1.5 text-left">
                <span className="block text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Email Address Details</span>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-semibold truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Personal Particulars */}
              <div className="w-full space-y-2 text-left">
                <span className="block text-[9.5px] font-black text-slate-500 uppercase tracking-wider">Personal Particulars</span>
                <div className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 space-y-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-1.5 bg-white/[0.03] rounded-lg text-slate-400 mt-0.5">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Full Name</span>
                      <span className="text-xs text-slate-200 font-bold">{user?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3.5">
                    <div className="p-1.5 bg-white/[0.03] rounded-lg text-slate-400 mt-0.5">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company</span>
                      <span className="text-xs text-slate-200 font-medium">{company}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3.5">
                    <div className="p-1.5 bg-white/[0.03] rounded-lg text-slate-400 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Location</span>
                      <span className="text-xs text-slate-200 font-medium">{location}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3.5">
                    <div className="p-1.5 bg-white/[0.03] rounded-lg text-slate-400 mt-0.5">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Phone</span>
                      <span className="text-xs text-slate-200 font-medium">{phone || 'Not Logged'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ════ RIGHT COLUMN: Tab Content Form ════ */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Pill Tab selector */}
              <div className="flex bg-[#0a0f1d]/40 border border-white/10 rounded-2xl p-1.5 gap-2 w-fit select-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'info'
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Security & Password
                </button>
              </div>

              {/* 1. Update Info Tab */}
              {activeTab === 'info' && (
                <form onSubmit={handleSaveInfo} className="space-y-5">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-lg font-black text-white tracking-tight">Update Profile</h3>
                  </div>

                  {infoSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-bold tracking-wide flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>{infoSuccess}</span>
                    </div>
                  )}
                  {infoError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-bold flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>{infoError}</span>
                    </div>
                  )}

                  {/* First Name & Last Name (Side by Side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Last Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                      />
                      <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Bio textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold resize-none"
                    />
                  </div>

                  {/* Birthday & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Birthday
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Website
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <Globe className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Company & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Company
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                        />
                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 pt-5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* 2. Security / Change Password Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleSavePassword} className="space-y-5">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-lg font-black text-white tracking-tight">Security & Password</h3>
                  </div>

                  {pwSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-bold tracking-wide flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}
                  {pwError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-bold flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                      />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-semibold"
                      />
                      <Key className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 pt-5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ProfilePage
