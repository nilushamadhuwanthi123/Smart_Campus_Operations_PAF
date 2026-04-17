function Header() {
  return (
    <header className="rounded-3xl border border-white/50 bg-white/70 px-6 py-5 shadow-panel backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
            Smart Campus
          </p>
          <h1 className="text-3xl font-semibold text-primary">Facilities &amp; Assets</h1>
        </div>
        <div className="rounded-2xl bg-light px-4 py-3 text-sm text-primary/80">
          Live overview of campus resources and booking status
        </div>
      </div>
    </header>
  );
}

export default Header;
