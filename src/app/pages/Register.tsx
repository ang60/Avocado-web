import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { submitAccessRequest } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

/**
 * Individual access request: name, email, phone. Admin activates the user in Django admin;
 * no verification SMS is sent from this step.
 */
export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDetail, setSuccessDetail] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => fullName.trim().length > 0 && email.trim().length > 0 && phoneNumber.trim().length > 0,
    [fullName, email, phoneNumber],
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
    setSuccessDetail(null);

    try {
      const res = await submitAccessRequest({
        name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
      });
      setSuccessDetail(res.detail);
    } catch (err) {
      setError(messageFromErr(err, 'Could not submit your request. Check your details and try again.'));
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
              Create your account
            </h1>
            <p className="text-gray-500 text-sm text-center max-w-md" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              For individuals: enter your details below. An administrator will review and approve your account. You will not receive a text
              message from this step — after approval, sign in with your phone to receive a verification code.
            </p>
          </div>

          {successDetail ? (
            <div
              className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900 mb-4"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <p className="font-medium mb-1">Application received</p>
              <p>{successDetail}</p>
              <Link to="/login" className="mt-3 inline-block text-green-700 font-medium hover:underline">
                Go to sign in
              </Link>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Wambui"
                className="mt-2 w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 px-4"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="mt-2 w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 px-4"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                autoComplete="email"
                required
              />
            </div>
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

            {error ? (
              <p
                className="rounded-md border border-[#DC2626] bg-[#FEE2E2] px-3 py-2 text-xs text-[#B91C1C]"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {error}
              </p>
            ) : null}

            {!successDetail ? (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full bg-gradient-to-r from-[#4fa36c] to-[#3c8f5a] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {submitting ? 'Submitting...' : 'Submit application'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Already have an approved account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>

          <div
            className="mt-5 border rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-500"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <ShieldCheck className="w-4 h-4 text-green-600" />
            No SMS from this page — verification codes are only sent when you sign in after approval
          </div>
        </div>

        <AuthBrandingPanel />
      </div>
    </div>
  );
}
