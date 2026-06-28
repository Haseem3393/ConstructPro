import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertOctagon, ArrowLeft, Home } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="max-w-md w-full bg-[#0d1322]/70 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)] relative overflow-hidden backdrop-blur-xl">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-[#7c3aed] to-[#00d2ff]"></div>
        
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-[#7c3aed]/10 rounded-full blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-[#00d2ff]/10 rounded-full blur-xl"></div>

        {/* 404 illustration icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/15">
          <AlertOctagon className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-widest">404</h1>
          <h2 className="text-lg font-black text-white">Page Not Found</h2>
          <p className="text-slate-400 text-xs font-semibold leading-normal">
            The workspace section you are trying to construct does not exist or has been relocated to another coordinate.
          </p>
        </div>

        {/* Action overrides */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white/[0.02] hover:bg-[#7c3aed]/10 border border-white/10 hover:border-[#7c3aed]/30 text-slate-350 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-purple-500/20"
          >
            <Home className="h-4 w-4 mr-2" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
