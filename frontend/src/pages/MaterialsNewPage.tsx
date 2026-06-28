import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useSuppliers } from '../hooks/useSuppliers'
import { useCreateMaterial } from '../hooks/useMaterials'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Save, Loader2, PlusCircle } from 'lucide-react'

const MaterialsNewPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: projects, isLoading: isProjectsLoading } = useProjects()
  const { data: suppliers } = useSuppliers()

  // Form states
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Masonry')
  const [itemType, setItemType] = useState('consumables')
  const [unit, setUnit] = useState('bags')
  const [minimumLevel, setMinimumLevel] = useState('10')
  const [projectId, setProjectId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [formError, setFormError] = useState('')

  const createMaterialMutation = useCreateMaterial(projectId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name || !unit || !projectId) {
      setFormError('Name, Unit, and Project assignment are required.')
      return
    }

    try {
      await createMaterialMutation.mutateAsync({
        name,
        unit,
        category,
        itemType,
        minimumLevel: parseFloat(minimumLevel) || 0,
        supplierId: supplierId || undefined,
      })
      navigate('/materials')
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create material.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="flex items-center">
          <Link
            to="/materials"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Materials
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#1a2535] pb-5">
          <h1 className="text-3xl font-black text-white tracking-tight">Register Material Type</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Register a new stock item type and assign it to a project context</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0d1526] border border-[#1a2535] rounded-2xl p-6 shadow-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/22 text-rose-455 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Material Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Portland Cement, Sand, 16mm Steel Rebar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold cursor-pointer"
                >
                  <option value="Masonry">Masonry</option>
                  <option value="Formwork">Formwork</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Item Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold cursor-pointer"
                >
                  <option value="consumables">Consumables</option>
                  <option value="raw_materials">Raw Materials</option>
                  <option value="assets">Assets</option>
                  <option value="spare_parts">Spare Parts</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Standard Unit *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="bags">bags</option>
                  <option value="pieces">pieces</option>
                  <option value="m³">m³</option>
                  <option value="liters">liters</option>
                  <option value="meters">meters</option>
                  <option value="sheets">sheets</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Minimum stock level threshold</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 10"
                  value={minimumLevel}
                  onChange={(e) => setMinimumLevel(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign to Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Project</option>
                  {isProjectsLoading ? (
                    <option>Loading Projects...</option>
                  ) : (
                    projects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Supplier (Optional)</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-[#0b1220] border border-[#1a2535] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.02] transition-all font-semibold cursor-pointer"
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-[#0b1220] border border-[#1a2535] rounded-xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Balance</span>
              <p className="text-slate-400 text-xs mt-0.5">Note: Re-registering items default with an initial stock balance of 0. Log standard deliveries to register deliveries.</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1a2535] flex gap-2">
              <Link
                to="/materials"
                className="flex-1 py-2.5 bg-[#0b1220] hover:bg-[#111d33] border border-[#1a2535] text-slate-355 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMaterialMutation.isPending}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-505 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {createMaterialMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-550" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Material
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default MaterialsNewPage
