import { Layout } from '../components/Layout';
import { ArrowLeft, CheckCircle2, Lock, Unlock, AlertTriangle, Code, Leaf, Beaker, MessageSquare, Send, Copy, Globe, FileText, TrendingUp, Calendar, Eye, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { UseInAdvisoryButton } from '../components/UseInAdvisoryButton';
import { fetchKBArticle } from '../api/placeholderApi';
import { articleData } from '../data/articleData';

type ArticleDoc = (typeof articleData)['KB-045'];

export function KBArticleDetail() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [article, setArticle] = useState<ArticleDoc | null>(null);
  const [kbLoading, setKbLoading] = useState(true);
  const [kbNotFound, setKbNotFound] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'sw'>('en');
  const [showChemicalGate, setShowChemicalGate] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setKbLoading(true);
    fetchKBArticle(articleId)
      .then((raw) => {
        if (cancelled) return;
        if (!raw) {
          setArticle(null);
          setKbNotFound(true);
        } else {
          setArticle(raw as ArticleDoc);
          setKbNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null);
          setKbNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setKbLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  if (kbLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6 max-w-3xl">
          <div className="h-10 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (kbNotFound || !article) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>Article Not Found</h2>
          <button
            onClick={() => navigate('/knowledge-base')}
            className="mt-4 px-4 py-2 rounded"
            style={{ backgroundColor: '#2D6A4F', color: '#F7F4EF' }}
          >
            Back to Knowledge Base
          </button>
        </div>
      </Layout>
    );
  }

  const copyToClipboard = () => {
    const snippet = selectedLanguage === 'en' ? article.advisorySnippetEN : article.advisorySnippetSW;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

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

  const severityStyle = getSeverityColor(article.severity);

  return (
    <Layout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/knowledge-base')}
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Knowledge Base
      </button>

      {/* Split Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 
              className="text-4xl" 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332'
              }}
            >
              {article.title}
            </h1>
            {article.approvedContent && (
              <CheckCircle2 
                className="w-6 h-6 flex-shrink-0" 
                style={{ color: '#2D6A4F' }}
                title="Approved Content"
              />
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {article.id}
            </span>
            <span style={{ color: '#E0DDD6' }}>•</span>
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#74C69D20',
                color: '#2D6A4F',
                fontFamily: 'IBM Plex Sans, sans-serif',
              }}
            >
              {article.category}
            </span>
            <span 
              className="text-xs px-2 py-1 rounded border flex items-center gap-1"
              style={{ 
                backgroundColor: severityStyle.bg,
                color: severityStyle.text,
                borderColor: severityStyle.border,
                fontFamily: 'IBM Plex Sans, sans-serif',
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              {article.severity.toUpperCase()} RISK
            </span>
            {article.ussdCode && (
              <span 
                className="text-xs px-2 py-1 rounded flex items-center gap-1"
                style={{ 
                  backgroundColor: '#1B4332',
                  color: '#F7F4EF',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                <Code className="w-3 h-3" />
                USSD: {article.ussdCode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated {article.lastUpdated}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views} views
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Used in {article.activeUses} active cases
            </span>
          </div>
        </div>
        <UseInAdvisoryButton article={article} />
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Content */}
        <div className="col-span-2 space-y-6">
          {/* Identification Section */}
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '20px', fontWeight: 600 }}>
              Identification Signs
            </h2>
            <ul className="space-y-2">
              {article.identificationSigns.map((sign: string, index: number) => (
                <li 
                  key={index}
                  className="flex items-start gap-3"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', lineHeight: '1.6' }}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2D6A4F' }} />
                  {sign}
                </li>
              ))}
            </ul>
          </div>

          {/* Life Cycle */}
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '20px', fontWeight: 600 }}>
              Life Cycle & Biology
            </h2>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.8' }}>
              {article.lifeCycle}
            </p>
          </div>

          {/* Economic Impact */}
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h2 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '20px', fontWeight: 600 }}>
              Economic Impact
            </h2>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.8' }}>
              {article.economicImpact}
            </p>
          </div>

          {/* IPM Escalation Ladder */}
          <div>
            <h2 className="mb-4" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332', fontSize: '28px' }}>
              IPM Escalation Ladder
            </h2>
            
            {/* Level 1: Cultural */}
            <div 
              className="p-6 rounded-lg border mb-4"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#74C69D20' }}
                >
                  <Leaf className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '18px', fontWeight: 600 }}>
                    {article.ipmLadder.level1.title}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                    style={{ 
                      backgroundColor: '#74C69D20',
                      color: '#2D6A4F',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Unlock className="w-3 h-3" />
                    OPEN
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {article.ipmLadder.level1.practices.map((practice: any, index: number) => (
                  <div key={index} className="p-4 rounded border" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
                    <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600, marginBottom: '8px' }}>
                      {practice.name}
                    </h4>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '12px' }}>
                      {practice.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        <strong style={{ color: '#1B4332' }}>Frequency:</strong> {practice.frequency}
                      </span>
                      <span style={{ color: '#E0DDD6' }}>•</span>
                      <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        <strong style={{ color: '#1B4332' }}>Effectiveness:</strong> {practice.effectiveness}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 2: Biological */}
            <div 
              className="p-6 rounded-lg border mb-4"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#74C69D20' }}
                >
                  <Beaker className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '18px', fontWeight: 600 }}>
                    {article.ipmLadder.level2.title}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                    style={{ 
                      backgroundColor: '#74C69D20',
                      color: '#2D6A4F',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Unlock className="w-3 h-3" />
                    OPEN
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {article.ipmLadder.level2.practices.map((practice: any, index: number) => (
                  <div key={index} className="p-4 rounded border" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
                    <h4 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600, marginBottom: '8px' }}>
                      {practice.name}
                    </h4>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '12px' }}>
                      {practice.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        <strong style={{ color: '#1B4332' }}>Frequency:</strong> {practice.frequency}
                      </span>
                      <span style={{ color: '#E0DDD6' }}>•</span>
                      <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        <strong style={{ color: '#1B4332' }}>Effectiveness:</strong> {practice.effectiveness}
                      </span>
                      {practice.supplier && (
                        <>
                          <span style={{ color: '#E0DDD6' }}>•</span>
                          <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                            <strong style={{ color: '#1B4332' }}>Supplier:</strong> {practice.supplier}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 3: Chemical (GATED) */}
            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#DC2626', borderRadius: '8px' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#DC262620' }}
                >
                  <Lock className="w-5 h-5" style={{ color: '#DC2626' }} />
                </div>
                <div className="flex-1">
                  <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '18px', fontWeight: 600 }}>
                    {article.ipmLadder.level3.title}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                    style={{ 
                      backgroundColor: '#DC262620',
                      color: '#DC2626',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Lock className="w-3 h-3" />
                    GATED
                  </span>
                </div>
              </div>
              
              {/* Warning */}
              <div 
                className="p-4 rounded-lg mb-4 flex items-start gap-3"
                style={{ backgroundColor: '#DC262615', borderLeft: '4px solid #DC2626' }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
                  {article.ipmLadder.level3.warning}
                </p>
              </div>

              {/* Gate Toggle */}
              {!showChemicalGate ? (
                <button
                  onClick={() => setShowChemicalGate(true)}
                  className="w-full py-3 rounded-lg transition-colors border"
                  style={{ 
                    backgroundColor: '#DC262610',
                    borderColor: '#DC2626',
                    color: '#DC2626',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Click to View Chemical Options & PHI Data
                </button>
              ) : (
                <div className="space-y-4">
                  {article.ipmLadder.level3.practices.map((practice: any, index: number) => (
                    <div key={index} className="p-4 rounded border" style={{ borderColor: '#DC2626', backgroundColor: '#FFF5F5' }}>
                      <div className="flex items-start justify-between mb-3">
                        <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332', fontWeight: 600, fontSize: '16px' }}>
                          {practice.name}
                        </h4>
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: practice.registrationStatus.includes('Restricted') ? '#DC2626' : '#2D6A4F',
                            color: '#F7F4EF',
                            fontFamily: 'IBM Plex Sans, sans-serif',
                          }}
                        >
                          {practice.registrationStatus}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '12px' }}>
                        {practice.description}
                      </p>
                      
                      {/* PHI Warning Box */}
                      <div 
                        className="p-3 rounded mb-3"
                        style={{ backgroundColor: '#DC2626', color: '#F7F4EF' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '14px' }}>
                            PRE-HARVEST INTERVAL (PHI): {practice.phi}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }}>
                          Do not harvest within {practice.phi} of application
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                            Application Rate
                          </p>
                          <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                            {practice.applicationRate}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                            Max Applications
                          </p>
                          <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                            {practice.maxApplications}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                            Resistance Risk
                          </p>
                          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                            {practice.resistance}
                          </p>
                        </div>
                      </div>
                      
                      {practice.warning && (
                        <div 
                          className="mt-3 p-2 rounded flex items-start gap-2"
                          style={{ backgroundColor: '#DC262620' }}
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626', fontSize: '12px' }}>
                            {practice.warning}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Advisory Toolbox */}
        <div className="col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Advisory Snippet Panel */}
            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#2D6A4F', borderRadius: '8px', borderWidth: '2px' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  Direct Advisory Snippet
                </h3>
              </div>
              
              {/* Language Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className="flex-1 py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: selectedLanguage === 'en' ? '#2D6A4F' : 'transparent',
                    color: selectedLanguage === 'en' ? '#F7F4EF' : '#1B4332',
                    border: selectedLanguage === 'en' ? 'none' : '1px solid #E0DDD6',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
                <button
                  onClick={() => setSelectedLanguage('sw')}
                  className="flex-1 py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: selectedLanguage === 'sw' ? '#2D6A4F' : 'transparent',
                    color: selectedLanguage === 'sw' ? '#F7F4EF' : '#1B4332',
                    border: selectedLanguage === 'sw' ? 'none' : '1px solid #E0DDD6',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  <Globe className="w-4 h-4" />
                  Kiswahili
                </button>
              </div>

              {/* SMS Template */}
              <div 
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: '#F7F4EF', border: '1px solid #E0DDD6' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    SMS Template ({selectedLanguage === 'en' ? 'English' : 'Kiswahili'})
                  </span>
                  <span className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                    {selectedLanguage === 'en' ? article.advisorySnippetEN.length : article.advisorySnippetSW.length}/160
                  </span>
                </div>
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', lineHeight: '1.6', fontSize: '14px' }}>
                  {selectedLanguage === 'en' ? article.advisorySnippetEN : article.advisorySnippetSW}
                </p>
              </div>

              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                className="w-full py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: copiedSnippet ? '#74C69D' : '#2D6A4F',
                  color: '#F7F4EF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '14px',
                }}
              >
                {copiedSnippet ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats */}
            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                Article Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Active Cases
                  </span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {article.activeUses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Total Views
                  </span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {article.views}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Last Updated
                  </span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {article.lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div 
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <h3 className="mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span 
                    key={tag}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ 
                      borderColor: '#E0DDD6',
                      color: '#1B4332',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}