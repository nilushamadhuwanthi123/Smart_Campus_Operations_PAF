const menuItems = ['Facilities', 'Bookings', 'Incidents', 'Notifications'];

function Sidebar() {
  return (
    <aside className="rounded-3xl bg-primary px-6 py-8 text-white shadow-panel">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary">Workspace</p>
        <h2 className="mt-3 text-2xl font-semibold">Campus Hub</h2>
      </div>

      <nav>
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                  index === 0
                    ? 'bg-accent text-primary'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{item}</span>
                <span className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
