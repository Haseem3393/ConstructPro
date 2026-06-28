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
        <div className="border-b border-zinc-800 pb-5">
          <Link to="/settings" className="inline-flex items-center text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest mb-3">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Settings
          </Link>
          <h1 className="text-3xl font-black text-white">Role Permissions Matrix</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Configure system access thresholds across roles. Admin permissions are locked to guarantee core safety.
          </p>
        </div>

        {/* Status Indicators */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-xs font-bold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg text-xs font-bold flex items-center">
            <AlertTriangle className="h-4.5 w-4.5 mr-2" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Roles Select list */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="bg-[#14161f] border border-zinc-850 rounded-xl p-4 shadow-xl space-y-2">
            <span className="block text-[9px] font-black text-zinc-550 uppercase tracking-widest mb-3">User Roles</span>
            {roles.map((r) => (
              <button
                key={r.type}
                onClick={() => {
                  setSelectedRole(r.type)
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === r.type
                    ? 'bg-violet-650/15 text-violet-400 border border-violet-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Matrix Checklist Form */}
          {isLoading ? (
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 bg-[#14161f] border border-zinc-800 rounded-xl shadow-xl">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium mt-3">Syncing permissions matrix...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div>
                <div className="px-6 py-4 border-b border-zinc-850 bg-[#171924]/30 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-zinc-350">
                    Module Actions Toggles ({selectedRole.replace('_', ' ')})
                  </h3>
                  {selectedRole === 'ADMIN' && (
                    <span className="text-[9px] font-black text-rose-400 uppercase bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      Locked
                    </span>
                  )}
                </div>
                
                {/* Perm matrix Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider bg-[#181a24]/30 border-b border-zinc-800">
                        <th className="py-3 px-6">MODULE NAME</th>
                        <th className="py-3 px-4 text-center">VIEW</th>
                        <th className="py-3 px-4 text-center">CREATE</th>
                        <th className="py-3 px-4 text-center">EDIT</th>
                        <th className="py-3 px-6 text-center">DELETE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs font-semibold">
                      {modules.map((m) => {
                        const perms = matrix[m.key] || { view: false, create: false, edit: false, delete: false }
                        return (
                          <tr key={m.key} className="hover:bg-[#1a1c27]/25 transition-colors">
                            <td className="py-4 px-6 font-bold text-white text-sm">{m.label}</td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.view}
                                onChange={() => handleToggle(m.key, 'view')}
                                className="w-4 h-4 rounded text-violet-650 bg-[#1b1c25] border-zinc-800 focus:ring-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.create}
                                onChange={() => handleToggle(m.key, 'create')}
                                className="w-4 h-4 rounded text-violet-650 bg-[#1b1c25] border-zinc-800 focus:ring-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.edit}
                                onChange={() => handleToggle(m.key, 'edit')}
                                className="w-4 h-4 rounded text-violet-650 bg-[#1b1c25] border-zinc-800 focus:ring-0 cursor-pointer disabled:opacity-40"
                              />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="checkbox"
                                disabled={selectedRole === 'ADMIN'}
                                checked={perms.delete}
                                onChange={() => handleToggle(m.key, 'delete')}
                                className="w-4 h-4 rounded text-violet-650 bg-[#1b1c25] border-zinc-800 focus:ring-0 cursor-pointer disabled:opacity-40"
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
                <div className="px-6 py-4 bg-[#171924]/20 border-t border-zinc-850 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatePermissionsMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
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
