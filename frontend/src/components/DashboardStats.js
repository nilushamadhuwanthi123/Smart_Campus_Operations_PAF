import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, getApiErrorMessage } from '../lib/api';

const toneStyles = {
  primary: 'bg-primary text-white',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
};

function DashboardStats({ refreshKey }) {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    outOfService: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchStats() {
      try {
        setError('');
        const response = await axios.get(`${API_BASE_URL}/resources/stats`);
        if (!active) {
          return;
        }
        setStats({
          total: response.data?.totalCount || 0,
          available: response.data?.availableCount || 0,
          booked: response.data?.bookedCount || 0,
          outOfService: response.data?.outOfServiceCount || 0,
        });
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setError(getApiErrorMessage(fetchError, 'Unable to load stats.'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const cards = [
    {
      label: 'Total Resources',
      value: stats.total,
      detail: 'Campus-wide',
      tone: 'primary',
    },
    {
      label: 'Available',
      value: stats.available,
      detail: 'Ready now',
      tone: 'emerald',
    },
    {
      label: 'Booked',
      value: stats.booked,
      detail: 'Active use',
      tone: 'amber',
    },
    {
      label: 'Out of Service',
      value: stats.outOfService,
      detail: 'Needs action',
      tone: 'rose',
    },
  ];

  return (
    <section className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
            Dashboard
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-primary">Live resource metrics</h3>
        </div>

        {loading ? <p className="text-sm text-primary/70">Loading metrics...</p> : null}
      </div>

      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-5 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className={`rounded-3xl p-5 shadow-sm ${toneStyles[card.tone]}`}>
              <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">
                {card.label}
              </p>
              <div className="mt-6 flex items-end justify-between gap-4">
                <h2 className="text-4xl font-semibold">{card.value}</h2>
                <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                  {card.detail}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardStats;
