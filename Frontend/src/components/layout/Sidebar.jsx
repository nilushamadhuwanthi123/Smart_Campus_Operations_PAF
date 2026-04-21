import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  TicketIcon,
  BellIcon,
  SettingsIcon,
  ShieldIcon,
  WrenchIcon,
  ChevronLeftIcon,
  GraduationCapIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  adminRoutes,
  getSettingsPathForRole,
  studentRoutes,
  technicianRoutes
} from '../../utils/routes';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const mainNav = [
    { name: 'Dashboard', path: studentRoutes.dashboard, icon: LayoutDashboardIcon },
    { name: 'Tickets', path: studentRoutes.tickets, icon: TicketIcon },
    { name: 'Notifications', path: studentRoutes.notifications, icon: BellIcon }
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: adminRoutes.dashboard, icon: ShieldIcon },
    { name: 'Manage Tickets', path: adminRoutes.tickets, icon: TicketIcon },
    { name: 'Technicians', path: adminRoutes.technicians, icon: WrenchIcon },
    { name: 'Notifications', path: adminRoutes.notifications, icon: BellIcon }
  ];

  const techNav = [
    { name: 'My Assignments', path: technicianRoutes.dashboard, icon: WrenchIcon },
    { name: 'Notifications', path: technicianRoutes.notifications, icon: BellIcon }
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;

    return (
      <NavLink
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
              className={`h-5 w-5 flex-shrink-0 ${
                collapsed ? 'mx-auto' : 'mr-3'
              } ${
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
  };

  const sectionLabel = (text) =>
    !collapsed ? (
      <p className="theme-kicker px-3 pb-2 pt-2 text-[11px]">
        {text}
      </p>
    ) : null;

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
              <span className="theme-heading block truncate text-xl leading-none">
                Smart Campus Hub
              </span>
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
        {user?.role === 'USER' && (
          <div className="mb-6">
            {sectionLabel('Main Menu')}
            {mainNav.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="mb-6">
            {sectionLabel('Administration')}
            {adminNav.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}

        {user?.role === 'TECHNICIAN' && (
          <div className="mb-6">
            {sectionLabel('Operations')}
            {techNav.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-brand-sand/50 p-3 dark:border-brand-mist/15">
        <NavItem
          item={{
            name: 'Settings',
            path: getSettingsPathForRole(user?.role),
            icon: SettingsIcon
          }}
        />
      </div>
    </motion.aside>
  );
}
