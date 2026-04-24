import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorPage } from './pages/ErrorPage';
import { LoginPage } from './pages/auth/LoginPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ResourceCataloguePage } from './pages/resources/ResourceCataloguePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MyTicketsPage } from './pages/tickets/MyTicketsPage';
import { NewTicketPage } from './pages/tickets/NewTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { appRoutes } from './utils/routes';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path={appRoutes.login} element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to={appRoutes.dashboard} replace />} />
                <Route path={appRoutes.dashboard} element={<UserDashboard />} />
                <Route path={appRoutes.resources} element={<ResourceCataloguePage />} />
                <Route path={appRoutes.tickets} element={<MyTicketsPage />} />
                <Route
                  path={appRoutes.newTicket}
                  element={
                    <RequireRole roles={['STUDENT']}>
                      <NewTicketPage />
                    </RequireRole>
                  }
                />
                <Route path={appRoutes.ticketDetail(':id')} element={<TicketDetailPage />} />
                <Route
                  path={appRoutes.adminUsers}
                  element={
                    <RequireRole roles={['ADMIN']}>
                      <UserManagementPage />
                    </RequireRole>
                  }
                />
                <Route path={appRoutes.notifications} element={<NotificationsPage />} />
                <Route path={appRoutes.settings} element={<SettingsPage />} />
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
