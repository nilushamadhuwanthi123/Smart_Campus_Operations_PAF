import { useState } from 'react';
import DashboardStats from './components/DashboardStats';
import Header from './components/Header';
import ResourceList from './components/ResourceList';
import Sidebar from './components/Sidebar';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState("dashboard");

  const handleResourcesChanged = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main
      className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
        darkMode
          ? "bg-[#0f172a] text-white"
          : "bg-[#f0f0db] text-[#30364f]"
      }`}
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

        {/* Sidebar */}
        <Sidebar darkMode={darkMode} page={page} setPage={setPage} />

        <section className="space-y-6">

          {/* Header */}
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            page={page}
          />

          {/* Pages */}
          {page === "dashboard" && (
            <>
              <DashboardStats refreshKey={refreshKey} />
              <ResourceList onResourcesChanged={handleResourcesChanged} />
            </>
          )}

          {page === "resources" && (
            <ResourceList onResourcesChanged={handleResourcesChanged} />
          )}

        </section>
      </div>
    </main>
  );
}

export default App;