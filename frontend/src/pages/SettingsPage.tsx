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
  AlertTriangle
} from 'lucide-react'

import { toast } from '../utils/toast'

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Enforce ADMIN role check
  if (user?.role !== 'ADMIN') {
    return (
      <SidebarLayout>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-6 max-w-lg mx-auto text-center mt-12">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm">
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
      color: 'border-violet-500/20 hover:border-violet-500/30 text-violet-400'
    },
    {
      name: 'Dynamic Categories Manager',
      description: 'Manage dropdown options globally: Item Types, units of measurement, equipment brands, stock categories, and cost buckets.',
      path: '/settings/categories',
      icon: ListChecks,
      color: 'border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400'
    },
    {
      name: 'Role Permissions Matrix',
      description: 'Allocate module view, write, and delete permissions settings across User roles (Project Managers, Supervisors, Clients).',
      path: '/settings/roles',
      icon: ShieldAlert,
      color: 'border-blue-500/20 hover:border-blue-500/30 text-blue-400'
    }
  ]

  const handleBackup = () => {
    toast.success('Database Backup Simulated! Generating constructpro_backup_postgres.sql file... (Done)')
  }


  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-3xl font-black text-white">System Settings Panel</h1>
          <p className="text-zinc-400 text-xs mt-1">
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
                className={`bg-[#14161f] border ${item.color} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-44 group`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-lg bg-zinc-950/40 text-inherit border border-zinc-800/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-550 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-violet-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-zinc-450 text-[11px] mt-1.5 leading-normal line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Database Backup Card */}
        <div className="bg-[#14161f] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base flex items-center">
              <Database className="h-5 w-5 mr-2 text-violet-400" /> Database Backup & Safety
            </h3>
            <p className="text-zinc-450 text-xs max-w-lg leading-normal">
              Download a complete SQL dump of your PostgreSQL schemas, project lists, finance logs, and worker registries.
            </p>
          </div>
          <button
            onClick={handleBackup}
            className="inline-flex items-center px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Database className="h-4 w-4 mr-2" /> Backup Database
          </button>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default SettingsPage
