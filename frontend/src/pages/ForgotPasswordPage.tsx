import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useUsers'
import { Building2, ArrowLeft, Loader2, CheckCircle, AlertCircle, HardHat } from 'lucide-react'

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
            <h2 className="text-xl font-black text-white tracking-tight">Reset password</h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.14em] mt-1.5">ConstructPro Account Recovery</p>
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
              className="flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
            </Link>
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
              <label htmlFor="email" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">
                Account Email Address
              </label>
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
                className="w-full bg-[#0b1220] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
