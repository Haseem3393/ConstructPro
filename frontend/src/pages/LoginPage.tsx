import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'
import {
  HardHat, Eye, EyeOff, Loader2,
  Building2, Shield, BarChart3, Users,
  ChevronRight, Zap, AlertCircle,
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
    <div className="min-h-screen flex bg-[#060b14]">

      {/* ════ LEFT PANEL ════ */}
      <div className="hidden lg:flex flex-col w-[52%] bg-[#09101e] relative overflow-hidden border-r border-[#1a2535]">
        {/* Animated orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[420px] h-[420px] rounded-full blur-[140px] pointer-events-none orb-float"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[15%] w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none orb-float"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', animationDelay: '4s' }} />

        {/* Line grid */}
        <div className="absolute inset-0 line-grid-bg pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-auto">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/30 text-white">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-[22px] text-white tracking-tight">ConstructPro</span>
              <span className="block text-[10px] text-blue-400/70 font-bold tracking-[0.18em] uppercase mt-0.5">Munaf &amp; Sons Contractors</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 w-fit mb-7">
              <Zap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] font-bold text-blue-400 tracking-wide">Construction ERP Platform</span>
            </div>

            <h1 className="text-[36px] xl:text-[42px] font-black text-white leading-[1.15] mb-5">
              Build smarter,<br />
              <span className="gradient-text-blue">manage better.</span>
            </h1>

            <p className="text-slate-500 text-[15px] leading-relaxed mb-10">
              Complete construction project management — from site attendance to financial analytics, all in one powerful platform.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/20 rounded-xl transition-all duration-200 group">
                    <div className={`p-2 ${f.bg} ${f.color} rounded-lg shrink-0`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-slate-200">{f.label}</span>
                      <span className="block text-xs text-slate-600 mt-0.5 leading-relaxed">{f.desc}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-800 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-800 font-semibold mt-10">
            © {new Date().getFullYear()} ConstructPro · Munaf &amp; Sons Contractors · Sri Lanka
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL — Form ════ */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="w-full max-w-[400px] relative fade-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-10">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight block">ConstructPro</span>
              <span className="text-[9px] text-blue-400/70 font-bold tracking-widest uppercase">Munaf &amp; Sons</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1.5 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">Email Address</label>
              <input
                id="email" name="email" type="email" placeholder="name@company.com"
                value={formData.email} onChange={handleChange}
                disabled={loginMutation.isPending} required
                className="w-full bg-white/[0.03] border border-[#1a2535] hover:border-[#253550] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.14em]">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                  disabled={loginMutation.isPending} required
                  className="w-full bg-white/[0.03] border border-[#1a2535] hover:border-[#253550] rounded-xl pl-4 pr-11 py-3 text-sm text-slate-200 placeholder-slate-800 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.05] transition-all duration-200 disabled:opacity-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="sign-in-btn" type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-sm tracking-wide transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loginMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>
              ) : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 border-t border-[#1a2535] pt-6">
            <p className="text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.16em] mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((c) => (
                <div key={c.role} className="bg-white/[0.02] border border-[#1a2535] hover:border-[#253550] p-3 rounded-xl transition-colors cursor-default">
                  <span className={`block text-[10px] font-black ${c.color} mb-1.5`}>{c.role}</span>
                  <span className="block text-[9px] text-slate-600 truncate leading-relaxed">{c.email}</span>
                  <span className="block text-[9px] text-slate-800 leading-relaxed">{c.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
