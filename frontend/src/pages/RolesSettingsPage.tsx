import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRolePermissions, useUpdateRolePermissions } from '../hooks/useSettings'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  ShieldAlert,
  AlertTriangle
} from 'lucide-react'

const RolesSettingsPage: React.FC = () => {
  const { data: rolesList, isLoading } = useRolePermissions()
  const updatePermissionsMutation = useUpdateRolePermissions()

  const [selectedRole, setSelectedRole] = useState<string>('PROJECT_MANAGER')
  const [matrix, setMatrix] = useState<any>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (rolesList) {
      const activeRole = rolesList.find(r => r.role === selectedRole)
      if (activeRole) {
        setMatrix(JSON.parse(JSON.stringify(activeRole.permissions))) // deep copy
      }
    }
  }, [rolesList, selectedRole])

  const handleToggle = (module: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    if (selectedRole === 'ADMIN') return // block admin modifications

    setMatrix((prev: any) => {
      const updatedModule = { ...prev[module] }
      updatedModule[action] = !updatedModule[action]
      return {
        ...prev,
        [module]: updatedModule
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (selectedRole === 'ADMIN') {
      setErrorMsg('Administrator permissions are locked and cannot be altered.')
      return
    }

    updatePermissionsMutation.mutate({
      role: selectedRole,
      permissions: matrix
    }, {
      onSuccess: () => {
        setSuccessMsg(`Permissions for role ${selectedRole.replace('_', ' ')} updated successfully!`)
        setTimeout(() => setSuccessMsg(''), 4000)
      },
      onError: (err: any) => {
        setErrorMsg(err.response?.data?.error || 'Failed to update permissions matrix')
      }
    })
  }

  const roles = [
    { type: 'ADMIN', label: 'Administrator (Locked)' },
    { type: 'PROJECT_MANAGER', label: 'Project Manager' },
    { type: 'SUPERVISOR', label: 'Site Supervisor' },
    { type: 'CLIENT', label: 'Client / Investor' }
  ]

  const modules = [
    { key: 'dashboard', label: 'Dashboards Hub' },
    { key: 'projects', label: 'Projects & Tasks' },
    { key: 'materials', label: 'Materials & Inventory' },
    { key: 'machinery', label: 'Machinery & Equipment' },
    { key: 'finance', label: 'Finance & Expenses' },
    { key: 'contracts', label: 'Contracts & Clearances' },
    { key: 'reports', label: 'Reports & Analytics' },
    { key: 'settings', label: 'System Settings' }
  ]

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Role Permissions Matrix</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Configure system access thresholds across roles. Admin permissions are locked to guarantee core safety.
          </p>
        </div>

        {/* Status Indicators */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/22 text-emerald-400 p-4 rounded-xl text-xs font-bold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/22 text-rose-455 p-4 rounded-xl text-xs font-bold flex items-center">
            <AlertTriangle className="h-4.5 w-4.5 mr-2 animate-bounce" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Roles Select list */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden space-y-2">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">User Roles</span>
            {roles.map((r) => (
              <button
                key={r.type}
                onClick={() => {
                  setSelectedRole(r.type)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                  selectedRole === r.type
                    ? 'bg-[#7c3aed]/10 text-[#00d2ff] border-[#7c3aed]/22'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Matrix Checklist Form */}
          {isLoading ? (
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">Syncing permissions matrix...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div>
                <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">
                    Module Actions Toggles ({selectedRole.replace('_', ' ')})
                  </h3>
                  {selectedRole === 'ADMIN' && (
                    <span className="text-[9px] font-black text-rose-455 uppercase bg-rose-500/10 border border-rose-500/22 px-2 py-0.5 rounded-xl tracking-widest">
                      Locked
                    </span>
                  )}
                </div>
                
                {/* Perm matrix Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                        <th className="py-3 px-6">MODULE NAME</th>
                        <th className="py-3 px-4 text-center">VIEW</th>
                        <th className="py-3 px-4 text-center">CREATE</th>
                        <th className="py-3 px-4 text-center">EDIT</th>
                        <th className="py-3 px-6 text-center">DELETE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs font-semibold text-slate-300">
                      {modules.map((m) => {
                        const perms = matrix[m.key] || { view: false, create: false, edit: false, delete: false }
                        return (
                          <tr key={m.key} className="hover:bg-white/[0.015] transition-colors group">
                            <td className="py-4 px-6 font-bold text-white text-sm">{m.label}</td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.view}
                                onChange={() => handleToggle(m.key, 'view')}
                                className="w-4 h-4 rounded-xl text-[#7c3aed] bg-[#0a0f1d]/60 border-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.create}
                                onChange={() => handleToggle(m.key, 'create')}
                                className="w-4 h-4 rounded-xl text-[#7c3aed] bg-[#0a0f1d]/60 border-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.edit}
                                onChange={() => handleToggle(m.key, 'edit')}
                                className="w-4 h-4 rounded-xl text-[#7c3aed] bg-[#0a0f1d]/60 border-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.delete}
                                onChange={() => handleToggle(m.key, 'delete')}
                                className="w-4 h-4 rounded-xl text-[#7c3aed] bg-[#0a0f1d]/60 border-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action save button */}
              {selectedRole !== 'ADMIN' && (
                <div className="px-6 py-4 bg-white/[0.01] border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatePermissionsMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:opacity-90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-violet-500/10"
                  >
                    {updatePermissionsMutation.isPending ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5 mr-1.5" /> Save Permissions
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}

export default RolesSettingsPage
