import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3Icon,
  Building2Icon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import {
  createResource,
  deleteResource,
  getResourceUsageAnalytics,
  getResources,
  updateResource
} from '../../api/resources';
import { useAuth } from '../../contexts/AuthContext';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];
const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const defaultFilterState = {
  search: '',
  type: 'ALL',
  status: 'ALL',
  location: '',
  minCapacity: '',
  maxCapacity: ''
};

function createDefaultWindow() {
  return {
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '17:00'
  };
}

function createInitialFormState() {
  return {
    id: '',
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    availabilityWindows: [createDefaultWindow()]
  };
}

function formatEnumLabel(value) {
  return (value || '')
    .toLowerCase()
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function mapResourceToForm(resource) {
  return {
    id: resource.id,
    name: resource.name || '',
    type: resource.type || 'LECTURE_HALL',
    capacity: String(resource.capacity || ''),
    location: resource.location || '',
    status: resource.status || 'ACTIVE',
    description: resource.description || '',
    availabilityWindows:
      resource.availabilityWindows && resource.availabilityWindows.length > 0
        ? resource.availabilityWindows.map((window) => ({
            dayOfWeek: window.dayOfWeek,
            startTime: window.startTime,
            endTime: window.endTime
          }))
        : [createDefaultWindow()]
  };
}

function getAvailabilitySummary(windows) {
  if (!windows || windows.length === 0) {
    return 'No availability windows';
  }

  const firstWindow = windows[0];
  const firstLabel = `${formatEnumLabel(firstWindow.dayOfWeek)} ${firstWindow.startTime}-${firstWindow.endTime}`;

  if (windows.length === 1) {
    return firstLabel;
  }

  return `${firstLabel} +${windows.length - 1} more`;
}

export function ResourceCataloguePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [filters, setFilters] = useState(defaultFilterState);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilterState);

  const [form, setForm] = useState(createInitialFormState);

  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = Boolean(form.id);

  const sortedResources = useMemo(
    () => [...resources].sort((left, right) => (left.name || '').localeCompare(right.name || '')),
    [resources]
  );

  const loadResources = async (nextFilters = appliedFilters) => {
    setIsLoadingResources(true);
    setErrorMessage('');

    try {
      const query = {
        search: nextFilters.search,
        type: nextFilters.type === 'ALL' ? undefined : nextFilters.type,
        status: nextFilters.status === 'ALL' ? undefined : nextFilters.status,
        location: nextFilters.location,
        minCapacity: nextFilters.minCapacity ? Number(nextFilters.minCapacity) : undefined,
        maxCapacity: nextFilters.maxCapacity ? Number(nextFilters.maxCapacity) : undefined
      };

      const response = await getResources(query);
      setResources(response || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load resources.');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const loadAnalytics = async () => {
    if (!isAdmin) {
      setAnalytics(null);
      return;
    }

    setIsLoadingAnalytics(true);

    try {
      const response = await getResourceUsageAnalytics();
      setAnalytics(response);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load analytics.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadResources(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    loadAnalytics();
  }, [isAdmin]);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilterState);
    setAppliedFilters(defaultFilterState);
  };

  const handleWindowFieldChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      availabilityWindows: previous.availabilityWindows.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleAddWindow = () => {
    setForm((previous) => ({
      ...previous,
      availabilityWindows: [...previous.availabilityWindows, createDefaultWindow()]
    }));
  };

  const handleRemoveWindow = (index) => {
    setForm((previous) => {
      if (previous.availabilityWindows.length === 1) {
        return previous;
      }

      return {
        ...previous,
        availabilityWindows: previous.availabilityWindows.filter((_, entryIndex) => entryIndex !== index)
      };
    });
  };

  const resetForm = () => {
    setForm(createInitialFormState());
  };

  const handleEditResource = (resource) => {
    setSuccessMessage('');
    setErrorMessage('');
    setForm(mapResourceToForm(resource));
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSaveResource = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const parsedCapacity = Number(form.capacity);
    if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
      setErrorMessage('Capacity must be at least 1.');
      return;
    }

    const payload = {
      name: form.name,
      type: form.type,
      capacity: parsedCapacity,
      location: form.location,
      availabilityWindows: form.availabilityWindows,
      status: form.status,
      description: form.description
    };

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateResource(form.id, payload);
        setSuccessMessage('Resource updated successfully.');
      } else {
        await createResource(payload);
        setSuccessMessage('Resource created successfully.');
      }

      resetForm();
      await loadResources(appliedFilters);
      await loadAnalytics();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Delete ${resource.name}?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteResource(resource.id);
      setSuccessMessage('Resource deleted successfully.');

      if (form.id === resource.id) {
        resetForm();
      }

      await loadResources(appliedFilters);
      await loadAnalytics();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="theme-kicker mb-2">Facilities and Assets</p>
        <h1 className="theme-heading text-5xl">Resource Catalogue</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Browse lecture halls, labs, meeting rooms, and equipment with live availability metadata.
        </p>
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

      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-cream shadow-soft">
                <Building2Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Resources</p>
                <h3 className="theme-heading text-4xl leading-none">{analytics?.totalResources ?? 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand-navy shadow-soft">
                <FilterIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Resources</p>
                <h3 className="theme-heading text-4xl leading-none">{analytics?.activeResources ?? 0}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-navy shadow-soft dark:bg-brand-surface-hover dark:text-brand-cream">
                <BarChart3Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tracked Bookings</p>
                <h3 className="theme-heading text-4xl leading-none">{analytics?.totalBookings ?? 0}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="theme-kicker mb-1 !tracking-[0.18em]">Search and Filter</p>
            <h2 className="theme-heading text-3xl">Find Resources</h2>
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCwIcon className="h-4 w-4" />} onClick={() => loadResources(appliedFilters)}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-7" onSubmit={handleApplyFilters}>
            <div className="relative xl:col-span-2">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, type, location..."
                value={filters.search}
                onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
                className="w-full rounded-xl border border-brand-sand/65 bg-white/70 py-2.5 pl-9 pr-4 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
              />
            </div>

            <select
              value={filters.type}
              onChange={(event) => setFilters((previous) => ({ ...previous, type: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            >
              <option value="ALL">All Types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            >
              <option value="ALL">All Statuses</option>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(event) => setFilters((previous) => ({ ...previous, location: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            />

            <input
              type="number"
              min="1"
              placeholder="Min capacity"
              value={filters.minCapacity}
              onChange={(event) => setFilters((previous) => ({ ...previous, minCapacity: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            />

            <input
              type="number"
              min="1"
              placeholder="Max capacity"
              value={filters.maxCapacity}
              onChange={(event) => setFilters((previous) => ({ ...previous, maxCapacity: event.target.value }))}
              className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
            />

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

      <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[0.95fr_1.35fr]' : ''}`}>
        {isAdmin ? (
          <Card>
            <CardHeader>
              <h2 className="theme-heading text-3xl">{isEditing ? 'Edit Resource' : 'Create Resource'}</h2>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveResource}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                    required
                    className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <select
                      value={form.type}
                      onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value }))}
                      className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatEnumLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(event) => setForm((previous) => ({ ...previous, capacity: event.target.value }))}
                      required
                      className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => setForm((previous) => ({ ...previous, location: event.target.value }))}
                    required
                    className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}
                    className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                  >
                    {RESOURCE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatEnumLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Availability Windows</label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddWindow} leftIcon={<PlusIcon className="h-4 w-4" />}>
                      Add
                    </Button>
                  </div>

                  {form.availabilityWindows.map((window, index) => (
                    <div
                      key={`${window.dayOfWeek}-${window.startTime}-${window.endTime}-${index}`}
                      className="grid gap-2 rounded-xl border border-brand-sand/55 p-3 dark:border-brand-mist/15 sm:grid-cols-[1fr_0.9fr_0.9fr_auto]"
                    >
                      <select
                        value={window.dayOfWeek}
                        onChange={(event) => handleWindowFieldChange(index, 'dayOfWeek', event.target.value)}
                        className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      >
                        {WEEK_DAYS.map((day) => (
                          <option key={day} value={day}>
                            {formatEnumLabel(day)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={window.startTime}
                        onChange={(event) => handleWindowFieldChange(index, 'startTime', event.target.value)}
                        className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      />

                      <input
                        type="time"
                        value={window.endTime}
                        onChange={(event) => handleWindowFieldChange(index, 'endTime', event.target.value)}
                        className="rounded-xl border border-brand-sand/65 bg-white/70 px-3 py-2 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="self-center"
                        onClick={() => handleRemoveWindow(index)}
                        disabled={form.availabilityWindows.length === 1}
                        leftIcon={<XIcon className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                    className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" isLoading={isSubmitting} leftIcon={<PlusIcon className="h-4 w-4" />}>
                    {isEditing ? 'Update Resource' : 'Create Resource'}
                  </Button>
                  {isEditing ? (
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5 text-brand-navy dark:text-brand-mist" />
              <h2 className="theme-heading text-3xl">Catalogue</h2>
            </div>
            <Badge variant="info">{sortedResources.length} resources</Badge>
          </CardHeader>

          <CardContent className="p-0">
            {isLoadingResources ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading resources...</div>
            ) : sortedResources.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No resources found for selected filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] divide-y divide-brand-sand/45 dark:divide-brand-mist/15">
                  <thead>
                    <tr className="bg-brand-cream/35 text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-brand-surface/35 dark:text-slate-400">
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Availability</th>
                      <th className="px-4 py-3">Status</th>
                      {isAdmin ? <th className="px-4 py-3">Actions</th> : null}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-brand-sand/35 dark:divide-brand-mist/10">
                    {sortedResources.map((resource) => (
                      <tr key={resource.id} className="text-sm">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{resource.name}</p>
                          {resource.description ? (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">{resource.description}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatEnumLabel(resource.type)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{resource.capacity}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{resource.location}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {getAvailabilitySummary(resource.availabilityWindows)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={resource.status} />
                        </td>
                        {isAdmin ? (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditResource(resource)}
                                leftIcon={<PencilIcon className="h-4 w-4" />}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteResource(resource)}
                                leftIcon={<Trash2Icon className="h-4 w-4" />}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="theme-heading text-3xl">Top Resources</h2>
              {isLoadingAnalytics ? <Badge variant="default">Loading...</Badge> : null}
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics?.topResources?.length ? (
                analytics.topResources.map((entry, index) => (
                  <div
                    key={entry.resourceId}
                    className="flex items-center justify-between rounded-xl border border-brand-sand/50 bg-white/55 px-4 py-3 dark:border-brand-mist/15 dark:bg-brand-surface/45"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{index + 1}. {entry.resourceName}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        {formatEnumLabel(entry.resourceType)} • {entry.location}
                      </p>
                    </div>
                    <Badge variant="success">{entry.bookingCount} bookings</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No booking usage data yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="theme-heading text-3xl">Peak Booking Hours</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics?.peakBookingHours?.length ? (
                analytics.peakBookingHours.map((entry) => (
                  <div
                    key={entry.hour}
                    className="flex items-center justify-between rounded-xl border border-brand-sand/50 bg-white/55 px-4 py-3 dark:border-brand-mist/15 dark:bg-brand-surface/45"
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-100">{entry.hour}</p>
                    <Badge variant="info">{entry.bookingCount} bookings</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No peak-hour data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
