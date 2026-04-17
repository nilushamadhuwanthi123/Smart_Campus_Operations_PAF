import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    outOfService: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/resources/stats');
      const data = response.data ?? {};
      setStats({
        total: data.total ?? 0,
        available: data.available ?? 0,
        booked: data.booked ?? 0,
        outOfService: data.outOfService ?? 0,
      });
    } catch (fetchError) {
      setError('Unable to load stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    if (active) {
      fetchStats();
    }

    const intervalId = window.setInterval(() => {
      if (!active) return;
      fetchStats();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const statCards = [
    { label: 'Total', value: stats.total, tone: 'primary' },
    { label: 'Available', value: stats.available, tone: 'emerald' },
    { label: 'Booked', value: stats.booked, tone: 'amber' },
    { label: 'Out of Service', value: stats.outOfService, tone: 'rose' },
  ];

  const toneStyles = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };

  return (
    <section className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
            Dashboard Stats
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-primary">Live resource metrics</h3>
        </div>
        {loading && <p className="text-sm text-primary/70">Refreshing...</p>}
      </div>

      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-50 px-4 py-5 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneStyles[card.tone]}`}>
                {card.label}
              </p>
              <p className="mt-5 text-4xl font-semibold text-primary">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardStats;
