import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard';
import ResourceForm from './ResourceForm';

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filterOptions = ['All', 'Lecture Hall', 'Lab', 'Meeting Room', 'Equipment'];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredResources = resources.filter((resource) => {
    const name = (resource.name ?? resource.resourceName ?? '').toString().toLowerCase();
    const type = (resource.type ?? resource.category ?? '').toString();
    const matchesSearch = normalizedQuery === '' || name.includes(normalizedQuery);
    const matchesType = selectedType === 'All' || type === selectedType;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    let active = true;

    async function fetchResources() {
      try {
        const response = await axios.get('http://localhost:8080/api/resources');
        if (!active) return;
        setResources(Array.isArray(response.data) ? response.data : []);
      } catch (fetchError) {
        if (!active) return;
        setError('Unable to load resources.');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchResources();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenForm = () => {
    setSelectedResource(null);
    setIsFormOpen(true);
  };

  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedResource(null);
    setIsFormOpen(false);
  };

  const handleSubmitResource = async (payload, resourceId) => {
    if (resourceId) {
      const response = await axios.put(`http://localhost:8080/api/resources/${resourceId}`, payload);
      const updatedResource = response.data ?? { ...payload, id: resourceId };
      setResources((current) => current.map((item) => (item.id === resourceId ? updatedResource : item)));
      return updatedResource;
    }

    const response = await axios.post('http://localhost:8080/api/resources', payload);
    const savedResource = response.data ?? payload;
    setResources((current) => [savedResource, ...current]);
    return savedResource;
  };

  const handleDeleteResource = async (resource) => {
    if (!resource?.id) return;

    const confirmed = window.confirm(`Delete resource "${resource.name ?? 'this resource'}"?`);
    if (!confirmed) return;

    await axios.delete(`http://localhost:8080/api/resources/${resource.id}`);
    setResources((current) => current.filter((item) => item.id !== resource.id));
  };

  return (
    <section className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
            Resources
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-primary">Resource Inventory</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-primary/70">Updated from the facilities API</p>
          <button
            type="button"
            onClick={handleOpenForm}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Add Resource
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedType(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedType === option
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-white text-primary hover:bg-slate-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl bg-light p-8 text-center text-sm font-medium text-primary/70">
          Loading resources...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-3xl bg-rose-50 p-8 text-center text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-light p-8 text-center text-sm font-medium text-primary/80">
          No resources match your search or filter.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id ?? resource.name}
              resource={resource}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}

      <ResourceForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitResource}
        resource={selectedResource}
        existingResources={resources}
      />
    </section>
  );
}

export default ResourceList;
