import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Monitor, Moon, Palette, Save, Smartphone, Sun, Wrench } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';

const tabs = [
  { id: 'PREFERENCES', label: 'Workspace', icon: <Wrench className="w-4 h-4" /> },
  { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'APPEARANCE', label: 'Appearance', icon: <Palette className="w-4 h-4" /> }
];

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('PREFERENCES');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure workspace and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
            {activeTab === 'PREFERENCES' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Workspace Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tune defaults for ticket operations.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Ticket Priority</label>
                      <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Category</label>
                      <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                        <option>Hardware</option>
                        <option>Facilities</option>
                        <option>Supplies</option>
                        <option>Software</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-refresh Interval</label>
                    <select className="w-full md:w-64 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white">
                      <option>15 seconds</option>
                      <option>30 seconds</option>
                      <option>1 minute</option>
                      <option>5 minutes</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button variant="primary" onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === 'NOTIFICATIONS' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose how and when you want updates.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Channels</h3>

                    <ToggleCard
                      icon={<Bell className="w-5 h-5" />}
                      title="In-app Notifications"
                      description="Show status updates in the platform."
                    />
                    <ToggleCard
                      icon={<Smartphone className="w-5 h-5" />}
                      title="Push Notifications"
                      description="Get real-time alerts on your device."
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button variant="primary" onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => isDark && toggleTheme()}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        !isDark
                          ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Sun className={`w-6 h-6 mb-3 ${!isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                      <p className="font-medium text-slate-900 dark:text-white">Light Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clean and bright</p>
                    </button>

                    <button
                      onClick={() => !isDark && toggleTheme()}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        isDark
                          ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Moon className={`w-6 h-6 mb-3 ${isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                      <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Easy on the eyes</p>
                    </button>

                    <button className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-left opacity-50 cursor-not-allowed">
                      <Monitor className="w-6 h-6 mb-3 text-slate-400" />
                      <p className="font-medium text-slate-900 dark:text-white">System</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Matches your device</p>
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
    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-brand-blue">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked />
        <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-brand-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-slate-300 after:transition-all"></div>
      </label>
    </div>
  );
}
