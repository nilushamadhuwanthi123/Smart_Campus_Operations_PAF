import React, { useEffect, useState } from 'react';

const resourceTypes = ['Meeting Room', 'Lecture Hall', 'Lab', 'Equipment', 'Office'];
const resourceStatuses = ['Available', 'Booked', 'Out of Service'];

function ResourceForm({ open, onClose, onSubmit, resource, existingResources = [] }) {
  const [resourceCode, setResourceCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState(resourceTypes[0]);
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState(resourceStatuses[0]);
  const [availabilityWindow, setAvailabilityWindow] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (resource) {
      setResourceCode(resource.resourceCode ?? '');
      setName(resource.name ?? '');
      setType(resource.type && resourceTypes.includes(resource.type) ? resource.type : resourceTypes[0]);
      setCapacity(resource.capacity ?? '');
      setLocation(resource.location ?? '');
      setStatus(resource.status && resourceStatuses.includes(resource.status) ? resource.status : resourceStatuses[0]);
      setAvailabilityWindow(resource.availabilityWindow ?? '');
      setImageFile(null);
      setFormError(null);
      setFieldErrors({});
    } else {
      setResourceCode('');
      setName('');
      setType(resourceTypes[0]);
      setCapacity('');
      setLocation('');
      setStatus(resourceStatuses[0]);
      setAvailabilityWindow('');
      setImageFile(null);
      setFormError(null);
      setFieldErrors({});
    }
  }, [open, resource]);

  if (!open) return null;

  const isEditMode = Boolean(resource?.id);

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case 'resourceCode':
        if (!value.trim()) {
          errors.resourceCode = 'Resource code is required';
        } else {
          // Check uniqueness (exclude current resource in edit mode)
          const isDuplicate = existingResources.some(r =>
            r.resourceCode === value.trim() && r.id !== resource?.id
          );
          if (isDuplicate) {
            errors.resourceCode = 'Resource code must be unique';
          } else {
            delete errors.resourceCode;
          }
        }
        break;
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else {
          delete errors.name;
        }
        break;
      case 'capacity':
        if (!value.toString().trim()) {
          errors.capacity = 'Capacity is required';
        } else if (Number(value) <= 0) {
          errors.capacity = 'Capacity must be greater than 0';
        } else {
          delete errors.capacity;
        }
        break;
      case 'location':
        if (!value.trim()) {
          errors.location = 'Location is required';
        } else {
          delete errors.location;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleFieldChange = (fieldName, value) => {
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Update field value
    switch (fieldName) {
      case 'resourceCode':
        setResourceCode(value);
        break;
      case 'name':
        setName(value);
        break;
      case 'capacity':
        setCapacity(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'availabilityWindow':
        setAvailabilityWindow(value);
        break;
      default:
        break;
    }
  };

  const handleFieldBlur = (fieldName) => {
    // Validate field on blur
    switch (fieldName) {
      case 'resourceCode':
        validateField('resourceCode', resourceCode);
        break;
      case 'name':
        validateField('name', name);
        break;
      case 'capacity':
        validateField('capacity', capacity);
        break;
      case 'location':
        validateField('location', location);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    // Validate all required fields
    validateField('resourceCode', resourceCode);
    validateField('name', name);
    validateField('capacity', capacity);
    validateField('location', location);

    // Check if there are any validation errors
    if (Object.keys(fieldErrors).length > 0) {
      setFormError('Please fix the validation errors below.');
      return;
    }

    const payload = {
      resourceCode: resourceCode.trim(),
      name: name.trim(),
      type,
      capacity: Number(capacity) || capacity,
      location: location.trim(),
      status,
      availabilityWindow: availabilityWindow.trim(),
      imageName: imageFile?.name ?? resource?.imageName ?? null,
    };

    try {
      setSaving(true);
      await onSubmit(payload, resource?.id);
      onClose();
    } catch (submitError) {
      setFormError('Failed to save resource. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:ring-2 focus:ring-primary/20";
    const hasError = fieldErrors[fieldName];
    return hasError
      ? `${baseClass} border-red-300 focus:border-red-500`
      : `${baseClass} border-slate-200 focus:border-primary`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
              {isEditMode ? 'Edit Resource' : 'Add Resource'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">
              {isEditMode ? 'Update resource details' : 'New resource details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          {formError && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {formError}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Resource Code *</span>
              <input
                value={resourceCode}
                onChange={(e) => handleFieldChange('resourceCode', e.target.value)}
                onBlur={() => handleFieldBlur('resourceCode')}
                className={getInputClassName('resourceCode')}
                placeholder="Unique resource code"
              />
              {fieldErrors.resourceCode && (
                <p className="text-red-500 text-sm">{fieldErrors.resourceCode}</p>
              )}
            </label>

            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Name *</span>
              <input
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                className={getInputClassName('name')}
                placeholder="Resource name"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm">{fieldErrors.name}</p>
              )}
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {resourceTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Capacity *</span>
              <input
                type="number"
                value={capacity}
                onChange={(e) => handleFieldChange('capacity', e.target.value)}
                onBlur={() => handleFieldBlur('capacity')}
                className={getInputClassName('capacity')}
                placeholder="Number of people"
              />
              {fieldErrors.capacity && (
                <p className="text-red-500 text-sm">{fieldErrors.capacity}</p>
              )}
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Location *</span>
              <input
                value={location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                onBlur={() => handleFieldBlur('location')}
                className={getInputClassName('location')}
                placeholder="Building / room"
              />
              {fieldErrors.location && (
                <p className="text-red-500 text-sm">{fieldErrors.location}</p>
              )}
            </label>

            <label className="space-y-2 text-sm text-primary/90">
              <span className="font-medium">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {resourceStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2 text-sm text-primary/90">
            <span className="font-medium">Availability window</span>
            <input
              value={availabilityWindow}
              onChange={(e) => handleFieldChange('availabilityWindow', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Mon-Fri 08:00 - 18:00"
            />
          </div>

          <div className="space-y-2 text-sm text-primary/90">
            <span className="font-medium">Image upload</span>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-primary hover:text-primary">
              <span>{imageFile?.name ?? resource?.imageName ?? 'Choose image file (UI only)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Saving…' : isEditMode ? 'Update Resource' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceForm;
