import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Wrench, Check, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { mockNotifications } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { resolvePathForRole } from '../../utils/routes';

const extendedNotifications = [
  ...mockNotifications,
  {
    id: 'n4',
    userId: 'u1',
    title: 'System Maintenance',
    message: 'The campus portal will be down for maintenance on Sunday 2 AM - 4 AM.',
    type: 'WARNING',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'n5',
    userId: 'u1',
    title: 'Platform Notice',
    message: 'A new help desk workflow is now available in the technician dashboard.',
    type: 'INFO',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/technician'
  },
  {
    id: 'n6',
    userId: 'u1',
    title: 'Ticket Resolved',
    message: 'Your ticket "Whiteboard markers empty" has been marked as RESOLVED.',
    type: 'SUCCESS',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/tickets/t3'
  },
  {
    id: 'n7',
    userId: 'u1',
    title: 'Ticket Escalated',
    message: 'A high-priority support ticket was escalated for immediate review.',
    type: 'INFO',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/tickets/t2'
  },
  {
    id: 'n8',
    userId: 'u1',
    title: 'Security Alert',
    message: 'New login detected from an unrecognized device.',
    type: 'ERROR',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/settings'
  }
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const filterTabs = ['ALL', 'UNREAD', 'TICKETS', 'SYSTEM'];

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(extendedNotifications);
  const [activeTab, setActiveTab] = useState('ALL');

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })));
  };

  const handleMarkAsRead = (id, event) => {
    event.stopPropagation();
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleDelete = (id, event) => {
    event.stopPropagation();
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      setNotifications(
        notifications.map((entry) =>
          entry.id === notification.id ? { ...entry, read: true } : entry
        )
      );
    }

    if (notification.link) {
      navigate(resolvePathForRole(notification.link, user?.role));
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'UNREAD') return !notification.read;
    if (activeTab === 'TICKETS') return notification.title.toLowerCase().includes('ticket');
    if (activeTab === 'SYSTEM') return !notification.title.toLowerCase().includes('ticket');
    return true;
  });

  const getIcon = (title) =>
    title.toLowerCase().includes('ticket') ? <Wrench className="h-5 w-5" /> : <Bell className="h-5 w-5" />;

  const getIconColor = (title) =>
    title.toLowerCase().includes('ticket')
      ? 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist'
      : 'bg-brand-cream text-brand-navy dark:bg-brand-surface-hover dark:text-brand-cream';

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="theme-kicker mb-2">Signal Feed</p>
          <h1 className="theme-heading text-5xl">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Stay updated on tickets, system notices, and campus alerts with the new shared theme.
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
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 -z-10 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Badge variant="warning" className="px-3 py-1 text-sm">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="divide-y divide-brand-sand/45 dark:divide-brand-mist/10">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
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
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${getIconColor(
                        notification.title
                      )}`}
                    >
                      {getIcon(notification.title)}
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
            ) : (
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
