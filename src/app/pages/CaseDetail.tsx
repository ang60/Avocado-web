import { useEffect, useState } from 'react';
import { 
  MapPin, User, Phone, Image, Mic, PlayCircle, ChevronDown, Lock, Unlock,
  AlertTriangle, CheckCircle, Clock, MessageSquare, FileText, Send, Shield
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { getApiErrorMessage } from '../api/errors';
import { fetchCaseDetail, mapVerifiedCaseResponseToDetail, verifyAndCloseCase } from '../api/realApi';
import type { CaseDetailPayload } from '../api/types';

export function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [chemicalGateUnlocked, setChemicalGateUnlocked] = useState(false);
  const [selectedIPMSteps, setSelectedIPMSteps] = useState<string[]>([]);
  const [phiDays, setPhiDays] = useState('14');
  const [recommendedChemical, setRecommendedChemical] = useState('');
  const [applicationRate, setApplicationRate] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'kiswahili'>('english');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showVerifySuccessModal, setShowVerifySuccessModal] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [data, setData] = useState<CaseDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCaseDetail(caseId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load case details.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  // Keep diagnosis selection in sync with the currently opened case.
  // This must be declared BEFORE early returns (loading/error), otherwise
  // React throws "Rendered more hooks than during the previous render".
  const pestDiseaseKnowledgeBaseForSelection = [
    { value: 'false-codling-moth', label: 'False Codling Moth' },
    { value: 'avocado-thrips', label: 'Avocado Thrips' },
    { value: 'phytophthora-root-rot', label: 'Phytophthora Root Rot' },
    { value: 'anthracnose', label: 'Anthracnose' },
    { value: 'persea-mite', label: 'Persea Mite' },
  ];

  const normalizeDiagnosisTextForSelection = (input: string) => {
    return (input || '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  };

  useEffect(() => {
    if (!data?.id) return;

    const caseDiagnosisText = String(data.pestDisease ?? '').trim();
    const fallbackDiagnosisValue = pestDiseaseKnowledgeBaseForSelection[1]?.value ?? 'avocado-thrips';
    const normalizedCaseDiagnosis = normalizeDiagnosisTextForSelection(caseDiagnosisText);

    const matchedDiagnosisOption =
      pestDiseaseKnowledgeBaseForSelection.find(
        (o) =>
          normalizeDiagnosisTextForSelection(o.value) === normalizedCaseDiagnosis ||
          normalizeDiagnosisTextForSelection(o.label) === normalizedCaseDiagnosis,
      ) ?? null;

    const nextDiagnosisValue = caseDiagnosisText
      ? matchedDiagnosisOption
        ? matchedDiagnosisOption.value
        : '__custom__'
      : fallbackDiagnosisValue;

    setSelectedDiagnosis(nextDiagnosisValue);
    // Reset UI when switching between cases.
    setSelectedIPMSteps([]);
    setChemicalGateUnlocked(false);
    setPhiDays('14');
    setRecommendedChemical('');
    setApplicationRate('');
    setShowDraftModal(false);
    setShowVerifyModal(false);
    setShowVerifySuccessModal(false);
    setVerifyError(null);
  }, [data?.id, data?.pestDisease]);

  useEffect(() => {
    if (!showVerifySuccessModal) return;
    const timeoutId = window.setTimeout(() => {
      navigate('/case-management');
    }, 1600);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, showVerifySuccessModal]);

  if (loading) {
    return (
      <>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading case…</p>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <div className="p-6 rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#b45309' }}>{error ?? 'No data available.'}</p>
        </div>
      </>
    );
  }

  const caseData = data;

  const pestDiseaseKnowledgeBase = [
    { value: 'false-codling-moth', label: 'False Codling Moth' },
    { value: 'avocado-thrips', label: 'Avocado Thrips' },
    { value: 'phytophthora-root-rot', label: 'Phytophthora Root Rot' },
    { value: 'anthracnose', label: 'Anthracnose' },
    { value: 'persea-mite', label: 'Persea Mite' },
  ];

  const normalizeDiagnosisText = (input: string) => {
    // Remove emoji characters and normalize to a comparable “words-only” string.
    return (input || '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  };

  const caseDiagnosisText = String(caseData.pestDisease ?? '').trim();
  const fallbackDiagnosisValue = pestDiseaseKnowledgeBase[1]?.value ?? 'avocado-thrips';
  const normalizedCaseDiagnosis = normalizeDiagnosisText(caseDiagnosisText);

  const matchedDiagnosisOption =
    pestDiseaseKnowledgeBase.find(
      (o) =>
        normalizeDiagnosisText(o.value) === normalizedCaseDiagnosis ||
        normalizeDiagnosisText(o.label) === normalizedCaseDiagnosis,
    ) ?? null;

  const selectedDiagnosisValue = caseDiagnosisText
    ? matchedDiagnosisOption
      ? matchedDiagnosisOption.value
      : '__custom__'
    : fallbackDiagnosisValue;

  const diagnosisOptions =
    caseDiagnosisText && !matchedDiagnosisOption
      ? [...pestDiseaseKnowledgeBase, { value: '__custom__', label: caseDiagnosisText }]
      : pestDiseaseKnowledgeBase;

  const selectedDiagnosisLabel =
    diagnosisOptions.find((p) => p.value === selectedDiagnosis)?.label ??
    caseDiagnosisText ??
    'Field diagnosis';

  const currentMatchedDiagnosisOption =
    pestDiseaseKnowledgeBase.find((o) => o.value === selectedDiagnosis) ?? null;

  const severityBadge = (() => {
    const severity = String(caseData.severity ?? 'unknown').toLowerCase();
    if (severity === 'high') return { label: 'High Severity', bg: '#FEE2E2', text: '#DC2626' };
    if (severity === 'medium') return { label: 'Medium Severity', bg: '#FEF3C7', text: '#B45309' };
    if (severity === 'low') return { label: 'Low Severity', bg: '#DCFCE7', text: '#166534' };
    return { label: 'Unknown Severity', bg: '#F3F4F6', text: '#6B7280' };
  })();

  const statusBadge = (() => {
    const status = String(caseData.caseStatus ?? 'new').toLowerCase();
    if (status === 'under_review') return { label: 'Under Review', bg: '#FEF3C7', text: '#B45309' };
    if (status === 'verified') return { label: 'Advisory Issued', bg: '#DBEAFE', text: '#1D4ED8' };
    if (status === 'closed') return { label: 'Closed', bg: '#DCFCE7', text: '#166534' };
    return { label: 'New', bg: '#E0E7FF', text: '#4338CA' };
  })();

  const ipmSteps = [
    { id: 'pruning', label: 'Pruning affected branches', category: 'Cultural Control' },
    { id: 'sanitation', label: 'Field sanitation & removal of fallen fruit', category: 'Cultural Control' },
    { id: 'pheromone-traps', label: 'Deploy pheromone traps', category: 'Monitoring' },
    { id: 'biological-control', label: 'Release parasitoid wasps (Biological control)', category: 'Biological Control' },
    { id: 'netting', label: 'Install fruit netting barriers', category: 'Physical Control' },
    { id: 'monitoring', label: 'Weekly monitoring & trap counts', category: 'Monitoring' },
  ];

  const handleIPMToggle = (stepId: string) => {
    if (selectedIPMSteps.includes(stepId)) {
      setSelectedIPMSteps(selectedIPMSteps.filter(id => id !== stepId));
    } else {
      setSelectedIPMSteps([...selectedIPMSteps, stepId]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="col-span-9">
          {/* Header: Farmer & Field Context */}
          <div 
            className="p-6 rounded-lg border mb-6"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E0DDD6', 
              borderRadius: '8px',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 
                    className="text-3xl"
                    style={{ 
                      fontFamily: 'DM Serif Display, serif',
                      color: '#1B4332',
                    }}
                  >
                    Case {caseData.caseCode || caseData.id}
                  </h1>
                  <span
                    className="px-3 py-1 rounded text-xs uppercase"
                    style={{
                      backgroundColor: severityBadge.bg,
                      color: severityBadge.text,
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {severityBadge.label}
                  </span>
                  <span
                    className="px-3 py-1 rounded text-xs uppercase"
                    style={{
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.text,
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-3 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Farmer
                      </p>
                    </div>
                    <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.farmerName}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      <Phone className="w-3 h-3" />
                      {caseData.farmerPhone}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Location
                      </p>
                    </div>
                    <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.farm}
                    </p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {caseData.block} • {caseData.subCounty}, {caseData.location}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                      <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Scout
                      </p>
                    </div>
                    <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.scoutName}
                    </p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {caseData.dateSubmitted}
                    </p>
                  </div>
                </div>
              </div>

              {/* Block Structure Map Snippet */}
              <div 
                className="w-48 h-32 rounded-lg border overflow-hidden shrink-0"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <MapPin className="w-8 h-8 mb-2" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs text-center mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    Block A-12
                  </p>
                  <p className="text-xs text-center" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    45 trees affected
                  </p>
                  <p className="text-xs text-center mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    View Full Map →
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Gallery */}
          <div 
            className="p-6 rounded-lg border mb-6"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E0DDD6', 
              borderRadius: '8px',
            }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
                fontSize: '18px',
              }}
            >
              Evidence Gallery
            </h2>

            {caseData.submissionChannel === 'smartphone' && (
              <>
                {/* Photo Evidence */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '500' }}>
                      Smartphone Evidence ({caseData.photos.length} photos)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-3 sm:gap-4">
                    {caseData.photos.map((photo) => (
                      <div 
                        key={photo.id}
                        className="rounded-lg border overflow-hidden cursor-pointer hover:border-green-400 transition-all"
                        style={{ 
                          borderColor: '#E0DDD6',
                          borderRadius: '8px',
                        }}
                      >
                        <div 
                          className="h-40 flex items-center justify-center"
                          style={{ backgroundColor: '#F7F4EF' }}
                        >
                          <div className="text-center">
                            <Image className="w-12 h-12 mx-auto mb-2" style={{ color: '#2D6A4F', opacity: 0.3 }} />
                            <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                              {photo.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice Note */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '500' }}>
                      Voice Note
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border flex items-center gap-4"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                    }}
                  >
                    <button
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      <PlayCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    </button>
                    <div className="flex-1">
                      <div className="h-2 rounded-full mb-1" style={{ backgroundColor: '#E0DDD6' }}>
                        <div className="h-2 rounded-full" style={{ backgroundColor: '#2D6A4F', width: '35%', borderRadius: '999px' }}></div>
                      </div>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Duration: {caseData.voiceNote.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {caseData.submissionChannel === 'ussd' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '500' }}>
                    USSD Symptom Codes Reported
                  </p>
                </div>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: '#FEF3C7',
                    borderColor: '#D97706',
                    borderRadius: '8px',
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {caseData.symptomCodes.map((code, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded text-sm"
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#1B4332',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontWeight: '600',
                          borderRadius: '8px',
                        }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>
                    Feature phone submission via USSD menu
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic & Advisory Panel */}
          <div className="mb-4 grid grid-cols-1 gap-4 min-w-0 sm:mb-6 sm:grid-cols-2 sm:gap-6">
            {/* Left Side: Diagnosis */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#E0DDD6', 
                borderRadius: '8px',
              }}
            >
              <h3 
                className="mb-4"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                  fontWeight: '600',
                }}
              >
                Diagnosis
              </h3>

              <label className="block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Confirm Pest/Disease from Knowledge Base
              </label>
              <div className="relative mb-4">
                <select
                  value={selectedDiagnosis || selectedDiagnosisValue}
                  onChange={(e) => setSelectedDiagnosis(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border outline-none appearance-none"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    backgroundColor: '#F7F4EF',
                    borderRadius: '8px',
                    color: '#1B4332',
                  }}
                >
                  {diagnosisOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#717182' }} />
              </div>

              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#EFF6FF',
                  borderLeftColor: '#3B82F6',
                  borderRadius: '8px',
                }}
              >
                <p className="text-xs mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF', fontWeight: '600' }}>
                  Knowledge Base Match
                </p>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
                  {currentMatchedDiagnosisOption
                    ? `Based on symptoms, this matches ${currentMatchedDiagnosisOption.label} profile.`
                    : `Using case pest/disease value: ${caseDiagnosisText || 'Field diagnosis'}.`}
                </p>
              </div>
            </div>

            {/* Right Side: Corrective Action */}
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#E0DDD6', 
                borderRadius: '8px',
              }}
            >
              <h3 
                className="mb-4"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                  fontWeight: '600',
                }}
              >
                IPM Advisory Wizard
              </h3>

              <p className="text-xs mb-3 uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Select Integrated Pest Management Steps
              </p>

              <div className="space-y-2">
                {ipmSteps.map((step) => (
                  <label
                    key={step.id}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ 
                      border: selectedIPMSteps.includes(step.id) ? '2px solid #2D6A4F' : '1px solid #E0DDD6',
                      borderRadius: '8px',
                      backgroundColor: selectedIPMSteps.includes(step.id) ? '#F0FDF4' : '#FFFFFF',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIPMSteps.includes(step.id)}
                      onChange={() => handleIPMToggle(step.id)}
                      className="mt-1"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '500' }}>
                        {step.label}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {step.category}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Chemical Guidance Gate */}
          <div 
            className="p-6 rounded-lg mb-6"
            style={{ 
              backgroundColor: chemicalGateUnlocked ? '#FEF3C7' : '#F7F4EF', 
              border: '2px solid',
              borderColor: chemicalGateUnlocked ? '#D97706' : '#E0DDD6',
              borderRadius: '8px',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: chemicalGateUnlocked ? '#D97706' : '#717182' }}
                >
                  {chemicalGateUnlocked ? (
                    <Unlock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  ) : (
                    <Lock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  )}
                </div>
                <div>
                  <h3 
                    className="mb-1"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    Chemical Intervention (Gated)
                  </h3>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Agronomist authorization required
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  Unlock Chemical Recommendations
                </span>
                <div 
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: chemicalGateUnlocked ? '#2D6A4F' : '#E0DDD6' }}
                  onClick={() => setChemicalGateUnlocked(!chemicalGateUnlocked)}
                >
                  <div 
                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: chemicalGateUnlocked ? 'translateX(24px)' : 'translateX(0)' }}
                  />
                </div>
              </label>
            </div>

            {chemicalGateUnlocked && (
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: '#FEE2E2',
                    borderLeftColor: '#DC2626',
                    borderRadius: '8px',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#DC2626' }} />
                    <div>
                      <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#991B1B', fontWeight: '600' }}>
                        WARNING
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#991B1B' }}>
                        Chemical recommendations must comply with Kenya PCPB regulations and export standards (GlobalG.A.P., EU MRL).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Recommended Chemical (Active Ingredient)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Spinosad 480 g/L SC"
                      value={recommendedChemical}
                      onChange={(e) => setRecommendedChemical(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Application Rate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 100ml per 20L water"
                      value={applicationRate}
                      onChange={(e) => setApplicationRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border outline-none"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderColor: '#E0DDD6',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        color: '#1B4332',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Pre-Harvest Interval (PHI) *Required
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={phiDays}
                        onChange={(e) => setPhiDays(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border outline-none"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#DC2626',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          color: '#1B4332',
                          borderWidth: '2px',
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        days
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: '#DCFCE7',
                    borderRadius: '8px',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5" style={{ color: '#15803D' }} />
                    <div>
                      <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D', fontWeight: '600' }}>
                        PHI Reminder System Enabled
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
                        Farmer will receive automated SMS reminder {phiDays} days before harvest is safe. Compliance tracking enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verify & Close Case Button */}
          <div className="flex gap-3">
            <button
              className="flex-1 px-6 py-3 rounded-lg transition-colors hover:opacity-90 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={() => setShowVerifyModal(true)}
            >
              <CheckCircle className="w-5 h-5" />
              Verify & Close Case
            </button>
            <button
              className="px-6 py-3 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-2"
              style={{
                borderColor: '#E0DDD6',
                color: '#1B4332',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={() => setShowDraftModal(true)}
            >
              <Send className="w-4 h-4" />
              Send Draft to Farmer
            </button>
          </div>
        </div>

        {/* Right Sidebar: Case Timeline */}
        <div className="col-span-3">
          <div 
            className="p-6 rounded-lg border sticky top-6"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E0DDD6', 
              borderRadius: '8px',
            }}
          >
            <h3 
              className="mb-6"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
              }}
            >
              Case Timeline
            </h3>

            <div className="space-y-6">
              {caseData.timeline.map((item, index) => (
                <div key={index} className="relative">
                  {index !== caseData.timeline.length - 1 && (
                    <div 
                      className="absolute left-4 top-10 w-0.5 h-full -ml-px"
                      style={{ 
                        backgroundColor: item.status === 'completed' ? '#74C69D' : '#E0DDD6',
                      }}
                    />
                  )}
                  
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10"
                      style={{ 
                        backgroundColor: 
                          item.status === 'completed' ? '#74C69D' : 
                          item.status === 'current' ? '#2D6A4F' : '#E0DDD6',
                      }}
                    >
                      {item.status === 'completed' && <CheckCircle className="w-4 h-4" style={{ color: '#FFFFFF' }} />}
                      {item.status === 'current' && <Clock className="w-4 h-4" style={{ color: '#FFFFFF' }} />}
                      {item.status === 'pending' && <Clock className="w-4 h-4" style={{ color: '#717182' }} />}
                    </div>
                    
                    <div className="flex-1 pb-2">
                      <p 
                        className="text-sm mb-1"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          color: '#1B4332',
                          fontWeight: item.status === 'current' ? '600' : '500',
                        }}
                      >
                        {item.stage}
                      </p>
                      {item.timestamp && (
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          {item.timestamp}
                        </p>
                      )}
                      {item.status === 'pending' && (
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          Pending
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="mt-6 p-4 rounded-lg border-l-4"
              style={{ 
                backgroundColor: '#EFF6FF',
                borderLeftColor: '#3B82F6',
                borderRadius: '8px',
              }}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5" style={{ color: '#1E40AF' }} />
                <div>
                  <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF', fontWeight: '600' }}>
                    SMS Fallback Notification
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
                    When case is closed, advisory will be sent to {caseData.farmerPhone} via SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Draft to Farmer Modal */}
      {showDraftModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowDraftModal(false)}
        >
          <div 
            className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#E0DDD6' }}
            >
              <h2 
                className="text-xl"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  color: '#1B4332',
                }}
              >
                Review Advisory Message
              </h2>
              <button
                onClick={() => setShowDraftModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: '#717182' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Farmer Info */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#F7F4EF' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Sending To
                    </p>
                    <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.farmerName}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      <Phone className="w-3 h-3" />
                      {caseData.farmerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Case ID
                    </p>
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.caseCode || caseData.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Select Language
                </p>
                <div className="flex gap-3">
                  <label
                    className="flex-1 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: selectedLanguage === 'english' ? '#2D6A4F' : '#E0DDD6',
                      backgroundColor: selectedLanguage === 'english' ? '#F0FDF4' : '#FFFFFF',
                      borderWidth: selectedLanguage === 'english' ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="language"
                        value="english"
                        checked={selectedLanguage === 'english'}
                        onChange={() => setSelectedLanguage('english')}
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <div>
                        <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                          English
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          Send advisory in English
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className="flex-1 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: selectedLanguage === 'kiswahili' ? '#2D6A4F' : '#E0DDD6',
                      backgroundColor: selectedLanguage === 'kiswahili' ? '#F0FDF4' : '#FFFFFF',
                      borderWidth: selectedLanguage === 'kiswahili' ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="language"
                        value="kiswahili"
                        checked={selectedLanguage === 'kiswahili'}
                        onChange={() => setSelectedLanguage('kiswahili')}
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <div>
                        <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                          Kiswahili
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          Tuma ushauri kwa Kiswahili
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMS Preview - English */}
              {selectedLanguage === 'english' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      SMS Message (English)
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderColor: '#E0DDD6',
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <strong>AvoGuard Advisory - {caseData.caseCode || caseData.id}</strong><br /><br />
                      
                      Diagnosis: {selectedDiagnosisLabel}<br /><br />
                      
                      Recommended Actions:<br />
                      {selectedIPMSteps.length > 0 ? (
                        selectedIPMSteps.map((stepId, idx) => {
                          const step = ipmSteps.find(s => s.id === stepId);
                          return `${idx + 1}. ${step?.label}\n`;
                        }).join('')
                      ) : '- No IPM steps selected yet'}
                      <br />
                      
                      {chemicalGateUnlocked && (
                        <>
                          ⚠️ Chemical Treatment: Follow label instructions. PHI: {phiDays} days before harvest.<br /><br />
                        </>
                      )}
                      
                      Questions? Call AvoGuard Hotline: 1234<br />
                      - SAFIC Team
                    </p>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#E0DDD6' }}>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Character count: ~{350 + (selectedIPMSteps.length * 40)}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {Math.ceil((350 + (selectedIPMSteps.length * 40)) / 160)} SMS segments
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Preview - Kiswahili */}
              {selectedLanguage === 'kiswahili' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      SMS Message (Kiswahili)
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderColor: '#E0DDD6',
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <strong>AvoGuard Ushauri - {caseData.caseCode || caseData.id}</strong><br /><br />
                      
                      Tathmini: {caseData.pestDiseaseKiswahili}<br /><br />
                      
                      Hatua za Kudhibiti:<br />
                      {selectedIPMSteps.length > 0 ? (
                        selectedIPMSteps.map((stepId, idx) => {
                          const step = ipmSteps.find(s => s.id === stepId);
                          return `${idx + 1}. ${step?.label}\n`;
                        }).join('')
                      ) : '- Hakuna hatua zilizochaguliwa bado'}
                      <br />
                      
                      {chemicalGateUnlocked && (
                        <>
                          ⚠️ Dawa ya Kemikali: Fuata maagizo. Siku {phiDays} kabla ya kuvuna.<br /><br />
                        </>
                      )}
                      
                      Maswali? Piga simu AvoGuard: 1234<br />
                      - Timu ya SAFIC
                    </p>
                  </div>
                </div>
              )}

              {/* Warning Notice */}
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  borderLeftColor: '#D97706',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#D97706' }} />
                  <div>
                    <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E', fontWeight: '600' }}>
                      Important Notice
                    </p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>
                      This advisory will be sent via SMS to the farmer's registered phone number in {selectedLanguage === 'english' ? 'English' : 'Kiswahili'}. The farmer can also access full details via the AvoGuard mobile app.
                    </p>
                  </div>
                </div>
              </div>

              {verifyError ? (
                <div
                  className="p-3 rounded-lg border-l-4"
                  style={{ backgroundColor: '#FEF2F2', borderLeftColor: '#DC2626' }}
                >
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#991B1B' }}>
                    {verifyError}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div 
              className="px-6 py-4 border-t flex items-center justify-end gap-3"
              style={{ borderColor: '#E0DDD6' }}
            >
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-6 py-3 rounded-lg border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Simulate sending SMS
                  alert(`Advisory sent to ${caseData.farmerName} at ${caseData.farmerPhone}`);
                  setShowDraftModal(false);
                }}
                className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                <Send className="w-4 h-4" />
                Send Advisory to Farmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify & Close Case Modal */}
      {showVerifyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowVerifyModal(false)}
        >
          <div 
            className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#E0DDD6' }}
            >
              <h2 
                className="text-xl"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  color: '#1B4332',
                }}
              >
                Verify & Close Case
              </h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: '#717182' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Farmer Info */}
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#F7F4EF' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Sending To
                    </p>
                    <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.farmerName}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      <Phone className="w-3 h-3" />
                      {caseData.farmerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Case ID
                    </p>
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {caseData.caseCode || caseData.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Select Language
                </p>
                <div className="flex gap-3">
                  <label
                    className="flex-1 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: selectedLanguage === 'english' ? '#2D6A4F' : '#E0DDD6',
                      backgroundColor: selectedLanguage === 'english' ? '#F0FDF4' : '#FFFFFF',
                      borderWidth: selectedLanguage === 'english' ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="language"
                        value="english"
                        checked={selectedLanguage === 'english'}
                        onChange={() => setSelectedLanguage('english')}
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <div>
                        <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                          English
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          Send advisory in English
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className="flex-1 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: selectedLanguage === 'kiswahili' ? '#2D6A4F' : '#E0DDD6',
                      backgroundColor: selectedLanguage === 'kiswahili' ? '#F0FDF4' : '#FFFFFF',
                      borderWidth: selectedLanguage === 'kiswahili' ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="language"
                        value="kiswahili"
                        checked={selectedLanguage === 'kiswahili'}
                        onChange={() => setSelectedLanguage('kiswahili')}
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <div>
                        <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                          Kiswahili
                        </p>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          Tuma ushauri kwa Kiswahili
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMS Preview - English */}
              {selectedLanguage === 'english' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      SMS Message (English)
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderColor: '#E0DDD6',
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <strong>AvoGuard Advisory - {caseData.caseCode || caseData.id}</strong><br /><br />
                      
                      Diagnosis: {selectedDiagnosisLabel}<br /><br />
                      
                      Recommended Actions:<br />
                      {selectedIPMSteps.length > 0 ? (
                        selectedIPMSteps.map((stepId, idx) => {
                          const step = ipmSteps.find(s => s.id === stepId);
                          return `${idx + 1}. ${step?.label}\n`;
                        }).join('')
                      ) : '- No IPM steps selected yet'}
                      <br />
                      
                      {chemicalGateUnlocked && (
                        <>
                          ⚠️ Chemical Treatment: Follow label instructions. PHI: {phiDays} days before harvest.<br /><br />
                        </>
                      )}
                      
                      Questions? Call AvoGuard Hotline: 1234<br />
                      - SAFIC Team
                    </p>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#E0DDD6' }}>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Character count: ~{350 + (selectedIPMSteps.length * 40)}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {Math.ceil((350 + (selectedIPMSteps.length * 40)) / 160)} SMS segments
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Preview - Kiswahili */}
              {selectedLanguage === 'kiswahili' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                    <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      SMS Message (Kiswahili)
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderColor: '#E0DDD6',
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <strong>AvoGuard Ushauri - {caseData.caseCode || caseData.id}</strong><br /><br />
                      
                      Tathmini: {caseData.pestDiseaseKiswahili}<br /><br />
                      
                      Hatua za Kudhibiti:<br />
                      {selectedIPMSteps.length > 0 ? (
                        selectedIPMSteps.map((stepId, idx) => {
                          const step = ipmSteps.find(s => s.id === stepId);
                          return `${idx + 1}. ${step?.label}\n`;
                        }).join('')
                      ) : '- Hakuna hatua zilizochaguliwa bado'}
                      <br />
                      
                      {chemicalGateUnlocked && (
                        <>
                          ⚠️ Dawa ya Kemikali: Fuata maagizo. Siku {phiDays} kabla ya kuvuna.<br /><br />
                        </>
                      )}
                      
                      Maswali? Piga simu AvoGuard: 1234<br />
                      - Timu ya SAFIC
                    </p>
                  </div>
                </div>
              )}

              {/* Warning Notice */}
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  borderLeftColor: '#D97706',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: '#D97706' }} />
                  <div>
                    <p className="text-xs mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E', fontWeight: '600' }}>
                      Important Notice
                    </p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>
                      This advisory will be sent via SMS to the farmer's registered phone number in {selectedLanguage === 'english' ? 'English' : 'Kiswahili'}. The farmer can also access full details via the AvoGuard mobile app.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="px-6 py-4 border-t flex items-center justify-end gap-3"
              style={{ borderColor: '#E0DDD6' }}
            >
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-6 py-3 rounded-lg border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                disabled={verifySubmitting}
                onClick={async () => {
                  const diagnosis =
                    diagnosisOptions.find((p) => p.value === selectedDiagnosis)?.label ??
                    selectedDiagnosisLabel ??
                    'Field diagnosis';
                  let recommended_actions = selectedIPMSteps.length
                    ? selectedIPMSteps
                        .map((stepId) => ipmSteps.find((s) => s.id === stepId)?.label)
                        .filter((x): x is string => Boolean(x))
                    : ['Conduct follow-up scouting and reinforce farm sanitation.'];

                  // Keep SMS details aligned with the dashboard chemical gate.
                  if (chemicalGateUnlocked) {
                    const chem = recommendedChemical.trim();
                    const rate = applicationRate.trim();
                    const chemicalAction = chem && rate
                      ? `Chemical Treatment (Gated): Active ingredient: ${chem}. Application rate: ${rate}. PHI: ${phiDays} days before harvest.`
                      : `Chemical Treatment (Gated): Follow label instructions. PHI: ${phiDays} days before harvest.`;

                    recommended_actions = [...recommended_actions, chemicalAction];
                  }
                  try {
                    setVerifySubmitting(true);
                    setVerifyError(null);
                    const result = await verifyAndCloseCase({
                      caseId: caseData.id,
                      diagnosis,
                      recommended_actions,
                    });
                    setData(mapVerifiedCaseResponseToDetail(result.case));
                    setShowVerifyModal(false);
                    setShowVerifySuccessModal(true);
                  } catch (e: unknown) {
                    setVerifyError(getApiErrorMessage(e, 'Could not verify and close this case.'));
                  } finally {
                    setVerifySubmitting(false);
                  }
                }}
                className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: verifySubmitting ? '#9CA3AF' : '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                <Send className="w-4 h-4" />
                {verifySubmitting ? 'Sending...' : 'Send Advisory to Farmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerifySuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="w-full max-w-md rounded-lg p-6 text-center"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '12px' }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <CheckCircle className="h-7 w-7" style={{ color: '#166534' }} />
            </div>
            <h3
              className="mb-2 text-xl"
              style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
            >
              Case closed successfully
            </h3>
            <p
              className="text-sm"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}
            >
              The diagnosis and remedies have been saved, the farmer has been notified, and you will be returned to
              Case Management shortly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}