import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useResetPassword } from '../hooks/useUsers'
import { ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, AlertCircle, HardHat } from 'lucide-react'

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const resetPasswordMutation = useResetPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!token) {
      setErrorMsg('Invalid or missing reset token.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
      })
      setSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to reset password. Link may be expired.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b14] p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 dot-grid-bg pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[420px] bg-[#0d1526] border border-[#1a2535] rounded-2xl p-8 shadow-2xl relative overflow-hidden fade-up z-10">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />

        {/* Logo and Header */}
        <div className="space-y-3 text-center mb-8">
          <div className="flex justify-center">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white shadow-lg shadow-blue-500/25">
              <HardHat className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Create new password</h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.14em] mt-1.5">ConstructPro Account Recovery</p>
          </div>
        </div>

        {!token ? (
          <div className="space-y-4 text-center">
            <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl text-left">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>No reset token found in URL parameters. Please generate a new password reset link.</span>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-xs text-blue-450 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors pt-2"
            >
              Request Reset Link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center justify-center space-x-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Password changed successfully!</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                  className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl pl-4 pr-11 py-3 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
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

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                required
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
