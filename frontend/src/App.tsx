import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from './lib/queryClient'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import AttendancePage from './pages/AttendancePage'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import AttendanceSummaryPage from './pages/AttendanceSummaryPage'
import TimesheetListPage from './pages/TimesheetListPage'
import TimesheetDetailsPage from './pages/TimesheetDetailsPage'
import ClientPortalPage from './pages/ClientPortalPage'
import UsersPage from './pages/UsersPage'
import CreateUserPage from './pages/CreateUserPage'
import UserDetailsPage from './pages/UserDetailsPage'
import UserPermissionsPage from './pages/UserPermissionsPage'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import PortfolioPage from './pages/PortfolioPage'
import FinancialsPage from './pages/FinancialsPage'
import WorkforcePage from './pages/WorkforcePage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ProjectEditPage from './pages/ProjectEditPage'
import WorkersPage from './pages/WorkersPage'
import CreateWorkerPage from './pages/CreateWorkerPage'
import WorkerDetailsPage from './pages/WorkerDetailsPage'
import WorkerEditPage from './pages/WorkerEditPage'
import MaterialsPage from './pages/MaterialsPage'
import MaterialsNewPage from './pages/MaterialsNewPage'
import MaterialDetailsPage from './pages/MaterialDetailsPage'
import MaterialStockPage from './pages/MaterialStockPage'
import InventoryOverviewPage from './pages/InventoryOverviewPage'
import OpeningStockPage from './pages/OpeningStockPage'
import PurchaseOrdersPage from './pages/PurchaseOrdersPage'
import CreatePurchaseOrderPage from './pages/CreatePurchaseOrderPage'
import StockUsageLogPage from './pages/StockUsageLogPage'
import StockTransfersPage from './pages/StockTransfersPage'
import SuppliersListPage from './pages/SuppliersListPage'
import CreateSupplierPage from './pages/CreateSupplierPage'
import SupplierDetailsPage from './pages/SupplierDetailsPage'
import ReportsPage from './pages/ReportsPage'
import MachineryListPage from './pages/MachineryListPage'
import CreateMachineryPage from './pages/CreateMachineryPage'
import MachineryDetailsPage from './pages/MachineryDetailsPage'
import MachineryUsageLogPage from './pages/MachineryUsageLogPage'
import MachineryMaintenanceLogPage from './pages/MachineryMaintenanceLogPage'
import ExpensesPage from './pages/ExpensesPage'
import CreateExpensePage from './pages/CreateExpensePage'
import BudgetOverviewPage from './pages/BudgetOverviewPage'
import BudgetDetailsPage from './pages/BudgetDetailsPage'
import PayablesPage from './pages/PayablesPage'
import CreatePayablePage from './pages/CreatePayablePage'
import ChequesPage from './pages/ChequesPage'
import CreateChequePage from './pages/CreateChequePage'



// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <Routes>
          {/* Public Recovery Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/portfolio"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/financials"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <FinancialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/workforce"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <WorkforcePage />
              </ProtectedRoute>
            }
          />

          {/* User Management (Admin Only) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/permissions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserPermissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Shared Profile Routes (All Authenticated Users) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Project Manager Routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR', 'CLIENT']}>
                <ProjectDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <ProjectEditPage />
              </ProtectedRoute>
            }
          />

          {/* Worker Management Routes */}
          <Route
            path="/workers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <WorkersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreateWorkerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <WorkerDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <WorkerEditPage />
              </ProtectedRoute>
            }
          />

          {/* Inventory & Materials Module Routes */}
          <Route
            path="/materials"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <MaterialsNewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MaterialDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/:id/stock"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MaterialStockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <InventoryOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/opening-stock"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <OpeningStockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchases"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/purchases/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <CreatePurchaseOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/usage"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <StockUsageLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/transfers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <StockTransfersPage />
              </ProtectedRoute>
            }
          />

          {/* Suppliers Routes */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <SuppliersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreateSupplierPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <SupplierDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Reports & Analytics Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Machinery & Equipment Module Routes */}
          <Route
            path="/machinery"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MachineryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machinery/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreateMachineryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machinery/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MachineryDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machinery/:id/usage"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <MachineryUsageLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machinery/:id/maintenance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <MachineryMaintenanceLogPage />
              </ProtectedRoute>
            }
          />

          {/* Finance & Expenses Module Routes */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreateExpensePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <BudgetOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget/:projectId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <BudgetDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payables"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <PayablesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payables/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreatePayablePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cheques"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <ChequesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cheques/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                <CreateChequePage />
              </ProtectedRoute>
            }
          />

          {/* Attendance & Timesheet Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/history"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <AttendanceHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/summary"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <AttendanceSummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <TimesheetListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheets/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']}>
                <TimesheetDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <ClientPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryProvider>
  )
}

export default App
