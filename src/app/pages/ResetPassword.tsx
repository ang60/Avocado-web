import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { PasswordField } from '../components/PasswordField';
import { confirmPasswordReset } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setPhoneNumber(phone);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await confirmPasswordReset({
        phone_number: phoneNumber.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.getDetailMessage() ?? getApiErrorMessage(err, 'Could not reset password.'));
      } else {
        setError(getApiErrorMessage(err, 'Could not reset password.'));
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
              Reset password
            </h1>
            <p className="text-gray-500 text-sm text-center max-w-md mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Enter the code sent to your phone and your new password.
            </p>
          </div>

          {success ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900 mb-6" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <p className="font-medium mb-1">Password reset successfully</p>
              <p>You will be redirected to the login page shortly.</p>
              <Link to="/login" className="mt-3 inline-block text-green-700 font-medium hover:underline">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Phone number
                </label>
                <div className="mt-2 relative reset-phone-input">
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

              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Reset code
                </label>
                <div className="mt-2 relative">
                  <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter reset code"
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-10 pr-10"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    required
                  />
                </div>
              </div>

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                required
                autoComplete="new-password"
                inputClassName="bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-3 pr-10"
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                autoComplete="new-password"
                inputClassName="bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-3 pl-3 pr-10"
              />

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
                {submitting ? 'Resetting...' : 'Reset password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Back to{' '}
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
