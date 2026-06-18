import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { isAuthenticated, user } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/dashboard')
          break
        case 'PROJECT_MANAGER':
          navigate('/projects')
          break
        case 'SUPERVISOR':
          navigate('/attendance')
          break
        case 'CLIENT':
          navigate('/portal')
          break
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      const res = await loginMutation.mutateAsync(formData)
      navigate(res.redirect)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] p-4 text-zinc-100">
      <div className="w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top blue bar */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-600"></div>

        <div className="space-y-2 text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-xl">
              <Building2 className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">ConstructPro</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Munaf & Sons Contractors</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loginMutation.isPending}
              required
              className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loginMutation.isPending}
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

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex justify-center items-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/10 mt-6"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="mt-8 border-t border-zinc-800/60 pt-4 text-center">
            <span className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-2">Demo Credentials</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-semibold max-w-xs mx-auto text-left">
              <div className="bg-[#1b1c25] border border-zinc-800/50 p-2 rounded">
                <span className="block text-blue-400 font-bold">Admin</span>
                <span>haseem3393@gmail.com</span>
                <span className="block text-zinc-500">Haseem@2004</span>
              </div>
              <div className="bg-[#1b1c25] border border-zinc-800/50 p-2 rounded">
                <span className="block text-blue-400 font-bold">Manager</span>
                <span>manager@munafcons.lk</span>
                <span className="block text-zinc-500">Manager@1234</span>
              </div>
              <div className="bg-[#1b1c25] border border-zinc-800/50 p-2 rounded">
                <span className="block text-blue-400 font-bold">Supervisor</span>
                <span>supervisor@munafcons.lk</span>
                <span className="block text-zinc-500">Super@1234</span>
              </div>
              <div className="bg-[#1b1c25] border border-zinc-800/50 p-2 rounded">
                <span className="block text-blue-400 font-bold">Client</span>
                <span>client@munafcons.lk</span>
                <span className="block text-zinc-500">Client@1234</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
