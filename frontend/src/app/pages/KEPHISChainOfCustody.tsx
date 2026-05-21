import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { fetchKephisChainOfCustody, type QuarantineActionLogRow } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { TableScroll } from '../components/TableScroll';

export function KEPHISChainOfCustody() {
  const [rows, setRows] = useState<QuarantineActionLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockFilter, setBlockFilter] = useState('');

  const load = (blockId?: string) => {
    setLoading(true);
    setError(null);
    fetchKephisChainOfCustody(blockId)
      .then((data) => setRows(data))
      .catch((e: unknown) => setError(getApiErrorMessage(e, 'Could not load chain of custody logs.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Chain of Custody
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Full accountability for KEPHIS status transitions
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <input
          type="text"
          placeholder="Filter by block ID (optional)"
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2"
          style={{ borderColor: '#E0DDD6' }}
        />
        <button
          onClick={() => load(blockFilter.trim() || undefined)}
          className="rounded-lg px-4 py-2"
          style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}
        >
          Apply
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <TableScroll>
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #E0DDD6' }}>
                {['Timestamp', 'Block', 'Action', 'From', 'To', 'Actor', 'Notes'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs uppercase" style={{ color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #E0DDD6', backgroundColor: idx % 2 ? '#FCFBF8' : '#FFFFFF' }}>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString('en-GB')}</td>
                  <td className="p-3" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{r.blockId}</td>
                  <td className="p-3">{r.actionType.replace(/_/g, ' ')}</td>
                  <td className="p-3">{r.fromStatus || '-'}</td>
                  <td className="p-3">{r.toStatus || '-'}</td>
                  <td className="p-3">{r.actorName}</td>
                  <td className="p-3">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        {loading ? <p className="p-4 text-sm" style={{ color: '#717182' }}>Loading chain of custody...</p> : null}
        {!loading && error ? <p className="p-4 text-sm" style={{ color: '#b45309' }}>{error}</p> : null}
        {!loading && !error && rows.length === 0 ? (
          <div className="p-6 text-center">
            <History className="mx-auto mb-2 h-6 w-6" style={{ color: '#717182' }} />
            <p style={{ color: '#717182' }}>No custody events found for this filter.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
