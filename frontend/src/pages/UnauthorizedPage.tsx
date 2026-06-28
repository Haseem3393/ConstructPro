import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b14] p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-[#0d1322]/70 border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.55)] relative overflow-hidden text-center backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-[#7c3aed] to-transparent"></div>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl shadow-lg shadow-rose-500/15">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">Access Denied (403)</h2>
        <p className="text-slate-400 text-xs font-semibold mb-6 leading-relaxed">
          You do not have the required permission level to access this module. Please contact your system administrator if you believe this is an error.
        </p>

        <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center items-center py-3 bg-white/[0.02] hover:bg-[#7c3aed]/10 hover:text-[#a78bfa] border border-white/10 hover:border-[#7c3aed]/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            System Admin Contact: haseem3393@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
