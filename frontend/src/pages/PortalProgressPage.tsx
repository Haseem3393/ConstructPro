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
        <div className="border-b border-white/10 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Site Progress Timeline</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Track structural phases milestones compliance and review verified site photographic updates.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Fetching site logs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Progress Tracker Progressbar */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="flex justify-between items-end text-xs font-bold mb-3">
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">Overall Project Progress</span>
                <span className="text-[#00d2ff] text-lg font-black">{data?.progress || 0}%</span>
              </div>
              <div className="w-full bg-[#0a0f1d]/60 h-5 rounded-full overflow-hidden border border-white/10 p-1 flex">
                <div 
                  className="bg-[#7c3aed] h-full rounded-full transition-all duration-500 flex justify-end items-center pr-2 font-black text-[9px] text-white"
                  style={{ width: `${Math.max(data?.progress || 0, 8)}%` }}
                >
                  {data?.progress > 10 ? `${data.progress}%` : ''}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Milestone timeline */}
              <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-3">
                  Structural Milestones Checklist
                </h3>
                <div className="relative border-l border-white/10 ml-3.5 pl-6 space-y-6 mt-4">
                  {data?.milestones?.map((milestone: any) => (
                    <div key={milestone.id} className="relative">
                      {/* Timeline dot status icon */}
                      <span className={`absolute -left-[35px] top-0.5 p-1 rounded-full border border-[#0d1322] ${
                        milestone.completed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' 
                          : 'bg-[#0a0f1d]/60 text-slate-500 border border-white/10'
                      }`}>
                        {milestone.completed ? <CheckCircle className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{milestone.title}</h4>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> Expected Due: {formatDate(milestone.expectedDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!data?.milestones || data.milestones.length === 0) && (
                    <p className="text-xs text-slate-500 py-4 font-bold uppercase tracking-widest">No project milestones cataloged.</p>
                  )}
                </div>
              </div>

              {/* Site updates summary (Photos & logs) */}
              <div className="space-y-6">
                {/* Daily log summary */}
                <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center border-b border-white/10 pb-3">
                    <FileText className="h-4 w-4 mr-1 text-[#00d2ff]" /> Latest Site Updates
                  </h3>
                  <div className="space-y-4 mt-4">
                    {data?.dailyLogs?.map((log: any) => (
                      <div key={log.id} className="bg-[#0a0f1d]/60 border border-white/10 p-4 rounded-xl space-y-2">
                        <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">{formatDate(log.date)}</span>
                        <p className="text-slate-400 text-xs leading-normal font-semibold">{log.summary}</p>
                      </div>
                    ))}
                    {(!data?.dailyLogs || data.dailyLogs.length === 0) && (
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No site updates logged yet.</p>
                    )}
                  </div>
                </div>

                {/* Site photos */}
                <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center border-b border-white/10 pb-3">
                    <Camera className="h-4 w-4 mr-1 text-[#00d2ff]" /> Public Site Photographs
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {data?.photos?.map((photo: any) => (
                      <div key={photo.id} className="relative aspect-video bg-[#0a0f1d]/60 border border-white/10 rounded-xl overflow-hidden flex flex-col justify-center items-center group">
                        <Camera className="h-6 w-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">{photo.title}</span>
                      </div>
                    ))}
                    {(!data?.photos || data.photos.length === 0) && (
                      <p className="text-xs text-slate-500 col-span-2 font-bold uppercase tracking-widest">No photo updates uploaded.</p>
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
