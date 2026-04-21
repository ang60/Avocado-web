import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PasswordField } from './PasswordField';

/** Matches seeded roles in accounts.0011_seed_core_roles when API list is empty */
const DEFAULT_ROLE_OPTIONS = [
  'Administrator',
  'Farmer',
  'Farm Manager',
  'KEPHIS',
  'HCDA',
  'Agronomist',
  'Exporter',
];

const MIN_PW = 8;

export type AddUserSavePayload = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  county: string;
  /** Only for Add User — optional; registrants already have a password */
  password?: string;
  /** Edit only: whether the account can sign in */
  is_active?: boolean;
};

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: AddUserSavePayload) => void | Promise<void>;
  initialUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    county: string;
    isActive: boolean;
  } | null;
  roleOptions: string[];
}

export function AddUserModal({ isOpen, onClose, onSave, initialUser, roleOptions }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    county: "Murang'a",
  });
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const apiBackedRoles = useMemo(
    () => (roleOptions.length > 0 ? roleOptions : DEFAULT_ROLE_OPTIONS),
    [roleOptions],
  );

  const roleSelectNames = useMemo(() => {
    const names = [...apiBackedRoles];
    const current = formData.role.trim();
    if (current && current !== 'Unknown' && !names.includes(current)) {
      names.unshift(current);
    }
    return names;
  }, [apiBackedRoles, formData.role]);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);
    setPassword('');
    setPasswordConfirm('');
    if (initialUser) {
      const raw = (initialUser.role ?? '').trim();
      const roleValue = !raw || raw === 'Unknown' ? '' : raw;
      setFormData({
        name: initialUser.name ?? '',
        email: initialUser.email ?? '',
        phone: initialUser.phone ?? '',
        role: roleValue,
        county: initialUser.county?.trim() || "Murang'a",
      });
      setIsActive(initialUser.isActive);
    } else {
      setIsActive(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: apiBackedRoles[0] ?? '',
        county: "Murang'a",
      });
    }
  }, [initialUser, isOpen, apiBackedRoles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const isNew = !initialUser;
    if (isNew) {
      const wantPw = password.length > 0 || passwordConfirm.length > 0;
      if (wantPw) {
        if (password.length < MIN_PW) {
          setLocalError(`Password must be at least ${MIN_PW} characters.`);
          return;
        }
        if (password !== passwordConfirm) {
          setLocalError('Passwords do not match.');
          return;
        }
      }
    }

    try {
      const payload: AddUserSavePayload = {
        id: initialUser?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        county: formData.county,
      };
      if (isNew) {
        if (password.length > 0) {
          payload.password = password;
        }
      } else {
        payload.is_active = isActive;
      }
      await Promise.resolve(onSave(payload));
      onClose();
    } catch {
      /* Parent sets error banner; keep modal open */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
        >
          <h2 className="text-xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {initialUser ? 'Edit User' : 'Add New User'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 transition-colors">
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="e.g., Jane Wambui"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="jane.wambui@avoguard.ke"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="+254 712 345 678"
              />
            </div>

            {initialUser ? (
              <label className="flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3" style={{ borderColor: '#E0DDD6' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <span className="block text-sm font-medium text-[#1B4332]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Account active
                  </span>
                  <span className="block text-xs text-[#717182]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Turn on so this person can sign in with the password they set at registration (or phone code). You can assign a role
                    below without changing their password.
                  </span>
                </div>
              </label>
            ) : (
              <>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Password is optional here. People who already registered chose their own password — leave blank to add directory-only
                  users or use a temporary password for staff created manually.
                </p>
                <PasswordField
                  label={`Password (optional, min ${MIN_PW} if set)`}
                  value={password}
                  onChange={setPassword}
                  required={false}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm password"
                  value={passwordConfirm}
                  onChange={setPasswordConfirm}
                  required={false}
                  autoComplete="new-password"
                />
              </>
            )}

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Role {initialUser ? '' : '*'}
              </label>
              <select
                required={!initialUser}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {initialUser ? <option value="">— No role assigned —</option> : null}
                {roleSelectNames.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Primary County *
              </label>
              <select
                required
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="Murang'a">Murang'a</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Meru">Meru</option>
                <option value="Nyeri">Nyeri</option>
                <option value="Bungoma">Bungoma</option>
                <option value="Trans Nzoia">Trans Nzoia</option>
                <option value="Embu">Embu</option>
              </select>
            </div>
          </div>

          {localError ? (
            <p className="mt-3 text-sm text-red-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {localError}
            </p>
          ) : null}

          <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                color: '#717182',
                backgroundColor: '#FFFFFF',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
              }}
            >
              {initialUser ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
