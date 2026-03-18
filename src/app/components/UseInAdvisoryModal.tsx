import { X, Search, Send, CheckCircle2, User, Briefcase, Globe, Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface UseInAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
  advisorySnippetEN: string;
  advisorySnippetSW: string;
}

const activeCases = [
  { id: 'CSE-1024', farmer: 'Peter Kamau', farm: 'Kangema Avocado Growers', county: 'Murang\'a', phone: '+254 712 345 678', pest: 'Avocado Thrips' },
  { id: 'CSE-1020', farmer: 'Grace Njeri', farm: 'Kiambu Highland Farms', county: 'Kiambu', phone: '+254 723 456 789', pest: 'Anthracnose' },
  { id: 'CSE-1023', farmer: 'John Mwangi', farm: 'Gatanga Green Farms', county: 'Murang\'a', phone: '+254 734 567 890', pest: 'Root Rot' },
  { id: 'CSE-1022', farmer: 'Mary Wanjiru', farm: 'Tigoni Avocado Estates', county: 'Kiambu', phone: '+254 745 678 901', pest: 'Persea Mite' },
];

const recentFarmers = [
  { id: 'FRM-234', name: 'David Kariuki', farm: 'Meru Valley Orchards', county: 'Meru', phone: '+254 756 789 012' },
  { id: 'FRM-198', name: 'Sarah Akinyi', farm: 'Nyeri Green Farms', county: 'Nyeri', phone: '+254 767 890 123' },
  { id: 'FRM-156', name: 'James Ochieng', farm: 'Bungoma Avocado Co-op', county: 'Bungoma', phone: '+254 778 901 234' },
];

export function UseInAdvisoryModal({ 
  isOpen, 
  onClose, 
  articleId, 
  articleTitle,
  advisorySnippetEN,
  advisorySnippetSW 
}: UseInAdvisoryModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'sw'>('en');
  const [deliveryMethod, setDeliveryMethod] = useState<'case' | 'direct'>('case');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      onClose();
      setIsSent(false);
      setSelectedCase(null);
      setSelectedFarmer(null);
      setCustomMessage('');
    }, 2000);
  };

  const currentSnippet = selectedLanguage === 'en' ? advisorySnippetEN : advisorySnippetSW;
  const finalMessage = customMessage || currentSnippet;

  const filteredCases = activeCases.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.farm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFarmers = recentFarmers.filter(f => 
    f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: '#F7F4EF', borderRadius: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: '#1B4332', borderColor: '#2D6A4F' }}
        >
          <div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#F7F4EF', fontSize: '24px' }}>
              Send Advisory to Farmer
            </h2>
            <p className="text-sm mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#74C69D' }}>
              {articleId}: {articleTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: '#F7F4EF' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSent ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#74C69D20' }}
              >
                <CheckCircle2 className="w-12 h-12" style={{ color: '#2D6A4F' }} />
              </div>
              <h3 className="mb-2" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332', fontSize: '24px' }}>
                Advisory Sent Successfully!
              </h3>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                The farmer will receive the advisory via SMS
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Delivery Method Tabs */}
              <div>
                <label className="block mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  Delivery Method
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeliveryMethod('case')}
                    className="flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: deliveryMethod === 'case' ? '#2D6A4F' : '#FFFFFF',
                      color: deliveryMethod === 'case' ? '#F7F4EF' : '#1B4332',
                      border: deliveryMethod === 'case' ? 'none' : '1px solid #E0DDD6',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Briefcase className="w-5 h-5" />
                    Attach to Case
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('direct')}
                    className="flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: deliveryMethod === 'direct' ? '#2D6A4F' : '#FFFFFF',
                      color: deliveryMethod === 'direct' ? '#F7F4EF' : '#1B4332',
                      border: deliveryMethod === 'direct' ? 'none' : '1px solid #E0DDD6',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <User className="w-5 h-5" />
                    Send Directly to Farmer
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  Advisory Language
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className="flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: selectedLanguage === 'en' ? '#2D6A4F' : '#FFFFFF',
                      color: selectedLanguage === 'en' ? '#F7F4EF' : '#1B4332',
                      border: selectedLanguage === 'en' ? 'none' : '1px solid #E0DDD6',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Globe className="w-5 h-5" />
                    English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('sw')}
                    className="flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: selectedLanguage === 'sw' ? '#2D6A4F' : '#FFFFFF',
                      color: selectedLanguage === 'sw' ? '#F7F4EF' : '#1B4332',
                      border: selectedLanguage === 'sw' ? 'none' : '1px solid #E0DDD6',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Globe className="w-5 h-5" />
                    Kiswahili
                  </button>
                </div>
              </div>

              {/* Advisory Message Preview/Edit */}
              <div>
                <label className="block mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  Advisory Message ({selectedLanguage === 'en' ? 'English' : 'Kiswahili'})
                </label>
                <div 
                  className="p-4 rounded-lg border mb-2"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Default Template
                    </span>
                    <span className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                      {currentSnippet.length}/160
                    </span>
                  </div>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', lineHeight: '1.6', fontSize: '14px' }}>
                    {currentSnippet}
                  </p>
                </div>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Or type a custom message (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    backgroundColor: '#FFFFFF',
                    color: '#1B4332',
                  }}
                />
                <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {customMessage ? `${customMessage.length}/160 characters` : 'Leave empty to use default template'}
                </p>
              </div>

              {/* Select Case or Farmer */}
              <div>
                <label className="block mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                  {deliveryMethod === 'case' ? 'Select Active Case' : 'Select Farmer'}
                </label>
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                    style={{ color: '#717182' }}
                  />
                  <input
                    type="text"
                    placeholder={deliveryMethod === 'case' ? 'Search cases...' : 'Search farmers...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      borderColor: '#E0DDD6',
                      backgroundColor: '#FFFFFF',
                      color: '#1B4332',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* List */}
                <div 
                  className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto"
                  style={{ borderColor: '#E0DDD6' }}
                >
                  {deliveryMethod === 'case' ? (
                    filteredCases.map((caseItem) => (
                      <button
                        key={caseItem.id}
                        onClick={() => setSelectedCase(caseItem.id)}
                        className="w-full p-4 border-b transition-colors hover:bg-gray-50 text-left"
                        style={{
                          backgroundColor: selectedCase === caseItem.id ? '#74C69D20' : '#FFFFFF',
                          borderColor: '#E0DDD6',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: '#1B4332',
                                  color: '#F7F4EF',
                                  fontFamily: 'IBM Plex Mono, monospace',
                                }}
                              >
                                {caseItem.id}
                              </span>
                              <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                {caseItem.farmer}
                              </span>
                            </div>
                            <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                              {caseItem.farm}, {caseItem.county}
                            </p>
                            <div className="flex items-center gap-3 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {caseItem.phone}
                              </span>
                              <span>•</span>
                              <span>{caseItem.pest}</span>
                            </div>
                          </div>
                          {selectedCase === caseItem.id && (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <button
                        key={farmer.id}
                        onClick={() => setSelectedFarmer(farmer.id)}
                        className="w-full p-4 border-b transition-colors hover:bg-gray-50 text-left"
                        style={{
                          backgroundColor: selectedFarmer === farmer.id ? '#74C69D20' : '#FFFFFF',
                          borderColor: '#E0DDD6',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: '#1B4332',
                                  color: '#F7F4EF',
                                  fontFamily: 'IBM Plex Mono, monospace',
                                }}
                              >
                                {farmer.id}
                              </span>
                              <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                {farmer.name}
                              </span>
                            </div>
                            <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                              {farmer.farm}, {farmer.county}
                            </p>
                            <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                              <Phone className="w-3 h-3" />
                              {farmer.phone}
                            </p>
                          </div>
                          {selectedFarmer === farmer.id && (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSent && (
          <div 
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
          >
            <div className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {deliveryMethod === 'case' 
                ? selectedCase 
                  ? `Will send to case ${selectedCase}` 
                  : 'Select a case to continue'
                : selectedFarmer
                  ? `Will send to farmer ${selectedFarmer}`
                  : 'Select a farmer to continue'
              }
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
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
                onClick={handleSend}
                disabled={!selectedCase && !selectedFarmer}
                className="px-6 py-3 rounded-lg transition-all flex items-center gap-2"
                style={{ 
                  backgroundColor: (selectedCase || selectedFarmer) ? '#2D6A4F' : '#E0DDD6',
                  color: '#F7F4EF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  cursor: (selectedCase || selectedFarmer) ? 'pointer' : 'not-allowed',
                  opacity: (selectedCase || selectedFarmer) ? 1 : 0.6,
                }}
              >
                <Send className="w-4 h-4" />
                Send Advisory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
