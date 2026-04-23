import React, { useEffect, useState } from 'react';
import { PlusIcon, RefreshCwIcon, ShieldIcon, UsersIcon } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { createUser, getUsers } from '../../api/users';

const initialForm = {
  fullName: '',
  phoneNumber: '',
  email: '',
  temporaryPassword: '',
  role: 'STUDENT'
};

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!form.email.endsWith('@gmail.com')) {
      setErrorMessage('Email must end with @gmail.com');
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      setErrorMessage('Phone number must be exactly 10 digits');
      return;
    }

    setIsCreating(true);

    try {
      await createUser(form);
      setSuccessMessage('User account created successfully.');
      setForm(initialForm);
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create user.');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'ADMIN') return 'warning';
    if (role === 'TECHNICIAN') return 'info';
    return 'default';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="theme-kicker mb-2">Administration</p>
        <h1 className="theme-heading text-5xl">User Access</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Register platform users and assign role-based permissions.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader>
            <h2 className="theme-heading text-3xl">Create User</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  required
                  pattern="^[0-9]{10}$"
                  title="Phone number must be exactly 10 digits"
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                  placeholder="user@gmail.com"
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Temporary Password</label>
                <input
                  type="password"
                  value={form.temporaryPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, temporaryPassword: event.target.value }))}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <Button type="submit" className="w-full" isLoading={isCreating} leftIcon={<PlusIcon className="h-4 w-4" />}>
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-brand-navy dark:text-brand-mist" />
              <h2 className="theme-heading text-3xl">Registered Users</h2>
            </div>
            <Button variant="outline" size="sm" onClick={loadUsers} leftIcon={<RefreshCwIcon className="h-4 w-4" />}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] divide-y divide-brand-sand/45 dark:divide-brand-mist/15">
                  <thead>
                    <tr className="bg-brand-cream/35 text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:bg-brand-surface/35 dark:text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand/35 dark:divide-brand-mist/10">
                    {users.map((entry) => (
                      <tr key={entry.id} className="text-sm">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ShieldIcon className="h-4 w-4 text-brand-mist" />
                            <span className="font-medium text-slate-800 dark:text-slate-100">{entry.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.email}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.phoneNumber}</td>
                        <td className="px-4 py-3">
                          <Badge variant={getRoleBadgeVariant(entry.role)}>{entry.role}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
