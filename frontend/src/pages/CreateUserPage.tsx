import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateUser } from '../hooks/useUsers'
import { useProjects } from '../hooks/useProjects'
import SidebarLayout from '../components/SidebarLayout'
import { ArrowLeft, Loader2, Save, Key } from 'lucide-react'

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const createUserMutation = useCreateUser()
  const { data: projects, isLoading: isProjectsLoading } = useProjects()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR' | 'CLIENT'>('PROJECT_MANAGER')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [autoGenPassword, setAutoGenPassword] = useState(false)
  const [assignedProject, setAssignedProject] = useState('')
  const [formError, setFormError] = useState('')

  // Auto generate password handler
  useEffect(() => {
    if (autoGenPassword) {
      const generated = Math.random().toString(36).substring(2, 10).toUpperCase()
      setPassword(generated)
    }
  }, [autoGenPassword])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name || !email || !password || !role) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      await createUserMutation.mutateAsync({
        name,
        email,
        role,
        phone,
        password,
      })
      navigate('/users')
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to create user. Verify email uniqueness.')
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/users"
            className="p-2 bg-[#14161f] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Register User</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure credentials and initial contact metadata</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. john@munafcons.lk"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Security Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-blue-600 bg-none"
                >
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SUPERVISOR">Site Supervisor</option>
                  <option value="CLIENT">Client / Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. +94771234567"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-zinc-800/80 pt-5 mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Initial Password *
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenPassword}
                    onChange={(e) => setAutoGenPassword(e.target.checked)}
                    className="rounded bg-[#1b1c25] border-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Auto-generate password</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={autoGenPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                  placeholder="Enter initial password"
                />
                {autoGenPassword && (
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* Optional Project Assignment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Assign to Initial Project (Optional)
              </label>
              {isProjectsLoading ? (
                <div className="text-xs text-zinc-550 flex items-center h-10">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" /> Loading sites...
                </div>
              ) : (
                <select
                  value={assignedProject}
                  onChange={(e) => setAssignedProject(e.target.value)}
                  className="w-full bg-[#1b1c25] border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-350 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Do Not Assign</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.location})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 border-t border-zinc-800 pt-5 mt-6">
              <Link
                to="/users"
                className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CreateUserPage
