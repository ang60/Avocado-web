import { X, AlertTriangle, MapPin, User, Clock, Calendar, Send, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

interface TriageCaseData {
  id: string;
  farm: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  pest: string;
  scout: string;
  submittedHours: number;
  priority: number;
}

interface TriageCaseModalProps {
  caseData: TriageCaseData | null;
  onClose: () => void;
}

export function TriageCaseModal({ caseData, onClose }: TriageCaseModalProps) {
  const navigate = useNavigate();
  const [showRequestInfoForm, setShowRequestInfoForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  
  if (!caseData) return null;

  const severityConfig = {
    high: { label: 'High', bg: '#FEE2E2', text: '#DC2626' },
    medium: { label: 'Medium', bg: '#FEF3C7', text: '#D97706' },
    low: { label: 'Low', bg: '#74C69D20', text: '#2D6A4F' },
  };

  const severity = severityConfig[caseData.severity];

  const handleBeginReview = () => {
    navigate(`/case-management/${caseData.id}`);
    onClose();
  };

  const handleSendRequest = () => {
    // In a real app, this would send the request to the backend
    console.log('Sending information request to scout:', {
      caseId: caseData.id,
      scout: caseData.scout,
      scoutPhone: detailData.scoutPhone,
      message: requestMessage,
    });
    
    // Show success feedback (you could add a toast notification here)
    alert(`Information request sent to ${caseData.scout} (${detailData.scoutPhone})`);
    
    setRequestMessage('');
    setShowRequestInfoForm(false);
    onClose();
  };

  // Mock detailed data
  const detailData = {
    block: 'Block A-12',
    affectedTrees: 45,
    submittedDate: 'Mar 15, 2026',
    submittedTime: '12:30',
    scoutPhone: '+254 722 345 678',
    scoutEmail: 'scout@agriguard.co.ke',
    symptoms: ['Leaf scarring', 'Fruit damage', 'Stunted growth', 'Discoloration'],
    description: 'Heavy infestation observed on young leaves and developing fruit. Population density appears to be increasing rapidly. Immediate intervention is strongly recommended to prevent further spread to adjacent blocks.',
    weatherConditions: 'Warm and humid, favorable for pest development',
    previousTreatments: 'None in last 30 days',
    recommendations: [
      'Immediate chemical intervention required',
      'Isolate affected block to prevent spread',
      'Schedule follow-up inspection in 7 days',
      'Notify neighboring farms of outbreak',
    ],
    images: 3,
    gpsCoordinates: '-0.7893°S, 36.9537°E',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg border max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
              style={{ 
                backgroundColor: caseData.priority === 1 ? '#DC2626' : caseData.priority === 2 ? '#D97706' : '#FBBF24',
                color: '#FFFFFF',
                fontFamily: 'DM Serif Display, serif',
              }}
            >
              {caseData.priority}
            </div>
            <div>
              <h2 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Triage Case: {caseData.id}
              </h2>
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Priority {caseData.priority} - Requires Immediate Review
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
          {/* Alert Banner */}
          <div 
            className="p-4 rounded-lg border mb-6 flex items-center gap-3"
            style={{ backgroundColor: '#FEE2E2', borderColor: '#DC2626', borderRadius: '8px' }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: '#DC2626' }} />
            <div>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626' }}>
                <strong>Urgent:</strong> Case has been waiting for {caseData.submittedHours} hours. Immediate agronomist review required.
              </p>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Farm & Location
              </label>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" style={{ color: '#2D6A4F' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {caseData.farm}
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {caseData.location}
                  </p>
                  <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {detailData.gpsCoordinates}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Field Scout
              </label>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-1" style={{ color: '#2D6A4F' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {caseData.scout}
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
                Severity Level
              </label>
              <span
                className="px-3 py-1.5 rounded-full text-sm inline-block"
                style={{
                  backgroundColor: severity.bg,
                  color: severity.text,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                {severity.label} Severity
              </span>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Submitted
              </label>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-1" style={{ color: '#717182' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {detailData.submittedDate}
                  </p>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {detailData.submittedTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pest/Disease Information */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Pest / Disease Identified
            </label>
            <div 
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p className="text-lg mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {caseData.pest}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Block: </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{detailData.block}</span>
                </div>
                <div>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Affected Trees: </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626' }}>{detailData.affectedTrees}</span>
                </div>
                <div>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Images: </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{detailData.images}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Observed Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {detailData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0DDD6',
                    color: '#1B4332',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                  }}
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Scout's Detailed Report
            </label>
            <p 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#E0DDD6', 
                fontFamily: 'IBM Plex Sans, sans-serif', 
                color: '#1B4332',
                borderRadius: '8px',
              }}
            >
              {detailData.description}
            </p>
          </div>

          {/* Environmental Conditions */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Weather Conditions
              </label>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {detailData.weatherConditions}
              </p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Previous Treatments
              </label>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {detailData.previousTreatments}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Recommended Actions
            </label>
            <div className="space-y-2">
              {detailData.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: '#74C69D10', borderColor: '#74C69D40', borderRadius: '8px' }}
                >
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontSize: '10px' }}
                  >
                    {index + 1}
                  </div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
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
              onClick={handleBeginReview}
            >
              Begin Review & Issue Advisory
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
              onClick={() => setShowRequestInfoForm(true)}
            >
              Request More Information
            </button>
          </div>

          {/* Request More Information Form */}
          {showRequestInfoForm && (
            <div 
              className="mt-6 p-4 rounded-lg border"
              style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <h3 className="font-medium" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  Request More Information from Scout
                </h3>
              </div>
              
              <p className="text-sm mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                This message will be sent to <strong>{caseData.scout}</strong> via SMS at <strong>{detailData.scoutPhone}</strong>
              </p>
              
              <label className="text-xs uppercase tracking-wider mb-2 block" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Request Message
              </label>
              <textarea
                className="w-full p-3 rounded-lg border outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#E0DDD6', 
                  fontFamily: 'IBM Plex Sans, sans-serif', 
                  color: '#1B4332', 
                  borderRadius: '8px',
                }}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="E.g., Please provide additional photos of the affected leaves and closer shots of the fruit damage. Also confirm the exact number of trees showing symptoms."
                rows={4}
              />
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {requestMessage.length} / 500 characters
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E0DDD6',
                      color: '#717182',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                    }}
                    onClick={() => {
                      setShowRequestInfoForm(false);
                      setRequestMessage('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#2D6A4F',
                      color: '#FFFFFF',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                    }}
                    onClick={handleSendRequest}
                    disabled={!requestMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}