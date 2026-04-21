import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Phone, ArrowRight, ShieldCheck, User, Mail, MapPin, Briefcase } from 'lucide-react';
import { FormEvent, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { AuthBrandingPanel } from '../components/AuthBrandingPanel';
import { PasswordField } from '../components/PasswordField';
import { submitAccessRequest, fetchRoles, type RoleOption } from '../api/authApi';
import { ApiError } from '../api/client';
import { getApiErrorMessage } from '../api/errors';

const MIN_PASSWORD = 8;

const COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
  'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
].sort();

/**
 * Individual access request: name, email, phone, password (+ confirm). Admin activates the user;
 * no SMS from this step.
 */
export function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [county, setCounty] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      async function loadRoles() {
        setLoadingRoles(true);
        try {
          const data = await fetchRoles(roleSearch || undefined);
          setRoles(data);
          if (data.length > 0 && !role) {
            setRole(data[0].id);
          }
        } catch (err) {
          console.error('Failed to load roles', err);
        } finally {
          setLoadingRoles(false);
        }
      }
      loadRoles();
    }, 300);
    return () => clearTimeout(timer);
  }, [roleSearch, role]);

  const canSubmit = useMemo(() => {
    if (
      firstName.trim().length === 0 ||
      lastName.trim().length === 0 ||
      email.trim().length === 0 ||
      phoneNumber.trim().length < 10 ||
      !role ||
      county.trim().length === 0
    )
      return false;
    if (password.length < MIN_PASSWORD || passwordConfirm.length < MIN_PASSWORD) return false;
    if (password !== passwordConfirm) return false;
    return true;
  }, [firstName, lastName, email, phoneNumber, role, county, password, passwordConfirm]);

  function messageFromErr(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
      const parsed = err.getDetailMessage();
      if (parsed) return parsed;
      if (err.status >= 500) {
        return `Server error (HTTP ${err.status}). Check that the database is reachable, migrations are applied, and the API process logs on the server.`;
      }
      if (err.status === 400) {
        return 'Invalid request. Check all fields; if this continues, the server may have returned a non-JSON error.';
      }
      return getApiErrorMessage(err, fallback);
    }
    return getApiErrorMessage(err, fallback);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      setSubmitting(false);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      setSubmitting(false);
      return;
    }

    try {
      await submitAccessRequest({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        role,
        county: county.trim(),
        password,
      });
      setSuccess(true);
    } catch (err) {
      setError(messageFromErr(err, 'Could not submit your request. Check your details and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] flex items-center justify-center px-2 py-4 sm:px-4 sm:py-6 md:py-10">
      <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 items-stretch">
        <div className="bg-white rounded-2xl shadow-sm px-4 py-5 sm:px-6 sm:py-8 md:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eef5d8] flex items-center justify-center mb-3 sm:mb-4">
              <img src={avocadoLogo} alt="logo" className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Create your account
            </h1>
          </div>

          {success ? (
            <div
              className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900 mb-4"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <p className="font-medium mb-1">Account created</p>
              <p>Your account has been created successfully. An administrator will review and approve your account.</p>
              <Link to="/login" className="mt-3 inline-block text-green-700 font-medium hover:underline">
                Go to sign in
              </Link>
            </div>
          ) : null}

          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  First name
                </label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Jane"
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Last name
                </label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Wambui"
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Email
                </label>
                <div className="mt-1.5 relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Phone number
                </label>
                <div className="mt-1.5 relative register-phone-input">
                  <PhoneInput
                    country={'ke'}
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber('+' + phone)}
                    inputProps={{
                      name: 'phone',
                      required: true,
                      autoComplete: 'tel'
                    }}
                    containerClass="!w-full"
                    inputClass="!w-full !bg-[#f3f7f4] !border-transparent focus:!border-green-500 !outline-none !rounded-lg !py-5 !pl-12 !pr-3 sm:!pr-4 !h-auto !text-sm"
                    buttonClass="!bg-transparent !border-transparent !rounded-l-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Role
                </label>
                <div className="mt-1.5 relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search roles..."
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4 mb-2 text-sm"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4 appearance-none"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    required
                  >
                    {loadingRoles ? (
                      <option value="">Loading roles...</option>
                    ) : roles.length === 0 ? (
                      <option value="">No roles found</option>
                    ) : (
                      <>
                        {!role && <option value="">Select a role</option>}
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.role_name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  County
                </label>
                <div className="mt-1.5 relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full bg-[#f3f7f4] border border-transparent focus:border-green-500 outline-none rounded-lg py-2.5 pl-10 pr-3 sm:pr-4 appearance-none"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    required
                  >
                    <option value="">Select county</option>
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <PasswordField
                label={`Password (min ${MIN_PASSWORD}) *`}
                value={password}
                onChange={setPassword}
                required
                autoComplete="new-password"
                inputClassName="!bg-[#f3f7f4] !border-transparent focus:border-green-500 !py-2.5"
              />
              <PasswordField
                label="Confirm password *"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                required
                autoComplete="new-password"
                inputClassName="!bg-[#f3f7f4] !border-transparent focus:border-green-500 !py-2.5"
              />
            </div>

            {password && passwordConfirm && password !== passwordConfirm ? (
              <p className="text-xs text-amber-800" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Passwords do not match.
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

            {!success ? (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full bg-gradient-to-r from-[#4fa36c] to-[#3c8f5a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1 sm:mt-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {submitting ? 'Submitting...' : 'Create account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </form>

          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-medium hover:underline">
                Sign in
              </Link>
            </div>
            <div>
              <Link to="/forgot-password" title="Forgot password" className="text-green-600 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <AuthBrandingPanel />
        </div>
      </div>
    </div>
  );
}
