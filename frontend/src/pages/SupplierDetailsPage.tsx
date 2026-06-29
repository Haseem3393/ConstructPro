import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupplierDetails } from '../hooks/useSuppliers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Coins, 
  CreditCard,
  FileText,
  Building,
  Archive
} from 'lucide-react'

const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // Queries
  const { data: supplier, isLoading, isError } = useSupplierDetails(id || '')

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading vendor statement...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !supplier) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-white/10 rounded-2xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-450 animate-bounce" />
          <p className="font-extrabold text-sm uppercase tracking-widest">Vendor Details Error</p>
          <p className="text-xs text-slate-400 font-semibold">Failed to load supplier profile.</p>
          <Link to="/suppliers" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 uppercase tracking-widest">
            Back to Suppliers
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/suppliers"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Suppliers
          </Link>
        </div>

        {/* Profile Card & Summary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Supplier Profile Details */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="text-[10px] font-black text-[#00d2ff] uppercase tracking-widest bg-[#7c3aed]/10 px-2 py-0.5 rounded border border-[#7c3aed]/22">
                Vendor Profile
              </span>
              <h2 className="text-2xl font-black text-white mt-2.5 tracking-tight">{supplier.name}</h2>
              <span className="block text-[10px] text-slate-500 font-bold mt-1">VAT Reg: {supplier.vatNo || 'Not Registered'}</span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>{supplier.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="truncate">{supplier.email || 'No email'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="truncate">{supplier.address || 'No address'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500 font-black uppercase tracking-widest">Payment Terms</span>
              <span className="font-extrabold text-[#00d2ff] uppercase bg-[#7c3aed]/10 border border-[#7c3aed]/22 px-2 py-0.5 rounded-lg">
                {supplier.paymentTerms}
              </span>
            </div>
          </div>

          {/* Card 2: Cumulative Expenditures */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Purchases Volume</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className="text-4xl font-black text-white">
                  {formatCurrency(supplier.stats?.totalPurchased || 0)}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] font-bold mt-1.5 block">Sum of all approved Purchase Orders</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/22 rounded-xl flex items-center space-x-2.5 text-emerald-400 mt-6">
              <Coins className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Active supplier relationship logs synced</span>
            </div>
          </div>

          {/* Card 3: Outstanding Payables */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding Payables</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className={`text-4xl font-black ${
                  (supplier.stats?.outstandingPayables || 0) > 0 ? 'text-amber-500' : 'text-slate-500'
                }`}>
                  {formatCurrency(supplier.stats?.outstandingPayables || 0)}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] font-bold mt-1.5 block">Total LKR liabilities due to vendor</span>
            </div>

            <div className="p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl flex items-center space-x-2.5 text-slate-400 mt-6">
              <CreditCard className="h-4 w-4 shrink-0 text-[#00d2ff]" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Track outstanding payables per invoice</span>
            </div>
          </div>
        </div>

        {/* supplied materials & PO history grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplied Materials List */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl lg:col-span-1 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-[#00d2ff] uppercase tracking-widest flex items-center">
                <Archive className="h-4 w-4 mr-1.5 text-slate-400" /> Catalog items supplied
              </h3>
            </div>

            {!supplier.materials || supplier.materials.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
                No materials cataloged for this supplier.
              </div>
            ) : (
              <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto bg-[#0d1322]/70">
                {supplier.materials.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-white/[0.015] transition-colors flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-white block">{m.name}</span>
                      <span className="text-[10px] text-[#00d2ff] font-bold tracking-widest uppercase">{m.category}</span>
                    </div>
                    <span className="font-black text-slate-350">
                      {m.currentStock} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Orders history */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl lg:col-span-2 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-[#00d2ff] uppercase tracking-widest flex items-center">
                <FileText className="h-4 w-4 mr-1.5 text-slate-400" /> Purchase Orders statement
              </h3>
            </div>

            {!supplier.purchaseOrders || supplier.purchaseOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
                No purchase transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">PO NUMBER</th>
                      <th className="py-3 px-4">PROJECT</th>
                      <th className="py-3 px-4 text-center">TOTAL AMOUNT</th>
                      <th className="py-3 px-4 text-center">PAID</th>
                      <th className="py-3 px-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {supplier.purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="py-3.5 px-6 font-extrabold text-white">
                          {po.poNumber}
                          <span className="block text-[9px] text-slate-500 font-bold mt-0.5">{formatDate(po.createdAt)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3.5 w-3.5 text-[#00d2ff] shrink-0" />
                            <span>{po.project.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-white">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-emerald-400 font-black">
                          {formatCurrency(po.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            po.status === 'RECEIVED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' 
                              : po.status === 'ORDERED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/22'
                              : po.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
                              : 'bg-zinc-500/10 text-slate-400 border border-white/10'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default SupplierDetailsPage
