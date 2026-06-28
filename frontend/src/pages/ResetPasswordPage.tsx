import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useResetPassword } from '../hooks/useUsers'
import { ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, AlertCircle, HardHat, Lock } from 'lucide-react'

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
    <div 
      className="min-h-screen flex bg-[#060b14] font-sans relative overflow-hidden"
      style={{ 
        backgroundImage: "url('/login_ui.png')", 
        backgroundSize: '100% 100%', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* ════ LEFT PANEL (Image Blueprint Overlay) ════ */}
      <div className="hidden lg:flex flex-col w-[50%] border-r border-[#1a2535]/30 relative p-14 justify-between bg-black/10">
        {/* Logo and title */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-[#7c3aed] to-[#00d2ff] rounded-2xl shadow-[0_4px_20px_rgba(124,58,237,0.35)] text-white">
            <HardHat className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-black text-2xl text-white tracking-tight leading-none">ConstructPro</h2>
            <span className="block text-[9px] text-[#a78bfa] font-black tracking-[0.25em] uppercase mt-1">Build. Manage. Deliver. With precision.</span>
          </div>
        </div>

        {/* Bottom copyright overlay */}
        <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Munaf &amp; Sons Contractors</span>
          <span>© {new Date().getFullYear()} ConstructPro</span>
        </div>
      </div>

      {/* ════ RIGHT PANEL (Form and blurred bg overlay) ════ */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-black/35 backdrop-blur-[2px]">
        {/* Dark overlay to enhance text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] pointer-events-none" />

        {/* Glassmorphic Card Container */}
        <div className="w-full max-w-[430px] backdrop-blur-xl bg-[#0d1322]/70 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.55)] rounded-3xl p-8 md:p-10 relative overflow-hidden transition-all duration-300 z-10">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed]/50 to-transparent" />

          {/* Logo on mobile view */}
          <div className="flex lg:hidden items-center gap-3.5 mb-8 justify-center">
            <div className="p-2.5 bg-gradient-to-br from-[#7c3aed] to-[#00d2ff] rounded-xl text-white shadow-lg shadow-purple-500/20">
              <HardHat className="h-5.5 w-5.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight">ConstructPro</span>
              <span className="block text-[8px] text-[#a78bfa] font-bold tracking-widest uppercase mt-0.5">Munaf &amp; Sons</span>
            </div>
          </div>

          {!token ? (
            <div className="space-y-4 text-center">
              <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs p-3.5 rounded-xl text-left">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">No reset token found in URL parameters. Please generate a new password reset link.</span>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-xs text-[#a78bfa] hover:text-[#c4b5fd] font-black uppercase tracking-wider transition-colors pt-2"
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
                className="w-full py-3.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_35px_rgba(124,58,237,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-[28px] font-black text-white tracking-tight">New Password</h1>
                <p className="text-slate-405 text-xs font-semibold mt-1.5 leading-normal">
                  Create a new password for your account
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs p-3.5 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={resetPasswordMutation.isPending}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-11 py-3.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={resetPasswordMutation.isPending}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-11 py-3.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full py-3.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_35px_rgba(124,58,237,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
