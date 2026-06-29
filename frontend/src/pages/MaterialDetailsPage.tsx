import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMaterialDetails } from '../hooks/useMaterials'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Inbox, 
  Loader2, 
  AlertTriangle,
  ClipboardList,
  Building,
  User,
  Tag
} from 'lucide-react'

const MaterialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: material, isLoading, isError } = useMaterialDetails(id || '')

  const formatCurrency = (val: number) => {
    return `Rs.${val.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Filter Transactions into In / Out
  const stockInTxns = useMemo(() => {
    if (!material?.transactions) return []
    return material.transactions.filter(
      (t: any) => t.type === 'STOCK_IN' || t.type === 'OPENING_STOCK' || t.type === 'TRANSFER_IN'
    )
  }, [material])

  const stockOutTxns = useMemo(() => {
    if (!material?.transactions) return []
    return material.transactions.filter(
      (t: any) => t.type === 'STOCK_OUT' || t.type === 'TRANSFER_OUT'
    )
  }, [material])

  // Compile coordinates for stock levels line chart over time
  const chartPoints = useMemo(() => {
    if (!material?.transactions || material.transactions.length === 0) return []

    // Sort chronologically (oldest to newest)
    const sortedTxns = [...material.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let runningStock = 0
    const historyPoints = sortedTxns.map((t: any) => {
      if (t.type === 'STOCK_IN' || t.type === 'OPENING_STOCK' || t.type === 'TRANSFER_IN') {
        runningStock += t.quantity
      } else {
        runningStock -= t.quantity
      }
      return {
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        stock: runningStock
      }
    })

    // Add starting point
    return [{ date: 'Start', stock: 0 }, ...historyPoints]
  }, [material])

  // SVG Coordinates calculations
  const svgPath = useMemo(() => {
    if (chartPoints.length < 2) return ''
    const width = 500
    const height = 150
    const padding = 15

    const maxStock = Math.max(...chartPoints.map((p) => p.stock), 10)

    const points = chartPoints.map((p, index) => {
      const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2)
      const y = height - padding - (p.stock / maxStock) * (height - padding * 2)
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [chartPoints])

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-3">
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Loading material details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (isError || !material) {
    return (
      <SidebarLayout>
        <div className="p-8 text-center text-rose-455 bg-[#0d1322]/70 border border-rose-500/22 rounded-2xl space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <AlertTriangle className="h-12 w-12 mx-auto text-rose-450 animate-bounce" />
          <p className="font-extrabold text-sm uppercase tracking-widest">Material Registry Error</p>
          <p className="text-xs text-slate-400 font-semibold">The requested material details could not be retrieved.</p>
          <Link to="/materials" className="inline-flex text-xs font-bold text-[#00d2ff] hover:text-[#00d2ff]/80 cursor-pointer">
            Back to Registry
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const isLowStock = material.currentStock <= material.minimumLevel
  const maxStockVal = Math.max(...chartPoints.map((p) => p.stock), 10)

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/materials"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Materials
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={`/materials/${material.id}/stock?mode=in`}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/22 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="h-4 w-4 mr-1.5" />
              Stock In
            </Link>
            <Link
              to={`/materials/${material.id}/stock?mode=out`}
              className="inline-flex items-center px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/22 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Stock Out
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Material Info Card */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-[#00d2ff] uppercase tracking-widest bg-[#7c3aed]/10 px-2 py-0.5 rounded border border-[#7c3aed]/22">
                  {material.category || 'Other'}
                </span>
                <h2 className="text-2xl font-black text-white mt-2.5 tracking-tight">{material.name}</h2>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-white/10">
              <div className="flex items-center text-xs text-slate-400 space-x-2.5">
                <Building className="h-4 w-4 text-slate-500 shrink-0" />
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Assigned Project</span>
                  <span className="text-slate-200 font-semibold">{material.project?.name}</span>
                </div>
              </div>

              <div className="flex items-center text-xs text-slate-400 space-x-2.5">
                <Tag className="h-4 w-4 text-slate-500 shrink-0" />
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Item Type & Unit</span>
                  <span className="text-slate-200 font-semibold capitalize">
                    {material.itemType || 'Consumables'} • {material.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-xs text-slate-400 space-x-2.5">
                <User className="h-4 w-4 text-slate-500 shrink-0" />
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Primary Vendor</span>
                  <span className="text-slate-200 font-semibold">{material.supplierRef?.name || 'No assigned vendor'}</span>
                </div>
              </div>
            </div>

            {isLowStock && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/22 rounded-xl flex items-center space-x-2.5 text-rose-455">
                <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
                <span className="text-xs font-bold">Stock level is below threshold ({material.minimumLevel} {material.unit})</span>
              </div>
            )}
          </div>          
          {/* Current Stock Large Display */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Inventory Balance</span>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className={`text-6xl font-black tracking-tight ${isLowStock ? 'text-rose-455' : 'text-emerald-400'}`}>
                  {material.currentStock}
                </span>
                <span className="text-slate-400 text-sm font-semibold uppercase">{material.unit}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Received</span>
                <span className="text-white text-base font-extrabold">{material.stockIn}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Consumed</span>
                <span className="text-white text-base font-extrabold">{material.stockOut}</span>
              </div>
            </div>
          </div>

          {/* Stock Level Line Chart */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Movement Level</span>
            </div>

            {chartPoints.length < 2 ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-bold">
                Not enough transactions to plot line chart.
              </div>
            ) : (
              <div className="mt-4">
                <svg viewBox="0 0 500 150" className="w-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="15" y1="15" x2="485" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="15" y1="135" x2="485" y2="135" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  
                  {/* SVG Line Graph */}
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#00d2ff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_4px_12px_rgba(0,210,255,0.25)]"
                  />

                  {/* Chart Dots */}
                  {chartPoints.map((p, index) => {
                    const width = 500
                    const height = 150
                    const padding = 15
                    const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2)
                    const y = height - padding - (p.stock / maxStockVal) * (height - padding * 2)
                    return (
                      <g key={index} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill="#0d1322"
                          stroke="#7c3aed"
                          strokeWidth="2.5"
                          className="hover:r-6 hover:fill-[#00d2ff] transition-all"
                        />
                        <title>{`${p.date}: ${p.stock} ${material.unit}`}</title>
                      </g>
                    )
                  })}
                </svg>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-2.5">
                  <span>{chartPoints[0].date}</span>
                  <span>{chartPoints[chartPoints.length - 1].date}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Ledgers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock In Log */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest flex items-center">
                <ArrowDownLeft className="h-4 w-4 mr-1.5" /> Stock In Deliveries
              </h3>
            </div>

            {stockInTxns.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
                No delivery transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-4 text-center">QUANTITY</th>
                      <th className="py-3 px-4 text-right">UNIT PRICE</th>
                      <th className="py-3 px-4 text-right">TOTAL COST</th>
                      <th className="py-3 px-6">SUPPLIER / REF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {stockInTxns.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-3.5 px-6 font-semibold">{formatDate(t.date)}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">
                          +{t.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">
                          {t.unitPrice > 0 ? formatCurrency(t.unitPrice) : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-black tabular-nums">
                          {t.unitPrice > 0 ? formatCurrency(t.quantity * t.unitPrice) : '-'}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-semibold">
                          {t.supplier?.name || 'Opening Stock / System'}
                          {t.invoiceNumber && <span className="block text-[9px] text-slate-500 font-bold mt-0.5">Inv: {t.invoiceNumber}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock Out Log */}
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="font-extrabold text-xs text-rose-455 uppercase tracking-widest flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1.5" /> Stock Out Consumptions
              </h3>
            </div>

            {stockOutTxns.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold bg-[#0d1322]/70">
                No consumption logs recorded.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-4 text-center">QUANTITY</th>
                      <th className="py-3 px-6">USAGE DESCRIPTION / DESTINATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                    {stockOutTxns.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-3.5 px-6 font-semibold">{formatDate(t.date)}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-rose-455">
                          -{t.quantity}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-semibold leading-normal">
                          {t.description}
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

export default MaterialDetailsPage
