import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MapPin, Phone, Calendar, Smartphone, TrendingUp, 
  AlertCircle, CheckCircle, FileText, ArrowLeft, Download,
  Leaf, Package, MessageSquare, FileCheck, ClipboardList
} from 'lucide-react';
import { getApiErrorMessage } from '../api/errors';
import { fetchFarmerDetail } from '../api/realApi';
import type { FarmerDetailPayload } from '../api/types';

export function FarmerDetail() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [showComplianceReport, setShowComplianceReport] = useState(false);
  const [data, setData] = useState<FarmerDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFarmerDetail(farmerId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load farmer details.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  const handleViewComplianceReport = () => {
    setShowComplianceReport(true);
    // In real app, this would generate/download a PDF report
    console.log('Generating compliance report for:', farmerId);
  };

  if (loading) {
    return (
      <>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading farmer…</p>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <button
          onClick={() => navigate('/farmers')}
          className="flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Farmer Registry
        </button>
        <div className="p-6 rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#b45309' }}>{error ?? 'No data available.'}</p>
        </div>
      </>
    );
  }

  const farmerData = data;
  const latest = farmerData.latestScoutingFromApp ?? null;

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate('/farmers')}
        className="flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Farmer Registry
      </button>

      {/* Header */}
      <div 
        className="p-6 rounded-lg border mb-6"
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderColor: '#E0DDD6', 
          borderRadius: '8px',
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 
                className="text-3xl"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  color: '#1B4332',
                }}
              >
                {farmerData.name}
              </h1>
              {farmerData.exportEligibility === 'ready' && (
                <span
                  className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  Export Ready
                </span>
              )}
              {farmerData.exportEligibility === 'at-risk' && (
                <span
                  className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  <AlertCircle className="w-3 h-3" />
                  Export At Risk
                </span>
              )}
            </div>
            
            <p className="text-lg mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {farmerData.farmName}
            </p>

            <div className="grid grid-cols-2 gap-3 min-w-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    HCDA Reg No.
                  </p>
                </div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {farmerData.hcdaRegNo?.trim() || farmerData.farmerCode?.trim() || '—'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Location
                  </p>
                </div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {farmerData.location}, {farmerData.county}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Phone
                  </p>
                </div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {farmerData.phone}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Primary Channel
                  </p>
                </div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {farmerData.primaryChannel === 'smartphone' ? 'Smartphone App' : 'USSD/Feature Phone'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  <p className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Registered
                  </p>
                </div>
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {farmerData.registrationDate}
                </p>
              </div>
            </div>
          </div>

          {/* View Compliance Report Button */}
          <button
            onClick={handleViewComplianceReport}
            className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2 shrink-0"
            style={{
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            <FileText className="w-5 h-5" />
            View Compliance Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-8">
          {/* Farm Statistics */}
          <div className="mb-4 grid grid-cols-1 gap-4 min-w-0 sm:mb-6 sm:grid-cols-3 sm:gap-6">
            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Total Acreage
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {farmerData.totalAcres}
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                acres under management
                {farmerData.mobileFarmFromApp?.updatedAt ? (
                  <span className="block mt-0.5">
                    Last app farm sync: {new Date(farmerData.mobileFarmFromApp.updatedAt).toLocaleString()}
                  </span>
                ) : null}
              </p>
            </div>

            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Blocks Managed
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {farmerData.blocksManaged}
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                production blocks
              </p>
            </div>

            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: farmerData.complianceScore >= 90 ? '#74C69D' : '#D97706' }} />
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Compliance Score
                </span>
              </div>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                {farmerData.complianceScore}%
              </p>
              <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: farmerData.complianceScore >= 90 ? '#74C69D' : '#D97706' }}>
                {farmerData.complianceScore >= 90 ? 'Excellent compliance' : 'Needs improvement'}
              </p>
            </div>
          </div>

          {/* Weekly Scouting Logs */}
          <div 
            className="p-6 rounded-lg border mb-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
                fontSize: '18px',
              }}
            >
              Weekly Scouting Logs
            </h2>
            <p className="text-xs mb-4 uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Last 4 Weeks Performance
            </p>

            {/* Compact app-derived scouting summary (no layout change) */}
            {latest ? (
              <div
                className="mb-4 p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: '#E0DDD6', borderRadius: '8px', backgroundColor: '#F7F4EF' }}
              >
                <div className="min-w-0">
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    Latest app scouting
                    {latest.timestamp ? ` • ${new Date(latest.timestamp).toLocaleString()}` : ''}
                  </p>
                  <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {(latest.variety ? `Variety: ${latest.variety}` : 'Variety: —')}
                    {' • '}
                    Pests: {latest.anyPestsObserved || '—'}
                    {' • '}
                    Diseases: {latest.anyDiseasesObserved || '—'}
                    {latest.blockName ? ` • ${latest.blockName}` : ''}
                  </p>
                  {(latest.gpsLatitude && latest.gpsLongitude) || (latest.mediaUrls?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {latest.gpsLatitude && latest.gpsLongitude ? (
                        <a
                          className="text-xs"
                          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F', fontWeight: '600' }}
                          href={`https://www.google.com/maps?q=${encodeURIComponent(`${latest.gpsLatitude},${latest.gpsLongitude}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View GPS
                        </a>
                      ) : null}
                      {(latest.mediaUrls?.length ?? 0) > 0 ? (
                        <a
                          className="text-xs"
                          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F', fontWeight: '600' }}
                          href={latest.mediaUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View latest photo
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2 shrink-0"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                  onClick={() => navigate(`/scouting-reports/app-weekly-${latest.id}`)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Open
                </button>
              </div>
            ) : null}

            <div className="space-y-3">
              {farmerData.weeklyScoutingLogs.map((log, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ 
                    backgroundColor: log.completed ? '#DCFCE7' : '#FEE2E2',
                    borderRadius: '8px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {log.completed ? (
                      <CheckCircle className="w-5 h-5" style={{ color: '#15803D' }} />
                    ) : (
                      <AlertCircle className="w-5 h-5" style={{ color: '#C0392B' }} />
                    )}
                    <div>
                      <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                        {log.week}
                      </p>
                      {log.completed && (
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          {(log.scout ? `Scout: ${log.scout}` : 'Submitted')}
                          {log.date ? ` • ${log.date}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded text-xs"
                    style={{
                      backgroundColor: log.completed ? '#15803D' : '#C0392B',
                      color: '#FFFFFF',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {log.completed ? 'Completed' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Cases */}
          <div 
            className="p-6 rounded-lg border mb-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
                fontSize: '18px',
              }}
            >
              Active Cases
            </h2>

            <div className="space-y-3">
              {farmerData.activeCases.map((caseItem) => (
                <div 
                  key={caseItem.id}
                  className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E0DDD6', borderRadius: '8px' }}
                  onClick={() => navigate(`/case-management/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: caseItem.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                      }}
                    >
                      <AlertCircle className="w-5 h-5" style={{ color: caseItem.severity === 'high' ? '#C0392B' : '#D97706' }} />
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                        {caseItem.id} - {caseItem.issue}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {caseItem.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: caseItem.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                        color: caseItem.severity === 'high' ? '#C0392B' : '#D97706',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      {caseItem.severity.toUpperCase()}
                    </span>
                    <span
                      className="px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: '#E0E7FF',
                        color: '#4338CA',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {caseItem.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Blocks */}
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
                fontSize: '18px',
              }}
            >
              Farm Blocks
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {farmerData.blocks.length === 0 ? (
                <p className="text-sm col-span-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No blocks synced from the app or registry yet.
                </p>
              ) : (
              farmerData.blocks.map((block) => (
                <div 
                  key={block.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: '#E0DDD6', borderRadius: '8px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {block.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {block.source === 'app' ? (
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            borderRadius: '4px',
                          }}
                        >
                          App
                        </span>
                      ) : null}
                      <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: block.status === 'healthy' ? '#DCFCE7' : '#FEF3C7',
                        color: block.status === 'healthy' ? '#15803D' : '#D97706',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '4px',
                      }}
                    >
                      {block.status}
                    </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Acres</p>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>{block.acres}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Trees</p>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>{block.trees}</p>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Last: {block.lastInspection}
                  </p>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Recent Activities */}
        <div className="col-span-4">
          <div 
            className="p-6 rounded-lg border sticky top-6"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
              }}
            >
              Recent Activities
            </h3>
            <p className="text-xs mb-6 uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Activity Timeline
            </p>

            <div className="space-y-4">
              {farmerData.recentActivities.length === 0 ? (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No recent activity from the app yet.
                </p>
              ) : null}
              {farmerData.recentActivities.map((activity, index) => (
                <div key={index} className="relative">
                  {index !== farmerData.recentActivities.length - 1 && (
                    <div 
                      className="absolute left-4 top-10 w-0.5 h-full -ml-px"
                      style={{ backgroundColor: '#E0DDD6' }}
                    />
                  )}
                  
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10"
                      style={{ 
                        backgroundColor: 
                          activity.type === 'scouting' ? '#DBEAFE' : 
                          activity.type === 'advisory' ? '#DCFCE7' : 
                          activity.type === 'report' ? '#FEE2E2' : '#FEF3C7',
                      }}
                    >
                      {activity.type === 'scouting' && <CheckCircle className="w-4 h-4" style={{ color: '#1E40AF' }} />}
                      {activity.type === 'advisory' && <FileText className="w-4 h-4" style={{ color: '#15803D' }} />}
                      {activity.type === 'report' && <AlertCircle className="w-4 h-4" style={{ color: '#C0392B' }} />}
                      {activity.type === 'sms' && <MessageSquare className="w-4 h-4" style={{ color: '#D97706' }} />}
                    </div>
                    
                    <div className="flex-1 pb-2">
                      <p 
                        className="text-sm mb-1"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          color: '#1B4332',
                          fontWeight: '500',
                        }}
                      >
                        {activity.description}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {activity.date}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        by {activity.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '1px solid #E0DDD6' }}>
              <h4 className="text-sm mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                Quick Actions
              </h4>
              
              <button
                className="w-full px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-2 justify-center"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                <MessageSquare className="w-4 h-4" />
                Send SMS Reminder
              </button>

              <button
                className="w-full px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-2 justify-center"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
                onClick={() => navigate('/case-management')}
              >
                <AlertCircle className="w-4 h-4" />
                View All Cases
              </button>

              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50 flex items-center gap-2 justify-center"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
                onClick={() => navigate(`/scouting-reports?q=${encodeURIComponent(farmerData.name)}`)}
              >
                <ClipboardList className="w-4 h-4" />
                Review scouting reports
              </button>

              <button
                onClick={handleViewComplianceReport}
                className="w-full px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2 justify-center"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Report Modal */}
      {showComplianceReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowComplianceReport(false)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-lg p-8"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: '#15803D' }} />
              </div>
              <h2 
                className="text-2xl mb-2"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  color: '#1B4332',
                }}
              >
                Compliance Report Generated
              </h2>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Export compliance report for {farmerData.name}
              </p>
            </div>

            <div 
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: '#F7F4EF', borderRadius: '8px' }}
            >
              <div className="space-y-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#717182' }}>Report Period:</span>
                  <span style={{ color: '#1B4332', fontWeight: '600' }}>Last 30 Days</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#717182' }}>Compliance Score:</span>
                  <span style={{ color: '#1B4332', fontWeight: '600' }}>{farmerData.complianceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#717182' }}>Weekly Scoutings:</span>
                  <span style={{ color: '#1B4332', fontWeight: '600' }}>4/4 Completed</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#717182' }}>Export Status:</span>
                  <span style={{ color: '#D97706', fontWeight: '600' }}>At Risk</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#717182' }}>Active Cases:</span>
                  <span style={{ color: '#1B4332', fontWeight: '600' }}>{farmerData.activeCases.length}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowComplianceReport(false)}
                className="flex-1 px-6 py-3 rounded-lg border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  console.log('Downloading compliance report PDF');
                  alert('Compliance report downloaded successfully!');
                }}
                className="flex-1 px-6 py-3 rounded-lg transition-colors hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}