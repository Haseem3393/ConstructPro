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
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Users Registry</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure system credentials, module permissions, and user accounts</p>
          </div>
          <Link
            to="/users/new"
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/10"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New User
          </Link>
        </div>

        {/* Data Table */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-300 font-sans">User Records</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold">
              {users?.length || 0} accounts synced
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                {/* Column Labels */}
                <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">USER DETAILS</th>
                  <th className="py-4 px-4">EMAIL ADDRESS</th>
                  <th className="py-4 px-4">SECURITY ROLE</th>
                  <th className="py-4 px-4">PHONE NUMBER</th>
                  <th className="py-4 px-4 text-center">ACCOUNT STATUS</th>
                  <th className="py-4 px-6 text-center w-40">ACTIONS</th>
                </tr>
                {/* Column Searches */}
                <tr className="bg-[#161822]/40 border-b border-zinc-805">
                  <td className="py-2.5 px-4 text-center text-zinc-650 font-bold">-</td>
                  <td className="py-2.5 px-6">
                    <div className="relative flex items-center">
                      <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-600" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded pl-8 pr-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4"></td>
                  <td className="py-2.5 px-4">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-[#1b1c25] border border-zinc-800/80 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-600"
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
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        <span className="text-zinc-500 font-semibold">Fetching accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-rose-400 font-bold">
                      {(error as any)?.response?.data?.error || 'Failed to sync users.'}
                    </td>
                  </tr>
                ) : users?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
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
                        className={`transition-colors ${
                          !isActive ? 'opacity-50 hover:bg-[#1a1c27]/20' : 'hover:bg-[#1a1c27]/30'
                        }`}
                      >
                        <td className="py-4 px-6 text-center font-bold text-zinc-500">{index + 1}</td>
                        <td className="py-4 px-6 font-bold text-white text-sm">
                          <Link to={`/users/${userItem.id}`} className="hover:text-blue-400 transition-colors">
                            {userItem.name}
                          </Link>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-350">{userItem.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded ${
                            userItem.role === 'ADMIN'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                              : userItem.role === 'PROJECT_MANAGER'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/25'
                              : userItem.role === 'SUPERVISOR'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-400">{phone}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                          }`}>
                            {isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Edit Profile */}
                            <button
                              onClick={() => navigate(`/users/${userItem.id}`)}
                              className="p-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded border border-blue-500/20 transition-all"
                              title="Profile Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {/* Edit Permissions Matrix */}
                            <button
                              onClick={() => navigate(`/users/${userItem.id}/permissions`)}
                              className="p-1.5 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white rounded border border-violet-500/20 transition-all"
                              title="Module Permissions"
                            >
                              <Sliders className="h-3.5 w-3.5" />
                            </button>
                            {/* Activate / Deactivate Toggle */}
                            <button
                              onClick={() => handleToggleActive(userItem.id, isActive)}
                              className={`p-1.5 rounded border transition-all ${
                                isActive
                                  ? 'bg-rose-600/10 text-rose-400 border-rose-500/20 hover:bg-rose-600 hover:text-white'
                                  : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white'
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
