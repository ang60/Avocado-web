import { Phone, KeyRound, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { PasswordField } from '../components/PasswordField';
import { loginWithPassword, requestOtp, verifyOtp } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

type SignInMode = 'password' | 'otp';

export function Login() {
  const navigate = useNavigate();
  const [signInMode, setSignInMode] = useState<SignInMode>('password');

  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmitRequest = phoneNumber.trim().length > 0;
  const canSubmitVerify = phoneNumber.trim().length > 0 && otpCode.trim().length > 0;
  const canSubmitPassword = identifier.trim().length > 0 && loginPassword.length > 0;

  const canSubmit = useMemo(() => {
    if (signInMode === 'password') return canSubmitPassword;
    return step === 'request' ? canSubmitRequest : canSubmitVerify;
  }, [signInMode, step, canSubmitPassword, canSubmitRequest, canSubmitVerify]);

  function messageFromErr(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
      return err.getDetailMessage() ?? getApiErrorMessage(err, fallback);
    }
    return getApiErrorMessage(err, fallback);
  }

  function switchMode(mode: SignInMode) {
    setSignInMode(mode);
    setError(null);
    setInfo(null);
    setStep('request');
    setOtpCode('');
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      if (signInMode === 'password') {
        await loginWithPassword(identifier.trim(), loginPassword);
        navigate('/dashboard');
        return;
      }

      const phone = phoneNumber.trim();
      if (step === 'request') {
        await requestOtp(phone);
        setStep('verify');
        setInfo('If your account is approved, a verification code was sent. Enter it to finish signing in.');
      } else {
        await verifyOtp(phone, otpCode.trim());
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        messageFromErr(
          err,
          signInMode === 'password'
            ? 'Could not sign in. Check your email or phone, password, and that your access request was approved.'
            : step === 'request'
              ? 'Could not send a verification code. Check the phone number and that your access request was approved.'
              : 'Invalid or expired code. Try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] flex items-center justify-center p-3">
      <div className="w-full max-w-[1280px] grid md:grid-cols-[0.94fr_1.06fr] gap-6 items-stretch">
        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col justify-center min-h-[760px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#eef5d8] flex items-center justify-center mb-4">
              <img src={avocadoLogo} alt="logo" className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Sign in
            </h1>
            <p className="text-gray-500 text-sm text-center max-w-md" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Use your email or phone with the password from registration, or sign in with a code sent to your phone. If you have not registered
              yet, create an account first and wait for admin approval.
            </p>
          </div>

          <div
            className="mb-6 flex rounded-xl border border-[#e5e7eb] p-1 bg-[#f9fafb]"
            role="tablist"
            aria-label="Sign-in method"
          >
            <button
              type="button"
              role="tab"
              aria-selected={signInMode === 'password'}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                signInMode === 'password' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              onClick={() => switchMode('password')}
            >
              Email or phone + password
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={signInMode === 'otp'}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                signInMode === 'otp' ? 'bg-white text-[#1B4332] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              onClick={() => switchMode('otp')}
            >
              Phone verification code
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {signInMode === 'password' ? (
              <>
                <div>
                  <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Email or phone number
                  </label>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@example.com or +2547XXXXXXXX"
                      className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    We detect email when it contains @; otherwise your number is matched as a phone (same format as when you registered).
                  </p>
                </div>
                <PasswordField
                  label="Password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  required
                  autoComplete="current-password"
                  inputClassName="bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-3 pr-10"
                />
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Phone number
                  </label>
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
                      required
                    />
                  </div>
                </div>

                {step === 'verify' ? (
                  <div>
                    <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      Verification code
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
                            setInfo('A new verification code was sent.');
                          } catch (err) {
                            setError(messageFromErr(err, 'Unable to resend the code.'));
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                      >
                        Resend code
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}

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
              {submitting
                ? signInMode === 'password'
                  ? 'Signing in...'
                  : step === 'request'
                    ? 'Sending code...'
                    : 'Verifying...'
                : signInMode === 'password'
                  ? 'Sign in'
                  : step === 'request'
                    ? 'Send verification code'
                    : 'Verify & sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            New here?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:underline">
              Create an account
            </Link>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            To sign out or use another account, open your profile menu (top right) → <strong>Sign out</strong> or{' '}
            <strong>Switch account</strong>.
          </p>

          {signInMode === 'otp' ? (
            <div
              className="mt-5 border rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Codes verify approved accounts only — not sent from registration
            </div>
          ) : null}
        </div>

        <AuthBrandingPanel />
      </div>
    </div>
  );
}
