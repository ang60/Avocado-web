import { Phone, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { requestOtp, verifyOtp } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

export function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmitRequest = phoneNumber.trim().length > 0;
  const canSubmitVerify = phoneNumber.trim().length > 0 && otpCode.trim().length > 0;

  const canSubmit = useMemo(
    () => (step === 'request' ? canSubmitRequest : canSubmitVerify),
    [step, canSubmitRequest, canSubmitVerify],
  );

  function messageFromErr(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
      return err.getDetailMessage() ?? getApiErrorMessage(err, fallback);
    }
    return getApiErrorMessage(err, fallback);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    try {
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
          step === 'request'
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
              Verify your account with a code sent to your phone. If you have not registered yet, create an account first and wait for admin
              approval.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                ? step === 'request'
                  ? 'Sending code...'
                  : 'Verifying...'
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

          <div
            className="mt-5 border rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Codes verify approved accounts only — not sent from registration
          </div>
        </div>

        <AuthBrandingPanel />
      </div>
    </div>
  );
}
