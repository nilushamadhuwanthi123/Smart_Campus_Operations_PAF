function Sidebar({ darkMode, page, setPage }) {
  return (
    <aside
      className={`flex flex-col justify-between rounded-3xl px-6 py-8 shadow-panel h-full ${
        darkMode ? "bg-[#1e293b] text-white" : "bg-[#2f3654] text-white"
      }`}
    >
      {/* TOP */}
      <div>
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">
            Workspace
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Campus Hub</h2>
        </div>

        <nav className="space-y-3">

          {/* Dashboard */}
          <button
            onClick={() => setPage("dashboard")}
            className={`w-full flex justify-between rounded-2xl px-4 py-3 ${
              page === "dashboard"
                ? "bg-accent text-primary"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Dashboard
          </button>

          {/* Resources */}
          <button
            onClick={() => setPage("resources")}
            className={`w-full flex justify-between rounded-2xl px-4 py-3 ${
              page === "resources"
                ? "bg-accent text-primary"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Resources
          </button>

        </nav>
      </div>

      {/* LOGOUT */}
      <button
        onClick={() => alert("Logged out")}
        className="mt-10 w-full rounded-2xl bg-red-500 px-4 py-3 text-white hover:bg-red-600 transition"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;