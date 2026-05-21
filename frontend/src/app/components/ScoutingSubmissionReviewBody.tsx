import { MapPin, Bug, Leaf, Camera, Mic } from 'lucide-react';
import type { CSSProperties } from 'react';
import { OptimizedImage } from './OptimizedImage';
import type { ScoutingReport } from '../api/scoutingApi';
import {
  actionsFromReport,
  beneficialLabelsFromReport,
  blockSnapshotFromReport,
  diseaseLabelsFromReport,
  diseaseMetaFromRaw,
  farmSnapshotFromReport,
  getRawPayload,
  outcomeFromReport,
  pestRowsFromReport,
  resolveScoutingMediaUrl,
  splitGalleryUrls,
  stringListFromRaw,
  trapUseRows,
} from '../utils/scoutingPayloadDisplay';

const labelClass = 'text-xs uppercase tracking-wider mb-1';
const labelStyle: React.CSSProperties = { fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' };
const valueStyle: React.CSSProperties = { fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={labelClass} style={labelStyle}>
        {label}
      </p>
      <div style={valueStyle}>{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3
        className="mb-3 border-b pb-2 text-sm font-semibold"
        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', borderColor: '#E0DDD6' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export type ScoutingSubmissionReviewBodyProps = {
  report: ScoutingReport;
  /** When true, show review notes textarea (Scouting Reports modal) */
  showReviewNotes?: boolean;
};

export function ScoutingSubmissionReviewBody({ report, showReviewNotes }: ScoutingSubmissionReviewBodyProps) {
  const raw = getRawPayload(report);
  const farm = farmSnapshotFromReport(report);
  const blockSnap = blockSnapshotFromReport(report);
  const traps = trapUseRows(report);
  const pests = pestRowsFromReport(report);
  const diseases = diseaseLabelsFromReport(report);
  const beneficial = beneficialLabelsFromReport(report);
  const diseaseMeta = diseaseMetaFromRaw(report);
  const actions = actionsFromReport(report);
  const outcome = outcomeFromReport(report);
  const challenges = stringListFromRaw(report, 'other_production_challenges');
  const pestParts = report.pestPlantPartsAffectedList?.length
    ? report.pestPlantPartsAffectedList
    : stringListFromRaw(report, 'pest_plant_part');
  const { images, audio } = splitGalleryUrls(report);
  const variety = report.variety || (typeof raw['variety'] === 'string' ? raw['variety'] : '');
  const showTrapReplacedCol = traps.some((t) => t.trapsReplaced != null);
  const blockLine =
    [report.county, report.blockId].filter(Boolean).join(' · ') ||
    (typeof raw['block'] === 'string' ? raw['block'] : '') ||
    '—';

  return (
    <div>
      <div
        className="mb-6 rounded-lg p-4"
        style={{
          backgroundColor: report.status === 'clean' ? '#DCFCE7' : '#FEE2E2',
          borderRadius: '8px',
        }}
      >
        <p
          className="text-lg font-semibold"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: report.status === 'clean' ? '#15803D' : '#C0392B',
          }}
        >
          {report.status === 'clean'
            ? report.finding
            : `${report.finding}${String(report.finding).toLowerCase().includes('detected') ? '' : ' — detected'}`}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Farmer">{report.farmerName}</Field>
        <Field label="County">{report.county || '—'}</Field>
        <Field label="Submission source">{report.source === 'app' ? 'Mobile app' : `USSD ${report.ussdCode || ''}`.trim()}</Field>
        <Field label="Submitted (local)">{report.timestamp}</Field>
        {report.rawTimestamp ? <Field label="Submitted (ISO)">{report.rawTimestamp}</Field> : null}
        <Field label="Block / location">{blockLine}</Field>
        {variety ? <Field label="Variety">{variety}</Field> : null}
        {report.blockTreeCount != null ? <Field label="Trees (block)">{report.blockTreeCount}</Field> : null}
        {blockSnap.blockName ? <Field label="Block name (payload)">{blockSnap.blockName}</Field> : null}
        {blockSnap.farmerName ? <Field label="Farmer (payload)">{blockSnap.farmerName}</Field> : null}
      </div>

      <Section title="Field photos (mobile)">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {images.map((src) => (
              <div key={src} className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
                <div className="flex items-center gap-2 border-b bg-[#F7F4EF] px-2 py-1 text-xs" style={{ color: '#717182' }}>
                  <Camera className="h-3.5 w-3.5" /> Photo
                </div>
                <OptimizedImage src={src} alt="" className="max-h-72 w-full object-contain bg-[#F7F4EF]" />
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-2 py-1.5 text-xs font-semibold text-[#2D6A4F] underline"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  Open full size
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            No images were attached to this record. If you just submitted from the phone, ensure uploads finished and sync
            completed.
          </p>
        )}
        {audio.length > 0 ? (
          <div className="mt-4 space-y-2">
            {audio.map((src) => (
              <div key={src} className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6' }}>
                <p className="mb-2 flex items-center gap-2 text-xs uppercase" style={labelStyle}>
                  <Mic className="h-3.5 w-3.5" /> Voice note
                </p>
                <audio controls className="w-full" src={src}>
                  <track kind="captions" />
                </audio>
              </div>
            ))}
          </div>
        ) : null}
      </Section>

      {(farm.farmName || farm.numberOfBlocks || farm.farmSize || farm.timestamp) && (
        <Section title="Farm snapshot (from app)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {farm.farmName ? <Field label="Farm name">{farm.farmName}</Field> : null}
            {farm.location ? <Field label="Location">{farm.location}</Field> : null}
            {farm.numberOfBlocks ? <Field label="Number of blocks">{farm.numberOfBlocks}</Field> : null}
            {farm.farmSize ? <Field label="Farm size">{farm.farmSize}</Field> : null}
            {farm.timestamp ? <Field label="Farm data time">{farm.timestamp}</Field> : null}
          </div>
        </Section>
      )}

      <Section title="Trap use">
        {traps.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF' }}>
                  {['Trap type', 'Count', 'Avg pests / trap', ...(showTrapReplacedCol ? ['Traps replaced'] : []), 'Photo'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs uppercase" style={labelStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traps.map((t, i) => (
                  <tr key={`${t.type}-${i}`} style={{ borderTop: '1px solid #E0DDD6' }}>
                    <td className="px-3 py-2" style={valueStyle}>
                      {t.type}
                    </td>
                    <td className="px-3 py-2">{t.count}</td>
                    <td className="px-3 py-2">{t.avg ?? '—'}</td>
                    {showTrapReplacedCol ? (
                      <td className="px-3 py-2">{t.trapsReplaced != null ? t.trapsReplaced : '—'}</td>
                    ) : null}
                    <td className="px-3 py-2">
                      {t.photo ? (
                        <a
                          href={resolveScoutingMediaUrl(t.photo)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#2D6A4F] underline"
                          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                        >
                          Open
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            No trap check-in rows were stored for this submission (some forms only capture summary trap counts in the weekly
            record).
          </p>
        )}
      </Section>

      <Section title="Pests & diseases">
        {pests.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {pests.map((p, idx) => (
              <span
                key={`${p.name}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <Bug className="h-3.5 w-3.5" />
                {p.name}
                {p.perTrap != null ? ` · ${p.perTrap}/trap` : ''}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#717182' }}>
            No pest rows in payload
          </p>
        )}
        {diseases.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {diseases.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                <Leaf className="h-3.5 w-3.5" />
                {d}
              </span>
            ))}
          </div>
        ) : null}
        {(diseaseMeta.plantParts.length > 0 || diseaseMeta.cropStage || diseaseMeta.detectionMethod) && (
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3" style={{ color: '#374151' }}>
            {diseaseMeta.plantParts.length ? <span>Plant parts: {diseaseMeta.plantParts.join(', ')}</span> : null}
            {diseaseMeta.cropStage ? <span>Stage: {diseaseMeta.cropStage}</span> : null}
            {diseaseMeta.detectionMethod ? <span>Detection: {diseaseMeta.detectionMethod}</span> : null}
          </div>
        )}
        {pestParts.length > 0 ? (
          <p className="mt-2 text-sm" style={{ color: '#455A64' }}>
            <span className="font-medium text-[#1B4332]">Pest plant parts: </span>
            {pestParts.join(', ')}
          </p>
        ) : null}
      </Section>

      {beneficial.length > 0 && (
        <Section title="Beneficial insects">
          <div className="flex flex-wrap gap-2">
            {beneficial.map((b) => (
              <span
                key={b}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: '#DCFCE7', color: '#166534', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {b}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(actions.length > 0 || outcome || report.remarks || report.additionalNotes) && (
        <Section title="Actions & outcome">
          {actions.length > 0 ? (
            <ul className="mb-2 list-inside list-disc text-sm" style={{ color: '#1B4332' }}>
              {actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
          {outcome ? (
            <p className="text-sm">
              <span className="font-semibold text-[#1B4332]">Outcome: </span>
              {outcome}
            </p>
          ) : null}
          {report.additionalNotes ? (
            <p className="mt-2 text-sm" style={{ color: '#455A64' }}>
              <span className="font-semibold">Additional notes: </span>
              {report.additionalNotes}
            </p>
          ) : null}
          {report.remarks ? (
            <p className="mt-2 text-sm" style={{ color: '#455A64' }}>
              <span className="font-semibold">Remarks: </span>
              {report.remarks}
            </p>
          ) : null}
        </Section>
      )}

      {challenges.length > 0 && (
        <Section title="Other production challenges">
          <ul className="list-inside list-disc text-sm" style={{ color: '#1B4332' }}>
            {challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {(report.gpsLatitude || report.gpsLongitude) && (
        <Section title="GPS">
          <p className="flex items-center gap-2 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
            <MapPin className="h-4 w-4 text-[#717182]" />
            {report.gpsLatitude ?? '—'}, {report.gpsLongitude ?? '—'}
          </p>
        </Section>
      )}

      {(report.startDate || report.endDate) && (
        <Section title="Scouting window">
          <p className="text-sm" style={{ color: '#374151' }}>
            {report.startDate ?? '—'} → {report.endDate ?? '—'}
          </p>
        </Section>
      )}

      {report.auditFlags && report.auditFlags.length > 0 && (
        <Section title="Audit flags">
          <div className="flex flex-wrap gap-2">
            {report.auditFlags.map((f) => (
              <span key={f} className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                {f}
              </span>
            ))}
          </div>
        </Section>
      )}

      {showReviewNotes ? (
        <div className="mb-2">
          <label className={labelClass} style={labelStyle}>
            Review notes
          </label>
          <textarea
            rows={4}
            placeholder="Add your review notes here..."
            className="w-full rounded-lg border px-4 py-3 outline-none transition-all focus:ring-2"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#E0DDD6',
              borderRadius: '8px',
              color: '#1B4332',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
