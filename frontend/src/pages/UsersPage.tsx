import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUsersList, useUpdateUser } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  Edit2, 
  UserCheck, 
  UserX,
  ShieldAlert,
  Sliders
} from 'lucide-react'
import { toast } from '../utils/toast'

const UsersPage: React.FC = () => {
  const navigate = useNavigate()
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: users, isLoading, error } = useUsersList(roleFilter || undefined, searchQuery || undefined)
  const updateUserMutation = useUpdateUser()

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateUserMutation.mutateAsync({
        id,
        data: { active: !currentActive },
      })
      toast.success(`User status updated successfully.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Users Registry</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Configure system credentials, module permissions, and user accounts</p>
          </div>
          <Link
            to="/users/new"
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:opacity-90 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest duration-200 shadow-lg shadow-violet-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New User
          </Link>
        </div>

        {/* Data Table */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest">User Records</h3>
            <span className="text-[10px] bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22 px-2.5 py-0.5 rounded-xl font-black uppercase tracking-widest">
              {users?.length || 0} accounts synced
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                {/* Column Labels */}
                <tr className="text-[9px] text-slate-400 font-black tracking-widest uppercase bg-white/[0.01] border-b border-white/10">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">USER DETAILS</th>
                  <th className="py-4 px-4">EMAIL ADDRESS</th>
                  <th className="py-4 px-4">SECURITY ROLE</th>
                  <th className="py-4 px-4">PHONE NUMBER</th>
                  <th className="py-4 px-4 text-center">ACCOUNT STATUS</th>
                  <th className="py-4 px-6 text-center w-40">ACTIONS</th>
                </tr>
                {/* Column Searches */}
                <tr className="bg-white/[0.005] border-b border-white/10">
                  <td className="py-2.5 px-4 text-center text-slate-600 font-bold">-</td>
                  <td className="py-2.5 px-6">
                    <div className="relative flex items-center">
                      <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all font-semibold"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4"></td>
                  <td className="py-2.5 px-4">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </td>
                  <td colSpan={2}></td>
                  <td className="py-2.5 px-6 text-center">-</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center bg-[#0d1322]/70">
                      <div className="flex justify-center items-center space-x-2">
                        <Loader2 className="h-5 w-5 text-[#7c3aed] animate-spin" />
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-rose-455 font-bold bg-[#0d1322]/70">
                      {(error as any)?.response?.data?.error || 'Failed to sync users.'}
                    </td>
                  </tr>
                ) : users?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest bg-[#0d1322]/70">
                      No user records match the search filter.
                    </td>
                  </tr>
                ) : (
                  users?.map((userItem, index) => {
                    const permissions = (userItem.permissions as any) || {}
                    const isActive = permissions.active !== false
                    const phone = permissions.phone || 'N/A'

                    return (
                      <tr 
                        key={userItem.id} 
                        className={`transition-colors hover:bg-white/[0.015] group ${
                          !isActive ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-500">{index + 1}</td>
                        <td className="py-4 px-6 font-bold text-white text-sm">
                          <Link to={`/users/${userItem.id}`} className="hover:text-[#00d2ff] transition-colors">
                            {userItem.name}
                          </Link>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-400">{userItem.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-xl uppercase tracking-widest border ${
                            userItem.role === 'ADMIN'
                              ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/22'
                              : userItem.role === 'PROJECT_MANAGER'
                              ? 'bg-[#7c3aed]/10 text-violet-405 border border-[#7c3aed]/22'
                              : userItem.role === 'SUPERVISOR'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/22'
                              : 'bg-[#0a0f1d]/60 border border-white/10 text-slate-400'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-400">{phone}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-xl uppercase tracking-widest border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                              : 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
                          }`}>
                            {isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Edit Profile */}
                            <button
                              onClick={() => navigate(`/users/${userItem.id}`)}
                              className="p-1.5 bg-[#0a0f1d]/60 border border-white/10 text-[#00d2ff] hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer"
                              title="Profile Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {/* Edit Permissions Matrix */}
                            <button
                              onClick={() => navigate(`/users/${userItem.id}/permissions`)}
                              className="p-1.5 bg-[#0a0f1d]/60 border border-white/10 text-violet-405 hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer"
                              title="Module Permissions"
                            >
                              <Sliders className="h-3.5 w-3.5" />
                            </button>
                            {/* Activate / Deactivate Toggle */}
                            <button
                              onClick={() => handleToggleActive(userItem.id, isActive)}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22 hover:bg-rose-600 hover:text-white'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22 hover:bg-emerald-600 hover:text-white'
                              }`}
                              title={isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default UsersPage
