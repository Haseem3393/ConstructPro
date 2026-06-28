import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-[#14161f] border border-zinc-800 rounded-xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-violet-650/10 rounded-full blur-xl"></div>

        {/* 500 error illustration */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-widest">500</h1>
          <h2 className="text-lg font-extrabold text-zinc-200">Something Went Wrong</h2>
          <p className="text-zinc-450 text-xs leading-normal">
            ConstructPro encountered an unexpected internal database timeout or network drop. Please retry.
          </p>
        </div>

        {/* Action overrides */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-[#1b1c25] hover:bg-zinc-800 border border-zinc-850 text-zinc-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
          <a
            href="mailto:support@constructpro.lk"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-violet-600/15"
          >
            <Mail className="h-4 w-4 mr-2" /> Contact Support
          </a>
        </div>

        <div className="border-t border-zinc-850 pt-4">
          <span className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider block">
            System Incident Log Reference: ERR-POSTGRES-POOL-TIMEOUT
          </span>
        </div>
      </div>
    </div>
  )
}

export default ServerErrorPage
