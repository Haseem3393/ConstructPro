import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] p-4 text-zinc-100">
      <div className="w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-rose-600"></div>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-wide text-white mb-2">Access Denied (403)</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          You do not have the required permission level to access this module. Please contact your system administrator if you believe this is an error.
        </p>

        <div className="border-t border-zinc-800/80 pt-6 mt-6 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex justify-center items-center py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-750"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
            System Admin Contact: haseem3393@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
