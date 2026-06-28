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
        <div className="border-b border-[#1a2535] pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Suppliers Registry</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage vendor contacts, procurement metrics, and invoice statements</p>
          </div>

          {isEditable && (
            <Link
              to="/suppliers/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Supplier
            </Link>
          )}
        </div>

        {/* Search Panel */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Search suppliers</label>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by vendor name or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Supplier List Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-505 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Loading vendor profiles...</p>
          </div>
        ) : !suppliers || suppliers.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-semibold bg-[#0d1526] border border-[#1a2535] rounded-xl shadow-xl">
            No suppliers found in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-5 shadow-xl hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/22 flex items-center justify-center text-blue-400 font-black text-sm">
                      {supplier.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-[#0b1220] border border-[#1a2535] px-2 py-0.5 rounded">
                      Code: {supplier.shortName}
                    </span>
                  </div>

                  <h3 className="text-white font-extrabold text-base mt-3.5 group-hover:text-blue-450 transition-colors">
                    {supplier.name}
                  </h3>
                  
                  {supplier.vatNo && (
                    <span className="block text-[9px] text-slate-500 font-semibold mt-1">VAT Reg No: {supplier.vatNo}</span>
                  )}

                  {/* Contacts List */}
                  <div className="space-y-2.5 mt-4 pt-3.5 border-t border-[#1a2535] text-xs text-slate-400">
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

                <div className="pt-3 border-t border-[#1a2535] flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-blue-405 uppercase tracking-wider bg-blue-500/10 border border-blue-500/22 px-2.5 py-1 rounded">
                    Terms: {supplier.paymentTerms || 'Cash'}
                  </span>
                  
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    className="inline-flex items-center gap-1 font-bold text-slate-300 hover:text-white uppercase tracking-wider text-[10px] transition-colors"
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
