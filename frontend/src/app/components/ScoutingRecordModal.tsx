import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { X, CheckCircle, AlertTriangle, Download, Images, Eye } from 'lucide-react';
import type { RecentScoutingRecord } from '../api/types';
import { fetchScoutingReportDetail, type ScoutingReport } from '../api/scoutingApi';
import { getApiErrorMessage } from '../api/errors';
import { splitGalleryUrls } from '../utils/scoutingPayloadDisplay';
import { OptimizedImage } from './OptimizedImage';
import { ScoutingSubmissionReviewBody } from './ScoutingSubmissionReviewBody';

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
  const [detailReport, setDetailReport] = useState<ScoutingReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const detailId = recordData ? resolvePestScoutingDetailId(recordData) : null;

  useEffect(() => {
    setPhotosOpen(false);
    setGalleryUrls([]);
    setGalleryError(null);
    setInlineMessage(null);
    setDetailReport(null);
    setDetailError(null);

    if (!detailId) {
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    fetchScoutingReportDetail(detailId)
      .then((report) => {
        if (cancelled) return;
        setDetailReport(report);
        const { images } = splitGalleryUrls(report);
        setGalleryUrls(images);
        if (images.length > 0) {
          setPhotosOpen(true);
          setGalleryError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setDetailError(getApiErrorMessage(e, 'Could not load scouting record from the API.'));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detailId, recordData?.id]);

  if (!recordData) return null;

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
    setPhotosOpen(true);
    if (galleryUrls.length > 0) {
      setGalleryError(null);
      return;
    }
    if (!detailId) {
      setGalleryError('Photos are available once this row is linked to a mobile weekly record.');
      return;
    }
    if (detailReport) {
      const { images } = splitGalleryUrls(detailReport);
      setGalleryUrls(images);
      if (images.length === 0) setGalleryError('No image attachments were returned for this record.');
      return;
    }
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      const report = await fetchScoutingReportDetail(detailId);
      const { images } = splitGalleryUrls(report);
      setGalleryUrls(images);
      if (images.length === 0) setGalleryError('No image attachments were returned for this record.');
    } catch (e: unknown) {
      setGalleryError(getApiErrorMessage(e, 'Could not load photos.'));
      setGalleryUrls([]);
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

  const photoLabelCount = loadedPhotoCount;

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

            {detailLoading ? (
              <p className="py-8 text-center text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Loading mobile scouting record…
              </p>
            ) : null}

            {detailError ? (
              <div
                className="mb-6 rounded-lg border p-4 text-sm"
                style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB', color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {detailError}
                <p className="mt-2 text-xs" style={{ color: '#717182' }}>
                  Scout: {recordData.scout} · {recordData.farm} · {recordData.date} {recordData.time}
                  {recordData.blockName ? ` · ${recordData.blockName}` : ''}
                </p>
              </div>
            ) : null}

            {detailReport ? <ScoutingSubmissionReviewBody report={detailReport} /> : null}

            {!detailLoading && !detailReport && !detailId ? (
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                This registry row is not linked to a mobile weekly record. Open a submission from the scouting feed with source App.
              </p>
            ) : null}
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
