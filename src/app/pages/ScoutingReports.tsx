import { Search, Smartphone, Phone, CheckCircle, AlertCircle, Image as ImageIcon, Plus, Eye, X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { OptimizedImage } from '../components/OptimizedImage';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import type { SeverityLevel } from '../api/types';
import { getApiErrorMessage } from '../api/errors';
import { fetchScoutingReports, type ScoutingReport } from '../api/scoutingApi';
import { createCase } from '../api/caseApi';
import { getAuthUser } from '../auth';
import { FarmerScoutingReports } from './FarmerScoutingReports';

type FilterType = 'all' | 'needs-review' | 'my-assigned' | 'ussd';

/** Feed emphasizes the registered farmer (person), not the orchard/holding trade name. */
function scoutingPrimaryName(item: ScoutingReport): string {
  return item.farmerName?.trim() || 'Farmer';
}

function scoutingBlockAndCounty(item: ScoutingReport): string {
  const block = item.blockId?.trim();
  const county = item.county?.trim();
  const parts: string[] = [];
  if (block) parts.push(`Block ${block}`);
  if (county) parts.push(county);
  return parts.join(' • ') || '—';
}

/** Optional orchard/holding label — only when it adds detail beyond the farmer name. */
function scoutingHoldingNote(item: ScoutingReport): string | null {
  const h = item.farmName?.trim();
  if (!h || h === item.farmerName?.trim()) return null;
  return h;
}

export function ScoutingReports() {
  if (getAuthUser()?.role_details?.role_name === 'Farmer') {
    return <FarmerScoutingReports />;
  }

  const navigate = useNavigate();
  const [scoutingFeed, setScoutingFeed] = useState<ScoutingReport[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [createCaseModalItem, setCreateCaseModalItem] = useState<ScoutingReport | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<ScoutingReport | null>(null);
  const [createCaseTitle, setCreateCaseTitle] = useState('');
  const [createCaseSeverity, setCreateCaseSeverity] = useState<SeverityLevel>('medium');
  const [createCaseNotes, setCreateCaseNotes] = useState('');
  const [assignCaseToMe, setAssignCaseToMe] = useState(true);
  const [createCaseError, setCreateCaseError] = useState<string | null>(null);
  const [createCaseSubmitting, setCreateCaseSubmitting] = useState(false);
  const [createCaseSuccess, setCreateCaseSuccess] = useState<string | null>(null);

  const authUser = getAuthUser();
  const isAgronomistUser = authUser?.role_details?.role_name === 'Agronomist';

  useEffect(() => {
    if (!createCaseModalItem) {
      setCreateCaseError(null);
      setCreateCaseSubmitting(false);
      setCreateCaseSuccess(null);
      return;
    }
    setCreateCaseTitle(
      `${createCaseModalItem.finding} — ${scoutingPrimaryName(createCaseModalItem)}`.trim()
    );
    const sev = createCaseModalItem.severity;
    setCreateCaseSeverity(sev === 'high' || sev === 'low' || sev === 'medium' ? sev : 'medium');
    setCreateCaseNotes('');
    setAssignCaseToMe(true);
  }, [createCaseModalItem]);

  const submitCreateCase = useCallback(async () => {
    const item = createCaseModalItem;
    if (!item) return;
    const title = createCaseTitle.trim();
    if (!title) {
      setCreateCaseError('Enter a case title (pest / issue).');
      return;
    }
    setCreateCaseSubmitting(true);
    setCreateCaseError(null);
    setCreateCaseSuccess(null);
    try {
      await createCase({
        scouting_record_id: item.id,
        case_title: title,
        severity: createCaseSeverity as any,
        notes: createCaseNotes.trim() || '',
        agronomist_id: authUser?.id || '',
      });
      setCreateCaseSuccess('Case created successfully!');
      setTimeout(() => {
        setCreateCaseModalItem(null);
        setCreateCaseSuccess(null);
      }, 2000);
    } catch (e: unknown) {
      setCreateCaseError(getApiErrorMessage(e, 'Could not create case.'));
    } finally {
      setCreateCaseSubmitting(false);
    }
  }, [
    createCaseModalItem,
    createCaseTitle,
    createCaseSeverity,
    createCaseNotes,
    authUser?.id,
  ]);

  const currentUser = useMemo(() => {
    const u = authUser;
    if (!u) return '';
    const name = `${u.first_name} ${u.last_name}`.trim();
    return name || u.phone_number || '';
  }, [authUser]);

  const loadReports = useCallback(async () => {
    setLoadingFeed(true);
    setLoadError(null);
    try {
      const data = await fetchScoutingReports({
        page,
        page_size: pageSize,
        search: searchQuery || undefined,
      });
      setScoutingFeed(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
    } catch (e: unknown) {
      setLoadError(getApiErrorMessage(e, 'Could not load scouting reports.'));
    } finally {
      setLoadingFeed(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadReports]);

  const filteredFeed = useMemo(() => {
    return scoutingFeed.filter((item) => {
      if (activeFilter === 'needs-review' && item.reviewed !== 'new') return false;
      if (activeFilter === 'my-assigned') {
        const a = (item.assignedTo || '').trim();
        const me = currentUser.trim();
        if (!me || a !== me) return false;
      }
      if (activeFilter === 'ussd' && item.source !== 'ussd') return false;
      return true;
    });
  }, [scoutingFeed, activeFilter, currentUser]);

  const allCount = scoutingFeed.length;
  const needsReviewCount = useMemo(
    () => scoutingFeed.filter((item) => item.reviewed === 'new').length,
    [scoutingFeed]
  );
  const myAssignedCount = useMemo(
    () =>
      scoutingFeed.filter((item) => (item.assignedTo || '').trim() === currentUser.trim() && currentUser.trim() !== '')
        .length,
    [scoutingFeed, currentUser]
  );
  const ussdCount = useMemo(
    () => scoutingFeed.filter((item) => item.source === 'ussd').length,
    [scoutingFeed]
  );

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
    alert(`Marked ${selectedItems.length} submission(s) as reviewed (API batch review not wired yet).`);
  };

  const handleCreateCase = (itemId: string) => {
    console.log('Creating case for:', itemId);
    alert(`Creating case for submission ${itemId}...`);
  };

  const handleReview = (item: ScoutingReport) => {
    setReviewModalItem(item);
  };

  if (loadError) {
    return (
      <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
        <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{loadError}</p>
      </div>
    );
  }

  if (loadingFeed) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-10 bg-slate-200 rounded w-64" />
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  return (
    <>
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
        <div className="mb-4 flex flex-col gap-4 sm:mb-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {/* Filter Chips — wrap on narrow screens; no clipped row */}
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
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
          <div className="relative min-h-[44px] w-full min-w-0 flex-1 sm:ml-auto sm:max-w-md sm:basis-auto">
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
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Showing {filteredFeed.length} of {totalCount} submission{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
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

      {/* Feed List — stacked cards on mobile; table-style row from lg */}
      <div className="min-w-0 space-y-2 lg:-mx-1 lg:touch-pan-x lg:overflow-x-auto lg:px-1">
        <div className="min-w-0 space-y-2 lg:min-w-[900px]">
        {/* Select all — mobile only (desktop uses column header row) */}
        <div
          className="mb-1 flex items-center gap-3 rounded-lg border p-2 lg:hidden"
          style={{
            backgroundColor: '#F7F4EF',
            borderColor: '#E0DDD6',
            borderRadius: '8px',
          }}
        >
          <input
            type="checkbox"
            checked={selectedItems.length === filteredFeed.length && filteredFeed.length > 0}
            onChange={handleSelectAll}
            style={{ accentColor: '#2D6A4F' }}
          />
          <span
            className="text-xs"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
          >
            Select all visible
          </span>
        </div>
        {/* Column Headers (desktop / large tablet only) */}
        <div 
          className="hidden items-center rounded-lg border lg:flex"
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

          const sourceBadge =
            item.source === 'app' ? (
              <div
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1"
                style={{
                  backgroundColor: '#DBEAFE',
                  borderRadius: '8px',
                }}
              >
                <Smartphone className="h-3 w-3" style={{ color: '#1E40AF' }} />
                <span
                  className="whitespace-nowrap text-xs"
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
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1"
                style={{
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px',
                }}
              >
                <Phone className="h-3 w-3" style={{ color: '#D97706' }} />
                <span
                  className="whitespace-nowrap text-xs"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#D97706',
                    fontWeight: '600',
                  }}
                >
                  USSD
                </span>
              </div>
            );

          const findingText =
            item.status === 'clean' ? item.finding : `${item.finding} Detected`;

          const mediaBlock =
            item.source === 'app' && item.mediaPreview ? (
              <div className="relative shrink-0">
                <OptimizedImage
                  src={item.mediaPreview}
                  alt="Scouting preview"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded border object-cover"
                  style={{ borderColor: '#E0DDD6' }}
                />
                <div
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#1E40AF' }}
                >
                  <ImageIcon className="h-2 w-2" style={{ color: '#FFFFFF' }} />
                </div>
              </div>
            ) : item.ussdCode ? (
              <div
                className="rounded px-3 py-2"
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
            ) : null;

          const statusOrActionsDesktop =
            isHovered && item.reviewed === 'new' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreateCaseModalItem(item)}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1 text-xs transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: '#2D6A4F',
                    color: '#2D6A4F',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Create Case
                </button>
                <button
                  onClick={() => handleReview(item)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  <Eye className="h-3 w-3" />
                  Review
                </button>
              </div>
            ) : (
              <span
                className="flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs"
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
            );

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative overflow-hidden rounded-lg border transition-all hover:shadow-md"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div
                className="absolute bottom-0 left-0 top-0 w-1"
                style={{ backgroundColor: severityColors[item.severity] }}
              />

              {/* Mobile: stacked card (no horizontal clip) */}
              <div className="min-w-0 space-y-3 p-3 pl-4 lg:hidden">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="shrink-0"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    {sourceBadge}
                  </div>
                  <p
                    className="shrink-0 text-xs whitespace-nowrap"
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      color: '#717182',
                    }}
                  >
                    {item.timestamp}
                  </p>
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm break-words"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#1B4332',
                      fontWeight: '600',
                    }}
                  >
                    {scoutingPrimaryName(item)}
                  </p>
                  <p
                    className="mt-0.5 text-xs break-words"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#717182',
                    }}
                  >
                    {scoutingBlockAndCounty(item)}
                    {scoutingHoldingNote(item) ? (
                      <span className="block text-[11px] text-[#9ca3af] mt-0.5">
                        Holding: {scoutingHoldingNote(item)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <p
                  className="text-sm break-words"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: item.status === 'clean' ? '#15803D' : '#C0392B',
                    fontWeight: '600',
                  }}
                >
                  {findingText}
                </p>
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                  {mediaBlock}
                  {item.reviewed !== 'new' ? (
                    <span
                      className="ml-auto flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs"
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
                  ) : null}
                </div>
                {item.reviewed === 'new' ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      onClick={() => setCreateCaseModalItem(item)}
                      className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-gray-50 sm:flex-none"
                      style={{
                        borderColor: '#2D6A4F',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Create Case
                    </button>
                    <button
                      onClick={() => handleReview(item)}
                      className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors hover:opacity-90 sm:flex-none"
                      style={{
                        backgroundColor: '#2D6A4F',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      Review
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Desktop: original table-style row */}
              <div className="relative hidden items-center lg:flex">
                <div className="pl-5 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    style={{ accentColor: '#2D6A4F' }}
                  />
                </div>
                <div className="px-3">{sourceBadge}</div>
                <div className="flex-1 px-3 py-2 sm:px-4">
                  <div className="mb-1 flex items-center gap-2">
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        color: '#1B4332',
                        fontWeight: '600',
                      }}
                    >
                      {scoutingPrimaryName(item)}
                    </p>
                  </div>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#717182',
                    }}
                  >
                    {scoutingBlockAndCounty(item)}
                  </p>
                  {scoutingHoldingNote(item) ? (
                    <p
                      className="text-[11px] mt-0.5"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        color: '#9ca3af',
                      }}
                    >
                      Holding: {scoutingHoldingNote(item)}
                    </p>
                  ) : null}
                </div>
                <div className="px-3 py-2 sm:px-4">
                  <p
                    className="mb-1 text-sm"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: item.status === 'clean' ? '#15803D' : '#C0392B',
                      fontWeight: '600',
                    }}
                  >
                    {findingText}
                  </p>
                </div>
                <div className="px-3 py-2 sm:px-4">{mediaBlock}</div>
                <div className="px-3 py-2 sm:px-6">
                  <p
                    className="whitespace-nowrap text-xs"
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      color: '#717182',
                    }}
                  >
                    {item.timestamp}
                  </p>
                </div>
                <div className="min-w-[180px] px-3 py-2 sm:px-6">{statusOrActionsDesktop}</div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#E0DDD6] pt-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => {
                    setPageSize(parseInt(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] border-[#E0DDD6] bg-white text-[#1B4332]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>per page</span>
              </div>

              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Showing <span className="font-semibold text-[#1B4332]">{(page - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-[#1B4332]">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                <span className="font-semibold text-[#1B4332]">{totalCount}</span> results
              </p>
            </div>

            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasPrevious) setPage(p => p - 1);
                    }}
                    className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {/* Simple page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                  const pageNum = i + 1;
                  // This is a simple version, ideally it should center around current page
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={page === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {Math.ceil(totalCount / pageSize) > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasNext) setPage(p => p + 1);
                    }}
                    className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
                  {scoutingPrimaryName(reviewModalItem)} · {scoutingBlockAndCounty(reviewModalItem)}
                  {scoutingHoldingNote(reviewModalItem) ? ` · ${scoutingHoldingNote(reviewModalItem)}` : ''}
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
                  <OptimizedImage
                    src={reviewModalItem.mediaPreview}
                    alt="Field evidence"
                    priority
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
                      Block and county:
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                      {scoutingBlockAndCounty(createCaseModalItem)}
                    </p>
                    {scoutingHoldingNote(createCaseModalItem) ? (
                      <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#9ca3af' }}>
                        Holding: {scoutingHoldingNote(createCaseModalItem)}
                      </p>
                    ) : null}
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
                    Case title (pest / issue)
                  </label>
                  <input
                    type="text"
                    value={createCaseTitle}
                    onChange={(e) => setCreateCaseTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      borderRadius: '8px',
                      color: '#1B4332',
                    }}
                  />
                </div>

                {isAgronomistUser ? (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={assignCaseToMe}
                      onChange={(e) => setAssignCaseToMe(e.target.checked)}
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                      Assign this case to me
                    </span>
                  </label>
                ) : null}

                <div>
                  <label 
                    className="block text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    Severity
                  </label>
                  <select
                    value={createCaseSeverity}
                    onChange={(e) => setCreateCaseSeverity(e.target.value as SeverityLevel)}
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
                    Initial notes
                  </label>
                  <textarea
                    rows={4}
                    value={createCaseNotes}
                    onChange={(e) => setCreateCaseNotes(e.target.value)}
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
              className="p-6 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: '#E0DDD6' }}
            >
              {createCaseError ? (
                <p className="text-sm sm:order-first sm:flex-1" style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  {createCaseError}
                </p>
              ) : null}
              {createCaseSuccess ? (
                <p className="text-sm sm:order-first sm:flex-1" style={{ color: '#15803D', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  {createCaseSuccess}
                </p>
              ) : null}
              <div className="flex w-full justify-end gap-2 sm:w-auto">
              <button
                type="button"
                disabled={createCaseSubmitting}
                onClick={() => setCreateCaseModalItem(null)}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-50"
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
                type="button"
                disabled={createCaseSubmitting || !createCaseTitle.trim()}
                onClick={() => void submitCreateCase()}
                className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                <Plus className="w-4 h-4" />
                {createCaseSubmitting ? 'Creating…' : 'Create Case'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}