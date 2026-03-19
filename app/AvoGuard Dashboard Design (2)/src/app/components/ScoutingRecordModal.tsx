import { X, MapPin, User, Calendar, Clock, CheckCircle, AlertTriangle, Leaf } from 'lucide-react';

interface ScoutingRecordData {
  id: string;
  scout: string;
  farm: string;
  location: string;
  date: string;
  time: string;
  blocksInspected: number;
  issuesFound: number;
  status: string;
}

interface ScoutingRecordModalProps {
  recordData: ScoutingRecordData | null;
  onClose: () => void;
}

export function ScoutingRecordModal({ recordData, onClose }: ScoutingRecordModalProps) {
  if (!recordData) return null;

  // Mock detailed data
  const detailData = {
    scoutPhone: '+254 722 345 678',
    scoutEmail: 'scout@agriguard.co.ke',
    duration: '2h 15min',
    totalTrees: 450,
    weatherCondition: 'Partly cloudy, 24°C',
    soilMoisture: 'Adequate',
    overallHealth: 'Good',
    blocksDetails: [
      {
        blockId: 'Block A-12',
        treesInspected: 150,
        healthStatus: 'Fair',
        issuesFound: 1,
        issue: 'Avocado Thrips detected',
        severity: 'high',
      },
      {
        blockId: 'Block A-13',
        treesInspected: 180,
        healthStatus: 'Good',
        issuesFound: 1,
        issue: 'Minor leaf damage',
        severity: 'low',
      },
      {
        blockId: 'Block B-5',
        treesInspected: 120,
        healthStatus: 'Excellent',
        issuesFound: 0,
        issue: null,
        severity: null,
      },
    ],
    observations: [
      'Some trees showing early signs of stress in Block A-12',
      'Irrigation system functioning properly',
      'Good canopy development in most blocks',
      'Recent pruning work appears effective',
    ],
    photos: 12,
    gpsTrack: 'Recorded',
    nextScheduledVisit: 'Mar 22, 2026',
    notes: 'Overall farm condition is good. The thrips infestation in Block A-12 requires immediate attention to prevent spread to adjacent blocks. Farmer has been notified and is prepared to implement recommended treatment protocol.',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#74C69D', color: '#FFFFFF' }}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Scouting Record: {recordData.id}
              </h2>
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Field Inspection Report
              </p>
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
        <div className="p-6">
          {/* Status Banner */}
          {recordData.issuesFound > 0 && (
            <div 
              className="p-4 rounded-lg border mb-6 flex items-center gap-3"
              style={{ backgroundColor: '#FEF3C7', borderColor: '#D97706', borderRadius: '8px' }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#D97706' }} />
              <div>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
                  <strong>{recordData.issuesFound} issue{recordData.issuesFound > 1 ? 's' : ''}</strong> detected during this inspection. Cases have been created for follow-up.
                </p>
              </div>
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Field Scout
              </label>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-1" style={{ color: '#2D6A4F' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {recordData.scout}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {detailData.scoutPhone}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {detailData.scoutEmail}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Farm & Location
              </label>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" style={{ color: '#2D6A4F' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {recordData.farm}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {recordData.location}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Inspection Date & Time
              </label>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-1" style={{ color: '#717182' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {recordData.date}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {recordData.time} ({detailData.duration})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div 
              className="p-4 rounded-lg border text-center"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p className="text-2xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {recordData.blocksInspected}
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Blocks Inspected
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border text-center"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p className="text-2xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {detailData.totalTrees}
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Trees Checked
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border text-center"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p className="text-2xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: recordData.issuesFound > 0 ? '#D97706' : '#2D6A4F' }}>
                {recordData.issuesFound}
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Issues Found
              </p>
            </div>

            <div 
              className="p-4 rounded-lg border text-center"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p className="text-2xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {detailData.photos}
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Photos Taken
              </p>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-3 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Environmental Conditions
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
              >
                <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Weather
                </p>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  {detailData.weatherCondition}
                </p>
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
              >
                <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Soil Moisture
                </p>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  {detailData.soilMoisture}
                </p>
              </div>
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
              >
                <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Overall Health
                </p>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                  {detailData.overallHealth}
                </p>
              </div>
            </div>
          </div>

          {/* Block Details */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-3 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Block-by-Block Report
            </label>
            <div className="space-y-3">
              {detailData.blocksDetails.map((block, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: block.issuesFound > 0 ? '#FEF3C7' : '#E0DDD6', 
                    borderRadius: '8px',
                    borderWidth: block.issuesFound > 0 ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Leaf className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                      <div>
                        <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                          {block.blockId}
                        </h4>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          {block.treesInspected} trees inspected
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: block.healthStatus === 'Excellent' ? '#74C69D20' : block.healthStatus === 'Good' ? '#DBEAFE' : '#FEF3C7',
                        color: block.healthStatus === 'Excellent' ? '#2D6A4F' : block.healthStatus === 'Good' ? '#1E40AF' : '#D97706',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {block.healthStatus}
                    </span>
                  </div>
                  
                  {block.issuesFound > 0 && (
                    <div 
                      className="p-3 rounded-lg mt-2"
                      style={{ 
                        backgroundColor: block.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                        borderRadius: '8px',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle 
                          className="w-4 h-4" 
                          style={{ color: block.severity === 'high' ? '#DC2626' : '#D97706' }} 
                        />
                        <p className="text-sm" style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          color: block.severity === 'high' ? '#DC2626' : '#D97706' 
                        }}>
                          <strong>Issue Detected:</strong> {block.issue}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-3 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              General Observations
            </label>
            <div className="space-y-2">
              {detailData.observations.map((obs, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
                >
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontSize: '10px' }}
                  >
                    •
                  </div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {obs}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scout's Notes */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Scout's Additional Notes
            </label>
            <p 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: '#F7F4EF', 
                borderColor: '#E0DDD6', 
                fontFamily: 'IBM Plex Sans, sans-serif', 
                color: '#1B4332',
                borderRadius: '8px',
              }}
            >
              {detailData.notes}
            </p>
          </div>

          {/* Next Visit */}
          <div 
            className="p-4 rounded-lg border flex items-center justify-between mb-6"
            style={{ backgroundColor: '#74C69D10', borderColor: '#74C69D40', borderRadius: '8px' }}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" style={{ color: '#2D6A4F' }} />
              <div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Next Scheduled Visit
                </p>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  {detailData.nextScheduledVisit}
                </p>
              </div>
            </div>
            <span
              className="px-3 py-1.5 rounded-full text-sm"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              Scheduled
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: '#E0DDD6' }}>
            <button
              className="flex-1 px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={onClose}
            >
              Download Report (PDF)
            </button>
            <button
              className="px-6 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
                color: '#1B4332',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={onClose}
            >
              View Photos ({detailData.photos})
            </button>
            <button
              className="px-6 py-3 rounded-lg border transition-colors"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
                color: '#1B4332',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
