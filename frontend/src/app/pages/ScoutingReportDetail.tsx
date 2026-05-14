import { ArrowLeft, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { fetchScoutingReportDetail, type ScoutingReport } from '../api/scoutingApi';
import { createCase } from '../api/caseApi';
import { getApiErrorMessage } from '../api/errors';
import { getAuthUser } from '../auth';
import { ScoutingSubmissionReviewBody } from '../components/ScoutingSubmissionReviewBody';

function roleIsFarmer(): boolean {
  const u = getAuthUser();
  const name = (u?.role_details?.role_name || u?.role?.role_name || '').trim().toLowerCase();
  return name === 'farmer';
}

export function ScoutingReportDetail() {
  const { id } = useParams<{ id: string }>();
  const isFarmer = roleIsFarmer();
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNotes, setCaseNotes] = useState('');
  const [caseSeverity, setCaseSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [caseSubmitting, setCaseSubmitting] = useState(false);
  const [caseError, setCaseError] = useState<string | null>(null);
  const [caseSuccess, setCaseSuccess] = useState<string | null>(null);

  const authUser = getAuthUser();

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchScoutingReportDetail(id!);
        setReport(data);
        setCaseTitle(`${data.finding} — ${data.farmerName}`);
        setCaseSeverity(data.severity);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load report details.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !id) return;

    setCaseSubmitting(true);
    setCaseError(null);
    setCaseSuccess(null);

    try {
      await createCase({
        scouting_record_id: id,
        case_title: caseTitle,
        severity: caseSeverity,
        notes: caseNotes,
        agronomist_id: authUser?.id || '',
      });
      setCaseSuccess('Case created successfully!');
      setCaseNotes('');
    } catch (err) {
      setCaseError(getApiErrorMessage(err, 'Failed to create case.'));
    } finally {
      setCaseSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6A4F]" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
        <Link to="/scouting-reports" className="text-[#2D6A4F] font-medium hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6">
        <Link to="/scouting-reports" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Scouting Feed
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332]" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Scouting Report Details
            </h1>
            <p className="text-gray-500">ID: {report.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ 
                backgroundColor: report.severity === 'high' ? '#FEE2E2' : report.severity === 'medium' ? '#FEF3C7' : '#DCFCE7',
                color: report.severity === 'high' ? '#C0392B' : report.severity === 'medium' ? '#D97706' : '#15803D'
              }}
            >
              {report.severity} Severity
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold uppercase tracking-wider">
              {report.reviewed}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`space-y-6 ${isFarmer ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="overflow-hidden rounded-xl border border-[#E0DDD6] bg-white shadow-sm">
            <div className="border-b border-[#E0DDD6] bg-[#F7F4EF] p-6">
              <h2 className="text-lg font-semibold text-[#1B4332]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Field submission
              </h2>
              <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Mobile app payload, traps, pests, diseases, and photos
              </p>
            </div>
            <div className="p-6">
              <ScoutingSubmissionReviewBody report={report} />
            </div>
          </div>
        </div>

        {!isFarmer ? (
          <div className="space-y-6">
            <div className="sticky top-6 overflow-hidden rounded-xl border border-[#E0DDD6] bg-white shadow-sm">
              <div className="border-b border-[#E0DDD6] bg-[#F7F4EF] p-6">
                <h2
                  className="flex items-center gap-2 text-lg font-semibold text-[#1B4332]"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  <Plus className="h-5 w-5" /> Create case
                </h2>
                <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  For agronomists — open a case from this scouting record.
                </p>
              </div>
              <form className="space-y-4 p-6" onSubmit={handleCreateCase}>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Case title</label>
                  <input
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#E0DDD6] p-2 text-sm outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Severity</label>
                  <select
                    value={caseSeverity}
                    onChange={(e) => setCaseSeverity(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full rounded-lg border border-[#E0DDD6] p-2 text-sm outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Notes</label>
                  <textarea
                    rows={4}
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    className="w-full rounded-lg border border-[#E0DDD6] p-2 text-sm outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    placeholder="Additional observations..."
                  />
                </div>

                {caseError ? (
                  <div className="flex items-center gap-2 rounded border border-red-100 bg-red-50 p-2 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4" /> {caseError}
                  </div>
                ) : null}

                {caseSuccess ? (
                  <div className="flex items-center gap-2 rounded border border-green-100 bg-green-50 p-2 text-xs text-green-600">
                    <CheckCircle className="h-4 w-4" /> {caseSuccess}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={caseSubmitting}
                  className="w-full rounded-lg bg-[#2D6A4F] py-2 font-semibold text-white transition-colors hover:bg-[#1B4332] disabled:opacity-50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  {caseSubmitting ? 'Creating...' : 'Create case'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
