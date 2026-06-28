import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotifications } from '../hooks/useNotifications'
import {
  HardHat,
  LayoutDashboard,
  FolderKanban,
  FileText,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Users,
  Archive,
  Wrench,
  Receipt,
  Settings,
  Key,
} from 'lucide-react'

interface SidebarLayoutProps { children: React.ReactNode }
interface SubMenuItem { name: string; path: string; roles: string[] }
interface GroupedMenuItem {
  name: string; icon: any; roles: string[]
  subItems?: SubMenuItem[]; path?: string
  section: 'APPS' | 'REPORTS' | 'ADDITIONAL' | 'PORTAL'
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { data } = useNotifications()

  const groupedMenuItems: GroupedMenuItem[] = [
    {
      name: 'Dashboards', icon: LayoutDashboard, roles: ['ADMIN'], section: 'APPS',
      subItems: [
        { name: 'Admin Overview',     path: '/dashboard',            roles: ['ADMIN'] },
        { name: 'Portfolio Map',       path: '/dashboard/portfolio',  roles: ['ADMIN'] },
        { name: 'Financial Analytics', path: '/dashboard/financials', roles: ['ADMIN'] },
        { name: 'Workforce Hub',       path: '/dashboard/workforce',  roles: ['ADMIN'] },
      ],
    },
    {
      name: 'Projects & Sites', icon: FolderKanban,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR', 'CLIENT'], section: 'APPS',
      subItems: [
        { name: 'Active Projects',    path: '/projects',      roles: ['ADMIN', 'PROJECT_MANAGER'] },
        { name: 'Contracts Registry', path: '/contracts',     roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR', 'CLIENT'] },
        { name: 'Payment Milestones', path: '/payments',      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR', 'CLIENT'] },
        { name: 'Change Orders',      path: '/change-orders', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR', 'CLIENT'] },
      ],
    },
    {
      name: 'Workforce & Logs', icon: Users,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'], section: 'APPS',
      subItems: [
        { name: 'Users Registry',     path: '/users',              roles: ['ADMIN'] },
        { name: 'Workers Registry',   path: '/workers',            roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Daily Attendance',   path: '/attendance',         roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Attendance History', path: '/attendance/history', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Attendance Summary', path: '/attendance/summary', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Weekly Timesheets',  path: '/timesheets',         roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
      ],
    },
    {
      name: 'Inventory Module', icon: Archive,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'], section: 'APPS',
      subItems: [
        { name: 'Inventory Overview', path: '/inventory',               roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Materials Registry', path: '/materials',               roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Opening Stock',      path: '/inventory/opening-stock', roles: ['ADMIN', 'PROJECT_MANAGER'] },
        { name: 'Purchase Orders',    path: '/inventory/purchases',     roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Stock Consumptions', path: '/inventory/usage',         roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Stock Transfers',    path: '/inventory/transfers',     roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Suppliers Registry', path: '/suppliers',               roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
      ],
    },
    { name: 'Machinery Registry', icon: Wrench, path: '/machinery', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'], section: 'APPS' },
    {
      name: 'Finance & Expenses', icon: Receipt,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'], section: 'APPS',
      subItems: [
        { name: 'Expenses Ledger',  path: '/expenses', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Budget Tracker',   path: '/budget',   roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Accounts Payable', path: '/payables', roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
        { name: 'Cheques Register', path: '/cheques',  roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'] },
      ],
    },
    { name: 'Reports & Analytics', icon: FileText, path: '/reports', roles: ['ADMIN', 'PROJECT_MANAGER'], section: 'REPORTS' },
    {
      name: 'Administration', icon: Settings, roles: ['ADMIN'], section: 'ADDITIONAL',
      subItems: [
        { name: 'System Settings', path: '/settings',   roles: ['ADMIN'] },
        { name: 'Audit Logs',      path: '/audit-logs', roles: ['ADMIN'] },
      ],
    },
    { name: 'Client Portal', icon: FileText, path: '/portal', roles: ['CLIENT'], section: 'PORTAL' },
  ]

  const allowedGroupedItems = groupedMenuItems
    .map((g) => g.subItems ? { ...g, subItems: g.subItems.filter((s) => user && s.roles.includes(user.role)) } : g)
    .filter((g) => g.subItems ? g.subItems.length > 0 : user && g.roles.includes(user.role))

  const hasActiveSubItem = (g: GroupedMenuItem) =>
    g.subItems ? g.subItems.some((s) => location.pathname === s.path) : false

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    groupedMenuItems.forEach((g) => {
      if (g.subItems) init[g.name] = g.subItems.some((s) => location.pathname === s.path)
    })
    return init
  })

  const toggleGroup = (name: string) => setOpenGroups((p) => ({ ...p, [name]: !p[name] }))
  const handleLogout = () => { logout(); navigate('/login') }

  const renderSidebarItem = (item: GroupedMenuItem, isMobile = false) => {
    const Icon = item.icon

    if (item.subItems) {
      const isExpanded = openGroups[item.name]
      const isActive   = hasActiveSubItem(item)
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleGroup(item.name)}
            className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              isActive ? 'text-[#a78bfa] bg-[#7c3aed]/10' : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-[#7c3aed]/15 text-[#a78bfa]'
                  : 'bg-white/[0.05] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-350'
              }`}>
                <Icon className="h-[15px] w-[15px] shrink-0" />
              </div>
              <span>{item.name}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
              isExpanded ? 'rotate-0 text-slate-500' : '-rotate-90 text-slate-655'
            }`} />
          </button>

          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[600px] opacity-100 mt-0.5' : 'max-h-0 opacity-0'}`}>
            <div className="ml-[42px] border-l border-[#7c3aed]/20 pl-3 space-y-0.5 pb-1">
              {item.subItems.map((sub) => {
                const isSubActive = location.pathname === sub.path
                return (
                  <Link
                    key={sub.path} to={sub.path}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-155 ${
                      isSubActive
                        ? 'text-[#a78bfa] bg-[#7c3aed]/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                      isSubActive ? 'bg-[#a78bfa] shadow-[0_0_6px_rgba(167,139,250,0.75)]' : 'bg-slate-800'
                    }`} />
                    <span>{sub.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    const isActive = location.pathname === item.path
    return (
      <Link
        key={item.path} to={item.path!}
        onClick={() => isMobile && setIsMobileOpen(false)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
          isActive
            ? 'text-[#a78bfa] bg-[#7c3aed]/10 nav-active-indicator'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
        }`}
      >
        <div className={`p-1.5 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-[#7c3aed]/15 text-[#a78bfa]'
            : 'bg-white/[0.05] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-350'
        }`}>
          <Icon className="h-[15px] w-[15px] shrink-0" />
        </div>
        <span>{item.name}</span>
      </Link>
    )
  }

  const appsItems      = allowedGroupedItems.filter((i) => i.section === 'APPS')
  const reportsItems   = allowedGroupedItems.filter((i) => i.section === 'REPORTS')
  const additionalItems = allowedGroupedItems.filter((i) => i.section === 'ADDITIONAL')
  const portalItems    = allowedGroupedItems.filter((i) => i.section === 'PORTAL')

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-3 pt-2 pb-1">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.20em]">{label}</span>
    </div>
  )

  const renderNavMenuContent = (isMobile: boolean) => (
    <div className="space-y-4">
      {appsItems.length > 0 && (
        <div><SectionLabel label="Modules" /><div className="space-y-0.5">{appsItems.map((i) => renderSidebarItem(i, isMobile))}</div></div>
      )}
      {reportsItems.length > 0 && (
        <div><SectionLabel label="Analytics" /><div className="space-y-0.5">{reportsItems.map((i) => renderSidebarItem(i, isMobile))}</div></div>
      )}
      {additionalItems.length > 0 && (
        <div><SectionLabel label="System" /><div className="space-y-0.5">{additionalItems.map((i) => renderSidebarItem(i, isMobile))}</div></div>
      )}
      {portalItems.length > 0 && (
        <div><SectionLabel label="Portal" /><div className="space-y-0.5">{portalItems.map((i) => renderSidebarItem(i, isMobile))}</div></div>
      )}
    </div>
  )

  const BrandLogo = () => (
    <>
      <div className="relative shrink-0 p-2 bg-gradient-to-br from-[#7c3aed] to-[#6366f1] rounded-xl shadow-lg shadow-purple-500/25 text-white">
        <HardHat className="h-[18px] w-[18px]" />
      </div>
      <div className="relative">
        <span className="font-black text-[15px] tracking-tight text-white">ConstructPro</span>
        <span className="block text-[9px] text-[#00d2ff] font-bold tracking-[0.15em] uppercase mt-0.5">Munaf &amp; Sons</span>
      </div>
    </>
  )

  return (
    <div className="h-screen w-screen bg-[#060b14] text-slate-100 flex overflow-hidden relative">
      {/* Background decorative glowing spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7c3aed]/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00d2ff]/10 blur-[120px] pointer-events-none z-0" />

      {/* ════ SIDEBAR — Desktop ════ */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#0d1322]/80 border-r border-white/10 shrink-0 h-full overflow-hidden backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="relative h-16 flex items-center px-5 border-b border-white/10 gap-3 shrink-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/[0.04] to-transparent pointer-events-none" />
          <BrandLogo />
        </div>

        {/* User Card */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <div className="relative bg-gradient-to-br from-[#111d33]/50 to-[#0d1526]/50 border border-white/10 rounded-xl p-3 flex items-center gap-3 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7c3aed]/[0.06] rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#6366f1]/10 border border-[#7c3aed]/30 flex items-center justify-center font-black text-[#a78bfa] text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0d1322] shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            </div>
            <div className="overflow-hidden flex-1 relative">
              <span className="block font-bold text-[13px] text-white truncate">{user?.name}</span>
              <span className="block text-[10px] font-semibold text-[#00d2ff] tracking-wider uppercase mt-0.5">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">{renderNavMenuContent(false)}</nav>

        {/* Sign Out */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-rose-350 hover:bg-rose-500/[0.07] transition-all duration-200 cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-700 group-hover:bg-rose-500/15 group-hover:text-rose-400 transition-colors duration-200">
              <LogOut className="h-[15px] w-[15px]" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ════ SIDEBAR — Mobile ════ */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-[270px] bg-[#0d1322]/90 flex flex-col h-full overflow-hidden border-r border-white/10 backdrop-blur-xl">
            <div className="relative h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#00d2ff] to-transparent" />
              <div className="flex items-center gap-3"><BrandLogo /></div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg bg-white/[0.05] text-slate-500 hover:text-white transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">{renderNavMenuContent(true)}</nav>
            <div className="p-3 border-t border-white/10 shrink-0">
              <button onClick={handleLogout} className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-300 hover:bg-rose-500/[0.07] transition-all cursor-pointer">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-700 group-hover:bg-rose-500/15 group-hover:text-rose-400 transition-colors">
                  <LogOut className="h-[15px] w-[15px]" />
                </div>
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ════ MAIN CONTENT ════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Navbar */}
        <header className="h-14 bg-[#0d1322]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-1.5 text-slate-500 hover:text-slate-100 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-655 pointer-events-none" />
              <input
                type="text"
                placeholder="Search modules... (⌘K)"
                className="w-60 bg-[#0a0f1d]/60 border border-white/10 hover:border-white/20 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-400 focus:outline-none placeholder-slate-700 transition-all duration-200 font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] rounded-xl transition-colors">
              <Bell className="h-4 w-4" />
              {data?.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#7c3aed] text-white text-[8px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-purple-500/40">
                  {data.unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed]/20 to-[#6366f1]/10 border border-[#7c3aed]/30 flex items-center justify-center font-black text-[#a78bfa] text-xs">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-200 leading-tight">{user?.name}</span>
                  <span className="block text-[9px] text-[#00d2ff] uppercase tracking-wide leading-tight font-black">{user?.role?.replace('_', ' ')}</span>
                </div>
                <ChevronDown className={`h-3 w-3 text-slate-500 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0d1322]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/70 py-1.5 z-30 overflow-hidden modal-enter">
                  <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-br from-[#7c3aed]/[0.07] to-transparent flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#6366f1]/10 border border-[#7c3aed]/20 flex items-center justify-center font-black text-[#a78bfa] shrink-0">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <span className="block text-sm font-black text-white truncate">{user?.name}</span>
                      <span className="block text-[10px] text-slate-550 truncate mt-0.5">{user?.email}</span>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#7c3aed]/10 hover:text-[#a78bfa] transition-colors">
                      <UserIcon className="h-3.5 w-3.5 text-slate-500" /><span>My Profile</span>
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#7c3aed]/10 hover:text-[#a78bfa] transition-colors">
                        <Settings className="h-3.5 w-3.5 text-slate-500" /><span>System Settings</span>
                      </Link>
                    )}
                    <Link to="/profile/change-password" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#7c3aed]/10 hover:text-[#a78bfa] transition-colors">
                      <Key className="h-3.5 w-3.5 text-slate-500" /><span>Change Password</span>
                    </Link>
                  </div>
                  <div className="px-2 pb-1.5 pt-1 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold border border-rose-500/10 transition-all cursor-pointer">
                      <LogOut className="h-3.5 w-3.5" /><span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-5 md:p-7 overflow-y-auto dot-grid-bg relative">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SidebarLayout
