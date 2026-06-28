import React, { useState } from 'react'
import { useSuppliers } from '../hooks/useSuppliers'
import { usePurchaseOrders, useUpdatePOStatus } from '../hooks/useInventory'
import { useAuthStore } from '../store/authStore'
import { toast } from '../utils/toast'
import SidebarLayout from '../components/SidebarLayout'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Filter, 
  Loader2, 
  Calendar, 
  FileText, 
  Truck, 
  XSquare, 
  CheckSquare, 
  Info,
  DollarSign
} from 'lucide-react'

const PurchaseOrdersPage: React.FC = () => {
  const { user } = useAuthStore()

  // Filters state
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Queries
  const suppliersQuery = useSuppliers()
  const { data: pos, isLoading, isFetching } = usePurchaseOrders({
    supplierId: selectedSupplier || undefined,
    status: selectedStatus || undefined,
  })

  const updateStatusMutation = useUpdatePOStatus()

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-405 border border-emerald-500/22">
            Received
          </span>
        )
      case 'ORDERED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-405 border border-blue-500/22">
            Ordered
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/22">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/22">
            Draft
          </span>
        )
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const actionText = newStatus === 'RECEIVED' 
      ? 'Mark this PO as RECEIVED? This will automatically log STOCK_IN deliveries for all items and create a PROJECT EXPENSE.'
      : 'Cancel this purchase order?'

    if (!window.confirm(actionText)) return

    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status: newStatus },
      })
      toast.success(`Purchase order status updated to ${newStatus}.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update PO status')
    }
  }

  const handleUpdatePaid = async (id: string, total: number, currentPaid: number) => {
    const promptVal = window.prompt(`Enter amount paid on this PO (Total: ${formatCurrency(total)}, Currently Paid: ${formatCurrency(currentPaid)}):`, currentPaid.toString())
    if (promptVal === null) return
    const amt = parseFloat(promptVal)
    if (isNaN(amt) || amt < 0 || amt > total) {
      toast.error('Invalid payment amount.')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { paidAmount: amt },
      })
      toast.success('Payment recorded successfully.')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record payment')
    }
  }

  const isEditable = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-[#1a2535] pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Purchase Orders</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Manage vendor supply requests, material purchasing cycles, and receipts</p>
          </div>

          <Link
            to="/inventory/purchases/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> Purchase Order
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-slate-500" /> Filter Orders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 transition-all cursor-pointer"
              >
                <option value="">All Suppliers</option>
                {suppliersQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500/60 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ORDERED">Ordered</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* PO List Table */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1a2535] bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-300">Purchase Registry Ledger</h3>
            {isFetching && <Loader2 className="h-4 w-4 text-blue-505 animate-spin" />}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-blue-505 animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Loading orders ledger...</p>
            </div>
          ) : !pos || pos.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs font-semibold">
              No purchase orders registered.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-[10px] text-slate-500 font-bold tracking-wider uppercase bg-white/[0.005] border-b border-[#1a2535]">
                    <th className="py-4 px-6">PO NUMBER</th>
                    <th className="py-4 px-4">SUPPLIER</th>
                    <th className="py-4 px-4">PROJECT</th>
                    <th className="py-4 px-4">ITEMS REQUESTED</th>
                    <th className="py-4 px-4 text-right">TOTAL AMOUNT</th>
                    <th className="py-4 px-4 text-right">PAID / OUTSTANDING</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    {isEditable && <th className="py-4 px-6 text-right w-44">ACTIONS</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2535] text-xs">
                  {pos.map((po) => {
                    const outstanding = po.totalAmount - po.paidAmount
                    return (
                      <tr key={po.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          <div className="flex items-center space-x-1.5">
                            <FileText className="h-4 w-4 text-blue-405" />
                            <span>{po.poNumber}</span>
                          </div>
                          <span className="block text-[9px] text-slate-500 font-normal mt-1">{formatDate(po.createdAt)}</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {po.supplier.name}
                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Code: {po.supplier.shortName}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{po.project.name}</td>
                        <td className="py-4 px-4 font-medium text-slate-350">
                          <div className="max-w-[200px] truncate" title={po.items.map(i => `${i.material.name} x${i.quantity}`).join(', ')}>
                            {po.items.map(i => `${i.material.name} (${i.quantity} ${i.material.unit})`).join(', ')}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-white">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="block font-bold text-emerald-400">{formatCurrency(po.paidAmount)}</span>
                          <span className={`block text-[10px] font-semibold ${outstanding > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                            {outstanding > 0 ? `Out: ${formatCurrency(outstanding)}` : 'Fully Paid'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(po.status)}
                        </td>
                        {isEditable && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {po.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleUpdateStatus(po.id, 'ORDERED')}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  title="Mark as Ordered"
                                >
                                  Order
                                </button>
                              )}
                              {po.status === 'ORDERED' && (
                                <button
                                  onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                                  className="px-2 py-1 bg-emerald-650 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                                  title="Mark as Delivered"
                                >
                                  <Truck className="h-3 w-3" /> Receive
                                </button>
                              )}
                              {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleUpdateStatus(po.id, 'CANCELLED')}
                                  className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/22 rounded-lg"
                                  title="Cancel PO"
                                >
                                  <XSquare className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {po.status === 'RECEIVED' && (
                                <button
                                  onClick={() => handleUpdatePaid(po.id, po.totalAmount, po.paidAmount)}
                                  className="p-1 bg-[#0b1220] hover:bg-white/[0.04] text-emerald-450 border border-[#1a2535] rounded-lg"
                                  title="Record Payment"
                                >
                                  <DollarSign className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PurchaseOrdersPage
