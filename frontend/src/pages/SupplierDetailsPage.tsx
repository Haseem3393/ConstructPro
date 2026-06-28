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
          <Loader2 className="h-10 w-10 text-blue-505 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading vendor statement...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !supplier) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/22 rounded-xl space-y-4 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-400" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Vendor Details Error</p>
          <p className="text-xs text-slate-400">Failed to load supplier profile.</p>
          <Link to="/suppliers" className="inline-flex text-xs font-bold text-blue-405 hover:text-blue-300">
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
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Suppliers
          </Link>
        </div>

        {/* Profile Card & Summary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Supplier Profile Details */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-black text-blue-405 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/22">
                Vendor Profile
              </span>
              <h2 className="text-2xl font-black text-white mt-2.5 tracking-tight">{supplier.name}</h2>
              <span className="block text-[10px] text-slate-500 mt-1">VAT Reg: {supplier.vatNo || 'Not Registered'}</span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[#1a2535] text-xs text-slate-400">
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

            <div className="p-3 bg-[#0b1220] border border-[#1a2535] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Payment Terms</span>
              <span className="font-extrabold text-blue-450 uppercase bg-blue-500/10 border border-blue-500/22 px-2 py-0.5 rounded">
                {supplier.paymentTerms}
              </span>
            </div>
          </div>

          {/* Card 2: Cumulative Expenditures */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Purchases Volume</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className="text-4xl font-black text-white">
                  {formatCurrency(supplier.stats?.totalPurchased || 0)}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] mt-1.5 block">Sum of all approved Purchase Orders</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/22 rounded-xl flex items-center space-x-2.5 text-emerald-405 mt-6">
              <Coins className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold">Active supplier relationship logs synced</span>
            </div>
          </div>

          {/* Card 3: Outstanding Payables */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Outstanding Payables</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className={`text-4xl font-black ${
                  (supplier.stats?.outstandingPayables || 0) > 0 ? 'text-amber-500' : 'text-slate-500'
                }`}>
                  {formatCurrency(supplier.stats?.outstandingPayables || 0)}
                </span>
              </div>
              <span className="text-slate-500 text-[10px] mt-1.5 block">Total LKR liabilities due to vendor</span>
            </div>

            <div className="p-3 bg-[#0b1220] border border-[#1a2535] rounded-xl flex items-center space-x-2.5 text-slate-400 mt-6">
              <CreditCard className="h-4 w-4 shrink-0 text-blue-400" />
              <span className="text-[11px] font-semibold">Track outstanding payables per invoice</span>
            </div>
          </div>
        </div>

        {/* supplied materials & PO history grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplied Materials List */}
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl lg:col-span-1">
            <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center">
                <Archive className="h-4 w-4 mr-1.5 text-blue-405" /> Catalog items supplied
              </h3>
            </div>

            {!supplier.materials || supplier.materials.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                No materials cataloged for this supplier.
              </div>
            ) : (
              <div className="divide-y divide-[#1a2535] max-h-[400px] overflow-y-auto">
                {supplier.materials.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-white/[0.02] transition-colors flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{m.category}</span>
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
          <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl lg:col-span-2">
            <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center">
                <FileText className="h-4 w-4 mr-1.5 text-blue-405" /> Purchase Orders statement
              </h3>
            </div>

            {!supplier.purchaseOrders || supplier.purchaseOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                No purchase transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] text-slate-550 font-bold tracking-wider uppercase bg-white/[0.005] border-b border-[#1a2535]">
                      <th className="py-3 px-6">PO NUMBER</th>
                      <th className="py-3 px-4">PROJECT</th>
                      <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                      <th className="py-3 px-4 text-right">PAID</th>
                      <th className="py-3 px-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2535]">
                    {supplier.purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-6 font-bold text-white">
                          {po.poNumber}
                          <span className="block text-[9px] text-slate-500 font-normal mt-0.5">{formatDate(po.createdAt)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span>{po.project.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-white">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-emerald-405 font-bold">
                          {formatCurrency(po.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            po.status === 'RECEIVED' 
                              ? 'bg-emerald-500/10 text-emerald-405 border border-emerald-500/22' 
                              : po.status === 'ORDERED'
                              ? 'bg-blue-500/10 text-blue-405 border border-blue-500/22'
                              : po.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/22'
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
