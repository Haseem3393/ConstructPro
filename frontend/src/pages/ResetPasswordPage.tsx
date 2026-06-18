import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useResetPassword } from '../hooks/useUsers'
import { Building2, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] p-4 text-zinc-100">
      <div className="w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-600"></div>

        <div className="space-y-2 text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-xl">
              <Building2 className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">Create New Password</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">ConstructPro Account Recovery</p>
        </div>

        {!token ? (
          <div className="space-y-4 text-center">
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-lg font-semibold">
              No reset token found in URL parameters. Please generate a new password reset link.
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Request Reset Link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-lg flex items-center justify-center space-x-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Password changed successfully!</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg pl-4 pr-10 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-blue-600"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                required
                className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full flex justify-center items-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/10"
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
