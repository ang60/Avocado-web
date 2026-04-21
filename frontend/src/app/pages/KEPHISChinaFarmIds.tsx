import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ClipboardCheck, FileText, Plus, ShieldCheck } from 'lucide-react';
import { getApiErrorMessage } from '../api/errors';
import {
  createKephisChinaFarmCertification,
  fetchKephisChinaFarmCertifications,
  approveKephisChinaFarmExport,
  issueKephisChinaFarmId,
  updateKephisChinaFarmCertification,
  type ChinaFarmCertificationRow,
} from '../api/realApi';
import { TableScroll } from '../components/TableScroll';
import { getAuthUser } from '../auth';

export function KEPHISChinaFarmIds() {
  const [rows, setRows] = useState<ChinaFarmCertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createFarmerId, setCreateFarmerId] = useState('');
  const [createInsights, setCreateInsights] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [insightsDraft, setInsightsDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const user = getAuthUser();
  const roleName = user?.role_details?.role_name || user?.role?.role_name || '';
  const canWrite = Boolean(user?.is_privileged || roleName === 'KEPHIS' || roleName === 'Administrator' || roleName === 'System Administrator');

  const refresh = () => {
    setLoading(true);
    setError(null);
    fetchKephisChinaFarmCertifications()
      .then((data) => setRows(data))
      .catch((e: unknown) => setError(getApiErrorMessage(e, 'Could not load China export certifications.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const issuedCount = useMemo(() => rows.filter((r) => r.status === 'issued').length, [rows]);
  const draftCount = useMemo(() => rows.filter((r) => r.status === 'draft').length, [rows]);

  const startEdit = (row: ChinaFarmCertificationRow) => {
    setEditingId(row.id);
    setInsightsDraft(row.management_insights || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateKephisChinaFarmCertification({
        id: editingId,
        management_insights: insightsDraft,
      });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingId(null);
      setInsightsDraft('');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not save insights.'));
    } finally {
      setSaving(false);
    }
  };

  const issue = async (row: ChinaFarmCertificationRow) => {
    setIssuingId(row.id);
    setError(null);
    try {
      const updated = await issueKephisChinaFarmId({ id: row.id });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not issue China Farm ID.'));
    } finally {
      setIssuingId(null);
    }
  };

  const approveExport = async (row: ChinaFarmCertificationRow) => {
    setApprovingId(row.id);
    setError(null);
    try {
      const updated = await approveKephisChinaFarmExport({ id: row.id });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not approve export.'));
    } finally {
      setApprovingId(null);
    }
  };

  const create = async () => {
    const farmer = createFarmerId.trim();
    if (!farmer) {
      setError('Farmer UUID is required.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await createKephisChinaFarmCertification({
        farmer,
        management_insights: createInsights.trim(),
      });
      setRows((prev) => [created, ...prev]);
      setCreateFarmerId('');
      setCreateInsights('');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not create certification.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="mb-1" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', color: '#1B4332' }}>
          China Export Farm IDs
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '16px', color: '#717182', margin: 0 }}>
          Issue China-facing Farm IDs after pest inspection and record KEPHIS management insights.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Issued</span>
            <ShieldCheck className="h-5 w-5" style={{ color: '#2D6A4F' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#1B4332' }}>{issuedCount}</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Draft</span>
            <FileText className="h-5 w-5" style={{ color: '#D97706' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#1B4332' }}>{draftCount}</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Total</span>
            <ClipboardCheck className="h-5 w-5" style={{ color: '#1B4332' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#1B4332' }}>{rows.length}</p>
        </div>
      </div>

      {canWrite ? (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5" style={{ color: '#2D6A4F' }} />
            <h2 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 700 }}>Create inspection record</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs uppercase tracking-wider" style={{ color: '#717182' }}>
                Farmer UUID
              </label>
              <input
                value={createFarmerId}
                onChange={(e) => setCreateFarmerId(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                placeholder="e.g. 0f4e... (FarmerProfile id)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs uppercase tracking-wider" style={{ color: '#717182' }}>
                Management insights
              </label>
              <textarea
                value={createInsights}
                onChange={(e) => setCreateInsights(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                rows={3}
                placeholder="Summarize sanitation, IPM adherence, recordkeeping, traceability, etc."
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={create}
              disabled={creating}
              className="rounded-lg px-4 py-2 text-sm disabled:opacity-60"
              style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {creating ? 'Creating…' : 'Create record'}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: '#D97706', backgroundColor: '#FFFBEB' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>{error}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <TableScroll>
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #E0DDD6' }}>
                {['China Farm ID', 'Status', 'Export approval', 'Farmer', 'Farm', 'County', 'Inspected', 'Insights', 'Actions'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-semibold uppercase" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #E0DDD6', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FCFBF8' }}>
                  <td className="p-3" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
                    {r.china_farm_id || '—'}
                  </td>
                  <td className="p-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: r.status === 'issued' ? '#DCFCE7' : r.status === 'draft' ? '#FEF3C7' : '#FEE2E2',
                        color: r.status === 'issued' ? '#166534' : r.status === 'draft' ? '#92400E' : '#991B1B',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      {String(r.status).toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-sm" style={{ color: '#717182' }}>
                    {r.export_approved_at ? (
                      <span className="inline-flex items-center gap-2" style={{ color: '#166534', fontWeight: 700 }}>
                        <CheckCircle className="h-4 w-4" />
                        Approved
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3">
                    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <div style={{ fontWeight: 700 }}>{r.farmerName}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>{r.farmerPhone}</div>
                    </div>
                  </td>
                  <td className="p-3">{r.farmName || '—'}</td>
                  <td className="p-3">{r.county || '—'}</td>
                  <td className="p-3 text-sm" style={{ color: '#717182' }}>
                    {r.inspected_at ? new Date(r.inspected_at).toLocaleString('en-GB') : '—'}
                  </td>
                  <td className="p-3">
                    {editingId === r.id ? (
                      <textarea
                        value={insightsDraft}
                        onChange={(e) => setInsightsDraft(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm" style={{ color: '#1B4332' }}>
                        {(r.management_insights || '').slice(0, 160) || '—'}
                        {(r.management_insights || '').length > 160 ? '…' : ''}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    {!canWrite ? (
                      <span className="text-xs" style={{ color: '#717182' }}>Read-only</span>
                    ) : editingId === r.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          disabled={saving}
                          className="rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                          style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setInsightsDraft('');
                          }}
                          className="rounded-lg border px-3 py-2 text-xs"
                          style={{ borderColor: '#E0DDD6', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="rounded-lg border px-3 py-2 text-xs"
                          style={{ borderColor: '#E0DDD6', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
                        >
                          Edit insights
                        </button>
                        <button
                          type="button"
                          onClick={() => issue(r)}
                          disabled={issuingId === r.id}
                          className="rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                          style={{ backgroundColor: '#1B4332', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                          title="Generate China Farm ID and mark as issued"
                        >
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {issuingId === r.id ? 'Issuing…' : 'Issue ID'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => approveExport(r)}
                          disabled={approvingId === r.id || r.status !== 'issued' || Boolean(r.export_approved_at)}
                          className="rounded-lg px-3 py-2 text-xs disabled:opacity-60"
                          style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                          title="Approve this farm for export after ID issuance"
                        >
                          {approvingId === r.id ? 'Approving…' : 'Approve export'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        {loading ? <p className="p-4 text-sm" style={{ color: '#717182' }}>Loading certifications…</p> : null}
        {!loading && rows.length === 0 ? <p className="p-6 text-sm" style={{ color: '#717182' }}>No certifications yet.</p> : null}
      </div>
    </div>
  );
}

