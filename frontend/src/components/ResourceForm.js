import React, { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../lib/api';

const resourceTypes = ['Meeting Room', 'Lecture Hall', 'Lab', 'Equipment'];
const resourceStatuses = ['Available', 'Booked', 'Out of Service'];

const emptyFormData = {
  resourceCode: '',
  name: '',
  type: resourceTypes[0],
  capacity: '',
  location: '',
  status: resourceStatuses[0],
  availabilityWindow: '',
};

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-primary">
        {label}
        {required ? ' *' : ''}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ResourceForm({ open, onClose, onSubmit, resource, existingResources = [] }) {
  const [formData, setFormData] = useState(emptyFormData);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!resource) {
      setFormData(emptyFormData);
      setError('');
      return;
    }

    setFormData({
      resourceCode: resource.resourceCode || '',
      name: resource.name || '',
      type: resource.type || resourceTypes[0],
      capacity: resource.capacity?.toString() || '',
      location: resource.location || '',
      status: resource.status || resourceStatuses[0],
      availabilityWindow: resource.availabilityWindow || '',
    });
    setError('');
  }, [open, resource]);

  if (!open) {
    return null;
  }

  const inputClassName =
    'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (!formData.resourceCode.trim()) {
      return 'Resource code is required.';
    }
    if (!formData.name.trim()) {
      return 'Name is required.';
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      return 'Capacity must be greater than 0.';
    }
    if (!formData.location.trim()) {
      return 'Location is required.';
    }
    if (!formData.availabilityWindow.trim()) {
      return 'Availability window is required.';
    }

    const duplicateCode = existingResources.some(
      (item) =>
        item.resourceCode?.trim().toLowerCase() === formData.resourceCode.trim().toLowerCase() &&
        item.id !== resource?.id
    );

    if (duplicateCode) {
      return 'Resource code must be unique.';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      await onSubmit(
        {
          resourceCode: formData.resourceCode.trim(),
          name: formData.name.trim(),
          type: formData.type,
          capacity: Number(formData.capacity),
          location: formData.location.trim(),
          status: formData.status,
          availabilityWindow: formData.availabilityWindow.trim(),
        },
        resource?.id
      );

      onClose();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Failed to save resource.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-4xl rounded-[28px] border border-white/60 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/55">
              Resource Form
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">
              {resource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-primary/70 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Resource Code" required>
              <input
                name="resourceCode"
                value={formData.resourceCode}
                onChange={handleChange}
                className={inputClassName}
                placeholder="SC-RES-001"
              />
            </Field>

            <Field label="Name" required>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Main Lecture Hall"
              />
            </Field>

            <Field label="Type" required>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClassName}
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Capacity" required>
              <input
                type="number"
                min="1"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className={inputClassName}
                placeholder="120"
              />
            </Field>

            <Field label="Location" required>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Engineering Block A"
              />
            </Field>

            <Field label="Status" required>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClassName}
              >
                {resourceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Availability Window" required>
            <input
              name="availabilityWindow"
              value={formData.availabilityWindow}
              onChange={handleChange}
              className={inputClassName}
              placeholder="08:00 - 17:00"
            />
          </Field>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-primary/70 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : resource ? 'Update Resource' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceForm;
