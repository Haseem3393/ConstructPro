import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-zinc-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#00d2ff]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#0d1322]/70 border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-[#00d2ff]/10 rounded-full blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-[#7c3aed]/10 rounded-full blur-xl"></div>

        {/* 500 error illustration */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/22 flex items-center justify-center text-amber-500">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">500</h1>
          <h2 className="text-lg font-extrabold text-slate-200">Something Went Wrong</h2>
          <p className="text-slate-400 text-xs font-semibold leading-normal">
            ConstructPro encountered an unexpected internal database timeout or network drop. Please retry.
          </p>
        </div>

        {/* Action overrides */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] border border-white/10 text-slate-350 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
          <a
            href="mailto:support@constructpro.lk"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:opacity-90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-violet-500/10"
          >
            <Mail className="h-4 w-4 mr-2" /> Contact Support
          </a>
        </div>

        <div className="border-t border-white/10 pt-4">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">
            System Incident Log Reference: ERR-POSTGRES-POOL-TIMEOUT
          </span>
        </div>
      </div>
    </div>
  )
}

export default ServerErrorPage
