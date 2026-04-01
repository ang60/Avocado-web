import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: { id?: string; name: string; email: string; phone: string; role: string; county: string }) => void;
  initialUser?: { id: string; name: string; email: string; phone: string; role: string; county: string } | null;
  roleOptions: string[];
}

export function AddUserModal({ isOpen, onClose, onSave, initialUser, roleOptions }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Field Scout',
    county: 'Murang\'a',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialUser) {
      setFormData({
        name: initialUser.name ?? '',
        email: initialUser.email ?? '',
        phone: initialUser.phone ?? '',
        role: initialUser.role ?? 'Field Scout',
        county: initialUser.county ?? "Murang'a",
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: roleOptions[0] ?? 'Field Scout',
        county: "Murang'a",
      });
    }
  }, [initialUser, isOpen, roleOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialUser?.id,
      ...formData,
      status: 'active',
      lastLogin: 'Never',
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Field Scout',
      county: 'Murang\'a',
    });
    onClose();
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
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
        >
          <h2 
            className="text-xl"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
          >
            {initialUser ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
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

            {/* Email */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
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

            {/* Phone */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
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

            {/* Role */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {roleOptions.length > 0 ? (
                  roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Field Scout">Field Scout</option>
                    <option value="Agronomist">Agronomist</option>
                    <option value="Farm Manager">Farm Manager</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Regional Coordinator">Regional Coordinator</option>
                  </>
                )}
              </select>
            </div>

            {/* County */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
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

          {/* Actions */}
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