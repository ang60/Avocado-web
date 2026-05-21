import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Phone, ArrowRight } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { requestPasswordReset } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const identifier = phoneNumber.trim();
      await requestPasswordReset({ identifier });
      navigate(`/reset-password?identifier=${encodeURIComponent(identifier)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.getDetailMessage() ?? getApiErrorMessage(err, 'Could not request password reset.'));
      } else {
        setError(getApiErrorMessage(err, 'Could not request password reset.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] flex items-center justify-center px-3 py-6 md:py-10">
      <div className="w-full max-w-[1280px] grid md:grid-cols-[0.94fr_1.06fr] gap-6 items-stretch">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#eef5d8] flex items-center justify-center mb-4">
              <img src={avocadoLogo} alt="logo" className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Forgot password?
            </h1>
            <p className="text-gray-500 text-sm text-center max-w-md mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Enter your registered phone number. We'll send a reset code to your phone.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Phone number
              </label>
              <div className="mt-2 relative forgot-phone-input">
                <PhoneInput
                  country={'ke'}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber('+' + phone)}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoComplete: 'tel'
                  }}
                  containerClass="w-full"
                  inputClass="!w-full !bg-[#f3f7f4] !border-transparent focus:!border-green-500 !outline-none !rounded-lg !py-6 !pl-12 !pr-4 !h-auto !text-base"
                  buttonClass="!bg-transparent !border-transparent !rounded-l-lg"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-[#DC2626] bg-[#FEE2E2] px-3 py-2 text-xs text-[#B91C1C]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#4fa36c] to-[#3c8f5a] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-60"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {submitting ? 'Sending code...' : 'Send reset code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Remembered your password?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <AuthBrandingPanel />
      </div>
    </div>
  );
}
