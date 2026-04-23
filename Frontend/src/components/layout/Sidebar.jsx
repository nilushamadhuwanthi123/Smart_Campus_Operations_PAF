import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BellIcon,
  ChevronLeftIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldIcon,
  TicketIcon
} from 'lucide-react';
import { appRoutes } from '../../utils/routes';
import { useAuth } from '../../contexts/AuthContext';

const allNavigationItems = [
  { name: 'Dashboard', path: appRoutes.dashboard, icon: LayoutDashboardIcon, roles: ['ADMIN', 'STUDENT', 'TECHNICIAN'] },
  { name: 'Tickets', path: appRoutes.tickets, icon: TicketIcon, roles: ['ADMIN', 'STUDENT', 'TECHNICIAN'] },
  { name: 'User Access', path: appRoutes.adminUsers, icon: ShieldIcon, roles: ['ADMIN'] },
  { name: 'Notifications', path: appRoutes.notifications, icon: BellIcon, roles: ['ADMIN', 'STUDENT', 'TECHNICIAN'] },
  { name: 'Settings', path: appRoutes.settings, icon: SettingsIcon, roles: ['ADMIN', 'STUDENT', 'TECHNICIAN'] }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const navigationItems = useMemo(() => {
    if (!user?.role) {
      return allNavigationItems.filter((item) => item.roles.includes('STUDENT'));
    }

    return allNavigationItems.filter((item) => item.roles.includes(user.role));
  }, [user?.role]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 88 : 276 }}
      className="theme-sidebar sticky top-0 z-20 flex h-screen flex-col"
    >
      <div className="flex h-20 items-center justify-between border-b border-brand-sand/50 px-4 dark:border-brand-mist/15">
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl bg-brand-navy p-2 text-brand-cream shadow-soft">
              <GraduationCapIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="theme-kicker !tracking-[0.22em]">Campus Flow</p>
              <span className="theme-heading block truncate text-xl leading-none">Smart Campus Hub</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto rounded-2xl bg-brand-navy p-2 text-brand-cream shadow-soft">
            <GraduationCapIcon className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`rounded-xl p-2 text-slate-400 transition-colors hover:bg-brand-cream/70 hover:text-brand-navy dark:hover:bg-brand-surface-hover dark:hover:text-brand-cream ${
            collapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="theme-kicker px-3 pb-2 pt-2 text-[11px]">Main Menu</p>
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative mb-1 flex items-center rounded-2xl px-3 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-cream/90 font-medium text-brand-navy shadow-soft dark:bg-brand-surface-hover dark:text-brand-cream'
                    : 'text-slate-600 hover:bg-brand-cream/60 hover:text-brand-navy dark:text-slate-400 dark:hover:bg-brand-surface-hover/80 dark:hover:text-brand-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-y-2 left-1 w-1 rounded-full bg-brand-navy dark:bg-brand-sand"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                      isActive
                        ? 'text-brand-navy dark:text-brand-sand'
                        : 'text-slate-400 group-hover:text-brand-navy dark:group-hover:text-brand-mist'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.aside>
  );
}
