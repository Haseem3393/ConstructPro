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
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Loading vendor statement...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !supplier) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-rose-500/10 border border-rose-500/25 rounded-xl space-y-4 max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-400" />
          <p className="font-extrabold text-sm uppercase tracking-wider">Vendor Details Error</p>
          <p className="text-xs text-zinc-400">Failed to load supplier profile.</p>
          <Link to="/suppliers" className="inline-flex text-xs font-bold text-violet-400 hover:text-violet-300">
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
            className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Suppliers
          </Link>
        </div>

        {/* Profile Card & Summary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Supplier Profile Details */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-black text-violet-455 uppercase tracking-widest bg-violet-600/10 px-2 py-0.5 rounded border border-violet-500/15">
                Vendor Profile
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2.5">{supplier.name}</h2>
              <span className="block text-[10px] text-zinc-500 mt-1">VAT Reg: {supplier.vatNo || 'Not Registered'}</span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-zinc-850 text-xs text-zinc-450">
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-zinc-650" />
                <span>{supplier.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-zinc-650" />
                <span className="truncate">{supplier.email || 'No email'}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-zinc-650 shrink-0" />
                <span className="truncate">{supplier.address || 'No address'}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg flex justify-between items-center text-xs">
              <span className="text-zinc-550 font-bold uppercase tracking-wider">Payment Terms</span>
              <span className="font-extrabold text-violet-400 uppercase bg-violet-600/5 px-2 py-0.5 rounded">
                {supplier.paymentTerms}
              </span>
            </div>
          </div>

          {/* Card 2: Cumulative Expenditures */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Purchases Volume</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className="text-4xl font-black text-white">
                  {formatCurrency(supplier.stats?.totalPurchased || 0)}
                </span>
              </div>
              <span className="text-zinc-550 text-[10px] mt-1.5 block">Sum of all approved Purchase Orders</span>
            </div>

            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg flex items-center space-x-2.5 text-green-400 mt-6">
              <Coins className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold">Active supplier relationship logs synced</span>
            </div>
          </div>

          {/* Card 3: Outstanding Payables */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Outstanding Payables</span>
              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className={`text-4xl font-black ${
                  (supplier.stats?.outstandingPayables || 0) > 0 ? 'text-amber-400' : 'text-zinc-500'
                }`}>
                  {formatCurrency(supplier.stats?.outstandingPayables || 0)}
                </span>
              </div>
              <span className="text-zinc-550 text-[10px] mt-1.5 block">Total LKR liabilities due to vendor</span>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg flex items-center space-x-2.5 text-zinc-400 mt-6">
              <CreditCard className="h-4 w-4 shrink-0 text-violet-400" />
              <span className="text-[11px] font-semibold">Track outstanding payables per invoice</span>
            </div>
          </div>
        </div>

        {/* supplied materials & PO history grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplied Materials List */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl lg:col-span-1">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center">
                <Archive className="h-4 w-4 mr-1.5 text-violet-400" /> Catalog items supplied
              </h3>
            </div>

            {!supplier.materials || supplier.materials.length === 0 ? (
              <div className="p-12 text-center text-zinc-550 text-xs font-semibold">
                No materials cataloged for this supplier.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 max-h-[400px] overflow-y-auto">
                {supplier.materials.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-[#1a1c27]/20 transition-colors flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{m.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">{m.category}</span>
                    </div>
                    <span className="font-black text-zinc-300">
                      {m.currentStock} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Orders history */}
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl lg:col-span-2">
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center">
                <FileText className="h-4 w-4 mr-1.5 text-violet-400" /> Purchase Orders statement
              </h3>
            </div>

            {!supplier.purchaseOrders || supplier.purchaseOrders.length === 0 ? (
              <div className="p-12 text-center text-zinc-550 text-xs font-semibold">
                No purchase transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase bg-[#181a24]/30 border-b border-zinc-800">
                      <th className="py-3 px-6">PO NUMBER</th>
                      <th className="py-3 px-4">PROJECT</th>
                      <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                      <th className="py-3 px-4 text-right">PAID</th>
                      <th className="py-3 px-4 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {supplier.purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-white">
                          {po.poNumber}
                          <span className="block text-[9px] text-zinc-500 font-normal mt-0.5">{formatDate(po.createdAt)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                            <span>{po.project.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-white">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-green-400 font-bold">
                          {formatCurrency(po.paidAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            po.status === 'RECEIVED' 
                              ? 'bg-green-500/10 text-green-400' 
                              : po.status === 'ORDERED'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : po.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-455'
                              : 'bg-zinc-500/10 text-zinc-400'
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
