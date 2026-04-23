import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCapIcon, LogInIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../utils/routes';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export function LoginPage() {
  const { isAuthenticated, login, loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const fromPath = location.state?.from?.pathname || appRoutes.dashboard;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let ignore = false;

    const initialize = () => {
      if (ignore || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = '';

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            return;
          }

          setErrorMessage('');
          setIsSubmitting(true);

          try {
            await loginWithGoogleToken(response.credential);
            navigate(fromPath, { replace: true });
          } catch (error) {
            setErrorMessage(error.message || 'Google login failed.');
          } finally {
            setIsSubmitting(false);
          }
        }
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        width: 320
      });
    };

    if (window.google?.accounts?.id) {
      initialize();
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => {
      if (!ignore) {
        setErrorMessage('Unable to load Google Sign-In.');
      }
    };

    document.head.appendChild(script);

    return () => {
      ignore = true;
      script.remove();
    };
  }, [fromPath, googleClientId, loginWithGoogleToken, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={appRoutes.dashboard} replace />;
  }

  return (
    <div className="theme-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="theme-glow pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-md items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-navy p-2 text-brand-cream shadow-soft">
                <GraduationCapIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="theme-kicker mb-1">Smart Campus</p>
                <h1 className="theme-heading text-3xl">Sign In</h1>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@gmail.com"
                  required
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-brand-sand/65 bg-white/70 px-4 py-2.5 text-sm text-brand-navy outline-none transition-all focus:border-brand-mist focus:ring-2 focus:ring-brand-mist/40 dark:border-brand-mist/20 dark:bg-brand-surface/55 dark:text-brand-cream"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} leftIcon={<LogInIcon className="h-4 w-4" />}>
                Login
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-sand/60 dark:border-brand-mist/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.16em]">
                <span className="bg-white px-3 text-slate-400 dark:bg-brand-surface">or continue with</span>
              </div>
            </div>

            {googleClientId ? (
              <div className="flex justify-center" ref={googleButtonRef} />
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
                Google Sign-In is not configured. Set `VITE_GOOGLE_CLIENT_ID` to enable OAuth login.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
