import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import { fetchFarmersList } from '../api/placeholderApi';
import type { FarmerListRow } from '../api/types';
import { 
  ArrowUpDown, Filter, Smartphone, Phone, 
  MessageSquare, Send, AlertCircle, CheckCircle, Calendar, MapPin
} from 'lucide-react';
import { KenyaFarmerRegionalMap } from '../components/KenyaFarmerRegionalMap';
import { useNavigate } from 'react-router';
import { AppToast } from '../components/AppToast';


type SortField = 'id' | 'name' | 'county' | 'exportEligibility';
type SortOrder = 'asc' | 'desc';

function ComplianceBar({ logs }: { logs: [number, number, number, number] }) {
  const completedWeeks = logs.filter(l => l === 1).length;
  const compliancePercentage = (completedWeeks / 4) * 100;

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {logs.map((status, index) => (
          <div
            key={index}
            className="h-2 rounded-full flex-1"
            style={{
              backgroundColor: status === 1 ? '#74C69D' : '#C0392B',
              borderRadius: '4px',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
        {completedWeeks}/4 weeks complete
      </p>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: 'smartphone' | 'ussd' }) {
  const config = {
    smartphone: { label: 'Smartphone App', bg: '#DBEAFE', text: '#1E40AF', icon: Smartphone },
    ussd: { label: 'USSD/Feature Phone', bg: '#FEF3C7', text: '#D97706', icon: Phone },
  };

  const { label, bg, text, icon: Icon } = config[channel];

  return (
    <span
      className="px-3 py-1 rounded text-xs flex items-center gap-1 w-fit"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function ScoutingResultBadge({ result }: { result: FarmerListRow['lastScoutingResult'] }) {
  const config = {
    'high-risk': { bg: '#FEE2E2', text: '#C0392B', border: '#C0392B' },
    'medium-risk': { bg: '#FEF3C7', text: '#D97706', border: '#D97706' },
    'low-risk': { bg: '#E0E7FF', text: '#4338CA', border: '#4338CA' },
    'no-pests': { bg: '#DCFCE7', text: '#74C69D', border: '#74C69D' },
  };

  const { bg, text, border } = config[result.status];

  return (
    <div>
      <span
        className="px-3 py-1 rounded text-xs inline-block mb-1"
        style={{
          backgroundColor: bg,
          color: text,
          fontFamily: 'IBM Plex Sans, sans-serif',
          borderRadius: '8px',
          fontWeight: '600',
          border: `1px solid ${border}`,
        }}
      >
        {result.finding}
      </span>
    </div>
  );
}

function ExportEligibilityPill({ status }: { status: 'ready' | 'at-risk' | 'suspended' }) {
  const config = {
    ready: { label: 'Ready', bg: '#DCFCE7', text: '#15803D', icon: CheckCircle },
    'at-risk': { label: 'At Risk', bg: '#FEF3C7', text: '#D97706', icon: AlertCircle },
    suspended: { label: 'Suspended', bg: '#FEE2E2', text: '#C0392B', icon: AlertCircle },
  };

  const { label, bg, text, icon: Icon } = config[status];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
        fontWeight: '600',
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function Farmers() {
  const [farmersList, setFarmersList] = useState<FarmerListRow[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const [farmersError, setFarmersError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    let cancelled = false;
    fetchFarmersList()
      .then((data) => {
        if (!cancelled) {
          setFarmersList(data);
          setFarmersError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setFarmersError('Could not load farmers.');
      })
      .finally(() => {
        if (!cancelled) setFarmersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);
  const [farmerToast, setFarmerToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredFarmers = farmersList.filter((farmer) => {
    if (complianceFilter === 'overdue-scouts') {
      return farmer.overdueScouts;
    }
    if (complianceFilter === 'high-severity') {
      return farmer.lastScoutingResult.status === 'high-risk';
    }
    return true;
  });

  const sortedFarmers = [...filteredFarmers].sort((a, b) => {
    let aVal: string | number = a[sortField];
    let bVal: string | number = b[sortField];

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleBulkSMS = () => {
    if (selectedFarmers.length > 0) {
      setFarmerToast(`Compliance SMS queued for ${selectedFarmers.length} farmer(s).`);
      window.setTimeout(() => setFarmerToast(null), 5000);
    } else {
      setFarmerToast('Select one or more farmers to send SMS reminders.');
      window.setTimeout(() => setFarmerToast(null), 4000);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFarmers(sortedFarmers.map(f => f.id));
    } else {
      setSelectedFarmers([]);
    }
  };

  const handleSelectFarmer = (farmerId: string) => {
    if (selectedFarmers.includes(farmerId)) {
      setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
    } else {
      setSelectedFarmers([...selectedFarmers, farmerId]);
    }
  };

  // County distribution for mini-map
  const countyDistribution = farmersList.reduce((acc, farmer) => {
    acc[farmer.county] = (acc[farmer.county] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (farmersLoading) {
    return (
      <Layout>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading farmers…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {farmerToast && (
        <AppToast
          message={farmerToast}
          variant={farmerToast.startsWith('Select') ? 'info' : 'success'}
          onDismiss={() => setFarmerToast(null)}
        />
      )}
      {farmersError && (
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {farmersError}
        </div>
      )}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-9">
          <header className="mb-8">
            <h1 
              className="text-4xl mb-2" 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332'
              }}
            >
              Farmer Traceability Registry
            </h1>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Compliance tracking & export eligibility monitoring / Ufuatiliaji wa Uzingatiaji
            </p>
          </header>

          {/* Top Filter Bar */}
          <div 
            className="p-4 rounded-lg border mb-6 flex items-center gap-4"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E0DDD6', 
              borderRadius: '8px',
            }}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: '#717182' }} />
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Compliance Filter:
              </span>
            </div>
            
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border outline-none text-sm"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                borderRadius: '8px',
                color: '#1B4332',
              }}
            >
              <option value="all">All Farmers</option>
              <option value="overdue-scouts">Overdue Scouts Only</option>
              <option value="high-severity">High Severity Cases</option>
            </select>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {selectedFarmers.length} selected
              </span>
              <button
                onClick={handleBulkSMS}
                className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                }}
              >
                <Send className="w-4 h-4" />
                Send Bulk SMS Reminders
              </button>
            </div>
          </div>

          {/* Table */}
          <div 
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E0DDD6',
              borderRadius: '8px',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedFarmers.length === sortedFarmers.length && sortedFarmers.length > 0}
                        onChange={handleSelectAll}
                        style={{ accentColor: '#2D6A4F' }}
                      />
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-2">
                        Farmer ID
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Farmer Name
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      Compliance Score
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      Primary Channel
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      Last Scouting Result
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      onClick={() => handleSort('exportEligibility')}
                    >
                      <div className="flex items-center gap-2">
                        Export Eligibility
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFarmers.map((farmer, index) => (
                    <tr 
                      key={farmer.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: index !== sortedFarmers.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                      onClick={() => navigate(`/farmers/${farmer.id}`)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedFarmers.includes(farmer.id)}
                          onChange={() => handleSelectFarmer(farmer.id)}
                          style={{ accentColor: '#2D6A4F' }}
                        />
                      </td>
                      <td 
                        className="px-6 py-4"
                        style={{ fontFamily: 'monospace', color: '#2D6A4F', fontWeight: '600' }}
                      >
                        {farmer.id}
                      </td>
                      <td 
                        className="px-6 py-4"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                      >
                        <div>
                          <div className="font-medium">{farmer.name}</div>
                          <div className="text-xs" style={{ color: '#717182' }}>
                            {farmer.owner}
                          </div>
                          <div className="text-xs flex items-center gap-1 mt-1" style={{ color: '#717182' }}>
                            <MapPin className="w-3 h-3" />
                            {farmer.location}, {farmer.county}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ComplianceBar logs={farmer.weeklyScoutingLogs} />
                      </td>
                      <td className="px-6 py-4">
                        <ChannelBadge channel={farmer.primaryChannel} />
                      </td>
                      <td className="px-6 py-4">
                        <ScoutingResultBadge result={farmer.lastScoutingResult} />
                        <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                          {farmer.lastInspection}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <ExportEligibilityPill status={farmer.exportEligibility} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Showing {sortedFarmers.length} of {farmersList.length} farmers
          </div>
        </div>

        {/* Mini-Map Sidebar */}
        <div className="col-span-3">
          <div 
            className="p-6 rounded-lg border sticky top-6"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E0DDD6', 
              borderRadius: '8px',
            }}
          >
            <h3 
              className="mb-4"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#1B4332',
                fontWeight: '600',
              }}
            >
              Regional Distribution
            </h3>
            <p className="text-xs mb-6 uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Farmers by County / Kaunti
            </p>

            <KenyaFarmerRegionalMap farmerCountByCounty={countyDistribution} />

            {/* County List */}
            <div className="space-y-3">
              {Object.entries(countyDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([county, count]) => (
                  <div 
                    key={county}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ 
                      backgroundColor: '#F7F4EF',
                      borderRadius: '8px',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#2D6A4F' }}
                      />
                      <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {county}
                      </span>
                    </div>
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        color: '#1B4332',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div 
              className="mt-6 pt-6 space-y-3"
              style={{ borderTop: '1px solid #E0DDD6' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Export Ready
                </span>
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D', fontWeight: '600' }}>
                  {farmersList.filter(f => f.exportEligibility === 'ready').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  At Risk
                </span>
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706', fontWeight: '600' }}>
                  {farmersList.filter(f => f.exportEligibility === 'at-risk').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Suspended
                </span>
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B', fontWeight: '600' }}>
                  {farmersList.filter(f => f.exportEligibility === 'suspended').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}