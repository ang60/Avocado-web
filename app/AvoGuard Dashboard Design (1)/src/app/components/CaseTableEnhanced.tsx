import { useState } from 'react';
import { MoreVertical, ArrowUpDown, Filter, Smartphone, Phone, MessageSquare, UserPlus, Eye, X } from 'lucide-react';
import { CaseDetailModal, CaseDetailData } from './CaseDetailModal';
import { useNavigate } from 'react-router';

interface CaseData {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'unknown';
  farm: string;
  block: string;
  pestDisease: string;
  pestDiseaseKiswahili: string;
  dateSubmitted: string;
  status: 'new' | 'under-review' | 'advisory-issued';
  scoutName: string;
  location: string;
  affectedTrees: number;
  symptoms: string[];
  notes: string;
  channel: 'smartphone' | 'ussd' | 'sms';
}

const mockCases: CaseData[] = [
  {
    id: 'CSE-1024',
    severity: 'high',
    farm: 'Kangema Avocado Growers',
    block: 'Block A-12',
    pestDisease: 'False Codling Moth',
    pestDiseaseKiswahili: 'Nondo wa Parachichi',
    dateSubmitted: 'Mar 14, 2026',
    status: 'new',
    scoutName: 'Jane Wambui',
    location: 'Kangema, Murang\'a County',
    affectedTrees: 45,
    symptoms: ['Fruit damage', 'Larvae in fruit', 'Premature fruit drop'],
    notes: 'Heavy infestation of false codling moth observed. Larvae found inside developing fruit. Population density appears to be increasing. Recommend immediate pheromone trap deployment and intervention.',
    channel: 'smartphone',
  },
  {
    id: 'CSE-1023',
    severity: 'high',
    farm: 'Gatanga Green Farms',
    block: 'Block C-5',
    pestDisease: 'Phytophthora Root Rot',
    pestDiseaseKiswahili: 'Kuoza kwa Mizizi',
    dateSubmitted: 'Mar 13, 2026',
    status: 'under-review',
    scoutName: 'Samuel Omondi',
    location: 'Gatanga, Murang\'a County',
    affectedTrees: 28,
    symptoms: ['Wilting leaves', 'Root discoloration', 'Tree decline', 'Poor drainage'],
    notes: 'Several trees showing classic symptoms of root rot. Soil appears waterlogged in affected area. Drainage issues need to be addressed urgently.',
    channel: 'ussd',
  },
  {
    id: 'CSE-1022',
    severity: 'medium',
    farm: 'Tigoni Avocado Estates',
    block: 'Block B-8',
    pestDisease: 'Avocado Thrips',
    pestDiseaseKiswahili: 'Vidudu Wadogo wa Parachichi',
    dateSubmitted: 'Mar 13, 2026',
    status: 'under-review',
    scoutName: 'Mary Akinyi',
    location: 'Tigoni, Kiambu County',
    affectedTrees: 62,
    symptoms: ['Leaf scarring', 'Fruit damage', 'Stunted growth'],
    notes: 'Thrips populations detected on young leaves and developing fruit. Early stage infestation but spreading. Weather conditions favorable for thrips development.',
    channel: 'sms',
  },
  {
    id: 'CSE-1021',
    severity: 'low',
    farm: 'Meru Sunrise Orchards',
    block: 'Block D-3',
    pestDisease: 'Persea Mite',
    pestDiseaseKiswahili: 'Mende wa Parachichi',
    dateSubmitted: 'Mar 12, 2026',
    status: 'advisory-issued',
    scoutName: 'Joseph Mutua',
    location: 'Meru Town, Meru County',
    affectedTrees: 12,
    symptoms: ['Bronzing leaves', 'Webbing present', 'Minor defoliation'],
    notes: 'Minor persea mite activity observed. Population levels below treatment threshold. Monitoring recommended.',
    channel: 'smartphone',
  },
  {
    id: 'CSE-1020',
    severity: 'high',
    farm: 'Kiambu Highland Farms',
    block: 'Block A-7',
    pestDisease: 'Anthracnose',
    pestDiseaseKiswahili: 'Ugonjwa wa Majani',
    dateSubmitted: 'Mar 12, 2026',
    status: 'new',
    scoutName: 'Grace Achieng',
    location: 'Kiambu Town, Kiambu County',
    affectedTrees: 38,
    symptoms: ['Black spots on fruit', 'Fruit rot', 'Leaf lesions'],
    notes: 'Significant anthracnose infection on mature fruit. High humidity levels contributing to disease spread. Fungicide treatment urgently needed.',
    channel: 'ussd',
  },
  {
    id: 'CSE-1019',
    severity: 'medium',
    farm: 'Nyeri Valley Growers',
    block: 'Block E-2',
    pestDisease: 'Avocado Lace Bug',
    pestDiseaseKiswahili: 'Kung\'ang\'a wa Parachichi',
    dateSubmitted: 'Mar 11, 2026',
    status: 'under-review',
    scoutName: 'David Kipchirchir',
    location: 'Nyeri Town, Nyeri County',
    affectedTrees: 55,
    symptoms: ['Yellow stippling', 'Leaf discoloration', 'Black excrement'],
    notes: 'Moderate lace bug infestation on mature trees. Damage primarily cosmetic at this stage but population monitoring needed.',
    channel: 'sms',
  },
  {
    id: 'CSE-1018',
    severity: 'low',
    farm: 'Limuru Green Estates',
    block: 'Block B-15',
    pestDisease: 'Scale Insects',
    pestDiseaseKiswahili: 'Wadudu wa Maganda',
    dateSubmitted: 'Mar 11, 2026',
    status: 'advisory-issued',
    scoutName: 'Faith Njeri',
    location: 'Limuru, Kiambu County',
    affectedTrees: 18,
    symptoms: ['Sooty mold', 'Honeydew presence'],
    notes: 'Light scale infestation detected. Natural predators present. Biological control appears effective.',
    channel: 'smartphone',
  },
  {
    id: 'CSE-1017',
    severity: 'unknown',
    farm: 'Kangema Avocado Growers',
    block: 'Block C-9',
    pestDisease: 'Unidentified Pest',
    pestDiseaseKiswahili: 'Mdudu Usiotambuliwa',
    dateSubmitted: 'Mar 10, 2026',
    status: 'new',
    scoutName: 'Peter Mwangi',
    location: 'Kangema, Murang\'a County',
    affectedTrees: 41,
    symptoms: ['Leaf spots', 'Unknown damage pattern'],
    notes: 'Unknown pest or disease detected. Requires expert agronomist review for proper diagnosis and treatment recommendation.',
    channel: 'ussd',
  },
];

type SortField = 'id' | 'severity' | 'farm' | 'pestDisease' | 'dateSubmitted' | 'status';
type SortOrder = 'asc' | 'desc';

function SeverityBadge({ severity }: { severity: CaseData['severity'] }) {
  const config = {
    high: { label: 'High', bg: '#FEE2E2', text: '#DC2626' },
    medium: { label: 'Medium', bg: '#FEF3C7', text: '#D97706' },
    low: { label: 'Low', bg: '#74C69D20', text: '#2D6A4F' },
    unknown: { label: 'Unknown', bg: '#F3F4F6', text: '#6B7280' },
  };

  const { label, bg, text } = config[severity];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: CaseData['status'] }) {
  const config = {
    'new': { label: 'New', bg: '#DBEAFE', text: '#1E40AF' },
    'under-review': { label: 'Under Review', bg: '#E0E7FF', text: '#4338CA' },
    'advisory-issued': { label: 'Advisory Issued', bg: '#74C69D20', text: '#2D6A4F' },
  };

  const { label, bg, text } = config[status];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}

export function CaseTableEnhanced() {
  const [sortField, setSortField] = useState<SortField>('dateSubmitted');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CaseDetailData | null>(null);
  const [assignModalCase, setAssignModalCase] = useState<CaseData | null>(null);
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedCases = mockCases
    .filter((c) => {
      if (filterSeverity !== 'all' && c.severity !== filterSeverity) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'severity') {
        const severityOrder = { high: 3, medium: 2, low: 1, unknown: 0 };
        aVal = severityOrder[a.severity];
        bVal = severityOrder[b.severity];
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <>
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
          borderRadius: '8px',
        }}
      >
        {/* Filters */}
        <div 
          className="p-4 border-b flex items-center gap-4"
          style={{ borderColor: '#E0DDD6' }}
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
              Filters:
            </span>
          </div>
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 rounded-lg border outline-none text-sm"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#E0DDD6',
              borderRadius: '8px',
              color: '#1B4332',
            }}
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border outline-none text-sm"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#E0DDD6',
              borderRadius: '8px',
              color: '#1B4332',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="under-review">Under Review</option>
            <option value="advisory-issued">Advisory Issued</option>
          </select>

          <div className="ml-auto text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            {filteredAndSortedCases.length} cases
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th 
                  className="text-left px-4 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Channel
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    Case ID
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center gap-2">
                    Severity
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('farm')}
                >
                  <div className="flex items-center gap-2">
                    Farm / Block
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('pestDisease')}
                >
                  <div className="flex items-center gap-2">
                    Pest / Disease
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('dateSubmitted')}
                >
                  <div className="flex items-center gap-2">
                    Date Submitted
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100/50"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCases.map((caseItem, index) => (
                <tr 
                  key={caseItem.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== filteredAndSortedCases.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-4 py-4">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: caseItem.channel === 'smartphone' ? '#DBEAFE' : caseItem.channel === 'ussd' ? '#FEF3C7' : '#E0E7FF',
                        color: caseItem.channel === 'smartphone' ? '#1E40AF' : caseItem.channel === 'ussd' ? '#D97706' : '#4F46E5',
                      }}
                      title={caseItem.channel === 'smartphone' ? 'Smartphone App' : caseItem.channel === 'ussd' ? 'USSD' : 'SMS'}
                    >
                      {caseItem.channel === 'smartphone' && <Smartphone className="w-4 h-4" />}
                      {caseItem.channel === 'ussd' && <Phone className="w-4 h-4" />}
                      {caseItem.channel === 'sms' && <MessageSquare className="w-4 h-4" />}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
                  >
                    {caseItem.id}
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={caseItem.severity} />
                  </td>
                  <td 
                    className="px-6 py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                  >
                    <div>
                      <div>{caseItem.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {caseItem.block}
                      </div>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                  >
                    <div>
                      <div className="text-sm">{caseItem.pestDisease}</div>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    {caseItem.dateSubmitted}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={caseItem.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded text-xs hover:opacity-80 transition-opacity whitespace-nowrap flex items-center gap-1"
                        style={{
                          backgroundColor: '#2D6A4F',
                          color: '#FFFFFF',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderRadius: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/case-management/${caseItem.id}`);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Review Diagnosis
                      </button>
                      <button
                        className="px-3 py-1 rounded text-xs hover:opacity-80 transition-opacity whitespace-nowrap flex items-center gap-1"
                        style={{
                          backgroundColor: '#74C69D20',
                          color: '#2D6A4F',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderRadius: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignModalCase(caseItem);
                        }}
                      >
                        <UserPlus className="w-3 h-3" />
                        Assign Agronomist
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CaseDetailModal 
        caseData={selectedCase}
        onClose={() => setSelectedCase(null)}
      />

      {/* Assign Agronomist Modal */}
      {assignModalCase && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setAssignModalCase(null)}
        >
          <div 
            className="rounded-lg max-w-md w-full overflow-hidden"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '8px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-6 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: '#E0DDD6' }}
            >
              <div>
                <h2 
                  className="text-2xl mb-1"
                  style={{ 
                    fontFamily: 'DM Serif Display, serif',
                    color: '#1B4332',
                  }}
                >
                  Assign Agronomist
                </h2>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Case: {assignModalCase.id}
                </p>
              </div>
              <button
                onClick={() => setAssignModalCase(null)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#717182' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Case Summary */}
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderRadius: '8px',
                }}
              >
                <p 
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Case Details
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Farm:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {assignModalCase.farm} - {assignModalCase.block}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Pest/Disease:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {assignModalCase.pestDisease}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Severity:
                    </p>
                    <div className="mt-1">
                      <SeverityBadge severity={assignModalCase.severity} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assign Agronomist Dropdown */}
              <div className="mb-6">
                <label 
                  className="block text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Select Agronomist
                </label>
                <select
                  defaultValue=""
                  className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    borderRadius: '8px',
                    color: '#1B4332',
                  }}
                >
                  <option value="" disabled>Choose an agronomist...</option>
                  <option value="dr-james-kariuki">Dr. James Kariuki - Murang'a Region</option>
                  <option value="dr-sarah-mwangi">Dr. Sarah Mwangi - Kiambu Region</option>
                  <option value="dr-john-maina">Dr. John Maina - Nyeri Region</option>
                  <option value="dr-grace-wanjiru">Dr. Grace Wanjiru - Meru Region</option>
                  <option value="dr-peter-omondi">Dr. Peter Omondi - Bungoma Region</option>
                </select>
              </div>

              {/* Assignment Notes */}
              <div className="mb-6">
                <label 
                  className="block text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Assignment Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any specific instructions or priority notes..."
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    borderRadius: '8px',
                    color: '#1B4332',
                  }}
                />
              </div>

              {/* Send Notification Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send-notification"
                  defaultChecked
                  style={{ accentColor: '#2D6A4F' }}
                />
                <label 
                  htmlFor="send-notification"
                  className="text-sm"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                >
                  Send SMS notification to assigned agronomist
                </label>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div 
              className="p-6 border-t flex items-center justify-between flex-shrink-0"
              style={{ borderColor: '#E0DDD6' }}
            >
              <button
                onClick={() => setAssignModalCase(null)}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: '#E0DDD6',
                  color: '#717182',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Assigning case:', assignModalCase.id);
                  alert(`Case ${assignModalCase.id} assigned successfully!\n\nSMS notification sent to agronomist.`);
                  setAssignModalCase(null);
                }}
                className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                <UserPlus className="w-4 h-4" />
                Assign Case
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}