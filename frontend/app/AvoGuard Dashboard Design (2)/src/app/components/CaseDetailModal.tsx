import { X, Calendar, MapPin, Bug, User, AlertCircle, FileText } from 'lucide-react';

export interface CaseDetailData {
  id: string;
  severity: 'high' | 'medium' | 'low';
  farm: string;
  block: string;
  pestDisease: string;
  dateSubmitted: string;
  status: 'new' | 'under-review' | 'advisory-issued';
  scoutName: string;
  location: string;
  affectedTrees: number;
  symptoms: string[];
  notes: string;
  images?: string[];
}

interface CaseDetailModalProps {
  caseData: CaseDetailData | null;
  onClose: () => void;
}

export function CaseDetailModal({ caseData, onClose }: CaseDetailModalProps) {
  if (!caseData) return null;

  const severityColors = {
    high: { bg: '#FEE2E2', text: '#DC2626' },
    medium: { bg: '#FEF3C7', text: '#D97706' },
    low: { bg: '#74C69D20', text: '#2D6A4F' },
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="sticky top-0 flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
            zIndex: 10,
          }}
        >
          <div>
            <h2 
              className="text-2xl mb-1"
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332',
              }}
            >
              Case {caseData.id}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: severityColors[caseData.severity].bg,
                  color: severityColors[caseData.severity].text,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                {caseData.severity.charAt(0).toUpperCase() + caseData.severity.slice(1)} Severity
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#717182' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Location
                </span>
              </div>
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                }}
              >
                {caseData.farm}
              </p>
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                {caseData.block} • {caseData.location}
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Submitted
                </span>
              </div>
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                }}
              >
                {caseData.dateSubmitted}
              </p>
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                By {caseData.scoutName}
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Pest / Disease
                </span>
              </div>
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                }}
              >
                {caseData.pestDisease}
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Affected Trees
                </span>
              </div>
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                }}
              >
                {caseData.affectedTrees} trees
              </p>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h3 
              className="mb-3"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
              }}
            >
              Observed Symptoms
            </h3>
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="px-3 py-1 border rounded-full text-sm"
                  style={{
                    borderColor: '#E0DDD6',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                    borderRadius: '8px',
                  }}
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 
              className="mb-3"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
              }}
            >
              Scout Notes
            </h3>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: '#E0DDD6',
                backgroundColor: '#F7F4EF',
                borderRadius: '8px',
              }}
            >
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                  lineHeight: '1.6',
                }}
              >
                {caseData.notes}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              Issue Advisory
            </button>
            <button
              className="flex-1 px-6 py-3 rounded-lg border transition-colors hover:bg-gray-50"
              style={{
                borderColor: '#E0DDD6',
                color: '#1B4332',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              Assign to Specialist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
