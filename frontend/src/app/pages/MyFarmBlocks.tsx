import { CheckCircle2, ClipboardList, Edit3, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/errors';
import {
  completeScoutingSession,
  createScoutingSession,
  createFarmBlock,
  createWeeklyRecord,
  fetchHcdaFarmers,
  fetchMyFarmBlocks,
  fetchScoutingFeed,
  type CreateWeeklyRecordPayload,
  type FarmBlockDto,
  updateFarmBlock,
} from '../api/realApi';
import { getAuthUser } from '../auth';

type UiBlock = {
  id: string;
  blockName: string;
  variety: string;
  trees: number;
  status: 'Cleared' | 'Under Observation' | 'Restricted';
  boundaryPoints?: Array<{ lat: number; lng: number }>;
};

const PEST_OPTIONS = [
  '🦟 Mango fruit fly',
  ' Mediterranean fruit fly',
  '🦟 Natal fruit fly',
  '🐛 False codling moth',
  '🦗 Thrips',
  '🐛 Caterpillars',
  '🕷 Persea mites',
  '🪲 Fig wax scale',
  '🪲 Red wax scale',
  '🦟 Melon fly',
  '🐛 Whitefly',
  '🦟 Oriental fruit fly',
  '🐛 Broad mite',
  '🪲 Shot-hole borer',
] as const;

const BENEFICIAL_INSECT_OPTIONS = [
  '🐝 Bees',
  '🐞 Ladybirds',
  '🪰 Lacewings',
  '🕷️ Predatory mites',
] as const;

const PLANT_PART_OPTIONS = ['🍃 Leaves', '🌸 Flowers', '🥑Fruits', '🌿 Branches', '🌱 Roots', '❓ Other'] as const;
const CROP_STAGE_OPTIONS = ['🌸 Flowering', '🟢 Pin head', '⛳ Golf size', '🟡 Maturing', '🥑 Mature'] as const;
const DETECTION_METHOD_OPTIONS = ['👁 Self-observation', '👷 Extension officer', '🏢 Agronomist', '🔬 KEPHIS inspector'] as const;
const DISEASE_OPTIONS = [
  '🟤 Anthracnose',
  '⚫ Black spot',
  '🌊 Phytophthora root rot',
  '🍄 Armillaria root rot',
  '🦠 Sunblotch viroid',
  '🟡 Cercospora spot',
  '🔴 Stem end rot',
  '🟫 Avocado scab',
  '🦠 Bacterial canker',
  '🍂 Fruit rot',
  '🌿 Weeds',
  '⚡ Nutrient deficiency',
  '❄️ Frost damage',
] as const;
const ACTION_OPTIONS = [
  '🌿 Farm sanitation',
  '✂️ Pruning',
  '🪤 Traps installed',
  '🔧 Traps serviced',
  '💊 Chemical control',
  '🐞 Biological control',
  '❌ No action taken',
] as const;
const OUTCOME_OPTIONS = ['✅ Controlled', '📉 Reduced', '⚠️ Still present', '🔄 Follow-up needed'] as const;

type ScoutingWizardForm = {
  variety: string;
  type_of_trap: string;
  number_of_trap: string;
  traps_replaced: string;
  any_pests_observed: 'Yes' | 'No';
  pests_observed: string;
  beneficial_insects_observed: string;
  number_of_trees_affected: string;
  pest_plant_part_affected: string;
  pest_crop_stage: string;
  pest_detection_method: string;
  pests_per_trap: string;
  any_diseases_observed: 'Yes' | 'No';
  disease: string;
  disease_plant_part: string;
  disease_crop_stage: string;
  disease_detection_method: string;
  number_of_photos_taken: string;
  additional_notes: string;
  actions_taken: string;
  outcome: string;
  remarks: string;
  start_date: string;
  end_date: string;
  location: string;
  gps_latitude: string;
  gps_longitude: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialScoutingForm(): ScoutingWizardForm {
  return {
    variety: 'Avocado',
    type_of_trap: 'Fruit fly trap',
    number_of_trap: '1',
    traps_replaced: '0',
    any_pests_observed: 'No',
    pests_observed: '',
    beneficial_insects_observed: '',
    number_of_trees_affected: '0',
    pest_plant_part_affected: '',
    pest_crop_stage: '',
    pest_detection_method: '👁 Self-observation',
    pests_per_trap: '0',
    any_diseases_observed: 'No',
    disease: '',
    disease_plant_part: '',
    disease_crop_stage: '',
    disease_detection_method: '👁 Self-observation',
    number_of_photos_taken: '0',
    additional_notes: '',
    actions_taken: '❌ No action taken',
    outcome: '🔄 Follow-up needed',
    remarks: '',
    start_date: todayIso(),
    end_date: todayIso(),
    location: '',
    gps_latitude: '',
    gps_longitude: '',
  };
}

export function MyFarmBlocks() {
  const [blocks, setBlocks] = useState<UiBlock[]>([]);
  const [farmCenter, setFarmCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editorBlockName, setEditorBlockName] = useState('');
  const [editorTrees, setEditorTrees] = useState('0');
  const [editorPoints, setEditorPoints] = useState('');
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSaving, setEditorSaving] = useState(false);
  const [nextBlockNumber, setNextBlockNumber] = useState(1);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionName, setActiveSessionName] = useState('');
  const [activeBlockIds, setActiveBlockIds] = useState<string[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);
  const [sessionFinishedMessage, setSessionFinishedMessage] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<ScoutingWizardForm>(() => createInitialScoutingForm());
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);

  const loadBlocks = async () => {
    const [farmBlocks, scouting, hcdaRows] = await Promise.all([
      fetchMyFarmBlocks(),
      fetchScoutingFeed(),
      fetchHcdaFarmers(),
    ]);
    const statusByBlock = new Map<string, 'Cleared' | 'Under Observation' | 'Restricted'>();
    for (const s of scouting) {
      const current = statusByBlock.get(s.blockId);
      if (s.status === 'detected') {
        statusByBlock.set(s.blockId, s.severity === 'high' ? 'Restricted' : 'Under Observation');
      } else if (!current) {
        statusByBlock.set(s.blockId, 'Cleared');
      }
    }

    const mapped = farmBlocks.map((b: FarmBlockDto): UiBlock => {
      const status = statusByBlock.get(b.block_name) ?? 'Cleared';
      return {
        id: b.id,
        blockName: b.block_name,
        variety: 'Avocado',
        trees: b.number_of_trees,
        status,
        boundaryPoints: Array.isArray(b.boundary_points) ? b.boundary_points : [],
      };
    });
    setBlocks(mapped);
    setNextBlockNumber(farmBlocks.length + 1);

    const user = getAuthUser();
    const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim().toLowerCase();
    const byName = hcdaRows.find((r) => r.farmerName.trim().toLowerCase() === fullName);
    const byCounty = hcdaRows.find((r) => r.county?.toLowerCase() === (user?.county || '').toLowerCase());
    const match = byName || byCounty || hcdaRows[0];
    if (match && Number.isFinite(match.lat) && Number.isFinite(match.lng)) {
      setFarmCenter({ lat: Number(match.lat), lng: Number(match.lng) });
    } else {
      setFarmCenter(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadBlocks()
      .then(() => {
        if (cancelled) return;
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load farm blocks.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parseBoundaryPoints = (raw: string) => {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines.map((line) => {
      const [latStr, lngStr] = line.split(',').map((v) => v.trim());
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error(`Invalid coordinate line: "${line}"`);
      }
      return { lat, lng };
    });
    if (parsed.length < 3) throw new Error('At least 3 coordinate points are required.');
    return parsed;
  };

  const counts = useMemo(() => {
    return {
      total: blocks.length,
      restricted: blocks.filter((b) => b.status === 'Restricted').length,
    };
  }, [blocks]);

  const polygons = useMemo(() => {
    if (blocks.length === 0) return [];
    // Prefer true backend polygon coordinates; fallback to generated shape when absent.
    return blocks.map((b, idx) => {
      if (b.boundaryPoints && b.boundaryPoints.length >= 3) {
        return {
          ...b,
          points: b.boundaryPoints,
        };
      }
      if (!farmCenter) {
        return {
          ...b,
          points: [],
        };
      }
      const latOffset = 0.00035 + idx * 0.00009;
      const lngOffset = 0.00045 + idx * 0.0001;
      const baseLat = farmCenter.lat + (idx % 2 === 0 ? latOffset : -latOffset * 0.7);
      const baseLng = farmCenter.lng + (idx % 3 === 0 ? -lngOffset : lngOffset * 0.8);
      return {
        ...b,
        points: [
          { lat: baseLat, lng: baseLng },
          { lat: baseLat + 0.00025, lng: baseLng + 0.00015 },
          { lat: baseLat + 0.00018, lng: baseLng + 0.00046 },
          { lat: baseLat - 0.0001, lng: baseLng + 0.00032 },
        ],
      };
    });
  }, [blocks, farmCenter]);

  const bounds = useMemo(() => {
    const all = polygons.flatMap((p) => p.points || []);
    if (!all.length) return null;
    const lats = all.map((p) => p.lat);
    const lngs = all.map((p) => p.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [polygons]);

  const toXY = (lat: number, lng: number) => {
    if (!bounds) return { x: 0, y: 0 };
    const w = 1000;
    const h = 480;
    const x = ((lng - bounds.minLng) / Math.max(bounds.maxLng - bounds.minLng, 0.000001)) * w;
    const y = h - ((lat - bounds.minLat) / Math.max(bounds.maxLat - bounds.minLat, 0.000001)) * h;
    return { x, y };
  };

  const parsePointsOrEmpty = (raw: string) => {
    try {
      return parseBoundaryPoints(raw);
    } catch {
      return [];
    }
  };

  const draftPoints = parsePointsOrEmpty(editorPoints);
  const mapViewport = useMemo(() => {
    if (bounds) return bounds;
    if (farmCenter) {
      return {
        minLat: farmCenter.lat - 0.001,
        maxLat: farmCenter.lat + 0.001,
        minLng: farmCenter.lng - 0.001,
        maxLng: farmCenter.lng + 0.001,
      };
    }
    return { minLat: -1, maxLat: 1, minLng: 35, maxLng: 38 };
  }, [bounds, farmCenter]);

  const fromXY = (x: number, y: number) => {
    const w = 1000;
    const h = 480;
    const lng =
      mapViewport.minLng +
      (x / w) * Math.max(mapViewport.maxLng - mapViewport.minLng, 0.000001);
    const lat =
      mapViewport.minLat +
      ((h - y) / h) * Math.max(mapViewport.maxLat - mapViewport.minLat, 0.000001);
    return {
      lat: Number(lat.toFixed(7)),
      lng: Number(lng.toFixed(7)),
    };
  };

  const activeBlock = activeBlockIds.length ? blocks.find((b) => b.id === activeBlockIds[currentBlockIndex]) ?? null : null;

  const updateRecordForm = <K extends keyof ScoutingWizardForm>(field: K, value: ScoutingWizardForm[K]) => {
    setRecordForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetSessionDraft = () => {
    setSelectedBlockIds([]);
    setSessionName('');
    setSessionNotes('');
    setSessionError(null);
    setSessionSaving(false);
  };

  const resetActiveSession = () => {
    setActiveSessionId(null);
    setActiveSessionName('');
    setActiveBlockIds([]);
    setCurrentBlockIndex(0);
    setSessionCompletedCount(0);
    setRecordError(null);
    setRecordSaving(false);
    setRecordForm(createInitialScoutingForm());
  };

  const validateScoutingForm = () => {
    if (!recordForm.location.trim()) return 'Location is required.';
    if (!recordForm.start_date || !recordForm.end_date) return 'Start date and end date are required.';
    if (recordForm.end_date < recordForm.start_date) return 'End date cannot be earlier than start date.';
    if (!recordForm.variety.trim()) return 'Variety is required.';
    if (!recordForm.type_of_trap.trim()) return 'Type of trap is required.';
    if (Number(recordForm.number_of_trap) < 0) return 'Number of traps cannot be negative.';
    if (Number(recordForm.traps_replaced) < 0) return 'Replaced traps cannot be negative.';
    if (Number(recordForm.number_of_trees_affected) < 0) return 'Affected trees cannot be negative.';
    if (Number(recordForm.number_of_photos_taken) < 0) return 'Number of photos cannot be negative.';
    if (Number(recordForm.pests_per_trap) < 0) return 'Pests per trap cannot be negative.';
    if (recordForm.any_pests_observed === 'Yes' && !recordForm.pests_observed) return 'Select the pest observed.';
    if (recordForm.any_diseases_observed === 'Yes' && !recordForm.disease) return 'Select the disease observed.';
    return null;
  };

  const buildWeeklyRecordPayload = (blockId: string): CreateWeeklyRecordPayload => ({
    scouting_session: activeSessionId || undefined,
    block: blockId,
    variety: recordForm.variety.trim(),
    type_of_trap: recordForm.type_of_trap.trim(),
    number_of_trap: Math.max(0, Number(recordForm.number_of_trap || 0)),
    traps_replaced: Math.max(0, Number(recordForm.traps_replaced || 0)),
    any_pests_observed: recordForm.any_pests_observed,
    pests_observed: recordForm.any_pests_observed === 'Yes' ? recordForm.pests_observed || null : null,
    beneficial_insects_observed: recordForm.beneficial_insects_observed || null,
    number_of_trees_affected: Math.max(0, Number(recordForm.number_of_trees_affected || 0)),
    pest_plant_part_affected: recordForm.any_pests_observed === 'Yes' ? recordForm.pest_plant_part_affected || null : null,
    pest_crop_stage: recordForm.any_pests_observed === 'Yes' ? recordForm.pest_crop_stage || null : null,
    pest_detection_method: recordForm.pest_detection_method || null,
    pests_per_trap: Math.max(0, Number(recordForm.pests_per_trap || 0)),
    any_diseases_observed: recordForm.any_diseases_observed,
    disease: recordForm.any_diseases_observed === 'Yes' ? recordForm.disease || null : null,
    disease_plant_part: recordForm.any_diseases_observed === 'Yes' ? recordForm.disease_plant_part || null : null,
    disease_crop_stage: recordForm.any_diseases_observed === 'Yes' ? recordForm.disease_crop_stage || null : null,
    disease_detection_method: recordForm.disease_detection_method || null,
    number_of_photos_taken: Math.max(0, Number(recordForm.number_of_photos_taken || 0)),
    additional_notes: recordForm.additional_notes.trim() || null,
    actions_taken: recordForm.actions_taken,
    outcome: recordForm.outcome,
    remarks: recordForm.remarks.trim() || null,
    start_date: recordForm.start_date,
    end_date: recordForm.end_date,
    location: recordForm.location.trim(),
    gps_latitude: recordForm.gps_latitude ? Number(recordForm.gps_latitude) : null,
    gps_longitude: recordForm.gps_longitude ? Number(recordForm.gps_longitude) : null,
  });

  const startScoutingSession = async () => {
    if (!selectedBlockIds.length) {
      setSessionError('Select at least one block to scout.');
      return;
    }
    // In this UI, the scouting details are expected to be filled by the mobile app.
    // So the "session" is just a review workflow that steps through the selected blocks.
    setSessionSaving(true);
    setSessionError(null);
    setSessionFinishedMessage(null);
    try {
      setActiveSessionId('review');
      setActiveSessionName(sessionName.trim() || 'Review Session');
      setActiveBlockIds(selectedBlockIds);
      setCurrentBlockIndex(0);
      setSessionCompletedCount(0);
      setRecordError(null);
      setRecordForm(createInitialScoutingForm());
      setSessionOpen(false);
      resetSessionDraft();
    } catch (e: unknown) {
      setSessionError(getApiErrorMessage(e, 'Could not start review session.'));
    } finally {
      setSessionSaving(false);
    }
  };

  const saveCurrentBlockRecord = async () => {
    if (!activeSessionId || !activeBlock) return;
    const validationError = validateScoutingForm();
    if (validationError) {
      setRecordError(validationError);
      return;
    }
    setRecordSaving(true);
    setRecordError(null);
    try {
      await createWeeklyRecord(buildWeeklyRecordPayload(activeBlock.id));
      const nextCompletedCount = sessionCompletedCount + 1;
      const isLastBlock = currentBlockIndex >= activeBlockIds.length - 1;
      await loadBlocks();
      if (isLastBlock) {
        await completeScoutingSession(activeSessionId);
        setSessionFinishedMessage(
          `${activeSessionName || 'Scouting session'} completed. ${nextCompletedCount} block${nextCompletedCount === 1 ? '' : 's'} saved.`
        );
        resetActiveSession();
        return;
      }
      setSessionCompletedCount(nextCompletedCount);
      setCurrentBlockIndex((prev) => prev + 1);
      setRecordForm(createInitialScoutingForm());
    } catch (e: unknown) {
      setRecordError(getApiErrorMessage(e, 'Could not save scouting record.'));
    } finally {
      setRecordSaving(false);
    }
  };

  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          My Farm Blocks
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
          Satellite view, boundary tools, and block-by-block scouting sessions.
        </p>
      </header>

      {sessionFinishedMessage ? (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg border bg-[#EDF7EE] p-3 text-sm"
          style={{ borderColor: '#CDE7D0', color: '#166534', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{sessionFinishedMessage}</div>
        </div>
      ) : null}

      {activeSessionId && activeBlock ? (
        <section className="mb-4 rounded-xl border bg-white p-4" style={{ borderColor: '#D6E4D4' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#EDF7EE] px-3 py-1 text-xs" style={{ color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                <ClipboardList className="h-3.5 w-3.5" />
                Review session
              </div>
              <h2 className="text-xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {activeSessionName || 'Review Session'}
              </h2>
              <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                Block {currentBlockIndex + 1} of {activeBlockIds.length}: <strong>{activeBlock.blockName}</strong>
              </p>
            </div>
            <div className="rounded-lg bg-[#F7F4EF] px-3 py-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Blocks reviewed: {sessionCompletedCount} / {activeBlockIds.length}
            </div>
          </div>

          {recordError ? (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {recordError}
            </div>
          ) : null}

          <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
            Read-only review: scouting details are expected to be filled from the mobile data collection app.
          </p>

          <fieldset disabled>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Variety
              <input value={recordForm.variety} onChange={(e) => updateRecordForm('variety', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Location
              <input value={recordForm.location} onChange={(e) => updateRecordForm('location', e.target.value)} placeholder={`${activeBlock.blockName} field edge / row`} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Start date
              <input type="date" value={recordForm.start_date} onChange={(e) => updateRecordForm('start_date', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              End date
              <input type="date" value={recordForm.end_date} onChange={(e) => updateRecordForm('end_date', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Type of trap
              <input value={recordForm.type_of_trap} onChange={(e) => updateRecordForm('type_of_trap', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Number of traps
              <input type="number" min="0" value={recordForm.number_of_trap} onChange={(e) => updateRecordForm('number_of_trap', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Traps replaced
              <input type="number" min="0" value={recordForm.traps_replaced} onChange={(e) => updateRecordForm('traps_replaced', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Pests per trap
              <input type="number" min="0" step="0.01" value={recordForm.pests_per_trap} onChange={(e) => updateRecordForm('pests_per_trap', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Trees affected
              <input type="number" min="0" value={recordForm.number_of_trees_affected} onChange={(e) => updateRecordForm('number_of_trees_affected', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Photos taken
              <input type="number" min="0" value={recordForm.number_of_photos_taken} onChange={(e) => updateRecordForm('number_of_photos_taken', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              GPS latitude
              <input value={recordForm.gps_latitude} onChange={(e) => updateRecordForm('gps_latitude', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              GPS longitude
              <input value={recordForm.gps_longitude} onChange={(e) => updateRecordForm('gps_longitude', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Any pests observed?
              <select value={recordForm.any_pests_observed} onChange={(e) => updateRecordForm('any_pests_observed', e.target.value as 'Yes' | 'No')} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Any diseases observed?
              <select value={recordForm.any_diseases_observed} onChange={(e) => updateRecordForm('any_diseases_observed', e.target.value as 'Yes' | 'No')} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>

            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Beneficial insects
              <select value={recordForm.beneficial_insects_observed} onChange={(e) => updateRecordForm('beneficial_insects_observed', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                <option value="">None selected</option>
                {BENEFICIAL_INSECT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Action taken
              <select value={recordForm.actions_taken} onChange={(e) => updateRecordForm('actions_taken', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                {ACTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Outcome
              <select value={recordForm.outcome} onChange={(e) => updateRecordForm('outcome', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                {OUTCOME_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          {recordForm.any_pests_observed === 'Yes' ? (
            <div className="mt-4 rounded-lg border bg-[#F7F4EF] p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="mb-3 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Pest details
              </p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Pest observed
                  <select value={recordForm.pests_observed} onChange={(e) => updateRecordForm('pests_observed', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select pest</option>
                    {PEST_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Detection method
                  <select value={recordForm.pest_detection_method} onChange={(e) => updateRecordForm('pest_detection_method', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    {DETECTION_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Plant part affected
                  <select value={recordForm.pest_plant_part_affected} onChange={(e) => updateRecordForm('pest_plant_part_affected', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select plant part</option>
                    {PLANT_PART_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Crop stage
                  <select value={recordForm.pest_crop_stage} onChange={(e) => updateRecordForm('pest_crop_stage', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select crop stage</option>
                    {CROP_STAGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {recordForm.any_diseases_observed === 'Yes' ? (
            <div className="mt-4 rounded-lg border bg-[#F7F4EF] p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="mb-3 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Disease details
              </p>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Disease observed
                  <select value={recordForm.disease} onChange={(e) => updateRecordForm('disease', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select disease</option>
                    {DISEASE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Detection method
                  <select value={recordForm.disease_detection_method} onChange={(e) => updateRecordForm('disease_detection_method', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    {DETECTION_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Plant part affected
                  <select value={recordForm.disease_plant_part} onChange={(e) => updateRecordForm('disease_plant_part', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select plant part</option>
                    {PLANT_PART_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Crop stage
                  <select value={recordForm.disease_crop_stage} onChange={(e) => updateRecordForm('disease_crop_stage', e.target.value)} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
                    <option value="">Select crop stage</option>
                    {CROP_STAGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="text-sm lg:col-span-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Additional notes
              <textarea value={recordForm.additional_notes} onChange={(e) => updateRecordForm('additional_notes', e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
            <label className="text-sm lg:col-span-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Remarks
              <textarea value={recordForm.remarks} onChange={(e) => updateRecordForm('remarks', e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                setSessionFinishedMessage(
                  `${activeSessionName || 'Review session'} closed early. ${sessionCompletedCount} block${sessionCompletedCount === 1 ? '' : 's'} reviewed.`
                );
                resetActiveSession();
              }}
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
              disabled={recordSaving}
            >
              Close Review
            </button>
            <button
              type="button"
              onClick={() => {
                const isLastBlock = currentBlockIndex >= activeBlockIds.length - 1;
                const nextCompletedCount = sessionCompletedCount + 1;
                if (isLastBlock) {
                  setSessionFinishedMessage(
                    `${activeSessionName || 'Review session'} completed. ${nextCompletedCount} block${nextCompletedCount === 1 ? '' : 's'} reviewed.`
                  );
                  resetActiveSession();
                  return;
                }
                setSessionCompletedCount(nextCompletedCount);
                setCurrentBlockIndex((prev) => prev + 1);
              }}
              className="rounded px-3 py-2 text-sm text-white"
              style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
              disabled={recordSaving}
            >
              {currentBlockIndex >= activeBlockIds.length - 1 ? 'Finish Review' : 'Review Next Block'}
            </button>
          </div>
          </fieldset>
        </section>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white"
          style={{ backgroundColor: '#1B5E20', fontFamily: 'IBM Plex Sans, sans-serif' }}
          onClick={() => {
            setSessionFinishedMessage(null);
            setSessionOpen(true);
            setSessionError(null);
          }}
        >
          <ClipboardList className="h-4 w-4" />
          Review Scouting Session
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white"
          style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
          onClick={() => {
            setEditorMode('create');
            setEditingBlockId(null);
            setEditorBlockName(`Demo Block ${nextBlockNumber}`);
            setEditorTrees('100');
            setEditorPoints('');
            setEditorError(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Draw New Block
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: '#2E7D32', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
          onClick={() => {
            const first = blocks[0];
            if (!first) {
              setEditorError('No blocks available yet. Create a block first.');
              setEditorMode('create');
              setEditingBlockId(null);
              setEditorBlockName('');
              setEditorTrees('0');
              setEditorPoints('');
              setEditorOpen(true);
              return;
            }
            setEditorMode('edit');
            setEditingBlockId(first.id);
            setEditorBlockName(first.blockName);
            setEditorTrees(String(first.trees));
            setEditorPoints((first.boundaryPoints || []).map((pt) => `${pt.lat}, ${pt.lng}`).join('\n'));
            setEditorError(null);
            setEditorOpen(true);
          }}
        >
          <Edit3 className="h-4 w-4" /> Edit Boundaries
        </button>
        {farmCenter ? (
          <a
            href={`https://www.google.com/maps?q=${farmCenter.lat},${farmCenter.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#2E7D32', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Open in Google Maps
          </a>
        ) : null}
      </div>

      <div className="rounded-lg border bg-white p-3" style={{ borderColor: '#E0DDD6' }}>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#EDF7EE] px-3 py-1 text-xs" style={{ color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {counts.total} blocks
          </span>
          <span className="rounded-full bg-[#FEE2E2] px-3 py-1 text-xs" style={{ color: '#B91C1C', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {counts.restricted} restricted
          </span>
        </div>
        <div className="mb-3 overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
          <div
            className="relative h-[320px]"
            style={{
              background:
                'radial-gradient(110% 90% at 30% 20%, rgba(173,189,150,0.95) 0%, rgba(143,160,123,0.95) 44%, rgba(120,140,104,0.98) 100%)',
            }}
          >
            <svg viewBox="0 0 1000 480" className="h-full w-full">
              {/* Simulated satellite texture strips */}
              <g opacity="0.22">
                <rect x="0" y="35" width="1000" height="38" fill="#6E8B5C" />
                <rect x="0" y="130" width="1000" height="26" fill="#7C9A67" />
                <rect x="0" y="220" width="1000" height="32" fill="#628054" />
                <rect x="0" y="320" width="1000" height="24" fill="#7A9766" />
              </g>
              {polygons.map((p) => {
                const points = p.points.map((pt) => toXY(pt.lat, pt.lng));
                const pointsAttr = points.map((pt) => `${pt.x},${pt.y}`).join(' ');
                const cx = points.reduce((acc, v) => acc + v.x, 0) / points.length;
                const cy = points.reduce((acc, v) => acc + v.y, 0) / points.length;
                const fill =
                  p.status === 'Restricted' ? 'rgba(220,38,38,0.35)' : p.status === 'Under Observation' ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.35)';
                const stroke = p.status === 'Restricted' ? '#B91C1C' : p.status === 'Under Observation' ? '#B45309' : '#166534';
                return (
                  <g key={p.id}>
                    <polygon points={pointsAttr} fill={fill} stroke={stroke} strokeWidth={2} />
                    <text x={cx} y={cy} textAnchor="middle" style={{ fill: '#0F172A', fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}>
                      {p.blockName}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Satellite-style view with farmer GPS polygons
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>Block ID</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>Variety</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>Tree Count</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>Current Status</th>
                <th className="px-3 py-2 text-left text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: '#64748B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    Loading blocks...
                  </td>
                </tr>
              ) : null}
              {!loading && blocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: '#64748B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    No farm blocks found yet.
                  </td>
                </tr>
              ) : null}
              {blocks.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td className="px-3 py-3 text-sm" style={{ color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}>{b.blockName}</td>
                  <td className="px-3 py-3 text-sm" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>{b.variety}</td>
                  <td className="px-3 py-3 text-sm" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>{b.trees}</td>
                  <td className="px-3 py-3 text-sm" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>{b.status}</td>
                  <td className="px-3 py-3 text-sm">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      style={{ borderColor: '#2E7D32', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
                      onClick={() => {
                        setEditorMode('edit');
                        setEditingBlockId(b.id);
                        setEditorBlockName(b.blockName);
                        setEditorTrees(String(b.trees));
                        setEditorPoints(
                          (b.boundaryPoints || []).map((pt) => `${pt.lat}, ${pt.lng}`).join('\n')
                        );
                        setEditorError(null);
                        setEditorOpen(true);
                      }}
                    >
                      Edit Polygon
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-5">
            <h3 className="mb-3 text-lg" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
              {editorMode === 'create' ? 'Draw New Block' : 'Edit Block Boundary'}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                Block name
                <input
                  value={editorBlockName}
                  onChange={(e) => setEditorBlockName(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  style={{ borderColor: '#E0DDD6' }}
                />
              </label>
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                Number of trees
                <input
                  value={editorTrees}
                  onChange={(e) => setEditorTrees(e.target.value)}
                  type="number"
                  className="mt-1 w-full rounded border px-3 py-2"
                  style={{ borderColor: '#E0DDD6' }}
                />
              </label>
            </div>
            <label className="mt-3 block text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Boundary points (one `lat,lng` per line)
              <div className="mt-2 overflow-hidden rounded border" style={{ borderColor: '#E0DDD6' }}>
                <div
                  className="relative h-[220px]"
                  style={{
                    background:
                      'radial-gradient(110% 90% at 30% 20%, rgba(173,189,150,0.95) 0%, rgba(143,160,123,0.95) 44%, rgba(120,140,104,0.98) 100%)',
                  }}
                >
                  <svg
                    viewBox="0 0 1000 480"
                    className="h-full w-full cursor-crosshair"
                    onClick={(e) => {
                      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 1000;
                      const y = ((e.clientY - rect.top) / rect.height) * 480;
                      const pt = fromXY(x, y);
                      setEditorPoints((prev) => `${prev.trim() ? `${prev.trim()}\n` : ''}${pt.lat}, ${pt.lng}`);
                    }}
                  >
                    {polygons.map((p) => {
                      const points = p.points.map((pt) => toXY(pt.lat, pt.lng));
                      const pointsAttr = points.map((pt) => `${pt.x},${pt.y}`).join(' ');
                      const fill =
                        p.status === 'Restricted' ? 'rgba(220,38,38,0.22)' : p.status === 'Under Observation' ? 'rgba(245,158,11,0.22)' : 'rgba(34,197,94,0.22)';
                      const stroke = p.status === 'Restricted' ? '#B91C1C' : p.status === 'Under Observation' ? '#B45309' : '#166534';
                      return <polygon key={`bg-${p.id}`} points={pointsAttr} fill={fill} stroke={stroke} strokeWidth={2} />;
                    })}
                    {draftPoints.length >= 2 ? (
                      <polyline
                        points={draftPoints.map((pt) => {
                          const p = toXY(pt.lat, pt.lng);
                          return `${p.x},${p.y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                      />
                    ) : null}
                    {draftPoints.length >= 3 ? (
                      <polygon
                        points={draftPoints
                          .map((pt) => {
                            const p = toXY(pt.lat, pt.lng);
                            return `${p.x},${p.y}`;
                          })
                          .join(' ')}
                        fill="rgba(15,23,42,0.18)"
                        stroke="#0F172A"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                      />
                    ) : null}
                    {draftPoints.map((pt, idx) => {
                      const p = toXY(pt.lat, pt.lng);
                      return (
                        <g key={`draft-${idx}`}>
                          <circle cx={p.x} cy={p.y} r={5} fill="#0F172A" stroke="#fff" strokeWidth={1.5} />
                          <text x={p.x + 7} y={p.y - 7} style={{ fontSize: 11, fill: '#0F172A', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                            P{idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    Click map to add polygon points
                  </div>
                </div>
              </div>
              <textarea
                value={editorPoints}
                onChange={(e) => setEditorPoints(e.target.value)}
                rows={7}
                className="mt-1 w-full rounded border px-3 py-2"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Mono, monospace' }}
                placeholder="-0.7165, 36.8291&#10;-0.7162, 36.8296&#10;-0.7168, 36.8301"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  onClick={() =>
                    setEditorPoints((prev) => {
                      const lines = prev
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean);
                      lines.pop();
                      return lines.join('\n');
                    })
                  }
                >
                  Undo Last Point
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  onClick={() => setEditorPoints('')}
                >
                  Clear Points
                </button>
              </div>
            </label>
            {editorError ? (
              <p className="mt-2 text-sm" style={{ color: '#B91C1C', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {editorError}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded border px-3 py-2 text-sm"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                disabled={editorSaving}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setEditorError(null);
                  setEditorSaving(true);
                  try {
                    const payload = {
                      block_name: editorBlockName.trim(),
                      number_of_trees: Math.max(0, Number(editorTrees || 0)),
                      boundary_points: parseBoundaryPoints(editorPoints),
                    };
                    if (!payload.block_name) throw new Error('Block name is required.');
                    if (!Number.isFinite(payload.number_of_trees) || payload.number_of_trees <= 0) {
                      throw new Error('Number of trees must be greater than 0.');
                    }
                    if (editorMode === 'create') {
                      await createFarmBlock(payload);
                    } else if (editingBlockId) {
                      await updateFarmBlock(editingBlockId, payload);
                    }
                    await loadBlocks();
                    setEditorOpen(false);
                  } catch (e: unknown) {
                    if (e instanceof Error) {
                      const raw = e.message?.trim() || '';
                      // Local validation errors (e.g., coordinate parsing) should be shown directly.
                      if (raw && !/^Request failed \(\d+\)/.test(raw)) {
                        setEditorError(raw);
                        return;
                      }
                    }
                    setEditorError(getApiErrorMessage(e, 'Could not save block boundary.'));
                  } finally {
                    setEditorSaving(false);
                  }
                }}
                className="rounded px-3 py-2 text-sm text-white"
                style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
                disabled={editorSaving}
              >
                {editorSaving ? 'Saving...' : 'Save Boundary'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sessionOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  Review Scouting Session
                </h3>
                <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  Choose the blocks you want to review. Scouting details are expected to come from the mobile data collection app.
                </p>
              </div>
              <button type="button" onClick={() => setSessionOpen(false)} className="rounded-lg p-2 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                Session name
                <input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder={`Scouting Session ${todayIso()}`} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
              </label>
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                Session notes
                <textarea value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2" style={{ borderColor: '#E0DDD6' }} />
              </label>
            </div>

            <div className="mt-4 rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
              <div className="border-b px-4 py-3 text-sm font-semibold" style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Select blocks
              </div>
              <div className="max-h-72 overflow-auto p-3">
                {!blocks.length ? (
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748B' }}>
                    Create a farm block first before starting a scouting session.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block) => {
                      const checked = selectedBlockIds.includes(block.id);
                      return (
                        <label key={block.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3" style={{ borderColor: checked ? '#2E7D32' : '#E0DDD6', backgroundColor: checked ? '#EDF7EE' : '#FFFFFF' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedBlockIds((prev) =>
                                e.target.checked ? [...prev, block.id] : prev.filter((id) => id !== block.id)
                              );
                            }}
                            style={{ accentColor: '#2E7D32' }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                              {block.blockName}
                            </p>
                            <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748B' }}>
                              {block.trees} trees • status: {block.status}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {sessionError ? (
              <p className="mt-3 text-sm" style={{ color: '#B91C1C', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {sessionError}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSessionOpen(false);
                  resetSessionDraft();
                }}
                className="rounded border px-3 py-2 text-sm"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                disabled={sessionSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void startScoutingSession()}
                className="rounded px-3 py-2 text-sm text-white"
                style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
                disabled={sessionSaving || !blocks.length}
              >
                {sessionSaving ? 'Opening...' : 'Review Session'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

