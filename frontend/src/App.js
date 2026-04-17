import DashboardCard from './components/DashboardCard';
import DashboardStats from './components/DashboardStats';
import Header from './components/Header';
import ResourceList from './components/ResourceList';
import Sidebar from './components/Sidebar';

const resourceCards = [
  { title: 'Total Resources', value: '248', detail: 'Campus-wide', tone: 'primary' },
  { title: 'Available', value: '186', detail: 'Ready now', tone: 'light' },
  { title: 'Booked', value: '42', detail: 'Active use', tone: 'accent' },
  { title: 'Out of Service', value: '20', detail: 'Needs action', tone: 'secondary' },
];

function App() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />

        <section className="space-y-6">
          <Header />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {resourceCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>

          <DashboardStats />

          <ResourceList />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-panel backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
                    Overview
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-primary">
                    Resource Activity
                  </h3>
                </div>
                <span className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary">
                  Today
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  ['Labs', '38 rooms active'],
                  ['Classrooms', '72 scheduled bookings'],
                  ['Equipment', '14 maintenance alerts'],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-2xl bg-light p-5">
                    <p className="text-lg font-semibold text-primary">{label}</p>
                    <p className="mt-2 text-sm text-primary/70">{detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-primary p-6 text-white shadow-panel">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
                Status
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Operations Snapshot</h3>

              <div className="mt-8 space-y-4">
                {[
                  ['Facilities', '92% operational'],
                  ['Bookings', '18 pending approvals'],
                  ['Incidents', '6 open reports'],
                  ['Notifications', '24 new updates'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-secondary">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
