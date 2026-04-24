import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Check, Trash2, Wrench } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../contexts/NotificationsContext';

const filterTabs = ['ALL', 'UNREAD', 'TICKETS', 'SYSTEM'];

function isTicketNotification(notification) {
  const title = notification?.title?.toLowerCase() || '';
  const link = notification?.link || '';
  return link.startsWith('/tickets/') || title.includes('ticket');
}

function isBookingNotification(notification) {
  const title = notification?.title?.toLowerCase() || '';
  const link = notification?.link || '';
  return link.startsWith('/bookings') || title.includes('booking');
}

function getIcon(notification) {
  if (isTicketNotification(notification)) {
    return <Wrench className="h-5 w-5" />;
  }

  if (isBookingNotification(notification)) {
    return <Calendar className="h-5 w-5" />;
  }

  return <Bell className="h-5 w-5" />;
}

function getIconColor(notification) {
  if (isTicketNotification(notification)) {
    return 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist';
  }

  if (isBookingNotification(notification)) {
    return 'bg-indigo-100 text-brand-navy dark:bg-indigo-900/30 dark:text-brand-sand';
  }

  return 'bg-brand-cream text-brand-navy dark:bg-brand-surface-hover dark:text-brand-cream';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, errorMessage, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (activeTab === 'UNREAD') return !notification.read;
        if (activeTab === 'TICKETS') return isTicketNotification(notification);
        if (activeTab === 'SYSTEM') return !isTicketNotification(notification);
        return true;
      }),
    [notifications, activeTab]
  );

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (id, event) => {
    event.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (id, event) => {
    event.stopPropagation();
    deleteNotification(id);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="theme-kicker mb-2">Signal Feed</p>
          <h1 className="theme-heading text-5xl">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Stay updated on booking decisions, ticket updates, and new comments.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" leftIcon={<Check className="h-4 w-4" />} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="theme-surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-brand-sand/55 px-5 py-4 dark:border-brand-mist/15">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-navy text-brand-cream dark:bg-brand-surface-hover dark:text-brand-cream'
                    : 'text-slate-500 hover:bg-brand-cream/80 hover:text-brand-navy dark:text-slate-400 dark:hover:bg-brand-surface-hover dark:hover:text-brand-cream'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute inset-0 -z-10 rounded-full" />}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Badge variant="warning" className="px-3 py-1 text-sm">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {errorMessage ? (
          <div className="border-b border-brand-sand/45 bg-red-50/70 px-5 py-3 text-sm text-red-700 dark:border-brand-mist/10 dark:bg-red-900/15 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <div className="divide-y divide-brand-sand/45 dark:divide-brand-mist/10">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 text-sm text-slate-500 dark:text-slate-400">
                Loading notifications...
              </motion.div>
            ) : null}

            {!isLoading && filteredNotifications.length > 0
              ? filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex cursor-pointer gap-4 p-5 transition-colors ${
                      !notification.read
                        ? 'bg-brand-cream/28 hover:bg-brand-cream/55 dark:bg-brand-surface-hover/20 dark:hover:bg-brand-surface-hover/40'
                        : 'hover:bg-brand-cream/35 dark:hover:bg-brand-surface-hover/28'
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${getIconColor(notification)}`}>
                        {getIcon(notification)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`truncate text-sm ${
                            !notification.read
                              ? 'font-semibold text-slate-900 dark:text-white'
                              : 'font-medium text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className="flex-shrink-0 text-[11px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 line-clamp-2 text-sm ${
                          !notification.read
                            ? 'text-slate-600 dark:text-slate-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end justify-between opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.read ? (
                        <button
                          onClick={(event) => handleMarkAsRead(notification.id, event)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-brand-cream hover:text-brand-navy dark:hover:bg-brand-surface-hover dark:hover:text-brand-cream"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="h-7" />
                      )}

                      <button
                        onClick={(event) => handleDelete(notification.id, event)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {!notification.read && (
                      <div className="flex w-4 flex-shrink-0 items-center justify-center group-hover:hidden">
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-navy dark:bg-brand-sand" />
                      </div>
                    )}
                  </motion.div>
                ))
              : null}

            {!isLoading && filteredNotifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
                <EmptyState
                  icon={<Bell className="h-8 w-8 text-slate-400" />}
                  title="No notifications"
                  description={
                    activeTab === 'ALL'
                      ? "You're all caught up. Check back later for updates."
                      : `You have no ${activeTab.toLowerCase()} notifications at the moment.`
                  }
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
