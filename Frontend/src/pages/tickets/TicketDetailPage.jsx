import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  MessageSquareIcon,
  SendIcon,
  UserCheckIcon,
  UserIcon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import {
  addIssueReportComment,
  assignIssueReportTechnician,
  getIssueReportById,
  updateIssueReportStatus
} from '../../api/issues';
import { getUsers } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../utils/routes';

const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const [statusValue, setStatusValue] = useState('OPEN');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  const canUpdateStatus = isAdmin || isTechnician;
  const canAssignTechnician = isAdmin;

  useEffect(() => {
    let ignore = false;

    async function loadTicket() {
      if (!id) {
        setErrorMessage('Ticket not found');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getIssueReportById(id);
        if (!ignore) {
          setTicket(response);
          setStatusValue(response.status);
          setSelectedTechnician(response.assignedTechnicianId || '');
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load ticket.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let ignore = false;

    async function loadTechnicians() {
      try {
        const allUsers = await getUsers();
        if (!ignore) {
          setTechnicians(allUsers.filter((entry) => entry.role === 'TECHNICIAN'));
        }
      } catch {
        if (!ignore) {
          setTechnicians([]);
        }
      }
    }

    loadTechnicians();

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const sortedComments = useMemo(() => {
    const entries = ticket?.comments || [];
    return [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [ticket?.comments]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const handleUpdateStatus = async () => {
    if (!id) return;

    setIsUpdatingStatus(true);
    setErrorMessage('');

    try {
      const updated = await updateIssueReportStatus(id, statusValue);
      setTicket(updated);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!id || !selectedTechnician) return;

    setIsAssigning(true);
    setErrorMessage('');

    try {
      const updated = await assignIssueReportTechnician(id, selectedTechnician);
      setTicket(updated);
      setStatusValue(updated.status);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to assign technician.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!id || !comment.trim()) {
      return;
    }

    setIsCommenting(true);
    setErrorMessage('');

    try {
      const updated = await addIssueReportComment(id, comment.trim());
      setTicket(updated);
      setComment('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to post comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-slate-400">Loading ticket...</div>;
  }

  if (errorMessage || !ticket) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{errorMessage || 'Ticket not found'}</h2>
        <Button className="mt-4" onClick={() => navigate(appRoutes.tickets)}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(appRoutes.tickets)} className="px-2">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Ticket #{ticket.id?.toUpperCase()}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400">Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Issue Details</h2>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                >
                  <AlertTriangleIcon className="h-3 w-3" />
                  {ticket.priority}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{ticket.description}</p>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Category</p>
                  <p className="text-sm text-slate-900 dark:text-white">{ticket.category}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Priority</p>
                  <p className="text-sm text-slate-900 dark:text-white">{ticket.priority}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">Attached Evidence</p>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachmentUrls?.length ? (
                    ticket.attachmentUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        View attachment
                      </a>
                    ))
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                      No images
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Conversation</h3>
              <MessageSquareIcon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedComments.length > 0 ? (
                <div className="space-y-3">
                  {sortedComments.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-brand-sand/40 bg-brand-cream/25 p-3 dark:border-brand-mist/15 dark:bg-brand-surface/35"
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.userName}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:bg-brand-surface-hover dark:text-slate-300">
                          {entry.userRole}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{entry.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
              )}

              <form className="space-y-3" onSubmit={handleAddComment}>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write a comment about this ticket..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isCommenting} leftIcon={<SendIcon className="h-4 w-4" />}>
                    Add Comment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">Reporter</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{ticket.studentName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ticket.studentEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">Assignment</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <UserCheckIcon className="h-4 w-4 text-brand-mist" />
                {ticket.assignedTechnicianName ? (
                  <span>{ticket.assignedTechnicianName}</span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">Not assigned yet</span>
                )}
              </div>

              {canAssignTechnician ? (
                <>
                  <select
                    value={selectedTechnician}
                    onChange={(event) => setSelectedTechnician(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select technician...</option>
                    {technicians.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.fullName}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    className="w-full"
                    isLoading={isAssigning}
                    disabled={!selectedTechnician}
                    onClick={handleAssignTechnician}
                  >
                    Assign Technician
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>

          {canUpdateStatus ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-900 dark:text-white">Update Status</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <Button className="w-full" isLoading={isUpdatingStatus} onClick={handleUpdateStatus}>
                  Save Status
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">Status Timeline</h3>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:-translate-x-px before:bg-slate-200 dark:before:bg-slate-700">
                {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                  <div className="relative flex items-start gap-3">
                    <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 ring-4 ring-white dark:bg-green-900 dark:text-green-400 dark:ring-brand-surface">
                      <CheckCircle2Icon className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {ticket.status === 'CLOSED' ? 'Closed' : 'Resolved'}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : null}

                {ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                  <div className="relative flex items-start gap-3">
                    <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-4 ring-white dark:bg-blue-900 dark:text-blue-400 dark:ring-brand-surface">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">In Progress</p>
                      <p className="text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : null}

                <div className="relative flex items-start gap-3">
                  <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-4 ring-white dark:bg-slate-700 dark:ring-brand-surface">
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Ticket Created</p>
                    <p className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-4 ring-white dark:bg-slate-700 dark:ring-brand-surface">
                    <ClockIcon className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Last Updated</p>
                    <p className="text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
