import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { id?: string; name: string; email: string; phone: string; role: string; county: string }) => void | Promise<void>;
  initialUser?: { id: string; name: string; email: string; phone: string; role: string; county: string } | null;
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

  const apiBackedRoles = useMemo(
    () => (roleOptions.length > 0 ? roleOptions : DEFAULT_ROLE_OPTIONS),
    [roleOptions],
  );

  /** Every selectable name plus "(No role)" as empty string — avoids invalid <select value> when role is Unknown. */
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
    } else {
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
    try {
      await Promise.resolve(
        onSave({
          id: initialUser?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          county: formData.county,
        }),
      );
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
