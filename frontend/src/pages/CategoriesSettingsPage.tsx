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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white">Dynamic Categories Manager</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Maintain item types, measurement units, machinery brands, and expense categories.
          </p>
        </div>

        {/* Status Panels */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg text-xs font-bold flex items-center">
            <AlertTriangle className="h-4.5 w-4.5 mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex flex-wrap gap-1.5 bg-[#14161f] border border-zinc-800 p-1.5 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type as TabType)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.type
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form to Create Category */}
        <form onSubmit={handleCreate} className="bg-[#14161f] border border-zinc-800 rounded-xl p-4 shadow-xl flex items-center space-x-3 max-w-lg">
          <input
            type="text"
            required
            placeholder={`Enter new ${activeTab.replace('_', ' ').toLowerCase()}`}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-[#1b1c25] border border-zinc-855 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-650"
          />
          <button
            type="submit"
            disabled={createCategoryMutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 disabled:opacity-40"
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
          <div className="flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium mt-3">Loading settings registry...</p>
          </div>
        ) : (
          <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl max-w-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                    <th className="py-3 px-6">NAME / SPECIFICATION</th>
                    <th className="py-3 px-6 text-center w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {activeCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1a1c27]/20 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-white text-sm">{c.name}</td>
                      <td className="py-3.5 px-6 text-center w-24">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteCategoryMutation.isPending}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded transition-all"
                          title="Delete Setting"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeCategories.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-zinc-550">
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
