import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUserDetail, useUpdateUser } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Lock, 
  UserCheck, 
  UserX,
  Shield,
  Sliders
} from 'lucide-react'

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: userDetails, isLoading, error } = useUserDetail(id || '')
  const updateUserMutation = useUpdateUser()

  const handleToggleActive = async () => {
    if (!userDetails) return
    const permissions = (userDetails.permissions as any) || {}
    const isActive = permissions.active !== false

    try {
      await updateUserMutation.mutateAsync({
        id: userDetails.id,
        data: { active: !isActive },
      })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Fetching account details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !userDetails) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-400 font-bold mb-2">Error loading profile</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'User details not found.'}
          </p>
          <Link to="/users" className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">
            Return to Users List
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  const permissions = (userDetails.permissions as any) || {}
  const isActive = permissions.active !== false
  const phone = permissions.phone || 'No phone recorded'

  // Combine managed, client, and assigned projects into a single list
  const allAssignedProjects = [
    ...(userDetails.managedProjects || []).map(p => ({ ...p, roleInProject: 'Manager' })),
    ...(userDetails.clientProjects || []).map(p => ({ ...p, roleInProject: 'Client' })),
    ...(userDetails.assignedProjects || []).map(ap => ({ ...ap.project, roleInProject: ap.role || 'Member' }))
  ]

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white">User Profile</h1>
            <p className="text-zinc-400 text-sm mt-1">Detailed contact card and contract assignments</p>
          </div>
        </div>

        {/* Profile Card Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar and Main metadata */}
          <div className="md:col-span-1 bg-[#14161f] border border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center justify-between">
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-4xl shadow-inner shadow-black">
                {userDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{userDetails.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
                  {userDetails.role}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 w-full mt-6 pt-6 space-y-3">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {isActive ? 'Active Member' : 'Deactivated'}
              </span>
              
              <div className="flex justify-center space-x-2 w-full">
                <button
                  onClick={handleToggleActive}
                  disabled={updateUserMutation.isPending}
                  className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                    isActive
                      ? 'bg-rose-600/10 border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white'
                      : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  {isActive ? <UserX className="h-4 w-4 mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
                  {isActive ? 'Deactivate' : 'Activate'}
                </button>

                <Link
                  to={`/users/${userDetails.id}/permissions`}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-750 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center"
                  title="Permissions Matrix"
                >
                  <Sliders className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Details & Assignments */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Card */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-300 border-b border-zinc-800 pb-3">Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Email</span>
                    <span className="block text-zinc-300 font-semibold truncate">{userDetails.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Phone</span>
                    <span className="block text-zinc-300 font-semibold">{phone}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Registered</span>
                    <span className="block text-zinc-300 font-semibold">{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Projects Table */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl">
              <h3 className="font-bold text-sm text-zinc-300 border-b border-zinc-800 pb-3 mb-4">Assigned Projects</h3>
              {allAssignedProjects.length === 0 ? (
                <p className="text-zinc-500 text-xs py-4 text-center">No projects assigned to this user.</p>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {allAssignedProjects.map((project, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#1b1c25] border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-4 w-4 text-zinc-500" />
                        <div>
                          <span className="block text-sm font-bold text-zinc-200">{project.name}</span>
                          <span className="block text-[10px] text-zinc-500 mt-0.5">{project.location}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        {project.roleInProject}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default UserDetailsPage
