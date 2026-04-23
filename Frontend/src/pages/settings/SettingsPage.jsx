import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Monitor, Moon, Palette, Save, Smartphone, Sun, UserCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateMyProfile } from '../../api/users';

const tabs = [
  { id: 'PROFILE', label: 'Profile', icon: <UserCircle2 className="h-4 w-4" /> },
  { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'APPEARANCE', label: 'Appearance', icon: <Palette className="h-4 w-4" /> }
];

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, replaceUser } = useAuth();

  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhoneNumber(user?.phoneNumber || '');
  }, [user?.fullName, user?.phoneNumber]);

  const handleProfileSave = async () => {
    if (!fullName || !phoneNumber) {
      setErrorMessage('Full name and phone number are required.');
      return;
    }
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setErrorMessage('Phone number must be exactly 10 digits');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updated = await updateMyProfile({ fullName, phoneNumber });
      replaceUser(updated);
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceSave = () => {
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage('Preferences saved.');
    }, 700);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your profile and workspace preferences.</p>
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

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full flex-shrink-0 space-y-1 md:w-64">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-purple/10 text-brand-purple dark:bg-purple-900/20 dark:text-purple-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'PROFILE' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your details. Email cannot be changed.</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      pattern="^[0-9]{10}$"
                      title="Phone number must be exactly 10 digits"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button variant="primary" onClick={handleProfileSave} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                    Save Profile
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'NOTIFICATIONS' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose how and when you receive updates.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ToggleCard
                    icon={<Bell className="h-5 w-5" />}
                    title="In-app Notifications"
                    description="Show status updates in the platform."
                  />
                  <ToggleCard
                    icon={<Smartphone className="h-5 w-5" />}
                    title="Push Notifications"
                    description="Get real-time alerts on your device."
                  />
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-100 pt-6 dark:border-slate-800">
                  <Button variant="primary" onClick={handlePreferenceSave} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'APPEARANCE' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Customize the interface theme.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <button
                      onClick={() => isDark && toggleTheme()}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        !isDark
                          ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <Sun className={`mb-3 h-6 w-6 ${!isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                      <p className="font-medium text-slate-900 dark:text-white">Light Mode</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Clean and bright</p>
                    </button>

                    <button
                      onClick={() => !isDark && toggleTheme()}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isDark
                          ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                      }`}
                    >
                      <Moon className={`mb-3 h-6 w-6 ${isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                      <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Easy on the eyes</p>
                    </button>

                    <button className="cursor-not-allowed rounded-xl border-2 border-slate-200 p-4 text-left opacity-50 dark:border-slate-700">
                      <Monitor className="mb-3 h-6 w-6 text-slate-400" />
                      <p className="font-medium text-slate-900 dark:text-white">System</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Matches your device</p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ icon, title, description }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-brand-blue dark:bg-blue-900/20">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" defaultChecked />
        <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-purple peer-checked:after:translate-x-full dark:bg-slate-700" />
      </label>
    </div>
  );
}
