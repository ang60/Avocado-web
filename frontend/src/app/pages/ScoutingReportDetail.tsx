import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, AlertCircle, Clock, MapPin, User, Building2, CheckCircle } from 'lucide-react';
import { fetchScoutingReportDetail, type ScoutingReport } from '../api/scoutingApi';
import { createCase } from '../api/caseApi';
import { getApiErrorMessage } from '../api/errors';
import { getAuthUser } from '../auth';
import { OptimizedImage } from '../components/OptimizedImage';

export function ScoutingReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E0DDD6] overflow-hidden">
            <div className="p-6 border-b border-[#E0DDD6] bg-[#F7F4EF]">
              <h2 className="text-lg font-semibold text-[#1B4332]">Observation Finding</h2>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 rounded-lg bg-[#FEE2E2] border border-[#FECACA]">
                <p className="text-xl font-bold text-[#C0392B]">{report.finding}</p>
                <p className="text-sm text-[#7F1D1D] mt-1">Status: {report.status}</p>
              </div>

              {report.mediaPreview && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Photo Evidence</p>
                  <OptimizedImage 
                    src={report.mediaPreview} 
                    alt="Finding evidence" 
                    className="w-full rounded-lg border border-[#E0DDD6] object-cover max-h-[500px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location & Farmer details */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E0DDD6] overflow-hidden">
            <div className="p-6 border-b border-[#E0DDD6] bg-[#F7F4EF]">
              <h2 className="text-lg font-semibold text-[#1B4332]">Context Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Farmer Name</p>
                  <p className="font-semibold text-[#1B4332]">{report.farmerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Farm / Entity</p>
                  <p className="font-semibold text-[#1B4332]">{report.farmName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-[#1B4332]">Block {report.blockId} · {report.county || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Timestamp</p>
                  <p className="font-semibold text-[#1B4332]">{report.timestamp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Create Case Form */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E0DDD6] overflow-hidden sticky top-6">
            <div className="p-6 border-b border-[#E0DDD6] bg-[#F7F4EF]">
              <h2 className="text-lg font-semibold text-[#1B4332] flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Case
              </h2>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreateCase}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Case Title</label>
                <input 
                  type="text" 
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full border border-[#E0DDD6] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Severity</label>
                <select 
                  value={caseSeverity}
                  onChange={(e) => setCaseSeverity(e.target.value as any)}
                  className="w-full border border-[#E0DDD6] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
                <textarea 
                  rows={4}
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  className="w-full border border-[#E0DDD6] rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2D6A4F] outline-none"
                  placeholder="Additional observations..."
                />
              </div>

              {caseError && (
                <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {caseError}
                </div>
              )}

              {caseSuccess && (
                <div className="p-2 bg-green-50 text-green-600 text-xs rounded border border-green-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {caseSuccess}
                </div>
              )}

              <button 
                type="submit"
                disabled={caseSubmitting}
                className="w-full bg-[#2D6A4F] text-white py-2 rounded-lg font-semibold hover:bg-[#1B4332] transition-colors disabled:opacity-50"
              >
                {caseSubmitting ? 'Creating...' : 'Create Case'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
