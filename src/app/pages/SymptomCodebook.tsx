import { Layout } from '../components/Layout';
import { ArrowLeft, Edit3, Phone, AlertTriangle, ExternalLink, Search, Download, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { fetchSymptomCodebook } from '../api/placeholderApi';
import type { SymptomCodebookEntry } from '../api/types';

export function SymptomCodebook() {
  const navigate = useNavigate();
  const [ussdSymptomCodes, setUssdSymptomCodes] = useState<SymptomCodebookEntry[]>([]);
  const [codesLoading, setCodesLoading] = useState(true);
  const [codesError, setCodesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUSSDMenu, setShowUSSDMenu] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    promptKiswahili: '',
    promptEnglish: '',
    physicalSymptom: '',
    linkedArticle: '',
    articleTitle: '',
    severity: 'medium',
    menuPath: '',
  });

  useEffect(() => {
    let cancelled = false;
    fetchSymptomCodebook()
      .then((data) => {
        if (!cancelled) {
          setUssdSymptomCodes(data);
          setCodesError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setCodesError('Could not load symptom codes.');
      })
      .finally(() => {
        if (!cancelled) setCodesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCode = () => {
    const entry: SymptomCodebookEntry = {
      code: newCode.code,
      promptKiswahili: newCode.promptKiswahili,
      promptEnglish: newCode.promptEnglish,
      physicalSymptom: newCode.physicalSymptom,
      linkedArticle: newCode.linkedArticle,
      articleTitle: newCode.articleTitle,
      severity: newCode.severity,
      menuPath: newCode.menuPath,
    };
    setUssdSymptomCodes((prev) => [...prev, entry]);
    setShowAddCodeModal(false);
    setNewCode({
      code: '',
      promptKiswahili: '',
      promptEnglish: '',
      physicalSymptom: '',
      linkedArticle: '',
      articleTitle: '',
      severity: 'medium',
      menuPath: '',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: '#DC262620', text: '#DC2626', border: '#DC2626', label: 'HIGH' };
      case 'medium':
        return { bg: '#D9770620', text: '#D97706', border: '#D97706', label: 'MEDIUM' };
      case 'low':
        return { bg: '#74C69D20', text: '#2D6A4F', border: '#2D6A4F', label: 'LOW' };
      default:
        return { bg: '#E0DDD6', text: '#717182', border: '#717182', label: 'UNKNOWN' };
    }
  };

  const filteredCodes = ussdSymptomCodes.filter(item => {
    const matchesSearch = 
      item.code.includes(searchTerm) ||
      item.promptKiswahili.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.promptEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.physicalSymptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articleTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  if (codesLoading) {
    return (
      <Layout>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading symptom codebook…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {codesError && (
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {codesError}
        </div>
      )}
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 
              className="text-4xl mb-2" 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332'
              }}
            >
              USSD Symptom Codebook
            </h1>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6' }}>
              Critical bridge mapping feature-phone farmer inputs to Knowledge Base articles
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUSSDMenu(!showUSSDMenu)}
              className="px-4 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
              style={{ 
                backgroundColor: '#2D6A4F',
                color: '#F7F4EF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Phone className="w-4 h-4" />
              {showUSSDMenu ? 'Hide' : 'View'} USSD Menu
            </button>
            <button
              className="px-4 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2 border"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#2D6A4F',
                color: '#2D6A4F',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
              onClick={() => setShowAddCodeModal(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Code
            </button>
          </div>
        </div>

        {/* USSD Menu Preview Modal */}
        {showUSSDMenu && (
          <div 
            className="mb-6 p-6 rounded-lg border"
            style={{ backgroundColor: '#1B4332', borderColor: '#2D6A4F', borderRadius: '8px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6" style={{ color: '#74C69D' }} />
                <h3 style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#F7F4EF', fontSize: '18px' }}>
                  USSD Menu Structure (As Farmer Sees It)
                </h3>
              </div>
              <button
                onClick={() => setShowUSSDMenu(false)}
                className="text-sm px-3 py-1 rounded"
                style={{ backgroundColor: '#2D6A4F', color: '#F7F4EF', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                Close
              </button>
            </div>
            
            <div 
              className="p-4 rounded font-mono text-sm"
              style={{ backgroundColor: '#000000', color: '#00FF00', fontFamily: 'IBM Plex Mono, monospace', lineHeight: '1.8' }}
            >
              <div className="mb-4">
                <p>AgriGuard Pest Report</p>
                <p>*384*56#</p>
                <p>─────────────────</p>
              </div>
              <div className="mb-4">
                <p>Chagua tatizo:</p>
                <p>1. Wadudu (Pests)</p>
                <p>2. Matatizo ya Matunda</p>
                <p>3. Magonjwa (Diseases)</p>
                <p>4. Utapiamlo (Nutrition)</p>
                <p>0. Kurudi</p>
              </div>
              <div className="mb-4">
                <p>─────────────────</p>
                <p>[1] &gt; Wadudu:</p>
                <p>1. Vidudu vyeupe [101]</p>
                <p>2. Mabaka hudhurungi [102]</p>
                <p>3. Utando wa buibui [105]</p>
              </div>
              <div>
                <p>─────────────────</p>
                <p>[2] &gt; Matatizo Matunda:</p>
                <p>1. Matunda kuanguka [103]</p>
                <p>2. Madoa meusi [203]</p>
                <p>3. Kuiva haraka [204]</p>
                <p>4. Tundu matunda [302]</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Filters and Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
            style={{ color: '#717182' }}
          />
          <input
            type="text"
            placeholder="Search by code, symptom, or KB article..."
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
        
        {/* Severity Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSeverity('all')}
            className="px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: selectedSeverity === 'all' ? '#2D6A4F' : '#FFFFFF',
              color: selectedSeverity === 'all' ? '#F7F4EF' : '#1B4332',
              border: selectedSeverity === 'all' ? 'none' : '1px solid #E0DDD6',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            All ({ussdSymptomCodes.length})
          </button>
          <button
            onClick={() => setSelectedSeverity('high')}
            className="px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: selectedSeverity === 'high' ? '#DC2626' : '#FFFFFF',
              color: selectedSeverity === 'high' ? '#F7F4EF' : '#DC2626',
              border: selectedSeverity === 'high' ? 'none' : '1px solid #DC2626',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            High
          </button>
          <button
            onClick={() => setSelectedSeverity('medium')}
            className="px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: selectedSeverity === 'medium' ? '#D97706' : '#FFFFFF',
              color: selectedSeverity === 'medium' ? '#F7F4EF' : '#D97706',
              border: selectedSeverity === 'medium' ? 'none' : '1px solid #D97706',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedSeverity('low')}
            className="px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: selectedSeverity === 'low' ? '#2D6A4F' : '#FFFFFF',
              color: selectedSeverity === 'low' ? '#F7F4EF' : '#2D6A4F',
              border: selectedSeverity === 'low' ? 'none' : '1px solid #2D6A4F',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            Low
          </button>
        </div>

        <button
          className="px-4 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2 border"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
            color: '#1B4332',
            fontFamily: 'IBM Plex Sans, sans-serif',
            borderRadius: '8px',
          }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Total Codes
          </p>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {ussdSymptomCodes.length}
          </p>
        </div>
        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#DC2626', borderRadius: '8px' }}
        >
          <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            High Severity
          </p>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#DC2626' }}>
            {ussdSymptomCodes.filter(c => c.severity === 'high').length}
          </p>
        </div>
        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#D97706', borderRadius: '8px' }}
        >
          <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Medium Severity
          </p>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#D97706' }}>
            {ussdSymptomCodes.filter(c => c.severity === 'medium').length}
          </p>
        </div>
        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#2D6A4F', borderRadius: '8px' }}
        >
          <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Low Severity
          </p>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#2D6A4F' }}>
            {ussdSymptomCodes.filter(c => c.severity === 'low').length}
          </p>
        </div>
      </div>

      {/* Codebook Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#1B4332' }}>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                USSD Code
              </th>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                Symptom Description
              </th>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                Physical Symptom
              </th>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                Mapped KB Article
              </th>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                Severity
              </th>
              <th 
                className="px-6 py-4 text-left text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#F7F4EF', fontWeight: 600 }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCodes.map((item, index) => {
              const severityStyle = getSeverityColor(item.severity);
              
              return (
                <tr 
                  key={item.code}
                  className="border-t transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E0DDD6' }}
                >
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded inline-block"
                      style={{ 
                        backgroundColor: '#1B4332',
                        color: '#F7F4EF',
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '16px',
                        fontWeight: 700,
                      }}
                    >
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', marginBottom: '4px', fontWeight: 500 }}>
                        {item.promptEnglish}
                      </p>
                      <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontStyle: 'italic' }}>
                        {item.promptKiswahili}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '14px' }}>
                      {item.physicalSymptom}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/knowledge-base/${item.linkedArticle}`)}
                      className="flex items-center gap-2 hover:underline"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
                    >
                      <span className="font-mono">{item.linkedArticle}</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <p className="text-sm mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {item.articleTitle}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded border inline-flex items-center gap-2"
                      style={{ 
                        backgroundColor: severityStyle.bg,
                        color: severityStyle.text,
                        borderColor: severityStyle.border,
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {severityStyle.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      style={{ color: '#2D6A4F' }}
                      title="Edit Code"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            No codes found matching your filters.
          </p>
        </div>
      )}

      {/* Add Code Modal */}
      {showAddCodeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddCodeModal(false)}
        >
          <div 
            className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: '#F7F4EF', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: '#1B4332', borderColor: '#2D6A4F' }}
            >
              <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#F7F4EF', fontSize: '24px' }}>
                Add New USSD Symptom Code
              </h2>
              <button
                onClick={() => setShowAddCodeModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: '#F7F4EF' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Form */}
            <div className="p-6 overflow-y-auto flex-1">
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '24px' }}>
                Create a new symptom code mapping for the USSD menu system
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                    >
                      USSD Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 303"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                      className="w-full px-4 py-3 rounded border"
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        borderColor: '#E0DDD6',
                        backgroundColor: '#FFFFFF',
                        color: '#1B4332',
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                    >
                      Severity Level *
                    </label>
                    <select
                      value={newCode.severity}
                      onChange={(e) => setNewCode({ ...newCode, severity: e.target.value })}
                      className="w-full px-4 py-3 rounded border"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderColor: '#E0DDD6',
                        backgroundColor: '#FFFFFF',
                        color: '#1B4332',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                  >
                    Symptom Prompt (English) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sticky substance on leaves"
                    value={newCode.promptEnglish}
                    onChange={(e) => setNewCode({ ...newCode, promptEnglish: e.target.value })}
                    className="w-full px-4 py-3 rounded border"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4332',
                    }}
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                  >
                    Symptom Prompt (Kiswahili) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jamii nzito kwenye majani"
                    value={newCode.promptKiswahili}
                    onChange={(e) => setNewCode({ ...newCode, promptKiswahili: e.target.value })}
                    className="w-full px-4 py-3 rounded border"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4332',
                    }}
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                  >
                    Physical Symptom/Diagnosis *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Aphid Infestation"
                    value={newCode.physicalSymptom}
                    onChange={(e) => setNewCode({ ...newCode, physicalSymptom: e.target.value })}
                    className="w-full px-4 py-3 rounded border"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4332',
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                    >
                      Linked KB Article ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., KB-048"
                      value={newCode.linkedArticle}
                      onChange={(e) => setNewCode({ ...newCode, linkedArticle: e.target.value })}
                      className="w-full px-4 py-3 rounded border"
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        borderColor: '#E0DDD6',
                        backgroundColor: '#FFFFFF',
                        color: '#1B4332',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                    >
                      KB Article Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Aphid Control Methods"
                      value={newCode.articleTitle}
                      onChange={(e) => setNewCode({ ...newCode, articleTitle: e.target.value })}
                      className="w-full px-4 py-3 rounded border"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderColor: '#E0DDD6',
                        backgroundColor: '#FFFFFF',
                        color: '#1B4332',
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label 
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                  >
                    USSD Menu Path *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Main > 1: Wadudu > 4: Description"
                    value={newCode.menuPath}
                    onChange={(e) => setNewCode({ ...newCode, menuPath: e.target.value })}
                    className="w-full px-4 py-3 rounded border"
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4332',
                    }}
                    required
                  />
                  <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Defines where this code appears in the USSD menu hierarchy
                  </p>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Buttons */}
            <div 
              className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
              }}
            >
              <button
                onClick={() => setShowAddCodeModal(false)}
                className="px-6 py-3 rounded-lg transition-colors border"
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
                onClick={handleAddCode}
                className="px-6 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
                style={{ 
                  backgroundColor: '#2D6A4F',
                  color: '#F7F4EF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Symptom Code
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}