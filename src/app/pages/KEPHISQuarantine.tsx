
import { KEPHISRiskIntelTab } from '../components/KEPHISRiskIntelTab';
import { Shield, AlertTriangle, CheckCircle, Clock, Download, FileText, Search, Eye, FileCheck, History, X, Calendar, MoreVertical, XCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TableScroll } from '../components/TableScroll';
import { OptimizedImage } from '../components/OptimizedImage';
import { fetchKephisQuarantineBlocks } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';

interface QuarantineBlock {
  id: string;
  blockId: string;
  farmName: string;
  county: string;
  pestType: string;
  captureRate: number;
  lastInspection: string;
  kephisStatus: 'cleared' | 'gated' | 'pending';
  inspector: string;
  selected: boolean;
}

const mockQuarantineData: QuarantineBlock[] = [
  {
    id: '1',
    blockId: 'BLK-KMB-001',
    farmName: 'Kiambu Highlands Estate',
    county: 'Kiambu',
    pestType: 'FCM',
    captureRate: 12.5,
    lastInspection: '2026-03-15',
    kephisStatus: 'gated',
    inspector: 'Dr. James Mwangi',
    selected: false,
  },
  {
    id: '2',
    blockId: 'BLK-MRU-034',
    farmName: 'Meru Central Farm',
    county: 'Meru',
    pestType: 'Fruit Fly',
    captureRate: 3.2,
    lastInspection: '2026-03-16',
    kephisStatus: 'pending',
    inspector: 'Dr. Sarah Njeri',
    selected: false,
  },
  {
    id: '3',
    blockId: 'BLK-NYR-018',
    farmName: 'Nyeri Green Orchards',
    county: 'Nyeri',
    pestType: 'FCM',
    captureRate: 0.0,
    lastInspection: '2026-03-17',
    kephisStatus: 'cleared',
    inspector: 'Dr. Peter Kariuki',
    selected: false,
  },
  {
    id: '4',
    blockId: 'BLK-KMB-089',
    farmName: 'Kangema Avocado Growers',
    county: 'Kiambu',
    pestType: 'FCM',
    captureRate: 18.7,
    lastInspection: '2026-03-14',
    kephisStatus: 'gated',
    inspector: 'Dr. James Mwangi',
    selected: false,
  },
  {
    id: '5',
    blockId: 'BLK-EMB-022',
    farmName: 'Embu Valley Farms',
    county: 'Embu',
    pestType: 'Fruit Fly',
    captureRate: 5.8,
    lastInspection: '2026-03-13',
    kephisStatus: 'pending',
    inspector: 'Dr. Grace Wambui',
    selected: false,
  },
  {
    id: '6',
    blockId: 'BLK-KRC-045',
    farmName: 'Kirinyaga Export Hub',
    county: 'Kirinyaga',
    pestType: 'FCM',
    captureRate: 0.0,
    lastInspection: '2026-03-17',
    kephisStatus: 'cleared',
    inspector: 'Dr. Peter Kariuki',
    selected: false,
  },
  {
    id: '7',
    blockId: 'BLK-MRU-067',
    farmName: 'Meru Premium Avocados',
    county: 'Meru',
    pestType: 'FCM',
    captureRate: 22.3,
    lastInspection: '2026-03-12',
    kephisStatus: 'gated',
    inspector: 'Dr. Sarah Njeri',
    selected: false,
  },
  {
    id: '8',
    blockId: 'BLK-NYR-091',
    farmName: 'Nyeri Mountain Estates',
    county: 'Nyeri',
    pestType: 'Fruit Fly',
    captureRate: 1.5,
    lastInspection: '2026-03-16',
    kephisStatus: 'pending',
    inspector: 'Dr. Peter Kariuki',
    selected: false,
  },
  {
    id: '9',
    blockId: 'BLK-KMB-102',
    farmName: 'Thika Premium Growers',
    county: 'Kiambu',
    pestType: 'FCM',
    captureRate: 0.0,
    lastInspection: '2026-03-18',
    kephisStatus: 'cleared',
    inspector: 'Dr. James Mwangi',
    selected: false,
  },
  {
    id: '10',
    blockId: 'BLK-EMB-078',
    farmName: 'Embu Organic Farms',
    county: 'Embu',
    pestType: 'FCM',
    captureRate: 9.4,
    lastInspection: '2026-03-15',
    kephisStatus: 'gated',
    inspector: 'Dr. Grace Wambui',
    selected: false,
  },
];

export function KEPHISQuarantine() {
  const [activeTab, setActiveTab] = useState<'quarantine' | 'risk-intel'>('quarantine');
  const [blocks, setBlocks] = useState<QuarantineBlock[]>(mockQuarantineData);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [permitModalOpen, setPermitModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [bulkPermitModalOpen, setBulkPermitModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<QuarantineBlock | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBlocksLoading(true);
    setBlocksError(null);
    fetchKephisQuarantineBlocks()
      .then((rows) => {
        if (cancelled) return;
        // Keep local UI selection flag stable; API may not include it.
        setBlocks(rows.map((r) => ({ ...r, selected: false })));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setBlocksError(getApiErrorMessage(e, 'Could not load quarantine blocks.'));
      })
      .finally(() => {
        if (!cancelled) setBlocksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const gatedCount = blocks.filter(b => b.kephisStatus === 'gated').length;
  const clearedCount = blocks.filter(b => b.kephisStatus === 'cleared').length;
  const pendingCount = blocks.filter(b => b.kephisStatus === 'pending').length;
  const selectedCount = blocks.filter(b => b.selected).length;

  const toggleSelect = (id: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, selected: !block.selected } : block
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = blocks.every(b => b.selected);
    setBlocks(blocks.map(block => ({ ...block, selected: !allSelected })));
  };

  const handleBulkAction = () => {
    setBulkPermitModalOpen(true);
  };

  const handleViewDetails = (block: QuarantineBlock) => {
    setSelectedBlock(block);
    setDetailsModalOpen(true);
  };

  const handleViewHistory = (block: QuarantineBlock) => {
    setSelectedBlock(block);
    setHistoryModalOpen(true);
  };

  const handleIssuePermit = (block: QuarantineBlock) => {
    setSelectedBlock(block);
    setPermitModalOpen(true);
  };

  const handleViewEvidence = (block: QuarantineBlock) => {
    setSelectedBlock(block);
    setEvidenceModalOpen(true);
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = 
      block.blockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || block.kephisStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gated':
        return { bg: '#C0392B', text: '#FFFFFF' };
      case 'cleared':
        return { bg: '#2D6A4F', text: '#FFFFFF' };
      case 'pending':
        return { bg: '#F39C12', text: '#FFFFFF' };
      default:
        return { bg: '#717182', text: '#FFFFFF' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'gated':
        return 'Movement Restricted';
      case 'cleared':
        return 'Export Cleared';
      case 'pending':
        return 'Under Review';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h1 
            className="mb-1"
            style={{ 
              fontFamily: 'DM Serif Display, serif',
              fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
              color: '#1B4332',
              margin: 0,
            }}
          >
            National Plant Health Surveillance
          </h1>
          <p 
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '16px',
              color: '#717182',
              margin: 0,
            }}
          >
            Live Oversight of Quarantine Pests (FCM / Fruit Fly)
          </p>
          {blocksLoading ? (
            <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Loading quarantine blocks…
            </p>
          ) : null}
          {blocksError ? (
            <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#b45309' }}>
              {blocksError} (showing last known data)
            </p>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b sm:mb-5" style={{ borderColor: '#E0DDD6' }}>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('quarantine')}
              className="px-6 py-3 font-semibold transition-all relative"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: activeTab === 'quarantine' ? '#1B4332' : '#717182',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'quarantine' ? '3px solid #2D6A4F' : '3px solid transparent',
              }}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Quarantine Management
            </button>
            <button
              onClick={() => setActiveTab('risk-intel')}
              className="px-6 py-3 font-semibold transition-all relative"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: activeTab === 'risk-intel' ? '#1B4332' : '#717182',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'risk-intel' ? '3px solid #2D6A4F' : '3px solid transparent',
              }}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Risk Intelligence
            </button>
          </div>
        </div>

        {/* Quarantine Management Tab */}
        {activeTab === 'quarantine' && (
        <div>

        {/* High-Level Metrics */}
        <div className="mb-4 grid grid-cols-1 gap-3 min-w-0 sm:mb-5 sm:grid-cols-3 sm:gap-4 md:gap-5">
          {/* Active Gated Blocks */}
          <div 
            className="p-6 rounded-lg border-2"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#C0392B',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Active Gated Blocks
                </p>
                <p 
                  className="text-4xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#C0392B',
                  }}
                >
                  {gatedCount}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: '#C0392B' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Movement restricted due to pest detection
            </p>
          </div>

          {/* Pest-Free Blocks */}
          <div 
            className="p-6 rounded-lg border-2"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#2D6A4F',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Pest-Free Blocks
                </p>
                <p 
                  className="text-4xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#2D6A4F',
                  }}
                >
                  {clearedCount}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: '#2D6A4F' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Cleared for export operations
            </p>
          </div>

          {/* Pending Inspections */}
          <div 
            className="p-6 rounded-lg border-2"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#F39C12',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Pending Inspections
                </p>
                <p 
                  className="text-4xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#F39C12',
                  }}
                >
                  {pendingCount}
                </p>
              </div>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(243, 156, 18, 0.1)' }}
              >
                <Clock className="w-6 h-6" style={{ color: '#F39C12' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Awaiting KEPHIS certification
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div 
          className="p-6 rounded-lg mb-6"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0DDD6',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: '#717182' }} 
                />
                <input
                  type="text"
                  placeholder="Search by Block ID, Farm, or County..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  outline: 'none',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="gated">Movement Restricted</option>
                <option value="cleared">Export Cleared</option>
                <option value="pending">Under Review</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Bulk Action Button */}
              <button
                onClick={handleBulkAction}
                disabled={selectedCount === 0}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: selectedCount > 0 ? '#2D6A4F' : '#E0DDD6',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  border: 'none',
                  cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                  opacity: selectedCount > 0 ? 1 : 0.6,
                }}
              >
                <FileText className="w-4 h-4" />
                Issue Digital Movement Permit ({selectedCount})
              </button>

              {/* Export Button */}
              <button
                className="px-4 py-2 rounded-lg flex items-center gap-2 border transition-all hover:bg-gray-50"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Specialized Quarantine Table */}
        <div 
          className="min-w-0 overflow-hidden rounded-lg border"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
          }}
        >
          <TableScroll>
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #E0DDD6' }}>
                  <th className="p-4 text-left" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={blocks.length > 0 && blocks.every(b => b.selected)}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Block ID
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Farm Name
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    County
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Pest Type
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Capture Rate
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Last Visual Inspection
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Inspector
                  </th>
                  <th 
                    className="p-4 text-left"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    KEPHIS Clearance Status
                  </th>
                  <th 
                    className="p-4 text-center"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1B4332',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '80px',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((block) => {
                  const statusColors = getStatusColor(block.kephisStatus);
                  const isFCM = block.pestType === 'FCM';
                  
                  return (
                    <tr 
                      key={block.id}
                      className="transition-colors hover:bg-gray-50"
                      style={{ 
                        borderBottom: '1px solid #E0DDD6',
                        backgroundColor: block.selected ? 'rgba(45, 106, 79, 0.05)' : 'transparent',
                      }}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={block.selected}
                          onChange={() => toggleSelect(block.id)}
                          className="w-4 h-4"
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: '14px',
                            color: '#1B4332',
                            fontWeight: 600,
                          }}
                        >
                          {block.blockId}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            fontSize: '14px',
                            color: '#2C2C2E',
                          }}
                        >
                          {block.farmName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            fontSize: '14px',
                            color: '#717182',
                          }}
                        >
                          {block.county}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            backgroundColor: isFCM ? 'rgba(192, 57, 43, 0.1)' : 'rgba(243, 156, 18, 0.1)',
                            color: isFCM ? '#C0392B' : '#F39C12',
                          }}
                        >
                          {block.pestType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          className="font-mono font-semibold"
                          style={{ 
                            fontSize: '14px',
                            color: block.captureRate > 10 ? '#C0392B' : block.captureRate > 0 ? '#F39C12' : '#2D6A4F',
                          }}
                        >
                          {block.captureRate.toFixed(1)} per trap
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            fontSize: '14px',
                            color: '#2C2C2E',
                          }}
                        >
                          {new Date(block.lastInspection).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            fontSize: '13px',
                            color: '#717182',
                          }}
                        >
                          {block.inspector}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                          style={{ 
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                          }}
                        >
                          {block.kephisStatus === 'gated' && <AlertTriangle className="w-3 h-3" />}
                          {block.kephisStatus === 'cleared' && <CheckCircle className="w-3 h-3" />}
                          {block.kephisStatus === 'pending' && <Clock className="w-3 h-3" />}
                          {getStatusLabel(block.kephisStatus)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === block.id ? null : block.id);
                            }}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: openMenuId === block.id ? '#74C69D30' : 'transparent',
                              color: '#2D6A4F',
                            }}
                            onMouseEnter={(e) => {
                              if (openMenuId !== block.id) {
                                e.currentTarget.style.backgroundColor = '#74C69D10';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (openMenuId !== block.id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === block.id && (
                            <>
                              {/* Invisible backdrop to close menu */}
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              
                              {/* Menu */}
                              <div 
                                className="absolute right-0 top-full mt-1 z-20 rounded-lg border shadow-lg overflow-hidden"
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  borderColor: '#E0DDD6',
                                  minWidth: '200px',
                                }}
                              >
                                <button
                                  onClick={() => {
                                    handleViewDetails(block);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                                  style={{
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    fontSize: '14px',
                                    color: '#1B4332',
                                    borderBottom: '1px solid #F7F4EF',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F7F4EF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <Eye className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                                  <span>View Details</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleViewHistory(block);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                                  style={{
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    fontSize: '14px',
                                    color: '#1B4332',
                                    borderBottom: '1px solid #F7F4EF',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F7F4EF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <History className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                                  <span>View History</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (block.kephisStatus !== 'gated' && block.kephisStatus !== 'pending') {
                                      handleIssuePermit(block);
                                      setOpenMenuId(null);
                                    }
                                  }}
                                  disabled={block.kephisStatus === 'gated' || block.kephisStatus === 'pending'}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                                  style={{
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    fontSize: '14px',
                                    color: block.kephisStatus === 'gated' || block.kephisStatus === 'pending' ? '#B0B0B0' : '#1B4332',
                                    borderBottom: '1px solid #F7F4EF',
                                    backgroundColor: block.kephisStatus === 'cleared' ? 'rgba(45, 106, 79, 0.05)' : 'transparent',
                                    cursor: block.kephisStatus === 'gated' || block.kephisStatus === 'pending' ? 'not-allowed' : 'pointer',
                                    opacity: block.kephisStatus === 'gated' || block.kephisStatus === 'pending' ? 0.5 : 1,
                                  }}
                                  onMouseEnter={(e) => {
                                    if (block.kephisStatus !== 'gated' && block.kephisStatus !== 'pending') {
                                      e.currentTarget.style.backgroundColor = block.kephisStatus === 'cleared' ? 'rgba(45, 106, 79, 0.15)' : '#F7F4EF';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (block.kephisStatus !== 'gated' && block.kephisStatus !== 'pending') {
                                      e.currentTarget.style.backgroundColor = block.kephisStatus === 'cleared' ? 'rgba(45, 106, 79, 0.05)' : 'transparent';
                                    }
                                  }}
                                >
                                  <FileText className="w-4 h-4" style={{ color: block.kephisStatus === 'cleared' ? '#2D6A4F' : (block.kephisStatus === 'gated' || block.kephisStatus === 'pending' ? '#B0B0B0' : '#717182') }} />
                                  <span style={{ color: block.kephisStatus === 'cleared' ? '#2D6A4F' : (block.kephisStatus === 'gated' || block.kephisStatus === 'pending' ? '#B0B0B0' : '#717182'), fontWeight: block.kephisStatus === 'cleared' ? 600 : 400 }}>
                                    Issue Permit
                                    {block.kephisStatus === 'cleared' && <span className="ml-2 text-xs">✓</span>}
                                  </span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleViewEvidence(block);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                                  style={{
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    fontSize: '14px',
                                    color: '#1B4332',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F7F4EF';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <FileCheck className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                                  <span>View Evidence</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>

          {filteredBlocks.length === 0 && (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#E0DDD6' }} />
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                  fontSize: '16px',
                }}
              >
                No blocks found matching your criteria
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div 
          className="mt-6 p-4 rounded-lg flex items-start gap-3"
          style={{ 
            backgroundColor: 'rgba(192, 57, 43, 0.05)',
            border: '1px solid rgba(192, 57, 43, 0.2)',
          }}
        >
          <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#C0392B', flexShrink: 0 }} />
          <div>
            <p 
              className="font-semibold mb-1"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: '14px',
                color: '#C0392B',
              }}
            >
              Quarantine Pest Alert
            </p>
            <p 
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: '13px',
                color: '#717182',
                lineHeight: 1.5,
              }}
            >
              Blocks with FCM (False Codling Moth) or Fruit Fly detections are subject to movement restrictions 
              under KEPHIS regulations. Digital Movement Permits are required for all produce from gated blocks. 
              Contact your local KEPHIS inspector for clearance procedures.
            </p>
          </div>
        </div>
        </div>
        )}

        {/* Risk Intelligence Tab */}
        {activeTab === 'risk-intel' && (
          <KEPHISRiskIntelTab />
        )}

        {/* View Details Modal */}
        {detailsModalOpen && selectedBlock && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDetailsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
              >
                Block Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Block ID</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.blockId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Farm Name</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.farmName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">County</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.county}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pest Type</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.pestType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capture Rate</p>
                    <p className="font-semibold" style={{ color: selectedBlock.captureRate > 10 ? '#C0392B' : '#1B4332' }}>{selectedBlock.captureRate} per trap</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Inspection</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>
                      {new Date(selectedBlock.lastInspection).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspector</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.inspector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">KEPHIS Status</p>
                    <p className="font-semibold" style={{ color: '#1B4332' }}>{getStatusLabel(selectedBlock.kephisStatus)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View History Modal */}
        {historyModalOpen && selectedBlock && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setHistoryModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
              >
                Inspection History - {selectedBlock.blockId}
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="border rounded-lg p-4" style={{ borderColor: '#E0DDD6' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold" style={{ color: '#1B4332' }}>
                      {new Date(selectedBlock.lastInspection).toLocaleDateString('en-GB')}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: getStatusColor(selectedBlock.kephisStatus).bg,
                        color: getStatusColor(selectedBlock.kephisStatus).text,
                      }}
                    >
                      {getStatusLabel(selectedBlock.kephisStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Inspector: {selectedBlock.inspector}</p>
                  <p className="text-sm text-gray-600">Capture Rate: {selectedBlock.captureRate} per trap</p>
                  <p className="text-sm text-gray-600 mt-2">Latest visual inspection conducted. Trap monitoring data collected.</p>
                </div>
                <div className="border rounded-lg p-4" style={{ borderColor: '#E0DDD6' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold" style={{ color: '#1B4332' }}>
                      {new Date(new Date(selectedBlock.lastInspection).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: '#F39C12',
                        color: '#FFFFFF',
                      }}
                    >
                      Under Review
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Inspector: {selectedBlock.inspector}</p>
                  <p className="text-sm text-gray-600">Trap data submitted for analysis.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setHistoryModalOpen(false)}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issue Permit Modal */}
        {permitModalOpen && selectedBlock && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setPermitModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg p-8 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
              >
                Issue Movement Permit
              </h2>
              
              {selectedBlock.kephisStatus === 'cleared' ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#2D6A4F' }} />
                      <div>
                        <p className="font-semibold" style={{ color: '#2D6A4F' }}>Block Cleared for Export</p>
                        <p className="text-sm text-gray-600 mt-1">This block has been verified pest-free and can receive a movement permit.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Block ID</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.blockId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Farm</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.farmName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Permit Validity</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>30 days from issuance</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setPermitModalOpen(false)}
                      className="px-6 py-2 rounded-lg border"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0DDD6',
                        color: '#1B4332',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert(`Digital Movement Permit issued for ${selectedBlock.blockId}\\nPermit valid for 30 days`);
                        setPermitModalOpen(false);
                      }}
                      className="px-6 py-2 rounded-lg"
                      style={{
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      Issue Permit
                    </button>
                  </div>
                </div>
              ) : selectedBlock.kephisStatus === 'gated' ? (
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#C0392B' }} />
                      <div>
                        <p className="font-semibold" style={{ color: '#C0392B' }}>Movement Restricted</p>
                        <p className="text-sm text-gray-600 mt-1">This block cannot receive a movement permit due to pest detection.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Block ID</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.blockId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-semibold" style={{ color: '#C0392B' }}>{selectedBlock.pestType} Detection</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Capture Rate</p>
                      <p className="font-semibold" style={{ color: '#C0392B' }}>{selectedBlock.captureRate} per trap</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Inspector</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.inspector}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setPermitModalOpen(false)}
                      className="px-6 py-2 rounded-lg"
                      style={{
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-0.5" style={{ color: '#F39C12' }} />
                      <div>
                        <p className="font-semibold" style={{ color: '#F39C12' }}>Awaiting Clearance</p>
                        <p className="text-sm text-gray-600 mt-1">KEPHIS inspection clearance is pending for this block.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Block ID</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.blockId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inspector</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{selectedBlock.inspector}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Inspection</p>
                      <p className="font-semibold" style={{ color: '#1B4332' }}>
                        {new Date(selectedBlock.lastInspection).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setPermitModalOpen(false)}
                      className="px-6 py-2 rounded-lg"
                      style={{
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movement Restriction Evidence Modal */}
        {evidenceModalOpen && selectedBlock && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto p-4"
            style={{ backgroundColor: '#F7F4EF' }}
            onClick={() => setEvidenceModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderTop: '4px solid #C0392B',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxHeight: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div className="p-8 pb-6 border-b flex-shrink-0" style={{ borderColor: '#E0DDD6' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
                    >
                      <AlertTriangle className="w-6 h-6" style={{ color: '#C0392B' }} />
                    </div>
                    <div>
                      <h2 
                        className="text-2xl font-bold mb-1"
                        style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
                      >
                        Movement Restriction: {selectedBlock.blockId}
                      </h2>
                      <p className="text-sm" style={{ color: '#717182' }}>
                        Official KEPHIS Quarantine Documentation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEvidenceModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#717182' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body - Split into two columns */}
              <div className="p-8 grid grid-cols-2 gap-8 overflow-y-auto flex-1">
                {/* Left Column: Data Table */}
                <div className="space-y-4">
                  <h3 
                    className="text-lg font-bold mb-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                  >
                    Restriction Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Block ID
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}
                      >
                        {selectedBlock.blockId}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Farm Name
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}
                      >
                        {selectedBlock.farmName}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        County
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}
                      >
                        {selectedBlock.county}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Quarantine Pest
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C0392B' }}
                      >
                        {selectedBlock.pestType}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Trap Capture Rate
                      </span>
                      <span 
                        className="font-bold text-right text-lg"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C0392B' }}
                      >
                        {selectedBlock.captureRate.toFixed(1)} per trap
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Inspector
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}
                      >
                        {selectedBlock.inspector}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#F7F4EF' }}>
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Inspection Date
                      </span>
                      <span 
                        className="font-semibold text-right"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}
                      >
                        {new Date(selectedBlock.lastInspection).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2">
                      <span 
                        className="font-bold text-sm"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        Status
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          backgroundColor: '#C0392B',
                          color: '#FFFFFF',
                        }}
                      >
                        Movement Restricted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Evidence Image */}
                <div>
                  <h3 
                    className="text-lg font-bold mb-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                  >
                    Evidence Image
                  </h3>
                  
                  <div 
                    className="relative rounded-lg overflow-hidden border-2"
                    style={{ borderColor: '#E0DDD6' }}
                  >
                    <OptimizedImage
                      src="https://images.unsplash.com/photo-1753105091436-1854e9ef3ae4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdm9jYWRvJTIwcGVzdCUyMGRhbWFnZSUyMGluZmVzdGF0aW9ufGVufDF8fHx8MTc3MzgzMDkyN3ww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Pest evidence"
                      priority
                      className="h-80 w-full object-cover"
                    />
                    
                    {/* Verified Watermark */}
                    <div 
                      className="absolute top-4 right-4 px-4 py-2 rounded-lg flex items-center gap-2"
                      style={{ 
                        backgroundColor: 'rgba(45, 106, 79, 0.95)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                      <span 
                        className="text-sm font-bold"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#FFFFFF' }}
                      >
                        VERIFIED
                      </span>
                    </div>

                    {/* Image Info */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{ 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      }}
                    >
                      <p 
                        className="text-xs"
                        style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#FFFFFF' }}
                      >
                        IMG-{selectedBlock.blockId}-{new Date(selectedBlock.lastInspection).toISOString().split('T')[0]}.JPG
                      </p>
                    </div>
                  </div>

                  <p 
                    className="text-xs mt-3"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Photo captured during field inspection showing visual evidence of {selectedBlock.pestType} infestation. 
                    Image verified and authenticated by KEPHIS Inspector.
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 pt-0 pb-8 flex items-center justify-between gap-4 flex-shrink-0">
                <button
                  onClick={() => {
                    alert(`Downloading Official Restriction Order for ${selectedBlock.blockId}`);
                  }}
                  className="flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 border-2 transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#C0392B',
                    color: '#C0392B',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#C0392B';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = '#C0392B';
                  }}
                >
                  <Download className="w-5 h-5" />
                  Download Official Restriction Order (PDF)
                </button>

                <button
                  disabled
                  className="flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 border-2 cursor-not-allowed"
                  style={{
                    backgroundColor: '#F7F4EF',
                    borderColor: '#E0DDD6',
                    color: '#717182',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                    opacity: 0.5,
                  }}
                  title="Re-inspection can be scheduled 14 days after initial restriction"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Re-inspection
                  <span className="text-xs ml-2">(Available in 8 days)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Permit Results Modal */}
        {bulkPermitModalOpen && (() => {
          const selectedBlocks = blocks.filter(b => b.selected);
          const successfulBlocks = selectedBlocks.filter(b => b.kephisStatus === 'cleared');
          const restrictedBlocks = selectedBlocks.filter(b => b.kephisStatus === 'gated' || b.kephisStatus === 'pending');
          
          return (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setBulkPermitModalOpen(false)}
            >
              <div 
                className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                {/* Header */}
                <div className="p-8 pb-6 border-b flex-shrink-0" style={{ borderColor: '#E0DDD6' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 
                        className="text-2xl font-bold mb-1"
                        style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
                      >
                        Bulk Movement Permit Results
                      </h2>
                      <p className="text-sm" style={{ color: '#717182' }}>
                        {selectedBlocks.length} block(s) selected for permit issuance
                      </p>
                    </div>
                    <button
                      onClick={() => setBulkPermitModalOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: '#717182' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">
                  {/* Successfully Issued Permits */}
                  {successfulBlocks.length > 0 && (
                    <div className="mb-4 sm:mb-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)' }}
                        >
                          <CheckCircle className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                        </div>
                        <div>
                          <h3 
                            className="font-bold text-lg"
                            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
                          >
                            Permits Issued Successfully ({successfulBlocks.length})
                          </h3>
                          <p className="text-sm" style={{ color: '#717182' }}>
                            Digital movement permits valid for 30 days
                          </p>
                        </div>
                      </div>

                      <div 
                        className="min-w-0 overflow-hidden rounded-lg border"
                        style={{ borderColor: '#E0DDD6' }}
                      >
                        <TableScroll>
                        <table className="w-full min-w-[520px]">
                          <thead>
                            <tr style={{ backgroundColor: '#2D6A4F' }}>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Block ID
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Farm Name
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                County
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Permit Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {successfulBlocks.map((block, index) => (
                              <tr 
                                key={block.id}
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F7F4EF',
                                  borderBottom: '1px solid #E0DDD6',
                                }}
                              >
                                <td className="p-3">
                                  <span 
                                    style={{ 
                                      fontFamily: 'IBM Plex Mono, monospace',
                                      fontSize: '13px',
                                      color: '#1B4332',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {block.blockId}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#2C2C2E', fontSize: '14px' }}>
                                    {block.farmName}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#717182', fontSize: '14px' }}>
                                    {block.county}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span 
                                    className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                                    style={{ 
                                      backgroundColor: '#2D6A4F',
                                      color: '#FFFFFF',
                                    }}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Issued
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </TableScroll>
                      </div>
                    </div>
                  )}

                  {/* Restricted Blocks */}
                  {restrictedBlocks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
                        >
                          <AlertTriangle className="w-5 h-5" style={{ color: '#C0392B' }} />
                        </div>
                        <div>
                          <h3 
                            className="font-bold text-lg"
                            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B' }}
                          >
                            Permits Cannot Be Issued ({restrictedBlocks.length})
                          </h3>
                          <p className="text-sm" style={{ color: '#717182' }}>
                            Blocks under quarantine restriction or pending review
                          </p>
                        </div>
                      </div>

                      <div 
                        className="min-w-0 overflow-hidden rounded-lg border"
                        style={{ borderColor: '#E0DDD6' }}
                      >
                        <TableScroll>
                        <table className="w-full min-w-[560px]">
                          <thead>
                            <tr style={{ backgroundColor: '#C0392B' }}>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Block ID
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Farm Name
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Restriction Reason
                              </th>
                              <th 
                                className="p-3 text-left text-xs font-semibold uppercase"
                                style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {restrictedBlocks.map((block, index) => (
                              <tr 
                                key={block.id}
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FEF5F5',
                                  borderBottom: '1px solid #E0DDD6',
                                }}
                              >
                                <td className="p-3">
                                  <span 
                                    style={{ 
                                      fontFamily: 'IBM Plex Mono, monospace',
                                      fontSize: '13px',
                                      color: '#1B4332',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {block.blockId}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#2C2C2E', fontSize: '14px' }}>
                                    {block.farmName}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#C0392B', fontSize: '14px', fontWeight: 600 }}>
                                    {block.kephisStatus === 'gated' ? `${block.pestType} Detection (${block.captureRate}/trap)` : 'KEPHIS Inspection Pending'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span 
                                    className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                                    style={{ 
                                      backgroundColor: block.kephisStatus === 'gated' ? '#C0392B' : '#F39C12',
                                      color: '#FFFFFF',
                                    }}
                                  >
                                    {block.kephisStatus === 'gated' ? (
                                      <>
                                        <XCircle className="w-3 h-3" />
                                        Movement Restricted
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3" />
                                        Under Review
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </TableScroll>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedBlocks.length > 0 && (
                    <div 
                      className="mt-8 p-4 rounded-lg"
                      style={{ backgroundColor: '#F7F4EF', borderLeft: '4px solid #1B4332' }}
                    >
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#1B4332' }}>
                            {selectedBlocks.length}
                          </p>
                          <p className="text-xs" style={{ color: '#717182' }}>
                            Total Selected
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#2D6A4F' }}>
                            {successfulBlocks.length}
                          </p>
                          <p className="text-xs" style={{ color: '#717182' }}>
                            Permits Issued
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: '#C0392B' }}>
                            {restrictedBlocks.length}
                          </p>
                          <p className="text-xs" style={{ color: '#717182' }}>
                            Restricted
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex items-center justify-between gap-4 flex-shrink-0" style={{ borderColor: '#E0DDD6' }}>
                  <div className="flex items-center gap-2">
                    {successfulBlocks.length > 0 && (
                      <button
                        onClick={() => {
                          alert(`Downloading ${successfulBlocks.length} digital movement permit(s) as PDF`);
                        }}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 border transition-all hover:bg-gray-50"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E0DDD6',
                          color: '#1B4332',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download Permits (PDF)
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Deselect all blocks
                      setBlocks(blocks.map(block => ({ ...block, selected: false })));
                      setBulkPermitModalOpen(false);
                    }}
                    className="px-6 py-2 rounded-lg"
                    style={{
                      backgroundColor: '#2D6A4F',
                      color: '#FFFFFF',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}