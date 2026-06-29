import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Building, 
  Settings, 
  Database, 
  ShieldAlert, 
  ListChecks, 
  ChevronRight,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'

import { toast } from '../utils/toast'

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Enforce ADMIN role check
  if (user?.role !== 'ADMIN') {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-6 max-w-lg mx-auto text-center mt-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500" />
          <AlertTriangle className="h-10 w-10 text-rose-455 mx-auto mb-3 animate-bounce" />
          <h2 className="text-lg font-black text-rose-455 mb-2 uppercase tracking-widest">Access Denied</h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Only administrators are authorized to access corporate settings panels.
          </p>
        </div>
      </SidebarLayout>
    )
  }

  const settingsItems = [
    {
      name: 'Company Profile settings',
      description: 'Configure corporate address, email, telephone, VAT registration numbers, default currencies, and active working days.',
      path: '/settings/company',
      icon: Building,
      color: 'hover:border-violet-500/40 text-violet-400'
    },
    {
      name: 'Dynamic Categories Manager',
      description: 'Manage dropdown options globally: Item Types, units of measurement, equipment brands, stock categories, and cost buckets.',
      path: '/settings/categories',
      icon: ListChecks,
      color: 'hover:border-emerald-500/40 text-emerald-400'
    },
    {
      name: 'Role Permissions Matrix',
      description: 'Allocate module view, write, and delete permissions settings across User roles (Project Managers, Supervisors, Clients).',
      path: '/settings/roles',
      icon: ShieldAlert,
      color: 'hover:border-blue-500/40 text-blue-400'
    }
  ]

  const handleBackup = () => {
    toast.success('Database Backup Simulated! Generating constructpro_backup_postgres.sql file... (Done)')
  }


  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest mb-3 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Administration
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">System Settings Panel</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Maintain corporate profiles, configure measurement registries, configure roles permissions, and trigger database backups.
          </p>
        </div>

        {/* Settings Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settingsItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-white/20 flex flex-col justify-between h-44 group relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] text-inherit border border-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-[#00d2ff] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-normal line-clamp-2 font-semibold">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Database Backup Card */}
        <div className="bg-[#0d1322]/70 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base flex items-center">
              <Database className="h-5 w-5 mr-2 text-[#00d2ff]" /> Database Backup & Safety
            </h3>
            <p className="text-slate-400 text-xs max-w-lg leading-normal font-semibold">
              Download a complete SQL dump of your PostgreSQL schemas, project lists, finance logs, and worker registries.
            </p>
          </div>
          <button
            onClick={handleBackup}
            className="inline-flex items-center px-4 py-2.5 bg-[#0a0f1d]/60 hover:bg-white/[0.04] text-[#00d2ff] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            <Database className="h-4 w-4 mr-2" /> Backup Database
          </button>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default SettingsPage
