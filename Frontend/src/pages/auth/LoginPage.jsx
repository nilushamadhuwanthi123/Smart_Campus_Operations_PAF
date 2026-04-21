import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCapIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  ShieldIcon,
  UserIcon,
  WrenchIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { adminRoutes, studentRoutes, technicianRoutes } from '../../utils/routes';

const roleOptions = [
  {
    label: 'Student',
    value: 'USER',
    icon: UserIcon,
    redirectTo: studentRoutes.dashboard,
    subtitle: 'Track requests, updates, and daily campus support in one calm workspace.',
    helperTitle: 'Student demo login',
    credentials: ['Email: alex@university.edu', 'Password: Student123@']
  },
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: ShieldIcon,
    redirectTo: adminRoutes.dashboard,
    subtitle: 'Coordinate operations, assign technicians, and keep service response visible.',
    helperTitle: 'Admin login',
    credentials: ['Email: admin@gmail.com', 'Password: Admin123@']
  },
  {
    label: 'Technician',
    value: 'TECHNICIAN',
    icon: WrenchIcon,
    redirectTo: technicianRoutes.dashboard,
    subtitle: 'Focus on task flow, field updates, and resolution notes without friction.',
    helperTitle: 'Technician login',
    credentials: ['Use the technician email and password created by an admin.']
  }
];

export function LoginPage() {
  const { loginStudent, loginAdmin, loginTechnician } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedRoleOption =
    roleOptions.find((option) => option.value === selectedRole) || roleOptions[0];

  const loginHandlers = {
    USER: loginStudent,
    ADMIN: loginAdmin,
    TECHNICIAN: loginTechnician
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await loginHandlers[selectedRole]({
        username: email,
        password
      });
      navigate(selectedRoleOption.redirectTo);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="theme-glow absolute inset-0" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] border-r border-brand-sand/40 bg-gradient-to-br from-brand-navy via-purple-700 to-brand-surface lg:block" />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden rounded-[2rem] px-12 py-14 text-brand-cream lg:flex lg:flex-col lg:justify-between"
        >
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-brand-mist/80">
              Campus Operations Suite
            </p>
            <h1 className="max-w-md font-display text-6xl leading-[0.95] text-brand-cream">
              Quiet colors, clear workflows, faster support.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-brand-mist/85">
              This refreshed workspace uses the shared navy, mist, sand, and cream palette across
              student, admin, and technician journeys so the product feels consistent from login to
              ticket resolution.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-brand-cream/12 p-3 text-brand-cream">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-3xl leading-none">{option.label}</p>
                  <p className="mt-2 text-sm text-brand-mist/80">{option.subtitle}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="z-10"
        >
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand-navy text-brand-cream shadow-glow">
              <GraduationCapIcon className="h-8 w-8" />
            </div>
            <p className="theme-kicker mb-2">Smart Campus Hub</p>
            <h1 className="theme-heading text-5xl">Welcome Back</h1>
          </div>

          <Card className="mx-auto max-w-xl border-0 bg-white/78 shadow-glow dark:bg-brand-surface/78">
            <CardContent className="p-8 sm:p-10">
              <div className="mb-8 hidden lg:block">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand-navy text-brand-cream shadow-glow">
                  <GraduationCapIcon className="h-8 w-8" />
                </div>
                <p className="theme-kicker mb-2">Smart Campus Hub</p>
                <h2 className="theme-heading text-5xl">Sign In</h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {selectedRoleOption.subtitle}
                </p>
              </div>

              <Button variant="outline" className="relative mb-6 h-12 w-full" type="button">
                <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="mb-6">
                <p className="theme-kicker mb-3 text-center">Choose workspace</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = selectedRole === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(option.value);
                          setEmail('');
                          setPassword('');
                          setError('');
                        }}
                        className={`rounded-[1.25rem] border px-3 py-4 text-sm transition-all ${
                          isActive
                            ? 'border-brand-navy bg-brand-cream text-brand-navy shadow-soft dark:border-brand-mist dark:bg-brand-surface-hover dark:text-brand-cream'
                            : 'border-brand-sand/70 text-slate-600 hover:border-brand-mist hover:bg-brand-cream/65 dark:border-brand-mist/15 dark:text-slate-300 dark:hover:bg-brand-surface-hover/75'
                        }`}
                      >
                        <div className="mb-2 flex justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mb-6 flex items-center py-2">
                <div className="flex-grow border-t border-brand-sand/70 dark:border-brand-mist/15" />
                <span className="mx-4 flex-shrink-0 text-xs uppercase tracking-[0.22em] text-slate-400">
                  Or continue with email
                </span>
                <div className="flex-grow border-t border-brand-sand/70 dark:border-brand-mist/15" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder={
                        selectedRole === 'USER'
                          ? 'alex@university.edu'
                          : selectedRole === 'ADMIN'
                            ? 'admin@gmail.com'
                            : 'technician@campus.lk'
                      }
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-brand-sand/70 bg-white/65 py-3 pl-10 pr-4 text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/35 dark:border-brand-mist/15 dark:bg-brand-surface/55 dark:text-brand-cream"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-brand-navy transition-colors hover:text-purple-700 dark:text-brand-sand dark:hover:text-brand-cream"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder={selectedRole === 'TECHNICIAN' ? 'Enter your password' : 'Enter password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-brand-sand/70 bg-white/65 py-3 pl-10 pr-4 text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/35 dark:border-brand-mist/15 dark:bg-brand-surface/55 dark:text-brand-cream"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="rounded-[1.35rem] border border-brand-sand/70 bg-brand-cream/60 px-4 py-3 text-sm text-brand-navy dark:border-brand-mist/15 dark:bg-brand-surface/55 dark:text-brand-cream">
                  <p className="theme-kicker mb-1 !tracking-[0.18em]">{selectedRoleOption.helperTitle}</p>
                  {selectedRoleOption.credentials.map((credential) => (
                    <React.Fragment key={credential}>
                      {credential}
                      <br />
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-brand-mist text-brand-navy focus:ring-brand-navy"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    Remember me for 30 days
                  </label>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                >
                  {selectedRoleOption.label} Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
