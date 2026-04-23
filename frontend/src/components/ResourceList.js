import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard';
import ResourceForm from './ResourceForm';
import { API_BASE_URL, getApiErrorMessage } from '../lib/api';

function normalizeResource(resource) {
  return {
    id: resource.id,
    resourceCode: resource.resourceCode || '',
    name: resource.name || '',
    type: resource.type || '',
    capacity: resource.capacity ?? '',
    location: resource.location || '',
    status: resource.status || 'Available',
    availabilityWindow: resource.availabilityWindow || '',
  };
}

function ResourceList({ onResourcesChanged }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filterOptions = ['All', 'Lecture Hall', 'Lab', 'Meeting Room', 'Equipment'];

  const fetchResources = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_BASE_URL}/resources`);
      const nextResources = Array.isArray(response.data)
        ? response.data.map(normalizeResource)
        : [];
      setResources(nextResources);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError, 'Unable to load resources.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        normalizedQuery === '' ||
        resource.name.toLowerCase().includes(normalizedQuery) ||
        resource.resourceCode.toLowerCase().includes(normalizedQuery);
      const matchesType = selectedType === 'All' || resource.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, selectedType]);

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
    try {
      setError('');
      if (resourceId) {
        const response = await axios.put(`${API_BASE_URL}/resources/${resourceId}`, payload);
        const updatedResource = normalizeResource(response.data);
        setResources((current) =>
          current.map((item) => (item.id === resourceId ? updatedResource : item))
        );
        onResourcesChanged?.();
        return updatedResource;
      }

      const response = await axios.post(`${API_BASE_URL}/resources`, payload);
      const savedResource = normalizeResource(response.data);
      setResources((current) => [savedResource, ...current]);
      onResourcesChanged?.();
      return savedResource;
    } catch (submitError) {
      const errorMsg = getApiErrorMessage(submitError, 'Failed to save resource.');
      setError(errorMsg);
      console.error('Submit Error:', submitError);
      throw submitError;
    }
  };

  const handleDeleteResource = async (resource) => {
    const confirmed = window.confirm(`Delete resource "${resource.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/resources/${resource.id}`);
      setResources((current) => current.filter((item) => item.id !== resource.id));
      onResourcesChanged?.();
      setError('');
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Unable to delete resource.'));
    }
  };

  return (
    <section className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">
            Resources
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-primary">Resource Inventory</h3>
        </div>

        <button
          type="button"
          onClick={handleOpenForm}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add Resource
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block">
          <span className="sr-only">Search resources</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name or code"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
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
          No resources found.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id ?? resource.resourceCode}
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
