import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../utils/routes';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
