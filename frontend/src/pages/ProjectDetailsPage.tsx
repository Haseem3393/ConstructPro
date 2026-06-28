import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  useProjectDetails, 
  useCreateMilestone, 
  useCreateMember, 
  useCreateExpense 
} from '../hooks/useProjects'
import { useUsersList } from '../hooks/useUsers'
import { useAuthStore } from '../store/authStore'
import { useProjectPayments, useUpdatePaymentStatus } from '../hooks/usePayments'
import SidebarLayout from '../components/SidebarLayout'
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingUp,
  Percent,
  Layers,
  Users,
  CheckSquare,
  Plus,
  Save,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: project, isLoading: isProjectLoading, error } = useProjectDetails(id || '')
  
  // Available users for workforce tab member assignment
  const { data: allUsers } = useUsersList()

  const createMilestoneMutation = useCreateMilestone()
  const createMemberMutation = useCreateMember()
  const createExpenseMutation = useCreateExpense()
  
  // Payments Hooks
  const { data: payments, isLoading: isPaymentsLoading } = useProjectPayments(id || '')
  const updatePaymentStatusMutation = useUpdatePaymentStatus(id || '')

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'workforce' | 'expenses' | 'payments'>('overview')

  // Milestone Form State
  const [mName, setMName] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mDueDate, setMDueDate] = useState('')
  const [mError, setMError] = useState('')
  const [mSuccess, setMSuccess] = useState('')

  // Member Form State
  const [memUserId, setMemUserId] = useState('')
  const [memRole, setMemRole] = useState('')
  const [memError, setMemError] = useState('')
  const [memSuccess, setMemSuccess] = useState('')

  // Expense Form State
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('MATERIAL')
  const [expDesc, setExpDesc] = useState('')
  const [expDate, setExpDate] = useState('')
  const [expError, setExpError] = useState('')
  const [expSuccess, setExpSuccess] = useState('')

  const formatCurrency = (value: number) => {
    return `Rs.${value.toLocaleString()}`
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    setMError('')
    setMSuccess('')

    if (!id || !mName || !mDueDate) {
      setMError('Milestone name and due date are required.')
      return
    }

    try {
      await createMilestoneMutation.mutateAsync({
        projectId: id,
        data: { name: mName, description: mDesc, dueDate: mDueDate }
      })
      setMName('')
      setMDesc('')
      setMDueDate('')
      setMSuccess('Milestone added successfully!')
      setTimeout(() => setMSuccess(''), 3000)
    } catch (err: any) {
      setMError(err?.response?.data?.error || 'Failed to create milestone.')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemError('')
    setMemSuccess('')

    if (!id || !memUserId) {
      setMemError('Please select a user.')
      return
    }

    try {
      await createMemberMutation.mutateAsync({
        projectId: id,
        data: { userId: memUserId, role: memRole }
      })
      setMemUserId('')
      setMemRole('')
      setMemSuccess('Member assigned successfully!')
      setTimeout(() => setMemSuccess(''), 3000)
    } catch (err: any) {
      setMemError(err?.response?.data?.error || 'User is already assigned to this project.')
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setExpError('')
    setExpSuccess('')

    if (!id || !expAmount || !expCategory || !expDate) {
      setExpError('Amount, category, and date are required.')
      return
    }

    try {
      await createExpenseMutation.mutateAsync({
        projectId: id,
        data: { 
          amount: parseFloat(expAmount), 
          category: expCategory, 
          description: expDesc, 
          date: expDate 
        }
      })
      setExpAmount('')
      setExpDesc('')
      setExpDate('')
      setExpSuccess('Expense recorded successfully!')
      setTimeout(() => setExpSuccess(''), 3000)
    } catch (err: any) {
      setExpError(err?.response?.data?.error || 'Failed to record expense.')
    }
  }

  if (isProjectLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#7c3aed] animate-spin" />
            <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">Gathering site logs...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !project) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 text-rose-450 p-6 rounded-2xl text-center max-w-lg mx-auto flex flex-col items-center mt-16 z-10 relative">
          <AlertCircle className="h-10 w-10 text-rose-455 mb-2.5" />
          <p className="font-bold mb-2 text-base">Error loading project details</p>
          <p className="text-slate-500 text-xs mb-5">
            {(error as any)?.response?.data?.error || 'Project not found.'}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center text-xs text-blue-450 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to projects
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  // Cost aggregates
  const totalSpent = project.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0
  const budgetUtilization = project.budget > 0 ? (totalSpent / project.budget) * 100 : 0
  const isBudgetWarning = budgetUtilization >= 80

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2.5 bg-[#0d1322]/70 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-white tracking-tight">{project.name}</h1>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${
                  project.status === 'ONGOING' ? 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/22' :
                  project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' :
                  project.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/22' :
                  'bg-amber-500/10 text-amber-455 border border-amber-500/22'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-700 shrink-0" /> {project.location}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            className="px-4 py-2.5 border border-white/10 hover:bg-[#7c3aed]/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Configure Site
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-[#0a0f1d]/60 border border-white/10 p-1 rounded-xl w-fit">
          {(['overview', 'milestones', 'workforce', 'expenses', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-155 cursor-pointer ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] text-white shadow shadow-purple-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial indicators (2 Cols wide) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-5 shadow-lg relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Financial Status</h3>
                
                {isBudgetWarning && (
                  <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-450 text-xs rounded-xl flex items-start space-x-2 font-semibold">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">CRITICAL BUDGET LIMIT REACHED</strong>
                      <span className="block text-slate-500 mt-0.5">Site expenditures have consumed {budgetUtilization.toFixed(1)}% of total capital resources.</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-655 uppercase">Capital Budget</span>
                    <span className="block font-black text-white text-base">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-655 uppercase">Logged Expenses</span>
                    <span className="block font-black text-white text-base">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-655 uppercase">Balance Funds</span>
                    <span className="block font-black text-white text-base">{formatCurrency(project.budget - totalSpent)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Capital Utilization</span>
                    <span className="text-slate-200">{budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#0a0f1d]/60 rounded-full h-1.5 overflow-hidden border border-white/[0.02]">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isBudgetWarning ? 'bg-rose-500' : 'bg-gradient-to-r from-[#7c3aed] to-[#00d2ff]'
                      }`}
                      style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress and Timeline */}
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-550 uppercase tracking-widest">Site Progress Timeline</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress Meter</span>
                    <span className="text-[#00d2ff]">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#0a0f1d]/60 rounded-full h-1.5 overflow-hidden border border-white/[0.02]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#00d2ff]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 pt-3 border-t border-white/10">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-655 shrink-0" />
                    <span>Commenced: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-655 shrink-0" />
                    <span>Est. Handover: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager and Client cards (1 Col wide) */}
            <div className="space-y-6">
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <h3 className="text-xs font-black text-slate-550 uppercase tracking-widest">Key Personnel</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 bg-[#7c3aed]/10 border border-[#7c3aed]/22 rounded-xl flex items-center justify-center font-black text-[#a78bfa] shrink-0 text-xs">
                      PM
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Project Manager</span>
                      <span className="block font-bold text-white text-sm">{project.manager?.name || 'Unassigned'}</span>
                      <span className="block text-[10px] text-slate-500">{project.manager?.email || ''}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-3.5 border-t border-white/10">
                    <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/22 rounded-xl flex items-center justify-center font-black text-emerald-400 shrink-0 text-xs">
                      CL
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Building Owner / Client</span>
                      <span className="block font-bold text-white text-sm">{project.client?.name || 'Unassigned'}</span>
                      <span className="block text-[10px] text-slate-500">{project.client?.email || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {project.description && (
                <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-2 shadow-lg relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                  <h3 className="text-xs font-black text-slate-550 uppercase tracking-widest mb-2">Scope of Works</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">{project.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestones Tab (Page 19) */}
        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Milestones Checklist (2 Cols wide) */}
            <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-black text-sm text-white">Project Milestone Deliverables</h3>
              
              <div className="space-y-3 pt-2">
                {project.milestones?.map((milestone: any) => (
                  <div 
                    key={milestone.id} 
                    className="flex justify-between items-center bg-[#0a0f1d]/60 border border-white/10 p-4 rounded-xl hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                        milestone.completed 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/22' 
                          : 'bg-white/[0.03] text-slate-550 border border-white/10'
                      }`}>
                        {milestone.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-200 text-sm">{milestone.name}</span>
                        {milestone.description && (
                          <span className="block text-slate-500 text-[11px] mt-1">{milestone.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="block text-slate-400 font-semibold flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-655" />
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {project.milestones?.length === 0 && (
                  <p className="text-center text-slate-600 text-xs py-8">No milestones registered for this site contract.</p>
                )}
              </div>
            </div>

            {/* Add Milestone Form (1 Col wide) */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-black text-sm text-white border-b border-white/10 pb-3 mb-4">Add Site Milestone</h3>
              
              <form onSubmit={handleAddMilestone} className="space-y-4 flex-1">
                {mError && (
                  <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-450 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{mError}</span>
                  </div>
                )}
                {mSuccess && (
                  <div className="p-3.5 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{mSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Milestone Name *</label>
                  <input
                    type="text"
                    required
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="e.g. Roof Slab Completed"
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none transition-all duration-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Est. Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={mDueDate}
                    onChange={(e) => setMDueDate(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Scope description</label>
                  <textarea
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    placeholder="Optional details..."
                    rows={3}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none transition-all duration-200 resize-none font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMilestoneMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createMilestoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Milestone
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Workforce Tab (Page 18) */}
        {activeTab === 'workforce' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Workforce list (2 Cols wide) */}
            <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-lg backdrop-blur-xl">
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.005] flex justify-between items-center">
                <h3 className="font-black text-sm text-slate-350">Assigned Site Members</h3>
                <span className="text-[9px] bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/22 px-2.5 py-0.5 rounded-full font-black uppercase">
                  {project.members?.length || 0} members
                </span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-white/10">
                      <th className="py-4 px-6">STAFF NAME</th>
                      <th className="py-4 px-4">SECURITY ROLE</th>
                      <th className="py-4 px-4">PROJECT ROLE</th>
                      <th className="py-4 px-4">JOINED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs">
                    {project.members?.map((member: any) => (
                      <tr key={member.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-4 px-6 font-bold text-white text-sm">{member.user?.name}</td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded bg-[#0a0f1d]/60 border border-white/10 text-slate-400 uppercase">
                            {member.user?.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-200">{member.role || 'Site Worker'}</td>
                        <td className="py-4 px-4 font-semibold text-slate-600">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {project.members?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-600">No members assigned to this site project.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Member Assign Form (1 Col wide) */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-black text-sm text-white border-b border-white/10 pb-3 mb-4">Assign Staff member</h3>
              
              <form onSubmit={handleAddMember} className="space-y-4 flex-1">
                {memError && (
                  <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{memError}</span>
                  </div>
                )}
                {memSuccess && (
                  <div className="p-3.5 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{memSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select User *</label>
                  <select
                    value={memUserId}
                    onChange={(e) => setMemUserId(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold"
                  >
                    <option value="">Choose User...</option>
                    {allUsers?.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Role (Scaffolding/Foreman/Engineer)</label>
                  <input
                    type="text"
                    value={memRole}
                    onChange={(e) => setMemRole(e.target.value)}
                    placeholder="e.g. Site Engineer"
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none transition-all duration-200 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMemberMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Assign Member
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Expenses Tab (Page 20) */}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cost Ledger table (2 Cols wide) */}
            <div className="lg:col-span-2 bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-lg backdrop-blur-xl">
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.005] flex justify-between items-center">
                <h3 className="font-black text-sm text-slate-350">Site Costing Audit Ledger</h3>
                <span className="text-[9px] bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/22 px-2.5 py-0.5 rounded-full font-black uppercase">
                  {project.expenses?.length || 0} bills logged
                </span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-white/10">
                      <th className="py-4 px-6">EXPENSE SCOPE</th>
                      <th className="py-4 px-4">CATEGORY</th>
                      <th className="py-4 px-4">DATE LOGGED</th>
                      <th className="py-4 px-6 text-right">SETTLED VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs">
                    {project.expenses?.map((expense: any) => (
                      <tr key={expense.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-4 px-6 font-bold text-white text-sm">{expense.description || 'General costs'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded uppercase border ${
                            expense.category === 'LABOUR' ? 'bg-[#7c3aed]/10 text-[#a78bfa] border-[#7c3aed]/22' :
                            expense.category === 'MATERIAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' :
                            expense.category === 'EQUIPMENT' ? 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/22' :
                            'bg-slate-500/10 text-slate-400 border-slate-550/22'
                          }`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-white text-sm tabular-nums">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                    {project.expenses?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-600">No expense reports recorded on this project.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense entry form (1 Col wide) */}
            <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <h3 className="font-black text-sm text-white border-b border-white/10 pb-3 mb-4">Record Site Expense</h3>
              
              <form onSubmit={handleAddExpense} className="space-y-4 flex-1">
                {expError && (
                  <div className="p-3.5 bg-rose-500/8 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{expError}</span>
                  </div>
                )}
                {expSuccess && (
                  <div className="p-3.5 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{expSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Settled Amount (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none transition-all duration-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Billing Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none transition-all duration-200 font-semibold"
                  >
                    <option value="MATERIAL">Materials Acquisition</option>
                    <option value="LABOUR">Labor payroll/wagering</option>
                    <option value="EQUIPMENT">Machinery rental</option>
                    <option value="OTHER">Other scopes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Log Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Auditing description</label>
                  <textarea
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Steel rebar purchase invoice #8382"
                    rows={3}
                    className="w-full bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 resize-none font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#00d2ff] hover:from-[#8b5cf6] hover:via-[#4f46e5] hover:to-[#00f0ff] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createExpenseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Record Expense
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isPaymentsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin" />
                  <div className="absolute inset-0 rounded-full blur-xl bg-[#7c3aed]/20 animate-pulse" />
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Retrieving payment statement...</p>
              </div>
            ) : !payments || payments.length === 0 ? (
              <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] to-transparent" />
                <p className="text-slate-500 text-sm">No payment milestones registered for this project contract.</p>
              </div>
            ) : (() => {
              const contractValue = payments?.[0]?.contractValue || project.budget || 0
              const totalPaid = payments?.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + p.amount, 0) || 0
              const totalDue = payments?.filter((p: any) => p.status === 'DUE').reduce((sum: number, p: any) => sum + p.amount, 0) || 0
              const totalPending = payments?.filter((p: any) => p.status === 'PENDING').reduce((sum: number, p: any) => sum + p.amount, 0) || 0
              const realizedPercent = contractValue > 0 ? (totalPaid / contractValue) * 100 : 0
              const canManagePayments = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

              const getPercentageLabel = (pct: string) => {
                switch (pct) {
                  case 'FOUNDATION_25': return 'Foundation Complete (25%)'
                  case 'STRUCTURE_35': return 'Structure Complete (35%)'
                  case 'ROOFING_25': return 'Roofing Complete (25%)'
                  case 'HANDOVER_15': return 'Final Handover (15%)'
                  default: return pct
                }
              }

              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-500 to-transparent" />
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Contract Value</span>
                      <span className="block font-black text-white text-xl leading-none mt-1">{formatCurrency(contractValue)}</span>
                    </div>
                    <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
                      <span className="block text-[10px] font-black text-emerald-450 uppercase tracking-wider">Realized (Paid)</span>
                      <span className="block font-black text-emerald-400 text-xl leading-none mt-1">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent" />
                      <span className="block text-[10px] font-black text-amber-455 uppercase tracking-wider">Requested (Due)</span>
                      <span className="block font-black text-amber-400 text-xl leading-none mt-1">{formatCurrency(totalDue)}</span>
                    </div>
                    <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-lg backdrop-blur-xl">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-700 to-transparent" />
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Unreleased (Pending)</span>
                      <span className="block font-black text-slate-350 text-xl leading-none mt-1">{formatCurrency(totalPending)}</span>
                    </div>
                  </div>

                  {/* Realization Progress */}
                  <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 space-y-3 shadow-lg relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-550 uppercase tracking-wider text-[10px]">Contract Capital Realization Meter</span>
                      <span className="text-emerald-400">{realizedPercent.toFixed(1)}% Realized</span>
                    </div>
                    <div className="w-full bg-[#0a0f1d]/60 rounded-full h-1.5 overflow-hidden border border-white/[0.02]">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-emerald-500"
                        style={{ width: `${realizedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Payment Milestones List */}
                  <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.005] flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-sm text-white">Milestone Statement Billing Schedule</h3>
                        <p className="text-[10px] text-slate-650 mt-0.5 font-bold uppercase tracking-wider">Schedule of payment releases</p>
                      </div>
                      {user?.role === 'CLIENT' && (
                        <span className="text-[9px] bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Statement of Account
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] text-slate-600 font-black tracking-widest uppercase bg-white/[0.002] border-b border-white/10">
                            <th className="py-4 px-6">BILLING MILESTONE</th>
                            <th className="py-4 px-4 text-right">AMOUNT</th>
                            <th className="py-4 px-4">STATUS</th>
                            <th className="py-4 px-4">DUE DATE</th>
                            <th className="py-4 px-4">RECEIPT DATE</th>
                            {canManagePayments && <th className="py-4 px-6 text-right">ACTIONS</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-xs">
                          {payments.map((payment: any) => {
                            const isPendingMutation = updatePaymentStatusMutation.isPending && updatePaymentStatusMutation.variables?.paymentId === payment.id
                            return (
                              <tr key={payment.id} className="hover:bg-white/[0.015] transition-colors">
                                <td className="py-4 px-6 font-bold text-white text-sm">
                                  {getPercentageLabel(payment.percentage)}
                                </td>
                                <td className="py-4 px-4 text-right font-black text-white text-sm tabular-nums">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase border ${
                                    payment.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22' :
                                    payment.status === 'DUE' ? 'bg-amber-500/10 text-amber-450 border-amber-500/22' :
                                    'bg-slate-500/10 text-slate-400 border-slate-550/22'
                                  }`}>
                                    {payment.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1 shrink-0" />}
                                    {payment.status === 'DUE' && <AlertCircle className="h-3 w-3 mr-1 shrink-0" />}
                                    {payment.status === 'PENDING' && <Clock className="h-3 w-3 mr-1 shrink-0" />}
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-semibold text-slate-550">
                                  {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'Pending completion'}
                                </td>
                                <td className="py-4 px-4 font-semibold text-slate-600">
                                  {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                                </td>
                                {canManagePayments && (
                                  <td className="py-4 px-6 text-right">
                                    {payment.status === 'PENDING' && (
                                      <button
                                        onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: 'DUE' })}
                                        disabled={updatePaymentStatusMutation.isPending}
                                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[10px] rounded-lg uppercase tracking-wider transition-all duration-150 shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                                      >
                                        {isPendingMutation && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                                        Request Payment
                                      </button>
                                    )}
                                    {payment.status === 'DUE' && (
                                      <button
                                        onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: 'PAID' })}
                                        disabled={updatePaymentStatusMutation.isPending}
                                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-[10px] rounded-lg uppercase tracking-wider transition-all duration-150 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                                      >
                                        {isPendingMutation && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                                        Mark as Paid
                                      </button>
                                    )}
                                    {payment.status === 'PAID' && (
                                      <span className="text-[10px] font-bold text-slate-650 uppercase tracking-widest mr-2">
                                        Settled
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ProjectDetailsPage
