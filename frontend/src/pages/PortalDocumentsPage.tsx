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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/portal" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portal
          </Link>
          <h1 className="text-3xl font-black text-white">Shared Site Documents</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Access blueprints, floor layouts, site agreements, and contracts shared by your project engineering team.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Loading shared files index...</p>
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30">
              <h3 className="font-extrabold text-sm text-zinc-350">Engineering Blueprints & Files</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3 px-6">DOCUMENT NAME</th>
                    <th className="py-3 px-4">DOCUMENT TYPE</th>
                    <th className="py-3 px-4">SHARED DATE</th>
                    <th className="py-3 px-6 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {documents?.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-white flex items-center space-x-2.5">
                        <FileText className="h-4.5 w-4.5 text-zinc-500" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-755">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-semibold">{formatDate(doc.createdAt)}</td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => handleSimulatedDownload(doc.name)}
                          className="inline-flex items-center px-3 py-1 bg-violet-650/10 hover:bg-violet-650/20 text-violet-400 hover:text-violet-350 border border-violet-500/15 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!documents || documents.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-550 text-xs font-semibold">
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
