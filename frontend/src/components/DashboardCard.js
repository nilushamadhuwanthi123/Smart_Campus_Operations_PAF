function DashboardCard({ title, value, detail, tone }) {
  const toneStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary/25 text-primary',
    accent: 'bg-accent/60 text-primary',
    light: 'bg-light text-primary',
  };

  return (
    <article className={`rounded-3xl p-5 shadow-panel ${toneStyles[tone]}`}>
      <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">{title}</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <h2 className="text-4xl font-semibold">{value}</h2>
        <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          {detail}
        </span>
      </div>
    </article>
  );
}

export default DashboardCard;
