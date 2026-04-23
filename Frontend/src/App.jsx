import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorPage } from './pages/ErrorPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MyTicketsPage } from './pages/tickets/MyTicketsPage';
import { NewTicketPage } from './pages/tickets/NewTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { appRoutes } from './utils/routes';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to={appRoutes.dashboard} replace />} />
            <Route path={appRoutes.dashboard} element={<UserDashboard />} />
            <Route path={appRoutes.tickets} element={<MyTicketsPage />} />
            <Route path={appRoutes.newTicket} element={<NewTicketPage />} />
            <Route path={appRoutes.ticketDetail(':id')} element={<TicketDetailPage />} />
            <Route path={appRoutes.notifications} element={<NotificationsPage />} />
            <Route path={appRoutes.settings} element={<SettingsPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
