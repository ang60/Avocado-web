import { Mail, Lock, Eye, ArrowRight, ShieldCheck, BarChart3, ClipboardList, Map } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { createMockJwt, setAuthToken } from '../auth';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    window.setTimeout(() => {
      try {
        const token = createMockJwt(email.trim());
        setAuthToken(token);
        if (!rememberMe) {
          // Frontend-only behavior: no persistent session hint for future backend wiring.
          window.sessionStorage.setItem('avoguard.auth.sessionOnly', '1');
        } else {
          window.sessionStorage.removeItem('avoguard.auth.sessionOnly');
        }
        navigate('/dashboard');
      } catch {
        setError('Unable to sign in. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] flex items-center justify-center p-3">
      <div className="w-full max-w-[1280px] grid md:grid-cols-[0.94fr_1.06fr] gap-6 items-stretch">
        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col justify-center min-h-[760px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#eef5d8] flex items-center justify-center mb-4">
              <img src={avocadoLogo} alt="logo" className="w-8 h-8" />
            </div>

            <h1
              className="text-2xl font-semibold text-gray-800"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Sign in to your Dashboard
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Email Address
              </label>
              <div className="mt-2 relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                  autoComplete="current-password"
                />
                <Eye className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label
                className="flex items-center gap-2 text-gray-600"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a
                className="text-green-600 hover:underline cursor-pointer"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                Forgot Password?
              </a>
            </div>

            {error ? (
              <p
                className="rounded-md border border-[#DC2626] bg-[#FEE2E2] px-3 py-2 text-xs text-[#B91C1C]"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full bg-gradient-to-r from-[#4fa36c] to-[#3c8f5a] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div
            className="mt-6 text-center text-sm text-gray-600"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Don't have an account?{' '}
            <span className="text-green-600 font-medium cursor-pointer">Create Account</span>
          </div>

          <div
            className="mt-5 border rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure login protected by encryption
          </div>
        </div>

        <div className="rounded-2xl p-12 bg-gradient-to-b from-[#1f5a3d] to-[#184e35] text-white flex flex-col justify-between min-h-[790px]">
          <div>
            <div className="flex items-center gap-5 mb-10">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <img src={avocadoLogo} alt="logo" className="w-20 h-20" />
              </div>

              <div>
                <h2 className="text-6xl font-semibold leading-none" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  AvoGuard
                </h2>
                <p className="mt-2 text-base text-green-200" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Pest and Disease Monitoring System
                </p>
              </div>
            </div>

            <div className="space-y-8 mt-10">
              <Feature
                icon={<BarChart3 />}
                title="Real-time Dashboard"
                description="Monitor farms, pest reports, and alerts in real-time"
              />

              <Feature
                icon={<ClipboardList />}
                title="Case Management"
                description="Track, assign, and resolve pest and disease cases efficiently"
              />

              <Feature
                icon={<Map />}
                title="Farmer Insights"
                description="View farm profiles, locations, crops, and historical case data"
              />
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-10">
            <span className="w-2 h-2 rounded-full bg-green-300" />
            <span className="w-2 h-2 rounded-full bg-green-700" />
            <span className="w-2 h-2 rounded-full bg-green-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
        <div className="text-green-200">{icon}</div>
      </div>

      <div>
        <h3 className="font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {title}
        </h3>
        <p className="text-green-200 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
