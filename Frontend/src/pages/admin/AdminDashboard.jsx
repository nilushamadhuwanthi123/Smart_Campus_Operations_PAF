import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, Users, ArrowRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { mockTickets } from '../../data/mockData';
import { adminRoutes } from '../../utils/routes';

export function AdminDashboard() {
  const openTickets = mockTickets.filter((ticket) => ticket.status === 'OPEN');
  const inProgressTickets = mockTickets.filter((ticket) => ticket.status === 'IN_PROGRESS');
  const resolvedTickets = mockTickets.filter((ticket) => ticket.status === 'RESOLVED');
  const criticalTickets = mockTickets.filter(
    (ticket) => ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
  );

  const metrics = [
    {
      label: 'Critical Tickets',
      value: criticalTickets.length,
      icon: AlertTriangle,
      tone: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
    },
    {
      label: 'Open Tickets',
      value: openTickets.length,
      icon: Clock3,
      tone: 'bg-brand-sand/70 text-brand-navy dark:bg-indigo-900/40 dark:text-brand-sand'
    },
    {
      label: 'In Progress',
      value: inProgressTickets.length,
      icon: Users,
      tone: 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist'
    },
    {
      label: 'Resolved',
      value: resolvedTickets.length,
      icon: CheckCircle2,
      tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-brand-cream/80 to-transparent md:block dark:from-brand-mist/10" />
        <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="theme-kicker mb-3">Admin Command Center</p>
            <h1 className="theme-heading text-5xl">Operations With Less Visual Noise</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              The refreshed admin workspace uses the new navy and sand palette to make priority,
              queue health, and team coordination easier to scan.
            </p>
          </div>

          <Link
            to={adminRoutes.technicians}
            className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-medium text-brand-cream transition-all hover:-translate-y-0.5 hover:bg-purple-700"
          >
            Manage Technicians
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-[1.25rem] p-3 shadow-soft ${metric.tone}`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                <h3 className="theme-heading text-4xl leading-none">{metric.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-brand-sand/55 px-5 py-4 dark:border-brand-mist/15">
            <div>
              <p className="theme-kicker mb-1 !tracking-[0.18em]">Response Queue</p>
              <h3 className="theme-heading text-3xl">Priority Tickets</h3>
            </div>
            <Link
              to={adminRoutes.tickets}
              className="inline-flex items-center text-sm font-medium text-brand-navy transition-colors hover:text-purple-700 dark:text-brand-sand dark:hover:text-brand-cream"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1">
            {criticalTickets.length > 0 ? (
              <ul className="divide-y divide-brand-sand/45 dark:divide-brand-mist/10">
                {criticalTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-brand-cream/40 dark:hover:bg-brand-surface-hover/35"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {ticket.title}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Ticket {ticket.id}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant={ticket.priority === 'CRITICAL' ? 'danger' : 'warning'}>
                        {ticket.priority}
                      </Badge>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No critical tickets</div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-brand-sand/55 bg-brand-cream/45 px-5 py-4 dark:border-brand-mist/15 dark:bg-brand-surface-hover/25">
            <p className="theme-kicker mb-1 !tracking-[0.18em]">Roster Health</p>
            <h3 className="theme-heading text-3xl">Technician Team Setup</h3>
          </div>

          <CardContent className="space-y-5 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-[1.25rem] bg-brand-mist p-3 text-brand-navy shadow-soft">
                <Wrench className="h-6 w-6" />
              </div>
              <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
                Add technician members so admins can maintain the support roster from one place and
                route campus issues faster.
              </p>
            </div>

            <Link
              to={adminRoutes.technicians}
              className="inline-flex items-center justify-center rounded-xl border border-brand-mist/70 bg-white/60 px-4 py-3 text-sm font-medium text-brand-navy transition-all hover:bg-brand-cream/80 dark:border-brand-mist/20 dark:bg-brand-surface/45 dark:text-brand-cream dark:hover:bg-brand-surface-hover"
            >
              Open Team Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
