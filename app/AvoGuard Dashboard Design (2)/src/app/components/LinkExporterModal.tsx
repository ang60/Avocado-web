import { X, Link2, Building2, Search } from 'lucide-react';
import { useState } from 'react';

interface LinkExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  farmer: {
    id: string;
    name: string;
    county: string;
    owner: string;
  } | null;
  exporters: Array<{
    id: string;
    companyName: string;
    hcdaLicense: string;
  }>;
}

export function LinkExporterModal({ isOpen, onClose, onSave, farmer, exporters }: LinkExporterModalProps) {
  const [selectedExporter, setSelectedExporter] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractReference, setContractReference] = useState('');
  const [seasonYear, setSeasonYear] = useState('2026');
  const [exclusiveSupply, setExclusiveSupply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;
    
    onSave({
      farmerId: farmer.id,
      exporterId: selectedExporter,
      contractStartDate,
      contractReference,
      seasonYear,
      exclusiveSupply,
    });
    
    // Reset form
    setSelectedExporter('');
    setContractStartDate('');
    setContractReference('');
    setSeasonYear('2026');
    setExclusiveSupply(false);
    setSearchQuery('');
    onClose();
  };

  const filteredExporters = exporters.filter(exporter =>
    exporter.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exporter.hcdaLicense.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen || !farmer) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(247, 244, 239, 0.95)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          fontFamily: 'IBM Plex Sans, sans-serif',
          padding: '32px',
          borderRadius: '12px',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 
              className="text-3xl mb-1"
              style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
            >
              Link Producer to Export Entity
            </h2>
            <p className="text-sm" style={{ color: '#717182' }}>
              Establish a supply agreement between farmer and exporter
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        {/* Farmer Info - Read-only */}
        <div 
          className="rounded-lg p-4 mb-6 border"
          style={{ 
            backgroundColor: '#F7F4EF',
            borderColor: '#E0DDD6',
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182' }}>
                Farmer Name
              </p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                {farmer.name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182' }}>
                Block ID
              </p>
              <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332', fontWeight: 600 }}>
                {farmer.id}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182' }}>
                County
              </p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                {farmer.county}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Exporter Search Select */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
              Target Exporter *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-5 h-5" style={{ color: '#717182' }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for exporter by name or license..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20 mb-2"
                style={{ borderColor: '#E0DDD6' }}
              />
            </div>
            <select
              value={selectedExporter}
              onChange={(e) => setSelectedExporter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}
              required
            >
              <option value="">Select an exporter...</option>
              {filteredExporters.map((exporter) => (
                <option key={exporter.id} value={exporter.id}>
                  {exporter.companyName} — {exporter.hcdaLicense}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contract Start Date */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                Contract Start Date *
              </label>
              <input
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                style={{ borderColor: '#E0DDD6' }}
                required
              />
            </div>

            {/* Season Year */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                Season Year *
              </label>
              <select
                value={seasonYear}
                onChange={(e) => setSeasonYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
                style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}
                required
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          {/* Contract Reference Number */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
              Contract Reference Number
            </label>
            <input
              type="text"
              value={contractReference}
              onChange={(e) => setContractReference(e.target.value)}
              placeholder="e.g., CTR/2026/VEG/001"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20"
              style={{ 
                borderColor: '#E0DDD6',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            />
          </div>

          {/* Exclusive Supply Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
            <input
              type="checkbox"
              id="exclusiveSupply"
              checked={exclusiveSupply}
              onChange={(e) => setExclusiveSupply(e.target.checked)}
              className="mt-1"
              style={{ accentColor: '#40916C' }}
            />
            <label htmlFor="exclusiveSupply" className="flex-1">
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                Exclusive Supply Agreement
              </div>
              <p className="text-sm mt-1" style={{ color: '#717182' }}>
                This farmer agrees to supply exclusively to this exporter for the contract period.
              </p>
            </label>
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
              <strong>Data Relationship:</strong> Linking this farmer creates a parent-child relationship. 
              KEPHIS movement restrictions on the farm will automatically notify the exporter's dashboard.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:bg-gray-50"
              style={{ 
                color: '#1B4332',
                backgroundColor: 'transparent',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: '#40916C', color: '#FFFFFF' }}
            >
              <Link2 className="w-5 h-5" />
              Confirm Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
