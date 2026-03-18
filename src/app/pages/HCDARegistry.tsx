
import { Layout } from '../components/Layout';
import { Building2, MapPin, TrendingUp, CheckCircle, XCircle, Clock, Search, Download, FileCheck } from 'lucide-react';
import { useState } from 'react';

interface FarmerRegistration {
  id: string;
  farmerName: string;
  hcdaRegNumber: string;
  ward: string;
  county: string;
  acreage: number;
  globalGAPStatus: 'compliant' | 'expired' | 'non-compliant';
  globalGAPExpiry: string;
  primaryExporter: string;
  lat: number;
  lng: number;
}

const mockFarmers: FarmerRegistration[] = [
  {
    id: '1',
    farmerName: 'Joseph Kamau',
    hcdaRegNumber: 'HCDA-KMB-2024-0047',
    ward: 'Gatundu North',
    county: 'Kiambu',
    acreage: 12.5,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2026-08-15',
    primaryExporter: 'Kakuzi PLC',
    lat: -1.0369,
    lng: 36.9741,
  },
  {
    id: '2',
    farmerName: 'Mary Wanjiku',
    hcdaRegNumber: 'HCDA-MRU-2023-0128',
    ward: 'Timau',
    county: 'Meru',
    acreage: 8.3,
    globalGAPStatus: 'expired',
    globalGAPExpiry: '2026-01-20',
    primaryExporter: 'Sunripe Ltd',
    lat: -0.0917,
    lng: 37.3831,
  },
  {
    id: '3',
    farmerName: 'Peter Mwangi',
    hcdaRegNumber: 'HCDA-NYR-2024-0089',
    ward: 'Tetu',
    county: 'Nyeri',
    acreage: 15.0,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2027-03-10',
    primaryExporter: 'Kakuzi PLC',
    lat: -0.4195,
    lng: 36.9572,
  },
  {
    id: '4',
    farmerName: 'Grace Njeri',
    hcdaRegNumber: 'HCDA-EMB-2024-0034',
    ward: 'Mbeere North',
    county: 'Embu',
    acreage: 6.7,
    globalGAPStatus: 'non-compliant',
    globalGAPExpiry: '2024-11-05',
    primaryExporter: 'Fresh Produce Exporters',
    lat: -0.5307,
    lng: 37.4575,
  },
  {
    id: '5',
    farmerName: 'David Kariuki',
    hcdaRegNumber: 'HCDA-KRC-2024-0156',
    ward: 'Ndia',
    county: 'Kirinyaga',
    acreage: 10.2,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2026-12-01',
    primaryExporter: 'Kenya Horticultural Exporters',
    lat: -0.6588,
    lng: 37.3056,
  },
  {
    id: '6',
    farmerName: 'Sarah Wambui',
    hcdaRegNumber: 'HCDA-KMB-2023-0201',
    ward: 'Limuru',
    county: 'Kiambu',
    acreage: 22.4,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2026-09-18',
    primaryExporter: 'Kakuzi PLC',
    lat: -1.1161,
    lng: 36.6428,
  },
  {
    id: '7',
    farmerName: 'John Mutua',
    hcdaRegNumber: 'HCDA-MRU-2024-0067',
    ward: 'Buuri',
    county: 'Meru',
    acreage: 5.8,
    globalGAPStatus: 'expired',
    globalGAPExpiry: '2026-02-28',
    primaryExporter: 'Sunripe Ltd',
    lat: 0.0503,
    lng: 37.6442,
  },
  {
    id: '8',
    farmerName: 'Lucy Wairimu',
    hcdaRegNumber: 'HCDA-NYR-2024-0112',
    ward: 'Mathira East',
    county: 'Nyeri',
    acreage: 18.6,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2027-01-15',
    primaryExporter: 'Kenya Horticultural Exporters',
    lat: -0.3667,
    lng: 37.0167,
  },
  {
    id: '9',
    farmerName: 'Daniel Ochieng',
    hcdaRegNumber: 'HCDA-EMB-2024-0078',
    ward: 'Runyenjes',
    county: 'Embu',
    acreage: 9.1,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2026-10-22',
    primaryExporter: 'Fresh Produce Exporters',
    lat: -0.4823,
    lng: 37.5283,
  },
  {
    id: '10',
    farmerName: 'Anne Nyambura',
    hcdaRegNumber: 'HCDA-KMB-2024-0188',
    ward: 'Kikuyu',
    county: 'Kiambu',
    acreage: 14.3,
    globalGAPStatus: 'non-compliant',
    globalGAPExpiry: '2025-05-30',
    primaryExporter: 'Kakuzi PLC',
    lat: -1.2459,
    lng: 36.6631,
  },
  {
    id: '11',
    farmerName: 'Samuel Kipchoge',
    hcdaRegNumber: 'HCDA-KRC-2023-0234',
    ward: 'Gichugu',
    county: 'Kirinyaga',
    acreage: 7.9,
    globalGAPStatus: 'expired',
    globalGAPExpiry: '2026-03-12',
    primaryExporter: 'Kenya Horticultural Exporters',
    lat: -0.6167,
    lng: 37.3667,
  },
  {
    id: '12',
    farmerName: 'Faith Moraa',
    hcdaRegNumber: 'HCDA-MRU-2024-0145',
    ward: 'Igembe South',
    county: 'Meru',
    acreage: 11.7,
    globalGAPStatus: 'compliant',
    globalGAPExpiry: '2027-02-05',
    primaryExporter: 'Sunripe Ltd',
    lat: 0.1833,
    lng: 37.8667,
  },
];

const exporters = [
  'Kakuzi PLC',
  'Sunripe Ltd',
  'Kenya Horticultural Exporters',
  'Fresh Produce Exporters',
];

export function HCDARegistry() {
  const [farmers] = useState<FarmerRegistration[]>(mockFarmers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExporter, setSelectedExporter] = useState<string>('all');
  const [selectedGAPStatus, setSelectedGAPStatus] = useState<string>('all');

  const compliantCount = farmers.filter(f => f.globalGAPStatus === 'compliant').length;
  const expiredCount = farmers.filter(f => f.globalGAPStatus === 'expired').length;
  const nonCompliantCount = farmers.filter(f => f.globalGAPStatus === 'non-compliant').length;
  const totalAcreage = farmers.reduce((sum, f) => sum + f.acreage, 0);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      farmer.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.hcdaRegNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExporter = selectedExporter === 'all' || farmer.primaryExporter === selectedExporter;
    const matchesGAPStatus = selectedGAPStatus === 'all' || farmer.globalGAPStatus === selectedGAPStatus;
    
    return matchesSearch && matchesExporter && matchesGAPStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return { bg: '#2D6A4F', text: '#FFFFFF' };
      case 'expired':
        return { bg: '#F39C12', text: '#FFFFFF' };
      case 'non-compliant':
        return { bg: '#C0392B', text: '#FFFFFF' };
      default:
        return { bg: '#717182', text: '#FFFFFF' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'expired':
        return 'Expired';
      case 'non-compliant':
        return 'Non-Compliant';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-3 h-3" />;
      case 'expired':
        return <Clock className="w-3 h-3" />;
      case 'non-compliant':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                fontSize: '32px',
                color: '#1B4332',
                margin: 0,
              }}
            >
              Horticultural Crops Traceability Registry
            </h1>
          </div>
          <p 
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '16px',
              color: '#717182',
              margin: 0,
            }}
          >
            Verified Farmer Registration & GlobalGAP Compliance
          </p>
        </div>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 min-w-0 max-w-full [&>*]:min-w-0">
          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0DDD6',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Total Registered
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                  }}
                >
                  {farmers.length}
                </p>
              </div>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(27, 67, 50, 0.1)' }}
              >
                <FileCheck className="w-5 h-5" style={{ color: '#1B4332' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Active HCDA farmers
            </p>
          </div>

          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0DDD6',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  GlobalGAP Compliant
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#2D6A4F',
                  }}
                >
                  {compliantCount}
                </p>
              </div>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)' }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: '#2D6A4F' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              {((compliantCount / farmers.length) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0DDD6',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Expired / Non-Compliant
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#C0392B',
                  }}
                >
                  {expiredCount + nonCompliantCount}
                </p>
              </div>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
              >
                <XCircle className="w-5 h-5" style={{ color: '#C0392B' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Requires renewal
            </p>
          </div>

          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0DDD6',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Total Acreage
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                  }}
                >
                  {totalAcreage.toFixed(1)}
                </p>
              </div>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(27, 67, 50, 0.1)' }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: '#1B4332' }} />
              </div>
            </div>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: '#717182',
              }}
            >
              Hectares under cultivation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 min-w-0 max-w-full [&>*]:min-w-0">
          {/* Left Filter Panel */}
          <div className="col-span-3">
            <div 
              className="p-6 rounded-lg sticky top-6"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD6',
              }}
            >
              <h3 
                className="mb-6 pb-3 border-b"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1B4332',
                  borderColor: '#E0DDD6',
                }}
              >
                Filter Registry
              </h3>

              {/* Filter by Exporter */}
              <div className="mb-6">
                <label 
                  className="block mb-3"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2C2C2E',
                  }}
                >
                  Filter by Exporter
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exporter"
                      value="all"
                      checked={selectedExporter === 'all'}
                      onChange={(e) => setSelectedExporter(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '14px',
                        color: '#2C2C2E',
                      }}
                    >
                      All Exporters
                    </span>
                  </label>
                  {exporters.map((exporter) => (
                    <label key={exporter} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exporter"
                        value={exporter}
                        checked={selectedExporter === exporter}
                        onChange={(e) => setSelectedExporter(e.target.value)}
                        className="w-4 h-4"
                        style={{ accentColor: '#2D6A4F' }}
                      />
                      <span 
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '14px',
                          color: '#2C2C2E',
                        }}
                      >
                        {exporter}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter by GlobalGAP Status */}
              <div>
                <label 
                  className="block mb-3"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2C2C2E',
                  }}
                >
                  Filter by GlobalGAP Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gapStatus"
                      value="all"
                      checked={selectedGAPStatus === 'all'}
                      onChange={(e) => setSelectedGAPStatus(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '14px',
                        color: '#2C2C2E',
                      }}
                    >
                      All Statuses
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gapStatus"
                      value="compliant"
                      checked={selectedGAPStatus === 'compliant'}
                      onChange={(e) => setSelectedGAPStatus(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '14px',
                        color: '#2C2C2E',
                      }}
                    >
                      Compliant
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gapStatus"
                      value="expired"
                      checked={selectedGAPStatus === 'expired'}
                      onChange={(e) => setSelectedGAPStatus(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '14px',
                        color: '#2C2C2E',
                      }}
                    >
                      Expired
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gapStatus"
                      value="non-compliant"
                      checked={selectedGAPStatus === 'non-compliant'}
                      onChange={(e) => setSelectedGAPStatus(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#2D6A4F' }}
                    />
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontSize: '14px',
                        color: '#2C2C2E',
                      }}
                    >
                      Non-Compliant
                    </span>
                  </label>
                </div>
              </div>

              {/* Map Thumbnail */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
                <h4 
                  className="mb-3"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#2C2C2E',
                  }}
                >
                  Farm Distribution Map
                </h4>
                <div 
                  className="rounded-lg relative overflow-hidden"
                  style={{ 
                    height: '200px',
                    backgroundColor: '#F7F4EF',
                    border: '1px solid #E0DDD6',
                  }}
                >
                  {/* Simple Map Representation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-center"
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        color: '#717182',
                      }}
                    >
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{filteredFarmers.length} Registered Farms</p>
                    </div>
                  </div>
                  {/* Map Dots */}
                  {filteredFarmers.slice(0, 20).map((farmer, idx) => {
                    const statusColors = getStatusColor(farmer.globalGAPStatus);
                    return (
                      <div
                        key={farmer.id}
                        className="absolute rounded-full"
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: statusColors.bg,
                          top: `${(idx * 37) % 150 + 20}px`,
                          left: `${(idx * 53) % 150 + 20}px`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        title={farmer.farmerName}
                      />
                    );
                  })}
                </div>
                <p 
                  className="mt-2 text-xs text-center"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  Interactive map view
                </p>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            {/* Search and Export */}
            <div 
              className="p-4 rounded-lg mb-6 flex items-center justify-between gap-4"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD6',
              }}
            >
              <div className="relative flex-1">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: '#717182' }} 
                />
                <input
                  type="text"
                  placeholder="Search by Farmer Name, HCDA Reg #, Ward, or County..."
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
                Export Registry
              </button>
            </div>

            {/* Registry Table */}
            <div 
              className="rounded-lg border overflow-hidden"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#1B4332', borderBottom: '2px solid #E0DDD6' }}>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Farmer Name
                      </th>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        HCDA Reg. #
                      </th>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Location (Ward/County)
                      </th>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Acreage
                      </th>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        GlobalGAP Status
                      </th>
                      <th 
                        className="p-4 text-left"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Primary Exporter
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmers.map((farmer, index) => {
                      const statusColors = getStatusColor(farmer.globalGAPStatus);
                      const isEvenRow = index % 2 === 0;
                      
                      return (
                        <tr 
                          key={farmer.id}
                          className="transition-colors hover:bg-gray-50"
                          style={{ 
                            borderBottom: '1px solid #E0DDD6',
                            backgroundColor: isEvenRow ? '#FFFFFF' : '#F7F4EF',
                          }}
                        >
                          <td className="p-4">
                            <span 
                              style={{ 
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                fontSize: '14px',
                                color: '#2C2C2E',
                                fontWeight: 600,
                              }}
                            >
                              {farmer.farmerName}
                            </span>
                          </td>
                          <td className="p-4">
                            <span 
                              style={{ 
                                fontFamily: 'IBM Plex Mono, monospace',
                                fontSize: '13px',
                                color: '#1B4332',
                                fontWeight: 600,
                              }}
                            >
                              {farmer.hcdaRegNumber}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#717182' }} />
                              <div>
                                <p 
                                  style={{ 
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    fontSize: '14px',
                                    color: '#2C2C2E',
                                  }}
                                >
                                  {farmer.ward}
                                </p>
                                <p 
                                  className="text-xs"
                                  style={{ 
                                    fontFamily: 'IBM Plex Sans, sans-serif',
                                    color: '#717182',
                                  }}
                                >
                                  {farmer.county} County
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span 
                              className="font-semibold"
                              style={{ 
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                fontSize: '14px',
                                color: '#2C2C2E',
                              }}
                            >
                              {farmer.acreage.toFixed(1)} ha
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                                style={{ 
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  backgroundColor: statusColors.bg,
                                  color: statusColors.text,
                                }}
                              >
                                {getStatusIcon(farmer.globalGAPStatus)}
                                {getStatusLabel(farmer.globalGAPStatus)}
                              </span>
                              <p 
                                className="text-xs mt-1"
                                style={{ 
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  color: '#717182',
                                }}
                              >
                                Exp: {new Date(farmer.globalGAPExpiry).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span 
                              style={{ 
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                fontSize: '14px',
                                color: '#2C2C2E',
                              }}
                            >
                              {farmer.primaryExporter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredFarmers.length === 0 && (
                <div className="p-12 text-center">
                  <FileCheck className="w-12 h-12 mx-auto mb-4" style={{ color: '#E0DDD6' }} />
                  <p 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#717182',
                      fontSize: '16px',
                    }}
                  >
                    No farmers found matching your criteria
                  </p>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center">
              <p 
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '14px',
                  color: '#717182',
                }}
              >
                Showing {filteredFarmers.length} of {farmers.length} registered farmers
              </p>
            </div>
          </div>
        </div>
    </Layout>
  );
}