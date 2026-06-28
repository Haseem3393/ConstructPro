import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertOctagon, ArrowLeft, Home } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-[#14161f] border border-zinc-800 rounded-xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-violet-650/10 rounded-full blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>

        {/* 404 illustration icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455">
          <AlertOctagon className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-widest">404</h1>
          <h2 className="text-lg font-extrabold text-zinc-200">Page Not Found</h2>
          <p className="text-zinc-450 text-xs leading-normal">
            The workspace section you are trying to construct does not exist or has been relocated to another coordinate.
          </p>
        </div>

        {/* Action overrides */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-755 text-zinc-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-violet-600/15"
          >
            <Home className="h-4 w-4 mr-2" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
