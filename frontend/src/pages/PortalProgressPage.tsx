import React from 'react'
import { Link } from 'react-router-dom'
import { usePortalProgress } from '../hooks/usePortal'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Calendar,
  CheckCircle,
  Clock,
  Camera,
  FileText
} from 'lucide-react'

const PortalProgressPage: React.FC = () => {
  const { data, isLoading } = usePortalProgress()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white">Site Progress Timeline</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Track structural phases milestones compliance and review verified site photographic updates.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Fetching site logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Progress Tracker Progressbar */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-end text-xs font-bold">
                <span className="text-zinc-400 uppercase tracking-wider">Overall Project Progress</span>
                <span className="text-violet-400 text-lg font-black">{data?.progress || 0}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-5 rounded-full overflow-hidden border border-zinc-850 p-1 flex">
                <div 
                  className="bg-violet-650 h-full rounded-full transition-all duration-500 flex justify-end items-center pr-2 font-black text-[9px] text-white"
                  style={{ width: `${Math.max(data?.progress || 0, 8)}%` }}
                >
                  {data?.progress > 10 ? `${data.progress}%` : ''}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Milestone timeline */}
              <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-5">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-3">
                  Structural Milestones Checklist
                </h3>
                <div className="relative border-l border-zinc-800/80 ml-3.5 pl-6 space-y-6">
                  {data?.milestones?.map((milestone: any) => (
                    <div key={milestone.id} className="relative">
                      {/* Timeline dot status icon */}
                      <span className={`absolute -left-[35px] top-0.5 p-1 rounded-full border border-[#14161f] ${
                        milestone.completed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-zinc-850 text-zinc-550 border-zinc-750'
                      }`}>
                        {milestone.completed ? <CheckCircle className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{milestone.title}</h4>
                        <span className="text-[10px] text-zinc-500 font-bold block mt-1 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> Expected Due: {formatDate(milestone.expectedDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!data?.milestones || data.milestones.length === 0) && (
                    <p className="text-xs text-zinc-550 py-4">No project milestones cataloged.</p>
                  )}
                </div>
              </div>

              {/* Site updates summary (Photos & logs) */}
              <div className="space-y-6">
                {/* Daily log summary */}
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center border-b border-zinc-850 pb-3">
                    <FileText className="h-4 w-4 mr-1 text-violet-400" /> Latest Site Updates
                  </h3>
                  <div className="space-y-4">
                    {data?.dailyLogs?.map((log: any) => (
                      <div key={log.id} className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-lg space-y-2">
                        <span className="block text-[9px] font-black text-zinc-555 uppercase tracking-wider">{formatDate(log.date)}</span>
                        <p className="text-zinc-400 text-xs leading-normal font-medium">{log.summary}</p>
                      </div>
                    ))}
                    {(!data?.dailyLogs || data.dailyLogs.length === 0) && (
                      <p className="text-xs text-zinc-550">No site updates logged yet.</p>
                    )}
                  </div>
                </div>

                {/* Site photos */}
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center border-b border-zinc-850 pb-3">
                    <Camera className="h-4 w-4 mr-1 text-violet-400" /> Public Site Photographs
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {data?.photos?.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-video bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden flex flex-col justify-center items-center group">
                        <Camera className="h-6 w-6 text-zinc-650 group-hover:text-zinc-400 transition-colors" />
                        <span className="block text-[8px] font-black text-zinc-550 uppercase tracking-wider mt-1">{photo.title}</span>
                      </div>
                    ))}
                    {(!data?.photos || data.photos.length === 0) && (
                      <p className="text-xs text-zinc-550 col-span-2">No photo updates uploaded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PortalProgressPage
