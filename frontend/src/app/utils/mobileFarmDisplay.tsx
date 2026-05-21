import { Smartphone } from 'lucide-react';
import type { FarmerListRow } from '../api/types';

export type MobileFarmSnapshot = {
  farmName: string;
  location: string;
  numberOfBlocks: number | null;
  farmSize: number | null;
  updatedAt: string;
};

export function mobileFarmFromRow(
  row: Pick<FarmerListRow, 'mobileFarmFromApp' | 'farmName' | 'location' | 'totalAcres'>,
): MobileFarmSnapshot | null {
  const m = row.mobileFarmFromApp;
  if (!m) return null;
  const farmName = (m.farmName || row.farmName || '').trim();
  const location = (m.location || row.location || '').trim();
  if (!farmName && !location && m.numberOfBlocks == null && (m.farmSize == null || m.farmSize <= 0)) {
    return null;
  }
  return {
    farmName,
    location,
    numberOfBlocks: m.numberOfBlocks,
    farmSize: m.farmSize != null && m.farmSize > 0 ? m.farmSize : row.totalAcres > 0 ? row.totalAcres : null,
    updatedAt: m.updatedAt || '',
  };
}

export function hasMobileFarmData(
  row: Pick<FarmerListRow, 'mobileFarmFromApp' | 'farmName' | 'location'>,
): boolean {
  return mobileFarmFromRow(row) !== null;
}

type MobileFarmChipProps = {
  row: Pick<FarmerListRow, 'mobileFarmFromApp' | 'farmName' | 'location' | 'totalAcres'>;
  title?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export function MobileFarmChip({ row, title = 'App farm (onboarding)', className = '', onClick }: MobileFarmChipProps) {
  const snap = mobileFarmFromRow(row);
  if (!snap) return null;

  return (
    <div
      className={`mt-2 rounded-md border px-2 py-1.5 text-xs ${className}`}
      style={{ borderColor: '#BFDBFE', backgroundColor: '#F0F9FF' }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 font-semibold" style={{ color: '#0369A1' }}>
        <Smartphone className="h-3 w-3 shrink-0" />
        {title}
      </div>
      {snap.farmName ? (
        <div className="mt-0.5 font-medium" style={{ color: '#1B4332' }}>
          {snap.farmName}
        </div>
      ) : null}
      {snap.location ? (
        <div className="text-[11px]" style={{ color: '#475569' }}>
          {snap.location}
        </div>
      ) : null}
      {snap.numberOfBlocks != null && snap.numberOfBlocks > 0 ? (
        <div className="mt-0.5 text-[11px]" style={{ color: '#64748B' }}>
          {snap.numberOfBlocks} block{snap.numberOfBlocks === 1 ? '' : 's'}
          {snap.farmSize != null && snap.farmSize > 0 ? ` · ${snap.farmSize} ha` : ''}
        </div>
      ) : snap.farmSize != null && snap.farmSize > 0 ? (
        <div className="mt-0.5 text-[11px]" style={{ color: '#64748B' }}>
          {snap.farmSize} ha
        </div>
      ) : null}
    </div>
  );
}
