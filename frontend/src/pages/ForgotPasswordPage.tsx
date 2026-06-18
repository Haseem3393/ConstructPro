import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useUsers'
import { Building2, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] p-4 text-zinc-100">
      <div className="w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-600"></div>

        <div className="space-y-2 text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-xl">
              <Building2 className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">Reset Password</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">ConstructPro Account Recovery</p>
        </div>

        {successMsg ? (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-lg flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1.5 font-semibold">
                <p>{successMsg}</p>
                {resetToken && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-3">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">MVP Testing Bypass Link:</p>
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] uppercase tracking-wider transition-all"
                    >
                      Click Here to Reset Password
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center text-xs text-zinc-450 hover:text-zinc-200 transition-colors font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="w-full flex justify-center items-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/10"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-zinc-450 hover:text-zinc-200 transition-colors font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
