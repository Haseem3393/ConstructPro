import React, { useState } from 'react'
import { useSuppliers } from '../hooks/useSuppliers'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  ArrowRight
} from 'lucide-react'

const SuppliersListPage: React.FC = () => {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Queries
  const { data: suppliers, isLoading, isFetching } = useSuppliers({
    search: searchQuery || undefined,
  })

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Suppliers Registry</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage vendor contacts, procurement metrics, and invoice statements</p>
          </div>

          {isEditable && (
            <Link
              to="/suppliers/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl transition-all duration-200 font-black text-xs uppercase tracking-widest shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Supplier
            </Link>
          )}
        </div>

        {/* Search Panel */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search suppliers</label>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by vendor name or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Supplier List Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading vendor profiles...</p>
          </div>
        ) : !suppliers || suppliers.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            No suppliers found in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group backdrop-blur-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/22 flex items-center justify-center text-[#00d2ff] font-black text-sm">
                      {supplier.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-[#0a0f1d]/60 border border-white/10 px-2 py-0.5 rounded">
                      Code: {supplier.shortName}
                    </span>
                  </div>

                  <h3 className="text-white font-extrabold text-base mt-3.5 group-hover:text-[#00d2ff] transition-colors">
                    {supplier.name}
                  </h3>
                  
                  {supplier.vatNo && (
                    <span className="block text-[9px] text-slate-500 font-bold mt-1">VAT Reg No: {supplier.vatNo}</span>
                  )}

                  {/* Contacts List */}
                  <div className="space-y-2.5 mt-4 pt-3.5 border-t border-white/10 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>{supplier.phone || 'No phone registered'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate">{supplier.email || 'No email registered'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{supplier.address || 'No address registered'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-[9px] font-black text-[#00d2ff] uppercase tracking-widest bg-[#7c3aed]/10 border border-[#7c3aed]/22 px-2.5 py-1 rounded-xl">
                    Terms: {supplier.paymentTerms || 'Cash'}
                  </span>
                  
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-white uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
                  >
                    Statement
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default SuppliersListPage
