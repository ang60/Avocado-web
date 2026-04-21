import { X, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entity: any) => void;
  initialEntity?: {
    id: string;
    companyName: string;
    hcdaLicense: string;
    headAgronomist: string;
    email: string;
    phone: string;
    county: string;
    entityType: string;
    licenseExpiry: string;
    status: boolean;
  } | null;
}

export function AddEntityModal({ isOpen, onClose, onSave, initialEntity }: AddEntityModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [hcdaLicense, setHcdaLicense] = useState('');
  const [headAgronomist, setHeadAgronomist] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [entityType, setEntityType] = useState('exporter');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (initialEntity) {
      setCompanyName(initialEntity.companyName ?? '');
      setHcdaLicense(initialEntity.hcdaLicense ?? '');
      setHeadAgronomist(initialEntity.headAgronomist ?? '');
      setEmail(initialEntity.email ?? '');
      setPhone(initialEntity.phone ?? '');
      setCounty(initialEntity.county ?? '');
      setEntityType(initialEntity.entityType ?? 'exporter');
      setLicenseExpiry(initialEntity.licenseExpiry ?? '');
      setStatus(Boolean(initialEntity.status));
    } else {
      setCompanyName('');
      setHcdaLicense('');
      setHeadAgronomist('');
      setEmail('');
      setPhone('');
      setCounty('');
      setEntityType('exporter');
      setLicenseExpiry('');
      setStatus(true);
    }
  }, [initialEntity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialEntity?.id,
      companyName,
      hcdaLicense,
      headAgronomist,
      email,
      phone,
      county,
      entityType,
      licenseExpiry,
      linkedFarmers: 0,
      status,
    });
    // Reset form
    setCompanyName('');
    setHcdaLicense('');
    setHeadAgronomist('');
    setEmail('');
    setPhone('');
    setCounty('');
    setEntityType('exporter');
    setLicenseExpiry('');
      setStatus(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
      >
        {/* Modal Header */}
        <div 
          className="border-b px-6 py-5 flex items-center justify-between flex-shrink-0" 
          style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
              >
                {initialEntity ? 'Edit Entity' : 'Add Entity'}
              </h2>
              <p className="text-sm" style={{ color: '#717182' }}>
                Register a new organization in AvoGuard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* Entity Type */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                Entity Type *
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}
                required
              >
                <option value="exporter">Exporter</option>
                <option value="kephis">Government - KEPHIS</option>
                <option value="hcda">Government - HCDA</option>
                <option value="partner">Partner Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                Status
              </label>
              <select
                value={status ? 'active' : 'inactive'}
                onChange={(e) => setStatus(e.target.value === 'active')}
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Vegpro Kenya Ltd"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required
                />
              </div>

              {/* HCDA License */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  HCDA License # {entityType === 'exporter' && '*'}
                </label>
                <input
                  type="text"
                  value={hcdaLicense}
                  onChange={(e) => setHcdaLicense(e.target.value)}
                  placeholder="e.g., HCDA/EX/2024/1287"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ 
                    borderColor: '#E0DDD6',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                  required={entityType === 'exporter'}
                />
              </div>

              {/* License Expiry */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  License Expiry Date {entityType === 'exporter' && '*'}
                </label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required={entityType === 'exporter'}
                />
              </div>

              {/* Head Agronomist */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  Head Agronomist *
                </label>
                <input
                  type="text"
                  value={headAgronomist}
                  onChange={(e) => setHeadAgronomist(e.target.value)}
                  placeholder="e.g., Dr. James Kamau"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required
                />
              </div>

              {/* County */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  Primary County *
                </label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required
                >
                  <option value="">Select County</option>
                  <option value="Murang'a">Murang'a</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Nyeri">Nyeri</option>
                  <option value="Meru">Meru</option>
                  <option value="Embu">Embu</option>
                  <option value="Kirinyaga">Kirinyaga</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Nairobi">Nairobi</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  Company Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@company.co.ke"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  style={{ borderColor: '#E0DDD6' }}
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div 
              className="rounded-lg p-4 border-l-4"
              style={{ 
                backgroundColor: '#F0FAF3',
                borderColor: '#40916C',
              }}
            >
              <p className="text-sm" style={{ color: '#1B4332' }}>
                <strong>Entity Hierarchy:</strong> Once created, users can be assigned to this entity. 
                Suspending the entity will automatically block all associated users.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E0DDD6', color: '#1B4332' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}
            >
              <Building2 className="w-5 h-5" />
              {initialEntity ? 'Save Changes' : 'Add Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
