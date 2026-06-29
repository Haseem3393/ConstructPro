import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useSettings'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Trash2,
  AlertTriangle
} from 'lucide-react'

type TabType = 'ITEM_TYPE' | 'UNIT' | 'BRAND' | 'ITEM_CATEGORY' | 'EXPENSE_CATEGORY'

const CategoriesSettingsPage: React.FC = () => {
  const { data: categories, isLoading } = useCategories()
  const createCategoryMutation = useCreateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const [activeTab, setActiveTab] = useState<TabType>('ITEM_TYPE')
  const [newCategoryName, setNewCategoryName] = useState('')
  
  // Status states
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!newCategoryName.trim()) return

    createCategoryMutation.mutate({
      type: activeTab,
      name: newCategoryName.trim()
    }, {
      onSuccess: () => {
        setSuccessMsg(`Successfully registered new ${activeTab.replace('_', ' ')}!`)
        setNewCategoryName('')
        setTimeout(() => setSuccessMsg(''), 4000)
      },
      onError: (err: any) => {
        setErrorMsg(err.response?.data?.error || 'Failed to create category setting')
      }
    })
  }

  const handleDelete = (id: string) => {
    setErrorMsg('')
    setSuccessMsg('')

    if (!window.confirm('Are you sure you want to delete this setting?')) return

    deleteCategoryMutation.mutate(id, {
      onSuccess: () => {
        setSuccessMsg('Successfully deleted setting')
        setTimeout(() => setSuccessMsg(''), 4000)
      },
      onError: (err: any) => {
        setErrorMsg(err.response?.data?.error || 'Deletion blocked: active records depend on this category')
      }
    })
  }

  const tabs = [
    { type: 'ITEM_TYPE', label: 'Item Types' },
    { type: 'UNIT', label: 'Units' },
    { type: 'BRAND', label: 'Brands' },
    { type: 'ITEM_CATEGORY', label: 'Item Categories' },
    { type: 'EXPENSE_CATEGORY', label: 'Expense Categories' }
  ]

  // Filter current active type categories
  const activeCategories = categories?.filter(c => c.type === activeTab) || []

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Dynamic Categories Manager</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Maintain item types, measurement units, machinery brands, and expense categories.
          </p>
        </div>

        {/* Status Panels */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/22 text-rose-455 p-4 rounded-xl text-xs font-bold flex items-center">
            <AlertTriangle className="h-4.5 w-4.5 mr-2 shrink-0 animate-bounce" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/22 text-emerald-400 p-4 rounded-xl text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-1.5 bg-[#0d1322]/70 border border-white/10 p-1.5 rounded-2xl w-fit backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type as TabType)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab.type
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form to Create Category */}
        <form onSubmit={handleCreate} className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl flex items-center space-x-3 max-w-lg backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <input
            type="text"
            required
            placeholder={`Enter new ${activeTab.replace('_', ' ').toLowerCase()}`}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none transition-all font-semibold"
          />
          <button
            type="submit"
            disabled={createCategoryMutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:opacity-90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0 disabled:opacity-40 shadow-lg shadow-violet-500/10"
          >
            {createCategoryMutation.isPending ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" /> Add
              </>
            )}
          </button>
        </form>

        {/* Category List Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Loading settings registry...</p>
          </div>
        ) : (
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative max-w-xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                    <th className="py-3 px-6">NAME / SPECIFICATION</th>
                    <th className="py-3 px-6 text-center w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                  {activeCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-3.5 px-6 font-bold text-white text-sm">{c.name}</td>
                      <td className="py-3.5 px-6 text-center w-24">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteCategoryMutation.isPending}
                          className="p-1.5 text-slate-500 hover:text-rose-455 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer"
                          title="Delete Setting"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeCategories.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-slate-500 font-bold uppercase tracking-widest bg-[#0d1322]/70">
                        No settings recorded under this tab.
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

export default CategoriesSettingsPage
