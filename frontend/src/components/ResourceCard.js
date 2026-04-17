import React from 'react';

const statusStyles = {
  Available: 'bg-emerald-100 text-emerald-700',
  Booked: 'bg-amber-100 text-amber-700',
  'Out of Service': 'bg-rose-100 text-rose-700',
};

function ResourceCard({ resource, onEdit, onDelete }) {
  const name = resource.name ?? resource.resourceName ?? 'Unknown Resource';
  const type = resource.type ?? resource.category ?? 'Unknown Type';
  const location = resource.location ?? resource.room ?? 'Unknown Location';
  const capacity = resource.capacity ?? resource.seats ?? 'N/A';
  const status = resource.status ?? 'Available';
  const badgeClass = statusStyles[status] ?? 'bg-slate-100 text-slate-700';

  return (
    <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-panel transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
            {type}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-primary">{name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-4 text-sm text-primary/80">
        <div className="rounded-2xl bg-light px-4 py-3">
          <p className="font-medium text-primary">Location</p>
          <p className="mt-1">{location}</p>
        </div>
        <div className="rounded-2xl bg-light px-4 py-3">
          <p className="font-medium text-primary">Capacity</p>
          <p className="mt-1">{capacity}</p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/10"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(resource)}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default ResourceCard;
