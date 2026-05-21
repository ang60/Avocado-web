import type { ScoutingReport } from '../api/scoutingApi';
import type { ScoutingFeedItem } from '../api/types';
import { API_BASE_URL } from '../api/client';

/** Feed row (agronomist/farmer) or detail payload — both carry `rawPayload` from mobile. */
export type ScoutingRowPayload = ScoutingFeedItem | ScoutingReport;

export function getRawPayload(report: ScoutingRowPayload): Record<string, unknown> {
  const r = report.rawPayload;
  return r && typeof r === 'object' && !Array.isArray(r) ? (r as Record<string, unknown>) : {};
}

export type TrapUseRow = { type: string; count: number; avg?: string; photo?: string; trapsReplaced?: number };

function _trapPhotoFromRaw(raw: Record<string, unknown>): string | undefined {
  for (const k of ['other_trap_photo', 'dont_know_trap_photo'] as const) {
    const v = raw[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

export function trapUseRows(report: ScoutingRowPayload): TrapUseRow[] {
  const raw = getRawPayload(report);
  const tu = raw['trap_use'];
  const out: TrapUseRow[] = [];
  if (Array.isArray(tu)) {
    for (const row of tu) {
      if (!row || typeof row !== 'object') continue;
      const o = row as Record<string, unknown>;
      const type = String(o['type_of_trap'] ?? o['trap_name'] ?? '').trim();
      const n = Number(o['number_of_trap'] ?? o['number_of_traps'] ?? 0) || 0;
      const avg = o['average_no_of_pest_per_trap'];
      const photo = typeof o['photo'] === 'string' ? o['photo'] : undefined;
      if (type || n || photo) {
        out.push({
          type: type || 'Trap',
          count: n,
          avg: avg != null && avg !== '' ? String(avg) : undefined,
          photo,
        });
      }
    }
  }
  if (out.length === 0) {
    const type = String(raw['2_what_type_of_trap'] ?? raw['type_of_trap'] ?? '').trim();
    const n = Number(raw['2_number_of_traps'] ?? raw['number_of_trap'] ?? 0) || 0;
    const avg = raw['3_pests_per_trap'] ?? raw['pests_per_trap'];
    const replaced = Number(raw['2_traps_replaced'] ?? raw['traps_replaced'] ?? 0) || 0;
    const photo = _trapPhotoFromRaw(raw);
    if (type || n || photo) {
      out.push({
        type: type || 'Trap',
        count: n,
        avg: avg != null && avg !== '' ? String(avg) : undefined,
        photo,
        trapsReplaced: replaced > 0 ? replaced : undefined,
      });
    }
  }
  if (out.length === 0) {
    const w = report as ScoutingRowPayload & {
      recordTypeOfTrap?: string;
      recordNumberOfTrap?: number;
      recordTrapsReplaced?: number;
      recordPestsPerTrap?: string | null;
    };
    const twType = (w.recordTypeOfTrap || '').trim();
    const twN = Number(w.recordNumberOfTrap ?? 0) || 0;
    const twRep = Number(w.recordTrapsReplaced ?? 0) || 0;
    const twAvg = w.recordPestsPerTrap != null && String(w.recordPestsPerTrap).trim() ? String(w.recordPestsPerTrap) : undefined;
    const twPhoto = _trapPhotoFromRaw(raw);
    const meaningfulType = twType && twType.toLowerCase() !== 'unknown trap';
    if (twN > 0 || meaningfulType || twRep > 0 || (twAvg && twAvg !== '0') || twPhoto) {
      out.push({
        type: twType || 'Trap',
        count: twN,
        avg: twAvg,
        trapsReplaced: twRep > 0 ? twRep : undefined,
        photo: twPhoto,
      });
    }
  }
  return out;
}

export type PestRow = { name: string; perTrap?: string };

export function pestRowsFromReport(report: ScoutingRowPayload): PestRow[] {
  const raw = getRawPayload(report);
  const fromRaw = raw['pests_observed'];
  if (Array.isArray(fromRaw) && fromRaw.length && typeof fromRaw[0] === 'object') {
    return (fromRaw as Record<string, unknown>[]).map((p) => ({
      name: String(p['name'] ?? p['label'] ?? '').trim(),
      perTrap: p['number_per_trap'] != null ? String(p['number_per_trap']) : undefined,
    })).filter((r) => r.name);
  }
  const list = report.pestsObservedList;
  if (Array.isArray(list) && list.length) {
    return list.map((name) => ({ name: String(name).trim() })).filter((r) => r.name);
  }
  return [];
}

export function diseaseLabelsFromReport(report: ScoutingRowPayload): string[] {
  const raw = getRawPayload(report);
  const d = raw['disease'];
  if (Array.isArray(d)) {
    return d.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof d === 'string' && d.trim()) return [d.trim()];
  const list = report.diseasesObservedList;
  if (Array.isArray(list)) return list.map((x) => String(x).trim()).filter(Boolean);
  return [];
}

export function beneficialLabelsFromReport(report: ScoutingRowPayload): string[] {
  const raw = getRawPayload(report);
  const b = raw['beneficial_insects_observed'];
  if (Array.isArray(b)) {
    return b.map((x) => (typeof x === 'string' ? x : String(x)).trim()).filter(Boolean);
  }
  const list = report.beneficialInsectsObservedList;
  if (Array.isArray(list)) return list.map((x) => String(x).trim()).filter(Boolean);
  return [];
}

export function stringListFromRaw(report: ScoutingRowPayload, key: string): string[] {
  const raw = getRawPayload(report);
  const v = raw[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

export function farmSnapshotFromReport(report: ScoutingRowPayload): {
  farmName?: string;
  location?: string;
  numberOfBlocks?: string;
  farmSize?: string;
  timestamp?: string;
} {
  const raw = getRawPayload(report);
  const holding = (report.farmName || '').trim();
  return {
    farmName: typeof raw['farm_name'] === 'string' ? raw['farm_name'] : holding || undefined,
    location: typeof raw['location'] === 'string' ? raw['location'] : report.reportLocation || undefined,
    numberOfBlocks: raw['number_of_blocks'] != null ? String(raw['number_of_blocks']) : undefined,
    farmSize: raw['farm_size'] != null ? String(raw['farm_size']) : undefined,
    timestamp: typeof raw['timestamp'] === 'string' ? raw['timestamp'] : undefined,
  };
}

/** Mobile weekly `block` string: county + block_name + number_of_trees (or similar composite). */
export function mobileBlockLineFromReport(report: ScoutingRowPayload): string {
  const raw = getRawPayload(report);
  const b = raw['block'];
  return typeof b === 'string' ? b.trim() : '';
}

export function blockSnapshotFromReport(report: ScoutingRowPayload): {
  farmerName?: string;
  farmName?: string;
  blockName?: string;
  numberOfTrees?: string;
} {
  const raw = getRawPayload(report);
  return {
    farmerName: typeof raw['farmer_name'] === 'string' ? raw['farmer_name'] : undefined,
    farmName: typeof raw['farm_name'] === 'string' ? raw['farm_name'] : undefined,
    blockName: typeof raw['block_name'] === 'string' ? raw['block_name'] : undefined,
    numberOfTrees:
      raw['number_of_trees'] != null
        ? String(raw['number_of_trees'])
        : report.blockTreeCount != null
          ? String(report.blockTreeCount)
          : undefined,
  };
}

export function resolveScoutingMediaUrl(u: string): string {
  const t = u.trim();
  if (!t) return t;
  if (t.startsWith('http://') || t.startsWith('https://')) {
    try {
      const host = new URL(t).hostname.toLowerCase();
      if ((host === 'localhost' || host === '127.0.0.1') && t.includes('/media/')) {
        const path = new URL(t).pathname;
        return `${API_BASE_URL}${path}`;
      }
    } catch {
      /* keep original */
    }
    return t;
  }
  if (t.startsWith('//')) return `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}${t}`;
  if (t.startsWith('/')) return `${API_BASE_URL}${t}`;
  if (t.startsWith('media/')) return `${API_BASE_URL}/${t}`;
  return `${API_BASE_URL}/${t.replace(/^\//, '')}`;
}

function looksLikeMediaUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/media/') || t.startsWith('media/')) {
    return true;
  }
  const low = t.split('?')[0].toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.m4a', '.mp3', '.aac', '.wav', '.ogg'].some((ext) => low.endsWith(ext));
}

/** URLs from raw JSON not always copied into `mediaGallery` on older rows. */
function collectUrlsFromRawPayload(raw: Record<string, unknown>): string[] {
  const found: string[] = [];
  const visit = (v: unknown) => {
    if (typeof v === 'string' && looksLikeMediaUrl(v)) found.push(resolveScoutingMediaUrl(v));
  };
  const uploaded = raw['uploaded_media_urls'];
  if (Array.isArray(uploaded)) {
    for (const u of uploaded) visit(u);
  }
  for (const [key, v] of Object.entries(raw)) {
    if (typeof key === 'string' && key.toLowerCase().includes('photo')) visit(v);
  }
  const tu = raw['trap_use'];
  if (Array.isArray(tu)) {
    for (const row of tu) {
      if (row && typeof row === 'object') visit((row as Record<string, unknown>)['photo']);
    }
  }
  const po = raw['pests_observed'];
  if (Array.isArray(po)) {
    for (const row of po) {
      if (row && typeof row === 'object') visit((row as Record<string, unknown>)['photo']);
    }
  }
  return found;
}

export function splitGalleryUrls(report: ScoutingRowPayload): { images: string[]; audio: string[] } {
  const seen = new Set<string>();
  const all: string[] = [];
  const push = (u: unknown) => {
    if (typeof u !== 'string' || !u.trim()) return;
    if (!looksLikeMediaUrl(u)) return;
    const abs = resolveScoutingMediaUrl(u);
    if (seen.has(abs)) return;
    seen.add(abs);
    all.push(abs);
  };
  for (const u of report.mediaGallery || []) push(u);
  push(report.mediaPreview);
  for (const u of collectUrlsFromRawPayload(getRawPayload(report))) {
    push(u);
  }
  const images: string[] = [];
  const audio: string[] = [];
  for (const u of all) {
    const path = u.split('?')[0].toLowerCase();
    const isAudio =
      ['.m4a', '.mp3', '.aac', '.wav', '.ogg'].some((ext) => path.endsWith(ext)) ||
      u.toLowerCase().includes('voice_note') ||
      u.toLowerCase().includes('/voice');
    if (isAudio) audio.push(u);
    else images.push(u);
  }
  return { images, audio };
}

export function diseaseMetaFromRaw(report: ScoutingRowPayload): {
  plantParts: string[];
  cropStage?: string;
  detectionMethod?: string;
} {
  const raw = getRawPayload(report);
  const parts = raw['disease_plant_part'];
  const plantParts = Array.isArray(parts) ? parts.map((x) => String(x).trim()).filter(Boolean) : [];
  return {
    plantParts,
    cropStage: typeof raw['disease_crop_stage'] === 'string' ? raw['disease_crop_stage'] : undefined,
    detectionMethod: typeof raw['disease_detection_method'] === 'string' ? raw['disease_detection_method'] : undefined,
  };
}

export function beneficialSummaryLine(report: ScoutingRowPayload): string {
  return beneficialLabelsFromReport(report).join(', ');
}

export function diseaseMetaSummaryLine(report: ScoutingRowPayload): string {
  const dm = diseaseMetaFromRaw(report);
  const bits: string[] = [];
  if (dm.plantParts.length) bits.push(dm.plantParts.join(', '));
  if (dm.cropStage) bits.push(dm.cropStage);
  if (dm.detectionMethod) bits.push(dm.detectionMethod);
  return bits.join(' · ');
}

export function gpsLineFromPayload(report: ScoutingRowPayload): string {
  const raw = getRawPayload(report);
  const w = report as ScoutingRowPayload & { gpsLatitude?: unknown; gpsLongitude?: unknown };
  const lat = String(w.gpsLatitude ?? raw['gps_latitude'] ?? '').trim();
  const lng = String(w.gpsLongitude ?? raw['gps_longitude'] ?? '').trim();
  if (lat && lng) return `${lat}, ${lng}`;
  return '';
}

export function actionsFromReport(report: ScoutingRowPayload): string[] {
  const raw = getRawPayload(report);
  const a = raw['actions_taken'];
  if (Array.isArray(a)) return a.map((x) => String(x).trim()).filter(Boolean);
  if (typeof a === 'string' && a.trim()) return [a.trim()];
  return (report.actionsTakenList || []).map((x) => String(x).trim()).filter(Boolean);
}

export function outcomeFromReport(report: ScoutingRowPayload): string {
  const raw = getRawPayload(report);
  const o = raw['outcome'];
  if (typeof o === 'string' && o.trim()) return o.trim();
  if (Array.isArray(o) && o.length) return String(o[0]).trim();
  const list = report.outcomeList;
  if (list?.length) return String(list[0]);
  return '';
}
