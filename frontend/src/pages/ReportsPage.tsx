import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFinancialReport, useLabourReport, useInventoryReport } from '../hooks/useReports'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Printer, 
  Loader2, 
  TrendingUp, 
  Users, 
  Archive, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react'

const ReportsPage: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'financial' | 'labour' | 'inventory'>('financial')

  const { data: financialData, isLoading: isFinancialLoading } = useFinancialReport()
  const { data: labourData, isLoading: isLabourLoading } = useLabourReport()
  const { data: inventoryData, isLoading: isInventoryLoading } = useInventoryReport()

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  }

  // Access restriction
  if (user?.role !== 'ADMIN' && user?.role !== 'PROJECT_MANAGER') {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center mt-12">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm">
            Only administrators and project managers have access to reports and analytics.
          </p>
        </div>
      </SidebarLayout>
    )
  }

  // Aggregate stats for Financial Tab
  const totalBudget = financialData?.reduce((sum, p) => sum + p.budget, 0) || 0
  const totalSpent = financialData?.reduce((sum, p) => sum + p.spent, 0) || 0
  const remainingBudget = totalBudget - totalSpent
  const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  let totalLabour = 0
  let totalMaterial = 0
  let totalEquipment = 0
  let totalOther = 0

  financialData?.forEach((p) => {
    totalLabour += p.spentByCategory?.LABOUR || 0
    totalMaterial += p.spentByCategory?.MATERIAL || 0
    totalEquipment += p.spentByCategory?.EQUIPMENT || 0
    totalOther += p.spentByCategory?.OTHER || 0
  })

  const totalExpenses = totalLabour + totalMaterial + totalEquipment + totalOther

  // Segments for custom SVG Donut Chart
  const circumference = 2 * Math.PI * 50 // ~314.16
  const segments = [
    { name: 'Labour Payouts', value: totalLabour, color: '#8b5cf6', category: 'LABOUR' },
    { name: 'Materials Procurement', value: totalMaterial, color: '#10b981', category: 'MATERIAL' },
    { name: 'Equipment Rentals', value: totalEquipment, color: '#3b82f6', category: 'EQUIPMENT' },
    { name: 'Other Scopes', value: totalOther, color: '#f59e0b', category: 'OTHER' }
  ].map(s => ({
    ...s,
    pct: totalExpenses > 0 ? (s.value / totalExpenses) * 100 : 0
  })).filter(s => s.value > 0)

  // Aggregate stats for Labour Tab
  const overallManDays = labourData?.reduce((sum, p) => sum + p.totalManDays, 0) || 0
  const overallLabourPayout = labourData?.reduce((sum, p) => sum + p.totalLabourPayout, 0) || 0
  const avgOvertime = labourData && labourData.length > 0 
    ? (labourData.reduce((sum, p) => sum + p.totalOvertimeHours, 0) / labourData.length) 
    : 0

  // Aggregate stats for Inventory Tab
  const totalItemsCount = inventoryData?.reduce((sum, p) => sum + p.totalMaterials, 0) || 0
  const lowStockCount = inventoryData?.reduce((sum, p) => sum + p.lowStockCount, 0) || 0
  const activeAlerts = inventoryData?.flatMap(p => p.lowStockItems.map((item: any) => ({ ...item, projectName: p.name }))) || []

  // Printer trigger
  const handlePrint = () => {
    window.print()
  }

  let accumulatedPercent = 0

  return (
    <SidebarLayout>
      <div className="space-y-6 print-container">
        {/* Style block for print override */}
        <style>{`
          @media print {
            aside, header, .no-print, button {
              display: none !important;
            }
            body, html {
              background: #ffffff !important;
              color: #111827 !important;
            }
            main, .flex-1, .print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .bg-\\[\\#14161f\\], .bg-\\[\\#181a24\\], .bg-\\[\\#1c1d26\\] {
              background: #ffffff !important;
              border: 1px solid #e2e8f0 !important;
              color: #111827 !important;
              box-shadow: none !important;
            }
            .text-white, .text-zinc-100, .text-zinc-200, .text-zinc-300, .text-zinc-350 {
              color: #111827 !important;
            }
            .text-zinc-400, .text-zinc-500, .text-zinc-550 {
              color: #4b5563 !important;
            }
            .border, .border-zinc-800, .border-zinc-850 {
              border-color: #cbd5e1 !important;
            }
            .page-break {
              break-inside: avoid;
            }
            svg text {
              fill: #111827 !important;
            }
          }
        `}</style>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 no-print">
          <div>
            <h1 className="text-3xl font-black text-white">Reports & Analytics</h1>
            <p className="text-zinc-400 text-xs mt-1">
              ConstructPro aggregates of portfolio financials, worker productivity, and inventory safety margins.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-zinc-800 hover:bg-[#1c1d26] text-zinc-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report / Save PDF
          </button>
        </div>

        {/* Print Header (Visible only when printing) */}
        <div className="hidden print:block border-b-2 border-zinc-900 pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black uppercase text-zinc-900">ConstructPro Executive Summary</h1>
              <p className="text-xs text-zinc-650">Compiled on: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-sm block">Munaf & Sons Contractors</span>
              <span className="text-[10px] text-zinc-500">Corporate Reporting Division</span>
            </div>
          </div>
        </div>

        {/* Sub-tab selection */}
        <div className="flex space-x-1.5 bg-[#14161f] border border-zinc-800 p-1 rounded-lg w-fit no-print">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'financial'
                ? 'bg-violet-600 text-white shadow shadow-violet-600/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Financial Summary
          </button>
          <button
            onClick={() => setActiveTab('labour')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'labour'
                ? 'bg-violet-600 text-white shadow shadow-violet-600/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Labour Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'inventory'
                ? 'bg-violet-600 text-white shadow shadow-violet-600/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Inventory Status
          </button>
        </div>

        {/* Tab 1: Financial Summary */}
        {activeTab === 'financial' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isFinancialLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-zinc-400 font-medium">Gathering financial statements...</p>
              </div>
            ) : (
              <>
                {/* Aggregate Financial Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 page-break">
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center">
                      <DollarSign className="h-3.5 w-3.5 mr-1" /> Portfolio Budget
                    </span>
                    <span className="block font-black text-white text-xl">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" /> Total Logged Spent
                    </span>
                    <span className="block font-black text-violet-400 text-xl">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                      <Layers className="h-3.5 w-3.5 mr-1" /> Margin / Balance
                    </span>
                    <span className="block font-black text-emerald-400 text-xl">{formatCurrency(remainingBudget)}</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                      <Layers className="h-3.5 w-3.5 mr-1" /> Cap Utilization
                    </span>
                    <span className="block font-black text-zinc-200 text-xl">{overallUtilization.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Progress bar and chart details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-break">
                  {/* Left: Overall Utilization */}
                  <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Portfolio Capital Release Rate</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-500">Resource Spent Rate</span>
                        <span className="text-violet-400">{overallUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-violet-600 transition-all duration-500"
                          style={{ width: `${Math.min(overallUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-zinc-850">
                      <div>
                        <span className="block font-semibold text-zinc-500 uppercase text-[9px] tracking-widest">Spent Resources</span>
                        <span className="font-extrabold text-white text-sm">{formatCurrency(totalSpent)}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-zinc-500 uppercase text-[9px] tracking-widest">Available Credit</span>
                        <span className="font-extrabold text-white text-sm">{formatCurrency(remainingBudget)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: SVG Expense Breakdown Pie Chart */}
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-between space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest self-start">Cost Breakdown</h3>
                    
                    <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                      {totalExpenses === 0 ? (
                        <svg className="w-full h-full" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" r="50" fill="transparent" stroke="#27272a" strokeWidth="16" />
                          <text x="100" y="105" textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="bold">NO EXPENSES</text>
                        </svg>
                      ) : (
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                          {segments.map((seg, idx) => {
                            const strokeDashoffset = circumference - (seg.pct / 100) * circumference
                            const rotationAngle = (accumulatedPercent / 100) * 360
                            accumulatedPercent += seg.pct
                            return (
                              <circle
                                key={idx}
                                cx="100"
                                cy="100"
                                r="50"
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth="16"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(${rotationAngle} 100 100)`}
                                className="transition-all duration-350 hover:stroke-[20px] cursor-pointer"
                              />
                            )
                          })}
                        </svg>
                      )}
                      
                      {totalExpenses > 0 && (
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">Total Logged</span>
                          <span className="text-xs font-black text-white">{formatCurrency(totalExpenses)}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-1.5 text-[10px] font-bold">
                      {segments.length === 0 ? (
                        <p className="text-center text-zinc-500 text-xs py-2">No category breakdowns recorded.</p>
                      ) : (
                        segments.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }}></span>
                              <span className="text-zinc-400">{s.name}</span>
                            </div>
                            <span className="text-white text-right">{s.pct.toFixed(1)}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Table */}
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden page-break">
                  <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-350">Site-Wise Financial Ledger</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                          <th className="py-4 px-6">PROJECT NAME</th>
                          <th className="py-4 px-4 text-right">CAPITAL BUDGET</th>
                          <th className="py-4 px-4 text-right">LOGGED EXPENSES</th>
                          <th className="py-4 px-4 text-right">REMAINING BALANCE</th>
                          <th className="py-4 px-4 text-right">UTILIZATION</th>
                          <th className="py-4 px-6 text-right">PROGRESS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-xs">
                        {financialData?.map((p: any) => (
                          <tr key={p.projectId} className="hover:bg-[#1a1c27]/30 transition-colors">
                            <td className="py-4 px-6 font-bold text-white text-sm">{p.name}</td>
                            <td className="py-4 px-4 text-right font-semibold text-zinc-300">{formatCurrency(p.budget)}</td>
                            <td className="py-4 px-4 text-right font-semibold text-zinc-300">{formatCurrency(p.spent)}</td>
                            <td className={`py-4 px-4 text-right font-black ${p.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatCurrency(p.remaining)}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                p.utilizationRate >= 80 ? 'bg-rose-500/10 text-rose-400' :
                                p.utilizationRate >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                {p.utilizationRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-black text-violet-400">{p.progress}%</td>
                          </tr>
                        ))}
                        {financialData?.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-500">No projects registered.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Labour Analytics */}
        {activeTab === 'labour' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isLabourLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-zinc-400 font-medium">Gathering workforce details...</p>
              </div>
            ) : (
              <>
                {/* Aggregate Labour Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 page-break">
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1" /> Total Man-Days Logged
                    </span>
                    <span className="block font-black text-white text-xl">{overallManDays} days</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center">
                      <DollarSign className="h-3.5 w-3.5 mr-1" /> Cumulative Labour Liability
                    </span>
                    <span className="block font-black text-violet-400 text-xl">{formatCurrency(overallLabourPayout)}</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" /> Avg Project Overtime
                    </span>
                    <span className="block font-black text-emerald-400 text-xl">{avgOvertime.toFixed(1)} hrs</span>
                  </div>
                </div>

                {/* Project Workforce Ledger */}
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden page-break">
                  <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
                    <h3 className="font-bold text-sm text-zinc-350">Workforce Resource Metrics</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                          <th className="py-4 px-6">PROJECT NAME</th>
                          <th className="py-4 px-4 text-right">MAN-DAYS LOGGED</th>
                          <th className="py-4 px-4 text-right">AVERAGE OVERTIME HOURS</th>
                          <th className="py-4 px-6 text-right">DAILY WAGE LIABILITIES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-xs">
                        {labourData?.map((p: any) => (
                          <tr key={p.projectId} className="hover:bg-[#1a1c27]/30 transition-colors">
                            <td className="py-4 px-6 font-bold text-white text-sm">{p.name}</td>
                            <td className="py-4 px-4 text-right font-semibold text-zinc-300">{p.totalManDays} days</td>
                            <td className="py-4 px-4 text-right font-semibold text-zinc-300">{p.totalOvertimeHours.toFixed(1)} hrs</td>
                            <td className="py-4 px-6 text-right font-black text-white text-sm">
                              {formatCurrency(p.totalLabourPayout)}
                            </td>
                          </tr>
                        ))}
                        {labourData?.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-zinc-500">No project attendance found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Inventory Status */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isInventoryLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-zinc-400 font-medium">Gathering inventory logs...</p>
              </div>
            ) : (
              <>
                {/* Aggregate Inventory Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 page-break">
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center">
                      <Archive className="h-3.5 w-3.5 mr-1" /> Active Managed Material Lines
                    </span>
                    <span className="block font-black text-white text-xl">{totalItemsCount} lines</span>
                  </div>
                  <div className="bg-[#14161f] border border-zinc-850 rounded-xl p-5 space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider flex items-center text-yellow-500">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1 text-yellow-500" /> Low Stock Alerts
                    </span>
                    <span className="block font-black text-yellow-400 text-xl">{lowStockCount} items</span>
                  </div>
                </div>

                {/* Safety stock level alerts */}
                {activeAlerts.length > 0 && (
                  <div className="bg-[#14161f] border border-yellow-550/20 rounded-xl p-6 space-y-4 page-break">
                    <h3 className="text-sm font-black text-yellow-400 uppercase tracking-widest flex items-center">
                      <AlertTriangle className="h-4.5 w-4.5 mr-2" /> Safety Level Alerts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeAlerts.map((alert: any) => (
                        <div key={alert.id} className="bg-[#1d1b24]/30 border border-yellow-500/10 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="block text-zinc-500 text-[10px] uppercase font-bold">{alert.projectName}</span>
                            <span className="block font-extrabold text-white text-sm">{alert.name}</span>
                            <span className="block text-[10px] text-zinc-400 mt-1">Supplier: {alert.supplier || 'N/A'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-zinc-550 font-bold uppercase">Stock vs Minimum</span>
                            <span className="block font-black text-yellow-400 text-sm">
                              {alert.currentStock} / {alert.minimumLevel} {alert.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project-Wise Stock Summary */}
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden page-break">
                  <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30">
                    <h3 className="font-bold text-sm text-zinc-350">Site-Wise Stock Summary</h3>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                          <th className="py-4 px-6">PROJECT NAME</th>
                          <th className="py-4 px-4 text-right">TOTAL MATERIAL LINES</th>
                          <th className="py-4 px-6 text-right">LOW STOCK WARNING COUNT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-xs">
                        {inventoryData?.map((p: any) => (
                          <tr key={p.projectId} className="hover:bg-[#1a1c27]/30 transition-colors">
                            <td className="py-4 px-6 font-bold text-white text-sm">{p.name}</td>
                            <td className="py-4 px-4 text-right font-semibold text-zinc-300">{p.totalMaterials} materials</td>
                            <td className="py-4 px-6 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                                p.lowStockCount > 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}>
                                {p.lowStockCount} items
                              </span>
                            </td>
                          </tr>
                        ))}
                        {inventoryData?.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-zinc-500">No project materials registered.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ReportsPage
