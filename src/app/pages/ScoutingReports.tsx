import { Layout } from '../components/Layout';
import { Search, Smartphone, Phone, CheckCircle, AlertCircle, Image as ImageIcon, Plus, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type SubmissionSource = 'app' | 'ussd';
type SeverityLevel = 'high' | 'medium' | 'low';
type ReviewStatus = 'new' | 'under-review' | 'reviewed';

interface ScoutingFeedItem {
  id: string;
  farmName: string;
  blockId: string;
  farmerName: string;
  severity: SeverityLevel;
  source: SubmissionSource;
  finding: string;
  status: 'clean' | 'detected';
  mediaPreview?: string; // Image URL for app submissions
  ussdCode?: string; // USSD code for USSD submissions
  timestamp: string;
  reviewed: ReviewStatus;
  county: string;
  assignedTo?: string; // Agronomist assigned to
}

const scoutingFeed: ScoutingFeedItem[] = [
  {
    id: 'SF-2145',
    farmName: 'Wanjiru Farm',
    blockId: 'Block B',
    farmerName: 'Grace Wanjiru',
    severity: 'high',
    source: 'app',
    finding: 'False Codling Moth',
    status: 'detected',
    mediaPreview: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=100&h=100&fit=crop',
    timestamp: '14 Mar, 08:30',
    reviewed: 'new',
    county: 'Murang\'a',
    assignedTo: 'Dr. James Kariuki',
  },
  {
    id: 'SF-2144',
    farmName: 'Kipchirchir Estates',
    blockId: 'Block A-12',
    farmerName: 'David Kipchirchir',
    severity: 'low',
    source: 'app',
    finding: 'No Pests Found',
    status: 'clean',
    mediaPreview: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100&h=100&fit=crop',
    timestamp: '14 Mar, 08:15',
    reviewed: 'reviewed',
    county: 'Kiambu',
  },
  {
    id: 'SF-2143',
    farmName: 'Mwangi Holdings',
    blockId: 'Block C',
    farmerName: 'Peter Mwangi',
    severity: 'high',
    source: 'ussd',
    finding: 'Root Rot Suspected',
    status: 'detected',
    ussdCode: '*104',
    timestamp: '14 Mar, 07:45',
    reviewed: 'new',
    county: 'Murang\'a',
    assignedTo: 'Dr. James Kariuki',
  },
  {
    id: 'SF-2142',
    farmName: 'Njeri Orchards',
    blockId: 'Block D-05',
    farmerName: 'Faith Njeri',
    severity: 'low',
    source: 'app',
    finding: 'No Pests Found',
    status: 'clean',
    mediaPreview: 'https://images.unsplash.com/photo-1590411806458-57ad1f1e8c4e?w=100&h=100&fit=crop',
    timestamp: '13 Mar, 16:20',
    reviewed: 'reviewed',
    county: 'Meru',
  },
  {
    id: 'SF-2141',
    farmName: 'Kimani Avocado Co.',
    blockId: 'Block F-03',
    farmerName: 'John Kimani',
    severity: 'medium',
    source: 'ussd',
    finding: 'Thrips Detected',
    status: 'detected',
    ussdCode: '*105',
    timestamp: '13 Mar, 14:10',
    reviewed: 'under-review',
    county: 'Kiambu',
    assignedTo: 'Dr. Sarah Mwangi',
  },
  {
    id: 'SF-2140',
    farmName: 'Wambui Valley Farm',
    blockId: 'Block E-02',
    farmerName: 'Mary Wambui',
    severity: 'low',
    source: 'app',
    finding: 'No Pests Found',
    status: 'clean',
    mediaPreview: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=100&h=100&fit=crop',
    timestamp: '13 Mar, 11:45',
    reviewed: 'reviewed',
    county: 'Nyeri',
  },
  {
    id: 'SF-2139',
    farmName: 'Omondi Green Valley',
    blockId: 'Block G',
    farmerName: 'Samuel Omondi',
    severity: 'high',
    source: 'ussd',
    finding: 'Fruit Fly Infestation',
    status: 'detected',
    ussdCode: '*102',
    timestamp: '13 Mar, 09:30',
    reviewed: 'new',
    county: 'Bungoma',
  },
  {
    id: 'SF-2138',
    farmName: 'Kariuki Farms',
    blockId: 'Block H-08',
    farmerName: 'Joseph Kariuki',
    severity: 'medium',
    source: 'app',
    finding: 'Scale Insects',
    status: 'detected',
    mediaPreview: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=100&h=100&fit=crop',
    timestamp: '12 Mar, 15:50',
    reviewed: 'new',
    county: 'Kiambu',
  },
  {
    id: 'SF-2137',
    farmName: 'Wanjiru Estates',
    blockId: 'Block K-01',
    farmerName: 'Lucy Wanjiru',
    severity: 'low',
    source: 'app',
    finding: 'No Pests Found',
    status: 'clean',
    mediaPreview: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=100&h=100&fit=crop',
    timestamp: '12 Mar, 13:20',
    reviewed: 'reviewed',
    county: 'Embu',
  },
  {
    id: 'SF-2136',
    farmName: 'Mutua Orchards',
    blockId: 'Block J',
    farmerName: 'Daniel Mutua',
    severity: 'medium',
    source: 'ussd',
    finding: 'Leaf Miner Detected',
    status: 'detected',
    ussdCode: '*108',
    timestamp: '12 Mar, 10:15',
    reviewed: 'under-review',
    county: 'Machakos',
    assignedTo: 'Dr. John Maina',
  },
  {
    id: 'SF-2135',
    farmName: 'Kamau Farm',
    blockId: 'Block C',
    farmerName: 'James Kamau',
    severity: 'high',
    source: 'app',
    finding: 'False Codling Moth Detected',
    status: 'detected',
    mediaPreview: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=100&h=100&fit=crop',
    timestamp: '12 Mar, 09:05',
    reviewed: 'new',
    county: 'Kiambu',
    assignedTo: 'Dr. James Kariuki',
  },
  {
    id: 'SF-2134',
    farmName: 'Njoroge Orchards',
    blockId: 'Block M-07',
    farmerName: 'Anne Njoroge',
    severity: 'medium',
    source: 'ussd',
    finding: 'Anthracnose Detected',
    status: 'detected',
    ussdCode: '*103',
    timestamp: '11 Mar, 16:40',
    reviewed: 'new',
    county: 'Nyeri',
  },
];

type FilterType = 'all' | 'needs-review' | 'my-assigned' | 'ussd';

export function ScoutingReports() {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<ScoutingFeedItem | null>(null);
  const [createCaseModalItem, setCreateCaseModalItem] = useState<ScoutingFeedItem | null>(null);

  // Current user (for "My Assigned" filter)
  const currentUser = 'Dr. James Kariuki';

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(filteredFeed.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleMarkAsReviewed = () => {
    const needsReviewCount = scoutingFeed.filter(item => item.reviewed === 'new').length;
    console.log('Marking items as reviewed');
    alert(`Marked ${needsReviewCount} submission(s) as reviewed`);
  };

  const handleCreateCase = (itemId: string) => {
    console.log('Creating case for:', itemId);
    alert(`Creating case for submission ${itemId}...`);
  };

  const handleReview = (itemId: string) => {
    console.log('Reviewing:', itemId);
    alert(`Opening review for submission ${itemId}...`);
  };

  // Apply filters
  const filteredFeed = scoutingFeed.filter((item) => {
    // Filter by status/source/assignment
    if (activeFilter === 'needs-review' && item.reviewed !== 'new') return false;
    if (activeFilter === 'my-assigned' && item.assignedTo !== currentUser) return false;
    if (activeFilter === 'ussd' && item.source !== 'ussd') return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.farmerName.toLowerCase().includes(query) ||
        item.blockId.toLowerCase().includes(query) ||
        item.farmName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const allCount = scoutingFeed.length;
  const needsReviewCount = scoutingFeed.filter(item => item.reviewed === 'new').length;
  const myAssignedCount = scoutingFeed.filter(item => item.assignedTo === currentUser).length;
  const ussdCount = scoutingFeed.filter(item => item.source === 'ussd').length;

  return (
    <Layout>
      <div
        className="sticky top-0 z-[8] -mx-3 mb-2 border-b border-[#E0DDD6] bg-[#F7F4EF] pb-2 sm:-mx-5"
      >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h1 
            className="mb-1 text-2xl sm:text-3xl" 
            style={{ 
              fontFamily: 'DM Serif Display, serif',
              color: '#1B4332'
            }}
          >
            Scouting Feed
          </h1>
          <p className="text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Real-time field submissions from farmers and scouts
          </p>
        </div>

        {/* Mark as Reviewed Button - Only show when items are selected */}
        {selectedItems.length > 0 && (
          <button
            onClick={handleMarkAsReviewed}
            className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            <CheckCircle className="w-4 h-4" />
            Mark {selectedItems.length} as Reviewed
          </button>
        )}
      </div>

      {/* Filter Chips and Search */}
      <div className="mb-2">
        <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: activeFilter === 'all' ? '#2D6A4F' : '#FFFFFF',
                color: activeFilter === 'all' ? '#FFFFFF' : '#1B4332',
                border: activeFilter === 'all' ? 'none' : '1px solid #E0DDD6',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              All ({allCount})
            </button>

            <button
              onClick={() => setActiveFilter('needs-review')}
              className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeFilter === 'needs-review' ? '#C0392B' : '#FFFFFF',
                color: activeFilter === 'needs-review' ? '#FFFFFF' : '#C0392B',
                border: activeFilter === 'needs-review' ? 'none' : '1px solid #C0392B',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Needs Review ({needsReviewCount})
            </button>

            <button
              onClick={() => setActiveFilter('my-assigned')}
              className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeFilter === 'my-assigned' ? '#2D6A4F' : '#FFFFFF',
                color: activeFilter === 'my-assigned' ? '#FFFFFF' : '#2D6A4F',
                border: activeFilter === 'my-assigned' ? 'none' : '1px solid #2D6A4F',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              My Assigned ({myAssignedCount})
            </button>

            <button
              onClick={() => setActiveFilter('ussd')}
              className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeFilter === 'ussd' ? '#D97706' : '#FFFFFF',
                color: activeFilter === 'ussd' ? '#FFFFFF' : '#D97706',
                border: activeFilter === 'ussd' ? 'none' : '1px solid #D97706',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <Phone className="w-4 h-4" />
              USSD Submissions ({ussdCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 basis-full sm:ml-auto sm:basis-auto sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#717182' }} />
            <input
              type="text"
              placeholder="Search by Farmer Name or Block ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                borderRadius: '8px',
                color: '#1B4332',
              }}
            />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Showing {filteredFeed.length} submission{filteredFeed.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div 
          className="mb-2 flex items-center justify-between rounded-lg border p-3"
          style={{ 
            backgroundColor: '#2D6A4F', 
            borderColor: '#2D6A4F', 
            borderRadius: '8px',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#FFFFFF', fontWeight: '600' }}>
              {selectedItems.length} selected
            </span>
          </div>
          <button
            onClick={handleMarkAsReviewed}
            className="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#2D6A4F',
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Mark {selectedItems.length} Selected as Reviewed
          </button>
        </div>
      )}
      </div>

      {/* Feed List */}
      <div className="space-y-2">
        {/* Column Headers */}
        <div 
          className="flex items-center rounded-lg border"
          style={{ 
            backgroundColor: '#F7F4EF', 
            borderColor: '#E0DDD6', 
            borderRadius: '8px',
          }}
        >
          {/* Checkbox column */}
          <div className="py-2 pl-5 pr-4">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredFeed.length && filteredFeed.length > 0}
              onChange={handleSelectAll}
              style={{ accentColor: '#2D6A4F' }}
            />
          </div>

          {/* Source column */}
          <div className="w-24 px-3 py-2">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Source
            </span>
          </div>

          {/* Farmer & Location column */}
          <div className="flex-1 px-4 py-2">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Farmer & Location
            </span>
          </div>

          {/* Finding column */}
          <div className="w-48 px-4 py-2">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Finding
            </span>
          </div>

          {/* Media column */}
          <div className="w-20 px-4 py-2 text-center">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Media/Code
            </span>
          </div>

          {/* Time column */}
          <div className="w-32 px-4 py-2 sm:px-6">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Time
            </span>
          </div>

          {/* Status column */}
          <div className="w-48 px-4 py-2 sm:px-6">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Status
            </span>
          </div>
        </div>

        {/* Feed Items */}
        {filteredFeed.map((item) => {
          const severityColors = {
            high: '#C0392B',
            medium: '#D97706',
            low: '#74C69D',
          };

          const reviewStatusConfig = {
            'new': { label: 'New', bg: '#FEE2E2', text: '#C0392B' },
            'under-review': { label: 'Under Review', bg: '#FEF3C7', text: '#D97706' },
            'reviewed': { label: 'Reviewed', bg: '#DCFCE7', text: '#15803D' },
          };

          const statusConfig = reviewStatusConfig[item.reviewed];
          const isHovered = hoveredItem === item.id;

          return (
            <div 
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="flex items-center rounded-lg border transition-all hover:shadow-md overflow-hidden relative"
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#E0DDD6', 
                borderRadius: '8px',
              }}
            >
              {/* Severity Indicator Bar */}
              <div 
                className="w-1 h-full self-stretch absolute left-0"
                style={{ backgroundColor: severityColors[item.severity] }}
              />

              {/* Checkbox */}
              <div className="pl-5 pr-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  style={{ accentColor: '#2D6A4F' }}
                />
              </div>

              {/* Source Badge */}
              <div className="px-3">
                {item.source === 'app' ? (
                  <div
                    className="px-3 py-1 rounded-lg flex items-center gap-1"
                    style={{
                      backgroundColor: '#DBEAFE',
                      borderRadius: '8px',
                    }}
                  >
                    <Smartphone className="w-3 h-3" style={{ color: '#1E40AF' }} />
                    <span 
                      className="text-xs whitespace-nowrap"
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#1E40AF',
                        fontWeight: '600',
                      }}
                    >
                      App
                    </span>
                  </div>
                ) : (
                  <div
                    className="px-3 py-1 rounded-lg flex items-center gap-1"
                    style={{
                      backgroundColor: '#FEF3C7',
                      borderRadius: '8px',
                    }}
                  >
                    <Phone className="w-3 h-3" style={{ color: '#D97706' }} />
                    <span 
                      className="text-xs whitespace-nowrap"
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#D97706',
                        fontWeight: '600',
                      }}
                    >
                      USSD
                    </span>
                  </div>
                )}
              </div>

              {/* Farmer Info */}
              <div className="flex-1 px-3 py-2 sm:px-4">
                <div className="flex items-center gap-2 mb-1">
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {item.farmName} - {item.blockId}
                  </p>
                </div>
                <p 
                  className="text-xs"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif', 
                    color: '#717182',
                  }}
                >
                  {item.farmerName} • {item.county}
                </p>
              </div>

              {/* Finding Summary */}
              <div className="px-3 py-2 sm:px-4">
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif', 
                    color: item.status === 'clean' ? '#15803D' : '#C0392B',
                    fontWeight: '600',
                  }}
                >
                  {item.status === 'clean' ? item.finding : `${item.finding} Detected`}
                </p>
              </div>

              {/* Media/Data Preview */}
              <div className="px-3 py-2 sm:px-4">
                {item.source === 'app' && item.mediaPreview ? (
                  <div className="relative">
                    <img 
                      src={item.mediaPreview} 
                      alt="Preview" 
                      className="w-10 h-10 rounded object-cover border"
                      style={{ borderColor: '#E0DDD6' }}
                    />
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#1E40AF' }}
                    >
                      <ImageIcon className="w-2 h-2" style={{ color: '#FFFFFF' }} />
                    </div>
                  </div>
                ) : item.ussdCode ? (
                  <div
                    className="px-3 py-2 rounded"
                    style={{
                      backgroundColor: '#FEF3C7',
                      borderRadius: '4px',
                    }}
                  >
                    <span 
                      className="text-xs"
                      style={{ 
                        fontFamily: 'IBM Plex Mono, monospace', 
                        color: '#D97706',
                        fontWeight: '600',
                      }}
                    >
                      Code {item.ussdCode}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Timestamp */}
              <div className="px-3 py-2 sm:px-6">
                <p 
                  className="text-xs whitespace-nowrap"
                  style={{ 
                    fontFamily: 'IBM Plex Mono, monospace', 
                    color: '#717182',
                  }}
                >
                  {item.timestamp}
                </p>
              </div>

              {/* Review Status Badge OR Action Buttons on Hover */}
              <div className="min-w-[180px] px-3 py-2 sm:px-6">
                {isHovered && item.reviewed === 'new' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCreateCaseModalItem(item)}
                      className="px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50 text-xs flex items-center gap-1"
                      style={{
                        borderColor: '#2D6A4F',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Create Case
                    </button>
                    <button
                      onClick={() => setReviewModalItem(item)}
                      className="px-3 py-1 rounded-lg transition-colors hover:opacity-90 text-xs flex items-center gap-1"
                      style={{
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Review
                    </button>
                  </div>
                ) : (
                  <span
                    className="px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit"
                    style={{
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.text,
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {statusConfig.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFeed.length === 0 && (
        <div 
          className="p-12 rounded-lg border text-center"
          style={{ 
            backgroundColor: '#FFFFFF', 
            borderColor: '#E0DDD6', 
            borderRadius: '8px',
          }}
        >
          <p 
            className="text-lg mb-2"
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif', 
              color: '#1B4332',
              fontWeight: '600',
            }}
          >
            No submissions found
          </p>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setReviewModalItem(null)}
        >
          <div 
            className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-6 border-b flex items-center justify-between"
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
                  Review Submission
                </h2>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {reviewModalItem.farmName} - {reviewModalItem.blockId}
                </p>
              </div>
              <button
                onClick={() => setReviewModalItem(null)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#717182' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p 
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Farmer
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {reviewModalItem.farmerName}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    County
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {reviewModalItem.county}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Submission Source
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {reviewModalItem.source === 'app' ? 'Mobile App' : `USSD ${reviewModalItem.ussdCode}`}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Timestamp
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'IBM Plex Mono, monospace', 
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {reviewModalItem.timestamp}
                  </p>
                </div>
              </div>

              {/* Finding */}
              <div className="mb-6">
                <p 
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Finding
                </p>
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: reviewModalItem.status === 'clean' ? '#DCFCE7' : '#FEE2E2',
                    borderRadius: '8px',
                  }}
                >
                  <p 
                    className="text-lg"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: reviewModalItem.status === 'clean' ? '#15803D' : '#C0392B',
                      fontWeight: '600',
                    }}
                  >
                    {reviewModalItem.status === 'clean' ? reviewModalItem.finding : `${reviewModalItem.finding} Detected`}
                  </p>
                </div>
              </div>

              {/* Media Preview */}
              {reviewModalItem.source === 'app' && reviewModalItem.mediaPreview && (
                <div className="mb-6">
                  <p 
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Photo Evidence
                  </p>
                  <img 
                    src={reviewModalItem.mediaPreview} 
                    alt="Field evidence" 
                    className="w-full rounded-lg border"
                    style={{ 
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      maxHeight: '400px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* Review Notes */}
              <div className="mb-6">
                <label 
                  className="block text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Review Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Add your review notes here..."
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    borderRadius: '8px',
                    color: '#1B4332',
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="p-6 border-t flex items-center justify-between"
              style={{ borderColor: '#E0DDD6' }}
            >
              <button
                onClick={() => setReviewModalItem(null)}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCreateCaseModalItem(reviewModalItem);
                    setReviewModalItem(null);
                  }}
                  className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: '#2D6A4F',
                    color: '#2D6A4F',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Create Case
                </button>
                <button
                  onClick={() => {
                    console.log('Marking as reviewed:', reviewModalItem.id);
                    alert(`Submission ${reviewModalItem.id} marked as reviewed`);
                    setReviewModalItem(null);
                  }}
                  className="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {createCaseModalItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setCreateCaseModalItem(null)}
        >
          <div 
            className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-6 border-b flex items-center justify-between"
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
                  Create New Case
                </h2>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  From submission: {createCaseModalItem.id}
                </p>
              </div>
              <button
                onClick={() => setCreateCaseModalItem(null)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#717182' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Pre-filled Information */}
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ 
                  backgroundColor: '#F7F4EF',
                  borderRadius: '8px',
                }}
              >
                <p 
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Submission Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Farmer:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {createCaseModalItem.farmerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Location:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {createCaseModalItem.farmName} - {createCaseModalItem.blockId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Finding:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B', fontWeight: '600' }}>
                      {createCaseModalItem.finding}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Severity:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {createCaseModalItem.severity.charAt(0).toUpperCase() + createCaseModalItem.severity.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Details Form */}
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Case Title
                  </label>
                  <input
                    type="text"
                    defaultValue={`${createCaseModalItem.finding} - ${createCaseModalItem.farmName}`}
                    className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Assign To
                  </label>
                  <select
                    defaultValue="Dr. James Kariuki"
                    className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  >
                    <option>Dr. James Kariuki</option>
                    <option>Dr. Sarah Mwangi</option>
                    <option>Dr. John Maina</option>
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Priority
                  </label>
                  <select
                    defaultValue={createCaseModalItem.severity}
                    className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label 
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Initial Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add initial observations or recommendations..."
                    className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="p-6 border-t flex items-center justify-between"
              style={{ borderColor: '#E0DDD6' }}
            >
              <button
                onClick={() => setCreateCaseModalItem(null)}
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
                  const caseTitle = `${createCaseModalItem.finding} - ${createCaseModalItem.farmName}`;
                  console.log('Creating case:', caseTitle);
                  alert(`Case created: ${caseTitle}\n\nRedirecting to Case Management...`);
                  setCreateCaseModalItem(null);
                  navigate('/cases');
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
                <Plus className="w-4 h-4" />
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}