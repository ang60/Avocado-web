import { MoreVertical } from 'lucide-react';
import { TableScroll } from './TableScroll';

interface CaseData {
  id: string;
  severity: 'high' | 'medium' | 'low';
  farm: string;
  block: string;
  pestDisease: string;
  dateSubmitted: string;
  status: 'new' | 'under-review' | 'advisory-issued';
}

const mockCases: CaseData[] = [
  {
    id: 'CSE-1024',
    severity: 'high',
    farm: 'Valley View Orchards',
    block: 'Block A-12',
    pestDisease: 'Avocado Thrips',
    dateSubmitted: 'Mar 14, 2026',
    status: 'new',
  },
  {
    id: 'CSE-1023',
    severity: 'high',
    farm: 'Greenfield Farm',
    block: 'Block C-5',
    pestDisease: 'Phytophthora Root Rot',
    dateSubmitted: 'Mar 13, 2026',
    status: 'under-review',
  },
  {
    id: 'CSE-1022',
    severity: 'medium',
    farm: 'Sunrise Avocado Co.',
    block: 'Block B-8',
    pestDisease: 'Persea Mite',
    dateSubmitted: 'Mar 13, 2026',
    status: 'under-review',
  },
  {
    id: 'CSE-1021',
    severity: 'low',
    farm: 'Hillside Groves',
    block: 'Block D-3',
    pestDisease: 'Leafroller',
    dateSubmitted: 'Mar 12, 2026',
    status: 'advisory-issued',
  },
  {
    id: 'CSE-1020',
    severity: 'high',
    farm: 'Pacific Orchards',
    block: 'Block A-7',
    pestDisease: 'Anthracnose',
    dateSubmitted: 'Mar 12, 2026',
    status: 'new',
  },
  {
    id: 'CSE-1019',
    severity: 'medium',
    farm: 'Mountain View Estates',
    block: 'Block E-2',
    pestDisease: 'Avocado Lace Bug',
    dateSubmitted: 'Mar 11, 2026',
    status: 'under-review',
  },
  {
    id: 'CSE-1018',
    severity: 'low',
    farm: 'Coastal Farms',
    block: 'Block B-15',
    pestDisease: 'Scale Insects',
    dateSubmitted: 'Mar 11, 2026',
    status: 'advisory-issued',
  },
  {
    id: 'CSE-1017',
    severity: 'medium',
    farm: 'Valley View Orchards',
    block: 'Block C-9',
    pestDisease: 'Cercospora Spot',
    dateSubmitted: 'Mar 10, 2026',
    status: 'advisory-issued',
  },
];

function SeverityBadge({ severity }: { severity: CaseData['severity'] }) {
  const config = {
    high: {
      label: 'High',
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    medium: {
      label: 'Medium',
      bg: '#FEF3C7',
      text: '#D97706',
    },
    low: {
      label: 'Low',
      bg: '#74C69D20',
      text: '#2D6A4F',
    },
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
    'new': {
      label: 'New',
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    'under-review': {
      label: 'Under Review',
      bg: '#E0E7FF',
      text: '#4338CA',
    },
    'advisory-issued': {
      label: 'Advisory Issued',
      bg: '#74C69D20',
      text: '#2D6A4F',
    },
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

export function CaseTable() {
  return (
    <div 
      className="min-w-0 overflow-hidden rounded-lg border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
        borderRadius: '8px',
      }}
    >
      <TableScroll>
        <table className="w-full min-w-[720px]">
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Case ID
              </th>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Severity
              </th>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Farm / Block
              </th>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Pest / Disease
              </th>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Date Submitted
              </th>
              <th 
                className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Status
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {mockCases.map((caseItem, index) => (
              <tr 
                key={caseItem.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                style={{ 
                  borderBottom: index !== mockCases.length - 1 ? '1px solid #E0DDD6' : 'none'
                }}
              >
                <td 
                  className="px-6 py-4"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#2D6A4F',
                  }}
                >
                  {caseItem.id}
                </td>
                <td className="px-6 py-4">
                  <SeverityBadge severity={caseItem.severity} />
                </td>
                <td 
                  className="px-6 py-4"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                  }}
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
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                  }}
                >
                  {caseItem.pestDisease}
                </td>
                <td 
                  className="px-6 py-4"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  {caseItem.dateSubmitted}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={caseItem.status} />
                </td>
                <td className="px-6 py-4">
                  <button 
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    style={{ color: '#717182' }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}
