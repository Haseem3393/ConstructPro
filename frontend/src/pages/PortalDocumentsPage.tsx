import React from 'react'
import { Link } from 'react-router-dom'
import { usePortalDocuments } from '../hooks/usePortal'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Download,
  FileText,
  FileCheck,
  Calendar
} from 'lucide-react'

import { toast } from '../utils/toast'

const PortalDocumentsPage: React.FC = () => {
  const { data: documents, isLoading } = usePortalDocuments()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSimulatedDownload = (docName: string) => {
    toast.success(`Downloading shared file: ${docName}.pdf (Simulated)`)
  }


  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Shared Site Documents</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Access blueprints, floor layouts, site agreements, and contracts shared by your project engineering team.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Loading shared files index...</p>
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">Engineering Blueprints & Files</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3 px-6">DOCUMENT NAME</th>
                    <th className="py-3 px-4">DOCUMENT TYPE</th>
                    <th className="py-3 px-4">SHARED DATE</th>
                    <th className="py-3 px-6 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                  {documents?.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-3.5 px-6 font-bold text-white flex items-center space-x-2.5">
                        <FileText className="h-4.5 w-4.5 text-slate-500" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#0a0f1d]/60 text-slate-400 border border-white/10">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{formatDate(doc.createdAt)}</td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => handleSimulatedDownload(doc.name)}
                          className="inline-flex items-center px-3 py-1.5 bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 text-[#00d2ff] border border-[#7c3aed]/22 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!documents || documents.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 text-xs font-semibold bg-[#0d1322]/70">
                        No documents shared with you at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default PortalDocumentsPage
