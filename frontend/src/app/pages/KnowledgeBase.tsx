import { BookOpen, Search, CheckCircle2, Lock, Unlock, AlertTriangle, TrendingUp, Code, Leaf, Beaker, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ussdSymptomCodesLookup,
} from '../data/knowledgeBase';
import { getApiErrorMessage } from '../api/errors';
import { fetchKnowledgeEntries, type KnowledgeEntryDto } from '../api/realApi';

type UiArticle = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  lastUpdated: string;
  views: number;
  severity: string;
  activeUses: number;
  approvedContent: boolean;
  ussdCode: string | null;
  chemicalGate: string;
  ipmLevel: number;
};

export function KnowledgeBase() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [articles, setArticles] = useState<UiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchKnowledgeEntries(searchTerm)
      .then((rows) => {
        if (cancelled) return;
        const mapped: UiArticle[] = rows.map((entry: KnowledgeEntryDto) => {
          const activeUseNumber = Number(String(entry.active_use_cases ?? '').match(/\d+/)?.[0] ?? 0);
          const cleanGate = String(entry.chemical_gate ?? '').toLowerCase();
          const gate = cleanGate === 'gated' ? 'gated' : 'open';
          return {
            id: entry.id,
            title: entry.title,
            category: entry.category_name || 'Knowledge',
            tags: Array.isArray(entry.tags) ? entry.tags : [],
            summary: (entry.content || '').slice(0, 180) + ((entry.content || '').length > 180 ? '...' : ''),
            lastUpdated: entry.last_updated ? new Date(entry.last_updated).toLocaleDateString() : '-',
            views: Number(entry.views ?? 0),
            severity: String(entry.severity ?? 'medium').toLowerCase(),
            activeUses: activeUseNumber,
            approvedContent: Boolean(entry.approved_content),
            ussdCode: null,
            chemicalGate: gate,
            ipmLevel: gate === 'gated' ? 3 : 2,
          };
        });
        setArticles(mapped);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(getApiErrorMessage(e, 'Could not load knowledge base entries.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: '#DC262620', text: '#DC2626', border: '#DC2626' };
      case 'medium':
        return { bg: '#D9770620', text: '#D97706', border: '#D97706' };
      case 'low':
        return { bg: '#74C69D20', text: '#2D6A4F', border: '#2D6A4F' };
      default:
        return { bg: '#E0DDD6', text: '#717182', border: '#717182' };
    }
  };

  const getIPMLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Leaf className="w-4 h-4" />;
      case 2:
        return <Beaker className="w-4 h-4" />;
      case 3:
        return <Lock className="w-4 h-4" />;
      default:
        return <Leaf className="w-4 h-4" />;
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const catOk =
        selectedCategory === 'All Articles' || article.category === selectedCategory;
      if (!catOk) return false;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q)) ||
        article.id.toLowerCase().includes(q)
      );
    });
  }, [articles, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    }
    const dynamic = Array.from(counts.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, count: counts.get(name) ?? 0 }));
    return [{ name: 'All Articles', count: articles.length }, ...dynamic];
  }, [articles]);

  const ussdCodeRows = useMemo(
    () =>
      ussdSymptomCodesLookup.map((item) => (
        <div
          key={item.code}
          className="cursor-pointer rounded border p-2 transition-colors hover:bg-gray-50"
          style={{ borderColor: '#E0DDD6' }}
        >
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 rounded px-2 py-0.5 text-xs"
              style={{
                backgroundColor: '#1B4332',
                color: '#F7F4EF',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {item.code}
            </span>
            <div className="min-w-0">
              <p className="text-sm break-words" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {item.symptom}
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {item.category}
              </p>
            </div>
          </div>
        </div>
      )),
    [],
  );

  return (
    <>
      <header className="mb-4 md:mb-5">
        <h1 
          className="mb-1 text-2xl sm:text-3xl" 
          style={{ 
            fontFamily: 'DM Serif Display, serif',
            color: '#1B4332'
          }}
        >
          Knowledge Base
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Active decision-support tool for pest and disease advisory content
        </p>
      </header>

      {loadError ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {loadError}
        </div>
      ) : null}

      {/* Search with Symptom Feature */}
      <div className="mb-4 sm:mb-5">
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
            style={{ color: '#717182' }}
          />
          <input
            type="text"
            placeholder="Search by article, pest, disease, or symptom (e.g., 'holes in fruit')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#E0DDD6',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              color: '#1B4332'
            }}
          />
        </div>
      </div>

      {/* lg: 1 col sidebar + 3 col articles; below lg single column with articles first */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
        {/* Articles — order-1 on mobile so they appear before filters */}
        <div className="order-1 min-w-0 space-y-4 lg:order-2 lg:col-span-3">
          {loading ? (
            <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading articles...</p>
            </div>
          ) : null}
          {filteredArticles.length === 0 ? (
            <div
              className="rounded-lg border p-8 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                No articles match your filters
              </p>
              <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Try another category or clear the search.
              </p>
            </div>
          ) : null}
          {!loading &&
            filteredArticles.map((article) => {
            const severityStyle = getSeverityColor(article.severity);
            
            return (
              <div 
                key={article.id}
                onClick={() => navigate(`/knowledge-base/${article.id}`)}
                className="min-w-0 cursor-pointer rounded-lg border p-4 transition-all hover:border-opacity-100 hover:shadow-md sm:p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                }}
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div 
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg sm:mt-0.5"
                    style={{ backgroundColor: '#74C69D20' }}
                  >
                    <BookOpen className="h-6 w-6" style={{ color: '#2D6A4F' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3
                            className="min-w-0 text-base break-words sm:text-lg"
                            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                          >
                            {article.title}
                          </h3>
                          {article.approvedContent && (
                            <CheckCircle2 
                              className="h-4 w-4 shrink-0" 
                              style={{ color: '#2D6A4F' }}
                              title="Approved Content"
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: '#74C69D20',
                              color: '#2D6A4F',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            {article.category}
                          </span>
                          
                          {/* Severity Indicator */}
                          <span 
                            className="flex items-center gap-1 rounded border px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: severityStyle.bg,
                              color: severityStyle.text,
                              borderColor: severityStyle.border,
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            {article.severity.toUpperCase()} RISK
                          </span>

                          {/* Chemical Gate Status */}
                          <span 
                            className="flex items-center gap-1 rounded border px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: article.chemicalGate === 'gated' ? '#DC262620' : '#74C69D20',
                              color: article.chemicalGate === 'gated' ? '#DC2626' : '#2D6A4F',
                              borderColor: article.chemicalGate === 'gated' ? '#DC2626' : '#2D6A4F',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            {article.chemicalGate === 'gated' ? (
                              <Lock className="h-3 w-3 shrink-0" />
                            ) : (
                              <Unlock className="h-3 w-3 shrink-0" />
                            )}
                            {article.chemicalGate === 'gated' ? 'GATED' : 'OPEN'}
                          </span>

                          {/* IPM Level */}
                          <span 
                            className="flex items-center gap-1 rounded border px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: '#E0DDD6',
                              color: '#1B4332',
                              borderColor: '#E0DDD6',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            {getIPMLevelIcon(article.ipmLevel)}
                            IPM Level {article.ipmLevel}
                          </span>

                          {/* USSD Code */}
                          {article.ussdCode && (
                            <span 
                              className="flex items-center gap-1 rounded px-2 py-1 text-xs"
                              style={{ 
                                backgroundColor: '#1B4332',
                                color: '#F7F4EF',
                                fontFamily: 'IBM Plex Mono, monospace',
                                borderRadius: '4px',
                              }}
                            >
                              <Code className="h-3 w-3 shrink-0" />
                              {article.ussdCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded px-2 py-0.5 text-xs sm:ml-2"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', backgroundColor: '#F7F4EF' }}
                      >
                        {article.id}
                      </span>
                    </div>
                    <p
                      className="mb-3 text-sm leading-relaxed sm:text-base"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      {article.summary}
                    </p>
                    <div className="flex min-w-0 flex-col gap-3 border-t border-[#E0DDD6] pt-3 sm:flex-row sm:items-start sm:justify-between sm:border-0 sm:pt-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {article.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="rounded border px-2 py-1 text-xs"
                            style={{ 
                              borderColor: '#E0DDD6',
                              color: '#1B4332',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div
                        className="flex min-w-0 flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                      >
                        <span 
                          className="inline-flex w-fit max-w-full items-center gap-1 rounded px-2 py-1"
                          style={{ 
                            backgroundColor: '#74C69D20',
                            color: '#2D6A4F',
                          }}
                        >
                          <TrendingUp className="h-3 w-3 shrink-0" />
                          <span className="break-words">Used in {article.activeUses} active cases</span>
                        </span>
                        <span className="whitespace-nowrap">Updated {article.lastUpdated}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{article.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters sidebar — below articles on mobile; left column on lg */}
        <aside className="order-2 min-w-0 space-y-4 lg:order-1 lg:col-span-1">
          {/* Mobile: compact horizontal category chips */}
          <div
            className="rounded-lg border p-3 lg:hidden"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3
              className="mb-2 text-sm"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
            >
              Categories
            </h3>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className="shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: selectedCategory === category.name ? '#74C69D40' : '#FFFFFF',
                    borderColor: selectedCategory === category.name ? '#2D6A4F' : '#E0DDD6',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: selectedCategory === category.name ? '#2D6A4F' : '#1B4332',
                    fontWeight: selectedCategory === category.name ? 600 : 400,
                  }}
                >
                  {category.name}{' '}
                  <span style={{ color: '#717182', fontWeight: 400 }}>
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: vertical category list + sticky */}
          <div
            className="hidden rounded-lg border p-6 lg:block lg:sticky lg:top-8"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: selectedCategory === category.name ? '#74C69D20' : 'transparent',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: selectedCategory === category.name ? '#2D6A4F' : '#1B4332',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs tabular-nums" style={{ color: '#717182' }}>
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* USSD lookup — collapsible on mobile */}
          <details
            className="rounded-lg border lg:hidden"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" style={{ color: '#2D6A4F' }} />
                <span className="min-w-0">USSD Code Lookup</span>
              </span>
              <span className="shrink-0 text-xs font-normal" style={{ color: '#717182' }}>
                Show codes
              </span>
            </summary>
            <div className="max-h-64 space-y-2 overflow-y-auto border-t border-[#E0DDD6] px-4 pb-4 pt-2">
              {ussdCodeRows}
            </div>
          </details>

          <div
            className="hidden rounded-lg border p-6 lg:block"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" style={{ color: '#2D6A4F' }} />
              <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                USSD Code Lookup
              </h3>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto">{ussdCodeRows}</div>
          </div>
        </aside>
      </div>
    </>
  );
}