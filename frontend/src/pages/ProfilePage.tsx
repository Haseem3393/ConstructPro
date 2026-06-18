import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { User as UserIcon, Mail, Shield, Phone, Save, Loader2, Key } from 'lucide-react'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const updateProfileMutation = useUpdateProfile()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync profile details when user store is loaded
  useEffect(() => {
    if (user) {
      setName(user.name)
      const permissions = (user as any).permissions || {}
      setPhone(permissions.phone || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!name) {
      setErrorMsg('Name is required.')
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        name,
        phone,
      })
      
      // Update local storage/store auth details
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.state && parsed.state.user) {
          parsed.state.user.name = name
          parsed.state.user.permissions = {
            ...(parsed.state.user.permissions || {}),
            phone,
          }
          localStorage.setItem('auth-storage', JSON.stringify(parsed))
        }
      }
      
      setSuccessMsg('Profile updated successfully!')
      // Refresh page after a brief delay to sync store state
      setTimeout(() => {
        setSuccessMsg('')
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure your contact details and account security settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded font-bold tracking-wide">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded font-bold">
                {errorMsg}
              </div>
            )}

            {/* Profile Avatar and Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 border-b border-zinc-850 pb-5 mb-5">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-3xl">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg font-bold text-white leading-tight">{user?.name}</h3>
                <p className="text-xs text-zinc-500">{user?.email}</p>
                <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold rounded-full uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 h-4 w-4 text-zinc-550" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg pl-11 pr-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Email (Read only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Email Address (Read Only)
              </label>
              <div className="relative flex items-center opacity-60">
                <Mail className="absolute left-3.5 h-4 w-4 text-zinc-550" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-zinc-550" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +94771234567"
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg pl-11 pr-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Role (Read only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Assigned System Role (Read Only)
              </label>
              <div className="relative flex items-center opacity-60">
                <Shield className="absolute left-3.5 h-4 w-4 text-zinc-550" />
                <input
                  type="text"
                  disabled
                  value={user?.role || ''}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-2.5 text-sm text-zinc-400 focus:outline-none cursor-not-allowed uppercase"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-zinc-800 pt-5 mt-6">
              <Link
                to="/profile/change-password"
                className="w-full sm:w-auto flex justify-center items-center px-4 py-2.5 bg-zinc-800 border border-zinc-750 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Key className="h-4 w-4 mr-2" /> Change Password
              </Link>
              
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ProfilePage
