import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircleIcon, BellIcon, ChevronRightIcon, SparklesIcon, WrenchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { mockNotifications, mockTickets } from '../../data/mockData';
import { appRoutes } from '../../utils/routes';

export function UserDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Active Tickets',
      value: '2',
      trend: 'One needs attention',
      icon: WrenchIcon,
      tone: 'bg-brand-navy text-brand-cream'
    },
    {
      label: 'Unread Alerts',
      value: '3',
      trend: 'Latest updates',
      icon: BellIcon,
      tone: 'bg-brand-mist text-brand-navy'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-brand-cream/80 to-transparent md:block dark:from-brand-mist/10" />
        <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="theme-kicker mb-3">Campus Help Desk</p>
            <h1 className="theme-heading text-5xl">Welcome to the issue workspace</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Create new support tickets, monitor progress, and stay in sync with campus service
              updates in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              leftIcon={<AlertCircleIcon className="h-4 w-4" />}
              onClick={() => navigate(appRoutes.newTicket)}
            >
              Report Issue
            </Button>
            <Button
              variant="outline"
              leftIcon={<SparklesIcon className="h-4 w-4" />}
              onClick={() => navigate(appRoutes.notifications)}
            >
              Review Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-soft ${stat.tone}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <h3 className="theme-heading text-4xl leading-none">{stat.value}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="theme-kicker mb-1 !tracking-[0.18em]">Open Work</p>
              <h3 className="theme-heading text-3xl">Recent Tickets</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              onClick={() => navigate(appRoutes.tickets)}
            >
              View All
            </Button>
          </CardHeader>

          <div className="divide-y divide-brand-sand/45 dark:divide-brand-mist/10">
            {mockTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-brand-cream/45 dark:hover:bg-brand-surface-hover/35"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    Ticket {ticket.id}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      ticket.priority === 'CRITICAL'
                        ? 'bg-red-500'
                        : ticket.priority === 'HIGH'
                          ? 'bg-indigo-400'
                          : 'bg-brand-mist'
                    }`}
                  />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <p className="theme-kicker mb-1 !tracking-[0.18em]">Signal Feed</p>
            <h3 className="theme-heading text-3xl">Recent Notifications</h3>
          </CardHeader>

          <div className="divide-y divide-brand-sand/45 dark:divide-brand-mist/10">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 p-4 ${!notification.read ? 'bg-brand-cream/35 dark:bg-brand-surface-hover/20' : ''}`}
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    !notification.read ? 'bg-brand-navy dark:bg-brand-sand' : 'bg-transparent'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      !notification.read
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
