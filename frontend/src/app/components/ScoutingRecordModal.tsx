import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { X, MapPin, User, Calendar, CheckCircle, AlertTriangle, Leaf, Download, Images, Eye } from 'lucide-react';
import type { RecentScoutingRecord } from '../api/types';
import { fetchScoutingReportDetail } from '../api/scoutingApi';
import { getApiErrorMessage } from '../api/errors';
import { splitGalleryUrls } from '../utils/scoutingPayloadDisplay';
import { OptimizedImage } from './OptimizedImage';

interface ScoutingRecordModalProps {
  recordData: RecentScoutingRecord | null;
  onClose: () => void;
}

/** WeeklyRecord UUID for pest_scouting detail API, or registry row id when it matches that API */
export function resolvePestScoutingDetailId(record: RecentScoutingRecord): string | null {
  const wid = record.weeklyRecordId?.trim();
  if (wid) return wid;
  if (record.id.startsWith('app-weekly-')) return record.id.slice('app-weekly-'.length);
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuid.test(record.id.trim())) return record.id.trim();
  return null;
}

export function ScoutingRecordModal({ recordData, onClose }: ScoutingRecordModalProps) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  useEffect(() => {
    setPhotosOpen(false);
    setGalleryUrls([]);
    setGalleryError(null);
    setInlineMessage(null);
  }, [recordData?.id]);

  if (!recordData) return null;

  const detailId = resolvePestScoutingDetailId(recordData);

  // Mock detailed data (dashboard row does not include full block breakdown)
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
        severity: 'high' as const,
      },
      {
        blockId: 'Block A-13',
        treesInspected: 180,
        healthStatus: 'Good',
        issuesFound: 1,
        issue: 'Minor leaf damage',
        severity: 'low' as const,
      },
      {
        blockId: 'Block B-5',
        treesInspected: 120,
        healthStatus: 'Excellent',
        issuesFound: 0,
        issue: null,
        severity: null as null,
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
    notes:
      'Overall farm condition is good. The thrips infestation in Block A-12 requires immediate attention to prevent spread to adjacent blocks. Farmer has been notified and is prepared to implement recommended treatment protocol.',
  };

  const loadedPhotoCount = galleryUrls.length;

  const handleDownloadPdf = () => {
    const el = printRef.current;
    if (!el) return;
    const title = `Scouting ${recordData.recordCode || recordData.id}`;
    const w = window.open('', '_blank');
    if (!w) {
      setInlineMessage('Allow pop-ups to download / print the PDF, or use your browser Print dialog.');
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
      <style>
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #1B4332; padding: 24px; max-width: 900px; margin: 0 auto; }
        h1 { font-size: 1.25rem; margin: 0 0 8px; }
        .sub { color: #64748b; font-size: 0.875rem; margin-bottom: 20px; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #E0DDD6; padding: 8px; text-align: left; font-size: 14px; }
        thead { background: #F7F4EF; }
      </style></head><body>
      <h1>${title}</h1>
      <p class="sub">${recordData.scout} · ${recordData.farm} · ${recordData.location} · ${recordData.date} ${recordData.time}</p>
      ${el.innerHTML}
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  };

  const handleViewPhotos = async () => {
    setInlineMessage(null);
    if (!detailId) {
      setGalleryError('Photos are available once this row is linked to a mobile weekly record.');
      setPhotosOpen(true);
      return;
    }
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const report = await fetchScoutingReportDetail(detailId);
      const { images } = splitGalleryUrls(report);
      setGalleryUrls(images);
      setPhotosOpen(true);
      if (images.length === 0) {
        setGalleryError('No image attachments were returned for this record.');
      }
    } catch (e: unknown) {
      setGalleryError(getApiErrorMessage(e, 'Could not load photos.'));
      setGalleryUrls([]);
      setPhotosOpen(true);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleReviewCase = () => {
    setInlineMessage(null);
    if (!detailId) {
      setInlineMessage('Full review opens for mobile submissions with a linked record. Use Scouting Reports and pick this submission from the main list.');
      return;
    }
    onClose();
    navigate(`/scouting-reports/${detailId}`);
  };

  const photoLabelCount = loadedPhotoCount > 0 ? loadedPhotoCount : detailData.photos;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#74C69D', color: '#FFFFFF' }}
            >
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Scouting Record: {recordData.recordCode || recordData.id}
              </h2>
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {recordData.source === 'mobile_app' ? 'Smartphone submission' : 'Field inspection report'}
                {recordData.blockName ? ` · ${recordData.blockName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            style={{ color: '#717182' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {inlineMessage ? (
            <div
              className="mb-4 rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB', color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {inlineMessage}
            </div>
          ) : null}

          <div ref={printRef} id="scouting-record-print-root">
            {/* Status Banner */}
            {recordData.issuesFound > 0 && (
              <div
                className="mb-6 flex items-center gap-3 rounded-lg border p-4"
                style={{ backgroundColor: '#FEF3C7', borderColor: '#D97706', borderRadius: '8px' }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: '#D97706' }} />
                <div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
                    <strong>
                      {recordData.issuesFound} issue{recordData.issuesFound > 1 ? 's' : ''}
                    </strong>{' '}
                    detected during this inspection. Cases may be created for follow-up.
                  </p>
                </div>
              </div>
            )}

            {(recordData.trapSummary || recordData.findingSummary) && (
              <div
                className="mb-6 rounded-lg border p-4"
                style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}
              >
                <p className="mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Traps & findings (from submission)
                </p>
                {recordData.trapSummary ? (
                  <p className="mb-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <strong>Traps:</strong> {recordData.trapSummary}
                  </p>
                ) : null}
                {recordData.findingSummary ? (
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                    <strong>Findings:</strong> {recordData.findingSummary}
                  </p>
                ) : null}
              </div>
            )}

            {(recordData.farmNameAsSubmitted ||
              recordData.submissionLocation ||
              recordData.beneficialSummary ||
              recordData.diseaseMetaSummary ||
              recordData.gpsSummary) && (
              <div
                className="mb-6 rounded-lg border p-4"
                style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: '8px' }}
              >
                <p className="mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#166534' }}>
                  Mobile form (as submitted)
                </p>
                {recordData.farmNameAsSubmitted ? (
                  <p className="mb-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <strong>Farm name (device):</strong> {recordData.farmNameAsSubmitted}
                  </p>
                ) : null}
                {recordData.submissionLocation ? (
                  <p className="mb-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                    <strong>Location (device):</strong> {recordData.submissionLocation}
                  </p>
                ) : null}
                {recordData.beneficialSummary ? (
                  <p className="mb-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                    <strong>Beneficials:</strong> {recordData.beneficialSummary}
                  </p>
                ) : null}
                {recordData.diseaseMetaSummary ? (
                  <p className="mb-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                    <strong>Disease context:</strong> {recordData.diseaseMetaSummary}
                  </p>
                ) : null}
                {recordData.gpsSummary ? (
                  <p className="font-mono text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#475569' }}>
                    <strong>GPS:</strong> {recordData.gpsSummary}
                  </p>
                ) : null}
              </div>
            )}

            {/* Key Information Grid */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Field Scout
                </label>
                <div className="flex items-start gap-2">
                  <User className="mt-1 h-4 w-4" style={{ color: '#2D6A4F' }} />
                  <div>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{recordData.scout}</p>
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
                <label className="mb-2 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Farm & Location
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4" style={{ color: '#2D6A4F' }} />
                  <div>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{recordData.farm}</p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {recordData.location}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Inspection Date & Time
                </label>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-1 h-4 w-4" style={{ color: '#717182' }} />
                  <div>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{recordData.date}</p>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {recordData.time} ({detailData.duration})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-4 text-center" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                <p className="mb-1 text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                  {recordData.blocksInspected}
                </p>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Blocks Inspected
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                <p className="mb-1 text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                  {detailData.totalTrees}
                </p>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Trees Checked
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                <p
                  className="mb-1 text-2xl"
                  style={{ fontFamily: 'DM Serif Display, serif', color: recordData.issuesFound > 0 ? '#D97706' : '#2D6A4F' }}
                >
                  {recordData.issuesFound}
                </p>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Issues Found
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                <p className="mb-1 text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                  {loadedPhotoCount > 0 ? loadedPhotoCount : detailData.photos}
                </p>
                <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Photos Taken
                </p>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="mb-6">
              <label className="mb-3 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Environmental Conditions
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                  <p className="mb-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Weather
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{detailData.weatherCondition}</p>
                </div>
                <div className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                  <p className="mb-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Soil Moisture
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{detailData.soilMoisture}</p>
                </div>
                <div className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
                  <p className="mb-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Overall Health
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>{detailData.overallHealth}</p>
                </div>
              </div>
            </div>

            {/* Block Details */}
            <div className="mb-6">
              <label className="mb-3 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Block-by-Block Report
              </label>
              <div className="space-y-3">
                {detailData.blocksDetails.map((block, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: block.issuesFound > 0 ? '#FEF3C7' : '#E0DDD6',
                      borderRadius: '8px',
                      borderWidth: block.issuesFound > 0 ? '2px' : '1px',
                    }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Leaf className="h-5 w-5" style={{ color: '#2D6A4F' }} />
                        <div>
                          <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{block.blockId}</h4>
                          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                            {block.treesInspected} trees inspected
                          </p>
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs"
                        style={{
                          backgroundColor:
                            block.healthStatus === 'Excellent' ? '#74C69D20' : block.healthStatus === 'Good' ? '#DBEAFE' : '#FEF3C7',
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
                        className="mt-2 rounded-lg p-3"
                        style={{
                          backgroundColor: block.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className="h-4 w-4"
                            style={{ color: block.severity === 'high' ? '#DC2626' : '#D97706' }}
                          />
                          <p
                            className="text-sm"
                            style={{
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              color: block.severity === 'high' ? '#DC2626' : '#D97706',
                            }}
                          >
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
              <label className="mb-3 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                General Observations
              </label>
              <div className="space-y-2">
                {detailData.observations.map((obs, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
                  >
                    <div
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
                      style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}
                    >
                      •
                    </div>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{obs}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scout's Notes */}
            <div className="mb-6">
              <label className="mb-2 block text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Scout&apos;s Additional Notes
              </label>
              <p
                className="rounded-lg border p-4"
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
              className="mb-6 flex items-center justify-between rounded-lg border p-4"
              style={{ backgroundColor: '#74C69D10', borderColor: '#74C69D40', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" style={{ color: '#2D6A4F' }} />
                <div>
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Next Scheduled Visit
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{detailData.nextScheduledVisit}</p>
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1.5 text-sm"
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
          </div>

          {/* Loaded photos (interactive — not in print clone unless user prints after load; print uses inner HTML before photos section — acceptable) */}
          {photosOpen ? (
            <div className="mb-6 px-6">
              <p className="mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Photos from submission
              </p>
              {galleryLoading ? (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Loading images…
                </p>
              ) : galleryError ? (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#B45309' }}>
                  {galleryError}
                </p>
              ) : galleryUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {galleryUrls.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
                      <OptimizedImage src={src} alt="" className="h-28 w-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No images to display.
                </p>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center" style={{ borderColor: '#E0DDD6' }}>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 transition-colors sm:min-w-[200px]"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              Download Report (PDF)
            </button>
            <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border px-5 py-3 transition-colors hover:bg-gray-50 disabled:opacity-60"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
                onClick={handleViewPhotos}
                disabled={galleryLoading}
              >
                <Images className="h-4 w-4" />
                {galleryLoading ? 'Loading…' : `View Photos (${photoLabelCount})`}
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border px-5 py-3 transition-colors hover:bg-[#F7F4EF]"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#2D6A4F',
                  color: '#2D6A4F',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                  fontWeight: 600,
                }}
                onClick={handleReviewCase}
              >
                <Eye className="h-4 w-4" />
                Review case
              </button>
              <button
                type="button"
                className="rounded-lg border px-5 py-3 transition-colors hover:bg-gray-50"
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
    </div>
  );
}
