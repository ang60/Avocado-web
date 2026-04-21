
import { Building2, MapPin, TrendingUp, CheckCircle, XCircle, Clock, Search, Download, FileCheck, Eye, X, User, Phone, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TableScroll } from '../components/TableScroll';
import {
  fetchHcdaFarmers,
  fetchHcdaStatistics,
  openHcdaExcelExport,
  type HcdaStatisticsDto,
} from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';

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

export function HCDARegistry() {
  const [farmers, setFarmers] = useState<FarmerRegistration[]>([]);
  const [stats, setStats] = useState<HcdaStatisticsDto | null>(null);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExporter, setSelectedExporter] = useState<string>('all');
  const [selectedGAPStatus, setSelectedGAPStatus] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRegistration | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRegistryLoading(true);
    Promise.all([fetchHcdaFarmers(), fetchHcdaStatistics()])
      .then(([rows, summary]) => {
        if (cancelled) return;
        setStats(summary);
        if (rows.length === 0) {
          setFarmers(mockFarmers);
          setRegistryError('No farmers returned from the API — showing demo rows. Add farmer profiles in Django or seed data.');
        } else {
          setFarmers(
            rows.map((r) => ({
              ...r,
              globalGAPStatus: (String(r.globalGAPStatus || '').toLowerCase() as FarmerRegistration['globalGAPStatus']) || 'non-compliant',
            }))
          );
          setRegistryError(null);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setFarmers(mockFarmers);
        setRegistryError(`${getApiErrorMessage(e, 'Could not load farmers.')} Showing demo data.`);
      })
      .finally(() => {
        if (!cancelled) setRegistryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const compliantCount = farmers.filter(f => f.globalGAPStatus === 'compliant').length;
  const expiredCount = farmers.filter(f => f.globalGAPStatus === 'expired').length;
  const nonCompliantCount = farmers.filter(f => f.globalGAPStatus === 'non-compliant').length;
  const totalAcreage = stats?.total_acreage ?? farmers.reduce((sum, f) => sum + f.acreage, 0);
  const exporters = Array.from(new Set(farmers.map((f) => f.primaryExporter).filter(Boolean))).sort();

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

  const openViewModal = (farmer: FarmerRegistration) => {
    setSelectedFarmer(farmer);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedFarmer(null);
    setViewModalOpen(false);
  };

  return (
    <>
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center gap-4 mb-2">
            <h1 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
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

        {registryLoading ? (
          <p className="mb-4 text-sm text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Loading registry from API…
          </p>
        ) : null}
        {registryError ? (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              borderColor: '#D97706',
              backgroundColor: '#FFFBEB',
              color: '#92400E',
            }}
            role="status"
          >
            {registryError}
          </div>
        ) : null}

        {/* High-Level Metrics */}
        <div className="mb-4 grid grid-cols-1 gap-3 min-w-0 sm:mb-5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Filters — full width on mobile, sidebar on lg+ */}
          <div className="min-w-0 lg:col-span-3">
            <div 
              className="rounded-lg p-4 sm:p-6 lg:sticky lg:top-4"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD6',
              }}
            >
              <h3 
                className="mb-4 border-b pb-3 sm:mb-6"
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

          {/* Main: table + search — full width on mobile */}
          <div className="min-w-0 lg:col-span-9">
            {/* Search and Export */}
            <div 
              className="mb-4 flex flex-col gap-3 rounded-lg p-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD6',
              }}
            >
              <div className="relative min-w-0 flex-1">
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
                onClick={openHcdaExcelExport}
                className="flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 transition-all hover:bg-gray-50 sm:w-auto"
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

            {/* Registry Table — horizontal scroll on narrow viewports */}
            <div 
              className="min-w-0 max-w-full overflow-hidden rounded-lg border"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
              }}
            >
                <TableScroll className="block w-full max-w-full">
                <table className="w-full min-w-[920px]">
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
                      <th 
                        className="p-4 text-center"
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          width: '120px',
                        }}
                      >
                        Actions
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
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openViewModal(farmer)}
                              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all mx-auto"
                              style={{
                                backgroundColor: '#2D6A4F',
                                color: '#FFFFFF',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                                fontSize: '13px',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1B4332';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2D6A4F';
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </TableScroll>

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

        {/* View Modal */}
        {viewModalOpen && selectedFarmer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-xl font-bold"
                  style={{ 
                    color: '#1B4332',
                  }}
                >
                  Farmer Details
                </h2>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={closeViewModal}
                >
                  <X className="w-5 h-5" style={{ color: '#717182' }} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    Farmer Name
                  </p>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: '#2C2C2E',
                    }}
                  >
                    {selectedFarmer.farmerName}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    HCDA Reg. #
                  </p>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: '#2C2C2E',
                    }}
                  >
                    {selectedFarmer.hcdaRegNumber}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    Location (Ward/County)
                  </p>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: '#2C2C2E',
                    }}
                  >
                    {selectedFarmer.ward}, {selectedFarmer.county} County
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    Acreage
                  </p>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: '#2C2C2E',
                    }}
                  >
                    {selectedFarmer.acreage.toFixed(1)} ha
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    GlobalGAP Status
                  </p>
                  <div>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2"
                      style={{ 
                        backgroundColor: getStatusColor(selectedFarmer.globalGAPStatus).bg,
                        color: getStatusColor(selectedFarmer.globalGAPStatus).text,
                      }}
                    >
                      {getStatusIcon(selectedFarmer.globalGAPStatus)}
                      {getStatusLabel(selectedFarmer.globalGAPStatus)}
                    </span>
                    <p 
                      className="text-xs mt-1"
                      style={{ 
                        color: '#717182',
                      }}
                    >
                      Exp: {new Date(selectedFarmer.globalGAPExpiry).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      color: '#717182',
                    }}
                  >
                    Primary Exporter
                  </p>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: '#2C2C2E',
                    }}
                  >
                    {selectedFarmer.primaryExporter}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}