import { Layout } from '../components/Layout';
import { Search, Smartphone, Phone, CheckCircle, AlertCircle, Image as ImageIcon, Plus, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { ScoutingFeedItem } from '../api/types';
import { fetchScoutingFeed, getPlaceholderCurrentAgronomist } from '../api/placeholderApi';
import { AppToast } from '../components/AppToast';

type FilterType = 'all' | 'needs-review' | 'my-assigned' | 'ussd';

export function ScoutingReports() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<ScoutingFeedItem | null>(null);
  const [createCaseModalItem, setCreateCaseModalItem] = useState<ScoutingFeedItem | null>(null);
  const [feed, setFeed] = useState<ScoutingFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const currentUser = getPlaceholderCurrentAgronomist();

  useEffect(() => {
    fetchScoutingFeed()
      .then(setFeed)
      .catch(() => setFeed([]))
      .finally(() => setFeedLoading(false));
  }, []);

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
    if (selectedItems.length === 0) return;
    const n = selectedItems.length;
    setFeed((f) =>
      f.map((item) =>
        selectedItems.includes(item.id) ? { ...item, reviewed: 'reviewed' as const } : item
      )
    );
    setSelectedItems([]);
    setToastMessage(`${n} submission(s) marked as reviewed.`);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  const markSingleReviewed = (itemId: string) => {
    setFeed((f) =>
      f.map((item) => (item.id === itemId ? { ...item, reviewed: 'reviewed' as const } : item))
    );
  };

  // Apply filters
  const filteredFeed = feed.filter((item) => {
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

  const allCount = feed.length;
  const needsReviewCount = feed.filter((item) => item.reviewed === 'new').length;
  const myAssignedCount = feed.filter((item) => item.assignedTo === currentUser).length;
  const ussdCount = feed.filter((item) => item.source === 'ussd').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  if (feedLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-slate-200 rounded w-2/3 max-w-md" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 rounded-lg w-28" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {toastMessage && (
        <AppToast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 
            className="text-4xl mb-2" 
            style={{ 
              fontFamily: 'DM Serif Display, serif',
              color: '#1B4332'
            }}
          >
            Scouting Feed
          </h1>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
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
          <div className="ml-auto relative flex-1 max-w-md">
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
          className="mb-6 p-4 rounded-lg border flex items-center justify-between"
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

      {/* Feed List */}
      <div className="space-y-3">
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
          <div className="pl-5 pr-4 py-3">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredFeed.length && filteredFeed.length > 0}
              onChange={handleSelectAll}
              style={{ accentColor: '#2D6A4F' }}
            />
          </div>

          {/* Source column */}
          <div className="px-3 py-3 w-24">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Source
            </span>
          </div>

          {/* Farmer & Location column */}
          <div className="flex-1 px-4 py-3">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Farmer & Location
            </span>
          </div>

          {/* Finding column */}
          <div className="px-4 py-3 w-48">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Finding
            </span>
          </div>

          {/* Media column */}
          <div className="px-4 py-3 w-20 text-center">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Media/Code
            </span>
          </div>

          {/* Time column */}
          <div className="px-6 py-3 w-32">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Time
            </span>
          </div>

          {/* Status column */}
          <div className="px-6 py-3 w-48">
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
              <div className="flex-1 px-4 py-4">
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
              <div className="px-4 py-4">
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
              <div className="px-4 py-4">
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
              <div className="px-6 py-4">
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
              <div className="px-6 py-4 min-w-[180px]">
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
                    markSingleReviewed(reviewModalItem.id);
                    showToast(`Submission ${reviewModalItem.id} marked as reviewed.`);
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
                  const id = createCaseModalItem.id;
                  markSingleReviewed(id);
                  setCreateCaseModalItem(null);
                  showToast(`Case draft created from ${id}. Open Case Management to continue.`);
                  navigate('/case-management');
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