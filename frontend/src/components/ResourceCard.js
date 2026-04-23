import React from 'react';

const statusStyles = {
  Available: 'bg-emerald-100 text-emerald-700',
  Booked: 'bg-amber-100 text-amber-700',
  'Out of Service': 'bg-rose-100 text-rose-700',
};

function ResourceCard({ resource, onEdit, onDelete }) {
  const badgeClass = statusStyles[resource.status] ?? 'bg-slate-100 text-slate-700';

  return (
    <article className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-panel transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/55">
            {resource.resourceCode || 'No Code'}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-primary">{resource.name}</h3>
          <p className="mt-2 text-sm text-primary/70">
            {resource.type} / {resource.location}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}
        >
          {resource.status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-light px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/55">
            Capacity
          </p>
          <p className="mt-2 text-base font-medium text-primary">{resource.capacity}</p>
        </div>

        <div className="rounded-2xl bg-light px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/55">
            Availability
          </p>
          <p className="mt-2 text-base font-medium text-primary">{resource.availabilityWindow}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => onEdit(resource)}
          className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/10"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(resource)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default ResourceCard;
