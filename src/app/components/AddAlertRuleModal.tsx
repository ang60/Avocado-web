import { X } from 'lucide-react';
import { useState } from 'react';

interface AddAlertRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: any) => void;
}

export function AddAlertRuleModal({ isOpen, onClose, onSave }: AddAlertRuleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    condition: 'outbreak_threshold',
    threshold: '',
    county: 'All Counties',
    pest: 'All Pests',
    action: 'email',
    recipients: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: 'active',
      triggered: 0,
      lastTriggered: 'Never',
    });
    setFormData({
      name: '',
      condition: 'outbreak_threshold',
      threshold: '',
      county: 'All Counties',
      pest: 'All Pests',
      action: 'email',
      recipients: '',
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
        className="w-full max-w-3xl rounded-lg border overflow-hidden"
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
            Create Alert Rule
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#717182' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Rule Name *
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
                placeholder="e.g., High Thrips Outbreak in Murang'a"
              />
            </div>

            {/* Condition */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Trigger Condition *
              </label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="outbreak_threshold">Cases exceed threshold</option>
                <option value="new_pest">New pest detected</option>
                <option value="compliance_drop">Scouting compliance drops below</option>
                <option value="severity_high">High severity case reported</option>
                <option value="geographic_cluster">Geographic cluster detected</option>
              </select>
            </div>

            {/* Threshold */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Threshold Value *
              </label>
              <input
                type="number"
                required
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="e.g., 10"
              />
              <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Number of cases or percentage based on selected condition
              </p>
            </div>

            {/* County Filter */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                County Filter
              </label>
              <select
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="All Counties">All Counties</option>
                <option value="Murang'a">Murang'a</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Meru">Meru</option>
                <option value="Nyeri">Nyeri</option>
                <option value="Bungoma">Bungoma</option>
                <option value="Trans Nzoia">Trans Nzoia</option>
                <option value="Embu">Embu</option>
              </select>
            </div>

            {/* Pest Filter */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Pest/Disease Filter
              </label>
              <select
                value={formData.pest}
                onChange={(e) => setFormData({ ...formData, pest: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="All Pests">All Pests/Diseases</option>
                <option value="Avocado Thrips">Avocado Thrips</option>
                <option value="Phytophthora Root Rot">Phytophthora Root Rot</option>
                <option value="Persea Mite">Persea Mite</option>
                <option value="Anthracnose">Anthracnose</option>
                <option value="Cercospora Spot">Cercospora Spot</option>
              </select>
            </div>

            {/* Action */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Alert Action *
              </label>
              <select
                required
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="email">Send Email</option>
                <option value="sms">Send SMS</option>
                <option value="both">Send Email & SMS</option>
                <option value="dashboard">Dashboard Notification Only</option>
              </select>
            </div>

            {/* Recipients */}
            <div>
              <label 
                className="block text-sm mb-2"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Recipients *
              </label>
              <input
                type="text"
                required
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="email@example.com, +254712345678"
              />
              <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Comma-separated email addresses or phone numbers
              </p>
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
              Create Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
