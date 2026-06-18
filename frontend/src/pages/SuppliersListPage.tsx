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
        <div className="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Suppliers Registry</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage vendor contacts, procurement metrics, and invoice statements</p>
          </div>

          {isEditable && (
            <Link
              to="/suppliers/new"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/10 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Supplier
            </Link>
          )}
        </div>

        {/* Search Panel */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Search suppliers</label>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
              <input
                type="text"
                placeholder="Search by vendor name or short code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1d26] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-350 focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Supplier List Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Loading vendor profiles...</p>
          </div>
        ) : !suppliers || suppliers.length === 0 ? (
          <div className="p-16 text-center text-zinc-550 text-xs font-semibold bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            No suppliers found in registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 shadow-xl hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-black text-sm">
                      {supplier.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                      Code: {supplier.shortName}
                    </span>
                  </div>

                  <h3 className="text-white font-extrabold text-base mt-3.5 group-hover:text-violet-400 transition-colors">
                    {supplier.name}
                  </h3>
                  
                  {supplier.vatNo && (
                    <span className="block text-[9px] text-zinc-500 font-semibold mt-1">VAT Reg No: {supplier.vatNo}</span>
                  )}

                  {/* Contacts List */}
                  <div className="space-y-2.5 mt-4 pt-3.5 border-t border-zinc-850 text-xs text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-650" />
                      <span>{supplier.phone || 'No phone registered'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-650" />
                      <span className="truncate">{supplier.email || 'No email registered'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
                      <span className="truncate">{supplier.address || 'No address registered'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider bg-violet-600/5 px-2.5 py-1 rounded">
                    Terms: {supplier.paymentTerms || 'Cash'}
                  </span>
                  
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    className="inline-flex items-center gap-1 font-bold text-zinc-350 hover:text-white uppercase tracking-wider text-[10px] transition-colors"
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
