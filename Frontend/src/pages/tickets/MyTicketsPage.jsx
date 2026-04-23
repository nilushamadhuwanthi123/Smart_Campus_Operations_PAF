import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  ClockIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  UserCheckIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { getIssueReports } from '../../api/issues';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../utils/routes';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const isStudent = user?.role === 'STUDENT';
  const isTechnician = user?.role === 'TECHNICIAN';

  const pageTitle = isTechnician ? 'Assigned Tickets' : user?.role === 'ADMIN' ? 'All Tickets' : 'My Tickets';
  const pageDescription = isTechnician
    ? 'Respond to assigned incidents and update progress.'
    : user?.role === 'ADMIN'
      ? 'Review all campus tickets and coordinate technician assignment.'
      : 'Track and manage your submitted incidents.';

  useEffect(() => {
    let ignore = false;

    async function loadTickets() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getIssueReports();
        if (!ignore) {
          setTickets(response);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load tickets.');
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

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [tickets, searchTerm, statusFilter, priorityFilter]
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{pageDescription}</p>
        </div>
        {isStudent ? (
          <Button onClick={() => navigate(appRoutes.newTicket)} leftIcon={<PlusIcon className="h-4 w-4" />}>
            Report Issue
          </Button>
        ) : null}
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {errorMessage ? <div className="p-6 text-sm text-red-600 dark:text-red-400">{errorMessage}</div> : null}
          {isLoading ? <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading tickets...</div> : null}
          {!isLoading && filteredTickets.length > 0
            ? filteredTickets.map((ticket, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={ticket.id}
                  onClick={() => navigate(appRoutes.ticketDetail(ticket.id))}
                  className="group flex cursor-pointer flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:p-6"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{ticket.title}</h3>
                      <StatusBadge status={ticket.status} />
                      <Badge variant="default" className="bg-slate-100 dark:bg-slate-800">
                        <span className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                          <AlertTriangleIcon className="h-3 w-3" />
                          {ticket.priority}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{ticket.category}</span>
                      </div>
                      {ticket.assignedTechnicianName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheckIcon className="h-4 w-4" />
                          <span>{ticket.assignedTechnicianName}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      rightIcon={<ChevronRightIcon className="h-4 w-4" />}
                    >
                      View Ticket
                    </Button>
                  </div>
                </motion.div>
              ))
            : !isLoading && (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <AlertTriangleIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-white">No tickets found</h3>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">
                    No tickets currently match your filters.
                  </p>
                  {isStudent ? (
                    <Button onClick={() => navigate(appRoutes.newTicket)} leftIcon={<PlusIcon className="h-4 w-4" />}>
                      Report an Issue
                    </Button>
                  ) : null}
                </div>
              )}
        </div>
      </Card>
    </div>
  );
}
