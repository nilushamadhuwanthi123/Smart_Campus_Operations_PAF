import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheckIcon,
  CheckCircle2Icon,
  Clock3Icon,
  PlusIcon,
  QrCodeIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  XCircleIcon
} from 'lucide-react';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import {
  cancelBooking,
  createBooking,
  getBookingQrCode,
  getBookings,
  reviewBooking,
  verifyBookingCheckIn
} from '../../api/bookings';
import { getResources } from '../../api/resources';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const defaultFilterState = {
  search: '',
  status: 'ALL',
  resourceId: 'ALL',
  dateFrom: '',
  dateTo: '',
  bookedByUserId: ''
};

function getTodayDateInputValue() {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().slice(0, 10);
}

function createInitialFormState() {
  return {
    resourceId: '',
    date: getTodayDateInputValue(),
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: ''
  };
}

function formatEnumLabel(value) {
  return (value || '')
    .toLowerCase()
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
}

function formatSchedule(booking) {
  if (!booking.date || !booking.startTime || !booking.endTime) {
    return 'Schedule unavailable';
  }

  return `${booking.date} • ${booking.startTime} - ${booking.endTime}`;
}

function addMinutesToTime(timeValue, minutesToAdd) {
  if (!timeValue || !timeValue.includes(':')) {
    return timeValue;
  }

  const [hoursPart, minutesPart] = timeValue.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return timeValue;
  }

  const totalMinutes = Math.min((hours * 60) + minutes + minutesToAdd, (23 * 60) + 59);
  const nextHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const nextMinutes = String(totalMinutes % 60).padStart(2, '0');
  return `${nextHours}:${nextMinutes}`;
}

export function BookingManagementPage() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [filters, setFilters] = useState(defaultFilterState);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilterState);

  const [form, setForm] = useState(createInitialFormState);

  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isVerifyingCheckIn, setIsVerifyingCheckIn] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createBookingError, setCreateBookingError] = useState(null);

  const [qrPayloadInput, setQrPayloadInput] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadResources = async () => {
    setIsLoadingResources(true);

    try {
      const response = await getResources({ status: 'ACTIVE' });
      const allResources = response || [];
      setResources(allResources);

      setForm((previous) => {
        if (previous.resourceId || allResources.length === 0) {
          return previous;
        }

        return {
          ...previous,
          resourceId: allResources[0].id
        };
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load resources.');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const loadBookings = async (nextFilters = appliedFilters) => {
    setIsLoadingBookings(true);
    setErrorMessage('');

    try {
      const response = await getBookings({
        search: nextFilters.search,
        status: nextFilters.status === 'ALL' ? undefined : nextFilters.status,
        resourceId: nextFilters.resourceId === 'ALL' ? undefined : nextFilters.resourceId,
        dateFrom: nextFilters.dateFrom,
        dateTo: nextFilters.dateTo,
        bookedByUserId: isAdmin ? nextFilters.bookedByUserId : undefined
      });
      setBookings(response || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load bookings.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    loadBookings(appliedFilters);
  }, [appliedFilters, isAdmin]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCreateModalOpen]);

  const summary = useMemo(() => {
    const pending = bookings.filter((entry) => entry.status === 'PENDING').length;
    const approved = bookings.filter((entry) => entry.status === 'APPROVED').length;
    const checkedIn = bookings.filter((entry) => Boolean(entry.checkedInAt)).length;

    return {
      total: bookings.length,
      pending,
      approved,
      checkedIn
    };
  }, [bookings]);

  const filteredResources = useMemo(
    () => [...resources].sort((left, right) => (left.name || '').localeCompare(right.name || '')),
    [resources]
  );

  const resetForm = () => {
    setForm((previous) => ({
      ...createInitialFormState(),
      resourceId: previous.resourceId || filteredResources[0]?.id || ''
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilterState);
    setAppliedFilters(defaultFilterState);
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');
    setCreateBookingError(null);

    if (!form.resourceId) {
      setCreateBookingError('Please select a resource.');
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setCreateBookingError('Date and time range are required.');
      return;
    }

    if (form.endTime <= form.startTime) {
      setCreateBookingError('End time must be after start time.');
      return;
    }

    const parsedAttendees = form.expectedAttendees ? Number(form.expectedAttendees) : null;
    if (parsedAttendees !== null && (!Number.isFinite(parsedAttendees) || parsedAttendees < 1)) {
      setCreateBookingError('Expected attendees must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createBooking({
        resourceId: form.resourceId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: parsedAttendees
      });

      setSuccessMessage('Booking request submitted successfully.');
      setIsCreateModalOpen(false);
      resetForm();
      await loadBookings(appliedFilters);
      refreshNotifications({ silent: true });
    } catch (error) {
      setCreateBookingError(error.message || 'Failed to create booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewBooking = async (booking, decision, reason = '') => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsReviewing(true);

    try {
      await reviewBooking(booking.id, {
        decision,
        reason
      });

      setSuccessMessage(`Booking ${decision.toLowerCase()} successfully.`);
      await loadBookings(appliedFilters);
      refreshNotifications({ silent: true });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to review booking.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRejectBooking = async (booking) => {
    const reason = window.prompt('Please enter a rejection reason:');

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Rejection reason is required.');
      return;
    }

    await handleReviewBooking(booking, 'REJECTED', reason.trim());
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Cancel this approved booking?')) {
      return;
    }

    const reasonInput = window.prompt('Optional cancellation reason (leave blank if none):', '');
    if (reasonInput === null) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsCancelling(true);

    try {
      await cancelBooking(booking.id, reasonInput.trim());
      setSuccessMessage('Booking cancelled successfully.');
      await loadBookings(appliedFilters);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewQrCode = async (booking) => {
    setErrorMessage('');
    setSuccessMessage('');
    setVerificationResult(null);
    setIsLoadingQr(true);

    try {
      const qrResponse = await getBookingQrCode(booking.id);
      setSelectedQr(qrResponse);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load booking QR code.');
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleCopyQrPayload = async () => {
    if (!selectedQr?.qrPayload) {
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectedQr.qrPayload);
        setSuccessMessage('QR payload copied to clipboard.');
      }
    } catch {
      setErrorMessage('Unable to copy payload. Please copy it manually.');
    }
  };

  const handleVerifyCheckIn = async (event) => {
    event.preventDefault();

    if (!qrPayloadInput.trim()) {
      setErrorMessage('Please enter a QR payload value.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setVerificationResult(null);
    setIsVerifyingCheckIn(true);

    try {
      const response = await verifyBookingCheckIn(qrPayloadInput.trim());
      setVerificationResult(response);
      setSuccessMessage('Booking check-in verified successfully.');
      setQrPayloadInput('');
      await loadBookings(appliedFilters);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to verify booking check-in.');
    } finally {
      setIsVerifyingCheckIn(false);
    }
  };

  const canReviewBooking = (booking) => isAdmin && booking.status === 'PENDING';

  const canCancelBooking = (booking) => {
    if (booking.status !== 'APPROVED') {
      return false;
    }

    if (isAdmin) {
      return true;
    }

    return booking.bookedByUserId === user?.id;
  };

  const canViewQrCode = (booking) => {
    if (booking.status !== 'APPROVED') {
      return false;
    }

    if (isAdmin) {
      return true;
    }

    return booking.bookedByUserId === user?.id;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="theme-kicker mb-2">Resource Scheduling</p>
          <h1 className="theme-heading text-5xl">Booking Management</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Request and track resource bookings with approval workflow, conflict protection, and QR check-in.
          </p>
        </div>

        <Button
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            setCreateBookingError(null);
            setIsCreateModalOpen(true);
          }}
          disabled={isLoadingResources || filteredResources.length === 0}
        >
          Book Now
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-cream shadow-soft">
              <CalendarCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Bookings</p>
              <h3 className="theme-heading text-4xl leading-none">{summary.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy shadow-soft">
              <Clock3Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Reviews</p>
              <h3 className="theme-heading text-4xl leading-none">{summary.pending}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-navy shadow-soft dark:bg-brand-surface-hover dark:text-brand-cream">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
              <h3 className="theme-heading text-4xl leading-none">{summary.approved}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-soft dark:bg-emerald-900/25 dark:text-emerald-300">
              <CheckCircle2Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Checked In</p>
              <h3 className="theme-heading text-4xl leading-none">{summary.checkedIn}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="theme-kicker mb-1 !tracking-[0.18em]">Filter</p>
            <h2 className="theme-heading text-3xl">Find Bookings</h2>
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCwIcon className="h-4 w-4" />} onClick={() => loadBookings(appliedFilters)}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleApplyFilters}>
            <div className="relative xl:col-span-2">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search purpose, resource, requester..."
                value={filters.search}
                onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
                className="w-full rounded-xl border border-brand-sand/65 bg-white/70 py-2.5 pl-9 pr-4 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
              />
            </div>

            <select
              value={filters.status}
              onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            >
              <option value="ALL">All Statuses</option>
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>

            <select
              value={filters.resourceId}
              onChange={(event) => setFilters((previous) => ({ ...previous, resourceId: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            >
              <option value="ALL">All Resources</option>
              {filteredResources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters((previous) => ({ ...previous, dateFrom: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters((previous) => ({ ...previous, dateTo: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            />

            {isAdmin ? (
              <input
                type="text"
                placeholder="Filter by requester user ID"
                value={filters.bookedByUserId}
                onChange={(event) => setFilters((previous) => ({ ...previous, bookedByUserId: event.target.value }))}
                className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
              />
            ) : null}

            <div className="flex items-center gap-2 xl:justify-end">
              <Button type="submit" size="sm" leftIcon={<SearchIcon className="h-4 w-4" />}>
                Apply
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheckIcon className="h-5 w-5 text-brand-navy dark:text-brand-mist" />
            <h2 className="theme-heading text-3xl">Bookings</h2>
          </div>
          <Badge variant="info">{bookings.length} records</Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingBookings ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No bookings found for selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] divide-y divide-brand-sand/45 dark:divide-brand-mist/15">
                <thead>
                  <tr className="bg-brand-cream/35 text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-brand-surface/35 dark:text-slate-400">
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Attendees</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin ? <th className="px-4 py-3">Requested By</th> : null}
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-brand-sand/35 dark:divide-brand-mist/10">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="text-sm">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{booking.resourceName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatEnumLabel(booking.resourceType)} • {booking.resourceLocation}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatSchedule(booking)}</td>
                      <td className="px-4 py-3">
                        <p className="max-w-xs text-slate-700 dark:text-slate-200">{booking.purpose}</p>
                        {booking.adminReviewReason ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reason: {booking.adminReviewReason}</p>
                        ) : null}
                        {booking.cancellationReason ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cancellation: {booking.cancellationReason}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{booking.expectedAttendees ?? 'Not specified'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{booking.bookedByUserName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{booking.bookedByUserEmail}</p>
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        {booking.checkedInAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300">
                            <CheckCircle2Icon className="h-3.5 w-3.5" />
                            {formatDateTime(booking.checkedInAt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-brand-surface/45 dark:text-slate-300">
                            <Clock3Icon className="h-3.5 w-3.5" />
                            Not checked in
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {canReviewBooking(booking) ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReviewBooking(booking, 'APPROVED')}
                                isLoading={isReviewing}
                                leftIcon={<CheckCircle2Icon className="h-4 w-4" />}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBooking(booking)}
                                isLoading={isReviewing}
                                leftIcon={<XCircleIcon className="h-4 w-4" />}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}

                          {canCancelBooking(booking) ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelBooking(booking)}
                              isLoading={isCancelling}
                            >
                              Cancel
                            </Button>
                          ) : null}

                          {canViewQrCode(booking) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewQrCode(booking)}
                              isLoading={isLoadingQr}
                              leftIcon={<QrCodeIcon className="h-4 w-4" />}
                            >
                              QR
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQr || isAdmin ? (
        <div className={`grid gap-6 ${selectedQr && isAdmin ? 'xl:grid-cols-2' : ''}`}>
          {selectedQr ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="theme-heading text-3xl">Booking QR Code</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedQr(null)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-medium">Resource:</span> {selectedQr.resourceName}
                  </p>
                  <p>
                    <span className="font-medium">Schedule:</span> {selectedQr.date} {selectedQr.startTime} - {selectedQr.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {selectedQr.status}
                  </p>
                </div>

                <div className="rounded-2xl border border-brand-sand/55 bg-white p-3 dark:border-brand-mist/15 dark:bg-brand-surface/50">
                  <img src={selectedQr.qrCodeImageDataUrl} alt="Booking QR code" className="mx-auto h-64 w-64 object-contain" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    QR Payload
                  </label>
                  <textarea
                    readOnly
                    rows={3}
                    value={selectedQr.qrPayload}
                    className="w-full rounded-xl border border-brand-sand/65 bg-brand-cream/35 px-3 py-2 text-xs text-brand-navy outline-none dark:border-brand-mist/20 dark:bg-brand-surface/35 dark:text-brand-cream"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Checked-in at: {selectedQr.checkedInAt ? formatDateTime(selectedQr.checkedInAt) : 'Not checked in'}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCopyQrPayload}>
                      Copy Payload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {isAdmin ? (
            <Card>
              <CardHeader>
                <h2 className="theme-heading text-3xl">QR Check-In Verification</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Paste a booking QR payload to validate and complete check-in.
                </p>
                <form className="space-y-3" onSubmit={handleVerifyCheckIn}>
                  <textarea
                    rows={3}
                    value={qrPayloadInput}
                    onChange={(event) => setQrPayloadInput(event.target.value)}
                    placeholder="SMART_CAMPUS_BOOKING::bookingId::token"
                    className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-xs text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                  />
                  <Button type="submit" isLoading={isVerifyingCheckIn} leftIcon={<QrCodeIcon className="h-4 w-4" />}>
                    Verify Check-In
                  </Button>
                </form>

                {verificationResult ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <p className="font-medium">Check-in complete for {verificationResult.resourceName}</p>
                    <p className="mt-1">{formatSchedule(verificationResult)}</p>
                    <p className="mt-1">Checked in at: {formatDateTime(verificationResult.checkedInAt)}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      <Modal
        isOpen={createBookingError != null}
        onClose={() => setCreateBookingError(null)}
        title={
          createBookingError && /capacity|exceed/i.test(createBookingError) ? 'Over capacity' : 'Cannot complete booking'
        }
        zIndexClassName="z-[60]"
        lockBodyScroll={false}
        footer={
          <Button type="button" variant="secondary" onClick={() => setCreateBookingError(null)}>
            OK
          </Button>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{createBookingError}</p>
      </Modal>

      {isCreateModalOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-brand-navy/35 backdrop-blur-[2px]"
            onClick={() => {
              if (!isSubmitting) {
                setIsCreateModalOpen(false);
              }
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="theme-heading text-3xl">Create Booking Request</h2>
                <Button variant="ghost" size="sm" disabled={isSubmitting} onClick={() => setIsCreateModalOpen(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="max-h-[75vh] overflow-y-auto">
                <form className="space-y-4" onSubmit={handleCreateBooking}>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Resource</label>
                    <select
                      value={form.resourceId}
                      onChange={(event) => setForm((previous) => ({ ...previous, resourceId: event.target.value }))}
                      disabled={isLoadingResources || filteredResources.length === 0}
                      className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                    >
                      {isLoadingResources ? <option>Loading resources...</option> : null}
                      {!isLoadingResources && filteredResources.length === 0 ? (
                        <option value="">No active resources available</option>
                      ) : null}
                      {filteredResources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} ({formatEnumLabel(resource.type)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
                        min={getTodayDateInputValue()}
                        required
                        className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(event) => {
                          const nextStartTime = event.target.value;
                          setForm((previous) => {
                            const nextEndTime =
                              previous.endTime && previous.endTime > nextStartTime
                                ? previous.endTime
                                : addMinutesToTime(nextStartTime, 30);

                            return {
                              ...previous,
                              startTime: nextStartTime,
                              endTime: nextEndTime
                            };
                          });
                        }}
                        required
                        className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(event) => setForm((previous) => ({ ...previous, endTime: event.target.value }))}
                        min={addMinutesToTime(form.startTime, 1)}
                        required
                        className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose</label>
                    <textarea
                      rows={3}
                      value={form.purpose}
                      onChange={(event) => setForm((previous) => ({ ...previous, purpose: event.target.value }))}
                      required
                      placeholder="Enter why you need this booking..."
                      className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Expected Attendees (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.expectedAttendees}
                      onChange={(event) => setForm((previous) => ({ ...previous, expectedAttendees: event.target.value }))}
                      className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      leftIcon={<CalendarCheckIcon className="h-4 w-4" />}
                      disabled={filteredResources.length === 0}
                    >
                      Submit Request
                    </Button>
                    <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
