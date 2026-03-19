import { Layout } from '../components/Layout';
import { BookOpen, Search, Tag, FileText, CheckCircle2, Lock, Unlock, AlertTriangle, TrendingUp, Code, Leaf, Beaker, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const knowledgeArticles = [
  {
    id: 'KB-045',
    title: 'Avocado Thrips: Identification and Management',
    category: 'Pest Management',
    tags: ['Thrips', 'IPM', 'Treatment'],
    summary: 'Comprehensive guide to identifying and managing avocado thrips infestations, including life cycle, damage symptoms, and control strategies.',
    lastUpdated: 'Mar 10, 2026',
    views: 1247,
    severity: 'high',
    activeUses: 14,
    approvedContent: true,
    ussdCode: '102',
    chemicalGate: 'gated',
    ipmLevel: 3,
  },
  {
    id: 'KB-044',
    title: 'Phytophthora Root Rot Prevention and Control',
    category: 'Disease Management',
    tags: ['Root Rot', 'Prevention', 'Drainage'],
    summary: 'Best practices for preventing and controlling Phytophthora root rot, including soil management, irrigation practices, and treatment options.',
    lastUpdated: 'Mar 8, 2026',
    views: 982,
    severity: 'high',
    activeUses: 22,
    approvedContent: true,
    ussdCode: '205',
    chemicalGate: 'gated',
    ipmLevel: 3,
  },
  {
    id: 'KB-043',
    title: 'Integrated Pest Management (IPM) for Avocados',
    category: 'Best Practices',
    tags: ['IPM', 'Sustainable', 'Strategy'],
    summary: 'Overview of integrated pest management principles and how to implement IPM programs in avocado orchards.',
    lastUpdated: 'Mar 5, 2026',
    views: 1534,
    severity: 'low',
    activeUses: 8,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 1,
  },
  {
    id: 'KB-042',
    title: 'Scouting Techniques for Early Detection',
    category: 'Field Operations',
    tags: ['Scouting', 'Detection', 'Training'],
    summary: 'Detailed scouting protocols and techniques for early detection of pests and diseases in avocado orchards.',
    lastUpdated: 'Mar 3, 2026',
    views: 876,
    severity: 'low',
    activeUses: 3,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 1,
  },
  {
    id: 'KB-041',
    title: 'Understanding Persea Mite Biology and Behavior',
    category: 'Pest Biology',
    tags: ['Mites', 'Biology', 'Lifecycle'],
    summary: 'In-depth look at persea mite biology, lifecycle, and environmental factors affecting population dynamics.',
    lastUpdated: 'Feb 28, 2026',
    views: 654,
    severity: 'medium',
    activeUses: 11,
    approvedContent: true,
    ussdCode: '104',
    chemicalGate: 'open',
    ipmLevel: 2,
  },
  {
    id: 'KB-040',
    title: 'Anthracnose Disease Management',
    category: 'Disease Management',
    tags: ['Anthracnose', 'Fungicide', 'Prevention'],
    summary: 'Guidelines for managing anthracnose in avocados, including cultural practices and chemical control options.',
    lastUpdated: 'Feb 25, 2026',
    views: 723,
    severity: 'medium',
    activeUses: 17,
    approvedContent: true,
    ussdCode: '203',
    chemicalGate: 'gated',
    ipmLevel: 3,
  },
];

const categories = [
  { name: 'All Articles', count: 145 },
  { name: 'Pest Management', count: 42 },
  { name: 'Disease Management', count: 38 },
  { name: 'Best Practices', count: 28 },
  { name: 'Field Operations', count: 21 },
  { name: 'Pest Biology', count: 16 },
];

const ussdSymptomCodes = [
  { code: '101', symptom: 'Wilting Leaves', category: 'General Symptoms' },
  { code: '102', symptom: 'Yellowing Leaves', category: 'General Symptoms' },
  { code: '103', symptom: 'Leaf Spots/Lesions', category: 'General Symptoms' },
  { code: '104', symptom: 'Scarring on Fruit', category: 'Fruit Damage' },
  { code: '105', symptom: 'Holes in Fruit', category: 'Fruit Damage' },
  { code: '201', symptom: 'Root Discoloration', category: 'Root Issues' },
  { code: '202', symptom: 'Trunk Cankers', category: 'Trunk Issues' },
  { code: '203', symptom: 'Black Spots on Fruit', category: 'Fruit Damage' },
  { code: '204', symptom: 'Premature Fruit Drop', category: 'Fruit Damage' },
  { code: '205', symptom: 'Tree Decline', category: 'General Symptoms' },
];

export function KnowledgeBase() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');

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

  return (
    <Layout>
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

      <div className="grid grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Categories */}
          <div 
            className="p-6 rounded-lg border sticky top-8"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: selectedCategory === category.name ? '#74C69D20' : 'transparent',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: selectedCategory === category.name ? '#2D6A4F' : '#1B4332',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs" style={{ color: '#717182' }}>
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* USSD Code Lookup */}
          <div 
            className="p-6 rounded-lg border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5" style={{ color: '#2D6A4F' }} />
              <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                USSD Code Lookup
              </h3>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {ussdSymptomCodes.map((item) => (
                <div 
                  key={item.code}
                  className="p-2 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E0DDD6' }}
                >
                  <div className="flex items-start gap-2">
                    <span 
                      className="px-2 py-0.5 rounded text-xs flex-shrink-0"
                      style={{ 
                        backgroundColor: '#1B4332',
                        color: '#F7F4EF',
                        fontFamily: 'IBM Plex Mono, monospace',
                      }}
                    >
                      {item.code}
                    </span>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        {item.symptom}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="col-span-3 space-y-4">
          {knowledgeArticles.map((article) => {
            const severityStyle = getSeverityColor(article.severity);
            
            return (
              <div 
                key={article.id}
                onClick={() => navigate(`/knowledge-base/${article.id}`)}
                className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-opacity-100"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#74C69D20' }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: '#2D6A4F' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                            {article.title}
                          </h3>
                          {article.approvedContent && (
                            <CheckCircle2 
                              className="w-4 h-4 flex-shrink-0" 
                              style={{ color: '#2D6A4F' }}
                              title="Approved Content"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
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
                            className="text-xs px-2 py-1 rounded border flex items-center gap-1"
                            style={{ 
                              backgroundColor: severityStyle.bg,
                              color: severityStyle.text,
                              borderColor: severityStyle.border,
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {article.severity.toUpperCase()} RISK
                          </span>

                          {/* Chemical Gate Status */}
                          <span 
                            className="text-xs px-2 py-1 rounded border flex items-center gap-1"
                            style={{ 
                              backgroundColor: article.chemicalGate === 'gated' ? '#DC262620' : '#74C69D20',
                              color: article.chemicalGate === 'gated' ? '#DC2626' : '#2D6A4F',
                              borderColor: article.chemicalGate === 'gated' ? '#DC2626' : '#2D6A4F',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                            }}
                          >
                            {article.chemicalGate === 'gated' ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                            {article.chemicalGate === 'gated' ? 'GATED' : 'OPEN'}
                          </span>

                          {/* IPM Level */}
                          <span 
                            className="text-xs px-2 py-1 rounded border flex items-center gap-1"
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
                              className="text-xs px-2 py-1 rounded flex items-center gap-1"
                              style={{ 
                                backgroundColor: '#1B4332',
                                color: '#F7F4EF',
                                fontFamily: 'IBM Plex Mono, monospace',
                                borderRadius: '4px',
                              }}
                            >
                              <Code className="w-3 h-3" />
                              {article.ussdCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs ml-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {article.id}
                      </span>
                    </div>
                    <p className="mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6' }}>
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {article.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-1 rounded border"
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
                      <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {/* Active Uses Badge */}
                        <span 
                          className="px-2 py-1 rounded flex items-center gap-1"
                          style={{ 
                            backgroundColor: '#74C69D20',
                            color: '#2D6A4F',
                          }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          Used in {article.activeUses} active cases
                        </span>
                        <span>Updated {article.lastUpdated}</span>
                        <span>•</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}