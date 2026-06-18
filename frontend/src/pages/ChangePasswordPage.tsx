import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useChangePassword } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Key, Save, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

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
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Security Settings</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure and update your account password</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded font-bold tracking-wide flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded font-bold">
                {errorMsg}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg pl-4 pr-10 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-zinc-800 pt-5 mt-6">
              <Link
                to="/profile"
                className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
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
