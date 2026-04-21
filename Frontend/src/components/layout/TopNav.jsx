import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  LogOutIcon,
  WrenchIcon,
  CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { mockNotifications } from '../../data/mockData';
import { getNotificationsPathForRole, resolvePathForRole } from '../../utils/routes';

export function TopNav() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pathnames = location.pathname.split('/').filter(Boolean);
  const breadcrumb =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
      : 'Dashboard';

  return (
    <header className="theme-topbar sticky top-0 z-10 flex h-20 items-center justify-between px-4 sm:px-6">
      <div className="min-w-0">
        <p className="theme-kicker mb-1">Workspace</p>
        <h1 className="theme-heading truncate text-3xl capitalize">
          {breadcrumb.replace('-', ' ')}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, people, rooms..."
            className="w-72 rounded-2xl border border-brand-sand/60 bg-white/70 py-2.5 pl-9 pr-16 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/15 dark:bg-brand-surface/55 dark:text-brand-cream"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <kbd className="rounded-md border border-brand-sand/60 bg-brand-cream px-1.5 py-0.5 text-[10px] font-medium text-brand-navy dark:border-brand-mist/20 dark:bg-brand-surface-hover dark:text-brand-mist">
              Ctrl K
            </kbd>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          className="hidden sm:flex"
        >
          Quick Add
        </Button>

        <div className="mx-1 hidden h-8 w-px bg-brand-sand/70 dark:bg-brand-mist/20 sm:block" />

        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-brand-cream/80 hover:text-brand-navy dark:hover:bg-brand-surface-hover dark:hover:text-brand-cream"
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-brand-cream/80 hover:text-brand-navy dark:hover:bg-brand-surface-hover dark:hover:text-brand-cream"
          >
            <BellIcon className="h-5 w-5" />
            {mockNotifications.some((notification) => !notification.read) && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-brand-surface" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="theme-surface absolute right-0 z-20 mt-2 w-80 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-brand-sand/50 px-4 py-3 dark:border-brand-mist/15">
                    <h3 className="theme-heading text-2xl">Notifications</h3>
                    <button className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/70 transition-colors hover:text-brand-navy dark:text-brand-mist/80 dark:hover:text-brand-cream">
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notification.link) {
                            navigate(resolvePathForRole(notification.link, user?.role));
                          }
                        }}
                        className={`flex cursor-pointer gap-3 border-b border-brand-sand/30 p-4 transition-colors last:border-b-0 dark:border-brand-mist/10 ${
                          !notification.read
                            ? 'bg-brand-cream/45 hover:bg-brand-cream/70 dark:bg-brand-surface-hover/35 dark:hover:bg-brand-surface-hover/60'
                            : 'hover:bg-brand-cream/40 dark:hover:bg-brand-surface-hover/35'
                        }`}
                      >
                        <div
                          className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            notification.title.includes('Booking')
                              ? 'bg-indigo-100 text-brand-navy dark:bg-indigo-900/30 dark:text-brand-sand'
                              : notification.title.includes('Ticket')
                                ? 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist'
                                : 'bg-brand-cream text-brand-navy dark:bg-brand-surface-hover dark:text-brand-cream'
                          }`}
                        >
                          {notification.title.includes('Booking') ? (
                            <CalendarIcon className="h-4 w-4" />
                          ) : notification.title.includes('Ticket') ? (
                            <WrenchIcon className="h-4 w-4" />
                          ) : (
                            <BellIcon className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-brand-navy dark:bg-brand-sand" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-brand-sand/50 p-2 dark:border-brand-mist/15">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(getNotificationsPathForRole(user?.role));
                      }}
                      className="w-full rounded-xl px-2 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-cream/70 dark:text-brand-cream dark:hover:bg-brand-surface-hover"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-brand-cream/80 dark:hover:bg-brand-surface-hover"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-9 w-9 rounded-full border border-brand-sand/60 object-cover dark:border-brand-mist/20"
            />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="theme-surface absolute right-0 z-20 mt-2 w-56 overflow-hidden">
                <div className="border-b border-brand-sand/50 px-4 py-3 dark:border-brand-mist/15">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
