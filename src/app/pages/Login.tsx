import { Phone, KeyRound, ArrowRight, ShieldCheck, BarChart3, ClipboardList, Map } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { registerAndRequestOtp, requestOtp, verifyOtp } from '../api/authApi';

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254798208346');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      step === 'request'
        ? phoneNumber.trim().length > 0 && fullName.trim().length > 0 && email.trim().length > 0
        : phoneNumber.trim().length > 0 && otpCode.trim().length > 0,
    [email, fullName, phoneNumber, otpCode, step],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const phone = phoneNumber.trim();
      if (step === 'request') {
        await registerAndRequestOtp({ name: fullName.trim(), email: email.trim(), phone_number: phone });
        setStep('verify');
        setInfo('OTP sent. Enter the 6-digit code to continue.');
      } else {
        await verifyOtp(phone, otpCode.trim());
        navigate('/dashboard');
      }
    } catch {
      setError(step === 'request' ? 'Unable to send OTP. Check the phone number and try again.' : 'Invalid OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-[1120px] grid md:grid-cols-[1fr_1fr] gap-4 md:gap-6 items-center min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-48px)]">
        <div className="flex items-center justify-center py-6 md:py-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 flex flex-col justify-center min-h-0 w-full max-w-[560px] max-h-[calc(100vh-24px-48px)] md:max-h-[calc(100vh-48px-80px)] overflow-y-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eef5d8] flex items-center justify-center mb-3 sm:mb-4">
                <img src={avocadoLogo} alt="logo" className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

            <h1
              className="text-xl sm:text-2xl font-semibold text-gray-800 text-center"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {step === 'request' ? 'Create your account' : 'Sign in'}
            </h1>
            <p className="text-gray-500 text-sm text-center" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {step === 'request'
                ? 'Enter your details to request an OTP.'
                : 'Enter the OTP we sent to your phone.'}
            </p>
          </div>

          <form className="space-y-5 md:pr-1" onSubmit={handleSubmit}>
            {step === 'request' ? (
              <>
                <div>
                  <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Full Name
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Wambui"
                      className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 px-4"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Email
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 px-4"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </>
            ) : null}
            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Phone Number</label>
              <div className="mt-2 relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +2547XXXXXXXX"
                  className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                  autoComplete="tel"
                />
              </div>
            </div>

            {step === 'verify' ? (
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  One-Time Password (OTP)
                </label>
                <div className="mt-2 relative">
                  <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  <button
                    type="button"
                    className="text-green-700 hover:underline"
                    onClick={() => {
                      setStep('request');
                      setOtpCode('');
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    Change phone number
                  </button>
                  <button
                    type="button"
                    className="text-green-700 hover:underline"
                    onClick={async () => {
                      if (submitting) return;
                      setSubmitting(true);
                      setError(null);
                      setInfo(null);
                      try {
                        await requestOtp(phoneNumber.trim());
                        setInfo('OTP resent.');
                      } catch {
                        setError('Unable to resend OTP. Please try again.');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            ) : null}

            {info ? (
              <p
                className="rounded-md border border-[#1D4ED8] bg-[#DBEAFE] px-3 py-2 text-xs text-[#1E40AF]"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {info}
              </p>
            ) : null}

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
              {submitting ? (step === 'request' ? 'Sending OTP...' : 'Verifying...') : step === 'request' ? 'Send OTP' : 'Verify & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div
            className="mt-6 text-center text-sm text-gray-600"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            {step === 'request' ? (
              <>
                Already have an approved account?{' '}
                <button
                  type="button"
                  className="text-green-700 font-medium hover:underline"
                  onClick={() => {
                    setStep('verify');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button
                  type="button"
                  className="text-green-700 font-medium hover:underline"
                  onClick={() => {
                    setStep('request');
                    setOtpCode('');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Create account
                </button>
              </>
            )}
          </div>

          <div
            className="mt-5 border rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure login protected by encryption
          </div>

          <div className="mt-5 md:hidden rounded-xl bg-[#eef5d8] p-4">
            <div className="text-sm font-semibold text-[#1B4332]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Why AvoGuard
            </div>
            <div className="mt-3 space-y-3">
              <FeatureCompact icon={<BarChart3 className="w-4 h-4" />} title="Real-time Dashboard" />
              <FeatureCompact icon={<ClipboardList className="w-4 h-4" />} title="Case Management" />
              <FeatureCompact icon={<Map className="w-4 h-4" />} title="Farmer Insights" />
            </div>
          </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center py-10">
          <div className="rounded-2xl p-8 lg:p-10 bg-gradient-to-b from-[#1f5a3d] to-[#184e35] text-white flex flex-col justify-between min-h-0 w-full max-w-[560px] max-h-[calc(100vh-48px-80px)]">
            <div>
              <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white flex items-center justify-center">
                  <img src={avocadoLogo} alt="logo" className="w-12 h-12 lg:w-14 lg:h-14" />
                </div>

                <div>
                  <h2 className="text-3xl lg:text-5xl font-semibold leading-none" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    AvoGuard
                  </h2>
                  <p className="mt-2 text-sm lg:text-base text-green-200" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Pest and Disease Monitoring System
                  </p>
                </div>
              </div>

              <div className="space-y-6 mt-8">
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

function FeatureCompact({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 text-[#1B4332]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">{icon}</div>
      <div className="text-sm">{title}</div>
    </div>
  );
}
