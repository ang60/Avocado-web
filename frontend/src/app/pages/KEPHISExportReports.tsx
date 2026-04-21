import { Download, FileText } from 'lucide-react';
import { openKephisExportCsv } from '../api/realApi';

export function KEPHISExportReports() {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Export Reports
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Generate official KEPHIS quarantine and compliance outputs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: '#1B4332' }} />
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
              Quarantine Management CSV
            </h3>
          </div>
          <p className="mb-3 text-sm" style={{ color: '#717182' }}>
            Includes block status, pest type, capture rate, and inspector.
          </p>
          <button
            onClick={openKephisExportCsv}
            className="rounded-lg px-4 py-2"
            style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}
          >
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
