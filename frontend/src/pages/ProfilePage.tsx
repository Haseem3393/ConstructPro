import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  UserCheck,
  Calendar
} from 'lucide-react'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Mutations
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  // Form States - Update Info
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
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
      setName(user.name)
      const permissions = (user as any).permissions || {}
      setPhone(permissions.phone || '')
    }
  }, [user])

  // Save profile info handler
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoSuccess('')
    setInfoError('')

    if (!name.trim()) {
      setInfoError('Name is required.')
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      })
      
      // Update local storage/store auth details
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.state && parsed.state.user) {
          parsed.state.user.name = name.trim()
          parsed.state.user.permissions = {
            ...(parsed.state.user.permissions || {}),
            phone: phone.trim(),
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
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Profile Header (No banner) */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-zinc-800/80 pb-8 pt-4">
          {/* Avatar Circle */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 p-1 shadow-2xl ring-4 ring-zinc-800/80 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#14161f] flex items-center justify-center font-black text-white text-4xl tracking-wider shadow-inner">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            </div>
            {/* Status dot */}
            <span className="absolute bottom-1 right-1 w-6 h-6 bg-[#0d0e12] rounded-full p-1 flex items-center justify-center ring-2 ring-[#14161f]">
              <span className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
            </span>
          </div>

          {/* Details */}
          <div className="text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex flex-col md:flex-row items-center gap-3">
                {user?.name}
                <div className="flex gap-2 mt-2 md:mt-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Account
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-6 text-zinc-400 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-550" />
                {user?.email}
              </span>
              <span className="hidden sm:inline text-zinc-700">•</span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-550" />
                <span>Access Level: <strong className="text-zinc-200">{user?.role}</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Inner Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left Column: About user particulars */}
          <div className="space-y-6">
            <div className="bg-[#14161f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              <div className="border-b border-zinc-800/80 pb-4 mb-4">
                <h3 className="text-xs font-extrabold text-zinc-450 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-violet-400" />
                  Personal Particulars
                </h3>
              </div>

              <div className="space-y-5 text-sm">
                <div className="flex items-start space-x-4 p-2.5 rounded-lg hover:bg-zinc-800/20 transition-colors">
                  <UserIcon className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Full Name</span>
                    <span className="text-zinc-200 font-bold">{user?.name}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-2.5 rounded-lg hover:bg-zinc-800/20 transition-colors">
                  <Mail className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="overflow-hidden font-medium">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</span>
                    <span className="text-zinc-200 break-all">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-2.5 rounded-lg hover:bg-zinc-800/20 transition-colors">
                  <Phone className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contact Phone</span>
                    <span className="text-zinc-200 font-medium">{phone || <span className="text-zinc-500 italic">Not Logged</span>}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-2.5 rounded-lg hover:bg-zinc-800/20 transition-colors">
                  <Shield className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Security Access Level</span>
                    <span className="inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20 mt-1">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Tabs card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#14161f] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl relative">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
              {/* Tab headers */}
              <div className="flex bg-[#181a24]/40 border-b border-zinc-800/80 p-2 gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'info'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Update Profile Info</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Security & Password</span>
                </button>
              </div>

              {/* Tab Body */}
              <div className="p-6 md:p-8">
                {/* 1. Update Info Tab */}
                {activeTab === 'info' && (
                  <form onSubmit={handleSaveInfo} className="space-y-5">
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

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#1c1e27] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        Email Address (Read Only)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-650" />
                        <input
                          type="email"
                          disabled
                          value={user?.email || ''}
                          className="w-full bg-[#14161f]/60 border border-zinc-850 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +94771234567"
                          className="w-full bg-[#1c1e27] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-zinc-800/60">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center justify-center px-6 py-3 bg-violet-650 hover:bg-violet-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg hover:shadow-violet-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#1c1e27] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        New Password *
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#1c1e27] border border-zinc-800/80 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-widest">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#1c1e27] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-zinc-800/60">
                      <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="flex items-center justify-center px-6 py-3 bg-violet-650 hover:bg-violet-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg hover:shadow-violet-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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
      </div>
    </SidebarLayout>
  )
}

export default ProfilePage
