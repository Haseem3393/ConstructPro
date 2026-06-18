import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  Building2, 
  LayoutDashboard, 
  FolderKanban, 
  CalendarCheck, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronDown, 
  User as UserIcon,
  Users,
  DollarSign,
  Archive,
  History,
  ClipboardList,
  ArrowRightLeft,
  Truck,
  Wrench,
  Receipt,
  CreditCard
} from 'lucide-react'


interface SidebarLayoutProps {
  children: React.ReactNode
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const menuItems = [
    {
      name: 'Admin Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN'],
    },
    {
      name: 'Portfolio Overview',
      path: '/dashboard/portfolio',
      icon: FolderKanban,
      roles: ['ADMIN'],
    },
    {
      name: 'Financials Dashboard',
      path: '/dashboard/financials',
      icon: DollarSign,
      roles: ['ADMIN'],
    },
    {
      name: 'Workforce Hub',
      path: '/dashboard/workforce',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Users Registry',
      path: '/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Workers Registry',
      path: '/workers',
      icon: Users,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Projects Module',
      path: '/projects',
      icon: FolderKanban,
      roles: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      name: 'Daily Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Attendance History',
      path: '/attendance/history',
      icon: History,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Attendance Summary',
      path: '/attendance/summary',
      icon: FileText,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Weekly Timesheets',
      path: '/timesheets',
      icon: ClipboardList,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Inventory Dashboard',
      path: '/inventory',
      icon: Archive,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Materials Registry',
      path: '/materials',
      icon: ClipboardList,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Opening Stock',
      path: '/inventory/opening-stock',
      icon: History,
      roles: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      name: 'Purchase Orders',
      path: '/inventory/purchases',
      icon: Truck,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Stock Consumptions',
      path: '/inventory/usage',
      icon: FileText,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Stock Transfers',
      path: '/inventory/transfers',
      icon: ArrowRightLeft,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Suppliers Registry',
      path: '/suppliers',
      icon: Users,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Machinery Registry',
      path: '/machinery',
      icon: Wrench,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Expenses Ledger',
      path: '/expenses',
      icon: Receipt,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Budget Tracker',
      path: '/budget',
      icon: DollarSign,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Accounts Payable',
      path: '/payables',
      icon: ArrowRightLeft,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },
    {
      name: 'Cheques Register',
      path: '/cheques',
      icon: CreditCard,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR'],
    },


    {
      name: 'Reports & Analytics',
      path: '/reports',
      icon: FileText,
      roles: ['ADMIN', 'PROJECT_MANAGER'],
    },
    {
      name: 'Client Portal',
      path: '/portal',
      icon: FileText,
      roles: ['CLIENT'],
    },
  ]

  const allowedMenuItems = menuItems.filter(item => user && item.roles.includes(user.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#14161f] border-r border-zinc-800 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 space-x-3">
          <div className="p-2 bg-violet-600 rounded-lg text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white">ConstructPro</span>
            <span className="block text-[10px] text-violet-400 font-semibold tracking-widest uppercase">Munaf & Sons</span>
          </div>
        </div>

        {/* User Status Card */}
        <div className="p-4 mx-4 my-6 bg-[#1a1c24] rounded-lg border border-zinc-800/80">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#14161f]"></span>
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-sm text-zinc-100 truncate">{user?.name}</span>
              <span className="block text-[10px] font-semibold text-violet-400 tracking-wider uppercase">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Navigation Section Label */}
        <div className="px-6 mb-2">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Modules</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1">
          {allowedMenuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1c24]'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <aside className="w-[280px] bg-[#14161f] border-r border-zinc-800 flex flex-col p-4 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-850">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-violet-600 rounded-lg text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-wider text-white block">ConstructPro</span>
                  <span className="block text-[9px] text-violet-400 font-semibold uppercase tracking-wider">Munaf & Sons</span>
                </div>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {allowedMenuItems.map((item) => {
                const IconComponent = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1c24]'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border-t border-zinc-800 pt-4"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navbar */}
        <header className="h-16 bg-[#14161f] border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search */}
            <div className="hidden sm:flex items-center relative w-64">
              <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search module / records... (⌘K)"
                className="w-full bg-[#1c1d26] border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#1c1d26] rounded-lg relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2.5 p-1.5 hover:bg-[#1c1d26] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-violet-600/25 border border-violet-500/35 flex items-center justify-center font-bold text-violet-400 text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-zinc-200">{user?.name}</span>
                  <span className="block text-[9px] text-zinc-500 uppercase">{user?.role}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#14161f] border border-zinc-800 rounded-lg shadow-xl py-1 z-30">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <span className="block text-xs font-bold text-zinc-300">{user?.name}</span>
                    <span className="block text-[10px] text-zinc-500 truncate">{user?.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-[#1c1d26] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SidebarLayout
