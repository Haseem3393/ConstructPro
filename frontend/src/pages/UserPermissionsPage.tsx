import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUserDetail, useUpdatePermissions } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Loader2, Save, ShieldCheck } from 'lucide-react'

const UserPermissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: userDetails, isLoading, error } = useUserDetail(id || '')
  const updatePermissionsMutation = useUpdatePermissions()

  const [modules, setModules] = useState<any>({
    projects: { view: false, edit: false, delete: false },
    finance: { view: false, edit: false },
    reports: { view: false },
  })
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync state when details load
  useEffect(() => {
    if (userDetails) {
      const permissions = (userDetails.permissions as any) || {}
      const defaultModules = {
        projects: { view: false, edit: false, delete: false },
        finance: { view: false, edit: false },
        reports: { view: false },
        ...(permissions.modules || {}),
      }
      setModules(defaultModules)
    }
  }, [userDetails])

  const handleToggle = (moduleKey: string, actionKey: string) => {
    setModules((prev: any) => {
      const updatedModule = {
        ...prev[moduleKey],
        [actionKey]: !prev[moduleKey][actionKey],
      }

      // View permission logic: if view is disabled, disable others; if others are enabled, auto-enable view
      if (actionKey === 'view' && !updatedModule.view) {
        // Disabled view, disable edit/delete
        Object.keys(updatedModule).forEach((k) => {
          updatedModule[k] = false
        })
      } else if (actionKey !== 'view' && updatedModule[actionKey]) {
        // Enabled edit/delete, auto-enable view
        updatedModule.view = true
      }

      return {
        ...prev,
        [moduleKey]: updatedModule,
      }
    })
    setSuccessMsg('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!id) return

    try {
      await updatePermissionsMutation.mutateAsync({
        id,
        modules,
      })
      setSuccessMsg('Permissions matrix updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to save permissions.')
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-slate-505 font-semibold text-sm">Loading security descriptors...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !userDetails) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/22 rounded-xl p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-455 font-bold mb-2">Error loading descriptors</p>
          <p className="text-slate-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'User details not found.'}
          </p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#0d1526] border border-[#1a2535] rounded-xl text-slate-405 hover:text-white hover:bg-[#111d33] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Module Permissions</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Configure role overrides for {userDetails.name} ({userDetails.role})</p>
          </div>
        </div>

        {/* Permissions Form */}
        <form onSubmit={handleSave} className="bg-[#0d1526] border border-[#1a2535] rounded-2xl overflow-hidden shadow-xl p-6 space-y-6 relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/22 text-emerald-400 text-xs rounded-xl font-semibold tracking-wide">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/22 text-rose-455 text-xs rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Module Toggles List */}
          <div className="space-y-6 divide-y divide-[#1a2535]">
            {/* Projects Module */}
            <div className="pt-0 space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-205">Projects Module</h3>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-350 pl-6">
                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.projects.view}
                    onChange={() => handleToggle('projects', 'view')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>Read/View Details</span>
                </label>
                
                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.projects.edit}
                    onChange={() => handleToggle('projects', 'edit')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>Create / Update Details</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.projects.delete}
                    onChange={() => handleToggle('projects', 'delete')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>Delete Projects</span>
                </label>
              </div>
            </div>

            {/* Finance Module */}
            <div className="pt-5 space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-205">Finance & Expense Module</h3>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-350 pl-6">
                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.finance.view}
                    onChange={() => handleToggle('finance', 'view')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>View Expenses / Budgets</span>
                </label>
                
                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.finance.edit}
                    onChange={() => handleToggle('finance', 'edit')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>Record Payments / Expense logs</span>
                </label>
              </div>
            </div>

            {/* Reports Module */}
            <div className="pt-5 space-y-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-205">Reports & Analytics</h3>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-350 pl-6">
                <label className="flex items-center space-x-2.5 cursor-pointer bg-[#0b1220] border border-[#1a2535] px-3.5 py-2.5 rounded-xl hover:border-blue-500/30 transition-all select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={modules.reports.view}
                    onChange={() => handleToggle('reports', 'view')}
                    className="rounded bg-[#0b1220] border-[#1a2535] text-blue-505 focus:ring-0"
                  />
                  <span>Access & Export Reports</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 border-t border-[#1a2535] pt-5 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 bg-[#0b1220] hover:bg-[#111d33] border border-[#1a2535] text-slate-355 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={updatePermissionsMutation.isPending}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
            >
              {updatePermissionsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Permissions
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  )
}

export default UserPermissionsPage
