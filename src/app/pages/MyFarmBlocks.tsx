import { Edit3, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/errors';
import {
  createFarmBlock,
  fetchHcdaFarmers,
  fetchMyFarmBlocks,
  fetchScoutingFeed,
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

  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          My Farm Blocks
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
          Satellite view and block-level management tools.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
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
    </>
  );
}

