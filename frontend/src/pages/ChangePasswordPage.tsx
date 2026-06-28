import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useChangePassword } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Key, Save, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const changePasswordMutation = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })
      setSuccessMsg('Your password has been changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/profile'), 2000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to update password. Verify current password.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto fade-up">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="p-2 bg-[#0d1526] border border-[#1a2535] rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Security Settings</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Configure and update your account password</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />

          <form onSubmit={handleSave} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl font-bold tracking-wide flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                disabled={changePasswordMutation.isPending}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                     setNewPassword(e.target.value)
                     if (errorMsg) setErrorMsg('')
                  }}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl pl-4 pr-11 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                disabled={changePasswordMutation.isPending}
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-[#1a2535] pt-5 mt-6">
              <Link
                to="/profile"
                className="px-4 py-2.5 border border-[#1a2535] text-slate-350 hover:bg-[#111d33] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ChangePasswordPage
