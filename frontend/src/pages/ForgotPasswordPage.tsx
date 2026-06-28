import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useUsers'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, HardHat, User } from 'lucide-react'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [resetToken, setResetToken] = useState('') // MVP display helper

  const forgotPasswordMutation = useForgotPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    setResetToken('')

    if (!email) {
      setErrorMsg('Please enter your email address.')
      return
    }

    try {
      const res = await forgotPasswordMutation.mutateAsync(email)
      setSuccessMsg(res.message)
      if (res.token) {
        setResetToken(res.token) // Display reset token immediately in MVP
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Email address not found.')
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

          {successMsg ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-2 font-semibold">
                  <p className="leading-relaxed">{successMsg}</p>
                  {resetToken && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/15 space-y-3">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">MVP Testing Bypass Link:</p>
                      <Link
                        to={`/reset-password?token=${resetToken}`}
                        className="block text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25"
                      >
                        Click Here to Reset Password
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-[28px] font-black text-white tracking-tight">Reset Password</h1>
                <p className="text-slate-405 text-xs font-semibold mt-1.5 leading-normal">
                  Enter your email to receive a recovery link
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs p-3.5 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                  Account Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errorMsg) setErrorMsg('')
                    }}
                    disabled={forgotPasswordMutation.isPending}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full py-3.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_35px_rgba(124,58,237,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
