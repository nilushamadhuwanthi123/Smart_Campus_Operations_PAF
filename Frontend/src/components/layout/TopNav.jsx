import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, CalendarIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon, WrenchIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { mockNotifications } from '../../data/mockData';
import { appRoutes } from '../../utils/routes';

export function TopNav() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
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
        <h1 className="theme-heading truncate text-3xl capitalize">{breadcrumb.replace('-', ' ')}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, rooms, categories..."
            className="w-72 rounded-2xl border border-brand-sand/60 bg-white/70 py-2.5 pl-9 pr-4 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/15 dark:bg-brand-surface/55 dark:text-brand-cream"
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          className="hidden sm:flex"
          onClick={() => navigate(appRoutes.newTicket)}
        >
          New Ticket
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
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notification.link) {
                            navigate(notification.link);
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
                            notification.title.includes('Ticket')
                              ? 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist'
                              : notification.title.includes('Maintenance')
                                ? 'bg-indigo-100 text-brand-navy dark:bg-indigo-900/30 dark:text-brand-sand'
                                : 'bg-brand-cream text-brand-navy dark:bg-brand-surface-hover dark:text-brand-cream'
                          }`}
                        >
                          {notification.title.includes('Ticket') ? (
                            <WrenchIcon className="h-4 w-4" />
                          ) : notification.title.includes('Maintenance') ? (
                            <CalendarIcon className="h-4 w-4" />
                          ) : (
                            <BellIcon className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
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
                        navigate(appRoutes.notifications);
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
      </div>
    </header>
  );
}
