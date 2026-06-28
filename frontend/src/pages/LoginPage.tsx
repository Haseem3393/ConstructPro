import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import {
  HardHat, Eye, EyeOff, Loader2,
  Building2, Shield, BarChart3, Users,
  ChevronRight, Zap, AlertCircle,
  User, Lock
} from 'lucide-react'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { isAuthenticated, user } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':          navigate('/dashboard'); break
        case 'PROJECT_MANAGER': navigate('/projects');  break
        case 'SUPERVISOR':     navigate('/attendance'); break
        case 'CLIENT':         navigate('/portal');     break
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.email || !formData.password) { setError('Please fill in all fields.'); return }
    try {
      const res = await loginMutation.mutateAsync(formData)
      navigate(res.redirect)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.')
    }
  }

  const features = [
    { icon: Building2, label: 'Project Management',  desc: 'Track all construction sites with real-time progress updates',          color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { icon: BarChart3, label: 'Financial Analytics',  desc: 'Budget tracking, expense monitoring and payable management',           color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
    { icon: Users,     label: 'Workforce Hub',         desc: 'Attendance logs, weekly timesheets and payroll processing',            color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Shield,    label: 'Role-Based Access',     desc: 'Multi-tier permissions for Admins, Managers and Supervisors',         color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  ]

  const demoCredentials = [
    { role: 'Admin',      email: 'haseem3393@gmail.com',        pass: 'Haseem@2004',   color: 'text-blue-400' },
    { role: 'Manager',    email: 'manager@munafcons.lk',        pass: 'Manager@1234',  color: 'text-cyan-400' },
    { role: 'Supervisor', email: 'supervisor@munafcons.lk',     pass: 'Super@1234',    color: 'text-emerald-400' },
    { role: 'Client',     email: 'client@munafcons.lk',         pass: 'Client@1234',   color: 'text-violet-400' },
  ]

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

          {/* Heading */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-[28px] font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-405 text-xs font-semibold mt-1.5 leading-normal">
              Log in to your ConstructPro account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs p-3.5 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="david.chen@constructpro.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-4 py-3.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-[#a78bfa] hover:text-[#c4b5fd] font-extrabold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-11 pr-11 py-3.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-slate-400 text-xs font-semibold select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-white/10 bg-white/[0.02] text-[#7c3aed] focus:ring-0 focus:ring-offset-0 h-4 w-4 transition-colors"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Sign-in Button */}
            <button
              id="sign-in-btn"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_35px_rgba(124,58,237,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Profiles Dropdown / Selector (Perfect UX) */}
          <div className="mt-8 border-t border-white/[0.06] pt-6 relative z-20">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mb-3">
              Demo Access Profiles
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoCredentials.map((c) => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => setFormData({ email: c.email, password: c.pass })}
                  className="px-3 py-1.5 bg-white/[0.02] hover:bg-[#7c3aed]/10 border border-white/[0.06] hover:border-[#7c3aed]/30 rounded-lg text-[9.5px] font-extrabold text-slate-400 hover:text-[#a78bfa] transition-all cursor-pointer"
                >
                  {c.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
