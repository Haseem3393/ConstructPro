import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUserDetail, useUpdateUser } from '../hooks/useUsers'
import SidebarLayout from '../components/SidebarLayout'
import { toast } from '../utils/toast'
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
      toast.success(`User status updated to ${!isActive ? 'Active' : 'Inactive'}.`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user status.')
    }
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-32 bg-[#0d1322]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl relative max-w-lg mx-auto">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
          <p className="text-slate-405 font-bold text-xs uppercase tracking-widest mt-3">Fetching account details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !userDetails) {
    return (
      <SidebarLayout>
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 max-w-lg mx-auto text-center backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
          <p className="text-rose-455 font-black uppercase tracking-widest mb-2">Error loading profile</p>
          <p className="text-slate-400 text-xs font-semibold mb-4">
            {(error as any)?.response?.data?.error || 'User details not found.'}
          </p>
          <Link to="/users" className="text-xs text-[#00d2ff] hover:text-[#00d2ff]/80 font-black uppercase tracking-widest">
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
            className="p-2 bg-[#0a0f1d]/60 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">User Profile</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Detailed contact card and contract assignments</p>
          </div>
        </div>

        {/* Profile Card Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar and Main metadata */}
          <div className="md:col-span-1 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#7c3aed]/10 border-2 border-[#7c3aed]/22 flex items-center justify-center font-black text-[#00d2ff] text-4xl shadow-inner shadow-black">
                {userDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{userDetails.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-[#7c3aed]/10 text-[#00d2ff] border border-[#7c3aed]/22 text-xs font-black rounded-xl uppercase tracking-widest">
                  {userDetails.role}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 w-full mt-6 pt-6 space-y-3">
              <span className={`inline-block px-3 py-1 text-xs font-black rounded-xl uppercase tracking-widest border ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22'
                  : 'bg-rose-500/10 text-rose-455 border border-rose-500/22'
              }`}>
                {isActive ? 'Active Member' : 'Deactivated'}
              </span>
              
              <div className="flex justify-center space-x-2 w-full">
                <button
                  onClick={handleToggleActive}
                  disabled={updateUserMutation.isPending}
                  className={`flex-1 flex justify-center items-center py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500/22 text-rose-455 hover:bg-rose-600 hover:text-white'
                      : 'bg-emerald-500/10 border-emerald-500/22 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  {isActive ? <UserX className="h-4 w-4 mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
                  {isActive ? 'Deactivate' : 'Activate'}
                </button>

                <Link
                  to={`/users/${userDetails.id}/permissions`}
                  className="px-3 py-2 bg-[#0a0f1d]/60 border border-white/10 text-slate-350 hover:bg-white/[0.04] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer"
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
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest border-b border-white/10 pb-3">Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block text-[10px] text-slate-505 font-black uppercase tracking-widest">Email</span>
                    <span className="block text-slate-300 font-semibold truncate">{userDetails.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-505 font-black uppercase tracking-widest">Phone</span>
                    <span className="block text-slate-300 font-semibold">{phone}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-505 font-black uppercase tracking-widest">Registered</span>
                    <span className="block text-slate-300 font-semibold">{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Projects Table */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-extrabold text-sm text-[#00d2ff] uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Assigned Projects</h3>
              {allAssignedProjects.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center font-bold uppercase tracking-widest">No projects assigned to this user.</p>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {allAssignedProjects.map((project, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-[#0a0f1d]/60 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <div>
                          <span className="block text-sm font-bold text-slate-200">{project.name}</span>
                          <span className="block text-[10px] text-slate-500 mt-0.5 font-bold">{project.location}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#7c3aed]/10 border border-[#7c3aed]/22 text-[#00d2ff] px-2 py-0.5 rounded-xl uppercase font-black tracking-widest">
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
