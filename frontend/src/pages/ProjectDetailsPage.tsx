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
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <p className="text-zinc-400 font-medium">Gathering site logs...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !project) {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center">
          <p className="text-rose-400 font-bold mb-2">Error loading project details</p>
          <p className="text-zinc-400 text-sm mb-4">
            {(error as any)?.response?.data?.error || 'Project not found.'}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors animate-in"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black text-white">{project.name}</h1>
                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded uppercase ${
                  project.status === 'ONGOING' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' :
                  project.status === 'COMPLETED' ? 'bg-green-500/15 text-green-400 border border-green-500/25' :
                  project.status === 'OVERDUE' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' :
                  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-1 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-zinc-550" /> {project.location}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            className="px-4 py-2 border border-zinc-800 hover:bg-[#1c1d26] text-zinc-350 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Configure Site
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1.5 bg-[#14161f] border border-zinc-800 p-1 rounded-lg w-fit">
          {(['overview', 'milestones', 'workforce', 'expenses', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-violet-600 text-white shadow shadow-violet-600/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
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
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-5">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Financial Status</h3>
                
                {isBudgetWarning && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">CRITICAL BUDGET LIMIT REACHED</strong>
                      <span className="block text-zinc-400 mt-0.5">Site expenditures have consumed {budgetUtilization.toFixed(1)}% of total capital resources.</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase">Capital Budget</span>
                    <span className="block font-extrabold text-white text-base">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase">Logged Expenses</span>
                    <span className="block font-extrabold text-white text-base">{formatCurrency(totalSpent)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-zinc-550 uppercase">Balance Funds</span>
                    <span className="block font-extrabold text-white text-base">{formatCurrency(project.budget - totalSpent)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-850">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">Capital Utilization</span>
                    <span className="text-zinc-350">{budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isBudgetWarning ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Progress and Timeline */}
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Site Progress Timeline</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">Progress Meter</span>
                    <span className="text-violet-400">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-400 pt-2 border-t border-zinc-850">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-zinc-550" />
                    <span>Commenced: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-zinc-550" />
                    <span>Est. Handover: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager and Client cards (1 Col wide) */}
            <div className="space-y-6">
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Key Personnel</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 bg-violet-600/10 border border-violet-500/20 rounded-lg flex items-center justify-center font-bold text-violet-400 shrink-0">
                      PM
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-500 uppercase">Project Manager</span>
                      <span className="block font-bold text-white text-sm">{project.manager?.name || 'Unassigned'}</span>
                      <span className="block text-[10px] text-zinc-500">{project.manager?.email || ''}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-3.5 border-t border-zinc-850">
                    <div className="w-9 h-9 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center justify-center font-bold text-blue-400 shrink-0">
                      CL
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-500 uppercase">Building Owner / Client</span>
                      <span className="block font-bold text-white text-sm">{project.client?.name || 'Unassigned'}</span>
                      <span className="block text-[10px] text-zinc-500">{project.client?.email || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {project.description && (
                <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-2">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-2">Scope of Works</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">{project.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestones Tab (Page 19) */}
        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Milestones Checklist (2 Cols wide) */}
            <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-base text-white">Project Milestone Deliverables</h3>
              
              <div className="space-y-3 pt-2">
                {project.milestones?.map((milestone: any) => (
                  <div 
                    key={milestone.id} 
                    className="flex justify-between items-center bg-[#181a24] border border-zinc-850 p-4 rounded-lg hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded mt-0.5 shrink-0 ${
                        milestone.completed 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}>
                        {milestone.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="block font-bold text-zinc-200 text-sm">{milestone.name}</span>
                        {milestone.description && (
                          <span className="block text-zinc-500 text-[11px] mt-0.5">{milestone.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="block text-zinc-400 font-semibold flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-zinc-550" />
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {project.milestones?.length === 0 && (
                  <p className="text-center text-zinc-500 text-xs py-8">No milestones registered for this site contract.</p>
                )}
              </div>
            </div>

            {/* Add Milestone Form (1 Col wide) */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
              <h3 className="font-bold text-base text-white border-b border-zinc-805 pb-3 mb-4">Add Site Milestone</h3>
              
              <form onSubmit={handleAddMilestone} className="space-y-4 flex-1">
                {mError && <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded">{mError}</div>}
                {mSuccess && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded">{mSuccess}</div>}

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Milestone Name *</label>
                  <input
                    type="text"
                    required
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="e.g. Roof Slab Completed"
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Est. Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={mDueDate}
                    onChange={(e) => setMDueDate(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Scope description</label>
                  <textarea
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    placeholder="Optional details..."
                    rows={3}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMilestoneMutation.isPending}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {createMilestoneMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
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
            <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
                <h3 className="font-bold text-sm text-zinc-350">Assigned Site Members</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold uppercase">
                  {project.members?.length || 0} members
                </span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                      <th className="py-4 px-6">STAFF NAME</th>
                      <th className="py-4 px-4">SECURITY ROLE</th>
                      <th className="py-4 px-4">PROJECT ROLE</th>
                      <th className="py-4 px-4">JOINED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {project.members?.map((member: any) => (
                      <tr key={member.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white text-sm">{member.user?.name}</td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded bg-zinc-800 text-zinc-400 uppercase">
                            {member.user?.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-zinc-200">{member.role || 'Site Worker'}</td>
                        <td className="py-4 px-4 font-semibold text-zinc-500">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {project.members?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-500">No members assigned to this site project.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Member Assign Form (1 Col wide) */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
              <h3 className="font-bold text-base text-white border-b border-zinc-805 pb-3 mb-4">Assign Staff member</h3>
              
              <form onSubmit={handleAddMember} className="space-y-4 flex-1">
                {memError && <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded">{memError}</div>}
                {memSuccess && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded">{memSuccess}</div>}

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Select User *</label>
                  <select
                    value={memUserId}
                    onChange={(e) => setMemUserId(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 bg-none"
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
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Project Role (Scaffolding/Foreman/Engineer)</label>
                  <input
                    type="text"
                    value={memRole}
                    onChange={(e) => setMemRole(e.target.value)}
                    placeholder="e.g. Site Engineer"
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMemberMutation.isPending}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {createMemberMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
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
            <div className="lg:col-span-2 bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
                <h3 className="font-bold text-sm text-zinc-350">Site Costing Audit Ledger</h3>
                <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded font-bold uppercase">
                  {project.expenses?.length || 0} bills logged
                </span>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                      <th className="py-4 px-6">EXPENSE SCOPE</th>
                      <th className="py-4 px-4">CATEGORY</th>
                      <th className="py-4 px-4">DATE LOGGED</th>
                      <th className="py-4 px-6 text-right">SETTLED VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {project.expenses?.map((expense: any) => (
                      <tr key={expense.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white text-sm">{expense.description || 'General costs'}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                            expense.category === 'LABOUR' ? 'bg-violet-500/10 text-violet-400' :
                            expense.category === 'MATERIAL' ? 'bg-emerald-500/10 text-emerald-400' :
                            expense.category === 'EQUIPMENT' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-white text-sm">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                    {project.expenses?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-500">No expense reports recorded on this project.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense entry form (1 Col wide) */}
            <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
              <h3 className="font-bold text-base text-white border-b border-zinc-850 pb-3 mb-4">Record Site Expense</h3>
              
              <form onSubmit={handleAddExpense} className="space-y-4 flex-1">
                {expError && <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded">{expError}</div>}
                {expSuccess && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded">{expSuccess}</div>}

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Settled Amount (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Billing Category *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-violet-600 bg-none"
                  >
                    <option value="MATERIAL">Materials Acquisition</option>
                    <option value="LABOUR">Labor payroll/wagering</option>
                    <option value="EQUIPMENT">Machinery rental</option>
                    <option value="OTHER">Other scopes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Log Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Auditing description</label>
                  <textarea
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Steel rebar purchase invoice #8382"
                    rows={3}
                    className="w-full bg-[#1b1c25] border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-violet-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {createExpenseMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
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
                <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                <p className="text-zinc-400 text-xs font-semibold">Retrieving payment statement...</p>
              </div>
            ) : !payments || payments.length === 0 ? (
              <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-8 text-center">
                <p className="text-zinc-500 text-sm">No payment milestones registered for this project contract.</p>
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
                    <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contract Value</span>
                      <span className="block font-black text-white text-xl">{formatCurrency(contractValue)}</span>
                    </div>
                    <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                      <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Realized (Paid)</span>
                      <span className="block font-black text-emerald-400 text-xl">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                      <span className="block text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Requested (Due)</span>
                      <span className="block font-black text-yellow-400 text-xl">{formatCurrency(totalDue)}</span>
                    </div>
                    <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-5 space-y-2">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unreleased (Pending)</span>
                      <span className="block font-black text-zinc-400 text-xl">{formatCurrency(totalPending)}</span>
                    </div>
                  </div>

                  {/* Realization Progress */}
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-400">Contract Capital Realization Meter</span>
                      <span className="text-emerald-400">{realizedPercent.toFixed(1)}% Realized</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${realizedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment Milestones List */}
                  <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-[#171924]/30 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-zinc-350">Milestone Statement Billing Schedule</h3>
                      {user?.role === 'CLIENT' && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold uppercase">
                          Statement of Account
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] text-zinc-400 font-black tracking-widest uppercase bg-[#181a24]/50 border-b border-zinc-800">
                            <th className="py-4 px-6">BILLING MILESTONE</th>
                            <th className="py-4 px-4 text-right">AMOUNT</th>
                            <th className="py-4 px-4">STATUS</th>
                            <th className="py-4 px-4">DUE DATE</th>
                            <th className="py-4 px-4">RECEIPT DATE</th>
                            {canManagePayments && <th className="py-4 px-6 text-right">ACTIONS</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-xs">
                          {payments.map((payment: any) => {
                            const isPendingMutation = updatePaymentStatusMutation.isPending && updatePaymentStatusMutation.variables?.paymentId === payment.id
                            return (
                              <tr key={payment.id} className="hover:bg-[#1a1c27]/30 transition-colors">
                                <td className="py-4 px-6 font-bold text-white text-sm">
                                  {getPercentageLabel(payment.percentage)}
                                </td>
                                <td className="py-4 px-4 text-right font-black text-white text-sm">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-extrabold rounded uppercase border ${
                                    payment.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    payment.status === 'DUE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-zinc-800/50 text-zinc-450 border-zinc-700/50'
                                  }`}>
                                    {payment.status === 'PAID' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {payment.status === 'DUE' && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {payment.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-semibold text-zinc-450">
                                  {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'Pending completion'}
                                </td>
                                <td className="py-4 px-4 font-semibold text-zinc-500">
                                  {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                                </td>
                                {canManagePayments && (
                                  <td className="py-4 px-6 text-right">
                                    {payment.status === 'PENDING' && (
                                      <button
                                        onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: 'DUE' })}
                                        disabled={updatePaymentStatusMutation.isPending}
                                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black font-extrabold text-[10px] rounded uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center"
                                      >
                                        {isPendingMutation && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                        Request Payment
                                      </button>
                                    )}
                                    {payment.status === 'DUE' && (
                                      <button
                                        onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: 'PAID' })}
                                        disabled={updatePaymentStatusMutation.isPending}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center"
                                      >
                                        {isPendingMutation && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                        Mark as Paid
                                      </button>
                                    )}
                                    {payment.status === 'PAID' && (
                                      <span className="text-[10px] font-bold text-zinc-555 uppercase tracking-widest">
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
