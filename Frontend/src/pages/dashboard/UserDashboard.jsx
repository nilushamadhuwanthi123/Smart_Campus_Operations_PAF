import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  BellIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ShieldIcon,
  SparklesIcon,
  UserCheckIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { getIssueReports } from '../../api/issues';
import { useAuth } from '../../contexts/AuthContext';
import { mockNotifications } from '../../data/mockData';
import { appRoutes } from '../../utils/routes';

const ACTIVE_STATUSES = new Set(['OPEN', 'IN_PROGRESS']);
const RESOLVED_STATUSES = new Set(['RESOLVED', 'CLOSED']);

export function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadTickets() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getIssueReports();
        if (!ignore) {
          setTickets(response || []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      ignore = true;
    };
  }, []);

  const unreadAlerts = useMemo(
    () => mockNotifications.filter((notification) => !notification.read).length,
    []
  );

  const counts = useMemo(() => {
    const active = tickets.filter((ticket) => ACTIVE_STATUSES.has(ticket.status)).length;
    const resolved = tickets.filter((ticket) => RESOLVED_STATUSES.has(ticket.status)).length;
    const unassigned = tickets.filter((ticket) => !ticket.assignedTechnicianId).length;

    return {
      total: tickets.length,
      active,
      resolved,
      unassigned
    };
  }, [tickets]);

  const roleConfig = useMemo(() => {
    if (user?.role === 'TECHNICIAN') {
      return {
        kicker: 'Technician Desk',
        title: 'Focus on assigned maintenance',
        description:
          'Review assigned tickets, update progress, and close issues quickly for students and staff.',
        primaryAction: {
          label: 'Assigned Tickets',
          icon: <WrenchIcon className="h-4 w-4" />,
          to: appRoutes.tickets,
          variant: 'secondary'
        },
        secondaryAction: {
          label: 'Review Alerts',
          icon: <SparklesIcon className="h-4 w-4" />,
          to: appRoutes.notifications,
          variant: 'outline'
        },
        stats: [
          {
            label: 'Assigned Active',
            value: counts.active,
            trend: counts.active > 0 ? 'Needs your action' : 'Queue is clear',
            icon: UserCheckIcon,
            tone: 'bg-brand-navy text-brand-cream'
          },
          {
            label: 'Resolved By You',
            value: counts.resolved,
            trend: 'Completed tickets',
            icon: CheckCircle2Icon,
            tone: 'bg-brand-mist text-brand-navy'
          },
          {
            label: 'Unread Alerts',
            value: unreadAlerts,
            trend: 'Latest updates',
            icon: BellIcon,
            tone: 'bg-brand-cream text-brand-navy'
          }
        ],
        ticketKicker: 'Assigned Work',
        ticketTitle: 'Your Ticket Queue',
        emptyMessage: 'No tickets are assigned to you right now.'
      };
    }

    if (user?.role === 'ADMIN') {
      return {
        kicker: 'Admin Control',
        title: 'Campus operations command center',
        description:
          'Track all tickets, detect unassigned incidents, and coordinate technicians with quick decisions.',
        primaryAction: {
          label: 'Manage Users',
          icon: <ShieldIcon className="h-4 w-4" />,
          to: appRoutes.adminUsers,
          variant: 'secondary'
        },
        secondaryAction: {
          label: 'All Tickets',
          icon: <UsersIcon className="h-4 w-4" />,
          to: appRoutes.tickets,
          variant: 'outline'
        },
        stats: [
          {
            label: 'Total Tickets',
            value: counts.total,
            trend: 'System-wide load',
            icon: UsersIcon,
            tone: 'bg-brand-navy text-brand-cream'
          },
          {
            label: 'Unassigned',
            value: counts.unassigned,
            trend: counts.unassigned > 0 ? 'Needs technician assignment' : 'Fully assigned',
            icon: AlertCircleIcon,
            tone: 'bg-brand-mist text-brand-navy'
          },
          {
            label: 'Unread Alerts',
            value: unreadAlerts,
            trend: 'Latest updates',
            icon: BellIcon,
            tone: 'bg-brand-cream text-brand-navy'
          }
        ],
        ticketKicker: 'Operations Feed',
        ticketTitle: 'Recent Campus Tickets',
        emptyMessage: 'No tickets in the system yet.'
      };
    }

    return {
      kicker: 'Student Workspace',
      title: 'Track and report campus issues',
      description:
        'Create support tickets, monitor progress, and stay in sync with campus service updates in one place.',
      primaryAction: {
        label: 'Report Issue',
        icon: <AlertCircleIcon className="h-4 w-4" />,
        to: appRoutes.newTicket,
        variant: 'secondary'
      },
      secondaryAction: {
        label: 'Review Alerts',
        icon: <SparklesIcon className="h-4 w-4" />,
        to: appRoutes.notifications,
        variant: 'outline'
      },
      stats: [
        {
          label: 'My Active Tickets',
          value: counts.active,
          trend: counts.active > 0 ? 'In progress now' : 'No active issues',
          icon: WrenchIcon,
          tone: 'bg-brand-navy text-brand-cream'
        },
        {
          label: 'Resolved Tickets',
          value: counts.resolved,
          trend: 'Completed requests',
          icon: CheckCircle2Icon,
          tone: 'bg-brand-mist text-brand-navy'
        },
        {
          label: 'Unread Alerts',
          value: unreadAlerts,
          trend: 'Latest updates',
          icon: BellIcon,
          tone: 'bg-brand-cream text-brand-navy'
        }
      ],
      ticketKicker: 'My Work',
      ticketTitle: 'Recent Tickets',
      emptyMessage: 'You have not reported any tickets yet.'
    };
  }, [counts.active, counts.resolved, counts.total, counts.unassigned, unreadAlerts, user?.role]);

  const recentTickets = useMemo(() => tickets.slice(0, 5), [tickets]);

  const getPriorityDotColor = (priority) => {
    if (priority === 'CRITICAL') return 'bg-red-500';
    if (priority === 'HIGH') return 'bg-indigo-400';
    return 'bg-brand-mist';
  };

  const getTicketMeta = (ticket) => {
    if (user?.role === 'ADMIN') {
      if (ticket.assignedTechnicianName) {
        return `${ticket.studentName} • Assigned ${ticket.assignedTechnicianName}`;
      }
      return `${ticket.studentName} • Unassigned`;
    }

    if (user?.role === 'TECHNICIAN') {
      return `Reported by ${ticket.studentName}`;
    }

    return `Ticket ${ticket.id?.toUpperCase?.() || ''}`;
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-brand-cream/80 to-transparent md:block dark:from-brand-mist/10" />
        <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="theme-kicker mb-3">{roleConfig.kicker}</p>
            <h1 className="theme-heading text-5xl">{roleConfig.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">{roleConfig.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={roleConfig.primaryAction.variant}
              leftIcon={roleConfig.primaryAction.icon}
              onClick={() => navigate(roleConfig.primaryAction.to)}
            >
              {roleConfig.primaryAction.label}
            </Button>
            <Button
              variant={roleConfig.secondaryAction.variant}
              leftIcon={roleConfig.secondaryAction.icon}
              onClick={() => navigate(roleConfig.secondaryAction.to)}
            >
              {roleConfig.secondaryAction.label}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {roleConfig.stats.map((stat, index) => (
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
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{stat.trend}</p>
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
              <p className="theme-kicker mb-1 !tracking-[0.18em]">{roleConfig.ticketKicker}</p>
              <h3 className="theme-heading text-3xl">{roleConfig.ticketTitle}</h3>
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
            {errorMessage ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</div>
            ) : null}

            {isLoading ? (
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Loading tickets...</div>
            ) : null}

            {!isLoading && !errorMessage && recentTickets.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">{roleConfig.emptyMessage}</div>
            ) : null}

            {!isLoading && !errorMessage
              ? recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-brand-cream/45 dark:hover:bg-brand-surface-hover/35"
                    onClick={() => navigate(appRoutes.ticketDetail(ticket.id))}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {getTicketMeta(ticket)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${getPriorityDotColor(ticket.priority)}`} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))
              : null}
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
